'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, MapPin, TrendingUp, IndianRupee, Shield, Brain, ListChecks, BarChart3, Search } from 'lucide-react';

export interface ProgressStep {
  step: number;
  message: string;
  progress: number;
  completed: boolean;
}

const STEPS_CONFIG = [
  { icon: Search, label: 'Classifying business idea', color: 'text-purple-500' },
  { icon: MapPin, label: 'Analyzing local market & demographics', color: 'text-teal-500' },
  { icon: TrendingUp, label: 'Estimating competition density', color: 'text-blue-500' },
  { icon: IndianRupee, label: 'Building financial plan & EMI', color: 'text-emerald-500' },
  { icon: Shield, label: 'Matching government schemes', color: 'text-saffron' },
  { icon: Brain, label: 'Running AI assessment pipeline', color: 'text-violet-500' },
  { icon: BarChart3, label: 'Calculating viability score', color: 'text-amber-500' },
  { icon: ListChecks, label: 'Generating action plan', color: 'text-green-500' },
];

interface AnalysisProgressProps {
  isActive: boolean;
  currentStep: number;
  progress: number;
  stepMessages: Map<number, string>;
  onComplete?: () => void;
}

export default function AnalysisProgress({
  isActive,
  currentStep,
  progress,
  stepMessages,
}: AnalysisProgressProps) {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTip(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A3A6B] to-[#254d8c] px-6 py-5 text-white shadow-sm">
          <h2 className="text-lg font-bold tracking-tight">Analyzing Your Business</h2>
          <p className="text-blue-100/90 text-sm mt-0.5">
            Running 8 analysis engines — this takes 15-30 seconds
          </p>
          {/* Progress bar */}
          <div className="mt-3.5 h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF9933] to-[#E65C00] shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-1 text-right text-xs font-bold text-[#FF9933] font-tabular">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 space-y-1.5 max-h-[50vh] overflow-y-auto">
          {STEPS_CONFIG.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            const Icon = step.icon;
            const customMessage = stepMessages.get(stepNum);

            return (
              <motion.div
                key={stepNum}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-50/80 border border-[#1A3A6B]/25 shadow-xs'
                    : isCompleted
                      ? 'bg-emerald-50/60 border border-emerald-100'
                      : 'opacity-50'
                }`}
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </motion.div>
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 text-[#1A3A6B] animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </div>

                {/* Step icon */}
                <Icon className={`h-4 w-4 flex-shrink-0 ${
                  isCompleted ? 'text-emerald-600' : isCurrent ? 'text-[#E65C00]' : 'text-slate-300'
                }`} />

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    isCurrent ? 'font-bold text-[#1A3A6B]' : isCompleted ? 'text-emerald-900 font-medium' : 'text-slate-400'
                  }`}>
                    {customMessage || step.label}
                  </p>
                </div>

                {/* Duration badge for completed */}
                {isCompleted && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    ✓
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tip */}
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#E65C00]/20 px-6 py-3 bg-[#FFF8F0]"
            >
              <p className="text-xs text-[#993D00]">
                💡 <strong className="text-[#E65C00]">Tip:</strong> Your report will include market intelligence, financial plan, scheme matching, risk assessment, and a 30-day action plan.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/**
 * Hook to manage SSE progress connection.
 * Falls back to simulated progress if SSE fails.
 */
export function useAnalysisProgress() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepMessages] = useState<Map<number, string>>(new Map());
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null);

  function startFallbackSimulation() {
    let step = 1;
    fallbackTimer.current = setInterval(() => {
      step = Math.min(step + 1, 8);
      setCurrentStep(step);
      setProgress((step / 8) * 100);
      if (step >= 8) {
        if (fallbackTimer.current) clearInterval(fallbackTimer.current);
      }
    }, 3000);
  }

  function start() {
    setIsActive(true);
    setCurrentStep(1);
    setProgress(5);
    startFallbackSimulation();
  }

  function updateFromSSE(data: { step: number; message: string; progress: number }) {
    // Cancel fallback when we get real SSE data
    if (fallbackTimer.current) {
      clearInterval(fallbackTimer.current);
      fallbackTimer.current = null;
    }
    setCurrentStep(data.step);
    setProgress(data.progress);
    if (data.message) {
      stepMessages.set(data.step, data.message);
    }
  }

  function complete() {
    setCurrentStep(9);
    setProgress(100);
    if (fallbackTimer.current) clearInterval(fallbackTimer.current);
    setTimeout(() => setIsActive(false), 1000);
  }

  function reset() {
    setIsActive(false);
    setCurrentStep(0);
    setProgress(0);
    stepMessages.clear();
    if (fallbackTimer.current) clearInterval(fallbackTimer.current);
  }

  return {
    isActive,
    currentStep,
    progress,
    stepMessages,
    start,
    updateFromSSE,
    complete,
    reset,
  };
}
