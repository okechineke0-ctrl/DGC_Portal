import {
  StudentMetric,
  PerformanceTrendPoint,
  SubjectMastery,
  ClassLevelRecord,
  AcademicChecklistItem,
  Announcement,
  StudentProfile,
  StaffMember,
  SchoolClassDefinition,
  SubjectScore,
  CollegeFeeSchedule,
} from '../types';

export const CURRENT_SESSION = '2026/2027';
export const CURRENT_TERM = 'First Term';
export const TODAY_DATE = 'Monday, 14 September 2026';
export const SCHOOL_NAME = 'Dominate Star College';
export const SCHOOL_LOCATION = 'Enugu State, Nigeria';
export const SCHOOL_MOTTO = 'Striving for the Crown of Excellence';

export const DEFAULT_FEE_SCHEDULE: CollegeFeeSchedule = {
  id: 'fee-schedule-2026-t1',
  session: CURRENT_SESSION,
  term: CURRENT_TERM,
  baseSchoolFee: 85000,
  items: [
    { id: 'fee-1', name: 'ICT & Computer Laboratory Practical', amount: 15000, category: 'Laboratory' },
    { id: 'fee-2', name: 'Science Lab & Technical Workshop Levy', amount: 15000, category: 'Project' },
    { id: 'fee-3', name: 'Sports, Medical & First Aid Insurance', amount: 8000, category: 'Extracurricular' },
    { id: 'fee-4', name: 'Development & Continuous Assessment Sheet', amount: 7000, category: 'Development' },
  ],
  totalFee: 130000,
  bankName: 'First Bank of Nigeria',
  accountNumber: '3128492019',
  accountName: 'Dominate Star College Ltd - School Fees',
  paymentInstructions: 'Please present your bank deposit slip or electronic transfer receipt at the College Bursary with student registration number.',
  updatedAt: '2026-09-01T08:00:00.000Z',
  updatedBy: 'College Bursary Directorate',
};

export const SCHOOL_CLASSES_LIST = [
  'JSS 1A',
  'JSS 1B',
  'JSS 2A',
  'JSS 2B',
  'JSS 3A',
  'JSS 3B',
  'SS 1A',
  'SS 1B',
  'SS 2 Science',
  'SS 2 Art',
  'SS 2 Commercial',
  'SS 3 Science',
  'SS 3 Art',
  'SS 3 Commercial',
] as const;

export const ALL_SCHOOL_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Economics',
  'Government',
  'Literature-in-English',
  'Financial Accounting',
  'Commerce',
  'Book Keeping',
  'Data Processing / ICT',
  'Civic Education',
  'Christian Religious Studies',
  'Igbo Language',
  'French',
  'Agricultural Science',
  'Basic Science & Technology',
  'National Values',
  'Business Studies',
];

export const JUNIOR_CURRICULUM = [
  'English Language',
  'Mathematics',
  'Basic Science & Technology',
  'National Values',
  'Business Studies',
  'Christian Religious Studies',
  'Igbo Language',
  'Agricultural Science',
  'Data Processing / ICT',
];

export const SENIOR_SCIENCE_CURRICULUM = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Civic Education',
  'Economics',
  'Data Processing / ICT',
  'Further Mathematics',
];

export const SENIOR_ART_CURRICULUM = [
  'English Language',
  'Mathematics',
  'Literature-in-English',
  'Government',
  'Christian Religious Studies',
  'Igbo Language',
  'Civic Education',
  'Economics',
  'Data Processing / ICT',
];

export const SENIOR_COMMERCIAL_CURRICULUM = [
  'English Language',
  'Mathematics',
  'Financial Accounting',
  'Commerce',
  'Economics',
  'Book Keeping',
  'Civic Education',
  'Data Processing / ICT',
  'Business Studies',
];

