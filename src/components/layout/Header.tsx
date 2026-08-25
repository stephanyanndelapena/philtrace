'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Map, ShieldAlert, Building2, Eye, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-lg text-white tracking-wider flex items-center gap-1">
              PHIL<span className="text-emerald-400">TRACE</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
              PH Infrastructure AI Transparency
            </div>
          </div>
        </Link>

        {/* Global Search Bar Shortcut */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search project name, contractor, province, or anomaly..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 focus:outline-none transition-colors"
            />
          </div>
        </form>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Interactive Map</span>
          </Link>

          <Link
            href="/contractors"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Contractor X-Ray</span>
          </Link>

          <Link
            href="/agency"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Agency Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
