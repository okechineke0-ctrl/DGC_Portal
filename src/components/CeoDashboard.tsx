import React, { useState } from 'react';
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
} from 'lucide-react';
import { StudentProfile, StaffMember, SchoolClassDefinition } from '../types';
import {
  SCHOOL_CLASSES_LIST,
  ALL_SCHOOL_SUBJECTS,
  calculateGrade,
} from '../data/mockData';
import { StaffAllocationModal } from './StaffAllocationModal';
import { ClassDetailModal } from './ClassDetailModal';
import { StudentReportCardModal } from './StudentReportCardModal';

interface CeoDashboardProps {
  onExit: () => void;
  students: StudentProfile[];
  staffList: StaffMember[];
  classes: SchoolClassDefinition[];
  onToggleHoldResult: (studentId: string, hold: boolean, reason?: string) => Promise<boolean>;
  onBatchHoldClass: (classArm: string, hold: boolean, reason?: string) => Promise<boolean>;
  onRegisterStudent: (studentData: Partial<StudentProfile>) => Promise<boolean>;
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
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'classes' | 'staff' | 'curriculum' | 'students' | 'register' | 'broadsheet'
  >('classes');

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

  // Quick form master modal
  const [quickFormMasterClass, setQuickFormMasterClass] = useState<string | null>(null);
  const [quickFormMasterTeacher, setQuickFormMasterTeacher] = useState<string>('');

