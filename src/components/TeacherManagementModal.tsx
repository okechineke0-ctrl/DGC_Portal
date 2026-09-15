import React, { useState, useMemo } from 'react';
import {
  X,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Building,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Briefcase,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Phone,
  Mail,
  UserMinus,
  Sparkles,
} from 'lucide-react';
import { StaffMember, SchoolClassDefinition } from '../types';
import { ALL_SCHOOL_SUBJECTS, SCHOOL_CLASSES_LIST } from '../data/mockData';

interface TeacherManagementModalProps {
  staffList: StaffMember[];
  classes: SchoolClassDefinition[];
  onClose: () => void;
  onAddStaff: (staffData: Partial<StaffMember>) => Promise<boolean>;
  onDeleteStaff: (staffId: string) => Promise<boolean>;
  onAssignFormMaster: (className: string, staffName: string, staffId?: string) => Promise<boolean>;
  onAssignStaffAllocations: (
    staffId: string,
    allocations: {
      subjectsTaught?: string[];
      assignedClasses?: string[];
      role?: StaffMember['role'];
      formMasterOf?: string;
      formDesignation?: 'Form Master' | 'Form Mistress';
      department?: StaffMember['department'];
    }
  ) => Promise<boolean>;
  onUpdateStaff?: (staffId: string, updatedData: Partial<StaffMember>) => Promise<boolean>;
}

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  staffList,
  classes,
  onClose,
  onAddStaff,
  onDeleteStaff,
  onAssignFormMaster,
  onAssignStaffAllocations,
  onUpdateStaff,
}) => {
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'FORM_MASTERS' | 'FORM_MISTRESSES' | 'UNASSIGNED'>('ALL');

  // Form State for Adding a New Teacher
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [newTitle, setNewTitle] = useState<'Mr.' | 'Mrs.' | 'Miss' | 'Dr.' | 'Engr.' | 'Lady' | 'Rev.'>('Mr.');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState<StaffMember['department']>('Sciences');
  const [newRole, setNewRole] = useState<StaffMember['role']>('Subject Tutor');
  const [newQualification, setNewQualification] = useState('B.Sc (Ed)');
  const [newFormMasterClass, setNewFormMasterClass] = useState<string>('');
  const [newFormDesignation, setNewFormDesignation] = useState<'Form Master' | 'Form Mistress'>('Form Master');
  const [newAssignedClasses, setNewAssignedClasses] = useState<string[]>([]);
  const [newSubjectsTaught, setNewSubjectsTaught] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Action Modals / In-Place Editors
  const [deletingTeacher, setDeletingTeacher] = useState<StaffMember | null>(null);
  const [editingFormMasterTeacher, setEditingFormMasterTeacher] = useState<StaffMember | null>(null);
  const [selectedFormClass, setSelectedFormClass] = useState<string>('');
  const [selectedFormDesignation, setSelectedFormDesignation] = useState<'Form Master' | 'Form Mistress'>('Form Master');

  const [editingClassesTeacher, setEditingClassesTeacher] = useState<StaffMember | null>(null);
  const [tempAssignedClasses, setTempAssignedClasses] = useState<string[]>([]);

  // Notification Banner State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to determine default designation based on title
  const getAutoDesignation = (title: string): 'Form Master' | 'Form Mistress' => {
    return title === 'Mrs.' || title === 'Miss' || title === 'Lady' ? 'Form Mistress' : 'Form Master';
  };

  // Update designation when title changes
  const handleTitleChange = (title: 'Mr.' | 'Mrs.' | 'Miss' | 'Dr.' | 'Engr.' | 'Lady' | 'Rev.') => {
    setNewTitle(title);
    setNewFormDesignation(getAutoDesignation(title));
  };

  // Auto-generate suggested email
  const handleNameChange = (name: string) => {
    setNewName(name);
    if (!newEmail || newEmail.includes('@dgc.edu.ng')) {
      const sanitized = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
      setNewEmail(sanitized ? `${sanitized}@dgc.edu.ng` : '');
    }
  };

  // Toggle class in Add form
  const toggleNewClass = (className: string) => {
    setNewAssignedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  // Toggle subject in Add form
  const toggleNewSubject = (subject: string) => {
    setNewSubjectsTaught((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (trimmed && !newSubjectsTaught.includes(trimmed)) {
      setNewSubjectsTaught((prev) => [...prev, trimmed]);
      setCustomSubject('');
    }
  };

  // Handle Add Teacher Submit
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showNotification('Please enter the teacher full name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine effective classes (include form class if assigned)
      let finalAssignedClasses = [...newAssignedClasses];
      if (newFormMasterClass && !finalAssignedClasses.includes(newFormMasterClass)) {
        finalAssignedClasses.push(newFormMasterClass);
      }

      const effectiveRole: StaffMember['role'] = newFormMasterClass
        ? newFormDesignation
        : newRole;

      const teacherData: Partial<StaffMember> = {
        title: newTitle,
        name: newName.trim(),
        email: newEmail.trim() || `${newName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@dgc.edu.ng`,
        phone: newPhone.trim() || '+234 800 000 0000',
        department: newDepartment,
        role: effectiveRole,
        qualification: newQualification.trim() || 'B.Sc (Ed)',
        assignedClasses: finalAssignedClasses,
        subjectsTaught: newSubjectsTaught.length > 0 ? newSubjectsTaught : ['General Studies'],
        formMasterOf: newFormMasterClass || undefined,
        formDesignation: newFormMasterClass ? newFormDesignation : undefined,
      };

      const success = await onAddStaff(teacherData);
      if (success) {
        // If assigned as Form Master / Mistress, also ensure class master is updated
        if (newFormMasterClass) {
          await onAssignFormMaster(newFormMasterClass, newName.trim());
        }

        showNotification(`Successfully added ${newTitle} ${newName.trim()} to the teaching staff.`);
        // Reset form
        setIsAddingTeacher(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewAssignedClasses([]);
        setNewSubjectsTaught([]);
        setNewFormMasterClass('');
      } else {
        showNotification('Failed to add teacher. Please try again.', 'error');
      }
    } catch {
      showNotification('An unexpected error occurred while adding the teacher.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Teacher Deletion
  const handleConfirmDelete = async () => {
    if (!deletingTeacher) return;
    setIsSubmitting(true);
    try {
      const success = await onDeleteStaff(deletingTeacher.id);
      if (success) {
        showNotification(`Deleted teacher record for ${deletingTeacher.title} ${deletingTeacher.name}.`);
        setDeletingTeacher(null);
      } else {
        showNotification('Failed to delete teacher.', 'error');
      }
    } catch {
      showNotification('Error deleting teacher.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Form Master / Mistress Assignment for a teacher
  const openFormMasterModal = (teacher: StaffMember) => {
    setEditingFormMasterTeacher(teacher);
    setSelectedFormClass(teacher.formMasterOf || '');
    setSelectedFormDesignation(
      teacher.formDesignation ||
      (teacher.role === 'Form Mistress' ? 'Form Mistress' : getAutoDesignation(teacher.title))
    );
  };

  // Save Form Master / Mistress Assignment
  const handleSaveFormMaster = async () => {
    if (!editingFormMasterTeacher) return;
    setIsSubmitting(true);
    try {
      const previousClass = editingFormMasterTeacher.formMasterOf;
      const newClass = selectedFormClass;

      if (!newClass || newClass === 'Unassigned') {
        // Remove Form Master role
        if (previousClass) {
          await onAssignFormMaster(previousClass, 'Unassigned');
        }
        await onAssignStaffAllocations(editingFormMasterTeacher.id, {
          formMasterOf: undefined,
          role: editingFormMasterTeacher.role === 'Form Master' || editingFormMasterTeacher.role === 'Form Mistress' || editingFormMasterTeacher.role === 'Class Master'
            ? 'Subject Tutor'
            : editingFormMasterTeacher.role,
        });
        showNotification(`Removed Form Master/Mistress designation for ${editingFormMasterTeacher.name}.`);
      } else {
        // Assign to new class
        if (previousClass && previousClass !== newClass) {
          await onAssignFormMaster(previousClass, 'Unassigned');
        }
        await onAssignFormMaster(newClass, editingFormMasterTeacher.name, editingFormMasterTeacher.id);
        await onAssignStaffAllocations(editingFormMasterTeacher.id, {
          formMasterOf: newClass,
          formDesignation: selectedFormDesignation,
          role: selectedFormDesignation,
          assignedClasses: editingFormMasterTeacher.assignedClasses.includes(newClass)
            ? editingFormMasterTeacher.assignedClasses
            : [...editingFormMasterTeacher.assignedClasses, newClass],
        });
        showNotification(`Assigned ${editingFormMasterTeacher.title} ${editingFormMasterTeacher.name} as ${selectedFormDesignation} for ${newClass}.`);
      }
      setEditingFormMasterTeacher(null);
    } catch {
      showNotification('Failed to update Form Master/Mistress assignment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Class Assignment for a teacher
  const openClassesModal = (teacher: StaffMember) => {
    setEditingClassesTeacher(teacher);
    setTempAssignedClasses([...(teacher.assignedClasses || [])]);
  };

  // Toggle class in quick class editor
  const toggleTempClass = (className: string) => {
    setTempAssignedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  // Save Assigned Classes
  const handleSaveClasses = async () => {
    if (!editingClassesTeacher) return;
    setIsSubmitting(true);
    try {
      await onAssignStaffAllocations(editingClassesTeacher.id, {
        assignedClasses: tempAssignedClasses,
      });
      showNotification(`Updated assigned classes for ${editingClassesTeacher.name} (${tempAssignedClasses.length} classes).`);
      setEditingClassesTeacher(null);
    } catch {
      showNotification('Failed to update assigned classes.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered teachers list
  const filteredStaff = useMemo(() => {
    return staffList.filter((st) => {
      // Dept filter
      if (deptFilter !== 'ALL' && st.department !== deptFilter) return false;

      // Assignment filter
      const isMaster = st.formDesignation === 'Form Master' || st.role === 'Form Master';
      const isMistress = st.formDesignation === 'Form Mistress' || st.role === 'Form Mistress';
      const hasFormClass = Boolean(st.formMasterOf);

      if (assignmentFilter === 'FORM_MASTERS' && (!hasFormClass || !isMaster)) return false;
      if (assignmentFilter === 'FORM_MISTRESSES' && (!hasFormClass || !isMistress)) return false;
      if (assignmentFilter === 'UNASSIGNED' && hasFormClass) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        st.name.toLowerCase().includes(q) ||
        st.title.toLowerCase().includes(q) ||
        st.department.toLowerCase().includes(q) ||
        st.role.toLowerCase().includes(q) ||
        (st.formMasterOf && st.formMasterOf.toLowerCase().includes(q)) ||
        (st.qualification && st.qualification.toLowerCase().includes(q)) ||
        st.subjectsTaught.some((sub) => sub.toLowerCase().includes(q)) ||
        st.assignedClasses.some((cls) => cls.toLowerCase().includes(q))
      );
    });
  }, [staffList, deptFilter, assignmentFilter, searchQuery]);

  // High-level statistics
  const totalTeachers = staffList.length;
  const formMastersCount = staffList.filter(
    (s) => s.formMasterOf && (s.formDesignation === 'Form Master' || s.role === 'Form Master' || (!s.formDesignation && !s.title.includes('Mrs') && !s.title.includes('Miss')))
  ).length;
  const formMistressesCount = staffList.filter(
    (s) => s.formMasterOf && (s.formDesignation === 'Form Mistress' || s.role === 'Form Mistress' || s.title.includes('Mrs') || s.title.includes('Miss') || s.title.includes('Lady'))
  ).length;
  const assignedClassesCount = classes.filter((c) => c.classMaster && c.classMaster !== 'Unassigned').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        id="teacher-management-modal"
      >
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950 shadow-xs">
              Academic Administration
            </span>
            <span className="text-xs text-blue-200 font-semibold">
              Dominion Stars Global College
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif-title flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-amber-300 shrink-0" />
            <span>Teachers Directory, Classes & Form Master/Mistress Command</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-200/90 mt-1">
            Add new teachers, delete staff records, assign secondary school classes, and appoint Form Masters or Form Mistresses for all 14 class arms.
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-white/15 text-xs">
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="text-[10px] text-blue-200 block uppercase font-bold">Total Teachers</span>
              <span className="font-mono font-bold text-lg text-white">{totalTeachers}</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="text-[10px] text-blue-200 block uppercase font-bold">Form Masters</span>
              <span className="font-mono font-bold text-lg text-amber-300">{formMastersCount} Appointed</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="text-[10px] text-blue-200 block uppercase font-bold">Form Mistresses</span>
              <span className="font-mono font-bold text-lg text-amber-300">{formMistressesCount} Appointed</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="text-[10px] text-blue-200 block uppercase font-bold">Classes Assigned</span>
              <span className="font-mono font-bold text-lg text-emerald-300">
                {assignedClassesCount} / {classes.length}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NOTIFICATION BANNER                                                       */}
        {/* ========================================================================= */}
        {notification && (
          <div
            className={`px-5 py-2.5 flex items-center justify-between text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-b border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL CONTROLS: ACTION BUTTON & FILTERS                                   */}
        {/* ========================================================================= */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddingTeacher(!isAddingTeacher)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                isAddingTeacher
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-blue-950 text-amber-300 hover:bg-blue-900'
              }`}
              id="toggle-add-teacher-form"
            >
              {isAddingTeacher ? <ChevronUp className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isAddingTeacher ? 'Hide Add Teacher Form' : '+ Add New Teacher'}</span>
            </button>

            <span className="text-xs text-slate-400 hidden sm:inline-block">|</span>
            <span className="text-xs text-slate-600 font-semibold hidden sm:inline-block">
              {filteredStaff.length} {filteredStaff.length === 1 ? 'Teacher' : 'Teachers'} Listed
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search teacher, class, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              <option value="Sciences">Sciences</option>
              <option value="Arts">Arts</option>
              <option value="Commercial">Commercial</option>
              <option value="General">General</option>
              <option value="Administration">Administration</option>
            </select>

            {/* Form Master / Mistress Filter */}
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Roles</option>
              <option value="FORM_MASTERS">Form Masters Only</option>
              <option value="FORM_MISTRESSES">Form Mistresses Only</option>
              <option value="UNASSIGNED">No Form Class</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLLAPSIBLE ADD TEACHER FORM (Add + Assign Classes + Form Master/Mistress)*/}
        {/* ========================================================================= */}
        {isAddingTeacher && (
          <form
            onSubmit={handleCreateTeacher}
            className="p-5 bg-blue-50/50 border-b border-blue-200 space-y-4 animate-in slide-in-from-top duration-200 max-h-[60vh] overflow-y-auto"
            id="add-teacher-full-form"
          >
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>Register New Teacher & Assign Classes / Form Master or Mistress</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingTeacher(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Close Form
              </button>
            </div>

            {/* Row 1: Title, Name, Qualification, Department, Role */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Title *</label>
                <select
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Engr.">Engr.</option>
                  <option value="Lady">Lady</option>
                  <option value="Rev.">Rev.</option>
                </select>
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenneth Okoli"
                  value={newName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc (Ed)"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Department *</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold"
                >
                  <option value="Sciences">Sciences</option>
                  <option value="Arts">Arts</option>
                  <option value="Commercial">Commercial</option>
                  <option value="General">General</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Primary Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold"
                >
                  <option value="Subject Tutor">Subject Tutor</option>
                  <option value="Form Master">Form Master</option>
                  <option value="Form Mistress">Form Mistress</option>
                  <option value="Head of Department">HOD</option>
                  <option value="Dean of Studies">Dean of Studies</option>
                  <option value="Examination Officer">Exam Officer</option>
                </select>
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Official Email Address</label>
                <input
                  type="email"
                  placeholder="teacher@dgc.edu.ng"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Official Contact Phone</label>
                <input
                  type="text"
                  placeholder="+234 803 000 0000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
            </div>

            {/* Row 3: Direct Form Master or Form Mistress Assignment Box */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-amber-900 text-xs">
                    Appoint as Form Master or Form Mistress of a Class Arm
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-950">
                    <input
                      type="radio"
                      name="formDesignation"
                      value="Form Master"
                      checked={newFormDesignation === 'Form Master'}
                      onChange={() => setNewFormDesignation('Form Master')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Form Master</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-950">
                    <input
                      type="radio"
                      name="formDesignation"
                      value="Form Mistress"
                      checked={newFormDesignation === 'Form Mistress'}
                      onChange={() => setNewFormDesignation('Form Mistress')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Form Mistress</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-amber-900 block">
                    Designated Class Arm:
                  </label>
                  <select
                    value={newFormMasterClass}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewFormMasterClass(val);
                      if (val && !newAssignedClasses.includes(val)) {
                        setNewAssignedClasses((prev) => [...prev, val]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-hidden"
                  >
                    <option value="">-- None (Subject Tutor Only) --</option>
                    {SCHOOL_CLASSES_LIST.map((clsName) => {
                      const currentHolder = classes.find((c) => c.name === clsName)?.classMaster;
                      return (
                        <option key={clsName} value={clsName}>
                          {clsName} {currentHolder && currentHolder !== 'Unassigned' ? `(Current: ${currentHolder})` : '(Vacant)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="text-[11px] text-amber-800 flex items-center pt-2 sm:pt-4">
                  {newFormMasterClass ? (
                    <span className="font-semibold">
                      Will be appointed as <strong>{newFormDesignation}</strong> for {newFormMasterClass}. Their signature will appear on terminal report cards.
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">
                      Select a class above if this teacher is the designated Form Master / Mistress.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: Assign Secondary School Classes (All 14 Arms) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 text-xs block">
                  Assign Classes ({newAssignedClasses.length} selected):
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      const junior = SCHOOL_CLASSES_LIST.filter((c) => c.startsWith('JSS'));
                      setNewAssignedClasses((prev) => Array.from(new Set([...prev, ...junior])));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-900 font-bold hover:bg-blue-200"
                  >
                    + All Junior (JSS 1-3)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const senior = SCHOOL_CLASSES_LIST.filter((c) => c.startsWith('SS'));
                      setNewAssignedClasses((prev) => Array.from(new Set([...prev, ...senior])));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-900 font-bold hover:bg-purple-200"
                  >
                    + All Senior (SS 1-3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAssignedClasses([])}
                    className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                {SCHOOL_CLASSES_LIST.map((clsName) => {
                  const isSelected = newAssignedClasses.includes(clsName);
                  const isFormClass = newFormMasterClass === clsName;
                  return (
                    <button
                      key={clsName}
                      type="button"
                      onClick={() => toggleNewClass(clsName)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{clsName}</span>
                      {isFormClass && (
                        <span className="text-[10px] text-amber-300 font-black">★</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 5: Subjects Taught */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 text-xs block">
                Assign Subjects Taught ({newSubjectsTaught.length} selected):
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                {ALL_SCHOOL_SUBJECTS.map((sub) => {
                  const isSelected = newSubjectsTaught.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleNewSubject(sub)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-amber-400 text-blue-950 font-bold border border-amber-500'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom subject (e.g. French, Technical Drawing)..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSubject();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
                >
                  Add Subject
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-3 border-t border-blue-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddingTeacher(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Teacher...' : 'Save & Register Teacher'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* MAIN BODY: TEACHERS ROSTER WITH IN-PLACE EDIT & DELETE                    */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Teacher Profile</th>
                  <th className="py-3 px-3">Department & Role</th>
                  <th className="py-3 px-3">Form Master / Mistress</th>
                  <th className="py-3 px-3">Assigned Classes</th>
                  <th className="py-3 px-3">Subjects Taught</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => {
                  const isFormAssigned = Boolean(staff.formMasterOf);
                  const designation =
                    staff.formDesignation ||
                    (staff.role === 'Form Mistress'
                      ? 'Form Mistress'
                      : staff.title === 'Mrs.' || staff.title === 'Miss' || staff.title === 'Lady'
                      ? 'Form Mistress'
                      : 'Form Master');

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Teacher Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-950 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {staff.name
                              .replace(/^(Dr\.|Mrs\.|Mr\.|Miss|Engr\.|Lady|Rev\.|Barr\.)\s*/i, '')
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {staff.title} {staff.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-medium text-slate-600">{staff.qualification || 'B.Sc (Ed)'}</span>
                              <span>·</span>
                              <span className="truncate max-w-[130px]">{staff.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block text-xs">{staff.role}</span>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 mt-0.5">
                          {staff.department} Dept
                        </span>
                      </td>

                      {/* Form Master / Mistress Column */}
                      <td className="py-3 px-3">
                        {isFormAssigned ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>{designation}: <strong>{staff.formMasterOf}</strong></span>
                            </span>
                            <div>
                              <button
                                onClick={() => openFormMasterModal(staff)}
                                className="text-[10px] font-bold text-blue-900 hover:text-blue-950 hover:underline"
                              >
                                Change or Reassign
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <button
                              onClick={() => openFormMasterModal(staff)}
                              className="px-2.5 py-1 rounded-lg border border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 text-slate-600 hover:text-amber-900 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3 text-amber-600" />
                              <span>Assign Form Master/Mistress</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Assigned Classes */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {staff.assignedClasses && staff.assignedClasses.length > 0 ? (
                              staff.assignedClasses.slice(0, 3).map((cls) => (
                                <span
                                  key={cls}
                                  className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200"
                                >
                                  {cls}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">No classes</span>
                            )}
                            {staff.assignedClasses && staff.assignedClasses.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-bold self-center">
                                +{staff.assignedClasses.length - 3}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => openClassesModal(staff)}
                            className="text-[10px] font-bold text-blue-900 hover:underline block"
                          >
                            Edit Classes ({staff.assignedClasses?.length || 0})
                          </button>
                        </div>
                      </td>

                      {/* Subjects Taught */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {staff.subjectsTaught && staff.subjectsTaught.length > 0 ? (
                            staff.subjectsTaught.slice(0, 2).map((sub) => (
                              <span
                                key={sub}
                                className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-medium"
                              >
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">None</span>
                          )}
                          {staff.subjectsTaught && staff.subjectsTaught.length > 2 && (
                            <span className="text-[10px] text-slate-500 font-bold self-center">
                              +{staff.subjectsTaught.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions: Assign Workload & Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openFormMasterModal(staff)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                            title="Assign Form Master or Mistress"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-950" />
                            <span className="hidden sm:inline">Form Role</span>
                          </button>

                          <button
                            onClick={() => openClassesModal(staff)}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-[11px] border border-blue-200 transition-colors flex items-center gap-1"
                            title="Assign Classes"
                          >
                            <Layers className="w-3.5 h-3.5 text-blue-800" />
                            <span className="hidden sm:inline">Classes</span>
                          </button>

                          <button
                            onClick={() => setDeletingTeacher(staff)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-sm text-slate-600">No teachers found matching criteria</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your search query or department/role filter, or click "+ Add New Teacher" above.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER                                                              */}
        {/* ========================================================================= */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold">
            Secondary School Academic Governance · Dominion Stars Global College
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-blue-950 text-white font-bold rounded-xl transition-colors"
          >
            Close Teachers Hub
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL 1: CONFIRM DELETE TEACHER                                       */}
      {/* ========================================================================= */}
      {deletingTeacher && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeletingTeacher(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-700 font-bold text-base">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3>Delete Teacher Record</h3>
                <span className="text-xs font-normal text-slate-500">Irreversible administrative action</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deletingTeacher.title} {deletingTeacher.name}</strong> from the Dominion Stars teaching staff?
            </p>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-1 text-xs text-rose-900">
              <span className="font-bold block">Consequences of Deletion:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-800">
                {deletingTeacher.formMasterOf && (
                  <li>
                    Revokes <strong>Form Master/Mistress</strong> appointment for {deletingTeacher.formMasterOf} (will be marked Unassigned).
                  </li>
                )}
                <li>Removes teacher from all {deletingTeacher.assignedClasses?.length || 0} assigned classes.</li>
                <li>Unassigns teacher from subject allocations in the central timetable.</li>
                <li>Deactivates portal credentials for {deletingTeacher.email}.</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setDeletingTeacher(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL 2: ASSIGN FORM MASTER OR FORM MISTRESS                          */}
      {/* ========================================================================= */}
      {editingFormMasterTeacher && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setEditingFormMasterTeacher(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Assign Form Master / Form Mistress</span>
              </div>
              <button
                onClick={() => setEditingFormMasterTeacher(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Teacher: {editingFormMasterTeacher.title} {editingFormMasterTeacher.name}
              </span>
              <span className="text-[11px] text-slate-500">
                Department: {editingFormMasterTeacher.department} · Current Class: {editingFormMasterTeacher.formMasterOf || 'None'}
              </span>
            </div>

            {/* Designation Selector: Form Master vs Form Mistress */}
            <div className="space-y-1.5 p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs">
              <label className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                Official Appointment Designation:
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                  <input
                    type="radio"
                    name="modalFormDesignation"
                    value="Form Master"
                    checked={selectedFormDesignation === 'Form Master'}
                    onChange={() => setSelectedFormDesignation('Form Master')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Form Master</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                  <input
                    type="radio"
                    name="modalFormDesignation"
                    value="Form Mistress"
                    checked={selectedFormDesignation === 'Form Mistress'}
                    onChange={() => setSelectedFormDesignation('Form Mistress')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Form Mistress</span>
                </label>
              </div>
            </div>

            {/* Class Arm Selector */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">
                Designate Class Arm to Lead:
              </label>
              <select
                value={selectedFormClass}
                onChange={(e) => setSelectedFormClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:outline-hidden"
              >
                <option value="">-- Remove / No Form Class (Subject Tutor Only) --</option>
                {SCHOOL_CLASSES_LIST.map((clsName) => {
                  const currentMaster = classes.find((c) => c.name === clsName)?.classMaster;
                  const isCurrent = editingFormMasterTeacher.formMasterOf === clsName;
                  return (
                    <option key={clsName} value={clsName}>
                      {clsName} {isCurrent ? '★ (Currently Assigned to This Teacher)' : currentMaster && currentMaster !== 'Unassigned' ? `(Current: ${currentMaster})` : '(Vacant)'}
                    </option>
                  );
                })}
              </select>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Form Masters and Form Mistresses are responsible for daily student attendance, conduct remarks, and certifying terminal broadsheets and report cards for their class arm.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setEditingFormMasterTeacher(null)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFormMaster}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Form Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL 3: ASSIGN CLASSES (ALL 14 CLASSES PICKER)                       */}
      {/* ========================================================================= */}
      {editingClassesTeacher && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setEditingClassesTeacher(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                <Layers className="w-5 h-5 text-blue-800" />
                <span>Assign Classes to {editingClassesTeacher.title} {editingClassesTeacher.name}</span>
              </div>
              <button
                onClick={() => setEditingClassesTeacher(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">
                Select the class arms this teacher instructs: ({tempAssignedClasses.length} selected)
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const junior = SCHOOL_CLASSES_LIST.filter((c) => c.startsWith('JSS'));
                    setTempAssignedClasses((prev) => Array.from(new Set([...prev, ...junior])));
                  }}
                  className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-900 font-bold hover:bg-blue-200"
                >
                  All Junior
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const senior = SCHOOL_CLASSES_LIST.filter((c) => c.startsWith('SS'));
                    setTempAssignedClasses((prev) => Array.from(new Set([...prev, ...senior])));
                  }}
                  className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-900 font-bold hover:bg-purple-200"
                >
                  All Senior
                </button>
                <button
                  type="button"
                  onClick={() => setTempAssignedClasses([])}
                  className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* 14 Classes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1 text-xs">
              {SCHOOL_CLASSES_LIST.map((clsName) => {
                const isSelected = tempAssignedClasses.includes(clsName);
                const isFormOf = editingClassesTeacher.formMasterOf === clsName;
                return (
                  <button
                    key={clsName}
                    type="button"
                    onClick={() => toggleTempClass(clsName)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-950 text-white border-blue-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span>{clsName}</span>
                      {isFormOf && (
                        <span className="text-[10px] text-amber-300 block font-extrabold">
                          ★ Form Class
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-amber-400 text-blue-950' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setEditingClassesTeacher(null)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClasses}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-amber-300 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Assigned Classes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
