'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle, ArrowRight, Activity, Clock, FileWarning } from 'lucide-react';

export interface RegionSummary {
  id: string;
  name: string;
  code: string;
  totalProjects: number;
  stalledCount: number;
  neverStartedCount: number;
  overdueCount: number;
  totalBudget: number;
}

interface PHRegionMapProps {
  regions: RegionSummary[];
  selectedFilter: 'all' | 'stalled' | 'never_started' | 'overdue' | string;
}

export const PHRegionMap: React.FC<PHRegionMapProps> = ({
  regions,
  selectedFilter,
}) => {
  const router = useRouter();
  const [hoveredRegion, setHoveredRegion] = useState<RegionSummary | null>(null);

  const handleFilterClick = (filter: string) => {
    router.push(`/?filter=${filter}`);
  };

  // Geographic SVG representation of PH major island groups & regions
  const mapRegions = [
    { code: 'NCR', path: 'M 140 180 L 155 180 L 155 195 L 140 195 Z', color: '#10b981', labelPos: { x: 170, y: 188 } },
    { code: 'R03', path: 'M 110 130 L 175 130 L 175 175 L 110 175 Z', color: '#059669', labelPos: { x: 185, y: 152 } },
    { code: 'R07', path: 'M 210 280 L 260 280 L 260 330 L 210 330 Z', color: '#047857', labelPos: { x: 270, y: 305 } },
  ];

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Interactive Philippines Infrastructure Map
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Click any region to inspect localized infrastructure projects and anomaly flags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleFilterClick('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => handleFilterClick('stalled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedFilter === 'stalled'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Stalled Projects
          </button>
          <button
            onClick={() => handleFilterClick('never_started')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedFilter === 'never_started'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
            }`}
          >
            <FileWarning className="w-3.5 h-3.5" />
            Never Started
          </button>
          <button
            onClick={() => handleFilterClick('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedFilter === 'overdue'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800 text-purple-400 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Overdue Deadlines
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive SVG Choropleth Map */}
        <div className="lg:col-span-7 relative flex justify-center items-center bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 min-h-[380px]">
          <svg
            viewBox="0 0 400 450"
            className="w-full max-w-[360px] h-auto drop-shadow-2xl"
          >
            {/* Background Map Styling */}
            <path
              d="M 120 70 L 190 60 L 220 120 L 180 200 L 130 220 L 100 150 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <path
              d="M 190 220 L 300 240 L 320 340 L 200 360 L 170 280 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <path
              d="M 110 330 L 230 350 L 260 430 L 130 440 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Interactive Regions */}
            {mapRegions.map((mr) => {
              const regData = regions.find((r) => r.code === mr.code);
              const isHovered = hoveredRegion?.code === mr.code;
              const hasAnomaly = regData && (regData.stalledCount > 0 || regData.neverStartedCount > 0);

              return (
                <g key={mr.code} className="cursor-pointer">
                  <path
                    d={mr.path}
                    fill={isHovered ? '#10b981' : hasAnomaly ? '#f59e0b' : mr.color}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? '2.5' : '1.5'}
                    className="transition-all duration-300 hover:opacity-90 filter drop-shadow-md"
                    onMouseEnter={() => regData && setHoveredRegion(regData)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  />
                  <text
                    x={mr.labelPos.x}
                    y={mr.labelPos.y}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    className="pointer-events-none select-none drop-shadow-md"
                  >
                    {regData?.code} ({regData?.totalProjects || 0})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredRegion && (
            <div className="absolute top-4 right-4 bg-slate-900 border border-emerald-500/40 text-white p-3 rounded-xl shadow-2xl text-xs backdrop-blur-md max-w-[220px] animate-fadeIn">
              <div className="font-bold text-emerald-400 text-sm">{hoveredRegion.name}</div>
              <div className="mt-2 space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Total Projects:</span>
                  <span className="font-bold text-white">{hoveredRegion.totalProjects}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Stalled:</span>
                  <span className="font-bold">{hoveredRegion.stalledCount}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Never Started:</span>
                  <span className="font-bold">{hoveredRegion.neverStartedCount}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span>Total Budget:</span>
                  <span className="font-bold">₱{(hoveredRegion.totalBudget / 1000000).toFixed(0)}M</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Region Quick Navigation Cards */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Regions Overview
          </h3>
          {regions.map((reg) => (
            <Link
              key={reg.id}
              href={`/regions/${encodeURIComponent(reg.code)}`}
              className="group block p-4 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all duration-200 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                    {reg.name}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                      {reg.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>{reg.totalProjects} Projects</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      ₱{(reg.totalBudget / 1000000).toFixed(0)}M Budget
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(reg.stalledCount > 0 || reg.neverStartedCount > 0) && (
                    <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-md text-[11px] font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      {reg.stalledCount + reg.neverStartedCount} Flagged
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
