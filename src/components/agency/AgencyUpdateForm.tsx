'use client';

import React, { useState } from 'react';
import { Building2, CheckCircle2, AlertTriangle, Send, Percent } from 'lucide-react';

interface AgencyUpdateFormProps {
  projectId: string;
  onUpdatePosted?: () => void;
}

export const AgencyUpdateForm: React.FC<AgencyUpdateFormProps> = ({
  projectId,
  onUpdatePosted,
}) => {
  const [agencyName, setAgencyName] = useState('DPWH Engineering District');
  const [percentDone, setPercentDone] = useState(50);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setErrorMsg('Please enter progress note details.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/agency-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          agencyName,
          percentDone,
          note,
          photoUrl: photoUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post agency progress update');
      }

      setSuccessMsg('Official Agency Progress Update posted successfully!');
      setNote('');
      setPhotoUrl('');
      if (onUpdatePosted) onUpdatePosted();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
        <Building2 className="w-4 h-4" />
        Official Agency & Contractor Portal
      </div>
      <h3 className="text-lg font-bold text-white mb-2">
        Post Official Progress Update Claim
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        Submit timestamped official completion claims to display side-by-side with citizen ground observations.
      </p>

      {errorMsg && (
        <div className="mb-4 bg-rose-500/10 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Executing Agency / Department *
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Claimed Completion Percentage *</span>
              <span className="text-cyan-400 font-bold">{percentDone}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={percentDone}
              onChange={(e) => setPercentDone(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">
            Official Progress Note & Status Details *
          </label>
          <textarea
            rows={3}
            placeholder="Official milestone notes, delivered equipment, or completed structural phases..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">
            Photo Document Link (Optional)
          </label>
          <input
            type="url"
            placeholder="https://... photo link"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Posting Update...' : 'Publish Official Agency Progress Update'}
        </button>
      </form>
    </div>
  );
};
