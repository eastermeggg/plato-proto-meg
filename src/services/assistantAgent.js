// assistantAgent.js - Plato assistant service (pure functions, no React, no App.js imports).
//
// Implements, against the REAL app shapes (dossiers from handleCreateDossier,
// templatesLibrary, DEFAULT_BAREMES, BORDEREAU_CATEGORIES / BORDEREAU_PIECES):
//   - getCatalog(scope, data)   -> objects + intentions for the composer menus (data contract §3/§4)
//   - detectSignals(...)        -> nudge signals per « Parcours scriptés » §0 (data contract §5)
//   - shouldEmit(signal, hist)  -> the one-nudge-per-signal / re-emission rule (data contract §5)
//   - respond(...)              -> placeholder agent turn, réponse d'abord (data contract §3)
//
// All labels are French. Everything faked is flagged with `// ⚠ seam (data contract §N): ...`.

/**
 * @typedef {Object} Scope
 * @property {string|null} dossierId
 * @property {string|null} [vertical]
 */

/**
 * @typedef {Object} CatalogData
 * @property {Array<Object>} [dossiers]      App dossier records: { id, reference, typeFait, date, statut, matterType, lastEditDate, ... }
 * @property {Array<Object>} [pieces]        { id, nom, intitule, date, type, categoryId, ... }
 * @property {Array<Object>} [pieceFolders]  BORDEREAU_CATEGORIES-style: { id, name, parentId, order }
 * @property {Array<Object>} [templates]     templatesLibrary-style: { id, label, actType, fileName, ... }
 * @property {Array<Object>} [referentiels]  DEFAULT_BAREMES-style: { id, label, type, status, ... }
 */

/**
 * @typedef {Object} ObjectItem
 * @property {string} id
 * @property {'piece'|'modele'|'referentiel'|'dossier'} type
 * @property {string} label
 * @property {string} family   Token family (data contract §3: Token { id, type, label, family })
 */

/**
 * @typedef {Object} ObjectFolder
 * @property {string} key
 * @property {string} label
 * @property {ObjectItem[]} items
 */

/**
 * @typedef {Object} ObjectGroup
 * @property {string} key
 * @property {string} label
 * @property {boolean} locked
 * @property {true} [conversion]
 * @property {ObjectFolder[]} [folders]
 * @property {ObjectItem[]} [items]
 */

/**
 * @typedef {Object} IntentionEntry
 * @property {string} id
 * @property {string} label
 * @property {string} [description]
 * @property {'always'|'dossierOnly'} availableWhen
 * @property {false} isDestructive   Destructive entries are filtered out, never returned.
 * @property {boolean} locked        true = dossierOnly intention seen from an unscoped thread (conversion row).
 */

/**
 * @typedef {Object} SignalCandidate
 * @property {string} dossierId
 * @property {string} name
 * @property {string|null} domain
 * @property {string|null} stage
 * @property {boolean} isClosed
 */

/**
 * @typedef {Object} Signal
 * @property {'dossierMatch'|'ambiguousMatch'|'unknownClient'|'lockedTool'|'explicitIntent'|'pieceReference'} type
 * @property {SignalCandidate[]} candidates
 * @property {number} confidence
 */

/**
 * @typedef {Object} NudgeEntry  (NudgeState, data contract §5)
 * @property {string} signalType
 * @property {string|null} subjectId
 * @property {'pending'|'accepted'|'declined'} state
 * @property {boolean} reEmitted
 */

/**
 * @typedef {Object} AgentMessage
 * @property {'agent'} kind
 * @property {string} body
 * @property {Array<{kind:string,label:string,href:string}>} [sources]
 * @property {string} [readStatement]
 */

// ---------------------------------------------------------------------------
// Text normalization & entity matching
// ---------------------------------------------------------------------------

/** Lowercase, strip accents, normalize apostrophes. */
function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'");
}

/** Split normalized text into alphanumeric tokens. */
function tokenize(s) {
  return normalizeText(s).split(/[^a-z0-9]+/).filter(Boolean);
}

// Generic words that never identify a dossier ("Martel c/ AXA" → keep martel, axa).
const GENERIC_TOKENS = new Set([
  'contre', 'dossier', 'affaire', 'madame', 'monsieur', 'maitre', 'mme',
  'les', 'des', 'sur', 'pour', 'dans', 'chez', 'avec', 'une', 'deux',
  'cabinet', 'societe', 'consorts', 'epoux', 'succession',
]);

