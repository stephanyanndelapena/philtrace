import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { computeProjectAnomalies } from '@/lib/anomaly';
import { MapPin, ArrowLeft, ArrowRight, Activity, Clock, FileWarning, Building2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface RegionPageProps {
  params: Promise<{ region: string }>;
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region: regionCode } = await params;
  const decodedCode = decodeURIComponent(regionCode);

  const region = await db.region.findFirst({
    where: {
      OR: [{ code: decodedCode }, { name: { contains: decodedCode } }],
    },
    include: {
      provinces: {
        include: {
          projects: {
            include: {
              contractor: true,
              comments: { select: { id: true } },
              agencyUpdates: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!region) {
    notFound();
  }

  // Aggregate projects across all provinces in this region
  const allRegionProjects: any[] = [];
  region.provinces.forEach((prov) => {
    prov.projects.forEach((proj) => {
      const anomaly = computeProjectAnomalies({
        status: proj.status,
        startDate: proj.startDate,
        completionDate: proj.completionDate,
        lastActivityAt: proj.lastActivityAt,
        commentsCount: proj.comments.length,
        agencyUpdatesCount: proj.agencyUpdates.length,
      });
      allRegionProjects.push({ ...proj, provinceName: prov.name, anomaly });
    });
  });

  const totalBudget = allRegionProjects.reduce((acc, curr) => acc + curr.budgetPHP, 0);

  return (
    <div className="space-y-8">
      {/* Header Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to National Philippines Map
        </Link>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <MapPin className="w-4 h-4" />
              REGION AUDIT DIRECTORY
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {region.name} ({region.code})
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Monitoring {allRegionProjects.length} active infrastructure projects across {region.provinces.length} provinces/cities.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-right">
            <div className="text-xs text-slate-400 font-mono">Allocated Regional Budget</div>
            <div className="text-xl font-extrabold text-emerald-400">
              ₱{(totalBudget / 1000000).toFixed(0)}M PHP
            </div>
          </div>
        </div>
      </div>

      {/* Provinces & Projects Grid */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white">Projects by Province / City</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRegionProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                    📍 {p.provinceName}
                  </span>

                  {p.anomaly.isStalled && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                      STALLED
                    </span>
                  )}
                  {p.anomaly.isNeverStarted && (
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                      NEVER STARTED
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors leading-snug">
                  {p.name}
                </h3>

                <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  {p.contractor.name}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="font-bold text-emerald-400">
                  ₱{(p.budgetPHP / 1000000).toFixed(1)}M PHP
                </div>
                <div className="text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 font-semibold">
                  Inspect
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
