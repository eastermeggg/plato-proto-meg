// Data + pure helpers for the Import/Sync email lab (spec 28/07/2026 :
// « Import & synchronisation email → Pièces du dossier »). JSX-free on purpose:
// components decide rendering, this module owns the facts.
//
// The shared seed (src/data/emailSeed.js) stays untouched - the app uses it.
// Everything lab-specific is layered on top (enrichment, synthetic scale,
// sources, detections, pending sync batches).

import { OUTLOOK_THREADS, OUTLOOK_FOLDERS } from '../../../data/emailSeed';

export const normalize = (s) => (s == null ? '' : String(s)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const LAB_TODAY = new Date('2026-07-28T12:00:00');

const MONTHS_FR = ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const relDate = (iso) => {
  const d = new Date(`${iso}T12:00:00`);
  const days = Math.round((LAB_TODAY - d) / 86400000);
  if (days <= 0) return 'Aujourd\'hui';
  if (days === 1) return 'Hier';
  const m = MONTHS_FR[d.getMonth()];
  return d.getFullYear() === LAB_TODAY.getFullYear() ? `${d.getDate()} ${m}` : `${d.getDate()} ${m} ${d.getFullYear()}`;
};

// ── Règles de champ ─────────────────────────────────────────────────────────
// Objet : préfixes RE:/TR:/FW:/[TAG] retirés à l'affichage, conservés en
// recherche. Objet illisible → résumé en italique.
const SUBJECT_PREFIX_RE = /^\s*((re|tr|fw|fwd)\s*:|\[[^\]]+\])\s*/i;
export const cleanSubject = (s) => {
  let out = s || '';
  while (SUBJECT_PREFIX_RE.test(out)) out = out.replace(SUBJECT_PREFIX_RE, '');
  return out.trim();
};
const subjectIllegible = (t) => {
  const c = cleanSubject(t.subject);
  return !c || c.length <= 3 || /^scan[_\s-]/i.test((t.subject || '').trim()) || /^n?°?[\d\s.-]+$/.test(c);
};
export const displaySubject = (t) => (subjectIllegible(t)
  ? { text: t.summary || t.body?.summary || t.subject, illegible: true }
  : { text: cleanSubject(t.subject), illegible: false });

// Expéditeur : senders[0] seul, rôle en préfixe, « +N » si plusieurs domaines.
const domainOf = (email) => ((email || '').split('@')[1] || '');
export const senderLine = (t) => {
  if (t.senderLabel) return t.senderLabel;
  const ss = t.senders || [];
  const s0 = ss[0];
  if (!s0) return t.from || '';
  const label = s0.role ? `${s0.role} · ${s0.name || s0.email}` : (s0.name || s0.email);
  const extraDomains = new Set(ss.slice(1).map(s => domainOf(s.email)).filter(d => d && d !== domainOf(s0.email)));
  return extraDomains.size > 0 ? `${label} +${extraDomains.size}` : label;
};

// ── Threads (seed + enrichment spec) ────────────────────────────────────────
// Rôles : référentiel fermé (Expert · Assureur · CPAM · Client · Confrère ·
// Employeur · Greffe). Rôle inconnu → nom seul.
const THREAD_ENRICH = {
  'th-mutuelle':   { date: '2026-07-27', senders: [{ name: 'Assurance Mutuelle', email: 'contact@assurance-mutuelle.fr', role: 'Assureur' }] },
  'th-expertise':  { date: '2026-07-22', senders: [{ name: 'Cabinet Expertise - Dr Martin', email: 'dr.martin@cabinet-expertise.fr', role: 'Expert' }] },
  'th-cpam':       { date: '2026-07-14', senders: [{ name: 'Service RCT', email: 'cpam-remboursements@ameli.fr', role: 'CPAM' }] },
  'th-axa':        { date: '2026-06-30', senders: [{ name: 'AXA Sinistres', email: 'sinistres@axa-france.fr', role: 'Assureur' }, { name: 'Cabinet Rivière', email: 'conseil@cabinet-riviere.fr', role: null }] },
  'th-arret':      { date: '2026-06-12', senders: [{ name: 'Secrétariat Dr Lefèvre', email: 'secretariat@dr-lefevre.fr', role: null }] },
  'th-kine':       { date: '2026-03-10', senders: [{ name: 'Cabinet Martin Kinésithérapie', email: 'facturation@cabinet-martin-kine.fr', role: null }] },
  'th-greffe':     { date: '2025-12-18', senders: [{ name: 'Greffe TJ Paris', email: 'greffe.tj-paris@justice.fr', role: 'Greffe' }] },
  'th-employeur':  { date: '2025-11-27', senders: [{ name: 'Dupont Martin SAS', email: 'rh@dupont-martin.fr', role: 'Employeur' }] },
  'th-barreau':    { date: '2026-07-20', senders: [{ name: 'Barreau de Paris', email: 'newsletter@avocatparis.org', role: null }] },
  'th-confrere':   { date: '2026-07-24', senders: [{ name: 'Me Girard', email: 'p.girard@girard-associes.fr', role: 'Confrère' }] },
  'th-moreau-rh':  { date: '2026-07-08', senders: [{ name: 'C. Moreau', email: 'c.moreau@gmail.com', role: 'Client' }] },
  'th-radiologue': { date: '2026-06-25', senders: [{ name: 'Centre Imagerie Sud', email: 'secretariat@centre-imagerie-sud.fr', role: null }] },
};

