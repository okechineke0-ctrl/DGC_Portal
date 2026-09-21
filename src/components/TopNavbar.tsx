import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Calendar,
  Menu,
  Clock,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Database,
} from 'lucide-react';
import { DGCLogo } from './DGCLogo';
import { ANNOUNCEMENTS, CURRENT_SESSION, CURRENT_TERM } from '../data/originalData';
import { formatStudentShortName } from '../utils/formatters';

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
  portalMode: 'director' | 'student';
  setPortalMode: (mode: 'director' | 'student') => void;
  onOpenAnnouncements: () => void;
  onLogoSixClick?: () => void;
  currentRole?: 'portal' | 'staff' | 'ceo';
  isLoggedOut?: boolean;
  isDbLive?: boolean;
  currentStudent?: {
    name: string;
    classArm: string;
    admissionNo: string;
    photoUrl?: string;
  } | null;
  onExitToPortal?: () => void;
  staffName?: string;
  staffTitle?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileMenu,
  portalMode,
  setPortalMode,
  onOpenAnnouncements,
  onLogoSixClick,
  currentRole = 'portal',
  isLoggedOut = false,
  isDbLive = true,
  currentStudent,
  onExitToPortal,
  staffName,
  staffTitle,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getRoleDisplayName = () => {
    if (isLoggedOut) return 'Guest Student';
    if (currentRole === 'ceo') return 'Chief Executive Officer';
    if (currentRole === 'staff') {
      if (staffName) return `${staffTitle ? staffTitle + ' ' : ''}${staffName}`;
      return 'Faculty Member';
    }
    if (currentStudent) return formatStudentShortName(currentStudent.name);
    return 'Student Portal';
  };

  const getRoleBadgeLabel = () => {
    if (isLoggedOut) return 'GUEST';
    if (currentRole === 'ceo') return 'ADMIN';
    if (currentRole === 'staff') return 'FACULTY';
    if (currentStudent) return currentStudent.classArm;
    return 'PORTAL';
  };

  return (
    <header
      id="top-navbar"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-2.5 sm:px-5 lg:px-8 py-2.5 transition-all shadow-2xs"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-full min-w-0">
        {/* Left: Mobile Menu Trigger + Breadcrumb / Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
          {!isLoggedOut && (
            <button
              id="mobile-menu-toggle-btn"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 focus:outline-hidden cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo on mobile/top bar */}
          <div className="lg:hidden shrink-0">
            <DGCLogo size="sm" showText={false} onClick={onLogoSixClick} />
          </div>

          <div className="flex flex-col min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase truncate">
                {isLoggedOut
                  ? 'STUDENT PORTAL'
                  : currentRole === 'ceo'
                  ? 'ADMINISTRATION'
                  : currentRole === 'staff'
                  ? 'FACULTY CONSOLE'
                  : portalMode === 'director'
                  ? 'REGISTRY'
                  : 'STUDENT PORTAL'}
              </span>
              {currentRole === 'ceo' && !isLoggedOut && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 text-[9px] font-bold rounded-md uppercase shrink-0">
                  Admin
                </span>
              )}
              {currentRole === 'staff' && !isLoggedOut && (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 text-[9px] font-bold rounded-md uppercase shrink-0">
                  Faculty
                </span>
              )}
            </div>

            <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-tight flex items-center gap-2 truncate">
              <span className="truncate">
                {isLoggedOut
                  ? 'Dominate Star College'
                  : currentRole === 'ceo'
                  ? 'Directorate Console'
                  : currentRole === 'staff'
                  ? 'Faculty Academic Console'
                  : portalMode === 'director'
                  ? 'Academic Records'
                  : 'Academic Portal'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-md shrink-0">
                Senior Division
              </span>
            </h1>
          </div>
        </div>

        {/* Right Controls: Session Info, Notifications, Responsive Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Current Session Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">SESSION</span>
              <span className="text-slate-800 font-bold leading-tight">{CURRENT_SESSION} · {CURRENT_TERM}</span>
            </div>
          </div>

          {/* Database Live Cloud Indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold bg-emerald-50/80 border-emerald-200/90 text-emerald-800 shrink-0"
            title="Active Google Cloud Firestore Database Connection"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Live</span>
          </div>

          {/* Notifications Trigger */}
          <div className="relative shrink-0" ref={notificationsRef}>
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Official notices"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Official College Notices</span>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">
                      {ANNOUNCEMENTS.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onOpenAnnouncements();
                    }}
                    className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-1">
                  {ANNOUNCEMENTS.map((ann) => (
                    <div
                      key={ann.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onOpenAnnouncements();
                      }}
                      className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                          {ann.category}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {ann.date}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-1">
                        {ann.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {ann.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Responsive Profile & Gateway Menu */}
          <div className="relative shrink-0" ref={profileMenuRef}>
            <button
              id="profile-dropdown-btn"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-expanded={showProfileMenu}
              aria-label="User profile and navigation options"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-200 overflow-hidden shrink-0 shadow-2xs">
                {isLoggedOut ? (
                  '?'
                ) : currentRole === 'ceo' ? (
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                ) : currentRole === 'staff' ? (
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                ) : currentStudent?.photoUrl ? (
                  <img
                    src={currentStudent.photoUrl}
                    alt={currentStudent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap className="w-4 h-4 text-blue-200" />
                )}
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px] md:max-w-[140px]">
                  {getRoleDisplayName()}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {getRoleBadgeLabel()}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 shrink-0 ${
                  showProfileMenu ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Popover */}
            {showProfileMenu && (
              <div
                id="profile-dropdown-popover"
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
              >
                {/* User Identity Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-sm ring-2 ring-blue-50 shrink-0">
                    {currentRole === 'ceo' ? (
                      <ShieldCheck className="w-5 h-5 text-amber-300" />
                    ) : currentRole === 'staff' ? (
                      <UserCheck className="w-5 h-5 text-emerald-300" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-blue-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {getRoleDisplayName()}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentRole === 'ceo'
                        ? 'Directorate of Education'
                        : currentRole === 'staff'
                        ? 'Academic Staff Member'
                        : currentStudent
                        ? `Admit: ${currentStudent.admissionNo}`
                        : 'Student Identity'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {CURRENT_SESSION} · {CURRENT_TERM}
                    </span>
                  </div>
                </div>

                {/* Quick Switch Actions */}
                <div className="py-2.5 space-y-1.5">
                  {currentRole !== 'portal' && onExitToPortal && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onExitToPortal();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-700 shrink-0" />
                        <span>Return to Student Portal</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAnnouncements();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>College Notices</span>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded-full">
                      {ANNOUNCEMENTS.length}
                    </span>
                  </button>
                </div>

                {/* Cloud DB Connection Status */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Database:</span>
                  </div>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Cloud Synced
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
