'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle, ArrowRight, Activity, Clock, FileWarning, Globe, Layers, Navigation } from 'lucide-react';

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

export interface ProjectPin {
  id: string;
  name: string;
  gpsLat: number;
  gpsLng: number;
  budgetPHP: number;
  provinceName: string;
  regionCode: string;
  contractorName: string;
  anomaly: {
    isStalled: boolean;
    isNeverStarted: boolean;
    isOverdue: boolean;
  };
}

interface PHRegionMapProps {
  regions: RegionSummary[];
  projects?: ProjectPin[];
  selectedFilter: 'all' | 'stalled' | 'never_started' | 'overdue' | string;
}

// Island group mappings for Philippine administrative regions
const ISLAND_GROUPS = {
  luzon: ['NCR', 'CAR', 'R01', 'R02', 'R03', 'R04A', 'MIMAROPA', 'R05'],
  visayas: ['R06', 'R07', 'R08'],
  mindanao: ['R09', 'R10', 'R11', 'R12', 'R13', 'BARMM'],
};

// Simplified SVG geographical coordinates for Philippine regional clusters
const MAP_REGIONS = [
  // Luzon
  { code: 'CAR', path: 'M 140 70 L 175 65 L 170 105 L 140 100 Z', color: '#10b981', labelPos: { x: 145, y: 88 } },
  { code: 'R01', path: 'M 115 65 L 138 65 L 138 120 L 115 120 Z', color: '#059669', labelPos: { x: 105, y: 92 } },
  { code: 'R02', path: 'M 176 65 L 215 75 L 205 130 L 172 106 Z', color: '#047857', labelPos: { x: 182, y: 92 } },
  { code: 'R03', path: 'M 125 122 L 195 122 L 190 160 L 125 160 Z', color: '#065f46', labelPos: { x: 135, y: 145 } },
  { code: 'NCR', path: 'M 145 162 L 165 162 L 165 178 L 145 178 Z', color: '#10b981', labelPos: { x: 170, y: 172 } },
  { code: 'R04A', path: 'M 135 180 L 195 180 L 180 210 L 130 200 Z', color: '#047857', labelPos: { x: 142, y: 195 } },
  { code: 'MIMAROPA', path: 'M 70 210 L 125 210 L 105 270 L 60 250 Z', color: '#059669', labelPos: { x: 75, y: 235 } },
  { code: 'R05', path: 'M 198 190 L 255 190 L 235 240 L 185 212 Z', color: '#10b981', labelPos: { x: 205, y: 215 } },
  // Visayas
  { code: 'R06', path: 'M 140 240 L 180 240 L 170 280 L 135 270 Z', color: '#059669', labelPos: { x: 142, y: 260 } },
  { code: 'R07', path: 'M 182 245 L 220 245 L 215 290 L 175 285 Z', color: '#047857', labelPos: { x: 185, y: 270 } },
  { code: 'R08', path: 'M 222 235 L 265 235 L 255 285 L 218 280 Z', color: '#10b981', labelPos: { x: 228, y: 260 } },
  // Mindanao
  { code: 'R09', path: 'M 90 310 L 140 300 L 125 345 L 75 330 Z', color: '#059669', labelPos: { x: 88, y: 325 } },
  { code: 'R10', path: 'M 142 300 L 195 300 L 190 335 L 140 335 Z', color: '#10b981', labelPos: { x: 148, y: 320 } },
  { code: 'R13', path: 'M 198 295 L 250 295 L 245 340 L 192 338 Z', color: '#047857', labelPos: { x: 202, y: 318 } },
  { code: 'BARMM', path: 'M 115 348 L 158 348 L 150 388 L 110 380 Z', color: '#065f46', labelPos: { x: 118, y: 368 } },
  { code: 'R12', path: 'M 160 340 L 205 340 L 198 385 L 152 385 Z', color: '#059669', labelPos: { x: 162, y: 365 } },
  { code: 'R11', path: 'M 208 342 L 255 342 L 248 405 L 200 400 Z', color: '#10b981', labelPos: { x: 212, y: 375 } },
];

