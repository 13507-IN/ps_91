'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  FileText,
  ExternalLink,
  Printer,
  Eye,
  X,
  Sparkles,
  HelpCircle,
  Building2,
  QrCode,
  Check,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface DocumentChecklistProps {
  schemeName?: string;
  businessCategory?: string;
}

interface VisualDoc {
  id: string;
  nameEn: string;
  nameBn: string;
  nameHi: string;
  tagEn: string;
  tagBn: string;
  tagHi: string;
  badgeColor: string;
  checkTipEn: string;
  checkTipBn: string;
  checkTipHi: string;
  whereEn: string;
  whereBn: string;
  whereHi: string;
  actionType?: 'link' | 'quotation_template' | 'none';
  actionUrl?: string;
  actionLabelEn?: string;
  actionLabelBn?: string;
  actionLabelHi?: string;
  svgType: 'aadhaar' | 'pan' | 'passbook' | 'udyam' | 'quotation' | 'generic';
}

const VISUAL_DOCUMENTS: VisualDoc[] = [
  {
    id: 'aadhaar',
    nameEn: 'Aadhaar Card',
    nameBn: 'আধার কার্ড',
    nameHi: 'आधार कार्ड',
    tagEn: 'Proof of Identity & Address',
    tagBn: 'পরিচয় ও ঠিকানার প্রমাণ',
    tagHi: 'पहचान और पते का प्रमाण',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    checkTipEn: 'Must be linked with your active mobile number for OTP verification.',
    checkTipBn: 'আধার কার্ডের সাথে সক্রিয় মোবাইল নম্বর লিঙ্ক থাকা বাধ্যতামূলক।',
    checkTipHi: 'ओटीपी सत्यापन के लिए आधार सक्रिय मोबाइल नंबर से जुड़ा होना चाहिए।',
    whereEn: 'Nearest Aadhaar Seva Kendra, Post Office, or CSC Centre.',
    whereBn: 'নিকটস্থ আধার সেবা কেন্দ্র, ডাকঘর বা তথ্যমিত্র কেন্দ্র।',
    whereHi: 'निकटतम आधार सेवा केंद्र, डाकघर या सीएससी केंद्र।',
    svgType: 'aadhaar',
  },
  {
    id: 'pan',
    nameEn: 'PAN Card',
    nameBn: 'প্যান কার্ড',
    nameHi: 'पैन कार्ड',
    tagEn: 'Tax & Financial Identity',
    tagBn: 'আয়কর ও ব্যাঙ্কিং পরিচয়',
    tagHi: 'टैक्स और बैंकिंग पहचान',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    checkTipEn: 'Your name spelling and date of birth must match your Aadhaar exactly.',
    checkTipBn: 'প্যান কার্ডের নাম এবং জন্মতারিখ আধার কার্ডের সাথে হুবহু মিলতে হবে।',
    checkTipHi: 'नाम की स्पेलिंग और जन्मतिथि आधार कार्ड से बिल्कुल मिलनी चाहिए।',
    whereEn: 'Apply online at NSDL/UTIITSL or at any local Cyber Cafe (₹107 fee).',
    whereBn: 'NSDL পোর্টালে বা স্থানীয় সাইবার ক্যাফেতে (ফি ₹১০৭)।',
    whereHi: 'एनएसडीएल पोर्टल या स्थानीय साइबर कैफे से (शुल्क ₹107)।',
    svgType: 'pan',
  },
  {
    id: 'bank',
    nameEn: 'Bank Passbook (6-Month)',
    nameBn: 'ব্যাঙ্ক পাসবই (৬ মাসের হিসাব)',
    nameHi: 'बैंक पासबुक (6 महीने का विवरण)',
    tagEn: 'Proof of Bank Account',
    tagBn: 'সক্রিয় ব্যাঙ্ক অ্যাকাউন্টের প্রমাণ',
    tagHi: 'सक्रिय बैंक खाते का प्रमाण',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    checkTipEn: 'Front page must clearly show your photo, IFSC code, Account No, and official Bank Branch seal.',
    checkTipBn: 'প্রথম পাতায় আপনার ছবি, IFSC কোড, অ্যাকাউন্ট নম্বর ও ব্যাঙ্কের সিল থাকা জরুরি।',
    checkTipHi: 'पहले पन्ने पर आपकी फोटो, IFSC कोड, खाता नंबर और बैंक की मोहर साफ होनी चाहिए।',
    whereEn: 'Your local commercial or Gramin Bank branch.',
    whereBn: 'আপনার স্থানীয় রাষ্ট্রায়ত্ত বা গ্রামীণ ব্যাঙ্ক শাখা।',
    whereHi: 'आपकी स्थानीय बैंक या ग्रामीण बैंक शाखा।',
    svgType: 'passbook',
  },
  {
    id: 'udyam',
    nameEn: 'Udyam MSME Certificate',
    nameBn: 'উদ্যম এমএসএমই সার্টিফিকেট',
    nameHi: 'उद्यम एमएसएमई पंजीकरण प्रमाण पत्र',
    tagEn: 'Official Business Registration',
    tagBn: 'সরকারি ব্যবসা নিবন্ধন',
    tagHi: 'सरकारी व्यापार पंजीकरण',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    checkTipEn: '100% FREE government registration. Generated in 5 minutes using your Aadhaar.',
    checkTipBn: 'সম্পূর্ণ বিনামূল্যে সরকারি পোর্টালে ৫ মিনিটে আধার দিয়ে তৈরি হয়।',
    checkTipHi: '100% मुफ़्त सरकारी पंजीकरण। आधार से 5 मिनट में तैयार होता है।',
    whereEn: 'Official Portal: udyamregistration.gov.in (Zero fees / No middleman).',
    whereBn: 'সরকারি পোর্টাল: udyamregistration.gov.in (কোনও দালাল বা ফি লাগবে না)।',
    whereHi: 'सरकारी पोर्टल: udyamregistration.gov.in (कोई दलाल या फीस नहीं)।',
    actionType: 'link',
    actionUrl: 'https://udyamregistration.gov.in',
    actionLabelEn: 'Open Free Govt Udyam Portal',
    actionLabelBn: 'বিনামূল্যে উদ্যম পোর্টাল খুলুন',
    actionLabelHi: 'मुफ़्त उद्यम पोर्टल खोलें',
    svgType: 'udyam',
  },
  {
    id: 'quotation',
    nameEn: 'Machinery / Equipment Quotation',
    nameBn: 'যন্ত্রপাতি / মালপত্রের দরপত্র (Quotation)',
    nameHi: 'मशीनरी / उपकरण कोटेशन (मूल्य अनुमान)',
    tagEn: 'Proof of Project Asset Cost',
    tagBn: 'যন্ত্রপাতির খরচের প্রমাণ',
    tagHi: 'मशीन खर्च का पक्का प्रमाण',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    checkTipEn: 'Must have seller GST/Shop stamp, itemized machinery prices, and seller signature.',
    checkTipBn: 'দোকানদারের দোকানের নাম, GST/সিল, যন্ত্রপাতির দামের তালিকা এবং সই থাকতে হবে।',
    checkTipHi: 'दुकानदार का नाम, जीएसटी/मोहर, मशीन के दामों की सूची और हस्ताक्षर जरूरी हैं।',
    whereEn: 'Any registered machinery dealer or equipment shop in local town market.',
    whereBn: 'নিকটস্থ শহরের যেকোনো রেজিস্টার্ড যন্ত্রপাতি বা হার্ডওয়্যার দোকান।',
    whereHi: 'स्थानीय शहर के किसी भी उपकरण या मशीनरी विक्रेता से।',
    actionType: 'quotation_template',
    actionLabelEn: 'Get Blank Quotation Format for Shopkeeper',
    actionLabelBn: 'দোকানদারকে দিয়ে সই করানোর ফাঁকা ফর্ম প্রিন্ট করুন',
    actionLabelHi: 'दुकानदार से भरवाने का खाली फॉर्म प्रिंट करें',
    svgType: 'quotation',
  },
];

