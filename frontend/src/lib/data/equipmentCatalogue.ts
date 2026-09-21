import { BusinessCategory, EquipmentItem } from '@/types';
import { Lang } from '../i18n/translations';

interface BaseEquipmentTemplate {
  id: string;
  names: Record<Lang, string>;
  category: EquipmentItem['category'];
  importance: EquipmentItem['importance'];
  baseCostRatio: number; // Ratio of total machinery budget (summing up to ~1.0)
  baseQuantity: number;
  unit: string;
  specifications: Record<Lang, string>;
  vendorTypes: Record<Lang, string>;
}

export const CATEGORY_EQUIPMENT_CATALOGUE: Record<BusinessCategory, BaseEquipmentTemplate[]> = {
  DAIRY: [
    {
      id: 'dairy-001',
      names: {
        EN: 'High-Yield Milch Cattle (Jersey / Crossbred HF / Murrah)',
        HI: 'उच्च दूध देने वाली गायें / भैंस (जर्सी / एचएफ / मुर्राह)',
        BN: 'উচ্চ ফলনশীল দুগ্ধজাত গাভী/মহিষ (জার্সি / এইচএফ / মুরাহ)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.65,
      baseQuantity: 2,
      unit: 'animals',
      specifications: {
        EN: '2nd/3rd lactation yielding 12–16 L/day with veterinary health, pregnancy & vaccination certificates',
        HI: 'द्वितीय/तृतीय ब्यात, 12-16 लीटर/दिन दूध क्षमता, पशु चिकित्सा स्वास्थ्य और टीकाकरण प्रमाण पत्र सहित',
        BN: '২য়/৩য় ল্যাকটেশন, প্রতিদিন ১২-১৬ লিটার দুধ উৎপাদনক্ষমতা, স্বাস্থ্য ও টিকাদান সার্টিফিকেট সহ',
      },
      vendorTypes: {
        EN: 'Registered Cattle Breeding Farm / State Livestock Development Board',
        HI: 'पंजीकृत पशु प्रजनन केंद्र / राज्य पशुधन विकास बोर्ड',
        BN: 'নিবন্ধিত গবাদি পশু প্রজনন খামার / রাজ্য প্রাণিসম্পদ উন্নয়ন বোর্ড',
      },
    },
    {
      id: 'dairy-002',
      names: {
        EN: 'Automatic Double-Bucket Milking Machine',
        HI: 'स्वचालित डबल-बकेट मिलकिंग मशीन',
        BN: 'স্বয়ংক্রিয় ডাবল-বাকেট মিল্কিং মেশিন',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.15,
      baseQuantity: 1,
      unit: 'unit',
      specifications: {
        EN: '1 HP single-phase vacuum pump motor, pulsator 60/40, food-grade silicone teat cups & SS buckets',
        HI: '1 एचपी सिंगल-फेज वैक्यूम पंप मोटर, 60/40 पल्सेटर, फूड-ग्रेड सिलिकॉन टीट कप और स्टेनलेस स्टील बकेट',
        BN: '১ এইচপি সিঙ্গল-ফেজ ভ্যাকুয়াম পাম্প মোটর, ৬০/৪০ পালসেটর, ফুড-গ্রেড সিলিকন টিট কাপ এবং এসএস বাকেট',
      },
      vendorTypes: {
        EN: 'Empanelled Agro-Machinery Distributor / KVIC Approved Vendor',
        HI: 'सूचीबद्ध कृषि-मशीनरी वितरक / केवीआईसी अनुमोदित विक्रेता',
        BN: 'তালিকাভুক্ত কৃষি-যন্ত্রপাতি পরিবেশক / কেভিআইসি অনুমোদিত বিক্রেতা',
      },
    },
    {
      id: 'dairy-003',
      names: {
        EN: 'Stainless Steel Milk Storage Cans (40L SS 304)',
        HI: 'स्टेनलेस स्टील दूध के कैन (40L SS 304)',
        BN: 'স্টেইনলেস স্টিল দুধের ক্যান (৪০ লিটার SS 304)',
      },
      category: 'INSTRUMENT',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.08,
      baseQuantity: 3,
      unit: 'cans (40L)',
      specifications: {
        EN: 'Food-grade SS 304 seamless spun body with airtight hermetic lid & heavy-duty handles',
        HI: 'फूड-ग्रेड SS 304 सीमलेस स्पन बॉडी, एयरटाइट ढक्कन और मजबूत हैंडल',
        BN: 'ফুড-গ্রেড SS 304 বিজোড় বডি, এয়ারটাইট ঢাকনা এবং মজবুত হ্যান্ডেল',
      },
      vendorTypes: {
        EN: 'Authorized Dairy Equipment Wholesaler / Local Market Hub',
        HI: 'अधिकृत डेयरी उपकरण थोक विक्रेता / स्थानीय व्यापार केंद्र',
        BN: 'অনুমোদিত ডেইরি সরঞ্জাম পাইকারি বিক্রেতা / স্থানীয় বাজার',
      },
    },
    {
      id: 'dairy-004',
      names: {
        EN: 'Motorized Fodder Chaff Cutter (3 HP)',
        HI: 'मोटराइज्ड चारा कुट्टी मशीन (3 HP)',
        BN: 'মোটরাইজড গোখাদ্য চাফ কাটার মেশিন (৩ এইচপি)',
      },
      category: 'MACHINERY',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.12,
      baseQuantity: 1,
      unit: 'machine',
      specifications: {
        EN: '3 HP electric motor, high-carbon steel blades with 600 kg/hr cutting capacity for green/dry fodder',
        HI: '3 एचपी इलेक्ट्रिक मोटर, उच्च कार्बन स्टील ब्लेड, 600 किग्रा/घंटा कटाई क्षमता (हरा/सूखा चारा)',
        BN: '৩ এইচপি মোটর, হাই-কার্বন স্টিল ব্লেড, ৬০০ কেজি/ঘণ্টা কাটার ক্ষমতা (কাঁচা ও শুকনো ঘাস)',
      },
      vendorTypes: {
        EN: 'Certified Agro-Machinery Manufacturer / Cooperative Society',
        HI: 'प्रमाणित कृषि-यंत्र निर्माता / सहकारी समिति',
        BN: 'প্রত্যয়িত কৃষি-যন্ত্র প্রস্তুতকারক / সমবায় সমিতি',
      },
    },
  ],

  FOOD_PROCESSING: [
    {
      id: 'food-001',
      names: {
        EN: 'Heavy-Duty Flour & Grain Pulverizer Mill (10 HP)',
        HI: 'हेवी-ड्यूटी आटा व अनाज पल्वराइज़र मिल (10 HP)',
        BN: 'হেভি-ডিউটি আটা ও শস্য পালভারাইজার মিল (১০ এইচপি)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.45,
      baseQuantity: 1,
      unit: 'mill unit',
      specifications: {
        EN: '10 HP 3-phase motor, alloy steel beaters, 80-100 kg/hr capacity for wheat, maize, gram, and spices',
        HI: '10 एचपी 3-फेज मोटर, मिश्र धातु बीटर, 80-100 किग्रा/घंटा क्षमता (गेहूं, मक्का, चना व मसाले)',
        BN: '১০ এইচপি ৩-ফেজ মোটর, অ্যালয় স্টিল বিটার, ৮০-১০০ কেজি/ঘণ্টা ক্ষমতা (গম, ভুট্টা, ছোলা ও মশলা)',
      },
      vendorTypes: {
        EN: 'NSIC Registered Food Machinery Manufacturer / Empanelled Vendor',
        HI: 'एनएसआईसी पंजीकृत खाद्य मशीनरी निर्माता / सूचीबद्ध विक्रेता',
        BN: 'এনএসআইসি নিবন্ধিত খাদ্য প্রক্রিয়াকরণ যন্ত্র প্রস্তুতকারক',
      },
    },
    {
      id: 'food-002',
      names: {
        EN: 'Cold-Press Mustard Oil Expeller (6-Bolt)',
        HI: 'कोल्ड-प्रेस सरसों तेल एक्सपेलर (6-बोल्ट)',
        BN: 'কোল্ড-প্রেস সরিষার তেল এক্সপেলার (৬-বোল্ট)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.35,
      baseQuantity: 1,
      unit: 'expeller unit',
      specifications: {
        EN: 'Heavy-duty 6-bolt chamber with oil collection filter press, 40-50 kg/hr seed crushing rate, high yield recovery',
        HI: 'हेवी-ड्यूटी 6-बोल्ट चैंबर, फिल्टर प्रेस सहित, 40-50 किग्रा/घंटा बीज पेराई दर, उच्च तेल निष्कर्षण',
        BN: 'হেভি-ডিউটি ৬-বোল্ট চেম্বার, ফিল্টার প্রেস সহ, ৪০-৫০ কেজি/ঘণ্টা বীজ ক্রাশিং ক্ষমতা',
      },
      vendorTypes: {
        EN: 'Authorized Agro-Processing Machinery Hub / KVIC Dealer',
        HI: 'अधिकृत कृषि प्रसंस्करण मशीनरी हब / केवीआईसी डीलर',
        BN: 'অনুমোদিত কৃষি প্রক্রিয়াকরণ যন্ত্রপাতি হাব / কেভিআইসি ডিলার',
      },
    },
    {
      id: 'food-003',
      names: {
        EN: 'Continuous Band Sealer with Nitrogen Gas Flushing',
        HI: 'सतत बैंड सीलर (नाइट्रोजन फ्लशिंग सहित)',
        BN: 'কন্টিনিউয়াস ব্যান্ড সিলার (নাইট্রোজেন ফ্লাশিং সহ)',
      },
      category: 'MACHINERY',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.12,
      baseQuantity: 1,
      unit: 'sealer',
      specifications: {
        EN: 'Horizontal conveyor pouch sealer, 0-12m/min speed, digital PID temperature controller for FSSAI packaging',
        HI: 'क्षैतिज कन्वेयर पाउच सीलर, 0-12 मी/मिनट गति, एफएसएसएआई पैकेजिंग के लिए डिजिटल तापमान नियंत्रक',
        BN: 'হরাইজন্টাল কনভেয়ার পাউচ সিলার, ০-১২ মি/মিনিট গতি, ডিজিটাল পিআইডি তাপমাত্রা নিয়ন্ত্রণ',
      },
      vendorTypes: {
        EN: 'Packaging Automation Distributor / Industrial Equipment Supplier',
        HI: 'पैकेजिंग ऑटोमेशन वितरक / औद्योगिक उपकरण आपूर्तिकर्ता',
        BN: 'প্যাকেজিং অটোমেশন পরিবেশক / শিল্প সরঞ্জাম সরবরাহকারী',
      },
    },
    {
      id: 'food-004',
      names: {
        EN: 'Stainless Steel Prep Tables & Digital Moisture Meter',
        HI: 'स्टेनलेस स्टील प्रेप टेबल और डिजिटल नमी मापक',
        BN: 'স্টেইনলেস স্টিল ওয়ার্ক টেবিল এবং ডিজিটাল আর্দ্রতা পরিমাপক',
      },
      category: 'INSTRUMENT',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.08,
      baseQuantity: 2,
      unit: 'sets',
      specifications: {
        EN: 'SS 304 food-grade surface prep tables (6x3 ft) + handheld microprocessor grain moisture detector (±0.5% accuracy)',
        HI: 'SS 304 फूड-ग्रेड प्रेप टेबल (6x3 फीट) + माइक्रोप्रोसेसर अनाज नमी मीटर (±0.5% सटीकता)',
        BN: 'SS 304 ফুড-গ্রেড টেবিল (৬x৩ ফুট) + হ্যান্ডহেল্ড শস্য আর্দ্রতা পরীক্ষক (±০.৫% নির্ভুলতা)',
      },
      vendorTypes: {
        EN: 'Laboratory & Food Testing Instruments Supplier',
        HI: 'प्रयोगशाला और खाद्य परीक्षण उपकरण आपूर्तिकर्ता',
        BN: 'ল্যাবরেটরি ও খাদ্য পরীক্ষা সরঞ্জাম সরবরাহকারী',
      },
    },
  ],

  TEXTILES_TAILORING: [
    {
      id: 'tex-001',
      names: {
        EN: 'Direct-Drive High-Speed Industrial Lockstitch Sewing Machine',
        HI: 'डायरेक्ट-ड्राइव हाई-स्पीड औद्योगिक सिलाई मशीन',
        BN: 'ডাইরেক্ট-ড্রাইভ হাই-স্পিড ইন্ডাস্ট্রিয়াল সেলাই মেশিন',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.40,
      baseQuantity: 3,
      unit: 'machines',
      specifications: {
        EN: 'Built-in servo direct-drive motor, automatic thread trimmer, 5000 SPM speed, energy saving (70% less power)',
        HI: 'अंतर्निहित सर्वो डायरेक्ट-ड्राइव मोटर, स्वचालित धागा कटर, 5000 एसपीएम गति, 70% बिजली बचत',
        BN: 'ইন-বিল্ট সার্ভো ডাইরেক্ট-ড্রাইভ মোটর, স্বয়ংক্রিয় সুতা কাটার ব্যবস্থা, ৫০০০ এসপিএম গতি',
      },
      vendorTypes: {
        EN: 'Authorized Industrial Apparel Machinery Dealer (Juki / Jack / Singer)',
        HI: 'अधिकृत औद्योगिक परिधान मशीनरी डीलर (जुकी / जैक / सिंगर)',
        BN: 'অনুমোদিত টেক্সটাইল মেশিনারি ডিলার (জুকি / জ্যাক / সিঙ্গার)',
      },
    },
    {
      id: 'tex-002',
      names: {
        EN: '5-Thread Heavy-Duty Industrial Overlock Stitching Machine',
        HI: '5-थ्रेड हेवी-ड्यूटी औद्योगिक ओवरलॉक मशीन',
        BN: '৫-থ্রেড হেভি-ডিউটি ইন্ডাস্ট্রিয়াল ওভারলক মেশিন',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.25,
      baseQuantity: 1,
      unit: 'machine',
      specifications: {
        EN: 'High-speed 5-thread safety stitch overedging machine with differential feed for hosiery and garment finishing',
        HI: 'उच्च गति 5-धागा सुरक्षा सिलाई ओवरएजिंग मशीन, होजरी और परिधान फिनिशिंग हेतु',
        BN: 'হাই-স্পিড ৫-সুতো ওভারলক ফিনিশিং মেশিন, হোসিয়ারি ও পোশাক প্রান্তিক ফিনিশিংয়ের জন্য',
      },
      vendorTypes: {
        EN: 'Garment Manufacturing Machinery Distributor',
        HI: 'गारमेंट मैन्युफैक्चरिंग मशीनरी वितरक',
        BN: 'পোশাক উৎপাদন সরঞ্জাম পরিবেশক',
      },
    },
    {
      id: 'tex-003',
      names: {
        EN: 'Industrial Vacuum Ironing Table with In-built Steam Boiler',
        HI: 'औद्योगिक वैक्यूम आयरनिंग टेबल (स्टीम बॉयलर सहित)',
        BN: 'ইন্ডাস্ট্রিয়াল ভ্যাকুয়াম ইস্ত্রি টেবিল (বাষ্প বয়লার সহ)',
      },
      category: 'MACHINERY',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.18,
      baseQuantity: 1,
      unit: 'unit',
      specifications: {
        EN: 'Thermostatically heated table surface, powerful suction motor, 5L continuous steam generator with Teflon iron shoe',
        HI: 'थर्मोस्टैटिक रूप से गर्म टेबल सतह, शक्तिशाली सक्शन मोटर, 5 लीटर स्टीम जनरेटर',
        BN: 'থার্মোস্ট্যাট নিয়ন্ত্রিত উত্তপ্ত টেবিল, শক্তিশালী সাকশন মোটর, ৫ লিটার স্টিম জেনারেটর',
      },
      vendorTypes: {
        EN: 'Commercial Laundry & Finishing Equipment Hub',
        HI: 'वाणिज्यिक लॉन्ड्री और फिनिशिंग उपकरण हब',
        BN: 'বাণিজ্যিক লন্ড্রি ও ফিনিশিং ইকুইপমেন্ট সরবরাহকারী',
      },
    },
    {
      id: 'tex-004',
      names: {
        EN: 'Heavy Fabric Layer Cutting Table & Rotary End-Cutter',
        HI: 'फैब्रिक कटिंग टेबल और रोटरी एंड-कटर',
        BN: 'কাপড় কাটার টেবিল ও রোটারি এন্ড-কাটার',
      },
      category: 'TOOL',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.17,
      baseQuantity: 1,
      unit: 'set',
      specifications: {
        EN: '8x4 ft laminate flat laying surface with auto-stop electric round-knife fabric cutting machine (100mm blade)',
        HI: '8x4 फीट लैमिनेट समतल टेबल, इलेक्ट्रिक राउंड-नाइफ फैब्रिक कटिंग मशीन (100 मिमी ब्लेड) सहित',
        BN: '৮x৪ ফুট সমতল কাটিং টেবিল, ইলেকট্রিক রাউন্ড-ছুরি কাপড় কাটার যন্ত্র সহ (১০০ মিমি ব্লেড)',
      },
      vendorTypes: {
        EN: 'Apparel Tooling & Workshop Furnishing Supplier',
        HI: 'परिधान टूलिंग और कार्यशाला उपकरण आपूर्तिकर्ता',
        BN: 'গার্মেন্টস সরঞ্জাম ও ওয়ার্কশপ ফার্নিশিং সরবরাহকারী',
      },
    },
  ],

  POULTRY: [
    {
      id: 'poul-001',
      names: {
        EN: 'Automated Climate-Controlled Brooder Set with IR Lamps',
        HI: 'स्वचालित ब्रूडर सेट (इन्फ्रारेड लैंप व तापमान नियंत्रक)',
        BN: 'স্বয়ংক্রিয় ব্রুডার সেট (ইনফ্রারেড ল্যাম্প ও তাপমাত্রা নিয়ন্ত্রক)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.35,
      baseQuantity: 2,
      unit: 'units',
      specifications: {
        EN: 'Microcontroller temperature sensor with infrared heating bulbs, suitable for 1,000 day-old chicks brooding',
        HI: 'माइक्रोकंट्रोलर तापमान सेंसर, इन्फ्रारेड हीटिंग बल्ब, 1,000 चूजों के ब्रूडिंग हेतु उपयुक्त',
        BN: 'মাইক্রোকন্ট্রোলার তাপমাত্রা সেন্সর, ইনফ্রারেড হিটিং বাল্ব, ১,০০০ ছানার ব্রুডিং উপযোগী',
      },
      vendorTypes: {
        EN: 'Certified Poultry Hatchery & Equipment Manufacturer',
        HI: 'प्रमाणित पोल्ट्री हैचरी एवं उपकरण निर्माता',
        BN: 'প্রত্যয়িত পোল্ট্রি হ্যাচারি ও সরঞ্জাম প্রস্তুতকারক',
      },
    },
    {
      id: 'poul-002',
      names: {
        EN: 'Automatic Bell Drinkers & Linear Suspension Feeders',
        HI: 'स्वचालित बेल ड्रिंकर और लीनियर सस्पेंशन फीडर',
        BN: 'স্বয়ংক্রিয় বেল ড্রিংকার ও সাসপেনশন ফিডার',
      },
      category: 'INSTRUMENT',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.30,
      baseQuantity: 25,
      unit: 'sets',
      specifications: {
        EN: 'Non-leakage polypropylene bell drinkers with water filter regulator + anti-wastage galvanized steel feeders',
        HI: 'लीक-प्रूफ पॉलीप्रोपाइलीन बेल ड्रिंकर (फिल्टर रेगुलेटर सहित) + गैल्वनाइज्ड स्टील फीडर',
        BN: 'লিক-প্রুফ বেল ড্রিংকার ফিল্টার সহ + অপচয়-রোধী গ্যালভানাইজড ফিডার',
      },
      vendorTypes: {
        EN: 'Empanelled Agro-Poultry Equipment Wholesaler',
        HI: 'सूचीबद्ध कृषि-पोल्ट्री उपकरण थोक विक्रेता',
        BN: 'তালিকাভুক্ত কৃষি-পোল্ট্রি সরঞ্জাম পাইকারি বিক্রেতা',
      },
    },
    {
      id: 'poul-003',
      names: {
        EN: 'High-Pressure Shed Disinfection Sprayer & Fogger',
        HI: 'हाई-प्रेशर शेड कीटाणुशोधन स्प्रेयर व फॉगर',
        BN: 'উচ্চ-চাপের শেড জীবাণুমুক্তকরণ স্প্রেয়ার ও ফগার',
      },
      category: 'MACHINERY',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.20,
      baseQuantity: 1,
      unit: 'sprayer',
      specifications: {
        EN: '2 HP electric motor pump, 30 bar pressure, brass nozzle lance for biosecurity and shed cooling in summer',
        HI: '2 एचपी मोटर पंप, 30 बार दबाव, पीतल नोजल, जैव सुरक्षा और गर्मियों में शेड को ठंडा रखने हेतु',
        BN: '২ এইচপি মোটর পাম্প, ৩০ বার চাপ, ব্রাস নোজল, জৈব সুরক্ষা ও শেড শীতলীকরণ',
      },
      vendorTypes: {
        EN: 'Veterinary Bio-Security Systems Distributor',
        HI: 'पशु चिकित्सा जैव-सुरक्षा प्रणाली वितरक',
        BN: 'পশু চিকিৎসা জৈব-সুরক্ষা সরঞ্জাম পরিবেশক',
      },
    },
    {
      id: 'poul-004',
      names: {
        EN: 'Egg Sorting / Grading Trays & Live Bird Crates',
        HI: 'अंडा ग्रेडिंग ट्रे और पक्षी परिवहन क्रेट',
        BN: 'ডিম বাছাইকরণ ট্রে এবং জীবন্ত পাখি পরিবহনের খাঁচা',
      },
      category: 'TOOL',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.15,
      baseQuantity: 30,
      unit: 'crates/trays',
      specifications: {
        EN: 'Heavy-duty HDPE stackable crates (holds 10-12 broilers) + food-grade plastic 30-egg trays (100 units)',
        HI: 'हेवी-ड्यूटी एचडीपीई क्रेट (10-12 ब्रॉयलर क्षमता) + 30-अंडे प्लास्टिक ट्रे (100 यूनिट)',
        BN: 'হেভি-ডিউটি প্লাস্টিক ক্রাফট (১০-১২টি ব্রয়লার ধারণক্ষমতা) + ৩০-ডিমের ফুড-গ্রেড প্লাস্টিক ট্রে',
      },
      vendorTypes: {
        EN: 'Industrial Plastics & Poultry Supplies Mart',
        HI: 'औद्योगिक प्लास्टिक एवं पोल्ट्री सामग्री आपूर्तिकर्ता',
        BN: 'শিল্প প্লাস্টিক ও পোল্ট্রি পণ্য সরবরাহকারী',
      },
    },
  ],

  RETAIL: [
    {
      id: 'ret-001',
      names: {
        EN: 'Commercial POS Touch Billing Terminal & Thermal Printer',
        HI: 'वाणिज्यिक पीओएस टच बिलिंग टर्मिनल व थर्मल प्रिंटर',
        BN: 'বাণিজ্যিক পিওএস টাচ বিলিং টার্মিনাল ও থার্মাল প্রিন্টার',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.35,
      baseQuantity: 1,
      unit: 'terminal set',
      specifications: {
        EN: '15.6" capacitive touch display, 80mm high-speed thermal receipt printer, barcode laser gun & GST billing software',
        HI: '15.6" टच डिस्प्ले, 80 मिमी थर्मल रसीद प्रिंटर, बारकोड लेजर स्कैनर और जीएसटी बिलिंग सॉफ्टवेयर',
        BN: '১৫.৬" টাচ ডিসপ্লে, ৮০ মিমি থার্মাল রসিদ প্রিন্টার, বারকোড স্ক্যানার এবং জিএসটি বিলিং সফটওয়্যার',
      },
      vendorTypes: {
        EN: 'Retail Technology & Automation Systems Dealer',
        HI: 'खुदरा प्रौद्योगिकी और ऑटोमेशन सिस्टम डीलर',
        BN: 'খুচরা প্রযুক্তি ও অটোমেশন সিস্টেম ডিলার',
      },
    },
    {
      id: 'ret-002',
      names: {
        EN: 'Digital Electronic Platform Scale (300kg / 50g)',
        HI: 'डिजिटल इलेक्ट्रॉनिक प्लेटफॉर्म स्केल (300 किग्रा / 50 ग्राम)',
        BN: 'ডিজিটাল ইলেকট্রনিক ওজন স্কেল (৩০০ কেজি / ৫০ গ্রাম)',
      },
      category: 'INSTRUMENT',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.15,
      baseQuantity: 1,
      unit: 'scale',
      specifications: {
        EN: 'Legal Metrology stamped digital platform scale, SS platter, dual LED display, rechargeable battery backup',
        HI: 'सरकारी विधिक मापविज्ञान प्रमाणित डिजिटल प्लेटफॉर्म स्केल, स्टेनलेस स्टील प्लेट, ड्यूल एलईडी डिस्प्ले',
        BN: 'সরকারি পরিমাপবিজ্ঞান স্ট্যাম্পযুক্ত ডিজিটাল স্কেল, স্টেইনলেস স্টিল প্লেট, রিচার্জেবল ব্যাটারি',
      },
      vendorTypes: {
        EN: 'Government Approved Weighing Scales Distributor',
        HI: 'सरकारी अनुमोदित वजन तोल उपकरण वितरक',
        BN: 'সরকারি অনুমোদিত ওজন পরিমাপক পরিবেশক',
      },
    },
    {
      id: 'ret-003',
      names: {
        EN: 'Heavy-Duty Powder-Coated Slotted Display Shelving Units',
        HI: 'हेवी-ड्यूटी पाउडर-कोटेड डिस्प्ले रैक',
        BN: 'হেভি-ডিউটি পাউডার-কোটেড ডিসপ্লে র্যাক',
      },
      category: 'INFRASTRUCTURE',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.25,
      baseQuantity: 6,
      unit: 'bays',
      specifications: {
        EN: '7x3 ft modular slotted angle steel display racks, 5 adjustable shelves per bay, 80 kg load capacity per shelf',
        HI: '7x3 फीट मॉड्यूलर स्टील डिस्प्ले रैक, प्रति बे 5 समायोज्य अलमारियां, प्रति शेल्फ 80 किग्रा क्षमता',
        BN: '৭x৩ ফুট মডুলার স্টিল ডিসপ্লে র্যাক, প্রতি র্যাকে ৫টি স্তর, স্তর প্রতি ৮০ কেজি ভারবহন ক্ষমতা',
      },
      vendorTypes: {
        EN: 'Commercial Shopfitting & Storage Racks Manufacturer',
        HI: 'वाणिज्यिक दुकान फिटिंग और स्टोरेज रैक निर्माता',
        BN: 'বাণিজ্যিক স্টোর ফিটিংস ও স্টোরেজ র্যাক প্রস্তুতকারক',
      },
    },
    {
      id: 'ret-004',
      names: {
        EN: 'Commercial Display Showcase Refrigerator (400L)',
        HI: 'वाणिज्यिक डिस्प्ले शोकेस रेफ्रिजरेटर (400L)',
        BN: 'বাণিজ্যিক ডিসপ্লে শোকেস রেফ্রিজারেটর (৪০০ লিটার)',
      },
      category: 'MACHINERY',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.25,
      baseQuantity: 1,
      unit: 'unit',
      specifications: {
        EN: 'Double-glazed glass door, tropicalized compressor suitable for 43°C ambient, LED internal illumination',
        HI: 'डबल-ग्लेज़्ड ग्लास डोर, 43°C परिवेश तापमान के लिए उपयुक्त कंप्रेसर, एलईडी आंतरिक प्रकाश व्यवस्था',
        BN: 'ডাবল-গ্লেজড কাচের দরজা, ট্রপিকালাইজড কম্প্রেসার, এলইডি অভ্যন্তরীণ আলোক ব্যবস্থা',
      },
      vendorTypes: {
        EN: 'Commercial Refrigeration Systems Dealer (Voltas / Blue Star)',
        HI: 'वाणिज्यिक प्रशीतन प्रणाली डीलर (वोल्टास / ब्लू स्टार)',
        BN: 'বাণিজ্যিক রেফ্রিজারেশন সিস্টেম ডিলার (ভোল্টাস / ব্লু স্টার)',
      },
    },
  ],

  HANDICRAFT: [
    {
      id: 'hand-001',
      names: {
        EN: 'Variable-Speed Motorized Potter / Ceramic Wheel (1 HP)',
        HI: 'परिवर्तनीय गति मोटराइज्ड कुम्हार चाक (1 HP)',
        BN: 'পরিবর্তনশীল গতির বৈদ্যুতিক কুমোরের চাকা (১ এইচপি)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.35,
      baseQuantity: 1,
      unit: 'wheel unit',
      specifications: {
        EN: '1 HP reversible DC motor with electronic pedal speed controller (0-300 RPM), 14" cast aluminum head',
        HI: '1 एचपी डीसी मोटर, इलेक्ट्रॉनिक पेडल स्पीड कंट्रोलर (0-300 आरपीएम), 14 इंच कास्ट एल्युमीनियम हेड',
        BN: '১ এইচপি ডিসি মোটর, ইলেকট্রনিক প্যাডেল স্পিড কন্ট্রোলার (০-৩০০ আরপিএম), ১৪ ইঞ্চি অ্যালুমিনিয়াম হেড',
      },
      vendorTypes: {
        EN: 'KVIC / State Handicrafts Development Corporation Emporium',
        HI: 'केवीआईसी / राज्य हस्तशिल्प विकास निगम एम्पोरियम',
        BN: 'কেভিআইসি / রাজ্য হস্তশিল্প উন্নয়ন নিগম এম্পোরিয়াম',
      },
    },
    {
      id: 'hand-002',
      names: {
        EN: 'Woodturning Lathe & High-Speed Chisels Set',
        HI: 'वुडटर्निंग लेथ मशीन और हाई-स्पीड छेनी सेट',
        BN: 'কাঠের লেদ মেশিন এবং হাই-স্পিড বাটালি সেট',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.35,
      baseQuantity: 1,
      unit: 'lathe set',
      specifications: {
        EN: 'Heavy cast iron bed, 40" distance between centers, 1.5 HP motor, 4-step pulley with 8-piece HSS turning chisel set',
        HI: 'कास्ट आयरन बेड, 40 इंच सेंटर दूरी, 1.5 एचपी मोटर, 8-पीस एचएसएस टर्निंग छेनी सेट सहित',
        BN: 'ঢালাই লোহার বেড, ৪০ ইঞ্চি সেন্টার দূরত্ব, ১.৫ এইচপি মোটর, ৮-পিস এইচএসএস বাটালি সেট সহ',
      },
      vendorTypes: {
        EN: 'Carpentry & Handicraft Machinery Distributor',
        HI: 'बढ़ईगीरी और हस्तशिल्प मशीनरी वितरक',
        BN: 'ছুতোর ও হস্তশিল্প যন্ত্রপাতি পরিবেশক',
      },
    },
    {
      id: 'hand-003',
      names: {
        EN: 'HVLP Spray Paint & Lacquer Finishing Booth',
        HI: 'एचवीएलपी स्प्रे पेंट और लाह फिनिशिंग बूथ',
        BN: 'এইচভিএলপি স্প্রে পেইন্ট ও ল্যাকার ফিনিশিং বুথ',
      },
      category: 'MACHINERY',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.20,
      baseQuantity: 1,
      unit: 'spray system',
      specifications: {
        EN: 'High-Volume Low-Pressure turbine sprayer with stainless steel needle, oil-free compressor and fume extractor fan',
        HI: 'उच्च मात्रा कम दबाव टरबाइन स्प्रेयर, तेल मुक्त कंप्रेसर और धुआं निकास पंखा',
        BN: 'হাই-ভলিউম লো-প্রেসার টারবাইন স্প্রেয়ার, তেল-মুক্ত কম্প্রেসার ও ধোঁয়া নিষ্কাশন ফ্যান',
      },
      vendorTypes: {
        EN: 'Industrial Coating & Finishing Systems Dealer',
        HI: 'औद्योगिक कोटिंग और फिनिशिंग सिस्टम डीलर',
        BN: 'শিল্প পেইন্ট ও ফিনিশিং সিস্টেম ডিলার',
      },
    },
    {
      id: 'hand-004',
      names: {
        EN: 'Bench Grinder & Precision Tool Sharpener (0.5 HP)',
        HI: 'बेंच ग्राइंडर और टूल शार्पनर (0.5 HP)',
        BN: 'বেঞ্চ গ্রাইন্ডার ও ধারালো করার যন্ত্র (০.৫ এইচপি)',
      },
      category: 'TOOL',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.10,
      baseQuantity: 1,
      unit: 'grinder',
      specifications: {
        EN: 'Dual 6" grinding wheels (coarse & fine grit) with eye shields and spark arrestors for blade maintenance',
        HI: 'दोहरे 6" ग्राइंडिंग व्हील (मोटा और बारीक), आई शील्ड और स्पार्क अरेस्टर सहित',
        BN: 'দ্বৈত ৬" গ্রাইন্ডিং হুইল, চোখের সুরক্ষামূলক শিল্ড এবং স্পার্ক আরেস্টার সহ',
      },
      vendorTypes: {
        EN: 'Hardware & Machine Tool Supplies Wholesaler',
        HI: 'हार्डवेयर और मशीन टूल आपूर्तिकर्ता',
        BN: 'হার্ডওয়্যার ও মেশিন টুলস পাইকারি বিক্রেতা',
      },
    },
  ],

  AGRICULTURE: [
    {
      id: 'agri-001',
      names: {
        EN: 'Multi-Crop Rotary Power Tiller / Cultivator (7.5 HP)',
        HI: 'मल्टी-क्रॉप रोटरी पावर टिलर (7.5 HP डीजल)',
        BN: 'মাল্টি-ক্রপ রোটারি পাওয়ার টিলার (৭.৫ এইচপি ডিজেল)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.50,
      baseQuantity: 1,
      unit: 'tiller',
      specifications: {
        EN: '7.5 HP 4-stroke direct-injection diesel engine, 32 rotary tines, multi-speed gearbox with reverse, iron wheels included',
        HI: '7.5 एचपी 4-स्ट्रोक डायरेक्ट-इंजेक्शन डीजल इंजन, 32 रोटरी ब्लेड, रिवर्स सहित मल्टी-स्पीड गियरबॉक्स',
        BN: '৭.৫ এইচপি ৪-স্ট্রোক ডিজেল ইঞ্জিন, ৩২টি রোটারি ব্লেড, রিভার্স গিয়ারবক্স ও লোহার চাকা সহ',
      },
      vendorTypes: {
        EN: 'State Agro-Industries Corporation / Authorized Tractor & Tiller Dealer',
        HI: 'राज्य कृषि उद्योग निगम / अधिकृत ट्रैक्टर और टिलर डीलर',
        BN: 'রাজ্য কৃষি-শিল্প নিগম / অনুমোদিত পাওয়ার টিলার ডিলার',
      },
    },
    {
      id: 'agri-002',
      names: {
        EN: 'Solar-Powered Submersible Irrigation Pump & Drip Kit (3 HP)',
        HI: 'सौर-संचालित सबमर्सिबल पंप व ड्रिप सिंचाई किट (3 HP)',
        BN: 'সৌর-চালিত সাবমার্সিবল পাম্প ও ড্রিপ সেচ কিট (৩ এইচপি)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.30,
      baseQuantity: 1,
      unit: 'system',
      specifications: {
        EN: '3 HP BLDC solar pump with MPPT controller, PV solar panels array, 1-acre inline drip irrigation lateral network',
        HI: '3 एचपी बीएलडीसी सोलर पंप, एमपीपीटी कंट्रोलर, सोलर पैनल, 1-एकड़ ड्रिप सिंचाई नेटवर्क',
        BN: '৩ এইচপি বিএলডিসি সোলার পাম্প, সৌর প্যানেল, ১ একর ড্রিপ সেচ পাইপলাইন নেটওয়ার্ক',
      },
      vendorTypes: {
        EN: 'MNRE / NABARD Approved Solar Irrigation Provider',
        HI: 'नवीन और नवीकरणीय ऊर्जा मंत्रालय / नाबार्ड अनुमोदित सोलर विक्रेता',
        BN: 'এমএনআরই / নাবার্ড অনুমোদিত সৌর সেচ সরবরাহকারী',
      },
    },
    {
      id: 'agri-003',
      names: {
        EN: 'Battery-Operated High-Pressure Knapsack Sprayers (16L)',
        HI: 'बैटरी चालित हाई-प्रेशर नैपसैक स्प्रेयर (16L)',
        BN: 'ব্যাটারি চালিত হাই-প্রেসার ন্যাপস্যাক স্প্রেয়ার (১৬ লিটার)',
      },
      category: 'TOOL',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.10,
      baseQuantity: 2,
      unit: 'sprayers',
      specifications: {
        EN: '12V 12Ah lithium-ion battery, dual motor producing 100 PSI, telescopic brass wand with 4 misting nozzles',
        HI: '12V 12Ah लिथियम-आयन बैटरी, 100 पीएसआई दबाव, टेलीस्कोपिक पीतल रॉड एवं 4 नोजल',
        BN: '১২ ভোল্ট লিথিয়াম-আয়ন ব্যাটারি, ১০০ পিএসআই চাপ, টেলিস্কোপিক ব্রাস পাইপ ও ৪টি নোজল',
      },
      vendorTypes: {
        EN: 'Certified Agro-Chemical & Sprayers Distributor',
        HI: 'प्रमाणित कृषि-रसायन और स्प्रेयर वितरक',
        BN: 'প্রত্যয়িত কৃষি সরঞ্জাম ও স্প্রেয়ার পরিবেশক',
      },
    },
    {
      id: 'agri-004',
      names: {
        EN: 'Post-Harvest Solar Polyhouse Dehydration Tunnel (500 kg)',
        HI: 'सोलर पॉलीहाउस निर्जलीकरण टनल (500 किग्रा)',
        BN: 'সোলার পলিহাউস ফসল শুকানোর টানেল (৫০০ কেজি)',
      },
      category: 'INFRASTRUCTURE',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.10,
      baseQuantity: 1,
      unit: 'unit',
      specifications: {
        EN: 'UV-stabilized polycarbonate tunnel with exhaust ventilation fans for safe drying of grains, spices and seeds',
        HI: 'यूवी-स्थिर पॉलीकार्बोनेट टनल, अनाज, मसालों और बीजों को सुरक्षित सुखाने हेतु निकास पंखे सहित',
        BN: 'ইউভি-সুরক্ষিত পলিকার্বনেট টানেল, ভেন্টিলেশন ফ্যান সহ শস্য ও মশলা শুকানোর ব্যবস্থা',
      },
      vendorTypes: {
        EN: 'Renewable Agricultural Drying Technologies Vendor',
        HI: 'नवीकरणीय कृषि सुखाने वाली प्रौद्योगिकी विक्रेता',
        BN: 'পুনর্নবীকরণযোগ্য কৃষি শুকানোর প্রযুক্তি সরবরাহকারী',
      },
    },
  ],

  LIVESTOCK: [
    {
      id: 'live-001',
      names: {
        EN: 'Purebred Goat Breeding Herd (15 Does + 1 Buck - Black Bengal / Sirohi)',
        HI: 'शुद्ध नस्ल बकरी पालन झुंड (15 मादा + 1 नर - ब्लैक बंगाल / सिरोही)',
        BN: 'উন্নত জাতের ছাগল পালন দল (১৫টি মা ছাগল + ১টি প্রজনন পাঁঠা - ব্ল্যাক বেঙ্গল / সিরোহি)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.55,
      baseQuantity: 16,
      unit: 'animals',
      specifications: {
        EN: '6-8 month old vaccinated breeding goats, dewormed with veterinary fitness and breed purity documentation',
        HI: '6-8 महीने की टीकाकृत प्रजनन बकरियां, कृमिनाशक व पशु चिकित्सा फिटनेस प्रमाण पत्र सहित',
        BN: '৬-৮ মাস বয়সী টিকাপ্রাপ্ত প্রজনন ছাগল, কৃমিনাশক ও ভেটেরিনারি সার্টিফিকেট সহ',
      },
      vendorTypes: {
        EN: 'State Goat Breeding Research Station / Animal Husbandry Farm',
        HI: 'राज्य बकरी प्रजनन अनुसंधान केंद्र / पशुपालन फार्म',
        BN: 'রাজ্য ছাগল প্রজনন গবেষণা কেন্দ্র / প্রাণিসম্পদ বিকাশ খামার',
      },
    },
    {
      id: 'live-002',
      names: {
        EN: 'Elevated Slotted Polypropylene Goat Shed Flooring Panels',
        HI: 'उन्नत स्लॉटेड पॉलीप्रोपाइलीन शेड फ्लोरिंग पैनल',
        BN: 'উন্নত স্লটেড পলিপ্রোপিলিন শেড মেঝে প্যানেল',
      },
      category: 'INFRASTRUCTURE',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.25,
      baseQuantity: 40,
      unit: 'panels (1x2m)',
      specifications: {
        EN: 'Interlocking hygienic anti-skid plastic slotted panels for effortless droppings clearance and pneumonia prevention',
        HI: 'एंटी-स्किड प्लास्टिक स्लॉटेड पैनल, आसान सफाई और निमोनिया की रोकथाम हेतु',
        BN: 'ইন্টারলকিং অ্যান্টি-স্কিড প্লাস্টিক স্লটেড প্যানেল, সহজ বর্জ্য নিষ্কাশন ও রোগ প্রতিরোধ',
      },
      vendorTypes: {
        EN: 'Commercial Goat Farm Infrastructure Manufacturer',
        HI: 'वाणिज्यिक बकरी फार्म अवसंरचना निर्माता',
        BN: 'বাণিজ্যিক ছাগল খামার পরিকাঠামো প্রস্তুতকারক',
      },
    },
    {
      id: 'live-003',
      names: {
        EN: 'Electric High-Output Fodder Chaff Cutter (2 HP)',
        HI: 'इलेक्ट्रिक चारा कुट्टी मशीन (2 HP)',
        BN: 'বৈদ্যুতিক গোখাদ্য কাটিং মেশিন (২ এইচপি)',
      },
      category: 'MACHINERY',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.12,
      baseQuantity: 1,
      unit: 'machine',
      specifications: {
        EN: '2 HP single phase motor, dual cutting speed, reversible gearbox for maize, sorghum, and dry straw',
        HI: '2 एचपी मोटर, मक्का, ज्वार और सूखे चारे के लिए दोहरी काटने की गति',
        BN: '২ এইচপি মোটর, ভুট্টা, জোয়ার ও শুকনো খড় কাটার দ্বি-গতির ব্যবস্থা',
      },
      vendorTypes: {
        EN: 'Empanelled Agro Machinery Distributor',
        HI: 'सूचीबद्ध कृषि मशीनरी वितरक',
        BN: 'তালিকাভুক্ত কৃষি যন্ত্রপাতি বিক্রেতা',
      },
    },
    {
      id: 'live-004',
      names: {
        EN: 'Automatic Stainless Water Troughs & Mineral Salt Dispensers',
        HI: 'स्टेनलेस स्टील पानी के बर्तन और खनिज लवण डिस्पेंसर',
        BN: 'স্টেইনলেস স্টিল পানির পাত্র ও খনিজ লবণ ডিসপেনসার',
      },
      category: 'INSTRUMENT',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.08,
      baseQuantity: 8,
      unit: 'sets',
      specifications: {
        EN: 'Automatic float-valve stainless steel drinking bowls (SS 304) + weather-proof mineral lick block holders',
        HI: 'स्वचालित फ्लोट-वाल्व स्टेनलेस स्टील के बर्तन + वेदर-प्रूफ मिनरल ब्लॉक होल्डर',
        BN: 'স্বয়ংক্রিয় ফ্লোট-ভালভ স্টেইনলেস স্টিলের পানির পাত্র + খনিজ লবণ ব্লক ধারক',
      },
      vendorTypes: {
        EN: 'Livestock Care & Farm Accessories Wholesaler',
        HI: 'पशुधन देखभाल और फार्म सहायक उपकरण आपूर्तिकर्ता',
        BN: 'প্রাণিসম্পদ পরিচর্যা ও ফার্ম আনুষাঙ্গিক পাইকারি বিক্রেতা',
      },
    },
  ],

  TRANSPORT: [
    {
      id: 'trans-001',
      names: {
        EN: 'High-Payload Electric Cargo Loader E-Rickshaw (1000 kg GVW)',
        HI: 'हाई-पेलोड इलेक्ट्रिक कार्गो ई-रिक्शा (1000 किग्रा)',
        BN: 'হাই-পেলোড ইলেকট্রিক কার্গো ই-রিকশা (১০০০ কেজি)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.70,
      baseQuantity: 1,
      unit: 'vehicle',
      specifications: {
        EN: '1200W high-torque differential BLDC motor, reinforced leaf spring suspension, hydraulic front shockers, ICAT certified',
        HI: '1200W हाई-टॉर्क बीएलडीसी मोटर, लीफ स्प्रिंग सस्पेंशन, हाइड्रोलिक शॉकर, आईसीएटी प्रमाणित',
        BN: '১২০০ ওয়াট হাই-টর্ক বিএলডিসি মোটর, শক্তিশালী লিফ স্প্রিং সাসপেনশন, আইসিএটি প্রত্যয়িত',
      },
      vendorTypes: {
        EN: 'ICAT Approved Commercial EV Dealership / State Transport Agency',
        HI: 'आईसीएटी अनुमोदित वाणिज्यिक ईवी डीलरशिप / राज्य परिवहन एजेंसी',
        BN: 'আইসিএটি অনুমোদিত বাণিজ্যিক ইভি ডিলারশিপ',
      },
    },
    {
      id: 'trans-002',
      names: {
        EN: 'Advanced LiFePO4 Smart Battery Pack (60V 120Ah)',
        HI: 'उन्नत LiFePO4 स्मार्ट बैटरी पैक (60V 120Ah)',
        BN: 'উন্নত LiFePO4 স্মার্ট ব্যাটারি প্যাক (৬০ ভোল্ট ১২০ অ্যাম্পিয়ার)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.18,
      baseQuantity: 1,
      unit: 'battery pack',
      specifications: {
        EN: 'Grade-A prismatic lithium iron phosphate cells, 3000+ lifecycle cycles, Bluetooth BMS with thermal runaway cutoff',
        HI: 'ग्रेड-ए लिथियम आयरन फॉस्फेट सेल, 3000+ लाइफसाइकल, ब्लूटूथ बीएमएस सुरक्षा प्रणाली सहित',
        BN: 'গ্রেড-এ লিথিয়াম আয়রন ফসফেট সেল, ৩০০০+ সাইকেল আয়ুষ্কাল, ব্লুটুথ বিএমএস সুরক্ষা',
      },
      vendorTypes: {
        EN: 'Authorized Lithium Battery Manufacturer / Service Centre',
        HI: 'अधिकृत लिथियम बैटरी निर्माता / सेवा केंद्र',
        BN: 'অনুমোদিত লিথিয়াম ব্যাটারি প্রস্তুতকারক / সার্ভিস সেন্টার',
      },
    },
    {
      id: 'trans-003',
      names: {
        EN: 'Fast-Charging Station (25A) & Waterproof Cargo Cover',
        HI: 'फास्ट-चार्जिंग स्टेशन (25A) व वाटरप्रूफ कार्गो कवर',
        BN: 'ফাস্ট চার্জিং স্টেশন (২৫ অ্যাম্পিয়ার) ও ওয়াটারপ্রুফ কার্গো কভার',
      },
      category: 'INFRASTRUCTURE',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.12,
      baseQuantity: 1,
      unit: 'kit',
      specifications: {
        EN: 'Microprocessor 25A fast charger (charges 0-100% in 3.5 hrs) with heavy-duty 750 GSM PVC waterproof tarp & ratchet tie-downs',
        HI: 'माइक्रोप्रोसेसर 25A फास्ट चार्जर (3.5 घंटे में पूर्ण चार्ज) + 750 जीएसएम वाटरप्रूफ तिरपाल',
        BN: '২৫ অ্যাম্পিয়ার ফাস্ট চার্জার (৩.৫ ঘণ্টায় পূর্ণ চার্জ) + ৭৫০ জিএসএম ওয়াটারপ্রুফ ত্রিপল',
      },
      vendorTypes: {
        EN: 'EV Charging Equipment & Cargo Accessories Hub',
        HI: 'ईवी चार्जिंग उपकरण और कार्गो सहायक उपकरण हब',
        BN: 'ইভি চার্জিং সরঞ্জাম ও পরিবহন সামগ্রী বিক্রেতা',
      },
    },
  ],

  SERVICES: [
    {
      id: 'serv-001',
      names: {
        EN: 'High-Speed Commercial Multifunction Laser Copier / Printer (A3/A4)',
        HI: 'हाई-स्पीड वाणिज्यिक मल्टीफंक्शन लेजर कॉपियर / प्रिंटर (A3/A4)',
        BN: 'হাই-স্পিড বাণিজ্যিক মাল্টিফাংশন লেজার ফটোকপিয়ার / প্রিন্টার (A3/A4)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.45,
      baseQuantity: 1,
      unit: 'machine',
      specifications: {
        EN: 'Heavy-duty 35 PPM duplex printing/scanning, network LAN, automatic document feeder (DADF), 1200x1200 DPI resolution',
        HI: '35 पेज/मिनट डुप्लेक्स प्रिंटिंग/स्कैनिंग, नेटवर्क लैन, ऑटोमैटिक डॉक्यूमेंट फीडर, 1200x1200 डीपीआई',
        BN: '৩৫ পৃষ্ঠা/মিনিট ডুপ্লেক্স প্রিন্টিং/স্ক্যানিং, নেটওয়ার্ক ল্যান, অটো ডকুমেন্ট ফিডার, ১২০০x১২০০ ডিপিআই',
      },
      vendorTypes: {
        EN: 'Authorized Office Automation Systems Partner (Canon / HP / Kyocera)',
        HI: 'अधिकृत कार्यालय स्वचालन उपकरण भागीदार (कैनन / एचपी / क्योसेरा)',
        BN: 'অনুমোদিত অফিস অটোমেশন পার্টনার (ক্যানন / এইচপি / কিওসেরা)',
      },
    },
    {
      id: 'serv-002',
      names: {
        EN: 'Core-i5 Desktop Workstation & 1 KVA Pure Sine Wave UPS',
        HI: 'कोर-i5 डेस्कटॉप कंप्यूटर व 1 KVA ऑनलाइन यूपीएस',
        BN: 'কোর-i5 ডেস্কটপ কম্পিউটার ও ১ কেভিএ অনলাইন ইউপিএস',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.28,
      baseQuantity: 1,
      unit: 'workstation',
      specifications: {
        EN: '12th Gen Intel Core-i5, 16GB RAM, 512GB NVMe SSD, 21.5" IPS monitor, 1 KVA UPS with 45-min battery backup',
        HI: '12वीं पीढ़ी इंटेल कोर-i5, 16GB रैम, 512GB एसएसडी, 21.5" आईपीएस मॉनिटर, 1 KVA यूपीएस (45 मिनट बैकअप)',
        BN: '১২শ প্রজন্মের ইন্টেল কোর-i5, ১৬ জিবি র‍্যাম, ৫১২ জিবি এসএসডি, ২১.৫" আইপিএস মনিটর, ১ কেভিএ ইউপিএস',
      },
      vendorTypes: {
        EN: 'Registered IT Hardware & Systems Integrator',
        HI: 'पंजीकृत आईटी हार्डवेयर और सिस्टम इंटीग्रेटर',
        BN: 'নিবন্ধিত আইটি হার্ডওয়্যার ও কম্পিউটার ডিলার',
      },
    },
    {
      id: 'serv-003',
      names: {
        EN: 'Heavy-Duty Thermal Lamination & Spiral/Comb Binding Machine',
        HI: 'थर्मल लेमिनेशन और स्पाइरल बाइंडिंग मशीन',
        BN: 'থার্মাল ল্যামিনেশন এবং স্পাইরাল বাইন্ডিং মেশিন',
      },
      category: 'TOOL',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.15,
      baseQuantity: 2,
      unit: 'machines',
      specifications: {
        EN: 'A3 hot & cold 4-roller silicon thermal laminator + heavy metal 21-hole comb & spiral punch binding machine',
        HI: 'A3 हॉट एंड कोल्ड 4-रोलर लेमिनेटर + मेटल 21-होल स्पाइरल पंच बाइंडिंग मशीन',
        BN: 'A3 হট অ্যান্ড কোল্ড ৪-রোলার ল্যামিনেটর + মেটাল ২১-হোল স্পাইরাল বাইন্ডিং মেশিন',
      },
      vendorTypes: {
        EN: 'Digital Print Shop Equipment Distributor',
        HI: 'डिजिटल प्रिंट शॉप उपकरण आपूर्तिकर्ता',
        BN: 'ডিজিটাল প্রিন্ট শপ সরঞ্জাম পরিবেশক',
      },
    },
    {
      id: 'serv-004',
      names: {
        EN: 'Aadhaar / CSC Certified Biometric Fingerprint & Iris Scanner',
        HI: 'आधार / सीएससी प्रमाणित बायोमेट्रिक फिंगरप्रिंट व आईरिस स्कैनर',
        BN: 'আধার / সিএসসি প্রত্যয়িত বায়োমেট্রিক ফিঙ্গারপ্রিন্ট ও আইরিশ স্ক্যানার',
      },
      category: 'INSTRUMENT',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.12,
      baseQuantity: 1,
      unit: 'kit',
      specifications: {
        EN: 'STQC certified optical USB fingerprint reader + dual eye iris scanner for PM-Kisan, banking KYC & CSC delivery',
        HI: 'एसटीक्यूसी प्रमाणित यूएसबी फिंगरप्रिंट स्कैनर + आईरिस स्कैनर (पीएम-किसान, बैंकिंग केवाईसी व सीएससी कार्य हेतु)',
        BN: 'এসটিকিউসি প্রত্যয়িত ইউএসবি ফিঙ্গারপ্রিন্ট রিডার + আইরিশ স্ক্যানার (ব্যাংকিং কেওয়াইসি ও সিএসসি সেবা)',
      },
      vendorTypes: {
        EN: 'UIDAI & Banking Correspondent Technology Provider',
        HI: 'यूआईडीएआई और बैंकिंग कॉरेस्पोंडेंट प्रौद्योगिकी प्रदाता',
        BN: 'ইউআইডিএআই ও ব্যাংকিং প্রযুক্তি সরবরাহকারী',
      },
    },
  ],

  OTHER: [
    {
      id: 'other-001',
      names: {
        EN: 'Commercial Pure Sine Wave Inverter Power Backup System (3 KVA)',
        HI: 'वाणिज्यिक शुद्ध साइन वेव इन्वर्टर पावर बैकअप सिस्टम (3 KVA)',
        BN: 'বাণিজ্যিক পিওর সাইন ওয়েভ ইনভার্টার পাওয়ার ব্যাকআপ সিস্টেম (৩ কেভিএ)',
      },
      category: 'MACHINERY',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.40,
      baseQuantity: 1,
      unit: 'system',
      specifications: {
        EN: '3 KVA 24V pure sine wave inverter with dual 150Ah heavy-duty tubular batteries & automatic mains changeover',
        HI: '3 KVA 24V इन्वर्टर, दो 150Ah ट्यूबलर बैटरी और स्वचालित मुख्य स्विचओवर सहित',
        BN: '৩ কেভিএ ২৪ ভোল্ট ইনভার্টার, দুটি ১৫০ অ্যাম্পিয়ার টিউবুলার ব্যাটারি ও স্বয়ংক্রিয় পরিবর্তন ব্যবস্থা',
      },
      vendorTypes: {
        EN: 'Certified Power Systems & Industrial Batteries Distributor',
        HI: 'प्रमाणित पावर सिस्टम्स और औद्योगिक बैटरी वितरक',
        BN: 'প্রত্যয়িত পাওয়ার সিস্টেমস ও শিল্প ব্যাটারি পরিবেশক',
      },
    },
    {
      id: 'other-002',
      names: {
        EN: 'Electronic Digital Precision Weighing & Counting Scale',
        HI: 'इलेक्ट्रॉनिक डिजिटल वजन व गणना स्केल',
        BN: 'ইলেকট্রনিক ডিজিটাল ওজন ও গণনা স্কেল',
      },
      category: 'INSTRUMENT',
      importance: 'ESSENTIAL',
      baseCostRatio: 0.20,
      baseQuantity: 1,
      unit: 'scale',
      specifications: {
        EN: 'High-precision 100 kg / 10g legal metrology certified counting scale with dual LED display & battery backup',
        HI: 'उच्च परिशुद्धता 100 किग्रा / 10 ग्राम प्रमाणित डिजिटल स्केल, दोहरी एलईडी डिस्प्ले सहित',
        BN: 'উচ্চ নির্ভুলতার ১০০ কেজি / ১০ গ্রাম সরকারি স্ট্যাম্পযুক্ত ডিজিটাল স্কেল',
      },
      vendorTypes: {
        EN: 'Government Approved Legal Metrology Weighing Instruments Supplier',
        HI: 'सरकारी अनुमोदित विधिक मापविज्ञान तोल उपकरण आपूर्तिकर्ता',
        BN: 'সরকারি অনুমোদিত পরিমাপ সরঞ্জাম সরবরাহকারী',
      },
    },
    {
      id: 'other-003',
      names: {
        EN: 'Heavy-Duty Modular Tool Benches & Storage Racks',
        HI: 'हेवी-ड्यूटी मॉड्यूलर वर्कबेंच और स्टोरेज रैक',
        BN: 'হেভি-ডিউটি মডুলার ওয়ার্কবেঞ্চ ও স্টোরেজ র্যাক',
      },
      category: 'INFRASTRUCTURE',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.25,
      baseQuantity: 3,
      unit: 'units',
      specifications: {
        EN: 'Reinforced industrial steel workbench with multi-drawer lockable cabinets and slotted organizing shelves',
        HI: 'प्रबलित औद्योगिक स्टील वर्कबेंच, लॉक करने योग्य दराज और अलमारियों सहित',
        BN: 'শক্তিশালী শিল্প মানের স্টিলের ওয়ার্কবেঞ্চ ও মাল্টি-ড্রয়ার ক্যাবিনেট',
      },
      vendorTypes: {
        EN: 'Industrial Furniture & Storage Systems Manufacturer',
        HI: 'औद्योगिक फर्नीचर और भंडारण प्रणाली निर्माता',
        BN: 'শিল্প আসবাবপত্র ও স্টোরেজ সিস্টেম প্রস্তুতকারক',
      },
    },
    {
      id: 'other-004',
      names: {
        EN: 'Semi-Automatic Thermal Sealer & Packaging Kit',
        HI: 'सेमी-ऑटोमैटिक थर्मल सीलर और पैकेजिंग किट',
        BN: 'সেমি-অটোমেটিক থার্মাল সিলার ও প্যাকেজিং কিট',
      },
      category: 'TOOL',
      importance: 'RECOMMENDED',
      baseCostRatio: 0.15,
      baseQuantity: 1,
      unit: 'kit',
      specifications: {
        EN: 'Heavy-duty foot-pedal operated impulse heat sealer (18-inch seal bar) with digital timer control',
        HI: 'हेवी-ड्यूटी फुट-पेडल संचालित इंपल्स हीट सीलर (18 इंच सीलिंग बार), डिजिटल टाइमर सहित',
        BN: 'হেভি-ডিউটি ফুট-প্যাডেল পরিচালিত হিট সিলার (১৮ ইঞ্চি বার), ডিজিটাল টাইমার সহ',
      },
      vendorTypes: {
        EN: 'Commercial Packaging Tools & Equipment Dealer',
        HI: 'वाणिज्यिक पैकेजिंग उपकरण और उपकरण डीलर',
        BN: 'বাণিজ্যিক প্যাকেজিং সরঞ্জাম ও যন্ত্রপাতি বিক্রেতা',
      },
    },
  ],
};

/**
 * Dynamically computes a realistic equipment breakdown tailored to the category,
 * language, and user's project cost (typically allocating ~60% of project cost to machinery,
 * leaving the rest for working capital & civil works as per bank norms).
 */
export function getDynamicEquipmentList(
  category: BusinessCategory = 'DAIRY',
  projectCost: number = 185000,
  lang: Lang = 'EN',
): EquipmentItem[] {
  const templates = CATEGORY_EQUIPMENT_CATALOGUE[category] || CATEGORY_EQUIPMENT_CATALOGUE.DAIRY;

  // Machinery budget is typically 55% to 65% of total project cost in standard DPRs
  const machineryBudget = Math.max(25000, Math.round(projectCost * 0.60));

  return templates.map((tmpl) => {
    // Proportional cost based on baseCostRatio
    const allocatedItemCost = Math.max(2000, Math.round(machineryBudget * tmpl.baseCostRatio));

    // Scale quantity for larger project costs if applicable
    let scaledQuantity = tmpl.baseQuantity;
    if (projectCost > 500000) {
      scaledQuantity = Math.max(tmpl.baseQuantity, Math.round(tmpl.baseQuantity * (projectCost / 400000)));
    } else if (projectCost < 100000 && tmpl.baseQuantity > 1) {
      scaledQuantity = Math.max(1, Math.floor(tmpl.baseQuantity / 2));
    }

    return {
      id: tmpl.id,
      name: tmpl.names[lang] || tmpl.names.EN,
      category: tmpl.category,
      estimatedCost: allocatedItemCost,
      quantity: scaledQuantity,
      unit: tmpl.unit,
      importance: tmpl.importance,
      specification: tmpl.specifications[lang] || tmpl.specifications.EN,
      vendorType: tmpl.vendorTypes[lang] || tmpl.vendorTypes.EN,
    };
  });
}
