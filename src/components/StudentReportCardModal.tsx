import React, { useMemo } from 'react';
import { X, Printer, ShieldCheck, Award } from 'lucide-react';
import { StudentProfile, SchoolClassDefinition } from '../types';
import { DGCLogo } from './DGCLogo';
import { CURRENT_SESSION, CURRENT_TERM, SCHOOL_NAME, SCHOOL_MOTTO, SCHOOL_LOCATION } from '../data/mockData';
import { getSubjectCode, calculateGrade, computeCaTotal } from '../data/originalData';
import { formatStudentShortName } from '../utils/formatters';

interface StudentReportCardModalProps {
  student: StudentProfile;
  classes: SchoolClassDefinition[];
  onClose: () => void;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  student,
  classes,
  onClose,
}) => {
  const classDef = classes.find((c) => c.name === student.classArm);
  const assignedFormMaster = classDef?.classMaster || 'Class Master';

  const formMasterRemark = student.formMasterRemark || (
    student.termGpa >= 75
      ? 'An exceptional, highly focused student who demonstrates academic brilliance and moral discipline. Recommended for academic honors.'
      : 'A good and regular student. Encouraged to allocate more time to continuous assessment revisions.'
  );

  // Deterministic institutional document verification hash
  const verificationHash = useMemo(() => {
    const seed = `${student.admissionNo}-${student.classArm}-${student.termGpa || 0}-${CURRENT_SESSION}-${CURRENT_TERM}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `DGC-VER-2026-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
  }, [student.admissionNo, student.classArm, student.termGpa]);

  // Unified real-time resolution of subjects including newly integrated curriculum subjects (Geography, Marketing, etc.)
  const resolvedSubjects = useMemo(() => {
    const existingMap = new Map<string, any>();
    (student.subjects || []).forEach((s) => {
      existingMap.set(s.name.toLowerCase().trim(), s);
    });

    const classCurriculum = classDef?.curriculumSubjects || [];
    const allNames: string[] = [...classCurriculum];
    (student.subjects || []).forEach((s) => {
      if (!allNames.some((n) => n.toLowerCase().trim() === s.name.toLowerCase().trim())) {
        allNames.push(s.name);
      }
    });

    const finalNames = allNames.length > 0 ? allNames : (student.subjects || []).map((s) => s.name);

    return finalNames.map((subjName) => {
      const existing = existingMap.get(subjName.toLowerCase().trim());
      const code = existing?.code || getSubjectCode(subjName);
      const hasMarks = Boolean(
        existing && (
          (existing.total !== undefined && existing.total > 0) ||
          (existing.caTotal !== undefined && existing.caTotal > 0) ||
          (existing.exam !== undefined && existing.exam > 0) ||
          (existing.grade && existing.grade !== '-' && existing.grade !== 'Ungraded' && existing.grade !== 'Pending')
        )
      );

      const hw = existing?.homework ?? 0;
      const t1 = existing?.test1 ?? 0;
      const t2 = existing?.test2 ?? 0;
      const prac = existing?.practical ?? existing?.quiz ?? 0;
      const caTotal = existing?.caTotal ?? (hasMarks ? computeCaTotal(hw, t1, t2, prac) : 0);
      const exam = existing?.exam ?? 0;
      const total = existing?.total ?? (hasMarks ? Math.min(100, caTotal + exam) : 0);

      let grade = 'Pending';
      let remark = 'Pending Assessment';
      if (hasMarks) {
        if (existing?.grade && existing.grade !== '-' && existing.grade !== 'Ungraded' && existing.grade !== 'Pending') {
          grade = existing.grade;
          remark = existing.remark || calculateGrade(total).remark;
        } else {
          const res = calculateGrade(total);
          grade = res.grade;
          remark = res.remark;
        }
      }

      return {
        name: subjName,
        code,
        hasMarks,
        homework: hw,
        test1: t1,
        test2: t2,
        practical: prac,
        caTotal,
        exam,
        total,
        grade,
        remark,
      };
    });
  }, [student.subjects, classDef]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95dvh] sm:max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-900/80 text-blue-200 border border-blue-700/60 uppercase tracking-wider shrink-0">
              Terminal Report Card
            </span>
            <span className="text-xs text-slate-300 truncate max-w-[200px] sm:max-w-none">
              {formatStudentShortName(student.name)} ({student.admissionNo}) · {student.classArm}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[36px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Official Broadsheet</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center border border-slate-700"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Card Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/50 print-content">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-8 space-y-6">
            {/* School Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <DGCLogo size="lg" showText={false} />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-slate-900 tracking-tight">
                    {SCHOOL_NAME}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold italic">
                    "{SCHOOL_MOTTO}" · {SCHOOL_LOCATION}
                  </p>
                  <p className="text-[11px] font-mono text-slate-600 mt-1 uppercase tracking-wider">
                    Official Terminal Broadsheet & Continuous Assessment Transcript
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Academic Session</span>
                <span className="text-sm font-bold text-slate-900 block font-mono">{CURRENT_SESSION}</span>
                <span className="text-xs font-bold text-blue-900 block font-mono">{CURRENT_TERM}</span>
              </div>
            </div>

            {/* Student Biodata Strip with Uniform Passport Frame */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                  <span className="font-bold text-slate-900 block">{formatStudentShortName(student.name)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Number</span>
                  <span className="font-mono font-bold text-slate-900 block">{student.admissionNo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Arm</span>
                  <span className="font-bold text-slate-900 block">{student.classArm}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Form Master</span>
                  <span className="font-bold text-blue-950 truncate block">{assignedFormMaster}</span>
                </div>
              </div>

              {/* Passport Photo Frame */}
              <div className="shrink-0 flex items-center justify-center sm:pl-4 sm:border-l border-slate-200">
                <div className="w-16 h-20 rounded-lg border-2 border-slate-300 bg-white p-0.5 shadow-2xs relative overflow-hidden flex flex-col items-center justify-center text-center">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  ) : (
                    <div className="p-1 text-[8px] text-slate-400 font-bold leading-tight uppercase flex flex-col items-center justify-center h-full">
                      <span>Uniform</span>
                      <span>Passport</span>
                      <span>Photo</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-blue-950/90 text-[6px] font-mono text-amber-300 py-0.2 text-center uppercase tracking-widest">
                    DOMINATE STAR
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Results Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Subject Course</th>
                    <th className="py-2.5 px-2 text-center">HW (10)</th>
                    <th className="py-2.5 px-2 text-center">T1 (10)</th>
                    <th className="py-2.5 px-2 text-center">T2 (10)</th>
                    <th className="py-2.5 px-2 text-center">Prac (10)</th>
                    <th className="py-2.5 px-2 text-center font-bold bg-blue-50/60 text-blue-950">CA (40)</th>
                    <th className="py-2.5 px-2 text-center font-bold">Exam (60)</th>
                    <th className="py-2.5 px-2 text-center font-bold bg-slate-100/80 text-slate-900">Total (100)</th>
                    <th className="py-2.5 px-2 text-center font-bold">Grade</th>
                    <th className="py-2.5 px-3 text-right">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {resolvedSubjects.map((s) => {
                    const isPending = !s.hasMarks;

                    return (
                      <tr key={s.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {s.name}
                          <span className="ml-1 text-[10px] font-mono text-slate-400">({s.code})</span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700 tabular-nums">{isPending ? '—' : s.homework}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700 tabular-nums">{isPending ? '—' : s.test1}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700 tabular-nums">{isPending ? '—' : s.test2}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-700 tabular-nums">{isPending ? '—' : s.practical}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-900 bg-blue-50/30 tabular-nums">{isPending ? '—' : s.caTotal}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800 tabular-nums">{isPending ? '—' : s.exam}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-black text-slate-950 bg-slate-100/40 tabular-nums">{isPending ? '—' : s.total}</td>
                        <td className="py-2.5 px-2 text-center font-bold">
                          {isPending ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">Pending</span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded font-mono font-black text-[11px] ${
                              s.grade === 'A1'
                                ? 'bg-blue-900 text-white'
                                : s.grade.startsWith('B')
                                ? 'bg-blue-100 text-blue-900'
                                : s.grade.startsWith('C')
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}>
                              {s.grade}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-medium text-[11px]">
                          {isPending ? 'Pending Assessment' : s.remark}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Term Average GPA</span>
                <span className="text-xl font-black text-blue-950 font-mono tabular-nums">
                  {student.termGpa > 0 ? `${student.termGpa}%` : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Class Standing</span>
                <span className="text-base sm:text-lg font-black text-blue-950 font-mono">{student.termRank}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Attendance Rate</span>
                <span className="text-xl font-black text-blue-950 font-mono tabular-nums">{student.attendanceRate}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Result Status</span>
                <span
                  className={`text-xs font-bold block mt-1 ${
                    student.resultHeld ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {student.resultHeld ? 'Held by Admin' : 'Officially Certified'}
                </span>
              </div>
            </div>

            {/* Form Master & Principal Endorsement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                  Class Master's Official Evaluation
                </span>
                <p className="text-slate-800 italic">
                  "{formMasterRemark}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                  <span>Class Master: <strong>{assignedFormMaster}</strong></span>
                  <span className="text-emerald-700 font-bold">Signature: Verified</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-blue-900 block">
                  Principal & Board Endorsement
                </span>
                <p className="text-blue-950 italic">
                  "{student.resultHeld ? 'Result held by administrative directive.' : 'Result approved and certified by the College Directorate. Promoted in good standing.'}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-blue-800 pt-2 border-t border-blue-200/60 mt-2">
                  <span>College Seal: <strong>AFFIXED</strong></span>
                  <span>Next Term Resumption: <strong>11th Jan, 2027</strong></span>
                </div>
              </div>
            </div>

            {/* Official Institutional Document Security & Directorate Digital Seal */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-slate-50/80 p-3.5 rounded-xl border">
              <div className="flex items-center gap-3 col-span-2">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-900 bg-white flex flex-col items-center justify-center p-1 shrink-0 text-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-900" />
                  <span className="text-[7px] font-extrabold uppercase tracking-tighter text-blue-950 leading-none mt-0.5">
                    SEALED
                  </span>
                </div>
                <div className="text-[11px] space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs">
                      Directorate Institutional Authentication
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-100 text-blue-900">
                      SEC-VERIFIED
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] leading-tight">
                    Issued under the authority of Dominate Star College Directorate of Academic Affairs.
                  </p>
                  <p className="font-mono text-[10px] text-slate-700 font-bold truncate">
                    Ref Hash: <span className="text-blue-950">{verificationHash}</span>
                  </p>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-500 space-y-1 border-t sm:border-t-0 sm:border-l sm:border-slate-200 sm:pl-3 pt-2 sm:pt-0">
                <span className="block font-mono text-[9px] text-slate-400">
                  DIGITAL AUDIT TRAIL
                </span>
                <span className="font-bold text-slate-700 block">
                  Status: {student.resultHeld ? 'HOLD ACTIVE' : 'AUTHENTICATED'}
                </span>
                <span className="text-slate-400 font-mono text-[9px] block">
                  Session: 2026/2027 · T1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
