import { Lang } from './translations';

/**
 * Maps decision codes to localized labels
 */
export function translateDecision(decision: string, lang: Lang): { label: string; bg: string; text: string; border: string } {
  const d = (decision || '').toUpperCase();
  if (d === 'PROCEED' || d === 'YES') {
    return {
      label: lang === 'HI' ? 'आगे बढ़ें (अनुशंसित)' : lang === 'BN' ? 'চালিয়ে যান (সুপারিশকৃত)' : 'PROCEED (RECOMMENDED)',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
    };
  }
  if (d === 'PROCEED_WITH_MODIFICATIONS' || d === 'CAUTION') {
    return {
      label: lang === 'HI' ? 'संशोधन के साथ आगे बढ़ें' : lang === 'BN' ? 'পরিবর্তন সহ এগিয়ে যান' : 'PROCEED WITH MODIFICATIONS',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
    };
  }
  if (d === 'MODIFY' || d === 'REVIEW') {
    return {
      label: lang === 'HI' ? 'मॉडल में बदलाव करें' : lang === 'BN' ? 'মডেল সংশোধন করুন' : 'MODIFY MODEL',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
    };
  }
  return {
    label: lang === 'HI' ? 'उच्च जोखिम (पुनर्विचार करें)' : lang === 'BN' ? 'উচ্চ ঝুঁকি (পুনর্বিবেচনা করুন)' : 'HIGH RISK (RECONSIDER)',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/30',
  };
}

/**
 * Maps grade ratings to localized text
 */
export function translateGrade(grade: string, lang: Lang): string {
  const g = (grade || '').toUpperCase();
  if (g === 'EXCELLENT') return lang === 'HI' ? 'उत्कृष्ट (80-100)' : lang === 'BN' ? 'চমৎকার (৮০-১০০)' : 'EXCELLENT (80-100)';
  if (g === 'GOOD') return lang === 'HI' ? 'अच्छा (65-79)' : lang === 'BN' ? 'ভালো (৬৫-৭৯)' : 'GOOD (65-79)';
  if (g === 'MODERATE' || g === 'FAIR') return lang === 'HI' ? 'संतोषजनक (50-64)' : lang === 'BN' ? 'মোটামুটি (৫০-৬৪)' : 'MODERATE (50-64)';
  return lang === 'HI' ? 'जोखिमपूर्ण (< 50)' : lang === 'BN' ? 'ঝুঁকিপূর্ণ (< ৫০)' : 'HIGH RISK (< 50)';
}

/**
 * Maps risk severity levels
 */
export function translateRiskLevel(level: string, lang: Lang): string {
  const l = (level || '').toLowerCase();
  if (l.includes('high') || l === 'उच्च' || l === 'উচ্চ') return lang === 'HI' ? 'उच्च' : lang === 'BN' ? 'উচ্চ' : 'HIGH';
  if (l.includes('med') || l === 'मध्यम' || l === 'মাঝারি') return lang === 'HI' ? 'मध्यम' : lang === 'BN' ? 'মাঝারি' : 'MEDIUM';
  return lang === 'HI' ? 'कम' : lang === 'BN' ? 'নিম্ন' : 'LOW';
}

/**
 * Maps equipment categories
 */
export function translateEquipmentCategory(cat: string, lang: Lang): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('machin') || c.includes('मशीन') || c.includes('যন্ত্র')) {
    return lang === 'HI' ? 'मुख्य मशीनरी' : lang === 'BN' ? 'প্রধান যন্ত্রপাতি' : 'Heavy Machinery';
  }
  if (c.includes('instru') || c.includes('उपकरण') || c.includes('সরঞ্জাম')) {
    return lang === 'HI' ? 'उपकरण एवं उपकरण' : lang === 'BN' ? 'সরঞ্জাম ও মিটার' : 'Instruments & Tools';
  }
  if (c.includes('util') || c.includes('पावर') || c.includes('বিদ্যুৎ')) {
    return lang === 'HI' ? 'बिजली व जनरेटर' : lang === 'BN' ? 'বিদ্যুৎ ও ব্যাকআপ' : 'Power & Utilities';
  }
  return lang === 'HI' ? 'सामान्य उपकरण' : lang === 'BN' ? 'সাধারণ সরঞ্জাম' : 'General Equipment';
}

/**
 * Formats numbers into localized digit representations (English, Hindi Devanagari, Bengali)
 */
