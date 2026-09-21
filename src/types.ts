export interface StudentMetric {
  id: string;
  label: string;
  value: string | number;
  subtext: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  accentColor: string;
}

export interface PerformanceTrendPoint {
  stage: string;
  overallAverage: number;
  scienceDept: number;
  artsDept: number;
  commercialDept: number;
  juniorAverage: number;
  passRate: number;
}

export interface SubjectMastery {
  subject: string;
  averageScore: number;
  distinctionRate: number; // percentage
  enrolledStudents: number;
  teacher: string;
  department: 'Sciences' | 'Arts' | 'Commercial' | 'General';
}

export interface ClassLevelRecord {
  id: string;
  level: string; // e.g., "Junior Secondary 1"
  shortName: string; // "JSS 1"
  structure: string;
  armsCount: number;
  armsList: string[];
  studentsCount: number;
  capacity: number;
  averageScore: number;
  status: 'ACTIVE' | 'PENDING' | 'ARCHIVED';
  headTeacher: string;
  category: 'Junior' | 'Senior';
  tracks?: string[];
}

export interface AcademicChecklistItem {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  dueDate?: string;
  assignee?: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Academic' | 'Examination' | 'Sports' | 'Administrative';
  date: string;
  urgent?: boolean;
  content: string;
  targetAudience: string;
}

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  role: 'Subject Tutor' | 'Class Master' | 'Form Master' | 'Form Mistress' | 'Head of Department' | 'Vice Principal' | 'Principal' | 'CEO' | 'Guidance Counselor' | 'Dean of Studies' | 'Examination Officer';
  department: 'Sciences' | 'Arts' | 'Commercial' | 'General' | 'Administration';
  subjectsTaught: string[];
  assignedClasses: string[];
  formMasterOf?: string; // Class arm they are Form Master or Mistress of, e.g., "SS 3 Science"
  formDesignation?: 'Form Master' | 'Form Mistress';
  qualification?: string;
  status: 'Active' | 'On Leave';
  dateJoined: string;
}

export interface SubjectScore {
  code: string;
  name: string;
  homework?: number; // max 10
  test1?: number;    // max 10
  test2?: number;    // max 10
  practical?: number;// max 10 (science/vocational practicals)
  quiz?: number;     // max 10 (optional/supplemental)
  caTotal: number;   // max 40 (homework + test1 + test2 + practical/quiz)
  exam: number;      // max 60 (terminal exam)
  total: number;     // max 100
  grade: string;     // A1, B2, B3, C4, C5, C6, D7, E8, F9
  remark: string;    // Distinction, Very Good, Credit, Pass, Remedial
  positionInSubject?: string; // e.g. "1st", "2nd", "3rd"
  updatedBy?: string;
  updatedAt?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  admissionNo: string;
  classArm: string; // e.g., "SS 3 Science", "JSS 1A"
  level: string;    // "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"
  stream?: 'Science' | 'Art' | 'Commercial' | 'General';
  gender: 'Male' | 'Female';
  session: string;
  term: string;
  termGpa: number;
  termRank: string;
  attendanceRate: number;
  feeStatus: 'Cleared' | 'Pending' | 'Partial';
  amountPaid?: number;
  totalFeeDue?: number;
  feePaymentDate?: string;
  feeReceiptNo?: string;
  feeRemarks?: string;
  resultHeld: boolean;
  holdReason?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  phone?: string; // Optional student mobile contact
  photoUrl?: string; // Official passport photograph URL/data URI
  residentialAddress?: string;
  stateOfOrigin?: string;
  lga?: string;
  formMasterRemark?: string; // Official Form Master conduct remark on report card
  principalRemark?: string;  // Principal/Administration endorsement
  formTeacherComment?: string;
  principalComment?: string;
  nextTermBegins?: string;
  timesSchoolOpened?: number;
  timesPresent?: number;
  timesPunctual?: number;
  // Comprehensive Admission & Registration Profiling Fields
  surname?: string;
  firstName?: string;
  middleName?: string;
  religion?: string;
  nationality?: string;
  bloodGroup?: string;
  genotype?: string;
  medicalConditions?: string;
  allergies?: string;
  guardianRelationship?: string;
  guardianAltPhone?: string;
  guardianOccupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  previousSchool?: string;
  lastClassPassed?: string;
  enrollmentType?: 'Regular Intake' | 'Transfer Student';
  admissionYear?: number;
  transferClassJoined?: string;
  boardingStatus?: 'Day Student' | 'Boarder';
  houseAllocation?: string;
  scholarshipStatus?: string;
  tellerNumber?: string;
  entranceExamScore?: number;
  affectiveDomain?: Record<string, number>;
  psychomotorDomain?: Record<string, number>;
  subjects: SubjectScore[];
}

export interface SchoolClassDefinition {
  id: string;
  name: string; // "JSS 1A", "SS 2 Science", etc.
  level: 'JSS 1' | 'JSS 2' | 'JSS 3' | 'SS 1' | 'SS 2' | 'SS 3';
  arm: string; // "A", "B", "Science", "Art", "Commercial"
  stream: 'General' | 'Science' | 'Art' | 'Commercial';
  classMaster: string;
  studentsCount: number;
  capacity: number;
  room: string;
  actualCount?: number;
  curriculumSubjects?: string[];
  subjectTeachers?: Record<string, string>; // subjectName -> teacherName
}

export interface FeeItem {
  id: string;
  name: string; // e.g., "School Fee / Base Tuition", "Project Fee", "Practical Laboratory Fee", "ICT / Portal Levy"
  amount: number; // in Naira (NGN)
  category?: 'Tuition' | 'Project' | 'Laboratory' | 'Development' | 'Extracurricular' | 'Examination' | 'General';
  applicableLevel?: 'All' | 'Junior' | 'Senior' | string;
  description?: string;
  isMandatory?: boolean;
}

export interface CollegeFeeSchedule {
  id: string;
  session: string; // "2026/2027"
  term: string;    // "First Term"
  baseSchoolFee: number; // Base tuition
  items: FeeItem[];
  totalFee: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  paymentInstructions: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AttendanceStudentEntry {
  studentId: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  time?: string;
  remarks?: string;
  newAttendanceRate?: number;
}

export interface AttendanceRegisterDoc {
  id: string;
  className: string;
  date: string; // YYYY-MM-DD
  sessionPeriod: string; // e.g., 'Morning Assembly (8:00 AM)'
  markedBy: string;
  records: AttendanceStudentEntry[];
  recordedAt: string;
}

export interface StudentDailyAttendanceLog {
  date: string;
  day: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  time: string;
  remarks: string;
  markedBy: string;
  sessionPeriod: string;
}

export interface WeeklyAttendanceGroup {
  week: number;
  weekLabel: string;
  startDate: string;
  endDate: string;
  daysPresent: number;
  daysTotal: number;
  rate: number;
  days: StudentDailyAttendanceLog[];
}

export interface StudentAttendanceFullData {
  openDays: number;
  presentDays: number;
  absentDays: number;
  punctualDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
  isCleared: boolean;
  assignedFormMaster: string;
  weeks: WeeklyAttendanceGroup[];
  recentLogs: StudentDailyAttendanceLog[];
  hasAttendance?: boolean;
  message?: string;
  totalRecords?: number;
  selectedTerm?: string;
  statusNote?: string;
}

