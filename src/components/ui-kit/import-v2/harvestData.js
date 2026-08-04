// Données de la V2 « Récolte & Bordereau » - couche fine au-dessus de labData.
// Le renversement de la V2 : le système RASSEMBLE (récolte proposée avec
// preuves), l'avocat DÉCIDE (bordereau). Les dossiers Outlook ne sont plus des
// objets importables : les candidats sont toujours des échanges ou des fichiers.

import {
  threadById, threadViewById, relDate, bodyKey, pjKey,
  detectionFor, MOCK_LOCAL_FILES, threadImportInfo,
  treeLeaves, treeCounts, treeThreadTotals,
} from '../import/labData';

// ── Boîtes du user courant (spec « Connexion boîtes mail - solution finale ») ─
// Le picker agrège les canaux DU USER COURANT : les boîtes partagées du cabinet
// + ses boîtes personnelles - jamais la boîte personnelle d'un autre membre.
// Persona du lab : Marie, collaboratrice du cabinet Durand.
export const MAILBOXES = {
  shared: { id: 'mb-cabinet', label: 'Boîte cabinet', address: 'cabinet@durand-avocats.fr' },
  personal: { id: 'mb-perso', label: 'Ma boîte', address: 'marie@durand-avocats.fr' },
};

// tid → où le fil existe. Défaut : boîte cabinet. 'personal' = uniquement dans
// la boîte de Marie (le client ou un confrère lui écrit en direct) ; 'both' =
// reçu deux fois - dédup par conversationId : UN résultat, UNE pièce, double
// provenance.
const THREAD_MAILBOX = {
  'th-confrere': 'personal',
  'th-radiologue': 'personal',
  'th-greffe': 'both',
};
export const mailboxOf = (tid) => THREAD_MAILBOX[tid] || 'shared';

// ── Récolte proposée pour « Leblanc c/ AXA » ────────────────────────────────
// Chaque candidat porte sa PREUVE : pourquoi Norma le propose. La confiance
// vient de l'explication, jamais d'un score opaque.
export const HARVEST_GROUPS = [
  {
    id: 'medical', label: 'Expertise & médical',
    candidates: [
      { tid: 'th-expertise', evidence: 'Fil de l\'expertise Dr Martin - le dossier en a un instantané du 2 juil.' },
      { tid: 'th-arret', evidence: 'Expéditeur connu du dossier · 2 échanges déjà importés depuis cette adresse' },
      { tid: 'th-scan', evidence: 'Même expéditeur que le certificat du 28/01 · objet illisible, résumé affiché' },
    ],
  },
  {
    id: 'payeurs', label: 'Organismes payeurs',
    candidates: [
      { tid: 'th-cpam', evidence: 'La CPAM indemnise M. Leblanc · pièces justificatives du dossier' },
      { tid: 'th-mutuelle', evidence: 'L\'objet mentionne la prise en charge n°2024-1147 du dossier' },
    ],
  },
  {
    id: 'adverse', label: 'Partie adverse',
    candidates: [
      { tid: 'th-axa', evidence: 'AXA est la partie adverse · négociation de l\'offre d\'indemnisation' },
    ],
  },
];

export const PROPOSED_TIDS = new Set(HARVEST_GROUPS.flatMap(g => g.candidates.map(c => c.tid)));

// ── Dossiers Outlook proposés ───────────────────────────────────────────────
// Le geste le plus rentable de la V1 revient en tête de récolte : « Ajouter en
// entier » verse tout le dossier d'un coup. L'anti double-import n'est plus
// l'amputation du geste : ajouter le dossier ABSORBE les échanges déjà pris.
// ── Modèle de dossiers V2 (local, découplé du seed V1) ──────────────────────
// Un dossier = un nom + des sous-dossiers + des échanges (par id réel, pour que
// les cartes candidat et l'arbre du bordereau se rendent). `addedOn` : déjà
// versé au dossier ; `newTids` / `newPjKeys` : ce qui est arrivé DEPUIS (delta
// dossier, comme « déjà importé qui a grossi » mais au niveau du dossier).
export const FOLDER_MODELS = {
  'fd-leblanc': {
    id: 'fd-leblanc', name: 'Leblanc c/ AXA', parent: null,
    evidence: 'Le dossier Outlook porte le nom de l\'affaire - rangé par vos soins',
    subs: ['fd-leblanc-exp', 'fd-leblanc-payeurs'], tids: ['th-axa'],
  },
  'fd-leblanc-exp': { id: 'fd-leblanc-exp', name: 'Expertise médicale', parent: 'fd-leblanc', subs: [], tids: ['th-expertise', 'th-arret'] },
  'fd-leblanc-payeurs': { id: 'fd-leblanc-payeurs', name: 'Organismes payeurs', parent: 'fd-leblanc', subs: [], tids: ['th-cpam', 'th-mutuelle'] },
  // Déjà versé au dossier le 2 juil. ; depuis : un nouvel échange (th-kine) et
  // une nouvelle PJ dans un échange déjà là (th-employeur / Attestation).
  'fd-axa-corr': {
    id: 'fd-axa-corr', name: 'Correspondance AXA', parent: null,
    evidence: 'Correspondance avec la partie adverse - déjà versée au dossier',
    subs: [], tids: ['th-employeur', 'th-greffe', 'th-kine'],
    addedOn: '2 juil.',
    newTids: ['th-kine'],
    newPjKeys: [pjKey('th-employeur', 'Attestation_employeur.pdf')],
  },
  // Cas limite §9 : dossier Outlook déjà lié à un AUTRE dossier Plato.
  'fd-moreau': {
    id: 'fd-moreau', name: 'Moreau - Prud\'hommes', parent: null,
    evidence: 'Contient des échanges avec des correspondants communs',
    subs: [], tids: ['th-moreau-rh'], linkedTo: 'Moreau c/ Textilia',
  },
};
export const FOLDER_CANDIDATE_IDS = ['fd-leblanc', 'fd-axa-corr', 'fd-moreau'];
export const folderModel = (fid) => FOLDER_MODELS[fid] || null;
export const childFolderModels = (fid) => (FOLDER_MODELS[fid]?.subs || []).map(folderModel).filter(Boolean);

