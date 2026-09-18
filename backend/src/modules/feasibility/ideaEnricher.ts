import { BusinessCategory } from '@prisma/client';

export interface EnrichIdeaInput {
  idea: string;
  category: BusinessCategory;
  villageName?: string;
  blockName?: string;
  districtName?: string;
  stateName?: string;
  availableCapital?: number;
  language?: string;
}

export interface EnrichedIdeaResult {
  originalIdea: string;
  enrichedIdea: string;
  displayTitle: string;
  isEnriched: boolean;
  scaleDescriptor: string;
}

const CATEGORY_EXPANSIONS: Record<BusinessCategory, {
  defaultTitle: string;
  microTemplate: (loc: string, spec: string) => string;
  smallTemplate: (loc: string, spec: string) => string;
  mediumTemplate: (loc: string, spec: string) => string;
}> = {
  DAIRY: {
    defaultTitle: 'Dairy Micro-Farm & Fresh Milk Doorstep Distribution',
    microTemplate: (loc, spec) =>
      `Small-scale dairy unit with 2-3 milch cows/buffaloes in ${loc}, supplying 20-30 litres of fresh morning and evening milk directly to local village households and nearby tea stalls${spec ? ` (${spec})` : ''}. Includes clean milking setup, local green fodder sourcing, and value-added curd/chhana sales.`,
    smallTemplate: (loc, spec) =>
      `Dairy enterprise with 4-6 high-yield milch animals in ${loc}, producing 50-70 litres of fresh milk daily. Direct doorstep delivery to 30+ households, supply contract with local sweetmakers (misti dokan)${spec ? ` focusing on ${spec}` : ''}, and surplus milk conversion into paneer and desi ghee.`,
    mediumTemplate: (loc, spec) =>
      `Commercial dairy farm with 8-12 cows/buffaloes in ${loc} equipped with automated milking, chilling vat, and captive fodder plot${spec ? ` with focus on ${spec}` : ''}. Supplies wholesale milk to dairy cooperatives and packaged fresh dairy products to weekly rural haats and township eateries.`,
  },
  RETAIL: {
    defaultTitle: 'Village Kirana, General Store & Digital Point',
    microTemplate: (loc, spec) =>
      `Local village general store in ${loc} offering essential daily groceries, cooking oil, spices, snacks, and toiletries${spec ? ` (${spec})` : ''} with UPI/digital payment convenience and transparent everyday pricing for 150+ nearby families.`,
    smallTemplate: (loc, spec) =>
      `Full-service village Kirana and provision store in ${loc} featuring monthly household ration kits, student stationery, FMCG essentials, and micro-ATM cash withdrawal service${spec ? ` specialized in ${spec}` : ''} with doorstep delivery for elderly and farming households.`,
    mediumTemplate: (loc, spec) =>
      `Mini rural supermart and wholesale-retail grocery hub in ${loc} stocking branded consumer goods, agricultural inputs (certified seeds/fertilizers), and household hardware${spec ? ` (${spec})` : ''}, serving multiple adjacent gram panchayats with direct distributor pricing.`,
  },
  TEXTILES_TAILORING: {
    defaultTitle: 'Boutique Tailoring Unit & Garment Customization',
    microTemplate: (loc, spec) =>
      `Home-based boutique tailoring unit in ${loc} with motorized sewing machines, providing daily garment alterations, custom blouse, kurti, and salwar-suit stitching${spec ? ` (${spec})` : ''} with fast 24-48 hour turnaround for local women and families.`,
    smallTemplate: (loc, spec) =>
      `Custom tailoring shop and boutique in ${loc} equipped with 2-3 industrial sewing and overlock machines, specializing in festive wear, designer blouse stitching, and contract school uniform orders${spec ? ` (${spec})` : ''} alongside ready-to-wear everyday cotton garments.`,
    mediumTemplate: (loc, spec) =>
      `Small garment manufacturing and contract stitching unit in ${loc} with 5+ workstations, supplying ready-made children's wear, institutional uniforms, and embroidered ethnic garments${spec ? ` (${spec})` : ''} to weekly haats and local retail clothing stores.`,
  },
  FOOD_PROCESSING: {
    defaultTitle: 'Agro-Processing Unit & Food Milling Enterprise',
    microTemplate: (loc, spec) =>
      `Local agro-processing micro-unit in ${loc} providing custom grain/spice grinding (atta, turmeric, chili) for village households${spec ? ` (${spec})` : ''}, plus packaged pure stone-ground spices sold locally.`,
    smallTemplate: (loc, spec) =>
      `Cold-pressed edible oil (mustard/sesame) extraction and multi-grain flour milling unit in ${loc}, offering both job-work grinding services for farmers and packaged unadulterated oil and spices${spec ? ` (${spec})` : ''} with byproduct cattle feed (oilcake) sales.`,
    mediumTemplate: (loc, spec) =>
      `Semi-automated agro-processing and packaging facility in ${loc} processing local harvests (paddy/mustard/pulses/spices)${spec ? ` (${spec})` : ''}, with FSSAI compliant packaging for distribution to regional grocery networks and weekly markets.`,
  },
  POULTRY: {
    defaultTitle: 'Commercial Broiler & Layer Poultry Unit',
    microTemplate: (loc, spec) =>
      `Small broiler poultry unit (300-500 bird capacity) in ${loc} on a 35-40 day batch cycle, supplying live healthy birds directly to local weekly haats and village meat shops${spec ? ` (${spec})` : ''}.`,
    smallTemplate: (loc, spec) =>
      `Commercial broiler farm (1,000-1,500 bird capacity) in ${loc} with dedicated biosecure shed, standard vaccination schedule, and direct supply tie-ups with local butchers and eateries${spec ? ` (${spec})` : ''}, plus organic poultry manure sales to vegetable farmers.`,
    mediumTemplate: (loc, spec) =>
      `Integrated poultry farming unit (2,500+ birds) in ${loc} combining automated feeding/watering systems, contract rearing, and direct marketing of broiler meat and country eggs${spec ? ` (${spec})` : ''}.`,
  },
  AGRICULTURE: {
    defaultTitle: 'Commercial Horticulture & High-Value Crop Farming',
    microTemplate: (loc, spec) =>
      `High-yield vegetable and horticulture cultivation on leased/owned land in ${loc}, producing seasonal vegetables (tomatoes, cabbage, chilies, leafy greens)${spec ? ` (${spec})` : ''} for direct sale at local daily and weekly haats.`,
    smallTemplate: (loc, spec) =>
      `Intensive multi-crop horticulture and drip-irrigated cash crop unit in ${loc}, focusing on year-round high-margin vegetables, mushrooms, or floriculture${spec ? ` (${spec})` : ''} with direct wholesale mandi supply.`,
    mediumTemplate: (loc, spec) =>
      `Commercial agro-enterprise in ${loc} integrating polyhouse farming, organic certification, and post-harvest grading/sorting${spec ? ` (${spec})` : ''} for institutional buyers and urban terminal mandis.`,
  },
  LIVESTOCK: {
    defaultTitle: 'Goat Rearing & Livestock Breeding Enterprise',
    microTemplate: (loc, spec) =>
      `Small-scale goat rearing unit (10-15 goats) in ${loc} utilizing stall-feeding and local grazing, breeding Black Bengal or native breeds${spec ? ` (${spec})` : ''} for high-demand festive and weekly meat markets.`,
    smallTemplate: (loc, spec) =>
      `Commercial goat and livestock breeding farm (25-40 animals) in ${loc} with elevated slatted-floor housing, scheduled deworming/vaccination, and targeted sale during peak festive seasons (Eid/Puja)${spec ? ` (${spec})` : ''}.`,
    mediumTemplate: (loc, spec) =>
      `Modern livestock breeding and fattening station in ${loc} with 60+ head capacity, dedicated fodder cultivation, and institutional live-animal supply chain${spec ? ` (${spec})` : ''}.`,
  },
  TRANSPORT: {
    defaultTitle: 'Rural Passenger & Cargo Logistics Service',
    microTemplate: (loc, spec) =>
      `Local commercial transport service in ${loc} using an electric rickshaw / cargo three-wheeler for daily passenger transit and farmer produce transportation${spec ? ` (${spec})` : ''} between villages and main road junctions.`,
    smallTemplate: (loc, spec) =>
      `Rural logistics and commercial delivery van service in ${loc} connecting local farmers, kirana merchants, and craftsmen${spec ? ` (${spec})` : ''} to sub-division wholesale mandis with scheduled daily routes.`,
    mediumTemplate: (loc, spec) =>
      `Fleet logistics and multi-utility transport business in ${loc} with 2-3 light commercial vehicles (LCVs) handling agricultural freight, school transit, and industrial contract deliveries${spec ? ` (${spec})` : ''}.`,
  },
  HANDICRAFT: {
    defaultTitle: 'Traditional Rural Artisan & Handicraft Workshop',
    microTemplate: (loc, spec) =>
      `Artisan workshop in ${loc} producing handmade terracotta, jute, bamboo, or handloom crafts${spec ? ` (${spec})` : ''} using locally available natural materials for village fairs, tourist spots, and regional markets.`,
    smallTemplate: (loc, spec) =>
      `Craft production collective in ${loc} with 4-6 skilled artisans creating standardized home decor, jute bags, and embroidered textiles${spec ? ` (${spec})` : ''} with digital cataloging and exhibition sales.`,
    mediumTemplate: (loc, spec) =>
      `Artisan enterprise and export-linked craft hub in ${loc} providing raw materials, design guidance, and quality packaging${spec ? ` (${spec})` : ''} for national retail chains and e-commerce platforms.`,
  },
  SERVICES: {
    defaultTitle: 'Rural Technical Services, Repair & Digital CSC Centre',
    microTemplate: (loc, spec) =>
      `Village service point in ${loc} providing mobile phone repair, computer printing, xerox, and Common Service Centre (CSC) government scheme application assistance${spec ? ` (${spec})` : ''}.`,
    smallTemplate: (loc, spec) =>
      `Multi-service technical center in ${loc} combining appliance/motorcycle repair, solar/electrical installation, and digital financial services (AePS/money transfer)${spec ? ` (${spec})` : ''} for 300+ village households.`,
    mediumTemplate: (loc, spec) =>
      `Integrated rural services hub in ${loc} with multi-brand electronics servicing, agricultural pump repair, solar maintenance, and authorized customer support kiosk${spec ? ` (${spec})` : ''}.`,
  },
  OTHER: {
    defaultTitle: 'Localized Village Enterprise & Community Services',
    microTemplate: (loc, spec) =>
      `Micro rural enterprise in ${loc} fulfilling daily consumer demand${spec ? ` for ${spec}` : ''} with low overheads, local sourcing, and personalized neighborhood customer service.`,
    smallTemplate: (loc, spec) =>
      `Small commercial enterprise in ${loc} catering to verified community demand${spec ? ` for ${spec}` : ''}, operating with transparent pricing, dependable quality, and direct local distribution.`,
    mediumTemplate: (loc, spec) =>
      `Organized rural business venture in ${loc} serving regional markets${spec ? ` with ${spec}` : ''}, equipped with standardized tools, trained staff, and structured bank-credit support.`,
  },
};