const ADDITIONAL_DOCS = [
  { id: 'caste', labelEn: 'Caste / Social Category Certificate (SC/ST/OBC/Minority) for extra subsidy', labelBn: 'অতিরিক্ত সরকারি সাবসিডির জন্য জাতিগত শংসাপত্র (SC/ST/OBC)', labelHi: 'अतिरिक्त सब्सिडी हेतु जाति प्रमाण पत्र (SC/ST/OBC)' },
  { id: 'land', labelEn: 'Land Ownership Parcha / Rent Agreement / Panchayat Trade NOC', labelBn: 'জমির পরচা / ভাড়ার চুক্তিপত্র / পঞ্চায়েত ট্রেড লাইসেন্স (NOC)', labelHi: 'जमीन का पर्चा / किरायानामा / पंचायत ट्रेड एनओसी' },
  { id: 'photos', labelEn: 'Passport Size Color Photographs (6 Copies)', labelBn: 'পাসপোর্ট সাইজ রঙিন ছবি (৬ কপি)', labelHi: 'पासपोर्ट साइज रंगीन फोटो (6 प्रतियां)' },
  { id: 'dpr_ready', labelEn: 'Detailed Project Report (DPR) - Automatically generated by ArthSetu', labelBn: 'ব্যাঙ্কেবল প্রজেক্ট রিপোর্ট (DPR) - ArthSetu থেকে সম্পূর্ণ তৈরি', labelHi: 'विस्तृत प्रोजेक्ट रिपोर्ट (DPR) - ArthSetu द्वारा स्वतः तैयार' },
  { id: 'education', labelEn: '8th / 10th Pass Educational Certificate (Mandatory for Mfg loans > ₹10 Lakh)', labelBn: 'অষ্টম বা মাধ্যমিক পাশের শিক্ষাগত শংসাপত্র (১০ লক্ষের বেশি ঋণের ক্ষেত্রে)', labelHi: '8वीं / 10वीं पास प्रमाण पत्र (₹10 लाख से अधिक निर्माण ऋण हेतु)' },
];

