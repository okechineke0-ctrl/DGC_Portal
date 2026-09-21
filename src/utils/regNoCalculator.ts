/**
 * Institutional Registration Number and Admission Year Calculation Engine
 * Dominate Star College - Awgu, Enugu State
 *
 * Implements standard Nigerian 6-Year Secondary Education (JSS 1 - SS 3)
 * cohort tracking for regular admissions and mid-stream transfer students.
 */

import { StudentProfile } from '../types';

export const SECONDARY_CLASS_LEVELS = [
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SS 1',
  'SS 2',
  'SS 3',
] as const;

export type SecondaryClassLevel = (typeof SECONDARY_CLASS_LEVELS)[number];

export const CLASS_LEVEL_ORDER: Record<SecondaryClassLevel, number> = {
  'JSS 1': 1,
  'JSS 2': 2,
  'JSS 3': 3,
  'SS 1': 4,
  'SS 2': 5,
  'SS 3': 6,
};

/**
 * Extracts normalized level (e.g., "SS 1") from a class arm name (e.g., "SS 1A", "SS 3 Science").
 */
export function extractLevelFromClass(className: string): SecondaryClassLevel {
  const trimmed = (className || '').trim();
  if (trimmed.startsWith('SS 3')) return 'SS 3';
  if (trimmed.startsWith('SS 2')) return 'SS 2';
  if (trimmed.startsWith('SS 1')) return 'SS 1';
  if (trimmed.startsWith('JSS 3')) return 'JSS 3';
  if (trimmed.startsWith('JSS 2')) return 'JSS 2';
  if (trimmed.startsWith('JSS 1')) return 'JSS 1';
  return 'JSS 1';
}

/**
 * Parses the base starting calendar year from an academic session string (e.g., "2026/2027" -> 2026).
 */
export function parseSessionStartYear(session: string): number {
  if (!session) return 2026;
  const match = session.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : 2026;
}

export interface RegCalculationInput {
  currentSession: string; // e.g. "2026/2027"
  targetClass: string; // e.g. "SS 1A", "SS 3 Science"
  enrollmentType: 'Regular Intake' | 'Transfer Student';
  transferClassJoined?: string; // Class at which transfer student entered DGC, e.g. "SS 1"
  customAdmissionYear?: number; // Manual override if admin wants a specific year
}

export interface RegCalculationOutput {
  admissionYear: number;
  yearsElapsedInCollege: number;
  isTransfer: boolean;
  level: SecondaryClassLevel;
  joinedLevel: SecondaryClassLevel;
  explanation: string;
}

/**
 * Computes exact admission year based on cohort progression and transfer entry point.
 */
export function calculateAdmissionYear({
  currentSession,
  targetClass,
  enrollmentType,
  transferClassJoined,
  customAdmissionYear,
}: RegCalculationInput): RegCalculationOutput {
  const sessionStartYear = parseSessionStartYear(currentSession);
  const currentLevel = extractLevelFromClass(targetClass);
  const currentOrdinal = CLASS_LEVEL_ORDER[currentLevel] || 1;
  const isTransfer = enrollmentType === 'Transfer Student';

  // If administrator provided a manual override year, honor it directly
  if (customAdmissionYear && customAdmissionYear >= 2018 && customAdmissionYear <= 2030) {
    const elapsed = Math.max(0, sessionStartYear - customAdmissionYear);
    return {
      admissionYear: customAdmissionYear,
      yearsElapsedInCollege: elapsed,
      isTransfer,
      level: currentLevel,
      joinedLevel: isTransfer
        ? extractLevelFromClass(transferClassJoined || targetClass)
        : 'JSS 1',
      explanation: `Manual Admission Year: ${customAdmissionYear} (Recorded in ${targetClass})`,
    };
  }

  if (!isTransfer) {
    // Regular Intake: Started at JSS 1 (ordinal = 1)
    // Years in secondary school = currentOrdinal - 1
    const yearsElapsed = currentOrdinal - 1;
    const admissionYear = sessionStartYear - yearsElapsed;
    const explanation =
      yearsElapsed === 0
        ? `Regular Intake: Enrolled at JSS 1 in ${admissionYear} (Current Intake)`
        : `Regular Intake: Enrolled at JSS 1 in ${admissionYear} · Currently in ${currentLevel} (${yearsElapsed} year${
            yearsElapsed > 1 ? 's' : ''
          } in DGC)`;

    return {
      admissionYear,
      yearsElapsedInCollege: yearsElapsed,
      isTransfer: false,
      level: currentLevel,
      joinedLevel: 'JSS 1',
      explanation,
    };
  }

  // Transfer Student: Joined Dominate Star College at a specific class level
  const joinedClass = transferClassJoined ? extractLevelFromClass(transferClassJoined) : currentLevel;
  const joinedOrdinal = CLASS_LEVEL_ORDER[joinedClass] || currentOrdinal;

  // Transfer cannot occur after current placement
  const safeJoinedOrdinal = Math.min(joinedOrdinal, currentOrdinal);
  const yearsInCollege = currentOrdinal - safeJoinedOrdinal;
  const admissionYear = sessionStartYear - yearsInCollege;

  const explanation =
    yearsInCollege === 0
      ? `Transfer Enrolment: Transferred into ${currentLevel} in ${admissionYear} (Current Intake)`
      : `Transfer Enrolment: Transferred into ${joinedClass} in ${admissionYear} · Progressed to ${currentLevel} (${yearsInCollege} year${
          yearsInCollege > 1 ? 's' : ''
        } in DGC)`;

  return {
    admissionYear,
    yearsElapsedInCollege: yearsInCollege,
    isTransfer: true,
    level: currentLevel,
    joinedLevel: joinedClass,
    explanation,
  };
}