// Objet illisible → exerce la règle du résumé en italique.
const LAB_EXTRA_THREADS = [{
  id: 'th-scan', folderId: 'f-inbox',
  subject: 'SCAN_0034',
  from: 'secretariat@dr-lefevre.fr', to: 'cabinet@durand-avocats.fr',
  messages: 1, date: '2026-07-27', dateLabel: '27 juil. 2026',
  snippet: '',
  senders: [{ name: 'Secrétariat Dr Lefèvre', email: 'secretariat@dr-lefevre.fr', role: null }],
  body: { cleanName: 'Échange courriel - Dr Lefèvre - Certificat scanné', summary: 'Scan du certificat médical initial, transmis sans objet', extractedInfo: {}, pages: 1 },
  attachments: [{
    name: 'SCAN_0034.pdf',
    pool: { cleanName: 'Certificat médical initial - Dr Lefèvre', type: 'Médical', date: '2026-07-27', postesLies: ['DFT'], summary: 'Certificat médical initial scanné.', extractedInfo: {}, pages: 2, splits: null },
  }],
}];

const specThread = (t) => ({
  ...t,
  summary: t.body?.summary,
  senders: t.senders || [{ name: null, email: t.from, role: null }],
  messageCount: t.messages,
  attachmentCount: (t.attachments || []).length,
});

export const LAB_THREADS = [
  ...OUTLOOK_THREADS.map(t => specThread({ ...t, ...(THREAD_ENRICH[t.id] || {}) })),
  ...LAB_EXTRA_THREADS.map(specThread),
];

export const threadById = (id) => LAB_THREADS.find(t => t.id === id) || null;

// ── Expéditeurs ─────────────────────────────────────────────────────────────
// `isShared` = adresse présente dans d'autres dossiers du cabinet → garde-fou
// (jamais de suivi brut : suggestion filtrée adresse + référence dossier).
export const LAB_SENDERS = [
  { email: 'dr.martin@cabinet-expertise.fr', name: 'Dr Martin', role: 'Expert', exchanges: 3, isShared: false },
  { email: 'secretariat@dr-lefevre.fr', name: 'Secrétariat Dr Lefèvre', role: null, exchanges: 2, isShared: false },
  { email: 'facturation@cabinet-martin-kine.fr', name: 'Cabinet Martin Kinésithérapie', role: null, exchanges: 4, isShared: false },
  { email: 'rh@dupont-martin.fr', name: 'Dupont Martin SAS', role: 'Employeur', exchanges: 1, isShared: false },
  { email: 'sinistres@axa-france.fr', name: 'AXA Sinistres', role: 'Assureur', exchanges: 11, isShared: true, sharedWith: 'Moreau c/ Textilia, Petit c/ MAIF' },
  { email: 'cpam-remboursements@ameli.fr', name: 'CPAM - Service RCT', role: 'CPAM', exchanges: 2, isShared: true, sharedWith: '4 autres dossiers du cabinet' },
];

// ── Dossiers Outlook (échelle : 134 dossiers, ~1 800 threads) ──────────────
const CLIENT_LAST = ['Bernard', 'Petit', 'Durand', 'Girard', 'Lefèvre', 'Rousseau', 'Vincent', 'Fournier', 'Morel', 'Garcia', 'Roux', 'Chevalier', 'Faure', 'André', 'Mercier', 'Blanc', 'Guérin', 'Boyer', 'Garnier', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Robin', 'Clément', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine'];
const ADVERSAIRE = ['AXA', 'MAAF', 'Allianz', 'Groupama', 'MACIF', 'GMF', 'CPAM', 'URSSAF', 'Pôle emploi', 'SNCF', 'EDF', 'Orange', 'La Poste', 'Generali'];

export const LAB_FOLDERS = (() => {
  const out = [...OUTLOOK_FOLDERS];
  // 128 dossiers clients synthétiques + 6 du seed = 134 (référence spec §8).
  for (let i = 0; i < 128; i++) {
    const last = CLIENT_LAST[i % CLIENT_LAST.length];
    const adv = ADVERSAIRE[(i * 5) % ADVERSAIRE.length];
    const id = `f-cli-${i}`;
    out.push({ id, name: `${last} c/ ${adv}`, parentId: 'f-clients', attributes: [] });
    if (i < 6) {
      out.push({ id: `${id}-corr`, name: 'Correspondance', parentId: id, attributes: [] });
      out.push({ id: `${id}-pieces`, name: 'Pièces adverses', parentId: id, attributes: [] });
    }
  }
  return out;
})();

export const TOTAL_FOLDERS = 134;
export const TOTAL_THREADS = 1834;

export const folderById = (id) => LAB_FOLDERS.find(f => f.id === id) || null;

export function folderPath(folder, folders = LAB_FOLDERS) {
  const chain = [];
  let cur = typeof folder === 'string' ? folders.find(f => f.id === folder) : folder;
  let guard = 0;
  while (cur && guard++ < 10) {
    chain.unshift(cur.name);
    const parentId = cur.parentId;
    cur = parentId ? folders.find(f => f.id === parentId) : null;
  }
  return `/${chain.join('/')}`;
}

export function childFolders(parentId) {
  return LAB_FOLDERS.filter(f => f.parentId === parentId && !(f.attributes || []).includes('\\Sent'));
}
export const rootFolders = () => childFolders(null).filter(f => !(f.attributes || []).includes('\\Sent'));

// ── Hiérarchie (un dossier pris est un bloc RÉCURSIF : sous-dossiers compris) ─
export function ancestorFolderIds(fid) {
  const out = [];
  let cur = folderById(fid);
  let guard = 0;
  while (cur && cur.parentId && guard++ < 10) {
    out.push(cur.parentId);
    cur = folderById(cur.parentId);
  }
  return out;
}

const descendantsCache = new Map();
export function descendantFolders(fid) {
  if (descendantsCache.has(fid)) return descendantsCache.get(fid);
  const out = [];
  const walk = (id) => childFolders(id).forEach(f => { out.push(f); walk(f.id); });
  walk(fid);
  descendantsCache.set(fid, out);
  return out;
}

