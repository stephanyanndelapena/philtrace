import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { projectId, agencyName, percentDone, note, photoUrl } = await req.json();

    if (!projectId || !agencyName || percentDone === undefined || !note) {
      return NextResponse.json(
        { error: 'Project ID, Agency Name, Completion Percentage, and Note are required.' },
        { status: 400 }
      );
    }

    const update = await db.agencyUpdate.create({
      data: {
        projectId,
        agencyName,
        percentDone: Number(percentDone),
        note,
        photoUrl: photoUrl || null,
      },
    });

    // Update project lastActivityAt timestamp
    await db.project.update({
      where: { id: projectId },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({ success: true, update });
  } catch (error) {
    console.error('Agency Update API Error:', error);
    return NextResponse.json(
      { error: 'Failed to post agency progress update' },
      { status: 500 }
    );
  }
}
