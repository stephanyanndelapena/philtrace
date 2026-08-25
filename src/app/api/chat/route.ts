import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { askGeminiAssistant } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    // Build compact JSON dataset context from live Postgres/Supabase DB
    const projectsCount = await db.project.count();
    const contractorsCount = await db.contractor.count();
    const flaggedContractors = await db.contractor.count({ where: { isShellFlag: true } });
    const reportsCount = await db.comment.count();

    const sampleProjects = await db.project.findMany({
      take: 5,
      select: {
        name: true,
        status: true,
        budgetPHP: true,
        province: { select: { name: true, region: { select: { name: true } } } },
        contractor: { select: { name: true } },
      },
    });

    const datasetContext = JSON.stringify({
      totalProjects: projectsCount,
      totalContractors: contractorsCount,
      shellContractorsDetected: flaggedContractors,
      totalWhistleblowerReports: reportsCount,
      sampleProjects: sampleProjects.map((p) => ({
        title: p.name,
        status: p.status,
        budgetPHP: `₱${(p.budgetPHP / 1000000).toFixed(1)}M`,
        location: `${p.province.name}, ${p.province.region.name}`,
        contractor: p.contractor.name,
      })),
    });

    const answer = await askGeminiAssistant(message, datasetContext);

    return NextResponse.json({ reply: answer });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
