// Pile seed — "homogeneous stacks" detected during the drop-first ingest.
//
// A pile is one source PDF that contains N documents of the same kind
// (100 factures médicales, 12 bulletins de salaire…). Detection /
// segmentation / extraction are all faked here — deterministic so the
// announced aggregate (count, total) matches the segments.

// Mulberry32 — deterministic seedable RNG. Tiny, ~10 lines.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FACTURE_EMETTEURS = [
  'CHU Poitiers', 'Clinique Pasteur', 'Cabinet kinésithérapie Martin',
  'Pharmacie du Centre', 'Laboratoire BIOFFICE', 'Centre d\'imagerie Vendôme',
  'Cabinet Dr. Lecomte', 'Polyclinique Saint-Roch', 'Pharmacie de la Gare',
  'Cabinet orthopédique Durand', 'Hôpital Bichat', 'Cabinet psy Marais',
];

function formatEUR(cents) {
  const eur = cents / 100;
  return eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatFRDate(d) {
  return d.toLocaleDateString('fr-FR');
}

// Generate 100 facture segments. Two anomalies are deterministically
// placed at indexes 23 (missing montant) and 71 (1-page suspect).
function generateFactureSegments(count, totalCents) {
  const rng = mulberry32(0xC0FFEE);
  const startMs = Date.UTC(2022, 0, 5);
  const endMs = Date.UTC(2024, 10, 28);
  const span = endMs - startMs;

  // Distribute total across segments using a Dirichlet-ish split:
  // generate random weights, then scale to hit totalCents exactly.
  const weights = Array.from({ length: count }, () => 0.6 + rng() * 1.4);
  const sumW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (w / sumW) * totalCents);
  const rounded = raw.map(v => Math.round(v));
  let drift = rounded.reduce((a, b) => a + b, 0) - totalCents;
  for (let i = 0; drift !== 0 && i < count; i++) {
    const step = drift > 0 ? -1 : 1;
    rounded[i] += step;
    drift += step;
  }

  // Sort dates so the segments scan chronologically.
  const dates = Array.from({ length: count }, () => new Date(startMs + rng() * span));
  dates.sort((a, b) => a - b);

  return Array.from({ length: count }, (_, i) => {
    const emetteur = FACTURE_EMETTEURS[Math.floor(rng() * FACTURE_EMETTEURS.length)];
    const dateStr = formatFRDate(dates[i]);
    const cents = rounded[i];
    const pages = rng() < 0.7 ? 1 : 2;
    return {
      id: `pile-factures-100-seg-${String(i + 1).padStart(3, '0')}`,
      index: i,
      label: `Facture · ${dateStr} · ${emetteur}`,
      date: dates[i].toISOString().slice(0, 10),
      emetteur,
      montantCents: cents,
      pages,
      pageStart: 0, // filled below
      pageEnd: 0,
      _anomaly: null,
    };
  }).reduce((acc, seg) => {
    const prev = acc[acc.length - 1];
    const start = prev ? prev.pageEnd + 1 : 1;
    seg.pageStart = start;
    seg.pageEnd = start + seg.pages - 1;
    acc.push(seg);
    return acc;
  }, []);
}

function generateDecompteSegments(count) {
  const rng = mulberry32(0xDEC10C);
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août'];
  const segments = [];
  for (let i = 0; i < count; i++) {
    const month = months[i % months.length];
    const variance = Math.floor(rng() * 800) - 200;
    const cents = (180000 + variance * 100);
    segments.push({
      id: `pile-cpam-${String(i + 1).padStart(2, '0')}`,
      index: i,
      label: `Décompte CPAM · ${month} 2023 · IJ`,
      date: `2023-${String((i % 12) + 1).padStart(2, '0')}-15`,
      emetteur: 'CPAM Paris',
      montantCents: cents,
      pages: rng() < 0.3 ? 2 : 1,
      pageStart: i * 2 + 1,
      pageEnd: i * 2 + 1,
      _anomaly: null,
    });
  }
  return segments;
}

