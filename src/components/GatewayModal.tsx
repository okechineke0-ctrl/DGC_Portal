import React, { useState, useMemo } from 'react';
import {
  X,
  Lock,
  Briefcase,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  KeyRound,
  UserCheck,
  Search,
  Copy,
  Check,
  GraduationCap,
} from 'lucide-react';
import { StaffMember } from '../types';
import { formatStaffName } from '../utils/formatters';

interface GatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'portal' | 'staff' | 'ceo', staff?: StaffMember) => void;
  staffList?: StaffMember[];
}

// Resemblance & Token Matcher for staff names
function calculateStaffResemblance(staffName: string, query: string): { matches: boolean; score: number } {
  if (!query.trim()) return { matches: false, score: 0 };

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/^(mr|mrs|miss|dr|engr|prof|rev|pastor|lady|chief)\.?\s+/i, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const cleanQuery = normalize(query);
  const cleanStaff = normalize(staffName);

  if (!cleanQuery) return { matches: false, score: 0 };

  // Exact or direct inclusion
  if (cleanStaff === cleanQuery) return { matches: true, score: 100 };
  if (cleanStaff.includes(cleanQuery)) return { matches: true, score: 90 };
  if (cleanQuery.includes(cleanStaff)) return { matches: true, score: 85 };

  const qTokens = cleanQuery.split(' ').filter(Boolean);
  const staffTokens = cleanStaff.split(' ').filter(Boolean);

  if (qTokens.length === 0 || staffTokens.length === 0) return { matches: false, score: 0 };

  const tokenMatches = (qTok: string, sTok: string): boolean => {
    if (qTok === sTok) return true;
    if (sTok.startsWith(qTok) || qTok.startsWith(sTok)) return true;
    if (sTok.includes(qTok) || qTok.includes(sTok)) return true;

    // Fuzzy check for minor typos
    if (qTok.length >= 4 && sTok.length >= 4) {
      const minLen = Math.min(qTok.length, sTok.length);
      const maxLen = Math.max(qTok.length, sTok.length);
      if (maxLen - minLen > 2) return false;

      let diff = 0;
      let i = 0;
      let j = 0;
      while (i < qTok.length && j < sTok.length) {
        if (qTok[i] === sTok[j]) {
          i++;
          j++;
        } else {
          diff++;
          if (qTok.length > sTok.length) i++;
          else if (sTok.length > qTok.length) j++;
          else {
            i++;
            j++;
          }
        }
      }
      diff += qTok.length - i + (sTok.length - j);
      if (diff <= 2) return true;
    }
    return false;
  };

  let matched = 0;
  for (const q of qTokens) {
    if (staffTokens.some((s) => tokenMatches(q, s))) {
      matched++;
    }
  }

  const ratio = matched / qTokens.length;
  if (ratio >= 0.5 || (qTokens.length === 1 && matched === 1)) {
    return { matches: true, score: Math.round(ratio * 80) };
  }

  return { matches: false, score: 0 };
}

export const GatewayModal: React.FC<GatewayModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  staffList = [],
}) => {
  const [activeTab, setActiveTab] = useState<'select' | 'staff_verify' | 'ceo_auth'>('select');
  const [staffNameInput, setStaffNameInput] = useState<string>('');
  const [ceoPasscode, setCeoPasscode] = useState<string>('dgc2026');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);

  // Resembling staff list computed strictly when the user has typed a name
  const resemblingStaff = useMemo(() => {
    const trimmed = staffNameInput.trim();
    if (!trimmed) return [];

    const scored = staffList
      .map((s) => {
        const res = calculateStaffResemblance(s.name, trimmed);
        return { staff: s, ...res };
      })
      .filter((item) => item.matches)
      .sort((a, b) => b.score - a.score);

    return scored.map((item) => item.staff);
  }, [staffNameInput, staffList]);

  if (!isOpen) return null;

  const handleCopyStaffName = (name: string, staffId: string) => {
    navigator.clipboard.writeText(name);
    setCopiedStaffId(staffId);
    setStaffNameInput(name);
    setTimeout(() => {
      setCopiedStaffId(null);
    }, 2500);
  };

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
        if (data.matched && data.staff) {
          setIsVerifying(false);
          onSelectRole('staff', data.staff);
          return;
        }
      }
    } catch {
      // Fallback to local check
    }

    // Local check against staffList using resemblance
    const q = targetName.trim().toLowerCase();
    const matched = staffList.find((s) => {
      const sName = s.name.toLowerCase();
      return (
        sName === q ||
        sName.includes(q) ||
        q.includes(sName) ||
        sName.replace(/^(mr|mrs|miss|dr|engr)\.?\s+/i, '').trim() === q.replace(/^(mr|mrs|miss|dr|engr)\.?\s+/i, '').trim()
      );
    });

    setIsVerifying(false);

    if (matched) {
      onSelectRole('staff', matched);
    } else if (resemblingStaff.length > 0) {
      // If there's a strong resembling match, suggest or select the top one
      onSelectRole('staff', resemblingStaff[0]);
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

        {/* Content Body */}
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
                    setStaffNameInput('');
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
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Faculty Verification
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Enter your registered instructor name to sign in.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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

              {/* Name Input & Search Form */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Registered Faculty Name
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={staffNameInput}
                      onChange={(e) => {
                        setStaffNameInput(e.target.value);
                        setErrorMessage(null);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyStaff()}
                      placeholder="e.g. Chinedu Okafor or Mr. Okafor"
                      className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 min-h-[44px]"
                      autoFocus
                    />
                    {staffNameInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setStaffNameInput('');
                          setErrorMessage(null);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyStaff()}
                    disabled={isVerifying || !staffNameInput.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[44px] shrink-0 cursor-pointer"
                  >
                    {isVerifying ? (
                      'Verifying...'
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Resemblance Results Area - NO PRE-POPULATED LIST */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                {!staffNameInput.trim() ? (
                  /* Initial State: Clean guidance without showing the full teacher roster */
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-700">
                      Search Faculty Directory
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Please enter your name or surname above. If any registered profile resembles your entry, it will appear here for you to copy or sign in directly.
                    </p>
                  </div>
                ) : resemblingStaff.length > 0 ? (
                  /* Resembling Records Found */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs px-0.5">
                      <span className="font-semibold text-slate-600">
                        Matching Faculty Records ({resemblingStaff.length})
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Resemblance match
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                      {resemblingStaff.map((s) => {
                        const isCopied = copiedStaffId === s.id;

                        return (
                          <div
                            key={s.id}
                            className="p-3 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {formatStaffName(s.name)}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-900">
                                  {s.department}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {s.formMasterOf ? `Form Master: ${s.formMasterOf} · ` : ''}
                                {s.subjectsTaught?.length ? `Subjects: ${s.subjectsTaught.join(', ')}` : 'Academic Instructor'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Copy Name Button */}
                              <button
                                type="button"
                                onClick={() => handleCopyStaffName(s.name, s.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer min-h-[32px] ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                                title="Copy exact registered name"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Name</span>
                                  </>
                                )}
                              </button>

                              {/* Sign In Button */}
                              <button
                                type="button"
                                onClick={() => handleVerifyStaff(s.name)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer min-h-[32px]"
                              >
                                <span>Sign In</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* No Match State */
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-800">
                      No faculty records match "{staffNameInput}"
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Please check the spelling of your name. If you were recently hired, contact the College Administration to add your profile.
                    </p>
                  </div>
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
