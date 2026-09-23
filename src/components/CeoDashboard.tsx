import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Boxes,
  Lock,
  Unlock,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  UserPlus,
  ArrowRight,
  LogOut,
  Building,
  GraduationCap,
  Sparkles,
  Printer,
  ChevronRight,
  X,
  Save,
  Briefcase,
  BookOpen,
  Layers,
  Award,
  UserCheck,
  CalendarCheck,
  Clock,
  Check,
  CreditCard,
  Zap,
  Grid,
  Table as TableIcon,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import { StudentProfile, StaffMember, SchoolClassDefinition } from '../types';
import {
  SCHOOL_CLASSES_LIST,
  ALL_SCHOOL_SUBJECTS,
  JUNIOR_CURRICULUM,
  SENIOR_SCIENCE_CURRICULUM,
  SENIOR_ART_CURRICULUM,
  SENIOR_COMMERCIAL_CURRICULUM,
  getSubjectCategory,
  getSubjectCode,
  matchesSubjectCategory,
  calculateGrade,
} from '../data/mockData';
import { StaffAllocationModal } from './StaffAllocationModal';
import { ClassDetailModal } from './ClassDetailModal';
import { StudentReportCardModal } from './StudentReportCardModal';
import { StudentRegistrationModal } from './StudentRegistrationModal';
import { formatStudentShortName, formatStaffName } from '../utils/formatters';
import { TeacherManagementModal } from './TeacherManagementModal';
import { SchoolFeesManagement } from './SchoolFeesManagement';
import { IndividualHoldResultModal } from './IndividualHoldResultModal';
import { BatchSubjectAllocationModal } from './BatchSubjectAllocationModal';

interface CeoDashboardProps {
  onExit: () => void;
  students: StudentProfile[];
  staffList: StaffMember[];
  classes: SchoolClassDefinition[];
  onToggleHoldResult: (studentId: string, hold: boolean, reason?: string) => Promise<boolean>;
  onBatchHoldClass: (classArm: string, hold: boolean, reason?: string) => Promise<boolean>;
  onRegisterStudent?: (studentData: Partial<StudentProfile>) => Promise<boolean>;
  onUpdateStudent: (studentId: string, updatedData: Partial<StudentProfile>) => Promise<boolean>;
  onDeleteStudent: (studentId: string) => Promise<boolean>;
  onAddStaff: (staffData: Partial<StaffMember>) => Promise<boolean>;
  onDeleteStaff: (staffId: string) => Promise<boolean>;
  onAssignFormMaster: (className: string, staffName: string, staffId?: string) => Promise<boolean>;
  onAssignSubjectTeacher: (className: string, subjectName: string, teacherName: string) => Promise<boolean>;
  onAssignStaffAllocations: (staffId: string, allocations: {
    subjectsTaught?: string[];
    assignedClasses?: string[];
    role?: StaffMember['role'];
    formMasterOf?: string;
    department?: StaffMember['department'];
  }) => Promise<boolean>;
  onUpdateStaff?: (staffId: string, updatedData: Partial<StaffMember>) => Promise<boolean>;
  onBatchAssignSubjects?: (
    targetClasses: string[],
    subjects: string[],
    mode?: 'add' | 'set' | 'remove'
  ) => Promise<boolean>;
  onUpdateClassCurriculum?: (
    className: string,
    subjects: string[],
    action?: 'add' | 'set' | 'remove'
  ) => Promise<boolean>;
  onUpdateStudentFeeStatus?: (
    studentId: string,
    feeStatus: 'Cleared' | 'Pending',
    amountPaid?: number,
    remarks?: string
  ) => Promise<boolean>;
  onBulkUpdateStudentFeeStatus?: (
    studentIds: string[] | null,
    classArm: string | null,
    feeStatus: 'Cleared' | 'Pending'
  ) => Promise<boolean>;
  onRefreshStudents?: () => Promise<void> | void;
}

