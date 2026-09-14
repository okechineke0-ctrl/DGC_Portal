import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  User,
  ShieldAlert,
  Info,
  Trash2,
  Camera,
  Save,
  Check,
  Building,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { DGCLogo } from './DGCLogo';
import { CURRENT_SESSION, CURRENT_TERM } from '../data/mockData';

interface StudentSettingsViewProps {
  student: StudentProfile;
  onUpdateStudent: (updatedStudent: StudentProfile) => void;
}

export const StudentSettingsView: React.FC<StudentSettingsViewProps> = ({
  student,
  onUpdateStudent,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>(student.photoUrl || '');
  const [phone, setPhone] = useState<string>(student.phone || '');
  const [guardianPhone, setGuardianPhone] = useState<string>(student.guardianPhone || '');
  const [residentialAddress, setResidentialAddress] = useState<string>(student.residentialAddress || '');
  const [uniformCertified, setUniformCertified] = useState<boolean>(Boolean(student.photoUrl));
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file processing for both drag-and-drop and manual file picker
  const processImageFile = (file: File) => {
    setUploadError('');
    setSaveSuccess(false);

    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please upload an image file (JPG, PNG, or WebP).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB. Please upload a smaller passport photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPhotoPreview(result);
        setUniformCertified(false); // require re-affirmation for newly uploaded picture
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try selecting another photograph.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setUniformCertified(false);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (photoPreview && !uniformCertified) {
      setUploadError('Please check the confirmation box certifying that this photograph was taken in official school uniform.');
      return;
    }

    setIsSaving(true);

    const updated: StudentProfile = {
      ...student,
      photoUrl: photoPreview || undefined,
      phone: phone.trim() || undefined,
      guardianPhone: guardianPhone.trim() || student.guardianPhone,
      residentialAddress: residentialAddress.trim() || student.residentialAddress,
    };

    try {
      await onUpdateStudent(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch {
      setUploadError('Failed to persist profile settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 font-bold text-xl shadow-inner shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={student.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <User className="w-7 h-7 text-amber-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-400 text-blue-950">
                  Student Portal Settings
                </span>
                <span className="text-[11px] text-blue-200 font-mono">
                  {student.admissionNo}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-white mt-1">
                Profile & Passport Photo Settings
              </h2>
              <p className="text-xs text-blue-200/90 mt-0.5">
                {student.name} · {student.classArm}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs bg-white/10 py-2.5 px-3.5 rounded-xl border border-white/15">
            <span className="text-[10px] text-blue-300 uppercase font-bold block">Academic Record</span>
            <span className="font-bold text-white">{CURRENT_SESSION} · {CURRENT_TERM}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STRICT REGULATORY WARNING: SCHOOL UNIFORM PASSPORT PHOTOGRAPH            */}
      {/* ========================================================================= */}
      <div
        id="uniform-strict-warning-banner"
        className="bg-amber-50/95 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-sm text-slate-900 space-y-4 relative overflow-hidden"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-900 text-amber-100 text-[10px] font-extrabold uppercase tracking-wider">
                Strict Regulatory Warning
              </span>
              <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                Dominion Stars Global College Disciplinary Council
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-amber-950 font-serif-title">
              Mandatory School Uniform Policy for Passport Photograph Upload
            </h3>

            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              The photograph you upload here serves as your <strong>official college passport identity</strong> across all terminal broadsheets, report cards, WAEC/NECO continuous assessment dossiers, and bursary clearance certificates.
              You must upload a picture where you are <strong>strictly wearing the approved Dominion Stars Global College school uniform</strong>.
            </p>
          </div>
        </div>

        {/* Requirements & Prohibitions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Approved Standards */}
          <div className="bg-white/90 p-4 rounded-2xl border border-emerald-300 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="uppercase tracking-wider">Approved Passport Requirements</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Student <strong>must be dressed in the official DGC school uniform</strong> with the College badge/crest clearly visible.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Formal, direct front-facing portrait with a plain, neutral light background (white or light blue).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Both ears, eyes, and full facial contours visible without dark shadows or side angles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Clear, sharp, unedited passport-sized resolution (35mm × 45mm standard).</span>
              </li>
            </ul>
          </div>

          {/* Strictly Prohibited */}
          <div className="bg-white/90 p-4 rounded-2xl border border-rose-300 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="uppercase tracking-wider">Strictly Prohibited & Penalties</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span><strong>No casual street wear, mufti, T-shirts, party attire</strong>, or jerseys.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span><strong>No caps, beanies, berets, sunglasses, or tinted lenses</strong> (religious veils must leave face exposed).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span><strong>No digital beauty filters, Snapchat lenses, heavy cosmetics, or casual selfies</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✗</span>
                <span>Non-uniform photos will be <strong>rejected immediately by the Registrar</strong> and may result in broadsheet withholding.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-100/80 px-3.5 py-2 rounded-xl text-[11px] font-bold text-amber-950 flex items-center gap-2 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Notice: Photographs undergo verification by the College Academic Dean before printing on terminal report sheets.</span>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Student profile settings and official uniform passport photograph have been saved and synchronized successfully!</span>
        </div>
      )}

      {/* Error Notification */}
      {uploadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-semibold shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROFILE SETTINGS FORM                                                     */}
      {/* ========================================================================= */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Passport Photo Upload Console */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif-title flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-900" />
                <span>Uniform Passport Photograph Upload</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official 35mm × 45mm passport photograph in College uniform.
              </p>
            </div>
            {photoPreview && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Photo Selected</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left: Live Passport Frame Preview */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Passport Preview Card
              </span>

              {/* Passport Box (Standard 35x45 Aspect Ratio) */}
              <div className="w-36 h-44 rounded-xl border-4 border-white shadow-md bg-slate-200 relative overflow-hidden flex flex-col items-center justify-center group">
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Student Uniform Passport"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white text-blue-950 rounded-full font-bold shadow-md hover:scale-105 transition-transform text-[11px]"
                        title="Change Photograph"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3 text-center space-y-2">
                    <User className="w-12 h-12 text-slate-400 mx-auto" />
                    <span className="text-[10px] text-slate-500 font-semibold leading-tight block">
                      No Uniform Passport Uploaded
                    </span>
                  </div>
                )}

                {/* DGC Passport Seal Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-blue-950/80 text-[8px] font-mono text-amber-300 py-0.5 text-center tracking-widest uppercase">
                  DOMINION STARS GLOBAL COLLEGE
                </div>
              </div>

              {photoPreview && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-bold text-blue-950 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Drag and Drop & Manual Selection Zone */}
            <div className="md:col-span-2 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="passport-file-input"
              />

              {/* Drag-and-drop & Click Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
                  isDragging
                    ? 'border-blue-900 bg-blue-50/70 scale-99'
                    : 'border-slate-300 hover:border-blue-900/60 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
                  <UploadCloud className="w-6 h-6 text-blue-900" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Drag and drop your uniform passport photograph here, or{' '}
                    <span className="text-blue-950 underline font-extrabold">browse files</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports JPG, PNG, or WebP format · Maximum file size 5MB
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 text-[10px] font-bold rounded-full border border-amber-200">
                  <ShieldAlert className="w-3 h-3 text-amber-700" />
                  <span>Must be dressed in official DGC College uniform</span>
                </div>
              </div>

              {/* Uniform Certification Checkbox */}
              {photoPreview && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={uniformCertified}
                      onChange={(e) => setUniformCertified(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-900 focus:ring-blue-900/30 border-slate-300"
                    />
                    <div className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block">
                        I solemnly certify that this photograph was taken while wearing the official DGC school uniform.
                      </span>
                      <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                        I understand that submitting a photograph in casual clothes, party attire, or non-uniform dress violates college disciplinary guidelines and will be revoked by the school administration.
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information & Biodata Console */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-serif-title flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-900" />
              <span>Contact & Identity Details</span>
            </h3>
            <p className="text-xs text-slate-500">
              Provide student and guardian phone contact numbers for college alerts and bursary notices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name (Official Record - Read Only) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Official Student Name:
              </label>
              <input
                type="text"
                disabled
                value={student.name}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">
                Official name on college broadsheet records.
              </span>
            </div>

            {/* Admission Number (Official Record - Read Only) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                College Admission Number:
              </label>
              <input
                type="text"
                disabled
                value={student.admissionNo}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">
                Permanent matriculation identifier.
              </span>
            </div>

            {/* Class Arm & Department (Official Record - Read Only) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Enrolled Class & Department:
              </label>
              <input
                type="text"
                disabled
                value={`${student.classArm} (${student.stream || 'General'} Stream)`}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">
                Assigned academic division for {CURRENT_SESSION}.
              </span>
            </div>

            {/* Student Phone Number (OPTIONAL AS REQUESTED) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 block">
                  Student Phone Number:
                </label>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-900 rounded-full">
                  Optional
                </span>
              </div>
              <div className="relative">
                <input
                  id="student-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +234 801 234 5678 (Optional)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                />
              </div>
              <span className="text-[10px] text-slate-500">
                Optional: Mobile number for SMS dispatch of broadsheet results and timetable notices.
              </span>
            </div>

            {/* Guardian Phone Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Parent / Guardian Phone Number:
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
              <span className="text-[10px] text-slate-500">
                Primary contact for bursary dues receipts and parent-teacher council communiques.
              </span>
            </div>

            {/* Residential Address */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Residential Address:
              </label>
              <input
                type="text"
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="e.g. Plot 14 College Road, Enugu State"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
              <span className="text-[10px] text-slate-500">
                Registered residential location for day-scholar and boarding records.
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>All updates are synchronized directly with collegiate registrar servers.</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile & Settings'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
