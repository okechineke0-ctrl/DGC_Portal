import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  BookOpen,
  Lock,
  Unlock,
  Printer,
  Edit2,
  CheckCircle2,
  UserCheck,
  UserMinus,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Trash2,
  Download,
} from 'lucide-react';
import { SchoolClassDefinition, StudentProfile, StaffMember } from '../types';
import {
  ALL_SCHOOL_SUBJECTS,
  JUNIOR_CURRICULUM,
  SENIOR_SCIENCE_CURRICULUM,
  SENIOR_ART_CURRICULUM,
  SENIOR_COMMERCIAL_CURRICULUM,
  getSubjectCategory,
  getSubjectCode,
} from '../data/mockData';

interface ClassDetailModalProps {
  schoolClass: SchoolClassDefinition;
  students: StudentProfile[];
  staffList: StaffMember[];
  onClose: () => void;
  onAssignFormMaster: (className: string, staffName: string, staffId?: string) => Promise<boolean>;
  onAssignSubjectTeacher: (className: string, subjectName: string, teacherName: string) => Promise<boolean>;
  onUpdateClassCurriculum?: (className: string, subjects: string[], action?: 'add' | 'set' | 'remove') => Promise<boolean>;
  onToggleHoldResult: (studentId: string, hold: boolean, reason?: string) => Promise<boolean>;
  onBatchHoldClass: (classArm: string, hold: boolean, reason?: string) => Promise<boolean>;
  onEditStudent: (student: StudentProfile) => void;
  onPreviewReportCard: (student: StudentProfile) => void;
  onDeleteStudent?: (studentId: string) => Promise<boolean>;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  schoolClass,
  students,
  staffList,
  onClose,
  onAssignFormMaster,
  onAssignSubjectTeacher,
  onUpdateClassCurriculum,
  onToggleHoldResult,
  onBatchHoldClass,
  onEditStudent,
  onPreviewReportCard,
  onDeleteStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'curriculum' | 'broadsheet'>('students');
  const [selectedFormMaster, setSelectedFormMaster] = useState<string>(schoolClass.classMaster);
  const [isUpdatingMaster, setIsUpdatingMaster] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Class students
  const classStudents = students.filter((s) => s.classArm === schoolClass.name);
  const heldCount = classStudents.filter((s) => s.resultHeld).length;
  const clearedCount = classStudents.length - heldCount;
  const avgGpa = classStudents.length > 0
    ? (classStudents.reduce((acc, s) => acc + (s.termGpa || 0), 0) / classStudents.length).toFixed(1)
    : '0.0';