// Chemin en fil d'Ariane (« Clients / Leblanc c/ AXA ») - construit depuis la
// chaîne de parents, jamais par split de string : les noms contiennent « / ».
export function folderChainNames(folder, folders = LAB_FOLDERS) {
  const chain = [];
  let cur = typeof folder === 'string' ? folders.find(f => f.id === folder) : folder;
  let guard = 0;
  while (cur && guard++ < 10) {
    chain.unshift(cur.name);
    const parentId = cur.parentId;
    cur = parentId ? folders.find(f => f.id === parentId) : null;
  }
  return chain;
}
export const folderBreadcrumb = (folder) => folderChainNames(folder).join(' / ');

// Composition d'un dossier : ses sous-dossiers IMMÉDIATS, chacun avec son
// double compte profond (échanges · pièces). Inventaire, pas des lignes
// suivables (un source = un sous-arbre).
export function folderComposition(fid) {
  return childFolders(fid).map(f => ({ folder: f, stats: statsForDeep(f.id) }));
}

// Un dossier « conteneur large » couvre plusieurs affaires : suivre / importer
// en bloc verse toutes leurs pièces dans un seul dossier Plato. Le seuil
// distingue une STRUCTURE de travail (2-3 sous-dossiers : Correspondance,
// Expertise) d'un CONTENEUR d'affaires (« Clients » : 130 dossiers-affaires).
export const CONTAINER_MIN_CHILDREN = 5;
export function folderSpan(fid) {
  const kids = childFolders(fid);
  const deep = statsForDeep(fid);
  return { multi: kids.length >= CONTAINER_MIN_CHILDREN, nAffaires: kids.length, pieces: deep.pieces, threads: deep.threads };
}

// Échantillon plat des échanges d'un bloc, chacun avec son dossier d'origine
// (provenance par message) - premiers `limit`.
export function threadSampleDeep(fid, limit = 8) {
  const groups = threadGroupsOfFolderDeep(fid);
  const flat = [];
  for (const g of groups) {
    for (const tv of g.threads) {
      flat.push({ tv, origin: g.folder });
      if (flat.length >= limit) return flat;
    }
  }
  return flat;
}

// ── Stats & threads synthétiques (chaque dossier est explorable) ───────────
const hashOf = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; };

const synthThreadCount = (folderId) => {
  const h = hashOf(folderId);
  const sub = /-(corr|pieces)$/.test(folderId);
  return sub ? 3 + (h % 5) : 8 + (h % 23);
};

// « N échanges, ≈ P pièces » de la carte « en entier ». Réels si le dossier
// porte des threads du seed, synthétiques (déterministes) sinon. Les comptes
// synthétiques sont EXACTS (dérivés du contenu généré) : le récap, l'aperçu et
// le commit disent le même nombre.
const statsCache = new Map();
export function statsFor(folderId) {
  if (statsCache.has(folderId)) return statsCache.get(folderId);
  const real = LAB_THREADS.filter(t => t.folderId === folderId);
  const out = real.length > 0
    ? {
        threads: real.length,
        pieces: real.reduce((n, t) => n + 1 + (t.attachmentCount || 0), 0),
        synthetic: false,
      }
    : (() => {
        const synth = synthThreadsFor(folderId);
        return {
          threads: synth.length,
          pieces: synth.reduce((n, t) => n + 1 + t.attachmentCount, 0),
          synthetic: true,
        };
      })();
  statsCache.set(folderId, out);
  return out;
}

// Stats d'un dossier EN BLOC : lui-même + tous ses sous-dossiers. C'est ce que
// « Ajouter en entier » engage réellement - jamais moins que ce qui est annoncé.
const deepStatsCache = new Map();
export function statsForDeep(folderId) {
  if (deepStatsCache.has(folderId)) return deepStatsCache.get(folderId);
  const descendants = descendantFolders(folderId);
  const all = [folderId, ...descendants.map(f => f.id)];
  const out = all.reduce((acc, id) => {
    const s = statsFor(id);
    return { ...acc, threads: acc.threads + s.threads, pieces: acc.pieces + s.pieces, synthetic: acc.synthetic || s.synthetic };
  }, { folders: descendants.length, threads: 0, pieces: 0, synthetic: false });
  deepStatsCache.set(folderId, out);
  return out;
}

const STUB_SUBJECTS = [
  'Transmission des pièces demandées', 'Re : Suite de votre courrier', 'Convocation - audience de mise en état',
  'Justificatifs de frais - complément', 'Certificat médical actualisé', 'Re : Proposition d\'indemnisation',
  'Attestation demandée', 'Compte rendu de consultation',
];
const STUB_SENDER_LABELS = ['Client · Correspondance directe', 'Assureur · Service sinistres', 'Expert · Cabinet médical', 'Greffe TJ Paris', 'Confrère · Partie adverse'];
const STUB_PJ = [
  'Justificatifs_frais.pdf', 'Certificat_medical.pdf', 'Attestation_employeur.pdf', 'Courrier_reponse.pdf',
  'Releve_prestations.pdf', 'Convocation_audience.pdf', 'Decompte_indemnites.pdf', 'Facture_honoraires.pdf',
  'CR_consultation.pdf', 'Bordereau_communication.pdf',
];
const STUB_DATES = ['2026-07-21', '2026-07-09', '2026-06-28', '2026-06-15', '2026-05-30', '2026-05-11'];
// Aperçu d'une ligne (résumé synthétique du fil) - la même règle que les vrais
// threads : une phrase qui dit de quoi parle l'échange.
const STUB_SNIPPETS = [
  'Transmission des pièces réclamées par le confrère, avec accusé de réception.',
  'Réponse à votre courrier : compléments demandés sur le dossier en cours.',
  'Convocation à l\'audience de mise en état, calendrier de procédure joint.',
  'Complément de justificatifs de frais pour le poste de préjudice concerné.',
  'Certificat médical actualisé transmis par le secrétariat du praticien.',
  'Discussion sur la proposition d\'indemnisation et les postes contestés.',
  'Attestation demandée en vue de la constitution du dossier probatoire.',
  'Compte rendu de consultation et suites envisagées par le médecin.',
];

