import { BusinessCategory } from '@/types';
import { autoClassifyCategory } from './classifyCategory';

export interface ExtractedVoiceIntent {
  category: BusinessCategory | null;
  categoryName: { en: string; bn: string; hi: string } | null;
  capital: number | null;
  capitalFormatted: string | null;
  scale: string | null;
  hints: string[];
  isComplete: boolean;
}

const CATEGORY_DISPLAY: Record<BusinessCategory, { en: string; bn: string; hi: string }> = {
  DAIRY: { en: 'Dairy & Milk Production', bn: 'দুগ্ধ খামার (Dairy)', hi: 'डेयरी उत्पादन (Dairy)' },
  RETAIL: { en: 'Village Kirana & Grocery', bn: 'মুদি দোকান (Kirana)', hi: 'किराना दुकान (Kirana)' },
  TEXTILES_TAILORING: { en: 'Tailoring & Garments', bn: 'দর্জি ও সেলাই ইউনিট', hi: 'दर्जी व सिलाई यूनिट' },
  FOOD_PROCESSING: { en: 'Agro & Food Processing', bn: 'খাদ্য প্রক্রিয়াকরণ', hi: 'खाद्य प्रसंस्करण' },
  POULTRY: { en: 'Poultry & Broiler Farming', bn: 'পোল্ট্রি ও মুরগি পালন', hi: 'मुर्गी पालन (Poultry)' },
  AGRICULTURE: { en: 'Agriculture & Horticulture', bn: 'কৃষি ও ফসল চাষ', hi: 'कृषि व फसल' },
  LIVESTOCK: { en: 'Livestock & Goat Rearing', bn: 'ছাগল ও পশু পালন', hi: 'बकरी व पशु पालन' },
  TRANSPORT: { en: 'Rural Transport & Logistics', bn: 'টোটো / পরিবহন', hi: 'परिवहन व वाहन' },
  HANDICRAFT: { en: 'Rural Artisan & Handicraft', bn: 'হস্তশিল্প ও কুটির শিল্প', hi: 'हस्तशिल्प' },
  SERVICES: { en: 'Service & Repair Centre', bn: 'সার্ভিস ও মেরামত কেন্দ্র', hi: 'सेवा व रिपेयर केंद्र' },
  OTHER: { en: 'General Rural Enterprise', bn: 'গ্রামীণ ব্যবসা', hi: 'ग्रामीण व्यवसाय' },
};

/**
 * Extracts business category, capital amount, and operational scale from spoken text.
 * Works seamlessly across Bengali, Hindi, and English.
 */
