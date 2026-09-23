import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  Building,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Landmark,
  Download,
} from 'lucide-react';
import { StudentProfile, SchoolClassDefinition, FeeItem, CollegeFeeSchedule } from '../types';
import { formatStudentShortName } from '../utils/formatters';
import { BursaryReceiptModal } from './BursaryReceiptModal';

interface SchoolFeesManagementProps {
  students: StudentProfile[];
  classes: SchoolClassDefinition[];
  onUpdateStudentFeeStatus?: (
    studentId: string,
    feeStatus: 'Cleared' | 'Pending',
    amountPaid?: number,
    remarks?: string
  ) => Promise<boolean>;
  onBulkUpdateStudentFeeStatus?: (
    studentIds: string[] | null,
    classArm: string | null,
    feeStatus: 'Cleared' | 'Pending'
  ) => Promise<boolean>;
  onRefreshData?: () => void;
}

const DEFAULT_SCHEDULE: CollegeFeeSchedule = {
  id: 'current_schedule',
  session: '2026/2027',
  term: 'First Term',
  baseSchoolFee: 85000,
  items: [
    {
      id: 'fee-tuition',
      name: 'Base Tuition & Academic Instruction',
      amount: 85000,
      category: 'Tuition',
      applicableLevel: 'All',
      description: 'Approved statutory secondary curriculum instruction & scheme of work',
      isMandatory: true,
    },
    {
      id: 'fee-project',
      name: 'Student Term Project & Vocational Exhibition',
      amount: 15000,
      category: 'Project',
      applicableLevel: 'All',
      description: 'Continuous assessment projects, practical workshops, and exhibition portfolios',
      isMandatory: true,
    },
    {
      id: 'fee-science-lab',
      name: 'Science Laboratory Reagents & Practical Levy',
      amount: 15000,
      category: 'Laboratory',
      applicableLevel: 'All',
      description: 'Physics, Chemistry, Biology and Agricultural science laboratory equipment and consumables',
      isMandatory: false,
    },
    {
      id: 'fee-ict',
      name: 'ICT, Computer Lab & Portal Maintenance',
      amount: 10000,
      category: 'General',
      applicableLevel: 'All',
      description: 'Campus internet infrastructure, computer laboratory sessions, and student portal server hosting',
      isMandatory: true,
    },
    {
      id: 'fee-dev',
      name: 'Campus Development & Sports Facilities Levy',
      amount: 25000,
      category: 'Development',
      applicableLevel: 'All',
      description: 'Institutional facilities expansion, library resources, and sports arena maintenance',
      isMandatory: false,
    },
    {
      id: 'fee-pta',
      name: 'Parents-Teachers Association (PTA) Term Levy',
      amount: 5000,
      category: 'General',
      applicableLevel: 'All',
      description: 'Approved statutory PTA welfare levy for student support and institutional development',
      isMandatory: true,
    },
  ],
  totalFee: 155000,
  bankName: 'First Bank of Nigeria',
  accountNumber: '3128940022',
  accountName: 'Dominion Star Global College Bursary Account',
  paymentInstructions: 'Payment should be made through direct bank deposit or electronic bank transfer into the official Bursary account. Quote student registration number as payment narration.',
  updatedAt: new Date().toISOString(),
  updatedBy: 'College Administrator / Bursar',
};

