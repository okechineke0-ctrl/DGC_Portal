import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building,
  Landmark,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { StudentProfile, CollegeFeeSchedule } from '../types';
import { DGCLogo } from './DGCLogo';
import { SCHOOL_NAME, SCHOOL_MOTTO, SCHOOL_LOCATION } from '../data/mockData';
import { printElement } from '../utils/printReportCard';

interface BursaryReceiptModalProps {
  student: StudentProfile;
  feeSchedule: CollegeFeeSchedule;
  onClose: () => void;
}

export const BursaryReceiptModal: React.FC<BursaryReceiptModalProps> = ({
  student,
  feeSchedule,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    const safeTitle = `Bursary_Receipt_${student.name.replace(/\s+/g, '_')}_${student.admissionNo.replace(/[/\\:]/g, '_')}`;
    printElement(receiptRef.current, {
      title: safeTitle,
      onBeforePrint: () => setIsPrinting(true),
      onAfterPrint: () => setIsPrinting(false),
    });
    setTimeout(() => setIsPrinting(false), 1800);
  };
  const isPaid = student.feeStatus === 'Cleared';
  const totalPrescribed = feeSchedule.totalFee || 155000;
  const amountPaid = isPaid ? totalPrescribed : (student.amountPaid || 0);
  const balance = Math.max(0, totalPrescribed - amountPaid);
  const receiptNo =
    student.feeReceiptNo ||
    `DGC-BUR-2026-${(student.admissionNo || '001').replace(/[^0-9]/g, '').padStart(6, '0')}`;

  const formattedDate = student.feePaymentDate
    ? new Date(student.feePaymentDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const items = feeSchedule.items && feeSchedule.items.length > 0
    ? feeSchedule.items
    : [
        { id: '1', name: 'Base Tuition & Academic Instruction', amount: feeSchedule.baseSchoolFee || 85000, category: 'Tuition' },
        { id: '2', name: 'Student Term Project & Vocational Exhibition', amount: 15000, category: 'Project' },
        { id: '3', name: 'Science Laboratory Reagents & Practical Levy', amount: 15000, category: 'Laboratory' },
        { id: '4', name: 'ICT, Computer Lab & Portal Maintenance', amount: 10000, category: 'General' },
        { id: '5', name: 'Campus Development & Sports Facilities Levy', amount: 25000, category: 'Development' },
        { id: '6', name: 'Parents-Teachers Association (PTA) Term Levy', amount: 5000, category: 'General' },
      ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between no-print print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold">Official College Bursary Receipt</h3>
              <p className="text-[11px] text-slate-400">Institutional financial clearance verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-70 min-h-[38px]"
            >
              {isPrinting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-200" />
                  <span>Preparing Receipt...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
          {/* Official College Header */}
          <div className="flex items-center justify-between pb-5 border-b-2 border-slate-900/80 gap-4">
            <div className="flex items-center gap-3.5">
              <DGCLogo className="w-14 h-14 shrink-0" />
              <div>
                <h1 className="text-lg sm:text-xl font-black font-serif-title text-slate-950 uppercase tracking-tight">
                  {SCHOOL_NAME}
                </h1>
                <p className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                  DIRECTORATE OF BURSARY & FINANCIAL AUDIT
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  "{SCHOOL_MOTTO}" · {SCHOOL_LOCATION}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 rounded-md text-[10px] font-extrabold uppercase bg-blue-950 text-white font-mono">
                {isPaid ? 'CLEARED · PAID IN FULL' : amountPaid > 0 ? 'PARTIAL PAYMENT' : 'PENDING'}
              </span>
              <span className="block font-mono text-[11px] font-bold text-slate-700 mt-1">
                {receiptNo}
              </span>
              <span className="block text-[10px] text-slate-500">
                Date: {formattedDate}
              </span>
            </div>
          </div>

          {/* Student Identification Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Scholar Name</span>
              <strong className="text-slate-900 block truncate">{student.name}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Number</span>
              <strong className="font-mono text-blue-950 block">{student.admissionNo}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Arm</span>
              <strong className="text-slate-900 block">{student.classArm}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Terminal Session</span>
              <strong className="text-slate-900 block">{student.session} ({student.term})</strong>
            </div>
          </div>

          {/* Schedule of Fees Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">S/N</th>
                  <th className="py-2.5 px-3">Fee Description</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3 text-right">Statutory Dues (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{it.name}</td>
                    <td className="py-2 px-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold">
                        {it.category || 'Institutional'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {Number(it.amount).toLocaleString()}.00
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[11px] text-slate-700">
                    Total Prescribed Fee Obligation:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-slate-950 font-black">
                    ₦{totalPrescribed.toLocaleString()}.00
                  </td>
                </tr>
                <tr className="bg-blue-50/60">
                  <td colSpan={3} className="py-2 px-3 text-right uppercase text-[11px] text-blue-950">
                    Amount Settled & Cleared to Date:
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-sm text-blue-950 font-black">
                    ₦{amountPaid.toLocaleString()}.00
                  </td>
                </tr>
                {balance > 0 && (
                  <tr className="bg-amber-50/60 text-amber-950">
                    <td colSpan={3} className="py-2 px-3 text-right uppercase text-[11px] font-extrabold">
                      Remaining Outstanding Balance Due:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm font-black text-amber-950">
                      ₦{balance.toLocaleString()}.00
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {/* Bank Payment Account Reference & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                Official Treasury Channel
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {feeSchedule.bankName || 'First Bank of Nigeria'} · {feeSchedule.accountNumber || '3128940022'}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {feeSchedule.accountName || 'Dominion Star Global College Bursary Account'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                Bursary Remarks & Narration
              </span>
              <p className="text-slate-800 text-[11px] italic mt-0.5">
                "{student.feeRemarks || (isPaid ? 'Payment fully confirmed and reconciled by College Central Accounts.' : 'Part payment credited; balance required prior to terminal examinations.')}"
              </p>
            </div>
          </div>

          {/* Institutional Endorsement & Seal Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-blue-900 border-dashed flex items-center justify-center text-blue-950 font-black text-[9px] text-center leading-tight p-1 rotate-[-6deg]">
                OFFICIAL BURSARY SEAL
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">
                  Institutional Financial Verification
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  REF: BUR-SEC-{receiptNo.replace(/[^0-9]/g, '')}-{student.admissionNo.replace(/[^0-9]/g, '')}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="w-40 border-b border-slate-400 mb-1 ml-auto"></div>
              <span className="text-[10px] font-bold text-slate-800 uppercase block">
                Chief Bursar / Authorized Signatory
              </span>
              <span className="text-[9px] text-slate-400 block">
                Dominion Star Global College Central Bursary
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