export const SCHOOL_CLASSES_DEFINITIONS: SchoolClassDefinition[] = [
  {
    id: 'jss1-a',
    name: 'JSS 1A',
    level: 'JSS 1',
    arm: 'A',
    stream: 'General',
    classMaster: 'Mr. B. Nnamani',
    studentsCount: 92,
    capacity: 95,
    room: 'Block A, Room 1',
    curriculumSubjects: JUNIOR_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Mr. J. Okafor',
      'English Language': 'Mrs. N. Eze',
      'Basic Science & Technology': 'Mr. B. Nnamani',
      'National Values': 'Mrs. V. Nnaji',
      'Agricultural Science': 'Mr. K. Agu',
    },
  },
  {
    id: 'jss1-b',
    name: 'JSS 1B',
    level: 'JSS 1',
    arm: 'B',
    stream: 'General',
    classMaster: 'Mrs. E. Nwosu',
    studentsCount: 90,
    capacity: 95,
    room: 'Block A, Room 2',
    curriculumSubjects: JUNIOR_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Mr. J. Okafor',
      'English Language': 'Mrs. N. Eze',
      'Basic Science & Technology': 'Mr. B. Nnamani',
    },
  },
  {
    id: 'jss2-a',
    name: 'JSS 2A',
    level: 'JSS 2',
    arm: 'A',
    stream: 'General',
    classMaster: 'Mrs. R. Onyia',
    studentsCount: 88,
    capacity: 90,
    room: 'Block A, Room 3',
    curriculumSubjects: JUNIOR_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Mr. J. Okafor',
      'English Language': 'Mrs. N. Eze',
      'Igbo Language': 'Mrs. R. Onyia',
    },
  },
  {
    id: 'jss2-b',
    name: 'JSS 2B',
    level: 'JSS 2',
    arm: 'B',
    stream: 'General',
    classMaster: 'Mr. C. Onah',
    studentsCount: 86,
    capacity: 90,
    room: 'Block A, Room 4',
    curriculumSubjects: JUNIOR_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Mr. J. Okafor',
      'English Language': 'Mrs. N. Eze',
    },
  },
  {
    id: 'jss3-a',
    name: 'JSS 3A',
    level: 'JSS 3',
    arm: 'A',
    stream: 'General',
    classMaster: 'Mr. J. Okafor',
    studentsCount: 84,
    capacity: 85,
    room: 'Block B, Room 1',
    curriculumSubjects: JUNIOR_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Mr. J. Okafor',
      'English Language': 'Mrs. N. Eze',
      'Civic Education': 'Mrs. V. Nnaji',
    },
  },
  {
    id: 'jss3-b',
    name: 'JSS 3B',
    level: 'JSS 3',
    arm: 'B',
    stream: 'General',
    classMaster: 'Lady T. Anozie',
    studentsCount: 82,
    capacity: 85,
    room: 'Block B, Room 2',
    curriculumSubjects: JUNIOR_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Mr. J. Okafor',
      'English Language': 'Mrs. N. Eze',
    },
  },
  {
    id: 'ss1-a',
    name: 'SS 1A',
    level: 'SS 1',
    arm: 'A',
    stream: 'General',
    classMaster: 'Mr. K. Agu',
    studentsCount: 94,
    capacity: 100,
    room: 'Block C, Hall 1',
    curriculumSubjects: SENIOR_SCIENCE_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Dr. C. Umeh',
      'English Language': 'Mrs. N. Eze',
      'Agricultural Science': 'Mr. K. Agu',
    },
  },
  {
    id: 'ss1-b',
    name: 'SS 1B',
    level: 'SS 1',
    arm: 'B',
    stream: 'General',
    classMaster: 'Mrs. V. Nnaji',
    studentsCount: 92,
    capacity: 100,
    room: 'Block C, Hall 2',
    curriculumSubjects: SENIOR_ART_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Dr. C. Umeh',
      'English Language': 'Mrs. N. Eze',
      'Civic Education': 'Mrs. V. Nnaji',
      'Literature-in-English': 'Lady F. Ibe',
    },
  },
  {
    id: 'ss2-sci',
    name: 'SS 2 Science',
    level: 'SS 2',
    arm: 'Science',
    stream: 'Science',
    classMaster: 'Dr. C. Umeh',
    studentsCount: 85,
    capacity: 90,
    room: 'Science Lab Annex',
    curriculumSubjects: SENIOR_SCIENCE_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Dr. C. Umeh',
      'English Language': 'Mrs. N. Eze',
      'Physics': 'Engr. K. Okoli',
      'Chemistry': 'Mr. P. Nwachukwu',
      'Biology': 'Mrs. G. Okonkwo',
      'Data Processing / ICT': 'Engr. T. Igwe',
    },
  },
  {
    id: 'ss2-art',
    name: 'SS 2 Art',
    level: 'SS 2',
    arm: 'Art',
    stream: 'Art',
    classMaster: 'Lady F. Ibe',
    studentsCount: 72,
    capacity: 75,
    room: 'Arts Humanities Studio',
    curriculumSubjects: SENIOR_ART_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Dr. C. Umeh',
      'English Language': 'Mrs. N. Eze',
      'Literature-in-English': 'Lady F. Ibe',
      'Government': 'Barr. O. Nwankwo',
    },
  },
  {
    id: 'ss2-comm',
    name: 'SS 2 Commercial',
    level: 'SS 2',
    arm: 'Commercial',
    stream: 'Commercial',
    classMaster: 'Mr. S. Chukwuma',
    studentsCount: 68,
    capacity: 75,
    room: 'Commercial Hall 1',
    curriculumSubjects: SENIOR_COMMERCIAL_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Dr. C. Umeh',
      'English Language': 'Mrs. N. Eze',
      'Financial Accounting': 'Mr. S. Chukwuma',
      'Economics': 'Mr. E. Ani',
    },
  },
  {
    id: 'ss3-sci',
    name: 'SS 3 Science',
    level: 'SS 3',
    arm: 'Science',
    stream: 'Science',
    classMaster: 'Engr. K. Okoli',
    studentsCount: 86,
    capacity: 90,
    room: 'Senior WAEC Lab 1',
    curriculumSubjects: SENIOR_SCIENCE_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Dr. C. Umeh',
      'English Language': 'Mrs. N. Eze',
      'Physics': 'Engr. K. Okoli',
      'Chemistry': 'Mr. P. Nwachukwu',
      'Biology': 'Mrs. G. Okonkwo',
      'Economics': 'Mr. E. Ani',
      'Data Processing / ICT': 'Engr. T. Igwe',
    },
  },
  {
    id: 'ss3-art',
    name: 'SS 3 Art',
    level: 'SS 3',
    arm: 'Art',
    stream: 'Art',
    classMaster: 'Barr. O. Nwankwo',
    studentsCount: 74,
    capacity: 80,
    room: 'Senior WAEC Hall 2',
    curriculumSubjects: SENIOR_ART_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Dr. C. Umeh',
      'English Language': 'Mrs. N. Eze',
      'Government': 'Barr. O. Nwankwo',
      'Literature-in-English': 'Lady F. Ibe',
      'Christian Religious Studies': 'Lady F. Ibe',
      'Economics': 'Mr. E. Ani',
    },
  },
  {
    id: 'ss3-comm',
    name: 'SS 3 Commercial',
    level: 'SS 3',
    arm: 'Commercial',
    stream: 'Commercial',
    classMaster: 'Mr. E. Ani',
    studentsCount: 70,
    capacity: 75,
    room: 'Senior WAEC Hall 3',
    curriculumSubjects: SENIOR_COMMERCIAL_CURRICULUM,
    subjectTeachers: {
      'Mathematics': 'Dr. C. Umeh',
      'English Language': 'Mrs. N. Eze',
      'Financial Accounting': 'Mr. S. Chukwuma',
      'Economics': 'Mr. E. Ani',
      'Commerce': 'Mr. S. Chukwuma',
    },
  },
];

export const METRIC_CARDS: StudentMetric[] = [
  {
    id: 'enrolled_students',
    label: 'ENROLLED STUDENTS',
    value: '1,163',
    subtext: 'Active enrollment across 14 class arms (JSS1 - SS3)',
    change: '+4.8% vs last session',
    changeType: 'positive',
    icon: 'Users',
    accentColor: '#1e3a8a',
  },
  {
    id: 'active_classes',
    label: 'ACTIVE CLASS ARMS',
    value: '14',
    subtext: 'JSS1-SS1 (A/B), SS2-SS3 (Sci/Art/Comm)',
    change: 'Strict 6-Year Structure',
    changeType: 'neutral',
    icon: 'Boxes',
    accentColor: '#0284c7',
  },
  {
    id: 'term_gpa_average',
    label: 'AVERAGE TERM SCORE',
    value: '78.4%',
    subtext: '342 students in Distinction (A1/B2) band',
    change: '+3.1% academic gain',
    changeType: 'positive',
    icon: 'TrendingUp',
    accentColor: '#16a34a',
  },
  {
    id: 'attendance_rate',
    label: 'ATTENDANCE RECORDED',
    value: '96.8%',
    subtext: '1,126 students checked in today via Biometrics',
    change: '98.1% on-time arrival',
    changeType: 'positive',
    icon: 'CheckCircle2',
    accentColor: '#059669',
  },
];

export const PERFORMANCE_TREND: PerformanceTrendPoint[] = [
  { stage: 'Wk 1 Diagnostic', overallAverage: 68.5, scienceDept: 71.0, artsDept: 66.2, commercialDept: 68.0, juniorAverage: 67.8, passRate: 84.0 },
  { stage: 'Wk 3 Quiz 1', overallAverage: 71.2, scienceDept: 74.5, artsDept: 68.4, commercialDept: 70.8, juniorAverage: 70.5, passRate: 87.5 },
  { stage: 'Wk 5 First CA (20%)', overallAverage: 74.8, scienceDept: 78.2, artsDept: 72.0, commercialDept: 73.5, juniorAverage: 74.0, passRate: 91.2 },
  { stage: 'Wk 7 Mid-Term Exam', overallAverage: 76.4, scienceDept: 80.6, artsDept: 73.8, commercialDept: 75.1, juniorAverage: 75.2, passRate: 92.8 },
  { stage: 'Wk 9 Second CA (20%)', overallAverage: 78.4, scienceDept: 82.5, artsDept: 75.9, commercialDept: 77.0, juniorAverage: 77.6, passRate: 94.6 },
  { stage: 'Mock / Terminal (Proj)', overallAverage: 81.0, scienceDept: 85.0, artsDept: 78.5, commercialDept: 79.8, juniorAverage: 80.2, passRate: 96.5 },
];

