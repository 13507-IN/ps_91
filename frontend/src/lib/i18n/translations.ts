'use client';

/**
 * ArthSetu — Centralized Translation Dictionary
 *
 * All user-facing UI strings in English (EN), Bengali (BN), and Hindi (HI).
 * Organized by component/page section.
 */

export type Lang = 'EN' | 'BN' | 'HI';

export const LANG_KEY = 'ArthSetu_lang';

const translations = {
  // ─── Common / Shared ───
  common: {
    appName:      { EN: 'ArthSetu',             BN: 'ArthSetu',             HI: 'ArthSetu' },
    tagline:      { EN: 'Rural Business Intelligence Platform', BN: 'গ্রামীণ ব্যবসায়িক তথ্য প্ল্যাটফর্ম', HI: 'ग्रामीण व्यापार खुफिया मंच' },
    loading:      { EN: 'Loading...',                BN: 'লোড হচ্ছে...',                HI: 'लोड हो रहा है...' },
    save:         { EN: 'Save',                      BN: 'সংরক্ষণ করুন',                      HI: 'सहेजें' },
    cancel:       { EN: 'Cancel',                    BN: 'বাতিল',                    HI: 'रद्द करें' },
    back:         { EN: 'Back',                      BN: 'পিছনে',                      HI: 'पीछे' },
    next:         { EN: 'Next',                      BN: 'পরবর্তী',                      HI: 'अगला' },
    continue:     { EN: 'Continue',                  BN: 'চালিয়ে যান',                  HI: 'जारी रखें' },
    change:       { EN: 'Change',                    BN: 'পরিবর্তন করুন',                    HI: 'बदलें' },
    clear:        { EN: 'Clear',                     BN: 'মুছুন',                     HI: 'साफ़ करें' },
    close:        { EN: 'Close',                     BN: 'বন্ধ করুন',                     HI: 'बंद करें' },
    submit:       { EN: 'Submit',                    BN: 'জমা দিন',                    HI: 'जमा करें' },
    yes:          { EN: 'Yes',                       BN: 'হ্যাঁ',                       HI: 'हाँ' },
    no:           { EN: 'No',                        BN: 'না',                        HI: 'नहीं' },
    or:           { EN: 'Or',                        BN: 'অথবা',                        HI: 'या' },
    notSpecified: { EN: 'Not specified',             BN: 'নির্দিষ্ট নয়',             HI: 'निर्दिष्ट नहीं' },
    notProvided:  { EN: 'Not provided (optional)',   BN: 'দেওয়া হয়নি (ঐচ্ছিক)',   HI: 'प्रदान नहीं किया गया (वैकल्पिक)' },
    notSelected:  { EN: 'Not selected',              BN: 'নির্বাচিত নয়',              HI: 'चयनित नहीं' },
    notEntered:   { EN: 'Not entered',               BN: 'দেওয়া হয়নি',               HI: 'दर्ज नहीं किया गया' },
    loginRequired:{ EN: 'Login required',            BN: 'লগইন প্রয়োজন',            HI: 'लॉगिन आवश्यक है' },
    startNew:     { EN: 'Start New Assessment',      BN: 'নতুন মূল্যায়ন শুরু করুন',      HI: 'नया मूल्यांकन शुरू करें' },
    newAssessment:{ EN: '+ New Assessment',          BN: '+ নতুন মূল্যায়ন',          HI: '+ नया मूल्यांकन' },
    printPdf:     { EN: 'Print / PDF',               BN: 'প্রিন্ট / PDF',               HI: 'प्रिंट / PDF' },
    age:          { EN: 'Age',                       BN: 'বয়স',                       HI: 'आयु' },
  },

  // ─── Navigation (Header) ───
  nav: {
    home:           { EN: 'Home',               BN: 'হোম',               HI: 'होम' },
    assess:         { EN: 'Start Assessment',   BN: 'মূল্যায়ন শুরু করুন',   HI: 'मूल्यांकन शुरू करें' },
    schemes:        { EN: 'Schemes',            BN: 'প্রকল্পসমূহ',            HI: 'योजनाएं' },
    sampleReport:   { EN: 'Sample Report',      BN: 'নমুনা রিপোর্ট',      HI: 'नमूना रिपोर्ट' },
    dashboard:      { EN: 'Dashboard',          BN: 'ড্যাশবোর্ড',          HI: 'डैशबोर्ड' },
    admin:          { EN: 'Admin',              BN: 'অ্যাডমিন',              HI: 'व्यवस्थापक' },
    settings:       { EN: 'Settings',           BN: 'সেটিংস',           HI: 'सेटिंग्स' },
    freeAssessment: { EN: 'Free Assessment',    BN: 'বিনামূল্যে মূল্যায়ন',    HI: 'मुफ़्त मूल्यांकन' },
    login:          { EN: 'Login',              BN: 'লগইন',              HI: 'लॉगिन' },
    register:       { EN: 'Register',           BN: 'নিবন্ধন',           HI: 'पंजीकरण' },
    logout:         { EN: 'Logout',             BN: 'লগআউট',             HI: 'लॉगआउट' },
    language:       { EN: 'Language',           BN: 'ভাষা',           HI: 'भाषा' },
    skipToMain:     { EN: 'Skip to Main Content', BN: 'মূল বিষয়বস্তুতে যান', HI: 'मुख्य सामग्री पर जाएं' },
    govIndia:       { EN: 'भारत सरकार | Government of India', BN: 'ভারত সরকার | Government of India', HI: 'भारत सरकार | Government of India' },
  },

  // ─── Header ticker ───
  ticker: {
    items: {
      EN: [
        'Is Your Business Idea Viable in Your Village?',
        'Scheme-Matched Financial Plans Built on Real Data',
        'Local Market Intelligence for 6,40,000+ Villages',
        'Stress-Tested Business Plans Built for Rural Reality',
        'Financial Literacy for Every Entrepreneur',
        'Risk Assessment Honest & Explainable',
        '30-Day Action Plan From Idea to Funding',
        'Government Scheme Matching Done Automatically',
      ],
      BN: [
        'আপনার গ্রামে আপনার ব্যবসার ধারণা কি কার্যকর?',
        'সরকারি প্রকল্প-মিলিত আর্থিক পরিকল্পনা',
        '৬,৪০,০০০+ গ্রামের স্থানীয় বাজার তথ্য',
        'গ্রামীণ বাস্তবতার জন্য পরীক্ষিত ব্যবসা পরিকল্পনা',
        'প্রতিটি উদ্যোক্তার জন্য আর্থিক সাক্ষরতা',
        'ঝুঁকি মূল্যায়ন সৎ ও ব্যাখ্যাযোগ্য',
        'ধারণা থেকে অর্থায়ন — ৩০ দিনের কর্ম পরিকল্পনা',
        'সরকারি প্রকল্প স্বয়ংক্রিয়ভাবে মিলিত',
      ],
      HI: [
        'क्या आपके गांव में आपके व्यवसाय का विचार व्यवहार्य है?',
        'वास्तविक डेटा पर निर्मित योजना-मिलान वित्तीय योजनाएं',
        '6,40,000+ गांवों के लिए स्थानीय बाजार खुफिया',
        'ग्रामीण वास्तविकता के लिए तनाव-परीक्षणित व्यवसाय योजनाएं',
        'हर उद्यमी के लिए वित्तीय साक्षरता',
        'जोखिम मूल्यांकन ईमानदार और समझाने योग्य',
        'विचार से वित्तपोषण तक — 30-दिवसीय कार्य योजना',
        'सरकारी योजना मिलान स्वचालित रूप से किया गया',
      ]
    },
  },

  // ─── How It Works ───
  howItWorks: {
    sectionLabel: { EN: 'How It Works', BN: 'এটি কীভাবে কাজ করে', HI: 'यह कैसे काम करता है' },
    headline: { EN: 'From idea to funding readiness', BN: 'ধারণা থেকে অর্থায়নের প্রস্তুতি পর্যন্ত', HI: 'विचार से लेकर फंडिंग की तैयारी तक' },
    subheadline: { EN: 'ArthSetu is a decision-support dashboard, not a chatbot. AI analyses behind the scenes; you get structured, explainable intelligence.', BN: 'অর্থসেতু একটি সিদ্ধান্ত-সহায়ক ড্যাশবোর্ড, চ্যাটবট নয়। নেপথ্যে AI বিশ্লেষণ করে; আপনি পান সুসংগঠিত, ব্যাখ্যাযোগ্য তথ্য।', HI: 'अर्थसेतु एक निर्णय-समर्थन डैशबोर्ड है, चैटबॉट नहीं। पर्दे के पीछे एआई विश्लेषण करता है; आपको संरचित, व्याख्यात्मक बुद्धिमत्ता मिलती है।' },
    steps: {
      step1Title: { EN: 'Understand Your Market', BN: 'আপনার বাজার বুঝুন', HI: 'अपना बाजार समझें' },
      step1Desc: { EN: 'Population, households, amenities, crops, livestock and infrastructure within your catchment — each value tagged with its source and confidence level.', BN: 'আপনার ক্যাচমেন্ট এলাকার জনসংখ্যা, পরিবার, সুযোগ-সুবিধা, ফসল, গবাদি পশু এবং অবকাঠামো — প্রতিটি মান তার উৎস এবং আস্থার স্তরের সাথে ট্যাগ করা হয়েছে।', HI: 'आपके जलग्रहण क्षेत्र के भीतर जनसंख्या, परिवार, सुविधाएं, फसलें, पशुधन और बुनियादी ढांचा — प्रत्येक मूल्य को उसके स्रोत और विश्वास स्तर के साथ टैग किया गया है।' },
      step2Title: { EN: 'Find the Opportunity', BN: 'সুযোগ খুঁজুন', HI: 'अवसर खोजें' },
      step2Desc: { EN: 'We estimate local demand vs. existing supply and surface market gaps, low-competition niches, and a recommended business model.', BN: 'আমরা স্থানীয় চাহিদা বনাম বিদ্যমান সরবরাহ অনুমান করি এবং বাজারের ফাঁক, কম-প্রতিযোগিতার সুযোগ এবং একটি প্রস্তাবিত ব্যবসায়িক মডেল প্রকাশ করি।', HI: 'हम स्थानीय मांग बनाम मौजूदा आपूर्ति का अनुमान लगाते हैं और बाजार के अंतराल, कम-प्रतिस्पर्धा वाले क्षेत्रों और एक अनुशंसित व्यापार मॉडल को सामने लाते हैं।' },
      step3Title: { EN: 'Build the Financial Plan', BN: 'আর্থিক পরিকল্পনা তৈরি করুন', HI: 'वित्तीय योजना बनाएं' },
      step3Desc: { EN: 'Project cost, own contribution, loan, matched government scheme, interest, tenure and EMI — plus cashflow, working capital and break-even.', BN: 'প্রকল্প ব্যয়, নিজস্ব অবদান, ঋণ, মিলিত সরকারি প্রকল্প, সুদ, মেয়াদ এবং EMI — এছাড়াও ক্যাশফ্লো, ওয়ার্কিং ক্যাপিটাল এবং ব্রেক-ইভেন।', HI: 'परियोजना लागत, स्वयं का योगदान, ऋण, मिलान की गई सरकारी योजना, ब्याज, अवधि और ईएमआई — साथ ही नकदी प्रवाह, कार्यशील पूंजी और ब्रेक-ईवन।' },
      step4Title: { EN: 'Stress Test the Business', BN: 'ব্যবসার স্ট্রেস টেস্ট করুন', HI: 'व्यवसाय का स्ट्रेस टेस्ट करें' },
      step4Desc: { EN: 'Simulate raw-material price hikes, demand drops and cost shocks to see if the business stays sustainable under adverse conditions.', BN: 'প্রতিকূল পরিস্থিতিতে ব্যবসা টেকসই থাকে কিনা তা দেখতে কাঁচামালের মূল্য বৃদ্ধি, চাহিদা হ্রাস এবং খরচের ধাক্কা অনুকরণ করুন।', HI: 'प्रतिकूल परिस्थितियों में व्यवसाय टिकाऊ रहता है या नहीं, यह देखने के लिए कच्चे माल की कीमत में वृद्धि, मांग में गिरावट और लागत के झटके का अनुकरण करें।' },
      step5Title: { EN: 'Understand the Risks', BN: 'ঝুঁকিগুলো বুঝুন', HI: 'जोखिमों को समझें' },
      step5Desc: { EN: 'A probability × impact risk matrix with honest mitigations — never presented as certainty.', BN: 'একটি সম্ভাবনা × প্রভাব ঝুঁকি ম্যাট্রিক্স সৎ প্রশমন ব্যবস্থার সাথে — কখনোই নিশ্চিত হিসেবে উপস্থাপিত হয় না।', HI: 'ईमानदार शमन के साथ एक संभावना × प्रभाव जोखिम मैट्रिक्स — कभी भी निश्चितता के रूप में प्रस्तुत नहीं किया जाता है।' },
      step6Title: { EN: 'Get Your Action Plan', BN: 'আপনার কর্মপরিকল্পনা পান', HI: 'अपनी कार्य योजना प्राप्त करें' },
      step6Desc: { EN: 'A 30-day funding-readiness roadmap: quotations, registrations, scheme applications, and launch tasks.', BN: 'একটি ৩০ দিনের অর্থায়ন-প্রস্তুতি রোডম্যাপ: কোটেশন, নিবন্ধন, প্রকল্পের আবেদন এবং লঞ্চের কাজ।', HI: '30-दिन का फंडिंग-तैयारी रोडमैप: कोटेशन, पंजीकरण, योजना आवेदन, और लॉन्च कार्य।' },
    }
  },

  // ─── Hero Section ───
  hero: {
    slides: {
      EN: [
        { heading: 'Is Your Business Idea', highlight: 'Viable in Your Village?', sub: 'Enter your location, capital, and business idea. Get a full evidence-backed feasibility report — market intelligence, EMI, scheme matching, and a 30-day action plan.', cta: 'Start Free Assessment', secondaryCta: 'View Sample Report' },
        { heading: 'Scheme-Matched Financial Plans', highlight: 'Built on Real Data', sub: 'PMEGP, MUDRA, Stand-Up India — we match your profile to government schemes and calculate your exact EMI, subsidy, and funding gap in minutes.', cta: 'Check Scheme Eligibility', secondaryCta: 'How It Works' },
        { heading: 'Local Market Intelligence', highlight: 'for 6,40,000+ Villages', sub: 'Population, competitors, mandi prices, road connectivity, livestock data — all official government sources, tagged with confidence levels.', cta: 'Explore Your Market', secondaryCta: 'Data Sources' },
        { heading: 'Stress-Tested Business Plans', highlight: 'Built for Rural Reality', sub: 'Simulate price hikes, demand drops and cost shocks. Know before you invest whether your business can survive adverse conditions.', cta: 'Run a Stress Test', secondaryCta: 'Learn More' },
        { heading: 'Financial Literacy', highlight: 'for Every Entrepreneur', sub: 'Project cost, margin, loan, EMI, working capital, break-even — all calculated with real government scheme interest rates.', cta: 'Calculate My EMI', secondaryCta: 'Sample Report' },
        { heading: 'Risk Assessment', highlight: 'Honest & Explainable', sub: 'A probability × impact risk matrix with practical mitigations — never a black-box score.', cta: 'Start Assessment', secondaryCta: 'View Sample' },
        { heading: '30-Day Action Plan', highlight: 'From Idea to Funding', sub: 'Quotations, registrations, scheme applications and launch tasks — a milestone-by-milestone roadmap to funding readiness.', cta: 'Get My Action Plan', secondaryCta: 'How It Works' },
        { heading: 'Government Scheme Matching', highlight: 'Done Automatically', sub: 'We check 48+ central and state schemes against your age, category, location and project cost — and rank them by eligibility.', cta: 'Match My Schemes', secondaryCta: 'View All Schemes' }
      ],
      BN: [
        { heading: 'আপনার ব্যবসার ধারণা কি', highlight: 'আপনার গ্রামে টেকসই?', sub: 'আপনার অবস্থান, মূলধন এবং ব্যবসার ধারণা লিখুন। বাজার তথ্য, EMI, প্রকল্প মিলানো এবং ৩০ দিনের কর্মপরিকল্পনাসহ একটি প্রমাণ-ভিত্তিক সম্ভাব্যতা রিপোর্ট পান।', cta: 'বিনামূল্যে মূল্যায়ন শুরু করুন', secondaryCta: 'নমুনা রিপোর্ট দেখুন' },
        { heading: 'প্রকল্প-মিলিত আর্থিক পরিকল্পনা', highlight: 'প্রকৃত তথ্যের উপর ভিত্তি করে', sub: 'PMEGP, MUDRA, Stand-Up India — আমরা সরকারি প্রকল্পগুলোর সাথে আপনার প্রোফাইল মেলাই এবং কয়েক মিনিটের মধ্যে আপনার সঠিক EMI, ভর্তুকি এবং অর্থায়নের ব্যবধান গণনা করি।', cta: 'প্রকল্পের যোগ্যতা যাচাই করুন', secondaryCta: 'এটি কীভাবে কাজ করে' },
        { heading: 'স্থানীয় বাজার তথ্য', highlight: '৬,৪০,০০০+ গ্রামের জন্য', sub: 'জনসংখ্যা, প্রতিযোগী, মান্ডি মূল্য, সড়ক যোগাযোগ, গবাদি পশুর তথ্য — সমস্ত সরকারি উৎস, আস্থার স্তরের সাথে ট্যাগ করা।', cta: 'আপনার বাজার অন্বেষণ করুন', secondaryCta: 'তথ্য উৎস' },
        { heading: 'স্ট্রেস-টেস্ট করা ব্যবসায়িক পরিকল্পনা', highlight: 'গ্রামীণ বাস্তবতার জন্য তৈরি', sub: 'প্রতিকূল পরিস্থিতিতে আপনার ব্যবসা টিকতে পারবে কিনা তা জানতে বিনিয়োগের আগে মূল্য বৃদ্ধি, চাহিদা হ্রাস এবং খরচের ধাক্কা অনুকরণ করুন।', cta: 'স্ট্রেস টেস্ট চালান', secondaryCta: 'আরও জানুন' },
        { heading: 'আর্থিক সাক্ষরতা', highlight: 'প্রতিটি উদ্যোক্তার জন্য', sub: 'প্রকল্প ব্যয়, মার্জিন, ঋণ, EMI, চলতি মূলধন, ব্রেক-ইভেন — সবকিছু বাস্তব সরকারি প্রকল্পের সুদের হার দিয়ে গণনা করা।', cta: 'আমার EMI গণনা করুন', secondaryCta: 'নমুনা রিপোর্ট' },
        { heading: 'ঝুঁকি মূল্যায়ন', highlight: 'সৎ ও ব্যাখ্যাযোগ্য', sub: 'বাস্তবসম্মত প্রশমন ব্যবস্থাসহ একটি সম্ভাবনা × প্রভাব ঝুঁকি ম্যাট্রিক্স — কখনোই ব্ল্যাক-বক্স স্কোর হিসেবে নয়।', cta: 'মূল্যায়ন শুরু করুন', secondaryCta: 'নমুনা দেখুন' },
        { heading: '৩০ দিনের কর্ম পরিকল্পনা', highlight: 'ধারণা থেকে অর্থায়ন পর্যন্ত', sub: 'কোটেশন, নিবন্ধন, প্রকল্পের আবেদন এবং লঞ্চের কাজ — অর্থায়ন-প্রস্তুতির একটি মাইলফলক-ভিত্তিক রোডম্যাপ।', cta: 'আমার কর্মপরিকল্পনা পান', secondaryCta: 'এটি কীভাবে কাজ করে' },
        { heading: 'সরকারি প্রকল্প মেলানো', highlight: 'স্বয়ংক্রিয়ভাবে সম্পন্ন', sub: 'আপনার বয়স, বিভাগ, অবস্থান এবং প্রকল্প ব্যয়ের বিপরীতে আমরা ৪৮+ কেন্দ্রীয় ও রাজ্য প্রকল্প যাচাই করি — এবং যোগ্যতার ভিত্তিতে র্যাঙ্ক করি।', cta: 'আমার প্রকল্প মেলান', secondaryCta: 'সব প্রকল্প দেখুন' }
      ],
      HI: [
        { heading: 'क्या आपके व्यवसाय का विचार', highlight: 'आपके गांव में व्यवहार्य है?', sub: 'अपना स्थान, पूंजी और व्यवसाय का विचार दर्ज करें। बाजार बुद्धिमत्ता, ईएमआई, योजना मिलान और 30-दिवसीय कार्य योजना के साथ एक पूर्ण साक्ष्य-समर्थित व्यवहार्यता रिपोर्ट प्राप्त करें।', cta: 'मुफ्त मूल्यांकन शुरू करें', secondaryCta: 'नमूना रिपोर्ट देखें' },
        { heading: 'योजना-मिलान वित्तीय योजनाएं', highlight: 'वास्तविक डेटा पर निर्मित', sub: 'PMEGP, MUDRA, Stand-Up India — हम आपके प्रोफाइल को सरकारी योजनाओं से मिलाते हैं और मिनटों में आपकी सटीक ईएमआई, सब्सिडी और फंडिंग गैप की गणना करते हैं।', cta: 'योजना पात्रता की जांच करें', secondaryCta: 'यह कैसे काम करता है' },
        { heading: 'स्थानीय बाजार बुद्धिमत्ता', highlight: '6,40,000+ गांवों के लिए', sub: 'जनसंख्या, प्रतियोगी, मंडी मूल्य, सड़क संपर्क, पशुधन डेटा — सभी आधिकारिक सरकारी स्रोत, विश्वास स्तरों के साथ टैग किए गए।', cta: 'अपने बाजार का अन्वेषण करें', secondaryCta: 'डेटा स्रोत' },
        { heading: 'तनाव-परीक्षणित व्यापार योजनाएं', highlight: 'ग्रामीण वास्तविकता के लिए निर्मित', sub: 'निवेश करने से पहले यह जानने के लिए कि क्या आपका व्यवसाय प्रतिकूल परिस्थितियों में जीवित रह सकता है, मूल्य वृद्धि, मांग में गिरावट और लागत के झटके का अनुकरण करें।', cta: 'स्ट्रेस टेस्ट चलाएं', secondaryCta: 'और जानें' },
        { heading: 'वित्तीय साक्षरता', highlight: 'हर उद्यमी के लिए', sub: 'परियोजना लागत, मार्जिन, ऋण, ईएमआई, कार्यशील पूंजी, ब्रेक-ईवन — सभी वास्तविक सरकारी योजना ब्याज दरों के साथ गणना की गई।', cta: 'मेरी ईएमआई की गणना करें', secondaryCta: 'नमूना रिपोर्ट' },
        { heading: 'जोखिम मूल्यांकन', highlight: 'ईमानदार और समझाने योग्य', sub: 'व्यावहारिक शमन के साथ एक संभावना × प्रभाव जोखिम मैट्रिक्स — कभी भी ब्लैक-बॉक्स स्कोर नहीं।', cta: 'मूल्यांकन शुरू करें', secondaryCta: 'नमूना देखें' },
        { heading: '30-दिवसीय कार्य योजना', highlight: 'विचार से वित्तपोषण तक', sub: 'कोटेशन, पंजीकरण, योजना आवेदन और लॉन्च कार्य — वित्तपोषण तत्परता के लिए एक मील का पत्थर रोडमैप।', cta: 'मेरी कार्य योजना प्राप्त करें', secondaryCta: 'यह कैसे काम करता है' },
        { heading: 'सरकारी योजना मिलान', highlight: 'स्वचालित रूप से किया गया', sub: 'हम आपकी आयु, श्रेणी, स्थान और परियोजना लागत के विरुद्ध 48+ केंद्रीय और राज्य योजनाओं की जांच करते हैं — और उन्हें पात्रता के आधार पर रैंक करते हैं।', cta: 'मेरी योजनाओं का मिलान करें', secondaryCta: 'सभी योजनाएं देखें' }
      ]
    }
  },

  // ─── Categories Section ───
  categories: {
    sectionLabel: { EN: 'Business Categories', BN: 'ব্যবসার বিভাগ', HI: 'व्यवसाय श्रेणियां' },
    headline: { EN: '11 Business Categories Covered', BN: '১১টি ব্যবসার বিভাগ অন্তর্ভুক্ত', HI: '11 व्यवसाय श्रेणियां शामिल हैं' },
    subheadline: { EN: 'From dairy farming to transport services — each category loaded with local investment benchmarks, scheme eligibility, and demand estimates.', BN: 'ডেইরি ফার্মিং থেকে শুরু করে পরিবহন পরিষেবা — প্রতিটি বিভাগ স্থানীয় বিনিয়োগের মানদণ্ড, প্রকল্পের যোগ্যতা এবং চাহিদার অনুমান দিয়ে পরিপূর্ণ।', HI: 'डेयरी फार्मिंग से लेकर परिवहन सेवाओं तक — प्रत्येक श्रेणी स्थानीय निवेश बेंचमार्क, योजना पात्रता और मांग अनुमानों से भरी हुई है।' },
    items: {
      DAIRY: { name: { EN: 'Dairy', BN: 'ডেইরি', HI: 'डेयरी' }, desc: { EN: 'Milk production, processing & sales', BN: 'দুধ উৎপাদন, প্রক্রিয়াজাতকরণ ও বিক্রয়', HI: 'दूध उत्पादन, प्रसंस्करण और बिक्री' } },
      FOOD_PROCESSING: { name: { EN: 'Food Processing', BN: 'খাদ্য প্রক্রিয়াজাতকরণ', HI: 'खाद्य प्रसंस्करण' }, desc: { EN: 'Pickles, snacks, grain milling', BN: 'আচার, স্ন্যাকস, শস্য ভাঙানো', HI: 'अचार, स्नैक्स, अनाज पिसाई' } },
      RETAIL: { name: { EN: 'Retail Shop', BN: 'খুচরা দোকান', HI: 'खुदरा दुकान' }, desc: { EN: 'General store, grocery, FMCG', BN: 'জেনারেল স্টোর, মুদিখানা, FMCG', HI: 'जनरल स्टोर, किराना, FMCG' } },
      TEXTILES_TAILORING: { name: { EN: 'Textiles & Tailoring', BN: 'বস্ত্র ও দর্জি', HI: 'कपड़ा और सिलाई' }, desc: { EN: 'Stitching, embroidery, readymade', BN: 'সেলাই, এমব্রয়ডারি, রেডিমেড', HI: 'सिलाई, कढ़ाई, रेडीमेड' } },
      POULTRY: { name: { EN: 'Poultry', BN: 'পোল্ট্রি', HI: 'मुर्गी पालन' }, desc: { EN: 'Broiler, layer, backyard poultry', BN: 'ব্রয়লার, লেয়ার, বাড়ির উঠোনে পোল্ট্রি', HI: 'ब्रायलर, लेयर, बैकयार्ड मुर्गी पालन' } },
      AGRICULTURE: { name: { EN: 'Agriculture', BN: 'কৃষি', HI: 'कृषि' }, desc: { EN: 'Crop cultivation, horticulture', BN: 'ফসল চাষ, উদ্যানপালন', HI: 'फसल की खेती, बागवानी' } },
      LIVESTOCK: { name: { EN: 'Livestock', BN: 'প্রাণিসম্পদ', HI: 'पशुधन' }, desc: { EN: 'Goat, sheep, pig rearing', BN: 'ছাগল, ভেড়া, শূকর পালন', HI: 'बकरी, भेड़, सूअर पालन' } },
      TRANSPORT: { name: { EN: 'Transport', BN: 'পরিবহন', HI: 'परिवहन' }, desc: { EN: 'E-rickshaw, mini-truck, taxi', BN: 'ই-রিকশা, মিনি-ট্রাক, ট্যাক্সি', HI: 'ई-रिक्शा, मिनी-ट्रक, टैक्सी' } },
      HANDICRAFT: { name: { EN: 'Handicraft', BN: 'হস্তশিল্প', HI: 'हस्तशिल्प' }, desc: { EN: 'Pottery, weaving, bamboo craft', BN: 'মৃৎশিল্প, তাঁত, বাঁশের কাজ', HI: 'मिट्टी के बर्तन, बुनाई, बांस शिल्प' } },
      SERVICES: { name: { EN: 'Services', BN: 'পরিষেবা', HI: 'सेवाएं' }, desc: { EN: 'Salon, repair, mobile recharge', BN: 'সেলুন, মেরামত, মোবাইল রিচার্জ', HI: 'सैलून, मरम्मत, मोबाइल रिचार्ज' } },
      OTHER: { name: { EN: 'Other', BN: 'অন্যান্য', HI: 'अन्य' }, desc: { EN: 'Describe your unique idea', BN: 'আপনার অনন্য ধারণা বর্ণনা করুন', HI: 'अपने अनूठे विचार का वर्णन करें' } }
    }
  },

  // ─── Data Sources Section ───
  dataSources: {
    sectionLabel: { EN: 'Data Sources', BN: 'তথ্যসূত্র', HI: 'डेटा स्रोत' },
    headline: { EN: 'Built on layered local evidence', BN: 'স্তরভিত্তিক স্থানীয় প্রমাণের উপর নির্মিত', HI: 'स्तर-आधारित स्थानीय साक्ष्य पर निर्मित' },
    subheadline: { EN: 'Rural markets are partially observable. We combine official government data, community reports and AI estimates — and we always tell you which is which.', BN: 'গ্রামীণ বাজারগুলো আংশিকভাবে পর্যবেক্ষণযোগ্য। আমরা সরকারি তথ্য, সম্প্রদায়ের প্রতিবেদন এবং এআই অনুমান একত্রিত করি — এবং কোনটি কী তা আমরা সর্বদা আপনাকে জানিয়ে দিই।', HI: 'ग्रामीण बाजार आंशिक रूप से देखने योग्य हैं। हम आधिकारिक सरकारी डेटा, सामुदायिक रिपोर्ट और एआई अनुमानों को जोड़ते हैं — और हम हमेशा आपको बताते हैं कि कौन सा क्या है।' },
    sources: {
      census: { name: { EN: 'Census & LGD', BN: 'আদমশুমারি ও LGD', HI: 'जनगणना और LGD' }, desc: { EN: 'Population, households, villages', BN: 'জনসংখ্যা, পরিবার, গ্রাম', HI: 'जनसंख्या, परिवार, गांव' } },
      udyam: { name: { EN: 'UDYAM / MSME', BN: 'উদ্যম / MSME', HI: 'उद्यम / MSME' }, desc: { EN: 'Formal enterprise registrations', BN: 'আনুষ্ঠানিক এন্টারপ্রাইজ নিবন্ধন', HI: 'औपचारिक उद्यम पंजीकरण' } },
      livestock: { name: { EN: 'Livestock & Crop Data', BN: 'প্রাণিসম্পদ ও ফসলের তথ্য', HI: 'पशुधन और फसल डेटा' }, desc: { EN: 'Dairy, poultry and farm supply', BN: 'ডেইরি, পোল্ট্রি এবং খামার সরবরাহ', HI: 'डेयरी, मुर्गी पालन और कृषि आपूर्ति' } },
      agmarknet: { name: { EN: 'AGMARKNET', BN: 'AGMARKNET', HI: 'AGMARKNET' }, desc: { EN: 'Daily mandi commodity prices', BN: 'দৈনিক মান্ডি পণ্যের দাম', HI: 'दैनिक मंडी वस्तुओं की कीमतें' } },
      community: { name: { EN: 'Community Reports', BN: 'সম্প্রদায়ের প্রতিবেদন', HI: 'सामुदायिक रिपोर्ट' }, desc: { EN: 'Local informal businesses', BN: 'স্থানীয় অনানুষ্ঠানিক ব্যবসা', HI: 'स्थानीय अनौपचारिक व्यवसाय' } },
      ai: { name: { EN: 'AI Inference', BN: 'এআই অনুমান', HI: 'एआई अनुमान' }, desc: { EN: 'Best-effort estimates, clearly labelled', BN: 'সর্বোত্তম প্রচেষ্টার অনুমান, স্পষ্টভাবে চিহ্নিত', HI: 'सर्वोत्तम प्रयास अनुमान, स्पष्ट रूप से लेबल किए गए' } }
    }
  },

  // ─── Stats Section ───
  trustStats: {
    villages: { EN: 'Villages Mapped', BN: 'গ্রাম ম্যাপ করা হয়েছে', HI: 'गांव मैप किए गए' },
    govtData: { EN: 'Official Govt. Data Sources', BN: 'সরকারি তথ্যের উৎস', HI: 'आधिकारिक सरकारी डेटा स्रोत' },
    businessCategories: { EN: 'Business Categories', BN: 'ব্যবসার বিভাগ', HI: 'व्यवसाय श्रेणियां' },
    schemes: { EN: 'Matched Govt. Schemes', BN: 'মিলিত সরকারি প্রকল্প', HI: 'मिलान की गई सरकारी योजनाएं' },
  },

  // ─── CTA Section ───
  cta: {
    sectionLabel: { EN: 'Get Started Free', BN: 'বিনামূল্যে শুরু করুন', HI: 'मुफ्त शुरू करें' },
    headline: { EN: 'Your market has an answer.', BN: 'আপনার বাজারের কাছে একটি উত্তর আছে।', HI: 'आपके बाजार के पास एक उत्तर है।' },
    subheadline: { EN: 'Answer three simple questions and get a feasibility verdict, scheme-matched financial plan and a 30-day funding roadmap — in minutes, on your phone.', BN: 'তিনটি সহজ প্রশ্নের উত্তর দিন এবং একটি সম্ভাব্যতার রায়, প্রকল্প-মিলিত আর্থিক পরিকল্পনা এবং একটি ৩০ দিনের অর্থায়ন রোডম্যাপ পান — কয়েক মিনিটের মধ্যে, আপনার ফোনে।', HI: 'तीन सरल प्रश्नों के उत्तर दें और एक व्यवहार्यता निर्णय, योजना-मिलान वित्तीय योजना और 30-दिवसीय फंडिंग रोडमैप प्राप्त करें — मिनटों में, अपने फोन पर।' },
    primaryBtn: { EN: 'Begin My Assessment', BN: 'আমার মূল্যায়ন শুরু করুন', HI: 'मेरा मूल्यांकन शुरू करें' },
    secondaryBtn: { EN: 'View Sample Report', BN: 'নমুনা রিপোর্ট দেখুন', HI: 'नमूना रिपोर्ट देखें' },
    disclaimer: { EN: 'No registration required to start. Login only to save your report.', BN: 'শুরু করার জন্য কোন নিবন্ধনের প্রয়োজন নেই। শুধুমাত্র আপনার রিপোর্ট সংরক্ষণ করার জন্য লগইন করুন।', HI: 'शुरू करने के लिए किसी पंजीकरण की आवश्यकता नहीं है। केवल अपनी रिपोर्ट सहेजने के लिए लॉगिन करें।' }
  },

  // ─── Photo Gallery Section ───
  photoGallery: {
    sectionLabel: { EN: 'What We Offer', BN: 'আমরা যা অফার করি', HI: 'हम क्या प्रदान करते हैं' },
    cards: {
      card1: {
        tag: { EN: 'Market Intelligence', BN: 'বাজার তথ্য', HI: 'बाजार बुद्धिमत्ता' },
        title: { EN: 'Hyper-Local Business Data for Every Village', BN: 'প্রতিটি গ্রামের জন্য হাইপার-লোকাল ব্যবসার ডেটা', HI: 'हर गांव के लिए हाइपर-लोकल बिजनेस डेटा' },
        desc: { EN: 'Census population, amenities, crop patterns, livestock counts and road access — all within your 10 km catchment.', BN: 'আদমশুমারি জনসংখ্যা, সুযোগ-সুবিধা, ফসলের ধরণ, গবাদি পশুর সংখ্যা এবং রাস্তার অ্যাক্সেস — সবই আপনার ১০ কিমি ক্যাচমেন্টের মধ্যে।', HI: 'जनगणना जनसंख्या, सुविधाएं, फसल पैटर्न, पशुधन गणना और सड़क पहुंच — सब कुछ आपके 10 किमी जलग्रहण क्षेत्र के भीतर।' },
      },
      card2: {
        tag: { EN: 'Action Plan', BN: 'কর্মপরিকল্পনা', HI: 'कार्य योजना' },
        title: { EN: '30-Day Funding Readiness Roadmap', BN: '৩০-দিনের অর্থায়ন প্রস্তুতির রোডম্যাপ', HI: '30-दिवसीय फंडिंग तैयारी रोडमैप' },
        desc: { EN: 'Step-by-step milestones: quotations, UDYAM registration, scheme application, and bank submission — all in one checklist.', BN: 'ধাপে ধাপে মাইলফলক: কোটেশন, UDYAM রেজিস্ট্রেশন, স্কিম অ্যাপ্লিকেশন, এবং ব্যাঙ্কে জমা — সবকিছু একটি চেকলিস্টে।', HI: 'चरण-दर-चरण मील के पत्थर: कोटेशन, उद्यम पंजीकरण, योजना आवेदन, और बैंक में जमा — सब कुछ एक चेकलिस्ट में।' },
      },
      card3: {
        tag: { EN: 'Scheme Matching', BN: 'প্রকল্প মেলানো', HI: 'योजना मिलान' },
        title: { EN: 'Automatic Government Scheme Eligibility', BN: 'স্বয়ংক্রিয় সরকারি প্রকল্পের যোগ্যতা', HI: 'स्वचालित सरकारी योजना पात्रता' },
        desc: { EN: 'PMEGP, MUDRA, Stand-Up India, PMFME and 44 more — matched to your age, category, location and project cost.', BN: 'PMEGP, MUDRA, Stand-Up India, PMFME এবং আরও ৪৪টি — আপনার বয়স, বিভাগ, অবস্থান এবং প্রকল্প ব্যয়ের সাথে মেলানো।', HI: 'PMEGP, MUDRA, Stand-Up India, PMFME और 44 अन्य — आपकी आयु, श्रेणी, स्थान और परियोजना लागत से मेल खाते हुए।' },
      }
    },
    knowMore: { EN: 'Know More', BN: 'আরও জানুন', HI: 'और जानें' },
    strip: {
      img1Label: { EN: 'Rural Entrepreneurs', BN: 'গ্রামীণ উদ্যোক্তারা', HI: 'ग्रामीण उद्यमी' },
      img2Label: { EN: 'Field Assessment', BN: 'মাঠ পর্যায়ের মূল্যায়ন', HI: 'क्षेत्र मूल्यांकन' },
      img3Label: { EN: 'Market Survey', BN: 'বাজার জরিপ', HI: 'बाजार सर्वेक्षण' }
    }
  },

  // ─── Footer ───
  footer: {
    quickLinks:     { EN: 'Quick Links',           BN: 'দ্রুত লিঙ্ক',           HI: 'त्वरित लिंक' },
    dataSources:    { EN: 'Data Sources',           BN: 'তথ্যসূত্র',           HI: 'डेटा स्रोत' },
    legal:          { EN: 'Legal',                  BN: 'আইনি',                  HI: 'कानूनी' },
    census:         { EN: 'Census of India',        BN: 'ভারতের আদমশুমারি',        HI: 'भारत की जनगणना' },
    udyam:          { EN: 'UDYAM / MSME Registry',  BN: 'উদ্যম / MSME নিবন্ধন',  HI: 'उद्यम / MSME रजिस्ट्री' },
    agmarknet:      { EN: 'AGMARKNET (Mandi Prices)', BN: 'AGMARKNET (মান্ডি মূল্য)', HI: 'AGMARKNET (मंडी मूल्य)' },
    livestock:      { EN: 'Livestock Census',       BN: 'প্রাণিসম্পদ শুমারি',       HI: 'पशुधन गणना' },
    pmgsy:          { EN: 'PMGSY Road Network',     BN: 'PMGSY সড়ক নেটওয়ার্ক',     HI: 'PMGSY सड़क नेटवर्क' },
    privacy:        { EN: 'Privacy Policy',         BN: 'গোপনীয়তা নীতি',         HI: 'गोपनीयता नीति' },
    terms:          { EN: 'Terms of Use',           BN: 'ব্যবহারের শর্তাবলী',           HI: 'उपयोग की शर्तें' },
    disclaimer:     { EN: 'Disclaimer',             BN: 'দাবিত্যাগ',             HI: 'अस्वीकरण' },
    accessibility:  { EN: 'Accessibility Statement', BN: 'অ্যাক্সেসিবিলিটি বিবৃতি', HI: 'पहुंच क्षमता बयान' },
    contact:        { EN: 'Contact Us',             BN: 'যোগাযোগ করুন',             HI: 'संपर्क करें' },
    description:    { EN: 'Evidence-backed business intelligence for rural and semi-urban entrepreneurs across India.',
                      BN: 'ভারতজুড়ে গ্রামীণ ও আধা-শহুরে উদ্যোক্তাদের জন্য প্রমাণ-ভিত্তিক ব্যবসায়িক তথ্য।',
                      HI: 'पूरे भारत में ग्रामीण और अर्ध-शहरी उद्यमियों के लिए साक्ष्य-समर्थित व्यापार खुफिया।' },
    govLine:        { EN: 'ArthSetu — for aspiring rural entrepreneurs',
                      BN: 'ArthSetu — আশীয়ান উদ্যোক্তাদের জন্য',
                      HI: 'ArthSetu — महत्वाकांक्षी ग्रामीण उद्यमियों के लिए' },
    startAssessment:{ EN: 'Start Assessment',       BN: 'মূল্যায়ন শুরু করুন',       HI: 'मूल्यांकन शुरू करें' },
    sampleReport:   { EN: 'Sample Report',          BN: 'নমুনা রিপোর্ট',          HI: 'नमूना रिपोर्ट' },
    profileSettings:{ EN: 'Profile & Settings',     BN: 'প্রোফাইল ও সেটিংস',     HI: 'प्रोफ़ाइल और सेटिंग्स' },
  },

  // ─── Wizard Progress Steps ───
  wizard: {
    stepLocation:  { EN: 'Location',     BN: 'অবস্থান',     HI: 'स्थान' },
    stepBusiness:  { EN: 'Business',     BN: 'ব্যবসা',     HI: 'व्यापार' },
    stepCapital:   { EN: 'Capital',      BN: 'মূলধন',      HI: 'पूंजी' },
    stepReview:    { EN: 'Review',       BN: 'পর্যালোচনা',       HI: 'समीक्षा' },
    pageTitle:     { EN: 'Business Feasibility Assessment', BN: 'ব্যবসা সম্ভাব্যতা মূল্যায়ন', HI: 'व्यापार व्यवहार्यता मूल्यांकन' },
    pageDescription: { EN: 'Answer a few questions to get a data-backed viability report for your business idea.',
                       BN: 'আপনার ব্যবসার ধারণার জন্য তথ্য-ভিত্তিক সম্ভাব্যতা রিপোর্ট পেতে কিছু প্রশ্নের উত্তর দিন।',
                       HI: 'अपने व्यवसाय विचार के लिए डेटा-समर्थित व्यवहार्यता रिपोर्ट प्राप्त करने के लिए कुछ प्रश्नों के उत्तर दें।' },
    assessmentSteps: { EN: 'Assessment Steps', BN: 'মূল্যায়নের ধাপসমূহ', HI: 'मूल्यांकन के चरण' },
    inProgress:    { EN: 'In Progress', BN: 'চলমান', HI: 'प्रगति पर है' },
    completed:     { EN: 'Completed', BN: 'সম্পন্ন', HI: 'पूर्ण हुआ' },
    progress:      { EN: 'Progress', BN: 'অগ্রগতি', HI: 'प्रगति' },
    stepTitles: {
      EN: ['Location', 'Business', 'Capital', 'Review'],
      BN: ['অবস্থান', 'ব্যবসা', 'মূলধন', 'পর্যালোচনা'],
      HI: ['स्थान', 'व्यापार', 'पूंजी', 'समीक्षा']
    },
    stepDescriptions: {
      EN: ['Choose location', 'Business details', 'Financial info', 'Final check'],
      BN: ['অবস্থান নির্বাচন করুন', 'ব্যবসার বিবরণ', 'আর্থিক তথ্য', 'চূড়ান্ত যাচাই'],
      HI: ['स्थान चुनें', 'व्यवसाय विवरण', 'वित्तीय जानकारी', 'अंतिम जांच']
    },
  },

  // ─── Step: Location ───
  location: {
    searchLabel:       { EN: 'Search Village / Town',              BN: 'গ্রাম / শহর খুঁজুন',              HI: 'गांव / कस्बा खोजें' },
    searchHint:        { EN: 'Type at least 2 characters to search across 6,40,000+ villages',
                         BN: '৬,৪০,০০০+ গ্রামের মধ্যে খুঁজতে কমপক্ষে ২টি অক্ষর টাইপ করুন',
                         HI: '6,40,000+ गांवों में खोजने के लिए कम से कम 2 अक्षर टाइप करें' },
    searchPlaceholder: { EN: 'e.g. Bishnupur, Baruipur, Katwa...', BN: 'যেমন বিষ্ণুপুর, বারুইপুর, কাটোয়া...', HI: 'जैसे बिष्णुपुर, बारुईपुर, कटवा...' },
    searchError:       { EN: 'Unable to search villages. Please make sure the backend is running.',
                         BN: 'গ্রাম খুঁজতে অক্ষম। অনুগ্রহ করে ব্যাকএন্ড চালু আছে কিনা নিশ্চিত করুন।',
                         HI: 'गांव खोजने में असमर्थ। कृपया सुनिश्चित करें कि बैकएंड चल रहा है।' },
    noResults:         { EN: 'No villages found for',              BN: 'কোনো গ্রাম পাওয়া যায়নি',              HI: 'कोई गांव नहीं मिला' },
    tryAnother:        { EN: '. Try another name or pin a location on the map below.',
                         BN: '। অন্য নাম চেষ্টা করুন বা নিচের মানচিত্রে একটি অবস্থান পিন করুন।',
                         HI: '। कोई अन्य नाम आज़माएं या नीचे मानचित्र पर कोई स्थान पिन करें।' },
    pinnedOnMap:       { EN: 'Pinned on map',                      BN: 'মানচিত্রে পিন করা হয়েছে',                      HI: 'मानचित्र पर पिन किया गया' },
    noCoords:          { EN: 'Could not find coordinates — pin a location on the map below.',
                         BN: 'স্থানাঙ্ক পাওয়া যায়নি — নিচের মানচিত্রে একটি অবস্থান পিন করুন।',
                         HI: 'निर्देशांक नहीं मिल सके — नीचे मानचित्र पर एक स्थान पिन करें।' },
    geocoding:         { EN: 'Looking up village coordinates...',   BN: 'গ্রামের স্থানাঙ্ক খুঁজছি...',   HI: 'गांव के निर्देशांक ढूंढ रहे हैं...' },
    villageLocation:   { EN: 'Village location',                   BN: 'গ্রামের অবস্থান',                   HI: 'गांव का स्थान' },
    autoPinned:        { EN: 'Auto-pinned from selected village',  BN: 'নির্বাচিত গ্রাম থেকে স্বয়ংক্রিয়ভাবে পিন করা হয়েছে',  HI: 'चयनित गांव से स्वतः पिन किया गया' },
    orPinOnMap:        { EN: 'Or pin on map',                      BN: 'অথবা মানচিত্রে পিন করুন',                      HI: 'या मानचित्र पर पिन करें' },
    clickToSet:        { EN: 'Click anywhere on the map to set your location',
                         BN: 'আপনার অবস্থান নির্ধারণ করতে মানচিত্রে যেকোনো জায়গায় ক্লিক করুন',
                         HI: 'अपना स्थान निर्धारित करने के लिए मानचित्र पर कहीं भी क्लिक करें' },
    pinnedLocation:    { EN: 'Pinned location',                    BN: 'পিন করা অবস্থান',                    HI: 'पिन किया गया स्थान' },
    catchmentNote:     { EN: 'Analysis will use these coordinates for your catchment area.',
                         BN: 'বিশ্লেষণ আপনার ক্যাচমেন্ট এলাকার জন্য এই স্থানাঙ্ক ব্যবহার করবে।',
                         HI: 'विश्लेषण आपके जलग्रहण क्षेत्र के लिए इन निर्देशांकों का उपयोग करेगा।' },
    continueToBiz:     { EN: 'Continue to Business',               BN: 'ব্যবসায় এগিয়ে যান',               HI: 'व्यापार के लिए जारी रखें' },
    block:             { EN: 'Block',                              BN: 'ব্লক',                              HI: 'ब्लॉक' },
    district:          { EN: 'District',                           BN: 'জেলা',                           HI: 'जिला' },
  },

  // ─── Step: Business ───
  business: {
    selectCategory:  { EN: 'Select Business Category',     BN: 'ব্যবসার ধরন নির্বাচন করুন',     HI: 'व्यापार श्रेणी चुनें' },
    categoryHint:    { EN: 'Choose the category that best matches your business idea.',
                       BN: 'আপনার ব্যবসার ধারণার সাথে সবচেয়ে ভালো মিলে এমন ধরন বেছে নিন।',
                       HI: 'वह श्रेणी चुनें जो आपके व्यापार विचार से सबसे अच्छी तरह मेल खाती हो।' },
    describeIdea:    { EN: 'Describe Your Business Idea',  BN: 'আপনার ব্যবসার ধারণা বর্ণনা করুন',  HI: 'अपने व्यापार विचार का वर्णन करें' },
    ideaPlaceholder: { EN: 'e.g. I want to start a small dairy farm with 5 cows and sell fresh milk to nearby villages...',
                       BN: 'যেমন: আমি ৫টি গরু নিয়ে একটি ছোট দুগ্ধ খামার শুরু করতে চাই এবং কাছের গ্রামে তাজা দুধ বিক্রি করতে চাই...',
                       HI: 'जैसे: मैं 5 गायों के साथ एक छोटा डेयरी फार्म शुरू करना चाहता हूं और आस-पास के गांवों में ताजा दूध बेचना चाहता हूं...' },
    ideaHint:        { EN: 'The more detail you provide, the better our analysis will be.',
                       BN: 'আপনি যত বেশি বিস্তারিত দেবেন, আমাদের বিশ্লেষণ তত ভালো হবে।',
                       HI: 'आप जितना अधिक विवरण देंगे, हमारा विश्लेषण उतना ही बेहतर होगा।' },
    continueToCapital: { EN: 'Continue to Capital',        BN: 'মূলধনে এগিয়ে যান',        HI: 'पूंजी के लिए जारी रखें' },
    voiceBtn:        { EN: 'Voice Input',                  BN: 'ভয়েস ইনপুট',                  HI: 'वॉयस इनपुट' },
    voiceListening:  { EN: 'Listening... Speak in Bengali or English', BN: 'শুনছি... বাংলা বা ইংরেজিতে বলুন', HI: 'सुन रहा है... हिंदी, बंगाली या अंग्रेजी में बोलें' },
    voiceStop:       { EN: 'Stop Recording',               BN: 'থামুন',               HI: 'रिकॉर्डिंग बंद करें' },
    voiceProcessing: { EN: 'AI Refining voice & local accent...', BN: 'AI দিয়ে আঞ্চলিক ভাষা ও ভয়েস রূপান্তর হচ্ছে...', HI: 'AI आवाज और स्थानीय उच्चारण को परिष्कृत कर रहा है...' },
    voiceRefined:    { EN: '✓ Auto-refined into standard text', BN: '✓ স্বয়ংক্রিয়ভাবে প্রমিত বাংলায় রূপান্তরিত', HI: '✓ मानक पाठ में स्वतः परिष्कृत' },
    voiceError:      { EN: 'Could not access microphone',   BN: 'মাইক্রোফোন সংযোগ করা যায়নি',   HI: 'माइक्रोफ़ोन तक नहीं पहुंच सका' },

    categories: {
      DAIRY:               { EN: 'Dairy',                  BN: 'দুগ্ধ',                  HI: 'डेयरी' },
      FOOD_PROCESSING:     { EN: 'Food Processing',        BN: 'খাদ্য প্রক্রিয়াকরণ',        HI: 'खाद्य प्रसंस्करण' },
      RETAIL:              { EN: 'Retail Shop',            BN: 'খুচরা দোকান',            HI: 'खुदरा दुकान' },
      TEXTILES_TAILORING:  { EN: 'Textiles & Tailoring',   BN: 'বস্ত্র ও সেলাই',   HI: 'वस्त्र और सिलाई' },
      POULTRY:             { EN: 'Poultry',                BN: 'হাঁস-মুরগি',                HI: 'मुर्गी पालन' },
      AGRICULTURE:         { EN: 'Agriculture',            BN: 'কৃষি',            HI: 'कृषि' },
      LIVESTOCK:           { EN: 'Livestock',              BN: 'প্রাণিসম্পদ',              HI: 'पशुधन' },
      TRANSPORT:           { EN: 'Transport',              BN: 'পরিবহন',              HI: 'परिवहन' },
      HANDICRAFT:          { EN: 'Handicraft',             BN: 'হস্তশিল্প',             HI: 'हस्तशिल्प' },
      SERVICES:            { EN: 'Services',               BN: 'সেবা',               HI: 'सेवाएं' },
      OTHER:               { EN: 'Other',                  BN: 'অন্যান্য',                  HI: 'अन्य' },
    },
  },

  // ─── Step: Capital ───
  capital: {
    title:             { EN: 'Financial & Personal Details', BN: 'আর্থিক ও ব্যক্তিগত বিবরণ', HI: 'वित्तीय और व्यक्तिगत विवरण' },
    availableCapital:  { EN: 'Available Capital (₹)',        BN: 'উপলব্ধ মূলধন (₹)',        HI: 'उपलब्ध पूंजी (₹)' },
    capitalHint:       { EN: 'How much money can you invest to start this business?',
                         BN: 'এই ব্যবসা শুরু করতে আপনি কত টাকা বিনিয়োগ করতে পারবেন?',
                         HI: 'यह व्यवसाय शुरू करने के लिए आप कितना पैसा निवेश कर सकते हैं?' },
    capitalPlaceholder:{ EN: 'e.g. 50000',                  BN: 'যেমন ৫০০০০',                  HI: 'जैसे 50000' },
    catchmentRadius:   { EN: 'Catchment Radius (km)',       BN: 'ক্যাচমেন্ট ব্যাসার্ধ (কিমি)',       HI: 'जलग्रहण त्रिज्या (किमी)' },
    radiusHint:        { EN: 'How far will you serve customers?',
                         BN: 'আপনি কত দূর পর্যন্ত গ্রাহকদের সেবা দেবেন?',
                         HI: 'आप ग्राहकों की कितनी दूर तक सेवा करेंगे?' },
    experience:        { EN: 'Business Experience',         BN: 'ব্যবসার অভিজ্ঞতা',         HI: 'व्यापार का अनुभव' },
    expPlaceholder:    { EN: 'e.g. 2 years in dairy, no prior business...',
                         BN: 'যেমন: দুগ্ধে ২ বছর, আগে কোনো ব্যবসা নেই...',
                         HI: 'जैसे: डेयरी में 2 वर्ष, कोई पूर्व व्यवसाय नहीं...' },
    land:              { EN: 'Available Land',              BN: 'উপলব্ধ জমি',              HI: 'उपलब्ध भूमि' },
    landPlaceholder:   { EN: 'e.g. 0.5 acre, own land...',  BN: 'যেমন: ০.৫ একর, নিজের জমি...',  HI: 'जैसे: 0.5 एकड़, अपनी जमीन...' },
    equipment:         { EN: 'Available Equipment',         BN: 'উপলব্ধ যন্ত্রপাতি',         HI: 'उपलब्ध उपकरण' },
    equipPlaceholder:  { EN: 'e.g. None, some basic tools...', BN: 'যেমন: নেই, কিছু সাধারণ সরঞ্জাম...', HI: 'जैसे: कोई नहीं, कुछ बुनियादी उपकरण...' },
    workingHours:      { EN: 'Expected Working Hours/Day',  BN: 'প্রত্যাশিত কর্মঘণ্টা/দিন',  HI: 'अपेक्षित कार्य घंटे/दिन' },
    hoursPlaceholder:  { EN: 'e.g. 8',                      BN: 'যেমন ৮',                      HI: 'जैसे 8' },
    personalOptional:  { EN: 'Personal Details (optional — helps scheme matching)',
                         BN: 'ব্যক্তিগত বিবরণ (ঐচ্ছিক — প্রকল্প মেলানোতে সাহায্য করে)',
                         HI: 'व्यक्तिगत विवरण (वैकल्पिक — योजना मिलान में मदद करता है)' },
    gender:            { EN: 'Gender',                      BN: 'লিঙ্গ',                      HI: 'लिंग' },
    genderMale:        { EN: 'Male',                        BN: 'পুরুষ',                        HI: 'पुरुष' },
    genderFemale:      { EN: 'Female',                      BN: 'মহিলা',                      HI: 'महिला' },
    genderOther:       { EN: 'Other',                       BN: 'অন্যান্য',                       HI: 'अन्य' },
    socialCategory:    { EN: 'Social Category',             BN: 'সামাজিক বিভাগ',             HI: 'सामाजिक श्रेणी' },
    general:           { EN: 'General',                     BN: 'সাধারণ',                     HI: 'सामान्य' },
    minority:          { EN: 'Minority',                    BN: 'সংখ্যালঘু',                    HI: 'अल्पसंख्यक' },
    isMinority:        { EN: 'I belong to a minority community',
                         BN: 'আমি একটি সংখ্যালঘু সম্প্রদায়ের অন্তর্ভুক্ত',
                         HI: 'मैं अल्पसंख्यक समुदाय से हूं' },
    continueToReview:  { EN: 'Continue to Review',          BN: 'পর্যালোচনায় এগিয়ে যান',          HI: 'समीक्षा के लिए जारी रखें' },
  },

  // ─── Step: Review ───
  review: {
    reviewHint:     { EN: 'Review your inputs below. Once confirmed, we will run the full feasibility analysis — this typically takes 8–15 seconds.',
                      BN: 'নিচে আপনার তথ্য পর্যালোচনা করুন। নিশ্চিত হলে, আমরা সম্পূর্ণ সম্ভাব্যতা বিশ্লেষণ চালাব — এটি সাধারণত ৮-১৫ সেকেন্ড সময় নেয়।',
                      HI: 'नीचे अपने इनपुट की समीक्षा करें। पुष्टि होने के बाद, हम पूर्ण व्यवहार्यता विश्लेषण चलाएंगे — इसमें आमतौर पर 8-15 सेकंड लगते हैं।' },
    locationLabel:  { EN: 'Location',                      BN: 'অবস্থান',                      HI: 'स्थान' },
    businessLabel:  { EN: 'Business Category',             BN: 'ব্যবসার ধরন',             HI: 'व्यापार श्रेणी' },
    capitalLabel:   { EN: 'Available Capital',             BN: 'উপলব্ধ মূলধন',             HI: 'उपलब्ध पूंजी' },
    profileLabel:   { EN: 'Profile',                       BN: 'প্রোফাইল',                       HI: 'प्रोफ़ाइल' },
    whatHappens:    { EN: 'What happens when you click Analyze:', BN: 'বিশ্লেষণ ক্লিক করলে কী হবে:', HI: 'जब आप विश्लेषण पर क्लिक करते हैं तो क्या होता है:' },
    steps: {
      EN: [
        'Market intelligence loaded for your catchment area (Census + AGMARKNET)',
        'Competitor density estimated using UDYAM + community data',
        'Best-match government scheme identified and EMI calculated',
        'AI risk assessment and viability score generated',
        'Full 30-day action plan created',
      ],
      BN: [
        'আপনার ক্যাচমেন্ট এলাকার জন্য বাজার তথ্য লোড করা হয়েছে (আদমশুমারি + AGMARKNET)',
        'UDYAM + কমিউনিটি ডেটা ব্যবহার করে প্রতিযোগীর ঘনত্ব অনুমান করা হয়েছে',
        'সেরা-মিলিত সরকারি প্রকল্প চিহ্নিত এবং EMI গণনা করা হয়েছে',
        'AI ঝুঁকি মূল্যায়ন এবং সম্ভাব্যতা স্কোর তৈরি করা হয়েছে',
        'সম্পূর্ণ ৩০ দিনের কর্ম পরিকল্পনা তৈরি করা হয়েছে',
      ],
      HI: [
        'आपके जलग्रहण क्षेत्र के लिए बाजार बुद्धिमत्ता लोड की गई (जनगणना + AGMARKNET)',
        'UDYAM + सामुदायिक डेटा का उपयोग करके प्रतियोगी घनत्व का अनुमान लगाया गया',
        'सर्वोत्तम-मिलान सरकारी योजना की पहचान की गई और EMI की गणना की गई',
        'AI जोखिम मूल्यांकन और व्यवहार्यता स्कोर उत्पन्न किया गया',
        'पूर्ण 30-दिवसीय कार्य योजना बनाई गई',
      ]
    },
    runAnalysis:    { EN: 'Run Feasibility Analysis',      BN: 'সম্ভাব্যতা বিশ্লেষণ চালান',      HI: 'व्यवहार्यता विश्लेषण चलाएं' },
    analyzing:      { EN: 'Analyzing...',                  BN: 'বিশ্লেষণ চলছে...',                  HI: 'विश्लेषण कर रहा है...' },
    errorNoCoords:  { EN: 'Please go back and choose a village with coordinates before analyzing.',
                      BN: 'অনুগ্রহ করে পিছনে গিয়ে বিশ্লেষণের আগে স্থানাঙ্কসহ একটি গ্রাম নির্বাচন করুন।',
                      HI: 'कृपया वापस जाएं और विश्लेषण से पहले निर्देशांक वाले गांव का चयन करें।' },
    errorNoIdea:    { EN: 'Please describe your business idea (at least 2 characters).',
                      BN: 'অনুগ্রহ করে আপনার ব্যবসার ধারণা বর্ণনা করুন (কমপক্ষে ২টি অক্ষর)।',
                      HI: 'कृपया अपने व्यवसाय विचार का वर्णन करें (कम से कम 2 अक्षर)।' },
    errorNoCapital: { EN: 'Please enter your available capital before analyzing.',
                      BN: 'অনুগ্রহ করে বিশ্লেষণের আগে আপনার উপলব্ধ মূলধন লিখুন।',
                      HI: 'कृपया विश्लेषण से पहले अपनी उपलब्ध पूंजी दर्ज करें।' },
    errorGeneric:   { EN: 'Something went wrong. Please try again.',
                      BN: 'কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                      HI: 'कुछ गलत हो गया। कृपया पुन: प्रयास करें।' },
  },

  // ─── Feasibility Report ───
  report: {
    title:           { EN: 'Feasibility Report',           BN: 'সম্ভাব্যতা রিপোর্ট',           HI: 'व्यवहार्यता रिपोर्ट' },
    reportReady:     { EN: 'Your report is ready! It has been saved to your account.',
                       BN: 'আপনার রিপোর্ট তৈরি! এটি আপনার অ্যাকাউন্টে সংরক্ষিত হয়েছে।',
                       HI: 'आपकी रिपोर्ट तैयार है! इसे आपके खाते में सहेज लिया गया है।' },
    reportReadyGuest:{ EN: 'Your report is ready! It is saved in this tab. Login to keep it permanently.',
                       BN: 'আপনার রিপোর্ট তৈরি! এটি এই ট্যাবে সংরক্ষিত। স্থায়ীভাবে রাখতে লগইন করুন।',
                       HI: 'आपकी रिपोर्ट तैयार है! यह इस टैब में सहेजी गई है। इसे स्थायी रूप से रखने के लिए लॉगिन करें।' },
    saveReport:      { EN: 'Save this report',             BN: 'এই রিপোর্ট সংরক্ষণ করুন',             HI: 'इस रिपोर्ट को सहेजें' },
    notFound:        { EN: 'Report not found',             BN: 'রিপোর্ট পাওয়া যায়নি',             HI: 'रिपोर्ट नहीं मिली' },
    notFoundDesc:    { EN: 'This report is linked to a logged-in user account, or it has been cleaned up. Start a new assessment to generate a fresh report.',
                       BN: 'এই রিপোর্টটি একটি লগইন করা ব্যবহারকারীর অ্যাকাউন্টের সাথে সংযুক্ত, অথবা এটি মুছে ফেলা হয়েছে। একটি নতুন রিপোর্ট তৈরি করতে নতুন মূল্যায়ন শুরু করুন।',
                       HI: 'यह रिपोर्ट एक लॉग इन उपयोगकर्ता खाते से जुड़ी है, या इसे हटा दिया गया है। एक नई रिपोर्ट तैयार करने के लिए एक नया मूल्यांकन शुरू करें।' },
    verdict:         { EN: 'Verdict',                      BN: 'রায়',                      HI: 'निर्णय' },
    proceed:         { EN: 'PROCEED',                      BN: 'এগিয়ে যান',                      HI: 'आगे बढ़ें' },
    caution:         { EN: 'CAUTION',                      BN: 'সতর্কতা',                      HI: 'सावधानी' },
    notViable:       { EN: 'NOT VIABLE',                   BN: 'সম্ভব নয়',                   HI: 'व्यवहार्य नहीं' },
    good:            { EN: 'GOOD',                         BN: 'ভালো',                         HI: 'अच्छा' },
    fair:            { EN: 'FAIR',                         BN: 'মোটামুটি',                         HI: 'ठीक-ठाक' },
    poor:            { EN: 'POOR',                         BN: 'দুর্বল',                         HI: 'खराब' },
    highConf:        { EN: 'High Confidence',              BN: 'উচ্চ আস্থা',              HI: 'उच्च विश्वास' },
    medConf:         { EN: 'Medium Confidence',            BN: 'মাঝারি আস্থা',            HI: 'मध्यम विश्वास' },
    lowConf:         { EN: 'Low Confidence',               BN: 'নিম্ন আস্থা',               HI: 'निम्न विश्वास' },
    localSuppliers:  { EN: 'Local Suppliers',              BN: 'স্থানীয় সরবরাহকারী',              HI: 'स्थानीय आपूर्तिकर्ता' },
    hyperlocalTitle: { EN: 'Hyperlocal UDYAM & MSME Registered Business Explorer', BN: 'স্থানীয় উদ্যম এবং MSME নিবন্ধিত ব্যবসা এক্সপ্লোরার', HI: 'हाइपरलोकल उद्यम और MSME पंजीकृत व्यापार अन्वेषक' },
  },

  // ─── Score Breakdown ───
  scores: {
    title:           { EN: 'Viability Score Breakdown',    BN: 'সম্ভাব্যতা স্কোর বিশ্লেষণ',    HI: 'व्यवहार्यता स्कोर विश्लेषण' },
    subtitle:        { EN: 'Five dimensions, each scored /20.', BN: 'পাঁচটি মাত্রা, প্রতিটি /২০ নম্বরে।', HI: 'पांच आयाम, प्रत्येक को /20 अंक दिए गए हैं।' },
    marketDemand:    { EN: 'Market Demand',                BN: 'বাজারের চাহিদা',                HI: 'बाजार की मांग' },
    competition:     { EN: 'Competition',                  BN: 'প্রতিযোগিতা',                  HI: 'प्रतियोगिता' },
    financialViability: { EN: 'Financial Viability',       BN: 'আর্থিক সম্ভাব্যতা',       HI: 'वित्तीय व्यवहार्यता' },
    capitalAdequacy: { EN: 'Capital Adequacy',             BN: 'মূলধন পর্যাপ্ততা',             HI: 'पूंजी पर्याप्तता' },
    riskResilience:  { EN: 'Risk Resilience',              BN: 'ঝুঁকি সহনশীলতা',              HI: 'जोखिम लचीलापन' },
  },

  // ─── Market Intelligence ───
  market: {
    title:           { EN: 'Market Intelligence',          BN: 'বাজার তথ্য',          HI: 'बाजार बुद्धिमत्ता' },
    subtitle:        { EN: 'Demographics and infrastructure within the catchment area.',
                       BN: 'ক্যাচমেন্ট এলাকার জনসংখ্যা ও অবকাঠামো।',
                       HI: 'जलग्रहण क्षेत्र के भीतर जनसांख्यिकी और बुनियादी ढांचा।' },
    totalPopulation: { EN: 'Total Population',             BN: 'মোট জনসংখ্যা',             HI: 'कुल जनसंख्या' },
    totalHouseholds: { EN: 'Total Households',             BN: 'মোট পরিবার',             HI: 'कुल परिवार' },
    literacyRate:    { EN: 'Literacy Rate',                BN: 'সাক্ষরতার হার',                HI: 'साक्षरता दर' },
    observed:        { EN: 'Observed',                     BN: 'পর্যবেক্ষিত',                     HI: 'देखा गया' },
    estimated:       { EN: 'Estimated',                    BN: 'আনুমানিক',                    HI: 'अनुमानित' },
    topCrops:        { EN: 'Top Crops',                    BN: 'প্রধান ফসল',                    HI: 'शीर्ष फसलें' },
    noCropData:      { EN: 'No crop data available.',      BN: 'কোনো ফসলের তথ্য পাওয়া যায়নি।',      HI: 'कोई फसल डेटा उपलब्ध नहीं है।' },
    livestock:       { EN: 'Livestock',                    BN: 'প্রাণিসম্পদ',                    HI: 'पशुधन' },
    noLivestockData: { EN: 'No livestock data available.', BN: 'কোনো প্রাণিসম্পদের তথ্য পাওয়া যায়নি।', HI: 'कोई पशुधन डेटा उपलब्ध नहीं है।' },
    infrastructure:  { EN: 'Infrastructure',               BN: 'অবকাঠামো',               HI: 'बुनियादी ढांचा' },
  },

  // ─── Competition ───
  competition: {
    title:         { EN: 'Competition & Opportunities',    BN: 'প্রতিযোগিতা ও সুযোগ',    HI: 'प्रतियोगिता और अवसर' },
    competitors:   { EN: 'Existing Competitors',           BN: 'বিদ্যমান প্রতিযোগী',           HI: 'मौजूदा प्रतियोगी' },
    marketGaps:    { EN: 'Market Gaps',                    BN: 'বাজারের ফাঁক',                    HI: 'बाजार अंतराल' },
    noCompetitors: { EN: 'No registered competitors found in the catchment area.',
                     BN: 'ক্যাচমেন্ট এলাকায় কোনো নিবন্ধিত প্রতিযোগী পাওয়া যায়নি।',
                     HI: 'जलग्रहण क्षेत्र में कोई पंजीकृत प्रतियोगी नहीं मिला।' },
    noGaps:        { EN: 'No market gaps identified.',     BN: 'কোনো বাজারের ফাঁক চিহ্নিত হয়নি।',     HI: 'कोई बाजार अंतराल पहचाना नहीं गया।' },
    score:         { EN: 'Score',                          BN: 'স্কোর',                          HI: 'स्कोर' },
    density:       { EN: 'Density',                        BN: 'ঘনত্ব',                        HI: 'घनत्व' },
  },

  // ─── Financial Plan ───
  financial: {
    title:         { EN: 'Financial Plan',                 BN: 'আর্থিক পরিকল্পনা',                 HI: 'वित्तीय योजना' },
    projectCost:   { EN: 'Project Cost',                   BN: 'প্রকল্প খরচ',                   HI: 'परियोजना लागत' },
    monthlyRevenue:{ EN: 'Monthly Revenue (Est.)',         BN: 'মাসিক আয় (আনুমানিক)',         HI: 'मासिक राजस्व (अनुमानित)' },
    monthlyExpense:{ EN: 'Monthly Expenses',               BN: 'মাসিক খরচ',               HI: 'मासिक व्यय' },
    monthlyProfit: { EN: 'Monthly Profit',                 BN: 'মাসিক লাভ',                 HI: 'मासिक लाभ' },
    breakeven:     { EN: 'Break-even',                     BN: 'ব্রেক-ইভেন',                     HI: 'ब्रेक-ईवन' },
    months:        { EN: 'months',                         BN: 'মাস',                         HI: 'महीने' },
    govSchemes:    { EN: 'Government Schemes',             BN: 'সরকারি প্রকল্প',             HI: 'सरकारी योजनाएं' },
    emi:           { EN: 'EMI Calculator',                 BN: 'EMI ক্যালকুলেটর',                 HI: 'EMI कैलकुलेटर' },
    noSchemes:     { EN: 'No matching schemes found.',     BN: 'কোনো সামঞ্জস্যপূর্ণ প্রকল্প পাওয়া যায়নি।',     HI: 'कोई मेल खाने वाली योजना नहीं मिली।' },
  },

  // ─── Risk Assessment ───
  risk: {
    title:        { EN: 'Risk Assessment',                BN: 'ঝুঁকি মূল্যায়ন',                HI: 'जोखिम मूल्यांकन' },
    overallRisk:  { EN: 'Overall Risk Score',             BN: 'সামগ্রিক ঝুঁকি স্কোর',             HI: 'समग्र जोखिम स्कोर' },
    riskFactors:  { EN: 'Risk Factors',                   BN: 'ঝুঁকির কারণসমূহ',                   HI: 'जोखिम कारक' },
    mitigations:  { EN: 'Mitigations',                    BN: 'প্রশমন ব্যবস্থা',                    HI: 'शमन' },
    high:         { EN: 'HIGH',                           BN: 'উচ্চ',                           HI: 'उच्च' },
    medium:       { EN: 'MEDIUM',                         BN: 'মাঝারি',                         HI: 'मध्यम' },
    low:          { EN: 'LOW',                            BN: 'নিম্ন',                            HI: 'निम्न' },
  },

  // ─── AI Recommendation ───
  aiRecommendation: {
    title:        { EN: 'AI Recommendation',              BN: 'AI সুপারিশ',              HI: 'AI अनुशंसा' },
    swot:         { EN: 'SWOT Analysis',                  BN: 'SWOT বিশ্লেষণ',                  HI: 'SWOT विश्लेषण' },
    strengths:    { EN: 'Strengths',                      BN: 'শক্তি',                      HI: 'ताकत' },
    weaknesses:   { EN: 'Weaknesses',                     BN: 'দুর্বলতা',                     HI: 'कमजोरियां' },
    opportunities:{ EN: 'Opportunities',                  BN: 'সুযোগ',                  HI: 'अवसर' },
    threats:      { EN: 'Threats',                        BN: 'হুমকি',                        HI: 'खतरे' },
    reasoning:    { EN: 'Reasoning',                      BN: 'যুক্তি',                      HI: 'तर्क' },
  },

  // ─── Action Plan ───
  actionPlan: {
    title:        { EN: '30-Day Action Plan',             BN: '৩০ দিনের কর্ম পরিকল্পনা',             HI: '30-दिवसीय कार्य योजना' },
    week:         { EN: 'Week',                           BN: 'সপ্তাহ',                           HI: 'सप्ताह' },
    day:          { EN: 'Day',                            BN: 'দিন',                            HI: 'दिन' },
    task:         { EN: 'Task',                           BN: 'কাজ',                           HI: 'कार्य' },
    priority:     { EN: 'Priority',                       BN: 'অগ্রাধিকার',                       HI: 'प्राथमिकता' },
  },

  // ─── Dashboard ───
  dashboard: {
    yourProfile:    { EN: 'Your Profile',                  BN: 'আপনার প্রোফাইল',                  HI: 'आपकी प्रोफ़ाइल' },
    personalDetails:{ EN: 'Personal Details',              BN: 'ব্যক্তিগত বিবরণ',              HI: 'व्यक्तिगत विवरण' },
    phone:          { EN: 'Phone',                         BN: 'ফোন',                         HI: 'फोन' },
    name:           { EN: 'Name',                          BN: 'নাম',                          HI: 'नाम' },
    namePlaceholder:{ EN: 'Your full name',                BN: 'আপনার পুরো নাম',                HI: 'आपका पूरा नाम' },
    email:          { EN: 'Email',                         BN: 'ইমেইল',                         HI: 'ईमेल' },
    dateOfBirth:    { EN: 'Date of Birth',                 BN: 'জন্ম তারিখ',                 HI: 'जन्म तिथि' },
    locationTitle:  { EN: 'Location',                      BN: 'অবস্থান',                      HI: 'स्थान' },
    village:        { EN: 'Village',                       BN: 'গ্রাম',                       HI: 'गांव' },
    villagePh:      { EN: 'Village name',                  BN: 'গ্রামের নাম',                  HI: 'गांव का नाम' },
    block:          { EN: 'Block',                         BN: 'ব্লক',                         HI: 'ब्लॉक' },
    blockPh:        { EN: 'Block / Taluka',                BN: 'ব্লক / তালুক',                HI: 'ब्लॉक / तालुका' },
    district:       { EN: 'District',                      BN: 'জেলা',                      HI: 'जिला' },
    state:          { EN: 'State',                         BN: 'রাজ্য',                         HI: 'राज्य' },
    saveChanges:    { EN: 'Save Changes',                  BN: 'পরিবর্তন সংরক্ষণ করুন',                  HI: 'परिवर्तन सहेजें' },
    saved:          { EN: 'Saved',                         BN: 'সংরক্ষিত',                         HI: 'सहेजा गया' },
    saving:         { EN: 'Saving...',                     BN: 'সংরক্ষণ করা হচ্ছে...',                     HI: 'सहेज रहा है...' },
    changesSavedSuccess: { EN: 'Your changes saved successfully!', BN: 'আপনার পরিবর্তনগুলি সফলভাবে সংরক্ষিত হয়েছে!', HI: 'आपके परिवर्तन सफलतापूर्वक सहेजे गए!' },
    unableToLoad:   { EN: 'Unable to load profile',        BN: 'প্রোফাইল লোড করতে অক্ষম',        HI: 'प्रोफ़ाइल लोड करने में असमर्थ' },
    profileError:   { EN: 'Error loading profile',         BN: 'প্রোফাইল লোড করতে ত্রুটি',         HI: 'प्रोफ़ाइल लोड करने में त्रुटि' },
    dob:            { EN: 'Date of Birth',                 BN: 'জন্ম তারিখ',                 HI: 'जन्म तिथि' },
    locationLabel:  { EN: 'Location',                      BN: 'অবস্থান',                      HI: 'स्थान' },
    villageLabel:   { EN: 'Village',                       BN: 'গ্রাম',                       HI: 'गांव' },
    villagePlaceholder: { EN: 'Village name',              BN: 'গ্রামের নাম',              HI: 'गांव का नाम' },
    villageSearchPlaceholder: { EN: 'Search 6,40,000+ villages…', BN: '৬,৪০,০০০+ গ্রাম খুঁজুন…', HI: '6,40,000+ गांव खोजें…' },
    addNewVillage:  { EN: 'Not found — add "{name}" as a new village', BN: 'পাওয়া যায়নি — "{name}" নতুন গ্রাম হিসেবে যোগ করুন', HI: 'नहीं मिला — "{name}" को एक नए गांव के रूप में जोड़ें' },
    addingVillage:  { EN: 'Adding village & fetching coordinates…', BN: 'গ্রাম যোগ হচ্ছে ও স্থানাঙ্ক সংগ্রহ হচ্ছে…', HI: 'गांव जोड़ रहे हैं और निर्देशांक ला रहे हैं…' },
    villageSaveError: { EN: 'Could not add the village. Try again or type the details manually.', BN: 'গ্রাম যোগ করা যায়নি। আবার চেষ্টা করুন বা বিবরণ ম্যানুয়ালি লিখুন।', HI: 'गांव नहीं जोड़ सका। फिर से प्रयास करें या मैन्युअल रूप से विवरण टाइप करें।' },
    villageReady:   { EN: 'Village coordinates ready ✓',  BN: 'গ্রামের স্থানাঙ্ক প্রস্তুত ✓',  HI: 'गांव के निर्देशांक तैयार ✓' },
    blockLabel:     { EN: 'Block',                         BN: 'ব্লক',                         HI: 'ब्लॉक' },
    blockPlaceholder:{ EN: 'Block / Taluka',               BN: 'ব্লক / তালুক',               HI: 'ब्लॉक / तालुका' },
    districtLabel:  { EN: 'District',                      BN: 'জেলা',                      HI: 'जिला' },
    districtPlaceholder:{ EN: 'District name',             BN: 'জেলার নাম',             HI: 'जिले का नाम' },
    stateLabel:     { EN: 'State',                         BN: 'রাজ্য',                         HI: 'राज्य' },
    statePlaceholder:{ EN: 'State name',                   BN: 'রাজ্যের নাম',                   HI: 'राज्य का नाम' },
    sessionExpired: { EN: 'Your session may have expired. Please login again.',
                      BN: 'আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।',
                      HI: 'आपका सत्र समाप्त हो गया होगा। कृपया फिर से लॉगिन करें।' },
    // Past assessments
    pastAssessments:{ EN: 'Past Assessments',              BN: 'পূর্ববর্তী মূল্যায়ন',              HI: 'पिछले मूल्यांकन' },
    pastAssDesc:    { EN: 'Your previously generated feasibility reports.',
                      BN: 'আপনার পূর্বে তৈরি করা সম্ভাব্যতা রিপোর্ট।',
                      HI: 'आपकी पूर्व जनरेट की गई व्यवहार्यता रिपोर्ट।' },
    noAssessments:  { EN: 'No assessments yet. Start your first one!',
                      BN: 'এখনো কোনো মূল্যায়ন নেই। আপনার প্রথমটি শুরু করুন!',
                      HI: 'अभी तक कोई मूल्यांकन नहीं। अपना पहला शुरू करें!' },
    viewReport:     { EN: 'View Report',                   BN: 'রিপোর্ট দেখুন',                   HI: 'रिपोर्ट देखें' },
    viabilityScore: { EN: 'Viability Score',               BN: 'সম্ভাব্যতা স্কোর',               HI: 'व्यवहार्यता स्कोर' },
  },

  // ─── Schemes Pages ───
  schemes: {
    title: { EN: 'Government Schemes', BN: 'সরকারি প্রকল্পসমূহ', HI: 'सरकारी योजनाएं' },
    subtitle: { EN: 'Browse all active government credit and subsidy schemes available for rural entrepreneurs.', BN: 'গ্রামীণ উদ্যোক্তাদের জন্য উপলব্ধ সমস্ত সক্রিয় সরকারি ঋণ এবং ভর্তুকি প্রকল্পগুলি ব্রাউজ করুন।', HI: 'ग्रामीण उद्यमियों के लिए उपलब्ध सभी सक्रिय सरकारी ऋण और सब्सिडी योजनाओं को ब्राउज़ करें।' },
    loadError: { EN: 'Unable to load schemes. Please ensure the backend is running.', BN: 'প্রকল্পগুলি লোড করা যাচ্ছে না। অনুগ্রহ করে নিশ্চিত করুন যে ব্যাকএন্ড চলছে।', HI: 'योजनाओं को लोड करने में असमर्थ। कृपया सुनिश्चित करें कि बैकएंड चल रहा है।' },
    noSchemes: { EN: 'No schemes available yet.', BN: 'এখনও কোনও প্রকল্প উপলব্ধ নেই।', HI: 'अभी तक कोई योजना उपलब्ध नहीं है।' },
    details: { EN: 'Details', BN: 'বিস্তারিত', HI: 'विवरण' },
    maxLoan: { EN: 'Max Loan', BN: 'সর্বোচ্চ ঋণ', HI: 'अधिकतम ऋण' },
    interest: { EN: 'Interest', BN: 'সুদ', HI: 'ब्याज' },
    interestRate: { EN: 'Interest Rate', BN: 'সুদের হার', HI: 'ब्याज दर' },
    subsidy: { EN: 'Subsidy', BN: 'ভর্তুকি', HI: 'सब्सिडी' },
    tenure: { EN: 'Tenure', BN: 'মেয়াদ', HI: 'कार्यकाल' },
    months: { EN: 'months', BN: 'মাস', HI: 'महीने' },
    applyOnline: { EN: 'Apply Online', BN: 'অনলাইনে আবেদন করুন', HI: 'ऑनलाइन आवेदन करें' },
    allSchemes: { EN: 'All Schemes', BN: 'সমস্ত প্রকল্প', HI: 'सभी योजनाएं' },
    notFoundTitle: { EN: 'Scheme not found', BN: 'প্রকল্প পাওয়া যায়নি', HI: 'योजना नहीं मिली' },
    notFoundDesc: { EN: 'This scheme may have been removed or the backend is unavailable.', BN: 'এই প্রকল্পটি সরিয়ে দেওয়া হতে পারে বা ব্যাকএন্ড উপলব্ধ নেই।', HI: 'यह योजना हटा दी गई होगी या बैकएंड अनुपलब्ध है।' },
    backToSchemes: { EN: 'Back to Schemes', BN: 'প্রকল্পে ফিরে যান', HI: 'योजनाओं पर वापस जाएं' },
    nodalAgency: { EN: 'Nodal Agency', BN: 'নোডাল এজেন্সি', HI: 'नोडल एजेंसी' },
    cap: { EN: 'Cap', BN: 'সর্বোচ্চ', HI: 'अधिकतम' },
    eligibility: { EN: 'Eligibility', BN: 'যোগ্যতা', HI: 'पात्रता' },
    noSpecificEligibility: { EN: 'No specific eligibility restrictions.', BN: 'কোন নির্দিষ্ট যোগ্যতার বিধিনিষেধ নেই।', HI: 'कोई विशिष्ट पात्रता प्रतिबंध नहीं।' },
    loanDetails: { EN: 'Loan Details', BN: 'ঋণের বিবরণ', HI: 'ऋण विवरण' },
    marginRequired: { EN: 'Margin required', BN: 'মার্জিন প্রয়োজন', HI: 'मार्जिन आवश्यक' },
    moratorium: { EN: 'Moratorium', BN: 'মোরটোরিয়াম', HI: 'मोराटोरियम' },
    requiredDocuments: { EN: 'Required Documents', BN: 'প্রয়োজনীয় কাগজপত্র', HI: 'आवश्यक दस्तावेज़' },
    socialCategories: { EN: 'Social categories', BN: 'সামাজিক বিভাগ', HI: 'सामाजिक श्रेणियां' },
    gender: { EN: 'Gender', BN: 'লিঙ্গ', HI: 'लिंग' },
    minAge: { EN: 'Minimum age', BN: 'ন্যূনতম বয়স', HI: 'न्यूनतम आयु' },
    maxAge: { EN: 'Maximum age', BN: 'সর্বোচ্চ বয়স', HI: 'अधिकतम आयु' },
    minorityOnly: { EN: 'Minority community only', BN: 'শুধুমাত্র সংখ্যালঘু সম্প্রদায়', HI: 'केवल अल्पसंख्यक समुदाय' },
    nonMinorityEligible: { EN: 'Non-minority eligible', BN: 'অ-সংখ্যালঘুরাও যোগ্য', HI: 'गैर-अल्पसंख्यक पात्र' },
    businessTypes: { EN: 'Business types', BN: 'ব্যবসার ধরন', HI: 'व्यवसाय के प्रकार' },
    minProjectCost: { EN: 'Min project cost', BN: 'ন্যূনতম প্রকল্প ব্যয়', HI: 'न्यूनतम परियोजना लागत' },
    maxProjectCost: { EN: 'Max project cost', BN: 'সর্বোচ্চ প্রকল্প ব্যয়', HI: 'अधिकतम परियोजना लागत' },
    states: { EN: 'States', BN: 'রাজ্যসমূহ', HI: 'राज्य' },
  },

  // ─── Scheme Data (Dynamic translations for backend content) ───
  schemeData: {
    mudra_kishore: {
      name: { EN: 'Pradhan Mantri MUDRA Yojana (PMMY) - Kishore', BN: 'প্রধানমন্ত্রী মুদ্রা যোজনা (PMMY) - কিশোর', HI: 'प्रधानमंत्री मुद्रा योजना (PMMY) - किशोर' },
      shortName: { EN: 'MUDRA Kishore', BN: 'মুদ্রা কিশোর', HI: 'मुद्रा किशोर' },
      description: { EN: 'Collateral-free micro loans from ₹50,000 to ₹5,00,000 for non-farm micro enterprises.', BN: 'অ-কৃষি মাইক্রো উদ্যোগের জন্য ₹৫০,০০০ থেকে ₹৫,০০,০০০ পর্যন্ত জামানত-মুক্ত মাইক্রো ঋণ।', HI: 'गैर-कृषि सूक्ष्म उद्यमों के लिए ₹50,000 से ₹5,00,000 तक का संपार्श्विक-मुक्त सूक्ष्म ऋण।' },
      nodalAgency: { EN: 'Ministry of Micro, Small and Medium Enterprises (MSME)', BN: 'অণু, ক্ষুদ্র ও মাঝারি উদ্যোগ মন্ত্রণালয় (MSME)', HI: 'सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय (MSME)' }
    },
    mudra_shishu: {
      name: { EN: 'Pradhan Mantri MUDRA Yojana (PMMY) - Shishu', BN: 'প্রধানমন্ত্রী মুদ্রা যোজনা (PMMY) - শিশু', HI: 'प्रधानमंत्री मुद्रा योजना (PMMY) - शिशु' },
      shortName: { EN: 'MUDRA Shishu', BN: 'মুদ্রা শিশু', HI: 'मुद्रा शिशु' },
      description: { EN: 'Collateral-free micro loans up to ₹50,000 for starting small businesses.', BN: 'ছোট ব্যবসা শুরু করার জন্য ₹৫০,০০০ পর্যন্ত জামানত-মুক্ত মাইক্রো ঋণ।', HI: 'छोटे व्यवसाय शुरू करने के लिए ₹50,000 तक का संपार्श्विक-मुक्त सूक्ष्म ऋण।' },
      nodalAgency: { EN: 'Ministry of Micro, Small and Medium Enterprises (MSME)', BN: 'অণু, ক্ষুদ্র ও মাঝারি উদ্যোগ মন্ত্রণালয় (MSME)', HI: 'सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय (MSME)' }
    },
    pmegp_micro: {
      name: { EN: "Prime Minister's Employment Generation Programme (PMEGP)", BN: 'প্রধানমন্ত্রীর কর্মসংস্থান সৃষ্টি কর্মসূচি (PMEGP)', HI: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)' },
      shortName: { EN: 'PMEGP', BN: 'PMEGP', HI: 'PMEGP' },
      description: { EN: 'Credit-linked subsidy scheme offering 25-35% subsidy for setting up micro enterprises in rural areas.', BN: 'গ্রামীণ এলাকায় মাইক্রো এন্টারপ্রাইজ স্থাপনের জন্য ২৫-৩৫% ভর্তুকি প্রদানকারী ক্রেডিট-লিঙ্কযুক্ত ভর্তুকি প্রকল্প।', HI: 'ग्रामीण क्षेत्रों में सूक्ष्म उद्यम स्थापित करने के लिए 25-35% सब्सिडी प्रदान करने वाली क्रेडिट-लिंक्ड सब्सिडी योजना।' },
      nodalAgency: { EN: 'KVIC / Ministry of MSME', BN: 'কেভিআইসি / এমএসএমই মন্ত্রণালয়', HI: 'केवीआईसी / एमएसएमई मंत्रालय' }
    },
    pm_svanidhi: {
      name: { EN: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)", BN: 'প্রধানমন্ত্রী স্বনিধি যোজনা', HI: 'पीएम स्वनिधि योजना' },
      shortName: { EN: 'PM SVANidhi', BN: 'প্রধানমন্ত্রী স্বনিধি', HI: 'पीएम स्वनिधि' },
      description: { EN: 'Special micro-credit facility for street vendors to access affordable working capital loan.', BN: 'রাস্তার বিক্রেতাদের সাশ্রয়ী মূল্যের কার্যকরী মূলধন ঋণ পাওয়ার জন্য বিশেষ মাইক্রো-ক্রেডিট সুবিধা।', HI: 'स्ट्रीट वेंडर्स के लिए किफायती कार्यशील पूंजी ऋण तक पहुंचने के लिए विशेष माइक्रो-क्रेडिट सुविधा।' },
      nodalAgency: { EN: 'Ministry of Housing and Urban Affairs (MoHUA)', BN: 'আবাসন ও নগর বিষয়ক মন্ত্রণালয় (MoHUA)', HI: 'आवास और शहरी मामलों के मंत्रालय (MoHUA)' }
    },
    standup_india: {
      name: { EN: 'Stand-Up India Scheme', BN: 'স্ট্যান্ড-আপ ইন্ডিয়া স্কিম', HI: 'स्टैंड-अप इंडिया योजना' },
      shortName: { EN: 'Stand-Up India', BN: 'স্ট্যান্ড-আপ ইন্ডিয়া', HI: 'स्टैंड-अप इंडिया' },
      description: { EN: 'Bank loans between ₹10 lakh and ₹1 Crore to SC/ST or Women borrowers for setting up greenfield enterprises.', BN: 'নতুন উদ্যোগ স্থাপনের জন্য এসসি/এসটি বা মহিলা ঋণগ্রহীতাদের ₹১০ লক্ষ থেকে ₹১ কোটির মধ্যে ব্যাংক ঋণ।', HI: 'ग्रीनफील्ड उद्यम स्थापित करने के लिए एससी/एसटी या महिला उधारकर्ताओं को ₹10 लाख से ₹1 करोड़ के बीच बैंक ऋण।' },
      nodalAgency: { EN: 'Department of Financial Services (DFS), Ministry of Finance', BN: 'আর্থিক পরিষেবা বিভাগ (DFS), অর্থ মন্ত্রণালয়', HI: 'वित्तीय सेवा विभाग (DFS), वित्त मंत्रालय' }
    },
    wb_bhabishyat: {
      name: { EN: 'West Bengal Bhabishyat Credit Card Scheme (WB-BCCS)', BN: 'পশ্চিমবঙ্গ ভবিষ্যৎ ক্রেডিট কার্ড স্কিম (WB-BCCS)', HI: 'पश्चिम बंगाल भविष्यत क्रेडिट कार्ड योजना (WB-BCCS)' },
      shortName: { EN: 'WB Bhabishyat', BN: 'পশ্চিমবঙ্গ ভবিষ্যৎ', HI: 'पश्चिम बंगाल भविष्यत' },
      description: { EN: 'West Bengal State Scheme providing collateral-free loans up to ₹5 Lakh with 10% government subsidy for youth starting micro enterprises.', BN: 'পশ্চিমবঙ্গ রাজ্য প্রকল্প যুবকদের মাইক্রো এন্টারপ্রাইজ শুরু করার জন্য ১০% সরকারি ভর্তুকি সহ ₹৫ লক্ষ পর্যন্ত জামানত-মুক্ত ঋণ প্রদান করে।', HI: 'पश्चिम बंगाल राज्य योजना युवाओं को सूक्ष्म उद्यम शुरू करने के लिए 10% सरकारी सब्सिडी के साथ ₹5 लाख तक का संपार्श्विक-मुक्त ऋण प्रदान करती है।' },
      nodalAgency: { EN: 'Department of Micro, Small & Medium Enterprises and Textiles, Govt of West Bengal', BN: 'মাইক্রো, ক্ষুদ্র ও মাঝারি উদ্যোগ এবং বস্ত্র বিভাগ, পশ্চিমবঙ্গ সরকার', HI: 'सूक्ष्म, लघु और मध्यम उद्यम और वस्त्र विभाग, पश्चिम बंगाल सरकार' }
    }
  },

  // ─── Login / Register Pages ───
  auth: {
    loginTitle:      { EN: 'Login to ArthSetu',        BN: 'ArthSetu-তে লগইন করুন',        HI: 'ArthSetu में लॉगिन करें' },
    registerTitle:   { EN: 'Create Account',               BN: 'অ্যাকাউন্ট তৈরি করুন',               HI: 'खाता बनाएं' },
    welcomeBack:     { EN: 'Welcome Back',                 BN: 'পুনরায় স্বাগতম',                 HI: 'वापसी पर स्वागत है' },
    signInToAccess:  { EN: 'Sign in to access your assessments', BN: 'আপনার মূল্যায়নগুলি দেখতে সাইন ইন করুন', HI: 'अपने मूल्यांकनों तक पहुंचने के लिए साइन इन करें' },
    phone:           { EN: 'Mobile Number',                 BN: 'মোবাইল নম্বর',                 HI: 'मोबाइल नंबर' },
    password:        { EN: 'Password',                     BN: 'পাসওয়ার্ড',                     HI: 'पासवर्ड' },
    confirmPassword: { EN: 'Confirm Password',             BN: 'পাসওয়ার্ড নিশ্চিত করুন',             HI: 'पासवर्ड की पुष्टि करें' },
    phonePlaceholder:{ EN: '10-digit mobile number',       BN: '১০-অঙ্কের মোবাইল নম্বর',       HI: '10 अंकों का मोबाइल नंबर' },
    passPlaceholder: { EN: 'Your password',                BN: 'আপনার পাসওয়ার্ড',                HI: 'आपका पासवर्ड' },
    forgotPassword:  { EN: 'Forgot password?',             BN: 'পাসওয়ার্ড ভুলে গেছেন?',             HI: 'पासवर्ड भूल गए?' },
    signIn:          { EN: 'Sign In',                      BN: 'সাইন ইন',                      HI: 'साइन इन' },
    createAccount:   { EN: 'Create account',               BN: 'অ্যাকাউন্ট তৈরি করুন',               HI: 'खाता बनाएं' },
    noAccount:       { EN: "Don't have an account?",       BN: 'অ্যাকাউন্ট নেই?',       HI: 'क्या आपके पास खाता नहीं है?' },
    hasAccount:      { EN: 'Already have an account?',     BN: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',     HI: 'क्या आपके पास पहले से खाता है?' },
    backToHome:      { EN: 'Back to Home',                 BN: 'হোম পেজে ফিরে যান',                 HI: 'होम पर वापस जाएं' },
  },
} as const;

export type Translations = typeof translations;

/**
 * Get all translations for a given language.
 * Returns a nested object matching the structure above but with only string values.
 */
export function getTranslations(lang: Lang): TranslationValues {
  return extractLang(translations, lang) as TranslationValues;
}

// Recursively extract one language from the dictionary
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractLang(obj: any, lang: Lang): any {
  if (obj === null || obj === undefined) return obj;
  // Leaf node: { EN: '...', BN: '...' } or { EN: '...', BN: '...', HI: '...' }
  if (typeof obj === 'object' && 'EN' in obj && 'BN' in obj && typeof obj.EN !== 'object') {
    return obj[lang];
  }
  // Array leaf node: { EN: [...], BN: [...] }
  if (typeof obj === 'object' && 'EN' in obj && 'BN' in obj && Array.isArray(obj.EN)) {
    return obj[lang];
  }
  // Recurse
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = extractLang(obj[key], lang);
  }
  return result;
}

// Type helper: replaces { EN: string, BN: string, HI: string } leaves with string
type ExtractLangType<T> = T extends { EN: infer E }
  ? E
  : T extends readonly unknown[]
  ? { [K in keyof T]: ExtractLangType<T[K]> }
  : T extends object
  ? { [K in keyof T]: ExtractLangType<T[K]> }
  : T;

type TranslationValues = ExtractLangType<Translations>;

export default translations;
