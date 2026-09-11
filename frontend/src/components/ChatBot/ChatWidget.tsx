'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { apiBaseUrl, getAccessToken, refreshAccessToken } from '@/lib/api/client';
import toast from 'react-hot-toast';
import ChatBubble, { TypingIndicator } from './ChatBubble';
import QuickActions from './QuickActions';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'bot',
  text: '👋 **Namaste! I am SaathiBot**, your business advisor.\n\nI can help you with:\n- Planning a business idea\n- Checking government scheme eligibility\n- Explaining your feasibility report\n\nAsk me anything in English, हिंदी, or বাংলা!',
  timestamp: new Date(),
};

export default function ChatWidget() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isAllowed, setIsAllowed] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check session on mount to avoid SSR hydration mismatch
  useEffect(() => {
    setIsAllowed(true);
  }, [isAuthenticated]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setHasInteracted(true);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    const botMsgId = `bot-${Date.now()}`;
    const botMsg: Message = {
      id: botMsgId,
      role: 'bot',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const token = getAccessToken();
      let response = await fetch(`${apiBaseUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: sessionId || undefined,
        }),
      });

      if (response.status === 401) {
        // Try refreshing token once
        const newToken = await refreshAccessToken();
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (newToken) {
          retryHeaders['Authorization'] = `Bearer ${newToken}`;
        }
        response = await fetch(`${apiBaseUrl}/api/chat/message`, {
          method: 'POST',
          headers: retryHeaders,
          body: JSON.stringify({
            message: text.trim(),
            sessionId: sessionId || undefined,
          }),
        });
      }

      // Get session ID from header
      const newSessionId = response.headers.get('X-Session-Id');
      if (newSessionId) setSessionId(newSessionId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                if (data.sessionId) setSessionId(data.sessionId);
              } else if (data.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId
                      ? { ...m, text: m.text + data.text }
                      : m,
                  ),
                );
              } else if (data.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId
                      ? { ...m, text: 'Sorry, something went wrong. Please try again.', isStreaming: false }
                      : m,
                  ),
                );
                toast.error(data.error || 'Chat error occurred.');
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId ? { ...m, isStreaming: false } : m,
        ),
      );
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to connect to SaathiBot.');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? { ...m, text: 'Sorry, I could not connect to the server. Please check your internet connection and try again.', isStreaming: false }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setSessionId(null);
    setHasInteracted(false);
  };

  // Don't render for unauthenticated users
  if (!isAllowed) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
            bg-gradient-to-br from-teal-600 to-teal-800
            text-white shadow-lg shadow-teal-900/30
            hover:shadow-xl hover:shadow-teal-900/40 hover:scale-105
            active:scale-95 transition-all duration-200
            flex items-center justify-center
            ring-4 ring-teal-400/20"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Pulse dot for first-time users */}
          {!hasInteracted && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed z-50
            bottom-0 right-0 sm:bottom-6 sm:right-6
            w-full sm:w-[400px]
            h-[100dvh] sm:h-[600px] sm:max-h-[80vh]
            flex flex-col
            bg-slate-50
            sm:rounded-2xl
            shadow-2xl shadow-black/20
            border border-slate-200
            overflow-hidden
            animate-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                स
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">SaathiBot</h3>
                <p className="text-teal-200 text-[11px]">Business Advisor • AI Powered</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
                title="Close chat"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                role={msg.role}
                text={msg.text}
                isStreaming={msg.isStreaming}
                timestamp={msg.timestamp}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.text === '' && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (only when no user messages yet) */}
          {!hasInteracted && (
            <div className="border-t border-slate-200 bg-white flex-shrink-0">
              <QuickActions onSelect={(msg) => sendMessage(msg)} />
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 px-3 py-3 bg-white border-t border-slate-200 flex-shrink-0"
          >
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5
                text-sm text-slate-800 placeholder:text-slate-400
                focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                max-h-[120px] min-h-[42px]"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-teal-700 text-white
                flex items-center justify-center flex-shrink-0
                hover:bg-teal-800 active:scale-95
                disabled:bg-slate-300 disabled:cursor-not-allowed
                transition-all duration-150"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
