import React from 'react';
import { Bell, X, Calendar, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ANNOUNCEMENTS, SCHOOL_NAME, SCHOOL_LOCATION } from '../data/mockData';

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                College Bulletins & Official Notices
              </h3>
              <p className="text-xs text-slate-500">
                {SCHOOL_NAME} · {SCHOOL_LOCATION}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {ANNOUNCEMENTS.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-2xl border transition-all ${
                ann.urgent
                  ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                  : 'bg-white border-slate-200/90 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      ann.urgent
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {ann.category}
                  </span>
                  {ann.urgent && (
                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Priority Action
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {ann.date}
                </span>
              </div>

              <h4 className="font-bold text-sm sm:text-base text-slate-900 mt-1">
                {ann.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {ann.content}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Audience: <strong>{ann.targetAudience}</strong></span>
                <span>Office of the Academic Registrar</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            Official communications signed by College Principal
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl transition-colors"
          >
            Close Notices
          </button>
        </div>
      </div>
    </div>
  );
};
