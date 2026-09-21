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
