import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { computeProjectAnomalies } from '@/lib/anomaly';
import { PHRegionMap, RegionSummary } from '@/components/map/PHRegionMap';
import { Building2, AlertTriangle, ShieldAlert, ArrowRight, Activity, Clock, FileWarning, Search } from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering

interface PageProps {
  searchParams: Promise<{ search?: string; filter?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { search, filter } = await searchParams;
  const activeFilter = filter || 'all';

  // Fetch all regions with their provinces and projects
  const regionsRaw = await db.region.findMany({
    include: {
      provinces: {
        include: {
          projects: {
            include: {
              comments: { select: { id: true } },
              agencyUpdates: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  // Calculate computed anomaly metrics per region
  const regionSummaries: RegionSummary[] = regionsRaw.map((reg) => {
    let totalProjects = 0;
    let totalBudget = 0;
    let stalledCount = 0;
    let neverStartedCount = 0;
    let overdueCount = 0;

    reg.provinces.forEach((prov) => {
      prov.projects.forEach((proj) => {
        totalProjects++;
        totalBudget += proj.budgetPHP;

        const anomaly = computeProjectAnomalies({
          status: proj.status,
          startDate: proj.startDate,
          completionDate: proj.completionDate,
          lastActivityAt: proj.lastActivityAt,
          commentsCount: proj.comments.length,
          agencyUpdatesCount: proj.agencyUpdates.length,
        });

        if (anomaly.isStalled) stalledCount++;
        if (anomaly.isNeverStarted) neverStartedCount++;
        if (anomaly.isOverdue) overdueCount++;
      });
    });

    return {
      id: reg.id,
      name: reg.name,
      code: reg.code,
      totalProjects,
      stalledCount,
      neverStartedCount,
      overdueCount,
      totalBudget,
    };
  });

  // Fetch all projects for global listing & search filtering
  const allProjectsRaw = await db.project.findMany({
    include: {
      province: { include: { region: true } },
      contractor: true,
      comments: { select: { id: true } },
      agencyUpdates: { select: { id: true } },
    },
    orderBy: { startDate: 'desc' },
  });

  const projectsWithAnomalies = allProjectsRaw.map((p) => {
    const anomaly = computeProjectAnomalies({
      status: p.status,
      startDate: p.startDate,
      completionDate: p.completionDate,
      lastActivityAt: p.lastActivityAt,
      commentsCount: p.comments.length,
      agencyUpdatesCount: p.agencyUpdates.length,
    });
    return { ...p, anomaly };
  });

  // Apply search query & anomaly status filter
  let filteredProjects = projectsWithAnomalies;
  if (activeFilter === 'stalled') {
    filteredProjects = filteredProjects.filter((p) => p.anomaly.isStalled);
  } else if (activeFilter === 'never_started') {
    filteredProjects = filteredProjects.filter((p) => p.anomaly.isNeverStarted);
  } else if (activeFilter === 'overdue') {
    filteredProjects = filteredProjects.filter((p) => p.anomaly.isOverdue);
  }

  if (search) {
    const q = search.toLowerCase();
    filteredProjects = filteredProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.province.name.toLowerCase().includes(q) ||
        p.province.region.name.toLowerCase().includes(q) ||
        p.contractor.name.toLowerCase().includes(q)
    );
  }

  // Global metric tallies
  const totalBudgetSum = allProjectsRaw.reduce((acc, curr) => acc + curr.budgetPHP, 0);
  const totalStalled = projectsWithAnomalies.filter((p) => p.anomaly.isStalled).length;
  const totalNeverStarted = projectsWithAnomalies.filter((p) => p.anomaly.isNeverStarted).length;
  const totalShellContractors = await db.contractor.count({ where: { isShellFlag: true } });

  return (
    <div className="space-y-10">
      {/* Hero Header & Metrics Bar */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-8 rounded-3xl overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Live Infrastructure Auditor
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            AI-Powered Transparency Platform for Philippine Public Infrastructure
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Investigate public infrastructure spending across Philippine regions. Detect ghost projects, compare satellite before/after site captures, and cross-reference official agency claims against phone-verified whistleblower reports.
          </p>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1 font-semibold">Monitored Projects</div>
            <div className="text-2xl font-extrabold text-white">{allProjectsRaw.length}</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              ₱{(totalBudgetSum / 1000000).toFixed(0)}M Total Budget
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-amber-500/30">
            <div className="text-xs text-amber-400 mb-1 font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              Stalled Projects
            </div>
            <div className="text-2xl font-extrabold text-amber-400">{totalStalled}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">No activity &gt;6 months</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-rose-500/30">
            <div className="text-xs text-rose-400 mb-1 font-semibold flex items-center gap-1">
              <FileWarning className="w-3.5 h-3.5" />
              Never Started
            </div>
            <div className="text-2xl font-extrabold text-rose-400">{totalNeverStarted}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">0 ground mobilization</div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-purple-500/30">
            <div className="text-xs text-purple-400 mb-1 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Shell Companies
            </div>
            <div className="text-2xl font-extrabold text-purple-400">{totalShellContractors}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Shared address/phone</div>
          </div>
        </div>
      </div>

      {/* Format Project Pins for Map Pinpoint View */}
      {(() => {
        const projectPins = projectsWithAnomalies.map((p) => ({
          id: p.id,
          name: p.name,
          gpsLat: p.gpsLat,
          gpsLng: p.gpsLng,
          budgetPHP: p.budgetPHP,
          provinceName: p.province.name,
          regionCode: p.province.region.code,
          contractorName: p.contractor.name,
          anomaly: p.anomaly,
        }));

        return (
          <PHRegionMap
            regions={regionSummaries}
            projects={projectPins}
            selectedFilter={activeFilter}
          />
        );
      })()}

      {/* Global Project Explorer Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Project Investigation Directory</h2>
            <p className="text-xs text-slate-400">
              Select a project card to view AI briefings, satellite time-travel visualizer, and whistleblower thread.
            </p>
          </div>
          {search && (
            <Link href="/" className="text-xs text-emerald-400 hover:underline">
              Clear Search Filter ({filteredProjects.length} results)
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all duration-200 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Anomaly Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {p.anomaly.isStalled && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      STALLED
                    </span>
                  )}
                  {p.anomaly.isNeverStarted && (
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <FileWarning className="w-3 h-3" />
                      NEVER STARTED
                    </span>
                  )}
                  {p.anomaly.isOverdue && (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      OVERDUE
                    </span>
                  )}
                  {!p.anomaly.flags.length && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                      ON TRACK
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors leading-snug">
                  {p.name}
                </h3>

                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div className="text-slate-300 font-semibold">
                    📍 {p.province.name}, {p.province.region.name}
                  </div>
                  <div>🏢 {p.contractor.name}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="font-bold text-emerald-400">
                  ₱{(p.budgetPHP / 1000000).toFixed(1)}M PHP
                </div>
                <div className="text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 font-semibold">
                  Inspect Project
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