export const SchoolFeesManagement: React.FC<SchoolFeesManagementProps> = ({
  students,
  classes,
  onUpdateStudentFeeStatus,
  onBulkUpdateStudentFeeStatus,
  onRefreshData,
}) => {
  // Fee Schedule State
  const [feeSchedule, setFeeSchedule] = useState<CollegeFeeSchedule>(DEFAULT_SCHEDULE);
  const [baseSchoolFeeInput, setBaseSchoolFeeInput] = useState<number>(85000);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [isScheduleSaving, setIsScheduleSaving] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // New Fee Item Form
  const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState<number>(10000);
  const [newFeeCategory, setNewFeeCategory] = useState<'Project' | 'Laboratory' | 'Development' | 'Tuition' | 'General'>('Project');
  const [newFeeLevel, setNewFeeLevel] = useState<'All' | 'Junior' | 'Senior'>('All');
  const [newFeeDescription, setNewFeeDescription] = useState('');

  // Bank Account Settings
  const [bankName, setBankName] = useState('First Bank of Nigeria');
  const [accountNumber, setAccountNumber] = useState('3128940022');
  const [accountName, setAccountName] = useState('Dominion Star Global College Bursary Account');
  const [isBankEditing, setIsBankEditing] = useState(false);

  // Whole Student Filter & Search
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'NOT_PAID'>('ALL');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Bursary Receipt & Custom Payment Modals
  const [selectedReceiptStudent, setSelectedReceiptStudent] = useState<StudentProfile | null>(null);
  const [selectedPaymentStudent, setSelectedPaymentStudent] = useState<StudentProfile | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'POS' | 'Cheque'>('Bank Transfer');
  const [paymentRefInput, setPaymentRefInput] = useState<string>('');
  const [paymentRemarksInput, setPaymentRemarksInput] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);

  // Quick keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchEl = document.getElementById('fees-student-search-input');
        if (searchEl) {
          searchEl.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Fee Schedule from server on mount
  useEffect(() => {
    fetchFeeSchedule();
  }, []);

  const fetchFeeSchedule = async () => {
    setIsScheduleLoading(true);
    try {
      const res = await fetch('/api/fees/schedule');
      if (res.ok) {
        const data = await res.json();
        if (data && data.schedule) {
          setFeeSchedule(data.schedule);
          setBaseSchoolFeeInput(data.schedule.baseSchoolFee || 85000);
          setBankName(data.schedule.bankName || 'First Bank of Nigeria');
          setAccountNumber(data.schedule.accountNumber || '3128940022');
          setAccountName(data.schedule.accountName || 'Dominion Star Global College Bursary Account');
        }
      }
    } catch {
      // Keep baseline
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  // Update Base School Fee
  const handleSaveBaseFee = async () => {
    const updatedItems = feeSchedule.items.map((it) => {
      if (it.id === 'fee-tuition' || it.category === 'Tuition') {
        return { ...it, amount: Number(baseSchoolFeeInput) || 0 };
      }
      return it;
    });

    const newTotal = updatedItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    const updatedSchedule: CollegeFeeSchedule = {
      ...feeSchedule,
      baseSchoolFee: Number(baseSchoolFeeInput) || 0,
      items: updatedItems,
      totalFee: newTotal,
      bankName,
      accountNumber,
      accountName,
      updatedAt: new Date().toISOString(),
      updatedBy: 'College Administrator',
    };

    setFeeSchedule(updatedSchedule);
    await persistFeeSchedule(updatedSchedule);
    showToast(`Base School Fee set to ₦${(Number(baseSchoolFeeInput) || 0).toLocaleString()}. Total fee: ₦${newTotal.toLocaleString()}`);
  };

  // Add Other / Custom Fee (e.g. Project Fee, Practical Fee, etc.)
  const handleAddNewFeeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeName.trim() || newFeeAmount <= 0) {
      showToast('Please enter a valid fee name and positive amount.', 'info');
      return;
    }

    const newItem: FeeItem = {
      id: `fee-${Date.now()}`,
      name: newFeeName.trim(),
      amount: Number(newFeeAmount),
      category: newFeeCategory,
      applicableLevel: newFeeLevel,
      description: newFeeDescription.trim() || `${newFeeName.trim()} for secondary scholars`,
      isMandatory: true,
    };

    const updatedItems = [...feeSchedule.items, newItem];
    const newTotal = updatedItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    const updatedSchedule: CollegeFeeSchedule = {
      ...feeSchedule,
      items: updatedItems,
      totalFee: newTotal,
      updatedAt: new Date().toISOString(),
      updatedBy: 'College Administrator',
    };

    setFeeSchedule(updatedSchedule);
    setNewFeeName('');
    setNewFeeAmount(10000);
    setNewFeeDescription('');
    setIsAddFeeOpen(false);

    await persistFeeSchedule(updatedSchedule);
    showToast(`Added custom fee "${newItem.name}" (₦${newItem.amount.toLocaleString()}). Total Prescribed Fee is now ₦${newTotal.toLocaleString()}`);
  };

  // Delete Custom Fee Item
  const handleDeleteFeeItem = async (itemId: string, itemName: string) => {
    if (itemId === 'fee-tuition') {
      showToast('Base tuition item cannot be removed. You can modify its amount above.', 'info');
      return;
    }

    const updatedItems = feeSchedule.items.filter((it) => it.id !== itemId);
    const newTotal = updatedItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    const updatedSchedule: CollegeFeeSchedule = {
      ...feeSchedule,
      items: updatedItems,
      totalFee: newTotal,
      updatedAt: new Date().toISOString(),
      updatedBy: 'College Administrator',
    };

    setFeeSchedule(updatedSchedule);
    await persistFeeSchedule(updatedSchedule);
    showToast(`Removed fee item: "${itemName}". Updated Total: ₦${newTotal.toLocaleString()}`);
  };

  // Update Individual Fee Item Amount
  const handleUpdateItemAmount = async (itemId: string, newAmount: number) => {
    if (newAmount < 0) return;
    const updatedItems = feeSchedule.items.map((it) => {
      if (it.id === itemId) {
        return { ...it, amount: newAmount };
      }
      return it;
    });

    const newTotal = updatedItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    const updatedSchedule: CollegeFeeSchedule = {
      ...feeSchedule,
      baseSchoolFee: itemId === 'fee-tuition' ? newAmount : feeSchedule.baseSchoolFee,
      items: updatedItems,
      totalFee: newTotal,
      updatedAt: new Date().toISOString(),
      updatedBy: 'College Administrator',
    };

    if (itemId === 'fee-tuition') {
      setBaseSchoolFeeInput(newAmount);
    }

    setFeeSchedule(updatedSchedule);
    await persistFeeSchedule(updatedSchedule);
  };

  // Persist Fee Schedule to backend and Cloud Firestore
  const persistFeeSchedule = async (scheduleToSave: CollegeFeeSchedule) => {
    setIsScheduleSaving(true);
    try {
      const res = await fetch('/api/fees/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleToSave),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.schedule) {
          setFeeSchedule(data.schedule);
        }
      }
    } catch (err) {
      console.error('Error saving fee schedule:', err);
    } finally {
      setIsScheduleSaving(false);
    }
  };

  // Save Bank Details
  const handleSaveBankDetails = async () => {
    const updatedSchedule: CollegeFeeSchedule = {
      ...feeSchedule,
      bankName,
      accountNumber,
      accountName,
      updatedAt: new Date().toISOString(),
      updatedBy: 'College Administrator',
    };
    setFeeSchedule(updatedSchedule);
    setIsBankEditing(false);
    await persistFeeSchedule(updatedSchedule);
    showToast('Official College Bursary Bank details updated.');
  };

  // Single Student Fee Toggle (Mark as Paid / Mark as Not Paid)
  const handleToggleStudentFee = async (student: StudentProfile) => {
    setActionInProgressId(student.id);
    const targetStatus: 'Cleared' | 'Pending' = student.feeStatus === 'Cleared' ? 'Pending' : 'Cleared';
    const totalDue = feeSchedule.totalFee || 155000;
    const amountPaid = targetStatus === 'Cleared' ? totalDue : 0;

    try {
      if (onUpdateStudentFeeStatus) {
        await onUpdateStudentFeeStatus(student.id, targetStatus, amountPaid);
      } else {
        const res = await fetch(`/api/students/${student.id}/fee-status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feeStatus: targetStatus,
            amountPaid,
            receiptNo: targetStatus === 'Cleared' ? `DGC-BUR-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
          }),
        });
        if (res.ok && onRefreshData) {
          onRefreshData();
        }
      }
      showToast(`${student.name} marked as ${targetStatus === 'Cleared' ? 'PAID (Cleared)' : 'NOT PAID (Pending)'}.`);
    } catch (err) {
      console.error('Failed to toggle fee status:', err);
      showToast('Error updating student fee status.', 'info');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Open Custom Payment Dialog
  const handleOpenPaymentModal = (student: StudentProfile) => {
    setSelectedPaymentStudent(student);
    const totalDue = feeSchedule.totalFee || 155000;
    const currentPaid = student.feeStatus === 'Cleared' ? totalDue : (student.amountPaid || 0);
    const balance = Math.max(0, totalDue - currentPaid);
    setPaymentAmountInput(balance > 0 ? balance : totalDue);
    setPaymentMethod('Bank Transfer');
    setPaymentRefInput(`TXN-${Date.now().toString().slice(-6)}`);
    setPaymentRemarksInput('Term fees payment reconciled by Bursary');
  };

  // Submit Custom / Partial Payment
  const handleSaveCustomPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentStudent) return;
    setIsSubmittingPayment(true);
    const totalDue = feeSchedule.totalFee || 155000;
    const amount = Number(paymentAmountInput);
    const isFullSettlement = amount >= totalDue;
    const targetStatus: 'Cleared' | 'Pending' = isFullSettlement ? 'Cleared' : 'Pending';

    try {
      if (onUpdateStudentFeeStatus) {
        await onUpdateStudentFeeStatus(
          selectedPaymentStudent.id,
          targetStatus,
          amount,
          `${paymentMethod}: ${paymentRemarksInput || 'Payment credited'}`
        );
      } else {
        const res = await fetch(`/api/students/${selectedPaymentStudent.id}/fee-status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feeStatus: targetStatus,
            amountPaid: amount,
            remarks: `${paymentMethod} (Ref: ${paymentRefInput}): ${paymentRemarksInput || 'Payment reconciled'}`,
            receiptNo: `DGC-BUR-${paymentRefInput.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`,
          }),
        });
        if (res.ok && onRefreshData) {
          onRefreshData();
        }
      }
      showToast(`Payment of ₦${amount.toLocaleString()} recorded for ${selectedPaymentStudent.name}!`);
      setSelectedPaymentStudent(null);
    } catch (err) {
      console.error('Failed to record payment:', err);
      showToast('Error recording custom payment.', 'info');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Export Full Bursary Ledger to CSV
  const handleExportLedgerCSV = () => {
    const totalDue = feeSchedule.totalFee || 155000;
    const headers = [
      'Admission No',
      'Student Name',
      'Class Arm',
      'Gender',
      'Payment Status',
      'Total Prescribed Dues (NGN)',
      'Amount Settled (NGN)',
      'Outstanding Balance (NGN)',
      'Receipt Reference',
      'Payment Date',
      'Remarks',
    ];

    const rows = filteredStudents.map((std) => {
      const isPaid = std.feeStatus === 'Cleared';
      const amountPaid = isPaid ? totalDue : (std.amountPaid || 0);
      const balance = Math.max(0, totalDue - amountPaid);
      return [
        `"${std.admissionNo}"`,
        `"${std.name.replace(/"/g, '""')}"`,
        `"${std.classArm}"`,
        `"${std.gender || 'N/A'}"`,
        `"${isPaid ? 'PAID' : (amountPaid > 0 ? 'PARTIAL' : 'NOT PAID')}"`,
        totalDue,
        amountPaid,
        balance,
        `"${std.feeReceiptNo || (isPaid ? 'DGC-BUR-CLEARED' : 'PENDING')}"`,
        `"${std.feePaymentDate ? new Date(std.feePaymentDate).toLocaleDateString() : 'N/A'}"`,
        `"${(std.feeRemarks || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Dominion_Star_Global_College_Bursary_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered Students List
  const filteredStudents = students.filter((std) => {
    const matchesSearch =
      !studentSearch.trim() ||
      std.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      std.admissionNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      std.classArm.toLowerCase().includes(studentSearch.toLowerCase());

    const matchesClass = classFilter === 'ALL' || std.classArm === classFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PAID' && std.feeStatus === 'Cleared') ||
      (statusFilter === 'NOT_PAID' && std.feeStatus !== 'Cleared');

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Bulk Actions
  const handleBulkAction = async (targetStatus: 'Cleared' | 'Pending') => {
    if (filteredStudents.length === 0) return;
    const confirmMsg = `Are you sure you want to mark all ${filteredStudents.length} currently listed students as ${
      targetStatus === 'Cleared' ? 'PAID' : 'NOT PAID'
    }?`;
    if (!window.confirm(confirmMsg)) return;

    setIsBulkProcessing(true);
    const targetIds = filteredStudents.map((s) => s.id);

    try {
      if (onBulkUpdateStudentFeeStatus) {
        await onBulkUpdateStudentFeeStatus(targetIds, null, targetStatus);
      } else {
        await fetch('/api/students/bulk-fee-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentIds: targetIds,
            feeStatus: targetStatus,
            remarks: targetStatus === 'Cleared' ? 'Administrator Bulk Clearance' : 'Pending Tuition Settlement',
          }),
        });
        if (onRefreshData) onRefreshData();
      }
      showToast(`Batch updated ${filteredStudents.length} scholars to ${targetStatus === 'Cleared' ? 'PAID' : 'NOT PAID'}.`);
    } catch (err) {
      console.error('Bulk fee update error:', err);
      showToast('Error executing batch fee update.', 'info');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Overall Financial Statistics
  const totalStudentsCount = students.length;
  const paidStudentsCount = students.filter((s) => s.feeStatus === 'Cleared').length;
  const notPaidStudentsCount = totalStudentsCount - paidStudentsCount;
  const totalPrescribedFee = feeSchedule.totalFee || 155000;
  const totalExpectedRevenue = totalStudentsCount * totalPrescribedFee;
  const totalRevenueCollected = students.reduce((sum, s) => {
    if (s.feeStatus === 'Cleared') return sum + totalPrescribedFee;
    return sum + (s.amountPaid || 0);
  }, 0);
  const totalOutstandingBalance = Math.max(0, totalExpectedRevenue - totalRevenueCollected);
  const collectionRate = totalStudentsCount > 0 ? Math.round((paidStudentsCount / totalStudentsCount) * 100) : 0;

  return (
    <div className="space-y-6 text-slate-800" id="school-fees-management-panel">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-blue-950 text-white shadow-xl border border-blue-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0" />
          <span className="text-xs font-bold">{feedbackToast.message}</span>
        </div>
      )}

      {/* Mature Executive White & Blue Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-950 border border-blue-200">
              Institutional Bursary Operations
            </span>
            <span className="text-xs text-blue-900 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Live Firestore Synchronized
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-blue-950 mt-1">
            School Fees & Bursary Administration
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure tuition, project fees, and laboratory dues. Manage the comprehensive student clearance roll in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFeeSchedule}
            disabled={isScheduleLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-950 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            title="Refresh Fee Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-900 ${isScheduleLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <div className="px-4 py-2 bg-blue-950 text-white rounded-2xl border border-blue-900 text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200 block">
              Total Prescribed Term Fee
            </span>
            <span className="text-lg sm:text-xl font-mono font-bold text-white block">
              ₦{totalPrescribedFee.toLocaleString()}.00
            </span>
          </div>
        </div>
      </div>

      {/* Mature Executive Financial KPI Metrics (White and Blue) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase block">
            Total Expected Revenue
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-950 font-mono mt-1 block">
            ₦{totalExpectedRevenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalStudentsCount} Enrolled Scholars × ₦{totalPrescribedFee.toLocaleString()}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase block">
            Total Bursary Collected
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
            ₦{totalRevenueCollected.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-600 mt-1 block font-semibold tabular-nums">
            {collectionRate}% Overall Bursary Settlement
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase block">
            Paid Scholars (Cleared)
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
            {paidStudentsCount} <span className="text-xs text-slate-400 font-normal">/ {totalStudentsCount}</span>
          </span>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
            Full Examination Clearance
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase block">
            Outstanding / Not Paid
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
            {notPaidStudentsCount} <span className="text-xs text-slate-400 font-normal">Defaulters</span>
          </span>
          <span className="text-[11px] text-slate-600 mt-1 block font-mono tabular-nums">
            Balance: ₦{totalOutstandingBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. FEE CONFIGURATION & SCHEDULE CONSOLE (Base Tuition, Project Fee, etc.) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider text-blue-950 uppercase">
              ACADEMIC BILLING SCHEDULE CONFIGURATION
            </span>
            <h3 className="text-lg font-bold text-blue-950 mt-0.5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-900" />
              <span>Prescribed School Fees & Additional Dues Setup</span>
            </h3>
            <p className="text-xs text-slate-500">
              Input the base school tuition and add custom dues such as Project Fee, Science Practicals, and ICT levies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddFeeOpen(!isAddFeeOpen)}
              className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              id="admin-add-custom-fee-btn"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Other Fee (Project Fee, etc.)</span>
            </button>
          </div>
        </div>

        {/* Base School Fee Direct Input Card */}
        <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
              Official Primary Tuition
            </span>
            <h4 className="text-base font-bold text-blue-950">
              Base School Fee & Academic Instruction
            </h4>
            <p className="text-xs text-slate-600 max-w-xl">
              This amount represents the core statutory tuition across academic departments. It displays directly on every student's portal bill.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-950">
                ₦
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={baseSchoolFeeInput}
                onChange={(e) => setBaseSchoolFeeInput(Math.max(0, Number(e.target.value)))}
                className="w-40 sm:w-48 pl-8 pr-3 py-2.5 rounded-xl bg-white border border-blue-300 text-blue-950 font-mono font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                id="base-school-fee-input"
              />
            </div>
            <button
              onClick={handleSaveBaseFee}
              disabled={isScheduleSaving}
              className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
              id="save-base-school-fee-btn"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Base Fee</span>
            </button>
          </div>
        </div>

        {/* Add New Custom Fee Form (Collapsible) */}
        {isAddFeeOpen && (
          <form
            onSubmit={handleAddNewFeeItem}
            className="p-5 bg-white rounded-2xl border-2 border-blue-200 shadow-sm space-y-4 animate-fade-in"
            id="add-custom-fee-form"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-blue-950">
                  Input New College Fee or Assessment
                </h4>
                <p className="text-xs text-slate-500">
                  Name the fee (e.g. Project Fee, Practical Fee, Excursion) and specify the amount.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFeeOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Fee Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Project Fee"
                  value={newFeeName}
                  onChange={(e) => setNewFeeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  id="custom-fee-name-input"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Amount (₦) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  placeholder="15000"
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  id="custom-fee-amount-input"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Category</label>
                <select
                  value={newFeeCategory}
                  onChange={(e: any) => setNewFeeCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  id="custom-fee-category-select"
                >
                  <option value="Project">Project Assessment</option>
                  <option value="Laboratory">Laboratory & Practicals</option>
                  <option value="Development">Campus Development</option>
                  <option value="Tuition">Tuition / Academic</option>
                  <option value="General">General / Welfare Levy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Applicable Class Level</label>
                <select
                  value={newFeeLevel}
                  onChange={(e: any) => setNewFeeLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  id="custom-fee-level-select"
                >
                  <option value="All">All Classes (JSS 1 to SS 3)</option>
                  <option value="Junior">Junior Secondary (JSS 1 - 3)</option>
                  <option value="Senior">Senior Secondary (SS 1 - 3)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">Description / Official Note</label>
              <input
                type="text"
                placeholder="e.g. Approved continuous assessment practicals and term project materials"
                value={newFeeDescription}
                onChange={(e) => setNewFeeDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                id="custom-fee-desc-input"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddFeeOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                id="submit-add-custom-fee-btn"
              >
                <Check className="w-4 h-4" />
                <span>Save & Include in Student Portal</span>
              </button>
            </div>
          </form>
        )}

        {/* Current Active Fee Components List */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between font-bold text-blue-950">
            <span>Itemized Dues Breakdown Scheduled for Students</span>
            <span className="text-slate-500 font-normal">
              {feeSchedule.items.length} Active Prescribed Dues
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {feeSchedule.items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-950 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold">
                        {item.category || 'Dues'}
                      </span>
                      {item.applicableLevel && item.applicableLevel !== 'All' && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {item.applicableLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="font-mono font-bold text-blue-950 text-base">
                      ₦{item.amount.toLocaleString()}.00
                    </span>
                  </div>

                  {item.id !== 'fee-tuition' && (
                    <button
                      onClick={() => handleDeleteFeeItem(item.id, item.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete this fee component"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-bold text-blue-950 text-sm">
            <span>Total Prescribed Fee Scheduled to Student Portal:</span>
            <span className="text-lg font-mono font-black text-blue-950">
              ₦{totalPrescribedFee.toLocaleString()}.00
            </span>
          </div>
        </div>

        {/* Official Bank Account Information (White & Blue) */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-900" />
              <span className="font-bold text-blue-950 text-sm">
                Official Bursary Remittance Bank Account
              </span>
            </div>
            <button
              onClick={() => setIsBankEditing(!isBankEditing)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-950 hover:bg-blue-100 font-bold text-xs transition-colors"
            >
              {isBankEditing ? 'Cancel Edit' : 'Edit Bank Details'}
            </button>
          </div>

          {isBankEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Account Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
                  />
                  <button
                    onClick={handleSaveBankDetails}
                    className="px-3 py-2 rounded-xl bg-blue-950 text-white font-bold whitespace-nowrap hover:bg-blue-900"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Bank Name</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{bankName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Number</span>
                <span className="text-sm font-mono font-bold text-blue-950 mt-0.5 block tracking-wider">
                  {accountNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Name</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{accountName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WHOLE STUDENT BODY BURSARY ROLL (MARK PAID & NOT PAID)                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider text-blue-950 uppercase">
              ALL REGISTERED STUDENTS BURSARY ROSTER
            </span>
            <h3 className="text-lg font-bold text-blue-950 mt-0.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-900" />
              <span>Full Student Roll & Payment Status Verification</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mark individual students as <strong>PAID</strong> or <strong>NOT PAID</strong> with a single click. Changes immediately reflect on the Student Portal.
            </p>
          </div>

          {/* Batch Action & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportLedgerCSV}
              disabled={filteredStudents.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export Current Bursary Ledger to CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-900" />
              <span>Export Ledger (CSV)</span>
            </button>

            <button
              onClick={() => handleBulkAction('Cleared')}
              disabled={isBulkProcessing || filteredStudents.length === 0}
              className="px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              id="bulk-mark-paid-btn"
              title="Mark all currently filtered students as Paid"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Filtered as Paid ({filteredStudents.length})</span>
            </button>

            <button
              onClick={() => handleBulkAction('Pending')}
              disabled={isBulkProcessing || filteredStudents.length === 0}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="bulk-mark-not-paid-btn"
              title="Mark all currently filtered students as Not Paid"
            >
              <X className="w-3.5 h-3.5" />
              <span>Mark as Not Paid</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, admission number, or class arm..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              id="fees-student-search-input"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Class Arm Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              id="fees-class-filter-select"
            >
              <option value="ALL">All Class Arms ({totalStudentsCount})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* Payment Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              id="fees-status-filter-select"
            >
              <option value="ALL">All Status ({totalStudentsCount})</option>
              <option value="PAID">Paid / Cleared ({paidStudentsCount})</option>
              <option value="NOT_PAID">Not Paid / Pending ({notPaidStudentsCount})</option>
            </select>
          </div>
        </div>

        {/* Whole Student Bursary Roster Table (Mature White & Blue) */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse" id="whole-students-fees-table">
              <thead>
                <tr className="bg-slate-50 text-blue-950 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Scholar Identity</th>
                  <th className="py-3 px-4">Class Arm</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Bill Amount</th>
                  <th className="py-3 px-4">Amount Settled</th>
                  <th className="py-3 px-4">Receipt Ref</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Fee Clearance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No student records match the specified filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => {
                    const isPaid = std.feeStatus === 'Cleared';
                    const isProcessing = actionInProgressId === std.id;
                    const amountPaid = isPaid ? totalPrescribedFee : (std.amountPaid || 0);
                    const balance = Math.max(0, totalPrescribedFee - amountPaid);

                    return (
                      <tr
                        key={std.id}
                        className="hover:bg-blue-50/40 transition-colors"
                        id={`student-fee-row-${std.id}`}
                      >
                        {/* Student Name & Reg Number */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-950 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-blue-900 overflow-hidden">
                              {std.photoUrl ? (
                                <img
                                  src={std.photoUrl}
                                  alt={std.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                std.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {formatStudentShortName(std.name)}
                              </span>
                              <span className="font-mono text-[11px] text-slate-500 block">
                                {std.admissionNo}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Class Arm */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px]">
                            {std.classArm}
                          </span>
                        </td>

                        {/* Payment Status Badge */}
                        <td className="py-3 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-white shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                              <span>PAID</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>NOT PAID</span>
                            </span>
                          )}
                        </td>

                        {/* Bill Amount */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ₦{totalPrescribedFee.toLocaleString()}.00
                        </td>

                        {/* Amount Settled & Balance */}
                        <td className="py-3 px-4">
                          <span className={`font-mono font-bold block ${isPaid ? 'text-blue-950' : 'text-slate-700'}`}>
                            ₦{amountPaid.toLocaleString()}.00
                          </span>
                          {!isPaid && (
                            <span className="text-[10px] text-slate-500 block">
                              Due: ₦{balance.toLocaleString()}
                            </span>
                          )}
                        </td>

                        {/* Receipt Reference */}
                        <td className="py-3 px-4">
                          {isPaid ? (
                            <div>
                              <span className="font-mono text-[11px] font-bold text-blue-950 block">
                                {std.feeReceiptNo || 'DGC-BUR-CLEARED'}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {std.feePaymentDate ? new Date(std.feePaymentDate).toLocaleDateString() : 'Verified'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Mark Paid / Not Paid & Receipt Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptStudent(std)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-blue-950 transition-colors cursor-pointer"
                              title="View & Print Official Bursary Receipt"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(std)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                              title="Record Custom or Partial Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>

                            {isPaid ? (
                              <button
                                onClick={() => handleToggleStudentFee(std)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                id={`mark-not-paid-btn-${std.id}`}
                                title="Click to mark student as Not Paid"
                              >
                                <X className="w-3.5 h-3.5 text-slate-500" />
                                <span>{isProcessing ? 'Updating...' : 'Not Paid'}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStudentFee(std)}
                                disabled={isProcessing}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                id={`mark-paid-btn-${std.id}`}
                                title="Click to mark student as Paid"
                              >
                                <Check className="w-3.5 h-3.5 text-blue-300" />
                                <span>{isProcessing ? 'Updating...' : 'Mark Paid'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <span>
              Showing <strong>{filteredStudents.length}</strong> of <strong>{totalStudentsCount}</strong> registered students
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-blue-950">
                <span className="w-2 h-2 rounded-full bg-blue-950" />
                {paidStudentsCount} Paid
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                {notPaidStudentsCount} Not Paid
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official College Bursary Receipt Modal */}
      {selectedReceiptStudent && (
        <BursaryReceiptModal
          student={selectedReceiptStudent}
          feeSchedule={feeSchedule}
          onClose={() => setSelectedReceiptStudent(null)}
        />
      )}

      {/* Record Custom / Partial Payment Modal */}
      {selectedPaymentStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="p-5 bg-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold">Record Custom / Partial Payment</h3>
                  <p className="text-[11px] text-blue-200">Bursary payment ledger reconciliation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPaymentStudent(null)}
                className="p-1.5 rounded-xl text-blue-300 hover:text-white hover:bg-blue-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCustomPayment} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Scholar Credential</span>
                <strong className="text-slate-900 text-sm block">{selectedPaymentStudent.name}</strong>
                <div className="flex items-center justify-between text-slate-600 font-mono text-[11px] pt-1">
                  <span>Adm: {selectedPaymentStudent.admissionNo}</span>
                  <span>Class: {selectedPaymentStudent.classArm}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Statutory Due</span>
                  <span className="font-mono text-slate-900 font-bold text-sm block mt-0.5">
                    ₦{(feeSchedule.totalFee || 155000).toLocaleString()}.00
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Already Credited</span>
                  <span className="font-mono text-blue-950 font-bold text-sm block mt-0.5">
                    ₦{(selectedPaymentStudent.amountPaid || 0).toLocaleString()}.00
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Payment Amount to Record (₦):
                </label>
                <input
                  type="number"
                  min="1"
                  max={feeSchedule.totalFee || 155000}
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Bank Transfer">Direct Bank Transfer</option>
                    <option value="Cash">Cash Deposit</option>
                    <option value="POS">POS Terminal Card</option>
                    <option value="Cheque">Bank Draft / Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Receipt / Teller Ref:</label>
                  <input
                    type="text"
                    value={paymentRefInput}
                    onChange={(e) => setPaymentRefInput(e.target.value)}
                    placeholder="e.g. TXN-893021"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bursar Remarks / Narration:</label>
                <input
                  type="text"
                  value={paymentRemarksInput}
                  onChange={(e) => setPaymentRemarksInput(e.target.value)}
                  placeholder="e.g. First installment paid via First Bank teller"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmittingPayment ? 'Saving...' : 'Record Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
