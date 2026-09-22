'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Loader2, ShieldCheck } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';

interface Contributor {
  rank: number;
  id: string;
  name: string;
  village: string;
  block: string;
  district: string;
  reportsSubmitted: number;
  verifiedCount: number;
  trustScore: number;
  badges: string[];
}

interface LeaderboardData {
  totalContributors: number;
  totalCommunityReports: number;
  totalVerified: number;
  totalPending: number;
  totalVerifications: number;
  leaderboard: Contributor[];
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await api<LeaderboardData>(`${apiEndpoints.businesses.list}/community/leaderboard`);
        setData(res);
      } catch (err) {
        console.error('Failed to load leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Community Champions</h3>
            <p className="text-xs text-slate-500">Live contributor ranking and trust scores</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin text-teal-800" />
          <p className="text-xs">Aggregating live community rankings...</p>
        </div>
      ) : data ? (
        <>
          {/* Overview stats strip */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <div className="text-lg font-extrabold text-teal-900">{data.totalContributors}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Contributors</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-saffron">{data.totalCommunityReports}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Reports</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-emerald-700">{data.totalVerified}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Verified DB</div>
            </div>
          </div>

          {/* Leaderboard Table */}
          {data.leaderboard.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              <ShieldCheck size={28} className="mx-auto text-slate-300 mb-1.5" />
              Be the first community champion! Report and verify local businesses.
            </div>
          ) : (
            <div className="space-y-2">
              {data.leaderboard.map((item) => {
                const isTop1 = item.rank === 1;
                const isTop2 = item.rank === 2;
                const isTop3 = item.rank === 3;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isTop1
                        ? 'bg-amber-50/70 border-amber-200 shadow-sm'
                        : isTop2
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">
                        {isTop1 ? (
                          <Medal size={20} className="text-amber-500" />
                        ) : isTop2 ? (
                          <Medal size={20} className="text-slate-400" />
                        ) : isTop3 ? (
                          <Medal size={20} className="text-amber-700" />
                        ) : (
                          <span className="text-slate-500 font-semibold">{item.rank}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</span>
                          {item.badges.map((b) => (
                            <span
                              key={b}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                b === 'Village Champion' || b === 'Master Validator'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {item.village} · {item.block}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-teal-900">
                        {item.verifiedCount} Verified
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600">
                        Trust: {item.trustScore}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center text-slate-400 text-xs">
          Community leaderboard temporarily offline.
        </div>
      )}
    </div>
  );
}
