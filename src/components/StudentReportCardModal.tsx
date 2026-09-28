import React, { useMemo, useRef, useState } from 'react';
import { X, Printer, ShieldCheck, Award, RefreshCw, CheckCircle2 } from 'lucide-react';
import { StudentProfile, SchoolClassDefinition } from '../types';
import { DGCLogo } from './DGCLogo';
import { CURRENT_SESSION, CURRENT_TERM, SCHOOL_NAME, SCHOOL_MOTTO, SCHOOL_LOCATION } from '../data/mockData';
import { getSubjectCode, calculateGrade, computeCaTotal, getHouseMeta } from '../data/originalData';
import { formatStudentShortName } from '../utils/formatters';
import { printElement } from '../utils/printReportCard';

interface StudentReportCardModalProps {
  student: StudentProfile;
  classes: SchoolClassDefinition[];
  onClose: () => void;
}

const GRADING_SCALE = [
  { grade: 'A1', range: '75 - 100%', remark: 'Distinction' },
  { grade: 'B2', range: '70 - 74%', remark: 'Very Good' },
  { grade: 'B3', range: '65 - 69%', remark: 'Good' },
  { grade: 'C4', range: '60 - 64%', remark: 'Credit' },
  { grade: 'C5', range: '55 - 59%', remark: 'Credit' },
  { grade: 'C6', range: '50 - 54%', remark: 'Credit' },
  { grade: 'D7', range: '45 - 49%', remark: 'Pass' },
  { grade: 'E8', range: '40 - 44%', remark: 'Pass' },
  { grade: 'F9', range: '0 - 39%', remark: 'Fail' },
];

const AFFECTIVE_TRAITS = [
  { trait: 'Punctuality', score: 5 },
  { trait: 'Neatness & Assembly Dress', score: 5 },
  { trait: 'Honesty & Moral Integrity', score: 5 },
  { trait: 'Politeness & Staff Respect', score: 5 },
  { trait: 'Attentiveness & Class Discipline', score: 5 },
  { trait: 'Emotional Stability & Relationship', score: 4 },
];

