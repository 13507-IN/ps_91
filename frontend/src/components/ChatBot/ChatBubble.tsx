import React from 'react';
import { Copy, Check } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'bot';
  text: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

export default function ChatBubble({ role, text, isStreaming, timestamp }: ChatBubbleProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-teal-700 text-white text-sm leading-relaxed shadow-sm">
          {text}
        </div>
      </div>
    );
  }

  // Bot message with markdown-like rendering
  return (
    <div className="flex gap-2.5 mb-3 group">
      {/* Avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-0.5">
        स
      </div>
      <div className="flex-1 min-w-0">
        <div className="px-4 py-2.5 rounded-2xl rounded-tl-md bg-white border border-slate-200 text-sm text-slate-800 leading-relaxed shadow-sm">
          <BotMessageContent text={text} />
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-teal-500 rounded-sm ml-0.5 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          {timestamp && (
            <span className="text-[10px] text-slate-400">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {!isStreaming && text.length > 0 && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
              title="Copy"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Simple markdown-like renderer for bot messages */
function BotMessageContent({ text }: { text: string }) {
  // Process bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        // Process line breaks and bullet points
        const lines = part.split('\n');
        return lines.map((line, j) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            return (
              <React.Fragment key={`${i}-${j}`}>
                {j > 0 && <br />}
                <span className="flex gap-1.5 ml-1">
                  <span className="text-teal-500 flex-shrink-0">•</span>
                  <span>{trimmed.slice(2)}</span>
                </span>
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={`${i}-${j}`}>
              {j > 0 && <br />}
              {line}
            </React.Fragment>
          );
        });
      })}
    </>
  );
}

/** Typing indicator */
export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
        स
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white border border-slate-200 shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