// Échanges déterministes d'un dossier synthétique - AUTANT que ce que la
// carte « en entier » annonce (statsFor) : l'aperçu montre tout, jamais de
// reste caché. Les sujets recyclés deviennent des « Re : » (fils réalistes).
const synthCache = new Map();
export function synthThreadsFor(folderId) {
  if (synthCache.has(folderId)) return synthCache.get(folderId);
  const h = hashOf(folderId);
  const n = synthThreadCount(folderId);
  const out = Array.from({ length: n }, (_, i) => {
    const pjCount = (h + i) % 3; // 0-2 PJ
    const base = STUB_SUBJECTS[(h + i) % STUB_SUBJECTS.length];
    return {
      id: `${folderId}-th-${i}`,
      synthetic: true,
      folderId,
      subject: i >= STUB_SUBJECTS.length ? `Re : ${base.replace(/^Re : /, '')}` : base,
      snippet: STUB_SNIPPETS[(h + i * 2) % STUB_SNIPPETS.length],
      senderLabel: STUB_SENDER_LABELS[(h + i * 3) % STUB_SENDER_LABELS.length],
      date: STUB_DATES[(h + i) % STUB_DATES.length],
      messageCount: 1 + ((h + i) % 6),
      attachmentCount: pjCount,
      attachments: Array.from({ length: pjCount }, (_, j) => ({ name: STUB_PJ[(h * 3 + i * 5 + j * 7) % STUB_PJ.length] })),
    };
  });
  synthCache.set(folderId, out);
  return out;
}

// Vue unifiée thread réel / synthétique pour la colonne mail et le panier.
export function threadView(t) {
  if (!t) return null;
  if (t.synthetic) {
    return {
      id: t.id, synthetic: true, folderId: t.folderId,
      subject: t.subject, illegible: false, summary: t.snippet || null,
      sender: t.senderLabel, date: t.date,
      msg: t.messageCount, pj: t.attachmentCount,
      attachments: (t.attachments || []).map(a => ({ name: a.name, decoupable: /\.(pdf|docx?)$/i.test(a.name) })),
    };
  }
  const ds = displaySubject(t);
  return {
    id: t.id, synthetic: false, folderId: t.folderId,
    subject: ds.text, illegible: ds.illegible,
    // Aperçu : le résumé synthétisé du fil, sinon l'extrait brut. Jamais quand
    // l'objet est illisible - dans ce cas le résumé EST déjà le sujet affiché.
    summary: ds.illegible ? null : (t.summary || t.snippet || null),
    sender: senderLine(t), date: t.date,
    msg: t.messageCount, pj: t.attachmentCount,
    attachments: (t.attachments || []).map(a => ({ name: a.name, decoupable: /\.(pdf|docx?)$/i.test(a.name), type: a.pool?.type })),
  };
}

export function threadsOfFolder(folderId) {
  const real = LAB_THREADS.filter(t => t.folderId === folderId);
  return (real.length > 0 ? real : synthThreadsFor(folderId)).map(threadView);
}

// Contenu EN BLOC d'un dossier, groupé : lui-même puis chaque sous-dossier.
// C'est la vérité de l'aperçu ET du commit - les deux lisent la même liste.
export function threadGroupsOfFolderDeep(folderId) {
  return [folderById(folderId), ...descendantFolders(folderId)]
    .filter(Boolean)
    .map(f => ({ folder: f, threads: threadsOfFolder(f.id) }))
    .filter(g => g.threads.length > 0);
}
export const threadsOfFolderDeep = (folderId) => threadGroupsOfFolderDeep(folderId).flatMap(g => g.threads);

// Vue d'un thread par id, réel ou synthétique (id = `${folderId}-th-N`).
export function threadViewById(tid) {
  const real = threadById(tid);
  if (real) return threadView(real);
  const m = /^(.*)-th-(\d+)$/.exec(tid || '');
  if (!m) return null;
  const stub = synthThreadsFor(m[1]).find(s => s.id === tid);
  return stub ? threadView(stub) : null;
}

export const folderOfThread = (tid) => {
  const t = threadById(tid);
  if (t) return t.folderId;
  const m = /^(.*)-th-\d+$/.exec(tid || '');
  return m ? m[1] : null;
};

// ── Habituels (frecency par dossier Plato, max 6, dédupliqués) ─────────────
export const LAB_HABITUELS = [
  { kind: 'folder', id: 'f-leblanc' },
  { kind: 'thread', id: 'th-expertise' },
  { kind: 'thread', id: 'th-cpam' },
  { kind: 'thread', id: 'th-kine' },
  { kind: 'folder', id: 'f-experts' },
  { kind: 'thread', id: 'th-arret' },
];

