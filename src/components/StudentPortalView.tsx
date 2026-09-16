import React, { useState, useEffect } from 'react';
import {
  FileText,
  BarChart3,
  Calendar,
  CreditCard,
  Printer,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CalendarCheck,
  Check,
  XCircle,
  FileCheck,
  Copy,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { DGCLogo } from './DGCLogo';
import { StudentProfile, SchoolClassDefinition, CollegeFeeSchedule, StudentAttendanceFullData } from '../types';
import { CURRENT_SESSION, CURRENT_TERM, SCHOOL_NAME, SCHOOL_MOTTO, SCHOOL_LOCATION } from '../data/mockData';

interface StudentPortalViewProps {
  currentStudent: StudentProfile;
  allStudents?: StudentProfile[];
  classes?: SchoolClassDefinition[];
  onSelectStudent?: (student: StudentProfile) => void;
  activeSubTab?: 'results' | 'analytics' | 'bursary' | 'report_card' | 'performance' | 'attendance' | 'fees';
  feeSchedule?: CollegeFeeSchedule;
}

type TabKey = 'report_card' | 'performance' | 'attendance' | 'fees';

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentStudent,
  allStudents,
  classes,
  onSelectStudent,
  activeSubTab = 'report_card',
  feeSchedule: initialFeeSchedule,
}) => {
  // Graceful empty state when no student profile is selected
  if (!currentStudent || !currentStudent.id) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mx-auto shadow-inner">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-serif-title text-slate-900">
            No Student Profile Selected
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            No student profile is currently loaded. Please sign in with your official College Registration Number, or an administrator can admit and register students in the Administration Dashboard.
          </p>
        </div>
      </div>
    );
  }

  const student = currentStudent;

  // Resolve assigned Form Master dynamically from class arm definition
  const assignedFormMaster = classes?.find((c) => c.name === student.classArm)?.classMaster
    || 'Class Master';

  // Map incoming tab props to standard keys
  const getMappedTab = (tab: string): TabKey => {
    if (tab === 'results' || tab === 'report_card') return 'report_card';
    if (tab === 'analytics' || tab === 'performance') return 'performance';
    if (tab === 'attendance') return 'attendance';
    if (tab === 'bursary' || tab === 'fees') return 'fees';
    return 'report_card';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getMappedTab(activeSubTab));
  const [selectedWeek, setSelectedWeek] = useState<number>(12);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [feeSchedule, setFeeSchedule] = useState<CollegeFeeSchedule | null>(
    initialFeeSchedule || null
  );
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceFullData | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(getMappedTab(activeSubTab));
  }, [activeSubTab]);

  useEffect(() => {
    if (initialFeeSchedule) {
      setFeeSchedule(initialFeeSchedule);
    } else {
      fetch('/api/fees/schedule')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.totalFee) {
            setFeeSchedule(data);
          }
        })
        .catch(() => {});
    }
  }, [initialFeeSchedule]);

  // Fetch real persistent attendance records from Cloud Firestore via API
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingAttendance(true);
    fetch(`/api/attendance/student/${encodeURIComponent(student.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isSubscribed) return;
        if (data && data.success) {
          setStudentAttendance(data);
          if (data.weeks && data.weeks.length > 0) {
            setSelectedWeek(data.weeks.length);
          }
        }
      })
      .catch((err) => console.error('[Attendance Error] Failed to fetch verified student attendance:', err))
      .finally(() => {
        if (isSubscribed) setIsLoadingAttendance(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [student.id]);

  // Subject Chart Data
  const chartData = (student.subjects || []).map((sub) => ({
    name: sub.name.length > 12 ? sub.name.substring(0, 11) + '…' : sub.name,
    fullName: sub.name,
    score: sub.total,
    ca: sub.caTotal ?? ((sub.homework ?? 8) + (sub.test1 ?? 8) + (sub.test2 ?? 8) + (sub.practical ?? sub.quiz ?? 8)),
    exam: sub.exam,
    grade: sub.grade,
  }));

  // Calculations for subject performance overview
  const distinctionCount = (student.subjects || []).filter((s) => s.grade === 'A1' || s.grade === 'B2').length;
  const creditCount = (student.subjects || []).filter((s) => s.grade.startsWith('C') || s.grade === 'B3').length;
  const highestSubject = (student.subjects || []).reduce((prev, curr) => (curr.total > (prev?.total || 0) ? curr : prev), (student.subjects || [])[0]);

  const handlePrintReportCard = () => {
    if (student.resultHeld) {
      alert(`The report card for ${student.name} is currently withheld by the Administration. Clearance from the Bursary is required.`);
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* RESULT HELD NOTICE (If result is on administrative hold) */}
      {student.resultHeld && (
        <div className="p-5 sm:p-6 rounded-2xl bg-rose-950 text-white border-2 border-rose-600/70 shadow-lg space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-rose-400" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-rose-600 text-white">
                  Administrative Notice
                </span>
                <span className="text-xs text-rose-300">Office of the College Bursar & Administration</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-title text-white">
                Official Terminal Report Card Withheld
              </h3>
              <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                The terminal result for <strong>{student.name}</strong> ({student.admissionNo}, {student.classArm}) is currently locked pending school fees clearance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-black/40 rounded-xl border border-rose-500/30">
              <span className="text-[10px] font-bold uppercase text-rose-300 block">Stated Reason:</span>
              <span className="text-white font-bold mt-0.5 block">{student.holdReason || 'Outstanding Bursary Tuition Fees'}</span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-rose-500/30">
              <span className="text-[10px] font-bold uppercase text-rose-300 block">Required Action:</span>
              <span className="text-white font-medium mt-0.5 block">Clear dues at College Accounts Office</span>
            </div>
          </div>
        </div>
      )}

      {/* Mature Secondary School Student Identity Header Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none">
          <DGCLogo size="xl" showText={false} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Student Profile Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 text-amber-300 border-2 border-white/20 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 overflow-hidden">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                student.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950">
                  {student.classArm}
                </span>
                <span className="text-xs text-blue-200">
                  {student.stream} Stream · Secondary Education
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
                {student.name}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-200/90 mt-1">
                <span>Admission No: <strong className="text-white font-mono">{student.admissionNo}</strong></span>
                <span>•</span>
                <span>Form Master: <strong className="text-white">{assignedFormMaster}</strong></span>
              </div>
            </div>
          </div>

          {/* Academic Indicators */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-6 self-stretch md:self-auto justify-around">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Term Average</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {student.resultHeld ? '—' : `${student.termGpa}%`}
              </span>
              <span className="text-[10px] text-emerald-300 font-bold block">
                {student.resultHeld ? 'Locked' : student.termRank}
              </span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Attendance</span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {student.attendanceRate}%
              </span>
              <span className="text-[10px] text-blue-200 block">
                {student.timesPresent !== undefined ? student.timesPresent : Math.round(((student.attendanceRate ?? 95) / 100) * (student.timesSchoolOpened || 60))} / {student.timesSchoolOpened || 60} Days
              </span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Fees Status</span>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md mt-1 inline-block ${student.feeStatus === 'Cleared' ? 'bg-white text-blue-950 shadow-xs' : 'bg-blue-900/60 text-white border border-blue-700'}`}>
                {student.feeStatus === 'Cleared' ? 'PAID' : 'NOT PAID'}
              </span>
            </div>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-200">
            <Calendar className="w-3.5 h-3.5 text-blue-300" />
            <span>Academic Session: {CURRENT_SESSION} · {CURRENT_TERM}</span>
          </div>

          <button
            onClick={handlePrintReportCard}
            className="px-4 py-2 rounded-xl bg-white text-blue-950 font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-900" />
            <span>{student.resultHeld ? 'Report Card Locked' : 'Print Official Report Card'}</span>
          </button>
        </div>
      </div>

      {/* Main Student Portal Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-fit overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('report_card')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'report_card'
              ? 'bg-white text-blue-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Print Report Card</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'performance'
              ? 'bg-white text-blue-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Check Subject Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'attendance'
              ? 'bg-white text-blue-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Check Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'fees'
              ? 'bg-white text-blue-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Check School Fees & Dues</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRINT REPORT CARD VIEW                                                */}
      {/* ========================================================================= */}
      {activeTab === 'report_card' && (
        <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 ${student.resultHeld ? 'relative' : ''}`}>
          {student.resultHeld && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-20 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-3 shadow-xs">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-xl font-serif-title">Report Card Locked</h4>
              <p className="text-xs text-slate-600 max-w-md mt-1.5 leading-relaxed">
                The academic report card for <strong>{student.name}</strong> has been withheld by the Administration. To unlock and view detailed scores, please complete bursary clearance.
              </p>
              <div className="mt-4 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold">
                Stated Hold Reason: {student.holdReason || 'Outstanding Fees Clearance'}
              </div>
            </div>
          )}

          {/* Broadsheet Formal Heading */}
          <div className="text-center pb-5 border-b border-slate-200 space-y-1">
            <div className="flex items-center justify-center gap-3">
              <DGCLogo size="md" showText={false} />
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-blue-950 tracking-tight">
                  {SCHOOL_NAME}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  {SCHOOL_LOCATION} · Secondary Campus
                </p>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  MOTTO: {SCHOOL_MOTTO}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                TERMINAL CONTINUOUS ASSESSMENT & EXAMINATION REPORT SHEET
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-950 font-bold rounded-md border border-blue-100">
                  {CURRENT_SESSION} Academic Session
                </span>
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-900 font-bold rounded-md border border-amber-100">
                  {CURRENT_TERM}
                </span>
              </div>
            </div>
          </div>

          {/* Student Broadsheet Biodata Matrix with Official Uniform Passport */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs flex-1">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Name</span>
                <span className="font-bold text-slate-900 block">{student.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Admission No</span>
                <span className="font-mono font-bold text-slate-900 block">{student.admissionNo}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Class Arm</span>
                <span className="font-bold text-blue-950 block">{student.classArm}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Term GPA / Position</span>
                <span className="font-bold text-emerald-800 block">
                  {student.termGpa}% ({student.termRank})
                </span>
              </div>
            </div>

            {/* Official Uniform Passport Photo on Report Card */}
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
                  DOMINION STARS GLOBAL COLLEGE
                </div>
              </div>
            </div>
          </div>

          {/* Official Scores Table with 40% CA + 60% Exam */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3 px-3">Subject Name</th>
                  <th className="py-3 px-2">Code</th>
                  <th className="py-3 px-2 text-center" title="Continuous Assessment: Homework out of 10">HW (10)</th>
                  <th className="py-3 px-2 text-center" title="Continuous Assessment: Test 1 out of 10">Test 1 (10)</th>
                  <th className="py-3 px-2 text-center" title="Continuous Assessment: Test 2 out of 10">Test 2 (10)</th>
                  <th className="py-3 px-2 text-center" title="Continuous Assessment: Practical out of 10">Practical (10)</th>
                  <th className="py-3 px-2 text-center bg-blue-50/70 text-blue-950 font-extrabold">CA (40)</th>
                  <th className="py-3 px-2 text-center">Exam (60)</th>
                  <th className="py-3 px-2 text-center font-bold text-slate-900 bg-slate-100/60">Total (100)</th>
                  <th className="py-3 px-2 text-center">Grade</th>
                  <th className="py-3 px-3 text-right">Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(student.subjects || []).map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3 px-2 font-mono text-slate-400 text-[11px]">{sub.code}</td>
                    <td className="py-3 px-2 text-center font-mono">{sub.homework ?? 8}</td>
                    <td className="py-3 px-2 text-center font-mono">{sub.test1 ?? 8}</td>
                    <td className="py-3 px-2 text-center font-mono">{sub.test2 ?? 8}</td>
                    <td className="py-3 px-2 text-center font-mono text-blue-950 font-semibold">{sub.practical ?? sub.quiz ?? 8}</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-blue-900 bg-blue-50/30">
                      {sub.caTotal ?? ((sub.homework ?? 8) + (sub.test1 ?? 8) + (sub.test2 ?? 8) + (sub.practical ?? sub.quiz ?? 8))}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-semibold text-slate-800">{sub.exam}</td>
                    <td className="py-3 px-2 text-center font-mono font-black text-blue-950 text-sm bg-slate-100/40">
                      {sub.total}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono font-black text-[11px] ${
                          sub.grade === 'A1'
                            ? 'bg-blue-900 text-white'
                            : sub.grade.startsWith('B')
                            ? 'bg-blue-100 text-blue-900'
                            : sub.grade.startsWith('C')
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700 text-[11px]">
                      {sub.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form Teacher & Principal Evaluation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                Class Master's Evaluation
              </span>
              <p className="text-slate-800 font-medium italic">
                "{student.formMasterRemark || (student.termGpa >= 75 ? 'An exceptional, highly focused student who demonstrates academic brilliance and moral discipline. Recommended for academic honors.' : 'A good and regular student. Encouraged to allocate more time to continuous assessment revisions.')}"
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                <span>Class Master: <strong>{assignedFormMaster}</strong></span>
                <span className="text-emerald-700 font-bold">Signature: Verified</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-blue-900 block">
                Principal & Academic Board Endorsement
              </span>
              <p className="text-blue-950 font-medium italic">
                "{student.resultHeld ? 'Result held by administrative directive.' : 'Result approved and certified by the College Academic Directorate. Promoted in good standing.'}"
              </p>
              <div className="flex items-center justify-between text-[10px] text-blue-800 pt-2 border-t border-blue-200/60 mt-2">
                <span>College Seal: <strong>AFFIXED</strong></span>
                <span>Next Term Resumption: <strong>11th Jan, 2027</strong></span>
              </div>
            </div>
          </div>

          {/* Print Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Official document issued by Dominion Stars Global College.
            </span>
            <button
              onClick={handlePrintReportCard}
              className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Terminal Report Card</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHECK PERFORMANCE IN ALL ASSIGNED SUBJECTS                           */}
      {/* ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                Assigned Subjects
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {student.subjects.length}
              </span>
              <span className="text-[11px] text-slate-500">Approved by Academic Board</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">
                Distinctions (A1 & B2)
              </span>
              <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                {distinctionCount}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">Above 70% threshold</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold text-blue-800 uppercase block">
                Overall Average
              </span>
              <span className="text-2xl font-black text-blue-950 font-mono mt-1 block">
                {student.termGpa}%
              </span>
              <span className="text-[11px] text-blue-700 font-semibold">{student.termRank} in Class</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase block">
                Highest Subject
              </span>
              <span className="text-xl font-black text-slate-900 font-mono mt-1 truncate block">
                {highestSubject ? `${highestSubject.name} (${highestSubject.total}%)` : '—'}
              </span>
              <span className="text-[11px] text-slate-500">Grade: {highestSubject?.grade || '—'}</span>
            </div>
          </div>

          {/* Mastery Chart vs WAEC Distinction */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  SUBJECT PERFORMANCE OVERVIEW
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  Assigned Subjects Standing & Benchmarks
                </h3>
                <p className="text-xs text-slate-500">
                  Total scores plotted against Distinction benchmark (75%) and Pass mark (50%)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-900" />
                  <span className="text-slate-600 font-medium">Student Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Distinction (75%)</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-lg border border-slate-800">
                            <p className="font-bold text-amber-300">{d.fullName}</p>
                            <p>Total Score: <strong className="font-mono">{d.score}%</strong></p>
                            <p>Grade: <strong>{d.grade}</strong></p>
                            <p className="text-[10px] text-slate-300">CA: {d.ca}/40 · Exam: {d.exam}/60</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Distinction (75%)', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Credit (50%)', fill: '#f59e0b', fontSize: 10 }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 75 ? '#1e3a8a' : entry.score >= 60 ? '#0284c7' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assigned Subjects Matrix */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Performance in All Assigned Subjects
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous Assessment Breakdown (Homework, Tests 1 & 2, Practical) + Terminal Examination
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                {student.subjects.length} Subjects Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.subjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-2xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {sub.code}
                        </span>
                        <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                          CA /40 + Exam /60
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {sub.name}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-blue-950 block">
                        {sub.total}%
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          sub.grade === 'A1'
                            ? 'bg-blue-900 text-white'
                            : sub.grade.startsWith('B')
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {sub.grade} · {sub.remark}
                      </span>
                    </div>
                  </div>

                  {/* Component mini-grid */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-bold">HW (10)</span>
                      <span className="font-mono font-bold text-slate-800">{sub.homework ?? 8}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-bold">Test 1 (10)</span>
                      <span className="font-mono font-bold text-slate-800">{sub.test1 ?? 8}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-bold">Test 2 (10)</span>
                      <span className="font-mono font-bold text-slate-800">{sub.test2 ?? 8}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-bold">Practical (10)</span>
                      <span className="font-mono font-bold text-blue-900">{sub.practical ?? sub.quiz ?? 8}</span>
                    </div>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span>Progress vs 100% Mark</span>
                      <span>Total: {sub.total}/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.total >= 75 ? 'bg-blue-900' : sub.total >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, sub.total)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CHECK ATTENDANCE VIEW (Mature White & Blue Real Cloud Attendance)      */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (() => {
        const openDays = studentAttendance?.summary?.openDays ?? (student.timesSchoolOpened ?? 0);
        const presentDays = studentAttendance?.summary?.presentDays ?? (student.timesPresent ?? 0);
        const absentDays = studentAttendance?.summary?.absentDays ?? Math.max(0, openDays - presentDays);
        const punctualDays = studentAttendance?.summary?.punctualDays ?? presentDays;
        const lateDays = studentAttendance?.summary?.lateDays ?? 0;
        const rate = openDays > 0 ? (studentAttendance?.summary?.attendanceRate ?? student.attendanceRate ?? 100) : 100;
        const isCleared = rate >= 75;
        const weeks = studentAttendance?.weeks || [];
        const currentWkData = weeks.length > 0
          ? (weeks.find((w) => w.week === selectedWeek) || weeks[weeks.length - 1])
          : null;
        const recentLogs = studentAttendance?.recentLogs || [];

        return (
          <div className="space-y-6" id="student-portal-attendance-container">
            {/* Top Toolbar / Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  <CalendarCheck className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Official College Attendance Transcript
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-950 border border-blue-200 font-mono">
                      {student.session} · {student.term}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Synchronized live with {SCHOOL_NAME} Cloud Firestore roll call register
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadingAttendance(true);
                    fetch(`/api/attendance/student/${encodeURIComponent(student.id)}`)
                      .then((res) => (res.ok ? res.json() : null))
                      .then((data) => {
                        if (data && data.success) {
                          setStudentAttendance(data);
                          if (data.weeks && data.weeks.length > 0) {
                            setSelectedWeek(data.weeks.length);
                          }
                        }
                      })
                      .finally(() => setIsLoadingAttendance(false));
                  }}
                  className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  id="refresh-student-attendance-btn"
                >
                  <span>{isLoadingAttendance ? 'Syncing...' : '↻ Refresh Roll'}</span>
                </button>
              </div>
            </div>

            {/* Attendance High-Level Metrics (Mature White & Blue) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">
                  College Open Days
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                  {openDays} {openDays === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {openDays > 0 ? `${CURRENT_TERM} Recorded` : 'Awaiting First Roll Call'}
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase block tracking-wider">
                  Days Present
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-blue-950 font-mono">
                    {presentDays} {presentDays === 1 ? 'Day' : 'Days'}
                  </span>
                  {lateDays > 0 && (
                    <span className="text-[11px] font-bold text-blue-800">
                      ({lateDays} Late)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-blue-700 font-medium">Certified on Morning Register</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block tracking-wider">
                  Days Absent
                </span>
                <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">
                  {absentDays} {absentDays === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {absentDays === 0 ? 'Zero Unexcused Absences' : 'Leave / Excuse Noted'}
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase block tracking-wider">
                  Certified Rate
                </span>
                <span className="text-2xl font-black text-blue-950 font-mono mt-1 block">
                  {rate}%
                </span>
                <span className="text-[11px] text-blue-800 font-bold">
                  {openDays === 0 ? 'Clearance Pending First Roll' : isCleared ? 'Surpasses 75% Requirement' : 'Below 75% Minimum'}
                </span>
              </div>
            </div>

            {/* Attendance Clearance & Form Master Endorsement Banner */}
            <div className="p-5 bg-blue-50/70 rounded-3xl border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-blue-950">
                      Institutional Roll Certification: {openDays === 0 ? 'Awaiting First Term Register' : isCleared ? 'Cleared & Verified' : 'Under Advisory Review'}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-950 text-white font-mono">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mt-0.5 max-w-2xl">
                    {openDays > 0 ? (
                      <>
                        <strong>{student.name}</strong> holds an official cumulative attendance rate of <strong>{rate}%</strong> for the {CURRENT_TERM}. This record is certified by the Form Master and recorded in the college database, satisfying the Ministry of Education standard.
                      </>
                    ) : (
                      <>
                        Official daily morning attendance for <strong>{student.name}</strong> is recorded by the assigned Form Master ({assignedFormMaster}) during the morning roll call. All recorded registers are verified into Cloud Firestore in real time.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="shrink-0 sm:text-right border-t sm:border-t-0 border-blue-200 pt-2 sm:pt-0">
                <span className="text-[10px] uppercase font-bold text-blue-900 block">Class Form Master</span>
                <span className="text-xs font-bold text-blue-950 block">{assignedFormMaster}</span>
                <span className="text-[10px] text-blue-700 font-medium">{SCHOOL_NAME}</span>
              </div>
            </div>

            {/* If no attendance records have been logged yet */}
            {weeks.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mx-auto border border-blue-200 shadow-xs">
                  <Calendar className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900">
                    No Daily Roll Call Records Logged Yet
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The Form Master ({assignedFormMaster}) has not yet certified morning roll calls for <strong>{student.classArm}</strong>. As soon as the teacher marks attendance in the Staff Dashboard, real-time clock-in times and weekly attendance percentages will display here automatically.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <span>Enrolled Class:</span>
                  <span className="font-bold text-blue-950">{student.classArm}</span>
                  <span>·</span>
                  <span>Admission No:</span>
                  <span className="font-mono font-bold text-slate-800">{student.admissionNo}</span>
                </div>
              </div>
            ) : (
              /* Real Weekly Roll Call Register */
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Weekly Morning Roll Call Register ({CURRENT_TERM})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Direct transcript from Form Teacher morning register (8:00 AM Daily)
                    </p>
                  </div>

                  {/* Week Switcher with mature white and blue buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                    {weeks.map((w) => (
                      <button
                        key={w.week}
                        onClick={() => setSelectedWeek(w.week)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          (currentWkData && currentWkData.week === w.week)
                            ? 'bg-blue-950 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-900'
                        }`}
                      >
                        Wk {w.week}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Week Detail Bar */}
                {currentWkData && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-950">
                          Week {currentWkData.week} Daily Roll Call Record
                        </span>
                        {currentWkData.startDate && (
                          <span className="text-[11px] font-mono text-blue-800">
                            ({currentWkData.startDate} ~ {currentWkData.endDate})
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-white bg-blue-950 px-3 py-1 rounded-xl text-xs self-start sm:self-center shadow-2xs">
                        {currentWkData.daysPresent} of {currentWkData.daysTotal} Days Present ({currentWkData.rate}%)
                      </span>
                    </div>

                    {/* Daily Cards in Mature White & Blue */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {currentWkData.days.map((d: any, i: number) => {
                        const isPresent = d.status === 'Present';
                        const isLate = d.status === 'Late';
                        const isExcused = d.status === 'Excused';
                        const isAbsent = d.status === 'Absent';

                        return (
                          <div
                            key={i}
                            className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2.5 text-xs transition-all ${
                              isPresent
                                ? 'bg-white border-blue-200/90 shadow-2xs'
                                : isLate
                                ? 'bg-blue-50/50 border-blue-300 shadow-2xs'
                                : isExcused
                                ? 'bg-white border-blue-300 shadow-2xs'
                                : 'bg-slate-50 border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900 block text-sm">{d.day}</span>
                                {d.date && (
                                  <span className="text-[10px] text-slate-500 font-mono">{d.date}</span>
                                )}
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                                  isPresent
                                    ? 'bg-blue-950 text-white'
                                    : isLate
                                    ? 'bg-blue-800 text-white'
                                    : isExcused
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700 text-white'
                                }`}
                              >
                                {d.status}
                              </span>
                            </div>

                            <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px]">
                              <div className="flex items-center justify-between text-slate-600">
                                <span>Clock-in:</span>
                                <strong className="font-mono text-slate-900">{d.time || '07:45 AM'}</strong>
                              </div>
                              {d.remarks && (
                                <p className="text-[10px] text-blue-900 font-medium italic pt-0.5 truncate" title={d.remarks}>
                                  "{d.remarks}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cloud Firestore Historical Roll Call Audit */}
            {recentLogs.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recent Roll Entries Logged in Cloud Database
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verifiable audit trail from Form Master daily submissions
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold rounded-xl self-start sm:self-center">
                    {recentLogs.length} Verified Entries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Session Period</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Clock-in Time</th>
                        <th className="py-2.5 px-3">Teacher Observation / Notes</th>
                        <th className="py-2.5 px-3 text-right">Certified By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {log.date}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {log.sessionPeriod || 'Morning Assembly (8:00 AM)'}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                log.status === 'Present'
                                  ? 'bg-blue-950 text-white'
                                  : log.status === 'Late'
                                  ? 'bg-blue-800 text-white'
                                  : log.status === 'Excused'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-700 text-white'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">
                            {log.time}
                          </td>
                          <td className="py-3 px-3 text-slate-700 italic">
                            {log.remarks ? `"${log.remarks}"` : 'Standard inspection'}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-800">
                            {log.markedBy || assignedFormMaster}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 4. CHECK SCHOOL FEES AND OTHER DUES (Mature White & Blue Bursary Oversight)*/}
      {/* ========================================================================= */}
      {activeTab === 'fees' && (() => {
        const totalTermBill = feeSchedule?.totalFee ?? 155000;
        const isPaid = student.feeStatus === 'Cleared';
        const amountPaid = isPaid ? totalTermBill : (student.amountPaid ?? Math.round(totalTermBill * 0.45));
        const outstandingBalance = isPaid ? 0 : Math.max(0, totalTermBill - amountPaid);

        const handleCopyAccount = () => {
          if (feeSchedule?.bankDetails.accountNumber) {
            navigator.clipboard.writeText(feeSchedule.bankDetails.accountNumber);
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2500);
          }
        };

        return (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6" id="student-portal-fees-container">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold tracking-wider text-blue-900 uppercase">
                  BURSARY & SCHOOL FEES OVERSIGHT
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  Term Fee Obligation & Clearance Record
                </h3>
                <p className="text-xs text-slate-500">
                  Official college schedule of tuition, project levies, and verified bursary standing
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isPaid
                      ? 'bg-blue-950 text-white border-blue-900 shadow-xs'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                  id="student-clearance-status-badge"
                >
                  Clearance Status: {isPaid ? 'PAID' : 'NOT PAID'}
                </span>
              </div>
            </div>

            {/* Clearance Executive Notice Card */}
            {isPaid ? (
              <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-blue-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-blue-950">
                    Bursary Clearance Verified (Paid in Full)
                  </h4>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    All prescribed school fees, tuition, project fees, and college dues for <strong>{student.name}</strong> ({student.admissionNo}) have been fully settled and endorsed for {CURRENT_TERM}. No outstanding balance is recorded on your portal ledger.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-300 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5 text-blue-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    Payment Awaiting Clearance (Not Paid)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our bursary records indicate an outstanding balance of <strong>₦{outstandingBalance.toLocaleString()}</strong>. Please remit the remaining term dues to the college bank accounts detailed below or present your bank teller to the Accounts Office for prompt marking as Paid.
                  </p>
                </div>
              </div>
            )}

            {/* Financial Summary Cards (Mature White & Blue) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Fees You Will Pay
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                  ₦{totalTermBill.toLocaleString()}.00
                </span>
                <span className="text-[11px] text-slate-500">Tuition, Project Fee & Prescribed Dues</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 shadow-2xs">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                  Amount Cleared & Paid
                </span>
                <span className="text-2xl font-black text-blue-950 font-mono mt-1 block">
                  ₦{amountPaid.toLocaleString()}.00
                </span>
                <span className="text-[11px] text-blue-800">
                  {isPaid ? 'Bursary Clearance Endorsed' : 'Part Payment Credited'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Outstanding Balance
                </span>
                <span className={`text-2xl font-black font-mono mt-1 block ${isPaid ? 'text-blue-950' : 'text-slate-900'}`}>
                  ₦{outstandingBalance.toLocaleString()}.00
                </span>
                <span className="text-[11px] text-slate-500">
                  {isPaid ? 'Zero Balance · Fully Settled' : 'Payment Required'}
                </span>
              </div>
            </div>

            {/* Itemized Schedule of Prescribed College Fees (What You Will Pay) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
              <div className="bg-slate-50 p-4 font-bold text-blue-950 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-bold block text-blue-950">Official Schedule of Prescribed Fees</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Configured by College Administration · Class: {student.classArm}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule Total</span>
                  <span className="text-sm font-black font-mono text-blue-950">₦{totalTermBill.toLocaleString()}.00</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 bg-white">
                {/* Base School Tuition Fee */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Base Tuition & School Fee</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-950 border border-blue-200">
                        Primary Instruction
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Core academic curriculum, instructor allocations, and classroom teaching
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₦{(feeSchedule?.baseTuition ?? 85000).toLocaleString()}.00
                  </span>
                </div>

                {/* Additional Fees Input by Administrator (e.g. Project Fee, Science Lab, etc.) */}
                {feeSchedule?.otherFees && feeSchedule.otherFees.length > 0 ? (
                  feeSchedule.otherFees.map((fee, idx) => (
                    <div key={fee.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{fee.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {fee.category || 'College Assessment'}
                          </span>
                        </div>
                        {fee.description && (
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {fee.description}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ₦{fee.amount.toLocaleString()}.00
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                      <div>
                        <span className="font-bold text-slate-900 block">Project & Practical Fee</span>
                        <span className="text-[11px] text-slate-500">Term academic project kits & laboratory investigations</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">₦15,000.00</span>
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                      <div>
                        <span className="font-bold text-slate-900 block">ICT & College Database Maintenance</span>
                        <span className="text-[11px] text-slate-500">Computer laboratory sessions & portal hosting</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">₦10,000.00</span>
                    </div>
                  </>
                )}

                {/* Total Bill Footer */}
                <div className="p-4 bg-slate-50/80 flex items-center justify-between border-t border-slate-200 font-bold">
                  <span className="text-slate-900 text-xs uppercase tracking-wider">
                    Total Prescribed Term Dues
                  </span>
                  <span className="font-mono text-base font-black text-blue-950">
                    ₦{totalTermBill.toLocaleString()}.00
                  </span>
                </div>
              </div>
            </div>

            {/* Official College Bank Account Remittance Details */}
            {feeSchedule?.bankDetails && (
              <div className="p-5 bg-white rounded-2xl border border-blue-900/20 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
                      OFFICIAL REMITTANCE ACCOUNT
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      College Designated Bank Details
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-950 border border-blue-200 rounded-lg text-[10px] font-bold">
                    Official Bursary Channel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Bank Name</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {feeSchedule.bankDetails.bankName}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Number</span>
                      <span className="font-mono font-black text-blue-950 text-base mt-0.5 block">
                        {feeSchedule.bankDetails.accountNumber}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyAccount}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedAccount ? <Check className="w-4 h-4 text-blue-950" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Name</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                      {feeSchedule.bankDetails.accountName}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                  <strong>Remittance Narration:</strong> Please use your official College Registration Number (<code>{student.admissionNo}</code>) as the payment description or transaction remarks.
                </div>
              </div>
            )}

            {/* Clearance Certificate Footer & Print Receipt Action */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-600">
              <div>
                <span className="font-bold text-slate-800 block">Official Bursary Endorsement</span>
                <span className="text-[11px] text-slate-500">
                  Receipt Ref: DGC-BUR-2026-{(student.admissionNo || '000').replace(/[^0-9]/g, '')} · Certified by Administration Office
                </span>
              </div>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
                id="student-print-clearance-btn"
              >
                <Printer className="w-3.5 h-3.5 text-blue-300" />
                <span>Print Fee Schedule & Clearance</span>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
