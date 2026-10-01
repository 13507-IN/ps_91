import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { getEnv } from '../../config/env.js';
import { sendTelnyxSms, makeTelnyxCall, isTelnyxConfigured } from '../../lib/telnyx.js';
import { FeasibilityService } from '../feasibility/feasibility.service.js';
import { cacheGet, cacheSet, cacheDel } from '../../lib/cache.js';

// ============================================================
// Telnyx Conversational SMS & Voice Assistant Service
//
// Allows entrepreneurs to:
//   1. Open an account automatically via SMS / Call
//   2. Run an instant rural feasibility test conversationally
//   3. Receive full plain-language feasibility reports via SMS
//   4. Listen to the report verdict over automated phone calls
// ============================================================

export type SmsStep =
  | 'AWAITING_NAME'
  | 'AWAITING_LANGUAGE'
  | 'AWAITING_IDEA'
  | 'AWAITING_DISTRICT'
  | 'AWAITING_CAPITAL'
  | 'READY';

export type UserLanguage = 'EN' | 'BN' | 'HI';

export interface SmsSession {
  step: SmsStep;
  userId?: string;
  name?: string;
  lang?: UserLanguage;
  businessIdea?: string;
  district?: string;
  villageName?: string;
  availableCapital?: number;
  lastAnalysisId?: string;
  updatedAt: number;
}

// In-memory fallback if Redis is temporarily offline
const memorySessions = new Map<string, SmsSession>();