export function formatLocalizedNumber(num: number | string, lang: Lang): string {
  const val = typeof num === 'number' ? num : parseFloat(num);
  if (isNaN(val)) return String(num);

  const formattedEn = val.toLocaleString('en-IN');
  if (lang === 'EN') return formattedEn;

  const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const hiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

  const targetDigits = lang === 'HI' ? hiDigits : bnDigits;

  return formattedEn.split('').map((char) => {
    const idx = enDigits.indexOf(char);
    return idx !== -1 ? targetDigits[idx] : char;
  }).join('');
}

/**
 * Maps business categories to localized names
 */
export function translateCategory(cat: string, lang: Lang): string {
  const c = (cat || '').toUpperCase().replace(/[\s&]+/g, '_');
  if (c.includes('TEXTILE') || c.includes('TAILOR')) return lang === 'BN' ? 'বস্ত্র ও সেলাই' : lang === 'HI' ? 'वस्त्र और सिलाई' : 'Textiles & Tailoring';
  if (c.includes('DAIRY')) return lang === 'BN' ? 'দুগ্ধ খামার' : lang === 'HI' ? 'डेयरी फार्मिंग' : 'Dairy';
  if (c.includes('FOOD')) return lang === 'BN' ? 'খাদ্য প্রক্রিয়াকরণ' : lang === 'HI' ? 'खाद्य प्रसंस्करण' : 'Food Processing';
  if (c.includes('RETAIL') || c.includes('GROCERY') || c.includes('STORE')) return lang === 'BN' ? 'খুচরা দোকান' : lang === 'HI' ? 'खुदरा दुकान' : 'Retail';
  if (c.includes('POULTRY')) return lang === 'BN' ? 'হাঁস-মুরগি পালন' : lang === 'HI' ? 'मुर्गी पालन' : 'Poultry';
  if (c.includes('AGRI')) return lang === 'BN' ? 'কৃষি' : lang === 'HI' ? 'কৃষি' : 'Agriculture';
  if (c.includes('LIVESTOCK') || c.includes('GOAT') || c.includes('CATTLE')) return lang === 'BN' ? 'পশুসম্পদ' : lang === 'HI' ? 'पशुधन' : 'Livestock';
  if (c.includes('TRANSPORT')) return lang === 'BN' ? 'পরিবহন' : lang === 'HI' ? 'परिवहन' : 'Transport';
  if (c.includes('CRAFT') || c.includes('HANDI')) return lang === 'BN' ? 'হস্তশিল্প' : lang === 'HI' ? 'हस्तशिल्प' : 'Handicraft';
  if (c.includes('SERVICE')) return lang === 'BN' ? 'সেবামূলক ব্যবসা' : lang === 'HI' ? 'सेवाएं' : 'Services';
  return lang === 'BN' ? 'ব্যবসা' : lang === 'HI' ? 'व्यवसाय' : 'Business';
}

/**
 * Maps district names to localized forms
 */
export function translateDistrict(district: string, lang: Lang): string {
  const d = (district || '').trim().toLowerCase();
  if (d.includes('nadia')) return lang === 'BN' ? 'নদিয়া' : lang === 'HI' ? 'नदिया' : 'Nadia';
  if (d.includes('bankura')) return lang === 'BN' ? 'বাঁকুড়া' : lang === 'HI' ? 'बांकुड़ा' : 'Bankura';
  if (d.includes('murshidabad')) return lang === 'BN' ? 'মুর্শিদাবাদ' : lang === 'HI' ? 'मुर्शिदाबाद' : 'Murshidabad';
  if (d.includes('hooghly')) return lang === 'BN' ? 'হুগলি' : lang === 'HI' ? 'हुगली' : 'Hooghly';
  if (d.includes('24 parganas') || d.includes('24-parganas') || d.includes('parganas')) return lang === 'BN' ? '২৪ পরগনা' : lang === 'HI' ? '२४ परगना' : '24 Parganas';
  if (d.includes('birbhum')) return lang === 'BN' ? 'বীরভূম' : lang === 'HI' ? 'बीरभूम' : 'Birbhum';
  if (d.includes('bardhaman') || d.includes('burdwan')) return lang === 'BN' ? 'বর্ধমান' : lang === 'HI' ? 'बर्धमान' : 'Burdwan';
  if (d.includes('malda')) return lang === 'BN' ? 'মালদা' : lang === 'HI' ? 'मालदा' : 'Malda';
  if (d.includes('purulia')) return lang === 'BN' ? 'পুরুলিয়া' : lang === 'HI' ? 'पुरुलिया' : 'Purulia';
  if (d.includes('howrah')) return lang === 'BN' ? 'হাওড়া' : lang === 'HI' ? 'हावड़ा' : 'Howrah';
  if (d.includes('kolkata')) return lang === 'BN' ? 'কলকাতা' : lang === 'HI' ? 'कोलकाता' : 'Kolkata';
  return district || (lang === 'BN' ? 'আপনার এলাকা' : lang === 'HI' ? 'आपका इलाका' : 'Your area');
}