export const SUBJECT_MASTERY_DATA: SubjectMastery[] = [
  { subject: 'Mathematics', averageScore: 76.5, distinctionRate: 42, enrolledStudents: 1163, teacher: 'Dr. C. Umeh', department: 'General' },
  { subject: 'English Language', averageScore: 81.2, distinctionRate: 58, enrolledStudents: 1163, teacher: 'Mrs. N. Eze', department: 'General' },
  { subject: 'Physics', averageScore: 78.9, distinctionRate: 46, enrolledStudents: 380, teacher: 'Engr. K. Okoli', department: 'Sciences' },
  { subject: 'Chemistry', averageScore: 75.4, distinctionRate: 39, enrolledStudents: 380, teacher: 'Mr. P. Nwachukwu', department: 'Sciences' },
  { subject: 'Biology', averageScore: 82.3, distinctionRate: 61, enrolledStudents: 560, teacher: 'Mrs. G. Okonkwo', department: 'Sciences' },
  { subject: 'Economics', averageScore: 77.8, distinctionRate: 45, enrolledStudents: 740, teacher: 'Mr. E. Ani', department: 'Commercial' },
  { subject: 'Government', averageScore: 79.5, distinctionRate: 52, enrolledStudents: 320, teacher: 'Barr. O. Nwankwo', department: 'Arts' },
  { subject: 'Literature-in-English', averageScore: 80.1, distinctionRate: 54, enrolledStudents: 320, teacher: 'Lady F. Ibe', department: 'Arts' },
  { subject: 'Financial Accounting', averageScore: 76.2, distinctionRate: 41, enrolledStudents: 210, teacher: 'Mr. S. Chukwuma', department: 'Commercial' },
  { subject: 'Data Processing / ICT', averageScore: 88.4, distinctionRate: 74, enrolledStudents: 1163, teacher: 'Engr. T. Igwe', department: 'General' },
  { subject: 'Civic Education', averageScore: 84.6, distinctionRate: 68, enrolledStudents: 1163, teacher: 'Mrs. V. Nnaji', department: 'General' },
];

export const CLASS_LEVELS: ClassLevelRecord[] = [
  {
    id: 'jss1',
    level: 'Junior Secondary 1',
    shortName: 'JSS 1',
    structure: '2 Arms: JSS 1A, JSS 1B',
    armsCount: 2,
    armsList: ['JSS 1A', 'JSS 1B'],
    studentsCount: 182,
    capacity: 190,
    averageScore: 75.8,
    status: 'ACTIVE',
    headTeacher: 'Mr. B. Nnamani',
    category: 'Junior',
    tracks: ['Basic Science & Tech', 'National Values', 'Pre-Vocational'],
  },
  {
    id: 'jss2',
    level: 'Junior Secondary 2',
    shortName: 'JSS 2',
    structure: '2 Arms: JSS 2A, JSS 2B',
    armsCount: 2,
    armsList: ['JSS 2A', 'JSS 2B'],
    studentsCount: 174,
    capacity: 180,
    averageScore: 76.4,
    status: 'ACTIVE',
    headTeacher: 'Mrs. R. Onyia',
    category: 'Junior',
    tracks: ['Basic Science & Tech', 'Business Studies', 'French & Igbo'],
  },
  {
    id: 'jss3',
    level: 'Junior Secondary 3',
    shortName: 'JSS 3',
    structure: '2 Arms: JSS 3A, JSS 3B (BECE Candidates)',
    armsCount: 2,
    armsList: ['JSS 3A', 'JSS 3B'],
    studentsCount: 166,
    capacity: 170,
    averageScore: 78.9,
    status: 'ACTIVE',
    headTeacher: 'Mr. J. Okafor',
    category: 'Junior',
    tracks: ['BECE Mock Prep', 'Basic Science', 'Pre-Senior Stream Guidance'],
  },
  {
    id: 'ss1',
    level: 'Senior Secondary 1',
    shortName: 'SS 1',
    structure: '2 Arms: SS 1A, SS 1B',
    armsCount: 2,
    armsList: ['SS 1A', 'SS 1B'],
    studentsCount: 186,
    capacity: 200,
    averageScore: 77.2,
    status: 'ACTIVE',
    headTeacher: 'Mr. K. Agu',
    category: 'Senior',
    tracks: ['Foundational Senior Stream', 'STEM & Humanities Core'],
  },
  {
    id: 'ss2',
    level: 'Senior Secondary 2',
    shortName: 'SS 2',
    structure: '3 Arms: SS 2 Science, SS 2 Art, SS 2 Commercial',
    armsCount: 3,
    armsList: ['SS 2 Science', 'SS 2 Art', 'SS 2 Commercial'],
    studentsCount: 225,
    capacity: 240,
    averageScore: 79.1,
    status: 'ACTIVE',
    headTeacher: 'Dr. C. Umeh',
    category: 'Senior',
    tracks: ['Pure Science', 'Humanities & Law', 'Accounting & Commerce'],
  },
  {
    id: 'ss3',
    level: 'Senior Secondary 3',
    shortName: 'SS 3',
    structure: '3 Arms: SS 3 Science, SS 3 Art, SS 3 Commercial (WAEC/NECO)',
    armsCount: 3,
    armsList: ['SS 3 Science', 'SS 3 Art', 'SS 3 Commercial'],
    studentsCount: 230,
    capacity: 245,
    averageScore: 82.5,
    status: 'ACTIVE',
    headTeacher: 'Mrs. H. Madu',
    category: 'Senior',
    tracks: ['WASSCE Intensive', 'NECO Senior Syllabus', 'JAMB CBT Practicals'],
  },
];

export const ACADEMIC_CHECKLIST: AcademicChecklistItem[] = [
  { id: '1', title: '6-Year School structure & 14 arm quota configured', status: 'completed' },
  { id: '2', title: '2026/2027 Academic calendar session created', status: 'completed' },
  { id: '3', title: 'Grading boundaries (A1-F9 WAEC standard) calibrated', status: 'completed' },
  { id: '4', title: 'Biometric daily attendance synchronization active', status: 'completed' },
  { id: '5', title: 'Continuous Assessment (Quiz, HW, Test 1, Test 2) module ready', status: 'completed' },
  { id: '6', title: 'Executive Result Hold & Bursary clearance protocol initialized', status: 'completed' },
  { id: '7', title: 'Terminal Exam question moderation committee review', status: 'in_progress', dueDate: 'Oct 08' },
  { id: '8', title: 'Automated Broad Sheet & e-Report Card generation', status: 'pending', dueDate: 'Oct 22' },
];

export const GRADE_DISTRIBUTION = [
  { name: 'A1 (Distinction 75-100%)', value: 342, fill: '#1e3a8a', label: 'A1 Distinction' },
  { name: 'B2 - B3 (Very Good 65-74%)', value: 486, fill: '#0284c7', label: 'B2-B3 Very Good' },
  { name: 'C4 - C6 (Credit Pass 50-64%)', value: 312, fill: '#059669', label: 'C4-C6 Credit Pass' },
  { name: 'D7 - E8 (Pass 40-49%)', value: 86, fill: '#d97706', label: 'D7-E8 Pass' },
  { name: 'F9 (Remedial <40%)', value: 22, fill: '#dc2626', label: 'F9 Remedial' },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '2026/2027 First Term Continuous Assessment Entry Protocol',
    category: 'Examination',
    date: '14 Sept 2026',
    urgent: true,
    content: 'All teachers and staff members are reminded that Quiz, Homework, and Tests (1 & 2) entries are now live on the Staff portal. Ensure scores are entered and synchronized.',
    targetAudience: 'All Teaching & Administrative Staff',
  },
  {
    id: 'ann-2',
    title: 'SS3 WASSCE & NECO Practical Science Laboratory Orientation',
    category: 'Academic',
    date: '12 Sept 2026',
    urgent: false,
    content: 'Hands-on practical physics and chemistry sessions for SS3 Science will begin at the collegiate senior sciences complex starting 8:30 AM this Wednesday.',
    targetAudience: 'SS3 Science Candidates',
  },
  {
    id: 'ann-3',
    title: 'CEO Notice on Student Clearance & Result Release Controls',
    category: 'Administrative',
    date: '10 Sept 2026',
    urgent: false,
    content: 'The Office of the CEO has activated the student result release hold system. Any student with outstanding bursary obligations will have their terminal e-result held until cleared.',
    targetAudience: 'Parents & Class Masters',
  },
];

