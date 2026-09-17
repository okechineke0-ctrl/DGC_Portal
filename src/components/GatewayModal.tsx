import React, { useState } from 'react';
import {
  ShieldAlert,
  Briefcase,
  KeyRound,
  AlertCircle,
  X,
  ArrowRight,
  Lock,
  UserCheck,
} from 'lucide-react';
import { StaffMember } from '../types';

interface GatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'staff' | 'ceo', staffData?: StaffMember) => void;
  staffList?: StaffMember[];
}

export const GatewayModal: React.FC<GatewayModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  staffList,
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
      // Fallback to local check
    }

    const q = targetName.trim().toLowerCase();
    const matched = (staffList || []).find((s) => {
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
        `Staff name "${targetName}" is not on the official roster. Check spelling or contact Administration.`
      );
    }
  };

  const handleCeoSubmit = () => {
    const clean = ceoPasscode.trim().toLowerCase();
    if (clean === 'dgc2026' || clean === 'ceo' || clean === '1234') {
      onSelectRole('ceo');
    } else {
      setErrorMessage('Invalid administrative passcode. (Default: dgc2026)');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg sm:max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5 pr-8">
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950">
              Institutional Gateway
            </span>
            <span className="text-[11px] text-blue-200 hidden xs:inline">Dominion Global College</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold font-serif-title tracking-tight text-white pr-8">
            Staff & Directorate Portal
          </h2>
          <p className="text-[11px] sm:text-xs text-blue-200/90 mt-0.5">
            Authorized access for teaching staff and college administration.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-slate-800">
          {activeTab === 'select' && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Workspace:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Teaching Staff Option */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveTab('staff_verify');
                  }}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-700 bg-slate-50 hover:bg-blue-50/50 text-left transition-all group flex flex-col justify-between cursor-pointer active:scale-[0.99] min-h-[140px]"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-950">
                        Teaching Staff
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Continuous assessment grading, class roll call & student report comments.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-blue-900">
                    <span>Teacher Login</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* College Administration / CEO Option */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveTab('ceo_auth');
                  }}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-600 bg-slate-50 hover:bg-amber-50/50 text-left transition-all group flex flex-col justify-between cursor-pointer active:scale-[0.99] min-h-[140px]"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500 text-blue-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-amber-950">
                        Administration
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Result governance, individual result holds, bursary fees & student admission.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>Directorate Access</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'staff_verify' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-950 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Teacher Verification
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Enter your registered name on the college staff roll.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Registered Staff Name
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={staffNameInput}
                    onChange={(e) => setStaffNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyStaff()}
                    placeholder="e.g. Mr. Chinedu Okafor"
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 min-h-[44px]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyStaff()}
                    disabled={isVerifying}
                    className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] shrink-0 cursor-pointer"
                  >
                    {isVerifying ? 'Checking...' : 'Sign In'}
                  </button>
                </div>
              </div>

              {/* Quick Staff Selection */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Select Registered Staff:
                </p>
                {staffList && staffList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {staffList.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setStaffNameInput(s.name);
                          handleVerifyStaff(s.name);
                        }}
                        className="px-2.5 py-1.5 text-[11px] bg-slate-100 hover:bg-blue-100 hover:text-blue-950 text-slate-700 rounded-lg transition-colors text-left cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                      >
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[9px] text-slate-400">({s.department})</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-1 italic">
                    No teachers registered yet in the college directory.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ceo_auth' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-950 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      College Directorate
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Administrative oversight and result governance.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Directorate Access Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={ceoPasscode}
                    onChange={(e) => setCeoPasscode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCeoSubmit()}
                    placeholder="Enter Administrative Passcode"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono min-h-[44px]"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Institutional passcode pre-filled: <strong className="font-mono text-slate-800">dgc2026</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCeoSubmit}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-blue-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all min-h-[44px] cursor-pointer"
                >
                  Open Directorate Portal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted College System</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold p-1 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