/**
 * Maps scheme names to localized forms
 */
export function translateScheme(scheme: string, lang: Lang): string {
  const s = (scheme || '').toUpperCase();
  if (s.includes('PMEGP')) {
    return lang === 'BN' ? 'প্রধানমন্ত্রী কর্মসংস্থান সৃষ্টি কর্মসূচি (PMEGP)' : lang === 'HI' ? 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)' : "Prime Minister's Employment Generation Programme (PMEGP)";
  }
  if (s.includes('MUDRA')) {
    return lang === 'BN' ? 'প্রধানমন্ত্রী মুদ্রা যোজনা (MUDRA)' : lang === 'HI' ? 'प्रधानमंत्री मुद्रा योजना (MUDRA)' : 'Pradhan Mantri MUDRA Yojana';
  }
  if (s.includes('STAND-UP') || s.includes('STANDUP')) {
    return lang === 'BN' ? 'স্ট্যান্ড-আপ ইন্ডিয়া (Stand-Up India)' : lang === 'HI' ? 'स्टैंड-अप इंडिया (Stand-Up India)' : 'Stand-Up India Scheme';
  }
  if (s.includes('SVANIDHI')) {
    return lang === 'BN' ? 'পিএম স্বনিধি (PM SVANidhi)' : lang === 'HI' ? 'पीएम स्वनिधि (PM SVANidhi)' : 'PM SVANidhi';
  }
  if (s.includes('PMFME')) {
    return lang === 'BN' ? 'পিএমএফএমই (PMFME) খাদ্য স্কিম' : lang === 'HI' ? 'पीएमएफएमई (PMFME) खाद्य योजना' : 'PMFME Scheme';
  }
  return scheme || (lang === 'BN' ? 'সরকারি লোন' : lang === 'HI' ? 'सरकारी ऋण' : 'Government Loan');
}

/**
 * Checks if a string contains Bengali Unicode characters
 */
export function hasBengaliChars(str: string = ''): boolean {
  return /[\u0980-\u09FF]/.test(str);
}

/**
 * Checks if a string contains Hindi/Devanagari Unicode characters
 */
export function hasHindiChars(str: string = ''): boolean {
  return /[\u0900-\u097F]/.test(str);
}

/**
 * Localizes business idea / title
 */
export function getLocalizedBusinessIdea(idea?: string, category?: string, lang: Lang = 'EN'): string {
  if (!idea && !category) return lang === 'BN' ? 'ব্যবসা' : lang === 'HI' ? 'व्यवसाय' : 'Business';
  if (lang === 'BN' && hasBengaliChars(idea)) return idea!;
  if (lang === 'HI' && hasHindiChars(idea)) return idea!;
  if (lang === 'EN') return idea || category || 'Business';

  const normIdea = (idea || '').trim().toLowerCase().replace(/_/g, ' ');
  const normCat = (category || '').trim().toLowerCase().replace(/_/g, ' ');

  if (!idea || normIdea === normCat || normIdea.includes(normCat) || normCat.includes(normIdea)) {
    return translateCategory(category || idea || '', lang);
  }

  const catTrans = translateCategory(idea, lang);
  if (catTrans !== 'ব্যবসা' && catTrans !== 'व्यवसाय') {
    return catTrans;
  }

  return idea;
}

/**
 * Dynamically resolves and translates the AI summary into the active UI language.
 * Ensures that when a user switches to Bengali or Hindi, the executive summary is
 * immediately presented in their native language rather than raw English.
 */