/* Helper to compute WAEC/NECO Grade & Remark */
export function calculateGrade(total: number, isAssessed = true): { grade: string; remark: string } {
  if (!isAssessed || total <= 0) {
    return { grade: '-', remark: 'Pending Assessment' };
  }
  if (total >= 75) return { grade: 'A1', remark: 'Distinction' };
  if (total >= 70) return { grade: 'B2', remark: 'Very Good' };
  if (total >= 65) return { grade: 'B3', remark: 'Good' };
  if (total >= 60) return { grade: 'C4', remark: 'Credit' };
  if (total >= 55) return { grade: 'C5', remark: 'Credit' };
  if (total >= 50) return { grade: 'C6', remark: 'Credit Pass' };
  if (total >= 45) return { grade: 'D7', remark: 'Pass' };
  if (total >= 40) return { grade: 'E8', remark: 'Weak Pass' };
  return { grade: 'F9', remark: 'Remedial' };
}

/* Continuous Assessment Algorithm: Homework (10) + Test 1 (10) + Test 2 (10) + Practical/Quiz (10) = CA 40% */
export function computeCaTotal(homework = 0, test1 = 0, test2 = 0, practical = 0, quiz = 0): number {
  const hw = Math.min(10, Math.max(0, Number(homework) || 0));
  const t1 = Math.min(10, Math.max(0, Number(test1) || 0));
  const t2 = Math.min(10, Math.max(0, Number(test2) || 0));
  const prac = Number(practical) || 0;
  const qz = Number(quiz) || 0;
  // Use practical if provided (or quiz if practical is 0)
  const fourthComponent = Math.min(10, Math.max(0, prac > 0 ? prac : qz));
  return Math.min(40, hw + t1 + t2 + fourthComponent);
}

export function createPendingSubjectScore(code: string, name: string): SubjectScore {
  return {
    code,
    name,
    homework: 0,
    test1: 0,
    test2: 0,
    practical: 0,
    quiz: 0,
    caTotal: 0,
    exam: 0,
    total: 0,
    grade: '-',
    remark: 'Pending Assessment',
  };
}

export function createSubjectScore(
  code: string,
  name: string,
  homework = 0,
  test1 = 0,
  test2 = 0,
  practical = 0,
  exam = 0
): SubjectScore {
  const hasMarks = homework > 0 || test1 > 0 || test2 > 0 || practical > 0 || exam > 0;
  const caTotal = computeCaTotal(homework, test1, test2, practical);
  const total = Math.min(100, caTotal + exam);
  const { grade, remark } = hasMarks ? calculateGrade(total) : { grade: '-', remark: 'Pending Assessment' };
  return {
    code,
    name,
    homework,
    test1,
    test2,
    practical,
    quiz: practical, // mirror for compatibility
    caTotal,
    exam,
    total,
    grade,
    remark,
  };
}

/**
 * Institutional Subject Code Resolution Algorithm
 * Maps official Nigerian secondary school subject curricula to standardized course codes.
 */
export function getSubjectCode(subjectName: string, level?: string): string {
  const norm = subjectName.trim().toLowerCase();
  let prefix = 'GEN';
  if (norm.includes('math') || norm.includes('arithmetic')) prefix = 'MTH';
  else if (norm.includes('english') || norm.includes('eng')) prefix = 'ENG';
  else if (norm.includes('physics')) prefix = 'PHY';
  else if (norm.includes('chem')) prefix = 'CHM';
  else if (norm.includes('bio')) prefix = 'BIO';
  else if (norm.includes('econ')) prefix = 'ECO';
  else if (norm.includes('gov')) prefix = 'GOV';
  else if (norm.includes('civic')) prefix = 'CIV';
  else if (norm.includes('lit')) prefix = 'LIT';
  else if (norm.includes('account')) prefix = 'ACC';
  else if (norm.includes('comm')) prefix = 'COM';
  else if (norm.includes('basic sci') || norm.includes('technology') || norm.includes('bst')) prefix = 'BST';
  else if (norm.includes('ict') || norm.includes('data proc') || norm.includes('comput')) prefix = 'ICT';
  else if (norm.includes('relig') || norm.includes('crs') || norm.includes('c.r.s')) prefix = 'CRS';
  else if (norm.includes('agri')) prefix = 'AGR';
  else if (norm.includes('igbo')) prefix = 'IGB';
  else if (norm.includes('french')) prefix = 'FRE';
  else if (norm.includes('value') || norm.includes('nve')) prefix = 'NVE';
  else if (norm.includes('business')) prefix = 'BUS';
  else if (norm.includes('further')) prefix = 'FTH';
  else if (norm.includes('book')) prefix = 'BKP';
  else {
    const letters = subjectName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
    prefix = letters.length >= 2 ? letters : 'SUB';
  }

  let codeNum = '101';
  if (level) {
    if (level.includes('JSS 1')) codeNum = '001';
    else if (level.includes('JSS 2')) codeNum = '002';
    else if (level.includes('JSS 3')) codeNum = '003';
    else if (level.includes('SS 1')) codeNum = '101';
    else if (level.includes('SS 2')) codeNum = '201';
    else if (level.includes('SS 3')) codeNum = '301';
  }
  return `${prefix} ${codeNum}`;
}

/**
 * Institutional Subject Category Classifier
 */
export function getSubjectCategory(subjectName: string): 'Sciences' | 'Arts & Humanities' | 'Commercial' | 'General Curriculum' | 'Vocational & Technology' {
  const norm = subjectName.trim().toLowerCase();
  if (norm.includes('math') || norm.includes('physics') || norm.includes('chem') || norm.includes('bio') || norm.includes('further')) {
    return 'Sciences';
  }
  if (norm.includes('english') || norm.includes('lit') || norm.includes('gov') || norm.includes('relig') || norm.includes('crs') || norm.includes('igbo') || norm.includes('french')) {
    return 'Arts & Humanities';
  }
  if (norm.includes('econ') || norm.includes('account') || norm.includes('comm') || norm.includes('book') || norm.includes('business')) {
    return 'Commercial';
  }
  if (norm.includes('data') || norm.includes('ict') || norm.includes('basic sci') || norm.includes('technology') || norm.includes('agri')) {
    return 'Vocational & Technology';
  }
  return 'General Curriculum';
}

