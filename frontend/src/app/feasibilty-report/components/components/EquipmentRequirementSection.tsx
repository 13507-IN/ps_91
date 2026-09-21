'use client';

import { useState } from 'react';
import { Wrench, Printer, CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { EquipmentItem, BusinessCategory } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';

interface EquipmentRequirementSectionProps {
  equipmentList?: EquipmentItem[];
  businessCategory?: BusinessCategory;
  projectCost?: number;
}

export function EquipmentRequirementSection({
  equipmentList,
  businessCategory = 'DAIRY',
  projectCost = 185000,
}: EquipmentRequirementSectionProps) {
  const { t, lang } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ESSENTIAL' | 'RECOMMENDED' | 'OPTIONAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Category default equipment fallbacks if equipmentList is not provided
  const defaultEquipment: EquipmentItem[] = [
    {
      id: 'eq-001',
      name: lang === 'HI' ? 'उच्च दूध देने वाली गायें (होलस्टीन / जर्सी)' : lang === 'BN' ? 'উচ্চ ফলনশীল দুগ্ধজাত গাভী (জার্সি/হলস্টেইন)' : 'High-Yield Milch Cows (Crossbred Jersey / Holstein)',
      category: 'MACHINERY',
      estimatedCost: 120000,
      quantity: 4,
      unit: 'animals',
      importance: 'ESSENTIAL',
      specification: lang === 'HI' ? 'स्वास्थ्य और टीकाकरण प्रमाण पत्र के साथ प्रतिदिन 12-14 लीटर दूध देने वाली गायें' : lang === 'BN' ? 'স্বাস্থ্য ও টিকাদান সার্টিফিকেট সহ প্রতিদিন ১২-১৪ লিটার দুধ প্রদানকারী গাভী' : '2nd/3rd lactation cows yielding 12–14 litres/day with health & vaccination certificate',
      vendorType: lang === 'HI' ? 'सत्यापित पशुपालक / स्थानीय हाट' : lang === 'BN' ? 'যাচাইকৃত গবাদি পশুপালক / স্থানীয় পশুর হাট' : 'Verified Cattle Breeder / Local Livestock Haat',
    },
    {
      id: 'eq-002',
      name: lang === 'HI' ? 'स्टेनलेस स्टील दूध के कैन (40L SS 304)' : lang === 'BN' ? 'স্টেইনলেস স্টিল দুধের ক্যান (৪০ লিটার SS 304)' : 'Stainless Steel Milk Storage Cans (SS 304)',
      category: 'INSTRUMENT',
      estimatedCost: 6500,
      quantity: 2,
      unit: 'cans (40L)',
      importance: 'ESSENTIAL',
      specification: lang === 'HI' ? 'फूड-ग्रेड बॉडी, एयरटाइट ढक्कन और मजबूत हैंडल' : lang === 'BN' ? 'ফুড-গ্রেড ক্যান, এয়ারটাইট কভার এবং মজবুত হ্যান্ডেল' : 'Food-grade SS 304 seamless body with airtight cover & heavy-duty handles',
      vendorType: lang === 'HI' ? 'अधिकृत डेयरी उपकरण डीलर' : lang === 'BN' ? 'অনুমোদিত ডেইরি সরঞ্জাম বিক্রেতা' : 'Authorized Dairy Equipment Dealer / Local Market',
    },
    {
      id: 'eq-003',
      name: lang === 'HI' ? 'स्वचालित मिलकिंग मशीन (डबल बकेट)' : lang === 'BN' ? 'স্বয়ংক্রিয় মিল্কিং মেশিন (ডাবল বাকেট)' : 'Automatic Double-Bucket Milking Machine',
      category: 'MACHINERY',
      estimatedCost: 18500,
      quantity: 1,
      unit: 'unit',
      importance: 'ESSENTIAL',
      specification: lang === 'HI' ? '1HP वैक्यूम पंप मोटर, सिलिकॉन टीट कप' : lang === 'BN' ? '১ এইচপি ভ্যাকুয়াম পাম্প মোটর, সিলিকন টিট কাপ' : 'Single-phase 1HP vacuum pump motor, pulsator 60/40, silicone teat cups',
      vendorType: lang === 'HI' ? 'KVIC अनुमोदित विक्रेता' : lang === 'BN' ? 'কেভিআইসি অনুমোদিত বিক্রেতা' : 'Empanelled Agro-Machinery Distributor / KVIC Vendor',
    },
  ];

  const items = equipmentList && equipmentList.length > 0 ? equipmentList : defaultEquipment;

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

  const handlePrintQuotationForm = () => {
    window.print();
  };

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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.feasibilityReportDetails.equipmentTitle}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.feasibilityReportDetails.equipmentSub} — {businessCategory.replaceAll('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrintQuotationForm}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 shadow-2xs"
        >
          <Printer className="h-4 w-4 text-brand-600" />
          {t.feasibilityReportDetails.quotationBtn}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {lang === 'HI' ? 'कुल उपकरण लागत' : lang === 'BN' ? 'মোট সরঞ্জাম খরচ' : 'Total Equipment Cost'}
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900">
            {formatIndianNumber(totalEquipmentCost, lang, true)}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            {((totalEquipmentCost / projectCost) * 100).toFixed(0)}% of total ₹{formatIndianNumber(projectCost, lang)} project cost
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
          <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wide flex items-center justify-between">
            <span>Essential Machinery</span>
            <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[9px] font-bold text-rose-900">
              {essentialCount} Items
            </span>
          </div>
          <div className="mt-1 text-lg font-extrabold text-rose-950">
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
          <div className="mt-0.5 text-[10px] text-indigo-700">Ready for MUDRA & PMEGP vendor inquiry</div>
        </div>
      </div>

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

        <input
          type="text"
          placeholder="Search by equipment, specs or vendor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
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
              <th className="py-3 px-3.5">Quantity</th>
              <th className="py-3 px-3.5 text-right">Est. Cost (₹)</th>
              <th className="py-3 px-3.5">Sourcing / Vendor Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3.5 font-bold text-slate-900">
                  <div className="flex items-start gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
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
                <td className="py-3 px-3.5 font-semibold text-slate-800">
                  {formatIndianNumber(item.quantity, lang)} {item.unit}
                </td>
                <td className="py-3 px-3.5 text-right font-extrabold text-slate-900">
                  {formatIndianNumber(item.estimatedCost, lang, true)}
                </td>
                <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                  {item.vendorType}
                </td>
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No machinery or instruments found matching your search.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
            <tr>
              <td colSpan={5} className="py-3 px-3.5">Total Machinery & Equipment Allocation</td>
              <td className="py-3 px-3.5 text-right font-black text-brand-700 text-sm">
                {formatIndianNumber(totalEquipmentCost, lang, true)}
              </td>
              <td></td>
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
          When submitting your business plan to banks under <strong>MUDRA (Kishore / Tarun)</strong> or <strong>PMEGP</strong>, bank officers require <strong>2 to 3 official pro-forma invoices/quotations</strong> from registered machinery vendors before releasing the loan disbursement directly to vendors.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-amber-900 pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Vendor GSTIN & Signature
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Itemized Specs & Voltage Rating
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 1-Year Warranty & Installation Included
          </span>
        </div>
      </div>
    </section>
  );
}
