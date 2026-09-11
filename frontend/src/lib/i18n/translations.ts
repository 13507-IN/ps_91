'use client';

/**
 * ArthSetu — Centralized Translation Dictionary
 *
 * All user-facing UI strings in English (EN) and Bengali (BN).
 * Organized by component/page section.
 */

export type Lang = 'EN' | 'BN';

export const LANG_KEY = 'ArthSetu_lang';

const translations = {
  // ─── Common / Shared ───
  common: {
    appName:      { EN: 'ArthSetu',             BN: 'ArthSetu' },
    tagline:      { EN: 'Rural Business Intelligence Platform', BN: 'গ্রামীণ ব্যবসায়িক তথ্য প্ল্যাটফর্ম' },
    loading:      { EN: 'Loading...',                BN: 'লোড হচ্ছে...' },
    save:         { EN: 'Save',                      BN: 'সংরক্ষণ করুন' },
    cancel:       { EN: 'Cancel',                    BN: 'বাতিল' },
    back:         { EN: 'Back',                      BN: 'পিছনে' },
    next:         { EN: 'Next',                      BN: 'পরবর্তী' },
    continue:     { EN: 'Continue',                  BN: 'চালিয়ে যান' },
    change:       { EN: 'Change',                    BN: 'পরিবর্তন করুন' },
    clear:        { EN: 'Clear',                     BN: 'মুছুন' },
    close:        { EN: 'Close',                     BN: 'বন্ধ করুন' },
    submit:       { EN: 'Submit',                    BN: 'জমা দিন' },
    yes:          { EN: 'Yes',                       BN: 'হ্যাঁ' },
    no:           { EN: 'No',                        BN: 'না' },
    or:           { EN: 'Or',                        BN: 'অথবা' },
    notSpecified: { EN: 'Not specified',             BN: 'নির্দিষ্ট নয়' },
    notProvided:  { EN: 'Not provided (optional)',   BN: 'দেওয়া হয়নি (ঐচ্ছিক)' },
    notSelected:  { EN: 'Not selected',              BN: 'নির্বাচিত নয়' },
    notEntered:   { EN: 'Not entered',               BN: 'দেওয়া হয়নি' },
    loginRequired:{ EN: 'Login required',            BN: 'লগইন প্রয়োজন' },
    startNew:     { EN: 'Start New Assessment',      BN: 'নতুন মূল্যায়ন শুরু করুন' },
    newAssessment:{ EN: '+ New Assessment',          BN: '+ নতুন মূল্যায়ন' },
    printPdf:     { EN: 'Print / PDF',               BN: 'প্রিন্ট / PDF' },
    age:          { EN: 'Age',                       BN: 'বয়স' },
  },

  // ─── Navigation (Header) ───
  nav: {
    home:           { EN: 'Home',               BN: 'হোম' },
    assess:         { EN: 'Start Assessment',   BN: 'মূল্যায়ন শুরু করুন' },
    schemes:        { EN: 'Schemes',            BN: 'প্রকল্পসমূহ' },
    sampleReport:   { EN: 'Sample Report',      BN: 'নমুনা রিপোর্ট' },
    dashboard:      { EN: 'Dashboard',          BN: 'ড্যাশবোর্ড' },
    admin:          { EN: 'Admin',              BN: 'অ্যাডমিন' },
    settings:       { EN: 'Settings',           BN: 'সেটিংস' },
    freeAssessment: { EN: 'Free Assessment',    BN: 'বিনামূল্যে মূল্যায়ন' },
    login:          { EN: 'Login',              BN: 'লগইন' },
    register:       { EN: 'Register',           BN: 'নিবন্ধন' },
    logout:         { EN: 'Logout',             BN: 'লগআউট' },
    language:       { EN: 'বাংলা',              BN: 'English' },
    skipToMain:     { EN: 'Skip to Main Content', BN: 'মূল বিষয়বস্তুতে যান' },
    govIndia:       { EN: 'भारत सरकार | Government of India', BN: 'ভারত সরকার | Government of India' },
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
    },
  },

  // ─── Footer ───
  footer: {
    quickLinks:     { EN: 'Quick Links',           BN: 'দ্রুত লিঙ্ক' },
    dataSources:    { EN: 'Data Sources',           BN: 'তথ্যসূত্র' },
    legal:          { EN: 'Legal',                  BN: 'আইনি' },
    census:         { EN: 'Census of India',        BN: 'ভারতের আদমশুমারি' },
    udyam:          { EN: 'UDYAM / MSME Registry',  BN: 'উদ্যম / MSME নিবন্ধন' },
    agmarknet:      { EN: 'AGMARKNET (Mandi Prices)', BN: 'AGMARKNET (মান্ডি মূল্য)' },
    livestock:      { EN: 'Livestock Census',       BN: 'প্রাণিসম্পদ শুমারি' },
    pmgsy:          { EN: 'PMGSY Road Network',     BN: 'PMGSY সড়ক নেটওয়ার্ক' },
    privacy:        { EN: 'Privacy Policy',         BN: 'গোপনীয়তা নীতি' },
    terms:          { EN: 'Terms of Use',           BN: 'ব্যবহারের শর্তাবলী' },
    disclaimer:     { EN: 'Disclaimer',             BN: 'দাবিত্যাগ' },
    accessibility:  { EN: 'Accessibility Statement', BN: 'অ্যাক্সেসিবিলিটি বিবৃতি' },
    contact:        { EN: 'Contact Us',             BN: 'যোগাযোগ করুন' },
    description:    { EN: 'Evidence-backed business intelligence for rural and semi-urban entrepreneurs across India.',
                      BN: 'ভারতজুড়ে গ্রামীণ ও আধা-শহুরে উদ্যোক্তাদের জন্য প্রমাণ-ভিত্তিক ব্যবসায়িক তথ্য।' },
    govLine:        { EN: 'ArthSetu — for aspiring rural entrepreneurs',
                      BN: 'ArthSetu — আশীয়ান উদ্যোক্তাদের জন্য' },
    startAssessment:{ EN: 'Start Assessment',       BN: 'মূল্যায়ন শুরু করুন' },
    sampleReport:   { EN: 'Sample Report',          BN: 'নমুনা রিপোর্ট' },
    profileSettings:{ EN: 'Profile & Settings',     BN: 'প্রোফাইল ও সেটিংস' },
  },

  // ─── Wizard Progress Steps ───
  wizard: {
    stepLocation:  { EN: 'Location',     BN: 'অবস্থান' },
    stepBusiness:  { EN: 'Business',     BN: 'ব্যবসা' },
    stepCapital:   { EN: 'Capital',      BN: 'মূলধন' },
    stepReview:    { EN: 'Review',       BN: 'পর্যালোচনা' },
    pageTitle:     { EN: 'Business Feasibility Assessment', BN: 'ব্যবসা সম্ভাব্যতা মূল্যায়ন' },
    pageDescription: { EN: 'Answer a few questions to get a data-backed viability report for your business idea.',
                       BN: 'আপনার ব্যবসার ধারণার জন্য তথ্য-ভিত্তিক সম্ভাব্যতা রিপোর্ট পেতে কিছু প্রশ্নের উত্তর দিন।' },
    assessmentSteps: { EN: 'Assessment Steps', BN: 'মূল্যায়নের ধাপসমূহ' },
    inProgress:    { EN: 'In Progress', BN: 'চলমান' },
    completed:     { EN: 'Completed', BN: 'সম্পন্ন' },
    progress:      { EN: 'Progress', BN: 'অগ্রগতি' },
    stepTitles: {
      EN: ['Location', 'Business', 'Capital', 'Review'],
      BN: ['অবস্থান', 'ব্যবসা', 'মূলধন', 'পর্যালোচনা'],
    },
    stepDescriptions: {
      EN: ['Choose location', 'Business details', 'Financial info', 'Final check'],
      BN: ['অবস্থান নির্বাচন করুন', 'ব্যবসার বিবরণ', 'আর্থিক তথ্য', 'চূড়ান্ত যাচাই'],
    },
  },

  // ─── Step: Location ───
  location: {
    searchLabel:       { EN: 'Search Village / Town',              BN: 'গ্রাম / শহর খুঁজুন' },
    searchHint:        { EN: 'Type at least 2 characters to search across 6,40,000+ villages',
                         BN: '৬,৪০,০০০+ গ্রামের মধ্যে খুঁজতে কমপক্ষে ২টি অক্ষর টাইপ করুন' },
    searchPlaceholder: { EN: 'e.g. Bishnupur, Baruipur, Katwa...', BN: 'যেমন বিষ্ণুপুর, বারুইপুর, কাটোয়া...' },
    searchError:       { EN: 'Unable to search villages. Please make sure the backend is running.',
                         BN: 'গ্রাম খুঁজতে অক্ষম। অনুগ্রহ করে ব্যাকএন্ড চালু আছে কিনা নিশ্চিত করুন।' },
    noResults:         { EN: 'No villages found for',              BN: 'কোনো গ্রাম পাওয়া যায়নি' },
    tryAnother:        { EN: '. Try another name or pin a location on the map below.',
                         BN: '। অন্য নাম চেষ্টা করুন বা নিচের মানচিত্রে একটি অবস্থান পিন করুন।' },
    pinnedOnMap:       { EN: 'Pinned on map',                      BN: 'মানচিত্রে পিন করা হয়েছে' },
    noCoords:          { EN: 'Could not find coordinates — pin a location on the map below.',
                         BN: 'স্থানাঙ্ক পাওয়া যায়নি — নিচের মানচিত্রে একটি অবস্থান পিন করুন।' },
    geocoding:         { EN: 'Looking up village coordinates...',   BN: 'গ্রামের স্থানাঙ্ক খুঁজছি...' },
    villageLocation:   { EN: 'Village location',                   BN: 'গ্রামের অবস্থান' },
    autoPinned:        { EN: 'Auto-pinned from selected village',  BN: 'নির্বাচিত গ্রাম থেকে স্বয়ংক্রিয়ভাবে পিন করা হয়েছে' },
    orPinOnMap:        { EN: 'Or pin on map',                      BN: 'অথবা মানচিত্রে পিন করুন' },
    clickToSet:        { EN: 'Click anywhere on the map to set your location',
                         BN: 'আপনার অবস্থান নির্ধারণ করতে মানচিত্রে যেকোনো জায়গায় ক্লিক করুন' },
    pinnedLocation:    { EN: 'Pinned location',                    BN: 'পিন করা অবস্থান' },
    catchmentNote:     { EN: 'Analysis will use these coordinates for your catchment area.',
                         BN: 'বিশ্লেষণ আপনার ক্যাচমেন্ট এলাকার জন্য এই স্থানাঙ্ক ব্যবহার করবে।' },
    continueToBiz:     { EN: 'Continue to Business',               BN: 'ব্যবসায় এগিয়ে যান' },
    block:             { EN: 'Block',                              BN: 'ব্লক' },
    district:          { EN: 'District',                           BN: 'জেলা' },
  },

  // ─── Step: Business ───
  business: {
    selectCategory:  { EN: 'Select Business Category',     BN: 'ব্যবসার ধরন নির্বাচন করুন' },
    categoryHint:    { EN: 'Choose the category that best matches your business idea.',
                       BN: 'আপনার ব্যবসার ধারণার সাথে সবচেয়ে ভালো মিলে এমন ধরন বেছে নিন।' },
    describeIdea:    { EN: 'Describe Your Business Idea',  BN: 'আপনার ব্যবসার ধারণা বর্ণনা করুন' },
    ideaPlaceholder: { EN: 'e.g. I want to start a small dairy farm with 5 cows and sell fresh milk to nearby villages...',
                       BN: 'যেমন: আমি ৫টি গরু নিয়ে একটি ছোট দুগ্ধ খামার শুরু করতে চাই এবং কাছের গ্রামে তাজা দুধ বিক্রি করতে চাই...' },
    ideaHint:        { EN: 'The more detail you provide, the better our analysis will be.',
                       BN: 'আপনি যত বেশি বিস্তারিত দেবেন, আমাদের বিশ্লেষণ তত ভালো হবে।' },
    continueToCapital: { EN: 'Continue to Capital',        BN: 'মূলধনে এগিয়ে যান' },
    categories: {
      DAIRY:               { EN: 'Dairy',                  BN: 'দুগ্ধ' },
      FOOD_PROCESSING:     { EN: 'Food Processing',        BN: 'খাদ্য প্রক্রিয়াকরণ' },
      RETAIL:              { EN: 'Retail Shop',            BN: 'খুচরা দোকান' },
      TEXTILES_TAILORING:  { EN: 'Textiles & Tailoring',   BN: 'বস্ত্র ও সেলাই' },
      POULTRY:             { EN: 'Poultry',                BN: 'হাঁস-মুরগি' },
      AGRICULTURE:         { EN: 'Agriculture',            BN: 'কৃষি' },
      LIVESTOCK:           { EN: 'Livestock',              BN: 'প্রাণিসম্পদ' },
      TRANSPORT:           { EN: 'Transport',              BN: 'পরিবহন' },
      HANDICRAFT:          { EN: 'Handicraft',             BN: 'হস্তশিল্প' },
      SERVICES:            { EN: 'Services',               BN: 'সেবা' },
      OTHER:               { EN: 'Other',                  BN: 'অন্যান্য' },
    },
  },

  // ─── Step: Capital ───
  capital: {
    title:             { EN: 'Financial & Personal Details', BN: 'আর্থিক ও ব্যক্তিগত বিবরণ' },
    availableCapital:  { EN: 'Available Capital (₹)',        BN: 'উপলব্ধ মূলধন (₹)' },
    capitalHint:       { EN: 'How much money can you invest to start this business?',
                         BN: 'এই ব্যবসা শুরু করতে আপনি কত টাকা বিনিয়োগ করতে পারবেন?' },
    capitalPlaceholder:{ EN: 'e.g. 50000',                  BN: 'যেমন ৫০০০০' },
    catchmentRadius:   { EN: 'Catchment Radius (km)',       BN: 'ক্যাচমেন্ট ব্যাসার্ধ (কিমি)' },
    radiusHint:        { EN: 'How far will you serve customers?',
                         BN: 'আপনি কত দূর পর্যন্ত গ্রাহকদের সেবা দেবেন?' },
    experience:        { EN: 'Business Experience',         BN: 'ব্যবসার অভিজ্ঞতা' },
    expPlaceholder:    { EN: 'e.g. 2 years in dairy, no prior business...',
                         BN: 'যেমন: দুগ্ধে ২ বছর, আগে কোনো ব্যবসা নেই...' },
    land:              { EN: 'Available Land',              BN: 'উপলব্ধ জমি' },
    landPlaceholder:   { EN: 'e.g. 0.5 acre, own land...',  BN: 'যেমন: ০.৫ একর, নিজের জমি...' },
    equipment:         { EN: 'Available Equipment',         BN: 'উপলব্ধ যন্ত্রপাতি' },
    equipPlaceholder:  { EN: 'e.g. None, some basic tools...', BN: 'যেমন: নেই, কিছু সাধারণ সরঞ্জাম...' },
    workingHours:      { EN: 'Expected Working Hours/Day',  BN: 'প্রত্যাশিত কর্মঘণ্টা/দিন' },
    hoursPlaceholder:  { EN: 'e.g. 8',                      BN: 'যেমন ৮' },
    personalOptional:  { EN: 'Personal Details (optional — helps scheme matching)',
                         BN: 'ব্যক্তিগত বিবরণ (ঐচ্ছিক — প্রকল্প মেলানোতে সাহায্য করে)' },
    gender:            { EN: 'Gender',                      BN: 'লিঙ্গ' },
    genderMale:        { EN: 'Male',                        BN: 'পুরুষ' },
    genderFemale:      { EN: 'Female',                      BN: 'মহিলা' },
    genderOther:       { EN: 'Other',                       BN: 'অন্যান্য' },
    socialCategory:    { EN: 'Social Category',             BN: 'সামাজিক বিভাগ' },
    general:           { EN: 'General',                     BN: 'সাধারণ' },
    minority:          { EN: 'Minority',                    BN: 'সংখ্যালঘু' },
    isMinority:        { EN: 'I belong to a minority community',
                         BN: 'আমি একটি সংখ্যালঘু সম্প্রদায়ের অন্তর্ভুক্ত' },
    continueToReview:  { EN: 'Continue to Review',          BN: 'পর্যালোচনায় এগিয়ে যান' },
  },

  // ─── Step: Review ───
  review: {
    reviewHint:     { EN: 'Review your inputs below. Once confirmed, we will run the full feasibility analysis — this typically takes 8–15 seconds.',
                      BN: 'নিচে আপনার তথ্য পর্যালোচনা করুন। নিশ্চিত হলে, আমরা সম্পূর্ণ সম্ভাব্যতা বিশ্লেষণ চালাব — এটি সাধারণত ৮-১৫ সেকেন্ড সময় নেয়।' },
    locationLabel:  { EN: 'Location',                      BN: 'অবস্থান' },
    businessLabel:  { EN: 'Business Category',             BN: 'ব্যবসার ধরন' },
    capitalLabel:   { EN: 'Available Capital',             BN: 'উপলব্ধ মূলধন' },
    profileLabel:   { EN: 'Profile',                       BN: 'প্রোফাইল' },
    whatHappens:    { EN: 'What happens when you click Analyze:', BN: 'বিশ্লেষণ ক্লিক করলে কী হবে:' },
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
    },
    runAnalysis:    { EN: 'Run Feasibility Analysis',      BN: 'সম্ভাব্যতা বিশ্লেষণ চালান' },
    analyzing:      { EN: 'Analyzing...',                  BN: 'বিশ্লেষণ চলছে...' },
    errorNoCoords:  { EN: 'Please go back and choose a village with coordinates before analyzing.',
                      BN: 'অনুগ্রহ করে পিছনে গিয়ে বিশ্লেষণের আগে স্থানাঙ্কসহ একটি গ্রাম নির্বাচন করুন।' },
    errorNoIdea:    { EN: 'Please describe your business idea (at least 2 characters).',
                      BN: 'অনুগ্রহ করে আপনার ব্যবসার ধারণা বর্ণনা করুন (কমপক্ষে ২টি অক্ষর)।' },
    errorNoCapital: { EN: 'Please enter your available capital before analyzing.',
                      BN: 'অনুগ্রহ করে বিশ্লেষণের আগে আপনার উপলব্ধ মূলধন লিখুন।' },
    errorGeneric:   { EN: 'Something went wrong. Please try again.',
                      BN: 'কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' },
  },

  // ─── Feasibility Report ───
  report: {
    title:           { EN: 'Feasibility Report',           BN: 'সম্ভাব্যতা রিপোর্ট' },
    reportReady:     { EN: 'Your report is ready! It has been saved to your account.',
                       BN: 'আপনার রিপোর্ট তৈরি! এটি আপনার অ্যাকাউন্টে সংরক্ষিত হয়েছে।' },
    reportReadyGuest:{ EN: 'Your report is ready! It is saved in this tab. Login to keep it permanently.',
                       BN: 'আপনার রিপোর্ট তৈরি! এটি এই ট্যাবে সংরক্ষিত। স্থায়ীভাবে রাখতে লগইন করুন।' },
    saveReport:      { EN: 'Save this report',             BN: 'এই রিপোর্ট সংরক্ষণ করুন' },
    notFound:        { EN: 'Report not found',             BN: 'রিপোর্ট পাওয়া যায়নি' },
    notFoundDesc:    { EN: 'This report is linked to a logged-in user account, or it has been cleaned up. Start a new assessment to generate a fresh report.',
                       BN: 'এই রিপোর্টটি একটি লগইন করা ব্যবহারকারীর অ্যাকাউন্টের সাথে সংযুক্ত, অথবা এটি মুছে ফেলা হয়েছে। একটি নতুন রিপোর্ট তৈরি করতে নতুন মূল্যায়ন শুরু করুন।' },
    verdict:         { EN: 'Verdict',                      BN: 'রায়' },
    proceed:         { EN: 'PROCEED',                      BN: 'এগিয়ে যান' },
    caution:         { EN: 'CAUTION',                      BN: 'সতর্কতা' },
    notViable:       { EN: 'NOT VIABLE',                   BN: 'সম্ভব নয়' },
    good:            { EN: 'GOOD',                         BN: 'ভালো' },
    fair:            { EN: 'FAIR',                         BN: 'মোটামুটি' },
    poor:            { EN: 'POOR',                         BN: 'দুর্বল' },
    highConf:        { EN: 'High Confidence',              BN: 'উচ্চ আস্থা' },
    medConf:         { EN: 'Medium Confidence',            BN: 'মাঝারি আস্থা' },
    lowConf:         { EN: 'Low Confidence',               BN: 'নিম্ন আস্থা' },
  },

  // ─── Score Breakdown ───
  scores: {
    title:           { EN: 'Viability Score Breakdown',    BN: 'সম্ভাব্যতা স্কোর বিশ্লেষণ' },
    subtitle:        { EN: 'Five dimensions, each scored /20.', BN: 'পাঁচটি মাত্রা, প্রতিটি /২০ নম্বরে।' },
    marketDemand:    { EN: 'Market Demand',                BN: 'বাজারের চাহিদা' },
    competition:     { EN: 'Competition',                  BN: 'প্রতিযোগিতা' },
    financialViability: { EN: 'Financial Viability',       BN: 'আর্থিক সম্ভাব্যতা' },
    capitalAdequacy: { EN: 'Capital Adequacy',             BN: 'মূলধন পর্যাপ্ততা' },
    riskResilience:  { EN: 'Risk Resilience',              BN: 'ঝুঁকি সহনশীলতা' },
  },

  // ─── Market Intelligence ───
  market: {
    title:           { EN: 'Market Intelligence',          BN: 'বাজার তথ্য' },
    subtitle:        { EN: 'Demographics and infrastructure within the catchment area.',
                       BN: 'ক্যাচমেন্ট এলাকার জনসংখ্যা ও অবকাঠামো।' },
    totalPopulation: { EN: 'Total Population',             BN: 'মোট জনসংখ্যা' },
    totalHouseholds: { EN: 'Total Households',             BN: 'মোট পরিবার' },
    literacyRate:    { EN: 'Literacy Rate',                BN: 'সাক্ষরতার হার' },
    observed:        { EN: 'Observed',                     BN: 'পর্যবেক্ষিত' },
    estimated:       { EN: 'Estimated',                    BN: 'আনুমানিক' },
    topCrops:        { EN: 'Top Crops',                    BN: 'প্রধান ফসল' },
    noCropData:      { EN: 'No crop data available.',      BN: 'কোনো ফসলের তথ্য পাওয়া যায়নি।' },
    livestock:       { EN: 'Livestock',                    BN: 'প্রাণিসম্পদ' },
    noLivestockData: { EN: 'No livestock data available.', BN: 'কোনো প্রাণিসম্পদের তথ্য পাওয়া যায়নি।' },
    infrastructure:  { EN: 'Infrastructure',               BN: 'অবকাঠামো' },
  },

  // ─── Competition ───
  competition: {
    title:         { EN: 'Competition & Opportunities',    BN: 'প্রতিযোগিতা ও সুযোগ' },
    competitors:   { EN: 'Existing Competitors',           BN: 'বিদ্যমান প্রতিযোগী' },
    marketGaps:    { EN: 'Market Gaps',                    BN: 'বাজারের ফাঁক' },
    noCompetitors: { EN: 'No registered competitors found in the catchment area.',
                     BN: 'ক্যাচমেন্ট এলাকায় কোনো নিবন্ধিত প্রতিযোগী পাওয়া যায়নি।' },
    noGaps:        { EN: 'No market gaps identified.',     BN: 'কোনো বাজারের ফাঁক চিহ্নিত হয়নি।' },
    score:         { EN: 'Score',                          BN: 'স্কোর' },
    density:       { EN: 'Density',                        BN: 'ঘনত্ব' },
  },

  // ─── Financial Plan ───
  financial: {
    title:         { EN: 'Financial Plan',                 BN: 'আর্থিক পরিকল্পনা' },
    projectCost:   { EN: 'Project Cost',                   BN: 'প্রকল্প খরচ' },
    monthlyRevenue:{ EN: 'Monthly Revenue (Est.)',         BN: 'মাসিক আয় (আনুমানিক)' },
    monthlyExpense:{ EN: 'Monthly Expenses',               BN: 'মাসিক খরচ' },
    monthlyProfit: { EN: 'Monthly Profit',                 BN: 'মাসিক লাভ' },
    breakeven:     { EN: 'Break-even',                     BN: 'ব্রেক-ইভেন' },
    months:        { EN: 'months',                         BN: 'মাস' },
    govSchemes:    { EN: 'Government Schemes',             BN: 'সরকারি প্রকল্প' },
    emi:           { EN: 'EMI Calculator',                 BN: 'EMI ক্যালকুলেটর' },
  },

  // ─── Risk Assessment ───
  risk: {
    title:        { EN: 'Risk Assessment',                BN: 'ঝুঁকি মূল্যায়ন' },
    overallRisk:  { EN: 'Overall Risk Score',             BN: 'সামগ্রিক ঝুঁকি স্কোর' },
    riskFactors:  { EN: 'Risk Factors',                   BN: 'ঝুঁকির কারণসমূহ' },
    mitigations:  { EN: 'Mitigations',                    BN: 'প্রশমন ব্যবস্থা' },
    high:         { EN: 'HIGH',                           BN: 'উচ্চ' },
    medium:       { EN: 'MEDIUM',                         BN: 'মাঝারি' },
    low:          { EN: 'LOW',                            BN: 'নিম্ন' },
  },

  // ─── AI Recommendation ───
  aiRecommendation: {
    title:        { EN: 'AI Recommendation',              BN: 'AI সুপারিশ' },
    swot:         { EN: 'SWOT Analysis',                  BN: 'SWOT বিশ্লেষণ' },
    strengths:    { EN: 'Strengths',                      BN: 'শক্তি' },
    weaknesses:   { EN: 'Weaknesses',                     BN: 'দুর্বলতা' },
    opportunities:{ EN: 'Opportunities',                  BN: 'সুযোগ' },
    threats:      { EN: 'Threats',                        BN: 'হুমকি' },
    reasoning:    { EN: 'Reasoning',                      BN: 'যুক্তি' },
  },

  // ─── Action Plan ───
  actionPlan: {
    title:        { EN: '30-Day Action Plan',             BN: '৩০ দিনের কর্ম পরিকল্পনা' },
    week:         { EN: 'Week',                           BN: 'সপ্তাহ' },
    day:          { EN: 'Day',                            BN: 'দিন' },
    task:         { EN: 'Task',                           BN: 'কাজ' },
    priority:     { EN: 'Priority',                       BN: 'অগ্রাধিকার' },
  },

  // ─── Dashboard ───
  dashboard: {
    yourProfile:    { EN: 'Your Profile',                  BN: 'আপনার প্রোফাইল' },
    personalDetails:{ EN: 'Personal Details',              BN: 'ব্যক্তিগত বিবরণ' },
    phone:          { EN: 'Phone',                         BN: 'ফোন' },
    name:           { EN: 'Name',                          BN: 'নাম' },
    namePlaceholder:{ EN: 'Your full name',                BN: 'আপনার পুরো নাম' },
    email:          { EN: 'Email',                         BN: 'ইমেইল' },
    dateOfBirth:    { EN: 'Date of Birth',                 BN: 'জন্ম তারিখ' },
    locationTitle:  { EN: 'Location',                      BN: 'অবস্থান' },
    village:        { EN: 'Village',                       BN: 'গ্রাম' },
    villagePh:      { EN: 'Village name',                  BN: 'গ্রামের নাম' },
    block:          { EN: 'Block',                         BN: 'ব্লক' },
    blockPh:        { EN: 'Block / Taluka',                BN: 'ব্লক / তালুক' },
    district:       { EN: 'District',                      BN: 'জেলা' },
    state:          { EN: 'State',                         BN: 'রাজ্য' },
    saveChanges:    { EN: 'Save Changes',                  BN: 'পরিবর্তন সংরক্ষণ করুন' },
    saved:          { EN: '✓ Saved',                       BN: '✓ সংরক্ষিত' },
    unableToLoad:   { EN: 'Unable to load profile',        BN: 'প্রোফাইল লোড করতে অক্ষম' },
    profileError:   { EN: 'Error loading profile',         BN: 'প্রোফাইল লোড করতে ত্রুটি' },
    dob:            { EN: 'Date of Birth',                 BN: 'জন্ম তারিখ' },
    locationLabel:  { EN: 'Location',                      BN: 'অবস্থান' },
    villageLabel:   { EN: 'Village',                       BN: 'গ্রাম' },
    villagePlaceholder: { EN: 'Village name',              BN: 'গ্রামের নাম' },
    villageSearchPlaceholder: { EN: 'Search 6,40,000+ villages…', BN: '৬,৪০,০০০+ গ্রাম খুঁজুন…' },
    addNewVillage:  { EN: 'Not found — add "{name}" as a new village', BN: 'পাওয়া যায়নি — "{name}" নতুন গ্রাম হিসেবে যোগ করুন' },
    addingVillage:  { EN: 'Adding village & fetching coordinates…', BN: 'গ্রাম যোগ হচ্ছে ও স্থানাঙ্ক সংগ্রহ হচ্ছে…' },
    villageSaveError: { EN: 'Could not add the village. Try again or type the details manually.', BN: 'গ্রাম যোগ করা যায়নি। আবার চেষ্টা করুন বা বিবরণ ম্যানুয়ালি লিখুন।' },
    villageReady:   { EN: 'Village coordinates ready ✓',  BN: 'গ্রামের স্থানাঙ্ক প্রস্তুত ✓' },
    blockLabel:     { EN: 'Block',                         BN: 'ব্লক' },
    blockPlaceholder:{ EN: 'Block / Taluka',               BN: 'ব্লক / তালুক' },
    districtLabel:  { EN: 'District',                      BN: 'জেলা' },
    districtPlaceholder:{ EN: 'District name',             BN: 'জেলার নাম' },
    stateLabel:     { EN: 'State',                         BN: 'রাজ্য' },
    statePlaceholder:{ EN: 'State name',                   BN: 'রাজ্যের নাম' },
    sessionExpired: { EN: 'Your session may have expired. Please login again.',
                      BN: 'আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।' },
    // Past assessments
    pastAssessments:{ EN: 'Past Assessments',              BN: 'পূর্ববর্তী মূল্যায়ন' },
    pastAssDesc:    { EN: 'Your previously generated feasibility reports.',
                      BN: 'আপনার পূর্বে তৈরি করা সম্ভাব্যতা রিপোর্ট।' },
    noAssessments:  { EN: 'No assessments yet. Start your first one!',
                      BN: 'এখনো কোনো মূল্যায়ন নেই। আপনার প্রথমটি শুরু করুন!' },
    viewReport:     { EN: 'View Report',                   BN: 'রিপোর্ট দেখুন' },
    viabilityScore: { EN: 'Viability Score',               BN: 'সম্ভাব্যতা স্কোর' },
  },

  // ─── Login / Register Pages ───
  auth: {
    loginTitle:      { EN: 'Login to ArthSetu',        BN: 'ArthSetu-তে লগইন করুন' },
    registerTitle:   { EN: 'Create Account',               BN: 'অ্যাকাউন্ট তৈরি করুন' },
    welcomeBack:     { EN: 'Welcome Back',                 BN: 'পুনরায় স্বাগতম' },
    signInToAccess:  { EN: 'Sign in to access your assessments', BN: 'আপনার মূল্যায়নগুলি দেখতে সাইন ইন করুন' },
    phone:           { EN: 'Mobile Number',                 BN: 'মোবাইল নম্বর' },
    password:        { EN: 'Password',                     BN: 'পাসওয়ার্ড' },
    confirmPassword: { EN: 'Confirm Password',             BN: 'পাসওয়ার্ড নিশ্চিত করুন' },
    phonePlaceholder:{ EN: '10-digit mobile number',       BN: '১০-অঙ্কের মোবাইল নম্বর' },
    passPlaceholder: { EN: 'Your password',                BN: 'আপনার পাসওয়ার্ড' },
    forgotPassword:  { EN: 'Forgot password?',             BN: 'পাসওয়ার্ড ভুলে গেছেন?' },
    signIn:          { EN: 'Sign In',                      BN: 'সাইন ইন' },
    createAccount:   { EN: 'Create account',               BN: 'অ্যাকাউন্ট তৈরি করুন' },
    noAccount:       { EN: "Don't have an account?",       BN: 'অ্যাকাউন্ট নেই?' },
    hasAccount:      { EN: 'Already have an account?',     BN: 'ইতিমধ্যে অ্যাকাউন্ট আছে?' },
    backToHome:      { EN: 'Back to Home',                 BN: 'হোম পেজে ফিরে যান' },
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
  // Leaf node: { EN: '...', BN: '...' }
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

// Type helper: replaces { EN: string, BN: string } leaves with string
type ExtractLangType<T> = T extends { EN: infer E }
  ? E
  : T extends readonly unknown[]
  ? { [K in keyof T]: ExtractLangType<T[K]> }
  : T extends object
  ? { [K in keyof T]: ExtractLangType<T[K]> }
  : T;

type TranslationValues = ExtractLangType<Translations>;

export default translations;
