import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Copy,
  Check,
  X,
  GraduationCap,
  AlertCircle,
  HelpCircle,
  UserCheck,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { formatStudentShortName } from '../utils/formatters';

interface CheckRegNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  onSelectRegNumber?: (admissionNo: string) => void;
}

// Resemblance & Token Matcher for names in any sequence or with minor typos
function calculateNameResemblance(studentName: string, query: string): { matches: boolean; score: number } {
  if (!query.trim()) return { matches: false, score: 0 };

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/^(master|miss|mr|mrs)\.?\s+/i, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const cleanQuery = normalize(query);
  const cleanTarget = normalize(studentName);

  if (!cleanQuery) return { matches: false, score: 0 };

  // Direct substring / exact match
  if (cleanTarget === cleanQuery) return { matches: true, score: 100 };
  if (cleanTarget.includes(cleanQuery)) return { matches: true, score: 90 };
  if (cleanQuery.includes(cleanTarget)) return { matches: true, score: 85 };

  const qTokens = cleanQuery.split(' ').filter(Boolean);
  const targetTokens = cleanTarget.split(' ').filter(Boolean);

  if (qTokens.length === 0 || targetTokens.length === 0) return { matches: false, score: 0 };

  const tokenResembles = (qTok: string, tTok: string): boolean => {
    if (qTok === tTok) return true;
    if (tTok.startsWith(qTok) || qTok.startsWith(tTok)) return true;
    if (tTok.includes(qTok) || qTok.includes(tTok)) return true;

    // Fuzzy comparison for 4+ char strings (e.g. "okonwo" vs "okonkwo")
    if (qTok.length >= 4 && tTok.length >= 4) {
      const minLen = Math.min(qTok.length, tTok.length);
      const maxLen = Math.max(qTok.length, tTok.length);
      if (maxLen - minLen > 2) return false;

      let diff = 0;
      let i = 0;
      let j = 0;
      while (i < qTok.length && j < tTok.length) {
        if (qTok[i] === tTok[j]) {
          i++;
          j++;
        } else {
          diff++;
          if (qTok.length > tTok.length) i++;
          else if (tTok.length > qTok.length) j++;
          else {
            i++;
            j++;
          }
        }
      }
      diff += qTok.length - i + (tTok.length - j);
      if (diff <= 2) return true;
    }
    return false;
  };

  let matchedTokens = 0;
  for (const q of qTokens) {
    if (targetTokens.some((t) => tokenResembles(q, t))) {
      matchedTokens++;
    }
  }

  const tokenRatio = matchedTokens / qTokens.length;
  if (tokenRatio >= 0.5 || (qTokens.length === 1 && matchedTokens === 1)) {
    return { matches: true, score: Math.round(tokenRatio * 80) };
  }

  return { matches: false, score: 0 };
}