export function folderBreadcrumbV2(fid) {
  const chain = [];
  let cur = FOLDER_MODELS[fid];
  let guard = 0;
  while (cur && guard++ < 8) { chain.unshift(cur.name); cur = cur.parent ? FOLDER_MODELS[cur.parent] : null; }
  return chain.join(' / ');
}

// Nœud échange (corps + PJ) ; `isNew` marque le delta (échange ou PJ arrivé
// depuis l'ajout du dossier au dossier).
function threadNodeFor(tid, newTids, newPjKeys) {
  const tv = threadViewById(tid);
  if (!tv) return null;
  const isNewThread = newTids.has(tid);
  if (!tv.attachments || tv.attachments.length === 0) {
    return { key: tid, kind: 'thread', name: tv.subject, sub: tv.sender, illegible: tv.illegible, msg: tv.msg, bodyOnly: true, included: true, isNew: isNewThread };
  }
  return {
    key: tid, kind: 'thread', name: tv.subject, sub: tv.sender, illegible: tv.illegible, isNew: isNewThread,
    children: [
      { key: bodyKey(tid), kind: 'body', name: 'Corps du mail', msg: tv.msg, included: true, isNew: isNewThread },
      ...tv.attachments.map(a => ({ key: pjKey(tid, a.name), kind: 'pj', name: a.name, decoupable: a.decoupable, included: true, isNew: isNewThread || newPjKeys.has(pjKey(tid, a.name)) })),
    ],
  };
}

export function buildFolderTree(fid) {
  const m = FOLDER_MODELS[fid];
  if (!m) return null;
  const newTids = new Set(m.newTids || []);
  const newPjKeys = new Set(m.newPjKeys || []);
  const subNodes = (m.subs || []).map(buildFolderTree).filter(Boolean);
  const threadNodes = (m.tids || []).map(t => threadNodeFor(t, newTids, newPjKeys)).filter(Boolean);
  return { key: fid, kind: 'folder', name: m.name, children: [...subNodes, ...threadNodes] };
}

const countSubs = (fid) => (FOLDER_MODELS[fid]?.subs || []).reduce((n, s) => n + 1 + countSubs(s), 0);
export function folderStats(fid) {
  const tree = buildFolderTree(fid);
  if (!tree) return { threads: 0, pieces: 0, folders: 0 };
  return { threads: treeThreadTotals(tree).threads, pieces: treeCounts(tree).total, folders: countSubs(fid) };
}

// Delta du dossier : ce qui est arrivé depuis l'ajout (nouvelles pièces).
export function folderDelta(fid) {
  const m = FOLDER_MODELS[fid];
  if (!m || !m.addedOn) return null;
  const tree = buildFolderTree(fid);
  const newLeaves = treeLeaves(tree).filter(l => l.isNew);
  return { addedOn: m.addedOn, newCount: newLeaves.length, newTids: new Set(m.newTids || []), newPjKeys: new Set(m.newPjKeys || []) };
}

// Clés de pièces du delta d'un dossier (pour savoir s'il est déjà complété).
export function folderDeltaKeys(fid) {
  const m = FOLDER_MODELS[fid];
  if (!m || !m.addedOn) return [];
  const keys = [];
  (m.newTids || []).forEach(tid => {
    const tv = threadViewById(tid);
    if (!tv) return;
    keys.push(bodyKey(tid));
    tv.attachments.forEach(a => keys.push(pjKey(tid, a.name)));
  });
  (m.newPjKeys || []).forEach(k => keys.push(k));
  return keys;
}

// ── Fils déjà importés une fois (instantané, jamais une source) ─────────────
// L'import est un SNAPSHOT : si le fil a grossi depuis, la seule voie honnête
// est le complément manuel du DELTA (labData.threadImportInfo). La V2 ne
// l'applique qu'à th-expertise - th-arret garde son scénario doublon (signal
// de CONTENU, distinct de l'état de fil).
export const IMPORTED_TIDS = new Set(['th-expertise']);
export const deltaInfoOf = (tid) => (IMPORTED_TIDS.has(tid) ? threadImportInfo(tid) : null);

