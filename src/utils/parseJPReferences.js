import DECISIONS from '../data/mockDecisions';

const NUMERO_RE = /(\d{1,2}-\d{2,3}\.\d{2,4}|\d{2,4}\/\d{3,6})/;

// Court (juridiction de base) — captured separately from the chamber.
const COURT_RE = /(Cass\.?(?!\s*\d)|CA\s+[A-ZÀ-ÿ][\wÀ-ÿ'-]+(?:[-\s]+[A-ZÀ-ÿ][\wÀ-ÿ'-]+)*|TGI\s+[A-ZÀ-ÿ][\wÀ-ÿ'-]+|TJ\s+[A-ZÀ-ÿ][\wÀ-ÿ'-]+|Crim\.?|Conseil d'État|CE)/;

// Chamber (e.g. "2e civ.", "4e ch.", "1re ch. C", "com.").
const CHAMBER_RE = /\b((?:1re|2e|3e|4e|5e|6e)\s*(?:civ\.?|ch\.?(?:\s*[A-Z])?)|com\.?|crim\.?|soc\.?)/i;

const DATE_RE = /(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i;

const MONTHS_FR = {
  janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
};

function shortDate(frDate) {
  if (!frDate) return null;
  const m = frDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  if (!m) return frDate;
  const day = m[1].padStart(2, '0');
  const month = String(MONTHS_FR[m[2].toLowerCase()] || '').padStart(2, '0');
  const year = m[3].slice(2);
  return month && year ? `${day}/${month}/${year}` : frDate;
}

function isoDate(frDate) {
  if (!frDate) return null;
  const m = frDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  if (!m) return null;
  const day = m[1].padStart(2, '0');
  const month = String(MONTHS_FR[m[2].toLowerCase()] || '').padStart(2, '0');
  return month ? `${m[3]}-${month}-${day}` : null;
}

function extractDescription(line, numero) {
  // Anything after an em-dash (—) or " - " separator that follows the numero is the description.
  const afterNumero = line.split(numero).slice(1).join(numero);
  const sepMatch = afterNumero.match(/(?:\s*[-–\u2014]\s+)(.+)/);
  return sepMatch ? sepMatch[1].trim() : '';
}

export function parseJPReferences(text) {
  if (!text) return [];
  const out = [];
  const lines = text.split('\n');
  lines.forEach((rawLine, lineIdx) => {
    const line = rawLine.replace(/^[\s•·\u2014\-*]+/, '').trim();
    if (!line) return;
    const m = line.match(NUMERO_RE);
    if (!m) return;
    const numero = m[1];
    const courtM = line.match(COURT_RE);
    const chamberM = line.match(CHAMBER_RE);
    const dateM = line.match(DATE_RE);
    out.push({
      raw: rawLine,
      lineIdx,
      numero,
      court: courtM ? courtM[1].replace(/\.+$/, '').trim() : null,
      chamber: chamberM ? chamberM[1].trim() : null,
      date: dateM ? dateM[1] : null,
      dateShort: shortDate(dateM ? dateM[1] : null),
      dateISO: isoDate(dateM ? dateM[1] : null),
      description: extractDescription(line, numero),
      canonicalId: matchCanonical(numero),
    });
  });
  return out;
}

function matchCanonical(numero) {
  if (!numero) return null;
  const norm = numero.replace(/\s/g, '');
  const hit = DECISIONS.find(d => {
    if (!d.numero) return false;
    return d.numero.replace(/\s/g, '') === norm;
  });
  return hit ? hit.id : null;
}

export function customFirmIdFor(numero) {
  return `custom-firm-${numero.replace(/\W+/g, '-')}`;
}