/**
 * Inspects all existing students in the system and suggests the next sequential Registration Number
 * for a specific admission cohort year (e.g. DGC/2023/0433).
 */
export function generateNextRegNumber(
  admissionYear: number,
  existingStudents: Array<{ admissionNo?: string }>
): string {
  const yearPattern = new RegExp(`^DGC\\/${admissionYear}\\/(\\d+)$`, 'i');
  let highestSeq = 0;

  existingStudents.forEach((st) => {
    if (!st.admissionNo) return;
    const match = st.admissionNo.trim().match(yearPattern);
    if (match && match[1]) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > highestSeq) {
        highestSeq = seq;
      }
    }
  });

  // If existing cohort numbers were found, increment the highest
  if (highestSeq > 0) {
    const nextSeq = highestSeq + 1;
    const padLength = Math.max(4, String(nextSeq).length);
    return `DGC/${admissionYear}/${String(nextSeq).padStart(padLength, '0')}`;
  }

  // Baseline standard cohort sequence seed for new years
  const baseSeedMap: Record<number, number> = {
    2021: 140,
    2022: 210,
    2023: 310,
    2024: 410,
    2025: 510,
    2026: 601,
    2027: 701,
  };

  const seed = baseSeedMap[admissionYear] || 101;
  return `DGC/${admissionYear}/${String(seed).padStart(4, '0')}`;
}

/**
 * Validates registration number syntax and detects collisions with existing students.
 */
export function validateRegNumber(
  regNo: string,
  existingStudents: Array<{ id?: string; name?: string; admissionNo?: string }>,
  excludeStudentId?: string
): {
  isValid: boolean;
  year?: number;
  sequence?: string;
  error?: string;
  collisionStudentName?: string;
} {
  const clean = (regNo || '').trim().toUpperCase();
  if (!clean) {
    return { isValid: false, error: 'Registration number is required.' };
  }

  const match = clean.match(/^DGC\/(\d{4})\/(\d{3,5})$/i);
  if (!match) {
    return {
      isValid: false,
      error: 'Format must follow official standard: DGC/YYYY/NNNN (e.g. DGC/2023/0432)',
    };
  }

  const year = parseInt(match[1], 10);
  const sequence = match[2];

  if (year < 2018 || year > 2030) {
    return {
      isValid: false,
      year,
      sequence,
      error: `Admission year ${year} is outside valid college operational span (2018 - 2030).`,
    };
  }

  // Check uniqueness
  const conflict = existingStudents.find(
    (s) =>
      s.admissionNo &&
      s.admissionNo.trim().toUpperCase() === clean &&
      s.id !== excludeStudentId
  );

  if (conflict) {
    return {
      isValid: false,
      year,
      sequence,
      error: `Registration Number '${clean}' is already assigned to ${conflict.name || 'another student'}.`,
      collisionStudentName: conflict.name,
    };
  }

  return {
    isValid: true,
    year,
    sequence,
  };
}