  // Handle Form Master reassignment
  const handleSaveFormMaster = async () => {
    if (!selectedFormMaster || selectedFormMaster === schoolClass.classMaster) return;
    setIsUpdatingMaster(true);
    const matchedStaff = staffList.find((s) => s.name === selectedFormMaster);
    const success = await onAssignFormMaster(schoolClass.name, selectedFormMaster, matchedStaff?.id);
    setIsUpdatingMaster(false);
    if (success) {
      setSuccessNotice(`Form Master for ${schoolClass.name} successfully updated to ${selectedFormMaster}!`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  // Handle Subject Teacher assignment for this class
  const handleTeacherChange = async (subjectName: string, teacherName: string) => {
    const success = await onAssignSubjectTeacher(schoolClass.name, subjectName, teacherName);
    if (success) {
      setSuccessNotice(`Assigned ${teacherName} to teach ${subjectName} in ${schoolClass.name}.`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  // Handle Add Subject to Class Curriculum
  const handleAddSubjectToClass = async (subjectToAdd?: string) => {
    const targetSubject = (subjectToAdd || newSubjectName).trim();
    if (!targetSubject) return;

    if (onUpdateClassCurriculum) {
      await onUpdateClassCurriculum(schoolClass.name, [targetSubject], 'add');
    } else {
      const defaultTeacher = staffList[0]?.name || 'Teacher';
      await onAssignSubjectTeacher(schoolClass.name, targetSubject, defaultTeacher);
    }
    setNewSubjectName('');
    setSuccessNotice(`Added ${targetSubject} to ${schoolClass.name} curriculum and synced students.`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Handle Remove Subject from Class Curriculum
  const handleRemoveSubjectFromClass = async (subjectName: string) => {
    if (onUpdateClassCurriculum) {
      await onUpdateClassCurriculum(schoolClass.name, [subjectName], 'remove');
    }
    await onAssignSubjectTeacher(schoolClass.name, subjectName, 'Unassigned');
    setSuccessNotice(`Removed ${subjectName} from ${schoolClass.name} curriculum.`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Handle Apply Curriculum Preset (e.g. standard junior or senior stream)
  const handleApplyPreset = async (presetName: string, subjects: readonly string[]) => {
    if (onUpdateClassCurriculum) {
      await onUpdateClassCurriculum(schoolClass.name, [...subjects], 'set');
      setSuccessNotice(`Applied ${presetName} (${subjects.length} subjects) to ${schoolClass.name}.`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const filteredClassStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const curriculumList = schoolClass.curriculumSubjects && schoolClass.curriculumSubjects.length > 0
    ? schoolClass.curriculumSubjects
    : ['Mathematics', 'English Language', 'Civic Education', 'Economics'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[94dvh] sm:max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close Hub"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2 pr-8 sm:pr-0">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950">
              Class Command Hub
            </span>
            <span className="text-xs text-blue-200">{schoolClass.stream} Stream · {schoolClass.room}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold font-serif-title">
                {schoolClass.name}
              </h2>
              <p className="text-xs text-blue-200/90 mt-1">
                Enrolled: <strong>{classStudents.length} Students</strong> · Capacity: {schoolClass.capacity} · Class Average GPA: <strong>{avgGpa}%</strong>
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-center flex-1 sm:flex-initial">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Released</span>
                <span className="text-sm font-bold text-white font-mono">{clearedCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-center flex-1 sm:flex-initial">
                <span className="text-[10px] uppercase font-bold text-rose-300 block">Held</span>
                <span className="text-sm font-bold text-white font-mono">{heldCount}</span>
              </div>
            </div>
          </div>

          {/* Subtabs - Scrollable horizontally on small screens */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-white/15 text-xs font-semibold overflow-x-auto no-scrollbar scroll-smooth pb-0.5 -mx-1 px-1">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'students' ? 'bg-white text-blue-950 shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Enrolled Students ({classStudents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'curriculum' ? 'bg-white text-blue-950 shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Curriculum & Subject Teachers ({curriculumList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('broadsheet')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'broadsheet' ? 'bg-white text-blue-950 shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              <span>Class Broadsheet</span>
            </button>
          </div>
        </div>

        {/* Notice Alert */}
        {successNotice && (
          <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-semibold shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {/* Form Master Control Card - Always visible at top */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
                  Designated Form Master
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {schoolClass.classMaster && schoolClass.classMaster !== 'Unassigned'
                    ? schoolClass.classMaster
                    : 'Not Assigned Yet'}
                </span>
                <span className="text-[11px] text-amber-800/80 block">
                  Oversees attendance register, conduct evaluation & terminal report card signing.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedFormMaster}
                onChange={(e) => setSelectedFormMaster(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="Unassigned">-- Select Teacher --</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.title} {staff.name} ({staff.department})
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveFormMaster}
                disabled={isUpdatingMaster || selectedFormMaster === schoolClass.classMaster}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isUpdatingMaster
                  ? 'Updating...'
                  : schoolClass.classMaster && schoolClass.classMaster !== 'Unassigned'
                  ? 'Change Form Master'
                  : 'Make Form Teacher'}
              </button>
              {schoolClass.classMaster && schoolClass.classMaster !== 'Unassigned' && (
                <button
                  onClick={async () => {
                    setIsUpdatingMaster(true);
                    await onAssignFormMaster(schoolClass.name, 'Unassigned');
                    setSelectedFormMaster('Unassigned');
                    setIsUpdatingMaster(false);
                    setSuccessNotice(`Removed Form Master designation from ${schoolClass.name}.`);
                    setTimeout(() => setSuccessNotice(null), 3000);
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Remove Form Master"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: ENROLLED STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Search students by name or admission no..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800/20 w-full sm:w-72"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onBatchHoldClass(schoolClass.name, false)}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    Release All ({schoolClass.name})
                  </button>
                  <button
                    onClick={() => onBatchHoldClass(schoolClass.name, true, `Bursary Hold for ${schoolClass.name}`)}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    Hold All Results
                  </button>
                </div>
              </div>

              {/* Students Display */}
              {filteredClassStudents.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-blue-900">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      {searchStudent ? 'No student found matching search' : `No data yet (0 students enrolled in ${schoolClass.name})`}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {searchStudent ? 'Try searching with a different name or admission number.' : 'Register new students and assign them to this class from the Administration Dashboard.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[640px]">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-3">Adm No</th>
                          <th className="py-3 px-3">Full Name</th>
                          <th className="py-3 px-2 text-center">Gender</th>
                          <th className="py-3 px-2 text-center">Fees</th>
                          <th className="py-3 px-2 text-center">Term GPA</th>
                          <th className="py-3 px-2 text-center">Rank</th>
                          <th className="py-3 px-3 text-center">Result Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredClassStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-800">
                          {student.admissionNo}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{student.name}</span>
                          <span className="text-[10px] text-slate-400">{student.guardianName || 'Parent'}</span>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-600 font-medium">
                          {student.gender}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              student.feeStatus === 'Cleared'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {student.feeStatus}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-900">
                          {student.termGpa}%
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-blue-900">
                          {student.termRank}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {student.resultHeld ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <Lock className="w-3 h-3" />
                              <span>Held</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Unlock className="w-3 h-3" />
                              <span>Released</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onToggleHoldResult(student.id, !student.resultHeld)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                student.resultHeld
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              }`}
                              title={student.resultHeld ? 'Release Result' : 'Hold Result'}
                            >
                              {student.resultHeld ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onPreviewReportCard(student)}
                              className="px-2 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-200 transition-colors"
                              title="Preview Report Card"
                            >
                              Report
                            </button>
                            <button
                              onClick={() => onEditStudent(student)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Edit Student"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteStudent && (
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete ${student.name} from records?`)) {
                                    const success = await onDeleteStudent(student.id);
                                    if (success) {
                                      setSuccessNotice(`Removed ${student.name} from ${schoolClass.name}.`);
                                      setTimeout(() => setSuccessNotice(null), 3000);
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

          {/* TAB 2: CURRICULUM & SUBJECT TEACHER ALLOCATIONS */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              {/* Presets and Rapid Assignment Toolbar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-900" />
                      <span>Class Curriculum & Instructor Allocations · {schoolClass.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Total Active Subjects: <strong>{curriculumList.length}</strong> · Synchronizes real data directly with student report records.
                    </p>
                  </div>

                  {/* Standard Stream Presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {schoolClass.name.startsWith('JSS') ? (
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Junior Secondary Curriculum', JUNIOR_CURRICULUM)}
                        className="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Assign standard 9 Junior Secondary subjects"
                      >
                        ⚡ Apply Junior Curriculum ({JUNIOR_CURRICULUM.length})
                      </button>
                    ) : schoolClass.stream === 'Science' ? (
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Senior Science Curriculum', SENIOR_SCIENCE_CURRICULUM)}
                        className="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Assign standard 9 Senior Science subjects"
                      >
                        ⚡ Apply Science Curriculum ({SENIOR_SCIENCE_CURRICULUM.length})
                      </button>
                    ) : schoolClass.stream === 'Art' ? (
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Senior Art Curriculum', SENIOR_ART_CURRICULUM)}
                        className="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Assign standard 9 Senior Art subjects"
                      >
                        ⚡ Apply Art Curriculum ({SENIOR_ART_CURRICULUM.length})
                      </button>
                    ) : schoolClass.stream === 'Commercial' ? (
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Senior Commercial Curriculum', SENIOR_COMMERCIAL_CURRICULUM)}
                        className="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Assign standard 9 Senior Commercial subjects"
                      >
                        ⚡ Apply Commercial Curriculum ({SENIOR_COMMERCIAL_CURRICULUM.length})
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('Junior Curriculum', JUNIOR_CURRICULUM)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded-md"
                        >
                          Junior Std
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('Senior Science', SENIOR_SCIENCE_CURRICULUM)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded-md"
                        >
                          Senior Science
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Subject Controls: Pick from Catalog or Custom */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
                  {/* Dropdown pick from master catalog */}
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleAddSubjectToClass(e.target.value);
                    }}
                    className="w-full sm:flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 cursor-pointer"
                  >
                    <option value="">+ Select Subject from Catalog to Add...</option>
                    {ALL_SCHOOL_SUBJECTS.filter((s) => !curriculumList.includes(s)).map((subj) => (
                      <option key={subj} value={subj}>
                        {subj} ({getSubjectCode(subj)} · {getSubjectCategory(subj)})
                      </option>
                    ))}
                  </select>

                  {/* Or enter custom subject name */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Or custom subject..."
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubjectToClass()}
                      className="flex-1 sm:w-44 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubjectToClass()}
                      disabled={!newSubjectName.trim()}
                      className="px-3.5 py-1.5 text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-xl disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject Allocations Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[560px]">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-3.5">Code</th>
                        <th className="py-3 px-3.5">Subject Course</th>
                        <th className="py-3 px-3.5">Category</th>
                        <th className="py-3 px-3.5">Assigned Instructor</th>
                        <th className="py-3 px-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {curriculumList.map((subj) => {
                        const assignedTeacher = schoolClass.subjectTeachers?.[subj] || 'Unassigned';
                        const isAssigned = assignedTeacher && assignedTeacher !== 'Unassigned';
                        const code = getSubjectCode(subj);
                        const category = getSubjectCategory(subj);

                        return (
                          <tr key={subj} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-3.5">
                              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {code}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 font-bold text-slate-900">
                              {subj}
                            </td>
                            <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                category === 'Sciences'
                                  ? 'bg-blue-100 text-blue-900'
                                  : category === 'Arts & Humanities'
                                  ? 'bg-purple-100 text-purple-900'
                                  : category === 'Commercial'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {category}
                              </span>
                            </td>
                            <td className="py-3 px-3.5">
                              {isAssigned ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-950 font-bold text-xs border border-emerald-200">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span>{assignedTeacher}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-medium text-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                  <span>No Teacher Assigned</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Teacher Selector */}
                                <select
                                  value={isAssigned ? assignedTeacher : ''}
                                  onChange={(e) => handleTeacherChange(subj, e.target.value)}
                                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer max-w-[150px] truncate"
                                  title="Assign or Change Instructor"
                                >
                                  <option value="">{isAssigned ? assignedTeacher : '+ Assign Teacher'}</option>
                                  {staffList
                                    .filter((st) => st.name !== assignedTeacher)
                                    .map((st) => (
                                      <option key={st.id} value={st.name}>
                                        {st.title} {st.name} ({st.department})
                                      </option>
                                    ))}
                                  {isAssigned && (
                                    <option value="Unassigned">-- Unassign Teacher --</option>
                                  )}
                                </select>

                                {/* Remove Subject from Class */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubjectFromClass(subj)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                                  title={`Remove ${subj} from ${schoolClass.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {/* TAB 3: BROADSHEET */}
          {activeTab === 'broadsheet' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Broad Sheet · {schoolClass.name} (First Term 2026/2027)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Form Master: <strong>{schoolClass.classMaster}</strong> · Enrolled: {classStudents.length} Students
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = [
                        'Rank',
                        'Admission No',
                        'Student Name',
                        'Gender',
                        'Class',
                        'Term GPA (%)',
                        'Attendance Rate (%)',
                        'Result Status',
                        'Fee Status',
                      ];

                      const rows = classStudents.map((s) => [
                        `"${s.termRank || '—'}"`,
                        `"${s.admissionNo}"`,
                        `"${s.name.replace(/"/g, '""')}"`,
                        `"${s.gender || 'N/A'}"`,
                        `"${schoolClass.name}"`,
                        s.termGpa ?? 0,
                        s.attendanceRate ?? 0,
                        `"${s.resultHeld ? 'Held' : 'Cleared'}"`,
                        `"${s.feeStatus || 'Pending'}"`,
                      ].join(','));

                      const csvContent = [headers.join(','), ...rows].join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.setAttribute('href', url);
                      link.setAttribute('download', `Master_Broadsheet_${schoolClass.name.replace(/\s+/g, '_')}_2026.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-blue-900" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Sheet</span>
                  </button>
                </div>
              </div>

              {classStudents.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-blue-900">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      No Broadsheet Data (0 Students in {schoolClass.name})
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No students are currently enrolled in this class arm yet. Register or assign students to view their broad sheet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap min-w-[680px]">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                        <tr>
                          <th className="py-3 px-3">Rank</th>
                          <th className="py-3 px-3">Adm No</th>
                          <th className="py-3 px-3">Student Name</th>
                          <th className="py-3 px-2 text-center">CA (40%)</th>
                          <th className="py-3 px-2 text-center">Exam (60%)</th>
                          <th className="py-3 px-2 text-center">Total (100%)</th>
                          <th className="py-3 px-2 text-center">Term GPA</th>
                          <th className="py-3 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-bold text-blue-900">{s.termRank || '—'}</td>
                            <td className="py-3 px-3 font-mono text-slate-700">{s.admissionNo}</td>
                            <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                            <td className="py-3 px-2 text-center font-mono">
                              {s.subjects[0]?.caTotal ?? '—'}
                            </td>
                            <td className="py-3 px-2 text-center font-mono">
                              {s.subjects[0]?.exam ?? '—'}
                            </td>
                            <td className="py-3 px-2 text-center font-mono font-bold">
                              {s.subjects[0]?.total ?? '—'}
                            </td>
                            <td className="py-3 px-2 text-center font-mono font-bold text-slate-950">
                              {s.termGpa ?? 0}%
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.resultHeld ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {s.resultHeld ? 'Held' : 'Cleared'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Responsive Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800">{schoolClass.name} Hub</span>
            <span className="text-slate-300">·</span>
            <span>{classStudents.length} Students</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
