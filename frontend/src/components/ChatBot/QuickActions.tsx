import React from 'react';

interface QuickActionsProps {
  onSelect: (message: string) => void;
}

const quickActions = [
  { emoji: '💡', label: 'Help me plan a business', message: 'I want to start a small business in my village. Can you help me think of a good idea?' },
  { emoji: '🏦', label: 'Which scheme am I eligible for?', message: 'Which government loan schemes am I eligible for? Please check my profile.' },
  { emoji: '📊', label: 'Explain my report', message: 'Can you explain my feasibility report in simple terms? What does the score mean?' },
  { emoji: '🥛', label: 'Dairy business tips', message: 'I want to start a dairy business. What do I need to know about costs, equipment, and profits?' },
  { emoji: '📋', label: 'What documents do I need?', message: 'What documents do I need to apply for a MUDRA loan?' },
  { emoji: '🇮🇳', label: 'हिंदी में बात करें', message: 'नमस्ते! मैं एक छोटा व्यापार शुरू करना चाहता हूँ। कृपया मेरी मदद करें।' },
];

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Try asking...
      </p>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => onSelect(action.message)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full
              bg-teal-50 text-teal-800 text-xs font-medium
              border border-teal-200
              hover:bg-teal-100 hover:border-teal-300 hover:shadow-sm
              transition-all duration-150 active:scale-95"
          >
            <span>{action.emoji}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
