/**
 * Unified formatting utilities for Dominion Star Global College
 */

export const SCHOOL_NAME_SHORT = 'Dominion Star Global College';

/**
 * Formats full names to concise professional academic format
 * e.g. "Okeke Chiemerie Samuel" -> "Okeke Chiemerie S."
 * e.g. "Chidera Emmanuel Okonkwo" -> "Okonkwo Chidera E." or "Chidera Emmanuel O."
 */
export function formatStudentShortName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  
  // If already formatted like "Okeke Chiemerie S." or "Okeke Chiemerie.S"
  if (/[A-Z]\.?$/i.test(trimmed) && trimmed.split(/\s+/).length <= 3) {
    return trimmed;
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
  
  // 3 or more parts: e.g. "Okeke Chiemerie Samuel" -> "Okeke Chiemerie S."
  const first = parts[0];
  const second = parts[1];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${second} ${lastInitial}.`;
}

/**
 * Formats staff names to proper Title Case
 * e.g. "Ben uke" -> "Ben Uke"
 */
export function formatStaffName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      if (/^[A-Z]\.?$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
