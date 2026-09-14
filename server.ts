import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_STUDENTS,
  INITIAL_STAFF_MEMBERS,
  SCHOOL_CLASSES_DEFINITIONS,
  calculateGrade,
  computeCaTotal,
  recalculateClassRankings,
} from './src/data/mockData';
import { StudentProfile, StaffMember, SchoolClassDefinition } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // In-memory persistent state initialized with realistic data and calculated ranks
  let students: StudentProfile[] = recalculateClassRankings([...INITIAL_STUDENTS]);
  let staffMembers: StaffMember[] = [...INITIAL_STAFF_MEMBERS];
  let schoolClasses: SchoolClassDefinition[] = JSON.parse(JSON.stringify(SCHOOL_CLASSES_DEFINITIONS));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), school: 'Dominion Stars Global College' });
  });

  // --- STAFF ROSTER ENDPOINTS ---
  app.get('/api/staff', (req, res) => {
    res.json({ staff: staffMembers });
  });

  app.post('/api/staff', (req, res) => {
    const { name, title, role, department, email, phone, subjectsTaught, assignedClasses } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Staff name is required' });
    }

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      title: title || 'Mr.',
      email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@dgc.edu.ng`,
      phone: phone || '+234 800 000 0000',
      role: role || 'Subject Tutor',
      department: department || 'General',
      subjectsTaught: subjectsTaught || ['General Studies'],
      assignedClasses: assignedClasses || ['SS 1A'],
      status: 'Active',
      dateJoined: new Date().toISOString().split('T')[0],
    };

    staffMembers.push(newStaff);
    return res.status(201).json({ success: true, staff: newStaff });
  });

  app.put('/api/staff/:id', (req, res) => {
    const { id } = req.params;
    const index = staffMembers.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    staffMembers[index] = { ...staffMembers[index], ...req.body };
    return res.json({ success: true, staff: staffMembers[index] });
  });

  app.delete('/api/staff/:id', (req, res) => {
    const { id } = req.params;
    staffMembers = staffMembers.filter((s) => s.id !== id);
    return res.json({ success: true, message: 'Staff deleted' });
  });

  // Verify staff name for login: checks against uploaded admin staff roster
  app.post('/api/staff/verify', (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ matched: false, message: 'Name parameter required' });
    }

    const query = name.trim().toLowerCase();
    // Match full name, or surname/title combinations
    const matchedStaff = staffMembers.find((s) => {
      const sName = s.name.toLowerCase();
      return (
        sName === query ||
        sName.includes(query) ||
        query.includes(sName) ||
        sName.replace(/[^a-z]/g, '') === query.replace(/[^a-z]/g, '')
      );
    });

    if (matchedStaff) {
      return res.json({ matched: true, staff: matchedStaff });
    }

    return res.status(401).json({
      matched: false,
      message: 'Staff name not found on the authorized roster. Please verify spelling or contact the CEO.',
    });
  });

  // --- CLASSES ENDPOINT (The 14 Classes) ---
  app.get('/api/classes', (req, res) => {
    // Enrich with dynamic count of enrolled students
    const classesWithCounts = schoolClasses.map((cls) => {
      const actualCount = students.filter((s) => s.classArm === cls.name).length;
      return {
        ...cls,
        actualCount: actualCount > 0 ? actualCount : cls.studentsCount,
      };
    });
    res.json({ classes: classesWithCounts });
  });

  app.put('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    const index = schoolClasses.findIndex((c) => c.id === id || c.name === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }
    schoolClasses[index] = { ...schoolClasses[index], ...req.body };
    return res.json({ success: true, class: schoolClasses[index] });
  });

  // Assign Form Master to a specific class
  app.post('/api/classes/assign-master', (req, res) => {
    const { className, staffName, staffId } = req.body;
    if (!className || !staffName) {
      return res.status(400).json({ error: 'className and staffName are required' });
    }
    const clsIndex = schoolClasses.findIndex((c) => c.name === className || c.id === className);
    if (clsIndex === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Previous form master of this class loses formMasterOf
    const previousStaff = staffMembers.find((s) => s.formMasterOf === className);
    if (previousStaff && previousStaff.name !== staffName) {
      previousStaff.formMasterOf = undefined;
    }

    schoolClasses[clsIndex].classMaster = staffName;

    // Update new Form Master staff record
    const staff = staffMembers.find((s) => s.name === staffName || s.id === staffId);
    if (staff) {
      staff.role = 'Class Master';
      staff.formMasterOf = className;
      if (!staff.assignedClasses.includes(className)) {
        staff.assignedClasses.push(className);
      }
    }

    return res.json({ success: true, class: schoolClasses[clsIndex], staff });
  });

  // Assign a Subject Teacher to a subject in a specific class
  app.post('/api/classes/assign-subject-teacher', (req, res) => {
    const { className, subjectName, teacherName } = req.body;
    if (!className || !subjectName || !teacherName) {
      return res.status(400).json({ error: 'className, subjectName, and teacherName are required' });
    }

    const clsIndex = schoolClasses.findIndex((c) => c.name === className || c.id === className);
    if (clsIndex === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (!schoolClasses[clsIndex].subjectTeachers) {
      schoolClasses[clsIndex].subjectTeachers = {};
    }
    schoolClasses[clsIndex].subjectTeachers![subjectName] = teacherName;

    // Also update the teacher's subjectsTaught & assignedClasses if not present
    const staff = staffMembers.find((s) => s.name === teacherName);
    if (staff) {
      if (!staff.subjectsTaught.includes(subjectName)) {
        staff.subjectsTaught.push(subjectName);
      }
      if (!staff.assignedClasses.includes(className)) {
        staff.assignedClasses.push(className);
      }
    }

    return res.json({ success: true, class: schoolClasses[clsIndex], staff });
  });

  // Comprehensive Staff Allocation (Subjects, Classes, Role, Department)
  app.post('/api/staff/assign-allocations', (req, res) => {
    const { staffId, subjectsTaught, assignedClasses, role, formMasterOf, department } = req.body;
    const staff = staffMembers.find((s) => s.id === staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    if (Array.isArray(subjectsTaught)) staff.subjectsTaught = subjectsTaught;
    if (Array.isArray(assignedClasses)) staff.assignedClasses = assignedClasses;
    if (role) staff.role = role;
    if (department) staff.department = department;

    if (formMasterOf !== undefined) {
      staff.formMasterOf = formMasterOf || undefined;
      if (formMasterOf) {
        const clsIndex = schoolClasses.findIndex((c) => c.name === formMasterOf);
        if (clsIndex !== -1) {
          schoolClasses[clsIndex].classMaster = staff.name;
        }
      }
    }

    return res.json({ success: true, staff });
  });

  // --- STUDENTS MANAGEMENT ENDPOINTS ---
  app.get('/api/students', (req, res) => {
    const { classArm, search, held, level } = req.query;
    let filtered = [...students];

    if (classArm && classArm !== 'ALL') {
      filtered = filtered.filter((s) => s.classArm === classArm);
    }
    if (level && level !== 'ALL') {
      filtered = filtered.filter((s) => s.level === level);
    }
    if (held !== undefined && held !== '') {
      const isHeld = held === 'true';
      filtered = filtered.filter((s) => s.resultHeld === isHeld);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.classArm.toLowerCase().includes(q)
      );
    }

    res.json({ students: filtered, total: filtered.length });
  });

  app.get('/api/students/:id', (req, res) => {
    const student = students.find((s) => s.id === req.params.id || s.admissionNo === req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json({ student });
  });

  // Register New Student (Architectural Registration)
  app.post('/api/students', (req, res) => {
    const {
      name,
      admissionNo,
      level,
      classArm,
      stream,
      gender,
      dateOfBirth,
      guardianName,
      guardianPhone,
      guardianEmail,
      residentialAddress,
      stateOfOrigin,
      lga,
      feeStatus,
      resultHeld,
      holdReason,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Student full name is required' });
    }
    if (!classArm) {
      return res.status(400).json({ error: 'Class arm is required' });
    }

    const cleanAdmissionNo =
      admissionNo && admissionNo.trim()
        ? admissionNo.trim()
        : `DGC/${new Date().getFullYear()}/${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newStudent: StudentProfile = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      admissionNo: cleanAdmissionNo,
      level: level || 'SS 1',
      classArm: classArm,
      stream: stream || 'General',
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '2010-01-01',
      guardianName: guardianName || 'Guardian',
      guardianPhone: guardianPhone || '+234 800 000 0000',
      guardianEmail: guardianEmail || '',
      residentialAddress: residentialAddress || 'Enugu State',
      stateOfOrigin: stateOfOrigin || 'Enugu State',
      lga: lga || 'Enugu North',
      session: '2026/2027',
      term: 'First Term',
      termGpa: 75.0,
      termRank: 'New Enrollee',
      attendanceRate: 100.0,
      feeStatus: feeStatus || 'Cleared',
      resultHeld: Boolean(resultHeld),
      holdReason: resultHeld ? holdReason || 'Administrative verification' : undefined,
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
        {
          code: 'ENG 001',
          name: 'English Language',
          quiz: 8,
          homework: 8,
          test1: 7,
          test2: 8,
          caTotal: 31,
          exam: 46,
          total: 77,
          grade: 'A1',
          remark: 'Distinction',
        },
      ],
    };

    students.unshift(newStudent);
    students = recalculateClassRankings(students);
    const registered = students.find((s) => s.id === newStudent.id) || newStudent;
    return res.status(201).json({ success: true, student: registered });
  });

  // Update Student Profile
  app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    students[index] = { ...students[index], ...req.body };
    students = recalculateClassRankings(students);
    const updated = students.find((s) => s.id === id) || students[index];
    return res.json({ success: true, student: updated });
  });

  // Delete Student (Full administrative authority)
  app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const exists = students.some((s) => s.id === id);
    if (!exists) {
      return res.status(404).json({ error: 'Student not found' });
    }
    students = students.filter((s) => s.id !== id);
    students = recalculateClassRankings(students);
    return res.json({ success: true, message: 'Student deleted successfully', remainingCount: students.length });
  });

  // Hold or Release Student Result (CEO Executive Action)
  app.post('/api/students/:id/toggle-hold', (req, res) => {
    const { id } = req.params;
    const { hold, reason } = req.body;
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const current = students[index];
    const newHoldStatus = hold !== undefined ? Boolean(hold) : !current.resultHeld;

    students[index] = {
      ...current,
      resultHeld: newHoldStatus,
      holdReason: newHoldStatus ? reason || 'Outstanding Bursary or Administrative Clearance' : undefined,
    };

    return res.json({
      success: true,
      resultHeld: newHoldStatus,
      holdReason: students[index].holdReason,
      student: students[index],
    });
  });

  // Batch Hold/Release for entire class
  app.post('/api/classes/batch-hold', (req, res) => {
    const { classArm, hold, reason } = req.body;
    if (!classArm) {
      return res.status(400).json({ error: 'Class arm is required' });
    }

    const isHold = Boolean(hold);
    let affectedCount = 0;
    students = students.map((s) => {
      if (s.classArm === classArm) {
        affectedCount++;
        return {
          ...s,
          resultHeld: isHold,
          holdReason: isHold ? reason || `Class-wide administrative hold for ${classArm}` : undefined,
        };
      }
      return s;
    });

    return res.json({
      success: true,
      affectedCount,
      classArm,
      hold: isHold,
    });
  });

  // Insert or Update Subject Score (Staff or Admin grading)
  // Accepts homework (10), test1 (10), test2 (10), practical (10), exam (60)
  app.post('/api/students/:id/scores', (req, res) => {
    const { id } = req.params;
    const { subjectCode, subjectName, homework, test1, test2, practical, quiz, exam, updatedBy } = req.body;

    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = students[index];
    const sCode = subjectCode || 'GEN 101';
    const sName = subjectName || 'General Subject';

    const hw = homework !== undefined ? Math.min(10, Math.max(0, Number(homework))) : 0;
    const t1 = test1 !== undefined ? Math.min(10, Math.max(0, Number(test1))) : 0;
    const t2 = test2 !== undefined ? Math.min(10, Math.max(0, Number(test2))) : 0;
    const prac = practical !== undefined ? Math.min(10, Math.max(0, Number(practical))) : (quiz !== undefined ? Math.min(10, Math.max(0, Number(quiz))) : 0);

    const caTotal = computeCaTotal(hw, t1, t2, prac);
    const ex = Math.min(60, Math.max(0, Number(exam) || 0));
    const total = Math.min(100, Math.max(0, caTotal + ex));
    const { grade, remark } = calculateGrade(total);

    const existingSubjectIdx = student.subjects.findIndex((sub) => sub.code === sCode || sub.name === sName);

    const updatedScore = {
      code: sCode,
      name: sName,
      homework: hw,
      test1: t1,
      test2: t2,
      practical: prac,
      quiz: prac,
      caTotal,
      exam: ex,
      total,
      grade,
      remark,
      updatedBy: updatedBy || 'Authorized Faculty',
      updatedAt: new Date().toISOString(),
    };

    if (existingSubjectIdx >= 0) {
      student.subjects[existingSubjectIdx] = updatedScore;
    } else {
      student.subjects.push(updatedScore);
    }

    // Recalculate rankings across all students
    students[index] = student;
    students = recalculateClassRankings(students);

    const updatedStudent = students.find((s) => s.id === id) || student;
    return res.json({ success: true, student: updatedStudent, updatedScore });
  });

  // Batch Upload Scores for Teacher: Upload scores for whole class arm in one call
  app.post('/api/students/bulk-scores', (req, res) => {
    const { classArm, subjectCode, subjectName, scores, updatedBy } = req.body;
    if (!classArm || !scores || !Array.isArray(scores)) {
      return res.status(400).json({ error: 'classArm and scores array are required' });
    }

    const sCode = subjectCode || 'GEN 101';
    const sName = subjectName || 'Subject';

    scores.forEach((item: { studentId: string; homework?: number; test1?: number; test2?: number; practical?: number; exam?: number }) => {
      const idx = students.findIndex((s) => s.id === item.studentId);
      if (idx !== -1) {
        const student = students[idx];
        const hw = item.homework !== undefined ? Math.min(10, Math.max(0, Number(item.homework))) : 0;
        const t1 = item.test1 !== undefined ? Math.min(10, Math.max(0, Number(item.test1))) : 0;
        const t2 = item.test2 !== undefined ? Math.min(10, Math.max(0, Number(item.test2))) : 0;
        const prac = item.practical !== undefined ? Math.min(10, Math.max(0, Number(item.practical))) : 0;
        const caTotal = computeCaTotal(hw, t1, t2, prac);
        const ex = Math.min(60, Math.max(0, Number(item.exam) || 0));
        const total = Math.min(100, Math.max(0, caTotal + ex));
        const { grade, remark } = calculateGrade(total);

        const subIdx = student.subjects.findIndex((sub) => sub.code === sCode || sub.name === sName);
        const newScore = {
          code: sCode,
          name: sName,
          homework: hw,
          test1: t1,
          test2: t2,
          practical: prac,
          quiz: prac,
          caTotal,
          exam: ex,
          total,
          grade,
          remark,
          updatedBy: updatedBy || 'Class Teacher',
          updatedAt: new Date().toISOString(),
        };

        if (subIdx >= 0) {
          student.subjects[subIdx] = newScore;
        } else {
          student.subjects.push(newScore);
        }
        students[idx] = student;
      }
    });

    students = recalculateClassRankings(students);
    const affectedStudents = students.filter((s) => s.classArm === classArm);
    return res.json({ success: true, count: scores.length, students: affectedStudents });
  });

  // CEO Executive Statistics Endpoint
  app.get('/api/stats', (req, res) => {
    const totalStudents = students.length;
    const heldResultsCount = students.filter((s) => s.resultHeld).length;
    const feeClearedCount = students.filter((s) => s.feeStatus === 'Cleared').length;
    const averageScore = Number(
      (students.reduce((sum, s) => sum + s.termGpa, 0) / Math.max(1, students.length)).toFixed(1)
    );

    res.json({
      totalStudents,
      heldResultsCount,
      feeClearedCount,
      averageScore,
      totalStaff: staffMembers.length,
      classesCount: SCHOOL_CLASSES_DEFINITIONS.length,
    });
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DGC Server running on http://localhost:${PORT}`);
  });
}

startServer();
