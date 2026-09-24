// ============================================================
// Tiers Payeurs — hardcoded demo scenarios (spec v3)
// ============================================================
// Single extraction mode: créance récapitulative.
// Each CreanceTP contains LigneCreance[] decomposed by nature.
// Load-time processing derives _imputationsByPoste from lignes.
// ============================================================

// ── Nature de créance enum ────────────────────────────────────
export const NATURE_CREANCE = {
  FRAIS_HOSPITALIERS: 'FRAIS_HOSPITALIERS',
  FRAIS_MEDICAUX: 'FRAIS_MEDICAUX',
  FRAIS_PHARMACEUTIQUES: 'FRAIS_PHARMACEUTIQUES',
  FRAIS_APPAREILLAGE: 'FRAIS_APPAREILLAGE',
  FRAIS_TRANSPORT: 'FRAIS_TRANSPORT',
  FRANCHISES: 'FRANCHISES',
  IJ: 'IJ',
  ARRERAGES_INVALIDITE: 'ARRERAGES_INVALIDITE',
  CAPITAL_INVALIDITE: 'CAPITAL_INVALIDITE',
  FRAIS_FUTURS: 'FRAIS_FUTURS',
  SOINS_POST_CONSOLIDATION: 'SOINS_POST_CONSOLIDATION',
  MAINTIEN_SALAIRE: 'MAINTIEN_SALAIRE',
  DECOMPTE_MUTUELLE: 'DECOMPTE_MUTUELLE',
  AUTRE: 'AUTRE',
};

// ── Nature → Poste cible mapping (spec §4) ────────────────────
export const NATURE_TO_POSTE = {
  [NATURE_CREANCE.FRAIS_HOSPITALIERS]: 'dsa',
  [NATURE_CREANCE.FRAIS_MEDICAUX]: 'dsa',
  [NATURE_CREANCE.FRAIS_PHARMACEUTIQUES]: 'dsa',
  [NATURE_CREANCE.FRAIS_APPAREILLAGE]: 'dsa',
  [NATURE_CREANCE.FRAIS_TRANSPORT]: 'fda',
  [NATURE_CREANCE.FRANCHISES]: 'dsa',
  [NATURE_CREANCE.IJ]: 'pgpa',
  [NATURE_CREANCE.ARRERAGES_INVALIDITE]: 'pgpf-echu',
  [NATURE_CREANCE.CAPITAL_INVALIDITE]: 'pgpf-aechoir',
  [NATURE_CREANCE.FRAIS_FUTURS]: 'dsf',
  [NATURE_CREANCE.SOINS_POST_CONSOLIDATION]: 'dsf',
  [NATURE_CREANCE.MAINTIEN_SALAIRE]: 'pgpa',
  [NATURE_CREANCE.DECOMPTE_MUTUELLE]: 'dsa',
};

// ── Nature display labels ─────────────────────────────────────
const NATURE_LABELS = {
  [NATURE_CREANCE.FRAIS_HOSPITALIERS]: 'Frais hospitaliers',
  [NATURE_CREANCE.FRAIS_MEDICAUX]: 'Frais médicaux',
  [NATURE_CREANCE.FRAIS_PHARMACEUTIQUES]: 'Frais pharmaceutiques',
  [NATURE_CREANCE.FRAIS_APPAREILLAGE]: 'Frais d\'appareillage',
  [NATURE_CREANCE.FRAIS_TRANSPORT]: 'Frais de transport',
  [NATURE_CREANCE.FRANCHISES]: 'Franchises',
  [NATURE_CREANCE.IJ]: 'Indemnités journalières',
  [NATURE_CREANCE.ARRERAGES_INVALIDITE]: 'Arrérages échus',
  [NATURE_CREANCE.CAPITAL_INVALIDITE]: 'Capital invalidité',
  [NATURE_CREANCE.FRAIS_FUTURS]: 'Frais futurs',
  [NATURE_CREANCE.SOINS_POST_CONSOLIDATION]: 'Soins post-consolidation',
  [NATURE_CREANCE.MAINTIEN_SALAIRE]: 'Maintien de salaire',
  [NATURE_CREANCE.DECOMPTE_MUTUELLE]: 'Décompte mutuelle',
  [NATURE_CREANCE.AUTRE]: 'Autre',
};
export { NATURE_LABELS };