export const CheckRegNumberModal: React.FC<CheckRegNumberModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedRegNo, setCopiedRegNo] = useState<string | null>(null);
  const [dbRemoteStudents, setDbRemoteStudents] = useState<StudentProfile[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);

  // Trigger live database search whenever query is submitted
  useEffect(() => {
    const q = (submittedQuery.trim() || nameInput.trim());
    if (!q || q.length < 2) {
      setDbRemoteStudents([]);
      return;
    }

    let isMounted = true;
    setIsSearchingDb(true);
    fetch(`/api/students?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && Array.isArray(data.students)) {
          setDbRemoteStudents(data.students);
        }
      })
      .catch((err) => console.warn('Live student search notice:', err))
      .finally(() => {
        if (isMounted) setIsSearchingDb(false);
      });

    return () => {
      isMounted = false;
    };
  }, [submittedQuery, nameInput]);

  // Combined pool of local props and server database results
  const combinedStudentsPool = useMemo(() => {
    const map = new Map<string, StudentProfile>();
    students.forEach((s) => map.set(s.id || s.admissionNo, s));
    dbRemoteStudents.forEach((s) => map.set(s.id || s.admissionNo, s));
    return Array.from(map.values());
  }, [students, dbRemoteStudents]);

  // Search results computed strictly based on submittedQuery or active typing
  const searchResults = useMemo(() => {
    const query = submittedQuery.trim() || nameInput.trim();
    if (!query) return [];

    const scored = combinedStudentsPool
      .map((st) => {
        const res = calculateNameResemblance(st.name, query);
        // Also check direct match on admission number or class
        const admMatch = (st.admissionNo || '').toLowerCase().includes(query.toLowerCase());
        return {
          student: st,
          matches: res.matches || admMatch,
          score: admMatch ? 100 : res.score,
        };
      })
      .filter((item) => item.matches)
      .sort((a, b) => b.score - a.score);

    return scored.map((item) => item.student);
  }, [submittedQuery, nameInput, combinedStudentsPool]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedQuery(nameInput.trim());
  };

  const handleCopy = (regNo: string, studentId: string) => {
    navigator.clipboard.writeText(regNo);
    setCopiedId(studentId);
    setCopiedRegNo(regNo);
    setTimeout(() => {
      setCopiedId(null);
    }, 3000);
  };

  const activeQuery = submittedQuery.trim() || nameInput.trim();

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white relative shrink-0 border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors cursor-pointer border border-slate-700"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-xl bg-blue-900/60 text-blue-200 border border-blue-700/50 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                Academic Registry
              </span>
              <h2 className="text-base sm:text-lg font-bold font-serif-title tracking-tight text-white">
                Retrieve Registration Number
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Dominate Star College · Student Verification Directory
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Instructions Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-slate-900">
                Enter your registered name to find your official Registration Number.
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Type your surname or full name in any order. The system will search the database for resembling profiles so you can copy your Registration Number.
              </p>
            </div>
          </div>

          {/* Name Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Enter Your Full Name or Surname:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (!e.target.value.trim()) {
                      setSubmittedQuery('');
                    }
                  }}
                  placeholder="e.g. Okonkwo or Chukwuemeka Okonkwo"
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition-all min-h-[44px]"
                />
                {nameInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput('');
                      setSubmittedQuery('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px] shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Results Area */}
          <div className="space-y-3 pt-1">
            {!activeQuery ? (
              /* Initial State: DO NOT show any list of names! Show polite guidance */
              <div className="p-6 sm:p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">
                  Ready to Search Registry
                </h3>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Please type your registered name above and click <strong>Search</strong>. Any resembling records in the college database will be displayed for you to copy your Registration Number.
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-semibold text-slate-600">
                    Matching Student Records ({searchResults.length})
                  </span>
                  <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Profile located
                  </span>
                </div>

                <div className="space-y-2.5">
                  {searchResults.map((std) => {
                    const isCopied = copiedId === std.id;

                    return (
                      <div
                        key={std.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {std.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">
                                {formatStudentShortName(std.name)}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                  {std.classArm}
                                </span>
                                <span>·</span>
                                <span>{std.stream} Stream</span>
                              </div>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Registered
                          </span>
                        </div>

                        {/* Registration Number Container - COPY ONLY */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Registration Number
                            </span>
                            <span className="text-sm sm:text-base font-bold font-mono text-slate-900 tracking-wide select-all">
                              {std.admissionNo}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(std.admissionNo, std.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px] ${
                              isCopied
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            }`}
                            title="Copy registration number to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Reg Number</span>
                              </>
                            )}
                          </button>
                        </div>

                        {isCopied && (
                          <p className="text-[11px] text-emerald-700 font-medium px-1 flex items-center gap-1">
                            <Check className="w-3 h-3 shrink-0" />
                            <span>Copied to clipboard. Paste this into the Reg Number and Password fields on the sign-in page.</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* No Results State */
              <div className="p-6 sm:p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <AlertCircle className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  No records found resembling "{activeQuery}"
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Please verify your spelling, or try searching with just your surname or first name. If you were recently enrolled, please contact the College Administration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <GraduationCap className="w-4 h-4 text-slate-700 shrink-0" />
            <span>Note: Password is the same as your Registration Number</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
