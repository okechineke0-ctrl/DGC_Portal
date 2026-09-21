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
  Search,
  Grid,
  Table as TableIcon,
  Layers,
  UserCheck,
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
import { getSubjectCategory, getSubjectCode, calculateGrade, computeCaTotal, DEFAULT_FEE_SCHEDULE } from '../data/originalData';
import { StudentReportCardModal } from './StudentReportCardModal';
import { formatStudentShortName } from '../utils/formatters';

interface StudentPortalViewProps {
  currentStudent: StudentProfile;
  allStudents?: StudentProfile[];
  classes?: SchoolClassDefinition[];
  onSelectStudent?: (student: StudentProfile) => void;
  activeSubTab?: 'results' | 'analytics' | 'bursary' | 'report_card' | 'performance' | 'attendance' | 'fees' | 'subjects' | 'curriculum';
  feeSchedule?: CollegeFeeSchedule;
}

type TabKey = 'report_card' | 'performance' | 'attendance' | 'fees' | 'subjects';

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
    if (tab === 'subjects' || tab === 'curriculum') return 'subjects';
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
  const [selectedAttendanceTerm, setSelectedAttendanceTerm] = useState<string>(
    currentStudent.term || 'First Term'
  );
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceFullData | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(false);

  // States for Assigned Subjects & Curriculum Explorer
  const [subjectSearch, setSubjectSearch] = useState<string>('');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<string>('ALL');
  const [subjectViewMode, setSubjectViewMode] = useState<'cards' | 'table'>('cards');

  // Resolve class curriculum & assigned subject teachers from the class arm definition
  const classDef = classes?.find((c) => c.name === student.classArm);
  const classCurriculum = classDef?.curriculumSubjects || [];
  const subjectTeachers = classDef?.subjectTeachers || {};

  // Build unified, real-time list of assigned subjects with scores and grades
  const resolvedStudentSubjects = React.useMemo(() => {
    const existingMap = new Map<string, any>();
    (student.subjects || []).forEach((s) => {
      existingMap.set(s.name.toLowerCase().trim(), s);
    });

    // Start with class curriculum subjects, then add any additional student subjects
    const allNames: string[] = [...classCurriculum];
    (student.subjects || []).forEach((s) => {
      if (!allNames.some((n) => n.toLowerCase().trim() === s.name.toLowerCase().trim())) {
        allNames.push(s.name);
      }
    });

    // If neither has items yet, fallback to student.subjects or empty
    const finalNames = allNames.length > 0 ? allNames : (student.subjects || []).map((s) => s.name);

    return finalNames.map((subjName) => {
      const existing = existingMap.get(subjName.toLowerCase().trim());
      const code = existing?.code || getSubjectCode(subjName);
      const category = getSubjectCategory(subjName);
      const teacher = subjectTeachers[subjName] || 'Unassigned Instructor';

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

      let grade = '-';
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
        category,
        teacher,
        isAssessed: hasMarks,
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
  }, [student.subjects, classCurriculum, subjectTeachers]);

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
          if (data) {
            const schedule = data.schedule || data;
            setFeeSchedule(schedule);
          }
        })
        .catch(() => {});
    }
  }, [initialFeeSchedule]);

  // Fetch real persistent attendance records from Cloud Firestore via API
  useEffect(() => {
    let isSubscribed = true;

    if (!student?.id) {
      setIsLoadingAttendance(false);
      return;
    }

    setIsLoadingAttendance(true);

    const fallbackAttendance: StudentAttendanceFullData = {
      openDays: student.timesSchoolOpened || 0,
      presentDays: student.timesPresent || 0,
      absentDays: Math.max(0, (student.timesSchoolOpened || 0) - (student.timesPresent || 0)),
      punctualDays: student.timesPresent || 0,
      lateDays: 0,
      excusedDays: 0,
      attendanceRate: student.attendanceRate || 0,
      isCleared: (student.attendanceRate || 0) >= 75 || !student.timesSchoolOpened,
      assignedFormMaster,
      weeks: [],
      recentLogs: [],
      hasAttendance: (student.timesSchoolOpened || 0) > 0,
      message: 'Institutional attendance transcript loaded',
      totalRecords: 0,
      selectedTerm: selectedAttendanceTerm,
      statusNote: 'No attendance yet, your teacher have not started marking attendance',
    };

    fetch(`/api/attendance/student/${encodeURIComponent(student.id)}?term=${encodeURIComponent(selectedAttendanceTerm)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isSubscribed) return;
        if (data && data.success) {
          const attendanceData: StudentAttendanceFullData = {
            openDays: data.summary?.openDays ?? fallbackAttendance.openDays,
            presentDays: data.summary?.presentDays ?? fallbackAttendance.presentDays,
            absentDays: data.summary?.absentDays ?? fallbackAttendance.absentDays,
            punctualDays: data.summary?.punctualDays ?? fallbackAttendance.punctualDays,
            lateDays: data.summary?.lateDays ?? 0,
            excusedDays: data.summary?.excusedDays ?? 0,
            attendanceRate: data.summary?.attendanceRate ?? fallbackAttendance.attendanceRate,
            isCleared: data.summary?.isCleared ?? fallbackAttendance.isCleared,
            assignedFormMaster: data.summary?.assignedFormMaster || assignedFormMaster,
            weeks: data.weeks || [],
            recentLogs: data.recentLogs || [],
            hasAttendance: data.hasAttendance ?? fallbackAttendance.hasAttendance,
            message: data.message || fallbackAttendance.message,
            totalRecords: data.totalRecords ?? 0,
            selectedTerm: data.selectedTerm || selectedAttendanceTerm,
            statusNote: data.summary?.statusNote || fallbackAttendance.statusNote,
          };
          setStudentAttendance(attendanceData);
          if (data.weeks && data.weeks.length > 0) {
            setSelectedWeek(data.weeks.length);
          }
        } else if (isSubscribed) {
          setStudentAttendance(fallbackAttendance);
        }
      })
      .catch((_err) => {
        if (isSubscribed) {
          // Gracefully fallback to student profile record without emitting noisy console errors
          setStudentAttendance(fallbackAttendance);
        }
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingAttendance(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [student.id, student.classArm, selectedAttendanceTerm, assignedFormMaster, student.timesSchoolOpened, student.timesPresent, student.attendanceRate]);

  // Subject Chart Data
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  const liveOpenDays = studentAttendance?.summary?.openDays ?? (student.timesSchoolOpened || 0);
  const livePresentDays = studentAttendance?.summary?.presentDays ?? (student.timesPresent || 0);
  const liveAttendanceRate = liveOpenDays > 0 ? (studentAttendance?.summary?.attendanceRate ?? student.attendanceRate ?? 0) : 0;

  // Assessed vs Unassessed Subjects partition
  const assessedSubjects = (student.subjects || []).filter(
    (sub) =>
      (sub.total !== undefined && sub.total > 0) ||
      (sub.caTotal !== undefined && sub.caTotal > 0) ||
      (sub.exam !== undefined && sub.exam > 0) ||
      (sub.grade && sub.grade !== '-' && sub.grade !== 'Ungraded' && sub.grade !== 'Pending')
  );

  const chartData = assessedSubjects.map((sub) => ({
    name: sub.name.length > 12 ? sub.name.substring(0, 11) + '…' : sub.name,
    fullName: sub.name,
    score: sub.total || 0,
    ca: sub.caTotal ?? ((sub.homework ?? 0) + (sub.test1 ?? 0) + (sub.test2 ?? 0) + (sub.practical ?? sub.quiz ?? 0)),
    exam: sub.exam || 0,
    grade: sub.grade,
  }));

  // Calculations for subject performance overview
  const distinctionCount = assessedSubjects.filter((s) => s.grade === 'A1' || s.grade === 'B2').length;
  const creditCount = assessedSubjects.filter((s) => s.grade.startsWith('C') || s.grade === 'B3').length;
  const highestSubject = assessedSubjects.length > 0
    ? assessedSubjects.reduce((prev, curr) => ((curr.total || 0) > (prev?.total || 0) ? curr : prev), assessedSubjects[0])
    : null;

  const handlePrintReportCard = () => {
    if (student.resultHeld) {
      alert(`The report card for ${student.name} is currently withheld by the Administration. Clearance from the Bursary is required.`);
      return;
    }
    setIsReportCardOpen(true);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* RESULT HELD NOTICE (If result is on administrative hold) */}
      {student.resultHeld && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950 text-white border border-rose-700/80 shadow-sm space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-rose-400" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white">
                  Notice
                </span>
                <span className="text-xs text-rose-300">Bursary & Administration</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-title text-white">
                Official Terminal Report Card Withheld
              </h3>
              <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                The terminal result for <strong>{formatStudentShortName(student.name)}</strong> ({student.admissionNo}, {student.classArm}) is currently locked pending clearance.
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
              <span className="text-white font-medium mt-0.5 block">Clear dues at Accounts Office</span>
            </div>
          </div>
        </div>
      )}

      {/* Mature Student Identity Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 relative overflow-hidden w-full max-w-full min-w-0">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          {/* Student Profile Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 flex items-center justify-center font-bold text-xl shadow-inner shrink-0 overflow-hidden">
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
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-900/80 text-blue-200 border border-blue-700/50">
                  {student.classArm}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {student.stream} Stream · Secondary
                </span>
                {student.feeStatus === 'Cleared' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Tuition: Cleared (Paid)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Tuition: Balance Pending</span>
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold mt-1 text-white tracking-tight">
                {formatStudentShortName(student.name)}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                <span>Admit: <strong className="text-white font-mono">{student.admissionNo}</strong></span>
                <span>•</span>
                {student.admissionYear && (
                  <>
                    <span>
                      Cohort: <strong className="text-amber-300 font-mono">{student.admissionYear}</strong>
                      <span className="text-[11px] text-slate-400 ml-1">
                        ({student.enrollmentType === 'Transfer Student' ? `Transfer at ${student.transferClassJoined || 'Lateral'}` : 'Regular'})
                      </span>
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>Master: <strong className="text-white">{assignedFormMaster}</strong></span>
              </div>
            </div>
          </div>

          {/* Academic Indicators (3-column responsive balanced layout) */}
          <div className="bg-slate-800/90 p-3 sm:p-4 rounded-xl border border-slate-700/80 grid grid-cols-3 divide-x divide-slate-700 self-stretch md:self-auto min-w-[280px] sm:min-w-[340px]">
            <div className="text-center px-2 sm:px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Average</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                {student.resultHeld ? '—' : `${student.termGpa}%`}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block truncate">
                {student.resultHeld ? 'Locked' : student.termRank}
              </span>
            </div>
            <div className="text-center px-2 sm:px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Attendance</span>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                {liveOpenDays > 0 ? `${liveAttendanceRate}%` : '0%'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {liveOpenDays > 0 ? `${livePresentDays}/${liveOpenDays}d` : 'Pending'}
              </span>
            </div>
            <div className="text-center px-2 sm:px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Subjects</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-300 font-mono">
                {resolvedStudentSubjects.length}
              </span>
              <span className="text-[10px] text-blue-400 font-semibold block truncate">
                Assigned
              </span>
            </div>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Session: {CURRENT_SESSION} · {CURRENT_TERM}</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400">Bursary:</span>
              <span className={`font-bold ${student.feeStatus === 'Cleared' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {student.feeStatus === 'Cleared' ? 'Full Settlement' : 'Outstanding Dues'}
              </span>
            </div>
          </div>

          <button
            onClick={handlePrintReportCard}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{student.resultHeld ? 'Locked' : 'Print Results'}</span>
          </button>
        </div>
      </div>

      {/* Main Student Portal Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl w-full max-w-full overflow-x-auto whitespace-nowrap scrollbar-none text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer shrink-0 min-h-[36px] ${
            activeTab === 'subjects'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0 text-blue-600" />
          <span>Assigned Subjects ({resolvedStudentSubjects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('report_card')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer shrink-0 min-h-[36px] ${
            activeTab === 'report_card'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-3.5 h-3.5 shrink-0" />
          <span>Report Card</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer shrink-0 min-h-[36px] ${
            activeTab === 'performance'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer shrink-0 min-h-[36px] ${
            activeTab === 'attendance'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer shrink-0 min-h-[36px] ${
            activeTab === 'fees'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Fees & Clearance</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRINT REPORT CARD VIEW                                                */}
      {/* ========================================================================= */}
      {activeTab === 'report_card' && (
        <div className={`bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5 w-full max-w-full min-w-0 ${student.resultHeld ? 'relative' : ''}`}>
          {student.resultHeld && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-20 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-3 shadow-xs">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-xl font-serif-title">Report Card Locked</h4>
              <p className="text-xs text-slate-600 max-w-md mt-1.5 leading-relaxed">
                The academic report card for <strong>{formatStudentShortName(student.name)}</strong> has been withheld by the Administration. To unlock and view detailed scores, please complete bursary clearance.
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
                <span className="font-bold text-slate-900 block">{formatStudentShortName(student.name)}</span>
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
                  DOMINATE STAR COLLEGE
                </div>
              </div>
            </div>
          </div>

          {/* Official Scores Table with 40% CA + 60% Exam */}
          <div className="overflow-x-auto w-full max-w-full -mx-1 sm:mx-0 px-1 sm:px-0">
            <table className="w-full text-left text-xs border-collapse min-w-[780px] whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-2">Code</th>
                  <th className="py-3 px-2 text-center" title="Continuous Assessment: Homework out of 10">HW (10)</th>
                  <th className="py-3 px-2 text-center" title="Continuous Assessment: Test 1 out of 10">Test 1 (10)</th>
                  <th className="py-3 px-2 text-center" title="Continuous Assessment: Test 2 out of 10">Test 2 (10)</th>
                  <th className="py-3 px-2 text-center" title="Continuous Assessment: Practical out of 10">Prac (10)</th>
                  <th className="py-3 px-2 text-center bg-blue-50/70 text-blue-950 font-extrabold">CA (40)</th>
                  <th className="py-3 px-2 text-center">Exam (60)</th>
                  <th className="py-3 px-2 text-center font-bold text-slate-900 bg-slate-100/60">Total (100)</th>
                  <th className="py-3 px-2 text-center">Grade</th>
                  <th className="py-3 px-3 text-right">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(student.subjects || []).map((sub, idx) => {
                  const isAssessed = (sub.total !== undefined && sub.total > 0) || (sub.caTotal !== undefined && sub.caTotal > 0) || (sub.exam !== undefined && sub.exam > 0) || (sub.grade && sub.grade !== '-' && sub.grade !== 'Ungraded' && sub.grade !== 'Pending');
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{sub.name}</td>
                      <td className="py-3 px-2 font-mono text-slate-400 text-[11px]">{sub.code}</td>
                      <td className="py-3 px-2 text-center font-mono text-slate-700">{isAssessed ? (sub.homework ?? 0) : '—'}</td>
                      <td className="py-3 px-2 text-center font-mono text-slate-700">{isAssessed ? (sub.test1 ?? 0) : '—'}</td>
                      <td className="py-3 px-2 text-center font-mono text-slate-700">{isAssessed ? (sub.test2 ?? 0) : '—'}</td>
                      <td className="py-3 px-2 text-center font-mono text-blue-950 font-semibold">{isAssessed ? (sub.practical ?? sub.quiz ?? 0) : '—'}</td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-blue-900 bg-blue-50/30">
                        {isAssessed ? (sub.caTotal ?? 0) : '—'}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-semibold text-slate-800">{isAssessed ? (sub.exam ?? 0) : '—'}</td>
                      <td className="py-3 px-2 text-center font-mono font-black text-blue-950 text-sm bg-slate-100/40">
                        {isAssessed ? (sub.total ?? 0) : '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {isAssessed ? (
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
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600 text-[11px]">
                        {isAssessed ? sub.remark : 'Pending Assessment'}
                      </td>
                    </tr>
                  );
                })}
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
              Official document issued by Dominate Star College.
            </span>
            <button
              onClick={handlePrintReportCard}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Results</span>
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
                      <span className="font-mono font-bold text-slate-800">{sub.homework ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-bold">Test 1 (10)</span>
                      <span className="font-mono font-bold text-slate-800">{sub.test1 ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-bold">Test 2 (10)</span>
                      <span className="font-mono font-bold text-slate-800">{sub.test2 ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-bold">Practical (10)</span>
                      <span className="font-mono font-bold text-blue-900">{sub.practical ?? sub.quiz ?? 0}</span>
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
        const rate = openDays > 0 ? (studentAttendance?.summary?.attendanceRate ?? student.attendanceRate ?? 0) : 0;
        const isCleared = openDays === 0 ? true : rate >= 75;
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
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      College Attendance
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-950 border border-blue-200 font-mono">
                      {student.session} · {selectedAttendanceTerm}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Live roll call register for {student.classArm}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                {/* Term Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-600">Term:</span>
                  <select
                    value={selectedAttendanceTerm}
                    onChange={(e) => setSelectedAttendanceTerm(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer shadow-2xs"
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!student?.id) return;
                    setIsLoadingAttendance(true);
                    fetch(`/api/attendance/student/${encodeURIComponent(student.id)}?term=${encodeURIComponent(selectedAttendanceTerm)}`)
                      .then((res) => (res.ok ? res.json() : null))
                      .then((data) => {
                        if (data && data.success) {
                          setStudentAttendance(data);
                          if (data.weeks && data.weeks.length > 0) {
                            setSelectedWeek(data.weeks.length);
                          }
                        }
                      })
                      .catch(() => {
                        // Silent fallback, no disruption to UI
                      })
                      .finally(() => setIsLoadingAttendance(false));
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  id="refresh-student-attendance-btn"
                >
                  <span>{isLoadingAttendance ? 'Syncing...' : '↻ Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Attendance High-Level Metrics (Mature White & Blue) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">
                  Open Days
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                  {openDays} {openDays === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {openDays > 0 ? `${selectedAttendanceTerm} Recorded` : 'No Attendance Yet'}
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
                <span className="text-[11px] text-blue-700 font-medium">Certified on Register</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block tracking-wider">
                  Days Absent
                </span>
                <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">
                  {absentDays} {absentDays === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {openDays === 0 ? 'No records yet' : absentDays === 0 ? 'Zero Absences' : 'Leave / Excuse Noted'}
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase block tracking-wider">
                  Attendance Rate
                </span>
                <span className="text-2xl font-black text-blue-950 font-mono mt-1 block">
                  {rate}%
                </span>
                <span className="text-[11px] text-blue-800 font-bold">
                  {openDays === 0 ? 'Pending First Roll' : isCleared ? 'Clearance Satisfied' : 'Below 75% Requirement'}
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
                      {openDays === 0
                        ? (studentAttendance?.message || 'No attendance yet, your teacher have not started marking attendance')
                        : isCleared
                        ? 'Attendance Status: Cleared & Verified'
                        : 'Attendance Status: Under Advisory Review'}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-950 text-white font-mono">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mt-0.5 max-w-2xl">
                    {openDays > 0 ? (
                      <>
                        <strong>{formatStudentShortName(student.name)}</strong> holds an official cumulative attendance rate of <strong>{rate}%</strong> for the {selectedAttendanceTerm}. This record is certified by the Form Master and recorded in the college database.
                      </>
                    ) : (
                      <>
                        {studentAttendance?.message || 'No attendance yet, your teacher have not started marking attendance'}. Form Master ({assignedFormMaster}) records daily roll calls for {student.classArm}.
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
                    {studentAttendance?.message || 'No attendance yet, your teacher have not started marking attendance'}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {studentAttendance?.message?.includes('meet your teacher')
                      ? `Your enrolled class is ${student.classArm}. If you believe this is an error, please meet your form master (${assignedFormMaster}) or the school administration.`
                      : `The Form Master (${assignedFormMaster}) has not yet marked attendance for ${student.classArm} in ${selectedAttendanceTerm}. As soon as attendance is submitted in the teacher dashboard, it will appear here in real time.`}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <span>Class:</span>
                  <span className="font-bold text-blue-950">{student.classArm}</span>
                  <span>·</span>
                  <span>Term:</span>
                  <span className="font-bold text-blue-950">{selectedAttendanceTerm}</span>
                  <span>·</span>
                  <span>Adm No:</span>
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
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-sky-50 hover:text-blue-900 border border-sky-200'
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

                <div className="overflow-x-auto w-full max-w-full -mx-1 sm:mx-0 px-1 sm:px-0">
                  <table className="w-full text-left text-xs min-w-[640px] whitespace-nowrap">
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
        const validBaseFee = (feeSchedule as any)?.baseSchoolFee ?? (feeSchedule as any)?.baseTuition ?? DEFAULT_FEE_SCHEDULE.baseSchoolFee;
        const validItems: Array<{ id?: string; name: string; amount: number; category?: string; description?: string }> =
          (feeSchedule as any)?.items && Array.isArray((feeSchedule as any).items) && (feeSchedule as any).items.length > 0
            ? (feeSchedule as any).items
            : (feeSchedule as any)?.otherFees && Array.isArray((feeSchedule as any).otherFees)
            ? (feeSchedule as any).otherFees
            : [
                { name: 'Project & Practical Levy', amount: 15000, category: 'Academic Levy', description: 'Laboratory kits and project supplies' },
                { name: 'ICT & College Portal Levy', amount: 10000, category: 'Facility', description: 'Computer lab sessions & portal access' },
              ];

        const nonTuitionItems = validItems.filter((it: any) => it.category !== 'Tuition');
        const itemsTotal = nonTuitionItems.reduce((acc: number, it: any) => acc + (Number(it.amount) || 0), 0);
        const totalTermBill = (feeSchedule as any)?.totalFee ?? (validBaseFee + itemsTotal);

        const isPaid = student.feeStatus === 'Cleared';
        const amountPaid = isPaid ? totalTermBill : (student.amountPaid ?? 0);
        const outstandingBalance = isPaid ? 0 : Math.max(0, totalTermBill - amountPaid);

        const bankName = (feeSchedule as any)?.bankName || (feeSchedule as any)?.bankDetails?.bankName || 'First Bank of Nigeria';
        const accountNumber = (feeSchedule as any)?.accountNumber || (feeSchedule as any)?.bankDetails?.accountNumber || '3128940022';
        const accountName = (feeSchedule as any)?.accountName || (feeSchedule as any)?.bankDetails?.accountName || 'Dominate Star College Bursary Account';
        const paymentInstructions = (feeSchedule as any)?.paymentInstructions || 'Please indicate the student admission number and full name on the payment narration/deposit slip.';

        const handleCopyAccount = () => {
          if (accountNumber) {
            navigator.clipboard.writeText(accountNumber);
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
                    All prescribed school fees, tuition, project fees, and college dues for <strong>{formatStudentShortName(student.name)}</strong> ({student.admissionNo}) have been fully settled and endorsed for {CURRENT_TERM}. No outstanding balance is recorded on your portal ledger.
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
                    ₦{validBaseFee.toLocaleString()}.00
                  </span>
                </div>

                {/* Additional Fees Input by Administrator (e.g. Project Fee, Science Lab, etc.) */}
                {nonTuitionItems.map((fee: any, idx: number) => (
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
                      ₦{Number(fee.amount).toLocaleString()}.00
                    </span>
                  </div>
                ))}

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
                    {bankName}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Number</span>
                    <span className="font-mono font-black text-blue-950 text-base mt-0.5 block">
                      {accountNumber}
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
                    {accountName}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                <strong>Remittance Instructions:</strong> {paymentInstructions} (Use registration number <code>{student.admissionNo}</code> as narration).
              </div>
            </div>

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
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                id="student-print-clearance-btn"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Clearance</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* TAB: ASSIGNED SUBJECTS & CURRICULUM EXPLORER                             */}
      {/* ========================================================================= */}
      {activeTab === 'subjects' && (() => {
        const filteredSubjects = resolvedStudentSubjects.filter((subj) => {
          const matchesSearch =
            subj.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
            subj.code.toLowerCase().includes(subjectSearch.toLowerCase());
          const matchesCategory =
            subjectCategoryFilter === 'ALL' || subj.category === subjectCategoryFilter;
          return matchesSearch && matchesCategory;
        });

        const coreCount = resolvedStudentSubjects.filter((s) =>
          ['English Language', 'Mathematics', 'Civic Education', 'Data Processing / ICT'].some(
            (c) => c.toLowerCase() === s.name.toLowerCase()
          )
        ).length;

        const distinctions = resolvedStudentSubjects.filter((s) => s.grade === 'A1' || s.grade === 'B2').length;

        return (
          <div className="space-y-5">
            {/* Top Academic Banner */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                      Academic Curriculum & Class Syllabus
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {student.classArm} Official Roster
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-white">
                    Assigned Subjects & Teacher Directory
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Official subjects assigned to <strong>{student.classArm}</strong> by the Academic Board and Registrar.
                    Every subject connects your continuous assessment marks (Homework, Tests, Practicals) and Terminal Examination directly to your official academic transcript.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-center min-w-[100px]">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Class Master</span>
                    <span className="font-bold text-white text-xs truncate max-w-[130px] block">
                      {assignedFormMaster}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('report_card')}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View Report Sheet</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                  Total Subjects
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                  {resolvedStudentSubjects.length}
                </span>
                <span className="text-[11px] text-slate-500">Allocated to {student.classArm}</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase text-blue-900 block">
                  Core Compulsory
                </span>
                <span className="text-2xl font-black text-blue-900 font-mono mt-1 block">
                  {coreCount}
                </span>
                <span className="text-[11px] text-blue-700">Maths, English, Civic, ICT</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">
                  Distinctions (A/B)
                </span>
                <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                  {distinctions}
                </span>
                <span className="text-[11px] text-emerald-700">Scoring ≥ 70%</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                  Current Average
                </span>
                <span className="text-2xl font-black text-amber-900 font-mono mt-1 block">
                  {student.termGpa}%
                </span>
                <span className="text-[11px] text-amber-800 font-semibold">{student.termRank} position</span>
              </div>
            </div>

            {/* Controls Bar: Search, Category Filters, View Switcher */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search subject by name or code (e.g. English, MTH, Civic)..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {['ALL', 'Sciences', 'Arts & Humanities', 'Commercial', 'General Curriculum', 'Vocational & Technology'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSubjectCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors shrink-0 ${
                        subjectCategoryFilter === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode Toggle: Cards vs Table */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-center">
                <button
                  type="button"
                  onClick={() => setSubjectViewMode('cards')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    subjectViewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-blue-600" />
                  <span>Subject Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectViewMode('table')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    subjectViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Curriculum Table</span>
                </button>
              </div>
            </div>

            {/* Empty State if No match */}
            {filteredSubjects.length === 0 && (
              <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No Subjects Match Your Query</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No assigned subjects matched "{subjectSearch}" in category "{subjectCategoryFilter}".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubjectSearch('');
                    setSubjectCategoryFilter('ALL');
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-900 rounded-xl text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* VIEW 1: SUBJECT CARDS */}
            {subjectViewMode === 'cards' && filteredSubjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((subj) => {
                  return (
                    <div
                      key={subj.name}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase block tracking-wider">
                              {subj.code}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug">
                              {subj.name}
                            </h3>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              subj.category === 'Sciences'
                                ? 'bg-blue-100 text-blue-900'
                                : subj.category === 'Arts & Humanities'
                                ? 'bg-purple-100 text-purple-900'
                                : subj.category === 'Commercial'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {subj.category}
                          </span>
                        </div>

                        {/* Subject Teacher Badge */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Subject Teacher:</span>
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            {subj.teacher && subj.teacher !== 'Unassigned Instructor' ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                <span>{subj.teacher}</span>
                              </>
                            ) : (
                              <span className="text-slate-400 font-normal italic">Pending Assignment</span>
                            )}
                          </span>
                        </div>

                        {/* CA & Exam Breakdown Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                            <span className="text-[10px] font-extrabold uppercase text-blue-800 block">
                              CA Score (40)
                            </span>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="text-base font-black font-mono text-blue-950">
                                {subj.isAssessed ? `${subj.caTotal}/40` : '— / 40'}
                              </span>
                              <span className="text-[10px] text-blue-700 font-medium">
                                {subj.isAssessed ? 'HW+Tests+Prac' : 'Pending CA'}
                              </span>
                            </div>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                              Exam Score (60)
                            </span>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="text-base font-black font-mono text-slate-800">
                                {subj.isAssessed ? `${subj.exam}/60` : '— / 60'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {subj.isAssessed ? 'Terminal' : 'Pending Exam'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total Mark & Grade Standing Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Cumulative Score
                          </span>
                          <span className="text-lg font-black font-mono text-slate-900 block">
                            {subj.isAssessed ? `${subj.total}%` : '—'}
                          </span>
                        </div>

                        <div className="text-right">
                          {subj.isAssessed ? (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-lg font-mono font-black text-xs ${
                                subj.grade === 'A1'
                                  ? 'bg-blue-900 text-white'
                                  : subj.grade.startsWith('B')
                                  ? 'bg-blue-100 text-blue-900 font-bold'
                                  : subj.grade.startsWith('C')
                                  ? 'bg-emerald-100 text-emerald-900 font-bold'
                                  : 'bg-amber-100 text-amber-900 font-bold'
                              }`}
                            >
                              Grade {subj.grade}
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 border border-slate-200">
                              Pending Assessment
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                            {subj.remark}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: CURRICULUM TABLE */}
            {subjectViewMode === 'table' && filteredSubjects.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3.5">Code</th>
                        <th className="py-3 px-3.5">Assigned Subject Course</th>
                        <th className="py-3 px-2">Category</th>
                        <th className="py-3 px-3">Subject Teacher</th>
                        <th className="py-3 px-2 text-center" title="Continuous Assessment out of 40">CA (40)</th>
                        <th className="py-3 px-2 text-center" title="Terminal Examination out of 60">Exam (60)</th>
                        <th className="py-3 px-2 text-center" title="Total cumulative mark out of 100">Total (100)</th>
                        <th className="py-3 px-2 text-center">Grade</th>
                        <th className="py-3 px-3 text-right">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredSubjects.map((subj) => (
                        <tr key={subj.name} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-blue-700 text-[11px]">
                            {subj.code}
                          </td>
                          <td className="py-3 px-3.5 font-bold text-slate-900">
                            {subj.name}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {subj.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {subj.teacher && subj.teacher !== 'Unassigned Instructor' ? (
                              subj.teacher
                            ) : (
                              <span className="text-slate-400 italic">Pending Assignment</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-semibold text-blue-900 bg-blue-50/20">
                            {subj.isAssessed ? subj.caTotal : '—'}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-slate-800">
                            {subj.isAssessed ? subj.exam : '—'}
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-black text-slate-900 text-sm bg-slate-50">
                            {subj.isAssessed ? `${subj.total}%` : '—'}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {subj.isAssessed ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-mono font-black text-[11px] ${
                                  subj.grade === 'A1'
                                    ? 'bg-blue-900 text-white'
                                    : subj.grade.startsWith('B')
                                    ? 'bg-blue-100 text-blue-900'
                                    : subj.grade.startsWith('C')
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {subj.grade}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-600 text-[11px]">
                            {subj.remark}
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

      {/* Official Student Report Card Modal (View & Print) */}
      {isReportCardOpen && (
        <StudentReportCardModal
          student={student}
          classes={classes || []}
          onClose={() => setIsReportCardOpen(false)}
        />
      )}
    </div>
  );
};
