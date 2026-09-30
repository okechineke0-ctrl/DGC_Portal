import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronRight,
  Sparkles,
  KeyRound,
  Search,
  CheckCircle2,
  RefreshCw,
  Building,
} from 'lucide-react';
import { DGCLogo } from './DGCLogo';
import { StaffMember } from '../types';
import { CURRENT_SESSION, CURRENT_TERM } from '../data/originalData';
import { formatStaffName } from '../utils/formatters';

interface InstitutionalLoginGatewayProps {
  rememberedWorkspace: 'portal' | 'staff' | 'ceo';
  onWorkspaceChange: (ws: 'portal' | 'staff' | 'ceo') => void;
  // Student Login
  regNumberInput: string;
  setRegNumberInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onStudentLogin: (e?: React.FormEvent) => void;
  // Admin Login
  adminPasscodeInput: string;
  setAdminPasscodeInput: (val: string) => void;
  showAdminPasscode: boolean;
  setShowAdminPasscode: (val: boolean) => void;
  onAdminLogin: (e?: React.FormEvent) => void;
  // Staff Login
  staffList: StaffMember[];
  staffNameInput: string;
  setStaffNameInput: (val: string) => void;
  staffPinInput: string;
  setStaffPinInput: (val: string) => void;
  showStaffPin: boolean;
  setShowStaffPin: (val: boolean) => void;
  onStaffLogin: (e?: React.FormEvent) => void;
  // General
  authError: string;
  setAuthError: (val: string) => void;
  isLoggingIn: boolean;
  onLogoSixClick: () => void;
  onOpenGatewayModal: () => void;
}

