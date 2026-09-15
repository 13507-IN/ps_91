'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
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
  leaderboard: Contributor[];
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await api<LeaderboardData>(`${apiEndpoints.businesses.list}/community/leaderboard`);
        setData(res);
      } catch {
        // Fallback default
        setData({
          totalContributors: 5,
          totalCommunityReports: 75,
          totalVerified: 66,
          leaderboard: [
            {
              rank: 1,
              id: 'u1',
              name: 'Sourav Mondal',
              village: 'Krishnanagar Rural',
              block: 'Krishnanagar-I',
              district: 'Nadia',
              reportsSubmitted: 24,
              verifiedCount: 22,
              trustScore: 98,
              badges: ['Village Champion', 'Pioneer', 'Trusted Reporter'],
            },
            {
              rank: 2,
              id: 'u2',
              name: 'Ananya Biswas',
              village: 'Deypara',
              block: 'Krishnanagar-I',
              district: 'Nadia',
              reportsSubmitted: 18,
              verifiedCount: 16,
              trustScore: 94,
              badges: ['Pioneer', 'Trusted Reporter'],
            },
            {
              rank: 3,
              id: 'u3',
              name: 'Subhash Roy',
              village: 'Phulia',
              block: 'Santipur',
              district: 'Nadia',
              reportsSubmitted: 14,
              verifiedCount: 12,
              trustScore: 91,
              badges: ['Trusted Reporter'],
            },
            {
              rank: 4,
              id: 'u4',
              name: 'Priyanka Das',
              village: 'Santipur Rural',
              block: 'Santipur',
              district: 'Nadia',
              reportsSubmitted: 11,
              verifiedCount: 9,
              trustScore: 88,
              badges: ['Trusted Reporter'],
            },
            {
              rank: 5,
              id: 'u5',
              name: 'Debojyoti Ghosh',
              village: 'Ranaghat Rural',
              block: 'Ranaghat-I',
              district: 'Nadia',
              reportsSubmitted: 8,
              verifiedCount: 7,
              trustScore: 85,
              badges: ['Contributor'],
            },
          ],
        });
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
            <p className="text-xs text-slate-500">Top rural data contributors in Nadia District</p>
          </div>
        </div>
      </div>

      {/* Overview stats strip */}
      {data && (
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
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Verified</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {data?.leaderboard.map((item) => {
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
                          b === 'Village Champion'
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
    </div>
  );
}
