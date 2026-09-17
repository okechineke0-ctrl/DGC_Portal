import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Boxes,
  Users,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  Sparkles,
  Lock,
  Edit3,
  ShieldCheck,
  Award,
  Layers,
  Check,
  UserCheck,
  GraduationCap,
  CheckCircle,
  School,
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  UserX,
  Calendar,
} from 'lucide-react';
import { StaffMember, StudentProfile, SubjectScore, SchoolClassDefinition } from '../types';
import {
  SCHOOL_CLASSES_LIST,
  ALL_SCHOOL_SUBJECTS,
  calculateGrade,
  computeCaTotal,
} from '../data/mockData';

interface StaffDashboardProps {
  staff: StaffMember;
  onExit: () => void;
  students: StudentProfile[];
  classes?: SchoolClassDefinition[];
  onUpdateStudentScore: (studentId: string, scoreData: Partial<SubjectScore>) => Promise<boolean>;
  onBulkUpdateStudentScores?: (
    classArm: string,
    subjectCode: string,
    subjectName: string,
    scores: Array<{
      studentId: string;
      homework?: number;
      test1?: number;
      test2?: number;
      practical?: number;
      exam?: number;
    }>
  ) => Promise<boolean>;
  onUpdateStudentRemarks?: (
    studentId: string,
    remarks: {
      formMasterRemark?: string;
      formTeacherComment?: string;
      principalRemark?: string;
      principalComment?: string;
      affectiveDomain?: any;
      psychomotorDomain?: any;
    }
  ) => Promise<boolean>;
  onUpdateStudentAttendance?: (
    className: string,
    records: Array<{
      studentId: string;
      status: 'Present' | 'Absent' | 'Late' | 'Excused';
      remarks?: string;
      newAttendanceRate?: number;
    }>,
    date?: string,
    term?: string
  ) => Promise<boolean>;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  staff,
  onExit,
  students,
  classes = [],
  onUpdateStudentScore,
  onBulkUpdateStudentScores,
  onUpdateStudentRemarks,
  onUpdateStudentAttendance,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'grading' | 'form_master' | 'attendance' | 'workload'>('grading');

  // Select initial class from staff's assigned classes or default
  const initialClass = staff.assignedClasses && staff.assignedClasses.length > 0
    ? staff.assignedClasses[0]
    : 'SS 3 Science';

  const initialSubject = staff.subjectsTaught && staff.subjectsTaught.length > 0
    ? staff.subjectsTaught[0]
    : 'Mathematics';

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form Master remarks state
  const formClass = staff.formMasterOf || selectedClass;
  const [formMasterRemarks, setFormMasterRemarks] = useState<Record<string, string>>({});
  const [savingRemarkId, setSavingRemarkId] = useState<string | null>(null);