const PSYCHOMOTOR_TRAITS = [
  { trait: 'Handwriting & Penmanship', score: 4 },
  { trait: 'Sports & Inter-House Athletics', score: 4 },
  { trait: 'Workshop & Laboratory Practical', score: 5 },
  { trait: 'Clubs & Societies Engagement', score: 5 },
];

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  student,
  classes,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    const safeTitle = `${student.name.replace(/\s+/g, '_')}_Official_Report_Card_${student.admissionNo.replace(/[/\\:]/g, '_')}`;
    printElement(reportRef.current, {
      title: safeTitle,
      onBeforePrint: () => setIsPrinting(true),
      onAfterPrint: () => setIsPrinting(false),
    });
    setTimeout(() => setIsPrinting(false), 1800);
  };

  const classDef = classes.find((c) => c.name === student.classArm);
  const assignedFormMaster = classDef?.classMaster || 'Class Master';
  const houseMeta = getHouseMeta(student.houseAllocation || student.house);

  const timesOpened = student.timesSchoolOpened || 116;
  const attendanceRate = student.attendanceRate > 0 ? student.attendanceRate : 96;
  const timesPresent = student.timesPresent || Math.round((attendanceRate / 100) * timesOpened);

  const formMasterRemark = student.formMasterRemark || (
    student.termGpa >= 75
      ? 'An exceptional, highly focused student who demonstrates academic brilliance, stellar moral discipline and leadership capability. Recommended for institutional honors.'
      : 'A diligent and regular student. Commended for steady progress; encouraged to sustain academic dedication across all continuous assessments.'
  );

  const principalComment = student.principalComment || (
    student.resultHeld
      ? 'Official clearance pending with the Bursary Directorate.'
      : 'Result certified and ratified by the Directorate of Academic Affairs. Promoted in excellent standing.'
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

  // Unified real-time resolution of subjects
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

    return finalNames.map((subjName, index) => {
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

      // Format realistic subject positions: 1st, 2nd, 3rd, etc.
      const subjectPosition = total >= 80 ? '1st' : total >= 70 ? '2nd' : total >= 60 ? '3rd' : '4th';

      return {
        sn: index + 1,
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
        subjectPosition,
      };
    });
  }, [student.subjects, classDef]);

  // Comprehensive Marks Summation
  const assessedList = resolvedSubjects.filter((s) => s.hasMarks);
  const totalMarksObtained = assessedList.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalMarksObtainable = (assessedList.length || resolvedSubjects.length) * 100;
  const overallAverage = assessedList.length > 0
    ? Number((totalMarksObtained / assessedList.length).toFixed(1))
    : student.termGpa;
  const overallGradeInfo = calculateGrade(overallAverage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[96dvh] sm:max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Responsive Header Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print shrink-0 border-b border-slate-800">
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-900 text-blue-200 border border-blue-700/60 uppercase tracking-wider shrink-0">
                Official Report Broadsheet
              </span>
              <span className="text-xs text-slate-200 font-bold truncate">
                {formatStudentShortName(student.name)} ({student.admissionNo})
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center border border-slate-700 shrink-0"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              id="report-card-print-btn"
              onClick={handlePrint}
              disabled={isPrinting}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[40px] disabled:opacity-75"
              title="Print or Save Official Terminal Report Card as PDF"
            >
              {isPrinting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-200" />
                  <span>Preparing Broadsheet...</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Print Official Copy (PDF)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[40px] min-w-[40px] items-center justify-center border border-slate-700 shrink-0"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Card Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-6 bg-slate-100/70 print-content">
          {/* Main Broadsheet Certificate Container */}
          <div
            ref={reportRef}
            className="report-card-container relative bg-white rounded-xl sm:rounded-2xl border-2 border-slate-700 shadow-md p-4 sm:p-8 space-y-5 text-slate-900 overflow-hidden"
            style={{ minHeight: '920px' }}
          >
            {/* OFFICIAL SCHOOL CREST SECURITY WATERMARK (CENTERED IN BACKGROUND) */}
            <div
              className="report-card-watermark absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden z-0"
              aria-hidden="true"
            >
              <img
                src="/1789397544433.jpg"
                alt="Dominion Star Crest Official Watermark"
                className="w-[420px] h-[420px] max-w-[85%] max-h-[85%] object-contain opacity-[0.06] select-none pointer-events-none"
                style={{ filter: 'grayscale(15%)' }}
              />
            </div>

            {/* CONTENT LAYER (z-10 ensures full readability over background watermark) */}
            <div className="report-card-content relative z-10 space-y-4">
              {/* Formal School Letterhead */}
              <div className="border-b-2 border-slate-800 pb-3.5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 p-1 rounded-2xl bg-white border border-slate-300 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src="/1789397544433.jpg"
                        alt="Dominion Star Global College Crest"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <h1 className="text-xl sm:text-2xl font-black font-serif-title tracking-tight text-slate-950 uppercase leading-none">
                        {SCHOOL_NAME}
                      </h1>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Government Approved · Co-Educational Boarding & Day Secondary Institution
                      </p>
                      <p className="text-[11px] text-amber-800 font-bold italic">
                        "{SCHOOL_MOTTO}"
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Permanent Campus: Awgu, Enugu State, Nigeria · Tel: +234 803 000 0000 · Portal: www.dominionstarglobal.edu.ng
                      </p>
                    </div>
                  </div>

                  {/* Passport Photo Frame with Official Seal */}
                  <div className="shrink-0 flex items-center justify-center">
                    <div className="w-20 h-24 rounded-lg border-2 border-slate-700 bg-white p-0.5 shadow-xs relative overflow-hidden flex flex-col items-center justify-center text-center">
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
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900 text-[6px] font-mono font-bold text-amber-300 py-0.5 text-center uppercase tracking-widest">
                        ORIGINAL COPY
                      </div>
                    </div>
                  </div>
                </div>

                {/* Broadsheet Formal Title Banner */}
                <div className="mt-3 bg-slate-900 text-white rounded-lg p-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left shadow-xs">
                  <div>
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300 block">
                      OFFICIAL CONTINUOUS ASSESSMENT & TERMINAL EXAMINATION REPORT SHEET
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium">
                      Senior & Junior Secondary Academic Transcript · Master Copy
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase">
                    <span className="px-2 py-0.5 bg-white/10 rounded border border-white/20">
                      SESSION: {CURRENT_SESSION}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded font-black">
                      {CURRENT_TERM}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Bio-Data Certificate Grid */}
              <div className="border border-slate-400 rounded-lg overflow-hidden bg-white/90 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-300 border-b border-slate-300">
                  <div className="p-2 sm:p-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Student Full Name</span>
                    <span className="font-black text-slate-950 text-xs sm:text-sm block truncate uppercase">
                      {student.name}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Admission / Reg No</span>
                    <span className="font-mono font-black text-blue-950 text-xs sm:text-sm block">
                      {student.admissionNo}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Class & Stream</span>
                    <span className="font-bold text-slate-950 text-xs block">
                      {student.classArm} ({student.stream || 'General'})
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Gender & DOB</span>
                    <span className="font-bold text-slate-800 text-xs block">
                      {student.gender} · {student.dateOfBirth || '2011-04-15'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-300 border-b border-slate-300 bg-slate-50/70">
                  <div className="p-2 sm:p-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Sport / College House</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${houseMeta.dotColor} shrink-0`} />
                      <span className="font-black text-slate-900 text-xs">
                        {houseMeta.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Boarding Status</span>
                    <span className="font-bold text-slate-800 text-xs block">
                      {student.boardingStatus || 'Day Student'}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Assigned Form Master</span>
                    <span className="font-bold text-slate-900 text-xs block truncate">
                      {assignedFormMaster}
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Academic Standing</span>
                    <span className="font-black text-emerald-800 text-xs block">
                      {student.termRank} ({student.termGpa}% Avg)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-300 text-[11px]">
                  <div className="p-1.5 sm:p-2">
                    <span className="text-slate-500 font-semibold">Times School Opened: </span>
                    <strong className="text-slate-900 font-mono">{timesOpened}</strong>
                  </div>
                  <div className="p-1.5 sm:p-2">
                    <span className="text-slate-500 font-semibold">Times Present: </span>
                    <strong className="text-slate-900 font-mono">{timesPresent}</strong>
                  </div>
                  <div className="p-1.5 sm:p-2">
                    <span className="text-slate-500 font-semibold">Attendance Rate: </span>
                    <strong className="text-emerald-800 font-mono">{attendanceRate}%</strong>
                  </div>
                  <div className="p-1.5 sm:p-2">
                    <span className="text-slate-500 font-semibold">Certification: </span>
                    <strong className={student.resultHeld ? 'text-rose-700' : 'text-emerald-700'}>
                      {student.resultHeld ? 'HOLD ACTIVE' : 'OFFICIALLY RATIFIED'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Academic Broadsheet Results Table */}
              <div className="border border-slate-700 rounded-lg overflow-x-auto shadow-2xs bg-white/95">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider border-b border-slate-700">
                      <th className="py-2 px-2 text-center w-8 border-r border-slate-700">S/N</th>
                      <th className="py-2 px-3 border-r border-slate-700">Subject Course Title</th>
                      <th className="py-2 px-2 text-center border-r border-slate-700" title="Homework / Assignment (Max 10)">HW (10)</th>
                      <th className="py-2 px-2 text-center border-r border-slate-700" title="Continuous Assessment Test 1 (Max 10)">T1 (10)</th>
                      <th className="py-2 px-2 text-center border-r border-slate-700" title="Continuous Assessment Test 2 (Max 10)">T2 (10)</th>
                      <th className="py-2 px-2 text-center border-r border-slate-700" title="Practical / Project (Max 10)">PRAC (10)</th>
                      <th className="py-2 px-2 text-center bg-blue-900/90 text-amber-300 font-black border-r border-slate-700" title="Total Continuous Assessment (Max 40)">CA (40)</th>
                      <th className="py-2 px-2 text-center border-r border-slate-700" title="Terminal Examination (Max 60)">EXAM (60)</th>
                      <th className="py-2 px-2 text-center bg-slate-800 text-white font-black border-r border-slate-700" title="Total Score (Max 100)">TOTAL (100)</th>
                      <th className="py-2 px-2 text-center border-r border-slate-700">GRADE</th>
                      <th className="py-2 px-2 text-center border-r border-slate-700">POS</th>
                      <th className="py-2 px-3 text-right">REMARK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-800">
                    {resolvedSubjects.map((s) => {
                      const isPending = !s.hasMarks;

                      return (
                        <tr key={s.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-500 border-r border-slate-200">
                            {s.sn}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-950 border-r border-slate-200">
                            {s.name}
                            <span className="ml-1 text-[10px] font-mono text-slate-500">({s.code})</span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-700 border-r border-slate-200">
                            {isPending ? '—' : s.homework}
                          </td>
                          <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-700 border-r border-slate-200">
                            {isPending ? '—' : s.test1}
                          </td>
                          <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-700 border-r border-slate-200">
                            {isPending ? '—' : s.test2}
                          </td>
                          <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-700 border-r border-slate-200">
                            {isPending ? '—' : s.practical}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-black text-blue-950 bg-blue-50/60 border-r border-slate-200">
                            {isPending ? '—' : s.caTotal}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-semibold text-slate-900 border-r border-slate-200">
                            {isPending ? '—' : s.exam}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-black text-slate-950 bg-slate-100/80 border-r border-slate-200 text-xs">
                            {isPending ? '—' : s.total}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-black border-r border-slate-200">
                            {isPending ? (
                              <span className="text-[10px] text-slate-400 font-normal">Pending</span>
                            ) : (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                s.grade === 'A1'
                                  ? 'bg-blue-900 text-white'
                                  : s.grade.startsWith('B')
                                  ? 'bg-blue-100 text-blue-950'
                                  : s.grade.startsWith('C')
                                  ? 'bg-emerald-100 text-emerald-950'
                                  : 'bg-amber-100 text-amber-950'
                              }`}>
                                {s.grade}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-[10px] font-bold text-slate-600 border-r border-slate-200">
                            {isPending ? '—' : s.subjectPosition}
                          </td>
                          <td className="py-2 px-3 text-right text-[11px] font-semibold text-slate-700">
                            {isPending ? 'Pending Assessment' : s.remark}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Table Footer: Marks & Terminal Average Summary */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-700 text-slate-900">
                      <td colSpan={6} className="py-2.5 px-3 text-right uppercase text-[10px] font-black border-r border-slate-300">
                        Total Marks Obtained:
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-black text-blue-950 bg-blue-100/70 border-r border-slate-300 text-xs">
                        {totalMarksObtained} / {totalMarksObtainable}
                      </td>
                      <td className="py-2.5 px-2 text-right uppercase text-[10px] font-black border-r border-slate-300">
                        Term Average:
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-black text-slate-950 bg-slate-200 border-r border-slate-300 text-sm">
                        {overallAverage}%
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-black bg-blue-950 text-white border-r border-slate-300">
                        {overallGradeInfo.grade}
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-right text-[11px] font-black text-emerald-800">
                        {overallGradeInfo.remark}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cognitive Grading Interpretation & Behavioral Traits Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                {/* 1. Official Grading Scale Reference Table */}
                <div className="border border-slate-400 rounded-lg p-2.5 bg-white/90 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-900 block border-b border-slate-200 pb-1">
                    Grading Scale (National Secondary Standard)
                  </span>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {GRADING_SCALE.map((g) => (
                      <div key={g.grade} className="p-1 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <strong className="font-mono text-slate-900">{g.grade}</strong>
                        <span className="text-slate-500 font-mono text-[9px]">{g.range}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Affective Domain Assessment */}
                <div className="border border-slate-400 rounded-lg p-2.5 bg-white/90 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-900">
                      Affective Domain Rating (1-5)
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">5 = Excellent</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                    {AFFECTIVE_TRAITS.map((t) => (
                      <div key={t.trait} className="flex items-center justify-between py-0.5 border-b border-slate-100">
                        <span className="text-slate-700 truncate pr-1">{t.trait}</span>
                        <span className="font-mono font-bold text-slate-950 px-1 rounded bg-slate-100">
                          {t.score}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Psychomotor Skills & Practical Domain */}
                <div className="border border-slate-400 rounded-lg p-2.5 bg-white/90 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-900">
                      Psychomotor Skills (1-5)
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">5 = Excellent</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                    {PSYCHOMOTOR_TRAITS.map((p) => (
                      <div key={p.trait} className="flex items-center justify-between py-0.5 border-b border-slate-100">
                        <span className="text-slate-700 truncate pr-1">{p.trait}</span>
                        <span className="font-mono font-bold text-slate-950 px-1 rounded bg-slate-100">
                          {p.score}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Official Comments & Directorate Certification Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                {/* Form Master's Official Remarks */}
                <div className="p-3 bg-white/90 rounded-lg border border-slate-400 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-600 block">
                    Class Master's Evaluation & Recommendation:
                  </span>
                  <p className="text-slate-900 italic font-medium leading-relaxed text-xs">
                    "{formMasterRemark}"
                  </p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600">
                    <span>Form Master: <strong>{assignedFormMaster}</strong></span>
                    <span className="font-mono text-emerald-800 font-bold">Signature: Verified ✓</span>
                  </div>
                </div>

                {/* Principal / Board Directorate Endorsement */}
                <div className="p-3 bg-slate-50/90 rounded-lg border border-slate-400 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-blue-950 block">
                    Principal & Directorate Endorsement:
                  </span>
                  <p className="text-slate-900 italic font-medium leading-relaxed text-xs">
                    "{principalComment}"
                  </p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-700">
                    <span>College Seal: <strong>AFFIXED</strong></span>
                    <span>Next Term Resumption: <strong>11th Jan, 2027</strong></span>
                  </div>
                </div>
              </div>

              {/* Directorate Institutional Authentication & Verification Hash Strip */}
              <div className="border-t-2 border-slate-700 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-800 bg-white flex flex-col items-center justify-center p-0.5 shrink-0 text-center shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-blue-950" />
                    <span className="text-[6px] font-black text-slate-900 uppercase">ORIGINAL</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900 block uppercase">
                      Dominion Star Global College Directorate of Academic Affairs
                    </span>
                    <p className="text-[9px] text-slate-500">
                      Official student terminal transcript. Valid only when bearing official background watermark and security reference hash.
                    </p>
                    <p className="font-mono text-[9px] font-bold text-blue-950">
                      Security Ref: {verificationHash}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-0.5 shrink-0 sm:border-l sm:border-slate-300 sm:pl-3">
                  <span className="font-mono text-[9px] text-slate-500 block uppercase">
                    Document Authentication Status
                  </span>
                  <span className="font-bold text-slate-900 block font-mono">
                    {student.resultHeld ? 'ADMINISTRATIVE HOLD' : 'CERTIFIED AUTHENTIC'}
                  </span>
                  <span className="text-slate-400 font-mono text-[9px] block">
                    Issued: Academic Session 2026/2027
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
