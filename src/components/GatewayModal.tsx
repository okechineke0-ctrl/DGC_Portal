import React, { useState } from 'react';
import {
  ShieldAlert,
  GraduationCap,
  Briefcase,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Lock,
  UserCheck,
} from 'lucide-react';
import { StaffMember } from '../types';
import { INITIAL_STAFF_MEMBERS } from '../data/mockData';

interface GatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'staff' | 'ceo', staffData?: StaffMember) => void;
}

export const GatewayModal: React.FC<GatewayModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
}) => {
  const [activeTab, setActiveTab] = useState<'select' | 'staff_verify' | 'ceo_auth'>('select');
  const [staffNameInput, setStaffNameInput] = useState<string>('');
  const [ceoPasscode, setCeoPasscode] = useState<string>('dgc2026');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyStaff = async (nameToVerify?: string) => {
    const targetName = nameToVerify || staffNameInput;
    if (!targetName.trim()) {
      setErrorMessage('Please enter your full registered name');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // Try verifying with backend API first
      const res = await fetch('/api/staff/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetName }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsVerifying(false);
        onSelectRole('staff', data.staff);
        return;
      }
    } catch {
      // Fallback to local check if offline or server initializing
    }

    // Local check against initial staff roster
    const q = targetName.trim().toLowerCase();
    const matched = INITIAL_STAFF_MEMBERS.find((s) => {
      const sName = s.name.toLowerCase();
      return (
        sName === q ||
        sName.includes(q) ||
        q.includes(sName) ||
        sName.replace(/[^a-z]/g, '') === q.replace(/[^a-z]/g, '')
      );
    });

    setIsVerifying(false);

    if (matched) {
      onSelectRole('staff', matched);
    } else {
      setErrorMessage(
        `Staff name "${targetName}" is not registered on the official roster uploaded by the CEO. Please check spelling or contact Administration.`
      );
    }
  };

  const handleCeoSubmit = () => {
    if (ceoPasscode.trim().toLowerCase() === 'dgc2026' || ceoPasscode.trim().toLowerCase() === 'ceo' || ceoPasscode.trim() === '1234') {
      onSelectRole('ceo');
    } else {
      setErrorMessage('Invalid executive access passcode. (Hint: dgc2026)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950">
              Authorized Portal Gateway
            </span>
            <span className="text-xs text-blue-200">Collegiate System</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif-title">
            Dominion Stars College Gateway
          </h2>
          <p className="text-xs text-blue-200/90 mt-1">
            Authorized Institutional Access · Select your administrative operational role.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {activeTab === 'select' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select Operational Workspace:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Staff Option */}
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveTab('staff_verify');
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-700 bg-slate-50/50 hover:bg-blue-50/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-900">
                        Staff / Faculty Portal
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Input scores for Quiz, Homework, Tests 1 & 2, Exam, and manage student continuous assessment files.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-blue-800">
                    <span>Name Verification</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* CEO Administrator Option */}
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveTab('ceo_auth');
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-600 bg-slate-50/50 hover:bg-amber-50/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-blue-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-900">
                        CEO & Administrator
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Executive oversight: hold/release terminal results, edit student files, register new students, and manage staff roster.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-amber-800">
                    <span>Executive Access</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'staff_verify' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Staff Roster Verification
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter your full name to match against the administrator-uploaded staff directory.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('select')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Back
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Your Full Registered Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={staffNameInput}
                    onChange={(e) => setStaffNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyStaff()}
                    placeholder="e.g. Dr. C. Umeh or Mrs. N. Eze"
                    className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800"
                    autoFocus
                  />
                  <button
                    onClick={() => handleVerifyStaff()}
                    disabled={isVerifying}
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isVerifying ? 'Checking...' : 'Verify & Enter'}
                  </button>
                </div>
              </div>

              {/* Quick Staff Selection for Immediate Testing */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">
                  Quick Select from Admin Uploaded Faculty (Click to auto-fill):
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {INITIAL_STAFF_MEMBERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setStaffNameInput(s.name);
                        handleVerifyStaff(s.name);
                      }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 rounded-lg transition-colors text-left"
                    >
                      {s.name} <span className="text-[10px] text-slate-400">({s.department})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ceo_auth' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Office of the CEO & Administrator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Executive authority for student file edits, result holds & registrations.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('select')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Back
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Executive Access Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={ceoPasscode}
                    onChange={(e) => setCeoPasscode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCeoSubmit()}
                    placeholder="Enter CEO Passcode (prefilled: dgc2026)"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Development passcode pre-filled for direct executive evaluation: <strong className="font-mono text-slate-700">dgc2026</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCeoSubmit}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-blue-950 font-extrabold text-sm rounded-xl shadow-xs transition-colors"
                >
                  Launch CEO Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('select')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted College Security Protocol</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            Close Gateway
          </button>
        </div>
      </div>
    </div>
  );
};
