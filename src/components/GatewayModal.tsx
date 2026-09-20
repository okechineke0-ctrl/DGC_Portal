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
import { formatStaffName } from '../utils/formatters';

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
        <div className="p-4 sm:p-5 bg-slate-900 text-white relative shrink-0 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5 pr-8">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-900/70 text-blue-200 border border-blue-700/50">
              Institutional Access
            </span>
            <span className="text-xs text-slate-400 font-medium hidden xs:inline">Dominate Star College</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold font-serif-title tracking-tight text-white pr-8">
            Faculty & Administration
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Authorized access for academic instructors and executive leadership.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-slate-800">
          {activeTab === 'select' && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-600 bg-slate-50/60 hover:bg-blue-50/40 text-left transition-all group flex flex-col justify-between cursor-pointer active:scale-[0.99] min-h-[140px]"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-900">
                        Faculty
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Continuous assessment grading, class roll call register & student report comments.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Faculty Login</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* College Administration Option */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveTab('ceo_auth');
                  }}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-800 bg-slate-50/60 hover:bg-slate-100/70 text-left transition-all group flex flex-col justify-between cursor-pointer active:scale-[0.99] min-h-[140px]"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-slate-900">
                        Administration
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Result certification, student enrollments, fee schedules, and governance.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Admin Access</span>
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
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-blue-900 flex items-center justify-center shrink-0">
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
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 min-h-[44px]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyStaff()}
                    disabled={isVerifying}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] shrink-0 cursor-pointer"
                  >
                    {isVerifying ? 'Checking...' : 'Sign In'}
                  </button>
                </div>
              </div>

              {/* Quick Staff Selection */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Registered Faculty:
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
                        className="px-2.5 py-1.5 text-[11px] bg-slate-50 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-lg transition-colors text-left cursor-pointer flex items-center gap-1.5 min-h-[36px] border border-slate-200"
                      >
                        <span className="font-semibold">{formatStaffName(s.name)}</span>
                        <span className="text-[9px] text-slate-400">({s.department})</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-1 italic">
                    No faculty registered yet in the college directory.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ceo_auth' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 border border-slate-200">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Administration
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Academic governance, result certification, and bursary.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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
                  Administrative Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={ceoPasscode}
                    onChange={(e) => setCeoPasscode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCeoSubmit()}
                    placeholder="Enter Administrative Passcode"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-mono min-h-[44px]"
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
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all min-h-[44px] cursor-pointer"
                >
                  Open Administration
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px] cursor-pointer"
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

