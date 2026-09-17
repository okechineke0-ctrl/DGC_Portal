import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Search,
  User,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface IndividualHoldResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: StudentProfile | null;
  allStudents?: StudentProfile[];
  onToggleHoldResult: (studentId: string, hold: boolean, reason?: string) => Promise<boolean>;
  onSuccess?: (msg: string) => void;
}

const COMMON_REASONS = [
  'Outstanding School Fees & Bursary Clearance',
  'Incomplete Continuous Assessment (CA) Records',
  'Unreturned College Library Books / Lab Apparatus',
  'Administrative Disciplinary Board Review',
  'Pending Guardian Verification / Documentation',
];

export const IndividualHoldResultModal: React.FC<IndividualHoldResultModalProps> = ({
  isOpen,
  onClose,
  student: initialStudent,
  allStudents = [],
  onToggleHoldResult,
  onSuccess,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(initialStudent || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHold, setIsHold] = useState<boolean>(initialStudent?.resultHeld ?? true);
  const [selectedReason, setSelectedReason] = useState<string>(
    initialStudent?.holdReason || COMMON_REASONS[0]
  );
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync when prop changes
  useEffect(() => {
    if (initialStudent) {
      setSelectedStudent(initialStudent);
      setIsHold(initialStudent.resultHeld ? false : true); // default to toggling to opposite
      setSelectedReason(initialStudent.holdReason || COMMON_REASONS[0]);
    } else {
      setSelectedStudent(null);
      setIsHold(true);
      setSelectedReason(COMMON_REASONS[0]);
    }
    setFeedback(null);
  }, [initialStudent, isOpen]);

  if (!isOpen) return null;

  // Filter students if searching
  const searchResults = searchQuery.trim()
    ? allStudents.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.classArm.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleApply = async () => {
    if (!selectedStudent) {
      setFeedback({ type: 'error', message: 'Please select a student first.' });
      return;
    }

    const reasonToApply = isHold
      ? selectedReason === 'Custom'
        ? customReason.trim() || 'Administrative Directorate Decision'
        : selectedReason
      : undefined;

    setIsSubmitting(true);
    setFeedback(null);

    const success = await onToggleHoldResult(selectedStudent.id, isHold, reasonToApply);
    setIsSubmitting(false);

    if (success) {
      const msg = isHold
        ? `Result for ${selectedStudent.name} (${selectedStudent.admissionNo}) has been placed on administrative HOLD.`
        : `Result for ${selectedStudent.name} (${selectedStudent.admissionNo}) has been RELEASED.`;
      if (onSuccess) onSuccess(msg);
      onClose();
    } else {
      setFeedback({
        type: 'error',
        message: 'Could not update result status. Please check connection.',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
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
              Administrative Control
            </span>
            <span className="text-[11px] text-blue-200">Directorate Office</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold font-serif-title tracking-tight text-white pr-8">
            Individual Student Result Hold & Release
          </h2>
          <p className="text-[11px] sm:text-xs text-blue-200/90 mt-0.5">
            Hold or release an individual student's terminal result independently.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm">
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                feedback.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Student Selection / Identity */}
          {!selectedStudent ? (
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Find Student (Search by Name, Reg No, or Class)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type student name or admission number..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 min-h-[44px]"
                  autoFocus
                />
              </div>

              {searchResults.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-52 overflow-y-auto shadow-xs">
                  {searchResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(s);
                        setIsHold(s.resultHeld ? false : true);
                        setSelectedReason(s.holdReason || COMMON_REASONS[0]);
                        setSearchQuery('');
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-950 flex items-center justify-center font-bold text-xs shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{s.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {s.admissionNo} · {s.classArm}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          s.resultHeld ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {s.resultHeld ? 'Held' : 'Released'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <p className="text-xs text-slate-500 py-2 text-center italic">
                  No students found matching "{searchQuery}"
                </p>
              )}
            </div>
          ) : (
            <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {selectedStudent.photoUrl ? (
                      <img
                        src={selectedStudent.photoUrl}
                        alt={selectedStudent.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      selectedStudent.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {selectedStudent.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono font-bold text-slate-700">
                        {selectedStudent.admissionNo}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-blue-900">{selectedStudent.classArm}</span>
                    </div>
                  </div>
                </div>

                {!initialStudent && (
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-[11px] text-blue-700 hover:text-blue-950 font-bold underline cursor-pointer p-1"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Current Status Display */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Current Result Status:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedStudent.resultHeld
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedStudent.resultHeld ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                  <span>{selectedStudent.resultHeld ? 'WITHHELD' : 'RELEASED'}</span>
                </span>
              </div>

              {selectedStudent.resultHeld && selectedStudent.holdReason && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900">
                  <span className="font-bold">Active Hold Reason:</span> {selectedStudent.holdReason}
                </div>
              )}
            </div>
          )}

          {/* Action Selection */}
          {selectedStudent && (
            <div className="space-y-4 pt-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Select Desired Action
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsHold(true)}
                  className={`p-3 sm:p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px] ${
                    isHold
                      ? 'border-rose-600 bg-rose-50 text-rose-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Hold Result</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHold(false)}
                  className={`p-3 sm:p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px] ${
                    !isHold
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Release Result</span>
                </button>
              </div>

              {/* Hold Reason Selection if Holding */}
              {isHold && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Select Official Reason for Withholding Result:
                  </label>

                  <div className="space-y-1.5">
                    {COMMON_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                          selectedReason === reason
                            ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="holdReason"
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className="w-4 h-4 text-blue-900 focus:ring-blue-900 shrink-0"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}

                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                        selectedReason === 'Custom'
                          ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="holdReason"
                        checked={selectedReason === 'Custom'}
                        onChange={() => setSelectedReason('Custom')}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900 shrink-0"
                      />
                      <span>Custom Directorate Reason...</span>
                    </label>
                  </div>

                  {selectedReason === 'Custom' && (
                    <div className="mt-2">
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="State specific administrative or disciplinary directive..."
                        rows={2}
                        className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/30"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl min-h-[44px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!selectedStudent || isSubmitting}
            className={`py-2.5 px-5 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all min-h-[44px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              isHold
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSubmitting ? (
              'Updating...'
            ) : isHold ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirm & Hold Result</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Confirm & Release Result</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