export function extractVoiceIntent(rawText: string): ExtractedVoiceIntent {
  if (!rawText || rawText.trim().length < 2) {
    return { category: null, categoryName: null, capital: null, capitalFormatted: null, scale: null, hints: [], isComplete: false };
  }

  const text = rawText.toLowerCase();
  const hints: string[] = [];

  // 1. Category extraction
  const category = autoClassifyCategory(text);
  const categoryName = category ? CATEGORY_DISPLAY[category] || { en: category, bn: category, hi: category } : null;
  if (category) {
    hints.push(`Category: ${categoryName?.en}`);
  }

  // 2. Capital extraction (across English, Bengali, Hindi)
  let extractedCapital: number | null = null;

  // Pattern A: Common spoken phrases with thousands / lakhs
  if (/(50|fifty|পঞ্চাশ|पचास)\s*(?:হাজার|हजार|hazar|k|thousand)/i.test(text)) {
    extractedCapital = 50000;
  } else if (/(40|forty|চল্লিশ|चालीस)\s*(?:হাজার|हजार|hazar|k|thousand)/i.test(text)) {
    extractedCapital = 40000;
  } else if (/(30|thirty|ত্রিশ|तीस)\s*(?:হাজার|हजार|hazar|k|thousand)/i.test(text)) {
    extractedCapital = 30000;
  } else if (/(25|twenty\s*five|পঁচিশ|पच्चीस)\s*(?:হাজার|हजार|hazar|k|thousand)/i.test(text)) {
    extractedCapital = 25000;
  } else if (/(20|twenty|কুড়ি|बीस)\s*(?:হাজার|हजार|hazar|k|thousand)/i.test(text)) {
    extractedCapital = 20000;
  } else if (/(60|sixty|ষাট|साठ)\s*(?:হাজার|हजार|hazar|k|thousand)/i.test(text)) {
    extractedCapital = 60000;
  } else if (/(75|seventy\s*five|পঁচাত্তর|पचहत्तर)\s*(?:হাজার|हजार|hazar|k|thousand)/i.test(text)) {
    extractedCapital = 75000;
  } else if (/(1|one|एक|एक)\s*(?:লাখ|लाख|lakh|lac)/i.test(text)) {
    extractedCapital = 100000;
  } else if (/(2|two|দুই|दो)\s*(?:লাখ|लाख|lakh|lac)/i.test(text)) {
    extractedCapital = 200000;
  } else if (/(3|three|তিন|तीन)\s*(?:লাখ|लाख|lakh|lac)/i.test(text)) {
    extractedCapital = 300000;
  } else if (/(5|five|পাঁচ|पांच)\s*(?:লাখ|लाख|lakh|lac)/i.test(text)) {
    extractedCapital = 500000;
  } else {
    // Direct numbers e.g. 50000, 40,000, 15000, 50k
    const numMatch = text.match(/(?:rs\.?|inr|₹|টাকা|रुपये)?\s*(\d{1,3}(?:,\d{3})+|\d{4,7}|\d{1,3}\s*k)\b/i);
    if (numMatch) {
      const rawVal = numMatch[1].replace(/,/g, '').toLowerCase();
      if (rawVal.endsWith('k')) {
        const num = parseFloat(rawVal);
        extractedCapital = isNaN(num) ? null : Math.round(num * 1000);
      } else {
        const num = parseInt(rawVal, 10);
        if (!isNaN(num) && num >= 5000 && num <= 50000000) {
          extractedCapital = num;
        }
      }
    }
  }

  // 3. Operational Scale extraction
  let extractedScale: string | null = null;
  if (/(\d+|৩|3|4|5|2|4টি|৩টি)\s*(?:গরু|cow|cows|गाई|गाय|buffalo)/i.test(text)) {
    const m = text.match(/(\d+|৩|3|4|5|2)/i);
    extractedScale = m ? `${m[1]} Milch Cows (দুধেল গরু)` : '2–4 Milch Cows';
  } else if (/(\d+|৫০০|১০০০|500|1000)\s*(?:মুরগি|murgi|poultry|chicken|broiler|birds)/i.test(text)) {
    const m = text.match(/(\d+|৫০০|১০০০|500|1000)/i);
    extractedScale = m ? `${m[1]} Broiler Birds (পোল্ট্রি)` : '500–1000 Birds';
  } else if (/(\d+|১০|10|15|20)\s*(?:ছাগল|chhagol|goat|goats|बकरी)/i.test(text)) {
    const m = text.match(/(\d+|১০|10|15|20)/i);
    extractedScale = m ? `${m[1]} Goats (ছাগল পালন)` : '10–15 Goats';
  } else if (/দোকান|store|kirana|grocery|মুদি|दुकान|किराना/i.test(text)) {
    extractedScale = 'Village Provision Store (মুদি দোকান)';
  } else if (/tailor|stitching|দর্জি|সেলাই|সिलाई|blouse/i.test(text)) {
    extractedScale = 'Boutique Tailoring Unit (সেলাই ইউনিট)';
  }

  const capitalFormatted = extractedCapital
    ? `₹${extractedCapital.toLocaleString('en-IN')}`
    : null;

  return {
    category,
    categoryName,
    capital: extractedCapital,
    capitalFormatted,
    scale: extractedScale,
    hints,
    isComplete: Boolean(category || extractedCapital),
  };
}