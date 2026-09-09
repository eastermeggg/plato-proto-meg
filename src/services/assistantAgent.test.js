// Tests for the assistant agent service (detection §0, catalog §3/§4, respond §3).
import { getCatalog, detectSignals, shouldEmit, respond } from './assistantAgent';

// ── Fixtures shaped like the real App.js records ──────────────────────────────

const DOSSIER_MARTEL = {
  id: 'd-martel',
  reference: 'Martel c/ AXA',
  typeFait: 'Accident de la circulation',
  date: '15/03/2023',
  lastEditBy: 'Meghan R.',
  lastEditDate: '04/09/2026',
  statut: 'ouvert',
  matterType: 'corporel',
};

const DOSSIER_MARTEL_SOCIAL = {
  id: 'd-martel-batinord',
  reference: 'Martel c/ Bâti-Nord',
  typeFait: 'Licenciement',
  date: '02/05/2023',
  lastEditBy: 'Meghan R.',
  lastEditDate: '12/01/2024',
  statut: 'clos',
  matterType: 'social',
};

const DOSSIER_AURORE = {
  id: 'd-aurore',
  reference: 'SCI Aurore c/ MAIF',
  typeFait: 'Sinistre immobilier',
  date: '10/06/2024',
  lastEditBy: 'Meghan R.',
  lastEditDate: '01/09/2026',
  statut: 'ouvert',
  matterType: 'corporel',
};

const DOSSIERS = [DOSSIER_MARTEL, DOSSIER_AURORE];

const PIECES = [
  { id: 'p-1', nom: 'Facture CHU Bordeaux.pdf', intitule: 'Facture hospitalisation CHU Bordeaux', date: '15/03/2023', type: 'Facture', categoryId: 'cat-frais-med' },
  { id: 'p-5', nom: 'Rapport Dr. Martin.pdf', intitule: "Rapport d'expertise", date: '12/09/2024', type: 'Rapport', categoryId: 'cat-expertises' },
  { id: 'p-99', nom: 'Note manuscrite.pdf', intitule: 'Note manuscrite', date: '01/01/2025', type: 'Note' }, // no category
];

const PIECE_FOLDERS = [
  { id: 'cat-medical', name: 'Médical', parentId: null, order: 1 },
  { id: 'cat-expertises', name: 'Expertises', parentId: 'cat-medical', order: 0 },
  { id: 'cat-frais-med', name: 'Frais médicaux', parentId: 'cat-medical', order: 2 },
];

const TEMPLATES = [
  { id: 'tpl-assignation-re', label: 'Assignation en référé-expertise', actType: 'assignation', fileName: 'modele_assignation_re.docx' },
  { id: 'tpl-protocole', label: 'Protocole transactionnel type', actType: 'protocole', fileName: 'modele_protocole.docx' },
];

const REFERENTIELS = [
  { id: 'gdp_2025_prospective', label: 'GDP 2025 Prospective 0,50%', type: 'bareme', status: 'active' },
];

const UNSCOPED = { dossierId: null, vertical: null };

// ── detectSignals ─────────────────────────────────────────────────────────────

describe('detectSignals - silences', () => {
  it('stays silent on a knowledge question full of names and dates matching no dossier', () => {
    const signals = detectSignals(
      'Un salarié peut-il encore contester son licenciement 13 mois après la notification du 12 mars 2025, selon la Cour de cassation ?',
      UNSCOPED,
      DOSSIERS
    );
    expect(signals).toEqual([]);
  });

  it('stays silent on a portfolio question (état, no dossier named)', () => {
    const signals = detectSignals('Il me reste quoi à faire cette semaine ?', UNSCOPED, DOSSIERS);
    expect(signals).toEqual([]);
  });
});

