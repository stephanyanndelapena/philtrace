import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { computeProjectAnomalies } from '@/lib/anomaly';
import { SatelliteSlider } from '@/components/satellite/SatelliteSlider';
import { WhistleblowerForm } from '@/components/report/WhistleblowerForm';
import { ReportThread } from '@/components/report/ReportThread';
import { AgencyUpdateForm } from '@/components/agency/AgencyUpdateForm';
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  ShieldAlert,
  Activity,
  CheckCircle2,
  FileWarning,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      province: { include: { region: true } },
      contractor: true,
      comments: { orderBy: { createdAt: 'desc' } },
      agencyUpdates: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!project) {
    notFound();
  }

  // Parse structured AI briefing JSON stored at seed-time
  let briefing: any = {};
  try {
    briefing = JSON.parse(project.aiBriefing);
  } catch (err) {
    briefing = { summary: 'Standard procurement record.' };
  }

  // Computed anomaly status flags
  const anomaly = computeProjectAnomalies({
    status: project.status,
    startDate: project.startDate,
    completionDate: project.completionDate,
    lastActivityAt: project.lastActivityAt,
    commentsCount: project.comments.length,
    agencyUpdatesCount: project.agencyUpdates.length,
  });

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href={`/regions/${project.province.region.code}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {project.province.region.name}
        </Link>

        {/* Project Header Banner */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-lg">
                📍 {project.province.name}, {project.province.region.name}
              </span>

              {anomaly.isStalled && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> STALLED FLAG
                </span>
              )}
              {anomaly.isNeverStarted && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                  <FileWarning className="w-3.5 h-3.5" /> NEVER STARTED FLAG
                </span>
              )}
              {anomaly.isOverdue && (
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> OVERDUE DEADLINE
                </span>
              )}
            </div>

            <div className="text-xs font-mono text-slate-400">
              ID: <span className="text-slate-200">{project.id}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {project.name}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-semibold mb-0.5">Approved Budget</div>
              <div className="text-lg font-extrabold text-emerald-400">
                ₱{(project.budgetPHP / 1000000).toFixed(1)}M PHP
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-semibold mb-0.5">Awarded Contractor</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {project.contractor.name}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-semibold mb-0.5">Source Document</div>
              <a
                href={project.sourcePdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                Procurement Notice PDF
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Structured AI Briefing Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Gemini AI Structured Briefing</h2>
            <p className="text-xs text-slate-400 font-mono">
              Extracted directly from source PDF procurement documentation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-emerald-400 uppercase text-[11px] mb-1">WHAT</div>
              <div className="text-slate-200 leading-relaxed font-medium">
                {briefing.what || project.name}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-emerald-400 uppercase text-[11px] mb-1">WHO</div>
              <div className="text-slate-200 leading-relaxed">
                {briefing.who || project.contractor.name}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-emerald-400 uppercase text-[11px] mb-1">WHERE</div>
              <div className="text-slate-200 leading-relaxed">
                {briefing.where || `${project.province.name}, ${project.province.region.name}`}
              </div>
            </div>

            {briefing.sourceAgency && (
              <div className="bg-cyan-950/40 p-4 rounded-xl border border-cyan-500/40">
                <div className="font-bold text-cyan-400 uppercase text-[11px] mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  OFFICIAL GOVERNMENT SOURCE CITATION
                </div>
                <div className="text-cyan-200 leading-relaxed font-medium space-y-1">
                  <div><strong className="text-slate-300">Agency:</strong> {briefing.sourceAgency}</div>
                  {briefing.officialControlNo && <div><strong className="text-slate-300">Control ID:</strong> {briefing.officialControlNo}</div>}
                  {briefing.philGepsBidRef && <div><strong className="text-slate-300">PhilGEPS Ref:</strong> {briefing.philGepsBidRef}</div>}
                </div>
              </div>
            )}

            {briefing.keyRisks && (
              <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/40">
                <div className="font-bold text-rose-400 uppercase text-[11px] mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  KEY RISK SUMMARY
                </div>
                <div className="text-rose-200 leading-relaxed font-medium">
                  {briefing.keyRisks}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Satellite Before/After Time-Travel Visualizer */}
      <SatelliteSlider
        gpsLat={project.gpsLat}
        gpsLng={project.gpsLng}
        startDate={project.startDate.toISOString()}
        projectName={project.name}
      />

      {/* Official Claims vs Citizen Observations Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Progress Audit Comparison</h2>
          <p className="text-xs text-slate-400">
            Compare official progress updates claimed by government agencies against on-ground whistleblower reports submitted by citizens.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Official Agency Updates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Official Agency Claims ({project.agencyUpdates.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Government Updates</span>
            </div>

            {project.agencyUpdates.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                No official agency progress updates filed for this project yet.
              </div>
            ) : (
              project.agencyUpdates.map((u) => (
                <div
                  key={u.id}
                  className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="font-bold text-white text-xs">{u.agencyName}</div>
                    <div className="bg-cyan-500/20 text-cyan-300 font-bold text-xs px-2.5 py-0.5 rounded-full">
                      {u.percentDone}% Complete
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{u.note}</p>

                  <div className="text-[10px] text-slate-500 font-mono pt-2">
                    Timestamped: {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: Whistleblower Reports Thread */}
          <div>
            <ReportThread comments={project.comments as any} />
          </div>
        </div>
      </div>

      {/* Submission Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhistleblowerForm projectId={project.id} />
        <AgencyUpdateForm projectId={project.id} />
      </div>
    </div>
  );
}
