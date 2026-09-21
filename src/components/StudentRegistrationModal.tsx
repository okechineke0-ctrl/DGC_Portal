import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  BookOpen,
  Users,
  HeartPulse,
  DollarSign,
  Camera,
  Upload,
  Printer,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  Info,
  Copy,
  Check,
  GraduationCap,
  School,
  RefreshCw,
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { SCHOOL_NAME, SCHOOL_MOTTO, SCHOOL_LOCATION } from '../data/mockData';
import { DGCLogo } from './DGCLogo';
import { compressPassportPhoto } from '../utils/imageCompressor';
import {
  calculateAdmissionYear,
  generateNextRegNumber,
  validateRegNumber,
  extractLevelFromClass,
  SECONDARY_CLASS_LEVELS,
  SecondaryClassLevel,
  CLASS_LEVEL_ORDER,
} from '../utils/regNoCalculator';

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterStudent: (studentData: Partial<StudentProfile>) => Promise<boolean>;
  classes: { name: string; level: string; stream: string }[];
  existingStudents?: StudentProfile[];
}

const CLASS_OPTIONS = [
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
];

const NIGERIAN_STATES = [
  'Enugu State',
  'Anambra State',
  'Imo State',
  'Abia State',
  'Ebonyi State',
  'Lagos State',
  'Abuja (FCT)',
  'Rivers State',
  'Delta State',
  'Edo State',
  'Ogun State',
  'Oyo State',
  'Kano State',
  'Kaduna State',
  'Other State',
];

const SPORT_HOUSES = [
  { name: 'St. Thomas Aquinas House', color: 'Blue' },
  { name: 'St. Dominic House', color: 'Gold' },
  { name: 'St. Catherine of Siena House', color: 'Green' },
  { name: 'St. Martin de Porres House', color: 'Red' },
];

