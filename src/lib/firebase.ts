import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  StudentProfile,
  StaffMember,
  SchoolClassDefinition,
  Announcement,
} from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Connect to the specific provisioned Firestore database instance
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot as mandated by Firebase specification
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline check:', error.message);
      return false;
    }
    // Connection handshake completed
    return true;
  }
}

// =========================================================================
// REAL DATA OPERATIONS (STUDENTS, STAFF, CLASSES, ANNOUNCEMENTS, ATTENDANCE)
// =========================================================================

export async function getLiveStudents(): Promise<StudentProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    const list: StudentProfile[] = [];
    snap.forEach((d) => {
      list.push(d.data() as StudentProfile);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'students');
  }
}

export async function saveLiveStudent(student: StudentProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), student, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${student.id}`);
  }
}

export async function deleteLiveStudent(studentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `students/${studentId}`);
  }
}

export async function getLiveStaff(): Promise<StaffMember[]> {
  try {
    const snap = await getDocs(collection(db, 'staff'));
    const list: StaffMember[] = [];
    snap.forEach((d) => {
      list.push(d.data() as StaffMember);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'staff');
  }
}

export async function saveLiveStaff(staff: StaffMember): Promise<void> {
  try {
    await setDoc(doc(db, 'staff', staff.id), staff, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `staff/${staff.id}`);
  }
}

export async function deleteLiveStaff(staffId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'staff', staffId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `staff/${staffId}`);
  }
}

export async function getLiveClasses(): Promise<SchoolClassDefinition[]> {
  try {
    const snap = await getDocs(collection(db, 'classes'));
    const list: SchoolClassDefinition[] = [];
    snap.forEach((d) => {
      list.push(d.data() as SchoolClassDefinition);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'classes');
  }
}

export async function saveLiveClass(cls: SchoolClassDefinition): Promise<void> {
  try {
    await setDoc(doc(db, 'classes', cls.id), cls, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `classes/${cls.id}`);
  }
}

export async function getLiveAnnouncements(): Promise<Announcement[]> {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    const list: Announcement[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Announcement);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'announcements');
  }
}

export async function saveLiveAnnouncement(announcement: Announcement): Promise<void> {
  try {
    await setDoc(doc(db, 'announcements', announcement.id), announcement, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `announcements/${announcement.id}`);
  }
}

export async function recordLiveAttendance(
  className: string,
  date: string,
  records: Array<{ studentId: string; status: string; remarks?: string }>
): Promise<void> {
  const recordId = `att_${className.replace(/\s+/g, '_')}_${date.replace(/[^a-zA-Z0-9]/g, '_')}`;
  try {
    await setDoc(doc(db, 'attendance', recordId), {
      className,
      date,
      records,
      recordedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `attendance/${recordId}`);
  }
}

// =========================================================================
// SEEDING THE ORIGINAL INSTITUTIONAL DATA ON FIRST INITIALIZATION
// =========================================================================
export async function seedOriginalCollegeDataIfEmpty(
  originalStudents: StudentProfile[],
  originalStaff: StaffMember[],
  originalClasses: SchoolClassDefinition[],
  originalAnnouncements: Announcement[]
): Promise<void> {
  try {
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (studentsSnap.empty) {
      console.log('Seeding original Dominion Stars Global College records to Firestore...');
      
      // Batch write initial students
      const batch1 = writeBatch(db);
      for (const std of originalStudents) {
        batch1.set(doc(db, 'students', std.id), std);
      }
      await batch1.commit();

      // Batch write staff roster
      const batch2 = writeBatch(db);
      for (const stf of originalStaff) {
        batch2.set(doc(db, 'staff', stf.id), stf);
      }
      await batch2.commit();

      // Batch write class arms
      const batch3 = writeBatch(db);
      for (const cls of originalClasses) {
        batch3.set(doc(db, 'classes', cls.id), cls);
      }
      await batch3.commit();

      // Batch write circulars
      const batch4 = writeBatch(db);
      for (const ann of originalAnnouncements) {
        batch4.set(doc(db, 'announcements', ann.id), ann);
      }
      await batch4.commit();

      console.log('Institutional database successfully initialized with live Firestore records.');
    }
  } catch (error) {
    console.error('Error during initial database seed:', error);
  }
}