/** Name tokens of a dossier record (clientName / adverseName / reference), filtered. */
function dossierNameTokens(dossier) {
  const raw = [dossier.clientName, dossier.adverseName, dossier.reference]
    .filter(Boolean)
    .map(tokenize)
    .flat();
  return raw.filter((t) => t.length >= 3 && !GENERIC_TOKENS.has(t));
}

/**
 * Fuzzy token match: exact, or prefix inclusion when both sides are long enough
 * («Mme Martel» ≈ «Martel», «MARTEL» ≈ «Martel», «Martels» ≈ «Martel»).
 * ⚠ seam (data contract §5): token inclusion/prefix stands in for real NER + fuzzy matching.
 */
function tokensMatch(a, b) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 4) return false;
  return a.startsWith(b) || b.startsWith(a);
}

/**
 * Match free text against the dossier index.
 * @returns {Array<{dossier: Object, quality: number}>} quality: 1 exact, 0.8 prefix.
 */
function matchDossiers(text, dossiers) {
  const textTokens = tokenize(text).filter((t) => t.length >= 3);
  const results = [];
  (dossiers || []).forEach((dossier) => {
    const nameTokens = dossierNameTokens(dossier);
    let quality = 0;
    nameTokens.forEach((nt) => {
      textTokens.forEach((tt) => {
        if (tt === nt) quality = Math.max(quality, 1);
        else if (tokensMatch(tt, nt)) quality = Math.max(quality, 0.8);
      });
    });
    if (quality > 0) results.push({ dossier, quality });
  });
  return results;
}

// ---------------------------------------------------------------------------
// Intention classifier (keyword heuristics, French)
// ---------------------------------------------------------------------------
// Regexes run on NORMALIZED text (lowercase, accents stripped).
// ⚠ seam (data contract §5): keyword heuristics stand in for a real intent classifier.