export const StudentRegistrationModal: React.FC<StudentRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterStudent,
  classes,
  existingStudents,
}) => {
  // Form step / tab
  const [activeSection, setActiveSection] = useState<'biodata' | 'academic' | 'guardian' | 'medical' | 'bursary'>('biodata');

  // Form state
  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dob, setDob] = useState('2011-04-15');
  const [religion, setReligion] = useState('Christianity');
  const [nationality, setNationality] = useState('Nigerian');
  const [stateOfOrigin, setStateOfOrigin] = useState('Enugu State');
  const [lga, setLga] = useState('Enugu North');
  const [residentialAddress, setResidentialAddress] = useState('Enugu State, Nigeria');
  const [studentPhone, setStudentPhone] = useState('');

  // Academic Placement & Cohort Engine
  const [classArm, setClassArm] = useState('JSS 1A');
  const [session, setSession] = useState('2026/2027');
  const [entryTerm, setEntryTerm] = useState('First Term');
  const [enrollmentType, setEnrollmentType] = useState<'Regular Intake' | 'Transfer Student'>('Regular Intake');
  const [transferClassJoined, setTransferClassJoined] = useState<SecondaryClassLevel>('JSS 1');
  const [customAdmissionYear, setCustomAdmissionYear] = useState<number>(2026);
  const [isManualYearOverride, setIsManualYearOverride] = useState(false);
  const [admissionNo, setAdmissionNo] = useState('');
  const [isCustomRegNo, setIsCustomRegNo] = useState(false);

  const [boardingStatus, setBoardingStatus] = useState<'Day Student' | 'Boarder'>('Day Student');
  const [houseAllocation, setHouseAllocation] = useState(SPORT_HOUSES[0].name);
  const [previousSchool, setPreviousSchool] = useState('');
  const [lastClassPassed, setLastClassPassed] = useState('Primary 6 / Basic 6');
  const [entranceExamScore, setEntranceExamScore] = useState<number>(78);

  // Guardian
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('Father');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianAltPhone, setGuardianAltPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianOccupation, setGuardianOccupation] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Medical
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [genotype, setGenotype] = useState('AA');
  const [allergies, setAllergies] = useState('None');
  const [medicalConditions, setMedicalConditions] = useState('None');

  // Bursary
  const [feeStatus, setFeeStatus] = useState<'Cleared' | 'Pending' | 'Partial'>('Cleared');
  const [scholarshipStatus, setScholarshipStatus] = useState('None');
  const [tellerNumber, setTellerNumber] = useState(`TEL-${Date.now().toString().slice(-6)}`);
  const [photoUrl, setPhotoUrl] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredStudent, setRegisteredStudent] = useState<StudentProfile | null>(null);
  const [copiedRegNo, setCopiedRegNo] = useState(false);

  if (!isOpen) return null;

  // Auto-detect level and stream from class arm
  const detectLevelAndStream = (arm: string) => {
    let level = 'JSS 1';
    let stream: 'Science' | 'Art' | 'Commercial' | 'General' = 'General';

    if (arm.startsWith('JSS 1')) level = 'JSS 1';
    else if (arm.startsWith('JSS 2')) level = 'JSS 2';
    else if (arm.startsWith('JSS 3')) level = 'JSS 3';
    else if (arm.startsWith('SS 1')) level = 'SS 1';
    else if (arm.startsWith('SS 2')) level = 'SS 2';
    else if (arm.startsWith('SS 3')) level = 'SS 3';

    if (arm.includes('Science')) stream = 'Science';
    else if (arm.includes('Art')) stream = 'Art';
    else if (arm.includes('Commercial')) stream = 'Commercial';

    return { level, stream };
  };

  const currentPlacementLevel = useMemo(() => extractLevelFromClass(classArm), [classArm]);

  // Dynamic Nigerian 6-Year Secondary Education Cohort Calculation
  const cohortCalculation = useMemo(() => {
    return calculateAdmissionYear({
      currentSession: session,
      targetClass: classArm,
      enrollmentType,
      transferClassJoined: enrollmentType === 'Transfer Student' ? transferClassJoined : undefined,
      customAdmissionYear: isManualYearOverride ? customAdmissionYear : undefined,
    });
  }, [session, classArm, enrollmentType, transferClassJoined, isManualYearOverride, customAdmissionYear]);

  // Restrict transferClassJoined so it cannot exceed current placement level
  useEffect(() => {
    if (enrollmentType === 'Transfer Student') {
      const curOrd = CLASS_LEVEL_ORDER[currentPlacementLevel] || 1;
      const joinedOrd = CLASS_LEVEL_ORDER[transferClassJoined] || curOrd;
      if (joinedOrd > curOrd) {
        setTransferClassJoined(currentPlacementLevel);
      }
    }
  }, [currentPlacementLevel, enrollmentType]);

  // Synchronize official Registration Number with computed cohort year (unless customized manually)
  useEffect(() => {
    if (!isCustomRegNo) {
      const nextReg = generateNextRegNumber(cohortCalculation.admissionYear, existingStudents || []);
      setAdmissionNo(nextReg);
    }
  }, [cohortCalculation.admissionYear, isCustomRegNo, existingStudents]);

  // Real-time registry verification against existing database students
  const regValidation = useMemo(() => {
    return validateRegNumber(admissionNo, existingStudents || []);
  }, [admissionNo, existingStudents]);

  const handleClassChange = (newArm: string) => {
    setClassArm(newArm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!surname.trim() || !firstName.trim()) {
      setErrorMsg('Please provide at least student Surname and First Name.');
      setActiveSection('biodata');
      return;
    }

    if (!guardianName.trim() || !guardianPhone.trim()) {
      setErrorMsg('Please provide Parent/Guardian Full Name and Primary Phone Number.');
      setActiveSection('guardian');
      return;
    }

    if (!regValidation.isValid) {
      setErrorMsg(regValidation.error || 'Please correct the Registration Number before proceeding.');
      setActiveSection('academic');
      return;
    }

    setIsSubmitting(true);
    const fullName = `${surname.trim()} ${firstName.trim()}${middleName.trim() ? ' ' + middleName.trim() : ''}`;
    const { level, stream } = detectLevelAndStream(classArm);

    const studentPayload: Partial<StudentProfile> = {
      name: fullName,
      surname: surname.trim(),
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      admissionNo: admissionNo.trim().toUpperCase(),
      admissionYear: cohortCalculation.admissionYear,
      enrollmentType,
      transferClassJoined: enrollmentType === 'Transfer Student' ? transferClassJoined : undefined,
      classArm,
      level,
      stream,
      gender,
      dateOfBirth: dob,
      religion,
      nationality,
      stateOfOrigin,
      lga,
      residentialAddress,
      phone: studentPhone,
      session,
      term: entryTerm,
      boardingStatus,
      houseAllocation,
      previousSchool: previousSchool.trim() || undefined,
      lastClassPassed: lastClassPassed.trim() || undefined,
      entranceExamScore: Number(entranceExamScore),
      guardianName: guardianName.trim(),
      guardianRelationship,
      guardianPhone: guardianPhone.trim(),
      guardianAltPhone,
      guardianEmail,
      guardianOccupation,
      emergencyContactName: emergencyContactName || guardianName,
      emergencyContactPhone: emergencyContactPhone || guardianPhone,
      bloodGroup,
      genotype,
      allergies,
      medicalConditions,
      feeStatus,
      scholarshipStatus,
      tellerNumber,
      photoUrl,
      resultHeld: false,
    };

    try {
      const success = await onRegisterStudent(studentPayload);
      if (success) {
        setRegisteredStudent({
          ...(studentPayload as StudentProfile),
          id: `std-${Date.now()}`,
          termGpa: 0,
          termRank: 'Pending Assessment',
          attendanceRate: 0,
          subjects: [],
        });
      } else {
        setErrorMsg('Failed to register student on the server. Please verify fields and retry.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during student registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAdmission = () => {
    if (registeredStudent) {
      navigator.clipboard.writeText(registeredStudent.admissionNo);
      setCopiedRegNo(true);
      setTimeout(() => setCopiedRegNo(false), 2000);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer"
            title="Close registration"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-blue-300 border border-white/20 flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white bg-blue-600 px-2 py-0.5 rounded">
                  Admin Authority Exclusive
                </span>
                <span className="text-[10px] text-slate-300">
                  Principal & Registrar Office
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-title tracking-tight mt-0.5">
                New Student Admission & Registration
              </h2>
              <p className="text-xs text-slate-300">
                Official 6-Year Secondary Academic Profile Provisioning · {SCHOOL_NAME}
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS ADMISSION CONFIRMATION SLIP */}
        {registeredStudent ? (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-3xl text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black font-serif-title text-slate-900">
                Student Enrolled Successfully!
              </h3>
              <p className="text-xs text-emerald-800 font-medium max-w-md mx-auto">
                Official college academic record and portal credentials have been provisioned into the Dominate Star College database.
              </p>
            </div>

            {/* Official Admission Slip Card */}
            <div className="p-6 sm:p-7 bg-white rounded-2xl border-2 border-blue-950/20 shadow-lg space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <DGCLogo size="md" showText={false} />
                  <div>
                    <h4 className="font-serif-title font-black text-blue-950 text-base">
                      {SCHOOL_NAME}
                    </h4>
                    <p className="text-[11px] text-slate-500">{SCHOOL_LOCATION} · {SCHOOL_MOTTO}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-950 bg-blue-100 px-2.5 py-1 rounded-full">
                    Official Admission Slip
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Session {session}</p>
                </div>
              </div>

              {/* Student Highlight Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Full Student Name
                  </span>
                  <span className="text-sm font-bold text-slate-900">{registeredStudent.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Class & Stream
                  </span>
                  <span className="text-sm font-bold text-blue-900">
                    {registeredStudent.classArm} ({registeredStudent.stream})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Admission Year & Track
                  </span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-black">
                      {registeredStudent.admissionYear || cohortCalculation.admissionYear}
                    </span>
                    <span className="text-slate-600 font-medium">
                      {registeredStudent.enrollmentType === 'Transfer Student'
                        ? `Transfer (${registeredStudent.transferClassJoined || 'Direct'})`
                        : 'Regular Intake'}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Gender & DOB
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {registeredStudent.gender} · {registeredStudent.dateOfBirth}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Parent / Guardian
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {registeredStudent.guardianName} ({registeredStudent.guardianPhone})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Sport House & Status
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {houseAllocation} · {boardingStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Fees Clearance
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {registeredStudent.feeStatus}
                  </span>
                </div>
              </div>

              {/* Portal Login Credentials Box */}
              <div className="p-4 bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <h5 className="font-bold text-sm text-white">
                    Student Portal Login Credentials
                  </h5>
                </div>
                <div className="bg-white/10 p-3.5 rounded-xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-amber-300 block tracking-widest">
                      Official Registration Number (Reg No)
                    </span>
                    <span className="text-lg font-mono font-black text-white select-all">
                      {registeredStudent.admissionNo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAdmission}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-center"
                  >
                    {copiedRegNo ? (
                      <>
                        <Check className="w-4 h-4" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy Reg Number
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-200">
                  <strong>Student Login Rule:</strong> The student will log in at the college portal using this <strong>Registration Number</strong> as both their <strong>Reg Number</strong> and their default <strong>Password</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Admission Slip</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Done / Return to Roll
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            {/* Section Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-sky-200 bg-sky-50/60 px-4 sm:px-6 overflow-x-auto text-xs font-bold py-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSection('biodata')}
                className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'biodata'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-sky-100/70'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1. Student Biodata</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('academic')}
                className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'academic'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-sky-100/70'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>2. Academic Placement</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('guardian')}
                className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'guardian'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-sky-100/70'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>3. Parent / Guardian</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('medical')}
                className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'medical'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-sky-100/70'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>4. Health & Medical</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('bursary')}
                className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'bursary'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-sky-100/70'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>5. Bursary & Photo</span>
              </button>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scrollable Form Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* SECTION 1: BIODATA */}
              {activeSection === 'biodata' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Personal Demographics & Legal Biodata
                    </h3>
                    <p className="text-xs text-slate-500">
                      Accurate legal names as recorded on birth certificates and primary school registers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Surname (Last Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="e.g. Surname"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Emmanuel"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Middle / Other Name
                      </label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="e.g. Chidera / Kelvin"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Gender *</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Religion</label>
                      <select
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="Christianity (Catholic)">Christianity (Catholic)</option>
                        <option value="Christianity (Anglican)">Christianity (Anglican)</option>
                        <option value="Christianity (Pentecostal)">Christianity (Pentecostal)</option>
                        <option value="Christianity (Methodist/Presbyterian)">Christianity (Methodist/Presbyterian)</option>
                        <option value="Christianity (Other)">Christianity (Other)</option>
                        <option value="Islam">Islam</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Nationality</label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        State of Origin
                      </label>
                      <select
                        value={stateOfOrigin}
                        onChange={(e) => setStateOfOrigin(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Local Government Area (LGA)
                      </label>
                      <input
                        type="text"
                        value={lga}
                        onChange={(e) => setLga(e.target.value)}
                        placeholder="e.g. Enugu North / Oji River"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Residential / Home Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={residentialAddress}
                        onChange={(e) => setResidentialAddress(e.target.value)}
                        placeholder="No. 12 Independence Layout, Enugu"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Student Mobile Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: ACADEMIC PLACEMENT */}
              {activeSection === 'academic' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-900" />
                        Academic Enrolment & Placement Class
                      </h3>
                      <p className="text-xs text-slate-500">
                        Institutional cohort progression, transfer admissions, and official DGC registration number generation.
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full shrink-0 w-fit">
                      Session {session}
                    </span>
                  </div>

                  {/* 1. ENROLMENT CLASSIFICATION: REGULAR INTAKE VS TRANSFER STUDENT */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Enrolment Pathway & Admission Category *</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Determines historical cohort year calculations
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Regular Intake Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setEnrollmentType('Regular Intake');
                          setIsManualYearOverride(false);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          enrollmentType === 'Regular Intake'
                            ? 'border-blue-900 bg-blue-50/70 shadow-sm ring-2 ring-blue-900/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              enrollmentType === 'Regular Intake'
                                ? 'bg-blue-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <School className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900">
                                Regular Intake (Standard Track)
                              </span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                  enrollmentType === 'Regular Intake'
                                    ? 'border-blue-900 bg-blue-900'
                                    : 'border-slate-300'
                                }`}
                              >
                                {enrollmentType === 'Regular Intake' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-tight">
                              Enrolled initially into JSS 1 at Dominate Star College and progressed chronologically through secondary classes.
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Transfer Student Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setEnrollmentType('Transfer Student');
                          setIsManualYearOverride(false);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          enrollmentType === 'Transfer Student'
                            ? 'border-blue-900 bg-blue-50/70 shadow-sm ring-2 ring-blue-900/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              enrollmentType === 'Transfer Student'
                                ? 'bg-blue-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900">
                                Transfer Student (Mid-Stream)
                              </span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                  enrollmentType === 'Transfer Student'
                                    ? 'border-blue-900 bg-blue-900'
                                    : 'border-slate-300'
                                }`}
                              >
                                {enrollmentType === 'Transfer Student' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-tight">
                              Transferred to Dominate Star College mid-way from an external secondary school into a specific junior/senior class.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 2. IF TRANSFER STUDENT: DEDICATED TRANSFER ENTRY SPECIFICATION */}
                  {enrollmentType === 'Transfer Student' && (
                    <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-sky-950 uppercase tracking-wide">
                            Transfer Admission Parameters & Prior Records
                          </h4>
                          <p className="text-[11px] text-sky-700">
                            Specify the exact class level where this student joined Dominate Star College to calculate their admission cohort year.
                          </p>
                        </div>
                      </div>

                      {/* Quick Transfer Timing Selector */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setTransferClassJoined(currentPlacementLevel);
                            setIsManualYearOverride(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            transferClassJoined === currentPlacementLevel && !isManualYearOverride
                              ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                              : 'bg-white text-slate-700 border-sky-300 hover:bg-sky-100/60'
                          }`}
                        >
                          Transferred this session into {currentPlacementLevel} (2026)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // If currently at current placement, pick one level below if available
                            const currOrder = CLASS_LEVEL_ORDER[currentPlacementLevel] || 1;
                            const prevLevels = SECONDARY_CLASS_LEVELS.filter(
                              (lvl) => (CLASS_LEVEL_ORDER[lvl] || 1) < currOrder
                            );
                            if (prevLevels.length > 0) {
                              setTransferClassJoined(prevLevels[prevLevels.length - 1]);
                            }
                            setIsManualYearOverride(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            transferClassJoined !== currentPlacementLevel || isManualYearOverride
                              ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                              : 'bg-white text-slate-700 border-sky-300 hover:bg-sky-100/60'
                          }`}
                        >
                          Transferred in earlier session (2022–2025)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="text-xs font-bold text-sky-950 block mb-1">
                            Entry Class Joined at DGC *
                          </label>
                          <select
                            value={transferClassJoined}
                            onChange={(e) => {
                              setTransferClassJoined(e.target.value as SecondaryClassLevel);
                              setIsManualYearOverride(false);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-sky-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-900"
                          >
                            {SECONDARY_CLASS_LEVELS.filter(
                              (lvl) =>
                                (CLASS_LEVEL_ORDER[lvl] || 1) <=
                                (CLASS_LEVEL_ORDER[currentPlacementLevel] || 1)
                            ).map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {lvl} (Entered DGC at {lvl})
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-sky-700 block mt-0.5">
                            Cannot exceed current class ({currentPlacementLevel})
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-sky-950 block mb-1">
                            Previous School Attended *
                          </label>
                          <input
                            type="text"
                            value={previousSchool}
                            onChange={(e) => setPreviousSchool(e.target.value)}
                            placeholder="e.g. Federal Govt College, Enugu"
                            className="w-full px-3 py-2 rounded-xl border border-sky-300 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-900"
                          />
                          <span className="text-[10px] text-sky-700 block mt-0.5">
                            Last institution attended
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-sky-950 block mb-1">
                            Last Class Passed Before Transfer
                          </label>
                          <input
                            type="text"
                            value={lastClassPassed}
                            onChange={(e) => setLastClassPassed(e.target.value)}
                            placeholder="e.g. JSS 3 (BECE Pass) or SS 1"
                            className="w-full px-3 py-2 rounded-xl border border-sky-300 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-900"
                          />
                          <span className="text-[10px] text-sky-700 block mt-0.5">
                            Official clearance basis
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. CURRENT CLASS PLACEMENT & SESSION */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Current Class Arm Placement *
                      </label>
                      <select
                        value={classArm}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        {CLASS_OPTIONS.map((arm) => (
                          <option key={arm} value={arm}>
                            {arm}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Current active arm at Dominate Star College
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Current Enrolment Session
                      </label>
                      <input
                        type="text"
                        value={session}
                        onChange={(e) => setSession(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Active academic school calendar
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Entry Term</label>
                      <select
                        value={entryTerm}
                        onChange={(e) => setEntryTerm(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                      </select>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Term of resumption
                      </span>
                    </div>
                  </div>

                  {/* 4. EXECUTIVE ADMISSION COHORT CALCULATION HUB */}
                  <div className="p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl space-y-3 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                            DGC Institutional Cohort Engine
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            Admission Year & Academic Timeline Calculation
                          </h4>
                        </div>
                      </div>

                      {/* Manual Override Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isManualYearOverride) {
                            setIsManualYearOverride(false);
                          } else {
                            setIsManualYearOverride(true);
                            setCustomAdmissionYear(cohortCalculation.admissionYear);
                          }
                        }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>{isManualYearOverride ? 'Lock to Auto-Calculated' : 'Manual Year Override'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                          Official Admission Year
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-black text-amber-300 font-mono">
                            {cohortCalculation.admissionYear}
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium">
                            {isManualYearOverride ? '(Manual Override)' : '(Auto-Calculated)'}
                          </span>
                        </div>

                        {/* Quick Cohort Year Pills */}
                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => setIsManualYearOverride(false)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              !isManualYearOverride
                                ? 'bg-amber-400 text-slate-950 shadow-xs'
                                : 'bg-white/10 text-slate-300 hover:bg-white/20'
                            }`}
                            title="Reset to automatic calculation based on current class"
                          >
                            Auto
                          </button>
                          {[2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => {
                                setIsManualYearOverride(true);
                                setCustomAdmissionYear(yr);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                isManualYearOverride && (customAdmissionYear || cohortCalculation.admissionYear) === yr
                                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
                              }`}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2 bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-white">
                            Cohort Breakdown & Verification:
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                          {cohortCalculation.explanation}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Expected secondary completion (SS 3 Graduation / WAEC):{' '}
                          <strong className="text-slate-200">
                            {cohortCalculation.admissionYear + 6}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5. OFFICIAL COLLEGE REGISTRATION NUMBER GENERATOR & VERIFICATION */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Official College Registration Number (Reg No)
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Format: <code>DGC/YYYY/NNNN</code>. Serves as student ID and permanent portal login credential.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const nextReg = generateNextRegNumber(
                              cohortCalculation.admissionYear,
                              existingStudents || []
                            );
                            setAdmissionNo(nextReg);
                            setIsCustomRegNo(false);
                          }}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Next Serial</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsCustomRegNo(!isCustomRegNo)}
                          className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                        >
                          {isCustomRegNo ? 'Lock Number' : 'Custom Entry'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input
                        type="text"
                        required
                        disabled={!isCustomRegNo}
                        value={admissionNo}
                        onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
                        placeholder="e.g. DGC/2023/0432"
                        className={`w-full max-w-sm px-3.5 py-2.5 rounded-xl border text-base font-mono font-black tracking-wide ${
                          isCustomRegNo
                            ? 'border-blue-950 bg-white text-blue-950 ring-2 ring-blue-900/20'
                            : 'border-slate-300 bg-slate-100 text-slate-800 cursor-not-allowed'
                        }`}
                      />

                      {/* Live Uniqueness & Validity Badge */}
                      <div className="flex-1">
                        {regValidation.isValid ? (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              Verified: Official format & Unique in College Registry (Cohort {regValidation.year})
                            </span>
                          </div>
                        ) : (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{regValidation.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 6. BOARDING, SPORT HOUSE & ENTRANCE SCORE */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Boarding / Day Enrolment Type *
                      </label>
                      <select
                        value={boardingStatus}
                        onChange={(e) => setBoardingStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="Day Student">Day Student (Commuter)</option>
                        <option value="Boarder">Boarding House Resident</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Sport / College House Allocation
                      </label>
                      <select
                        value={houseAllocation}
                        onChange={(e) => setHouseAllocation(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        {SPORT_HOUSES.map((h) => (
                          <option key={h.name} value={h.name}>
                            {h.name} ({h.color})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Entrance / Placement Aggregate (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={entranceExamScore}
                        onChange={(e) => setEntranceExamScore(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: GUARDIAN */}
              {activeSection === 'guardian' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Parent / Legal Guardian & Emergency Profile
                    </h3>
                    <p className="text-xs text-slate-500">
                      Primary sponsors receive official term progress reports, portal notifications, and bursary clearances.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Parent / Guardian Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="e.g. Guardian Full Name"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Relationship to Student *
                      </label>
                      <select
                        value={guardianRelationship}
                        onChange={(e) => setGuardianRelationship(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Sibling">Elder Sibling</option>
                        <option value="Sponsor">Institutional Sponsor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Primary Phone (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="+234 803 123 4567"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Alternate Phone
                      </label>
                      <input
                        type="tel"
                        value={guardianAltPhone}
                        onChange={(e) => setGuardianAltPhone(e.target.value)}
                        placeholder="+234 809 987 6543"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={guardianEmail}
                        onChange={(e) => setGuardianEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Occupation / Place of Work
                      </label>
                      <input
                        type="text"
                        value={guardianOccupation}
                        onChange={(e) => setGuardianOccupation(e.target.value)}
                        placeholder="e.g. Civil Servant / University Lecturer"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Emergency Contact Person & Phone
                      </label>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Contact Person Name & Phone"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: HEALTH & MEDICAL */}
              {activeSection === 'medical' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Health, Medical Profile & Sick Bay Clearance
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dominate Star College clinic emergency preparedness and dietary management.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="O+">O+ (Positive)</option>
                        <option value="O-">O- (Negative)</option>
                        <option value="A+">A+ (Positive)</option>
                        <option value="A-">A- (Negative)</option>
                        <option value="B+">B+ (Positive)</option>
                        <option value="B-">B- (Negative)</option>
                        <option value="AB+">AB+ (Positive)</option>
                        <option value="AB-">AB- (Negative)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Genotype</label>
                      <select
                        value={genotype}
                        onChange={(e) => setGenotype(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="AA">AA (Normal)</option>
                        <option value="AS">AS (Carrier)</option>
                        <option value="SS">SS (Sickle Cell)</option>
                        <option value="AC">AC</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Known Allergies (Food, Environmental, Pharmaceuticals)
                    </label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Groundnut allergy, Penicillin, Asthma triggers (or None)"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Chronic Medical Conditions / Physical Accommodations
                    </label>
                    <textarea
                      rows={2}
                      value={medicalConditions}
                      onChange={(e) => setMedicalConditions(e.target.value)}
                      placeholder="Specify any visual impairment, dietary restriction, or special physical need (or None)"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 5: BURSARY & PASSPORT PHOTO */}
              {activeSection === 'bursary' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Bursary Clearance & Passport Photograph
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tuition clearance verification and official biometric portal avatar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Tuition & Enrolment Fee Status *
                      </label>
                      <select
                        value={feeStatus}
                        onChange={(e) => setFeeStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="Cleared">Cleared (100% Paid)</option>
                        <option value="Partial">Partial (Installment Approved)</option>
                        <option value="Pending">Pending Clearance</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Scholarship / Bursary Concession
                      </label>
                      <select
                        value={scholarshipStatus}
                        onChange={(e) => setScholarshipStatus(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950 bg-white"
                      >
                        <option value="None">None (Standard Tuition)</option>
                        <option value="Full Academic Merit">Full Academic Merit</option>
                        <option value="Pastoral / Diocesan Discretion">Pastoral / Diocesan Discretion</option>
                        <option value="Staff Child Concession">Staff Child Concession</option>
                        <option value="Sports & Athletic Grant">Sports & Athletic Grant</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Bank Teller / Ref Number
                      </label>
                      <input
                        type="text"
                        value={tellerNumber}
                        onChange={(e) => setTellerNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-950"
                      />
                    </div>
                  </div>

                  {/* Passport Photo Uploader */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Student Passport"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-400">
                          <Camera className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                          <span className="text-[9px] font-bold block">Passport Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <span className="text-xs font-bold text-slate-800 block">
                        Upload Official Student Passport Photograph
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Plain white background, school uniform or dignified shirt facing front. Maximum file size: 2MB.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Select Photo File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressPassportPhoto(file, 360, 420, 0.82);
                                  setPhotoUrl(compressed);
                                } catch (err) {
                                  console.error('Failed to compress passport photograph:', err);
                                }
                              }
                            }}
                          />
                        </label>

                        {photoUrl && (
                          <button
                            type="button"
                            onClick={() => setPhotoUrl('')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation & Submit */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {activeSection !== 'biodata' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSection === 'academic') setActiveSection('biodata');
                      else if (activeSection === 'guardian') setActiveSection('academic');
                      else if (activeSection === 'medical') setActiveSection('guardian');
                      else if (activeSection === 'bursary') setActiveSection('medical');
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Previous Step
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeSection !== 'bursary' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSection === 'biodata') setActiveSection('academic');
                      else if (activeSection === 'academic') setActiveSection('guardian');
                      else if (activeSection === 'guardian') setActiveSection('medical');
                      else if (activeSection === 'medical') setActiveSection('bursary');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Registering Student...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit & Authorize Admission</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
