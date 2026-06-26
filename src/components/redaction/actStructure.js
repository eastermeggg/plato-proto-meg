// Legal-numbering grammar → document structure.
//
// The hierarchy of an acte is NOT derived from Word styles or font sizes, but
// from a grammar of French legal numbering. Five levels:
//
//   L0  PLAISE AU TRIBUNAL, PAR CES MOTIFS …  (capitals, non numbered)  ancres / jalons
//   L1  I.  II.  I/  I-1.                       parties
//   L2  A/  B/                                  catégories (patrimoniaux / extra-patrimoniaux)
//   L3  1°)  2°)                                postes de préjudice
//   L4  Sur …                                   sous-postes
//
// A trailing montant ("… : 11 029,61 €", "RÉSERVE", "pour mémoire") is isolated
// as separate data — it is never stripped from the rendered acte, only surfaced
// in the sommaire.

// Trailing montant, introduced by a separator (: - – —). Captures euro amounts
// (French formatting: space thousands, comma decimals) and reserve keywords.
const MONTANT_RE =
  /[:\-–—]\s*(\d[\d.,\s  ]*€|R[ÉE]SERVES?|R[ée]serv[ée]e?s?|pour\s+m[ée]moire|M[ÉE]MOIRE|n[ée]ant)\s*$/i;

// L1 — roman numeral parties. [IVX]+ catches single I/V/X (a lone "C"/"D"/"L"/"M"
// is far likelier a category letter than the roman 100/500/50/1000), while the
// {2,} branch catches multi-letter combos. Optional "-1" handles the I-1. style.
const L1_RE = /^((?:[IVX]+|[IVXLCDM]{2,})(?:-\d+)?)\s*[./)]/;
// L2 — single uppercase letter category: A/  B.  C)
const L2_RE = /^([A-Z])\s*[./)](?:\s|$)/;
// L3 — numbered postes de préjudice: 1°)  2°
const L3_RE = /^(\d+)\s*°\s*[).]?/;
// L4 — sous-postes introduced by "Sur …". Restricted to short, title-like
// lines so it doesn't swallow body sentences that merely open with "Sur".
const L4_RE = /^Sur\s+\S/;
const isShortTitle = (t) => t.length <= 48 && !/[.:]\s*$/.test(t) && !t.includes('[');

function isAllCaps(text) {
  const letters = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '');
  return letters.length >= 3 && text === text.toLocaleUpperCase('fr-FR');
}

// Classify a single trimmed line → heading descriptor or null.
function classifyLine(raw) {
  let text = raw.trim();
  if (text.length < 2) return null;

  // Unwrap a fully bold-wrapped title so "**I. Sur la responsabilité**" still
  // classifies by its numbering; remember it was bold for the fallback path.
  const wasBold = /^\*\*(.+)\*\*$/.test(text);
  if (wasBold) text = text.replace(/^\*\*(.+)\*\*$/, '$1').trim();

  // Isolate a trailing montant (kept out of the label, surfaced separately).
  let montant = null;
  const mm = text.match(MONTANT_RE);
  if (mm) {
    montant = mm[1].replace(/\s+/g, ' ').trim();
    text = text.slice(0, mm.index).trim();
  }
  // Drop a dangling separator left behind by the montant strip.
  const labelOf = (s) => s.replace(/[:\s–—-]+$/, '').trim();

  let m;
  // L1 — parties (roman)
  if ((m = text.match(L1_RE))) {
    const glyph = m[1].replace(/\s+/g, '');
    return { level: 1, glyph, label: labelOf(text.slice(m[0].length)) || text, montant, confidence: 'high' };
  }
  // L2 — catégories (letter)
  if ((m = text.match(L2_RE))) {
    return { level: 2, glyph: m[1], label: labelOf(text.slice(m[0].length)) || text, montant, confidence: 'high' };
  }
  // L3 — postes de préjudice (1°)
  if ((m = text.match(L3_RE))) {
    return { level: 3, glyph: `${m[1]}°`, label: labelOf(text.slice(m[0].length)) || text, montant, confidence: 'high' };
  }
  // L4 — sous-postes (Sur …)
  if (L4_RE.test(text) && isShortTitle(text)) {
    return { level: 4, glyph: '—', label: text, montant, confidence: 'high' };
  }
  // L0 — ancres / jalons (capitals, non numbered)
  if (isAllCaps(text) && !text.startsWith('-')) {
    return { level: 0, glyph: '§', label: text, montant, confidence: 'high' };
  }
  // Fallback — atypical numbering / maison style: a short bold line is a title.
  if (wasBold && text.length <= 80) {
    return { level: 2, glyph: '·', label: text, montant, confidence: 'low' };
  }
  return null;
}

// Parse the full acte content (newline-separated plain text) into an ordered
// list of headings. Each entry carries a stable id keyed on its line index so
// ActCanvas can anchor the matching element and the sommaire can scroll to it.
export function parseActStructure(content) {
  if (!content) return [];
  const headings = [];
  content.split('\n').forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const h = classifyLine(trimmed);
    if (h) headings.push({ ...h, lineIndex, id: `acte-toc-${lineIndex}` });
  });

  // Derive the outline structure from document order — a nesting stack, like
  // markdown heading nesting. `depth` is the indentation level relative to the
  // ancestors that actually precede it, so a deeper grammar level with no
  // intermediate parent (e.g. 1° directly under IV. DISPOSITIF) nests by one,
  // not by its absolute level. `parentId` links each entry to its ancestor.
  const stack = [];
  for (const h of headings) {
    while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop();
    h.depth = stack.length;
    h.parentId = stack.length ? stack[stack.length - 1].id : null;
    stack.push(h);
  }
  return headings;
}