export const InstitutionalLoginGateway: React.FC<InstitutionalLoginGatewayProps> = ({
  rememberedWorkspace,
  onWorkspaceChange,
  regNumberInput,
  setRegNumberInput,
  passwordInput,
  setPasswordInput,
  showPassword,
  setShowPassword,
  onStudentLogin,
  adminPasscodeInput,
  setAdminPasscodeInput,
  showAdminPasscode,
  setShowAdminPasscode,
  onAdminLogin,
  staffList,
  staffNameInput,
  setStaffNameInput,
  staffPinInput,
  setStaffPinInput,
  showStaffPin,
  setShowStaffPin,
  onStaffLogin,
  authError,
  setAuthError,
  isLoggingIn,
  onLogoSixClick,
  onOpenGatewayModal,
}) => {
  const [staffFilter, setStaffFilter] = useState('');
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

  // Filtered staff list for search selection
  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(staffFilter.toLowerCase()) ||
    s.title?.toLowerCase().includes(staffFilter.toLowerCase()) ||
    s.primarySubject?.toLowerCase().includes(staffFilter.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto my-4 sm:my-8 px-2 sm:px-4">
      {/* Institutional Gateway Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all">
        {/* Crest & College Directorate Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 text-center relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-radial from-blue-900/30 via-transparent to-transparent pointer-events-none" />

          {/* Official College Emblem with 6-click administration shortcut */}
          <div className="inline-block relative z-10 mb-3">
            <button
              type="button"
              onClick={onLogoSixClick}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="Dominion Star Global College (Tap 6 times for administrative bypass)"
              aria-label="Dominion Star Global College Crest"
            >
              <DGCLogo size="md" showText={false} />
            </button>
            <span className="block text-[9px] text-amber-300/80 font-bold uppercase tracking-widest mt-1">
              Tap Crest 6x For Bypass
            </span>
          </div>

          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
              Dominion Star Global College · Awgu
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-title tracking-tight text-white">
              Institutional Access Gateway
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Official unified portal for Administration Governance, Faculty Continuous Assessment, and Student Academic Broadsheets.
            </p>
          </div>

          {/* Active / Remembered Workspace Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Target:</span>
            <strong className="text-white capitalize">
              {rememberedWorkspace === 'ceo'
                ? 'Administration Directorate'
                : rememberedWorkspace === 'staff'
                ? 'Academic Faculty'
                : 'Student Portal'}
            </strong>
          </div>
        </div>

        {/* 3-Role Workspace Selector Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-slate-200/80 rounded-2xl">
            {/* 1. Administration Directorate Tab */}
            <button
              type="button"
              onClick={() => {
                onWorkspaceChange('ceo');
                setAuthError('');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rememberedWorkspace === 'ceo'
                  ? 'bg-slate-900 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              id="workspace-tab-ceo"
            >
              <ShieldCheck className={`w-4 h-4 shrink-0 ${rememberedWorkspace === 'ceo' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="text-center sm:text-left leading-tight">Admin Console</span>
            </button>

            {/* 2. Academic Faculty / Staff Tab */}
            <button
              type="button"
              onClick={() => {
                onWorkspaceChange('staff');
                setAuthError('');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rememberedWorkspace === 'staff'
                  ? 'bg-slate-900 text-emerald-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              id="workspace-tab-staff"
            >
              <UserCheck className={`w-4 h-4 shrink-0 ${rememberedWorkspace === 'staff' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-center sm:text-left leading-tight">Faculty Console</span>
            </button>

            {/* 3. Student Academic Portal Tab */}
            <button
              type="button"
              onClick={() => {
                onWorkspaceChange('portal');
                setAuthError('');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rememberedWorkspace === 'portal'
                  ? 'bg-slate-900 text-blue-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              id="workspace-tab-portal"
            >
              <GraduationCap className={`w-4 h-4 shrink-0 ${rememberedWorkspace === 'portal' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className="text-center sm:text-left leading-tight">Student Portal</span>
            </button>
          </div>
        </div>

        {/* Form Body for Selected Workspace */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Error Message Notice */}
          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2.5 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium leading-relaxed">{authError}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* 1. ADMINISTRATION DIRECTORATE LOGIN                                */}
          {/* ================================================================= */}
          {rememberedWorkspace === 'ceo' && (
            <form onSubmit={onAdminLogin} className="space-y-4 text-left">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>College Administration & Principal Governance</span>
                </div>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  Enter your official Administrative Passcode to unlock class allocations, bursary clearances, faculty management, and statutory record tools.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    Administrative Passcode:
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Default: dgc2026
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPasscode ? 'text' : 'password'}
                    value={adminPasscodeInput}
                    onChange={(e) => {
                      setAdminPasscodeInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter administration passcode"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showAdminPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-slate-800 disabled:opacity-60"
                id="admin-login-submit-btn"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Verifying Administration Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Enter Administration Governance Console</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={onOpenGatewayModal}
                  className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                >
                  Open Executive Gateway Selector
                </button>
                <span>Session Saved in Memory</span>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* 2. ACADEMIC FACULTY / STAFF LOGIN                                 */}
          {/* ================================================================= */}
          {rememberedWorkspace === 'staff' && (
            <form onSubmit={onStaffLogin} className="space-y-4 text-left">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Academic Faculty Continuous Assessment</span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Select your registered instructor name and enter your Faculty PIN to submit continuous assessments, test scores, and attendance roll calls.
                </p>
              </div>

              {/* Instructor Name Selection / Search */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-800 block">
                  Select Instructor / Tutor Name:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={staffNameInput}
                    onChange={(e) => {
                      setStaffNameInput(e.target.value);
                      setStaffFilter(e.target.value);
                      setIsStaffDropdownOpen(true);
                      setAuthError('');
                    }}
                    onFocus={() => setIsStaffDropdownOpen(true)}
                    placeholder="Type or select your name (e.g. Mr. Okafor)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Quick Staff Suggestions Dropdown */}
                {isStaffDropdownOpen && filteredStaff.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-1">
                    {filteredStaff.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setStaffNameInput(st.name);
                          setIsStaffDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-slate-900">
                          {st.title} {formatStaffName(st.name)}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {st.primarySubject || 'Tutor'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Staff Passcode / PIN Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    Faculty PIN / Passcode:
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Default: dgc-staff
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showStaffPin ? 'text' : 'password'}
                    value={staffPinInput}
                    onChange={(e) => {
                      setStaffPinInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter faculty passcode"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPin(!showStaffPin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showStaffPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-slate-800 disabled:opacity-60"
                id="staff-login-submit-btn"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Verifying Faculty Credentials...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-300" />
                    <span>Enter Faculty Continuous Assessment Console</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={onOpenGatewayModal}
                  className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                >
                  Use Rapid Gateway Modal
                </button>
                <span>Academic Session · {CURRENT_SESSION}</span>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* 3. STUDENT ACADEMIC PORTAL LOGIN                                  */}
          {/* ================================================================= */}
          {rememberedWorkspace === 'portal' && (
            <form onSubmit={onStudentLogin} className="space-y-4 text-left">
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-xs">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Student & Guardian Academic Portal</span>
                </div>
                <p className="text-[11px] text-blue-900/90 leading-relaxed">
                  Enter your official College Registration Number to access terminal report cards, continuous assessment breakdown, and bursary clearances.
                </p>
              </div>

              {/* Reg Number Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Registration Number (Reg No):
                </label>
                <input
                  type="text"
                  value={regNumberInput}
                  onChange={(e) => {
                    setRegNumberInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="e.g. DGC/2026/0142"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all uppercase font-mono"
                  autoFocus
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    Password:
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Default: Reg Number
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter your Reg Number as password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-slate-800 disabled:opacity-60"
                id="student-login-submit-btn"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-300" />
                    <span>Signing in to Academic Portal...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 text-blue-300" />
                    <span>Sign In to Student Academic Portal</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Accounts provisioned by Administration</span>
                <span>{CURRENT_SESSION} · {CURRENT_TERM}</span>
              </div>
            </form>
          )}
        </div>

        {/* Institutional Card Footer */}
        <div className="p-4 bg-slate-100/80 border-t border-slate-200/90 text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Dominion Star Global College Portal · Awgu</span>
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Directorate Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
