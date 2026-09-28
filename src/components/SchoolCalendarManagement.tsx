import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building,
  GraduationCap,
  Printer,
  ChevronRight,
  FileText,
  Bell,
  Check,
  CalendarCheck,
  Lock,
} from 'lucide-react';
import { AcademicCalendarSettings } from '../types';
import { DEFAULT_ACADEMIC_CALENDAR } from '../data/originalData';

interface SchoolCalendarManagementProps {
  initialCalendar?: AcademicCalendarSettings;
  onUpdateCalendar?: (calendar: AcademicCalendarSettings) => Promise<boolean>;
  onNavigateToStudents?: () => void;
  onNavigateToFees?: () => void;
}

export const SchoolCalendarManagement: React.FC<SchoolCalendarManagementProps> = ({
  initialCalendar,
  onUpdateCalendar,
  onNavigateToStudents,
  onNavigateToFees,
}) => {
  const [calendar, setCalendar] = useState<AcademicCalendarSettings>(() => {
    return initialCalendar || DEFAULT_ACADEMIC_CALENDAR;
  });

  const [currentSession, setCurrentSession] = useState<string>(
    initialCalendar?.currentSession || DEFAULT_ACADEMIC_CALENDAR.currentSession
  );
  const [currentTerm, setCurrentTerm] = useState<string>(
    initialCalendar?.currentTerm || DEFAULT_ACADEMIC_CALENDAR.currentTerm
  );
  const [nextTerm, setNextTerm] = useState<string>(
    initialCalendar?.nextTerm || DEFAULT_ACADEMIC_CALENDAR.nextTerm
  );
  const [resumptionDateRaw, setResumptionDateRaw] = useState<string>(
    initialCalendar?.resumptionDateRaw || DEFAULT_ACADEMIC_CALENDAR.resumptionDateRaw || '2027-01-11'
  );
  const [nextTermResumptionDate, setNextTermResumptionDate] = useState<string>(
    initialCalendar?.nextTermResumptionDate || DEFAULT_ACADEMIC_CALENDAR.nextTermResumptionDate
  );
  const [boardersResumptionDate, setBoardersResumptionDate] = useState<string>(
    initialCalendar?.boardersResumptionDate || DEFAULT_ACADEMIC_CALENDAR.boardersResumptionDate || ''
  );
  const [vacationDate, setVacationDate] = useState<string>(
    initialCalendar?.vacationDate || DEFAULT_ACADEMIC_CALENDAR.vacationDate || ''
  );
  const [resumptionNotice, setResumptionNotice] = useState<string>(
    initialCalendar?.resumptionNotice || DEFAULT_ACADEMIC_CALENDAR.resumptionNotice || ''
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    initialCalendar?.updatedAt ? new Date(initialCalendar.updatedAt).toLocaleTimeString() : ''
  );

  // Sync with initialCalendar when prop updates from parent
  useEffect(() => {
    if (initialCalendar) {
      setCalendar(initialCalendar);
      setCurrentSession(initialCalendar.currentSession);
      setCurrentTerm(initialCalendar.currentTerm);
      setNextTerm(initialCalendar.nextTerm);
      setNextTermResumptionDate(initialCalendar.nextTermResumptionDate);
      if (initialCalendar.resumptionDateRaw) {
        setResumptionDateRaw(initialCalendar.resumptionDateRaw);
      }
      if (initialCalendar.boardersResumptionDate) {
        setBoardersResumptionDate(initialCalendar.boardersResumptionDate);
      }
      if (initialCalendar.vacationDate) {
        setVacationDate(initialCalendar.vacationDate);
      }
      if (initialCalendar.resumptionNotice) {
        setResumptionNotice(initialCalendar.resumptionNotice);
      }
    }
  }, [initialCalendar]);

  // Handle HTML5 Date Picker Change
  const handleRawDateChange = (raw: string) => {
    setResumptionDateRaw(raw);
    if (!raw) return;

    try {
      const parts = raw.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);

        const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
        const monthName = d.toLocaleDateString('en-GB', { month: 'long' });

        // English ordinal suffix
        let suffix = 'th';
        if (day % 10 === 1 && day !== 11) suffix = 'st';
        else if (day % 10 === 2 && day !== 12) suffix = 'nd';
        else if (day % 10 === 3 && day !== 13) suffix = 'rd';

        const formatted = `${weekday}, ${day}${suffix} ${monthName}, ${year}`;
        setNextTermResumptionDate(formatted);

        // Auto-suggest boarder date (day before at 4:00 PM)
        const boarderDay = new Date(year, month, day - 1);
        const bWeekday = boarderDay.toLocaleDateString('en-GB', { weekday: 'long' });
        const bMonthName = boarderDay.toLocaleDateString('en-GB', { month: 'long' });
        const bDayNum = boarderDay.getDate();
        let bSuffix = 'th';
        if (bDayNum % 10 === 1 && bDayNum !== 11) bSuffix = 'st';
        else if (bDayNum % 10 === 2 && bDayNum !== 12) bSuffix = 'nd';
        else if (bDayNum % 10 === 3 && bDayNum !== 13) bSuffix = 'rd';

        setBoardersResumptionDate(`${bWeekday}, ${bDayNum}${bSuffix} ${bMonthName}, ${year} (by 4:00 PM)`);
      }
    } catch {
      // Fallback
    }
  };

  // Submit and broadcast the official calendar schedule
  const handleSaveCalendar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    const payload: AcademicCalendarSettings = {
      id: calendar.id || 'academic_calendar',
      currentSession,
      currentTerm,
      nextTerm,
      nextTermResumptionDate: nextTermResumptionDate.trim(),
      resumptionDateRaw,
      boardersResumptionDate: boardersResumptionDate.trim(),
      vacationDate: vacationDate.trim(),
      resumptionNotice: resumptionNotice.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'College Directorate of Academic Affairs',
    };

    try {
      // 1. Post to backend Express server API
      const res = await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to persist calendar configuration to server.');
      }

      const responseData = await res.json();
      const savedData = responseData.calendar || payload;

      setCalendar(savedData);
      setLastUpdatedTime(new Date().toLocaleTimeString());

      // 2. Notify parent App callback if provided
      if (onUpdateCalendar) {
        await onUpdateCalendar(savedData);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      console.error('[Calendar Save Error]', err);
      setSaveError(err.message || 'Error updating academic calendar.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate days until resumption
  const getDaysUntilResumption = () => {
    if (!resumptionDateRaw) return null;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(resumptionDateRaw);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const daysRemaining = getDaysUntilResumption();

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE DIRECTORATE HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Directorate of Academic Affairs
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-900/60 text-blue-200 border border-blue-700/40">
                Statutory Gazette
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-title tracking-tight text-white flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-amber-300 shrink-0" />
              <span>School Resumption Date & Academic Calendar</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              The Directorate of Administration officially gazettes when the college resumes each term.
              Dates, boarder windows, and official guidelines entered here update all student result broadsheets,
              portal notifications, and printed reports in real time.
            </p>
          </div>

          {/* Active Resumption Status Indicator */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-4 sm:p-5 shrink-0 max-w-xs space-y-2 text-center md:text-left shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
              Active College Schedule
            </span>
            <div className="space-y-0.5">
              <span className="text-xs text-slate-300 block font-mono">
                {currentSession} · {currentTerm}
              </span>
              <span className="text-base font-bold text-white block">
                {nextTermResumptionDate}
              </span>
            </div>
            {daysRemaining !== null && (
              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Countdown:</span>
                <span className={`font-mono font-bold ${daysRemaining > 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : daysRemaining === 0 ? 'Resuming Today' : 'Term Underway'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS & NOTIFICATION ALERTS */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-950 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-900">
              School Resumption Date Successfully Synchronized!
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              The Directorate's resumption schedule (<strong>{nextTermResumptionDate}</strong>) has been permanently saved to the institutional database.
              All student report cards, terminal broadsheets, portal banners, and parent slips now display this verified date.
            </p>
            {lastUpdatedTime && (
              <span className="text-[10px] text-emerald-700 block font-mono">
                Verified at: {lastUpdatedTime} · Directorate of Academic Affairs
              </span>
            )}
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-rose-950 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-900">Configuration Error</h4>
            <p className="text-xs text-rose-800">{saveError}</p>
          </div>
        </div>
      )}

      {/* 2. MAIN RESUMPTION CONFIGURATION FORM */}
      <form onSubmit={handleSaveCalendar} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Dates and Guidelines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card A: School Resumption Scheduling & Date Picker */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Resumption Date Determination
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set the exact calendar date when all scholars report back to campus.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 uppercase">
                Directorate Controlled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Picker Input (ISO) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Resumption Date (Calendar Picker) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="admin-resumption-date-picker"
                    value={resumptionDateRaw}
                    onChange={(e) => handleRawDateChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer min-h-[42px]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Selecting a date automatically standardizes the day, suffix, and month format.
                </span>
              </div>

              {/* Formatted Date Display / Manual Fine-Tune */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Official Formatted Resumption String <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="admin-resumption-date-formatted-input"
                  value={nextTermResumptionDate}
                  onChange={(e) => setNextTermResumptionDate(e.target.value)}
                  placeholder="e.g. Monday, 11th January, 2027"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all min-h-[42px]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  This exact text prints in bold on student terminal report card footers.
                </span>
              </div>

              {/* Boarders' Resumption Window */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Boarding Scholars Arrival Window
                </label>
                <input
                  type="text"
                  id="admin-boarders-resumption-input"
                  value={boardersResumptionDate}
                  onChange={(e) => setBoardersResumptionDate(e.target.value)}
                  placeholder="e.g. Sunday, 10th January, 2027 (by 4:00 PM)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all min-h-[42px]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Hostel check-in and house master roll-call timing for boarders.
                </span>
              </div>

              {/* Term Vacation / Closing Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Term Vacation / Closing Date
                </label>
                <input
                  type="text"
                  id="admin-vacation-date-input"
                  value={vacationDate}
                  onChange={(e) => setVacationDate(e.target.value)}
                  placeholder="e.g. Friday, 18th December, 2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all min-h-[42px]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Official date the college vacates for holidays.
                </span>
              </div>
            </div>

            {/* Quick Presets Strip */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => handleRawDateChange('2027-01-11')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
              >
                11th Jan 2027 (Second Term)
              </button>
              <button
                type="button"
                onClick={() => handleRawDateChange('2027-04-26')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
              >
                26th Apr 2027 (Third Term)
              </button>
              <button
                type="button"
                onClick={() => handleRawDateChange('2027-09-13')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
              >
                13th Sep 2027 (New Session)
              </button>
            </div>
          </div>

          {/* Card B: Academic Session & Term Alignment */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Academic Session & Term Alignment
                </h3>
                <p className="text-xs text-slate-500">
                  Select the active academic year and terminal transitions for the college.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Academic Session
                </label>
                <select
                  value={currentSession}
                  onChange={(e) => setCurrentSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer min-h-[42px]"
                >
                  <option value="2025/2026">2025/2026 Academic Session</option>
                  <option value="2026/2027">2026/2027 Academic Session</option>
                  <option value="2027/2028">2027/2028 Academic Session</option>
                  <option value="2028/2029">2028/2029 Academic Session</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Current Term Ending
                </label>
                <select
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer min-h-[42px]"
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Next Term Resuming
                </label>
                <select
                  value={nextTerm}
                  onChange={(e) => setNextTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer min-h-[42px]"
                >
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                  <option value="First Term (New Session)">First Term (New Session)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card C: Directorate Resumption Directives & Instructions */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 border border-slate-300 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Directorate Resumption Directives for Parents & Scholars
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official instructions printed on terminal reports and shown on student portal dash.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Directorate Circular Text
              </label>
              <textarea
                id="admin-resumption-notice-textarea"
                rows={3}
                value={resumptionNotice}
                onChange={(e) => setResumptionNotice(e.target.value)}
                placeholder="Specify uniform requirements, bursary clearance, assembly timing, or disciplinary guidelines..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Template options */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Standard Directorate Directives:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setResumptionNotice(
                      'All students are expected to resume in full official college uniform with verified bursary clearance and term result broadsheets. No late coming will be condoned.'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                >
                  Standard Uniform & Clearance
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setResumptionNotice(
                      'Boarders must report strictly between 12:00 PM and 4:00 PM with approved hostel supplies and medical clearance. General college assembly commences Monday 7:45 AM.'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                >
                  Boarders & Assembly Schedule
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setResumptionNotice(
                      'Senior scholars (SS 2 & SS 3) must arrive with continuous assessment notebooks and WAEC/NECO examination documentation. Bursary clearance is strictly enforced at the gate.'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                >
                  Senior Secondary & WAEC
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Broadsheet Preview & Save Button */}
        <div className="space-y-6">
          {/* Card D: Save & Broadcast Primary Action */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
              <h3 className="text-sm font-bold text-white font-serif-title">
                Broadcast Resumption Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Applying changes immediately synchronizes the database, broadcasts to student login portals,
              and embeds this real date into every student's printable report broadsheet.
            </p>

            <button
              type="submit"
              id="admin-save-resumption-schedule-btn"
              disabled={isSaving}
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 min-h-[44px]"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synchronizing Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Save & Broadcast Resumption Date</span>
                </>
              )}
            </button>

            {lastUpdatedTime && (
              <span className="text-[10px] text-slate-400 text-center block font-mono">
                Last synchronized: {lastUpdatedTime}
              </span>
            )}
          </div>

          {/* Card E: Live Broadsheet Result Preview */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Live Result Broadsheet Preview
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live Output
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              This preview reflects exactly how the student sees your resumption schedule at the bottom of their official terminal report card:
            </p>

            {/* Mock Report Card Footer Box */}
            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-400 space-y-2 text-slate-900 font-sans shadow-2xs">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-blue-950">
                <span>Principal & Directorate Endorsement:</span>
                <span className="text-[9px] text-emerald-800 font-mono">Verified ✓</span>
              </div>
              <p className="text-slate-700 italic text-[11px] leading-relaxed">
                "Result certified and ratified by the Directorate of Academic Affairs. Promoted in excellent standing."
              </p>
              <div className="pt-2 border-t border-slate-300 flex flex-col gap-1 text-[10px] text-slate-700">
                <div className="flex items-center justify-between">
                  <span>College Seal: <strong>AFFIXED</strong></span>
                  <span>
                    Next Term Resumption:{' '}
                    <strong className="text-blue-950 font-bold bg-amber-100 px-1 py-0.5 rounded">
                      {nextTermResumptionDate || 'Monday, 11th January, 2027'}
                    </strong>
                  </span>
                </div>
                {boardersResumptionDate && (
                  <div className="text-[9px] text-slate-500">
                    Boarders Return: <strong>{boardersResumptionDate}</strong>
                  </div>
                )}
              </div>

              {resumptionNotice && (
                <div className="pt-1.5 border-t border-slate-200 text-[9px] text-slate-600">
                  <strong className="text-amber-900 block font-semibold mb-0.5">Notice:</strong>
                  <span>{resumptionNotice}</span>
                </div>
              )}
            </div>

            {/* Student Dashboard Banner Mock Preview */}
            <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 block">
                Student Dashboard Announcement Strip:
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-200 font-mono">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Next Term Resumes: <strong className="text-amber-200">{nextTermResumptionDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Related Administration Hubs
            </span>
            <div className="space-y-1">
              {onNavigateToFees && (
                <button
                  type="button"
                  onClick={onNavigateToFees}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Configure Next Term Fees</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
              {onNavigateToStudents && (
                <button
                  type="button"
                  onClick={onNavigateToStudents}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>View Scholars Directory</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
