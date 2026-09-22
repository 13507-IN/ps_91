'use client';

import React, { useState, useEffect } from 'react';
import { Check, Flag, MapPin, Tag, ShieldCheck, Loader2, Sparkles, Award } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface UnverifiedReport {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  products: string[];
  scale?: string;
  villageName?: string;
  blockName?: string;
  districtName?: string;
  distanceKm: number;
  validationsCount: number;
  flagsCount: number;
  threshold: number;
  remainingValidations: number;
  progressPct: number;
  createdAt?: string;
}

export function VerificationFeed({ onActionCompleted }: { onActionCompleted?: () => void }) {
  const [reports, setReports] = useState<UnverifiedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  async function loadReports() {
    setLoading(true);
    try {
      // Query dynamic unverified reports from real database
      const res = await api<{ totalUnverified: number; reports: UnverifiedReport[] }>(
        `${apiEndpoints.businesses.list}/unverified?radiusKm=50`,
      );
      setReports(res.reports || []);
    } catch (err) {
      console.error('Failed to load unverified reports:', err);
      setReports([]);
      toast.error('Unable to fetch community reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleVerify(id: string, action: 'CONFIRM' | 'FLAG') {
    setActingId(id);
    try {
      const res = await api<{
        success: boolean;
        business: UnverifiedReport & { isVerified?: boolean; validationsCount: number };
      }>(`${apiEndpoints.businesses.list}/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });

      const updatedBiz = res.business;
      const count = updatedBiz.validationsCount;
      const isNowVerified = updatedBiz.isVerified || count >= 10;

      if (action === 'CONFIRM') {
        if (isNowVerified) {
          // Celebratory threshold reached!
          setCelebratingId(id);
          toast.success('🎉 10/10 Reached! Business is now officially added to the database!', {
            duration: 4000,
            icon: '🏆',
          });

          // Update card in place to celebrate, then remove after 2.5 seconds
          setReports((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    validationsCount: 10,
                    progressPct: 100,
                    remainingValidations: 0,
                  }
                : r,
            ),
          );

          setTimeout(() => {
            setReports((prev) => prev.filter((r) => r.id !== id));
            setCelebratingId(null);
            onActionCompleted?.();
          }, 2500);
        } else {
          toast.success(`Validation recorded! (${count}/10 community confirmations)`);
          // Live increment on card
          setReports((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    validationsCount: count,
                    progressPct: Math.min(100, Math.round((count / 10) * 100)),
                    remainingValidations: Math.max(0, 10 - count),
                  }
                : r,
            ),
          );
          onActionCompleted?.();
        }
      } else {
        toast.success('Report flagged for review.');
        setReports((prev) => prev.filter((r) => r.id !== id));
        onActionCompleted?.();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saffron/15 flex items-center justify-center text-saffron">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Community Verification Feed</h3>
            <p className="text-xs text-slate-500">
              Businesses require <strong>10+ community validations</strong> to be added to the official database
            </p>
          </div>
        </div>
        <button
          onClick={loadReports}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-teal-800 hover:bg-slate-50 transition-colors"
        >
          Refresh Feed
        </button>
      </div>

      {loading ? (
        <div className="py-14 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={26} className="animate-spin text-teal-800" />
          <p className="text-xs font-medium">Checking live community submissions...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck size={26} />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">All Local Reports Are Currently Verified!</h4>
          <p className="text-slate-500 max-w-sm mx-auto text-xs leading-relaxed">
            Every reported enterprise has either graduated into the verified registry or been validated. Report a new business to start community verification!
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {reports.map((report) => {
            const isCelebrating = celebratingId === report.id;
            const validations = report.validationsCount ?? 1;
            const threshold = report.threshold ?? 10;
            const progress = Math.min(100, Math.round((validations / threshold) * 100));
            const remaining = Math.max(0, threshold - validations);

            return (
              <div
                key={report.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCelebrating
                    ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500 shadow-md scale-[1.01]'
                    : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{report.name}</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {report.category}
                      </span>
                      {report.scale && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {report.scale}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {report.subcategory || 'Informal Village Enterprise'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        {report.villageName || 'Local Village'}, {report.blockName || 'Local Block'}
                      </span>
                      {report.products && report.products.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Tag size={12} className="text-slate-400" />
                          {report.products.slice(0, 3).join(', ')}
                        </span>
                      )}
                    </div>

                    {/* 10+ Validations Progress Bar */}
                    <div className="pt-2 max-w-md space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          {isCelebrating ? (
                            <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                              <Award size={13} className="text-emerald-600" /> Verified in DB!
                            </span>
                          ) : (
                            <span>Community Validations:</span>
                          )}
                          <strong className={isCelebrating ? 'text-emerald-700 font-extrabold' : 'text-teal-900'}>
                            {validations} / {threshold}
                          </strong>
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          {isCelebrating
                            ? '100% Validated'
                            : `${remaining} more needed`}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCelebrating
                              ? 'bg-emerald-500'
                              : progress >= 70
                                ? 'bg-emerald-600'
                                : progress >= 40
                                  ? 'bg-teal-600'
                                  : 'bg-amber-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    {isCelebrating ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm">
                        <Sparkles size={14} />
                        Added to Registry!
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleVerify(report.id, 'CONFIRM')}
                          disabled={actingId === report.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm disabled:opacity-60"
                          title="Confirm that this business is active (+1 validation)"
                        >
                          {actingId === report.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Confirm Active (+1)
                        </button>
                        <button
                          onClick={() => handleVerify(report.id, 'FLAG')}
                          disabled={actingId === report.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 transition-all disabled:opacity-60"
                          title="Flag as closed or inaccurate"
                        >
                          <Flag size={13} />
                          Flag
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
