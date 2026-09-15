import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  INITIAL_STUDENTS,
  INITIAL_STAFF_MEMBERS,
  SCHOOL_CLASSES_DEFINITIONS,
  calculateGrade,
  computeCaTotal,
  recalculateClassRankings,
} from './src/data/originalData';
import { StudentProfile, StaffMember, SchoolClassDefinition } from './src/types';

// Load provisioned Firebase Applet Configuration
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8')
);

// Initialize Firebase App and target Firestore Database
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// ============================================================================
// FIRESTORE ASYNC PERSISTENCE HELPERS
// ============================================================================
async function dbSaveStudent(student: StudentProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), student, { merge: true });
  } catch (err) {
    console.error(`[Firestore Error] Failed to persist student ${student.id}:`, err);
  }
}

async function dbDeleteStudent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', id));
  } catch (err) {
    console.error(`[Firestore Error] Failed to delete student ${id}:`, err);
  }
}

async function dbSaveStaff(staff: StaffMember): Promise<void> {
  try {
    await setDoc(doc(db, 'staff', staff.id), staff, { merge: true });
  } catch (err) {
    console.error(`[Firestore Error] Failed to persist staff ${staff.id}:`, err);
  }
}

async function dbDeleteStaff(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'staff', id));
  } catch (err) {
    console.error(`[Firestore Error] Failed to delete staff ${id}:`, err);
  }
}

async function dbSaveClass(cls: SchoolClassDefinition): Promise<void> {
  try {
    await setDoc(doc(db, 'classes', cls.id), cls, { merge: true });
  } catch (err) {
    console.error(`[Firestore Error] Failed to persist class ${cls.id}:`, err);
  }
}