export function DocumentChecklist({ schemeName, businessCategory }: DocumentChecklistProps) {
  const { lang } = useTranslation();
  const STORAGE_KEY = 'ArthSetu_doc_checklist_v2';

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selectedSample, setSelectedSample] = useState<VisualDoc | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const allItems = [...VISUAL_DOCUMENTS.map((d) => d.id), ...ADDITIONAL_DOCS.map((d) => d.id)];
  const totalChecked = allItems.filter((id) => checked[id]).length;
  const progressPct = Math.round((totalChecked / allItems.length) * 100);

  const getDocName = (doc: VisualDoc) =>
    lang === 'BN' ? doc.nameBn : lang === 'HI' ? doc.nameHi : doc.nameEn;
  const getDocTag = (doc: VisualDoc) =>
    lang === 'BN' ? doc.tagBn : lang === 'HI' ? doc.tagHi : doc.tagEn;
  const getDocTip = (doc: VisualDoc) =>
    lang === 'BN' ? doc.checkTipBn : lang === 'HI' ? doc.checkTipHi : doc.checkTipEn;
  const getDocWhere = (doc: VisualDoc) =>
    lang === 'BN' ? doc.whereBn : lang === 'HI' ? doc.whereHi : doc.whereEn;
  const getActionLabel = (doc: VisualDoc) =>
    lang === 'BN' ? doc.actionLabelBn : lang === 'HI' ? doc.actionLabelHi : doc.actionLabelEn;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
            <FileText className="h-6 w-6 text-[#E65C00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {lang === 'BN'
                  ? 'লোন আবেদনের প্রয়োজনীয় নথিপত্র (ছবি সহ তালিকা)'
                  : lang === 'HI'
                    ? 'ऋण आवेदन के जरूरी दस्तावेज (फोटो सहित गाइड)'
                    : 'Funding Readiness & Visual Document Checklist'}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <Sparkles className="h-3 w-3" />
                {schemeName || 'PMEGP / MUDRA'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {lang === 'BN'
                ? 'ব্যাঙ্কে যাওয়ার আগে এই কাগজগুলি প্রস্তুত রাখুন যাতে লোন প্রত্যাখ্যান না হয়।'
                : lang === 'HI'
                  ? 'बैंक जाने से पहले ये कागजात तैयार रखें ताकि लोन आसानी से पास हो सके।'
                  : 'Prepare these documents before visiting your bank branch to guarantee smooth approval.'}
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex-shrink-0">
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {lang === 'BN' ? 'প্রস্তুত নথি' : lang === 'HI' ? 'तैयार दस्तावेज' : 'Ready'}
            </div>
            <div className="text-base font-bold text-slate-900">
              {totalChecked} / {allItems.length}
            </div>
          </div>
          <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background:
                  progressPct === 100
                    ? 'linear-gradient(90deg, #10b981, #059669)'
                    : 'linear-gradient(90deg, #E65C00, #FF8C42)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Success banner when 100% */}
      {progressPct === 100 && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-300 p-4 flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              {lang === 'BN'
                ? 'অভিনন্দন! আপনার সব প্রয়োজনীয় নথি সম্পূর্ণ প্রস্তুত!'
                : lang === 'HI'
                  ? 'बधाई हो! आपके सभी जरूरी दस्तावेज तैयार हैं!'
                  : 'Congratulations! All your essential loan documents are ready!'}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {lang === 'BN'
                ? 'আপনি এখন সরাসরি নিকটস্থ ব্যাঙ্ক শাখায় গিয়ে আবেদন পত্র জমা দিতে পারেন।'
                : lang === 'HI'
                  ? 'अब आप सीधे अपनी नजदीकी बैंक शाखा जाकर आवेदन जमा कर सकते हैं।'
                  : 'You can now confidently meet your bank branch manager with your ArthSetu DPR dossier.'}
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Core Visual Cards */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E65C00] text-xs font-bold text-white">
              1
            </span>
            <h3 className="text-base font-bold text-slate-800">
              {lang === 'BN'
                ? 'প্রধান ৫টি আবশ্যক নথি (নমুনা ছবি ও নির্দেশিকা)'
                : lang === 'HI'
                  ? 'मुख्य 5 अनिवार्य दस्तावेज (नमूना फोटो और गाइड)'
                  : '5 Core Essential Documents (With Visual Sample Previews)'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {lang === 'BN' ? 'নমুনা দেখতে কার্ডে ক্লিক করুন' : lang === 'HI' ? 'नमूना देखने के लिए क्लिक करें' : 'Click preview to inspect'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VISUAL_DOCUMENTS.map((doc) => {
            const isDone = checked[doc.id];
            return (
              <div
                key={doc.id}
                className={`relative flex flex-col justify-between rounded-xl border transition-all duration-200 ${
                  isDone
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-md'
                }`}
              >
                <div className="p-4">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${doc.badgeColor}`}>
                      {getDocTag(doc)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSample(doc)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#E65C00] transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {lang === 'BN' ? 'নমুনা ছবি' : lang === 'HI' ? 'नमूना देखें' : 'View Sample'}
                    </button>
                  </div>

                  {/* Document Name */}
                  <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center justify-between">
                    {getDocName(doc)}
                  </h4>

                  {/* SVG Thumbnail Preview Card */}
                  <div
                    onClick={() => setSelectedSample(doc)}
                    className="cursor-pointer my-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 transition-transform hover:scale-[1.02] flex items-center justify-center"
                  >
                    <DocumentSvgPreview type={doc.svgType} isMini />
                  </div>

                  {/* What to check / Key instruction */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <span className="font-bold text-amber-700 flex-shrink-0">
                        {lang === 'BN' ? 'কী দেখবেন:' : lang === 'HI' ? 'क्या जांचें:' : 'Rule:'}
                      </span>
                      <span>{getDocTip(doc)}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-500 text-[11px]">
                      <span className="font-medium text-slate-600 flex-shrink-0">
                        {lang === 'BN' ? 'কোথায় পাবেন:' : lang === 'HI' ? 'कहाँ मिलेगा:' : 'Source:'}
                      </span>
                      <span>{getDocWhere(doc)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/60 rounded-b-xl flex flex-col gap-2">
                  {doc.actionType === 'link' && doc.actionUrl && (
                    <a
                      href={doc.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {getActionLabel(doc)}
                    </a>
                  )}

                  {doc.actionType === 'quotation_template' && (
                    <button
                      type="button"
                      onClick={() => setShowQuotationModal(true)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E65C00] hover:bg-[#d05300] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      {getActionLabel(doc)}
                    </button>
                  )}

                  {/* Ready Checkbox Button */}
                  <button
                    type="button"
                    onClick={() => toggle(doc.id)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {lang === 'BN' ? 'কাগজ তৈরি আছে ✓' : lang === 'HI' ? 'कागज तैयार है ✓' : 'I Have This Ready ✓'}
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-slate-400" />
                        {lang === 'BN' ? 'আমার কাছে আছে (টিক দিন)' : lang === 'HI' ? 'मेरे पास है (टिक करें)' : 'Mark as Ready'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Additional Standard Documents */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
            2
          </span>
          <h3 className="text-base font-bold text-slate-800">
            {lang === 'BN'
              ? 'অন্যান্য প্রয়োজনীয় কাগজপত্র ও শংসাপত্র'
              : lang === 'HI'
                ? 'अन्य आवश्यक दस्तावेज और प्रमाण पत्र'
                : 'Other Supporting Certificates & Proofs'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {ADDITIONAL_DOCS.map((doc) => {
            const isDone = checked[doc.id];
            const label = lang === 'BN' ? doc.labelBn : lang === 'HI' ? doc.labelHi : doc.labelEn;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => toggle(doc.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                  isDone
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 pr-2">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
                  )}
                  <span className={isDone ? 'line-through opacity-75' : ''}>{label}</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 ${isDone ? 'bg-emerald-200/60 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {isDone ? (lang === 'BN' ? 'তৈরি' : lang === 'HI' ? 'तैयार' : 'Done') : (lang === 'BN' ? 'বাকি' : lang === 'HI' ? 'बाकी' : 'Pending')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: Enlarged Sample Preview Modal */}
      {selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setSelectedSample(null)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${selectedSample.badgeColor}`}>
                {getDocTag(selectedSample)}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              {getDocName(selectedSample)} - {lang === 'BN' ? 'নমুনা ও জরুরি নির্দেশিকা' : lang === 'HI' ? 'नमूना और महत्वपूर्ण निर्देश' : 'Official Sample Guide'}
            </h3>

            {/* High-Fidelity SVG Sample */}
            <div className="my-4 rounded-xl border border-slate-200 bg-slate-100/70 p-4 flex items-center justify-center">
              <DocumentSvgPreview type={selectedSample.svgType} isMini={false} />
            </div>

            {/* Key verification checklist points */}
            <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 text-xs text-amber-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <HelpCircle className="h-4 w-4 text-amber-700" />
                {lang === 'BN' ? 'ব্যাঙ্কে জমা দেওয়ার আগে অবশ্যই যা মেলাবেন:' : lang === 'HI' ? 'बैंक में जमा करने से पहले जरूर जांचें:' : 'Bank Verification Points:'}
              </p>
              <p>• {getDocTip(selectedSample)}</p>
              <p>• {lang === 'BN' ? 'আসল নথির পাশাপাশি ২ কপি স্বপ্রত্যয়িত (Self-attested) জেরক্স সাথে রাখুন।' : lang === 'HI' ? 'मूल दस्तावेज के साथ 2 सेल्फ-अटेस्टेड फोटोकॉपी साथ रखें।' : 'Carry original documents along with 2 self-attested photocopies.'}</p>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedSample(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {lang === 'BN' ? 'বন্ধ করুন' : lang === 'HI' ? 'बंद करें' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  toggle(selectedSample.id);
                  setSelectedSample(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="h-4 w-4" />
                {checked[selectedSample.id]
                  ? (lang === 'BN' ? 'তৈরি হিসেবে চিহ্নিত' : lang === 'HI' ? 'तैयार चिह्नित' : 'Marked Ready')
                  : (lang === 'BN' ? 'আমার কাছে আছে (চিহ্নিত করুন)' : lang === 'HI' ? 'मेरे पास है (चिह्नित करें)' : 'Mark as Ready')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Blank Quotation Format for Shopkeepers */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowQuotationModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Printer className="h-5 w-5 text-[#E65C00]" />
              <h3 className="text-lg font-bold text-slate-900">
                {lang === 'BN'
                  ? 'যন্ত্রপাতি বিক্রেতার জন্য প্রমিত দরপত্র ফরম্যাট (Quotation Template)'
                  : lang === 'HI'
                    ? 'दुकानदार / सप्लायर के लिए कोटेशन प्रारूप (Quotation Template)'
                    : 'Standard Machinery Vendor Quotation Form'}
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {lang === 'BN'
                ? 'এই ফরম্যাটটি প্রিন্ট করে যেকোনো যন্ত্রপাতি বা হার্ডওয়্যার দোকানদারকে দিয়ে তার দোকানের সিল ও সই করিয়ে ব্যাঙ্কে জমা দিন।'
                : lang === 'HI'
                  ? 'इस फॉर्म को प्रिंट करके किसी भी उपकरण या मशीनरी विक्रेता से दुकान की मोहर और हस्ताक्षर करवाकर बैंक में जमा करें।'
                  : 'Print this standardized 1-page form and have your equipment vendor fill, stamp, and sign it for loan submission.'}
            </p>

            {/* Printable Form Sheet Container */}
            <div id="quotation-print-area" className="rounded-xl border-2 border-dashed border-slate-300 p-6 bg-slate-50 text-slate-900 text-xs font-mono">
              <div className="text-center pb-4 border-b border-slate-300">
                <p className="text-sm font-bold tracking-wide uppercase">ESTIMATE / PROFORMA QUOTATION</p>
                <p className="text-[11px] text-slate-600">(For Bank Loan & Subsidy Application: PMEGP / MUDRA / PMFME)</p>
              </div>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div>
                  <p className="font-bold">VENDOR DETAILS (দোকানের বিবরণ):</p>
                  <p>Shop / Firm Name: ________________________________</p>
                  <p>GSTIN / Trade Lic: ______________________________</p>
                  <p>Address: _________________________________________</p>
                  <p>Mobile: __________________________________________</p>
                </div>
                <div>
                  <p className="font-bold">CUSTOMER DETAILS (ক্রেতার বিবরণ):</p>
                  <p>Entrepreneur Name: _____________________________</p>
                  <p>Enterprise: {businessCategory ? businessCategory.replace(/_/g, ' ') : 'Rural Enterprise'}</p>
                  <p>Village/Block: __________________________________</p>
                  <p>Date: _____ / _____ / 202___</p>
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-left my-4">
                <thead>
                  <tr className="bg-slate-200 text-slate-800">
                    <th className="border border-slate-300 p-1.5 w-10">Sl.</th>
                    <th className="border border-slate-300 p-1.5">Machinery / Asset Description</th>
                    <th className="border border-slate-300 p-1.5 w-16">Qty</th>
                    <th className="border border-slate-300 p-1.5 w-24">Rate (₹)</th>
                    <th className="border border-slate-300 p-1.5 w-28">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-300 p-1.5 text-center">1</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td></tr>
                  <tr><td className="border border-slate-300 p-1.5 text-center">2</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td></tr>
                  <tr><td className="border border-slate-300 p-1.5 text-center">3</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td><td className="border border-slate-300 p-1.5">&nbsp;</td></tr>
                  <tr>
                    <td colSpan={4} className="border border-slate-300 p-1.5 text-right font-bold">TOTAL ESTIMATED AMOUNT (₹):</td>
                    <td className="border border-slate-300 p-1.5 font-bold">&nbsp;</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-end mt-8 pt-6 border-t border-slate-300">
                <div>
                  <p className="text-[10px] text-slate-500">* All machinery prices are inclusive of taxes and delivery.</p>
                </div>
                <div className="text-center">
                  <div className="w-40 h-12 border-b border-dashed border-slate-400 mb-1"></div>
                  <p className="font-bold">Authorised Vendor Seal & Signature</p>
                </div>
              </div>
            </div>

            {/* Print trigger button */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowQuotationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {lang === 'BN' ? 'বন্ধ করুন' : lang === 'HI' ? 'बंद करें' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E65C00] text-white hover:bg-[#d05300] transition-colors flex items-center gap-2 shadow-md"
              >
                <Printer className="h-4 w-4" />
                {lang === 'BN' ? 'প্রিন্ট করুন (Print Quotation)' : lang === 'HI' ? 'प्रिंट करें (Print Quotation)' : 'Print Blank Format'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * High-fidelity Vector SVG previews of Indian official documents
 */
function DocumentSvgPreview({ type, isMini = true }: { type: string; isMini?: boolean }) {
  const w = isMini ? 'w-full max-w-[260px] h-[110px]' : 'w-full max-w-[380px] h-[190px]';

  if (type === 'aadhaar') {
    return (
      <div className={`${w} rounded-lg bg-gradient-to-br from-amber-50 via-white to-red-50 border border-slate-300 shadow-inner p-3 flex flex-col justify-between font-sans select-none`}>
        <div className="flex items-center justify-between border-b border-amber-300 pb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-[8px] text-white font-bold">🏛</div>
            <span className="text-[9px] font-bold text-slate-800 uppercase tracking-tighter">Govt. of India / भारत सरकार</span>
          </div>
          <span className="text-[8px] font-extrabold text-red-600">AADHAAR</span>
        </div>

        <div className="flex items-center gap-3 my-1">
          <div className="w-10 h-12 bg-slate-200 border border-slate-300 rounded flex flex-col items-center justify-center text-slate-400 text-[8px]">
            👤 Photo
          </div>
          <div className="flex-1 text-[9px] text-slate-700 leading-tight">
            <p className="font-bold text-slate-900">ENTREPRENEUR NAME</p>
            <p className="text-[8px] text-slate-500">DOB: 01/01/1990 | Male</p>
            <p className="font-mono font-bold text-slate-900 text-[10px] mt-1 tracking-wider">XXXX XXXX 1234</p>
          </div>
          <div className="w-8 h-8 bg-slate-900 rounded p-0.5 flex items-center justify-center text-white text-[7px]">
            <QrCode className="w-full h-full text-white" />
          </div>
        </div>

        <div className="text-[7px] text-center text-slate-500 border-t border-amber-200 pt-0.5">
          আমার আধার, আমার পরিচয় • Mera Aadhaar, Meri Pehchan
        </div>
      </div>
    );
  }

  if (type === 'pan') {
    return (
      <div className={`${w} rounded-lg bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 border border-blue-300 shadow-inner p-3 flex flex-col justify-between font-sans select-none`}>
        <div className="flex items-center justify-between border-b border-blue-300 pb-1">
          <span className="text-[8px] font-bold text-blue-900 uppercase">INCOME TAX DEPARTMENT / आयकर विभाग</span>
          <span className="text-[7px] font-bold bg-blue-900 text-white px-1 rounded">GOVT OF INDIA</span>
        </div>

        <div className="flex items-center gap-3 my-1">
          <div className="w-10 h-12 bg-slate-200 border border-slate-300 rounded flex flex-col items-center justify-center text-slate-400 text-[8px]">
            👤 Photo
          </div>
          <div className="flex-1 text-[9px] text-slate-800 leading-tight">
            <p className="font-bold text-blue-950">APPLICANT FULL NAME</p>
            <p className="text-[8px] text-slate-500">Father: GUARDIAN NAME</p>
            <p className="font-mono font-extrabold text-blue-900 text-[11px] mt-1 tracking-widest">ABCDE 1234 F</p>
          </div>
          <div className="w-8 h-6 bg-slate-200 border border-dashed border-slate-400 rounded flex items-center justify-center text-[7px] text-slate-500 italic">
            ✍️ Sign
          </div>
        </div>

        <div className="text-[7px] text-right text-blue-800 font-semibold">
          Permanent Account Number Card (PAN)
        </div>
      </div>
    );
  }

  if (type === 'passbook') {
    return (
      <div className={`${w} rounded-lg bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-300 shadow-inner p-3 flex flex-col justify-between font-sans select-none`}>
        <div className="flex items-center justify-between border-b border-emerald-300 pb-1">
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[9px] font-bold text-emerald-900 uppercase">STATE / GRAMIN BANK PASSBOOK</span>
          </div>
          <span className="text-[7px] bg-emerald-800 text-white px-1 rounded font-bold">SAVINGS A/C</span>
        </div>

        <div className="text-[9px] text-slate-700 my-1 space-y-0.5 leading-tight">
          <div className="flex justify-between"><span className="text-slate-500">A/C Name:</span> <span className="font-bold text-slate-900">YOUR FULL NAME</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Account No:</span> <span className="font-mono font-bold text-slate-900">392019482019</span></div>
          <div className="flex justify-between"><span className="text-slate-500">IFSC Code:</span> <span className="font-mono font-bold text-emerald-800">SBIN0001234</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Branch:</span> <span>Local Village Branch (Seal Verified)</span></div>
        </div>

        <div className="flex items-center justify-between text-[7px] text-emerald-800 border-t border-emerald-200 pt-0.5">
          <span>✓ 6 Months Clean Statement</span>
          <span className="font-bold text-emerald-900">[ OFFICIAL BANK SEAL ]</span>
        </div>
      </div>
    );
  }

  if (type === 'udyam') {
    return (
      <div className={`${w} rounded-lg bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 border border-purple-300 shadow-inner p-3 flex flex-col justify-between font-sans select-none`}>
        <div className="flex items-center justify-between border-b border-purple-300 pb-1">
          <span className="text-[8px] font-bold text-purple-900 uppercase tracking-tighter">MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES</span>
          <span className="text-[7px] bg-purple-900 text-white px-1 rounded font-bold">UDYAM</span>
        </div>

        <div className="my-1 text-[9px] text-slate-800 leading-tight">
          <p className="text-[7px] text-purple-700 font-bold uppercase">UDYAM REGISTRATION CERTIFICATE</p>
          <p className="font-mono font-bold text-purple-950 text-[10px] mt-0.5">UDYAM-WB-00-1234567</p>
          <p className="text-[8px] text-slate-600 mt-0.5">Enterprise: Micro Enterprise (Manufacturing/Services)</p>
        </div>

        <div className="flex items-center justify-between text-[7px] text-slate-500 border-t border-purple-200 pt-0.5">
          <span>Zero Fee Govt Portal (udyamregistration.gov.in)</span>
          <span className="font-bold text-purple-900">[ QR Code Verified ]</span>
        </div>
      </div>
    );
  }

  // quotation default
  return (
    <div className={`${w} rounded-lg bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-300 shadow-inner p-3 flex flex-col justify-between font-sans select-none`}>
      <div className="flex items-center justify-between border-b border-orange-300 pb-1">
        <span className="text-[8px] font-bold text-orange-950 uppercase">MACHINERY DEALER ESTIMATE / QUOTATION</span>
        <span className="text-[7px] bg-orange-700 text-white px-1 rounded font-bold">GST BILL</span>
      </div>

      <div className="my-1 text-[8px] text-slate-700 leading-tight space-y-0.5">
        <div className="flex justify-between"><span className="font-bold text-slate-900">1. Main Commercial Machinery</span> <span className="font-bold text-slate-900">₹ 1,80,000</span></div>
        <div className="flex justify-between"><span>2. Accessories & Tooling Set</span> <span>₹ 35,000</span></div>
        <div className="flex justify-between border-t border-slate-200 pt-0.5 font-bold text-orange-950"><span>TOTAL QUOTED VALUE:</span> <span>₹ 2,15,000</span></div>
      </div>

      <div className="flex items-center justify-between text-[7px] text-orange-900 border-t border-orange-200 pt-0.5">
        <span>GST No: 19AAAAA0000A1Z5</span>
        <span className="font-bold text-orange-800">[ Shop Seal & Sign ]</span>
      </div>
    </div>
  );
}