// ── Shared TP entities ─────────────────────────────────────
const CPAM = { id: 'cpam-idf', nom: 'CPAM Île-de-France', type: 'cpam', sigle: 'CPAM' };
const HARMONIE = { id: 'harmonie', nom: 'Harmonie Mutuelle', type: 'mutuelle', sigle: 'Harmonie' };
const SNCF = { id: 'sncf', nom: 'Employeur SNCF', type: 'employeur', sigle: 'SNCF' };
const CPAM_ATMP = { id: 'cpam-atmp', nom: 'CPAM (AT/MP)', type: 'cpam', sigle: 'CPAM' };

// ============================================================
// SCENARIOS
// ============================================================

const TP_SCENARIOS = {

  // ── Baseline: no TP, rate 100% ───────────────────────
  baseline: {
    key: 'baseline',
    label: 'Sans tiers payeurs',
    description: 'Accident simple, responsabilité 100 %, aucun tiers payeur.',
    tauxResponsabilite: 100,
    tiersPayeurs: [],
    creancesTP: [],
    droitDePreference: {},
    cascade: null,
    agentMessage: 'Dossier réinitialisé sans tiers payeurs.',
  },

  // ── TP Simple: multi-TP récap, 100% (30% variant for droit de préf.) ──
  // CPAM récap (11 natures across DSA, FDA, PGPA, PGPF, DSF)
  // + Harmonie décompte (DSA) + SNCF maintien (PGPA)
  //
  // Préjudices bruts: DSA 200k, PGPA 60k, FDA 45k, DSF 600k,
  //   PGPF échu ~50k, PGPF à échoir ~250k, SE 30k, DFP 80k, PEP 4500
  simple: {
    key: 'simple',
    label: 'TP simple - récapitulatif multi-postes',
    description: 'Accident de la route, 3 TP (CPAM + Harmonie + SNCF). Créance récapitulative sur 5 postes.',
    tauxResponsabilite: 100,

    tiersPayeurs: [CPAM, HARMONIE, SNCF],

    creancesTP: [
      // ── CPAM créance récapitulative ──
      {
        id: 'cr-cpam',
        tiersPayeurId: 'cpam-idf',
        piece: 'Créance récapitulative CPAM du 22/09/2023',
        dateNotification: '22/09/2023',
        regle: 'SIMPLE',
        lignes: [
          // DSA
          {
            id: 'cr-cpam-hosp', nature: NATURE_CREANCE.FRAIS_HOSPITALIERS,
            libelle: 'Frais hospitaliers',
            montant: 70000, posteCible: 'dsa',
            isAggregate: true,
            subLignes: [
              { id: 'cr-cpam-hosp-1', libelle: 'CHU Bordeaux - séjour mars 2023', montant: 28000 },
              { id: 'cr-cpam-hosp-2', libelle: 'CHU Bordeaux - chirurgie avril 2023', montant: 18000 },
              { id: 'cr-cpam-hosp-3', libelle: 'Clinique du Parc - rééducation', montant: 12000 },
              { id: 'cr-cpam-hosp-4', libelle: 'CHU Bordeaux - contrôle sept 2023', montant: 5000 },
              { id: 'cr-cpam-hosp-5', libelle: 'Clinique Saint-Jean - bilan', montant: 4000 },
              { id: 'cr-cpam-hosp-6', libelle: 'CHU Bordeaux - suivi janv 2024', montant: 3000 },
            ],
          },
          {
            id: 'cr-cpam-med', nature: NATURE_CREANCE.FRAIS_MEDICAUX,
            libelle: 'Frais médicaux',
            montant: 30000, posteCible: 'dsa',
            periode: { debut: '15/03/2023', fin: '12/09/2024' },
          },
          {
            id: 'cr-cpam-pharma', nature: NATURE_CREANCE.FRAIS_PHARMACEUTIQUES,
            libelle: 'Frais pharmaceutiques',
            montant: 10000, posteCible: 'dsa',
            periode: { debut: '15/03/2023', fin: '12/09/2024' },
          },
          {
            id: 'cr-cpam-appar', nature: NATURE_CREANCE.FRAIS_APPAREILLAGE,
            libelle: 'Frais d\'appareillage',
            montant: 35000, posteCible: 'dsa',
          },
          {
            id: 'cr-cpam-franchise', nature: NATURE_CREANCE.FRANCHISES,
            libelle: 'Franchises',
            montant: -500, posteCible: 'dsa',
          },
          // FDA
          {
            id: 'cr-cpam-transport', nature: NATURE_CREANCE.FRAIS_TRANSPORT,
            libelle: 'Frais de transport',
            montant: 40000, posteCible: 'fda',
            periode: { debut: '15/03/2023', fin: '12/09/2024' },
          },
          // PGPA
          {
            id: 'cr-cpam-ij', nature: NATURE_CREANCE.IJ,
            libelle: 'Indemnités journalières',
            montant: 25000, posteCible: 'pgpa',
            periode: { debut: '15/03/2023', fin: '12/09/2024' },
            detail: { nbJours: 546 },
          },
          // PGPF échu
          {
            id: 'cr-cpam-arrerages', nature: NATURE_CREANCE.ARRERAGES_INVALIDITE,
            libelle: 'Arrérages échus rente invalidité',
            montant: 40000, posteCible: 'pgpf-echu',
            periode: { debut: '12/09/2024', fin: '15/01/2025' },
          },
          // PGPF à échoir
          {
            id: 'cr-cpam-capital', nature: NATURE_CREANCE.CAPITAL_INVALIDITE,
            libelle: 'Capital invalidité',
            montant: 120000, posteCible: 'pgpf-aechoir',
            detail: { cout: 6000, coefficient: 20, baremeId: 'gdp_2025' },
          },
          // DSF
          {
            id: 'cr-cpam-futurs', nature: NATURE_CREANCE.FRAIS_FUTURS,
            libelle: 'Frais futurs prévisionnels',
            montant: 490000, posteCible: 'dsf',
          },
          {
            id: 'cr-cpam-postconso', nature: NATURE_CREANCE.SOINS_POST_CONSOLIDATION,
            libelle: 'Soins post-consolidation',
            montant: 15000, posteCible: 'dsf',
          },
        ],
      },

      // ── Harmonie Mutuelle décompte ──
      {
        id: 'cr-harmonie',
        tiersPayeurId: 'harmonie',
        piece: 'Décompte Harmonie Mutuelle du 05/02/2024',
        dateNotification: '05/02/2024',
        regle: 'SIMPLE',
        lignes: [
          {
            id: 'cr-harm-dsa', nature: NATURE_CREANCE.DECOMPTE_MUTUELLE,
            libelle: 'Décompte DSA',
            montant: 10000, posteCible: 'dsa',
          },
        ],
      },

      // ── Employeur SNCF attestation ──
      {
        id: 'cr-sncf',
        tiersPayeurId: 'sncf',
        piece: 'Attestation maintien salaire SNCF du 18/01/2024',
        dateNotification: '18/01/2024',
        regle: 'SIMPLE',
        lignes: [
          {
            id: 'cr-sncf-maintien', nature: NATURE_CREANCE.MAINTIEN_SALAIRE,
            libelle: 'Maintien de salaire',
            montant: 20000, posteCible: 'pgpa',
            periode: { debut: '15/03/2023', fin: '30/06/2023' },
          },
        ],
      },
    ],

    damageOverrides: {},

    // 30% variant — pre-computed droit de préférence for demo
    // Activate by setting tauxResponsabilite to 30
    droitDePreference: {},

    cascade: null,

    agentMessage: "Créance récapitulative CPAM (855 500 €) sur 5 postes + Harmonie (10 000 € sur DSA) + SNCF maintien (20 000 € sur PGPA). Responsabilité 100 %.",
  },

  // ── Cascade AT/MP — temporal, rate 100% ─────────
  // Rente AT/MP capitalisée en cascade PGPF → IP → DFP.
  // Rente: 15 000 €/an × coeff. 20 = 300 000 à échoir + 45 000 échus = 345 000 total.
  // PGPF: prejudice ~310 000 (échu 50 000 + à échoir 260 000). Rente absorbe tout → victime 0.
  // Remaining: 345 000 - 310 000 = 35 000
  //   → IP: prejudice 15 000, absorbe 15 000 → victime 0. Remaining: 20 000.
  //   → DFP: prejudice 80 000, absorbe 20 000 → victime 60 000. (jurisprudence variable)
  // SNCF maintien: 25 000 on PGPA.
  cascade: {
    key: 'cascade',
    label: 'Cascade AT/MP',
    description: 'Accident du travail, rente AT/MP capitalisée en cascade PGPF → IP → DFP.',
    tauxResponsabilite: 100,

    tiersPayeurs: [CPAM_ATMP, SNCF],

    // Override dossierPostes to include IP
    dossierPostesOverride: ['dsa', 'pgpa', 'dft', 'pgpf', 'ipp', 'se', 'dfp', 'pep'],

    creancesTP: [
      // ── CPAM AT/MP rente cascade ──
      {
        id: 'cr-cpam-atmp',
        tiersPayeurId: 'cpam-atmp',
        piece: 'Notification rente CPAM AT/MP du 05/06/2023',
        dateNotification: '05/06/2023',
        regle: 'CASCADE_CAPITALISEE',
        postesOrdonnes: ['pgpf', 'ipp', 'dfp'],
        lignes: [
          {
            id: 'cr-atmp-arrerages', nature: NATURE_CREANCE.ARRERAGES_INVALIDITE,
            libelle: 'Arrérages échus de la rente AT/MP',
            montant: 45000, posteCible: 'pgpf-echu',
            periode: { debut: '05/06/2023', fin: '15/01/2025' },
          },
          {
            id: 'cr-atmp-capital', nature: NATURE_CREANCE.CAPITAL_INVALIDITE,
            libelle: 'Rente AT/MP capitalisée',
            montant: 300000, posteCible: 'pgpf-aechoir',
            detail: { cout: 15000, coefficient: 20, baremeId: 'gdp_2025' },
          },
        ],
        // Total rente: 345 000
        renteTemporelle: {
          renteAnnuelle: 15000,
          arreragesEchus: 45000,
          coefficient: 20,
          bareme: 'Gazette du Palais 2025',
          arreragesAEchoir: 300000,
          total: 345000,
        },
      },

      // ── Employeur SNCF maintien ──
      {
        id: 'cr-sncf-cascade',
        tiersPayeurId: 'sncf',
        piece: 'Attestation maintien salaire SNCF du 10/01/2024',
        dateNotification: '10/01/2024',
        regle: 'SIMPLE',
        lignes: [
          {
            id: 'cr-sncf-maint-casc', nature: NATURE_CREANCE.MAINTIEN_SALAIRE,
            libelle: 'Maintien de salaire',
            montant: 25000, posteCible: 'pgpa',
            periode: { debut: '15/03/2023', fin: '30/09/2023' },
          },
        ],
      },
    ],

    // Override PGPF temporal amounts for cascade math
    damageOverrides: {
      pgpfEchu: 50000,
      pgpfAEchoir: 260000,
      ipp: 15000,
    },

    droitDePreference: {},

    cascade: {
      creanceTPId: 'cr-cpam-atmp',
      tiersPayeurId: 'cpam-atmp',
      sigle: 'CPAM',
      label: 'Rente AT/MP CPAM',
      renteAnnuelle: 15000,
      coefficient: 20,
      bareme: 'Gazette du Palais 2025',
      capitalise: 345000,
      arreragesEchus: 45000,
      arreragesAEchoir: 300000,
      ordre: ['pgpf', 'ipp', 'dfp'],
      etapes: [
        {
          posteId: 'pgpf', label: 'PGPF', prejudice: 310000,
          absorbe: 310000, absorbeEchu: 45000, absorbeAEchoir: 260000,
          victimeReste: 0,
          statut: 'totalement absorbé',
        },
        {
          posteId: 'ipp', label: 'IP', prejudice: 15000,
          absorbe: 15000, absorbeEchu: 0, absorbeAEchoir: 15000,
          victimeReste: 0,
          statut: 'totalement absorbé',
        },
        {
          posteId: 'dfp', label: 'DFP', prejudice: 80000,
          absorbe: 20000, absorbeEchu: 0, absorbeAEchoir: 20000,
          victimeReste: 60000,
          statut: 'partiellement absorbé',
          jurisprudentiallyVariable: true,
        },
      ],
      totalAbsorbe: 345000,
      nonRecouvre: 0,
    },

    agentMessage: "Rente AT/MP (15 000 €/an). Arrérages échus : 45 000 €. Capitalisé (× 20) : 300 000 €. Total créance : 345 000 €. Cascade : PGPF totalement absorbé (310 000 €), IP totalement absorbé (15 000 €), DFP partiellement absorbé (20 000 € sur 80 000 €, victime 60 000 € - jurisprudence variable). SNCF maintien : 25 000 € sur PGPA.",
  },
};

