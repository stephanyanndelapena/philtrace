'use client';

import React from 'react';
import { ShieldCheck, ThumbsUp, Sparkles, AlertOctagon, AlertTriangle, AlertCircle, Info, Image as ImageIcon } from 'lucide-react';

export interface CommentData {
  id: string;
  text: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  rationale: string;
  phoneVerified: boolean;
  corroborationCount: number;
  photoUrl?: string | null;
  createdAt: string;
}

interface ReportThreadProps {
  comments: CommentData[];
  onCorroborate?: (commentId: string) => void;
}

export const ReportThread: React.FC<ReportThreadProps> = ({ comments, onCorroborate }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return (
          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/50 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            CRITICAL SEVERITY
          </span>
        );
      case 'high':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/50 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            HIGH SEVERITY
          </span>
        );
      case 'medium':
        return (
          <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            MEDIUM SEVERITY
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/50 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            LOW SEVERITY
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Citizen Whistleblower Thread ({comments.length})
        </h3>
        <span className="text-xs text-slate-400 font-mono">AI Scored & Phone Verified</span>
      </div>

      {comments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
          No citizen whistleblower reports logged yet for this project.
        </div>
      ) : (
        comments.map((c) => (
          <div
            key={c.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-3 transition-all"
          >
            {/* Severity Badge & Phone Verification */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {getSeverityBadge(c.severity)}
                {c.phoneVerified && (
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Phone Verified OTP
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {new Date(c.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* AI Rationale Box */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-400 font-semibold">Gemini AI Audit Rationale: </strong>
                <span>{c.rationale}</span>
              </div>
            </div>

            {/* Report Text */}
            <p className="text-xs text-white leading-relaxed font-medium">{c.text}</p>

            {/* Optional Photo Attachment */}
            {c.photoUrl && (
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 inline-block">
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1 font-mono">
                  <ImageIcon className="w-3 h-3 text-cyan-400" />
                  Attached Photo Evidence
                </div>
                <img
                  src={c.photoUrl}
                  alt="Whistleblower Evidence"
                  className="max-h-48 rounded-lg object-cover"
                />
              </div>
            )}

            {/* Corroboration Counter Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Corroborated by <strong className="text-white">{c.corroborationCount}</strong> independent citizens
                </span>
              </div>

              <button
                onClick={() => onCorroborate && onCorroborate(c.id)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-500/30 px-3 py-1 rounded-lg transition-all"
              >
                + Corroborate Report
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
