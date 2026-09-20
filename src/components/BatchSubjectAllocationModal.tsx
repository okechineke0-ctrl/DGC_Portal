import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Square,
  Zap,
  Search,
  Users,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { SchoolClassDefinition, StudentProfile, StaffMember } from '../types';
import {
  SCHOOL_CLASSES_LIST,
  ALL_SCHOOL_SUBJECTS,
  JUNIOR_CURRICULUM,
  SENIOR_SCIENCE_CURRICULUM,
  SENIOR_ART_CURRICULUM,
  SENIOR_COMMERCIAL_CURRICULUM,
  getSubjectCategory,
  getSubjectCode,
} from '../data/mockData';

export interface BatchSubjectAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClassDefinition[];
  students: StudentProfile[];
  staffList: StaffMember[];
  initialSelectedSubject?: string;
  onBatchAssignSubjects: (
    targetClasses: string[],
    subjects: string[],
    mode: 'add' | 'set' | 'remove'
  ) => Promise<boolean>;
}

export const BatchSubjectAllocationModal: React.FC<BatchSubjectAllocationModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  staffList,
  initialSelectedSubject,
  onBatchAssignSubjects,
}) => {
  // Selected subjects to allocate
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialSelectedSubject ? [initialSelectedSubject] : ['English Language', 'Mathematics']
  );

  // Target classes (defaults to all 14 classes)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([...SCHOOL_CLASSES_LIST]);

  // Mode: 'add' (merge & preserve), 'set' (replace), 'remove'
  const [allocationMode, setAllocationMode] = useState<'add' | 'set' | 'remove'>('add');

  // Search & Filters
  const [subjectSearch, setSubjectSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dynamic available categories
  const categories = ['ALL', 'Sciences', 'Arts & Humanities', 'Commercial', 'General', 'Vocational & Tech'];

  // Filtered subject list
  const filteredSubjects = useMemo(() => {
    return ALL_SCHOOL_SUBJECTS.filter((subject) => {
      const matchesSearch =
        subject.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        getSubjectCode(subject).toLowerCase().includes(subjectSearch.toLowerCase());
      const cat = getSubjectCategory(subject);
      const matchesCat = categoryFilter === 'ALL' || cat === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [subjectSearch, categoryFilter]);

  // Total affected students calculation
  const totalAffectedStudents = useMemo(() => {
    return students.filter((s) => selectedClasses.includes(s.classArm)).length;
  }, [students, selectedClasses]);

  if (!isOpen) return null;

  // Toggle single subject selection
  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  // Toggle single class selection
  const toggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  // Preset subject buttons
  const applySubjectPreset = (presetName: string, subjectsList: readonly string[]) => {
    setSelectedSubjects([...subjectsList]);
  };

  // Preset class selectors
  const selectAll14Classes = () => setSelectedClasses([...SCHOOL_CLASSES_LIST]);
  const selectJuniorClasses = () =>
    setSelectedClasses(['JSS 1A', 'JSS 1B', 'JSS 2A', 'JSS 2B', 'JSS 3A', 'JSS 3B']);
  const selectSeniorClasses = () =>
    setSelectedClasses([
      'SS 1A',
      'SS 1B',
      'SS 2 Science',
      'SS 2 Art',
      'SS 2 Commercial',
      'SS 3 Science',
      'SS 3 Art',
      'SS 3 Commercial',
    ]);
  const selectScienceClasses = () => setSelectedClasses(['SS 2 Science', 'SS 3 Science']);
  const selectArtClasses = () => setSelectedClasses(['SS 2 Art', 'SS 3 Art']);
  const selectCommercialClasses = () => setSelectedClasses(['SS 2 Commercial', 'SS 3 Commercial']);
  const clearClasses = () => setSelectedClasses([]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      setErrorMessage('Please select at least one subject to allocate.');
      return;
    }
    if (selectedClasses.length === 0) {
      setErrorMessage('Please select at least one target class arm.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const success = await onBatchAssignSubjects(selectedClasses, selectedSubjects, allocationMode);
      if (success) {
        setSuccessMessage(
          `Successfully ${
            allocationMode === 'add'
              ? 'assigned'
              : allocationMode === 'set'
              ? 'configured'
              : 'removed'
          } ${selectedSubjects.length} subject(s) across ${selectedClasses.length} classes and synchronized ${totalAffectedStudents} student database records.`
        );
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage('Failed to apply subject allocation. Please check server logs and retry.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during database allocation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white relative shrink-0 border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors cursor-pointer border border-slate-700"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block">
                  Academic Board Command Suite
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Firestore Live Sync
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-title tracking-tight text-white mt-0.5">
                Batch Subject Allocation & Class Curriculum Sync
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Assign subjects to all 14 classes simultaneously. Automatically synchronizes real continuous assessment tables for all enrolled students.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: SELECT SUBJECT(S) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  1. Select Subject(s) to Allocate ({selectedSubjects.length} selected)
                </label>
                <p className="text-[11px] text-slate-500">
                  Choose one or multiple curriculum courses to apply to the target classes.
                </p>
              </div>

              {/* Quick Preset Buttons for Subjects */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    applySubjectPreset('Core Compulsory', [
                      'English Language',
                      'Mathematics',
                      'Civic Education',
                      'Data Processing / ICT',
                    ])
                  }
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-bold rounded-lg border border-blue-200 transition-colors"
                >
                  ⚡ Core Compulsory (4)
                </button>
                <button
                  type="button"
                  onClick={() => applySubjectPreset('Junior Curriculum', JUNIOR_CURRICULUM)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-bold rounded-lg border border-blue-200 transition-colors"
                >
                  Junior Std (9)
                </button>
                <button
                  type="button"
                  onClick={() => applySubjectPreset('Senior Science', SENIOR_SCIENCE_CURRICULUM)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-bold rounded-lg border border-blue-200 transition-colors"
                >
                  Senior Sci (9)
                </button>
                <button
                  type="button"
                  onClick={() => applySubjectPreset('Senior Art', SENIOR_ART_CURRICULUM)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-bold rounded-lg border border-blue-200 transition-colors"
                >
                  Senior Art (9)
                </button>
                <button
                  type="button"
                  onClick={() => applySubjectPreset('Senior Commercial', SENIOR_COMMERCIAL_CURRICULUM)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-bold rounded-lg border border-blue-200 transition-colors"
                >
                  Senior Com (9)
                </button>
              </div>
            </div>

            {/* Subject Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder="Filter subjects by name or code (e.g. English, MTH)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50/50">
              {filteredSubjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject);
                const code = getSubjectCode(subject);
                const category = getSubjectCategory(subject);

                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer min-h-[56px] ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-xs leading-tight line-clamp-2">
                        {subject}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-1 text-[10px]">
                      <span
                        className={`font-mono font-bold ${
                          isSelected ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {code}
                      </span>
                      <span
                        className={`text-[9px] px-1 rounded ${
                          isSelected ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: TARGET CLASSES (ALL 14 CLASSES MATRIX) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  2. Select Target Class Arms ({selectedClasses.length} of 14 Classes Selected)
                </label>
                <p className="text-[11px] text-slate-500">
                  Select which classes should have these subjects allocated to their official curriculum.
                </p>
              </div>

              {/* Quick Cohort Selectors */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={selectAll14Classes}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg shadow-xs transition-colors"
                >
                  ✓ All 14 Classes
                </button>
                <button
                  type="button"
                  onClick={selectJuniorClasses}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold rounded-lg transition-colors"
                >
                  6 Junior (JSS 1-3)
                </button>
                <button
                  type="button"
                  onClick={selectSeniorClasses}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold rounded-lg transition-colors"
                >
                  8 Senior (SS 1-3)
                </button>
                <button
                  type="button"
                  onClick={selectScienceClasses}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-medium rounded-lg"
                >
                  Science Arms
                </button>
                <button
                  type="button"
                  onClick={selectArtClasses}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-medium rounded-lg"
                >
                  Art Arms
                </button>
                <button
                  type="button"
                  onClick={selectCommercialClasses}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-medium rounded-lg"
                >
                  Commercial Arms
                </button>
                <button
                  type="button"
                  onClick={clearClasses}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[10px] font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* 14 Classes Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {SCHOOL_CLASSES_LIST.map((className) => {
                const isSelected = selectedClasses.includes(className);
                const classDef = classes.find((c) => c.name === className);
                const classStudentCount = students.filter((s) => s.classArm === className).length;

                return (
                  <button
                    key={className}
                    type="button"
                    onClick={() => toggleClass(className)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs">{className}</span>
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{classStudentCount} stds</span>
                      <span className="text-[9px] font-semibold text-slate-400">
                        {classDef?.stream?.substring(0, 3) || 'Gen'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: ALLOCATION MODE */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              3. Allocation Operation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Add & Preserve */}
              <label
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  allocationMode === 'add'
                    ? 'bg-blue-50/70 border-blue-600 text-blue-950 ring-1 ring-blue-600/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="allocationMode"
                    value="add"
                    checked={allocationMode === 'add'}
                    onChange={() => setAllocationMode('add')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">
                      Add to Class Curriculum (Preserve Existing)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Recommended. Preserves all currently registered subjects and introduces the selected subjects to the classes, creating baseline student report records.
                    </p>
                  </div>
                </div>
              </label>

              {/* Set as Exact */}
              <label
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  allocationMode === 'set'
                    ? 'bg-amber-50/70 border-amber-600 text-amber-950 ring-1 ring-amber-600/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="allocationMode"
                    value="set"
                    checked={allocationMode === 'set'}
                    onChange={() => setAllocationMode('set')}
                    className="mt-0.5 text-amber-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">
                      Set as Exact Class Curriculum
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Replaces the entire curriculum for selected classes with ONLY these selected subjects.
                    </p>
                  </div>
                </div>
              </label>

              {/* Remove */}
              <label
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  allocationMode === 'remove'
                    ? 'bg-rose-50/70 border-rose-600 text-rose-950 ring-1 ring-rose-600/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="allocationMode"
                    value="remove"
                    checked={allocationMode === 'remove'}
                    onChange={() => setAllocationMode('remove')}
                    className="mt-0.5 text-rose-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">
                      Remove from Target Classes
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Unlinks the chosen subjects from the specified classes and trims them from students' current scorecards.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* DYNAMIC IMPACT SUMMARY BANNER */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-xs">
                <span className="font-bold block text-sm">
                  {allocationMode === 'add'
                    ? 'Assign'
                    : allocationMode === 'set'
                    ? 'Reset Curriculum with'
                    : 'Remove'}{' '}
                  {selectedSubjects.length} Subject(s) across {selectedClasses.length} Class(es)
                </span>
                <span className="text-slate-300 text-[11px]">
                  Impacts <strong>{totalAffectedStudents} active students</strong> with instant synchronization to Firestore database.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedSubjects.length === 0 || selectedClasses.length === 0}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[40px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Database Sync...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Allocation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
