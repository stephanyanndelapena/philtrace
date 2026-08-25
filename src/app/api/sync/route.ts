import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchPhilGepsNotices } from '@/lib/ingest/philgeps';
import { fetchDpwhProgressUpdates } from '@/lib/ingest/dpwh';

export async function POST() {
  try {
    console.log('🔄 Executing Government Live Data Sync Routine...');

    // 1. Fetch procurement notices from PhilGEPS Open Data
    const notices = await fetchPhilGepsNotices();
    const progressUpdates = await fetchDpwhProgressUpdates();

    let createdCount = 0;
    let updatedCount = 0;

    for (const notice of notices) {
      // Find or create Region
      let region = await db.region.findFirst({
        where: { OR: [{ code: notice.regionCode }, { name: { contains: notice.regionCode } }] },
      });

      if (!region) {
        region = await db.region.create({
          data: {
            name: `${notice.regionCode} Region`,
            code: notice.regionCode,
          },
        });
      }

      // Find or create Province
      let province = await db.province.findFirst({
        where: { name: notice.provinceName, regionId: region.id },
      });

      if (!province) {
        province = await db.province.create({
          data: {
            name: notice.provinceName,
            regionId: region.id,
          },
        });
      }

      // Find or create Contractor
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

      // Check if project already exists by name or PhilGEPS control number in aiBriefing
      const existingProject = await db.project.findFirst({
        where: {
          OR: [
            { name: notice.title },
            { aiBriefing: { contains: notice.refId } },
          ],
        },
      });

      const aiBriefingJSON = JSON.stringify({
        what: notice.title,
        who: `${notice.procuringEntity} & ${notice.contractorName}`,
        where: `${notice.provinceName}, ${notice.regionCode}`,
        budgetPHP: notice.approvedBudget,
        sourceAgency: notice.procuringEntity,
        officialControlNo: notice.controlNo,
        philGepsBidRef: notice.refId,
        summary: notice.summary,
        keyRisks: 'Live open data record ingested from PhilGEPS procurement feed.',
      });

      if (!existingProject) {
        const newProj = await db.project.create({
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
            aiBriefing: aiBriefingJSON,
            lastActivityAt: new Date(),
          },
        });

        // Add corresponding progress update if available
        const matchingUpdate = progressUpdates.find((u) => u.philGepsRefId === notice.refId);
        if (matchingUpdate) {
          await db.agencyUpdate.create({
            data: {
              projectId: newProj.id,
              agencyName: matchingUpdate.agencyName,
              percentDone: matchingUpdate.percentDone,
              note: matchingUpdate.note,
              createdAt: new Date(matchingUpdate.updateDate),
            },
          });
        }

        createdCount++;
      } else {
        // Update existing project timestamp
        await db.project.update({
          where: { id: existingProject.id },
          data: {
            lastActivityAt: new Date(),
            aiBriefing: aiBriefingJSON,
          },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalIngestedNotices: notices.length,
        newProjectsCreated: createdCount,
        projectsUpdated: updatedCount,
        sourcesSynced: ['PhilGEPS Open Data', 'DPWH Infrastructure Atlas', 'DBM Open Budget'],
      },
    });
  } catch (error: any) {
    console.error('❌ Data Sync Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync government data.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
