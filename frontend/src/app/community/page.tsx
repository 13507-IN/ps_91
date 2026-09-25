'use client';

import React, { useState } from 'react';
import { Users, Store, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { ReportBusinessForm } from './components/ReportBusinessForm';
import { VerificationFeed } from './components/VerificationFeed';
import { Leaderboard } from './components/Leaderboard';
import { HyperlocalBusinessExplorer } from '@/components/HyperlocalBusinessExplorer/HyperlocalBusinessExplorer';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'report' | 'verify' | 'leaderboard' | 'map'>('report');
  const [refreshKey, setRefreshKey] = useState(0);

  function triggerRefresh(switchToVerify = false) {
    setRefreshKey((k) => k + 1);
    if (switchToVerify) {
      setActiveTab('verify');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#102347] via-[#1A3A6B] to-[#1E4A8A] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold">
              <Sparkles size={14} />
              Crowdsourced Rural Economy
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Community Intelligence Hub
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Help your village map informal businesses, discover hidden market opportunities, and verify local enterprise data to power hyper-local AI feasibility reports.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-[#1A3A6B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Store size={15} />
            Report Business
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'verify'
                ? 'bg-[#1A3A6B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={15} />
            Verify Reports
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-[#1A3A6B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Trophy size={15} />
            Leaderboard & Badges
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-[#1A3A6B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users size={15} />
            Explore Village Map
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'report' && (
              <ReportBusinessForm onReportSubmitted={triggerRefresh} />
            )}
            {activeTab === 'verify' && (
              <VerificationFeed onActionCompleted={triggerRefresh} />
            )}
            {activeTab === 'leaderboard' && (
              <Leaderboard key={refreshKey} />
            )}
            {activeTab === 'map' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Hyperlocal Enterprise Map</h3>
                <HyperlocalBusinessExplorer
                  latitude={23.4015}
                  longitude={88.5012}
                  initialRadiusKm={10}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar: Community Summary & Impact */}
          <div className="space-y-6">
            {activeTab !== 'leaderboard' && <Leaderboard key={`sidebar-${refreshKey}`} />}
            
            <div className="bg-gradient-to-br from-saffron-soft to-amber-50 rounded-2xl border border-saffron/20 p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-saffron" />
                Why Community Intelligence Matters
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Over 70% of rural enterprises operate informally without official UDYAM registration. By reporting local grocery stores, tailors, dairy units, and workshops, you ensure accurate demand and competition scoring for aspiring entrepreneurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