/* Class Broadsheet & Ranking Algorithm: Computes exact ordinal positions (1st, 2nd, 3rd) within class arm */
export function recalculateClassRankings(studentList: StudentProfile[]): StudentProfile[] {
  // Group by classArm
  const classArmGroups = new Map<string, StudentProfile[]>();
  studentList.forEach((s) => {
    const list = classArmGroups.get(s.classArm) || [];
    list.push(s);
    classArmGroups.set(s.classArm, list);
  });

  const updatedStudents: StudentProfile[] = [];

  classArmGroups.forEach((groupStudents, arm) => {
    // 1. Calculate each student's average and total across assessed subjects
    const computedGroup = groupStudents.map((std) => {
      const subjectList = std.subjects || [];
      const assessedSubjects = subjectList.filter((item) =>
        (item.total !== undefined && item.total > 0) ||
        (item.caTotal !== undefined && item.caTotal > 0) ||
        (item.exam !== undefined && item.exam > 0) ||
        (item.grade && item.grade !== '-' && item.grade !== 'Ungraded' && item.grade !== 'Pending')
      );
      const hasAssessments = assessedSubjects.length > 0;
      const totalMarks = assessedSubjects.reduce((sum, item) => sum + (item.total || 0), 0);
      const avg = hasAssessments ? Number((totalMarks / assessedSubjects.length).toFixed(1)) : 0;
      return {
        ...std,
        termGpa: avg,
        _totalMarks: totalMarks,
        _hasAssessments: hasAssessments,
      };
    });

    // 2. Sort descending by average & total marks (unassessed at the end)
    computedGroup.sort((a, b) => {
      if (a._hasAssessments !== b._hasAssessments) {
        return a._hasAssessments ? -1 : 1;
      }
      if (b.termGpa !== a.termGpa) return b.termGpa - a.termGpa;
      return b._totalMarks - a._totalMarks;
    });

    const totalInArm = computedGroup.length;
    const totalAssessed = computedGroup.filter((s) => s._hasAssessments).length;

    // 3. Assign ordinal rank (1st, 2nd, 3rd...) for assessed students
    let currentRank = 1;
    computedGroup.forEach((std) => {
      let termRank = 'Pending Assessment';
      if (std._hasAssessments) {
        const rankNum = currentRank;
        currentRank++;
        const suffix =
          rankNum === 1
            ? 'st'
            : rankNum === 2
            ? 'nd'
            : rankNum === 3
            ? 'rd'
            : 'th';
        termRank = `${rankNum}${suffix} out of ${totalAssessed || totalInArm}`;
      }

      const { _totalMarks, _hasAssessments, ...rest } = std;
      updatedStudents.push({
        ...rest,
        termRank,
      });
    });
  });

  return updatedStudents;
}

/* Academic Promotion Algorithm */
export function evaluatePromotionStatus(student: StudentProfile): {
  promoted: boolean;
  statusText: string;
  reason: string;
} {
  const subjects = student.subjects || [];
  if (subjects.length === 0) {
    return { promoted: false, statusText: 'Pending', reason: 'No recorded scores' };
  }

  const eng = subjects.find((s) => s.name.toLowerCase().includes('english'));
  const mth = subjects.find((s) => s.name.toLowerCase().includes('mathematics'));

  const engPassed = eng ? eng.total >= 50 : true;
  const mthPassed = mth ? mth.total >= 50 : true;
  const creditsCount = subjects.filter((s) => s.total >= 50).length;
  const overallAverage = student.termGpa;

  if (overallAverage >= 50 && engPassed && mthPassed && creditsCount >= 5) {
    return {
      promoted: true,
      statusText: 'Promoted with Distinction',
      reason: `Passed ${creditsCount} subjects with Credit pass in English and Mathematics. Average: ${overallAverage}%`,
    };
  } else if (overallAverage >= 45 && (engPassed || mthPassed)) {
    return {
      promoted: true,
      statusText: 'Promoted on Trial',
      reason: `Marginal pass in core subjects with ${overallAverage}% average. Needs remedial support.`,
    };
  } else {
    return {
      promoted: false,
      statusText: 'Repeat Class Recommended',
      reason: `Did not meet collegiate threshold for promotion (Average ${overallAverage}%, deficient in core requirements).`,
    };
  }
}

/* INITIAL STAFF ROSTER UPLOADED BY ADMIN */
export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Dr. C. Umeh',
    title: 'Dr.',
    email: 'c.umeh@dgc.edu.ng',
    phone: '+234 803 123 4501',
    role: 'Head of Department',
    department: 'Sciences',
    subjectsTaught: ['Mathematics', 'Further Mathematics'],
    assignedClasses: ['SS 2 Science', 'SS 3 Science'],
    status: 'Active',
    dateJoined: '2021-08-15',
  },
  {
    id: 'staff-2',
    name: 'Mrs. N. Eze',
    title: 'Mrs.',
    email: 'n.eze@dgc.edu.ng',
    phone: '+234 803 234 5602',
    role: 'Class Master',
    department: 'General',
    subjectsTaught: ['English Language'],
    assignedClasses: ['SS 3 Science', 'SS 3 Art', 'SS 3 Commercial'],
    status: 'Active',
    dateJoined: '2020-09-01',
  },
  {
    id: 'staff-3',
    name: 'Engr. K. Okoli',
    title: 'Engr.',
    email: 'k.okoli@dgc.edu.ng',
    phone: '+234 803 345 6703',
    role: 'Class Master',
    department: 'Sciences',
    subjectsTaught: ['Physics'],
    assignedClasses: ['SS 2 Science', 'SS 3 Science'],
    status: 'Active',
    dateJoined: '2022-01-10',
  },
  {
    id: 'staff-4',
    name: 'Mr. P. Nwachukwu',
    title: 'Mr.',
    email: 'p.nwachukwu@dgc.edu.ng',
    phone: '+234 803 456 7804',
    role: 'Subject Tutor',
    department: 'Sciences',
    subjectsTaught: ['Chemistry', 'Basic Science'],
    assignedClasses: ['SS 2 Science', 'SS 3 Science', 'JSS 3A'],
    status: 'Active',
    dateJoined: '2021-11-03',
  },
  {
    id: 'staff-5',
    name: 'Mrs. G. Okonkwo',
    title: 'Mrs.',
    email: 'g.okonkwo@dgc.edu.ng',
    phone: '+234 803 567 8905',
    role: 'Subject Tutor',
    department: 'Sciences',
    subjectsTaught: ['Biology', 'Agricultural Science'],
    assignedClasses: ['SS 2 Science', 'SS 3 Science', 'SS 1A'],
    status: 'Active',
    dateJoined: '2021-03-20',
  },
  {
    id: 'staff-6',
    name: 'Mr. E. Ani',
    title: 'Mr.',
    email: 'e.ani@dgc.edu.ng',
    phone: '+234 803 678 9006',
    role: 'Class Master',
    department: 'Commercial',
    subjectsTaught: ['Economics', 'Commerce'],
    assignedClasses: ['SS 2 Commercial', 'SS 3 Commercial', 'SS 2 Art'],
    status: 'Active',
    dateJoined: '2020-10-12',
  },
  {
    id: 'staff-7',
    name: 'Barr. O. Nwankwo',
    title: 'Barr.',
    email: 'o.nwankwo@dgc.edu.ng',
    phone: '+234 803 789 0107',
    role: 'Class Master',
    department: 'Arts',
    subjectsTaught: ['Government', 'Civic Education'],
    assignedClasses: ['SS 2 Art', 'SS 3 Art'],
    status: 'Active',
    dateJoined: '2019-09-14',
  },
  {
    id: 'staff-8',
    name: 'Lady F. Ibe',
    title: 'Lady',
    email: 'f.ibe@dgc.edu.ng',
    phone: '+234 803 890 1208',
    role: 'Class Master',
    department: 'Arts',
    subjectsTaught: ['Literature-in-English', 'Christian Religious Studies'],
    assignedClasses: ['SS 2 Art', 'SS 3 Art', 'SS 1B'],
    status: 'Active',
    dateJoined: '2021-06-01',
  },
  {
    id: 'staff-9',
    name: 'Mr. S. Chukwuma',
    title: 'Mr.',
    email: 's.chukwuma@dgc.edu.ng',
    phone: '+234 803 901 2309',
    role: 'Class Master',
    department: 'Commercial',
    subjectsTaught: ['Financial Accounting', 'Book Keeping', 'Business Studies'],
    assignedClasses: ['SS 2 Commercial', 'SS 3 Commercial'],
    status: 'Active',
    dateJoined: '2022-04-18',
  },
  {
    id: 'staff-10',
    name: 'Engr. T. Igwe',
    title: 'Engr.',
    email: 't.igwe@dgc.edu.ng',
    phone: '+234 803 012 3410',
    role: 'Subject Tutor',
    department: 'General',
    subjectsTaught: ['Data Processing / ICT', 'Computer Studies'],
    assignedClasses: ['SS 2 Science', 'SS 2 Art', 'SS 2 Commercial', 'SS 3 Science'],
    status: 'Active',
    dateJoined: '2023-01-15',
  },
  {
    id: 'staff-11',
    name: 'Mrs. V. Nnaji',
    title: 'Mrs.',
    email: 'v.nnaji@dgc.edu.ng',
    phone: '+234 803 123 9911',
    role: 'Class Master',
    department: 'General',
    subjectsTaught: ['Civic Education', 'Social Studies'],
    assignedClasses: ['SS 1B', 'JSS 3B'],
    status: 'Active',
    dateJoined: '2022-09-01',
  },
  {
    id: 'staff-12',
    name: 'Mr. B. Nnamani',
    title: 'Mr.',
    email: 'b.nnamani@dgc.edu.ng',
    phone: '+234 803 234 8812',
    role: 'Class Master',
    department: 'General',
    subjectsTaught: ['Basic Science', 'Basic Technology'],
    assignedClasses: ['JSS 1A', 'JSS 1B'],
    status: 'Active',
    dateJoined: '2020-02-14',
  },
  {
    id: 'staff-13',
    name: 'Mrs. R. Onyia',
    title: 'Mrs.',
    email: 'r.onyia@dgc.edu.ng',
    phone: '+234 803 345 7713',
    role: 'Class Master',
    department: 'Arts',
    subjectsTaught: ['Igbo Language', 'French'],
    assignedClasses: ['JSS 2A', 'JSS 2B'],
    status: 'Active',
    dateJoined: '2019-11-20',
  },
  {
    id: 'staff-14',
    name: 'Mr. J. Okafor',
    title: 'Mr.',
    email: 'j.okafor@dgc.edu.ng',
    phone: '+234 803 456 6614',
    role: 'Class Master',
    department: 'General',
    subjectsTaught: ['Mathematics'],
    assignedClasses: ['JSS 3A', 'JSS 3B'],
    status: 'Active',
    dateJoined: '2021-07-05',
  },
  {
    id: 'staff-15',
    name: 'Mr. K. Agu',
    title: 'Mr.',
    email: 'k.agu@dgc.edu.ng',
    phone: '+234 803 567 5515',
    role: 'Class Master',
    department: 'General',
    subjectsTaught: ['Agricultural Science'],
    assignedClasses: ['SS 1A'],
    status: 'Active',
    dateJoined: '2020-03-11',
  },
  {
    id: 'staff-16',
    name: 'Mrs. H. Madu',
    title: 'Mrs.',
    email: 'h.madu@dgc.edu.ng',
    phone: '+234 803 678 4416',
    role: 'Vice Principal',
    department: 'Administration',
    subjectsTaught: ['General Guidance'],
    assignedClasses: ['SS 3 Science', 'SS 3 Art', 'SS 3 Commercial'],
    status: 'Active',
    dateJoined: '2018-09-01',
  },
];