  // Attendance Management State
  const defaultAttendanceClass =
    staff.assignedClasses && staff.assignedClasses.length > 0
      ? staff.assignedClasses[0]
      : staff.formMasterOf || 'SS 3 Science';

  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState<string>(defaultAttendanceClass);
  const [selectedAttendanceTerm, setSelectedAttendanceTerm] = useState<string>('First Term');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceSession, setAttendanceSession] = useState<string>('Morning Roll Call & Assembly');
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, { status: 'Present' | 'Absent' | 'Late' | 'Excused'; remarks: string }>
  >({});
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'excused'>('all');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState<string>('');
  const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState<string | null>(null);

  // Local state of scores for editing
  const [scoreInputs, setScoreInputs] = useState<Record<string, {
    homework: string;
    test1: string;
    test2: string;
    practical: string;
    exam: string;
  }>>({});

  // Determine Form Master or Form Mistress title
  const formDesignation =
    staff.formDesignation ||
    (staff.role === 'Form Mistress' ||
    staff.title === 'Mrs.' ||
    staff.title === 'Miss' ||
    staff.title === 'Lady'
      ? 'Form Mistress'
      : 'Form Master');
  // Filter students by selected class arm
  const classStudents = students.filter((s) => s.classArm === selectedClass);
  const formClassStudents = students.filter((s) => s.classArm === formClass);

  // Populate score inputs whenever selectedClass, selectedSubject, or students change
  useEffect(() => {
    const newInputs: Record<string, {
      homework: string;
      test1: string;
      test2: string;
      practical: string;
      exam: string;
    }> = {};

    classStudents.forEach((student) => {
      const subjectScore = student.subjects?.find(
        (sub) => sub.name.toLowerCase() === selectedSubject.toLowerCase()
      );

      newInputs[student.id] = {
        homework: subjectScore?.homework !== undefined ? String(subjectScore.homework) : '',
        test1: subjectScore?.test1 !== undefined ? String(subjectScore.test1) : '',
        test2: subjectScore?.test2 !== undefined ? String(subjectScore.test2) : '',
        practical: subjectScore?.practical !== undefined ? String(subjectScore.practical) : (subjectScore?.quiz !== undefined ? String(subjectScore.quiz) : ''),
        exam: subjectScore?.exam !== undefined ? String(subjectScore.exam) : '',
      };
    });

    setScoreInputs(newInputs);
  }, [selectedClass, selectedSubject, students]);

  // Populate form master remarks
  useEffect(() => {
    const remarks: Record<string, string> = {};
    formClassStudents.forEach((student) => {
      remarks[student.id] = student.formMasterRemark || (
        student.termGpa >= 75
          ? 'An exceptional, highly focused student who demonstrates academic brilliance and moral discipline.'
          : 'A good and regular student. Encouraged to allocate more time to continuous assessment revisions.'
      );
    });
    setFormMasterRemarks(remarks);
  }, [formClass, students]);

  const handleInputChange = (studentId: string, field: 'homework' | 'test1' | 'test2' | 'practical' | 'exam', value: string) => {
    if (value !== '' && isNaN(Number(value))) return;
    setScoreInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveStudentScore = async (studentId: string) => {
    setSavingId(studentId);
    const input = scoreInputs[studentId] || { homework: '', test1: '', test2: '', practical: '', exam: '' };

    const hw = input.homework !== '' ? Number(input.homework) : 0;
    const t1 = input.test1 !== '' ? Number(input.test1) : 0;
    const t2 = input.test2 !== '' ? Number(input.test2) : 0;
    const prac = input.practical !== '' ? Number(input.practical) : 0;
    const ex = input.exam !== '' ? Number(input.exam) : 0;

    const ca = computeCaTotal(hw, t1, t2, prac);
    const tot = Math.min(100, ca + ex);
    const { grade, remark } = calculateGrade(tot);

    const success = await onUpdateStudentScore(studentId, {
      name: selectedSubject,
      code: `${selectedSubject.substring(0, 3).toUpperCase()} ${selectedClass.startsWith('SS') ? '301' : '101'}`,
      homework: hw,
      test1: t1,
      test2: t2,
      practical: prac,
      quiz: prac,
      caTotal: ca,
      exam: ex,
      total: tot,
      grade,
      remark,
      updatedBy: staff.name,
    });

    setSavingId(null);
    if (success) {
      setSaveSuccessMsg(`Grades synchronized for student.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const handleSaveAllClassScores = async () => {
    setSavingId('ALL');
    let count = 0;
    if (onBulkUpdateStudentScores) {
      const scoresPayload = classStudents.map((s) => {
        const input = scoreInputs[s.id] || { homework: 0, test1: 0, test2: 0, practical: 0, exam: 0 };
        return {
          studentId: s.id,
          homework: input.homework !== '' ? Number(input.homework) : 0,
          test1: input.test1 !== '' ? Number(input.test1) : 0,
          test2: input.test2 !== '' ? Number(input.test2) : 0,
          practical: input.practical !== '' ? Number(input.practical) : 0,
          exam: input.exam !== '' ? Number(input.exam) : 0,
        };
      });
      await onBulkUpdateStudentScores(
        selectedClass,
        `${selectedSubject.substring(0, 3).toUpperCase()} ${selectedClass.startsWith('SS') ? '301' : '101'}`,
        selectedSubject,
        scoresPayload
      );
      count = classStudents.length;
    } else {
      for (const s of classStudents) {
        const input = scoreInputs[s.id];
        if (input) {
          const hw = input.homework !== '' ? Number(input.homework) : 0;
          const t1 = input.test1 !== '' ? Number(input.test1) : 0;
          const t2 = input.test2 !== '' ? Number(input.test2) : 0;
          const prac = input.practical !== '' ? Number(input.practical) : 0;
          const ex = input.exam !== '' ? Number(input.exam) : 0;

          const ca = computeCaTotal(hw, t1, t2, prac);
          const tot = Math.min(100, ca + ex);
          const { grade, remark } = calculateGrade(tot);

          await onUpdateStudentScore(s.id, {
            name: selectedSubject,
            code: `${selectedSubject.substring(0, 3).toUpperCase()} ${selectedClass.startsWith('SS') ? '301' : '101'}`,
            homework: hw,
            test1: t1,
            test2: t2,
            practical: prac,
            quiz: prac,
            caTotal: ca,
            exam: ex,
            total: tot,
            grade,
            remark,
            updatedBy: staff.name,
          });
          count++;
        }
      }
    }
    setSavingId(null);
    setSaveSuccessMsg(`Successfully saved and synced scores for all ${count} students in ${selectedClass}!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Save Form Master Remark
  const handleSaveRemark = async (studentId: string) => {
    if (!onUpdateStudentRemarks) return;
    setSavingRemarkId(studentId);
    const remark = formMasterRemarks[studentId] || '';
    const success = await onUpdateStudentRemarks(studentId, {
      formMasterRemark: remark,
      formTeacherComment: remark,
    });
    setSavingRemarkId(null);
    if (success) {
      setSaveSuccessMsg(`Form Master conduct remark verified & saved for student.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Attendance derived states and helper logic
  const attendanceClassStudents = students.filter((s) => s.classArm === selectedAttendanceClass);

  // Initialize and load attendance records from Firestore whenever class, date, term or students change
  useEffect(() => {
    let isSubscribed = true;
    fetch(`/api/attendance?className=${encodeURIComponent(selectedAttendanceClass)}&date=${encodeURIComponent(attendanceDate)}&term=${encodeURIComponent(selectedAttendanceTerm)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isSubscribed) return;
        if (data && data.current && Array.isArray(data.current.records) && data.current.records.length > 0) {
          const loaded: Record<string, { status: 'Present' | 'Absent' | 'Late' | 'Excused'; remarks: string }> = {};
          data.current.records.forEach((rec: { studentId: string; status: 'Present' | 'Absent' | 'Late' | 'Excused'; remarks?: string }) => {
            loaded[rec.studentId] = {
              status: rec.status,
              remarks: rec.remarks || '',
            };
          });
          setAttendanceRecords(loaded);
          setAttendanceSuccessMsg(`Loaded verified database attendance register for ${attendanceDate} (${selectedAttendanceTerm})`);
          setTimeout(() => setAttendanceSuccessMsg(null), 3000);
        } else {
          setAttendanceRecords((prev) => {
            const updated = { ...prev };
            attendanceClassStudents.forEach((st) => {
              if (!updated[st.id]) {
                updated[st.id] = {
                  status: 'Present',
                  remarks: '',
                };
              }
            });
            return updated;
          });
        }
      })
      .catch(() => {
        setAttendanceRecords((prev) => {
          const updated = { ...prev };
          attendanceClassStudents.forEach((st) => {
            if (!updated[st.id]) {
              updated[st.id] = {
                status: 'Present',
                remarks: '',
              };
            }
          });
          return updated;
        });
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedAttendanceClass, attendanceDate, selectedAttendanceTerm, students]);

  const handleMarkAllPresent = () => {
    setAttendanceRecords((prev) => {
      const updated = { ...prev };
      attendanceClassStudents.forEach((st) => {
        updated[st.id] = {
          status: 'Present',
          remarks: prev[st.id]?.remarks || '',
        };
      });
      return updated;
    });
  };

  const handleMarkAllAbsent = () => {
    setAttendanceRecords((prev) => {
      const updated = { ...prev };
      attendanceClassStudents.forEach((st) => {
        updated[st.id] = {
          status: 'Absent',
          remarks: prev[st.id]?.remarks || 'Unexcused absence',
        };
      });
      return updated;
    });
  };

  const handleSetStudentAttendanceStatus = (
    studentId: string,
    status: 'Present' | 'Absent' | 'Late' | 'Excused'
  ) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        status,
        remarks:
          prev[studentId]?.remarks ||
          (status === 'Late' ? 'Late arrival' : status === 'Excused' ? 'Medical exemption' : ''),
      },
    }));
  };

  const handleSetStudentAttendanceRemarks = (studentId: string, remarks: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Present',
        remarks,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    setAttendanceSuccessMsg(null);

    const recordsArray = attendanceClassStudents.map((st) => {
      const rec = attendanceRecords[st.id] || { status: 'Present', remarks: '' };
      return {
        studentId: st.id,
        status: rec.status,
        remarks: rec.remarks,
      };
    });

    if (onUpdateStudentAttendance) {
      await onUpdateStudentAttendance(selectedAttendanceClass, recordsArray, attendanceDate, selectedAttendanceTerm);
    }

    setIsSavingAttendance(false);
    const presentCount = recordsArray.filter((r) => r.status === 'Present').length;
    setAttendanceSuccessMsg(
      `✓ Attendance for ${selectedAttendanceClass} (${selectedAttendanceTerm}) recorded! (${presentCount}/${recordsArray.length} present). Certified by ${staff.title} ${staff.name}.`
    );

    setTimeout(() => {
      setAttendanceSuccessMsg(null);
    }, 6000);
  };

  const handleExportAttendance = () => {
    const rows = [
      ['No', 'Admission No', 'Student Name', 'Class Arm', 'Gender', 'Status', 'Term Attendance Rate', 'Remarks'],
      ...attendanceClassStudents.map((st, idx) => {
        const rec = attendanceRecords[st.id] || { status: 'Present', remarks: '' };
        return [
          idx + 1,
          st.admissionNo,
          st.name,
          st.classArm,
          st.gender,
          rec.status,
          `${st.attendanceRate}%`,
          rec.remarks || 'Punctual',
        ];
      }),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((c) => `"${c}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Attendance_Register_${selectedAttendanceClass.replace(/\s+/g, '_')}_${attendanceDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics for attendance class
  const totalInAttendanceClass = attendanceClassStudents.length;
  const presentCount = attendanceClassStudents.filter(
    (st) => (attendanceRecords[st.id]?.status || 'Present') === 'Present'
  ).length;
  const absentCount = attendanceClassStudents.filter(
    (st) => attendanceRecords[st.id]?.status === 'Absent'
  ).length;
  const lateCount = attendanceClassStudents.filter(
    (st) => attendanceRecords[st.id]?.status === 'Late'
  ).length;
  const excusedCount = attendanceClassStudents.filter(
    (st) => attendanceRecords[st.id]?.status === 'Excused'
  ).length;

  const filteredAttendanceStudents = attendanceClassStudents.filter((st) => {
    const rec = attendanceRecords[st.id] || { status: 'Present', remarks: '' };
    if (attendanceFilter !== 'all' && rec.status.toLowerCase() !== attendanceFilter) {
      return false;
    }
    if (!attendanceSearchQuery.trim()) return true;
    const q = attendanceSearchQuery.toLowerCase();
    return st.name.toLowerCase().includes(q) || st.admissionNo.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Staff Executive Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-amber-300 border border-white/20 flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
              {staff.name.replace(/^(Dr\.|Mrs\.|Mr\.|Engr\.|Lady|Barr\.)\s*/, '').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white shadow-xs">
                  Active Teacher Session
                </span>
                <span className="text-xs text-blue-200">
                  {staff.department} Department · {staff.role}
                </span>
                {staff.formMasterOf && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-blue-950" />
                    <span>{formDesignation}: {staff.formMasterOf}</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-title tracking-tight">
                Welcome, {staff.title} {staff.name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/80 mt-1">
                Authorized Continuous Assessment & Examination Grading Console · First Term 2026/2027
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-amber-400 text-blue-950 ring-2 ring-white/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              id="header-mark-attendance-btn"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
            {activeTab === 'grading' && (
              <button
                onClick={handleSaveAllClassScores}
                disabled={savingId === 'ALL'}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingId === 'ALL' ? 'Syncing...' : 'Sync Class Sheet'}</span>
              </button>
            )}
            <button
              onClick={onExit}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Staff Mode</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Staff Tab Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('grading')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'grading'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>CA & Exam Grading</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'attendance'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          id="tab-mark-attendance-btn"
        >
          <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          <span>Attendance</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
            {staff.assignedClasses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('form_master')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'form_master'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>
            {formDesignation} {staff.formMasterOf ? `(${staff.formMasterOf})` : ''}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workload')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'workload'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>My Teaching Schedule</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GRADING CONSOLE                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          {/* Class & Subject Selector Controls Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Class Arm Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Class Arm:
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-800/30"
                  >
                    {SCHOOL_CLASSES_LIST.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} {staff.assignedClasses.includes(cls) ? '★ (Assigned)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Subject Course:
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-800/30"
                  >
                    {ALL_SCHOOL_SUBJECTS.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj} {staff.subjectsTaught.includes(subj) ? '★ (Assigned)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter student name or reg no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800/20"
                />
              </div>
            </div>

            {/* CA Guidance */}
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  <strong>Continuous Assessment Structure:</strong> Homework (10%) + Test 1 (10%) + Test 2 (10%) + Practical/Quiz (10%) = <strong>CA Max 40%</strong>. Exam = <strong>60%</strong>. Total = <strong>100%</strong>.
                </span>
              </div>
              <span className="text-[11px] text-blue-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                {classStudents.length} Students in {selectedClass}
              </span>
            </div>
          </div>

          {/* Grade Entry Table */}
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedClass} · {selectedSubject} Continuous Assessment & Exam Sheet
                </h3>
                <p className="text-xs text-slate-500">
                  Enter individual CA tests and exam scores. WAEC Grade & Remarks calculate automatically.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Print Broadsheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Results</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-2 text-center w-20">HW (10)</th>
                    <th className="py-3 px-2 text-center w-20">T1 (10)</th>
                    <th className="py-3 px-2 text-center w-20">T2 (10)</th>
                    <th className="py-3 px-2 text-center w-20">Prac (10)</th>
                    <th className="py-3 px-2 text-center w-20 bg-blue-50/50 text-blue-900 font-bold">CA (40)</th>
                    <th className="py-3 px-2 text-center w-24">Exam (60)</th>
                    <th className="py-3 px-2 text-center w-20 bg-amber-50/50 text-amber-900 font-bold">Total</th>
                    <th className="py-3 px-2 text-center w-16">Grade</th>
                    <th className="py-3 px-3">Remark</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 px-4 text-center">
                        <div className="max-w-md mx-auto space-y-2">
                          <Users className="w-8 h-8 text-slate-300 mx-auto" />
                          <h4 className="text-xs font-bold text-slate-700">
                            {searchQuery ? 'No student found matching search' : `No data yet (0 students enrolled in ${selectedClass})`}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {searchQuery
                              ? 'Try searching with a different name or admission number.'
                              : `No students are registered in ${selectedClass} yet. Please register students via the Administration Dashboard.`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                    const input = scoreInputs[student.id] || { homework: '', test1: '', test2: '', practical: '', exam: '' };
                    const hw = Number(input.homework) || 0;
                    const t1 = Number(input.test1) || 0;
                    const t2 = Number(input.test2) || 0;
                    const prac = Number(input.practical) || 0;
                    const ex = Number(input.exam) || 0;

                    const caTotal = computeCaTotal(hw, t1, t2, prac);
                    const total = Math.min(100, caTotal + ex);
                    const { grade, remark } = calculateGrade(total);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{student.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{student.admissionNo}</span>
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={input.homework}
                            onChange={(e) => handleInputChange(student.id, 'homework', e.target.value)}
                            className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={input.test1}
                            onChange={(e) => handleInputChange(student.id, 'test1', e.target.value)}
                            className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={input.test2}
                            onChange={(e) => handleInputChange(student.id, 'test2', e.target.value)}
                            className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={input.practical}
                            onChange={(e) => handleInputChange(student.id, 'practical', e.target.value)}
                            className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-1 text-center font-mono font-bold text-blue-900 bg-blue-50/30">
                          {caTotal}
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={input.exam}
                            onChange={(e) => handleInputChange(student.id, 'exam', e.target.value)}
                            className="w-16 text-center py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-950"
                          />
                        </td>

                        <td className="py-2 px-1 text-center font-mono font-black text-slate-900 bg-amber-50/30">
                          {total}
                        </td>

                        <td className="py-2 px-1 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                              ['A1', 'B2', 'B3'].includes(grade)
                                ? 'bg-emerald-100 text-emerald-800'
                                : ['C4', 'C5', 'C6'].includes(grade)
                                ? 'bg-blue-100 text-blue-800'
                                : ['D7', 'E8'].includes(grade)
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {grade}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-slate-600 font-medium">
                          {remark}
                        </td>

                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => handleSaveStudentScore(student.id)}
                            disabled={savingId === student.id}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ml-auto disabled:opacity-50 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingId === student.id ? '...' : 'Save'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FORM MASTER CLASS OVERSIGHT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'form_master' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 block">
                  {formDesignation} Responsibility Console
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-serif-title">
                  {formClass} · Official Class Register & Conduct Evaluation
                </h2>
                <p className="text-xs text-amber-800 mt-0.5">
                  Your conduct endorsements, ratings, and attendance verification print directly onto students' official terminal report cards.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedAttendanceClass(formClass);
                setActiveTab('attendance');
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-center"
              id="form-master-mark-attendance-btn"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Attendance ({formClass})</span>
            </button>
          </div>

          {/* Form Master Students Roll & Conduct Remarks */}
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Class Roll & Conduct Endorsements ({formClassStudents.length} Students)
                </h3>
                <p className="text-xs text-slate-500">
                  Write individual conduct and academic evaluations for terminal report certification.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {formClassStudents.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="max-w-md mx-auto space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-700">
                      No data yet (0 students in {formClass})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      There are currently no students registered in your designated form class. Once students are enrolled, you can record terminal conduct remarks here.
                    </p>
                  </div>
                </div>
              ) : (
                formClassStudents.map((student) => (
                <div key={student.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-slate-800 flex items-center justify-center font-mono text-xs">
                        {student.termRank}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{student.name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono">{student.admissionNo}</span>
                          <span>•</span>
                          <span>Term Average: <strong className="text-slate-900 font-mono">{student.termGpa}%</strong></span>
                          <span>•</span>
                          <span>Attendance: <strong className="text-blue-900 font-mono">{(student.timesSchoolOpened || 0) === 0 ? '0%' : `${student.attendanceRate}%`}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveRemark(student.id)}
                        disabled={savingRemarkId === student.id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{savingRemarkId === student.id ? 'Saving...' : 'Save Remark'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Master Conduct Remark Box */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Official Form Master Remark (Prints on Terminal Report):
                    </label>
                    <textarea
                      rows={2}
                      value={formMasterRemarks[student.id] || ''}
                      onChange={(e) =>
                        setFormMasterRemarks({ ...formMasterRemarks, [student.id]: e.target.value })
                      }
                      placeholder="Enter official teacher remark on character, academic punctuality, and moral conduct..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800/20"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">Quick Templates:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormMasterRemarks({
                            ...formMasterRemarks,
                            [student.id]: 'An exceptional, highly focused student who demonstrates academic brilliance and moral discipline.',
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                      >
                        Exceptional & Disciplined
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormMasterRemarks({
                            ...formMasterRemarks,
                            [student.id]: 'Good academic performance. Encouraged to maintain consistent discipline in continuous assessments.',
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                      >
                        Consistent & Regular
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormMasterRemarks({
                            ...formMasterRemarks,
                            [student.id]: 'Shows commendable improvement this term. More effort required in homework and terminal revisions.',
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                      >
                        Improvement Observed
                      </button>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLASS ATTENDANCE REGISTER (TEACHER & FORM MASTER ROLL CALL)        */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-300 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <CalendarCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white shadow-xs">
                      Official Daily Attendance Register
                    </span>
                    <span className="text-xs text-emerald-200">
                      Dominican Grace College · Academic Session 2026/2027
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif-title tracking-tight">
                    Class Attendance Register · {selectedAttendanceClass}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                    Authorized Teacher & Form Master Daily Roll Call. Marking absence automatically updates terminal attendance percentages.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportAttendance}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                  title="Export Attendance Register to CSV"
                >
                  <Download className="w-4 h-4 text-emerald-300" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance || attendanceClassStudents.length === 0}
                  className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  id="submit-attendance-register-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingAttendance ? 'Recording...' : 'Submit & Certify Register'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Success / Alert Toast for Attendance */}
          {attendanceSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{attendanceSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceSuccessMsg(null)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Controls Bar: Class Selection, Term, Date, Session, and Quick Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Class Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Select Class Arm
                </label>
                <select
                  value={selectedAttendanceClass}
                  onChange={(e) => setSelectedAttendanceClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  id="attendance-class-select"
                >
                  <optgroup label="My Assigned Classes">
                    {staff.assignedClasses.map((cls) => (
                      <option key={`assigned-${cls}`} value={cls}>
                        {cls} {cls === staff.formMasterOf ? `(${formDesignation})` : '(Assigned)'}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Secondary Classes">
                    {SCHOOL_CLASSES_LIST.filter((cls) => !staff.assignedClasses.includes(cls)).map((cls) => (
                      <option key={`other-${cls}`} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {selectedAttendanceClass === staff.formMasterOf && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-900 mt-1">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>Your Designated {formDesignation} Class</span>
                  </span>
                )}
              </div>

              {/* Term Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Select Term
                </label>
                <select
                  value={selectedAttendanceTerm}
                  onChange={(e) => setSelectedAttendanceTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  id="attendance-term-select"
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
                <span className="text-[10px] text-slate-400 block mt-1">Academic Session Roster</span>
              </div>

              {/* Date Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Attendance Date
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="flex-1 min-w-0 px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    id="attendance-date-input"
                  />
                  <button
                    type="button"
                    onClick={() => setAttendanceDate(new Date().toISOString().split('T')[0])}
                    className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold shrink-0 transition-colors"
                    title="Set to Today"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Session / Period Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Register Session
                </label>
                <select
                  value={attendanceSession}
                  onChange={(e) => setAttendanceSession(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Morning Roll Call & Assembly">Morning Assembly (Official)</option>
                  <option value="Mid-Day Register">Mid-Day Register</option>
                  <option value="Subject Class Session">Subject Session</option>
                  <option value="Evening Prep Roll Call">Evening Prep</option>
                </select>
              </div>

              {/* Bulk Quick Toggles */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Fast Actions
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    id="mark-all-present-btn"
                  >
                    <Check className="w-3.5 h-3.5 text-blue-200" />
                    <span>All Present</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleMarkAllAbsent}
                    className="px-2 py-2 bg-slate-800 hover:bg-slate-900 text-white border border-slate-700 rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    id="mark-all-absent-btn"
                  >
                    <UserX className="w-3.5 h-3.5 text-slate-300" />
                    <span>All Absent</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI Stat Cards (Mature White & Blue) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Enrolled Students
                </span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
                  {totalInAttendanceClass}
                </span>
                <span className="text-[10px] text-slate-500">Official Class Arm Roll</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-blue-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                  Present Today
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-blue-950">{presentCount}</span>
                  <span className="text-xs font-bold text-blue-800">
                    ({totalInAttendanceClass > 0 ? Math.round((presentCount / totalInAttendanceClass) * 100) : 0}%)
                  </span>
                </div>
                <span className="text-[10px] text-blue-700">In morning assembly</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Absent Today
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-slate-800">{absentCount}</span>
                  <span className="text-xs font-bold text-slate-600">
                    ({totalInAttendanceClass > 0 ? Math.round((absentCount / totalInAttendanceClass) * 100) : 0}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Unexcused or missing</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-2xs">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                  Late & Excused
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-blue-950">{lateCount + excusedCount}</span>
                  <span className="text-xs font-bold text-blue-800">
                    ({lateCount} L / {excusedCount} E)
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 font-medium">Permit / excused pass</span>
              </div>
            </div>
          </div>

          {/* Attendance Student Roster Table Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-900" />
                  <span>Student Roll Call Roster · {selectedAttendanceClass}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click status buttons to mark each student. Add notes for late arrival or medical exemptions.
                </p>
              </div>

              {/* Filter chips and search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student or admission #..."
                    value={attendanceSearchQuery}
                    onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900 w-48 sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setAttendanceFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      attendanceFilter === 'all'
                        ? 'bg-blue-950 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({attendanceClassStudents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceFilter('present')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      attendanceFilter === 'present'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-blue-900 hover:bg-blue-50'
                    }`}
                  >
                    Present ({presentCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceFilter('absent')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      attendanceFilter === 'absent'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Absent ({absentCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceFilter('late')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      attendanceFilter === 'late'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-blue-800 hover:bg-blue-50'
                    }`}
                  >
                    Late ({lateCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Student Profile</th>
                    <th className="py-3.5 px-4 text-center">Term Attendance</th>
                    <th className="py-3.5 px-4 text-center">Mark Roll Call (Today)</th>
                    <th className="py-3.5 px-4">Excuse / Punctuality Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendanceStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 px-4 text-center">
                        <div className="max-w-md mx-auto space-y-2">
                          <Users className="w-8 h-8 text-slate-300 mx-auto" />
                          <h4 className="text-xs font-bold text-slate-700">
                            {attendanceSearchQuery
                              ? 'No students found matching search'
                              : `No data yet (0 students enrolled in ${selectedAttendanceClass})`}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {attendanceSearchQuery
                              ? 'Try searching with a different name or admission number.'
                              : `No students are registered in ${selectedAttendanceClass} yet. Enrolled students will appear here for daily roll call.`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendanceStudents.map((student, idx) => {
                    const rec = attendanceRecords[student.id] || { status: 'Present', remarks: '' };
                    const status = rec.status;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Student Name and Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                              {student.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {student.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span>{student.admissionNo}</span>
                                <span>·</span>
                                <span>{student.gender}</span>
                                <span>·</span>
                                <span className="font-semibold text-blue-900">{student.classArm}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Current Term Attendance % */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                (student.timesSchoolOpened || 0) === 0
                                  ? 'bg-slate-100 text-slate-600'
                                  : student.attendanceRate >= 90
                                  ? 'bg-blue-900 text-white'
                                  : student.attendanceRate >= 75
                                  ? 'bg-blue-100 text-blue-950'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {(student.timesSchoolOpened || 0) === 0 ? '0%' : `${student.attendanceRate}%`}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {(student.timesSchoolOpened || 0) === 0
                                ? 'Pending Roll'
                                : student.attendanceRate >= 75
                                ? 'Satisfactory'
                                : 'Critical'}
                            </span>
                          </div>
                        </td>

                        {/* Interactive Status Selector in Mature White & Blue */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => handleSetStudentAttendanceStatus(student.id, 'Present')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                status === 'Present'
                                  ? 'bg-blue-950 text-white shadow-xs ring-2 ring-blue-300'
                                  : 'bg-blue-50 text-blue-950 hover:bg-blue-100 border border-blue-200'
                              }`}
                              title="Mark Present"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Late */}
                            <button
                              type="button"
                              onClick={() => handleSetStudentAttendanceStatus(student.id, 'Late')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                status === 'Late'
                                  ? 'bg-blue-800 text-white shadow-xs ring-2 ring-blue-300'
                                  : 'bg-slate-50 text-blue-900 hover:bg-blue-50 border border-slate-200'
                              }`}
                              title="Mark Late"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>

                            {/* Excused */}
                            <button
                              type="button"
                              onClick={() => handleSetStudentAttendanceStatus(student.id, 'Excused')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                status === 'Excused'
                                  ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-200'
                                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                              title="Mark Excused"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Excused</span>
                            </button>

                            {/* Absent */}
                            <button
                              type="button"
                              onClick={() => handleSetStudentAttendanceStatus(student.id, 'Absent')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                status === 'Absent'
                                  ? 'bg-slate-800 text-white shadow-xs ring-2 ring-slate-400'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                              title="Mark Absent"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>
                          </div>
                        </td>

                        {/* Remarks Input */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={rec.remarks || ''}
                              onChange={(e) => handleSetStudentAttendanceRemarks(student.id, e.target.value)}
                              placeholder={
                                status === 'Late'
                                  ? 'Late arrival reason...'
                                  : status === 'Excused'
                                  ? 'Medical permit or excuse note...'
                                  : status === 'Absent'
                                  ? 'Reason for absence...'
                                  : 'Punctual...'
                              }
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900"
                            />
                            {rec.remarks && (
                              <button
                                type="button"
                                onClick={() => handleSetStudentAttendanceRemarks(student.id, '')}
                                className="text-slate-400 hover:text-slate-600 text-xs px-1"
                                title="Clear note"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

            {/* Register Summary Footer with Blue Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800">
                  Certification Authority:
                </span>
                <span>
                  {staff.title} {staff.name} ({staff.role}, {staff.department}) · Dominion Global College
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance || attendanceClassStudents.length === 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  id="certify-save-attendance-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingAttendance ? 'Saving to Database...' : 'Certify & Save Register'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WORKLOAD & ASSIGNMENTS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'workload' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-serif-title text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>Authorized Instructional Workload & Academic Profile</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Designated institutional teaching allocations and form teacher appointments authorized by the Directorate of Academic Affairs.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 self-start sm:self-center">
              2026/2027 Academic Session
            </span>
          </div>

          {/* Form Teacher Designated Status Banner */}
          {staff.formMasterOf ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white">
                      Official Appointment
                    </span>
                    <span className="text-xs font-semibold text-amber-900">
                      Class Administration
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-amber-950 mt-1">
                    You are assigned to <strong className="font-extrabold underline decoration-amber-500 underline-offset-2">{staff.formMasterOf}</strong> as the {formDesignation}
                  </h3>
                  <p className="text-xs text-amber-800/90 mt-0.5 max-w-xl">
                    As the {formDesignation}, you oversee morning class roll call, calculate attendance percentage, verify conduct ratings, and endorse terminal report cards.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAttendanceClass(staff.formMasterOf!);
                    setActiveTab('attendance');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  id="workload-form-class-roll-call-btn"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Mark Morning Roll Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('form_master')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open {formDesignation} Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Form Teacher Designation: Not Assigned</span>
                <span className="text-slate-500">You are currently serving as a Subject Tutor without form class oversight. Contact the Principal or Dean if this is in error.</span>
              </div>
            </div>
          )}

          {/* Assigned Classes Teaching Grid */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                  Classroom Teaching Deployment
                </span>
                <h4 className="text-sm font-bold text-blue-950 mt-0.5">
                  Assigned to Teach the Following Classes ({staff.assignedClasses.length} {staff.assignedClasses.length === 1 ? 'Class' : 'Classes'}):
                </h4>
              </div>
              <span className="text-xs font-semibold text-blue-900">
                Quick actions for grading and daily class attendance
              </span>
            </div>

            {staff.assignedClasses && staff.assignedClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {staff.assignedClasses.map((cls) => {
                  const isFormClass = staff.formMasterOf === cls;
                  return (
                    <div
                      key={cls}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 bg-white ${
                        isFormClass
                          ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                          : 'border-blue-100 hover:border-blue-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-blue-900" />
                          <span className="font-bold text-slate-900 text-sm">{cls}</span>
                        </div>
                        {isFormClass && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            ★ {formDesignation}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        <span>Subjects assigned in this class: </span>
                        <strong className="text-blue-950 font-semibold">
                          {staff.subjectsTaught.length > 0 ? staff.subjectsTaught.join(', ') : 'All general subjects'}
                        </strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClass(cls);
                            setActiveTab('grading');
                          }}
                          className="py-1.5 px-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                          <span>Grade</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAttendanceClass(cls);
                            setActiveTab('attendance');
                          }}
                          className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          id={`workload-attendance-btn-${cls.replace(/\s+/g, '-')}`}
                        >
                          <CalendarCheck className="w-3.5 h-3.5 text-white" />
                          <span>Attendance</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl border border-blue-200 text-center text-xs text-slate-500">
                No classes currently assigned. Please notify the School Administration.
              </div>
            )}
          </div>

          {/* Subjects Taught Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Subject Specialization & Teaching Load
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  Subjects Taught Across Assigned Classes ({staff.subjectsTaught.length} {staff.subjectsTaught.length === 1 ? 'Subject' : 'Subjects'}):
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Department: <strong className="text-slate-800">{staff.department}</strong>
              </span>
            </div>

            {staff.subjectsTaught && staff.subjectsTaught.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {staff.subjectsTaught.map((subj) => (
                  <div
                    key={subj}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-800 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{subj}</span>
                        <span className="text-[10px] text-slate-400">
                          {staff.assignedClasses.length} {staff.assignedClasses.length === 1 ? 'class stream' : 'class streams'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubject(subj);
                        setActiveTab('grading');
                      }}
                      className="px-2 py-1 text-[11px] font-bold text-blue-900 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      title={`Open grading sheet for ${subj}`}
                    >
                      Grade →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific teaching subjects recorded.</p>
            )}
          </div>

          {/* Teacher Official Standing & Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Institutional Details
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Official Name:</span>
                  <span className="font-bold text-slate-900">{staff.title} {staff.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Designated Role:</span>
                  <span className="font-bold text-slate-900">{staff.role}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Academic Department:</span>
                  <span className="font-bold text-slate-900">{staff.department} Department</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Form Teacher Class:</span>
                  <span className="font-bold text-amber-900">
                    {staff.formMasterOf ? `${staff.formMasterOf} (${formDesignation})` : 'None Assigned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Contact & Accreditation
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Institutional Email:</span>
                  <span className="font-mono text-slate-800">{staff.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Phone Contact:</span>
                  <span className="font-mono text-slate-800">{staff.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Qualifications:</span>
                  <span className="font-semibold text-slate-800">{staff.qualification || 'B.Sc (Ed) / NCE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Roster Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Teaching Staff</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
