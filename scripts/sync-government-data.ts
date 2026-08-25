import { db } from '../src/lib/db';
import { fetchPhilGepsNotices } from '../src/lib/ingest/philgeps';
import { fetchDpwhProgressUpdates } from '../src/lib/ingest/dpwh';

async function syncGovernmentDataCLI() {
  console.log('🌐 [CLI Sync] Initializing Production Data Ingestion Routine...');
  const notices = await fetchPhilGepsNotices();
  const progressUpdates = await fetchDpwhProgressUpdates();

  console.log(`📥 Retrieved ${notices.length} PhilGEPS notice records and ${progressUpdates.length} DPWH progress updates.`);

  let createdCount = 0;
  for (const notice of notices) {
    let region = await db.region.findFirst({
      where: { OR: [{ code: notice.regionCode }, { name: { contains: notice.regionCode } }] },
    });

    if (!region) {
      region = await db.region.create({
        data: { name: `${notice.regionCode} Region`, code: notice.regionCode },
      });
    }

    let province = await db.province.findFirst({
      where: { name: notice.provinceName, regionId: region.id },
    });

    if (!province) {
      province = await db.province.create({
        data: { name: notice.provinceName, regionId: region.id },
      });
    }

    let contractor = await db.contractor.findFirst({
      where: { name: notice.contractorName },
    });

    if (!contractor) {
      contractor = await db.contractor.create({
        data: {
          name: notice.contractorName,
          address: notice.contractorAddress,
          phone: notice.contractorPhone,
          totalEarnings: notice.approvedBudget,
          isShellFlag: false,
        },
      });
    }

    const existingProject = await db.project.findFirst({
      where: { name: notice.title },
    });

    if (!existingProject) {
      await db.project.create({
        data: {
          name: notice.title,
          provinceId: province.id,
          gpsLat: notice.gpsLat,
          gpsLng: notice.gpsLng,
          budgetPHP: notice.approvedBudget,
          startDate: new Date(notice.awardDate),
          completionDate: new Date(notice.targetCompletionDate),
          status: 'ongoing',
          contractorId: contractor.id,
          sourcePdfUrl: notice.pdfUrl,
          aiBriefing: JSON.stringify({
            what: notice.title,
            who: `${notice.procuringEntity} & ${notice.contractorName}`,
            where: `${notice.provinceName}, ${notice.regionCode}`,
            budgetPHP: notice.approvedBudget,
            sourceAgency: notice.procuringEntity,
            officialControlNo: notice.controlNo,
            philGepsBidRef: notice.refId,
            summary: notice.summary,
            keyRisks: 'Live open data record ingested from PhilGEPS procurement feed.',
          }),
          lastActivityAt: new Date(),
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ [CLI Sync] Successfully completed! Ingested ${createdCount} new project records.`);
  process.exit(0);
}

syncGovernmentDataCLI().catch((err) => {
  console.error('❌ [CLI Sync] Failed:', err);
  process.exit(1);
});
