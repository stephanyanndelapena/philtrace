import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PhilTrace 17-Region Philippines Infrastructure Seeding...');

  // Clean existing database records
  await prisma.comment.deleteMany({});
  await prisma.agencyUpdate.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.contractor.deleteMany({});
  await prisma.province.deleteMany({});
  await prisma.region.deleteMany({});

  // ---------------------------------------------------------
  // 1. Create All 17 Administrative Regions of the Philippines
  // ---------------------------------------------------------
  const regions = {
    ncr: await prisma.region.create({ data: { name: 'National Capital Region (NCR)', code: 'NCR' } }),
    car: await prisma.region.create({ data: { name: 'Cordillera Administrative Region (CAR)', code: 'CAR' } }),
    r01: await prisma.region.create({ data: { name: 'Region I - Ilocos Region', code: 'R01' } }),
    r02: await prisma.region.create({ data: { name: 'Region II - Cagayan Valley', code: 'R02' } }),
    r03: await prisma.region.create({ data: { name: 'Region III - Central Luzon', code: 'R03' } }),
    r04a: await prisma.region.create({ data: { name: 'Region IV-A - CALABARZON', code: 'R04A' } }),
    r04b: await prisma.region.create({ data: { name: 'MIMAROPA Region (Region IV-B)', code: 'MIMAROPA' } }),
    r05: await prisma.region.create({ data: { name: 'Region V - Bicol Region', code: 'R05' } }),
    r06: await prisma.region.create({ data: { name: 'Region VI - Western Visayas', code: 'R06' } }),
    r07: await prisma.region.create({ data: { name: 'Region VII - Central Visayas', code: 'R07' } }),
    r08: await prisma.region.create({ data: { name: 'Region VIII - Eastern Visayas', code: 'R08' } }),
    r09: await prisma.region.create({ data: { name: 'Region IX - Zamboanga Peninsula', code: 'R09' } }),
    r10: await prisma.region.create({ data: { name: 'Region X - Northern Mindanao', code: 'R10' } }),
    r11: await prisma.region.create({ data: { name: 'Region XI - Davao Region', code: 'R11' } }),
    r12: await prisma.region.create({ data: { name: 'Region XII - SOCCSKSARGEN', code: 'R12' } }),
    r13: await prisma.region.create({ data: { name: 'Region XIII - Caraga Region', code: 'R13' } }),
    barmm: await prisma.region.create({ data: { name: 'Bangsamoro Autonomous Region (BARMM)', code: 'BARMM' } }),
  };

  console.log('✅ All 17 Administrative Regions created');

  // ---------------------------------------------------------
  // 2. Create Representative Provinces / Major Cities
  // ---------------------------------------------------------
  const provinces = {
    manila: await prisma.province.create({ data: { name: 'City of Manila', regionId: regions.ncr.id } }),
    pasig: await prisma.province.create({ data: { name: 'Pasig City', regionId: regions.ncr.id } }),
    benguet: await prisma.province.create({ data: { name: 'Benguet / Baguio', regionId: regions.car.id } }),
    ilocosNorte: await prisma.province.create({ data: { name: 'Ilocos Norte', regionId: regions.r01.id } }),
    cagayan: await prisma.province.create({ data: { name: 'Cagayan', regionId: regions.r02.id } }),
    pampanga: await prisma.province.create({ data: { name: 'Pampanga', regionId: regions.r03.id } }),
    bulacan: await prisma.province.create({ data: { name: 'Bulacan', regionId: regions.r03.id } }),
    cavite: await prisma.province.create({ data: { name: 'Cavite', regionId: regions.r04a.id } }),
    laguna: await prisma.province.create({ data: { name: 'Laguna', regionId: regions.r04a.id } }),
    palawan: await prisma.province.create({ data: { name: 'Palawan', regionId: regions.r04b.id } }),
    albay: await prisma.province.create({ data: { name: 'Albay', regionId: regions.r05.id } }),
    iloilo: await prisma.province.create({ data: { name: 'Iloilo', regionId: regions.r06.id } }),
    cebu: await prisma.province.create({ data: { name: 'Cebu Province', regionId: regions.r07.id } }),
    mandaue: await prisma.province.create({ data: { name: 'Mandaue City', regionId: regions.r07.id } }),
    leyte: await prisma.province.create({ data: { name: 'Leyte / Tacloban', regionId: regions.r08.id } }),
    zamboanga: await prisma.province.create({ data: { name: 'Zamboanga City', regionId: regions.r09.id } }),
    misamisOr: await prisma.province.create({ data: { name: 'Misamis Oriental / CDO', regionId: regions.r10.id } }),
    davaoCity: await prisma.province.create({ data: { name: 'Davao City', regionId: regions.r11.id } }),
    southCotabato: await prisma.province.create({ data: { name: 'South Cotabato / GenSan', regionId: regions.r12.id } }),
    agusanNorte: await prisma.province.create({ data: { name: 'Agusan del Norte / Butuan', regionId: regions.r13.id } }),
    maguindanao: await prisma.province.create({ data: { name: 'Maguindanao del Sur', regionId: regions.barmm.id } }),
  };

  console.log('✅ Provinces & Cities created across all regions');

  // ---------------------------------------------------------
  // 3. Create Legitimate Contractors & Collusion Clusters
  // ---------------------------------------------------------
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
      address: 'Unit 402, Emerald Tower, Ortigas Center, Pasig City', // SAME ADDRESS (COLLUSION FLAG)
      phone: '+63 2 8912 4000', // SAME PHONE
      totalEarnings: 280000000,
      isShellFlag: true,
    },
  });

  const c3 = await prisma.contractor.create({
    data: {
      name: 'Apex Summit Engineering Ltd.',
      address: 'Unit 402, Emerald Tower, Ortigas Center, Pasig City', // SAME ADDRESS (COLLUSION FLAG)
      phone: '+63 2 8912 4000',
      totalEarnings: 195000000,
      isShellFlag: true,
    },
  });

  const c4 = await prisma.contractor.create({
    data: {
      name: 'Pacific Blue Heavy Construction Inc.',
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
      totalEarnings: 210000000,
      isShellFlag: false,
    },
  });

  const c6 = await prisma.contractor.create({
    data: {
      name: 'Mindanao Infrastructure Development Group',
      address: 'JP Laurel Avenue, Bajada, Davao City',
      phone: '+63 82 224 5500',
      totalEarnings: 680000000,
      isShellFlag: false,
    },
  });

  const c7 = await prisma.contractor.create({
    data: {
      name: 'Visayas Coastal Engineering Builders',
      address: 'Diversion Road, Mandurriao, Iloilo City',
      phone: '+63 33 320 9011',
      totalEarnings: 310000000,
      isShellFlag: false,
    },
  });

  console.log('✅ Contractors created with registered business addresses');

  // ---------------------------------------------------------
  // 4. Create Real-World Sourced Projects Across All 17 Regions
  // ---------------------------------------------------------
  const now = new Date();
  const eightMonthsAgo = new Date(now.getTime() - 240 * 24 * 60 * 60 * 1000);
  const fiveMonthsAgo = new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const futureThreeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // 1. REGION III - STALLED ANOMALY (Pampanga Flood Control Dike)
  const p1 = await prisma.project.create({
    data: {
      name: 'Pampanga Main Basin Flood Control Dike (Phase 2)',
      provinceId: provinces.pampanga.id,
      gpsLat: 15.0345,
      gpsLng: 120.6865,
      budgetPHP: 185000000,
      startDate: eightMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c1.id,
      sourcePdfUrl: 'https://www.dpwh.gov.ph/dpwh/sites/default/files/transparency/Pampanga_Flood_Dike_Phase2_2025.pdf',
      lastActivityAt: eightMonthsAgo, // Backdated > 6 months -> STALLED
      aiBriefing: JSON.stringify({
        what: 'Construction of a 3.2km reinforced concrete riverbank embankment and pumping station along San Fernando river channel.',
        who: 'DPWH Region III & Vanguard Infrastructure Corp.',
        where: 'San Fernando River Channel, Pampanga',
        budgetPHP: 185000000,
        sourceAgency: 'DPWH Region III - Flood Control Master Plan',
        officialControlNo: 'DPWH-R03-2025-FC-00412',
        philGepsBidRef: 'PHILGEPS-BID-10928374',
        summary: 'Critical flood mitigation project protecting low-lying agricultural barangays in San Fernando from seasonal river overflows.',
        keyRisks: 'Zero equipment or active workforce visible on site for over 6 months despite 45% budget disbursement.',
      }),
    },
  });

  // 2. NCR - NEVER STARTED ANOMALY (EDSA Busway Elevated Concourse Pasig)
  const p2 = await prisma.project.create({
    data: {
      name: 'EDSA Busway Elevated Pedestrian Concourse - Ortigas',
      provinceId: provinces.pasig.id,
      gpsLat: 14.5866,
      gpsLng: 121.0614,
      budgetPHP: 95000000,
      startDate: fiveMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c2.id,
      sourcePdfUrl: 'https://dotr.gov.ph/images/transparency/EDSA_Busway_Concourse_Ortigas_Contract.pdf',
      lastActivityAt: null, // Zero activity -> NEVER STARTED
      aiBriefing: JSON.stringify({
        what: 'Construction of a covered pedestrian overpass with elevator access for EDSA Busway commuter transfers.',
        who: 'DOTr Highway & Transport Division & Tri-Core Developers Inc.',
        where: 'EDSA corner Ortigas Avenue, Pasig City',
        budgetPHP: 95000000,
        sourceAgency: 'DOTr Urban Transport Infrastructure Program',
        officialControlNo: 'DOTr-NCR-2025-TR-0089',
        philGepsBidRef: 'PHILGEPS-BID-10884920',
        summary: 'Transit accessibility enhancement project serving 35,000 daily commuters connecting to the Ortigas commercial district.',
        keyRisks: 'No ground mobilization or permits posted on site 5 months post-contract award.',
      }),
    },
  });

  // 3. REGION VII - OVERDUE ANOMALY (Cebu Coastal Highway Expansion)
  const p3 = await prisma.project.create({
    data: {
      name: 'Cebu Coastal Road Viaduct & Bridge Expansion',
      provinceId: provinces.cebu.id,
      gpsLat: 10.2929,
      gpsLng: 123.8854,
      budgetPHP: 240000000,
      startDate: eightMonthsAgo,
      completionDate: twoMonthsAgo, // Completion date passed -> OVERDUE
      status: 'ongoing',
      contractorId: c4.id,
      sourcePdfUrl: 'https://www.dpwh.gov.ph/dpwh/sites/default/files/transparency/Cebu_Coastal_Viaduct_Expansion.pdf',
      lastActivityAt: twoMonthsAgo,
      aiBriefing: JSON.stringify({
        what: 'Structural retrofitting and widening of 4-lane coastal bridge connecting South Road Properties.',
        who: 'DPWH Region VII & Pacific Blue Heavy Construction Inc.',
        where: 'SRP Coastal Highway, Cebu City',
        budgetPHP: 240000000,
        sourceAgency: 'DPWH Region VII Infrastructure Office',
        officialControlNo: 'DPWH-R07-2025-HW-00122',
        philGepsBidRef: 'PHILGEPS-BID-10776214',
        summary: 'Arterial bridge expansion to relieve bottleneck traffic between Cebu South Coastal Road and port terminals.',
        keyRisks: 'Completion deadline missed by 60 days with uncompleted lane deck alignment.',
      }),
    },
  });

  // 4. CAR - Kennon Road Slope Protection & Viaduct (Benguet)
  await prisma.project.create({
    data: {
      name: 'Kennon Road Rockfall Mitigation & Slope Stabilization Viaduct',
      provinceId: provinces.benguet.id,
      gpsLat: 16.3508,
      gpsLng: 120.6011,
      budgetPHP: 320000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c5.id,
      sourcePdfUrl: 'https://www.dpwh.gov.ph/dpwh/sites/default/files/transparency/Kennon_Road_Slope_Mitigation.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Installation of high-tensile steel wire mesh, rockfall barriers, and concrete rock shed structure.',
        who: 'DPWH Cordillera Administrative Region & Luzon Highway & Bridge Corp.',
        where: 'Camp 3 to Camp 6, Kennon Road, Tuba, Benguet',
        budgetPHP: 320000000,
        sourceAgency: 'DPWH CAR Regional Office',
        officialControlNo: 'DPWH-CAR-2025-SLP-0019',
        philGepsBidRef: 'PHILGEPS-BID-11029381',
        summary: 'Disaster risk resilience project preventing landslides on major arterial road to Baguio City.',
        keyRisks: 'Heavy monsoonal rains causing temporary slope instability during excavation.',
      }),
    },
  });

  // 5. REGION I - Ilocos Norte Coastal Expressway Bypass
  await prisma.project.create({
    data: {
      name: 'Laoag City Coastal Bypass Road & Sea Wall Defense',
      provinceId: provinces.ilocosNorte.id,
      gpsLat: 18.196,
      gpsLng: 120.5927,
      budgetPHP: 210000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c5.id,
      sourcePdfUrl: 'https://www.dpwh.gov.ph/dpwh/sites/default/files/transparency/Laoag_Coastal_Bypass.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Construction of a 6.8km 4-lane asphalt bypass highway with integrated coastal erosion barrier.',
        who: 'DPWH Region I & Luzon Highway & Bridge Corp.',
        where: 'Laoag Coastal Highway, Ilocos Norte',
        budgetPHP: 210000000,
        sourceAgency: 'DPWH Region I First District',
        officialControlNo: 'DPWH-R01-2025-CW-0083',
        philGepsBidRef: 'PHILGEPS-BID-11048821',
        summary: 'Bypass corridor diverting cargo transport from Laoag city core and shielding coastline from storm surges.',
        keyRisks: 'Right-of-way alignment negotiations along coastal barangays.',
      }),
    },
  });

  // 6. REGION II - Cagayan River Basin Flood Protection Phase II
  await prisma.project.create({
    data: {
      name: 'Cagayan River Lower Basin Flood Mitigation Embankment',
      provinceId: provinces.cagayan.id,
      gpsLat: 17.6132,
      gpsLng: 121.7269,
      budgetPHP: 450000000,
      startDate: eightMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c5.id,
      sourcePdfUrl: 'https://www.dpwh.gov.ph/dpwh/sites/default/files/transparency/Cagayan_River_Flood_Phase2.pdf',
      lastActivityAt: eightMonthsAgo, // STALLED ANOMALY
      aiBriefing: JSON.stringify({
        what: 'Dredging of 5.5km river channel and construction of revetment walls along Tuguegarao River Basin.',
        who: 'DPWH Region II & Luzon Highway & Bridge Corp.',
        where: 'Tuguegarao City River Basin, Cagayan',
        budgetPHP: 450000000,
        sourceAgency: 'DPWH Region II Major River Basin Control Office',
        officialControlNo: 'DPWH-R02-2025-RB-0099',
        philGepsBidRef: 'PHILGEPS-BID-10938472',
        summary: 'Major river basin infrastructure designed to absorb typhoon discharge and prevent agricultural inundation.',
        keyRisks: 'Dredging vessel demobilized for over 7 months without official justification.',
      }),
    },
  });

  // 7. REGION IV-A - CALABARZON (Cavite-Laguna Expressway Link)
  await prisma.project.create({
    data: {
      name: 'CALAX Silang East Interchange Access Connector Road',
      provinceId: provinces.cavite.id,
      gpsLat: 14.2311,
      gpsLng: 120.9752,
      budgetPHP: 175000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c1.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/CALAX_Silang_Access.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: '4-lane concrete feeder road connecting Aguinaldo Highway to CALAX Tollway.',
        who: 'DPWH Region IV-A CALABARZON & Vanguard Infrastructure Corp.',
        where: 'Silang, Cavite',
        budgetPHP: 175000000,
        sourceAgency: 'DPWH CALABARZON Regional Office',
        officialControlNo: 'DPWH-R04A-2025-EXP-0044',
        philGepsBidRef: 'PHILGEPS-BID-11100293',
        summary: 'Feeder road reducing commute time between Cavite industrial parks and SLEX tollways.',
        keyRisks: 'Utility relocation permits pending with local electric distribution utilities.',
      }),
    },
  });

  // 8. MIMAROPA (Region IV-B) - Palawan Coastal Highway & Seawall
  await prisma.project.create({
    data: {
      name: 'Puerto Princesa Baywalk Expansion & Seawall Defense',
      provinceId: provinces.palawan.id,
      gpsLat: 9.7423,
      gpsLng: 118.735,
      budgetPHP: 130000000,
      startDate: fiveMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c4.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/Palawan_Baywalk_Expansion.pdf',
      lastActivityAt: null, // NEVER STARTED ANOMALY
      aiBriefing: JSON.stringify({
        what: 'Coastal seawall reinforcement, pedestrian promenade, and wave-deflecting armor stone placement.',
        who: 'DPWH Region IV-B MIMAROPA & Pacific Blue Heavy Construction Inc.',
        where: 'Puerto Princesa Bayfront, Palawan',
        budgetPHP: 130000000,
        sourceAgency: 'DPWH MIMAROPA Regional Office',
        officialControlNo: 'DPWH-R04B-2025-CS-0031',
        philGepsBidRef: 'PHILGEPS-BID-10847291',
        summary: 'Coastal infrastructure preserving urban shoreline from storm surge tidal erosion.',
        keyRisks: 'Zero heavy equipment stationed on site 5 months post-award.',
      }),
    },
  });

  // 9. REGION V - Bicol International Airport Access Highway (Albay)
  await prisma.project.create({
    data: {
      name: 'Bicol Cargo Corridor & Legazpi Airport Access Highway',
      provinceId: provinces.albay.id,
      gpsLat: 13.1391,
      gpsLng: 123.7346,
      budgetPHP: 290000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c7.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/Bicol_Airport_Access_Road.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Constructing 8.2km 4-lane arterial road linking Maharlika Highway to Daraga International Airport.',
        who: 'DPWH Region V Bicol & Visayas Coastal Engineering Builders',
        where: 'Daraga - Legazpi Corridor, Albay',
        budgetPHP: 290000000,
        sourceAgency: 'DPWH Region V Regional Office',
        officialControlNo: 'DPWH-R05-2025-HW-0062',
        philGepsBidRef: 'PHILGEPS-BID-11099238',
        summary: 'Logistics access road accommodating heavy container freight serving Southern Luzon hub.',
        keyRisks: 'Volcanic ash deposit soil stabilization along slopes near Mayon perimeter.',
      }),
    },
  });

  // 10. REGION VI - Panay River Basin Flood Mitigation (Iloilo)
  await prisma.project.create({
    data: {
      name: 'Iloilo Flood Control Channel & Siltation Basin Phase 3',
      provinceId: provinces.iloilo.id,
      gpsLat: 10.7202,
      gpsLng: 122.5621,
      budgetPHP: 310000000,
      startDate: eightMonthsAgo,
      completionDate: twoMonthsAgo, // OVERDUE ANOMALY
      status: 'ongoing',
      contractorId: c7.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/Iloilo_Flood_Control_Phase3.pdf',
      lastActivityAt: twoMonthsAgo,
      aiBriefing: JSON.stringify({
        what: 'Construction of floodway gates, concrete retaining walls, and retention basins along Jaro River.',
        who: 'DPWH Region VI & Visayas Coastal Engineering Builders',
        where: 'Jaro River Basin, Iloilo City',
        budgetPHP: 310000000,
        sourceAgency: 'DPWH Region VI Western Visayas',
        officialControlNo: 'DPWH-R06-2025-FC-00109',
        philGepsBidRef: 'PHILGEPS-BID-10777123',
        summary: 'Urban flood diversion canal mitigating monsoon inundation across Metro Iloilo.',
        keyRisks: 'Project deadline exceeded by 60 days with sluice gate assembly unfinished.',
      }),
    },
  });

  // 11. REGION VIII - Samar-Leyte Inter-Island Causeway Link
  await prisma.project.create({
    data: {
      name: 'Tacloban Coastal Guard Wall & San Juanico Approach Road',
      provinceId: provinces.leyte.id,
      gpsLat: 11.2434,
      gpsLng: 125.0042,
      budgetPHP: 260000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c4.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/Tacloban_Coastal_Wall.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Reinforced concrete sea dikes and wave breaking barriers guarding Tacloban coastal barangays.',
        who: 'DPWH Region VIII Eastern Visayas & Pacific Blue Heavy Construction Inc.',
        where: 'Cancabato Bay, Tacloban City, Leyte',
        budgetPHP: 260000000,
        sourceAgency: 'DPWH Region VIII Regional Office',
        officialControlNo: 'DPWH-R08-2025-CW-0051',
        philGepsBidRef: 'PHILGEPS-BID-11119283',
        summary: 'Storm surge prevention defense protecting typhoon-vulnerable coastal settlements in Leyte.',
        keyRisks: 'Tidal wave action restricting underwater foundation pile driving.',
      }),
    },
  });

  // 12. REGION IX - Zamboanga Coastal Bypass & Flood Wall
  await prisma.project.create({
    data: {
      name: 'Zamboanga City West Coast Highway & Flood Wall',
      provinceId: provinces.zamboanga.id,
      gpsLat: 6.9214,
      gpsLng: 122.079,
      budgetPHP: 190000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c6.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/Zamboanga_West_Coast_Road.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Road widening, concrete box culvert installation, and shoreline protective seawall.',
        who: 'DPWH Region IX & Mindanao Infrastructure Development Group',
        where: 'Labuan - Limpapa Coastal Road, Zamboanga City',
        budgetPHP: 190000000,
        sourceAgency: 'DPWH Region IX Zamboanga Peninsula',
        officialControlNo: 'DPWH-R09-2025-HW-0038',
        philGepsBidRef: 'PHILGEPS-BID-11088472',
        summary: 'Strategic commercial corridor connecting agro-industrial zones to Zamboanga International Port.',
        keyRisks: 'Culvert drainage installation across marshy terrain.',
      }),
    },
  });

  // 13. REGION X - Cagayan de Oro River Coastal & Flood Risk Management
  await prisma.project.create({
    data: {
      name: 'Cagayan de Oro River Dike & Boulevard Extension Phase 2',
      provinceId: provinces.misamisOr.id,
      gpsLat: 8.4822,
      gpsLng: 124.6472,
      budgetPHP: 380000000,
      startDate: eightMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c6.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/CDO_River_Dike_Phase2.pdf',
      lastActivityAt: eightMonthsAgo, // STALLED ANOMALY
      aiBriefing: JSON.stringify({
        what: 'Construction of 4.1km reinforced river dike wall and urban riverfront boulevard.',
        who: 'DPWH Region X & Mindanao Infrastructure Development Group',
        where: 'Consolacion - Carmen Riverbank, Cagayan de Oro City',
        budgetPHP: 380000000,
        sourceAgency: 'DPWH Region X Northern Mindanao',
        officialControlNo: 'DPWH-R10-2025-FC-00142',
        philGepsBidRef: 'PHILGEPS-BID-10912834',
        summary: 'Major flood prevention dike protecting CDO urban center from river flash flooding.',
        keyRisks: 'Incomplete embankment slope protection abandoned for over 6 months.',
      }),
    },
  });

  // 14. REGION XI - Davao City Coastal Road & Viaduct Phase 2
  await prisma.project.create({
    data: {
      name: 'Davao City Coastal Road Segment B Viaduct Expansion',
      provinceId: provinces.davaoCity.id,
      gpsLat: 7.0731,
      gpsLng: 125.6128,
      budgetPHP: 520000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c6.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/Davao_Coastal_Road_SegmentB.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Offshore viaduct bridge spanning Bucana River to Bago Aplaya.',
        who: 'DPWH Region XI & Mindanao Infrastructure Development Group',
        where: 'Bucana - Times Beach Coastal Road, Davao City',
        budgetPHP: 520000000,
        sourceAgency: 'DPWH Region XI Davao Regional Office',
        officialControlNo: 'DPWH-R11-2025-IFP-0008',
        philGepsBidRef: 'PHILGEPS-BID-11120094',
        summary: 'NEDA Flagship Expressway bypass bypassing downtown Davao traffic bottlenecks.',
        keyRisks: 'Environmental compliance monitoring for coastal mangrove protection.',
      }),
    },
  });

  // 15. REGION XII - SOCCSKSARGEN (Rio Grande de Mindanao Flood Mitigation)
  await prisma.project.create({
    data: {
      name: 'General Santos Agro-Industrial Highway & River Channel Control',
      provinceId: provinces.southCotabato.id,
      gpsLat: 6.1164,
      gpsLng: 125.1716,
      budgetPHP: 230000000,
      startDate: fiveMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c3.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/GenSan_Agro_Industrial_Road.pdf',
      lastActivityAt: null, // NEVER STARTED ANOMALY
      aiBriefing: JSON.stringify({
        what: 'Construction of 6.0km heavy container bypass road and Silway River wall.',
        who: 'DPWH Region XII & Apex Summit Engineering Ltd.',
        where: 'Makar - Tambler Economic Zone, General Santos City',
        budgetPHP: 230000000,
        sourceAgency: 'DPWH Region XII SOCCSKSARGEN',
        officialControlNo: 'DPWH-R12-2025-HW-0071',
        philGepsBidRef: 'PHILGEPS-BID-10899214',
        summary: 'Heavy freight highway connecting fishport processing centers to regional highway network.',
        keyRisks: 'Zero site equipment or mobilization recorded 5 months after budget release.',
      }),
    },
  });

  // 16. REGION XIII - Caraga (Agusan River Basin Protection Butuan)
  await prisma.project.create({
    data: {
      name: 'Agusan River Embankment & Butuan City Flood Pumping Main',
      provinceId: provinces.agusanNorte.id,
      gpsLat: 8.9475,
      gpsLng: 125.5406,
      budgetPHP: 310000000,
      startDate: twoMonthsAgo,
      completionDate: futureThreeMonths,
      status: 'ongoing',
      contractorId: c6.id,
      sourcePdfUrl: 'https://dpwh.gov.ph/transparency/Agusan_River_Flood_Pumping.pdf',
      lastActivityAt: now,
      aiBriefing: JSON.stringify({
        what: 'Construction of high-volume flood gates, pumping stations, and river levee bunds.',
        who: 'DPWH Region XIII Caraga & Mindanao Infrastructure Development Group',
        where: 'Agusan Riverbank, Butuan City',
        budgetPHP: 310000000,
        sourceAgency: 'DPWH Caraga Regional Office',
        officialControlNo: 'DPWH-R13-2025-FC-0055',
        philGepsBidRef: 'PHILGEPS-BID-11077619',
        summary: 'River basin flood mitigation system shielding low-lying residential sectors of Butuan City.',
        keyRisks: 'Seasonal water level cresting during rainy season.',
      }),
    },
  });

  // 17. BARMM - Bangsamoro Autonomous Region (Maguindanao Marshway Channel)
  await prisma.project.create({
    data: {
      name: 'Liguasan Marshland Perimeter Channel & Cotabato City River Defense',
      provinceId: provinces.maguindanao.id,
      gpsLat: 7.2236,
      gpsLng: 124.2463,
      budgetPHP: 340000000,
      startDate: eightMonthsAgo,
      completionDate: twoMonthsAgo, // OVERDUE ANOMALY
      status: 'ongoing',
      contractorId: c3.id,
      sourcePdfUrl: 'https://barmm.gov.ph/transparency/MPW_Liguasan_Channel.pdf',
      lastActivityAt: twoMonthsAgo,
      aiBriefing: JSON.stringify({
        what: 'Channel widening and concrete dike embankment guarding marshland communities.',
        who: 'Ministry of Public Works (MPW-BARMM) & Apex Summit Engineering Ltd.',
        where: 'Tamontaka River Channel, Maguindanao del Sur',
        budgetPHP: 340000000,
        sourceAgency: 'Ministry of Public Works - BARMM',
        officialControlNo: 'MPW-BARMM-2025-FC-0012',
        philGepsBidRef: 'PHILGEPS-BID-10788294',
        summary: 'Regional flood defense infrastructure managing heavy siltation runoff from Liguasan Marsh.',
        keyRisks: 'Past completion target date by 60 days with uninstalled floodgate controls.',
      }),
    },
  });

  console.log('✅ Sourced Projects created across all 17 Administrative Regions of the Philippines');

  // ---------------------------------------------------------
  // 5. Create Official Progress Updates & Whistleblower Reports
  // ---------------------------------------------------------
  // Pampanga Flood Control Official Claim vs Whistleblower Report
  await prisma.agencyUpdate.create({
    data: {
      projectId: p1.id,
      agencyName: 'DPWH Region III Engineering District',
      percentDone: 80,
      note: 'Official Agency Progress Update: Embankment slope protection 80% completed according to Q2 reporting.',
      createdAt: twoMonthsAgo,
    },
  });

  await prisma.comment.create({
    data: {
      projectId: p1.id,
      text: 'I live 200 meters from this river dike. No construction trucks or workers have been seen here since January! The slope is just exposed soil washed away by rains.',
      severity: 'critical',
      rationale: 'Whistleblower observes 0% ground mobilization contradicting official 80% progress claim.',
      phoneVerified: true,
      corroborationCount: 7,
      createdAt: now,
    },
  });

  await prisma.comment.create({
    data: {
      projectId: p1.id,
      text: 'Verified by Barangay Captain. The contractor removed heavy machinery months ago after taking photo ops. Total ghost project.',
      severity: 'critical',
      rationale: 'Local community leadership confirms abandonment.',
      phoneVerified: true,
      corroborationCount: 5,
      createdAt: now,
    },
  });

  // EDSA Busway Whistleblower Report
  await prisma.comment.create({
    data: {
      projectId: p2.id,
      text: 'Walked past Ortigas EDSA station today. Zero fence, zero signboards, zero foundation diggers. Where did the 95 Million PHP budget go?',
      severity: 'high',
      rationale: 'Confirmed absence of site mobilization 5 months post-contract award.',
      phoneVerified: true,
      corroborationCount: 4,
      createdAt: now,
    },
  });

  // Cebu Coastal Highway Whistleblower Report
  await prisma.comment.create({
    data: {
      projectId: p3.id,
      text: 'The completion date was 2 months ago, but 2 lanes are still blocked with raw rebar sticking out into traffic. Massive bottleneck during peak hours.',
      severity: 'medium',
      rationale: 'Citizen corroboration of overdue deadline and uncompleted lanes.',
      phoneVerified: true,
      corroborationCount: 3,
      createdAt: now,
    },
  });

  console.log('✅ Official updates & Whistleblower reports successfully seeded');
  console.log('🎉 PhilTrace 17-Region Database Seed Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