// ── Détection de découpe (la détection propose, l'utilisateur dispose) ─────
// Keyed by filename. L'absence de détection ne retire jamais le contrôle.
export const DETECTIONS = {
  'Bulletins_salaire_2024.pdf': { count: 3, pieces: [
    { name: 'Bulletins de salaire - janvier à avril 2024', pages: '1-4' },
    { name: 'Bulletins de salaire - mai à août 2024', pages: '5-8' },
    { name: 'Bulletins de salaire - septembre à novembre 2024', pages: '9-11' },
  ] },
  'Factures_kine_T4_2024.pdf': { count: 3, pieces: [
    { name: 'Factures kinésithérapie - octobre 2024', pages: '1-2' },
    { name: 'Factures kinésithérapie - novembre 2024', pages: '3-4' },
    { name: 'Factures kinésithérapie - décembre 2024', pages: '5-6' },
  ] },
  'Decompte_prestations_2024.pdf': { count: 2, pieces: [
    { name: 'Décompte hospitalisation 2024', pages: '1-3' },
    { name: 'Décompte soins de ville 2024', pages: '4-5' },
  ] },
  'releve_frais_2025.pdf': { count: 4, pieces: [
    { name: 'Frais pharmaceutiques - T1 2025', pages: '1-3' },
    { name: 'Frais de transport - T1 2025', pages: '4-6' },
    { name: 'Frais d\'appareillage', pages: '7-9' },
    { name: 'Reste à charge divers', pages: '10-12' },
  ] },
};
export const detectionFor = (name) => DETECTIONS[name] || null;

// ── Fichiers locaux simulés (bouton « Ajouter depuis l'ordinateur » / drop) ─
export const MOCK_LOCAL_FILES = [
  { kind: 'file', name: 'releve_frais_2025.pdf', meta: 'PDF · 12 pages', decoupable: true },
  { kind: 'file', name: 'photos_vehicule.jpg', meta: 'Image · 2,4 Mo', decoupable: false },
  { kind: 'file', name: 'constat_amiable.pdf', meta: 'PDF · 4 pages', decoupable: true },
  { kind: 'eml', name: 'convocation_audience.eml', subject: 'Votre dossier - convocation à l\'audience du 12/03/2025', sender: 'Greffe TJ Paris', pj: [{ name: 'Convocation_audience_12-03-2025.pdf', decoupable: true }] },
  { kind: 'zip', name: 'export_outlook_leblanc.zip', meta: 'Export Outlook · 2 échanges',
    children: [
      { subject: 'Re : Offre d\'indemnisation amiable', sender: 'Assureur · AXA Sinistres', pj: [{ name: 'Offre_indemnisation_AXA.pdf', decoupable: true }, { name: 'Projet_protocole_transactionnel.pdf', decoupable: true }] },
      { subject: 'Attestation employeur et bulletins de salaire', sender: 'Employeur · Dupont Martin SAS', pj: [{ name: 'Attestation_employeur.pdf', decoupable: true }, { name: 'Bulletins_salaire_2024.pdf', decoupable: true }] },
    ] },
];

// ── Arborescence des pièces du dossier Plato (destinations) ────────────────
export const PIECES_NODES = [
  { id: 'correspondance', label: 'Correspondance' },
  { id: 'adverses', label: 'Pièces adverses' },
  { id: 'medicales', label: 'Pièces médicales' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'administratif', label: 'Administratif' },
  { id: 'sans-categorie', label: 'Sans catégorie' },
];
export const nodeLabel = (id) => (PIECES_NODES.find(n => n.id === id) || {}).label || id;

export const TYPE_TO_NODE = {
  Correspondance: 'correspondance', Expertise: 'expertise', 'Médical': 'medicales',
  Factures: 'medicales', Revenus: 'administratif', Administratif: 'administratif',
};

// ── Pièces du dossier (Leblanc c/ AXA) ─────────────────────────────────────
let pieceSeq = 0;
export const mkPiece = (p) => ({ id: `p-${pieceSeq++}`, isNew: false, provenance: null, ...p });

const HAND_PIECES = [
  { name: 'Échange courriel - Dr Martin - Expertise du 04/03/2025', type: 'Correspondance', nodeId: 'correspondance', kind: 'email', dateLabel: '09/04/2025', pagesLabel: '2 p.', provenance: { kind: 'import', sourceId: null, label: 'Import du 2 juil.' } },
  { name: 'Rapport d\'expertise médicale - Dr Martin - 04/03/2025', type: 'Expertise', nodeId: 'expertise', dateLabel: '04/03/2025', pagesLabel: '24 p.', provenance: { kind: 'import', sourceId: null, label: 'Import du 2 juil.' } },
  { name: 'Annexes d\'imagerie médicale - Expertise du 04/03/2025', type: 'Médical', nodeId: 'medicales', dateLabel: '04/03/2025', pagesLabel: '9 p.', provenance: { kind: 'import', sourceId: null, label: 'Import du 2 juil.' } },
  { name: 'Certificat de prolongation d\'arrêt de travail - Dr Lefèvre', type: 'Médical', nodeId: 'medicales', dateLabel: '28/01/2025', pagesLabel: '1 p.', provenance: { kind: 'import', sourceId: null, label: 'Import du 2 juil.' } },
  { name: 'Bulletins de salaire - Dupont Martin SAS - Année 2024', type: 'Revenus', nodeId: 'administratif', dateLabel: '25/11/2024', pagesLabel: '11 p.', provenance: { kind: 'drop', sourceId: null, label: 'Déposé le 2 juil.' } },
  { name: 'Factures kinésithérapie - juillet 2026', type: 'Factures', nodeId: 'medicales', isNew: true, dateLabel: '24/07/2026', pagesLabel: '4 p.', provenance: { kind: 'source', sourceId: 'src-folder-leblanc', label: '/Clients/Leblanc c/ AXA' } },
  { name: 'Échange courriel - CPAM - Relevé T2 2026', type: 'Correspondance', nodeId: 'correspondance', kind: 'email', isNew: true, dateLabel: '25/07/2026', pagesLabel: '1 p.', provenance: { kind: 'source', sourceId: 'src-folder-leblanc', label: '/Clients/Leblanc c/ AXA' } },
  { name: 'Rapport complémentaire d\'expertise - Dr Martin', type: 'Expertise', nodeId: 'expertise', isNew: true, dateLabel: '26/07/2026', pagesLabel: '6 p.', provenance: { kind: 'source', sourceId: 'src-th-expertise', label: 'Re : Compte rendu d\'expertise médicale' } },
  { name: 'Conclusions adverses n°2 - AXA', type: 'Administratif', nodeId: 'adverses', dateLabel: '18/06/2026', pagesLabel: '18 p.', provenance: { kind: 'drop', sourceId: null, label: 'Déposé le 18 juin' } },
  { name: 'Offre d\'indemnisation amiable - AXA - 14/02/2025', type: 'Correspondance', nodeId: 'adverses', dateLabel: '14/02/2025', pagesLabel: '4 p.', provenance: { kind: 'import', sourceId: null, label: 'Import du 2 juil.' } },
];

