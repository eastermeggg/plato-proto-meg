// Données réalistes d'un cabinet d'avocats pour l'arbre d'import de dossiers.
// Un dossier par affaire (« Client c/ Partie » ou « Client - Nature »), 2-5
// sous-dossiers nommés d'après les familles de pièces réelles, volumétrie
// VARIÉE et COHÉRENTE (le total du parent = somme des enfants). Arbre complet :
// Dossier → Sous-dossier → Thread (échange) → Message → Corps / Pièce jointe.
// Tout est généré déterministe (seed = hash de l'id) : stable entre rendus.

const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
// PRNG déterministe seedé.
const rng = (seed) => {
  let s = seed >>> 0 || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
};
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
const pickN = (arr, n, r) => {
  const pool = [...arr]; const out = [];
  for (let i = 0; i < n && pool.length; i++) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
};

// ── Référentiels métier ─────────────────────────────────────────────────────
export const CLIENT_FOLDERS = [
  'Dupont c/ MAIF', 'SCI Lorraine - Bail commercial', 'Succession Martin',
  'Rivière c/ CPAM', 'Groupe Vasseur - Contentieux fournisseur', 'Lemoine c/ Allianz',
  'SARL Descamps - Redressement', 'Consorts Bréa - Indivision', 'Fabre c/ Pôle emploi',
  'SAS Verdier - Rupture commerciale', 'Nguyen c/ AXA', 'Bail Rousseau - Congé',
  'Divorce Petit', 'Chantiers Morel - Malfaçons', 'Ollivier c/ URSSAF', 'Legrand c/ MACIF',
];
const FAMILIES = [
  'Pièces adverses', 'Correspondances confrère', 'Expertise médicale',
  'Audiences & conclusions', 'Honoraires', 'Pièces communiquées',
  'Constitution de dossier', 'Archives 2024',
];
const SENDERS = [
  'Me Girard (adverse)', 'Cabinet Rivière', 'Dr Martin - expert', 'Greffe TJ Paris',
  'AXA Sinistres', 'CPAM - Service RCT', 'Client', 'Huissier Bertrand', 'Confrère Me Fabre',
];
const SUBJECTS = {
  'Pièces adverses': ['Conclusions adverses n°', 'Bordereau de pièces adverses', 'Sommations de communiquer', 'Dire d\'expert - partie adverse'],
  'Correspondances confrère': ['Re : Calendrier de procédure', 'Proposition de règlement amiable', 'Transmission de pièces', 'Demande de renvoi'],
  'Expertise médicale': ['Rapport d\'expertise du', 'Convocation à expertise', 'Dire au médecin expert', 'Compte rendu opératoire'],
  'Audiences & conclusions': ['Conclusions récapitulatives', 'Convocation - mise en état', 'Bulletin de procédure', 'Note en délibéré'],
  'Honoraires': ['Convention d\'honoraires', 'Facture n°', 'Provision sur honoraires', 'État de frais'],
  'Pièces communiquées': ['Bordereau de communication n°', 'Attestation de témoin', 'Justificatifs de préjudice', 'Constat d\'huissier'],
  'Constitution de dossier': ['Mandat de représentation', 'Pièces d\'identité', 'Assignation', 'Requête introductive'],
  'Archives 2024': ['Ancien courrier', 'Pièces T4 2024', 'Décision de première instance'],
};
const PJ_POOL = [
  ['Conclusions.pdf', true], ['Bordereau_pieces.pdf', true], ['Rapport_expertise.pdf', true],
  ['Facture.pdf', false], ['Attestation_temoin.pdf', false], ['Constat_huissier.pdf', true],
  ['Assignation.pdf', true], ['Convocation.pdf', false], ['Justificatifs_frais.pdf', true],
  ['Photo_lieux.jpg', false], ['Certificat_medical.pdf', false], ['Protocole.docx', true],
];

