import type { BusinessCategory } from '@/types';

/**
 * Keyword-based auto classification for instant response, matching
 * English, Hindi, and Bengali business description terms.
 */
const CATEGORY_KEYWORDS: Record<BusinessCategory, string[]> = {
  RETAIL: [
    'stationary', 'stationery', 'shop', 'store', 'kirana', 'grocery', 'general store',
    'medical', 'pharmacy', 'book', 'paper', 'pen', 'retail', 'fmcg', 'wholesaler', 'mart',
    'দোকান', 'স্টেশনারি', 'মুদি', 'বই', 'কলম', 'খাতা', 'ফার্মেসি', 'মেডিকেল', 'খুচরো',
    'दुकान', 'स्टेशनरी', 'किराना', 'मेडिकल', 'किताब'
  ],
  DAIRY: [
    'dairy', 'milk', 'cow', 'buffalo', 'curd', 'ghee', 'paneer', 'butter', 'doodh', 'dahi',
    'ডেয়ারি', 'দুধ', 'গরু', 'দই', 'ঘি', 'ছানা', 'পনির',
    'डेयरी', 'दूध', 'गाय', 'दही', 'घी', 'पनीर'
  ],
  FOOD_PROCESSING: [
    'pickle', 'snack', 'flour', 'rice mill', 'chana', 'biscuit', 'food', 'spice', 'masala',
    'milling', 'bakery', 'sweets', 'namkeen', 'atta', 'oil expeller',
    'পাপড়', 'আচার', 'চানাচুর', 'মশলা', 'রাইস মিল', 'খাবার', 'আটা', 'তেল',
    'अचार', 'मसाला', 'आटा', 'चक्की', 'नमकीन'
  ],
  TEXTILES_TAILORING: [
    'tailor', 'stitching', 'cloth', 'saree', 'garment', 'embroidery', 'boutique', 'dress',
    'boutique', 'readymade',
    'দর্জি', 'কাপড়', 'শাড়ি', 'জামা', 'পোশাক', 'সেলাই', 'বুটিক',
    'दर्जी', 'कपड़ा', 'साड़ी', 'सिलाई', 'रेडीमेड'
  ],
  POULTRY: [
    'poultry', 'chicken', 'egg', 'murgi', 'broiler', 'layer', 'hatchery', 'farm',
    'পোল্ট্রি', 'মুরগি', 'ডিম', 'ফার্ম',
    'पोल्ट्री', 'मुर्गी', 'अंडा'
  ],
  AGRICULTURE: [
    'crop', 'farming', 'vegetable', 'flower', 'mushroom', 'sabji', 'kheti', 'agriculture', 'nursery', 'horticulture',
    'চাষ', 'কৃষি', 'সবজি', 'ফুল', 'মাশরুম', 'ধান', 'গম', 'আলু',
    'खेती', 'कृषि', 'सब्जी', 'मशरूम', 'फसल'
  ],
  LIVESTOCK: [
    'goat', 'sheep', 'animal', 'chhagol', 'pashu', 'livestock', 'cattle', 'pig',
    'ছাগল', 'ভেড়া', 'পশু', 'প্রাণী', 'ছাগল পালন',
    'बकरी', 'पशु', 'मवेशी', 'भेड़'
  ],
  TRANSPORT: [
    'rickshaw', 'auto', 'driver', 'mini truck', 'taxi', 'transport', 'logistics', 'cab', 'e-rickshaw', 'toto', 'tractor',
    'টোটো', 'রিকশা', 'গাড়ি', 'পরিবহন', 'ড্রাইভার', 'মিনি ট্রাক',
    'ई-रिक्शा', 'रिक्शा', 'ऑटो', 'टैक्सी', 'ट्रांसपोर्ट'
  ],
  HANDICRAFT: [
    'pottery', 'bamboo', 'handicraft', 'terracotta', 'weaving', 'shilpo', 'handloom', 'craft', 'jutework',
    'হস্তশিল্প', 'মৃৎশিল্প', 'বাঁশ', 'মাটি', 'তাঁত', 'কুটির শিল্প',
    'हस्तशिल्प', 'मिट्टी', 'बांस', 'हथकरघा'
  ],
  SERVICES: [
    'salon', 'repair', 'mobile', 'csc', 'photo', 'parlor', 'beauty', 'barber', 'recharge', 'cyber', 'studio',
    'সেলুন', 'মেকাপ', 'মোবাইল রিচার্জ', 'সার্ভিস', 'রিপেয়ার', 'ফটোকপি',
    'सैलून', 'रिपेयर', 'मोबाइल', 'ब्यूटी', 'फोटो'
  ],
  OTHER: [],
};

/**
 * Detects category code from free text description
 */
export function autoClassifyCategory(text: string): BusinessCategory | null {
  if (!text || text.trim().length < 2) return null;
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [BusinessCategory, string[]][]) {
    if (category === 'OTHER') continue;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return category;
      }
    }
  }

  return null;
}