// ============================================================
// LOAD-TIME PROCESSING
// ============================================================
// Derive _imputationsByPoste: { [posteId]: [{ tiersPayeurId, sigle, creanceId, ligneId, nature, libelle, montant, piece, source }] }
// Also derive _imputations (flat array) for backward compat with renderPosteTPSection / chiffrage.

Object.values(TP_SCENARIOS).forEach((scenario) => {
  const byPoste = {};
  const flatImputations = [];

  (scenario.creancesTP || []).forEach((creance) => {
    const tp = (scenario.tiersPayeurs || []).find(t => t.id === creance.tiersPayeurId);
    const isCascade = creance.regle === 'CASCADE_CAPITALISEE' || creance.regle === 'CASCADE';

    (creance.lignes || []).forEach((ligne) => {
      const posteId = ligne.posteCible;
      if (!byPoste[posteId]) byPoste[posteId] = [];

      byPoste[posteId].push({
        tiersPayeurId: creance.tiersPayeurId,
        sigle: tp?.sigle || '?',
        nom: tp?.nom || '',
        creanceId: creance.id,
        ligneId: ligne.id,
        nature: ligne.nature,
        libelle: ligne.libelle,
        montant: ligne.montant,
        piece: creance.piece,
        isAggregate: ligne.isAggregate || false,
        subLignes: ligne.subLignes || null,
        periode: ligne.periode || null,
        source: isCascade ? 'cascade' : 'créance récapitulative',
      });

      // Flat imputation for renderPosteTPSection / chiffrage compat
      // For cascade lines on pgpf-echu / pgpf-aechoir, map to pgpf
      const flatPosteId = posteId.startsWith('pgpf-') ? 'pgpf' : posteId;
      flatImputations.push({
        id: `imp-${scenario.key}-${ligne.id}`,
        ligneTPId: ligne.id,
        tiersPayeurId: creance.tiersPayeurId,
        posteId: flatPosteId,
        montantImpute: ligne.montant,
        montantImputeEchu: posteId === 'pgpf-echu' ? ligne.montant : null,
        montantImputeAEchoir: posteId === 'pgpf-aechoir' ? ligne.montant : null,
        source: isCascade ? 'cascade' : 'créance récapitulative',
      });
    });
  });

  scenario._imputationsByPoste = byPoste;
  scenario._imputations = flatImputations;

  // Derive total per TP across all postes
  scenario._totalByTP = {};
  (scenario.creancesTP || []).forEach((creance) => {
    const total = (creance.lignes || []).reduce((s, l) => s + l.montant, 0);
    scenario._totalByTP[creance.tiersPayeurId] = (scenario._totalByTP[creance.tiersPayeurId] || 0) + total;
  });
});

// ============================================================
// EXPORTS
// ============================================================

export const TP_COMMAND_LIST = [
  { command: 'tp-reset', label: 'TP · Reset', description: 'Revenir au scénario sans tiers payeurs' },
  { command: 'tp-simple', label: 'TP · Simple', description: 'Récap multi-postes : CPAM + Harmonie + SNCF' },
  { command: 'tp-cascade', label: 'TP · Cascade AT/MP', description: 'Rente capitalisée, cascade PGPF → IP → DFP' },
  { command: 'tp-help', label: 'TP · Aide', description: 'Afficher les commandes tiers payeurs' },
];

export const TP_COMMAND_MAP = {
  'tp-reset': 'baseline',
  'tp-simple': 'simple',
  'tp-cascade': 'cascade',
};

export const getTPScenario = (key) => TP_SCENARIOS[key] || TP_SCENARIOS.baseline;

export default TP_SCENARIOS;
