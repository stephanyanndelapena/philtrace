import React from 'react';
import { db } from '@/lib/db';
import { ContractorGraph } from '@/components/graph/ContractorGraph';
import { Building2, ShieldAlert, MapPin, Phone, DollarSign, AlertOctagon } from 'lucide-react';

export const revalidate = 0;

export default async function ContractorsPage() {
  const contractors = await db.contractor.findMany({
    include: {
      projects: {
        select: { id: true, name: true, budgetPHP: true },
      },
    },
    orderBy: { totalEarnings: 'desc' },
  });

  const shellContractorsCount = contractors.filter((c) => c.isShellFlag).length;

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            ANTI-COLLUSION INVESTIGATION MODULE
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Contractor Collusion & Shell Company X-Ray
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Cross-referencing government contractor registries to flag shell companies sharing identical physical business addresses or contact numbers.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-rose-500/30">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Flagged Shell Clusters</div>
            <div className="text-2xl font-extrabold text-rose-400">{shellContractorsCount} Entities</div>
          </div>
        </div>
      </div>

      {/* Interactive Cytoscape Network Graph */}
      <ContractorGraph />

      {/* Contractors Registry Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Registered Contractor Intelligence Table</h2>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Contractor Entity</th>
                  <th className="p-4">Registered Business Address</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Total Government Earnings</th>
                  <th className="p-4">Collusion Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {contractors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {c.name}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {c.address}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400 font-mono text-sm">
                      ₱{(c.totalEarnings / 1000000).toFixed(0)}M PHP
                    </td>
                    <td className="p-4">
                      {c.isShellFlag ? (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/50 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 w-max">
                          <AlertOctagon className="w-3 h-3" />
                          SHARED ADDRESS / SHELL FLAG
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[10px] font-bold w-max block">
                          CLEAN REGISTERED ENTITY
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