export function getLocalizedAiSummary(
  report: {
    district?: string;
    businessCategory?: string;
    businessIdea?: string;
    aiRecommendation?: { summary?: string };
    financialPlan?: {
      matchedSchemeName?: string;
      emi?: { emi?: number };
      cashflow?: { averageMonthlyCashflow?: number };
    };
  },
  lang: Lang
): string {
  const rawSummary = report.aiRecommendation?.summary || '';

  // If already in target language, return directly
  if (lang === 'BN' && hasBengaliChars(rawSummary)) return rawSummary;
  if (lang === 'HI' && hasHindiChars(rawSummary)) return rawSummary;
  if (lang === 'EN' && !hasBengaliChars(rawSummary) && !hasHindiChars(rawSummary) && rawSummary.length > 0) {
    return rawSummary;
  }

  // Derive localized data points
  const districtName = translateDistrict(report.district || 'Nadia', lang);
  const catName = translateCategory(report.businessCategory || report.businessIdea || 'OTHER', lang);
  const schemeName = translateScheme(report.financialPlan?.matchedSchemeName || 'PMEGP', lang);
  const emiVal = Math.round(report.financialPlan?.emi?.emi || 0);
  const emiFormatted = formatLocalizedNumber(emiVal, lang);
  const profitVal = Math.round(report.financialPlan?.cashflow?.averageMonthlyCashflow || 0);
  const profitFormatted = formatLocalizedNumber(profitVal, lang);

  if (lang === 'BN') {
    return `${districtName} জেলায় ${catName} ব্যবসার সম্ভাবনা অত্যন্ত প্রবল: স্থানীয় বাজারে ভালো চাহিদা, ব্যবসায়িক সুযোগ এবং আশেপাশের গ্রামগুলি আপনার প্রধান গ্রাহক। ${schemeName} স্কিমটি অত্যন্ত মানানসই এবং মাসিক ইএমআই (₹${emiFormatted}) অনুমিত নিট মাসিক লাভ (₹${profitFormatted}) দিয়ে সহজেই পরিশোধযোগ্য। প্রধান ঝুঁকি প্রতিযোগিতা — যা পণ্য বৈচিত্র্য ও সরাসরি ক্রেতা যোগাযোগের মাধ্যমে সমাধান করা সম্ভব।`;
  }

  if (lang === 'HI') {
    return `${districtName} जिले में ${catName} व्यवसाय की स्थिति मजबूत है: स्थानीय मांग अधिक है, बाजार में नई संभावनाएं हैं और आसपास के गांव आपके मुख्य ग्राहक हैं। ${schemeName} योजना बेहद उपयुक्त है और मासिक ईएमआई (₹${emiFormatted}) अनुमानित शुद्ध मासिक लाभ (₹${profitFormatted}) से आसानी से कवर हो जाती है। मुख्य जोखिम प्रतिस्पर्धा है — जिसे उत्पाद विविधीकरण और सीधे ग्राहक संपर्क द्वारा नियंत्रित किया जा सकता है।`;
  }

  return rawSummary || `The ${catName} business in ${districtName} district shows strong fundamentals: high local catchment demand, an underserved market opportunity, and multiple nearby villages as target customers. The ${schemeName} scheme matches well and the monthly EMI of ₹${emiFormatted} is comfortably covered by projected monthly net cashflow of ₹${profitFormatted}. The primary risk is market competition — mitigated by product diversification and direct buyer outreach.`;
}

/**
 * Dynamically resolves localized next step
 */
export function getLocalizedNextStep(
  report: { aiRecommendation?: { recommendedNextStep?: string } },
  lang: Lang
): string {
  const rawNext = report.aiRecommendation?.recommendedNextStep || '';
  if (lang === 'BN' && hasBengaliChars(rawNext)) return rawNext;
  if (lang === 'HI' && hasHindiChars(rawNext)) return rawNext;
  if (lang === 'EN' && rawNext) return rawNext;

  if (lang === 'BN') {
    return 'সুপারিশকৃত ব্যবসায়িক মডেল পরীক্ষা করুন এবং স্থানীয় পঞ্চায়েত ও ব্যাংক শাখায় ঋণের আবেদন প্রস্তুত করুন।';
  }
  if (lang === 'HI') {
    return 'अनुशंसित व्यवसाय मॉडल की समीक्षा करें और स्थानीय पंचायत व बैंक शाखा में ऋण आवेदन तैयार करें।';
  }
  return rawNext || 'Review the recommended business model and prepare documentation for bank loan application.';
}
