'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, FileText } from 'lucide-react';

interface DocumentChecklistProps {
  schemeName?: string;
  businessCategory?: string;
}

const BASE_DOCUMENTS = [
  { id: 'aadhaar', label: 'Aadhaar Card (Self + Spouse)' },
  { id: 'pan', label: 'PAN Card' },
  { id: 'caste', label: 'Caste / Category Certificate (SC/ST/OBC)' },
  { id: 'residence', label: 'Residence Proof (Electricity Bill / Ration Card)' },
  { id: 'bank', label: 'Bank Account Passbook (Last 6 Months Statement)' },
  { id: 'land', label: 'Land Ownership / Lease Document' },
  { id: 'photos', label: 'Passport-Size Photographs (6 Copies)' },
  { id: 'dpr', label: 'Business Plan / DPR (This Report Qualifies)' },
  { id: 'quotation1', label: 'Quotations for Primary Equipment / Assets (2 Suppliers)' },
  { id: 'quotation2', label: 'Quotations for Secondary Equipment / Raw Materials' },
  { id: 'udyam', label: 'Udyam Registration Certificate (udyamregistration.gov.in)' },
];

const SCHEME_DOCUMENTS: Record<string, { id: string; label: string }[]> = {
  PMEGP: [
    { id: 'pmegp_edu', label: 'Educational Qualification Certificate (8th Pass for Mfg > ₹10L)' },
    { id: 'pmegp_edp', label: 'EDP/SDP Training Certificate from KVIC/DIC' },
    { id: 'pmegp_proj', label: 'Project Report Countersigned by Task Force Committee' },
  ],
  MUDRA: [
    { id: 'mudra_bus', label: 'Business Address Proof' },
    { id: 'mudra_lic', label: 'Relevant Business License / Permit (if applicable)' },
  ],
  'PM-SVANidhi': [
    { id: 'svanidhi_lov', label: 'Letter of Recommendation from ULB/Municipal Body' },
    { id: 'svanidhi_vend', label: 'Vending Certificate / ID Card' },
  ],
  'Stand-Up India': [
    { id: 'standup_sc', label: 'SC/ST Certificate from Competent Authority OR proof of being a Woman' },
    { id: 'standup_greenfield', label: 'Affidavit: First-time loan for greenfield enterprise' },
  ],
  FSSAI: [
    { id: 'fssai_reg', label: 'FSSAI Basic Registration (Free, online at fssai.gov.in)' },
  ],
};

const CATEGORY_DOCUMENTS: Record<string, { id: string; label: string }[]> = {
  DAIRY: [
    { id: 'dairy_cattle', label: 'Cattle Purchase Receipts / Health Certificates' },
    { id: 'dairy_insurance', label: 'Livestock Insurance Proposal' },
  ],
  FOOD_PROCESSING: [
    { id: 'food_fssai', label: 'FSSAI License / Registration' },
    { id: 'food_noc', label: 'Pollution Control Board NOC (if applicable)' },
  ],
  POULTRY: [
    { id: 'poultry_health', label: 'Poultry Farm Health Certificate from Veterinary Department' },
  ],
};

export function DocumentChecklist({ schemeName, businessCategory }: DocumentChecklistProps) {
  const STORAGE_KEY = 'ArthSetu_doc_checklist';

  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  function toggle(id: string) {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }

  // Build full document list
  const allDocs = [...BASE_DOCUMENTS];

  // Add scheme-specific docs
  if (schemeName) {
    for (const [key, docs] of Object.entries(SCHEME_DOCUMENTS)) {
      if (schemeName.toUpperCase().includes(key.toUpperCase())) {
        allDocs.push(...docs);
      }
    }
  }

  // Add category-specific docs
  if (businessCategory && CATEGORY_DOCUMENTS[businessCategory]) {
    allDocs.push(...CATEGORY_DOCUMENTS[businessCategory]);
  }

  const totalChecked = allDocs.filter(d => checked[d.id]).length;
  const progressPct = Math.round((totalChecked / allDocs.length) * 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-saffron" />
          <h2 className="text-lg font-semibold text-teal-900">
            Funding Readiness Checklist
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-slate-500">
            {totalChecked}/{allDocs.length}
          </div>
          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: progressPct === 100
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #E65C00, #FF8C42)',
              }}
            />
          </div>
        </div>
      </div>

      {progressPct === 100 && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700">
          ✓ All documents ready! You can proceed with your loan application.
        </div>
      )}

      <div className="space-y-1.5">
        {allDocs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => toggle(doc.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150 ${
              checked[doc.id]
                ? 'bg-emerald-50 text-emerald-800'
                : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            {checked[doc.id] ? (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="h-4.5 w-4.5 text-slate-300 flex-shrink-0" />
            )}
            <span className={checked[doc.id] ? 'line-through opacity-70' : ''}>
              {doc.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