const PRODUCTION_RE = /\b(chiffre|chiffres|chiffrer|chiffrage|calcule|calculer|redige|rediger|extrais|extrait|extraire|genere|generer|prepare le poste|bordereau)\b/;
const EXPLICIT_RE = /\b(je prends le dossier|j'ouvre le dossier|ouvre un dossier|cree le dossier|on prend)\b/;
const ETAT_RE = /\b(ou en est|il me reste|echeances?|cette semaine|prochaine action|quoi faire)\b/;
const PIECE_REF_RE = /\bpiece\s+\d+/;

/**
 * @param {string} text
 * @returns {'production'|'explicite'|'etat'|'connaissance'}
 */
function classifyIntention(text) {
  const norm = normalizeText(text);
  if (PRODUCTION_RE.test(norm)) return 'production';
  if (EXPLICIT_RE.test(norm)) return 'explicite';
  if (ETAT_RE.test(norm)) return 'etat';
  return 'connaissance';
}

// ---------------------------------------------------------------------------
// Dossier record adapters (app shape → contract shape)
// ---------------------------------------------------------------------------

function dossierIsClosed(d) {
  if (d.isClosed === true) return true;
  const s = normalizeText(d.statut || '');
  return s === 'clos' || s === 'cloture' || s === 'archive';
}

function dossierDisplayName(d) {
  if (d.clientName) return d.adverseName ? `${d.clientName} / ${d.adverseName}` : d.clientName;
  return d.reference || d.id;
}

/**
 * Recency of a dossier, for candidate ordering.
 * ⚠ seam (data contract §1): lastActivity/lastEditDate are display strings ("04/09/2026"),
 * not timestamps - we parse dd/mm/yyyy best-effort, backend must own real activity ordering.
 */
function dossierActivityTs(d) {
  const raw = d.lastActivity ?? d.lastEditDate ?? null;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const m = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

/** @returns {SignalCandidate} */
function toCandidate(d) {
  return {
    dossierId: d.id,
    name: dossierDisplayName(d),
    domain: d.domain || d.matterType || null,
    // ⚠ seam (data contract §1): stage values are authored strings; the app only carries `statut`.
    stage: d.stage || d.statut || null,
    isClosed: dossierIsClosed(d),
  };
}

// ---------------------------------------------------------------------------
// 1) getCatalog(scope, data)
// ---------------------------------------------------------------------------

// ⚠ seam (data contract §4): the intentions catalogue is a STATIC list - no real
// entitlement check, and vertical filtering is not implemented (exists for a couple
// of entries only in the contract; none here). Destructive entries live in this
// internal list to honor the Capability shape, but are filtered out before return.
const INTENTIONS_CATALOGUE = [
  // Always available. The plain question de droit is implicit (free text), so it has
  // no catalogue entry - only named actions are listed.
  { id: 'rechercher-jp', label: 'Rechercher de la jurisprudence', description: 'Recherche dans les bases de jurisprudence et de doctrine', availableWhen: 'always', isDestructive: false },
  { id: 'creer-dossier', label: 'Créer un dossier', description: 'Ouvre un dossier depuis ce fil', availableWhen: 'always', isDestructive: false },
  { id: 'rattacher', label: 'Rattacher ce fil à un dossier', description: 'Déplace la conversation dans un dossier existant', availableWhen: 'always', isDestructive: false },
  { id: 'modeles', label: "Parcourir les modèles d'actes", availableWhen: 'always', isDestructive: false },
  { id: 'referentiels', label: 'Consulter les barèmes et référentiels', availableWhen: 'always', isDestructive: false },
  // Dossier only (locked = conversion rows when unscoped).
  { id: 'chiffrer', label: 'Chiffrer un poste de préjudice', description: "Un montant vient d'une pièce versée dans un dossier", availableWhen: 'dossierOnly', isDestructive: false },
  { id: 'extraire', label: 'Extraire les données des pièces', availableWhen: 'dossierOnly', isDestructive: false },
  { id: 'rediger-acte', label: 'Rédiger un acte', description: "Assignation, conclusions, dire - depuis un modèle du cabinet", availableWhen: 'dossierOnly', isDestructive: false },
  { id: 'bordereau', label: 'Préparer le bordereau de pièces', availableWhen: 'dossierOnly', isDestructive: false },
  { id: 'importer-pieces', label: 'Importer des pièces', availableWhen: 'dossierOnly', isDestructive: false },
  { id: 'jp-dossier', label: 'Jurisprudence appliquée au dossier', availableWhen: 'dossierOnly', isDestructive: false },
  // Destructive - NEVER returned by getCatalog (filtered below).
  { id: 'supprimer-piece', label: 'Supprimer une pièce', availableWhen: 'dossierOnly', isDestructive: true },
  { id: 'cloturer-dossier', label: 'Clôturer le dossier', availableWhen: 'dossierOnly', isDestructive: true },
];

function pieceToItem(p) {
  return { id: p.id, type: 'piece', label: p.intitule || p.nom || p.label || p.id, family: 'piece' };
}

/** Pièces group: pieces nested under their folder (BORDEREAU_CATEGORIES tree, depth-first). */
function buildPiecesGroup(pieces, pieceFolders) {
  /** @type {ObjectFolder[]} */
  const folders = [];
  const knownFolderIds = new Set((pieceFolders || []).map((f) => f.id));
  const walk = (parentId, prefix) => {
    (pieceFolders || [])
      .filter((f) => (f.parentId || null) === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((f) => {
        const label = prefix ? `${prefix} / ${f.name}` : f.name;
        folders.push({
          key: f.id,
          label,
          items: (pieces || []).filter((p) => p.categoryId === f.id).map(pieceToItem),
        });
        walk(f.id, label);
      });
  };
  walk(null, '');
  const orphans = (pieces || []).filter((p) => !p.categoryId || !knownFolderIds.has(p.categoryId));
  if (orphans.length > 0) {
    folders.push({ key: 'sans-categorie', label: 'Sans catégorie', items: orphans.map(pieceToItem) });
  }
  return { key: 'pieces', label: 'Pièces', locked: false, folders };
}

/**
 * Objects + intentions catalogue for the composer menus.
 *
 * Unscoped, pièces / chiffrage / actes collapse into ONE locked group and NO piece
 * name is ever listed (structural secret: unscoped threads must not leak dossier content).
 *
 * NOTE (menu contract): the locked group is ALWAYS returned, even when a search query
 * would not match its label - filtering it out (or not) belongs to the MENU layer,
 * which renders it as a conversion row. Same for locked intentions. Destructive
 * intentions, on the other hand, are filtered HERE and never returned.
 *
 * @param {Scope} scope
 * @param {CatalogData} data
 * @returns {{ objects: ObjectGroup[], intentions: IntentionEntry[] }}
 */
export function getCatalog(scope = { dossierId: null, vertical: null }, data = {}) {
  const {
    dossiers = [],
    pieces = [],
    pieceFolders = [],
    templates = [],
    referentiels = [],
  } = data || {};
  const scoped = Boolean(scope && scope.dossierId != null);

  const modelesGroup = {
    key: 'modeles',
    label: "Modèles d'actes",
    locked: false,
    items: templates.map((t) => ({
      id: t.id,
      type: 'modele',
      label: t.label || t.fileName || t.id,
      family: 'modele',
    })),
  };
  const referentielsGroup = {
    key: 'referentiels',
    label: 'Barèmes & référentiels',
    locked: false,
    items: referentiels.map((r) => ({
      id: r.id,
      type: 'referentiel',
      label: r.label || r.id,
      family: 'referentiel',
    })),
  };

  /** @type {ObjectGroup[]} */
  let objects;
  if (scoped) {
    objects = [
      buildPiecesGroup(pieces, pieceFolders),
      modelesGroup,
      referentielsGroup,
      {
        key: 'dossiers',
        label: 'Autres dossiers',
        locked: false,
        // Read-only cross-references (parcours 10): citable, never written into.
        items: dossiers
          .filter((d) => d.id !== scope.dossierId)
          .map((d) => ({ id: d.id, type: 'dossier', label: dossierDisplayName(d), family: 'dossier' })),
      },
    ];
  } else {
    objects = [
      modelesGroup,
      referentielsGroup,
      // Structural secret: never list piece names when unscoped.
      { key: 'locked', label: 'Pièces, chiffrage, actes', locked: true, conversion: true },
    ];
  }

  const intentions = INTENTIONS_CATALOGUE
    .filter((entry) => !entry.isDestructive) // destructive entries never leave the module
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      ...(entry.description ? { description: entry.description } : {}),
      availableWhen: entry.availableWhen,
      isDestructive: false,
      locked: entry.availableWhen === 'dossierOnly' && !scoped,
    }));

  return { objects, intentions };
}

