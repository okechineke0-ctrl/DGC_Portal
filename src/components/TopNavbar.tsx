import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Menu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Filter,
  Lock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { DGCLogo } from './DGCLogo';
import { ANNOUNCEMENTS, CURRENT_SESSION, CURRENT_TERM } from '../data/originalData';
import { formatStudentShortName } from '../utils/formatters';

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
  portalMode: 'director' | 'student';
  setPortalMode: (mode: 'director' | 'student') => void;
  onOpenAnnouncements: () => void;
  onOpenGateway?: () => void;
  onLogoTripleClick?: () => void;
  currentRole?: 'portal' | 'staff' | 'ceo';
  isLoggedOut?: boolean;
  isDbLive?: boolean;
  currentStudent?: {
    name: string;
    classArm: string;
    admissionNo: string;
    photoUrl?: string;
  } | null;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileMenu,
  portalMode,
  setPortalMode,
  onOpenAnnouncements,
  onOpenGateway,
  onLogoTripleClick,
  currentRole = 'portal',
  isLoggedOut = false,
  isDbLive = true,
  currentStudent,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      id="top-navbar"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Breadcrumb / Brand Logo */}
        <div className="flex items-center gap-3">
          {!isLoggedOut && (
            <button
              id="mobile-menu-toggle-btn"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-sky-50 focus:outline-hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo on mobile/top bar */}
          <div className="lg:hidden">
            <DGCLogo size="sm" showText={false} onClick={onLogoTripleClick} />
          </div>

          <div className="flex flex-col min-w-0">
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
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 text-[9px] font-bold rounded-md uppercase">
                  Admin
                </span>
              )}
              {currentRole === 'staff' && !isLoggedOut && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 text-[9px] font-bold rounded-md uppercase">
                  Faculty
                </span>
              )}
            </div>

            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight flex items-center gap-2 truncate">
              <span className="truncate">
                {isLoggedOut
                  ? 'Dominate Star College'
                  : currentRole === 'ceo'
                  ? 'Administration'
                  : currentRole === 'staff'
                  ? 'Faculty Console'
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

        {/* Right Controls: Gateway Quick Button, Session Info, Notification, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Gateway Button if in standard portal mode (hidden when logged out) */}
          {currentRole === 'portal' && !isLoggedOut && onOpenGateway && (
            <button
              onClick={onOpenGateway}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Staff & Administration Portal Access"
            >
              <Lock className="w-3.5 h-3.5 text-slate-300" />
              <span>Staff / Admin</span>
            </button>
          )}

          {/* Current Session Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">SESSION</span>
              <span className="text-slate-800 font-bold leading-tight">{CURRENT_SESSION} · {CURRENT_TERM}</span>
            </div>
          </div>

          {/* Database Live Cloud Indicator */}
          <div
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold bg-emerald-50/80 border-emerald-200/90 text-emerald-800"
            title="Active Google Cloud Firestore Database Connection"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud DB</span>
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-sky-50 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-sky-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-sky-100 px-2">
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

                <div className="divide-y divide-sky-100 max-h-72 overflow-y-auto mt-1">
                  {ANNOUNCEMENTS.map((ann) => (
                    <div
                      key={ann.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onOpenAnnouncements();
                      }}
                      className="p-2.5 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-blue-800 bg-sky-50 px-2 py-0.5 rounded-md">
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

          {/* Profile pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-50 overflow-hidden shrink-0">
              {isLoggedOut ? (
                '?'
              ) : currentRole === 'ceo' ? (
                'ADM'
              ) : currentRole === 'staff' ? (
                'STA'
              ) : portalMode === 'director' ? (
                'REG'
              ) : currentStudent?.photoUrl ? (
                <img
                  src={currentStudent.photoUrl}
                  alt={currentStudent.name}
                  className="w-full h-full object-cover"
                />
              ) : currentStudent ? (
                currentStudent.name.charAt(0)
              ) : (
                'ST'
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {isLoggedOut
                  ? 'Guest Portal'
                  : currentRole === 'ceo'
                  ? 'Administrator'
                  : currentRole === 'staff'
                  ? 'Faculty Member'
                  : portalMode === 'director'
                  ? 'Registrar'
                  : currentStudent
                  ? formatStudentShortName(currentStudent.name)
                  : 'Student Account'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {isLoggedOut
                  ? 'SIGN-IN REQUIRED'
                  : currentRole === 'ceo'
                  ? 'ADMIN'
                  : currentRole === 'staff'
                  ? 'FACULTY'
                  : portalMode === 'director'
                  ? 'REGISTRY'
                  : currentStudent
                  ? currentStudent.classArm
                  : 'STUDENT'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