export function enrichBusinessIdea(input: EnrichIdeaInput): EnrichedIdeaResult {
  const raw = (input.idea || '').trim();
  const cat = input.category || BusinessCategory.OTHER;
  const expansion = CATEGORY_EXPANSIONS[cat] || CATEGORY_EXPANSIONS.OTHER;

  const loc = [input.villageName, input.districtName].filter(Boolean).join(', ') ||
    input.districtName ||
    input.stateName ||
    'the local village catchment';

  const cap = input.availableCapital ?? 50000;
  let scale: 'micro' | 'small' | 'medium' = 'micro';
  let scaleDescriptor= 'Micro Enterprise (₹25k–₹1L Capital)';

  if (cap >= 300000) {
    scale = 'medium';
    scaleDescriptor = 'Medium-Scale Unit (₹3L+ Capital)';
  } else if (cap >= 100000) {
    scale = 'small';
    scaleDescriptor = 'Small Enterprise (₹1L–₉3L Capital)';
  }

  const wordCount = raw.split(/\s+/).filter(Boolean).length;
  const isShort = raw.length < 60 || wordCount <= 5;

  if (!isShort) {
    return {
      originalIdea: raw,
      enrichedIdea: raw,
      displayTitle: raw.length > 50 ? `${raw.slice(0, 47)}...` : raw,
      isEnriched: false,
      scaleDescriptor
    };
  }

  let cleanSpecific = raw;
  if (/^(dairy|milk|kirana|grocery|tailor|tailoring|poultry|chicken|shop|store|business|farm|farming|agriculture|service)$/i.test(raw)) {
    cleanSpecific = '';
  }

  let enriched: string;
  if (scale === 'medium') {
    enriched = expansion.mediumTemplate(loc, cleanSpecific);
  } else if (scale === 'small') {
    enriched = expansion.smallTemplate(loc, cleanSpecific);
  } else {
    enriched = expansion.microTemplate(loc, cleanSpecific);
  }

  return {
    originalIdea: raw,
    enrichedIdea: enriched,
    displayTitle: expansion.defaultTitle,
    isEnriched: true,
    scaleDescriptor
  };
}
