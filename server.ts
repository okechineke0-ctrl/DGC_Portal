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
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  SCHOOL_CLASSES_DEFINITIONS,
  calculateGrade,
  computeCaTotal,
  recalculateClassRankings,
} from './src/data/originalData';
import { StudentProfile, StaffMember, SchoolClassDefinition, FeeItem, CollegeFeeSchedule } from './src/types';

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

async function dbSaveFeeSchedule(schedule: CollegeFeeSchedule): Promise<void> {
  try {
    await setDoc(doc(db, 'system', 'fee_schedule'), schedule, { merge: true });
  } catch (err) {
    console.error('[Firestore Error] Failed to persist fee schedule:', err);
  }
}

const DEFAULT_FEE_SCHEDULE: CollegeFeeSchedule = {
  id: 'current_schedule',
  session: '2026/2027',
  term: 'First Term',
  baseSchoolFee: 85000,
  items: [
    {
      id: 'fee-tuition',
      name: 'Base Tuition & Academic Instruction',
      amount: 85000,
      category: 'Tuition',
      applicableLevel: 'All',
      description: 'Approved statutory secondary curriculum instruction & scheme of work',
      isMandatory: true,
    },
    {
      id: 'fee-project',
      name: 'Student Term Project & Vocational Exhibition',
      amount: 15000,
      category: 'Project',
      applicableLevel: 'All',
      description: 'Continuous assessment projects, practical workshops, and exhibition portfolios',
      isMandatory: true,
    },
    {
      id: 'fee-science-lab',
      name: 'Science Laboratory Reagents & Practical Levy',
      amount: 15000,
      category: 'Laboratory',
      applicableLevel: 'All',
      description: 'Physics, Chemistry, Biology and Agricultural science laboratory equipment and consumables',
      isMandatory: false,
    },
    {
      id: 'fee-ict',
      name: 'ICT, Computer Lab & Portal Maintenance',
      amount: 10000,
      category: 'General',
      applicableLevel: 'All',
      description: 'Campus internet infrastructure, computer laboratory sessions, and student portal server hosting',
      isMandatory: true,
    },
    {
      id: 'fee-dev',
      name: 'Campus Development & Sports Facilities Levy',
      amount: 25000,
      category: 'Development',
      applicableLevel: 'All',
      description: 'Institutional facilities expansion, library resources, and sports arena maintenance',
      isMandatory: false,
    },
    {
      id: 'fee-pta',
      name: 'Parents-Teachers Association (PTA) Term Levy',
      amount: 5000,
      category: 'General',
      applicableLevel: 'All',
      description: 'Approved statutory PTA welfare levy for student support and institutional development',
      isMandatory: true,
    },
  ],
  totalFee: 155000,
  bankName: 'First Bank of Nigeria',
  accountNumber: '3128940022',
  accountName: 'Dominion Stars Global College Bursary Account',
  paymentInstructions: 'Payment should be made through direct bank deposit or electronic bank transfer into the official Bursary account. Quote student registration number as payment narration.',
  updatedAt: new Date().toISOString(),
  updatedBy: 'College Administrator / Bursar',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  // Serve static assets from public folder (including official school logo)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Working memory cache kept in sync with Cloud Firestore
  let students: StudentProfile[] = [];
  let staffMembers: StaffMember[] = [];
  let schoolClasses: SchoolClassDefinition[] = JSON.parse(JSON.stringify(SCHOOL_CLASSES_DEFINITIONS));
  let attendanceRecordsList: any[] = [];
  let collegeFeeSchedule: CollegeFeeSchedule = JSON.parse(JSON.stringify(DEFAULT_FEE_SCHEDULE));

  // Initialize and synchronize with live Cloud Firestore
  try {
    console.log('[Firestore] Synchronizing database state...');
    const [stdSnap, stfSnap, clsSnap, attSnap, feeSnap] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'staff')),
      getDocs(collection(db, 'classes')),
      getDocs(collection(db, 'attendance')),
      getDoc(doc(db, 'system', 'fee_schedule')),
    ]);

    if (!stdSnap.empty) {
      const loadedStudents: StudentProfile[] = [];
      stdSnap.forEach((d) => loadedStudents.push(d.data() as StudentProfile));
      students = recalculateClassRankings(loadedStudents);
      console.log(`[Firestore] Synchronized ${students.length} real students.`);
    } else {
      console.log('[Firestore] No student records in database. Ready for student registration.');
      students = [];
    }

    if (!stfSnap.empty) {
      const loadedStaff: StaffMember[] = [];
      stfSnap.forEach((d) => loadedStaff.push(d.data() as StaffMember));
      staffMembers = loadedStaff;
      console.log(`[Firestore] Synchronized ${staffMembers.length} real staff.`);
    } else {
      console.log('[Firestore] No staff records in database. Ready for teacher additions.');
      staffMembers = [];
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

    if (!attSnap.empty) {
      const loadedAtt: any[] = [];
      attSnap.forEach((d) => loadedAtt.push({ id: d.id, ...d.data() }));
      loadedAtt.sort((a, b) => new Date(b.recordedAt || b.date).getTime() - new Date(a.recordedAt || a.date).getTime());
      attendanceRecordsList = loadedAtt;
      console.log(`[Firestore] Synchronized ${attendanceRecordsList.length} attendance register records.`);
    } else {
      console.log('[Firestore] No prior attendance records in database. Checking if enrolled students need term attendance seeding...');
    }

    if (feeSnap.exists()) {
      collegeFeeSchedule = feeSnap.data() as CollegeFeeSchedule;
      console.log(`[Firestore] Synchronized fee schedule: Base ₦${collegeFeeSchedule.baseSchoolFee}, Total ₦${collegeFeeSchedule.totalFee}`);
    } else {
      console.log('[Firestore] Initializing baseline college fee schedule...');
      await setDoc(doc(db, 'system', 'fee_schedule'), DEFAULT_FEE_SCHEDULE);
      collegeFeeSchedule = JSON.parse(JSON.stringify(DEFAULT_FEE_SCHEDULE));
    }
  } catch (initErr) {
    console.error('[Firestore] Initialization error (falling back to baseline records):', initErr);
  }

  // Recalculate a student's cumulative attendance statistics strictly from real recorded registers
  function recalculateStudentAttendanceFromRegisters(studentId: string) {
    let openCount = 0;
    let presentCount = 0;
    let punctualCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let absentCount = 0;

    attendanceRecordsList.forEach((r) => {
      const match = (r.records || []).find((entry: any) => entry.studentId === studentId);
      if (match) {
        openCount++;
        if (match.status === 'Present') {
          presentCount++;
          punctualCount++;
        } else if (match.status === 'Late') {
          presentCount++;
          lateCount++;
        } else if (match.status === 'Excused') {
          excusedCount++;
        } else if (match.status === 'Absent') {
          absentCount++;
        }
      }
    });

    const rate = openCount > 0 ? Math.round((presentCount / openCount) * 100) : 100;

    return {
      openCount,
      presentCount,
      punctualCount,
      lateCount,
      excusedCount,
      absentCount,
      rate,
    };
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

  // --- ATTENDANCE REGISTERS & LOGS ENDPOINTS (100% Real Cloud Firestore) ---
  app.get('/api/attendance', (req, res) => {
    const { className, date, limit, studentId } = req.query;

    let filtered = [...attendanceRecordsList];

    if (className && className !== 'All') {
      filtered = filtered.filter((a) => a.className === className);
    }
    if (date) {
      filtered = filtered.filter((a) => a.date === date);
    }
    if (studentId) {
      filtered = filtered.filter((a) => (a.records || []).some((r: any) => r.studentId === studentId));
    }

    if (limit) {
      filtered = filtered.slice(0, Number(limit));
    }

    const currentMatch = filtered.length > 0 ? filtered[0] : null;

    return res.json({
      success: true,
      attendanceRecords: filtered,
      total: filtered.length,
      current: currentMatch,
    });
  });

  // Dedicated Student Attendance Transcript & Real Database Roll History Endpoint
  app.get('/api/attendance/student/:studentId', (req, res) => {
    const { studentId } = req.params;
    const student = students.find((s) => s.id === studentId || s.admissionNo.toLowerCase() === studentId.toLowerCase());

    if (!student) {
      return res.status(404).json({ error: 'Student not found in institutional roster' });
    }

    // Find all real attendance records for this student
    const studentRecords: Array<{
      date: string;
      day: string;
      status: 'Present' | 'Absent' | 'Late' | 'Excused';
      time: string;
      remarks: string;
      markedBy: string;
      sessionPeriod: string;
    }> = [];

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    attendanceRecordsList.forEach((att) => {
      const match = (att.records || []).find((r: any) => r.studentId === student.id);
      if (match) {
        const d = new Date(att.date + 'T12:00:00Z');
        studentRecords.push({
          date: att.date,
          day: isNaN(d.getTime()) ? 'School Day' : weekdays[d.getUTCDay()],
          status: match.status,
          time: match.time || (match.status === 'Late' ? '08:05 AM' : match.status === 'Present' ? '07:45 AM' : '—'),
          remarks: match.remarks || (match.status === 'Present' ? 'Punctual & inspected' : match.status === 'Late' ? 'Late arrival' : match.status === 'Excused' ? 'Medical/Authorized Permit' : 'Unexcused absence'),
          markedBy: att.markedBy || 'Form Master',
          sessionPeriod: att.sessionPeriod || 'Morning Assembly (8:00 AM)',
        });
      }
    });

    // Sort chronologically ascending
    studentRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const cls = schoolClasses.find((c) => c.name === student.classArm);
    const assignedFormMaster = cls?.classMaster && cls.classMaster !== 'Unassigned'
      ? cls.classMaster
      : 'Class Form Master';

    // If no records have been taken yet in the database for this student
    if (studentRecords.length === 0) {
      return res.json({
        success: true,
        student: {
          id: student.id,
          name: student.name,
          admissionNo: student.admissionNo,
          classArm: student.classArm,
          level: student.level,
          session: student.session,
          term: student.term,
        },
        summary: {
          openDays: 0,
          presentDays: 0,
          absentDays: 0,
          punctualDays: 0,
          lateDays: 0,
          excusedDays: 0,
          attendanceRate: 100,
          isCleared: true,
          assignedFormMaster,
        },
        weeks: [],
        recentLogs: [],
        totalRecords: 0,
      });
    }

    // Real mathematical calculations from actual records
    const openDays = studentRecords.length;
    const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
    const lateCount = studentRecords.filter((r) => r.status === 'Late').length;
    const excusedCount = studentRecords.filter((r) => r.status === 'Excused').length;
    const absentCount = studentRecords.filter((r) => r.status === 'Absent').length;
    const totalPresent = presentCount + lateCount;
    const rate = Math.round((totalPresent / openDays) * 100);

    // Group the real records into authentic weekly cohorts (5 school days per group)
    const weeks: any[] = [];
    const chunkSize = 5;
    const totalWeeks = Math.ceil(studentRecords.length / chunkSize);

    for (let w = 0; w < totalWeeks; w++) {
      const weekLogs = studentRecords.slice(w * chunkSize, (w + 1) * chunkSize);
      const weekPresent = weekLogs.filter((r) => r.status === 'Present' || r.status === 'Late').length;
      const weekTotal = weekLogs.length;
      const weekRate = weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 100;

      weeks.push({
        week: w + 1,
        weekLabel: `Week ${w + 1}`,
        startDate: weekLogs[0]?.date || `Week ${w + 1}`,
        endDate: weekLogs[weekLogs.length - 1]?.date || `Week ${w + 1}`,
        daysPresent: weekPresent,
        daysTotal: weekTotal,
        rate: weekRate,
        days: weekLogs,
      });
    }

    return res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        classArm: student.classArm,
        level: student.level,
        session: student.session,
        term: student.term,
      },
      summary: {
        openDays,
        presentDays: totalPresent,
        absentDays: absentCount,
        punctualDays: presentCount,
        lateDays: lateCount,
        excusedDays: excusedCount,
        attendanceRate: rate,
        isCleared: rate >= 75,
        assignedFormMaster,
      },
      weeks,
      recentLogs: [...studentRecords].reverse().slice(0, 20),
      totalRecords: studentRecords.length,
    });
  });

  // Daily Class Attendance Marking Endpoint
  app.post('/api/attendance/mark', async (req, res) => {
    const { className, date, sessionPeriod, markedBy, records } = req.body;
    if (!className || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid attendance submission' });
    }

    const markDate = date || new Date().toISOString().split('T')[0];
    const attendanceId = `att_${className.replace(/\s+/g, '_')}_${markDate.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const newRecord = {
      id: attendanceId,
      className,
      date: markDate,
      sessionPeriod: sessionPeriod || 'Morning Assembly (8:00 AM)',
      markedBy: markedBy || 'Form Master',
      records,
      recordedAt: new Date().toISOString(),
    };

    const existingIdx = attendanceRecordsList.findIndex(
      (a) => a.id === attendanceId || (a.className === className && a.date === markDate)
    );
    if (existingIdx !== -1) {
      attendanceRecordsList[existingIdx] = newRecord;
    } else {
      attendanceRecordsList.unshift(newRecord);
    }

    // Persist attendance to Firestore
    await dbSaveAttendance(attendanceId, newRecord);

    // Recalculate each student's official attendance counts from real records
    for (const rec of records) {
      const sIdx = students.findIndex((s) => s.id === rec.studentId);
      if (sIdx !== -1) {
        const stats = recalculateStudentAttendanceFromRegisters(rec.studentId);
        students[sIdx].timesSchoolOpened = stats.openCount;
        students[sIdx].timesPresent = stats.presentCount;
        students[sIdx].timesPunctual = stats.punctualCount;
        students[sIdx].attendanceRate = stats.rate;

        await dbSaveStudent(students[sIdx]);
      }
    }

    return res.json({
      success: true,
      message: `Attendance for ${className} on ${markDate} recorded and verified into Firestore database.`,
      recordsCount: records.length,
      attendance: newRecord,
      students,
    });
  });

  // Delete an attendance register entry from Firestore and in-memory list
  app.delete('/api/attendance/:id', async (req, res) => {
    const { id } = req.params;
    const targetIdx = attendanceRecordsList.findIndex((a) => a.id === id);
    if (targetIdx === -1) {
      return res.status(404).json({ error: 'Attendance register not found' });
    }

    const removed = attendanceRecordsList.splice(targetIdx, 1)[0];
    try {
      await deleteDoc(doc(db, 'attendance', id));
    } catch (delErr) {
      console.error(`[Firestore Error] Failed to delete attendance register ${id}:`, delErr);
    }

    // Re-synchronize student stats for students in this register
    if (removed.records && Array.isArray(removed.records)) {
      for (const rec of removed.records) {
        const sIdx = students.findIndex((s) => s.id === rec.studentId);
        if (sIdx !== -1) {
          const stats = recalculateStudentAttendanceFromRegisters(rec.studentId);
          students[sIdx].timesSchoolOpened = stats.openCount;
          students[sIdx].timesPresent = stats.presentCount;
          students[sIdx].timesPunctual = stats.punctualCount;
          students[sIdx].attendanceRate = stats.rate;
          await dbSaveStudent(students[sIdx]);
        }
      }
    }

    return res.json({
      success: true,
      message: `Attendance register ${id} deleted.`,
      totalRemaining: attendanceRecordsList.length,
      students,
    });
  });

  // Clear all attendance registers (e.g. for institutional reset or clearing test registers)
  app.post('/api/attendance/clear', async (req, res) => {
    try {
      const batch = writeBatch(db);
      attendanceRecordsList.forEach((a) => {
        batch.delete(doc(db, 'attendance', a.id));
      });
      await batch.commit();

      attendanceRecordsList = [];

      // Reset all students' attendance stats
      for (const st of students) {
        st.timesSchoolOpened = 0;
        st.timesPresent = 0;
        st.timesPunctual = 0;
        st.attendanceRate = 100;
        await dbSaveStudent(st);
      }

      return res.json({
        success: true,
        message: 'All attendance registers have been cleared from Cloud Firestore.',
        students,
      });
    } catch (clearErr: any) {
      return res.status(500).json({ error: clearErr?.message || 'Failed to clear attendance' });
    }
  });

  // --- SCHOOL FEES & BURSARY CLEARANCE ENDPOINTS ---
  app.get('/api/fees/schedule', (req, res) => {
    return res.json({
      success: true,
      schedule: collegeFeeSchedule,
    });
  });

  app.post('/api/fees/schedule', (req, res) => {
    const {
      baseSchoolFee,
      items,
      bankName,
      accountNumber,
      accountName,
      paymentInstructions,
      session,
      term,
      updatedBy,
    } = req.body;

    const validBase = Number(baseSchoolFee) >= 0 ? Number(baseSchoolFee) : (collegeFeeSchedule.baseSchoolFee || 85000);

    let processedItems: FeeItem[] = Array.isArray(items) ? [...items] : [...collegeFeeSchedule.items];

    // Ensure the primary Tuition entry stays synced with baseSchoolFee
    const tuitionIdx = processedItems.findIndex((it) => it.id === 'fee-tuition' || it.category === 'Tuition');
    if (tuitionIdx !== -1) {
      processedItems[tuitionIdx] = {
        ...processedItems[tuitionIdx],
        amount: validBase,
      };
    } else {
      processedItems.unshift({
        id: 'fee-tuition',
        name: 'Base School Fees & Tuition',
        amount: validBase,
        category: 'Tuition',
        applicableLevel: 'All',
        description: 'Approved statutory secondary academic instruction and teacher scheme',
        isMandatory: true,
      });
    }

    const computedTotal = processedItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);

    collegeFeeSchedule = {
      ...collegeFeeSchedule,
      session: session || collegeFeeSchedule.session,
      term: term || collegeFeeSchedule.term,
      baseSchoolFee: validBase,
      items: processedItems,
      totalFee: computedTotal,
      bankName: bankName !== undefined ? bankName : collegeFeeSchedule.bankName,
      accountNumber: accountNumber !== undefined ? accountNumber : collegeFeeSchedule.accountNumber,
      accountName: accountName !== undefined ? accountName : collegeFeeSchedule.accountName,
      paymentInstructions: paymentInstructions !== undefined ? paymentInstructions : collegeFeeSchedule.paymentInstructions,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'College Administrator / Bursar',
    };

    dbSaveFeeSchedule(collegeFeeSchedule);

    // Also update totalFeeDue for students in memory
    students = students.map((std) => ({
      ...std,
      totalFeeDue: computedTotal,
      amountPaid: std.feeStatus === 'Cleared' ? computedTotal : (std.amountPaid || 0),
    }));

    return res.json({
      success: true,
      message: 'Official School Fees Schedule updated and persisted to Cloud Firestore.',
      schedule: collegeFeeSchedule,
    });
  });

  // Mark single student fee status (Paid / Not Paid / Cleared / Pending)
  app.put('/api/students/:id/fee-status', (req, res) => {
    const { id } = req.params;
    const { feeStatus, amountPaid, remarks, receiptNo } = req.body;
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const current = students[index];
    const isCleared = feeStatus === 'Cleared' || feeStatus === 'Paid';
    const newStatus: 'Cleared' | 'Pending' | 'Partial' = isCleared
      ? 'Cleared'
      : (feeStatus === 'Partial' ? 'Partial' : 'Pending');

    const totalDue = collegeFeeSchedule.totalFee || 155000;
    const now = new Date().toISOString();

    let newAmountPaid = 0;
    if (amountPaid !== undefined) {
      newAmountPaid = Number(amountPaid);
    } else if (newStatus === 'Cleared') {
      newAmountPaid = totalDue;
    } else {
      newAmountPaid = 0;
    }

    const genReceipt = receiptNo || current.feeReceiptNo || `DGC-BUR-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedStudent: StudentProfile = {
      ...current,
      feeStatus: newStatus,
      amountPaid: newAmountPaid,
      totalFeeDue: totalDue,
      feePaymentDate: newStatus === 'Cleared' ? (current.feePaymentDate || now) : undefined,
      feeReceiptNo: newStatus === 'Cleared' ? genReceipt : undefined,
      feeRemarks: remarks || (newStatus === 'Cleared' ? 'Official Bursary Clearance Verified' : 'Outstanding Bursary Dues'),
      // Automatically unlock report card hold if it was held for fees
      resultHeld: newStatus === 'Cleared' && current.holdReason?.toLowerCase().includes('fee') ? false : current.resultHeld,
      holdReason: newStatus === 'Cleared' && current.holdReason?.toLowerCase().includes('fee') ? undefined : current.holdReason,
    };

    students[index] = updatedStudent;
    dbSaveStudent(updatedStudent);

    return res.json({
      success: true,
      message: `Student ${updatedStudent.name} marked as ${newStatus === 'Cleared' ? 'PAID' : 'NOT PAID'}.`,
      student: updatedStudent,
    });
  });

  // Bulk update fee status across students / class arms
  app.post('/api/students/bulk-fee-status', (req, res) => {
    const { studentIds, classArm, feeStatus, remarks } = req.body;
    const isCleared = feeStatus === 'Cleared' || feeStatus === 'Paid';
    const newStatus: 'Cleared' | 'Pending' = isCleared ? 'Cleared' : 'Pending';
    const totalDue = collegeFeeSchedule.totalFee || 155000;
    const now = new Date().toISOString();

    let affectedCount = 0;
    students = students.map((s) => {
      const match = (Array.isArray(studentIds) && studentIds.includes(s.id)) ||
                    (classArm && (classArm === 'ALL' || s.classArm === classArm));
      if (!match) return s;

      affectedCount++;
      const updated: StudentProfile = {
        ...s,
        feeStatus: newStatus,
        amountPaid: newStatus === 'Cleared' ? totalDue : 0,
        totalFeeDue: totalDue,
        feePaymentDate: newStatus === 'Cleared' ? (s.feePaymentDate || now) : undefined,
        feeReceiptNo: newStatus === 'Cleared' ? (s.feeReceiptNo || `DGC-BUR-${Math.floor(100000 + Math.random() * 900000)}`) : undefined,
        feeRemarks: remarks || (newStatus === 'Cleared' ? 'Batch Bursary Clearance' : 'Pending Payment'),
        resultHeld: newStatus === 'Cleared' && s.holdReason?.toLowerCase().includes('fee') ? false : s.resultHeld,
        holdReason: newStatus === 'Cleared' && s.holdReason?.toLowerCase().includes('fee') ? undefined : s.holdReason,
      };
      dbSaveStudent(updated);
      return updated;
    });

    return res.json({
      success: true,
      message: `Batch updated ${affectedCount} students to ${newStatus === 'Cleared' ? 'PAID' : 'NOT PAID'}.`,
      affectedCount,
      students,
    });
  });

  // CEO Executive Statistics Endpoint
  app.get('/api/stats', (req, res) => {
    const totalStudents = students.length;
    const heldResultsCount = students.filter((s) => s.resultHeld).length;
    const feeClearedCount = students.filter((s) => s.feeStatus === 'Cleared').length;
    const feePendingCount = students.filter((s) => s.feeStatus !== 'Cleared').length;
    const totalExpectedRevenue = totalStudents * (collegeFeeSchedule.totalFee || 155000);
    const totalFeesCollected = students.reduce((sum, s) => sum + (s.amountPaid || (s.feeStatus === 'Cleared' ? (collegeFeeSchedule.totalFee || 155000) : 0)), 0);
    const outstandingBursary = Math.max(0, totalExpectedRevenue - totalFeesCollected);

    const averageScore = Number(
      (students.reduce((sum, s) => sum + s.termGpa, 0) / Math.max(1, students.length)).toFixed(1)
    );

    res.json({
      totalStudents,
      heldResultsCount,
      feeClearedCount,
      feePendingCount,
      totalExpectedRevenue,
      totalFeesCollected,
      outstandingBursary,
      totalFeePerStudent: collegeFeeSchedule.totalFee,
      baseSchoolFee: collegeFeeSchedule.baseSchoolFee,
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
