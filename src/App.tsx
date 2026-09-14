import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Search,
  BookOpen,
  Boxes,
  BellRing,
  Printer,
  ChevronRight,
  Lock,
  Unlock,
  CreditCard,
  FileText,
  Clock,
  Sparkles,
  Award,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { DGCLogo } from './components/DGCLogo';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { StudentPortalView } from './components/StudentPortalView';
import { AnnouncementsModal } from './components/AnnouncementsModal';
import { GatewayModal } from './components/GatewayModal';
import { StaffDashboard } from './components/StaffDashboard';
import { CeoDashboard } from './components/CeoDashboard';
import { StudentSettingsView } from './components/StudentSettingsView';
import {
  TODAY_DATE,
  CURRENT_SESSION,
  CURRENT_TERM,
  SCHOOL_NAME,
  SCHOOL_LOCATION,
  SCHOOL_MOTTO,
  INITIAL_STUDENTS,
  INITIAL_STAFF_MEMBERS,
  SCHOOL_CLASSES_DEFINITIONS,
  ANNOUNCEMENTS,
} from './data/mockData';
import { StudentProfile, StaffMember, SubjectScore, SchoolClassDefinition } from './types';

export default function App() {
  // Default to 'report_card' tab: directly opens the clean Secondary School Student Portal!
  const [activeTab, setActiveTab] = useState<string>('report_card');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);
  const [admissionInput, setAdmissionInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Workspaces: 'portal' (Standard Student & Guardian Portal), 'staff' (Tutor Continuous Assessment), 'ceo' (CEO & Principal Governance)
  const [activeRole, setActiveRole] = useState<'portal' | 'staff' | 'ceo'>('portal');
  const [isGatewayOpen, setIsGatewayOpen] = useState<boolean>(false);
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);

  // Application Data States
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF_MEMBERS);
  const [classes, setClasses] = useState<SchoolClassDefinition[]>(SCHOOL_CLASSES_DEFINITIONS);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile>(INITIAL_STUDENTS[0]);

  // Initial fetch from backend API
  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.students && data.students.length > 0) {
          setStudents(data.students);
          setSelectedStudent(data.students[0]);
        }
      })
      .catch(() => {
        // Fallback to initial mock data
      });

    fetch('/api/staff')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.staff && data.staff.length > 0) {
          setStaffList(data.staff);
        }
      })
      .catch(() => {
        // Fallback to initial mock data
      });

    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.classes && data.classes.length > 0) {
          setClasses(data.classes);
        }
      })
      .catch(() => {
        // Fallback to initial mock data
      });
  }, []);

  // Update selected student when students array changes
  useEffect(() => {
    if (selectedStudent) {
      const updated = students.find((s) => s.id === selectedStudent.id);
      if (updated) {
        setSelectedStudent(updated);
      }
    }
  }, [students]);

  // --- HANDLERS FOR STAFF & CEO WORKSPACES ---

  const handleOpenGateway = () => {
    setIsGatewayOpen(true);
  };

  const handleSelectRoleFromGateway = (role: 'staff' | 'ceo', staffData?: StaffMember) => {
    setIsGatewayOpen(false);
    if (role === 'staff' && staffData) {
      setActiveStaff(staffData);
      setActiveRole('staff');
    } else if (role === 'ceo') {
      setActiveRole('ceo');
    }
  };

  const handleExitToPortal = () => {
    setActiveRole('portal');
    setActiveStaff(null);
  };

  // Update Student Profile Settings (passport photograph, optional phone, contact details)
  const handleSaveStudentProfile = async (updatedStudent: StudentProfile) => {
    // Optimistic local state update
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setSelectedStudent(updatedStudent);

    try {
      const res = await fetch(`/api/students/${updatedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.student) {
          setStudents((prev) => prev.map((s) => (s.id === data.student.id ? data.student : s)));
          setSelectedStudent(data.student);
        }
      }
    } catch (err) {
      console.error('Failed to sync student update with server:', err);
    }
  };

  // 1. Update Student Continuous Assessment Scores (Quiz, HW, Test 1, Test 2, Exam)
  const handleUpdateStudentScore = async (studentId: string, scoreData: Partial<SubjectScore>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/students/${studentId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectCode: scoreData.code,
          subjectName: scoreData.name,
          quiz: scoreData.quiz,
          homework: scoreData.homework,
          test1: scoreData.test1,
          test2: scoreData.test2,
          exam: scoreData.exam,
          updatedBy: scoreData.updatedBy || activeStaff?.name || 'Authorized Staff',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student : s))
        );
        return true;
      }
    } catch {
      // Optimistic update
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const existingIdx = s.subjects.findIndex(
          (sub) => sub.name.toLowerCase() === scoreData.name?.toLowerCase()
        );
        const updatedSubjects = [...s.subjects];
        const newScoreObj: SubjectScore = {
          code: scoreData.code || 'GEN 101',
          name: scoreData.name || 'Subject',
          quiz: scoreData.quiz,
          homework: scoreData.homework,
          test1: scoreData.test1,
          test2: scoreData.test2,
          caTotal: scoreData.caTotal ?? 30,
          exam: scoreData.exam ?? 45,
          total: scoreData.total ?? 75,
          grade: scoreData.grade || 'A1',
          remark: scoreData.remark || 'Excellent',
          updatedBy: scoreData.updatedBy || activeStaff?.name,
          updatedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          updatedSubjects[existingIdx] = newScoreObj;
        } else {
          updatedSubjects.push(newScoreObj);
        }

        const avg = Number(
          (
            updatedSubjects.reduce((sum, item) => sum + item.total, 0) /
            Math.max(1, updatedSubjects.length)
          ).toFixed(1)
        );

        return {
          ...s,
          subjects: updatedSubjects,
          termGpa: avg,
        };
      })
    );

    return true;
  };

  // 2. Toggle Hold on Result (CEO Executive Action)
  const handleToggleHoldResult = async (studentId: string, hold: boolean, reason?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/students/${studentId}/toggle-hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hold, reason }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student : s))
        );
        return true;
      }
    } catch {
      // Fallback
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          resultHeld: hold,
          holdReason: hold ? reason || 'Outstanding Bursary Tuition Fees' : undefined,
        };
      })
    );
    return true;
  };

  // 3. Batch Hold Class (CEO Executive Action)
  const handleBatchHoldClass = async (classArm: string, hold: boolean, reason?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/classes/batch-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classArm, hold, reason }),
      });
      if (res.ok) {
        const getRes = await fetch('/api/students');
        const data = await getRes.json();
        if (data.students) setStudents(data.students);
        return true;
      }
    } catch {
      // Fallback
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.classArm !== classArm) return s;
        return {
          ...s,
          resultHeld: hold,
          holdReason: hold ? reason || `Class-wide bursary hold for ${classArm}` : undefined,
        };
      })
    );
    return true;
  };

  // 4. Register New Student (6-Year Secondary Admission: JSS1-SS3)
  const handleRegisterStudent = async (studentData: Partial<StudentProfile>): Promise<boolean> => {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) => [data.student, ...prev]);
        return true;
      }
    } catch {
      // Fallback
    }

    const fallbackStudent: StudentProfile = {
      id: `std-${Date.now()}`,
      name: studentData.name || 'New Enrollee',
      admissionNo: studentData.admissionNo || `DGC/2026/0${Math.floor(400 + Math.random() * 500)}`,
      level: studentData.level || 'SS 1',
      classArm: studentData.classArm || 'SS 1A',
      stream: studentData.stream || 'General',
      gender: studentData.gender || 'Male',
      dateOfBirth: studentData.dateOfBirth || '2010-01-01',
      guardianName: studentData.guardianName || 'Guardian',
      guardianPhone: studentData.guardianPhone || '+234 800 000 0000',
      guardianEmail: studentData.guardianEmail || '',
      residentialAddress: studentData.residentialAddress || 'Enugu State',
      stateOfOrigin: studentData.stateOfOrigin || 'Enugu State',
      lga: studentData.lga || 'Enugu North',
      session: '2026/2027',
      term: 'First Term',
      termGpa: 75.0,
      termRank: 'New Enrollee',
      attendanceRate: 100.0,
      feeStatus: studentData.feeStatus || 'Cleared',
      resultHeld: Boolean(studentData.resultHeld),
      holdReason: studentData.holdReason,
      subjects: [
        {
          code: 'MTH 001',
          name: 'Mathematics',
          quiz: 8,
          homework: 8,
          test1: 8,
          test2: 8,
          caTotal: 32,
          exam: 45,
          total: 77,
          grade: 'A1',
          remark: 'Distinction',
        },
      ],
    };

    setStudents((prev) => [fallbackStudent, ...prev]);
    return true;
  };

  // 5. Update Student File (CEO Action)
  const handleUpdateStudent = async (studentId: string, updatedData: Partial<StudentProfile>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student : s))
        );
        return true;
      }
    } catch {
      // Fallback
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updatedData } : s))
    );
    return true;
  };

  // 6. Delete Student
  const handleDeleteStudent = async (studentId: string): Promise<boolean> => {
    try {
      await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    return true;
  };

  // 7. Add Staff (Admin uploaded staff)
  const handleAddStaff = async (staffData: Partial<StaffMember>): Promise<boolean> => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      });

      if (res.ok) {
        const data = await res.json();
        setStaffList((prev) => [...prev, data.staff]);
        return true;
      }
    } catch {
      // Fallback
    }

    const newSt: StaffMember = {
      id: `staff-${Date.now()}`,
      name: staffData.name || 'New Faculty',
      title: staffData.title || 'Mr.',
      email: staffData.email || 'faculty@dgc.edu.ng',
      phone: staffData.phone || '+234 800 000 0000',
      role: staffData.role || 'Subject Tutor',
      department: staffData.department || 'Sciences',
      subjectsTaught: staffData.subjectsTaught || ['Mathematics'],
      assignedClasses: staffData.assignedClasses || ['SS 2 Science'],
      status: 'Active',
      dateJoined: '2026-09-01',
    };
    setStaffList((prev) => [...prev, newSt]);
    return true;
  };

  // 8. Delete Staff
  const handleDeleteStaff = async (staffId: string): Promise<boolean> => {
    try {
      await fetch(`/api/staff/${staffId}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    return true;
  };

  // 9. Assign Form Master to a specific class (CEO Authority)
  const handleAssignFormMaster = async (className: string, staffName: string, staffId?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/classes/assign-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className, staffName, staffId }),
      });
      if (res.ok) {
        const [clsRes, stfRes] = await Promise.all([fetch('/api/classes'), fetch('/api/staff')]);
        const clsData = await clsRes.json();
        const stfData = await stfRes.json();
        if (clsData.classes) setClasses(clsData.classes);
        if (stfData.staff) setStaffList(stfData.staff);
        return true;
      }
    } catch {
      // Fallback local update
    }

    setClasses((prev) =>
      prev.map((c) => (c.name === className ? { ...c, classMaster: staffName } : c))
    );
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.name === staffName || s.id === staffId) {
          return {
            ...s,
            role: 'Class Master',
            formMasterOf: className,
            assignedClasses: s.assignedClasses.includes(className) ? s.assignedClasses : [...s.assignedClasses, className],
          };
        }
        if (s.formMasterOf === className) {
          return { ...s, formMasterOf: undefined };
        }
        return s;
      })
    );
    return true;
  };

  // 10. Assign Subject Teacher to a subject in a specific class
  const handleAssignSubjectTeacher = async (className: string, subjectName: string, teacherName: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/classes/assign-subject-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className, subjectName, teacherName }),
      });
      if (res.ok) {
        const [clsRes, stfRes] = await Promise.all([fetch('/api/classes'), fetch('/api/staff')]);
        const clsData = await clsRes.json();
        const stfData = await stfRes.json();
        if (clsData.classes) setClasses(clsData.classes);
        if (stfData.staff) setStaffList(stfData.staff);
        return true;
      }
    } catch {
      // Fallback
    }

    setClasses((prev) =>
      prev.map((c) => {
        if (c.name !== className) return c;
        return {
          ...c,
          subjectTeachers: {
            ...(c.subjectTeachers || {}),
            [subjectName]: teacherName,
          },
        };
      })
    );
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.name !== teacherName) return s;
        return {
          ...s,
          subjectsTaught: s.subjectsTaught.includes(subjectName) ? s.subjectsTaught : [...s.subjectsTaught, subjectName],
          assignedClasses: s.assignedClasses.includes(className) ? s.assignedClasses : [...s.assignedClasses, className],
        };
      })
    );
    return true;
  };

  // 11. Comprehensive Staff Allocation (Subjects, Classes, Role, Form Master)
  const handleAssignStaffAllocations = async (
    staffId: string,
    allocations: {
      subjectsTaught?: string[];
      assignedClasses?: string[];
      role?: StaffMember['role'];
      formMasterOf?: string;
      department?: StaffMember['department'];
    }
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/staff/assign-allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, ...allocations }),
      });
      if (res.ok) {
        const [clsRes, stfRes] = await Promise.all([fetch('/api/classes'), fetch('/api/staff')]);
        const clsData = await clsRes.json();
        const stfData = await stfRes.json();
        if (clsData.classes) setClasses(clsData.classes);
        if (stfData.staff) setStaffList(stfData.staff);
        return true;
      }
    } catch {
      // Fallback
    }

    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        return {
          ...s,
          ...allocations,
        };
      })
    );
    if (allocations.formMasterOf) {
      setClasses((prev) =>
        prev.map((c) => {
          if (c.name === allocations.formMasterOf) {
            const st = staffList.find((x) => x.id === staffId);
            return { ...c, classMaster: st ? st.name : c.classMaster };
          }
          return c;
        })
      );
    }
    return true;
  };

  // 12. Form Master / Principal Remarks update for student terminal reports
  const handleUpdateStudentRemarks = async (
    studentId: string,
    remarks: { formMasterRemark?: string; principalRemark?: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(remarks),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setStudents((prev) => prev.map((s) => (s.id === studentId ? data.student : s)));
          return true;
        }
      }
    } catch {
      // Fallback
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...remarks } : s))
    );
    return true;
  };

  // Filter students based on search query
  const filteredStudents = students.filter((std) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      std.name.toLowerCase().includes(q) ||
      std.admissionNo.toLowerCase().includes(q) ||
      std.classArm.toLowerCase().includes(q) ||
      std.stream.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex text-slate-800">
      {/* Navigation Sidebar (Only rendered when user is logged into their portal session) */}
      {!isLoggedOut && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
          currentStudent={selectedStudent}
          onLogout={() => setIsLogoutModalOpen(true)}
        />
      )}

      {/* Main Content Viewport */}
      <div className={`flex-1 ${!isLoggedOut ? 'lg:pl-72' : ''} flex flex-col min-w-0 transition-all`}>
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          portalMode="student"
          setPortalMode={() => {}}
          onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
          onOpenGateway={handleOpenGateway}
          currentRole={activeRole}
          isLoggedOut={isLoggedOut}
          currentStudent={selectedStudent}
        />

        {/* Operational Workspace Banner (When in Staff or CEO mode) */}
        {activeRole !== 'portal' && (
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-ping ${
                  activeRole === 'ceo' ? 'bg-amber-400' : 'bg-blue-400'
                }`}
              />
              <span>
                Operating in{' '}
                <strong className={activeRole === 'ceo' ? 'text-amber-300' : 'text-blue-300'}>
                  {activeRole === 'ceo'
                    ? 'Chief Executive Officer (CEO) Administration'
                    : `Faculty Portal (${activeStaff?.name || 'Authorized Staff'})`}
                </strong>
              </span>
            </div>

            <button
              onClick={handleExitToPortal}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Back to Student Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* 1. STAFF WORKSPACE (Grading Console, Form Master Oversight, Faculty Workload) */}
          {activeRole === 'staff' && activeStaff && (
            <StaffDashboard
              staff={activeStaff}
              onExit={handleExitToPortal}
              students={students}
              classes={classes}
              onUpdateStudentScore={handleUpdateStudentScore}
              onUpdateStudentRemarks={handleUpdateStudentRemarks}
            />
          )}

          {/* 2. CEO EXECUTIVE WORKSPACE (Classes & Subject Teachers, Staff Allocations, Result Holds, Admissions) */}
          {activeRole === 'ceo' && (
            <CeoDashboard
              onExit={handleExitToPortal}
              students={students}
              staffList={staffList}
              classes={classes}
              onToggleHoldResult={handleToggleHoldResult}
              onBatchHoldClass={handleBatchHoldClass}
              onRegisterStudent={handleRegisterStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              onAssignFormMaster={handleAssignFormMaster}
              onAssignSubjectTeacher={handleAssignSubjectTeacher}
              onAssignStaffAllocations={handleAssignStaffAllocations}
            />
          )}

          {/* 3. MATURE, PROFESSIONAL SECONDARY SCHOOL STUDENT PORTAL */}
          {activeRole === 'portal' && (
            <>
              {isLoggedOut ? (
                <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md max-w-xl mx-auto my-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-950 text-amber-300 mx-auto flex items-center justify-center font-bold text-2xl shadow-sm">
                    <DGCLogo size="md" showText={false} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Dominion Stars Global College
                    </span>
                    <h2 className="text-2xl font-bold font-serif-title text-slate-900">
                      Student Academic Portal Sign-In
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      Enter your College Admission Number or choose your registered student profile below to securely view your terminal report card, continuous assessment records, and bursary dues clearance.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="space-y-4 pt-1 text-left">
                    {/* Admission Number Entry */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        College Admission Number (e.g. DGC/2026/0142):
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={admissionInput}
                          onChange={(e) => {
                            setAdmissionInput(e.target.value);
                            setAuthError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = admissionInput.trim().toUpperCase();
                              if (!trimmed) {
                                setAuthError('Please enter an Admission Number or pick from the list.');
                                return;
                              }
                              const match = students.find(
                                (s) => s.admissionNo.toUpperCase() === trimmed || s.name.toUpperCase().includes(trimmed)
                              );
                              if (match) {
                                setSelectedStudent(match);
                                setIsLoggedOut(false);
                                setAuthError('');
                              } else {
                                setAuthError(`No student registered with admission number "${trimmed}".`);
                              }
                            }
                          }}
                          placeholder="DGC/2026/0142"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 uppercase"
                        />
                      </div>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="grow border-t border-slate-200"></div>
                      <span className="shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">Or select account</span>
                      <div className="grow border-t border-slate-200"></div>
                    </div>

                    {/* Quick Select Profile */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Registered Student Profile:
                      </label>
                      <select
                        value={selectedStudent?.id}
                        onChange={(e) => {
                          const target = students.find((s) => s.id === e.target.value);
                          if (target) {
                            setSelectedStudent(target);
                            setAdmissionInput(target.admissionNo);
                            setAuthError('');
                          }
                        }}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.admissionNo} · {s.classArm})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const trimmed = admissionInput.trim().toUpperCase();
                        if (trimmed) {
                          const match = students.find(
                            (s) => s.admissionNo.toUpperCase() === trimmed || s.name.toUpperCase().includes(trimmed)
                          );
                          if (match) {
                            setSelectedStudent(match);
                            setIsLoggedOut(false);
                            setAuthError('');
                            return;
                          }
                        }
                        // Default to selected student
                        if (selectedStudent) {
                          setIsLoggedOut(false);
                          setAuthError('');
                        }
                      }}
                      className="w-full py-3 px-4 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Access Student Portal</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Senior Academic Division</span>
                    <span>2026/2027 Academic Session</span>
                  </div>
                </div>
              ) : (
                /* PRIMARY STUDENT VIEWS: Report Card, Performance, Attendance, Fees Clearance */
                (activeTab === 'results' ||
                  activeTab === 'report_card' ||
                  activeTab === 'analytics' ||
                  activeTab === 'performance' ||
                  activeTab === 'attendance' ||
                  activeTab === 'timetable' ||
                  activeTab === 'bursary' ||
                  activeTab === 'fees') && (
                  <StudentPortalView
                    currentStudent={selectedStudent}
                    allStudents={students}
                    classes={classes}
                    onSelectStudent={(std) => setSelectedStudent(std)}
                    activeSubTab={activeTab as any}
                  />
                )
              )}

              {/* STUDENT PROFILE & PASSPORT PHOTO SETTINGS */}
              {!isLoggedOut && activeTab === 'settings' && selectedStudent && (
                <StudentSettingsView
                  student={selectedStudent}
                  onUpdateStudent={handleSaveStudentProfile}
                />
              )}

              {/* 6-YEAR STUDENT ROLL (JSS1 - SS3) */}
              {activeTab === 'students' && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-bold font-serif-title text-slate-900">
                        6-Year Secondary School Student Roll
                      </h2>
                      <p className="text-xs text-slate-500">
                        Junior Secondary (JSS 1-3 Arms A & B) · Senior Secondary 1 (Arms A & B) · Senior Secondary 2-3 (Science, Art, Commercial)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        {filteredStudents.length} Students Registered
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <th className="py-3 px-3">Admission No</th>
                          <th className="py-3 px-3">Full Student Name</th>
                          <th className="py-3 px-3">Class Arm</th>
                          <th className="py-3 px-3">Stream</th>
                          <th className="py-3 px-3 text-center">Fees Status</th>
                          <th className="py-3 px-3 text-center">Result Status</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredStudents.map((std) => (
                          <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                              {std.admissionNo}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-900">{std.name}</td>
                            <td className="py-3 px-3">
                              <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                                {std.classArm}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600">{std.stream}</td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  std.feeStatus === 'Cleared'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {std.feeStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {std.resultHeld ? (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                                  <Lock className="w-3 h-3" /> Withheld
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                                  <Unlock className="w-3 h-3" /> Released
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedStudent(std);
                                  setActiveTab('results');
                                }}
                                className="text-blue-900 font-bold hover:underline"
                              >
                                View Report Card →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 14 CLASS ARMS */}
              {activeTab === 'classes' && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold font-serif-title text-slate-900">
                      14 Secondary School Class Arms Structure
                    </h2>
                    <p className="text-xs text-slate-500">
                      Junior Secondary (JSS 1A/B, JSS 2A/B, JSS 3A/B) · Senior Secondary 1 (SS 1A/B) · Senior Secondary 2 & 3 (Art, Commercial, Science)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {classes.map((cls) => {
                      const count = students.filter((s) => s.classArm === cls.name).length;
                      return (
                        <div
                          key={cls.id}
                          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-black text-slate-900">{cls.name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-blue-900 border border-slate-200">
                                {cls.level}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              Class Master: <strong className="text-slate-800">{cls.classMaster}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">Stream: {cls.stream}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-600">{count > 0 ? count : cls.studentsCount} Students</span>
                            <span className="text-blue-900 font-bold">Academic Division</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COLLEGE NOTICES */}
              {activeTab === 'announcements' && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold font-serif-title text-slate-900">
                      College Bulletins & Official Notices
                    </h2>
                    <p className="text-xs text-slate-500">
                      Dominion Stars Global College official notifications for students and guardians.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {ANNOUNCEMENTS.map((ann) => (
                      <div
                        key={ann.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                            {ann.category}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ann.date}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{ann.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Global Dignified Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="font-bold text-slate-800">{SCHOOL_NAME} (DGC)</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>Enugu State, Nigeria</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="italic text-slate-400">"{SCHOOL_MOTTO}"</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span>6-Year Secondary Education</span>
              <span>•</span>
              <button
                onClick={handleOpenGateway}
                className="text-slate-600 font-semibold hover:text-blue-950 flex items-center gap-1.5 transition-colors"
                title="Faculty and Institutional Administration Portal"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Institutional Portal</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* GATEWAY MODAL (Passcode & administrative verification for staff/CEO) */}
      <GatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        onSelectRole={handleSelectRoleFromGateway}
      />

      {/* Log Out Confirmation Dialog */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Portal Session Log Out
                </h3>
                <p className="text-xs text-slate-500">
                  Student Academic Portal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              You are currently signed into the student academic portal as <strong>{selectedStudent?.name}</strong> ({selectedStudent?.admissionNo}, {selectedStudent?.classArm}). Are you sure you wish to end your active session?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Stay Signed In
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  setIsLoggedOut(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-2xs"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Modal */}
      <AnnouncementsModal
        isOpen={isAnnouncementsOpen}
        onClose={() => setIsAnnouncementsOpen(false)}
      />
    </div>
  );
}
