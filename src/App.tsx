import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
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
import { CheckRegNumberModal } from './components/CheckRegNumberModal';
import { StudentRegistrationModal } from './components/StudentRegistrationModal';
import {
  TODAY_DATE,
  CURRENT_SESSION,
  CURRENT_TERM,
  SCHOOL_NAME,
  SCHOOL_LOCATION,
  SCHOOL_MOTTO,
  SCHOOL_CLASSES_DEFINITIONS,
  ANNOUNCEMENTS,
} from './data/originalData';
import {
  testFirestoreConnection,
  getLiveStudents,
  getLiveStaff,
  getLiveClasses,
  saveLiveStudent,
  deleteLiveStudent,
  saveLiveStaff,
  deleteLiveStaff,
  saveLiveClass,
} from './lib/firebase';
import { StudentProfile, StaffMember, SubjectScore, SchoolClassDefinition } from './types';
import { formatStudentShortName, formatStaffName } from './utils/formatters';

export default function App() {
  // Default to 'report_card' tab: directly opens the clean Secondary School Student Portal!
  const [activeTab, setActiveTab] = useState<string>('report_card');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isDbLive, setIsDbLive] = useState<boolean>(true);
  // Default isLoggedOut to true: students have no sidebar access until authenticated
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(true);
  const [regNumberInput, setRegNumberInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isCheckRegModalOpen, setIsCheckRegModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Workspaces: 'portal' (Standard Student & Guardian Portal), 'staff' (Tutor Continuous Assessment), 'ceo' (CEO & Principal Governance)
  const [activeRole, setActiveRole] = useState<'portal' | 'staff' | 'ceo'>('portal');
  const [isGatewayOpen, setIsGatewayOpen] = useState<boolean>(false);
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);

  // Application Data States (Pure live data from Firestore / API)
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [classes, setClasses] = useState<SchoolClassDefinition[]>(SCHOOL_CLASSES_DEFINITIONS);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Initial fetch from backend API & live Firestore verification
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsDbLive(connected);
      console.log(`[Dominate Star College] Firestore Connection: ${connected ? 'Active' : 'Offline'}`);
    });

    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.students)) {
          setStudents(data.students);
          setSelectedStudent((prev) => {
            if (prev && data.students.some((s: StudentProfile) => s.id === prev.id)) {
              return data.students.find((s: StudentProfile) => s.id === prev.id) || null;
            }
            return data.students.length > 0 ? data.students[0] : null;
          });
        }
      })
      .catch(() => {
        getLiveStudents().then((liveStd) => {
          if (Array.isArray(liveStd)) {
            setStudents(liveStd);
            setSelectedStudent((prev) => {
              if (prev && liveStd.some((s: StudentProfile) => s.id === prev.id)) {
                return liveStd.find((s: StudentProfile) => s.id === prev.id) || null;
              }
              return liveStd.length > 0 ? liveStd[0] : null;
            });
          }
        });
      });

    fetch('/api/staff')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.staff)) {
          setStaffList(data.staff);
        }
      })
      .catch(() => {
        getLiveStaff().then((liveStaff) => {
          if (Array.isArray(liveStaff)) {
            setStaffList(liveStaff);
          }
        });
      });

    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.classes && data.classes.length > 0) {
          setClasses(data.classes);
        }
      })
      .catch(() => {
        getLiveClasses().then((liveClasses) => {
          if (liveClasses && liveClasses.length > 0) {
            setClasses(liveClasses);
          }
        });
      });
  }, []);

  // Update selected student when students array changes
  useEffect(() => {
    if (selectedStudent) {
      const updated = students.find((s) => s.id === selectedStudent.id);
      if (updated) {
        setSelectedStudent(updated);
      } else if (students.length > 0) {
        setSelectedStudent(students[0]);
      } else {
        setSelectedStudent(null);
      }
    } else if (students.length > 0) {
      setSelectedStudent(students[0]);
    }
  }, [students]);

  // --- HANDLERS FOR STAFF & CEO WORKSPACES ---

  const handleOpenGateway = () => {
    setIsGatewayOpen(true);
  };

  // Discreet sliding-window timestamp tracker for rapid triple-click administrative shortcut (zero intrusive popups/toasts)
  const logoClicksRef = useRef<number[]>([]);

  const handleLogoTripleClick = () => {
    const now = Date.now();
    // Keep clicks occurring within the last 1500ms
    const recentClicks = [...logoClicksRef.current.filter((t) => now - t < 1500), now];
    logoClicksRef.current = recentClicks;

    if (recentClicks.length >= 3) {
      logoClicksRef.current = [];
      handleOpenGateway();
    }
  };

  // Student Authentication: Reg Number and Password (which is also the Reg Number)
  const handleStudentLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    const cleanReg = regNumberInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanReg) {
      setAuthError('Please enter your official College Registration Number.');
      return;
    }

    if (!cleanPass) {
      setAuthError('Please enter your Password (your default password is your Registration Number).');
      return;
    }

    // 1. Match student in database state by official Registration / Admission Number
    let match = students.find(
      (s) => s.admissionNo.toLowerCase() === cleanReg.toLowerCase()
    );

    // 2. If not found in memory, query the live backend / Firestore database
    if (!match) {
      try {
        const res = await fetch(`/api/students/${encodeURIComponent(cleanReg)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.student) {
            match = data.student;
            setStudents((prev) => [data.student, ...prev.filter((p) => p.id !== data.student.id)]);
          }
        }
      } catch {
        // live lookup fallback
      }
    }

    if (!match) {
      setAuthError(
        `No student record found for Registration Number "${cleanReg}". If you do not remember your Reg Number, click "Check Reg Number" below to find yours.`
      );
      return;
    }

    // Explicit User Rule: "the login should only ask for reg number and password which is your reg number for the both"
    const passMatches =
      cleanPass.toLowerCase() === cleanReg.toLowerCase() ||
      cleanPass.toLowerCase() === match.admissionNo.toLowerCase();

    if (!passMatches) {
      setAuthError(
        'Incorrect password. Your default portal password is the exact same as your Registration Number.'
      );
      return;
    }

    // Successful student login
    setSelectedStudent(match);
    setIsLoggedOut(false);
    setAuthError('');
  };

  // Autofill login credentials when student finds their account via Check Reg Number
  const handleSelectFoundStudent = (regNo: string) => {
    setRegNumberInput(regNo);
    setPasswordInput(regNo);
    setAuthError('');
    setIsCheckRegModalOpen(false);
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

    saveLiveStudent(fallbackStudent).catch((e) => console.warn('Firestore direct write failed:', e));
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
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const updated = { ...s, ...updatedData };
        saveLiveStudent(updated).catch(() => {});
        return updated;
      })
    );
    return true;
  };

  // 6. Delete Student
  const handleDeleteStudent = async (studentId: string): Promise<boolean> => {
    deleteLiveStudent(studentId).catch(() => {});
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
        if (data.staff.formMasterOf) {
          setClasses((prev) =>
            prev.map((c) =>
              c.name === data.staff.formMasterOf ? { ...c, classMaster: data.staff.name } : c
            )
          );
        }
        return true;
      }
    } catch {
      // Fallback
    }

    const newSt: StaffMember = {
      id: `staff-${Date.now()}`,
      name: staffData.name || 'New Teacher',
      title: staffData.title || 'Mr.',
      email: staffData.email || 'teacher@dgc.edu.ng',
      phone: staffData.phone || '+234 800 000 0000',
      role: staffData.role || (staffData.formMasterOf ? (staffData.formDesignation || 'Class Master') : 'Subject Tutor'),
      department: staffData.department || 'Sciences',
      subjectsTaught: staffData.subjectsTaught || ['Mathematics'],
      assignedClasses: staffData.assignedClasses || ['SS 2 Science'],
      formMasterOf: staffData.formMasterOf,
      formDesignation: staffData.formDesignation,
      qualification: staffData.qualification || 'B.Sc (Ed)',
      status: 'Active',
      dateJoined: new Date().toISOString().split('T')[0],
    };
    saveLiveStaff(newSt).catch(() => {});
    if (newSt.formMasterOf) {
      setClasses((prev) =>
        prev.map((c) =>
          c.name === newSt.formMasterOf ? { ...c, classMaster: newSt.name } : c
        )
      );
    }
    setStaffList((prev) => [...prev, newSt]);
    return true;
  };

  // 8. Delete Staff
  const handleDeleteStaff = async (staffId: string): Promise<boolean> => {
    deleteLiveStaff(staffId).catch(() => {});
    try {
      await fetch(`/api/staff/${staffId}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const targetStaff = staffList.find((s) => s.id === staffId);
    if (targetStaff) {
      setClasses((prev) =>
        prev.map((c) => {
          const updated = { ...c };
          if (updated.classMaster === targetStaff.name) {
            updated.classMaster = 'Unassigned';
          }
          if (updated.subjectTeachers) {
            const newSubjs = { ...updated.subjectTeachers };
            Object.keys(newSubjs).forEach((subj) => {
              if (newSubjs[subj] === targetStaff.name) {
                delete newSubjs[subj];
              }
            });
            updated.subjectTeachers = newSubjs;
          }
          return updated;
        })
      );
    }
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    return true;
  };

  // 8b. Update / Change Staff details
  const handleUpdateStaff = async (staffId: string, updatedData: Partial<StaffMember>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
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
      // ignore
    }

    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, ...updatedData } : s))
    );
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
        if (!staffName || staffName === 'Unassigned') {
          if (s.formMasterOf === className) {
            return {
              ...s,
              formMasterOf: undefined,
              role: s.role === 'Class Master' ? 'Subject Tutor' : s.role,
            };
          }
          return s;
        }
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
        const newSubjs = { ...(c.subjectTeachers || {}) };
        if (!teacherName || teacherName === 'Unassigned') {
          delete newSubjs[subjectName];
        } else {
          newSubjs[subjectName] = teacherName;
        }
        return {
          ...c,
          subjectTeachers: newSubjs,
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

  // 10b. Batch Assign Subjects to Classes (All 14 Classes or specific cohorts)
  const handleBatchAssignSubjects = async (
    targetClasses: string[],
    subjects: string[],
    mode: 'add' | 'set' | 'remove' = 'add'
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/classes/batch-assign-subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetClasses, subjects, mode, syncStudents: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.classes) setClasses(data.classes);
        if (data.students) {
          setStudents(data.students);
          if (selectedStudent) {
            const updated = data.students.find((s: StudentProfile) => s.id === selectedStudent.id);
            if (updated) setSelectedStudent(updated);
          }
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to batch assign subjects:', err);
    }
    return false;
  };

  // 10c. Update Single Class Curriculum (Assign or update subjects with student synchronization)
  const handleUpdateClassCurriculum = async (
    className: string,
    subjects: string[],
    action: 'add' | 'set' | 'remove' = 'set'
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/classes/${encodeURIComponent(className)}/curriculum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects, action, syncStudents: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.class) {
          setClasses((prev) => prev.map((c) => (c.name === className ? data.class : c)));
        }
        if (data.students) {
          setStudents(data.students);
          if (selectedStudent) {
            const updated = data.students.find((s: StudentProfile) => s.id === selectedStudent.id);
            if (updated) setSelectedStudent(updated);
          }
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to update class curriculum:', err);
    }
    return false;
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

  // 12. Form Master / Principal Remarks & Domain ratings update for student terminal reports
  const handleUpdateStudentRemarks = async (
    studentId: string,
    remarks: {
      formMasterRemark?: string;
      formTeacherComment?: string;
      principalRemark?: string;
      principalComment?: string;
      affectiveDomain?: any;
      psychomotorDomain?: any;
    }
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

  // 12b. Bulk Class Scores update (Single database transaction for entire class)
  const handleBulkUpdateStudentScores = async (
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
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/students/bulk-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classArm,
          subjectCode,
          subjectName,
          scores,
          updatedBy: activeStaff?.name || 'Staff Tutor',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.students)) {
          setStudents((prev) => {
            const map = new Map(data.students.map((s: StudentProfile) => [s.id, s]));
            return prev.map((s) => (map.has(s.id) ? (map.get(s.id) as StudentProfile) : s));
          });
          return true;
        }
      }
    } catch (err) {
      console.error('Failed to bulk update scores:', err);
    }
    return false;
  };

  // 13. Mark & Sync Class Attendance (Teacher / Form Master Action)
  const handleUpdateStudentAttendance = async (
    className: string,
    records: Array<{
      studentId: string;
      status: 'Present' | 'Absent' | 'Late' | 'Excused';
      remarks?: string;
      newAttendanceRate?: number;
    }>,
    date?: string,
    term?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className,
          date: date || new Date().toISOString().split('T')[0],
          term: term || 'First Term',
          records,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.students) {
          setStudents(data.students);
          return true;
        }
      }
    } catch {
      // Fallback
    }

    setStudents((prev) =>
      prev.map((s) => {
        const match = records.find((r) => r.studentId === s.id);
        if (!match) return s;
        const opened = (s.timesSchoolOpened || 0) + 1;
        const present = (s.timesPresent || 0) + (match.status === 'Present' || match.status === 'Late' ? 1 : 0);
        const rate = opened > 0 ? Math.round((present / opened) * 100) : 100;
        return {
          ...s,
          timesSchoolOpened: opened,
          timesPresent: present,
          attendanceRate: rate,
        };
      })
    );
    return true;
  };

  // 13. Update student fee status (Paid / Cleared vs Not Paid / Pending)
  const handleUpdateStudentFeeStatus = async (
    studentId: string,
    feeStatus: 'Cleared' | 'Pending',
    amountPaid?: number
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/students/${studentId}/fee-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeStatus, amountPaid }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setStudents((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, ...data.student } : s))
          );
          if (selectedStudent && selectedStudent.id === studentId) {
            setSelectedStudent((prev) => (prev ? { ...prev, ...data.student } : null));
          }
          return true;
        }
      }
    } catch {
      // Fallback
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated = {
            ...s,
            feeStatus,
            amountPaid: amountPaid !== undefined ? amountPaid : (feeStatus === 'Cleared' ? 155000 : 0),
          };
          if (selectedStudent && selectedStudent.id === studentId) {
            setSelectedStudent(updated);
          }
          return updated;
        }
        return s;
      })
    );
    return true;
  };

  // 14. Bulk update student fee status by class or list
  const handleBulkUpdateStudentFeeStatus = async (
    studentIds: string[],
    feeStatus: 'Cleared' | 'Pending'
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/students/bulk-fee-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds, feeStatus }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (studentIds.includes(s.id) ? { ...s, feeStatus } : s))
        );
        if (selectedStudent && studentIds.includes(selectedStudent.id)) {
          setSelectedStudent((prev) => (prev ? { ...prev, feeStatus } : null));
        }
        return true;
      }
    } catch {
      // Fallback
    }

    setStudents((prev) =>
      prev.map((s) => (studentIds.includes(s.id) ? { ...s, feeStatus } : s))
    );
    if (selectedStudent && studentIds.includes(selectedStudent.id)) {
      setSelectedStudent((prev) => (prev ? { ...prev, feeStatus } : null));
    }
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
    <div className="min-h-screen bg-sky-50 flex text-slate-800 w-full max-w-full overflow-x-hidden">
      {/* Navigation Sidebar (Only rendered when user is logged into their portal session) */}
      {!isLoggedOut && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
          currentStudent={selectedStudent}
          onLogout={() => setIsLogoutModalOpen(true)}
          onLogoTripleClick={handleLogoTripleClick}
        />
      )}

      {/* Main Content Viewport */}
      <div className={`flex-1 ${!isLoggedOut ? 'lg:pl-72' : ''} flex flex-col min-w-0 transition-all w-full max-w-full overflow-x-hidden`}>
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          portalMode="student"
          setPortalMode={() => {}}
          onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
          onOpenGateway={handleOpenGateway}
          onLogoTripleClick={handleLogoTripleClick}
          currentRole={activeRole}
          isLoggedOut={isLoggedOut}
          isDbLive={isDbLive}
          currentStudent={selectedStudent}
        />

        {/* Operational Workspace Banner (When in Staff or CEO mode) */}
        {activeRole !== 'portal' && (
          <div className="bg-slate-900 text-white px-3 sm:px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  activeRole === 'ceo' ? 'bg-blue-400' : 'bg-emerald-400'
                }`}
              />
              <span className="truncate text-xs text-slate-300">
                {activeRole === 'ceo' ? (
                  <>
                    Workspace: <strong className="text-white font-bold">Admin Console</strong>
                  </>
                ) : (
                  <>
                    Workspace: <strong className="text-white font-bold">Faculty · {activeStaff?.title} {formatStaffName(activeStaff?.name || '')}</strong>
                  </>
                )}
              </span>
            </div>

            <button
              onClick={handleExitToPortal}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
            >
              <span>Student Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 min-w-0 overflow-x-hidden">
          {/* 1. STAFF WORKSPACE (Grading Console, Form Master Oversight, Teaching Workload) */}
          {activeRole === 'staff' && activeStaff && (
            <StaffDashboard
              staff={activeStaff}
              onExit={handleExitToPortal}
              students={students}
              classes={classes}
              onUpdateStudentScore={handleUpdateStudentScore}
              onBulkUpdateStudentScores={handleBulkUpdateStudentScores}
              onUpdateStudentRemarks={handleUpdateStudentRemarks}
              onUpdateStudentAttendance={handleUpdateStudentAttendance}
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
              onUpdateStaff={handleUpdateStaff}
              onUpdateStudentFeeStatus={handleUpdateStudentFeeStatus}
              onBulkUpdateStudentFeeStatus={handleBulkUpdateStudentFeeStatus}
              onBatchAssignSubjects={handleBatchAssignSubjects}
              onUpdateClassCurriculum={handleUpdateClassCurriculum}
            />
          )}

          {/* 3. MATURE, PROFESSIONAL SECONDARY SCHOOL STUDENT PORTAL */}
          {activeRole === 'portal' && (
            <>
              {isLoggedOut ? (
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md max-w-lg mx-auto my-6 text-center space-y-6">
                  {/* Dominate Star College Official Crest Emblem with Administrative Triple-Click Shortcut */}
                  <div className="inline-block mx-auto">
                    <button
                      type="button"
                      onClick={handleLogoTripleClick}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center shadow-xs hover:border-slate-300 active:scale-95 transition-all cursor-pointer focus:outline-hidden"
                      title="Dominate Star College"
                      aria-label="Dominate Star College Crest"
                    >
                      <DGCLogo size="md" showText={false} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      Dominate Star College
                    </span>
                    <h2 className="text-2xl font-bold font-serif-title text-slate-900">
                      Student Academic Portal Sign-In
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      Official portal for returning and newly enrolled students. Log in using your College Registration Number and Password.
                    </p>
                  </div>

                  {/* Portal Security Note */}
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200/90 rounded-2xl text-left text-xs text-blue-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-blue-950">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Authentication Notice</span>
                    </div>
                    <p className="text-[11px] text-blue-900 leading-relaxed">
                      Your default portal password is your <strong>Registration Number</strong> (the exact same value for both). Students cannot register accounts online; accounts are provisioned exclusively by the College Administration.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleStudentLogin} className="space-y-4 pt-1 text-left">
                    {/* Reg Number Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Registration Number (Reg No):
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={regNumberInput}
                          onChange={(e) => {
                            setRegNumberInput(e.target.value);
                            setAuthError('');
                          }}
                          placeholder="e.g. DGC/2026/0142"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 uppercase font-mono"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block">
                          Password:
                        </label>
                        <span className="text-[10px] text-slate-500 font-medium">
                          (Default: Your Reg Number)
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => {
                            setPasswordInput(e.target.value);
                            setAuthError('');
                          }}
                          placeholder="Enter your Reg Number as password"
                          className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                    </div>

                    {/* Check Reg Number Link */}
                    <div className="pt-0.5 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setIsCheckRegModalOpen(true)}
                        className="text-blue-900 hover:text-blue-700 font-bold hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-blue-600" />
                        <span>Forgot Reg Number? Check Here</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    >
                      <span>Sign In</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="text-[11px] text-slate-400">Senior Academic Division · 2026/2027</span>
                    <button
                      type="button"
                      onClick={handleOpenGateway}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Staff & Administration Gateway</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* PRIMARY STUDENT VIEWS: Assigned Subjects, Report Card, Performance, Attendance, Fees Clearance */
                (activeTab === 'subjects' ||
                  activeTab === 'curriculum' ||
                  activeTab === 'results' ||
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
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 px-4 text-center">
                              <div className="max-w-md mx-auto space-y-2">
                                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                                <h4 className="text-xs font-bold text-slate-700">
                                  {searchQuery ? 'No student found matching query' : 'No data yet (0 students registered)'}
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  {searchQuery ? 'Try adjusting your search query.' : 'No students have been enrolled in the college database yet. Go to Administration to register students.'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((std) => (
                          <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                              {std.admissionNo}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-900">{formatStudentShortName(std.name)}</td>
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
                        )))}
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
                      Dominate Star College official notifications for students and guardians.
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
                title="Teachers and Institutional Administration Portal"
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
        staffList={staffList}
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

      {/* Check Registration Number Lookup Modal (Resemblance Name Search) */}
      {isCheckRegModalOpen && (
        <CheckRegNumberModal
          isOpen={isCheckRegModalOpen}
          onClose={() => setIsCheckRegModalOpen(false)}
          students={students}
        />
      )}

      {/* Official Administration Student Registration Form Modal */}
      {isRegisterModalOpen && (
        <StudentRegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterStudent={handleRegisterStudent}
          classes={classes}
        />
      )}
    </div>
  );
}