async function dbSaveAttendance(recordId: string, record: any): Promise<void> {
  try {
    await setDoc(doc(db, 'attendance', recordId), record);
  } catch (err) {
    console.error(`[Firestore Error] Failed to persist attendance ${recordId}:`, err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Working memory cache kept in sync with Cloud Firestore
  let students: StudentProfile[] = recalculateClassRankings([...INITIAL_STUDENTS]);
  let staffMembers: StaffMember[] = [...INITIAL_STAFF_MEMBERS];
  let schoolClasses: SchoolClassDefinition[] = JSON.parse(JSON.stringify(SCHOOL_CLASSES_DEFINITIONS));

  // Initialize and synchronize with live Cloud Firestore
  try {
    console.log('[Firestore] Synchronizing database state...');
    const [stdSnap, stfSnap, clsSnap] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'staff')),
      getDocs(collection(db, 'classes')),
    ]);

    if (!stdSnap.empty) {
      const loadedStudents: StudentProfile[] = [];
      stdSnap.forEach((d) => loadedStudents.push(d.data() as StudentProfile));
      students = recalculateClassRankings(loadedStudents);
      console.log(`[Firestore] Synchronized ${students.length} real students.`);
    } else {
      console.log('[Firestore] Seeding original student records...');
      const batch = writeBatch(db);
      INITIAL_STUDENTS.forEach((s) => batch.set(doc(db, 'students', s.id), s));
      await batch.commit();
      students = recalculateClassRankings([...INITIAL_STUDENTS]);
    }

    if (!stfSnap.empty) {
      const loadedStaff: StaffMember[] = [];
      stfSnap.forEach((d) => loadedStaff.push(d.data() as StaffMember));
      staffMembers = loadedStaff;
      console.log(`[Firestore] Synchronized ${staffMembers.length} real staff.`);
    } else {
      console.log('[Firestore] Seeding original staff roster...');
      const batch = writeBatch(db);
      INITIAL_STAFF_MEMBERS.forEach((s) => batch.set(doc(db, 'staff', s.id), s));
      await batch.commit();
      staffMembers = [...INITIAL_STAFF_MEMBERS];
    }

    if (!clsSnap.empty) {
      const loadedClasses: SchoolClassDefinition[] = [];
      clsSnap.forEach((d) => loadedClasses.push(d.data() as SchoolClassDefinition));
      schoolClasses = loadedClasses;
      console.log(`[Firestore] Synchronized ${schoolClasses.length} real academic classes.`);
    } else {
      console.log('[Firestore] Seeding original class arms...');
      const batch = writeBatch(db);
      SCHOOL_CLASSES_DEFINITIONS.forEach((c) => batch.set(doc(db, 'classes', c.id), c));
      await batch.commit();
      schoolClasses = JSON.parse(JSON.stringify(SCHOOL_CLASSES_DEFINITIONS));
    }
  } catch (initErr) {
    console.error('[Firestore] Initialization error (falling back to baseline records):', initErr);
  }

  // ============================================================================
  // API ROUTES
  // ============================================================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      school: 'Dominion Stars Global College',
      database: 'Cloud Firestore',
      projectId: firebaseConfig.projectId,
      databaseId: firebaseConfig.firestoreDatabaseId,
    });
  });

  app.get('/api/database/status', (req, res) => {
    res.json({
      status: 'connected',
      provider: 'Google Cloud Firestore',
      projectId: firebaseConfig.projectId,
      databaseId: firebaseConfig.firestoreDatabaseId,
      studentsCount: students.length,
      staffCount: staffMembers.length,
      classesCount: schoolClasses.length,
      lastSync: new Date().toISOString(),
    });
  });

  // --- STAFF ROSTER ENDPOINTS ---
  app.get('/api/staff', (req, res) => {
    res.json({ staff: staffMembers });
  });

  app.post('/api/staff', (req, res) => {
    const { name, title, role, department, email, phone, subjectsTaught, assignedClasses, formMasterOf, formDesignation, qualification } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Staff name is required' });
    }

    const effectiveRole = role || (formMasterOf ? (formDesignation || 'Class Master') : 'Subject Tutor');
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      title: title || 'Mr.',
      email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@dgc.edu.ng`,
      phone: phone || '+234 800 000 0000',
      role: effectiveRole as any,
      department: department || 'General',
      subjectsTaught: Array.isArray(subjectsTaught) ? subjectsTaught : ['General Studies'],
      assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : [],
      formMasterOf: formMasterOf || undefined,
      formDesignation: formDesignation || (title === 'Mrs.' || title === 'Miss' || title === 'Lady' ? 'Form Mistress' : 'Form Master'),
      qualification: qualification || 'B.Sc (Ed)',
      status: 'Active',
      dateJoined: new Date().toISOString().split('T')[0],
    };

    if (formMasterOf) {
      const clsIndex = schoolClasses.findIndex((c) => c.name === formMasterOf);
      if (clsIndex !== -1) {
        schoolClasses[clsIndex].classMaster = newStaff.name;
        dbSaveClass(schoolClasses[clsIndex]);
      }
      if (!newStaff.assignedClasses.includes(formMasterOf)) {
        newStaff.assignedClasses.push(formMasterOf);
      }
    }

    staffMembers.push(newStaff);
    dbSaveStaff(newStaff);
    return res.status(201).json({ success: true, staff: newStaff });
  });

  app.put('/api/staff/:id', (req, res) => {
    const { id } = req.params;
    const index = staffMembers.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const previousFormMasterOf = staffMembers[index].formMasterOf;
    staffMembers[index] = { ...staffMembers[index], ...req.body };

    // Sync formMasterOf changes to schoolClasses
    if (req.body.formMasterOf !== undefined && req.body.formMasterOf !== previousFormMasterOf) {
      if (previousFormMasterOf) {
        const prevClsIndex = schoolClasses.findIndex((c) => c.name === previousFormMasterOf);
        if (prevClsIndex !== -1 && schoolClasses[prevClsIndex].classMaster === staffMembers[index].name) {
          schoolClasses[prevClsIndex].classMaster = 'Unassigned';
          dbSaveClass(schoolClasses[prevClsIndex]);
        }
      }
      if (req.body.formMasterOf) {
        const newClsIndex = schoolClasses.findIndex((c) => c.name === req.body.formMasterOf);
        if (newClsIndex !== -1) {
          schoolClasses[newClsIndex].classMaster = staffMembers[index].name;
          dbSaveClass(schoolClasses[newClsIndex]);
        }
      }
    }

    dbSaveStaff(staffMembers[index]);
    return res.json({ success: true, staff: staffMembers[index] });
  });

  // Delete Staff member and clean up references
  app.delete('/api/staff/:id', (req, res) => {
    const { id } = req.params;
    const targetStaff = staffMembers.find((s) => s.id === id);
    if (targetStaff) {
      // Unassign form master from classes
      schoolClasses.forEach((cls) => {
        let changed = false;
        if (cls.classMaster === targetStaff.name) {
          cls.classMaster = 'Unassigned';
          changed = true;
        }
        if (cls.subjectTeachers) {
          Object.keys(cls.subjectTeachers).forEach((subj) => {
            if (cls.subjectTeachers![subj] === targetStaff.name) {
              delete cls.subjectTeachers![subj];
              changed = true;
            }
          });
        }
        if (changed) {
          dbSaveClass(cls);
        }
      });
    }
    dbDeleteStaff(id);
    staffMembers = staffMembers.filter((s) => s.id !== id);
    return res.json({ success: true, message: 'Teacher deleted and allocations cleared successfully' });
  });

  // Verify staff name for login: checks against uploaded admin staff roster
  app.post('/api/staff/verify', (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ matched: false, message: 'Name parameter required' });
    }

    const cleanInput = name.trim().toLowerCase();
    const inputParts = cleanInput.split(/\s+/).filter(Boolean);

    const matchedStaff = staffMembers.find((staff) => {
      const staffClean = staff.name.toLowerCase().replace(/^(dr|engr|mr|mrs|miss|prof|lady|chief)\.?\s+/i, '');
      const staffParts = staffClean.split(/\s+/).filter(Boolean);

      // Direct inclusion check
      if (staff.name.toLowerCase().includes(cleanInput) || cleanInput.includes(staffClean)) {
        return true;
      }

      // Token overlap check: if at least 2 tokens match or 1 full match if single name
      const matches = inputParts.filter((part) => staffParts.some((sp) => sp.includes(part) || part.includes(sp)));
      if (inputParts.length === 1) {
        return matches.length >= 1;
      }
      return matches.length >= Math.min(2, inputParts.length);
    });

    if (matchedStaff) {
      return res.json({
        matched: true,
        staff: matchedStaff,
        suggestedName: matchedStaff.name,
      });
    }

    return res.json({
      matched: false,
      message: 'Name does not match any registered Dominion Stars Global College staff member.',
    });
  });

  // Bulk / individual assignment of form master and subjects to a teacher
  app.post('/api/staff/assign-allocations', (req, res) => {
    const { staffId, formMasterOf, assignedClasses, subjectsTaught, formDesignation } = req.body;
    if (!staffId) {
      return res.status(400).json({ error: 'staffId is required' });
    }

    const staffIndex = staffMembers.findIndex((s) => s.id === staffId);
    if (staffIndex === -1) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const previousFormMasterOf = staffMembers[staffIndex].formMasterOf;
    const staff = staffMembers[staffIndex];

    if (assignedClasses && Array.isArray(assignedClasses)) {
      staff.assignedClasses = assignedClasses;
    }
    if (subjectsTaught && Array.isArray(subjectsTaught)) {
      staff.subjectsTaught = subjectsTaught;
    }
    if (formDesignation) {
      staff.formDesignation = formDesignation;
    }

    // Handle Form Master reassignment
    if (formMasterOf !== undefined) {
      // Clear previous assignment
      if (previousFormMasterOf && previousFormMasterOf !== formMasterOf) {
        const prevClsIndex = schoolClasses.findIndex((c) => c.name === previousFormMasterOf);
        if (prevClsIndex !== -1 && schoolClasses[prevClsIndex].classMaster === staff.name) {
          schoolClasses[prevClsIndex].classMaster = 'Unassigned';
          dbSaveClass(schoolClasses[prevClsIndex]);
        }
      }

      if (formMasterOf && formMasterOf !== 'None') {
        staff.formMasterOf = formMasterOf;
        staff.role = 'Class Master';
        if (!staff.assignedClasses.includes(formMasterOf)) {
          staff.assignedClasses.push(formMasterOf);
        }

        const newClsIndex = schoolClasses.findIndex((c) => c.name === formMasterOf);
        if (newClsIndex !== -1) {
          // If someone else was the form master, clear their field
          const oldMasterName = schoolClasses[newClsIndex].classMaster;
          if (oldMasterName && oldMasterName !== staff.name) {
            const oldMaster = staffMembers.find((s) => s.name === oldMasterName);
            if (oldMaster) {
              oldMaster.formMasterOf = undefined;
              if (oldMaster.role === 'Class Master') {
                oldMaster.role = 'Subject Tutor';
              }
              dbSaveStaff(oldMaster);
            }
          }
          schoolClasses[newClsIndex].classMaster = staff.name;
          dbSaveClass(schoolClasses[newClsIndex]);
        }
      } else {
        staff.formMasterOf = undefined;
        if (staff.role === 'Class Master') {
          staff.role = 'Subject Tutor';
        }
      }
    }

    dbSaveStaff(staff);
    return res.json({ success: true, staff, classes: schoolClasses });
  });

  // --- SCHOOL CLASSES ENDPOINTS ---
  app.get('/api/classes', (req, res) => {
    // Dynamically calculate student counts from current real students array
    const enriched = schoolClasses.map((cls) => {
      const count = students.filter((s) => s.classArm === cls.name).length;
      return {
        ...cls,
        studentsCount: count,
      };
    });
    res.json({ classes: enriched });
  });

  app.put('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    const index = schoolClasses.findIndex((c) => c.id === id || c.name === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }
    schoolClasses[index] = { ...schoolClasses[index], ...req.body };
    dbSaveClass(schoolClasses[index]);
    return res.json({ success: true, class: schoolClasses[index] });
  });

  // Assign or Remove Form Master to a specific class
  app.post('/api/classes/assign-master', (req, res) => {
    const { className, staffName, staffId } = req.body;
    if (!className) {
      return res.status(400).json({ error: 'className is required' });
    }
    const clsIndex = schoolClasses.findIndex((c) => c.name === className || c.id === className);
    if (clsIndex === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const previousStaff = staffMembers.find((s) => s.formMasterOf === className);

    if (!staffName || staffName === 'Unassigned') {
      schoolClasses[clsIndex].classMaster = 'Unassigned';
      if (previousStaff) {
        previousStaff.formMasterOf = undefined;
        if (previousStaff.role === 'Class Master') {
          previousStaff.role = 'Subject Tutor';
        }
        dbSaveStaff(previousStaff);
      }
      dbSaveClass(schoolClasses[clsIndex]);
      return res.json({ success: true, class: schoolClasses[clsIndex] });
    }

    // Previous form master of this class loses formMasterOf
    if (previousStaff && previousStaff.name !== staffName) {
      previousStaff.formMasterOf = undefined;
      if (previousStaff.role === 'Class Master') {
        previousStaff.role = 'Subject Tutor';
      }
      dbSaveStaff(previousStaff);
    }

    schoolClasses[clsIndex].classMaster = staffName;
    dbSaveClass(schoolClasses[clsIndex]);

    // Update new Form Master staff record
    const staff = staffMembers.find((s) => s.name === staffName || s.id === staffId);
    if (staff) {
      staff.role = 'Class Master';
      staff.formMasterOf = className;
      if (!staff.assignedClasses.includes(className)) {
        staff.assignedClasses.push(className);
      }
      dbSaveStaff(staff);
    }

    return res.json({ success: true, class: schoolClasses[clsIndex], staff });
  });

  // Assign or Remove a Subject Teacher to a subject in a specific class
  app.post('/api/classes/assign-subject-teacher', (req, res) => {
    const { className, subjectName, staffName } = req.body;
    if (!className || !subjectName) {
      return res.status(400).json({ error: 'className and subjectName are required' });
    }
    const clsIndex = schoolClasses.findIndex((c) => c.name === className || c.id === className);
    if (clsIndex === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (!schoolClasses[clsIndex].subjectTeachers) {
      schoolClasses[clsIndex].subjectTeachers = {};
    }

    if (!staffName || staffName === 'Unassigned') {
      delete schoolClasses[clsIndex].subjectTeachers![subjectName];
    } else {
      schoolClasses[clsIndex].subjectTeachers![subjectName] = staffName;
      // Also ensure staff has this subject and class in their roster
      const staff = staffMembers.find((s) => s.name === staffName);
      if (staff) {
        if (!staff.subjectsTaught.includes(subjectName)) {
          staff.subjectsTaught.push(subjectName);
        }
        if (!staff.assignedClasses.includes(className)) {
          staff.assignedClasses.push(className);
        }
        dbSaveStaff(staff);
      }
    }

    dbSaveClass(schoolClasses[clsIndex]);
    return res.json({ success: true, class: schoolClasses[clsIndex] });
  });

  // Remove Subject Teacher assignment
  app.post('/api/classes/remove-subject-teacher', (req, res) => {
    const { className, subjectName } = req.body;
    const clsIndex = schoolClasses.findIndex((c) => c.name === className || c.id === className);
    if (clsIndex !== -1 && schoolClasses[clsIndex].subjectTeachers) {
      delete schoolClasses[clsIndex].subjectTeachers![subjectName];
      dbSaveClass(schoolClasses[clsIndex]);
    }
    return res.json({ success: true, class: clsIndex !== -1 ? schoolClasses[clsIndex] : null });
  });

  // --- STUDENT & ACADEMIC ENDPOINTS ---
  app.get('/api/students', (req, res) => {
    const { classArm, stream, feeStatus, held } = req.query;
    let filtered = [...students];

    if (classArm && classArm !== 'All') {
      filtered = filtered.filter((s) => s.classArm === classArm);
    }
    if (stream && stream !== 'All') {
      filtered = filtered.filter((s) => s.stream === stream);
    }
    if (feeStatus && feeStatus !== 'All') {
      filtered = filtered.filter((s) => s.feeStatus === feeStatus);
    }
    if (held !== undefined) {
      filtered = filtered.filter((s) => s.resultHeld === (held === 'true'));
    }

    res.json({ students: filtered, total: filtered.length });
  });

  app.get('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const student = students.find((s) => s.id === id || s.admissionNo.toLowerCase() === id.toLowerCase());
    if (!student) {
      return res.status(404).json({ error: 'Student record not found in database' });
    }
    res.json({ student });
  });

  // Create / Register a new student
  app.post('/api/students', (req, res) => {
    const {
      name,
      admissionNo,
      classArm,
      stream,
      gender,
      dateOfBirth,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianAddress,
      bloodGroup,
      genotype,
      stateOfOrigin,
      previousSchool,
      medicalNotes,
      feeStatus,
      session,
      term,
      customSubjects,
      attendanceRate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Student full name is required' });
    }
    if (!classArm || !classArm.trim()) {
      return res.status(400).json({ error: 'Class arm is required' });
    }

    // Determine Level from class name
    let level: 'JSS 1' | 'JSS 2' | 'JSS 3' | 'SS 1' | 'SS 2' | 'SS 3' = 'JSS 1';
    if (classArm.startsWith('JSS 1')) level = 'JSS 1';
    else if (classArm.startsWith('JSS 2')) level = 'JSS 2';
    else if (classArm.startsWith('JSS 3')) level = 'JSS 3';
    else if (classArm.startsWith('SS 1')) level = 'SS 1';
    else if (classArm.startsWith('SS 2')) level = 'SS 2';
    else if (classArm.startsWith('SS 3')) level = 'SS 3';

    // Auto-generate official DGC Registration / Admission number if not provided
    let finalAdmissionNo = admissionNo && admissionNo.trim() ? admissionNo.trim().toUpperCase() : '';
    if (!finalAdmissionNo) {
      const year = new Date().getFullYear();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      finalAdmissionNo = `DGC/${year}/${randomSeq}`;
    }

    // Check duplicate admission numbers
    const existing = students.find((s) => s.admissionNo.toLowerCase() === finalAdmissionNo.toLowerCase());
    if (existing) {
      return res.status(409).json({
        error: `Registration Number '${finalAdmissionNo}' already belongs to ${existing.name}. Please enter a unique registration number.`,
      });
    }

    // Standard subjects allocation based on academic division
    let initialSubjects: any[] = [];
    if (customSubjects && Array.isArray(customSubjects) && customSubjects.length > 0) {
      initialSubjects = customSubjects.map((subName: string) => ({
        code: subName.substring(0, 3).toUpperCase() + ' 101',
        name: subName,
        homework: 0,
        test1: 0,
        test2: 0,
        practical: 0,
        quiz: 0,
        caTotal: 0,
        exam: 0,
        total: 0,
        grade: 'F9',
        remark: 'Ungraded',
        updatedBy: 'Registration System',
        updatedAt: new Date().toISOString(),
      }));
    } else if (level.startsWith('JSS')) {
      const defaultJunior = [
        'Mathematics',
        'English Language',
        'Basic Science',
        'Basic Technology',
        'Social Studies',
        'Civic Education',
        'Agricultural Science',
        'Christian Religious Studies',
        'Business Studies',
        'Computer Studies / ICT',
      ];
      initialSubjects = defaultJunior.map((subName) => ({
        code: subName.substring(0, 3).toUpperCase() + ' 101',
        name: subName,
        homework: 0,
        test1: 0,
        test2: 0,
        practical: 0,
        quiz: 0,
        caTotal: 0,
        exam: 0,
        total: 0,
        grade: 'F9',
        remark: 'Ungraded',
        updatedBy: 'Registration System',
        updatedAt: new Date().toISOString(),
      }));
    } else {
      const defaultSenior = [
        'English Language',
        'General Mathematics',
        'Civic Education',
        'Economics',
        'Biology',
        'Computer Studies / Data Processing',
        stream === 'Science' ? 'Physics' : stream === 'Art' ? 'Literature-in-English' : 'Financial Accounting',
        stream === 'Science' ? 'Chemistry' : stream === 'Art' ? 'Government' : 'Commerce',
      ];
      initialSubjects = defaultSenior.map((subName) => ({
        code: subName.substring(0, 3).toUpperCase() + ' 201',
        name: subName,
        homework: 0,
        test1: 0,
        test2: 0,
        practical: 0,
        quiz: 0,
        caTotal: 0,
        exam: 0,
        total: 0,
        grade: 'F9',
        remark: 'Ungraded',
        updatedBy: 'Registration System',
        updatedAt: new Date().toISOString(),
      }));
    }

    const newStudent: StudentProfile = {
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      admissionNo: finalAdmissionNo,
      classArm,
      level,
      stream: stream || (level.startsWith('JSS') ? 'Junior' : 'General'),
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '2010-05-15',
      session: session || '2026/2027',
      term: term || 'First Term',
      guardianName: guardianName || 'Guardian',
      guardianPhone: guardianPhone || '+234 800 000 0000',
      guardianEmail: guardianEmail || '',
      residentialAddress: guardianAddress || 'Enugu, Nigeria',
      bloodGroup: bloodGroup || 'O+',
      genotype: genotype || 'AA',
      stateOfOrigin: stateOfOrigin || 'Enugu State',
      previousSchool: previousSchool || '',
      medicalConditions: medicalNotes || 'None reported',
      feeStatus: feeStatus || 'Cleared',
      resultHeld: false,
      attendanceRate: attendanceRate !== undefined ? Number(attendanceRate) : 95,
      termGpa: 0,
      termRank: 'N/A',
      subjects: initialSubjects,
      affectiveDomain: {
        punctuality: 4,
        neatness: 4,
        politeness: 4,
        honesty: 5,
        relationshipWithOthers: 4,
        leadership: 4,
        emotionalStability: 4,
        attentiveness: 4,
      },
      psychomotorDomain: {
        handwriting: 4,
        sportsAndGames: 4,
        manualSkills: 4,
        speechFluency: 4,
        musicalSkills: 3,
        drawingAndArt: 4,
      },
      formTeacherComment: 'A newly enrolled scholar at Dominion Stars Global College. Ready to pursue academic excellence.',
      principalComment: 'Welcome to Dominion Stars Global College. Maintain steadfast discipline and strive for high moral standards.',
      nextTermBegins: '12th January, 2027',
      timesSchoolOpened: 120,
      timesPresent: 114,
      timesPunctual: 110,
    };

    students.unshift(newStudent);
    students = recalculateClassRankings(students);
    const registered = students.find((s) => s.id === newStudent.id) || newStudent;

    // Asynchronously write to live Firestore database
    dbSaveStudent(registered);

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

    // Asynchronously persist to Firestore
    dbSaveStudent(updated);

    return res.json({ success: true, student: updated });
  });

  // Delete Student
  app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const exists = students.some((s) => s.id === id);
    if (!exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    dbDeleteStudent(id);
    students = students.filter((s) => s.id !== id);
    students = recalculateClassRankings(students);
    return res.json({ success: true, message: 'Student deleted successfully from live database', remainingCount: students.length });
  });

  // Hold or Release Student Result
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

    dbSaveStudent(students[index]);

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
        const updated = {
          ...s,
          resultHeld: isHold,
          holdReason: isHold ? reason || `Class-wide administrative hold for ${classArm}` : undefined,
        };
        dbSaveStudent(updated);
        return updated;
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

  // Insert or Update Subject Score
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
      updatedBy: updatedBy || 'Authorized Teacher',
      updatedAt: new Date().toISOString(),
    };

    if (existingSubjectIdx >= 0) {
      student.subjects[existingSubjectIdx] = updatedScore;
    } else {
      student.subjects.push(updatedScore);
    }

    students[index] = student;
    students = recalculateClassRankings(students);

    const updatedStudent = students.find((s) => s.id === id) || student;
    dbSaveStudent(updatedStudent);

    return res.json({ success: true, student: updatedStudent, updatedScore });
  });

  // Batch Upload Scores for Class Arm
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
    affectedStudents.forEach((std) => dbSaveStudent(std));

    return res.json({ success: true, count: scores.length, students: affectedStudents });
  });

  // Daily Class Attendance Endpoint
  app.post('/api/attendance/mark', (req, res) => {
    const { className, date, sessionPeriod, markedBy, records } = req.body;
    if (!className || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid attendance submission' });
    }

    const attendanceId = `att_${className.replace(/\s+/g, '_')}_${(date || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9]/g, '_')}`;

    records.forEach((rec: { studentId: string; status: 'Present' | 'Absent' | 'Late' | 'Excused'; remarks?: string; newAttendanceRate?: number }) => {
      const studentIndex = students.findIndex((s) => s.id === rec.studentId);
      if (studentIndex !== -1) {
        let currentRate = students[studentIndex].attendanceRate ?? 95;
        if (rec.newAttendanceRate !== undefined) {
          currentRate = rec.newAttendanceRate;
        } else if (rec.status === 'Absent') {
          currentRate = Math.max(50, Math.round((currentRate - 1.5) * 10) / 10);
        } else if (rec.status === 'Present') {
          currentRate = Math.min(100, Math.round((currentRate + 0.3) * 10) / 10);
        }
        students[studentIndex].attendanceRate = currentRate;
        dbSaveStudent(students[studentIndex]);
      }
    });

    dbSaveAttendance(attendanceId, {
      className,
      date: date || new Date().toISOString().split('T')[0],
      sessionPeriod: sessionPeriod || 'Morning Assembly',
      markedBy: markedBy || 'Form Master',
      records,
      recordedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: `Attendance for ${className} on ${date || 'today'} recorded successfully into Firestore database.`,
      recordsCount: records.length,
      students,
    });
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
      classesCount: schoolClasses.length,
      database: 'Cloud Firestore (Live)',
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
    console.log(`DGC Server with Live Firestore running on http://localhost:${PORT}`);
  });
}

startServer();
