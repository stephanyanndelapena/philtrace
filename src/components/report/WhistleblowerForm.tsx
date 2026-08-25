'use client';

import React, { useState } from 'react';
import { ShieldCheck, Phone, CheckCircle2, AlertTriangle, Image as ImageIcon, Send, Lock } from 'lucide-react';

interface WhistleblowerFormProps {
  projectId: string;
  onReportSubmitted?: () => void;
}

export const WhistleblowerForm: React.FC<WhistleblowerFormProps> = ({
  projectId,
  onReportSubmitted,
}) => {
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMsg('Please enter your whistleblower report observation details.');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid Philippine mobile number (+63 9XX...).');
      return;
    }
    setErrorMsg('');
    setShowOtpModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your phone.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          text,
          otpCode,
          photoUrl: photoUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccessMsg('Report submitted & verified! AI has scored severity and updated trust weight.');
      setText('');
      setPhotoUrl('');
      setPhoneNumber('');
      setOtpCode('');
      setShowOtpModal(false);
      if (onReportSubmitted) onReportSubmitted();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
        <ShieldCheck className="w-4 h-4" />
        Citizen Whistleblower Portal
      </div>
      <h3 className="text-lg font-bold text-white mb-2">
        Submit Verified On-Site Observation Report
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        No account required to browse. Report submissions require SMS phone verification to prevent spam flooding.
      </p>

      {errorMsg && (
        <div className="mb-4 bg-rose-500/10 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleOpenOtp} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">
            Observation Details & Evidence Description *
          </label>
          <textarea
            rows={4}
            placeholder="Describe what you physically observed at the project site (e.g. No workers present, missing machinery, cracks in flood wall)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              PH Mobile Number (For OTP Verification) *
            </label>
            <input
              type="text"
              placeholder="+63 917 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              Photo Evidence Attachment URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://... image link"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Verify Phone & Submit Whistleblower Report
        </button>
      </form>

      {/* SMS OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">SMS Phone OTP Verification</h4>
                <p className="text-xs text-slate-400">Code sent to {phoneNumber}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
              [Hackathon Mode] Enter 6-digit PIN e.g. <strong className="text-emerald-400">123456</strong> or <strong className="text-emerald-400">888888</strong> to verify report.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-3 text-center text-xl tracking-widest font-mono text-emerald-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="w-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
              >
                {loading ? 'Submitting...' : 'Confirm & Score'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
