'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench, Printer, CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck,
  Plus, Trash2, RotateCcw, Search, Sparkles
} from 'lucide-react';
import { EquipmentItem, BusinessCategory } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';
import { getDynamicEquipmentList } from '@/lib/data/equipmentCatalogue';
import { ProformaQuotationModal } from './ProformaQuotationModal';

interface EquipmentRequirementSectionProps {
  equipmentList?: EquipmentItem[];
  businessCategory?: BusinessCategory;
  projectCost?: number;
  promoterMargin?: number;
  loanAmount?: number;
  applicantName?: string;
  location?: string;
  category?: string;
}

export function EquipmentRequirementSection({
  equipmentList,
  businessCategory = 'DAIRY',
  projectCost = 185000,
  promoterMargin,
  loanAmount,
  applicantName,
  location,
  category,
}: EquipmentRequirementSectionProps) {
  const { t, lang } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ESSENTIAL' | 'RECOMMENDED' | 'OPTIONAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Dynamic state of equipment items
  const [items, setItems] = useState<EquipmentItem[]>(() => {
    if (equipmentList && equipmentList.length > 0) {
      return equipmentList;
    }
    return getDynamicEquipmentList(businessCategory, projectCost, lang);
  });

  // Re-sync when businessCategory, projectCost, or lang changes
  useEffect(() => {
    if (equipmentList && equipmentList.length > 0) {
      setItems(equipmentList);
    } else {
      setItems(getDynamicEquipmentList(businessCategory, projectCost, lang));
    }
  }, [businessCategory, projectCost, lang, equipmentList]);

  // Form state for adding custom machinery
  const [customName, setCustomName] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [customUnit, setCustomUnit] = useState('units');
  const [customCat, setCustomCat] = useState<EquipmentItem['category']>('MACHINERY');
  const [customImportance, setCustomImportance] = useState<EquipmentItem['importance']>('ESSENTIAL');
  const [customSpecs, setCustomSpecs] = useState('');
  const [customVendor, setCustomVendor] = useState('');

  // Interactive quantity change (+ / -)
  const handleQuantityChange = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          const unitPrice = Math.round(item.estimatedCost / Math.max(1, item.quantity));
          return {
            ...item,
            quantity: newQty,
            estimatedCost: unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset to category defaults
  const handleResetDefaults = () => {
    setItems(getDynamicEquipmentList(businessCategory, projectCost, lang));
  };

  // Add custom item handler
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customCost) return;

    const newItem: EquipmentItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCat,
      estimatedCost: Math.max(500, Number(customCost) || 5000),
      quantity: Math.max(1, Number(customQty) || 1),
      unit: customUnit.trim() || 'units',
      importance: customImportance,
      specification: customSpecs.trim() || 'Commercial standard specification matching local bank requirements',
      vendorType: customVendor.trim() || 'Registered District Dealer / Local Authorized Vendor',
    };

    setItems((prev) => [newItem, ...prev]);
    setIsAddingCustom(false);
    setCustomName('');
    setCustomCost('');
    setCustomQty('1');
    setCustomSpecs('');
    setCustomVendor('');
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesFilter = selectedFilter === 'ALL' || item.importance === selectedFilter;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendorType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalEquipmentCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const essentialCost = items
    .filter((item) => item.importance === 'ESSENTIAL')
    .reduce((sum, item) => sum + item.estimatedCost, 0);
  const essentialCount = items.filter((item) => item.importance === 'ESSENTIAL').length;

  const getImportanceBadge = (importance: EquipmentItem['importance']) => {
    switch (importance) {
      case 'ESSENTIAL':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'RECOMMENDED':
        return 'bg-sky-100 text-sky-800 border-sky-200 font-semibold';
      case 'OPTIONAL':
        return 'bg-slate-100 text-slate-700 border-slate-200 font-normal';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryBadge = (cat: EquipmentItem['category']) => {
    switch (cat) {
      case 'MACHINERY':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'INSTRUMENT':
        return 'bg-indigo-50 text-indigo-900 border-indigo-200';
      case 'TOOL':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'INFRASTRUCTURE':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-2xs">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{t.feasibilityReportDetails.equipmentTitle}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-50 text-brand-900 border border-brand-200">
                  {businessCategory.replaceAll('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic machinery & tools outlay scaled for ₹{formatIndianNumber(projectCost, lang)} project budget.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Plus size={14} className="text-brand-700" />
            Add Custom Machine
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset to category standard specifications"
          >
            <RotateCcw size={13} />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={() => setIsQuotationModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-teal-800 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-teal-900 shadow-2xs"
          >
            <Printer className="h-4 w-4 text-emerald-300" />
            {t.feasibilityReportDetails.quotationBtn}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {lang === 'HI' ? 'कुल उपकरण लागत' : lang === 'BN' ? 'মোট সরঞ্জাম খরচ' : 'Total Equipment Allocation'}
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900 font-mono">
            {formatIndianNumber(totalEquipmentCost, lang, true)}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            {((totalEquipmentCost / Math.max(1, projectCost)) * 100).toFixed(0)}% of ₹{formatIndianNumber(projectCost, lang)} project outlay
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
          <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wide flex items-center justify-between">
            <span>Essential Machinery</span>
            <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[9px] font-bold text-rose-900">
              {essentialCount} Items
            </span>
          </div>
          <div className="mt-1 text-lg font-extrabold text-rose-950 font-mono">
            {formatIndianNumber(essentialCost, lang, true)}
          </div>
          <div className="mt-0.5 text-[10px] text-rose-700">Mandatory for Month 1 commercial launch</div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5">
          <div className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wide flex items-center justify-between">
            <span>Bank Quotation Ready</span>
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-1 text-sm font-bold text-indigo-950">
            {items.length} Specifications Mapped
          </div>
          <div className="mt-0.5 text-[10px] text-indigo-700">Ready for SCA, MUDRA & PMEGP vendor inquiry</div>
        </div>
      </div>

      {/* Add Custom Item Drawer / Form */}
      {isAddingCustom && (
        <form onSubmit={handleAddCustomItem} className="rounded-xl border border-brand-300 bg-brand-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-brand-200 pb-2">
            <span className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-700" />
              Add Custom Machinery or Equipment
            </span>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Equipment Name *</label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Commercial Oil Filter Press / Automatic Sealer"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Estimated Cost (₹) *</label>
              <input
                type="number"
                required
                min="500"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Quantity & Unit</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                  className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-800 bg-white font-mono"
                />
                <input
                  type="text"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="unit / sets"
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-800 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Category</label>
              <select
                value={customCat}
                onChange={(e) => setCustomCat(e.target.value as EquipmentItem['category'])}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-800 bg-white"
              >
                <option value="MACHINERY">Machinery</option>
                <option value="INSTRUMENT">Instrument</option>
                <option value="TOOL">Tool</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Importance</label>
              <select
                value={customImportance}
                onChange={(e) => setCustomImportance(e.target.value as EquipmentItem['importance'])}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-800 bg-white"
              >
                <option value="ESSENTIAL">Essential (Month 1)</option>
                <option value="RECOMMENDED">Recommended</option>
                <option value="OPTIONAL">Optional</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Technical Specs & Standards</label>
              <input
                type="text"
                value={customSpecs}
                onChange={(e) => setCustomSpecs(e.target.value)}
                placeholder="e.g. 2 HP motor, SS 304 food-grade contact parts, 220V single phase"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-2xs"
            >
              Add to Equipment Schedule
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'ESSENTIAL', 'RECOMMENDED', 'OPTIONAL'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                selectedFilter === filter
                  ? 'bg-brand-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter === 'ALL' ? 'All Equipment' : filter}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search equipment, specs or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Itemized Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5">Equipment / Instrument Name</th>
              <th className="py-3 px-3.5">Category</th>
              <th className="py-3 px-3.5">Importance</th>
              <th className="py-3 px-3.5">Technical Specification & Standards</th>
              <th className="py-3 px-3.5 text-center">Qty</th>
              <th className="py-3 px-3.5 text-right">Est. Cost (₹)</th>
              <th className="py-3 px-3.5">Sourcing / Vendor Type</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3.5 font-bold text-slate-900">
                  <div className="flex items-start gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-brand-700 shrink-0 mt-0.5" />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3.5">
                  <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getCategoryBadge(item.category)}`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-3.5">
                  <span className={`inline-block px-2 py-0.5 rounded border text-[10px] ${getImportanceBadge(item.importance)}`}>
                    {item.importance}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-slate-600 max-w-xs">
                  <span className="text-[11px] leading-snug block">{item.specification}</span>
                </td>
                <td className="py-3 px-3.5 text-center font-semibold text-slate-800">
                  <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-white">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs px-1">
                      {formatIndianNumber(item.quantity, lang)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{item.unit}</span>
                </td>
                <td className="py-3 px-3.5 text-right font-extrabold text-slate-900 font-mono">
                  {formatIndianNumber(item.estimatedCost, lang, true)}
                </td>
                <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                  {item.vendorType}
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  No machinery or instruments found matching your search.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
            <tr>
              <td colSpan={5} className="py-3 px-3.5">
                Total Machinery & Equipment Allocation ({items.length} items)
              </td>
              <td className="py-3 px-3.5 text-right font-black text-brand-700 text-sm font-mono">
                {formatIndianNumber(totalEquipmentCost, lang, true)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bank Pro-Forma Invoice Helper Card */}
      <div className="rounded-xl bg-amber-50/80 p-4 border border-amber-200 text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          Bank Loan Submission Tip — Pro-Forma Quotation Requirement
        </div>
        <p className="text-amber-900 leading-relaxed text-[11px]">
          When submitting your business plan to banks under <strong>SCA Concessional Credit</strong>, <strong>MUDRA</strong>, or <strong>PMEGP</strong>, officers require <strong>official pro-forma invoices/quotations</strong> from empanelled machinery vendors before releasing disbursement directly to vendors. Click <strong>&quot;Print Quotation Form&quot;</strong> above to generate your pre-formatted 1-page bank submission sheet.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-amber-900 pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Vendor GSTIN & Bank A/C Certified
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Itemized Specs & Voltage Rating
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 1-Year Comprehensive Warranty Included
          </span>
        </div>
      </div>

      {/* 1-Page Proforma Quotation & Application Modal */}
      <ProformaQuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        equipmentList={items}
        businessCategory={businessCategory}
        projectCost={projectCost}
        promoterMargin={promoterMargin}
        loanAmount={loanAmount}
        applicantName={applicantName}
        location={location}
        category={category}
      />
    </section>
  );
}
