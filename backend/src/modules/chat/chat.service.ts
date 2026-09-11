import { getEnv } from '../../config/env.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ============================================================
// SaathiBot — Conversational Business Advisor Service
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- In-memory session store (per-server, good for MVP) ----
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatSession {
  history: ChatMessage[];
  createdAt: number;
  lastActive: number;
}

const sessions = new Map<string, ChatSession>();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ---- Load scheme configs for RAG ----
function loadSchemeKnowledge(): string {
  const configDir = path.resolve(__dirname, '../../engine/scheme/configs');
  const files = fs.readdirSync(configDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));

  const schemes: string[] = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(configDir, file), 'utf-8'));
      schemes.push(`
### ${raw.name} (${raw.shortName ?? raw.schemeId})
- **Description**: ${raw.description}
- **Nodal Agency**: ${raw.nodalAgency}
- **Target Audience**: ${raw.targetAudience ?? 'General'}
- **Eligibility**:
  - Categories: ${raw.eligibility.categories?.join(', ') ?? 'All'}
  - Gender: ${raw.eligibility.gender?.join(', ') ?? 'All'}
  - Age: ${raw.eligibility.ageMin ?? 18} to ${raw.eligibility.ageMax ?? 65} years
  - Business Types: ${raw.eligibility.businessCategories?.join(', ') ?? 'All'}
  - Project Cost: ₹${(raw.eligibility.minProjectCost ?? 0).toLocaleString('en-IN')} to ₹${(raw.eligibility.maxProjectCost ?? 0).toLocaleString('en-IN')}
  ${raw.eligibility.states ? `- States: ${raw.eligibility.states.join(', ')}` : ''}
  ${raw.eligibility.eligibilityMode ? `- Mode: ${raw.eligibility.eligibilityMode} (categories OR gender)` : ''}
- **Financial Details**:
  - Max Loan: ₹${(raw.financial.maxLoanAmount ?? 0).toLocaleString('en-IN')}
  - Interest Rate: ${raw.financial.interestRate}%
  - Subsidy: ${raw.financial.subsidyPercentage}% (max ₹${(raw.financial.maxSubsidy ?? 0).toLocaleString('en-IN')})
  - Margin Money: ${raw.financial.marginPercentage}%
  - Tenure: ${raw.financial.tenureMonths} months
  - Moratorium: ${raw.financial.moratoriumMonths} months (${raw.financial.moratoriumType})
- **Required Documents**: ${raw.requiredDocuments?.join(', ') ?? 'Standard documents'}
`);
    } catch {
      // skip invalid files
    }
  }

  return schemes.join('\n');
}

let _schemeKnowledge: string | null = null;
function getSchemeKnowledge(): string {
  if (!_schemeKnowledge) {
    _schemeKnowledge = loadSchemeKnowledge();
  }
  return _schemeKnowledge;
}