describe('detectSignals - dossier matching', () => {
  it('emits one dossierMatch when a single dossier matches', () => {
    const signals = detectSignals("Où en est-on dans l'affaire Martel ? On attend quoi ?", UNSCOPED, DOSSIERS);
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('dossierMatch');
    expect(signals[0].candidates).toHaveLength(1);
    expect(signals[0].candidates[0].dossierId).toBe('d-martel');
    expect(signals[0].candidates[0].name).toBe('Martel c/ AXA');
    expect(typeof signals[0].confidence).toBe('number');
  });

  it('matches fuzzily: « Mme MARTEL » ≈ « Martel »', () => {
    const signals = detectSignals('Le rendez-vous avec Mme MARTEL est confirmé pour jeudi.', UNSCOPED, DOSSIERS);
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('dossierMatch');
    expect(signals[0].candidates[0].dossierId).toBe('d-martel');
  });

  it('emits ambiguousMatch when two dossiers match, most recently active first', () => {
    const signals = detectSignals(
      "Rappelle-moi le délai qu'on a devant nous chez Martel.",
      UNSCOPED,
      [DOSSIER_MARTEL_SOCIAL, DOSSIER_MARTEL] // deliberately stale-first in input
    );
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('ambiguousMatch');
    expect(signals[0].candidates).toHaveLength(2);
    expect(signals[0].candidates[0].dossierId).toBe('d-martel'); // 04/09/2026 > 12/01/2024
    expect(signals[0].candidates[1].dossierId).toBe('d-martel-batinord');
    expect(signals[0].candidates[1].isClosed).toBe(true);
  });
});

describe('detectSignals - locked tools and explicit intent', () => {
  it('emits lockedTool for a production request while unscoped', () => {
    const signals = detectSignals('Chiffre le préjudice - DFT 6 mois, SE 4/7.', UNSCOPED, DOSSIERS);
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('lockedTool');
  });

  it('emits explicitIntent on « je prends le dossier »', () => {
    const signals = detectSignals('OK, je prends le dossier.', UNSCOPED, DOSSIERS);
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('explicitIntent');
  });
});

describe('detectSignals - nudge history (one nudge per signal)', () => {
  const declinedMartel = [
    { signalType: 'dossierMatch', subjectId: 'd-martel', state: 'declined', reEmitted: false },
  ];

  it('never re-fires a declined dossierMatch for the same subject', () => {
    const signals = detectSignals(
      'Et le point de départ du délai chez Martel ?',
      UNSCOPED,
      DOSSIERS,
      declinedMartel
    );
    expect(signals).toEqual([]);
  });

  it('re-emits once on a NEW signal type (pieceReference) after a declined dossierMatch', () => {
    const signals = detectSignals(
      'Regarde la pièce 41 du dossier Martel, le décompte CPAM.',
      UNSCOPED,
      DOSSIERS,
      declinedMartel
    );
    expect(signals).toHaveLength(1);
    expect(signals[0].type).toBe('pieceReference');
  });

  it('shouldEmit spends a re-emission signal once (reEmitted → never again)', () => {
    const signal = { type: 'pieceReference', candidates: [], confidence: 0.85 };
    expect(shouldEmit(signal, declinedMartel)).toBe(true);
    const afterReEmission = [
      ...declinedMartel,
      { signalType: 'pieceReference', subjectId: 'd-martel', state: 'declined', reEmitted: true },
    ];
    expect(shouldEmit(signal, afterReEmission)).toBe(false);
  });
});

describe('detectSignals - in dossier', () => {
  it('mentioning another dossier from inside a dossier emits nothing (free cross-read)', () => {
    const signals = detectSignals(
      'Pour le PGPF de la gérante, comment on avait capitalisé dans Martel ?',
      { dossierId: 'd-aurore', vertical: 'corporel' },
      DOSSIERS
    );
    expect(signals).toEqual([]);
  });

  it('production inside a dossier emits nothing (execute, no gate)', () => {
    const signals = detectSignals(
      'Chiffre le PGPF avec la GdP 2022, on tranche.',
      { dossierId: 'd-martel', vertical: 'corporel' },
      DOSSIERS
    );
    expect(signals).toEqual([]);
  });
});

// ── getCatalog ────────────────────────────────────────────────────────────────

