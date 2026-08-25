import React from 'react';
import { db } from '@/lib/db';
import { AgencyUpdateForm } from '@/components/agency/AgencyUpdateForm';
import { Building2, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AgencyPage() {
  const projects = await db.project.findMany({
    include: {
      province: { include: { region: true } },
      contractor: true,
      agencyUpdates: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-10">
      {/* Agency Portal Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono text-cyan-400">
            GOVERNMENT & CONTRACTOR OFFICIAL PORTAL
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Official Progress Claims Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Authorized government project engineers and contractor representatives can post official milestone progress claims for public auditing.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 text-xs font-mono">
          <div className="text-cyan-400 font-bold mb-1">
            Authenticated Agency Access
          </div>
          <div className="text-slate-400">Seeded Hackathon Provisioning</div>
        </div>
      </div>

      {/* Projects Selection List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Assigned Infrastructure Projects</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => {
            const latestUpdate = p.agencyUpdates[0];
            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-cyan-400 font-semibold bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-500/30">
                      {p.province.name}
                    </span>
                    {latestUpdate ? (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded">
                        Latest Claim: {latestUpdate.percentDone}% Complete
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[11px] px-2 py-0.5 rounded">
                        No Claims Filed Yet
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug mb-2">{p.name}</h3>

                  <div className="text-xs text-slate-400 font-mono">
                    Executing Contractor: <strong className="text-slate-200">{p.contractor.name}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                  {/* Inline Agency Update Form */}
                  <AgencyUpdateForm projectId={p.id} />

                  <Link
                    href={`/projects/${p.id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    View Public Project Page
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