// Filler correspondance déterministe → la pagination (25 + « + N autres »)
// est démontrable dans la vue Correspondance.
const FILLER_SENDERS = ['CPAM - Service RCT', 'AXA Sinistres', 'Dr Martin', 'Cabinet Martin Kinésithérapie', 'Dupont Martin SAS', 'Me Girard'];
const FILLER_PIECES = Array.from({ length: 24 }, (_, i) => ({
  name: `Échange courriel - ${FILLER_SENDERS[i % FILLER_SENDERS.length]} - ${['suivi du dossier', 'pièces complémentaires', 'relance', 'accusé de réception'][i % 4]}`,
  type: 'Correspondance', nodeId: 'correspondance', kind: 'email',
  dateLabel: `${String(2 + (i % 26)).padStart(2, '0')}/0${1 + (i % 6)}/2026`, pagesLabel: `${1 + (i % 4)} p.`,
  provenance: { kind: 'import', sourceId: null, label: 'Import du 2 juil.' },
}));

export const seedPieces = () => { pieceSeq = 0; return [...HAND_PIECES, ...FILLER_PIECES].map(mkPiece); };

// Threads dont le contenu est déjà dans le dossier → mention doublon inline
// au panier (jamais d'écrasement silencieux).
export const DOSSIER_THREAD_IDS = new Set(['th-expertise', 'th-arret']);

// ── Sources (le lien vivant) ────────────────────────────────────────────────
// history[].kind : arrival | failure | doublon | decoupe | initial
//
// Cas d'erreur (source en erreur, échecs de PJ en rouge) masqués pour
// l'instant - repasser à true pour les démontrer (spec §5.2 / §9).
export const SHOW_ERROR_CASES = false;

const RAW_SOURCES = () => ([
  {
    id: 'src-folder-leblanc', kind: 'folder', refId: 'f-leblanc',
    pathLabel: '/Clients/Leblanc c/ AXA',
    subtitleBits: ['12 échanges', 'synchro cette nuit'],
    followed: true, since: '2 juil. 2026', destinationId: 'correspondance', decoupeAuto: false,
    newCount: 2, error: null,
    history: [
      { id: 'h-lb-1', date: '26 juil.', kind: 'failure', name: 'Devis_reparation.docx', reason: 'format non pris en charge', action: 'retry', pieceType: 'Administratif' },
      { id: 'h-lb-2', date: '25 juil.', kind: 'failure', name: 'Annexes_chiffrees.pdf', reason: 'PJ chiffrée - récupérez-la manuellement', action: 'manual', pieceType: 'Médical' },
      { id: 'h-lb-3', date: '25 juil.', kind: 'arrival', name: 'Échange courriel - CPAM - Relevé T2 2026', tag: 'Correspondance' },
      { id: 'h-lb-4', date: '24 juil.', kind: 'arrival', name: 'Factures kinésithérapie - juillet 2026', tag: 'Factures' },
      { id: 'h-lb-5', date: '18 juil.', kind: 'doublon', name: 'Attestation employeur - Dupont Martin SAS', note: 'déjà présent via Import du 2 juil.' },
      { id: 'h-lb-6', date: '12 juil.', kind: 'decoupe', name: 'Bulletins de salaire 2024', note: 'découpée en 3 pièces' },
      { id: 'h-lb-7', date: '2 juil.', kind: 'initial', count: 9 },
    ],
  },
  {
    id: 'src-th-expertise', kind: 'thread', refId: 'th-expertise',
    pathLabel: 'Re : Compte rendu d\'expertise médicale',
    subtitleBits: ['dr.martin@cabinet-expertise.fr', 'Experts & médecins'],
    followed: true, since: '2 juil. 2026', destinationId: 'expertise', decoupeAuto: false,
    newCount: 1, error: null,
    history: [
      { id: 'h-ex-1', date: '26 juil.', kind: 'arrival', name: 'Rapport complémentaire d\'expertise - Dr Martin', tag: 'Expertise' },
      { id: 'h-ex-2', date: '2 juil.', kind: 'initial', count: 3 },
    ],
  },
  {
    id: 'src-th-arret', kind: 'thread', refId: 'th-arret',
    pathLabel: 'Prolongation d\'arrêt de travail - certificat',
    subtitleBits: ['secretariat@dr-lefevre.fr', 'Boîte de réception'],
    followed: false, since: '2 juil. 2026', destinationId: 'medicales', decoupeAuto: false,
    newCount: 0, error: null,
    history: [
      { id: 'h-ar-1', date: '2 juil.', kind: 'initial', count: 2 },
    ],
  },
  {
    id: 'src-folder-morel', kind: 'folder', refId: null,
    pathLabel: '/Clients/Morel c/ MACIF (archive)',
    subtitleBits: ['6 échanges'],
    followed: true, since: '9 juil. 2026', destinationId: 'adverses', decoupeAuto: false,
    newCount: 0,
    error: { message: 'Dossier introuvable - synchro interrompue' },
    history: [
      { id: 'h-mo-1', date: '9 juil.', kind: 'initial', count: 4 },
    ],
  },
  {
    id: 'src-sender-kine', kind: 'sender', refId: 'facturation@cabinet-martin-kine.fr',
    pathLabel: 'facturation@cabinet-martin-kine.fr',
    subtitleBits: ['correspondant dédié', '4 échanges'],
    followed: true, since: '12 juil. 2026', destinationId: 'medicales', decoupeAuto: true,
    newCount: 0, error: null,
    history: [
      { id: 'h-ki-1', date: '24 juil.', kind: 'arrival', name: 'Factures kinésithérapie - juillet 2026', tag: 'Factures' },
      { id: 'h-ki-2', date: '24 juil.', kind: 'decoupe', name: 'Factures kinésithérapie - juillet 2026', note: 'découpée en 3 pièces' },
      { id: 'h-ki-3', date: '12 juil.', kind: 'initial', count: 5 },
    ],
  },
]);

