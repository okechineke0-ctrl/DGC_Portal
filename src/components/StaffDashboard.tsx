import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Boxes,
  Users,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  Sparkles,
  Lock,
  Edit3,
  ShieldCheck,
  Award,
  Layers,
  Check,
  UserCheck,
} from 'lucide-react';
import { StaffMember, StudentProfile, SubjectScore, SchoolClassDefinition } from '../types';
import {
  SCHOOL_CLASSES_LIST,
  ALL_SCHOOL_SUBJECTS,
  calculateGrade,
  computeCaTotal,
} from '../data/mockData';

interface StaffDashboardProps {
  staff: StaffMember;
  onExit: () => void;
  students: StudentProfile[];
  classes?: SchoolClassDefinition[];
  onUpdateStudentScore: (studentId: string, scoreData: Partial<SubjectScore>) => Promise<boolean>;
  onUpdateStudentRemarks?: (studentId: string, remarks: { formMasterRemark?: string; principalRemark?: string }) => Promise<boolean>;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  staff,
  onExit,
  students,
  classes = [],
  onUpdateStudentScore,
  onUpdateStudentRemarks,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'grading' | 'form_master' | 'workload'>('grading');

  // Select initial class from staff's assigned classes or default
  const initialClass = staff.assignedClasses && staff.assignedClasses.length > 0
    ? staff.assignedClasses[0]
    : 'SS 3 Science';

  const initialSubject = staff.subjectsTaught && staff.subjectsTaught.length > 0
    ? staff.subjectsTaught[0]
    : 'Mathematics';

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form Master remarks state
  const formClass = staff.formMasterOf || selectedClass;
  const [formMasterRemarks, setFormMasterRemarks] = useState<Record<string, string>>({});
  const [savingRemarkId, setSavingRemarkId] = useState<string | null>(null);

  // Local state of scores for editing
  const [scoreInputs, setScoreInputs] = useState<Record<string, {
    homework: string;
    test1: string;
    test2: string;
    practical: string;
    exam: string;
  }>>({});

  // Filter students by selected class arm
  const classStudents = students.filter((s) => s.classArm === selectedClass);
  const formClassStudents = students.filter((s) => s.classArm === formClass);

  // Populate score inputs whenever selectedClass, selectedSubject, or students change
  useEffect(() => {
    const newInputs: Record<string, {
      homework: string;
      test1: string;
      test2: string;
      practical: string;
      exam: string;
    }> = {};

    classStudents.forEach((student) => {
      const subjectScore = student.subjects?.find(
        (sub) => sub.name.toLowerCase() === selectedSubject.toLowerCase()
      );

      newInputs[student.id] = {
        homework: subjectScore?.homework !== undefined ? String(subjectScore.homework) : '',
        test1: subjectScore?.test1 !== undefined ? String(subjectScore.test1) : '',
        test2: subjectScore?.test2 !== undefined ? String(subjectScore.test2) : '',
        practical: subjectScore?.practical !== undefined ? String(subjectScore.practical) : (subjectScore?.quiz !== undefined ? String(subjectScore.quiz) : ''),
        exam: subjectScore?.exam !== undefined ? String(subjectScore.exam) : '',
      };
    });

    setScoreInputs(newInputs);
  }, [selectedClass, selectedSubject, students]);

  // Populate form master remarks
  useEffect(() => {
    const remarks: Record<string, string> = {};
    formClassStudents.forEach((student) => {
      remarks[student.id] = student.formMasterRemark || (
        student.termGpa >= 75
          ? 'An exceptional, highly focused student who demonstrates academic brilliance and moral discipline.'
          : 'A good and regular student. Encouraged to allocate more time to continuous assessment revisions.'
      );
    });
    setFormMasterRemarks(remarks);
  }, [formClass, students]);