/* INITIAL SEED STUDENTS DISTRIBUTED ACROSS THE 14 CLASS ARMS */
export const INITIAL_STUDENTS: StudentProfile[] = [
  // SS 3 Science
  {
    id: 'std-001',
    name: 'Chidera Emmanuel Okonkwo',
    admissionNo: 'DGC/2024/0419',
    classArm: 'SS 3 Science',
    level: 'SS 3',
    stream: 'Science',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 87.4,
    termRank: '1st in SS 3 Science',
    attendanceRate: 0,
    timesSchoolOpened: 0,
    timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2008-05-14',
    guardianName: 'Chief Emmanuel Okonkwo',
    guardianPhone: '+234 803 111 2233',
    guardianEmail: 'emmanuel.okonkwo@gmail.com',
    residentialAddress: 'No. 14 College Road, Enugu State',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('MTH 301', 'General Mathematics', 10, 10, 9, 10, 53),
      createSubjectScore('ENG 301', 'English Language', 9, 8, 9, 9, 51),
      createSubjectScore('PHY 301', 'Physics', 10, 9, 9, 10, 52),
      createSubjectScore('CHM 301', 'Chemistry', 8, 9, 8, 9, 51),
      createSubjectScore('BIO 301', 'Biology', 10, 10, 9, 10, 52),
      createSubjectScore('ICT 301', 'Data Processing / ICT', 10, 10, 10, 10, 56),
      createSubjectScore('CIV 301', 'Civic Education', 9, 8, 8, 9, 49),
    ],
  },
  {
    id: 'std-002',
    name: 'Kamsiyochukwu Blessing Eze',
    admissionNo: 'DGC/2024/0420',
    classArm: 'SS 3 Science',
    level: 'SS 3',
    stream: 'Science',
    gender: 'Female',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 84.1,
    termRank: '2nd in SS 3 Science',
    attendanceRate: 0,
    timesSchoolOpened: 0,
    timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2008-09-22',
    guardianName: 'Mrs. Felicia Eze',
    guardianPhone: '+234 803 222 3344',
    residentialAddress: 'Plot 7 Hilltop View, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Aninri',
    subjects: [
      createSubjectScore('MTH 301', 'General Mathematics', 9, 9, 8, 9, 49),
      createSubjectScore('ENG 301', 'English Language', 10, 9, 9, 10, 54),
      createSubjectScore('PHY 301', 'Physics', 8, 9, 8, 8, 48),
      createSubjectScore('CHM 301', 'Chemistry', 9, 8, 9, 9, 50),
      createSubjectScore('BIO 301', 'Biology', 9, 10, 9, 9, 51),
      createSubjectScore('ICT 301', 'Data Processing / ICT', 9, 9, 9, 10, 52),
      createSubjectScore('CIV 301', 'Civic Education', 9, 9, 8, 9, 49),
    ],
  },
  {
    id: 'std-003',
    name: 'Somtochukwu Paul Nnamani',
    admissionNo: 'DGC/2024/0425',
    classArm: 'SS 3 Science',
    level: 'SS 3',
    stream: 'Science',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 71.3,
    termRank: '14th in SS 3 Science',
    attendanceRate: 0,
    timesSchoolOpened: 0,
    timesPresent: 0,
    feeStatus: 'Pending',
    resultHeld: true,
    holdReason: 'Outstanding First Term Tuition Balance (₦65,000) & Lab Levy',
    dateOfBirth: '2008-03-18',
    guardianName: 'Mr. Paul Nnamani Snr.',
    guardianPhone: '+234 803 333 4455',
    residentialAddress: 'Station Road, Enugu Junction',
    stateOfOrigin: 'Enugu State',
    lga: 'Nkanu West',
    subjects: [
      createSubjectScore('MTH 301', 'General Mathematics', 7, 8, 7, 7, 42),
      createSubjectScore('ENG 301', 'English Language', 8, 8, 7, 8, 44),
      createSubjectScore('PHY 301', 'Physics', 7, 7, 8, 7, 43),
      createSubjectScore('CHM 301', 'Chemistry', 6, 7, 7, 7, 40),
      createSubjectScore('BIO 301', 'Biology', 8, 7, 7, 8, 45),
      createSubjectScore('ICT 301', 'Data Processing / ICT', 8, 9, 8, 8, 48),
      createSubjectScore('CIV 301', 'Civic Education', 8, 8, 7, 7, 41),
    ],
  },

  // SS 3 Art
  {
    id: 'std-004',
    name: 'Chimamanda Grace Ugwu',
    admissionNo: 'DGC/2024/0431',
    classArm: 'SS 3 Art',
    level: 'SS 3',
    stream: 'Art',
    gender: 'Female',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 86.8,
    termRank: '1st in SS 3 Art',
    attendanceRate: 0,
    timesSchoolOpened: 0,
    timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2008-11-05',
    guardianName: 'Dr. (Mrs) Ngozi Ugwu',
    guardianPhone: '+234 803 444 5566',
    residentialAddress: 'Court Road, Enugu Urban',
    stateOfOrigin: 'Enugu State',
    lga: 'Udi',
    subjects: [
      createSubjectScore('ENG 301', 'English Language', 10, 10, 10, 10, 56),
      createSubjectScore('LIT 301', 'Literature-in-English', 10, 10, 9, 10, 55),
      createSubjectScore('GOV 301', 'Government', 9, 10, 9, 10, 53),
      createSubjectScore('CRS 301', 'Christian Religious Studies', 10, 9, 10, 10, 54),
      createSubjectScore('MTH 301', 'General Mathematics', 8, 8, 7, 8, 46),
      createSubjectScore('CIV 301', 'Civic Education', 10, 9, 9, 10, 52),
    ],
  },
  {
    id: 'std-005',
    name: 'Tochukwu Victor Ilo',
    admissionNo: 'DGC/2024/0432',
    classArm: 'SS 3 Art',
    level: 'SS 3',
    stream: 'Art',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 79.5,
    termRank: '3rd in SS 3 Art',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2008-07-12',
    guardianName: 'Elder Victor Ilo',
    guardianPhone: '+234 803 555 6677',
    residentialAddress: 'Market Square By-pass, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('ENG 301', 'English Language', 9, 9, 8, 9, 49),
      createSubjectScore('LIT 301', 'Literature-in-English', 9, 8, 9, 9, 48),
      createSubjectScore('GOV 301', 'Government', 8, 9, 8, 9, 47),
      createSubjectScore('CRS 301', 'Christian Religious Studies', 9, 8, 8, 9, 48),
      createSubjectScore('MTH 301', 'General Mathematics', 7, 7, 7, 7, 43),
      createSubjectScore('CIV 301', 'Civic Education', 9, 8, 8, 8, 47),
    ],
  },

  // SS 3 Commercial
  {
    id: 'std-006',
    name: 'Ifeanyi Jude Chukwu',
    admissionNo: 'DGC/2024/0440',
    classArm: 'SS 3 Commercial',
    level: 'SS 3',
    stream: 'Commercial',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 85.2,
    termRank: '1st in SS 3 Commercial',
    attendanceRate: 0,
    timesSchoolOpened: 0,
    timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2008-01-30',
    guardianName: 'Chief Jude Chukwu',
    guardianPhone: '+234 803 666 7788',
    residentialAddress: 'Commercial Layout, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('ACC 301', 'Financial Accounting', 10, 10, 9, 10, 54),
      createSubjectScore('ECO 301', 'Economics', 10, 9, 9, 10, 53),
      createSubjectScore('COM 301', 'Commerce', 9, 10, 9, 10, 51),
      createSubjectScore('MTH 301', 'General Mathematics', 9, 9, 8, 9, 49),
      createSubjectScore('ENG 301', 'English Language', 8, 9, 8, 9, 48),
      createSubjectScore('CIV 301', 'Civic Education', 9, 8, 9, 9, 50),
    ],
  },

  // SS 2 Science
  {
    id: 'std-007',
    name: 'Ngozika Jennifer Onyema',
    admissionNo: 'DGC/2025/0501',
    classArm: 'SS 2 Science',
    level: 'SS 2',
    stream: 'Science',
    gender: 'Female',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 82.6,
    termRank: '1st in SS 2 Science',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2009-04-16',
    guardianName: 'Engr. Onyema',
    guardianPhone: '+234 803 777 8899',
    residentialAddress: 'Govt Station Layout, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Oji River',
    subjects: [
      createSubjectScore('MTH 201', 'Mathematics', 9, 9, 9, 9, 50),
      createSubjectScore('ENG 201', 'English Language', 9, 9, 8, 9, 49),
      createSubjectScore('PHY 201', 'Physics', 9, 8, 8, 9, 48),
      createSubjectScore('CHM 201', 'Chemistry', 8, 9, 8, 8, 47),
      createSubjectScore('BIO 201', 'Biology', 10, 9, 9, 9, 51),
    ],
  },
  {
    id: 'std-008',
    name: 'Ebuka Stanley Mbamalu',
    admissionNo: 'DGC/2025/0505',
    classArm: 'SS 2 Science',
    level: 'SS 2',
    stream: 'Science',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 68.0,
    termRank: '18th in SS 2 Science',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Partial',
    resultHeld: true,
    holdReason: 'Awaiting Board Disciplinary Review & PTA Assessment Clearance',
    dateOfBirth: '2009-08-08',
    guardianName: 'Mazi Stanley Mbamalu',
    guardianPhone: '+234 803 888 9900',
    residentialAddress: 'Old Enugu-Portharcourt Exp., Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('MTH 201', 'Mathematics', 6, 7, 7, 7, 39),
      createSubjectScore('ENG 201', 'English Language', 7, 8, 7, 7, 41),
      createSubjectScore('PHY 201', 'Physics', 6, 7, 6, 7, 38),
      createSubjectScore('CHM 201', 'Chemistry', 6, 6, 7, 6, 38),
      createSubjectScore('BIO 201', 'Biology', 7, 7, 7, 7, 42),
    ],
  },

  // SS 2 Art
  {
    id: 'std-009',
    name: 'Oluoma Perpetual Anosike',
    admissionNo: 'DGC/2025/0512',
    classArm: 'SS 2 Art',
    level: 'SS 2',
    stream: 'Art',
    gender: 'Female',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 81.0,
    termRank: '1st in SS 2 Art',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2009-02-14',
    guardianName: 'Mrs. Anosike',
    guardianPhone: '+234 803 999 0011',
    residentialAddress: 'Commercial Central Commercial Avenue',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('ENG 201', 'English Language', 9, 9, 9, 9, 50),
      createSubjectScore('LIT 201', 'Literature-in-English', 9, 9, 8, 9, 49),
      createSubjectScore('GOV 201', 'Government', 8, 9, 9, 9, 48),
      createSubjectScore('CRS 201', 'Christian Religious Studies', 9, 9, 9, 9, 50),
      createSubjectScore('MTH 201', 'Mathematics', 7, 8, 7, 7, 42),
    ],
  },

  // SS 2 Commercial
  {
    id: 'std-010',
    name: 'Kenechukwu Francis Maduka',
    admissionNo: 'DGC/2025/0520',
    classArm: 'SS 2 Commercial',
    level: 'SS 2',
    stream: 'Commercial',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 83.4,
    termRank: '1st in SS 2 Commercial',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2009-10-10',
    guardianName: 'Chief Maduka',
    guardianPhone: '+234 803 000 1122',
    residentialAddress: 'Bank Road, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('ACC 201', 'Financial Accounting', 9, 10, 9, 9, 51),
      createSubjectScore('ECO 201', 'Economics', 9, 9, 9, 9, 49),
      createSubjectScore('COM 201', 'Commerce', 9, 9, 8, 9, 48),
      createSubjectScore('MTH 201', 'Mathematics', 8, 9, 8, 8, 46),
      createSubjectScore('ENG 201', 'English Language', 8, 8, 8, 9, 47),
    ],
  },

  // SS 1A
  {
    id: 'std-011',
    name: 'Chisom David Okereke',
    admissionNo: 'DGC/2026/0601',
    classArm: 'SS 1A',
    level: 'SS 1',
    stream: 'General',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 80.2,
    termRank: '2nd in SS 1A',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2010-06-25',
    guardianName: 'Mr. Okereke',
    guardianPhone: '+234 803 112 2334',
    residentialAddress: 'Hospital Road, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('MTH 101', 'General Mathematics', 9, 9, 8, 9, 49),
      createSubjectScore('ENG 101', 'English Language', 9, 8, 9, 9, 48),
      createSubjectScore('BIO 101', 'Biology', 9, 9, 8, 9, 48),
      createSubjectScore('AGR 101', 'Agricultural Science', 9, 9, 9, 9, 50),
      createSubjectScore('ECO 101', 'Economics', 8, 8, 8, 8, 44),
    ],
  },

  // SS 1B
  {
    id: 'std-012',
    name: 'Favour Oluebube Nweke',
    admissionNo: 'DGC/2026/0615',
    classArm: 'SS 1B',
    level: 'SS 1',
    stream: 'General',
    gender: 'Female',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 82.5,
    termRank: '1st in SS 1B',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2010-12-04',
    guardianName: 'Mrs. Nweke',
    guardianPhone: '+234 803 223 3445',
    residentialAddress: 'Post Office Lane, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Aninri',
    subjects: [
      createSubjectScore('MTH 101', 'General Mathematics', 9, 9, 9, 9, 50),
      createSubjectScore('ENG 101', 'English Language', 10, 9, 9, 10, 52),
      createSubjectScore('LIT 101', 'Literature-in-English', 9, 9, 9, 9, 49),
      createSubjectScore('CIV 101', 'Civic Education', 9, 9, 8, 9, 49),
      createSubjectScore('BIO 101', 'Biology', 8, 8, 8, 9, 46),
    ],
  },

  // JSS 3A
  {
    id: 'std-013',
    name: 'Uchenna Godswill Okoh',
    admissionNo: 'DGC/2026/0701',
    classArm: 'JSS 3A',
    level: 'JSS 3',
    stream: 'General',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 79.8,
    termRank: '3rd in JSS 3A',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2011-03-15',
    guardianName: 'Mr. Godswill Okoh',
    guardianPhone: '+234 803 334 4556',
    residentialAddress: 'Central Township, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('BST 301', 'Basic Science & Technology', 9, 9, 8, 9, 48),
      createSubjectScore('MTH 003', 'Mathematics', 8, 9, 8, 8, 47),
      createSubjectScore('ENG 003', 'English Studies', 9, 8, 9, 9, 48),
      createSubjectScore('NVE 301', 'National Values', 9, 9, 9, 9, 50),
      createSubjectScore('BUS 301', 'Business Studies', 8, 8, 8, 8, 44),
    ],
  },

  // JSS 3B
  {
    id: 'std-014',
    name: 'Adaeze Mirabel Nwosu',
    admissionNo: 'DGC/2026/0718',
    classArm: 'JSS 3B',
    level: 'JSS 3',
    stream: 'General',
    gender: 'Female',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 84.6,
    termRank: '1st in JSS 3B',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2011-07-29',
    guardianName: 'Dr. Nwosu',
    guardianPhone: '+234 803 445 5667',
    residentialAddress: 'Barracks Road, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('BST 301', 'Basic Science & Technology', 9, 10, 9, 10, 52),
      createSubjectScore('MTH 003', 'Mathematics', 9, 9, 9, 9, 50),
      createSubjectScore('ENG 003', 'English Studies', 10, 9, 9, 10, 53),
      createSubjectScore('NVE 301', 'National Values', 10, 9, 10, 10, 53),
      createSubjectScore('BUS 301', 'Business Studies', 9, 9, 9, 9, 49),
    ],
  },

  // JSS 2A
  {
    id: 'std-015',
    name: 'Obinna Patrick Igwe',
    admissionNo: 'DGC/2026/0801',
    classArm: 'JSS 2A',
    level: 'JSS 2',
    stream: 'General',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 76.5,
    termRank: '5th in JSS 2A',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2012-05-10',
    guardianName: 'Mr. Patrick Igwe',
    guardianPhone: '+234 803 556 6778',
    residentialAddress: 'Hillview Estate, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('BST 201', 'Basic Science & Technology', 8, 8, 8, 8, 44),
      createSubjectScore('MTH 002', 'Mathematics', 8, 8, 7, 8, 45),
      createSubjectScore('ENG 002', 'English Studies', 9, 8, 8, 8, 46),
      createSubjectScore('IGB 201', 'Igbo Language', 9, 9, 9, 9, 49),
    ],
  },

  // JSS 2B
  {
    id: 'std-016',
    name: 'Chidera Princess Ani',
    admissionNo: 'DGC/2026/0820',
    classArm: 'JSS 2B',
    level: 'JSS 2',
    stream: 'General',
    gender: 'Female',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 83.0,
    termRank: '1st in JSS 2B',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2012-09-17',
    guardianName: 'Mrs. Ani',
    guardianPhone: '+234 803 667 7889',
    residentialAddress: 'Old P.O. Road, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('BST 201', 'Basic Science & Technology', 9, 9, 9, 10, 50),
      createSubjectScore('MTH 002', 'Mathematics', 9, 9, 9, 9, 50),
      createSubjectScore('ENG 002', 'English Studies', 9, 10, 9, 9, 51),
      createSubjectScore('IGB 201', 'Igbo Language', 10, 9, 10, 10, 53),
    ],
  },

  // JSS 1A
  {
    id: 'std-017',
    name: 'Emeka Divine Nnamani',
    admissionNo: 'DGC/2026/0901',
    classArm: 'JSS 1A',
    level: 'JSS 1',
    stream: 'General',
    gender: 'Male',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 78.4,
    termRank: '4th in JSS 1A',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2013-02-18',
    guardianName: 'Mr. Nnamani',
    guardianPhone: '+234 803 778 8990',
    residentialAddress: 'Campus Gate View, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('BST 101', 'Basic Science & Technology', 8, 9, 8, 8, 46),
      createSubjectScore('MTH 001', 'Mathematics', 8, 8, 8, 8, 45),
      createSubjectScore('ENG 001', 'English Studies', 9, 8, 8, 9, 47),
      createSubjectScore('NVE 101', 'National Values', 9, 9, 8, 9, 48),
    ],
  },

  // JSS 1B
  {
    id: 'std-018',
    name: 'Somtochukwu Mary Okafor',
    admissionNo: 'DGC/2026/0925',
    classArm: 'JSS 1B',
    level: 'JSS 1',
    stream: 'General',
    gender: 'Female',
    session: '2026/2027',
    term: 'First Term',
    termGpa: 86.0,
    termRank: '1st in JSS 1B',
    attendanceRate: 0, timesSchoolOpened: 0, timesPresent: 0,
    feeStatus: 'Cleared',
    resultHeld: false,
    dateOfBirth: '2013-10-02',
    guardianName: 'Chief Okafor',
    guardianPhone: '+234 803 889 9001',
    residentialAddress: 'High Court Lane, Enugu',
    stateOfOrigin: 'Enugu State',
    lga: 'Enugu North',
    subjects: [
      createSubjectScore('BST 101', 'Basic Science & Technology', 10, 10, 9, 10, 53),
      createSubjectScore('MTH 001', 'Mathematics', 9, 10, 9, 10, 52),
      createSubjectScore('ENG 001', 'English Studies', 10, 9, 10, 10, 53),
      createSubjectScore('NVE 101', 'National Values', 9, 10, 9, 10, 53),
    ],
  },
];

export const DEMO_STUDENT_PROFILE: StudentProfile = INITIAL_STUDENTS[0];