export const seedSources = () => {
  const all = RAW_SOURCES();
  if (SHOW_ERROR_CASES) return all;
  return all
    .filter(s => !s.error)
    .map(s => ({ ...s, history: s.history.filter(h => h.kind !== 'failure') }));
};

export const seedSuggestions = () => ([
  { id: 'sug-martin', kind: 'sender', email: 'dr.martin@cabinet-expertise.fr', label: 'Expert · Dr Martin', detail: '3 échanges importés depuis cette adresse', isShared: false },
  { id: 'sug-axa', kind: 'sender', email: 'sinistres@axa-france.fr', label: 'Assureur · AXA Sinistres', detail: 'adresse partagée - suivi filtré : adresse + référence dossier', isShared: true },
]);

// ── Arrivées en attente (simulation de sync) ────────────────────────────────
// Consommées lot par lot par « Synchroniser » / « Vérifier maintenant ».
export const PENDING_ARRIVALS = {
  'src-folder-leblanc': [
    {
      pieces: [
        { name: 'Relevé d\'indemnités journalières - T3 2026', type: 'Médical', pagesLabel: '3 p.', dateLabel: '28/07/2026' },
        { name: 'Échange courriel - Assurance Mutuelle - Prise en charge', type: 'Correspondance', kind: 'email', pagesLabel: '4 p.', dateLabel: '28/07/2026' },
      ],
      history: [
        { kind: 'arrival', name: 'Relevé d\'indemnités journalières - T3 2026', tag: 'Médical' },
        { kind: 'arrival', name: 'Échange courriel - Assurance Mutuelle - Prise en charge', tag: 'Correspondance' },
        { kind: 'doublon', name: 'Tableau des garanties - Contrat prévoyance', note: 'déjà présent via Import du 2 juil.' },
      ],
    },
  ],
  'src-th-expertise': [
    {
      pieces: [
        { name: 'Convocation à l\'examen complémentaire du 4 septembre', type: 'Expertise', pagesLabel: '1 p.', dateLabel: '28/07/2026' },
      ],
      history: [
        { kind: 'arrival', name: 'Convocation à l\'examen complémentaire du 4 septembre', tag: 'Expertise' },
      ],
    },
  ],
};

// Dossier Outlook déjà lié à un autre dossier Plato (cas limite §9).
export const DEJA_LIE = { 'f-moreau': 'Moreau c/ Textilia' };

// ── Items du panier ─────────────────────────────────────────────────────────
// TRANSVASEMENT : les items du panier sont l'unique source de vérité. Cocher à
// gauche crée / complète un item ; la colonne mail dérive son état des items.
// Un thread est un COMPOSITE : ses « pièces » sont le corps du mail + chaque PJ,
// chacune cochable (`included`). Le corps du mail est une pièce comme les autres.
let itemSeq = 0;
export const mkItem = (it) => ({ id: `it-${itemSeq++}`, status: 'ready', ...it });

export const bodyKey = (tid) => `${tid}::body`;
export const pjKey = (tid, name) => `${tid}::${name}`;

// Liste complète des pièces d'un thread (corps + PJ). `onlyKey` : n'inclut que
// cette pièce (cas « je ne prends qu'une PJ ») - le reste reste disponible.
export function threadItemPieces(tv, { onlyKey = null } = {}) {
  const pieces = [
    { key: bodyKey(tv.id), kind: 'body', name: 'Corps du mail', msg: tv.msg },
    ...tv.attachments.map(a => ({ key: pjKey(tv.id, a.name), kind: 'pj', name: a.name, decoupable: a.decoupable, type: a.type })),
  ];
  return pieces.map(p => ({ ...p, included: onlyKey ? p.key === onlyKey : true }));
}

// Thread → item du panier. `onlyKey` : n'entre qu'avec cette seule pièce.
export function mkThreadItem(tid, { onlyKey = null, origin = 'emails' } = {}) {
  const tv = threadViewById(tid);
  if (!tv) return null;
  return mkItem({
    kind: 'thread', origin,
    status: DOSSIER_THREAD_IDS.has(tid) ? 'doublon' : 'ready',
    thread: {
      threadId: tid, subject: tv.subject, illegible: tv.illegible,
      lead: `${tv.sender} · ${relDate(tv.date)}`, msg: tv.msg,
      pieces: threadItemPieces(tv, { onlyKey }),
    },
  });
}

// Dossier → item du panier (bloc RÉCURSIF, aperçu en lecture seule). Les stats
// sont profondes : ce que la carte annonce est ce que le commit importe.
export function mkFolderItem(fid) {
  const f = folderById(fid);
  if (!f) return null;
  return mkItem({
    kind: 'folder', origin: 'emails',
    folder: { folderId: fid, name: f.name, path: folderPath(f), stats: statsForDeep(fid) },
  });
}

