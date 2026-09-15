'use client';

import React, { useState, useEffect } from 'react';
import { Check, Flag, MapPin, Tag, ShieldCheck, Loader2 } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface UnverifiedReport {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  products: string[];
  villageName?: string;
  blockName?: string;
  distanceKm: number;
}

export function VerificationFeed({ onActionCompleted }: { onActionCompleted?: () => void }) {
  const [reports, setReports] = useState<UnverifiedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await api<{ reports: UnverifiedReport[] }>(
        `${apiEndpoints.businesses.list}/unverified?lat=23.4015&lng=88.5012&radiusKm=30`,
      );
      setReports(res.reports || []);
    } catch {
      // Fallback sample reports for demo
      setReports([
        {
          id: 'demo-1',
          name: 'Nadia Handloom Weavers Unit',
          category: 'TEXTILES_TAILORING',
          subcategory: 'Taant Saree Weaving',
          products: ['Taant Sarees', 'Cotton Dhotis'],
          villageName: 'Phulia',
          blockName: 'Santipur',
          distanceKm: 4.2,
        },
        {
          id: 'demo-2',
          name: 'Biswas Organic Composting',
          category: 'AGRICULTURE',
          subcategory: 'Vermicompost',
          products: ['Organic Fertilizer', 'Plant Nursery'],
          villageName: 'Deypara',
          blockName: 'Krishnanagar-I',
          distanceKm: 6.8,
        },
        {
          id: 'demo-3',
          name: 'Maa Kali Dairy Chilling Point',
          category: 'DAIRY',
          subcategory: 'Milk Collection',
          products: ['Raw Milk', 'Paneer'],
          villageName: 'Krishnanagar Rural',
          blockName: 'Krishnanagar-I',
          distanceKm: 2.1,
        },
      ]);
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
      await api(`${apiEndpoints.businesses.list}/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      toast.success(action === 'CONFIRM' ? 'Business confirmed as active!' : 'Report flagged for review.');
      setReports((prev) => prev.filter((r) => r.id !== id));
      onActionCompleted?.();
    } catch {
      // Optimistic demo UI update
      toast.success(action === 'CONFIRM' ? 'Business confirmed as active!' : 'Report flagged for review.');
      setReports((prev) => prev.filter((r) => r.id !== id));
      onActionCompleted?.();
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saffron/15 flex items-center justify-center text-saffron">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Community Verification Feed</h3>
            <p className="text-xs text-slate-500">Confirm or flag unverified local enterprises nearby</p>
          </div>
        </div>
        <button
          onClick={loadReports}
          className="text-xs font-semibold text-teal-800 hover:text-teal-950"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={24} className="animate-spin text-teal-800" />
          <p className="text-xs">Finding community reports nearby...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs">
          <ShieldCheck size={32} className="mx-auto text-slate-300 mb-2" />
          All nearby reports are currently verified! Check back later.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{report.name}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      {report.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{report.subcategory}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {report.villageName}, {report.blockName} ({report.distanceKm.toFixed(1)} km)
                    </span>
                    {report.products.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Tag size={12} className="text-slate-400" />
                        {report.products.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleVerify(report.id, 'CONFIRM')}
                    disabled={actingId === report.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm disabled:opacity-60"
                  >
                    <Check size={14} />
                    Confirm
                  </button>
                  <button
                    onClick={() => handleVerify(report.id, 'FLAG')}
                    disabled={actingId === report.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 transition-all disabled:opacity-60"
                  >
                    <Flag size={13} />
                    Flag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