// Lignes de COMPLÉMENT : uniquement le delta (corps actualisé + PJ nouvelles),
// jamais les pièces déjà au dossier - zéro doublon, zéro oubli.
export function threadDeltaLineSpecs(tid) {
  const info = deltaInfoOf(tid);
  if (!info || info.delta.length === 0) return [];
  const tv = threadViewById(tid);
  const lead = `${tv.sender} · ${relDate(tv.date)}`;
  const group = { threadId: tid, threadSubject: tv.subject, threadIllegible: tv.illegible, threadLead: lead, threadMailbox: mailboxOf(tid), topUp: info.importedOn };
  return info.delta.map(d => {
    if (d.kind === 'body') {
      return {
        key: d.key, kind: 'body', ...group,
        title: 'Corps du mail',
        provenance: `version actualisée · +${d.newMessages} nouveaux messages`,
        tag: 'actualisé',
        detection: null, doublon: null,
      };
    }
    const pool = poolOf(tid, d.name);
    return {
      key: d.key, kind: 'pj', ...group,
      title: d.name, // nom d'origine, jamais renommé
      provenance: pjMeta(pool),
      tag: 'nouvelle',
      decoupable: d.decoupable,
      detection: d.decoupable ? detectionFor(d.name) : null,
      doublon: null,
    };
  });
}

// ── Doublons connus (signalés, jamais silencieux) ───────────────────────────
// key (pjKey) → note. Le doublon devient une LIGNE du bordereau, avec actions.
export const DOUBLONS = {
  [pjKey('th-arret', 'Certificat_prolongation_arret.pdf')]: {
    note: 'Semble identique à « Certificat de prolongation d\'arrêt de travail - Dr Lefèvre » versée le 2 juil.',
  },
  [pjKey('th-employeur', 'Bulletins_salaire_2024.pdf')]: {
    note: 'Semble identique à « Bulletins de salaire - Dupont Martin SAS - Année 2024 » versée le 2 juil.',
  },
};

// ── Pièces d'un échange (specs de lignes du bordereau) ──────────────────────
// Le bordereau garde le NOM D'ORIGINE du document (jamais de renommage) : le
// titre = le nom de fichier tel qu'il arrive ; la méta donne pages / type.
const poolOf = (tid, name) => {
  const raw = threadById(tid);
  return ((raw?.attachments) || []).find(a => a.name === name)?.pool || null;
};
// Bordereau simplifié (Meghan, 2026-08-03 « no page number, no category ») : la
// ligne d'une PJ = son NOM D'ORIGINE seul. Ni pagination ni catégorie sous le
// titre - le nom du fichier suffit à la reconnaître.
const pjMeta = () => '';

export function threadLineSpecs(tid) {
  const tv = threadViewById(tid);
  if (!tv) return [];
  const lead = `${tv.sender} · ${relDate(tv.date)}`;
  // Ce qui vient du même échange reste ENSEMBLE au bordereau : chaque ligne
  // porte le sujet + l'expéditeur de son échange pour former un groupe sous
  // chapeau - la provenance se dit une fois, pas ligne par ligne.
  const group = { threadId: tid, threadSubject: tv.subject, threadIllegible: tv.illegible, threadLead: lead, threadMailbox: mailboxOf(tid) };
  const body = {
    key: bodyKey(tid), kind: 'body', ...group,
    title: 'Corps du mail',
    provenance: tv.msg > 1 ? `${tv.msg} messages` : '1 message',
    detection: null, doublon: null,
  };
  const pjs = tv.attachments.map(a => {
    const pool = poolOf(tid, a.name);
    return {
      key: pjKey(tid, a.name), kind: 'pj', ...group,
      title: a.name, // nom d'origine, jamais renommé
      provenance: pjMeta(pool),
      decoupable: a.decoupable,
      detection: a.decoupable ? detectionFor(a.name) : null,
      doublon: DOUBLONS[pjKey(tid, a.name)] || null,
    };
  });
  return [body, ...pjs];
}

// Fichier local simulé → spec de ligne. Cycle sur les fichiers simples du lab
// (les zips d'export restent hors périmètre de cette V2). Le 3e dépôt ÉCHOUE
// (format non pris en charge) : les échecs sont des lignes, avec action.
const LOCAL_FILES = (() => {
  const files = MOCK_LOCAL_FILES.filter(m => m.kind === 'file');
  return [...files.slice(0, 2), { name: 'Devis_reparation.docx', meta: 'DOCX · 1,2 Mo', decoupable: true, fail: true }, ...files.slice(2)];
})();
export function localFileSpec(cursor) {
  const mock = LOCAL_FILES[cursor % LOCAL_FILES.length];
  return {
    key: `file-${cursor}-${mock.name}`, threadId: null, kind: 'file',
    title: mock.name,
    provenance: `${mock.meta} · déposé depuis l'ordinateur`,
    suggestedNodeId: null,
    decoupable: !!mock.decoupable,
    detection: mock.decoupable ? detectionFor(mock.name) : null,
    doublon: null,
    fail: !!mock.fail,
  };
}

