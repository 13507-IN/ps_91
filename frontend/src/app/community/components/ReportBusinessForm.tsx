'use client';

import React, { useState } from 'react';
import { PlusCircle, Loader2, CheckCircle2, Store } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'DAIRY', label: 'Dairy & Milk Products' },
  { value: 'FOOD_PROCESSING', label: 'Food Processing' },
  { value: 'RETAIL', label: 'Retail & Grocery' },
  { value: 'TEXTILES_TAILORING', label: 'Textiles & Tailoring' },
  { value: 'POULTRY', label: 'Poultry & Livestock' },
  { value: 'AGRICULTURE', label: 'Agricultural Services' },
  { value: 'LIVESTOCK', label: 'Livestock Trading' },
  { value: 'TRANSPORT', label: 'Rural Logistics' },
  { value: 'HANDICRAFT', label: 'Handicrafts & Artisans' },
  { value: 'SERVICES', label: 'Technical Services' },
  { value: 'OTHER', label: 'Other Enterprise' },
];

export function ReportBusinessForm({ onReportSubmitted }: { onReportSubmitted?: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('RETAIL');
  const [subcategory, setSubcategory] = useState('');
  const [products, setProducts] = useState('');
  const [scale, setScale] = useState<'MICRO' | 'SMALL' | 'MEDIUM'>('MICRO');
  const [villageName, setVillageName] = useState('Krishnanagar Rural');
  const latitude = 23.4015;
  const longitude = 88.5012;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter the business name');
      return;
    }

    setIsSubmitting(true);
    try {
      const productList = products
        ? products.split(',').map((p) => p.trim()).filter(Boolean)
        : [subcategory || category];

      await api(apiEndpoints.businesses.create, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          category,
          subcategory: subcategory.trim() || undefined,
          products: productList.length > 0 ? productList : ['General Goods'],
          scale,
          latitude,
          longitude,
          source: 'COMMUNITY_REPORT',
        }),
      });

      toast.success('Business report submitted for community verification!');
      setSubmitted(true);
      setName('');
      setSubcategory('');
      setProducts('');
      onReportSubmitted?.();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-800/10 flex items-center justify-center text-teal-800">
          <Store size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Report a Local Business</h3>
          <p className="text-xs text-slate-500">Help map informal & unregistered rural enterprises</p>
        </div>
      </div>

      {submitted ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
          <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
          <h4 className="font-bold text-emerald-900 text-sm">Thank You for Your Contribution!</h4>
          <p className="text-xs text-emerald-700">
            Your report will earn you community trust points once verified by fellow village members.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maa Durga Tailoring Shop"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory / Activity</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Blouse & Saree Alteration"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Main Products / Services (comma-separated)</label>
            <input
              type="text"
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              placeholder="e.g. Sarees, Kurtas, School Uniforms"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(e.target.value as 'MICRO' | 'SMALL' | 'MEDIUM')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm bg-white"
              >
                <option value="MICRO">Micro (1–2 Workers)</option>
                <option value="SMALL">Small (3–10 Workers)</option>
                <option value="MEDIUM">Medium (10+ Workers)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Town</label>
              <input
                type="text"
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                placeholder="Village name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-800 text-white font-semibold hover:bg-teal-900 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
            Submit Business Report
          </button>
        </form>
      )}
    </div>
  );
}