// ── Génération d'un arbre de dossier ────────────────────────────────────────
// clé unique par nœud ; feuilles = corps de message + PJ (porteuses de `included`
// via la sélection externe). Interne = folder / thread / message.
function buildMessage(tid, mi, r, pjHere) {
  const mid = `${tid}::m${mi}`;
  const children = [
    { key: `${mid}::body`, kind: 'body', name: mi === 0 ? 'Message initial' : `Réponse ${mi}`, sub: pick(SENDERS, r) },
    ...pjHere.map(([name, dec], j) => ({ key: `${mid}::pj${j}::${name}`, kind: 'pj', name, decoupable: dec })),
  ];
  return { key: mid, kind: 'message', name: `${pick(SENDERS, r)} · ${1 + Math.floor(r() * 27)} ${pick(['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin'], r)}`, children };
}
function buildThread(fid, family, ti, r) {
  const tid = `${fid}::t${ti}`;
  const base = pick(SUBJECTS[family] || SUBJECTS['Correspondances confrère'], r);
  const subject = /n°$|du$/.test(base) ? `${base} ${1 + Math.floor(r() * 4)}` : base;
  const nMsg = 1 + Math.floor(r() * 5); // 1-5 messages
  // PJ concentrées sur 1-2 messages (réaliste), 0-3 au total.
  const nPj = Math.floor(r() * 3.4);
  const pjList = Array.from({ length: nPj }, () => pick(PJ_POOL, r));
  const messages = Array.from({ length: nMsg }, (_, mi) => {
    const pjHere = pjList.filter((_, j) => (j % nMsg) === mi);
    return buildMessage(tid, mi, r, pjHere);
  });
  return { key: tid, kind: 'thread', name: subject, sub: pick(SENDERS, r), children: messages };
}
function buildSubfolder(fid, family, r) {
  const sfid = `${fid}::${family.replace(/\W+/g, '')}`;
  // Volumétrie VARIÉE : la plupart 1-8 échanges, un archive parfois volumineux.
  const heavy = family === 'Archives 2024' || r() < 0.18;
  const nThreads = heavy ? 10 + Math.floor(r() * 11) : 1 + Math.floor(r() * 8); // 1-8 ou 10-20
  const threads = Array.from({ length: nThreads }, (_, ti) => buildThread(sfid, family, ti, r));
  return { key: sfid, kind: 'folder', name: family, children: threads };
}
export function buildFolderTree(clientName) {
  const seed = hash(clientName);
  const r = rng(seed);
  const nSub = 2 + Math.floor(r() * 4); // 2-5 sous-dossiers
  const fams = pickN(FAMILIES, nSub, r);
  const fid = `f::${clientName}`;
  const children = fams.map(fam => buildSubfolder(fid, fam, r));
  return { key: fid, kind: 'folder', name: clientName, children };
}

// ── Helpers d'arbre (feuilles = corps + PJ) ─────────────────────────────────
export function nodeLeaves(node) {
  if (!node.children) return [node];
  return node.children.flatMap(nodeLeaves);
}
export function nodeThreadCount(node) {
  if (node.kind === 'thread') return 1;
  if (!node.children) return 0;
  return node.children.reduce((a, c) => a + nodeThreadCount(c), 0);
}
// Compte des pièces (feuilles) et des pièces retenues, selon l'ensemble EXCLU.
export function nodeCounts(node, excluded) {
  const leaves = nodeLeaves(node);
  const included = leaves.reduce((a, l) => a + (excluded.has(l.key) ? 0 : 1), 0);
  return { total: leaves.length, included };
}
export function nodeState(node, excluded) {
  const { total, included } = nodeCounts(node, excluded);
  if (included === 0) return 'none';
  if (included === total) return 'all';
  return 'some';
}
// Échanges retenus (≥ 1 pièce cochée) sous un nœud.
export function includedThreadCount(node, excluded) {
  if (node.kind === 'thread') return nodeCounts(node, excluded).included > 0 ? 1 : 0;
  if (!node.children) return 0;
  return node.children.reduce((a, c) => a + includedThreadCount(c, excluded), 0);
}
