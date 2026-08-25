import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const contractors = await db.contractor.findMany({
      include: {
        projects: {
          select: { id: true, name: true, budgetPHP: true },
        },
      },
    });

    const nodes: Array<{ data: Record<string, unknown> }> = [];
    const edges: Array<{ data: Record<string, unknown> }> = [];

    // Create Contractor Nodes
    contractors.forEach((c) => {
      nodes.push({
        data: {
          id: c.id,
          label: c.name,
          address: c.address,
          phone: c.phone,
          totalEarnings: c.totalEarnings,
          isShellFlag: c.isShellFlag,
          projectsCount: c.projects.length,
          type: 'contractor',
        },
      });
    });

    // Generate edges for contractors sharing exact address or phone number (Collusion Indicators)
    for (let i = 0; i < contractors.length; i++) {
      for (let j = i + 1; j < contractors.length; j++) {
        const c1 = contractors[i];
        const c2 = contractors[j];

        const sameAddress = c1.address.trim().toLowerCase() === c2.address.trim().toLowerCase();
        const samePhone = c1.phone.trim() === c2.phone.trim();

        if (sameAddress || samePhone) {
          const reason = sameAddress && samePhone
            ? 'Shared Address & Phone Number'
            : sameAddress
            ? 'Shared Registered Address'
            : 'Shared Business Phone Number';

          edges.push({
            data: {
              id: `edge-${c1.id}-${c2.id}`,
              source: c1.id,
              target: c2.id,
              label: reason,
              isSharedAddress: sameAddress,
              isSharedPhone: samePhone,
            },
          });
        }
      }
    }

    return NextResponse.json({ elements: { nodes, edges } });
  } catch (error) {
    console.error('Contractor Graph API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractor network graph' },
      { status: 500 }
    );
  }
}
