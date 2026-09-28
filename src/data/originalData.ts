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
  AcademicCalendarSettings,
} from '../types';

export const CURRENT_SESSION = '2026/2027';
export const CURRENT_TERM = 'First Term';
export const TODAY_DATE = 'Monday, 14 September 2026';
export const SCHOOL_NAME = 'Dominion Star Global College';
export const SCHOOL_LOCATION = 'Enugu State, Nigeria';
export const SCHOOL_MOTTO = 'Striving for the Crown of Excellence';

export const DEFAULT_ACADEMIC_CALENDAR: AcademicCalendarSettings = {
  id: 'calendar_settings',
  currentSession: '2026/2027',
  currentTerm: 'First Term',
  nextTerm: 'Second Term',
  nextTermResumptionDate: 'Monday, 11th January, 2027',
  resumptionDateRaw: '2027-01-11',
  boardersResumptionDate: 'Sunday, 10th January, 2027 (by 4:00 PM)',
  vacationDate: 'Friday, 18th December, 2026',
  resumptionNotice: 'All students are expected to resume in full official college uniform with verified bursary clearance and term result broadsheets. No late coming will be condoned.',
  updatedAt: '2026-09-01T08:00:00.000Z',
  updatedBy: 'College Directorate of Academic Affairs',
};

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
  accountName: 'Dominion Star Global College Ltd - School Fees',
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

export interface SportHouseDefinition {
  id: string;
  name: string; // 'Red House', 'Blue House', 'Green House', 'Orange House'
  color: string; // 'Red', 'Blue', 'Green', 'Orange'
  tagline: string;
  motto: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardActiveBorder: string;
  cardActiveBg: string;
  cardHoverBg: string;
  dotColor: string;
  hex: string;
}

export const SPORT_HOUSES_LIST: SportHouseDefinition[] = [
  {
    id: 'red',
    name: 'Red House',
    color: 'Red',
    tagline: 'Courage & Strength',
    motto: 'Strength through Integrity',
    badgeBg: 'bg-red-600',
    badgeBorder: 'border-red-700',
    badgeText: 'text-red-700',
    cardActiveBorder: 'border-red-600 ring-2 ring-red-500/30',
    cardActiveBg: 'bg-red-50/90 text-red-950',
    cardHoverBg: 'hover:bg-red-50/50',
    dotColor: 'bg-red-500',
    hex: '#ef4444',
  },
  {
    id: 'blue',
    name: 'Blue House',
    color: 'Blue',
    tagline: 'Wisdom & Honor',
    motto: 'Excellence in Diligence',
    badgeBg: 'bg-blue-600',
    badgeBorder: 'border-blue-700',
    badgeText: 'text-blue-700',
    cardActiveBorder: 'border-blue-600 ring-2 ring-blue-500/30',
    cardActiveBg: 'bg-blue-50/90 text-blue-950',
    cardHoverBg: 'hover:bg-blue-50/50',
    dotColor: 'bg-blue-500',
    hex: '#3b82f6',
  },
  {
    id: 'green',
    name: 'Green House',
    color: 'Green',
    tagline: 'Growth & Resilience',
    motto: 'Forward in Knowledge',
    badgeBg: 'bg-emerald-600',
    badgeBorder: 'border-emerald-700',
    badgeText: 'text-emerald-700',
    cardActiveBorder: 'border-emerald-600 ring-2 ring-emerald-500/30',
    cardActiveBg: 'bg-emerald-50/90 text-emerald-950',
    cardHoverBg: 'hover:bg-emerald-50/50',
    dotColor: 'bg-emerald-500',
    hex: '#10b981',
  },
  {
    id: 'orange',
    name: 'Orange House',
    color: 'Orange',
    tagline: 'Energy & Leadership',
    motto: 'Leadership with Distinction',
    badgeBg: 'bg-orange-500',
    badgeBorder: 'border-orange-600',
    badgeText: 'text-orange-700',
    cardActiveBorder: 'border-orange-500 ring-2 ring-orange-500/30',
    cardActiveBg: 'bg-orange-50/90 text-orange-950',
    cardHoverBg: 'hover:bg-orange-50/50',
    dotColor: 'bg-orange-500',
    hex: '#f97316',
  },
];

export const getHouseMeta = (houseName?: string): SportHouseDefinition => {
  if (!houseName) return SPORT_HOUSES_LIST[1]; // default Blue House
  const clean = houseName.toLowerCase().trim();
  const found = SPORT_HOUSES_LIST.find(
    (h) => h.name.toLowerCase() === clean || h.color.toLowerCase() === clean || clean.includes(h.color.toLowerCase())
  );
  return found || SPORT_HOUSES_LIST[1];
};

export const ALL_SCHOOL_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Economics',
  'Geography',
  'Government',
  'Literature-in-English',
  'Financial Accounting',
  'Commerce',
  'Marketing',
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
  'Geography',
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
  'Marketing',
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
  else if (norm.includes('geo')) prefix = 'GEO';
  else if (norm.includes('market')) prefix = 'MKT';
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
  if (norm.includes('english') || norm.includes('lit') || norm.includes('gov') || norm.includes('geo') || norm.includes('relig') || norm.includes('crs') || norm.includes('igbo') || norm.includes('french')) {
    return 'Arts & Humanities';
  }
  if (norm.includes('econ') || norm.includes('account') || norm.includes('comm') || norm.includes('market') || norm.includes('book') || norm.includes('business')) {
    return 'Commercial';
  }
  if (norm.includes('data') || norm.includes('ict') || norm.includes('basic sci') || norm.includes('technology') || norm.includes('agri')) {
    return 'Vocational & Technology';
  }
  return 'General Curriculum';
}

/**
 * Fuzzy/Robust Subject Category Matcher
 * Seamlessly matches 'General' with 'General Curriculum' and 'Vocational & Tech' with 'Vocational & Technology'
 */
export function matchesSubjectCategory(subjectName: string, categoryFilter: string): boolean {
  if (!categoryFilter || categoryFilter === 'ALL') return true;
  const cat = getSubjectCategory(subjectName);
  if (cat === categoryFilter) return true;
  const normFilter = categoryFilter.toLowerCase();
  const normCat = cat.toLowerCase();
  if (normFilter.includes('general') && normCat.includes('general')) return true;
  if (normFilter.includes('vocational') && normCat.includes('vocational')) return true;
  if (normFilter.includes('art') && normCat.includes('art')) return true;
  if (normFilter.includes('sci') && normCat.includes('sci')) return true;
  if (normFilter.includes('com') && normCat.includes('com')) return true;
  return false;
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

/* STAFF ROSTER: MANAGED DYNAMICALLY IN CLOUD FIRESTORE */
export const INITIAL_STAFF_MEMBERS: StaffMember[] = [];

/* STUDENT BODY: MANAGED DYNAMICALLY IN CLOUD FIRESTORE */
export const INITIAL_STUDENTS: StudentProfile[] = [];

export const DEMO_STUDENT_PROFILE: StudentProfile | null = null;
