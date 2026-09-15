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
  };
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
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Breadcrumb / Brand Logo */}
        <div className="flex items-center gap-3">
          {!isLoggedOut && (
            <button
              id="mobile-menu-toggle-btn"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo on mobile/top bar */}
          <div className="lg:hidden">
            <DGCLogo size="sm" showText={false} onClick={onLogoTripleClick || onOpenGateway} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                {isLoggedOut
                  ? 'STUDENT PORTAL AUTHENTICATION'
                  : currentRole === 'ceo'
                  ? 'OFFICE OF THE CEO'
                  : currentRole === 'staff'
                  ? 'STAFF ASSESSMENT PORTAL'
                  : portalMode === 'director'
                  ? 'COLLEGIATE ACADEMIC OPERATIONS'
                  : 'STUDENT PORTAL'}
              </span>
              {currentRole === 'ceo' && !isLoggedOut && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-extrabold rounded-md uppercase">
                  Executive
                </span>
              )}
              {currentRole === 'staff' && !isLoggedOut && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 text-[9px] font-extrabold rounded-md uppercase">
                  Teacher
                </span>
              )}
            </div>

            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
              <span>
                {isLoggedOut
                  ? 'Dominion Stars Global College'
                  : currentRole === 'ceo'
                  ? 'Central Administration & Result Control'
                  : currentRole === 'staff'
                  ? 'Continuous Assessment Grading Console'
                  : portalMode === 'director'
                  ? 'Student Directory & Academic Records'
                  : 'Terminal Academic & Result Portal'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
                Senior Academic Division
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold transition-all shadow-2xs"
              title="Teachers & Administration Portal Access"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Staff / Admin</span>
            </button>
          )}

          {/* Current Session Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-800" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">CURRENT SESSION</span>
              <span className="text-slate-800 font-bold leading-tight">{CURRENT_SESSION} · {CURRENT_TERM}</span>
            </div>
          </div>

          {/* Database Live Cloud Indicator */}
          <div
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold bg-emerald-50/80 border-emerald-200/90 text-emerald-800"
            title="Active Google Cloud Firestore Database Connection"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Firestore DB</span>
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
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
                    className="text-[11px] font-semibold text-blue-700 hover:underline"
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

          {/* Profile pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-50 overflow-hidden shrink-0">
              {isLoggedOut ? (
                '?'
              ) : currentRole === 'ceo' ? (
                'CEO'
              ) : currentRole === 'staff' ? (
                'STA'
              ) : portalMode === 'director' ? (
                'D'
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
                  ? 'Guest / Portal Sign-In'
                  : currentRole === 'ceo'
                  ? 'Governing Council'
                  : currentRole === 'staff'
                  ? 'Teaching Staff'
                  : portalMode === 'director'
                  ? 'registrar@dgc.edu.ng'
                  : currentStudent
                  ? currentStudent.name
                  : 'Student Account'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {isLoggedOut
                  ? 'AUTHENTICATION REQUIRED'
                  : currentRole === 'ceo'
                  ? 'CHIEF EXECUTIVE'
                  : currentRole === 'staff'
                  ? 'STAFF TUTOR'
                  : portalMode === 'director'
                  ? 'COLLEGE REGISTRAR'
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