// ---- Build system prompt ----
function buildSystemPrompt(userContext?: {
  name?: string | null;
  age?: number;
  gender?: string | null;
  category?: string | null;
  isMinority?: boolean;
  location?: string | null;
  reportSummary?: string | null;
}): string {
  const schemes = getSchemeKnowledge();

  let userProfile = '';
  if (userContext) {
    const parts: string[] = [];
    if (userContext.name) parts.push(`Name: ${userContext.name}`);
    if (userContext.age) parts.push(`Age: ${userContext.age}`);
    if (userContext.gender) parts.push(`Gender: ${userContext.gender}`);
    if (userContext.category) parts.push(`Social Category: ${userContext.category}`);
    if (userContext.isMinority !== undefined) parts.push(`Minority: ${userContext.isMinority ? 'Yes' : 'No'}`);
    if (userContext.location) parts.push(`Location: ${userContext.location}`);
    if (parts.length > 0) {
      userProfile = `\n\n## Current User Profile\n${parts.join('\n')}`;
    }
    if (userContext.reportSummary) {
      userProfile += `\n\n## User's Latest Feasibility Report\n${userContext.reportSummary}`;
    }
  }

  return `You are **SaathiBot** (साथीबॉट), a friendly and knowledgeable rural business advisor for the UdyamSetu platform. You help rural entrepreneurs in India start and grow micro/small enterprises.

## Your Core Capabilities
1. **Business Idea Help**: Help users articulate, refine, and evaluate business ideas suitable for rural India
2. **Government Scheme Guidance**: Answer questions about eligibility, benefits, and application process for government funding schemes
3. **Report Explanation**: If the user has a feasibility report, explain scores, strengths, weaknesses, and next steps in simple terms
4. **General Business Advice**: Pricing, marketing, operations, raw materials, and financial planning for rural micro-enterprises

## Language Rules
- **CRITICAL**: Always respond in the SAME language the user writes in
- If the user writes in Hindi (हिंदी), respond entirely in Hindi
- If the user writes in Bengali (বাংলা), respond entirely in Bengali
- If the user writes in English, respond in English
- You can mix languages only if the user does so first
- Use simple, conversational language — avoid jargon

## Behavioral Rules
- Be warm, encouraging, and respectful — many users are first-time entrepreneurs
- Keep responses concise (2-4 paragraphs max unless the user asks for detail)
- Use bullet points and bold for key information
- When discussing schemes, ALWAYS cite the exact scheme name
- NEVER fabricate scheme details — only use the knowledge provided below
- If you don't know something, say so honestly and suggest they visit the local bank or CSC center
- Use ₹ symbol for Indian Rupees
- When discussing eligibility, cross-reference with the user's profile if available

## Government Scheme Knowledge Base
${schemes}
${userProfile}

## Quick Tips
- For scheme eligibility questions, check the user's age, gender, category, and project cost against each scheme
- MUDRA Shishu is for very small loans (up to ₹50,000), MUDRA Kishore for ₹50,000-5,00,000
- PMEGP gives 25-35% subsidy (higher for SC/ST/Women/Minorities in rural areas)
- Stand-Up India is ONLY for SC/ST borrowers OR Women
- WB Bhabishyat is ONLY for West Bengal residents aged 18-45
- PM SVANidhi is specifically for street vendors`;
}

// ---- Gemini API call ----
async function* callGeminiStream(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
): AsyncGenerator<string> {
  const env = getEnv();
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    yield 'I am currently unavailable because the AI service is not configured. Please contact the administrator to set up the GEMINI_API_KEY.';
    return;
  }

  const model = env.GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

  const contents = [
    ...history,
    { role: 'user' as const, parts: [{ text: userMessage }] },
  ];

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.warn('Gemini API notice:', response.status, errText);
    if (response.status === 429) {
      yield 'SaathiBot is currently experiencing high demand. Please try again in 30 seconds!';
    } else {
      yield 'Sorry, I encountered an error connecting to the AI service. Please try again in a moment.';
    }
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield 'Sorry, I could not establish a streaming connection.';
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            yield text;
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  }

  // Process remaining buffer
  if (buffer.startsWith('data: ')) {
    const data = buffer.slice(6).trim();
    if (data && data !== '[DONE]') {
      try {
        const parsed = JSON.parse(data);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // skip
      }
    }
  }
}

// ---- Public API ----

export function getOrCreateSession(sessionId: string): ChatSession {
  // Clean up old sessions
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActive > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }

  let session = sessions.get(sessionId);
  if (!session) {
    session = { history: [], createdAt: now, lastActive: now };
    sessions.set(sessionId, session);
  }
  session.lastActive = now;
  return session;
}

export function clearSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export async function* chat(
  sessionId: string,
  userMessage: string,
  userContext?: {
    name?: string | null;
    age?: number;
    gender?: string | null;
    category?: string | null;
    isMinority?: boolean;
    location?: string | null;
    reportSummary?: string | null;
  },
): AsyncGenerator<string> {
  const session = getOrCreateSession(sessionId);

  const systemPrompt = buildSystemPrompt(userContext);

  // Keep only last 10 exchanges (20 messages) to stay within context limits
  const trimmedHistory = session.history.slice(-20);

  let fullResponse = '';
  for await (const chunk of callGeminiStream(systemPrompt, trimmedHistory, userMessage)) {
    fullResponse += chunk;
    yield chunk;
  }

  // Update session history
  session.history.push(
    { role: 'user', parts: [{ text: userMessage }] },
    { role: 'model', parts: [{ text: fullResponse }] },
  );
}

export function isGeminiConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.GEMINI_API_KEY);
}
