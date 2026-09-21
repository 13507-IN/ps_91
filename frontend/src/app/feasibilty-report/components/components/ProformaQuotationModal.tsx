'use client';

import React, { useRef } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { EquipmentItem, BusinessCategory } from '@/types';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ProformaQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: EquipmentItem[];
  businessCategory: BusinessCategory;
  projectCost: number;
  promoterMargin?: number;
  loanAmount?: number;
  schemeName?: string;
  applicantName?: string;
  location?: string;
  category?: string;
}

export function ProformaQuotationModal({
  isOpen,
  onClose,
  equipmentList,
  businessCategory,
  projectCost,
  promoterMargin = projectCost * 0.10,
  loanAmount = projectCost * 0.90,
  schemeName = projectCost <= 140000 ? 'SCA Micro Finance Scheme (Logic A)' : 'SCA Term Loan Scheme (Logic B)',
  applicantName = 'Verified Beneficiary',
  location = 'Nadia, West Bengal',
  category = 'OBC / Rural Entrepreneur',
}: ProformaQuotationModalProps) {
  const { lang } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isMicro = projectCost <= 140000;
  const interestRate = isMicro ? '6.5%' : '8.0%';
  const moratorium = isMicro ? '3 Months' : '6 Months';
  const tenure = isMicro ? '3 Years (36 Months / 12 Quarters)' : '7 Years (84 Months / 28 Quarters)';
  const totalEquipmentCost = equipmentList.reduce((sum, item) => sum + item.estimatedCost, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 my-auto overflow-hidden">
        
        {/* Modal Top Control Bar (Hidden during Print) */}
        <div className="print:hidden flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-800 text-white">
              <FileText size={16} />
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Official 1-Page Pro-Forma Machinery Quotation & SCA Loan Application Form
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors shadow-2xs"
            >
              <Printer size={14} />
              Print / Save PDF (A4 1-Page)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div
          ref={printRef}
          className="p-6 sm:p-8 bg-white text-slate-900 space-y-4 print:p-4 print:space-y-3 font-sans text-xs print:text-[11px] leading-tight"
        >
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-widest print:text-[9px]">
              <span>Form No: SCA/CREDIT/2026/IN-91</span>
              <span>National Corporations & State Channelizing Agencies (SCAs)</span>
              <span>Govt of India / MoSJE Format</span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase print:text-sm">
              State Channelizing Agency (SCA) Concessional Credit Application
            </h1>
            <div className="text-xs font-bold text-teal-900 uppercase tracking-wide print:text-[10px]">
              & Official Pro-Forma Machinery / Equipment Quotation Format
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-bold text-slate-800">
              Scheme Tier: {schemeName} • {tenure}
            </div>
          </div>

          {/* Section 1: Applicant & Unit Details */}
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Section I: Beneficiary & Project Profile</span>
              <span className="font-mono text-slate-500">Ref: WB-ND-2026-PS91</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Applicant Name</span>
                <strong className="text-slate-900">{applicantName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Social Category</span>
                <strong className="text-slate-900">{category}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Enterprise Category</span>
                <strong className="text-slate-900">{businessCategory.replaceAll('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Project Location</span>
                <strong className="text-slate-900">{location}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: 10:90 Financial Structuring */}
          <div className="border border-slate-300 rounded-lg p-3 bg-teal-50/20">
            <div className="text-[10px] font-black uppercase tracking-wider text-teal-950 mb-2 border-b border-teal-200/80 pb-1 flex items-center justify-between">
              <span>Section II: 10:90 Financial Structuring & Moratorium Terms</span>
              <span className="font-mono text-teal-800 font-bold">Mandatory SCA Pattern</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">1. Total Project Outlay</span>
                <strong className="text-slate-950 font-mono font-black">{formatIndianNumber(projectCost, lang, true)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">2. 10% Promoter Margin</span>
                <strong className="text-teal-900 font-mono font-black">{formatIndianNumber(promoterMargin, lang, true)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">3. 90% Concessional Loan</span>
                <strong className="text-emerald-900 font-mono font-black">{formatIndianNumber(loanAmount, lang, true)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">4. Concessional Rate</span>
                <strong className="text-slate-900 font-mono">{interestRate} p.a.</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">5. Grace Moratorium</span>
                <strong className="text-teal-900 font-mono font-bold">{moratorium} (Principal = ₹0)</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Itemized Machinery & Equipment Specification */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 mb-1 flex items-center justify-between">
              <span>Section III: Pro-Forma Machinery & Technical Specification Schedule</span>
              <span className="text-[9px] text-slate-500">Subject to Direct Bank Disbursement</span>
            </div>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[10px] sm:text-[11px] print:text-[10px]">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 uppercase font-black">
                  <tr>
                    <th className="py-1.5 px-2">#</th>
                    <th className="py-1.5 px-2">Equipment / Machinery Description</th>
                    <th className="py-1.5 px-2">Technical Standards / Specs</th>
                    <th className="py-1.5 px-2 text-center">Qty</th>
                    <th className="py-1.5 px-2 text-right">Unit Price (₹)</th>
                    <th className="py-1.5 px-2 text-right font-black">Total Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {equipmentList.map((item, idx) => (
                    <tr key={`quote-item-${idx}`}>
                      <td className="py-1.5 px-2 font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-2 font-bold text-slate-950">
                        {item.name}
                        <span className="block text-[9px] font-normal text-slate-500">Sourcing: {item.vendorType}</span>
                      </td>
                      <td className="py-1.5 px-2 text-slate-600 max-w-xs">{item.specification}</td>
                      <td className="py-1.5 px-2 text-center font-mono">{item.quantity} {item.unit}</td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        {formatIndianNumber(Math.round(item.estimatedCost / (item.quantity || 1)), lang, true)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                        {formatIndianNumber(item.estimatedCost, lang, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-300 text-slate-950">
                  <tr>
                    <td colSpan={4} className="py-1.5 px-2 uppercase text-[10px]">
                      Total Machinery & Equipment Procurement Outlay
                    </td>
                    <td colSpan={2} className="py-1.5 px-2 text-right font-mono font-black text-teal-900 text-xs">
                      {formatIndianNumber(totalEquipmentCost, lang, true)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 4: Empanelled Vendor Mandate & Bank Details */}
          <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/60">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 mb-1.5 border-b border-slate-200 pb-1">
              Section IV: Empanelled Machinery Supplier / Vendor Quotation Certificate
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-700">
              <div>
                <strong>Dealer / Supplier:</strong> Maa Tara Agro-Machinery Pvt Ltd<br />
                <strong>GSTIN:</strong> 19AAACM4521K1Z8 | MSME Reg: UDYAM-WB-14-0012
              </div>
              <div>
                <strong>Disbursement Bank A/C:</strong> 5020004128912<br />
                <strong>Bank / Branch:</strong> SBI Krishnagar Main Branch (IFSC: SBIN0000121)
              </div>
              <div>
                <strong>Warranty & Servicing:</strong> 12 Months comprehensive onsite warranty & complimentary installation certified.
              </div>
            </div>
          </div>

          {/* Section 5: Official Signature, Stamp & Bank Inspection Box */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-[9px] text-slate-700">
            {/* Box 1: Applicant Signature */}
            <div className="border border-slate-300 rounded-lg p-2 flex flex-col justify-between h-24">
              <span className="font-bold uppercase text-[9px] text-slate-500">Applicant LTI / Signature</span>
              <div className="border-b border-dashed border-slate-400 my-auto"></div>
              <div className="text-[8px] text-slate-400 text-center">Signature / Thumb Impression of Beneficiary</div>
            </div>

            {/* Box 2: Vendor Stamp */}
            <div className="border border-slate-300 rounded-lg p-2 flex flex-col justify-between h-24">
              <span className="font-bold uppercase text-[9px] text-slate-500">Authorized Vendor Seal</span>
              <div className="border border-dashed border-slate-300 rounded p-1 text-center text-slate-400 my-auto text-[8px]">
                [Rubber Stamp & Signature]
              </div>
              <div className="text-[8px] text-slate-400 text-center">Dealer Official Seal & Signature</div>
            </div>

            {/* Box 3: SCA Pre-Sanction Inspection */}
            <div className="border border-slate-300 rounded-lg p-2 flex flex-col justify-between h-24 bg-slate-50">
              <span className="font-bold uppercase text-[9px] text-slate-500">SCA / Bank Sanction Officer</span>
              <div className="text-[8px] space-y-0.5 text-slate-600">
                <div>☑ Pre-Sanction Field Visit Done</div>
                <div>☑ 10% Margin Money Verified</div>
                <div>☑ Machinery Specs Approved</div>
              </div>
              <div className="text-[8px] text-slate-400 text-center border-t border-slate-200 pt-0.5">
                Branch Manager / Field Officer
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Print Button (Hidden during print) */}
        <div className="print:hidden border-t border-slate-200 bg-slate-50 px-4 sm:px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ✓ Formatted specifically for single-page A4 printout / PDF export for Gram Panchayat & SCA submission.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors shadow-2xs"
            >
              <Printer size={14} />
              Print 1-Page Quotation Form
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