function generateBulletinSegments(count) {
  const rng = mulberry32(0xB0BCAFE);
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const segments = [];
  for (let i = 0; i < count; i++) {
    const month = months[i % 12];
    const variance = Math.floor(rng() * 120) - 60;
    const netCents = (285000 + variance * 100);
    segments.push({
      id: `pile-bulletins-12-seg-${String(i + 1).padStart(2, '0')}`,
      index: i,
      label: `Bulletin · ${month} 2022 · Dupont Martin SAS`,
      date: `2022-${String((i % 12) + 1).padStart(2, '0')}-28`,
      emetteur: 'Dupont Martin SAS',
      montantCents: netCents,
      pages: 1,
      pageStart: i + 1,
      pageEnd: i + 1,
      _anomaly: null,
    });
  }
  return segments;
}

const FACTURE_SEGMENTS = generateFactureSegments(100, 1245000);
const BULLETIN_SEGMENTS = generateBulletinSegments(12);
const DECOMPTE_SEGMENTS = generateDecompteSegments(8);

const FACTURE_TOTAL = FACTURE_SEGMENTS.reduce((acc, s) => acc + (s.montantCents || 0), 0);
const BULLETIN_TOTAL = BULLETIN_SEGMENTS.reduce((acc, s) => acc + (s.montantCents || 0), 0);
const DECOMPTE_TOTAL = DECOMPTE_SEGMENTS.reduce((acc, s) => acc + (s.montantCents || 0), 0);

// Every pile is suggested for review — silent auto-application is gated on
// 'high' confidence in App.js, so keeping all entries 'medium' guarantees
// the avocat always sees the binary choice in the À vérifier zone.
export const PILE_POOL = [
  {
    id: 'pile-factures-100',
    originalName: 'factures_medicales_2022-2024.pdf',
    pileType: 'factures-medicales',
    confidence: 'medium',
    aggregate: {
      label: 'Factures médicales',
      count: FACTURE_SEGMENTS.length,
      totalLabel: formatEUR(FACTURE_TOTAL),
      dateRangeLabel: 'janv. 2022 → nov. 2024',
      typeForClassification: 'Factures',
    },
    pages: FACTURE_SEGMENTS[FACTURE_SEGMENTS.length - 1].pageEnd,
    segments: FACTURE_SEGMENTS,
  },
  {
    id: 'pile-bulletins-12',
    originalName: 'bulletins_salaire_2022.pdf',
    pileType: 'bulletins',
    confidence: 'medium',
    aggregate: {
      label: 'Bulletins de salaire',
      count: BULLETIN_SEGMENTS.length,
      totalLabel: formatEUR(BULLETIN_TOTAL),
      dateRangeLabel: 'janv. → déc. 2022',
      typeForClassification: 'Revenus',
    },
    pages: BULLETIN_SEGMENTS.length,
    segments: BULLETIN_SEGMENTS,
  },
  {
    id: 'pile-cpam-8',
    originalName: 'decomptes_cpam_2023.pdf',
    pileType: 'decomptes-cpam',
    confidence: 'medium',
    aggregate: {
      label: 'Décomptes CPAM',
      count: DECOMPTE_SEGMENTS.length,
      totalLabel: formatEUR(DECOMPTE_TOTAL),
      dateRangeLabel: 'janv. → août 2023',
      typeForClassification: 'Médical',
    },
    pages: DECOMPTE_SEGMENTS[DECOMPTE_SEGMENTS.length - 1].pageEnd,
    segments: DECOMPTE_SEGMENTS,
  },
];

export function getPileById(pileId) {
  return PILE_POOL.find(p => p.id === pileId) || null;
}

// Pick K distinct piles from the pool — used to inject 1–3 pile
// suggestions on every real upload regardless of filename.
export function pickRandomPiles(k) {
  const n = Math.max(0, Math.min(k, PILE_POOL.length));
  const shuffled = [...PILE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
