import { PrismaClient, BusinessCategory, Gender, SocialCategory, AnalysisStatus, Confidence } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedDemoUsers(prisma: PrismaClient) {
  console.log('👤 Seeding demo users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Fetch a valid village to associate with the users
  const village = await prisma.village.findFirst({
    include: { block: { include: { district: { include: { state: true } } } } }
  });

  const locationJson = village ? {
    villageId: village.id,
    villageName: village.name,
    blockName: village.block.name,
    districtName: village.block.district.name,
    stateName: village.block.district.state.name,
    latitude: village.latitude || 23.471,
    longitude: village.longitude || 88.556,
  } : {
    villageName: 'Nadia Pilot Village',
    districtName: 'Nadia',
    stateName: 'West Bengal',
    latitude: 23.471,
    longitude: 88.556,
  };

  // Define 3 demo users
  const demoUsers = [
    {
      phone: '9999999991',
      name: 'Ramesh Kumar',
      email: 'ramesh@demo.com',
      gender: Gender.MALE,
      category: SocialCategory.OBC,
      passwordHash,
      businessCategory: BusinessCategory.DAIRY,
      businessIdea: 'I want to start a local dairy farm and sell paneer',
      availableCapital: 50000,
    },
    {
      phone: '9999999992',
      name: 'Sunita Devi',
      email: 'sunita@demo.com',
      gender: Gender.FEMALE,
      category: SocialCategory.SC,
      passwordHash,
      businessCategory: BusinessCategory.TEXTILES_TAILORING,
      businessIdea: 'Opening a boutique and stitching school uniforms',
      availableCapital: 20000,
    },
    {
      phone: '9999999993',
      name: 'Abdul Rehman',
      email: 'abdul@demo.com',
      gender: Gender.MALE,
      category: SocialCategory.MINORITY,
      passwordHash,
      businessCategory: BusinessCategory.FOOD_PROCESSING,
      businessIdea: 'Mustard oil cold pressing and spices packaging',
      availableCapital: 100000,
    }
  ];

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: {
        phone: u.phone,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        gender: u.gender,
        category: u.category,
        location: locationJson,
      },
    });

    // Upsert the analysis
    await prisma.analysis.upsert({
      where: {
        id: (await prisma.analysis.findFirst({ where: { userId: user.id } }))?.id || 'new_record'
      },
      update: {
        villageId: village?.id,
        latitude: locationJson.latitude,
        longitude: locationJson.longitude,
      },
      create: {
        userId: user.id,
        villageId: village?.id,
        latitude: locationJson.latitude,
        longitude: locationJson.longitude,
        catchmentRadiusKm: 10,
        businessCategory: u.businessCategory,
        businessIdea: u.businessIdea,
        availableCapital: u.availableCapital,
        status: AnalysisStatus.COMPLETED,
        confidence: Confidence.HIGH,
        feasibilityScore: {
          marketDemandScore: 18,
          competitionScore: 15,
          financialViabilityScore: 16,
          capitalAdequacyScore: 14,
          riskResilienceScore: 15,
          totalScore: 78,
          grade: 'GOOD',
        },
        aiRecommendation: {
          decision: 'PROCEED',
          viabilityScore: 78,
          summary: `Excellent opportunity for ${u.businessCategory.replace('_', ' ')} in this region. Demand is strong.`,
          strengths: ['High local demand', 'Good profit margins', 'Eligible for govt subsidies'],
          weaknesses: ['Requires consistent electricity', 'Initial capital intensive'],
          recommendedNextStep: 'Finalize equipment vendors and apply for the MUDRA scheme.',
        },
        actionPlan: {
          planDurationDays: 30,
          milestones: [
            {
              phase: 'Phase 1: Setup',
              dayRange: 'Days 1-10',
              tasks: ['Find location', 'Buy equipment']
            }
          ],
          fundingReadinessChecklist: ['Aadhaar', 'PAN', 'Bank Statement']
        },
        marketIntelligence: {
          demographics: {
            totalPopulation: 12500,
            households: 2500,
          },
          topCrops: [{ cropName: 'Paddy' }, { cropName: 'Jute' }],
          livestock: [{ animalType: 'Cattle', totalCount: 4500 }]
        },
        competitorAnalysis: {
          totalObserved: 2,
          totalReported: 3,
          totalEstimatedMin: 5,
          densityPerSqKm: 0.1,
        },
        opportunityAnalysis: {
          marketGaps: ['Quality control', 'Home delivery'],
          potentialNiches: ['Premium packaging'],
          recommendedModel: `Hybrid ${u.businessCategory}`,
          opportunityScore: 85,
        },
        financialPlan: {
          projectCost: u.availableCapital * 5,
          availableCapital: u.availableCapital,
          loanRequired: u.availableCapital * 4,
          marginPercentage: 20,
          matchedSchemeName: 'PMMY MUDRA',
          interestRate: 10.5,
          tenureMonths: 60,
          netLoanAmount: u.availableCapital * 4,
          emi: { emi: Math.round((u.availableCapital * 4) * 0.02) },
          cashflow: { isCashflowPositive: true },
          breakEven: { isViable: true },
          workingCapital: { totalWorkingCapital: u.availableCapital * 0.5 },
          stressTest: { overallRiskLevel: 'LOW' }
        },
        riskAssessment: {
          riskFactors: [
            {
              risk: 'Price fluctuation',
              category: 'market',
              probability: 'medium',
              impact: 'medium',
              severity: 'medium',
              mitigation: 'Long term contracts'
            }
          ],
          overallRiskScore: 35,
          riskRating: 'LOW'
        },
      }
    });
  }

  console.log('✅ Demo users seeded successfully (Passwords are "password123")');
}