export const PHRegionMap: React.FC<PHRegionMapProps> = ({
  regions,
  projects = [],
  selectedFilter,
}) => {
  const router = useRouter();
  const [hoveredRegion, setHoveredRegion] = useState<RegionSummary | null>(null);
  const [hoveredPin, setHoveredPin] = useState<ProjectPin | null>(null);
  const [viewMode, setViewMode] = useState<'regional' | 'gps'>('regional');
  const [islandGroupFilter, setIslandGroupFilter] = useState<'all' | 'luzon' | 'visayas' | 'mindanao'>('all');
  const [zoomScale, setZoomScale] = useState<number>(1);

  const handleFilterClick = (filter: string) => {
    router.push(`/?filter=${filter}#directory`, { scroll: false });
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(3, prev + 0.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(1, prev - 0.5));
  const handleResetZoom = () => setZoomScale(1);

  const filteredRegions = regions.filter((reg) => {
    if (islandGroupFilter === 'all') return true;
    return ISLAND_GROUPS[islandGroupFilter].includes(reg.code);
  });

  // Convert GPS lat/lng into static, memoized SVG coordinates
  // Use useMemo so coordinates and offsets are calculated ONLY ONCE to eliminate lag
  const projectPinsNormalized = useMemo(() => {
    const rawPins = projects.map((p) => {
      const minLat = 5.0, maxLat = 19.5;
      const minLng = 117.0, maxLng = 126.5;

      const baseX = ((p.gpsLng - minLng) / (maxLng - minLng)) * 260 + 30;
      const baseY = ((maxLat - p.gpsLat) / (maxLat - minLat)) * 360 + 40;

      return { ...p, baseX, baseY };
    });

    // Resolve pin collisions with radial offset dispersion
    return rawPins.map((p, i, arr) => {
      let offsetX = 0;
      let offsetY = 0;
      let overlapIndex = 0;

      arr.forEach((other, j) => {
        if (i > j) {
          const dx = p.baseX - other.baseX;
          const dy = p.baseY - other.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 12) {
            overlapIndex++;
            const angle = overlapIndex * 2.3;
            const radius = 13 * Math.ceil(overlapIndex / 4);
            offsetX += Math.cos(angle) * radius;
            offsetY += Math.sin(angle) * radius;
          }
        }
      });

      const finalX = Math.max(20, Math.min(300, p.baseX + offsetX));
      const finalY = Math.max(20, Math.min(420, p.baseY + offsetY));

      return { ...p, svgX: finalX, svgY: finalY };
    });
  }, [projects]);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header & Anomaly Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">
            Interactive Philippines Infrastructure Map
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Monitoring infrastructure investments and anomaly flags across all 17 administrative regions.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dual View Mode Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('regional')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'regional'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Regional Heatmap
            </button>
            <button
              onClick={() => setViewMode('gps')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'gps'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              GPS Pins Map ({projects.length})
            </button>
          </div>
        </div>
      </div>

      {/* Island Group Filter Bar & Map Zoom Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" /> Filter by Island Group:
          </span>
          <div className="flex items-center gap-2">
            {(['all', 'luzon', 'visayas', 'mindanao'] as const).map((group) => (
              <button
                key={group}
                onClick={() => {
                  setIslandGroupFilter(group);
                  if (group === 'luzon') setZoomScale(1.4);
                  else if (group === 'visayas') setZoomScale(1.8);
                  else if (group === 'mindanao') setZoomScale(1.6);
                  else setZoomScale(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  islandGroupFilter === group
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {group === 'all' ? 'All Regions (17)' : group}
              </button>
            ))}
          </div>
        </div>

        {/* Map Zoom Controls Panel */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Zoom: {zoomScale.toFixed(1)}x</span>
          <button
            onClick={handleZoomIn}
            disabled={zoomScale >= 3}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold disabled:opacity-40"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomScale <= 1}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold disabled:opacity-40"
            title="Zoom Out"
          >
            -
          </button>
          {zoomScale > 1 && (
            <button
              onClick={handleResetZoom}
              className="px-2 py-0.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded text-[10px] font-semibold"
              title="Reset Zoom to Default"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive SVG Geographic Map */}
        <div className="lg:col-span-6 relative flex justify-center items-center bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 min-h-[430px] overflow-hidden">
          <div
            className="w-full max-w-[320px] transition-transform duration-300 ease-out origin-center"
            style={{ transform: `scale(${zoomScale})` }}
          >
            <svg
              viewBox="0 0 320 440"
              className="w-full h-auto drop-shadow-2xl"
            >
              {/* National Outline Silhouette */}
              <path
                d="M 100 50 L 225 60 L 260 210 L 270 290 L 260 410 L 100 400 L 50 260 Z"
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth="2"
                opacity="0.4"
              />

              {/* Regional Mode: Polygon Region Choropleth */}
              {viewMode === 'regional' &&
                MAP_REGIONS.map((mr) => {
                  const regData = regions.find((r) => r.code === mr.code);
                  const isHovered = hoveredRegion?.code === mr.code;
                  const hasAnomaly = regData && (regData.stalledCount > 0 || regData.neverStartedCount > 0 || regData.overdueCount > 0);
                  const isVisibleInIslandGroup = islandGroupFilter === 'all' || ISLAND_GROUPS[islandGroupFilter].includes(mr.code);

                  if (!isVisibleInIslandGroup) return null;

                  return (
                    <g
                      key={mr.code}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => router.push(`/regions/${encodeURIComponent(mr.code)}`)}
                      onMouseEnter={() => regData && setHoveredRegion(regData)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    >
                      <path
                        d={mr.path}
                        fill={isHovered ? '#10b981' : hasAnomaly ? '#f59e0b' : mr.color}
                        stroke="#020617"
                        strokeWidth={isHovered ? '2.5' : '1'}
                        opacity={isHovered ? 1 : 0.85}
                        className="transition-all duration-300 filter drop-shadow-md hover:brightness-125"
                      />
                      <text
                        x={mr.labelPos.x}
                        y={mr.labelPos.y}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        className="pointer-events-none select-none drop-shadow-md"
                      >
                        {mr.code}
                      </text>
                    </g>
                  );
                })}

              {/* GPS Mode: Exact GPS Lat/Lng Pinpoint Markers */}
              {viewMode === 'gps' && (
                <>
                  {/* Subtle base island outlines */}
                  {MAP_REGIONS.map((mr) => (
                    <path key={mr.code} d={mr.path} fill="#1e293b" stroke="#334155" strokeWidth="0.8" opacity="0.5" />
                  ))}

                  {projectPinsNormalized.map((p) => {
                    const isStalled = p.anomaly.isStalled;
                    const isNeverStarted = p.anomaly.isNeverStarted;
                    const isOverdue = p.anomaly.isOverdue;

                    const pinColor = isNeverStarted
                      ? '#f43f5e'
                      : isStalled
                      ? '#f59e0b'
                      : isOverdue
                      ? '#a855f7'
                      : '#10b981';

                    return (
                      <g
                        key={p.id}
                        className="cursor-pointer group"
                        onClick={() => router.push(`/projects/${p.id}`)}
                        onMouseEnter={() => setHoveredPin(p)}
                        onMouseLeave={() => setHoveredPin(null)}
                      >
                        {/* Static Subtle Outer Ring for Flagged Projects (no lagging animation) */}
                        {(isStalled || isNeverStarted) && (
                          <circle cx={p.svgX} cy={p.svgY} r="8.5" fill="none" stroke={pinColor} strokeWidth="1.2" opacity="0.6" />
                        )}

                        {/* Pin Circle */}
                        <circle
                          cx={p.svgX}
                          cy={p.svgY}
                          r={zoomScale > 1.5 ? '4' : '5.5'}
                          fill={pinColor}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-transform group-hover:scale-150"
                        />
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>

          {/* Hover Tooltip for Regional View */}
          {viewMode === 'regional' && hoveredRegion && (
            <div className="absolute top-4 right-4 bg-slate-950/95 border border-emerald-500/60 text-white p-4 rounded-xl shadow-2xl text-xs backdrop-blur-xl max-w-[240px] z-50">
              <div className="font-extrabold text-emerald-400 text-sm">{hoveredRegion.name}</div>
              <div className="mt-2 space-y-1 text-slate-200 font-medium">
                <div className="flex justify-between">
                  <span>Projects:</span>
                  <span className="font-bold text-white">{hoveredRegion.totalProjects}</span>
                </div>
                {hoveredRegion.stalledCount > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Stalled:</span>
                    <span className="font-bold">{hoveredRegion.stalledCount}</span>
                  </div>
                )}
                {hoveredRegion.neverStartedCount > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>Never Started:</span>
                    <span className="font-bold">{hoveredRegion.neverStartedCount}</span>
                  </div>
                )}
                {hoveredRegion.overdueCount > 0 && (
                  <div className="flex justify-between text-purple-400 font-semibold">
                    <span>Overdue:</span>
                    <span className="font-bold">{hoveredRegion.overdueCount}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-300 pt-1.5 border-t border-slate-800 font-bold">
                  <span>Total Budget:</span>
                  <span>₱{(hoveredRegion.totalBudget / 1000000).toFixed(0)}M PHP</span>
                </div>
              </div>
            </div>
          )}

          {/* Hover Tooltip for GPS Pin Mode */}
          {viewMode === 'gps' && hoveredPin && (
            <div className="absolute top-4 right-4 bg-slate-950 border-2 border-cyan-500/80 text-white p-4 rounded-xl shadow-2xl text-xs backdrop-blur-xl max-w-[260px] z-50">
              <div className="font-bold text-cyan-300 text-xs leading-snug line-clamp-2">{hoveredPin.name}</div>
              <div className="mt-2.5 space-y-1.5 text-slate-200">
                <div className="text-xs font-semibold text-slate-300">{hoveredPin.provinceName}, {hoveredPin.regionCode}</div>
                <div className="text-[11px] font-mono text-slate-400">{hoveredPin.contractorName}</div>
                <div className="font-extrabold text-emerald-400 text-sm pt-1 border-t border-slate-800">
                  ₱{(hoveredPin.budgetPHP / 1000000).toFixed(1)}M PHP
                </div>
                {hoveredPin.anomaly.isStalled && <div className="text-amber-400 font-extrabold">STALLED FLAG</div>}
                {hoveredPin.anomaly.isNeverStarted && <div className="text-rose-400 font-extrabold">NEVER STARTED FLAG</div>}
                {hoveredPin.anomaly.isOverdue && <div className="text-purple-400 font-extrabold">OVERDUE DEADLINE</div>}
              </div>
            </div>
          )}
        </div>

        {/* Region Audit Directory List */}
        <div className="lg:col-span-6 space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
          {filteredRegions.map((reg) => {
            const hasAnomaly = reg.stalledCount > 0 || reg.neverStartedCount > 0 || reg.overdueCount > 0;
            return (
              <Link
                key={reg.id}
                href={`/regions/${encodeURIComponent(reg.code)}`}
                className="group block p-3.5 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 hover:border-emerald-500/50 rounded-xl transition-all duration-200 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      {reg.name}
                      <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
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
                    {hasAnomaly && (
                      <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-md text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        {reg.stalledCount + reg.neverStartedCount + reg.overdueCount} Flagged
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
