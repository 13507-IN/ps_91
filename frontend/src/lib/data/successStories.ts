export interface SuccessStory {
  id: string;
  entrepreneurName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  village: string;
  block: string;
  district: string;
  category: string;
  categoryCode: 'DAIRY' | 'FOOD_PROCESSING' | 'TEXTILES_TAILORING' | 'POULTRY' | 'RETAIL' | 'TRANSPORT' | 'HANDICRAFT';
  businessName: string;
  initialInvestment: number;
  loanScheme: string;
  subsidyReceived: number;
  breakevenMonths: number;
  currentMonthlyRevenue: number;
  currentMonthlyNetProfit: number;
  jobsCreated: number;
  quote: string;
  storyDetails: string;
  keyLearnings: string[];
}

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'story-1',
    entrepreneurName: 'Ramesh Ghosh',
    age: 34,
    gender: 'MALE',
    village: 'Krishnanagar Rural',
    block: 'Krishnanagar-I',
    district: 'Nadia',
    category: 'Dairy & Milk Products',
    categoryCode: 'DAIRY',
    businessName: 'Nadia Fresh Milk Collection & Chilling Unit',
    initialInvestment: 350000,
    loanScheme: 'PMMY MUDRA Kishore',
    subsidyReceived: 0,
    breakevenMonths: 7,
    currentMonthlyRevenue: 120000,
    currentMonthlyNetProfit: 38000,
    jobsCreated: 3,
    quote: 'ArthSetu showed me that our village had 420 cattle but no local chilling facility. Starting a direct collection center cut transport spoilage and doubled farmer margins.',
    storyDetails: 'Ramesh secured a ₹3.15 Lakh loan under MUDRA Kishore with 10% own margin. He installed a 500-liter bulk milk cooler and now supplies pure cow milk and fresh paneer daily to 8 sweet shops in Krishnanagar.',
    keyLearnings: [
      'Focus on high-margin value-added products like paneer during lean seasons',
      'Tie up with local sweet makers on advance monthly contracts',
    ],
  },
  {
    id: 'story-2',
    entrepreneurName: 'Aparna Biswas',
    age: 29,
    gender: 'FEMALE',
    village: 'Phulia',
    block: 'Santipur',
    district: 'Nadia',
    category: 'Textiles & Handloom',
    categoryCode: 'TEXTILES_TAILORING',
    businessName: 'Phulia Taant Boutique & Weaving Cluster',
    initialInvestment: 250000,
    loanScheme: 'PMEGP (Rural Women)',
    subsidyReceived: 87500, // 35% subsidy under PMEGP Special Category
    breakevenMonths: 5,
    currentMonthlyRevenue: 95000,
    currentMonthlyNetProfit: 32000,
    jobsCreated: 4,
    quote: 'The 35% PMEGP capital subsidy made it possible to buy two modernized jacquard looms. Today, 4 village women work together producing premium Taant sarees.',
    storyDetails: 'Aparna mobilized local weavers into a micro-enterprise. With PMEGP financing, they bypassed Kolkata middlemen and sell directly online and to boutique buyers across West Bengal.',
    keyLearnings: [
      'Festive demand (Aug–Oct) generates 45% of annual revenue',
      'Quality standardization allows 20% higher pricing',
    ],
  },
  {
    id: 'story-3',
    entrepreneurName: 'Bikram Mandal',
    age: 26,
    gender: 'MALE',
    village: 'Deypara',
    block: 'Krishnanagar-I',
    district: 'Nadia',
    category: 'Food Processing',
    categoryCode: 'FOOD_PROCESSING',
    businessName: 'Maa Tara Mini Mustard Oil Expeller',
    initialInvestment: 400000,
    loanScheme: 'PMMY MUDRA Kishore',
    subsidyReceived: 0,
    breakevenMonths: 6,
    currentMonthlyRevenue: 145000,
    currentMonthlyNetProfit: 42000,
    jobsCreated: 2,
    quote: 'Farmers used to travel 12 km to press their mustard crop. Setting up a local cold-press expeller gave me full order capacity from day one.',
    storyDetails: 'Bikram installed an eco-friendly 6-bolt cold press expeller. In addition to custom pressing fees from 150+ farmer families, he sells unadulterated bottled mustard oil to local grocers.',
    keyLearnings: [
      'Mustard cake byproduct provides steady income as cattle feed',
      'Bulk seed procurement right after harvest saves 15% raw material cost',
    ],
  },
  {
    id: 'story-4',
    entrepreneurName: 'Sunita Roy',
    age: 38,
    gender: 'FEMALE',
    village: 'Santipur Rural',
    block: 'Santipur',
    district: 'Nadia',
    category: 'Poultry & Livestock',
    categoryCode: 'POULTRY',
    businessName: 'Green Valley Broiler Farm',
    initialInvestment: 300000,
    loanScheme: 'WB BSWA Scheme',
    subsidyReceived: 45000,
    breakevenMonths: 8,
    currentMonthlyRevenue: 110000,
    currentMonthlyNetProfit: 29000,
    jobsCreated: 2,
    quote: 'The feasibility report alerted me to ventilation needs during humid monsoon months. That insight saved our batch from disease outbreak in the first year.',
    storyDetails: 'Sunita started a 1,000-bird broiler cycle with temperature-controlled sheds. She maintains rolling 45-day batches ensuring continuous cashflow and stable wholesale distribution.',
    keyLearnings: [
      'Maintain 30-day working capital buffer for feed price volatility',
      'Strict biosecurity and vaccination schedule protects capital investment',
    ],
  },
  {
    id: 'story-5',
    entrepreneurName: 'Tapan Das',
    age: 42,
    gender: 'MALE',
    village: 'Ranaghat Rural',
    block: 'Ranaghat-I',
    district: 'Nadia',
    category: 'Retail & Grocery',
    categoryCode: 'RETAIL',
    businessName: 'Das General & Agricultural Input Store',
    initialInvestment: 200000,
    loanScheme: 'PMMY MUDRA Shishu',
    subsidyReceived: 0,
    breakevenMonths: 4,
    currentMonthlyRevenue: 85000,
    currentMonthlyNetProfit: 24000,
    jobsCreated: 1,
    quote: 'Combining daily grocery essentials with certified vegetable seeds and bio-fertilizers created consistent year-round footfall.',
    storyDetails: 'Tapan transformed a small stall into a full-fledged farm input and FMCG retail hub in Deypara market centre, serving over 300 farming households.',
    keyLearnings: [
      'Fast inventory turnover on fast-moving consumer goods',
      'Seasonal stocking of certified seeds before sowing cycles',
    ],
  },
  {
    id: 'story-6',
    entrepreneurName: 'Manju Karmakar',
    age: 31,
    gender: 'FEMALE',
    village: 'Santipur',
    block: 'Santipur',
    district: 'Nadia',
    category: 'Handicrafts & Artisans',
    categoryCode: 'HANDICRAFT',
    businessName: 'Shilpi Jute Crafts & Eco-Bags',
    initialInvestment: 150000,
    loanScheme: 'Stand-Up India',
    subsidyReceived: 25000,
    breakevenMonths: 5,
    currentMonthlyRevenue: 70000,
    currentMonthlyNetProfit: 26000,
    jobsCreated: 3,
    quote: 'With plastic bag bans in urban markets, eco-friendly jute bags became an instant hit. We now supply 2,000 bags a month to eco-stores in Kolkata.',
    storyDetails: 'Manju utilized locally grown golden fiber (jute) to design embroidered shopping bags, coasters, and office folders, empowering rural women artisans.',
    keyLearnings: [
      'Value addition turns raw jute worth ₹50/kg into finished products worth ₹400/kg',
      'Exhibiting at district fairs generated corporate gift orders',
    ],
  },
];
