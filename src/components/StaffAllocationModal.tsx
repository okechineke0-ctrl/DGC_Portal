import React, { useState } from 'react';
import { X, Check, BookOpen, Layers, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { StaffMember, SchoolClassDefinition } from '../types';
import { ALL_SCHOOL_SUBJECTS, SCHOOL_CLASSES_LIST } from '../data/mockData';

interface StaffAllocationModalProps {
  staff: StaffMember;
  classes: SchoolClassDefinition[];
  onClose: () => void;
  onSave: (allocations: {
    subjectsTaught: string[];
    assignedClasses: string[];
    role: StaffMember['role'];
    formMasterOf?: string;
    formDesignation?: 'Form Master' | 'Form Mistress';
    department: StaffMember['department'];
  }) => Promise<boolean>;
}

export const StaffAllocationModal: React.FC<StaffAllocationModalProps> = ({
  staff,
  classes,
  onClose,
  onSave,
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(staff.subjectsTaught || []);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(staff.assignedClasses || []);
  const [role, setRole] = useState<StaffMember['role']>(staff.role || 'Subject Tutor');
  const [formMasterOf, setFormMasterOf] = useState<string>(staff.formMasterOf || '');
  const [formDesignation, setFormDesignation] = useState<'Form Master' | 'Form Mistress'>(
    staff.formDesignation ||
    (staff.role === 'Form Mistress' || staff.title === 'Mrs.' || staff.title === 'Miss' || staff.title === 'Lady'
      ? 'Form Mistress'
      : 'Form Master')
  );
  const [department, setDepartment] = useState<StaffMember['department']>(staff.department || 'Sciences');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'subjects' | 'classes' | 'roles'>('subjects');

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const toggleClass = (clsName: string) => {
    setSelectedClasses((prev) =>
      prev.includes(clsName) ? prev.filter((c) => c !== clsName) : [...prev, clsName]
    );
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (trimmed && !selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
      setCustomSubject('');
    }
  };

  const handleSelectAllJunior = () => {
    const juniorClasses = SCHOOL_CLASSES_LIST.filter((c) => c.startsWith('JSS'));
    setSelectedClasses((prev) => Array.from(new Set([...prev, ...juniorClasses])));
  };

  const handleSelectAllSenior = () => {
    const seniorClasses = SCHOOL_CLASSES_LIST.filter((c) => c.startsWith('SS'));
    setSelectedClasses((prev) => Array.from(new Set([...prev, ...seniorClasses])));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      subjectsTaught: selectedSubjects,
      assignedClasses: selectedClasses,
      role: formMasterOf ? formDesignation : role,
      formMasterOf: formMasterOf || undefined,
      formDesignation: formMasterOf ? formDesignation : undefined,
      department,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[95dvh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950">
              Staff Allocation
            </span>
            <span className="text-xs text-blue-200">{staff.title} {staff.name}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif-title">
            Staff Teaching & Class Allocation
          </h2>
          <p className="text-xs text-blue-200/90 mt-1">
            Assign curriculum subjects, class arms, and Form Master or Form Mistress appointment.
          </p>

          {/* Subtabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-white/15 text-xs font-semibold overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[36px] ${
                activeTab === 'subjects' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Subjects ({selectedSubjects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[36px] ${
                activeTab === 'classes' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Classes ({selectedClasses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[36px] ${
                activeTab === 'roles' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Form Master & Role</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Assign Subjects to {staff.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select the subjects this teacher will teach and grade on their portal.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
                  {selectedSubjects.length} Selected
                </span>
              </div>

              {/* Subject Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALL_SCHOOL_SUBJECTS.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-xs ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{subject}</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected ? 'bg-blue-900 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Subject */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add custom subject (e.g., Igbo Literature, Music)..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSubject())}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800/20"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
                >
                  Add Subject
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED CLASSES */}
          {activeTab === 'classes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Assign Class Arms to {staff.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Staff member will have grading and roll-call access to selected classes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllJunior}
                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    + All Junior (JSS)
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllSenior}
                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    + All Senior (SS)
                  </button>
                </div>
              </div>

              {/* 14 School Classes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SCHOOL_CLASSES_LIST.map((cls) => {
                  const isSelected = selectedClasses.includes(cls);
                  const isFormClass = formMasterOf === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{cls}</span>
                        {isFormClass && (
                          <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wide">
                            ★ Form Master
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected ? 'bg-amber-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ROLES & FORM MASTER */}
          {activeTab === 'roles' && (
            <div className="space-y-5">
              {/* Form Master / Mistress Assignment Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-bold">Designate as Form Master or Form Mistress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-950">
                      <input
                        type="radio"
                        name="modalFormDesignation"
                        value="Form Master"
                        checked={formDesignation === 'Form Master'}
                        onChange={() => setFormDesignation('Form Master')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Form Master</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-950">
                      <input
                        type="radio"
                        name="modalFormDesignation"
                        value="Form Mistress"
                        checked={formDesignation === 'Form Mistress'}
                        onChange={() => setFormDesignation('Form Mistress')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Form Mistress</span>
                    </label>
                  </div>
                </div>

                <p className="text-xs text-amber-800 leading-relaxed">
                  Assigning a staff member as Form Master or Form Mistress grants them oversight of that class's morning attendance, terminal conduct evaluation, and prints their name on student report cards.
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                    Assigned Form Class:
                  </label>
                  <select
                    value={formMasterOf}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormMasterOf(val);
                      if (val) {
                        setRole(formDesignation);
                        if (!selectedClasses.includes(val)) {
                          setSelectedClasses((prev) => [...prev, val]);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="">-- None (Not a Form Master/Mistress) --</option>
                    {SCHOOL_CLASSES_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c} (Currently: {classes.find((cl) => cl.name === c)?.classMaster || 'Unassigned'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Institutional Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Institutional Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffMember['role'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-800/30"
                  >
                    <option value="Subject Tutor">Subject Tutor</option>
                    <option value="Class Master">Class Master / Form Master</option>
                    <option value="Head of Department">Head of Department (HOD)</option>
                    <option value="Dean of Studies">Dean of Studies</option>
                    <option value="Examination Officer">Examination Officer</option>
                    <option value="Guidance Counselor">Guidance Counselor</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="Principal">Principal</option>
                    <option value="CEO">Chief Executive Officer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Department:
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as StaffMember['department'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-800/30"
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Arts">Arts & Humanities</option>
                    <option value="Commercial">Commercial & Management</option>
                    <option value="General">General Studies</option>
                    <option value="Administration">Administration & Directorate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isSaving ? 'Saving Allocations...' : 'Save & Sync Workload'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