export const CeoDashboard: React.FC<CeoDashboardProps> = ({
  onExit,
  students,
  staffList,
  classes,
  onToggleHoldResult,
  onBatchHoldClass,
  onRegisterStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddStaff,
  onDeleteStaff,
  onAssignFormMaster,
  onAssignSubjectTeacher,
  onAssignStaffAllocations,
  onUpdateStaff,
  onBatchAssignSubjects,
  onUpdateClassCurriculum,
  onUpdateStudentFeeStatus,
  onBulkUpdateStudentFeeStatus,
  onRefreshStudents,
}) => {
  // Navigation Tabs (Secondary School Administration)
  const [activeTab, setActiveTab] = useState<
    'classes' | 'staff' | 'curriculum' | 'students' | 'attendance' | 'fees'
  >('classes');

  // Curriculum Oversight & Batch Subject Allocation State
  const [isBatchSubjectModalOpen, setIsBatchSubjectModalOpen] = useState(false);
  const [initialSubjectForBatch, setInitialSubjectForBatch] = useState<string | undefined>(undefined);
  const [curriculumViewMode, setCurriculumViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [curriculumSearchQuery, setCurriculumSearchQuery] = useState('');
  const [curriculumCategoryFilter, setCurriculumCategoryFilter] = useState('ALL');
  const [curriculumSuccessNotice, setCurriculumSuccessNotice] = useState<string | null>(null);
  const [isProcessingCurriculumAction, setIsProcessingCurriculumAction] = useState(false);

  // Attendance oversight state
  const [allAttendanceLogs, setAllAttendanceLogs] = useState<any[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [attClassFilter, setAttClassFilter] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterHoldStatus, setFilterHoldStatus] = useState<'ALL' | 'HELD' | 'CLEARED'>('ALL');
  const [staffDeptFilter, setStaffDeptFilter] = useState<string>('ALL');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Selected entities for modals
  const [selectedClassForModal, setSelectedClassForModal] = useState<SchoolClassDefinition | null>(null);
  const [selectedStaffForAlloc, setSelectedStaffForAlloc] = useState<StaffMember | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<StudentProfile | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [individualHoldStudent, setIndividualHoldStudent] = useState<StudentProfile | null>(null);
  const [isIndividualHoldOpen, setIsIndividualHoldOpen] = useState(false);

  // Quick form master modal
  const [quickFormMasterClass, setQuickFormMasterClass] = useState<string | null>(null);
  const [quickFormMasterTeacher, setQuickFormMasterTeacher] = useState<string>('');

  // Management Modal States
  const [isTeacherManagerOpen, setIsTeacherManagerOpen] = useState(false);
  const [isRegisterStudentOpen, setIsRegisterStudentOpen] = useState(false);
  const [deletingStaffMember, setDeletingStaffMember] = useState<StaffMember | null>(null);

  // Notifications
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Quick Form Master Assignment
  const handleQuickAssignFormMaster = async (className: string) => {
    if (!quickFormMasterTeacher) return;
    const staff = staffList.find((s) => s.name === quickFormMasterTeacher);
    const success = await onAssignFormMaster(className, quickFormMasterTeacher, staff?.id);
    if (success) {
      notify(`Assigned ${quickFormMasterTeacher} as Form Master of ${className}`);
      setQuickFormMasterClass(null);
      setQuickFormMasterTeacher('');
    }
  };

  const [isRefreshingDb, setIsRefreshingDb] = useState(false);

  // Filter students based on UI selections with intelligent global search
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.admissionNo || '').toLowerCase().includes(q) ||
        (s.classArm || '').toLowerCase().includes(q) ||
        (s.level || '').toLowerCase().includes(q) ||
        (s.stream || '').toLowerCase().includes(q) ||
        (s.guardianName || '').toLowerCase().includes(q);

      // When searching by name/reg number, don't let class filter hide the match
      const matchesClass = q ? true : (filterClass === 'ALL' || s.classArm === filterClass);
      const matchesLevel = q ? true : (filterLevel === 'ALL' || s.level === filterLevel);
      const matchesHold =
        filterHoldStatus === 'ALL'
          ? true
          : filterHoldStatus === 'HELD'
          ? s.resultHeld
          : !s.resultHeld;

      return matchesSearch && matchesClass && matchesLevel && matchesHold;
    });
  }, [students, searchQuery, filterClass, filterLevel, filterHoldStatus]);

  // Filter staff
  const filteredStaff = staffList.filter((st) => {
    const matchesDept = staffDeptFilter === 'ALL' || st.department === staffDeptFilter;
    const matchesSearch =
      st.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      st.role.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      st.subjectsTaught.some((sub) => sub.toLowerCase().includes(staffSearchQuery.toLowerCase())) ||
      (st.formMasterOf && st.formMasterOf.toLowerCase().includes(staffSearchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const totalStudentsCount = students.length;
  const heldCount = students.filter((s) => s.resultHeld).length;
  const releasedCount = totalStudentsCount - heldCount;
  const totalClassesCount = classes.length;
  const assignedFormMastersCount = classes.filter((c) => c.classMaster && c.classMaster !== 'Unassigned').length;

  // Fetch live attendance registers from Firestore when tab is active
  useEffect(() => {
    if (activeTab === 'attendance') {
      setIsLoadingAttendance(true);
      fetch('/api/attendance')
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.attendanceRecords)) {
            setAllAttendanceLogs(data.attendanceRecords);
          }
        })
        .catch(() => {
          // Graceful fallback to existing registers
        })
        .finally(() => setIsLoadingAttendance(false));
    }
  }, [activeTab]);

  // Overall attendance rate across entire student body (derived mathematically from student profiles who have records)
  const studentsWithRecords = students.filter((s) => (s.timesSchoolOpened || 0) > 0);
  const overallAvgAttendance = studentsWithRecords.length > 0
    ? Math.round((studentsWithRecords.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / studentsWithRecords.length) * 10) / 10
    : 0;
  const studentsMeetingRequirement = studentsWithRecords.filter((s) => (s.attendanceRate || 0) >= 75).length;
  const studentsBelowRequirement = studentsWithRecords.length - studentsMeetingRequirement;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden min-w-0">
      {/* College Administration Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xl shadow-xs shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-900/70 text-blue-200 border border-blue-700/50">
                  Administration
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Academic Session 2026/2027 · Term 1
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif-title tracking-tight text-white">
                College Administration
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Manage classes, faculty allocations, fee clearances, and examination records.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setIsRegisterStudentOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer min-h-[38px]"
              id="admin-register-student-header-btn"
              title="Register New Student: JSS 1 to SS 3"
            >
              <UserPlus className="w-3.5 h-3.5 text-white shrink-0" />
              <span>+ Register Student</span>
            </button>

            <button
              onClick={() => setIsTeacherManagerOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              id="admin-teacher-management-header-btn"
              title="Teacher & Staff Management: Add, Delete, Form Masters & Subjects"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Faculty Management</span>
            </button>

            <button
              onClick={() => {
                setIndividualHoldStudent(null);
                setIsIndividualHoldOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              id="admin-hold-individual-result-header-btn"
              title="Hold or Release an Individual Student's Result"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Result Clearance</span>
            </button>

            <button
              onClick={onExit}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Administration High-Level Metrics (Interactive Overview Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block group-hover:text-blue-600 transition-colors">
              School Class Arms
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalClassesCount} Classes</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">JSS 1A to SS 3 Commercial</span>
          </div>
          <span className="text-[11px] font-bold text-blue-600 mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Explore 14 Classes</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block group-hover:text-blue-600 transition-colors">
              Form Masters Assigned
            </span>
            <div className="text-2xl font-black text-blue-900 mt-1 font-mono">
              {assignedFormMastersCount} / {totalClassesCount}
            </div>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
              {assignedFormMastersCount === totalClassesCount ? 'All Classes Covered' : 'Pending Allocation'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-600 mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Manage Faculty Roster</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block group-hover:text-blue-600 transition-colors">
              Enrolled Students
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalStudentsCount}</div>
            <span className={`text-[11px] font-semibold mt-0.5 block ${totalStudentsCount === 0 ? 'text-slate-400' : 'text-blue-900'}`}>
              {totalStudentsCount === 0 ? 'No data yet' : `${releasedCount} Released · ${heldCount} Held`}
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-600 mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>View Student Registry</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block group-hover:text-blue-600 transition-colors">
              School Fees & Bursary
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {students.filter(s => s.feeStatus === 'Cleared').length} / {totalStudentsCount}
            </div>
            <span className="text-[11px] text-slate-600 font-semibold mt-0.5 block">
              Scholars Cleared · {students.filter(s => s.feeStatus !== 'Cleared').length} Outstanding
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-600 mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Review Fee Clearances</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Main Administrative Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none w-full max-w-full min-w-0">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'classes'
              ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Classes ({totalClassesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'staff'
              ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Teachers ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'curriculum'
              ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Subjects</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Students ({totalStudentsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
          id="admin-tab-attendance-btn"
        >
          <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'fees'
              ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
          id="admin-tab-school-fees-btn"
        >
          <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
          <span>Bursary & Fees</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL CLASSES & ARMS (14 Classes Hub & Form Master Assignments)       */}
      {/* ========================================================================= */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                14 School Classes Command Hub
              </h2>
              <p className="text-xs text-slate-500">
                Manage all class arms from JSS 1 to SS 3. Assign Form Masters, configure curriculum subject teachers, and manage class student rosters.
              </p>
            </div>

            {/* Class Actions & Level Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                title="View & manage subjects allocated across classes"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-900" />
                <span>Curriculum Matrix →</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Level:</span>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="ALL">All Levels</option>
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                  <option value="SS 1">SS 1</option>
                  <option value="SS 2">SS 2</option>
                  <option value="SS 3">SS 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* 14 Class Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes
              .filter((c) => filterLevel === 'ALL' || c.level === filterLevel)
              .map((c) => {
                const classStudents = students.filter((s) => s.classArm === c.name);
                const classHeld = classStudents.filter((s) => s.resultHeld).length;
                const classAvg = classStudents.length > 0
                  ? (classStudents.reduce((acc, s) => acc + (s.termGpa || 0), 0) / classStudents.length).toFixed(1)
                  : null;

                return (
                  <div
                    key={c.name}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-900 border border-blue-200">
                          {c.level} · {c.stream}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {c.room}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 font-serif-title">
                        {c.name}
                      </h3>

                      {/* Enrolled & Capacity Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Enrolled Roster:</span>
                          <span className="font-bold text-slate-900">
                            {classStudents.length} / {c.capacity} Students
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-900 rounded-full"
                            style={{ width: `${Math.min(100, (classStudents.length / c.capacity) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Form Master Box */}
                      <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Form Master</span>
                          </span>
                          {quickFormMasterClass === c.name ? (
                            <button
                              onClick={() => {
                                setQuickFormMasterClass(null);
                                setQuickFormMasterTeacher('');
                              }}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setQuickFormMasterClass(c.name);
                                setQuickFormMasterTeacher(c.classMaster);
                              }}
                              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline"
                            >
                              {c.classMaster && c.classMaster !== 'Unassigned' ? 'Change' : 'Assign'}
                            </button>
                          )}
                        </div>

                        {quickFormMasterClass === c.name ? (
                          <div className="space-y-2 pt-1">
                            <select
                              value={quickFormMasterTeacher}
                              onChange={(e) => setQuickFormMasterTeacher(e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                            >
                              <option value="Unassigned">-- Select Teacher --</option>
                              {staffList.map((st) => (
                                <option key={st.id} value={st.name}>
                                  {st.title} {st.name} ({st.department})
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickAssignFormMaster(c.name)}
                                className="flex-1 py-1 px-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors"
                              >
                                Save
                              </button>
                              {c.classMaster && c.classMaster !== 'Unassigned' && (
                                <button
                                  onClick={async () => {
                                    await onAssignFormMaster(c.name, 'Unassigned');
                                    notify(`Removed Form Master for ${c.name}`);
                                    setQuickFormMasterClass(null);
                                  }}
                                  className="py-1 px-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] rounded-lg transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {c.classMaster && c.classMaster !== 'Unassigned' ? (
                              <span>{c.classMaster}</span>
                            ) : (
                              <span className="text-slate-400 italic">No Form Master Assigned</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Class Stats Summary */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Average GPA</span>
                          <span className="font-mono font-bold text-slate-900">
                            {classAvg !== null ? `${classAvg}%` : 'No data yet'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">Held Results</span>
                          <span className={`font-mono font-bold ${classHeld > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {classHeld} Held
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Open Class Command Hub Button */}
                    <button
                      onClick={() => setSelectedClassForModal(c)}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Manage Class & Teachers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STAFF & ROLE ALLOCATIONS (Assign Subjects, Classes & Form Masters) */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Teachers Directory & Workload Allocations
              </h2>
              <p className="text-xs text-slate-500">
                Assign subjects taught, designated classes, institutional roles, and Form Master appointments.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsTeacherManagerOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer min-h-[38px]"
                id="open-teacher-management-hub-btn"
                title="Add new teachers, manage faculty directory, and configure Form Masters & subjects"
              >
                <GraduationCap className="w-4 h-4 text-white" />
                <span>+ Add & Manage Teachers</span>
              </button>
            </div>
          </div>

          {/* Search & Department Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 w-full max-w-full min-w-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto min-w-0 scrollbar-none">
              {['ALL', 'Sciences', 'Arts', 'Commercial', 'General', 'Administration'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setStaffDeptFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    staffDeptFilter === dept
                      ? 'bg-blue-950 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept === 'ALL' ? 'All Departments' : dept}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff by name or subject..."
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          {/* Teachers Table with Responsive Horizontal Scroll */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full max-w-full min-w-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Teacher / Staff Member</th>
                    <th className="py-3 px-3">Department & Role</th>
                    <th className="py-3 px-3">Form Master / Mistress</th>
                    <th className="py-3 px-3">Subjects Taught</th>
                    <th className="py-3 px-3">Assigned Classes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 px-4 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-blue-900 border border-sky-200 flex items-center justify-center mx-auto">
                            <GraduationCap className="w-6 h-6 text-blue-800" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">
                            {staffSearchQuery || staffDeptFilter !== 'ALL'
                              ? 'No staff found matching current filters'
                              : 'No data yet (0 teachers registered)'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {staffSearchQuery || staffDeptFilter !== 'ALL'
                              ? 'Try resetting the department filter or clearing the search box.'
                              : 'No teachers or staff members have been added to the college directory yet. Click "+ Add Teacher" to configure teaching personnel.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsTeacherManagerOpen(true)}
                            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>+ Add Teacher</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                    const designation =
                      staff.formDesignation ||
                      (staff.role === 'Form Mistress' ||
                      staff.title === 'Mrs.' ||
                      staff.title === 'Miss' ||
                      staff.title === 'Lady'
                        ? 'Form Mistress'
                        : 'Form Master');

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {staff.name.replace(/^(Dr\.|Mrs\.|Mr\.|Miss|Engr\.|Lady|Rev\.|Barr\.)\s*/, '').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{staff.title} {formatStaffName(staff.name)}</span>
                              <span className="text-[10px] text-slate-400">{staff.qualification || staff.email}</span>
                            </div>
                          </div>
                        </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800 block">{staff.role}</span>
                        <span className="text-[10px] text-slate-500">{staff.department} Dept</span>
                      </td>
                      <td className="py-3.5 px-3">
                        {staff.formMasterOf ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>{designation}: <strong>{staff.formMasterOf}</strong></span>
                            </span>
                            <div>
                              <button
                                onClick={() => setSelectedStaffForAlloc(staff)}
                                className="text-[10px] font-bold text-blue-900 hover:underline"
                              >
                                Change Assignment
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedStaffForAlloc(staff)}
                            className="px-2 py-1 rounded-lg border border-dashed border-sky-300 hover:border-blue-400 hover:bg-sky-50 text-slate-600 hover:text-blue-900 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="w-3 h-3 text-blue-600" />
                            <span>Assign Form Master/Mistress</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {staff.subjectsTaught.slice(0, 3).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
                              {s}
                            </span>
                          ))}
                          {staff.subjectsTaught.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-bold self-center">
                              +{staff.subjectsTaught.length - 3} more
                            </span>
                          )}
                          {staff.subjectsTaught.length === 0 && (
                            <span className="text-slate-400 text-[10px]">None assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {staff.assignedClasses.slice(0, 3).map((c) => (
                              <span key={c} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-semibold">
                                {c}
                              </span>
                            ))}
                            {staff.assignedClasses.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-bold self-center">
                                +{staff.assignedClasses.length - 3} more
                              </span>
                            )}
                            {staff.assignedClasses.length === 0 && (
                              <span className="text-slate-400 text-[10px]">None</span>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedStaffForAlloc(staff)}
                            className="text-[10px] font-bold text-blue-900 hover:underline block cursor-pointer"
                          >
                            Assign Classes ({staff.assignedClasses.length})
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStaffForAlloc(staff)}
                            className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Assign Subjects, Classes & Form Master/Mistress"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assign Workload</span>
                          </button>
                          <button
                            onClick={() => setDeletingStaffMember(staff)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
      {/* TAB 3: SUBJECT ALLOCATIONS & CURRICULUM MANAGEMENT                       */}
      {/* ========================================================================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-5">
          {/* Success / Alert notice */}
          {curriculumSuccessNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{curriculumSuccessNotice}</span>
            </div>
          )}

          {/* Academic Board Command Suite Header */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                    Academic Board & Registrar Portal
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    14 Active Class Arms
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-serif-title text-white">
                  14-Class Curriculum Allocation & Subject Teacher Registry
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Assign subjects (e.g. English Language, Mathematics, Civic Education) across all 14 classes.
                  Changes immediately synchronize student continuous assessment scorecards, academic reports, and portal views.
                </p>
              </div>

              {/* Organized Action Suite: Presets + Custom Matrix */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline-block">
                    Presets:
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!onBatchAssignSubjects) return;
                      setIsProcessingCurriculumAction(true);
                      const compulsory = ['English Language', 'Mathematics', 'Civic Education', 'Data Processing / ICT'];
                      await onBatchAssignSubjects([...SCHOOL_CLASSES_LIST], compulsory, 'add');
                      setIsProcessingCurriculumAction(false);
                      setCurriculumSuccessNotice('Assigned 4 Core Compulsory subjects (English, Maths, Civic Ed, ICT) to all 14 classes.');
                      setTimeout(() => setCurriculumSuccessNotice(null), 3500);
                    }}
                    disabled={isProcessingCurriculumAction}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Assign English, Mathematics, Civic Education & ICT to all 14 classes"
                  >
                    <Zap className="w-3 h-3 text-amber-300" />
                    <span>4 Core (All 14)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!onBatchAssignSubjects) return;
                      setIsProcessingCurriculumAction(true);
                      const juniorClasses = ['JSS 1A', 'JSS 1B', 'JSS 2A', 'JSS 2B', 'JSS 3A', 'JSS 3B'];
                      await onBatchAssignSubjects(juniorClasses, JUNIOR_CURRICULUM, 'add');
                      setIsProcessingCurriculumAction(false);
                      setCurriculumSuccessNotice('Assigned Standard Junior Curriculum (9 subjects) to all 6 JSS class arms.');
                      setTimeout(() => setCurriculumSuccessNotice(null), 3500);
                    }}
                    disabled={isProcessingCurriculumAction}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                    title="Assign 9 standard junior subjects to JSS 1A - JSS 3B"
                  >
                    <span>Junior Standard (6 Arms)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!onBatchAssignSubjects) return;
                      setIsProcessingCurriculumAction(true);
                      await onBatchAssignSubjects(['SS 2 Science', 'SS 3 Science'], SENIOR_SCIENCE_CURRICULUM, 'add');
                      await onBatchAssignSubjects(['SS 2 Art', 'SS 3 Art'], SENIOR_ART_CURRICULUM, 'add');
                      await onBatchAssignSubjects(['SS 2 Commercial', 'SS 3 Commercial'], SENIOR_COMMERCIAL_CURRICULUM, 'add');
                      await onBatchAssignSubjects(
                        ['SS 1A', 'SS 1B'],
                        ['English Language', 'Mathematics', 'Civic Education', 'Economics', 'Biology', 'Chemistry', 'Physics', 'Government', 'Data Processing / ICT'],
                        'add'
                      );
                      setIsProcessingCurriculumAction(false);
                      setCurriculumSuccessNotice('Assigned Senior Secondary Science, Art & Commercial streams to respective classes.');
                      setTimeout(() => setCurriculumSuccessNotice(null), 3500);
                    }}
                    disabled={isProcessingCurriculumAction}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                    title="Assign specialized streams to Senior Secondary classes"
                  >
                    <span>Senior Streams (8 Arms)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setInitialSubjectForBatch(undefined);
                    setIsBatchSubjectModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Open Batch Subject Allocation Suite"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Batch Allocation Suite...</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filtering and View Switcher Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={curriculumSearchQuery}
                  onChange={(e) => setCurriculumSearchQuery(e.target.value)}
                  placeholder="Filter subjects by name or code (e.g. Maths, ENG, Physics)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'Sciences', 'Arts & Humanities', 'Commercial', 'General', 'Vocational & Tech'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCurriculumCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors shrink-0 ${
                      curriculumCategoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle: Matrix vs Cards */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-center">
              <button
                type="button"
                onClick={() => setCurriculumViewMode('matrix')}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  curriculumViewMode === 'matrix'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>14-Class Matrix</span>
              </button>
              <button
                type="button"
                onClick={() => setCurriculumViewMode('cards')}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  curriculumViewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-blue-600" />
                <span>Subject Cards</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: 14-CLASS GRID MATRIX */}
          {curriculumViewMode === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Interactive Curriculum Matrix · Click any cell to assign or remove subject from that class arm.</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Showing 14 classes across Junior & Senior secondary.
                </span>
              </div>

              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-3.5 bg-slate-100 min-w-[200px] border-r border-slate-200">
                        Subject Course
                      </th>
                      <th className="py-3 px-2 bg-slate-100 min-w-[90px] border-r border-slate-200 text-center">
                        Quick Action
                      </th>
                      {SCHOOL_CLASSES_LIST.map((cls) => {
                        const classDef = classes.find((c) => c.name === cls);
                        const curList = classDef?.curriculumSubjects || [];
                        const count = curList.length;
                        return (
                          <th
                            key={cls}
                            className="py-3 px-2 text-center min-w-[76px] border-r border-slate-200 last:border-r-0"
                          >
                            <span className="block font-bold text-slate-900 leading-tight">{cls}</span>
                            <span className="text-[9px] font-normal text-slate-500 block">
                              {count} subj
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ALL_SCHOOL_SUBJECTS.filter((subject) => {
                      const matchesSearch =
                        subject.toLowerCase().includes(curriculumSearchQuery.toLowerCase()) ||
                        getSubjectCode(subject).toLowerCase().includes(curriculumSearchQuery.toLowerCase());
                      const matchesCat = matchesSubjectCategory(subject, curriculumCategoryFilter);
                      return matchesSearch && matchesCat;
                    }).map((subject) => {
                      const code = getSubjectCode(subject);
                      const category = getSubjectCategory(subject);
                      const offeringCount = classes.filter((c) =>
                        c.curriculumSubjects ? c.curriculumSubjects.includes(subject) : false
                      ).length;

                      return (
                        <tr key={subject} className="hover:bg-slate-50/80 transition-colors">
                          {/* Subject Course Info */}
                          <td className="py-2.5 px-3.5 border-r border-slate-200 bg-white sticky left-0 z-5">
                            <div className="flex items-center justify-between gap-1.5">
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {subject}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono font-bold">
                                  {code} · {category}
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                {offeringCount}/14
                              </span>
                            </div>
                          </td>

                          {/* Quick Assign to All 14 Action */}
                          <td className="py-2.5 px-2 text-center border-r border-slate-200">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!onBatchAssignSubjects) return;
                                setIsProcessingCurriculumAction(true);
                                await onBatchAssignSubjects([...SCHOOL_CLASSES_LIST], [subject], 'add');
                                setIsProcessingCurriculumAction(false);
                                setCurriculumSuccessNotice(`Assigned ${subject} across all 14 class arms.`);
                                setTimeout(() => setCurriculumSuccessNotice(null), 3000);
                              }}
                              disabled={isProcessingCurriculumAction}
                              className="px-2 py-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-md border border-blue-200 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                              title={`Assign ${subject} to all 14 classes`}
                            >
                              All 14
                            </button>
                          </td>

                          {/* 14 Class Cells */}
                          {SCHOOL_CLASSES_LIST.map((cls) => {
                            const classDef = classes.find((c) => c.name === cls);
                            const isAssigned = classDef?.curriculumSubjects
                              ? classDef.curriculumSubjects.includes(subject)
                              : false;

                            return (
                              <td
                                key={cls}
                                className="py-2 px-1 text-center border-r border-slate-200 last:border-r-0"
                              >
                                {isAssigned ? (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (onUpdateClassCurriculum) {
                                        setIsProcessingCurriculumAction(true);
                                        await onUpdateClassCurriculum(cls, [subject], 'remove');
                                        setIsProcessingCurriculumAction(false);
                                        setCurriculumSuccessNotice(`Removed ${subject} from ${cls}.`);
                                        setTimeout(() => setCurriculumSuccessNotice(null), 2500);
                                      }
                                    }}
                                    disabled={isProcessingCurriculumAction}
                                    className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 hover:bg-rose-100 text-emerald-800 hover:text-rose-700 flex items-center justify-center transition-colors cursor-pointer group"
                                    title={`Assigned in ${cls}. Click to remove.`}
                                  >
                                    <Check className="w-3.5 h-3.5 group-hover:hidden" />
                                    <X className="w-3.5 h-3.5 hidden group-hover:block" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (onUpdateClassCurriculum) {
                                        setIsProcessingCurriculumAction(true);
                                        await onUpdateClassCurriculum(cls, [subject], 'add');
                                        setIsProcessingCurriculumAction(false);
                                        setCurriculumSuccessNotice(`Assigned ${subject} to ${cls}.`);
                                        setTimeout(() => setCurriculumSuccessNotice(null), 2500);
                                      }
                                    }}
                                    disabled={isProcessingCurriculumAction}
                                    className="w-7 h-7 mx-auto rounded-lg bg-slate-50 hover:bg-blue-100 text-slate-300 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                                    title={`Not assigned in ${cls}. Click to assign.`}
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: SUBJECT CARDS VIEW */}
          {curriculumViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_SCHOOL_SUBJECTS.filter((subject) => {
                const matchesSearch =
                  subject.toLowerCase().includes(curriculumSearchQuery.toLowerCase()) ||
                  getSubjectCode(subject).toLowerCase().includes(curriculumSearchQuery.toLowerCase());
                const matchesCat = matchesSubjectCategory(subject, curriculumCategoryFilter);
                return matchesSearch && matchesCat;
              }).map((subject) => {
                const teachers = staffList.filter((s) => s.subjectsTaught.includes(subject));
                const classesOffering = classes.filter((c) =>
                  c.curriculumSubjects ? c.curriculumSubjects.includes(subject) : false
                );
                const code = getSubjectCode(subject);
                const category = getSubjectCategory(subject);

                return (
                  <div
                    key={subject}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm block leading-snug">
                            {subject}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {code}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            category === 'Sciences'
                              ? 'bg-blue-100 text-blue-900'
                              : category === 'Arts & Humanities'
                              ? 'bg-purple-100 text-purple-900'
                              : category === 'Commercial'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {category}
                        </span>
                      </div>

                      {/* Offering Coverage Indicator */}
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Class Coverage:</span>
                        <span className="font-bold text-slate-800">
                          {classesOffering.length} of 14 Classes
                        </span>
                      </div>

                      {/* Teachers Info */}
                      <div className="text-xs space-y-1">
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">
                          Instructors:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {teachers.map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-semibold border border-amber-200 text-[11px]"
                            >
                              {t.name}
                            </span>
                          ))}
                          {teachers.length === 0 && (
                            <span className="text-rose-600 font-medium text-[11px]">
                              No teachers allocated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!onBatchAssignSubjects) return;
                            setIsProcessingCurriculumAction(true);
                            await onBatchAssignSubjects([...SCHOOL_CLASSES_LIST], [subject], 'add');
                            setIsProcessingCurriculumAction(false);
                            setCurriculumSuccessNotice(`Assigned ${subject} to all 14 classes.`);
                            setTimeout(() => setCurriculumSuccessNotice(null), 3000);
                          }}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          + All 14
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!onBatchAssignSubjects) return;
                            const jss = ['JSS 1A', 'JSS 1B', 'JSS 2A', 'JSS 2B', 'JSS 3A', 'JSS 3B'];
                            setIsProcessingCurriculumAction(true);
                            await onBatchAssignSubjects(jss, [subject], 'add');
                            setIsProcessingCurriculumAction(false);
                            setCurriculumSuccessNotice(`Assigned ${subject} to 6 Junior classes.`);
                            setTimeout(() => setCurriculumSuccessNotice(null), 3000);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          + 6 Junior
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setInitialSubjectForBatch(subject);
                          setIsBatchSubjectModalOpen(true);
                        }}
                        className="text-blue-900 font-bold hover:underline cursor-pointer"
                      >
                        Allocate... →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 6-YEAR STUDENT ROLL & INDIVIDUAL RESULT HOLD MANAGEMENT              */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Class Filter:
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="ALL">All 14 Classes</option>
                  {SCHOOL_CLASSES_LIST.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Result Status:
                </label>
                <select
                  value={filterHoldStatus}
                  onChange={(e) => setFilterHoldStatus(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="ALL">All Results</option>
                  <option value="CLEARED">Cleared / Released</option>
                  <option value="HELD">Held by Admin</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, reg no, class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-900"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Database Refresh & Sync Button */}
              <button
                type="button"
                disabled={isRefreshingDb}
                onClick={async () => {
                  setIsRefreshingDb(true);
                  try {
                    if (onRefreshStudents) {
                      await onRefreshStudents();
                    } else {
                      const res = await fetch('/api/students');
                      if (res.ok) {
                        const fresh = await res.json();
                        if (Array.isArray(fresh)) {
                          notify(`Live database synchronized: ${fresh.length} students loaded.`);
                        }
                      }
                    }
                    notify(`Database sync completed. Total records: ${students.length}`);
                  } catch (e) {
                    console.error('Refresh failed:', e);
                  } finally {
                    setIsRefreshingDb(false);
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer min-h-[40px] border border-slate-200"
                title="Synchronize and pull latest student records from live Cloud Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshingDb ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">{isRefreshingDb ? 'Syncing...' : 'Sync DB'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRegisterStudentOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer min-h-[40px]"
                title="Open Official Admission & Registration Form"
              >
                <UserPlus className="w-3.5 h-3.5 text-white" />
                <span>+ Register Student</span>
              </button>
            </div>
          </div>

          {/* Students Table with Responsive Horizontal Scroll */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full max-w-full min-w-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Adm No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3">Class Arm</th>
                  <th className="py-3 px-3 text-center">Fees</th>
                  <th className="py-3 px-3 text-center">Term GPA</th>
                  <th className="py-3 px-3 text-center">Result Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mx-auto">
                          <Users className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {searchQuery || filterClass !== 'ALL' || filterHoldStatus !== 'ALL'
                            ? 'No students found matching your criteria'
                            : 'No data yet (0 students registered)'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {searchQuery || filterClass !== 'ALL' || filterHoldStatus !== 'ALL'
                            ? 'Try clearing the search box or selecting "All 14 Classes".'
                            : 'No students have been registered in the college database yet. Click the "+ Register Student" button below to enroll new students.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsRegisterStudentOpen(true)}
                          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Register Student</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {student.admissionNo}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{formatStudentShortName(student.name)}</span>
                      <span className="text-[10px] text-slate-400">{student.guardianName || 'Guardian'}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {student.classArm}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          student.feeStatus === 'Cleared' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {student.termGpa}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          student.resultHeld ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                        title={student.resultHeld ? (student.holdReason || 'Withheld by Administration') : 'Released'}
                      >
                        {student.resultHeld ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{student.resultHeld ? 'WITHHELD' : 'RELEASED'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setIndividualHoldStudent(student);
                            setIsIndividualHoldOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] shadow-2xs active:scale-95 ${
                            student.resultHeld
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                          title={student.resultHeld ? 'Release Result' : 'Hold Result'}
                        >
                          {student.resultHeld ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{student.resultHeld ? 'Release' : 'Hold'}</span>
                        </button>
                        <button
                          onClick={() => setReportCardStudent(student)}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all min-h-[36px] cursor-pointer shadow-xs active:scale-95"
                          title="Generate Official Student Report Card"
                        >
                          Report
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete ${student.name}?`)) {
                              await onDeleteStudent(student.id);
                              notify(`Removed student: ${student.name}`);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all min-h-[36px] flex items-center justify-center cursor-pointer border border-rose-200 active:scale-95"
                          title="Delete Student Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COLLEGE ATTENDANCE OVERSIGHT (Institutional Registers & Tracking)   */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* High-Level Attendance Metrics (Mature White & Blue) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                College Average Rate
              </span>
              <div className="text-2xl font-black text-blue-950 mt-1 font-mono">{overallAvgAttendance}%</div>
              <span className="text-[11px] text-blue-700 font-semibold mt-0.5 block">
                {overallAvgAttendance >= 75 ? 'Statutory Minimum Satisfied' : 'Attention Required'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Eligible for Exams (≥75%)
              </span>
              <div className="text-2xl font-black text-blue-950 mt-1 font-mono">{studentsMeetingRequirement} Students</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {students.length > 0 ? `${Math.round((studentsMeetingRequirement / students.length) * 100)}% of Student Body` : 'No data'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Attendance Deficit (&lt;75%)
              </span>
              <div className={`text-2xl font-black mt-1 font-mono ${studentsBelowRequirement > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                {studentsBelowRequirement} Students
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Requires counseling & warning</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                Registers In Cloud Database
              </span>
              <div className="text-2xl font-black text-blue-950 mt-1 font-mono">{allAttendanceLogs.length} Records</div>
              <span className="text-[11px] text-blue-700 font-semibold mt-0.5 block">Live Cloud Firestore</span>
            </div>
          </div>

          {/* Class-by-Class Attendance Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Class Arms Attendance Roster (14 Academic Arms)
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time statutory roll verification across all junior and senior divisions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Filter Arm:</span>
                <select
                  value={attClassFilter}
                  onChange={(e) => setAttClassFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All 14 Classes</option>
                  {SCHOOL_CLASSES_LIST.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold text-[10px]">
                    <th className="py-2.5 px-3">Class Arm</th>
                    <th className="py-2.5 px-3">Form Master</th>
                    <th className="py-2.5 px-3">Enrolled</th>
                    <th className="py-2.5 px-3">Average Rate</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes
                    .filter((cls) => attClassFilter === 'ALL' || cls.name === attClassFilter)
                    .map((cls) => {
                      const classStdList = students.filter((s) => s.classArm === cls.name);
                      const classRecordedStdList = classStdList.filter((s) => (s.timesSchoolOpened || 0) > 0);
                      const classAvg = classRecordedStdList.length > 0
                        ? Math.round((classRecordedStdList.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / classRecordedStdList.length) * 10) / 10
                        : 0;
                      return (
                        <tr key={cls.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 font-bold text-slate-900">{cls.name}</td>
                          <td className="py-3 px-3 text-slate-700">
                            {cls.classMaster || <span className="text-slate-400 italic font-medium">Unassigned</span>}
                          </td>
                          <td className="py-3 px-3 font-mono">{classStdList.length} Students</td>
                          <td className="py-3 px-3 font-bold font-mono text-slate-800">
                            {classRecordedStdList.length > 0 ? `${classAvg}%` : 'Pending Roll'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              classRecordedStdList.length === 0
                                ? 'bg-slate-100 text-slate-600'
                                : classAvg >= 75
                                ? 'bg-blue-900 text-white'
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              {classRecordedStdList.length === 0 ? 'Pending Roll' : classAvg >= 75 ? 'Cleared (≥75%)' : 'Deficit (<75%)'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setFilterClass(cls.name);
                                setActiveTab('students');
                              }}
                              className="text-blue-900 hover:underline font-bold text-[11px]"
                            >
                              View Students →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Registers Logged to Database */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cloud Firestore Official Attendance Records
                </h3>
                <p className="text-xs text-slate-500">
                  Persistent attendance roll entries logged by Form Masters & Tutors
                </p>
              </div>
              <button
                onClick={() => {
                  setIsLoadingAttendance(true);
                  fetch('/api/attendance')
                    .then((r) => r.json())
                    .then((data) => {
                      if (data && Array.isArray(data.attendanceRecords)) {
                        setAllAttendanceLogs(data.attendanceRecords);
                      }
                    })
                    .finally(() => setIsLoadingAttendance(false));
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>{isLoadingAttendance ? 'Refreshing...' : '↻ Refresh Registers'}</span>
              </button>
            </div>

            {allAttendanceLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-1">
                <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                <p className="font-bold text-slate-700">No attendance registers submitted yet.</p>
                <p>When Form Masters submit morning rolls from the Teacher Console, records will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allAttendanceLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const records: any[] = Array.isArray(log.records) ? log.records : [];
                  const presentCount = records.filter((r) => r.status === 'Present').length;
                  const absentCount = records.filter((r) => r.status === 'Absent').length;
                  const lateCount = records.filter((r) => r.status === 'Late').length;

                  return (
                    <div key={log.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                            {log.className ? log.className.substring(0, 3) : 'DGC'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{log.className}</span>
                              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {log.date}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 block">
                              Marked by <strong>{log.markedBy || 'Form Master'}</strong> · {log.sessionPeriod || 'Morning Assembly'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="px-2 py-0.5 bg-blue-950 text-white rounded font-bold text-[10px]">
                              {presentCount} Present
                            </span>
                            {absentCount > 0 && (
                              <span className="px-2 py-0.5 bg-slate-800 text-white rounded font-bold text-[10px]">
                                {absentCount} Absent
                              </span>
                            )}
                            {lateCount > 0 && (
                              <span className="px-2 py-0.5 bg-blue-700 text-white rounded font-bold text-[10px]">
                                {lateCount} Late
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="px-3 py-1 bg-white border border-blue-200 hover:bg-blue-50 text-blue-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              {isExpanded ? 'Hide Roll ▲' : 'View Roll ▼'}
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Delete attendance register for ${log.className} on ${log.date}? This will recompute official attendance rates in the database.`)) {
                                  try {
                                    const res = await fetch(`/api/attendance/${encodeURIComponent(log.id)}`, { method: 'DELETE' });
                                    if (res.ok) {
                                      setAllAttendanceLogs((prev) => prev.filter((item) => item.id !== log.id));
                                    }
                                  } catch (err) {
                                    console.error('Failed to delete attendance log:', err);
                                  }
                                }
                              }}
                              className="p-1.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete this attendance register"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Roll Detail */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-slate-200/80">
                          <h4 className="text-xs font-bold text-slate-700 mb-2">Detailed Roll Entries ({records.length} Students):</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {records.map((rec: any, rIdx: number) => {
                              const std = students.find((s) => s.id === rec.studentId);
                              return (
                                <div key={rIdx} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                                  <div className="truncate pr-2">
                                    <span className="font-bold text-slate-900 block truncate">
                                      {std ? std.name : rec.studentId}
                                    </span>
                                    {rec.remarks && (
                                      <span className="text-[10px] text-slate-400 block truncate italic">
                                        "{rec.remarks}"
                                      </span>
                                    )}
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                                    rec.status === 'Present'
                                      ? 'bg-blue-950 text-white'
                                      : rec.status === 'Late'
                                      ? 'bg-blue-700 text-white'
                                      : rec.status === 'Excused'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-800 text-white'
                                  }`}>
                                    {rec.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SCHOOL FEES & BURSARY (Base Tuition, Project Fee & Whole Student Roll) */}
      {/* ========================================================================= */}
      {activeTab === 'fees' && (
        <SchoolFeesManagement
          students={students}
          classes={classes}
          onUpdateStudentFeeStatus={onUpdateStudentFeeStatus}
          onBulkUpdateStudentFeeStatus={onBulkUpdateStudentFeeStatus}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK FORM MASTER ASSIGNMENT                                       */}
      {/* ========================================================================= */}
      {quickFormMasterClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Assign Form Master: {quickFormMasterClass}</span>
              </div>
              <button onClick={() => setQuickFormMasterClass(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select which teacher will serve as the designated Form Master for <strong>{quickFormMasterClass}</strong>. Their name and conduct endorsement will appear on student report cards.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Select Teacher:
              </label>
              <select
                value={quickFormMasterTeacher}
                onChange={(e) => setQuickFormMasterTeacher(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="">-- Choose Teacher --</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.title} {st.name} ({st.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setQuickFormMasterClass(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleQuickAssignFormMaster(quickFormMasterClass)}
                disabled={!quickFormMasterTeacher}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 cursor-pointer"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STAFF ALLOCATION WORKLOAD                                          */}
      {/* ========================================================================= */}
      {selectedStaffForAlloc && (
        <StaffAllocationModal
          staff={selectedStaffForAlloc}
          classes={classes}
          onClose={() => setSelectedStaffForAlloc(null)}
          onSave={async (allocations) => {
            const success = await onAssignStaffAllocations(selectedStaffForAlloc.id, allocations);
            if (success) {
              notify(`Successfully updated workload allocations for ${selectedStaffForAlloc.name}`);
            }
            return success;
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLASS DETAIL COMMAND HUB                                           */}
      {/* ========================================================================= */}
      {selectedClassForModal && (
        <ClassDetailModal
          schoolClass={classes.find((c) => c.name === selectedClassForModal.name) || selectedClassForModal}
          students={students}
          staffList={staffList}
          onClose={() => setSelectedClassForModal(null)}
          onAssignFormMaster={onAssignFormMaster}
          onAssignSubjectTeacher={onAssignSubjectTeacher}
          onUpdateClassCurriculum={onUpdateClassCurriculum}
          onToggleHoldResult={onToggleHoldResult}
          onBatchHoldClass={onBatchHoldClass}
          onEditStudent={(s) => setEditingStudent(s)}
          onPreviewReportCard={(s) => setReportCardStudent(s)}
          onDeleteStudent={onDeleteStudent}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: BATCH SUBJECT ALLOCATION SUITE                                    */}
      {/* ========================================================================= */}
      {isBatchSubjectModalOpen && onBatchAssignSubjects && (
        <BatchSubjectAllocationModal
          isOpen={isBatchSubjectModalOpen}
          onClose={() => {
            setIsBatchSubjectModalOpen(false);
            setInitialSubjectForBatch(undefined);
          }}
          classes={classes}
          students={students}
          staffList={staffList}
          initialSelectedSubject={initialSubjectForBatch}
          onBatchAssignSubjects={onBatchAssignSubjects}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: TEACHER MANAGEMENT HUB (Add / Delete / Assign Classes & Form Master) */}
      {/* ========================================================================= */}
      {isTeacherManagerOpen && (
        <TeacherManagementModal
          staffList={staffList}
          classes={classes}
          onClose={() => setIsTeacherManagerOpen(false)}
          onAddStaff={onAddStaff}
          onDeleteStaff={onDeleteStaff}
          onAssignFormMaster={onAssignFormMaster}
          onAssignStaffAllocations={onAssignStaffAllocations}
          onUpdateStaff={onUpdateStaff}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE TEACHER CONFIRMATION                                        */}
      {/* ========================================================================= */}
      {deletingStaffMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Deactivate Teacher: {deletingStaffMember.title} {deletingStaffMember.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove this teacher from the teaching roster? If they are currently assigned as Form Master or Form Mistress, the class will become unassigned.
              </p>
              {deletingStaffMember.formMasterOf && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900 mt-2">
                  Currently Form Master/Mistress of: {deletingStaffMember.formMasterOf}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingStaffMember(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = deletingStaffMember;
                  setDeletingStaffMember(null);
                  const success = await onDeleteStaff(target.id);
                  if (success) {
                    notify(`Removed teacher: ${target.name}`);
                  }
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Delete Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STUDENT REPORT CARD PREVIEW                                        */}
      {/* ========================================================================= */}
      {reportCardStudent && (
        <StudentReportCardModal
          student={reportCardStudent}
          classes={classes}
          onClose={() => setReportCardStudent(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: INDIVIDUAL STUDENT RESULT HOLD / RELEASE CONTROLLER                 */}
      {/* ========================================================================= */}
      {isIndividualHoldOpen && (
        <IndividualHoldResultModal
          isOpen={isIndividualHoldOpen}
          onClose={() => {
            setIsIndividualHoldOpen(false);
            setIndividualHoldStudent(null);
          }}
          student={individualHoldStudent}
          allStudents={students}
          onToggleHoldResult={onToggleHoldResult}
          onSuccess={(msg) => notify(msg)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL STUDENT REGISTRATION & ADMISSION FORM (ADMIN ONLY)        */}
      {/* ========================================================================= */}
      {isRegisterStudentOpen && (
        <StudentRegistrationModal
          isOpen={isRegisterStudentOpen}
          onClose={() => setIsRegisterStudentOpen(false)}
          onRegisterStudent={onRegisterStudent || (async () => false)}
          classes={classes}
          existingStudents={students}
        />
      )}
    </div>
  );
};
