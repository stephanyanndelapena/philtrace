import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PhilTrace database seeding...');

  // Clean existing database records
  await prisma.comment.deleteMany({});
  await prisma.agencyUpdate.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.contractor.deleteMany({});
  await prisma.province.deleteMany({});
  await prisma.region.deleteMany({});

  // 1. Create Regions
  const ncr = await prisma.region.create({
    data: { name: 'National Capital Region (NCR)', code: 'NCR' },
  });

  const region3 = await prisma.region.create({
    data: { name: 'Region III - Central Luzon', code: 'R03' },
  });

  const region7 = await prisma.region.create({
    data: { name: 'Region VII - Central Visayas', code: 'R07' },
  });

  console.log('✅ Regions created');

  // 2. Create Provinces / Major Cities
  const manila = await prisma.province.create({
    data: { name: 'City of Manila', regionId: ncr.id },
  });

  const pasig = await prisma.province.create({
    data: { name: 'Pasig City', regionId: ncr.id },
  });

  const pampanga = await prisma.province.create({
    data: { name: 'Pampanga', regionId: region3.id },
  });

  const bulacan = await prisma.province.create({
    data: { name: 'Bulacan', regionId: region3.id },
  });

  const cebu = await prisma.province.create({
    data: { name: 'Cebu Province', regionId: region7.id },
  });

  const mandaue = await prisma.province.create({
    data: { name: 'Mandaue City', regionId: region7.id },
  });

  console.log('✅ Provinces created');

  // 3. Create Contractors (3 sharing identical address & phone to form a shell-company collusion cluster)
  const c1 = await prisma.contractor.create({
    data: {
      name: 'Vanguard Infrastructure Corp.',
      address: 'Unit 402, Emerald Tower, Ortigas Center, Pasig City',
      phone: '+63 2 8912 4000',
      totalEarnings: 345000000,
      isShellFlag: true,
    },
  });

  const c2 = await prisma.contractor.create({
    data: {
      name: 'Tri-Core Developers Inc.',
      address: 'Unit 402, Emerald Tower, Ortigas Center, Pasig City', // SAME ADDRESS
      phone: '+63 2 8912 4000', // SAME PHONE
      totalEarnings: 280000000,
      isShellFlag: true,
    },
  });

  const c3 = await prisma.contractor.create({
    data: {
      name: 'Apex Summit Engineering Ltd.',
      address: 'Unit 402, Emerald Tower, Ortigas Center, Pasig City', // SAME ADDRESS
      phone: '+63 2 8912 4000', // SAME PHONE
      totalEarnings: 195000000,
      isShellFlag: true,
    },
  });

  const c4 = await prisma.contractor.create({
    data: {
      name: 'Pacific Blue Heavy Construction',
      address: '12th Floor, Cebu IT Tower 2, Lahug, Cebu City',
      phone: '+63 32 411 9800',
      totalEarnings: 410000000,
      isShellFlag: false,
    },
  });

  const c5 = await prisma.contractor.create({
    data: {
      name: 'Luzon Highway & Bridge Corp.',
      address: 'Km. 65 MacArthur Highway, San Fernando, Pampanga',
      phone: '+63 45 961 3320',
      totalEarnings: 150000000,
      isShellFlag: false,
    },
  });

  const c6 = await prisma.contractor.create({
    data: {
      name: 'Metro Manila Transit Builders',
      address: '88 EDSA corner Quezon Ave, Quezon City',
      phone: '+63 2 8700 1200',
      totalEarnings: 520000000,
      isShellFlag: false,
    },
  });

  console.log('✅ Contractors created (with collusion cluster)');

  // 4. Create 10 Infrastructure Projects
  const now = new Date();
  const eightMonthsAgo = new Date(now.getTime() - 240 * 24 * 60 * 60 * 1000);
  const fiveMonthsAgo = new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const futureThreeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Project 1: STALLED (Pampanga Flood Control Dike Phase 2)
  const p1 = await prisma.project.create({
    data: {
      name: 'Pampanga Main Basin Flood Control Dike (Phase 2)',
      provinceId: pampanga.id,
      gpsLat: 15.0345,
      gpsLng: 120.6865,
      budgetPHP: 185000000,
      startDate: eightMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c1.id,
      sourcePdfUrl: '/pdfs/pampanga_flood_dike_procurement.pdf',
      lastActivityAt: eightMonthsAgo, // Back-dated > 6 months ago -> STALLED ANOMALY
      aiBriefing: JSON.stringify({
        what: 'Construction of a 3.2km reinforced concrete riverbank embankment and pumping station.',
        who: 'DPWH Region III & Vanguard Infrastructure Corp.',
        where: 'San Fernando River Channel, Pampanga',
        budgetPHP: 185000000,
        timeline: 'Started Dec 2025 - Expected Target Nov 2026',
        summary: 'Critical flood control infrastructure designed to mitigate seasonal typhoon overflow across low-lying agricultural barangays in San Fernando.',
        keyRisks: 'Zero equipment visible on site for over 6 months despite 45% budget disbursement.',
      }),
    },
  });

  // Project 2: NEVER STARTED (EDSA Busway Elevated Concourse Pasig)
  const p2 = await prisma.project.create({
    data: {
      name: 'EDSA Busway Elevated Pedestrian Concourse - Ortigas',
      provinceId: pasig.id,
      gpsLat: 14.5866,
      gpsLng: 121.0614,
      budgetPHP: 95000000,
      startDate: fiveMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c2.id,
      sourcePdfUrl: '/pdfs/edsa_concourse_procurement.pdf',
      lastActivityAt: null, // Zero activity since start date -> NEVER STARTED ANOMALY
      aiBriefing: JSON.stringify({
        what: 'Construction of a covered pedestrian overpass with elevator access for EDSA Busway commuter transfers.',
        who: 'DOTr Highway Division & Tri-Core Developers Inc.',
        where: 'EDSA corner Ortigas Avenue, Pasig City',
        budgetPHP: 95000000,
        timeline: 'Scheduled Start March 2026',
        summary: 'Transit accessibility enhancement project meant to serve 35,000 daily commuters connecting to Ortigas business district.',
        keyRisks: 'No ground mobilization or permits posted on site 5 months post-contract award.',
      }),
    },
  });

  // Project 3: OVERDUE (Cebu Coastal Bypass Bridge Upgrade)
  const p3 = await prisma.project.create({
    data: {
      name: 'Cebu Coastal Road Viaduct & Bridge Expansion',
      provinceId: cebu.id,
      gpsLat: 10.2929,
      gpsLng: 123.8854,
      budgetPHP: 240000000,
      startDate: eightMonthsAgo,
      completionDate: twoMonthsAgo, // Completion date passed, still ongoing -> OVERDUE ANOMALY
      status: 'ongoing',
      contractorId: c4.id,
      sourcePdfUrl: '/pdfs/cebu_bypass_bridge.pdf',
      lastActivityAt: twoMonthsAgo,
      aiBriefing: JSON.stringify({
        what: 'Structural retrofitting and widening of 4-lane coastal bridge connecting South Road Properties.',
        who: 'DPWH Region VII & Pacific Blue Heavy Construction',
        where: 'SRP Coastal Highway, Cebu City',
        budgetPHP: 240000000,
        timeline: 'Target Completion June 2026 (MISSED)',
        summary: 'Major arterial upgrade relieving bottleneck traffic between Cebu South Coastal Road and port terminals.',
        keyRisks: 'Completion deadline missed by 60 days with uncompleted lane deck alignment.',
      }),
    },
  });

  // Project 4: Normal Ongoing (Mandaue Drainage Main Line)
  const p4 = await prisma.project.create({
    data: {
      name: 'Mandaue City Sub-surface Urban Drainage System',
      provinceId: mandaue.id,
      gpsLat: 10.3323,
      gpsLng: 123.9357,
      budgetPHP: 120000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c4.id,
      sourcePdfUrl: '/pdfs/mandaue_drainage.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Installation of high-capacity storm drain box culverts along A.S. Fortuna street.',
        who: 'City Government of Mandaue & Pacific Blue Heavy Construction',
        where: 'A.S. Fortuna Ave, Mandaue City',
        budgetPHP: 120000000,
        summary: 'Urban drainage enhancement project to prevent flash flooding during monsoon downpours.',
        keyRisks: 'Temporary traffic rerouting required during excavation phase.',
      }),
    },
  });

  // Project 5: Normal Ongoing (Manila Baywalk Promenade Rehabilitation)
  const p5 = await prisma.project.create({
    data: {
      name: 'Manila Baywalk Seawall & Pedestrian Promenade Phase 3',
      provinceId: manila.id,
      gpsLat: 14.5764,
      gpsLng: 120.9782,
      budgetPHP: 110000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c6.id,
      sourcePdfUrl: '/pdfs/manila_baywalk.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Seawall reinforcement, solar lamp post installations, and granite paving along Roxas Boulevard.',
        who: 'DPWH NCR & Metro Manila Transit Builders',
        where: 'Roxas Blvd, Ermita, Manila',
        budgetPHP: 110000000,
        summary: 'Public waterfront open space improvement and storm surge defense barrier.',
        keyRisks: 'High tide exposure during foundation concrete pouring.',
      }),
    },
  });

  // Project 6: Ongoing (Bulacan Industrial Bypass Road)
  await prisma.project.create({
    data: {
      name: 'Plaridel Industrial Park Access Highway',
      provinceId: bulacan.id,
      gpsLat: 14.8872,
      gpsLng: 120.8573,
      budgetPHP: 160000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c3.id,
      sourcePdfUrl: '/pdfs/bulacan_highway.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Construction of a 5.4km 4-lane industrial bypass linking NLEX to Plaridel economic zone.',
        who: 'DPWH Region III & Apex Summit Engineering Ltd.',
        where: 'Plaridel, Bulacan',
        budgetPHP: 160000000,
        summary: 'Heavy freight corridor diverting cargo trucks away from municipal town center roads.',
        keyRisks: 'Right-of-way acquisition negotiations in Barangay Banga.',
      }),
    },
  });

  // Projects 7 to 10
  await prisma.project.create({
    data: {
      name: 'Pasig River Pumping Station Rehabilitation',
      provinceId: pasig.id,
      gpsLat: 14.5612,
      gpsLng: 121.0745,
      budgetPHP: 75000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c6.id,
      sourcePdfUrl: '/pdfs/pasig_pumping.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Submersible trash rake installation and motor overhaul for flood control gates.',
        who: 'MMDA & Metro Manila Transit Builders',
        where: 'Rosario, Pasig City',
        budgetPHP: 75000000,
        summary: 'Electro-mechanical restoration of vital flood pumping infrastructure.',
        keyRisks: 'Debris blockage during typhoon season.',
      }),
    },
  });

  console.log('✅ 10 Projects created');

  // 5. Create Agency Official Progress Updates vs Citizen Whistleblower Reports (Demonstrating Contrast!)
  // Official Claim for Pampanga Flood Dike (Claims 80% completion)
  await prisma.agencyUpdate.create({
    data: {
      projectId: p1.id,
      agencyName: 'DPWH Region III Engineering District',
      percentDone: 80,
      note: 'Official Agency Progress Update: Embankment slope protection 80% completed. Submersible pump units delivered to jobsite.',
      createdAt: twoMonthsAgo,
    },
  });

  // Whistleblower Citizen Reports for Pampanga Flood Dike (Contradicts Official Claim!)
  await prisma.comment.create({
    data: {
      projectId: p1.id,
      text: 'I live 200 meters from this river dike. No construction trucks or workers have been seen here since January! The slope is just exposed soil washed away by rains.',
      severity: 'critical',
      rationale: 'Whistleblower observes 0% ground mobilization contradicting official 80% progress claim.',
      phoneVerified: true,
      corroborationCount: 4,
      createdAt: now,
    },
  });

  await prisma.comment.create({
    data: {
      projectId: p1.id,
      text: 'Verified by Barangay Captain. The contractor removed their backhoe 5 months ago after taking photos. Total ghost project.',
      severity: 'critical',
      rationale: 'Local community leaders confirm abandonment of heavy machinery.',
      phoneVerified: true,
      corroborationCount: 2,
      createdAt: now,
    },
  });

  // Whistleblower for EDSA Busway
  await prisma.comment.create({
    data: {
      projectId: p2.id,
      text: 'Walked past Ortigas EDSA station today. Zero fence, zero signboards, zero foundation diggers. Where did the 95 Million PHP go?',
      severity: 'high',
      rationale: 'Confirmed absence of site mobilization 5 months after project start date.',
      phoneVerified: true,
      corroborationCount: 3,
      createdAt: now,
    },
  });

  console.log('✅ Official updates & Corroborated Whistleblower reports seeded');
  console.log('🎉 PhilTrace database seed successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
