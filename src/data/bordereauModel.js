// ─── Bordereau model — pure helpers ─────────────────────────────────
// A bordereau is a numbered list of pièces communiquées that accompanies an acte.
// The lawyer is free in how they organise it: a flat list (1, 2, 3…) or grouped
// into thematic sections with Roman-numeral headers and sub-numbers (I, I-1,
// I-2, II, II-1…).
//
// Entries are a heterogeneous array. Each entry has a `kind`:
//   { kind: 'section', name: string }
//   { kind: 'piece',   pieceId, intitule, date?, type?, description? }
//
// Numbering is derived by walking the array (see `numberEntries`). The
// hierarchical numbering of the Pièces tree (used in the GED) is NOT reused
// here — the bordereau is its own organisation, decoupled from the tree.

// Citation tag format inside acte content: [pièce:N:intitule:date]
// Captures N (number cited), intitule, date — name/date allow dedupe by source.
const CITATION_RE = /\[pièce:(\d+):([^:\]]+):([^\]]+)\]/g;
const COMBINING_DIACRITICS_RE = /[̀-ͯ]/g;

/**
 * Extract every [pièce:N:name:date] citation from acte content, in order of
 * appearance. Duplicates kept — caller decides whether to dedupe.
 * @returns {Array<{ number: number, intitule: string, date: string }>}
 */
export function extractCitations(content) {
  if (!content) return [];
  const out = [];
  let m;
  CITATION_RE.lastIndex = 0;
  while ((m = CITATION_RE.exec(content)) !== null) {
    out.push({
      number: parseInt(m[1], 10),
      intitule: m[2].trim(),
      date: m[3].trim(),
    });
  }
  return out;
}

/**
 * Map citations to bordereau entries (heterogeneous shape — kind:'piece').
 * Tries to resolve each citation to a real piece in `piecesById` (matching by
 * intitule first, then by piece id). Falls back to a synthetic pieceId derived
 * from N when no match exists. Numbering is derived by `numberEntries`, so
 * entries returned here carry no `position` / `number` field.
 */
export function buildEntriesFromCitations(citations, piecesById = {}) {
  const resolved = citations.map((c) => {
    const match = Object.values(piecesById).find(
      (p) => (p?.intitule || '').trim() === c.intitule || (p?.nom || '').trim() === c.intitule,
    );
    const pieceId = match?.id || `cite-${c.number}-${slugify(c.intitule)}`;
    return {
      kind: 'piece',
      pieceId,
      intitule: c.intitule,
      date: c.date,
    };
  });
  return dedupeByPieceId(resolved);
}

/**
 * Remove duplicate entries that point to the same pieceId, keeping the first
 * occurrence (matches "ordre d'apparition dans l'acte" per spec §7).
 */
export function dedupeByPieceId(entries) {
  const seen = new Set();
  const out = [];
  for (const e of entries) {
    if (seen.has(e.pieceId)) continue;
    seen.add(e.pieceId);
    out.push(e);
  }
  return out;
}

/**
 * Assign sequential positions 1..N to entries in array order. Pure — returns
 * a new array, does not mutate.
 */
export function renumber(entries) {
  return entries.map((e, i) => ({ ...e, position: i + 1 }));
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

// Sentinel name for the auto-created trailing section that holds added-but-
// not-cited pièces. Recognised by `addPieceToEntries` so the lawyer can keep
// dropping uncited pièces in without us creating a new section each time.
export const UNCITED_SECTION_NAME = 'Pièces communiquées en complément';

/**
 * Append a piece to a bordereau's entries array, returning a new array.
 * - Empty entries / no sections → flat append.
 * - Sections present → ensure a trailing UNCITED_SECTION_NAME section exists
 *   and append the piece there (signals "not cited in the acte").
 * The caller is responsible for guarding against duplicates (same pieceId).
 */
export function addPieceToEntries(entries = [], piece) {
  const next = entries.slice();
  const hasSections = next.some((e) => e.kind === 'section');
  if (!hasSections) {
    next.push({ kind: 'piece', ...piece });
    return next;
  }
  const lastSectionIdx = next.map((e) => e.kind).lastIndexOf('section');
  const lastSection = next[lastSectionIdx];
  if (lastSection?.name === UNCITED_SECTION_NAME) {
    next.push({ kind: 'piece', ...piece });
    return next;
  }
  next.push({ kind: 'section', name: UNCITED_SECTION_NAME });
  next.push({ kind: 'piece', ...piece });
  return next;
}

/**
 * Collect the pieceIds currently referenced by a bordereau's entries — used
 * by the "Ajouter une pièce" modal to flag duplicates.
 */
export function entriesPieceIds(entries = []) {
  return new Set(entries.filter((e) => e.kind === 'piece' && e.pieceId).map((e) => e.pieceId));
}

/**
 * Walk an entries array and compute the displayed number for each row.
 * Sections increment a Roman counter (I, II, III…) and reset a sub-counter.
 * Pieces inside a section get `${roman}-${sub}` (I-1, I-2). Pieces before any
 * section get a flat number (1, 2). Returns a new array with `number` on each
 * row; the original entries are not mutated.
 */
export function numberEntries(entries) {
  let romanIdx = -1; // -1 = no section open yet → flat numbering
  let flatN = 0;
  let subN = 0;
  return (entries || []).map((e) => {
    if (e.kind === 'section') {
      romanIdx += 1;
      subN = 0;
      return { ...e, number: ROMAN[romanIdx] || `S${romanIdx + 1}` };
    }
    if (romanIdx < 0) {
      flatN += 1;
      return { ...e, number: String(flatN) };
    }
    subN += 1;
    return { ...e, number: `${ROMAN[romanIdx] || `S${romanIdx + 1}`}-${subN}` };
  });
}

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}
