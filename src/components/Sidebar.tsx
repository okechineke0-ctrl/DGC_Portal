import React from 'react';
import {
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

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  currentStudent?: StudentProfile | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  currentStudent,
  onLogout,
}) => {
  // Navigation items strictly adhering to secondary school student portal scope:
  // 1. Print Results
  // 2. Check performance in all subjects assigned by administration
  // 3. Check attendance
  // 4. Check if you have cleared school fees and other dues
  // 5. Settings: Profile picture upload (in school uniform) & optional phone
  const navigationItems = [
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: School Identity Banner */}
        <div className="p-5 border-b border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <DGCLogo size="md" />
            {setIsMobileOpen && (
              <button
                id="close-sidebar-mobile-btn"
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <span className="font-semibold text-blue-950">Senior Academic Division</span>
            <span className="text-[10px] text-slate-700 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
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
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-blue-950 text-white shadow-md shadow-blue-950/10'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/90'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isActive
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80 group-hover:text-blue-950'
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
                          isActive ? 'text-blue-200' : 'text-slate-400'
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
                          ? 'bg-white text-blue-950 font-bold'
                          : item.badgeColor || 'bg-slate-100 text-slate-600'
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
            {/* Student Identity Mini Card */}
            <div
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-3 cursor-pointer p-1.5 -m-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
              title="Click to manage profile & passport photo"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden border border-slate-200">
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
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-950 truncate block">
                    {currentStudent?.name || 'No student selected'}
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
              className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:shadow-2xs active:scale-98"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Log Out</span>
            </button>
          </div>

          <div className="mt-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Dominion Stars Global College
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