  const handleInputChange = (studentId: string, field: 'homework' | 'test1' | 'test2' | 'practical' | 'exam', value: string) => {
    if (value !== '' && isNaN(Number(value))) return;
    setScoreInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveStudentScore = async (studentId: string) => {
    setSavingId(studentId);
    const input = scoreInputs[studentId] || { homework: '', test1: '', test2: '', practical: '', exam: '' };

    const hw = input.homework !== '' ? Number(input.homework) : 0;
    const t1 = input.test1 !== '' ? Number(input.test1) : 0;
    const t2 = input.test2 !== '' ? Number(input.test2) : 0;
    const prac = input.practical !== '' ? Number(input.practical) : 0;
    const ex = input.exam !== '' ? Number(input.exam) : 0;

    const ca = computeCaTotal(hw, t1, t2, prac);
    const tot = Math.min(100, ca + ex);
    const { grade, remark } = calculateGrade(tot);

    const success = await onUpdateStudentScore(studentId, {
      name: selectedSubject,
      code: `${selectedSubject.substring(0, 3).toUpperCase()} ${selectedClass.startsWith('SS') ? '301' : '101'}`,
      homework: hw,
      test1: t1,
      test2: t2,
      practical: prac,
      quiz: prac,
      caTotal: ca,
      exam: ex,
      total: tot,
      grade,
      remark,
      updatedBy: staff.name,
    });

    setSavingId(null);
    if (success) {
      setSaveSuccessMsg(`Grades synchronized for student.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const handleSaveAllClassScores = async () => {
    setSavingId('ALL');
    let count = 0;
    for (const s of classStudents) {
      const input = scoreInputs[s.id];
      if (input) {
        const hw = input.homework !== '' ? Number(input.homework) : 0;
        const t1 = input.test1 !== '' ? Number(input.test1) : 0;
        const t2 = input.test2 !== '' ? Number(input.test2) : 0;
        const prac = input.practical !== '' ? Number(input.practical) : 0;
        const ex = input.exam !== '' ? Number(input.exam) : 0;

        const ca = computeCaTotal(hw, t1, t2, prac);
        const tot = Math.min(100, ca + ex);
        const { grade, remark } = calculateGrade(tot);

        await onUpdateStudentScore(s.id, {
          name: selectedSubject,
          code: `${selectedSubject.substring(0, 3).toUpperCase()} ${selectedClass.startsWith('SS') ? '301' : '101'}`,
          homework: hw,
          test1: t1,
          test2: t2,
          practical: prac,
          quiz: prac,
          caTotal: ca,
          exam: ex,
          total: tot,
          grade,
          remark,
          updatedBy: staff.name,
        });
        count++;
      }
    }
    setSavingId(null);
    setSaveSuccessMsg(`Successfully saved and synced scores for all ${count} students in ${selectedClass}!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Save Form Master Remark
  const handleSaveRemark = async (studentId: string) => {
    if (!onUpdateStudentRemarks) return;
    setSavingRemarkId(studentId);
    const remark = formMasterRemarks[studentId] || '';
    const success = await onUpdateStudentRemarks(studentId, { formMasterRemark: remark });
    setSavingRemarkId(null);
    if (success) {
      setSaveSuccessMsg(`Form Master conduct remark verified & saved for student.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Staff Executive Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-amber-300 border border-white/20 flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
              {staff.name.replace(/^(Dr\.|Mrs\.|Mr\.|Engr\.|Lady|Barr\.)\s*/, '').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white shadow-xs">
                  Active Faculty Session
                </span>
                <span className="text-xs text-blue-200">
                  {staff.department} Department · {staff.role}
                </span>
                {staff.formMasterOf && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-blue-950" />
                    <span>Form Master: {staff.formMasterOf}</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-title tracking-tight">
                Welcome, {staff.title} {staff.name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/80 mt-1">
                Authorized Continuous Assessment & Examination Grading Console · First Term 2026/2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'grading' && (
              <button
                onClick={handleSaveAllClassScores}
                disabled={savingId === 'ALL'}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingId === 'ALL' ? 'Syncing...' : 'Sync Class Sheet'}</span>
              </button>
            )}
            <button
              onClick={onExit}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Staff Mode</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Staff Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('grading')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'grading'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Continuous Assessment & Exam Grading</span>
        </button>

        <button
          onClick={() => setActiveTab('form_master')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'form_master'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>
            Form Master Oversight {staff.formMasterOf ? `(${staff.formMasterOf})` : ''}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workload')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'workload'
              ? 'bg-blue-950 text-amber-300 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Faculty Workload & Classes</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GRADING CONSOLE                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          {/* Class & Subject Selector Controls Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Class Arm Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Class Arm:
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-800/30"
                  >
                    {SCHOOL_CLASSES_LIST.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} {staff.assignedClasses.includes(cls) ? '★ (Assigned)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Subject Course:
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-800/30"
                  >
                    {ALL_SCHOOL_SUBJECTS.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj} {staff.subjectsTaught.includes(subj) ? '★ (Assigned)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter student name or reg no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800/20"
                />
              </div>
            </div>

            {/* CA Guidance */}
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  <strong>Continuous Assessment Structure:</strong> Homework (10%) + Test 1 (10%) + Test 2 (10%) + Practical/Quiz (10%) = <strong>CA Max 40%</strong>. Exam = <strong>60%</strong>. Total = <strong>100%</strong>.
                </span>
              </div>
              <span className="text-[11px] text-blue-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                {classStudents.length} Students in {selectedClass}
              </span>
            </div>
          </div>

          {/* Grade Entry Table */}
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedClass} · {selectedSubject} Continuous Assessment & Exam Sheet
                </h3>
                <p className="text-xs text-slate-500">
                  Enter individual CA tests and exam scores. WAEC Grade & Remarks calculate automatically.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Print Class Broad Sheet"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-2 text-center w-20">HW (10)</th>
                    <th className="py-3 px-2 text-center w-20">T1 (10)</th>
                    <th className="py-3 px-2 text-center w-20">T2 (10)</th>
                    <th className="py-3 px-2 text-center w-20">Prac (10)</th>
                    <th className="py-3 px-2 text-center w-20 bg-blue-50/50 text-blue-900 font-bold">CA (40)</th>
                    <th className="py-3 px-2 text-center w-24">Exam (60)</th>
                    <th className="py-3 px-2 text-center w-20 bg-amber-50/50 text-amber-900 font-bold">Total</th>
                    <th className="py-3 px-2 text-center w-16">Grade</th>
                    <th className="py-3 px-3">Remark</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const input = scoreInputs[student.id] || { homework: '', test1: '', test2: '', practical: '', exam: '' };
                    const hw = Number(input.homework) || 0;
                    const t1 = Number(input.test1) || 0;
                    const t2 = Number(input.test2) || 0;
                    const prac = Number(input.practical) || 0;
                    const ex = Number(input.exam) || 0;

                    const caTotal = computeCaTotal(hw, t1, t2, prac);
                    const total = Math.min(100, caTotal + ex);
                    const { grade, remark } = calculateGrade(total);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{student.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{student.admissionNo}</span>
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={input.homework}
                            onChange={(e) => handleInputChange(student.id, 'homework', e.target.value)}
                            className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={input.test1}
                            onChange={(e) => handleInputChange(student.id, 'test1', e.target.value)}
                            className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={input.test2}
                            onChange={(e) => handleInputChange(student.id, 'test2', e.target.value)}
                            className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={input.practical}
                            onChange={(e) => handleInputChange(student.id, 'practical', e.target.value)}
                            className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-1 text-center font-mono font-bold text-blue-900 bg-blue-50/30">
                          {caTotal}
                        </td>

                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={input.exam}
                            onChange={(e) => handleInputChange(student.id, 'exam', e.target.value)}
                            className="w-16 text-center py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-950"
                          />
                        </td>

                        <td className="py-2 px-1 text-center font-mono font-black text-slate-900 bg-amber-50/30">
                          {total}
                        </td>

                        <td className="py-2 px-1 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                              ['A1', 'B2', 'B3'].includes(grade)
                                ? 'bg-emerald-100 text-emerald-800'
                                : ['C4', 'C5', 'C6'].includes(grade)
                                ? 'bg-blue-100 text-blue-800'
                                : ['D7', 'E8'].includes(grade)
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {grade}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-slate-600 font-medium">
                          {remark}
                        </td>

                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => handleSaveStudentScore(student.id)}
                            disabled={savingId === student.id}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ml-auto disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingId === student.id ? '...' : 'Save'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FORM MASTER CLASS OVERSIGHT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'form_master' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 block">
                  Form Master Responsibility Console
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-serif-title">
                  {formClass} · Official Class Register & Conduct Evaluation
                </h2>
                <p className="text-xs text-amber-800 mt-0.5">
                  Your conduct endorsements, ratings, and attendance verification print directly onto students' official terminal report cards.
                </p>
              </div>
            </div>
          </div>

          {/* Form Master Students Roll & Conduct Remarks */}
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Class Roll & Conduct Endorsements ({formClassStudents.length} Students)
                </h3>
                <p className="text-xs text-slate-500">
                  Write individual conduct and academic evaluations for terminal report certification.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {formClassStudents.map((student) => (
                <div key={student.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-slate-800 flex items-center justify-center font-mono text-xs">
                        {student.termRank}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{student.name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono">{student.admissionNo}</span>
                          <span>•</span>
                          <span>Term Average: <strong className="text-slate-900 font-mono">{student.termGpa}%</strong></span>
                          <span>•</span>
                          <span>Attendance: <strong className="text-emerald-700 font-mono">{student.attendanceRate}%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveRemark(student.id)}
                        disabled={savingRemarkId === student.id}
                        className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{savingRemarkId === student.id ? 'Saving...' : 'Save Conduct Endorsement'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Master Conduct Remark Box */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Official Form Master Remark (Prints on Terminal Report):
                    </label>
                    <textarea
                      rows={2}
                      value={formMasterRemarks[student.id] || ''}
                      onChange={(e) =>
                        setFormMasterRemarks({ ...formMasterRemarks, [student.id]: e.target.value })
                      }
                      placeholder="Enter official teacher remark on character, academic punctuality, and moral conduct..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800/20"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">Quick Templates:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormMasterRemarks({
                            ...formMasterRemarks,
                            [student.id]: 'An exceptional, highly focused student who demonstrates academic brilliance and moral discipline.',
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                      >
                        Exceptional & Disciplined
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormMasterRemarks({
                            ...formMasterRemarks,
                            [student.id]: 'Good academic performance. Encouraged to maintain consistent discipline in continuous assessments.',
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                      >
                        Consistent & Regular
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormMasterRemarks({
                            ...formMasterRemarks,
                            [student.id]: 'Shows commendable improvement this term. More effort required in homework and terminal revisions.',
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                      >
                        Improvement Observed
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WORKLOAD & ASSIGNMENTS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'workload' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold font-serif-title text-slate-900">
              Official Instructional Workload & Faculty Profile
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Designated institutional assignments authorized by the Directorate of Academic Affairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Overview */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Institutional Standing
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Designated Role:</span>
                  <span className="font-bold text-slate-900">{staff.role}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900">{staff.department}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Form Master Assignment:</span>
                  <span className="font-bold text-amber-900">
                    {staff.formMasterOf || 'None (Subject Tutor)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Official Contact:</span>
                  <span className="font-mono text-slate-800">{staff.email}</span>
                </div>
              </div>
            </div>

            {/* Workload Metrics */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
              <span className="text-[10px] uppercase font-bold text-blue-800 block tracking-wider">
                Authorized Instructional Workload
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Subjects Taught ({staff.subjectsTaught.length}):</span>
                  <div className="flex flex-wrap gap-1">
                    {staff.subjectsTaught.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-950 font-bold text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/60">
                  <span className="text-slate-500 block mb-1">Assigned Classes ({staff.assignedClasses.length}):</span>
                  <div className="flex flex-wrap gap-1">
                    {staff.assignedClasses.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-lg bg-blue-900 text-white font-bold text-xs">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
