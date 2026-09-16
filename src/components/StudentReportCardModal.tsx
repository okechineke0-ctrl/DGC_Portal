import React from 'react';
import { X, Printer, ShieldCheck, Award } from 'lucide-react';
import { StudentProfile, SchoolClassDefinition } from '../types';
import { DGCLogo } from './DGCLogo';
import { CURRENT_SESSION, CURRENT_TERM, SCHOOL_NAME, SCHOOL_MOTTO, SCHOOL_LOCATION } from '../data/mockData';

interface StudentReportCardModalProps {
  student: StudentProfile;
  classes: SchoolClassDefinition[];
  onClose: () => void;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  student,
  classes,
  onClose,
}) => {
  const assignedFormMaster = classes.find((c) => c.name === student.classArm)?.classMaster
    || 'Class Master';

  const formMasterRemark = student.formMasterRemark || (
    student.termGpa >= 75
      ? 'An exceptional, highly focused student who demonstrates academic brilliance and moral discipline. Recommended for academic honors.'
      : 'A good and regular student. Encouraged to allocate more time to continuous assessment revisions.'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-blue-950 uppercase tracking-wider">
              Terminal Broadsheet
            </span>
            <span className="text-xs text-slate-300">
              {student.name} ({student.admissionNo}) · {student.classArm}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors flex items-center gap-1 px-2.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Card Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50/50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* School Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-950 text-amber-300 flex items-center justify-center font-bold text-2xl shadow-sm">
                  <DGCLogo size="md" showText={false} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-slate-900 tracking-tight">
                    {SCHOOL_NAME}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold italic">
                    "{SCHOOL_MOTTO}" · {SCHOOL_LOCATION}
                  </p>
                  <p className="text-[11px] font-mono text-slate-600 mt-1 uppercase tracking-wider">
                    Official Terminal Broadsheet & Continuous Assessment Transcript
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Academic Session</span>
                <span className="text-sm font-bold text-slate-900 block font-mono">{CURRENT_SESSION}</span>
                <span className="text-xs font-bold text-blue-900 block font-mono">{CURRENT_TERM}</span>
              </div>
            </div>

            {/* Student Biodata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                <span className="font-bold text-slate-900">{student.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Number</span>
                <span className="font-mono font-bold text-slate-900">{student.admissionNo}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Arm</span>
                <span className="font-bold text-slate-900">{student.classArm}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Form Master</span>
                <span className="font-bold text-blue-950">{assignedFormMaster}</span>
              </div>
            </div>

            {/* Academic Results Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-2 text-center">HW (10)</th>
                    <th className="py-2.5 px-2 text-center">T1 (10)</th>
                    <th className="py-2.5 px-2 text-center">T2 (10)</th>
                    <th className="py-2.5 px-2 text-center">Prac (10)</th>
                    <th className="py-2.5 px-2 text-center font-bold">CA (40)</th>
                    <th className="py-2.5 px-2 text-center font-bold">Exam (60)</th>
                    <th className="py-2.5 px-2 text-center font-bold">Total (100)</th>
                    <th className="py-2.5 px-2 text-center font-bold">Grade</th>
                    <th className="py-2.5 px-3 text-right">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.subjects.map((s) => (
                    <tr key={s.code} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{s.homework ?? 8}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{s.test1 ?? 8}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{s.test2 ?? 8}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{s.practical ?? 8}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">{s.caTotal}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">{s.exam}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-black text-slate-950">{s.total}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-blue-900">{s.grade}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-medium">{s.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Term Average GPA</span>
                <span className="text-xl font-black text-blue-950 font-mono">{student.termGpa}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Class Standing</span>
                <span className="text-xl font-black text-blue-950 font-mono">{student.termRank}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Attendance Rate</span>
                <span className="text-xl font-black text-blue-950 font-mono">{student.attendanceRate}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Result Status</span>
                <span
                  className={`text-sm font-bold block mt-1 ${
                    student.resultHeld ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {student.resultHeld ? 'Held by Admin' : 'Officially Certified'}
                </span>
              </div>
            </div>

            {/* Form Master & Principal Endorsement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                  Class Master's Official Evaluation
                </span>
                <p className="text-slate-800 italic">
                  "{formMasterRemark}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                  <span>Class Master: <strong>{assignedFormMaster}</strong></span>
                  <span className="text-emerald-700 font-bold">Signature: Verified</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-blue-900 block">
                  Principal & Board Endorsement
                </span>
                <p className="text-blue-950 italic">
                  "{student.resultHeld ? 'Result held by administrative directive.' : 'Result approved and certified by the College Directorate. Promoted in good standing.'}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-blue-800 pt-2 border-t border-blue-200/60 mt-2">
                  <span>College Seal: <strong>AFFIXED</strong></span>
                  <span>Next Term Resumption: <strong>11th Jan, 2027</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
