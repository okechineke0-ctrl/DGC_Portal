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
import { StudentProfile, SchoolClassDefinition } from '../types';
import { CURRENT_SESSION, CURRENT_TERM, SCHOOL_NAME, SCHOOL_MOTTO, SCHOOL_LOCATION } from '../data/mockData';

interface StudentPortalViewProps {
  currentStudent: StudentProfile;
  allStudents?: StudentProfile[];
  classes?: SchoolClassDefinition[];
  onSelectStudent?: (student: StudentProfile) => void;
  activeSubTab?: 'results' | 'analytics' | 'bursary' | 'report_card' | 'performance' | 'attendance' | 'fees';
}

type TabKey = 'report_card' | 'performance' | 'attendance' | 'fees';

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentStudent,
  allStudents,
  classes,
  onSelectStudent,
  activeSubTab = 'report_card',
}) => {
  const student = currentStudent;

  // Resolve assigned Form Master dynamically from class arm definition
  const assignedFormMaster = classes?.find((c) => c.name === student.classArm)?.classMaster
    || (student.classArm.startsWith('SS 3') ? 'Engr. K. Okoli' : 'Class Master');

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

  useEffect(() => {
    setActiveTab(getMappedTab(activeSubTab));
  }, [activeSubTab]);

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

  // Attendance weeks breakdown mock
  const ATTENDANCE_WEEKS = Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1;
    return {
      week: weekNum,
      daysPresent: weekNum === 7 ? 4 : 5, // 1 day sick leave in week 7
      daysTotal: 5,
      rate: weekNum === 7 ? 80 : 100,
      days: [
        { day: 'Mon', status: 'Present', time: '07:42 AM' },
        { day: 'Tue', status: 'Present', time: '07:45 AM' },
        { day: 'Wed', status: weekNum === 7 ? 'Excused' : 'Present', time: weekNum === 7 ? 'Medical Exemption' : '07:38 AM' },
        { day: 'Thu', status: 'Present', time: '07:44 AM' },
        { day: 'Fri', status: 'Present', time: '07:40 AM' },
      ],
    };
  });

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
              <span className="text-[10px] text-blue-200 block">58 / 60 Days</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Fees Status</span>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md mt-1 inline-block ${student.feeStatus === 'Cleared' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {student.feeStatus}
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
      {/* 3. CHECK ATTENDANCE VIEW                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance High-Level Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                College Open Days
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                60 Days
              </span>
              <span className="text-[11px] text-slate-500">{CURRENT_TERM} Scheduled Days</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">
                Days Present
              </span>
              <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                58 Days
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">Punctual & Certified</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase block">
                Days Absent
              </span>
              <span className="text-2xl font-black text-amber-800 font-mono mt-1 block">
                2 Days
              </span>
              <span className="text-[11px] text-amber-700 font-medium">Approved Medical Exemption</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-extrabold text-blue-800 uppercase block">
                Attendance Rate
              </span>
              <span className="text-2xl font-black text-blue-950 font-mono mt-1 block">
                {student.attendanceRate}%
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">Meets 75% Requirement</span>
            </div>
          </div>

          {/* Attendance Clearance & Form Master Endorsement */}
          <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-950">
                  Attendance Status: Certified & Cleared
                </h4>
                <p className="text-xs text-emerald-800/90 leading-relaxed mt-0.5">
                  <strong>{student.name}</strong> has maintained a <strong>{student.attendanceRate}%</strong> attendance record for the {CURRENT_TERM}, surpassing the statutory 75% minimum required by the Ministry of Education and College Academic Directorate.
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Class Master</span>
              <span className="text-xs font-bold text-emerald-950">{assignedFormMaster}</span>
            </div>
          </div>

          {/* 12-Week Interactive Roll Call Register */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Weekly Roll Call Register ({CURRENT_TERM})
                </h3>
                <p className="text-xs text-slate-500">
                  Inspection records from Form Teacher morning register (8:00 AM Daily)
                </p>
              </div>

              {/* Week Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                {ATTENDANCE_WEEKS.map((w) => (
                  <button
                    key={w.week}
                    onClick={() => setSelectedWeek(w.week)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedWeek === w.week
                        ? 'bg-blue-950 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Wk {w.week}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Week Detail */}
            {(() => {
              const currentWkData = ATTENDANCE_WEEKS.find((w) => w.week === selectedWeek) || ATTENDANCE_WEEKS[11];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
                    <span className="font-bold text-slate-800">
                      Week {currentWkData.week} Daily Attendance Summary
                    </span>
                    <span className="font-semibold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      {currentWkData.daysPresent} / {currentWkData.daysTotal} Days Present ({currentWkData.rate}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {currentWkData.days.map((d, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 text-xs ${
                          d.status === 'Present'
                            ? 'bg-emerald-50/50 border-emerald-200/80'
                            : 'bg-amber-50/70 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{d.day}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                              d.status === 'Present'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {d.status}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200/50 text-[11px] text-slate-600">
                          <span>Clock-in: <strong className="font-mono">{d.time}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CHECK SCHOOL FEES AND OTHER DUES                                      */}
      {/* ========================================================================= */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                BURSARY CLEARANCE VERIFICATION
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                School Fees & Dues Clearance Status
              </h3>
              <p className="text-xs text-slate-500">
                Official verification of tuition, practical laboratory levies, ICT dues, and other college assessments
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
                  student.feeStatus === 'Cleared'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                Clearance Status: {student.feeStatus}
              </span>
            </div>
          </div>

          {/* Clearance Banner */}
          {student.feeStatus === 'Cleared' ? (
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-emerald-950">
                  Full Bursary Clearance Confirmed
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  All prescribed school fees, laboratory practical dues, and administrative charges for <strong>{student.name}</strong> ({student.admissionNo}) have been fully settled for the {CURRENT_TERM}. No outstanding balance is recorded.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-rose-950">
                  Outstanding Fees Notice
                </h4>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Our bursary records indicate a pending balance. Please resolve any outstanding dues at the Accounts Department to avoid administrative holds on terminal examination reports.
                </p>
              </div>
            </div>
          )}

          {/* Financial Totals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Term Bill</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">₦155,000.00</span>
              <span className="text-[11px] text-slate-500">Tuition & All Assigned Dues</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Amount Cleared & Paid</span>
              <span className="text-2xl font-black text-emerald-950 font-mono mt-1 block">
                {student.feeStatus === 'Cleared' ? '₦155,000.00' : '₦75,000.00'}
              </span>
              <span className="text-[11px] text-emerald-700">Central Bursary Receipt Verified</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Balance</span>
              <span className={`text-2xl font-black font-mono mt-1 block ${student.feeStatus === 'Cleared' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {student.feeStatus === 'Cleared' ? '₦0.00' : '₦80,000.00'}
              </span>
              <span className="text-[11px] text-slate-500">
                {student.feeStatus === 'Cleared' ? 'Fully Cleared for Term' : 'Payment Required'}
              </span>
            </div>
          </div>

          {/* Itemized Schedule of Dues */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-100/70 p-3.5 font-bold text-slate-800 border-b border-slate-200 flex items-center justify-between">
              <span>Itemized College Dues & Assessments Breakdown</span>
              <span className="text-[11px] text-slate-500">Class: {student.classArm}</span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block">1. Tuition & Academic Instruction</span>
                  <span className="text-[11px] text-slate-500">Core academic curriculum & teacher instruction</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₦85,000.00</span>
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block">2. Science & Practical Laboratories Due</span>
                  <span className="text-[11px] text-slate-500">Physics, Chemistry & Biology laboratory materials</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₦15,000.00</span>
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block">3. ICT & Online Portal Maintenance</span>
                  <span className="text-[11px] text-slate-500">Computer studies, internet access & database</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₦10,000.00</span>
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block">4. Campus Development & Facilities Levy</span>
                  <span className="text-[11px] text-slate-500">Library, academic facilities & sports arena</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₦25,000.00</span>
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block">5. Medical Clinic & Sanitation Due</span>
                  <span className="text-[11px] text-slate-500">College infirmary & student healthcare services</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₦15,000.00</span>
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block">6. Parents-Teachers Association (PTA) Term Levy</span>
                  <span className="text-[11px] text-slate-500">Approved general council welfare assessment</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₦5,000.00</span>
              </div>
            </div>
          </div>

          {/* Clearance Certificate Footer & Print Receipt Action */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-600">
            <div>
              <span className="font-bold text-slate-800 block">Official Bursary Endorsement</span>
              <span className="text-[11px] text-slate-500">Receipt Ref: DGC-BUR-2026-0891 · Certified by Accounts Office</span>
            </div>
            <button
              onClick={() => alert(`Official Bursary Clearance Certificate generated for ${student.name} (${student.admissionNo}).`)}
              className="px-4 py-2 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900 transition-colors shadow-2xs flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Clearance Certificate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