// Known West Bengal District coordinates
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  nadia: { lat: 23.471, lng: 88.5565 },
  bankura: { lat: 23.2324, lng: 87.0715 },
  murshidabad: { lat: 24.1759, lng: 88.2802 },
  hooghly: { lat: 22.9034, lng: 88.3888 },
  '24 parganas': { lat: 22.5697, lng: 88.5287 },
  'north 24 parganas': { lat: 22.7215, lng: 88.4839 },
  'south 24 parganas': { lat: 22.1352, lng: 88.5015 },
  birbhum: { lat: 23.8404, lng: 87.6186 },
  burdwan: { lat: 23.2324, lng: 87.8615 },
  bardhaman: { lat: 23.2324, lng: 87.8615 },
  purulia: { lat: 23.3322, lng: 86.3652 },
  malda: { lat: 25.0108, lng: 88.1411 },
  howrah: { lat: 22.5958, lng: 88.2636 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

export class TelnyxService {
  private readonly prisma: PrismaClient;
  private readonly feasibilityService: FeasibilityService;
  private readonly fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma;
    this.feasibilityService = new FeasibilityService(fastify.prisma);
  }

  /**
   * Normalize incoming phone numbers to standard E.164 (+91...) format
   */
  public normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
    return `+${cleaned}`;
  }

  /**
   * Retrieve active SMS session from Redis or in-memory cache
   */
  private async getSession(phone: string): Promise<SmsSession | null> {
    const key = `sms_session:${phone}`;
    try {
      const cached = await cacheGet<SmsSession>(key);
      if (cached) return cached;
    } catch {
      // Redis unavailable, use memory
    }
    const mem = memorySessions.get(phone);
    if (mem && Date.now() - mem.updatedAt < 1800000) return mem;
    return null;
  }

  /**
   * Save SMS session state (30 min TTL)
   */
  private async saveSession(phone: string, session: SmsSession): Promise<void> {
    session.updatedAt = Date.now();
    memorySessions.set(phone, session);
    const key = `sms_session:${phone}`;
    try {
      await cacheSet(key, session, 1800);
    } catch {
      // Ignored if Redis is offline
    }
  }

  /**
   * Clear SMS session state
   */
  private async clearSession(phone: string): Promise<void> {
    memorySessions.delete(phone);
    const key = `sms_session:${phone}`;
    try {
      await cacheDel(key);
    } catch {
      // Ignored
    }
  }

  /**
   * Parse amounts like "50000", "50,000", "1 lakh", "2.5 lac", etc.
   */
  private parseCapital(text: string): number {
    const cleaned = text.toLowerCase().replace(/,/g, '').trim();
    if (cleaned.includes('lakh') || cleaned.includes('lac')) {
      const numPart = parseFloat(cleaned);
      if (!isNaN(numPart)) return Math.round(numPart * 100000);
    }
    if (cleaned.includes('k')) {
      const numPart = parseFloat(cleaned);
      if (!isNaN(numPart)) return Math.round(numPart * 1000);
    }
    const match = cleaned.match(/\d+(\.\d+)?/);
    if (match) {
      const val = parseFloat(match[0]);
      return val > 0 ? val : 50000;
    }
    return 50000;
  }

  /**
   * Main conversational SMS message handler
   */
  public async handleInboundSms(from: string, rawText: string): Promise<string> {
    const normalizedPhone = this.normalizePhone(from);
    const text = rawText.trim();
    const upperText = text.toUpperCase();

    this.fastify.log.info({ phone: normalizedPhone, message: text }, '📥 Telnyx: Inbound SMS received');

    // 1. Fetch user by phone
    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true, name: true, phone: true },
    });

    let session = await this.getSession(normalizedPhone);

    // 2. Global Commands (Available at any time)
    if (upperText === 'RESET' || upperText === 'CANCEL') {
      await this.clearSession(normalizedPhone);
      return user
        ? `Session reset. Welcome back, ${user.name || 'Friend'}!\nSend 'START' to begin a business feasibility test, or 'REPORT' to view your last assessment.`
        : "Session reset. Reply with your Full Name to open your ArthSetu account:";
    }

    if (upperText === 'HELP' || upperText === 'मदद' || upperText === 'সাহায্য') {
      return (
        "🌾 ArthSetu SMS Assistant Commands:\n" +
        "• START - Run a new feasibility assessment\n" +
        "• REPORT - View your latest assessment summary\n" +
        "• CALL - Receive a phone call with audio summary\n" +
        "• RESET - Clear current conversation\n" +
        "You can also simply text your business idea (e.g., 'Dairy farming in Nadia capital 50000')."
      );
    }

    if (upperText === 'REPORT' || upperText === 'STATUS') {
      return await this.generateLatestReportSms(normalizedPhone, session?.lang || 'EN');
    }

    if (upperText === 'CALL' || upperText === 'VOICE') {
      const callRes = await this.triggerVoiceCall(normalizedPhone);
      return callRes.success
        ? "📞 We are calling your phone right now to speak your feasibility report aloud. Please answer the call!"
        : "⚠️ Could not initiate voice call. Telnyx Voice configuration is pending. Reply 'REPORT' to read it via SMS.";
    }

    // 3. User Onboarding Flow (If user does not exist in Database)
    if (!user) {
      if (!session || session.step !== 'AWAITING_NAME') {
        await this.saveSession(normalizedPhone, {
          step: 'AWAITING_NAME',
          updatedAt: Date.now(),
        });
        return (
          "🌾 Welcome to ArthSetu! 🌾\n" +
          "Hyper-Local Rural Enterprise AI Assistant.\n\n" +
          "To open your free account, reply with your Full Name:\n" +
          "(যেমন: সুভাশ বিশ্বাস / अपना नाम लिखें)"
        );
      }

      // User just replied with their name -> Create Account!
      const entrepreneurName = text.slice(0, 60);
      user = await this.prisma.user.create({
        data: {
          phone: normalizedPhone,
          name: entrepreneurName,
          isPhoneVerified: true,
          role: 'USER',
        },
        select: { id: true, name: true, phone: true },
      });

      this.fastify.log.info({ userId: user.id, phone: normalizedPhone }, '✨ New user registered via Telnyx SMS');

      await this.saveSession(normalizedPhone, {
        step: 'AWAITING_LANGUAGE',
        userId: user.id,
        name: user.name || entrepreneurName,
        updatedAt: Date.now(),
      });

      return (
        `Account created! Welcome, ${user.name}! 🤝\n\n` +
        "Please select your preferred language:\n" +
        "1. English\n" +
        "2. বাংলা (Bengali)\n" +
        "3. हिंदी (Hindi)\n\n" +
        "Reply with 1, 2, or 3."
      );
    }

    // 4. Session State Machine for Registered Users
    if (!session) {
      // If user typed 'START' or sent a greeting
      if (['START', 'HI', 'HELLO', 'SHURU', 'NAMASTE', 'নমস্কার', 'শুরু'].includes(upperText)) {
        await this.saveSession(normalizedPhone, {
          step: 'AWAITING_IDEA',
          userId: user.id,
          name: user.name || 'Entrepreneur',
          lang: 'EN',
          updatedAt: Date.now(),
        });

        return (
          `Welcome, ${user.name || 'Friend'}! 🌾\n` +
          "What business idea would you like to evaluate?\n\n" +
          "Examples:\n" +
          "• Dairy farming with 4 cows (দুগ্ধ খামার)\n" +
          "• Tailoring / garment shop (বস্ত্র ও সেলাই)\n" +
          "• Grocery / retail store (মুদি দোকান)\n" +
          "• Poultry farm (হাঁস-মুরগি পালন)\n" +
          "• Food processing / mushroom (খাদ্য প্রক্রিয়াকরণ)\n\n" +
          "Reply with your business idea:"
        );
      }

      // Check if user sent a one-shot summary (e.g. "Dairy farming in Nadia capital 50000")
      if (text.length > 5) {
        return await this.handleOneShotOrStart(normalizedPhone, user.id, text);
      }

      return (
        `Hello ${user.name || ''}! Send 'START' to evaluate a business idea, or 'REPORT' to see your previous test.`
      );
    }

    // Step: Language Selection
    if (session.step === 'AWAITING_LANGUAGE') {
      let lang: UserLanguage = 'EN';
      if (text === '2' || upperText.includes('BN') || upperText.includes('BANG') || upperText.includes('বাং')) {
        lang = 'BN';
      } else if (text === '3' || upperText.includes('HI') || upperText.includes('HIN') || upperText.includes('हिं')) {
        lang = 'HI';
      }

      session.lang = lang;
      session.step = 'AWAITING_IDEA';
      await this.saveSession(normalizedPhone, session);

      if (lang === 'BN') {
        return (
          `ধন্যবাদ ${user.name}! 🌾\n` +
          "আপনি কোন ব্যবসার সম্ভাব্যতা যাচাই করতে চান?\n\n" +
          "উদাহরণ:\n" +
          "• ৪টি গরুর দুগ্ধ খামার\n" +
          "• বস্ত্র ও সেলাই কাজের দোকান\n" +
          "• গ্রামের মুদি ও কসমেটিকস দোকান\n" +
          "• ব্রয়লার মুরগি পালন\n\n" +
          "আপনার ব্যবসার ধারণাটি লিখে পাঠান:"
        );
      }

      if (lang === 'HI') {
        return (
          `धन्यवाद ${user.name}! 🌾\n` +
          "आप किस व्यवसाय की व्यवहार्यता जांचना चाहते हैं?\n\n" +
          "उदाहरण:\n" +
          "• 4 गायों का डेयरी फार्मिंग\n" +
          "• सिलाई एवं वस्त्र की दुकान\n" +
          "• किराना एवं जनरल स्टोर\n" +
          "• मुर्गी पालन (Poultry)\n\n" +
          "अपने व्यवसाय का विचार लिखकर भेजें:"
        );
      }

      return (
        `Thank you ${user.name}! 🌾\n` +
        "What business idea would you like to evaluate?\n\n" +
        "Examples:\n" +
        "• Dairy farming with 4 cows\n" +
        "• Tailoring / garment shop\n" +
        "• Grocery store\n" +
        "• Poultry farm\n\n" +
        "Reply with your business idea:"
      );
    }

    // Step: Awaiting Business Idea
    if (session.step === 'AWAITING_IDEA') {
      session.businessIdea = text;
      session.step = 'AWAITING_DISTRICT';
      await this.saveSession(normalizedPhone, session);

      const lang = session.lang || 'EN';
      if (lang === 'BN') {
        return (
          `ব্যবসা: "${text}" নথিবদ্ধ করা হয়েছে।\n\n` +
          "এটি কোন জেলা, ব্লক বা গ্রামে শুরু করবেন?\n" +
          "(যেমন: Nadia, Bankura, Murshidabad, বা আপনার গ্রামের নাম লিখুন):"
        );
      }
      if (lang === 'HI') {
        return (
          `व्यवसाय: "${text}" दर्ज किया गया।\n\n` +
          "यह किस जिले, ब्लॉक या गांव में शुरू करेंगे?\n" +
          "(जैसे: Nadia, Bankura, Murshidabad, या अपने गांव का नाम लिखें):"
        );
      }
      return (
        `Business: "${text}" noted.\n\n` +
        "Which district, block, or village will this be located in?\n" +
        "(e.g. Nadia, Bankura, Murshidabad, or your village name):"
      );
    }

    // Step: Awaiting District / Location
    if (session.step === 'AWAITING_DISTRICT') {
      session.district = text;
      session.step = 'AWAITING_CAPITAL';
      await this.saveSession(normalizedPhone, session);

      const lang = session.lang || 'EN';
      if (lang === 'BN') {
        return (
          `এলাকা: ${text}।\n\n` +
          "এই ব্যবসায় বিনিয়োগের জন্য আপনার কাছে নিজস্ব কত টাকা বা পুঁজি রয়েছে?\n" +
          "(যেমন: 25000, 50000, 100000 বা আপনার টাকার পরিমাণ লিখুন):"
        );
      }
      if (lang === 'HI') {
        return (
          `स्थान: ${text}।\n\n` +
          "इस व्यवसाय में लगाने के लिए आपके पास अपनी कितनी पूंजी या बचत है?\n" +
          "(जैसे: 25000, 50000, 100000 या अपनी राशि लिखें):"
        );
      }
      return (
        `Location: ${text}.\n\n` +
        "How much savings or capital do you have to invest from your pocket?\n" +
        "(e.g. 25000, 50000, 100000 or enter your amount in Rupees):"
      );
    }

    // Step: Awaiting Capital -> RUN FEASIBILITY ASSESSMENT!
    if (session.step === 'AWAITING_CAPITAL') {
      const capital = this.parseCapital(text);
      session.availableCapital = capital;

      // Execute Feasibility Analysis
      const verdictSms = await this.executeFeasibilityTest(
        user.id,
        session.businessIdea || 'Micro Enterprise',
        session.district || 'Nadia',
        capital,
        session.lang || 'EN'
      );

      // Reset session to READY
      session.step = 'READY';
      await this.saveSession(normalizedPhone, session);

      return verdictSms;
    }

    // Fallback if session is in READY state
    return (
      `Hello ${user.name || ''}! To test another business idea, reply 'START'.\n` +
      "To hear your latest report over a voice call, reply 'CALL'."
    );
  }

  /**
   * Run Feasibility Test and format localized SMS summary
   */
  public async executeFeasibilityTest(
    userId: string,
    businessIdea: string,
    district: string,
    availableCapital: number,
    lang: UserLanguage = 'EN'
  ): Promise<string> {
    const env = getEnv();
    const normalizedDistrict = district.trim().toLowerCase();
    const coords = DISTRICT_COORDINATES[normalizedDistrict] || { lat: 23.471, lng: 88.5565 };

    this.fastify.log.info(
      { userId, businessIdea, district, capital: availableCapital },
      '🚀 Running Feasibility Test via Telnyx SMS'
    );

    const result = await this.feasibilityService.analyze(
      {
        businessIdea,
        latitude: coords.lat,
        longitude: coords.lng,
        district,
        availableCapital,
        catchmentRadiusKm: 10,
      },
      userId
    );

    const score = result.feasibilityScore?.totalScore ?? 75;
    const grade = result.feasibilityScore?.grade ?? 'GOOD';
    const fp = result.financialPlan;
    const projectCost = Math.round(fp?.projectCost || availableCapital * 3);
    const loanReq = Math.round(fp?.netLoanAmount || fp?.loanRequired || availableCapital * 2);
    const emi = Math.round(fp?.emi?.emi || 3500);
    const monthlyProfit = Math.round(fp?.cashflow?.avgMonthlyNetCashflow || 18000);
    const scheme = fp?.matchedSchemeName || 'PMEGP';
    const nextStep = (result.aiRecommendation as { recommendedNextStep?: string })?.recommendedNextStep ||
      'Apply at your nearest bank branch or Common Service Centre (CSC).';

    const frontendBase = env.FRONTEND_URL || 'http://localhost:3000';
    const reportUrl = result.id ? `${frontendBase}/feasibility-report/${result.id}` : frontendBase;

    if (lang === 'BN') {
      const gradeBn = score >= 65 ? 'অনুকূল ও লাভজনক' : score >= 45 ? 'সতর্কতার সাথে সম্ভব' : 'উচ্চ ঝুঁকি';
      return (
        `🌾 উদ্যমসেতু সম্ভাব্যতা মূল্যায়ন 🌾\n` +
        `ব্যবসা: ${businessIdea} (${district})\n` +
        `স্কোর: ${score}/১০০ (${gradeBn})\n\n` +
        `💰 আর্থিক বিবরণ:\n` +
        `• মোট প্রকল্প খরচ: ₹${projectCost.toLocaleString('en-IN')}\n` +
        `• আপনার পুঁজি: ₹${availableCapital.toLocaleString('en-IN')}\n` +
        `• সরকারি ঋণ: ₹${loanReq.toLocaleString('en-IN')} (${scheme})\n` +
        `• মাসিক কিস্তি (ইএমআই): ₹${emi.toLocaleString('en-IN')}\n` +
        `• অনুমিত নিট মাসিক লাভ: ₹${monthlyProfit.toLocaleString('en-IN')}/মাস\n\n` +
        `📌 সুপারিশ:\n${nextStep}\n\n` +
        `🔗 সম্পূর্ণ রিপোর্ট দেখুন: ${reportUrl}\n\n` +
        `ফোন কলে শুনতে 'CALL' লিখুন, অথবা নতুন পরীক্ষার জন্য 'START' লিখুন।`
      );
    }

    if (lang === 'HI') {
      const gradeHi = score >= 65 ? 'लाभकारी एवं अनुशंसित' : score >= 45 ? 'सावधानीपूर्वक संभव' : 'उच्च जोखिम';
      return (
        `🌾 उद्यमसेतु व्यावसायिक रिपोर्ट 🌾\n` +
        `व्यवसाय: ${businessIdea} (${district})\n` +
        `स्कोर: ${score}/100 (${gradeHi})\n\n` +
        `💰 वित्तीय सारांश:\n` +
        `• कुल परियोजना लागत: ₹${projectCost.toLocaleString('en-IN')}\n` +
        `• आपकी पूंजी: ₹${availableCapital.toLocaleString('en-IN')}\n` +
        `• सरकारी ऋण: ₹${loanReq.toLocaleString('en-IN')} (${scheme})\n` +
        `• मासिक ईएमआई: ₹${emi.toLocaleString('en-IN')}\n` +
        `• शुद्ध मासिक लाभ: ₹${monthlyProfit.toLocaleString('en-IN')}/माह\n\n` +
        `📌 अगला कदम:\n${nextStep}\n\n` +
        `🔗 पूरी रिपोर्ट देखें: ${reportUrl}\n\n` +
        `फोन कॉल पर सुनने के लिए 'CALL' लिखें, या नए परीक्षण के लिए 'START' लिखें।`
      );
    }

    // Default: English
    return (
      `🌾 ArthSetu Feasibility Report 🌾\n` +
      `Business: ${businessIdea} (${district})\n` +
      `Verdict Score: ${score}/100 (${grade})\n\n` +
      `💰 Financial Snapshot:\n` +
      `• Total Cost: ₹${projectCost.toLocaleString('en-IN')}\n` +
      `• Your Capital: ₹${availableCapital.toLocaleString('en-IN')}\n` +
      `• Govt Loan: ₹${loanReq.toLocaleString('en-IN')} via ${scheme}\n` +
      `• Monthly EMI: ₹${emi.toLocaleString('en-IN')}\n` +
      `• Est. Net Monthly Profit: ₹${monthlyProfit.toLocaleString('en-IN')}/mo\n\n` +
      `🚀 Recommendation:\n${nextStep}\n\n` +
      `🔗 View Full Report: ${reportUrl}\n\n` +
      `Reply 'CALL' to listen on phone call, or 'START' to test another business.`
    );
  }

  /**
   * Parse one-shot requests like "Feasibility test: Dairy in Nadia with 50000"
   */
  private async handleOneShotOrStart(phone: string, userId: string, text: string): Promise<string> {
    const capital = this.parseCapital(text);
    let district = 'Nadia';

    for (const d of Object.keys(DISTRICT_COORDINATES)) {
      if (text.toLowerCase().includes(d)) {
        district = d.charAt(0).toUpperCase() + d.slice(1);
        break;
      }
    }

    const businessIdea = text
      .replace(/in\s+[a-zA-Z\s]+/i, '')
      .replace(/with\s+[\d,\s\w]+/i, '')
      .replace(/capital\s+[\d,\s\w]+/i, '')
      .trim() || text;

    return await this.executeFeasibilityTest(userId, businessIdea, district, capital, 'EN');
  }

  /**
   * Look up and format the user's latest report summary for SMS
   */
  public async generateLatestReportSms(phone: string, lang: UserLanguage = 'EN'): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const latest = user?.analyses?.[0];
    if (!latest) {
      return "No feasibility reports found for your number yet. Reply 'START' to evaluate your first business idea!";
    }

    const env = getEnv();
    const scoreData = (latest.feasibilityScore as { totalScore?: number; grade?: string }) || {};
    const score = scoreData.totalScore || 70;
    const grade = scoreData.grade || 'GOOD';
    const fp = (latest.financialPlan as Record<string, unknown>) || {};
    const profit = Math.round(Number((fp.cashflow as { averageMonthlyCashflow?: number })?.averageMonthlyCashflow || 15000));
    const scheme = String(fp.matchedSchemeName || 'PMEGP');
    const reportUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/feasibility-report/${latest.id}`;

    return (
      `🌾 Latest Report: ${latest.businessIdea || 'Business'}\n` +
      `Verdict: ${score}/100 (${grade})\n` +
      `Est. Net Profit: ₹${profit.toLocaleString('en-IN')}/mo\n` +
      `Govt Scheme: ${scheme}\n\n` +
      `🔗 Full Details: ${reportUrl}\n` +
      `Reply 'START' to test another business, or 'CALL' to hear the voice summary.`
    );
  }

  /**
   * Handle incoming voice call to Telnyx number (TeXML XML response)
   */
  public async handleInboundCall(callerPhone: string): Promise<string> {
    const normalized = this.normalizePhone(callerPhone);
    const user = await this.prisma.user.findUnique({
      where: { phone: normalized },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const hasReports = Boolean(user?.analyses?.length);

    if (hasReports) {
      return (
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<Response>\n` +
        `  <Say voice="female" language="en-IN">\n` +
        `    Welcome to ArthSetu, your rural enterprise assistant.\n` +
        `  </Say>\n` +
        `  <Gather numDigits="1" timeout="7" action="/webhooks/telnyx/voice/gather" method="POST">\n` +
        `    <Say voice="female" language="en-IN">\n` +
        `      Press 1 to hear your latest business feasibility report. Press 2 to receive an SMS and start a new business assessment.\n` +
        `    </Say>\n` +
        `  </Gather>\n` +
        `  <Say voice="female" language="en-IN">\n` +
        `    We did not receive any input. We have sent an SMS to your phone. Goodbye!\n` +
        `  </Say>\n` +
        `</Response>`
      );
    }

    // New caller without reports: auto-create account and trigger SMS
    if (!user) {
      await this.prisma.user.create({
        data: {
          phone: normalized,
          name: `Entrepreneur (${normalized.slice(-4)})`,
          isPhoneVerified: true,
          role: 'USER',
        },
      }).catch(() => {});
    }

    // Send kickoff SMS
    if (isTelnyxConfigured()) {
      sendTelnyxSms({
        to: normalized,
        text:
          "Welcome to ArthSetu! 🌾\n" +
          "Reply to this message with your business idea (e.g., 'Dairy farming in Nadia capital 50000') to run your feasibility test.",
      }).catch(() => {});
    }

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<Response>\n` +
      `  <Say voice="female" language="en-IN">\n` +
      `    Welcome to ArthSetu, rural enterprise AI assistant. We have just sent an SMS to your mobile phone. Simply reply to that message with your business idea to run an instant feasibility test. Thank you for calling!\n` +
      `  </Say>\n` +
      `</Response>`
    );
  }

  /**
   * Handle DTMF gather response from inbound call
   */
  public async handleGatherDigits(callerPhone: string, digits: string): Promise<string> {
    const normalized = this.normalizePhone(callerPhone);

    if (digits === '1') {
      const user = await this.prisma.user.findUnique({
        where: { phone: normalized },
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const report = user?.analyses?.[0];
      if (report) {
        const scoreData = (report.feasibilityScore as { totalScore?: number; grade?: string }) || {};
        const score = scoreData.totalScore || 75;
        const grade = scoreData.grade || 'viable';
        const fp = (report.financialPlan as Record<string, unknown>) || {};
        const profit = Math.round(Number((fp.cashflow as { averageMonthlyCashflow?: number })?.averageMonthlyCashflow || 18000));
        const scheme = String(fp.matchedSchemeName || 'PMEGP government loan scheme');

        // Also text them the link
        if (isTelnyxConfigured()) {
          const env = getEnv();
          const reportUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/feasibility-report/${report.id}`;
          sendTelnyxSms({
            to: normalized,
            text: `ArthSetu Report for ${report.businessIdea}: Score ${score}/100. Profit: ₹${profit.toLocaleString('en-IN')}/mo. Scheme: ${scheme}. Full report: ${reportUrl}`,
          }).catch(() => {});
        }

        return (
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<Response>\n` +
          `  <Say voice="female" language="en-IN">\n` +
          `    Here is your business feasibility report for ${report.businessIdea || 'your enterprise'}. ` +
          `    The total feasibility score is ${score} out of 100, which is ${grade}. ` +
          `    Your estimated net monthly profit is ${profit.toLocaleString('en-IN')} rupees per month. ` +
          `    The recommended financing scheme is ${scheme}. ` +
          `    We have also texted the complete report link to your phone. Thank you for calling ArthSetu. Goodbye!\n` +
          `  </Say>\n` +
          `</Response>`
        );
      }
    }

    // Default: Send SMS to start new test
    if (isTelnyxConfigured()) {
      sendTelnyxSms({
        to: normalized,
        text:
          "🌾 ArthSetu Feasibility Assessment:\n" +
          "Please reply with your business idea (e.g., 'Dairy farming with 4 cows' or 'Tailoring shop') to begin!",
      }).catch(() => {});
    }

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<Response>\n` +
      `  <Say voice="female" language="en-IN">\n` +
      `    We have sent an SMS to your mobile number. Please check your text messages and reply to start your feasibility test. Goodbye!\n` +
      `  </Say>\n` +
      `</Response>`
    );
  }

  /**
   * Trigger an outbound voice call to speak the report aloud to the entrepreneur
   */
  public async triggerVoiceCall(phone: string): Promise<{ success: boolean; message: string }> {
    if (!isTelnyxConfigured()) {
      return { success: false, message: 'Telnyx is not configured with TELNYX_API_KEY and TELNYX_PHONE_NUMBER.' };
    }

    try {
      const normalized = this.normalizePhone(phone);
      await makeTelnyxCall({
        to: normalized,
      });
      return { success: true, message: `Outbound call initiated to ${normalized}` };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }
}
