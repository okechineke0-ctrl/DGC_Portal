import React from 'react';
import {
  BookOpen,
  Printer,
  GraduationCap,
  CalendarCheck,
  ShieldCheck,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  X,
  User,
  Camera,
} from 'lucide-react';
import { DGCLogo } from './DGCLogo';
import { StudentProfile } from '../types';
import { formatStudentShortName } from '../utils/formatters';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  currentStudent?: StudentProfile | null;
  onLogout?: () => void;
  onLogoTripleClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  currentStudent,
  onLogout,
  onLogoTripleClick,
}) => {
  // Navigation items strictly adhering to secondary school student portal scope:
  // 1. Check assigned subjects & curriculum (allocated by administration)
  // 2. Print Results / Terminal Report Sheet
  // 3. Check performance in all subjects assigned by administration
  // 4. Check attendance
  // 5. Check if you have cleared school fees and other dues
  // 6. Settings: Profile picture upload (in school uniform) & optional phone
  const navigationItems = [
    {
      id: 'subjects',
      label: 'Assigned Subjects',
      subtitle: 'Curriculum & subject teachers',
      icon: BookOpen,
      badge: currentStudent?.subjects?.length ? `${currentStudent.subjects.length} Subjects` : 'Curriculum',
      badgeColor: 'bg-blue-50 text-blue-900 border border-blue-200 font-bold',
    },
    {
      id: 'report_card',
      label: 'Print Results',
      subtitle: 'Official terminal grades & broadsheet',
      icon: Printer,
      badge: 'Official',
    },
    {
      id: 'performance',
      label: 'Performance',
      subtitle: 'Assessment & exam breakdown',
      icon: GraduationCap,
      badge: 'Subjects',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      subtitle: 'Roll call & punctuality record',
      icon: CalendarCheck,
      badge: currentStudent && (currentStudent.timesSchoolOpened || 0) > 0 ? `${currentStudent.attendanceRate}%` : 'Roll Call',
    },
    {
      id: 'fees',
      label: 'Fees & Clearance',
      subtitle: 'Clearance verification & dues',
      icon: CreditCard,
      badge: currentStudent?.feeStatus === 'Cleared' ? 'Paid' : 'Not Paid',
      badgeColor: currentStudent?.feeStatus === 'Cleared' ? 'bg-blue-100 text-blue-950 border border-blue-300 font-bold' : 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
    },
    {
      id: 'settings',
      label: 'Profile & Settings',
      subtitle: 'Uniform passport photo & contact',
      icon: Settings,
      badge: currentStudent?.photoUrl ? 'Verified' : 'Required',
      badgeColor: currentStudent?.photoUrl ? 'bg-blue-50 text-blue-950 border border-blue-200' : 'bg-slate-100 text-slate-700',
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-sky-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: School Identity Banner */}
        <div className="p-5 border-b border-sky-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <DGCLogo size="md" onClick={onLogoTripleClick} />
            {setIsMobileOpen && (
              <button
                id="close-sidebar-mobile-btn"
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-sky-50"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600 bg-sky-50/70 px-2.5 py-1.5 rounded-xl border border-sky-200/60">
            <span className="font-semibold text-blue-950">Senior Academic Division</span>
            <span className="text-[10px] text-slate-700 font-bold bg-white px-2 py-0.5 rounded-md border border-sky-200">
              2026/2027
            </span>
          </div>
        </div>

        {/* Middle: Student Portal Core Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-4">
          <div className="px-3 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
            Student Academic Services
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'report_card' && activeTab === 'results') ||
                (item.id === 'performance' && activeTab === 'analytics') ||
                (item.id === 'fees' && activeTab === 'bursary');

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-sky-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-sky-100/70 text-blue-900 group-hover:bg-sky-200/80 group-hover:text-blue-950'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate block">{item.label}</span>
                      </div>
                      <span
                        className={`text-[10px] block truncate mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white text-blue-900 font-bold'
                          : item.badgeColor || 'bg-sky-100/70 text-blue-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Dignified Student Profile & Log Out */}
        <div className="p-4 border-t border-sky-100 bg-sky-50/50">
          <div className="p-3.5 bg-white border border-sky-200 rounded-2xl shadow-2xs space-y-3">
            {/* Student Identity Mini Card */}
            <div
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-3 cursor-pointer p-1.5 -m-1.5 rounded-xl hover:bg-sky-50 transition-colors group"
              title="Click to manage profile & passport photo"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden border border-sky-200">
                {currentStudent?.photoUrl ? (
                  <img
                    src={currentStudent.photoUrl}
                    alt={currentStudent.name}
                    className="w-full h-full object-cover"
                  />
                ) : currentStudent ? (
                  currentStudent.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                ) : (
                  <User className="w-5 h-5 text-amber-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate block">
                    {currentStudent ? formatStudentShortName(currentStudent.name) : 'No student selected'}
                  </span>
                  <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-900 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <span className="truncate">{currentStudent?.admissionNo || '—'}</span>
                  <span>•</span>
                  <span className="font-semibold text-blue-900">{currentStudent?.classArm || 'No Class'}</span>
                </div>
              </div>
            </div>

            {/* Clean Professional Log Out Button */}
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:shadow-xs active:scale-98 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Log Out</span>
            </button>
          </div>

          <div className="mt-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Dominate Star College
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