// Pièces d'un thread réellement retenues (cochées).
export const includedPieces = (thread) => thread.pieces.filter(p => p.included);
export const threadHasBody = (thread) => thread.pieces.some(p => p.kind === 'body' && p.included);
export const threadPJs = (thread) => thread.pieces.filter(p => p.kind === 'pj');

// Sous-titre de carte thread : « expéditeur · date · corps + 2 PJ sur 3 »
// (ou « 0 pièce » - transitoire, la carte quitte le panier au dernier décoché).
export function threadPieceSummary(thread) {
  const pjs = threadPJs(thread);
  const pjIn = pjs.filter(p => p.included).length;
  const parts = [];
  if (threadHasBody(thread)) parts.push('corps');
  if (pjs.length) parts.push(`${pjIn} PJ sur ${pjs.length}`);
  return parts.length ? parts.join(' + ') : '0 pièce';
}
export const threadCardSubtitle = (thread) => `${thread.lead} · ${threadPieceSummary(thread)}`;

// Récap du footer : « 1 échange (1 corps) + 2 PJ, 2 fichiers » (grammaire spec §5).
export function composerRecap(items) {
  const threads = items.filter(i => i.kind === 'thread');
  const files = items.filter(i => i.kind === 'file');
  const folders = items.filter(i => i.kind === 'folder');
  const zips = items.filter(i => i.kind === 'zip');
  const corps = threads.filter(t => threadHasBody(t.thread)).length;
  const pj = threads.reduce((n, t) => n + threadPJs(t.thread).filter(p => p.included).length, 0);
  const bits = [];
  if (threads.length) {
    let s = `${threads.length} échange${threads.length > 1 ? 's' : ''} (${corps} corps)`;
    if (pj) s += ` + ${pj} PJ`;
    bits.push(s);
  }
  if (files.length) bits.push(`${files.length} fichier${files.length > 1 ? 's' : ''}`);
  if (folders.length) bits.push(`${folders.length} dossier${folders.length > 1 ? 's' : ''} Outlook`);
  if (zips.length) bits.push(`${zips.length} export`);
  return bits.join(', ');
}

// Fichier local simulé → item (fichier, .eml ou zip d'export Outlook).
export function localFileToItem(mock) {
  if (mock.kind === 'eml') {
    return mkItem({
      kind: 'thread', origin: 'ordinateur', status: 'uploading',
      thread: {
        threadId: null, subject: mock.subject, illegible: false,
        lead: `${mock.sender} · ${mock.name}`, msg: 1,
        pieces: [
          { key: `eml-${mock.name}::body`, kind: 'body', name: 'Corps du mail', msg: 1, included: true },
          ...mock.pj.map((a, i) => ({ key: `eml-${mock.name}-${i}-${a.name}`, kind: 'pj', name: a.name, decoupable: a.decoupable, included: true })),
        ],
      },
    });
  }
  if (mock.kind === 'zip') {
    return mkItem({
      kind: 'zip', origin: 'ordinateur', status: 'uploading',
      zip: {
        name: mock.name, meta: mock.meta,
        children: mock.children.map((c, i) => ({
          subject: c.subject, sender: c.sender,
          pj: c.pj.map((a, j) => ({ key: `zip-${mock.name}-${i}-${j}-${a.name}`, name: a.name, decoupable: a.decoupable })),
        })),
      },
    });
  }
  return mkItem({
    kind: 'file', origin: 'ordinateur', status: 'uploading',
    file: { name: mock.name, meta: mock.meta, decoupable: mock.decoupable },
  });
}

// Clés découpables d'un item (fichier → id, PJ → key). Les images et les
// emails ne se découpent jamais ; tout PDF/doc reste découpable même sans
// détection.
export function decoupableKeys(item) {
  if (item.kind === 'file') return item.file.decoupable ? [{ key: item.id, name: item.file.name }] : [];
  // Seules les PJ RETENUES sont découpables : « Tout découper » ne porte jamais
  // sur une pièce décochée.
  if (item.kind === 'thread') return item.thread.pieces.filter(a => a.kind === 'pj' && a.decoupable && a.included).map(a => ({ key: a.key, name: a.name }));
  if (item.kind === 'zip') return item.zip.children.flatMap(c => c.pj.filter(a => a.decoupable).map(a => ({ key: a.key, name: a.name })));
  if (item.kind === 'folder') {
    return threadsOfFolderDeep(item.folder.folderId)
      .flatMap(tv => tv.attachments.filter(a => a.decoupable).map(a => ({ key: `${tv.id}::${a.name}`, name: a.name })));
  }
  return [];
}

// « ≈ N pièces » du récap : fichier = 1 (ou N si découpe détectée active),
// thread = corps + PJ, dossier = ≈ stats, zip = emails + PJ.
export function approxPieces(items, decoupe) {
  let n = 0;
  items.forEach(it => {
    if (it.kind === 'file') {
      const det = detectionFor(it.file.name);
      n += (decoupe.has(it.id) && det) ? det.count : 1;
    } else if (it.kind === 'thread') {
      // Seules les pièces retenues comptent : corps = 1, chaque PJ = 1 (ou N si
      // découpe détectée active).
      it.thread.pieces.forEach(p => {
        if (!p.included) return;
        if (p.kind === 'body') { n += 1; return; }
        const det = detectionFor(p.name);
        n += (decoupe.has(p.key) && det) ? det.count : 1;
      });
    } else if (it.kind === 'folder') {
      n += it.folder.stats.pieces;
    } else if (it.kind === 'zip') {
      it.zip.children.forEach(c => {
        n += 1;
        c.pj.forEach(pj => {
          const det = detectionFor(pj.name);
          n += (decoupe.has(pj.key) && det) ? det.count : 1;
        });
      });
    }
  });
  return n;
}
