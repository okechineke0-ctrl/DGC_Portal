import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  UserCheck,
  X,
  Sparkles,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { DGCLogo } from './DGCLogo';

interface CheckRegNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  onSelectRegNumber: (admissionNo: string) => void;
}

// Fuzzy & disarranged token matcher
function matchStudentName(studentName: string, query: string): { matches: boolean; score: number } {
  if (!query.trim()) return { matches: false, score: 0 };

  const cleanStr = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const qTokens = cleanStr(query)
    .split(' ')
    .filter((t) => t.length > 0);
  const nameTokens = cleanStr(studentName)
    .split(' ')
    .filter((t) => t.length > 0);

  if (qTokens.length === 0) return { matches: false, score: 0 };

  const tokenMatches = (qToken: string, nToken: string): boolean => {
    if (nToken === qToken) return true;
    if (nToken.startsWith(qToken) || qToken.startsWith(nToken)) return true;
    if (nToken.includes(qToken) || qToken.includes(nToken)) return true;

    // Fuzzy matching for typos like "okonwo" vs "okonkwo"
    if (qToken.length >= 4 && nToken.length >= 4) {
      const minLen = Math.min(qToken.length, nToken.length);
      const maxLen = Math.max(qToken.length, nToken.length);
      if (maxLen - minLen > 2) return false;

      let diff = 0;
      let i = 0;
      let j = 0;
      while (i < qToken.length && j < nToken.length) {
        if (qToken[i] === nToken[j]) {
          i++;
          j++;
        } else {
          diff++;
          if (qToken.length > nToken.length) i++;
          else if (nToken.length > qToken.length) j++;
          else {
            i++;
            j++;
          }
        }
      }
      diff += qToken.length - i + (nToken.length - j);
      if (diff <= 2) return true;
    }
    return false;
  };

  let matchedTokens = 0;
  for (const q of qTokens) {
    const found = nameTokens.some((n) => tokenMatches(q, n));
    if (found) matchedTokens++;
  }

  const matches =
    matchedTokens === qTokens.length ||
    (qTokens.length > 1 && matchedTokens >= Math.ceil(qTokens.length * 0.65));
  const score = matchedTokens / qTokens.length;

  return { matches, score };
}

export const CheckRegNumberModal: React.FC<CheckRegNumberModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectRegNumber,
}) => {
  const [nameQuery, setNameQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    const trimmed = nameQuery.trim();
    if (!trimmed) return [];

    const scored = students
      .map((st) => {
        const res = matchStudentName(st.name, trimmed);
        return { student: st, ...res };
      })
      .filter((item) => item.matches)
      .sort((a, b) => b.score - a.score);

    return scored.map((item) => item.student);
  }, [nameQuery, students]);

  if (!isOpen) return null;

  const handleCopy = (regNo: string, studentId: string) => {
    navigator.clipboard.writeText(regNo);
    setCopiedId(studentId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleUseForLogin = (regNo: string) => {
    onSelectRegNumber(regNo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 border border-white/20 flex items-center justify-center shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 block">
                Official Student Verification
              </span>
              <h2 className="text-xl font-bold font-serif-title tracking-tight">
                Check Registration Number
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Dominion Stars Global College · Academic Registry Directory
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Instructions Box */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-blue-900">
                Enter your name in any order to look up your account.
              </p>
              <p className="text-blue-800/80 text-[11px] mt-0.5">
                Whether you enter your surname first or last (e.g. <em>"Okonkwo Emmanuel"</em> or <em>"Emmanuel Okonkwo"</em> or partial names), our portal will find your registered student profile and display your official College Registration Number.
              </p>
            </div>
          </div>

          {/* Name Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Enter Your Full Name (in any sequence):
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="e.g. Okonkwo Emmanuel or Emma Okonkwo"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all shadow-inner"
              />
              {nameQuery && (
                <button
                  type="button"
                  onClick={() => setNameQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Search Results Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>
                {nameQuery.trim()
                  ? `Search Results (${searchResults.length} student${searchResults.length === 1 ? '' : 's'} found)`
                  : 'Suggestions / Recent Records'}
              </span>
              {nameQuery.trim() && searchResults.length > 0 && (
                <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Match found
                </span>
              )}
            </div>

            {/* Results List */}
            {nameQuery.trim() ? (
              searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((std) => {
                    const isCopied = copiedId === std.id;

                    return (
                      <div
                        key={std.id}
                        className="p-4 rounded-2xl bg-slate-50 border-2 border-blue-900/15 hover:border-blue-900/40 transition-all space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-950 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {std.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{std.name}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                  {std.classArm}
                                </span>
                                <span>·</span>
                                <span>{std.gender}</span>
                                <span>·</span>
                                <span>{std.session}</span>
                              </div>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            Verified
                          </span>
                        </div>

                        {/* Registration Number Highlight Card */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Official Registration Number
                            </span>
                            <span className="text-base font-black font-mono text-blue-950 tracking-wide select-all">
                              {std.admissionNo}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(std.admissionNo, std.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isCopied
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                              title="Copy to clipboard"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Reg No</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUseForLogin(std.admissionNo)}
                              className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              title="Autofill and sign in"
                            >
                              <span>Use in Login</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    No student found matching "{nameQuery}"
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Check for typos, or try searching by just your surname or first name. If you were recently admitted, contact the Administration office to verify your enrollment.
                  </p>
                </div>
              )
            ) : (
              /* Sample/Quick Pick Guide for returning students */
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400">
                  Tip: Start typing your surname or first name above. Below are examples of registered returning students:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {students.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setNameQuery(s.name)}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-xs text-slate-800 block truncate">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {s.admissionNo} · {s.classArm}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-900 shrink-0">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <GraduationCap className="w-4 h-4 text-blue-950" />
            <span>Login Note: Your Password is your Registration Number.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
