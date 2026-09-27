/**
 * Cyber Security & Software Engineering Algorithmic Library
 * Dominion Star Global College
 *
 * Implements:
 * 1. Damerau-Levenshtein String Distance (Transposition & Edit Matrix)
 * 2. Jaro-Winkler Prefix Similarity
 * 3. Phonetic Soundex Encoding
 * 4. Token Overlap & Resemblance Scoring Algorithm
 * 5. Input Sanitization & Anti-Injection Guard
 * 6. Privacy-Safe Identity Masking (Anti-PII Leakage)
 */

export interface SafeStudentSearchResult {
  admissionNo: string;
  displayName: string;
  classArm: string;
  level: string;
  stream: string;
  matchScore: number;
  confidenceGrade: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Normalizes user input for algorithmic processing
 */
export function normalizeSecurityInput(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/^(master|miss|mr|mrs|dr|chief|pastor|rev)\.?\s+/i, '')
    .replace(/[<>'";\\/`&{}]/g, ' ') // Strip potential script/injection chars
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates search query integrity and enforces anti-scraping length thresholds
 */
export function validateSearchQuery(query: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = normalizeSecurityInput(query);
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Search query cannot be empty.' };
  }
  if (sanitized.length < 3) {
    return { isValid: false, sanitized, error: 'For cyber security protection, please enter at least 3 characters.' };
  }
  if (sanitized.length > 60) {
    return { isValid: false, sanitized: sanitized.substring(0, 60), error: 'Query exceeds allowable character limit.' };
  }
  return { isValid: true, sanitized };
}

/**
 * Damerau-Levenshtein Distance Algorithm
 * Computes minimum edit distance including adjacent character transpositions
 */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition check
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Jaro-Winkler Similarity Metric
 * Optimized for prefix accuracy in proper names
 */
export function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const l1 = s1.length;
  const l2 = s2.length;
  if (l1 === 0 || l2 === 0) return 0.0;

  const matchDistance = Math.floor(Math.max(l1, l2) / 2) - 1;
  const s1Matches = new Array(l1).fill(false);
  const s2Matches = new Array(l2).fill(false);

  let matches = 0;
  for (let i = 0; i < l1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, l2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < l1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const m = matches;
  const jaro = (m / l1 + m / l2 + (m - transpositions / 2) / m) / 3.0;

  // Winkler prefix scaling (prefix up to 4 chars)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(l1, l2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1.0 - jaro);
}

/**
 * Phonetic Soundex Encoder for English & West African Names
 */
export function soundex(str: string): string {
  const s = normalizeSecurityInput(str).replace(/[^a-z]/g, '');
  if (!s) return '';

  const firstChar = s[0].toUpperCase();
  const map: Record<string, string> = {
    b: '1', f: '1', p: '1', v: '1',
    c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
    d: '3', t: '3',
    l: '4',
    m: '5', n: '5',
    r: '6',
  };

  let out = firstChar;
  let prevCode = map[s[0]] || '0';

  for (let i = 1; i < s.length && out.length < 4; i++) {
    const code = map[s[i]] || '0';
    if (code !== '0' && code !== prevCode) {
      out += code;
    }
    prevCode = code;
  }

  return out.padEnd(4, '0');
}

/**
 * Composite Software Engineering Resemblance Algorithm
 * Matches queries against candidate names & admission numbers with high precision
 */
export function evaluateCandidateResemblance(
  studentName: string,
  admissionNo: string,
  classArm: string,
  query: string
): { matches: boolean; score: number; confidenceGrade: 'HIGH' | 'MEDIUM' | 'LOW' } {
  const cleanQ = normalizeSecurityInput(query);
  const cleanName = normalizeSecurityInput(studentName);
  const cleanAdm = (admissionNo || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanQAdm = cleanQ.replace(/[^a-z0-9]/g, '');

  if (!cleanQ || cleanQ.length < 2) {
    return { matches: false, score: 0, confidenceGrade: 'LOW' };
  }

  // 1. Direct Admission Number match
  if (cleanAdm && cleanQAdm.length >= 3 && cleanAdm.includes(cleanQAdm)) {
    return { matches: true, score: 100, confidenceGrade: 'HIGH' };
  }

  // 2. Exact full name match
  if (cleanName === cleanQ) {
    return { matches: true, score: 100, confidenceGrade: 'HIGH' };
  }

  // 3. Substring inclusion match
  if (cleanName.includes(cleanQ)) {
    const ratio = Math.min(1.0, cleanQ.length / cleanName.length);
    const score = Math.round(85 + ratio * 15);
    return { matches: true, score, confidenceGrade: score >= 90 ? 'HIGH' : 'MEDIUM' };
  }
  if (cleanQ.includes(cleanName) && cleanName.length >= 5) {
    return { matches: true, score: 85, confidenceGrade: 'MEDIUM' };
  }

  // 4. Token-level Multi-Factor Comparison
  const qTokens = cleanQ.split(/\s+/).filter((t) => t.length >= 2);
  const nameTokens = cleanName.split(/\s+/).filter((t) => t.length >= 2);

  if (qTokens.length === 0 || nameTokens.length === 0) {
    return { matches: false, score: 0, confidenceGrade: 'LOW' };
  }

  let totalTokenScore = 0;

  for (const qTok of qTokens) {
    let bestTokScore = 0;

    for (const nTok of nameTokens) {
      if (qTok === nTok) {
        bestTokScore = Math.max(bestTokScore, 1.0);
        continue;
      }

      // Jaro-Winkler prefix alignment
      const jw = jaroWinkler(qTok, nTok);
      if (jw > bestTokScore) bestTokScore = jw;

      // Edit distance for minor typos
      if (qTok.length >= 4 && nTok.length >= 4) {
        const dist = damerauLevenshtein(qTok, nTok);
        const maxLen = Math.max(qTok.length, nTok.length);
        if (dist <= 2) {
          const editSim = 1.0 - dist / maxLen;
          if (editSim > bestTokScore) bestTokScore = editSim;
        }
      }

      // Soundex phonetic fallback
      if (soundex(qTok) === soundex(nTok) && qTok.length >= 4 && nTok.length >= 4) {
        bestTokScore = Math.max(bestTokScore, 0.82);
      }
    }

    totalTokenScore += bestTokScore;
  }

  const avgTokenScore = totalTokenScore / qTokens.length;
  const finalScore = Math.round(avgTokenScore * 100);

  // Confidence threshold: at least 65% token alignment required
  if (finalScore >= 65) {
    const grade: 'HIGH' | 'MEDIUM' | 'LOW' =
      finalScore >= 85 ? 'HIGH' : finalScore >= 72 ? 'MEDIUM' : 'LOW';
    return { matches: true, score: finalScore, confidenceGrade: grade };
  }

  return { matches: false, score: finalScore, confidenceGrade: 'LOW' };
}

/**
 * Privacy-Safe Masking Function:
 * Prepares safe, non-sensitive output for public registration number lookup
 * Prevents enumeration of home address, fees, medical data, or guardian phone numbers
 */
export function createSafeSearchResult(
  student: {
    admissionNo: string;
    name: string;
    classArm: string;
    level: string;
    stream?: string;
  },
  score: number,
  confidenceGrade: 'HIGH' | 'MEDIUM' | 'LOW'
): SafeStudentSearchResult {
  // Format clean display name
  const nameParts = student.name.trim().split(/\s+/);
  let displayName = student.name;
  if (nameParts.length >= 3) {
    displayName = `${nameParts[0]} ${nameParts[1]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
  }

  return {
    admissionNo: student.admissionNo,
    displayName,
    classArm: student.classArm,
    level: student.level,
    stream: student.stream || 'General',
    matchScore: score,
    confidenceGrade,
  };
}