  // Add Staff Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    title: 'Mr.',
    name: '',
    department: 'Sciences',
    role: 'Subject Tutor',
    email: '',
    phone: '',
    qualification: "B.Sc (Ed)",
    subjectsTaught: [],
    assignedClasses: [],
  });

  // Notifications
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    admissionNo: '',
    gender: 'Male' as 'Male' | 'Female',
    dob: '2010-05-15',
    classArm: 'JSS 1A',
    level: 'JSS 1' as StudentProfile['level'],
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: 'Enugu, Nigeria',
    feeStatus: 'Cleared' as 'Cleared' | 'Owing',
    tuitionPaid: 185000,
    outstandingBalance: 0,
  });

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

  // Student registration handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.admissionNo) {
      alert('Please fill out student name and admission number.');
      return;
    }

    const defaultSubjects = [
      { code: 'MTH 101', name: 'Mathematics', homework: 9, test1: 9, test2: 8, practical: 9, caTotal: 35, exam: 54, total: 89, grade: 'A1', remark: 'Excellent' },
      { code: 'ENG 101', name: 'English Language', homework: 8, test1: 8, test2: 9, practical: 8, caTotal: 33, exam: 51, total: 84, grade: 'A1', remark: 'Distinction' },
      { code: 'CIV 101', name: 'Civic Education', homework: 8, test1: 9, test2: 8, practical: 9, caTotal: 34, exam: 52, total: 86, grade: 'A1', remark: 'Excellent' },
    ];

    const newStudentProfile: Partial<StudentProfile> = {
      ...regForm,
      subjects: defaultSubjects,
      termGpa: 86.3,
      termRank: '1st of 30',
      attendanceRate: 98,
      resultHeld: false,
    };

    const success = await onRegisterStudent(newStudentProfile);
    if (success) {
      notify(`Matriculated student: ${regForm.name} into ${regForm.classArm}`);
      setActiveTab('students');
      setRegForm({
        name: '',
        admissionNo: '',
        gender: 'Male',
        dob: '2010-05-15',
        classArm: 'JSS 1A',
        level: 'JSS 1',
        guardianName: '',
        guardianPhone: '',
        guardianEmail: '',
        address: 'Enugu, Nigeria',
        feeStatus: 'Cleared',
        tuitionPaid: 185000,
        outstandingBalance: 0,
      });
    }
  };

  // Add staff submission
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name) {
      alert('Please provide faculty name.');
      return;
    }
    const success = await onAddStaff(newStaff);
    if (success) {
      notify(`Registered faculty member: ${newStaff.name}`);
      setIsAddStaffOpen(false);
      setNewStaff({
        title: 'Mr.',
        name: '',
        department: 'Sciences',
        role: 'Subject Tutor',
        email: '',
        phone: '',
        qualification: "B.Sc (Ed)",
        subjectsTaught: [],
        assignedClasses: [],
      });
    }
  };

  // Filter students based on UI selections
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.classArm.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = filterClass === 'ALL' || s.classArm === filterClass;
    const matchesLevel = filterLevel === 'ALL' || s.level === filterLevel;
    const matchesHold =
      filterHoldStatus === 'ALL'
        ? true
        : filterHoldStatus === 'HELD'
        ? s.resultHeld
        : !s.resultHeld;

    return matchesSearch && matchesClass && matchesLevel && matchesHold;
  });

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* CEO Executive Control Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950 shadow-xs">
                  Central Administration & Governance
                </span>
                <span className="text-xs text-amber-200/90 font-semibold">
                  Chief Executive & Academic Directorate
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-title tracking-tight">
                Academic Administration & Staff Command
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                Manage 14 class arms · Assign Form Masters · Allocate subjects & faculty workloads · Access all student rosters & broadsheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('register')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Matriculate Student</span>
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin Mode</span>
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

      {/* Administration High-Level Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            School Class Arms
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalClassesCount} Classes</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">JSS 1A to SS 3 Commercial</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Form Masters Assigned
          </span>
          <div className="text-2xl font-black text-blue-900 mt-1 font-mono">
            {assignedFormMastersCount} / {totalClassesCount}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
            {assignedFormMastersCount === totalClassesCount ? 'All Classes Covered' : 'Pending Allocation'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Enrolled Students
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalStudentsCount}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            {releasedCount} Released · {heldCount} Held
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Faculty & Academic Staff
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">{staffList.length} Faculty</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Across 5 Academic Depts</span>
        </div>
      </div>

      {/* Main Administrative Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'classes'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>All Classes & Arms ({totalClassesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Staff & Role Allocations ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'curriculum'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subject Allocations</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'students'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>6-Year Student Roll ({totalStudentsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Matriculation Form</span>
        </button>

        <button
          onClick={() => setActiveTab('broadsheet')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'broadsheet'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Master Broadsheets</span>
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
                Manage all class arms from JSS 1 to SS 3. Assign Form Masters, configure curriculum subject teachers, and access student broadsheets.
              </p>
            </div>

            {/* Quick Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Level Filter:</span>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
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

          {/* 14 Class Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes
              .filter((c) => filterLevel === 'ALL' || c.level === filterLevel)
              .map((c) => {
                const classStudents = students.filter((s) => s.classArm === c.name);
                const classHeld = classStudents.filter((s) => s.resultHeld).length;
                const classAvg = classStudents.length > 0
                  ? (classStudents.reduce((acc, s) => acc + (s.termGpa || 0), 0) / classStudents.length).toFixed(1)
                  : '82.0';

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
                          <button
                            onClick={() => {
                              setQuickFormMasterClass(c.name);
                              setQuickFormMasterTeacher(c.classMaster);
                            }}
                            className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline"
                          >
                            Reassign
                          </button>
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {c.classMaster}
                        </div>
                      </div>

                      {/* Class Stats Summary */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Average GPA</span>
                          <span className="font-mono font-bold text-slate-900">{classAvg}%</span>
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
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Faculty Directory & Workload Allocations
              </h2>
              <p className="text-xs text-slate-500">
                Assign subjects taught, designated classes, institutional roles, and Form Master appointments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Faculty Member</span>
              </button>
            </div>
          </div>

          {/* Search & Department Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'Sciences', 'Arts', 'Commercial', 'General', 'Administration'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setStaffDeptFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    staffDeptFilter === dept
                      ? 'bg-blue-950 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept === 'ALL' ? 'All Departments' : dept}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
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

          {/* Faculty Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-3">Department & Role</th>
                  <th className="py-3 px-3">Form Master Class</th>
                  <th className="py-3 px-3">Subjects Taught</th>
                  <th className="py-3 px-3">Assigned Classes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {staff.name.replace(/^(Dr\.|Mrs\.|Mr\.|Engr\.|Lady|Barr\.)\s*/, '').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{staff.title} {staff.name}</span>
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>{staff.formMasterOf}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
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
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStaffForAlloc(staff)}
                          className="px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                          title="Assign Subjects, Classes & Form Master"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign Workload</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to deactivate ${staff.name}?`)) {
                              await onDeleteStaff(staff.id);
                              notify(`Removed staff member: ${staff.name}`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                          title="Remove Faculty"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SUBJECT ALLOCATIONS & CURRICULUM                                   */}
      {/* ========================================================================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">
              Master School Curriculum & Subject Teacher Allocations
            </h2>
            <p className="text-xs text-slate-500">
              Matrix of all subjects offered at Dominion Stars Global College, across Junior and Senior Secondary streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_SCHOOL_SUBJECTS.map((subject) => {
              const teachers = staffList.filter((s) => s.subjectsTaught.includes(subject));
              const classesOffering = classes.filter((c) =>
                c.curriculumSubjects ? c.curriculumSubjects.includes(subject) : true
              );

              return (
                <div key={subject} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{subject}</span>
                    <span className="text-[11px] font-bold text-blue-900 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                      {teachers.length} Teachers Assigned
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Assigned Faculty:</span>
                    <div className="flex flex-wrap gap-1">
                      {teachers.map((t) => (
                        <span key={t.id} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-semibold border border-amber-200 text-[11px]">
                          {t.name} ({t.department})
                        </span>
                      ))}
                      {teachers.length === 0 && (
                        <span className="text-rose-600 font-medium text-[11px]">No faculty assigned yet</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Offered across {classesOffering.length} classes</span>
                    <button
                      onClick={() => setActiveTab('staff')}
                      className="text-blue-900 font-bold hover:underline"
                    >
                      Assign Faculty →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 6-YEAR STUDENT ROLL                                                */}
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

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student by name, reg no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {student.admissionNo}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{student.name}</span>
                      <span className="text-[10px] text-slate-400">{student.guardianName}</span>
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
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          student.resultHeld ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {student.resultHeld ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{student.resultHeld ? 'Held' : 'Released'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleHoldResult(student.id, !student.resultHeld)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            student.resultHeld
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          }`}
                          title={student.resultHeld ? 'Release Result' : 'Hold Result'}
                        >
                          {student.resultHeld ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setReportCardStudent(student)}
                          className="px-2 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-200 transition-colors"
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
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MATRICULATION & REGISTRATION                                       */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold font-serif-title text-slate-900">
              Student Matriculation & Class Enrollment
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enroll a newly admitted student into any of the 14 official class arms with automated terminal broadsheet initialization.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Student Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chukwuemeka David Okafor"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Official Admission Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DGC/2026/0491"
                  value={regForm.admissionNo}
                  onChange={(e) => setRegForm({ ...regForm, admissionNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Class Arm *</label>
                <select
                  value={regForm.classArm}
                  onChange={(e) => {
                    const cls = e.target.value;
                    const level = cls.split(' ')[0] + ' ' + cls.split(' ')[1].charAt(0);
                    setRegForm({ ...regForm, classArm: cls, level: level as any });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {SCHOOL_CLASSES_LIST.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Gender</label>
                <select
                  value={regForm.gender}
                  onChange={(e) => setRegForm({ ...regForm, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chief & Mrs. Okafor"
                  value={regForm.guardianName}
                  onChange={(e) => setRegForm({ ...regForm, guardianName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Parent Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 0803 123 4567"
                  value={regForm.guardianPhone}
                  onChange={(e) => setRegForm({ ...regForm, guardianPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('classes')}
                className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Matriculate & Enroll</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: MASTER BROADSHEETS                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'broadsheet' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official College Terminal Broadsheet
              </h2>
              <p className="text-xs text-slate-500">
                First Term 2026/2027 Academic Session · WAEC/NECO Standard Grade Ledger
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterClass === 'ALL' ? 'SS 3 Science' : filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                {SCHOOL_CLASSES_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Broadsheet</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Standing</th>
                  <th className="py-3 px-3">Adm No</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Class Arm</th>
                  <th className="py-3 px-2 text-center">Attendance</th>
                  <th className="py-3 px-2 text-center">Average GPA</th>
                  <th className="py-3 px-3 text-center">Bursary</th>
                  <th className="py-3 px-3 text-center">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students
                  .filter((s) => filterClass === 'ALL' || s.classArm === filterClass)
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">{s.termRank}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{s.admissionNo}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-3 text-slate-600">{s.classArm}</td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700">{s.attendanceRate}%</td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-950">{s.termGpa}%</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.feeStatus === 'Cleared' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.feeStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.resultHeld ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {s.resultHeld ? 'Held' : 'Cleared'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK FORM MASTER ASSIGNMENT                                       */}
      {/* ========================================================================= */}
      {quickFormMasterClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
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
              Select which faculty member will serve as the designated Form Master for <strong>{quickFormMasterClass}</strong>. Their name and conduct endorsement will appear on student report cards.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Select Faculty Member:
              </label>
              <select
                value={quickFormMasterTeacher}
                onChange={(e) => setQuickFormMasterTeacher(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="">-- Choose Faculty --</option>
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
                className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs disabled:opacity-40"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD FACULTY MEMBER                                                 */}
      {/* ========================================================================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Faculty Member</h3>
              <button onClick={() => setIsAddStaffOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Title</label>
                  <select
                    value={newStaff.title}
                    onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Engr.">Engr.</option>
                    <option value="Lady">Lady</option>
                    <option value="Barr.">Barr.</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. Okoli"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Department</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Arts">Arts</option>
                    <option value="Commercial">Commercial</option>
                    <option value="General">General</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Subject Tutor">Subject Tutor</option>
                    <option value="Class Master">Class Master</option>
                    <option value="Head of Department">HOD</option>
                    <option value="Dean of Studies">Dean of Studies</option>
                    <option value="Examination Officer">Exam Officer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. k.okoli@dominionstars.edu.ng"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-950 text-amber-300 font-bold rounded-xl shadow-xs"
                >
                  Register Faculty
                </button>
              </div>
            </form>
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
          schoolClass={selectedClassForModal}
          students={students}
          staffList={staffList}
          onClose={() => setSelectedClassForModal(null)}
          onAssignFormMaster={onAssignFormMaster}
          onAssignSubjectTeacher={onAssignSubjectTeacher}
          onToggleHoldResult={onToggleHoldResult}
          onBatchHoldClass={onBatchHoldClass}
          onEditStudent={(s) => setEditingStudent(s)}
          onPreviewReportCard={(s) => setReportCardStudent(s)}
        />
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
    </div>
  );
};