// ---------------------------------------------------------------------------
// 2) detectSignals(text, scope, dossiers, nudgeHistory)
// ---------------------------------------------------------------------------

/**
 * One-nudge-per-signal rule (data contract §5):
 * - a declined signal never re-fires for the same signalType + subjectId in this thread;
 * - a NEW signal type (pieceReference / lockedTool...) re-emits once (reEmitted marks it spent).
 *
 * @param {Signal} signal
 * @param {NudgeEntry[]} nudgeHistory
 * @returns {boolean}
 */
export function shouldEmit(signal, nudgeHistory = []) {
  const subjectId = (signal.candidates && signal.candidates[0] && signal.candidates[0].dossierId) || null;
  const sameSubject = (entry) =>
    entry.subjectId == null || subjectId == null || entry.subjectId === subjectId;

  // Declined → never again on the same signal type for this subject.
  const declined = nudgeHistory.some(
    (n) => n.signalType === signal.type && n.state === 'declined' && sameSubject(n)
  );
  if (declined) return false;

  // Re-emission signals fire once: once reEmitted is recorded, they are spent.
  if (signal.type !== 'dossierMatch') {
    const spent = nudgeHistory.some(
      (n) => n.signalType === signal.type && n.reEmitted && sameSubject(n)
    );
    if (spent) return false;
  }
  return true;
}

/**
 * Detects at most one nudge signal for a user message (parcours §0 pseudocode).
 *
 * @param {string} text
 * @param {Scope} scope
 * @param {Array<Object>} dossiers  App dossier records.
 * @param {NudgeEntry[]} [nudgeHistory]
 * @returns {Signal[]}  Empty array = silence.
 */