describe('getCatalog', () => {
  const DATA = {
    dossiers: DOSSIERS,
    pieces: PIECES,
    pieceFolders: PIECE_FOLDERS,
    templates: TEMPLATES,
    referentiels: REFERENTIELS,
  };

  it('unscoped: never leaks a piece name, returns exactly one locked conversion group', () => {
    const catalog = getCatalog(UNSCOPED, DATA);
    const serialized = JSON.stringify(catalog.objects);
    PIECES.forEach((p) => {
      expect(serialized).not.toContain(p.nom);
      expect(serialized).not.toContain(p.intitule);
      expect(serialized).not.toContain(p.id);
    });
    const lockedGroups = catalog.objects.filter((g) => g.locked);
    expect(lockedGroups).toHaveLength(1);
    expect(lockedGroups[0]).toMatchObject({
      key: 'locked',
      label: 'Pièces, chiffrage, actes',
      locked: true,
      conversion: true,
    });
    // Modèles and référentiels stay available unscoped.
    const keys = catalog.objects.map((g) => g.key);
    expect(keys).toContain('modeles');
    expect(keys).toContain('referentiels');
    expect(keys).not.toContain('pieces');
  });

  it('never returns a destructive intention, in any scope', () => {
    const unscoped = getCatalog(UNSCOPED, DATA);
    const scoped = getCatalog({ dossierId: 'd-martel', vertical: 'corporel' }, DATA);
    [...unscoped.intentions, ...scoped.intentions].forEach((entry) => {
      expect(entry.isDestructive).toBe(false);
    });
    const ids = unscoped.intentions.map((entry) => entry.id);
    expect(ids).not.toContain('supprimer-piece');
    expect(ids).not.toContain('cloturer-dossier');
  });

  it('returns locked dossierOnly intentions as conversion rows when unscoped', () => {
    const { intentions } = getCatalog(UNSCOPED, DATA);
    const chiffrer = intentions.find((entry) => entry.id === 'chiffrer');
    expect(chiffrer).toBeDefined();
    expect(chiffrer.locked).toBe(true);
    const jp = intentions.find((entry) => entry.id === 'rechercher-jp');
    expect(jp.locked).toBe(false);
  });

  it('scoped: pieces nested by folder, other dossiers as read-only references, nothing locked', () => {
    const catalog = getCatalog({ dossierId: 'd-martel', vertical: 'corporel' }, DATA);
    const piecesGroup = catalog.objects.find((g) => g.key === 'pieces');
    expect(piecesGroup).toBeDefined();
    const expertises = piecesGroup.folders.find((f) => f.key === 'cat-expertises');
    expect(expertises.label).toBe('Médical / Expertises');
    expect(expertises.items.map((i) => i.id)).toEqual(['p-5']);
    expect(expertises.items[0]).toMatchObject({ type: 'piece', family: 'piece' });
    // Uncategorized piece falls into « Sans catégorie ».
    const orphelins = piecesGroup.folders.find((f) => f.key === 'sans-categorie');
    expect(orphelins.items.map((i) => i.id)).toEqual(['p-99']);
    // Other dossiers only, current one excluded.
    const dossiersGroup = catalog.objects.find((g) => g.key === 'dossiers');
    expect(dossiersGroup.items.map((i) => i.id)).toEqual(['d-aurore']);
    expect(dossiersGroup.items[0].type).toBe('dossier');
    // Intentions unlocked in dossier.
    const chiffrer = catalog.intentions.find((entry) => entry.id === 'chiffrer');
    expect(chiffrer.locked).toBe(false);
    expect(catalog.objects.every((g) => !g.locked)).toBe(true);
  });

  it('tolerates missing data (empty catalog, locked group still there)', () => {
    const catalog = getCatalog(UNSCOPED, {});
    expect(catalog.objects.find((g) => g.key === 'locked')).toBeDefined();
    expect(catalog.intentions.length).toBeGreaterThan(0);
  });
});

// ── respond ───────────────────────────────────────────────────────────────────

describe('respond', () => {
  it('answers a knowledge question with a sourced agent message, body first', async () => {
    const messages = await respond(
      { scope: UNSCOPED },
      'Quel est le délai pour contester un licenciement après notification ?',
      { dossiers: DOSSIERS }
    );
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].kind).toBe('agent');
    expect(messages[0].body.length).toBeGreaterThan(0);
    expect(messages[0].sources[0].kind).toBe('statute');
    expect(messages[0].body).not.toContain('—'); // hyphens, never em-dashes
  });

  it('answers a portfolio question from the real dossiers, with the readStatement', async () => {
    const messages = await respond(
      { scope: UNSCOPED },
      'Il me reste quoi à faire cette semaine ?',
      { dossiers: [DOSSIER_MARTEL, DOSSIER_AURORE, DOSSIER_MARTEL_SOCIAL] }
    );
    expect(messages).toHaveLength(1);
    const msg = messages[0];
    expect(msg.kind).toBe('agent');
    // One line per ACTIVE dossier (the closed one is excluded).
    expect(msg.body).toContain('Martel c/ AXA');
    expect(msg.body).toContain('SCI Aurore c/ MAIF');
    expect(msg.body).not.toContain('Bâti-Nord');
    expect(msg.readStatement).toBe(
      "J'ai lu les tableaux de bord des 2 dossiers actifs - stade, prochaine action, échéances. Aucune pièce, aucun croisement."
    );
    expect(msg.readStatement).not.toContain('—');
  });
});