export function detectSignals(text, scope = { dossierId: null }, dossiers = [], nudgeHistory = []) {
  const norm = normalizeText(text);
  const intention = classifyIntention(text);
  const matches = matchDossiers(text, dossiers);
  const hasPieceRef = PIECE_REF_RE.test(norm);
  const scoped = Boolean(scope && scope.dossierId != null);

  // ── Silences ──
  // Knowledge question with zero dossier matches → silence, even full of names and dates
  // (a pièce reference is a signal of its own, checked below).
  if (intention === 'connaissance' && matches.length === 0 && !hasPieceRef) return [];
  // État with zero matches → portfolio read is respond()'s job; no signal.
  if (intention === 'etat' && matches.length === 0) return [];

  // ── In dossier: never a nudge ──
  // Mention of ANOTHER dossier = free cross-read, cited inline, scope unchanged (parcours 10).
  // Production in dossier = execute, no gate (parcours 9). Nothing scoped emits.
  if (scoped) return [];

  // ── Unscoped signals, strongest structural signal first ──
  /** @type {Signal|null} */
  let signal = null;
  // ⚠ seam (data contract §5): confidence values are heuristic constants, not model scores.
  if (hasPieceRef) {
    // « pièce N » names dossier content → re-emission signal (parcours 4).
    signal = { type: 'pieceReference', candidates: matches.map((m) => toCandidate(m.dossier)), confidence: 0.85 };
  } else if (intention === 'production') {
    // Locked tool asked in natural language → gate + nudge Créer (parcours 5).
    signal = { type: 'lockedTool', candidates: matches.map((m) => toCandidate(m.dossier)), confidence: 0.8 };
  } else if (intention === 'explicite') {
    // « je prends le dossier » → card 2 champs (parcours 5).
    signal = { type: 'explicitIntent', candidates: matches.map((m) => toCandidate(m.dossier)), confidence: 0.95 };
  } else if (matches.length === 1) {
    signal = {
      type: 'dossierMatch',
      candidates: [toCandidate(matches[0].dossier)],
      confidence: matches[0].quality >= 1 ? 0.9 : 0.7,
    };
  } else if (matches.length >= 2) {
    // Card désambiguïsation - most recently active first, never guessed (parcours 3).
    const ordered = matches
      .slice()
      .sort((a, b) => dossierActivityTs(b.dossier) - dossierActivityTs(a.dossier));
    signal = { type: 'ambiguousMatch', candidates: ordered.map((m) => toCandidate(m.dossier)), confidence: 0.6 };
  }

  if (!signal) return [];
  return shouldEmit(signal, nudgeHistory) ? [signal] : [];
}

// ---------------------------------------------------------------------------
// 3) respond(thread, userMessage, data)
// ---------------------------------------------------------------------------

// ⚠ seam (data contract §3): the whole agent turn is canned French copy - no real
// generation, no real retrieval. Fixed order « réponse d'abord » is honored: the answer
// body comes first; nudges (if any) are appended by the caller AFTER these messages.
const RESPONSE_DELAY_MS = 400;

/**
 * Placeholder agent turn.
 * @param {{ scope?: Scope }} thread
 * @param {string|{body:string}} userMessage
 * @param {CatalogData} data
 * @returns {Promise<AgentMessage[]>}
 */
export async function respond(thread, userMessage, data = {}) {
  await new Promise((resolve) => setTimeout(resolve, RESPONSE_DELAY_MS));

  const text = typeof userMessage === 'string' ? userMessage : (userMessage && userMessage.body) || '';
  const dossiers = (data && data.dossiers) || [];
  const intention = classifyIntention(text);
  const matches = matchDossiers(text, dossiers);

  // Portfolio question (état, no dossier named): one line per active dossier,
  // dashboard only - never pieces, never amounts, never cross-joins (parcours 7).
  if (intention === 'etat' && matches.length === 0) {
    const actifs = dossiers.filter((d) => !dossierIsClosed(d));
    const lines = actifs.map((d) => {
      // ⚠ seam (data contract §1): stage and next action are authored strings; the app
      // dossier only carries `statut`, so the prochaine action falls back to a fixture.
      const stade = d.stage || d.statut || 'en cours';
      const prochaine = (d.nextAction && d.nextAction.label) || 'à définir';
      return `${dossierDisplayName(d)} - stade : ${stade} - prochaine action : ${prochaine}`;
    });
    const body = ['Voici où en sont vos dossiers actifs :', ...lines].join('\n');
    // ⚠ seam (data contract §3): readStatement is authored per message; the real system
    // must produce it from the actual read set.
    const readStatement = `J'ai lu les tableaux de bord des ${actifs.length} dossiers actifs - stade, prochaine action, échéances. Aucune pièce, aucun croisement.`;
    return [{ kind: 'agent', body, readStatement }];
  }

  // Generic sourced knowledge answer.
  // ⚠ seam (data contract §3): fixture answer and fixture source - no retrieval.
  return [
    {
      kind: 'agent',
      body:
        'La règle est la suivante : le délai court à compter de la notification. ' +
        "Au-delà, l'action est en principe prescrite, sauf exception prévue par les textes. " +
        'La source applicable est citée ci-dessous.',
      sources: [
        { kind: 'statute', label: 'Art. L1471-1 - Code du travail', href: '#/sources/code-travail-l1471-1' },
      ],
    },
  ];
}

// Interface nommée du service (port rule 7) : tout ce que l'app consomme passe
// par cet objet - aucun seam ne vit dans un composant.
const assistantAgent = { getCatalog, detectSignals, shouldEmit, respond };
export default assistantAgent;
