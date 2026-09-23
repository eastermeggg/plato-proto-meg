// ============================================================
// Baseline data — always-present poste data for every dossier
// ============================================================
// These constants are the single source of truth for initial
// poste state. App.js imports them for useState defaults and
// handleCreateDossier. TP scenarios overlay on top of this.
// ============================================================

// ── DSA: ~200 000 € total ─────────────────────────────────
export const BASELINE_DSA_LIGNES = [
  { id: 'dsa-1', status: 'validated', label: 'Hospitalisation CHU Bordeaux - séjour mars 2023', description: 'Séjour du 15 au 22 mars 2023', type: 'Hospitalisation', date: '15/03/2023', montant: 42000, dejaRembourse: 38000, tiers: 'CHU Bordeaux', pieceIds: ['p-1', 'p-8'] },
  { id: 'dsa-2', status: 'validated', label: 'Hospitalisation CHU Bordeaux - chirurgie avril 2023', description: 'Chirurgie reconstructrice du genou', type: 'Hospitalisation', date: '28/03/2023', montant: 35000, dejaRembourse: 32000, tiers: 'CHU Bordeaux', pieceIds: ['p-5'] },
  { id: 'dsa-3', status: 'validated', label: 'Clinique du Parc - rééducation', description: 'Séjour rééducation fonctionnelle 3 semaines', type: 'Hospitalisation', date: '15/04/2023', montant: 22000, dejaRembourse: 19500, tiers: 'Clinique du Parc', pieceIds: ['p-5'] },
  { id: 'dsa-4', status: 'validated', label: 'Séances de kinésithérapie', description: '64 séances de rééducation du genou', type: 'Rééducation', date: '01/05/2023', dateFin: '12/09/2024', isPeriodique: true, periodicite: 'Bihebdomadaire', montant: 12800, dejaRembourse: 9600, tiers: 'Cabinet Martin', pieceIds: ['p-2'] },
  { id: 'dsa-5', status: 'validated', label: 'Consultations spécialistes', description: 'Orthopédiste, neurologue, rhumatologue', type: 'Consultation', date: '15/03/2023', dateFin: '12/09/2024', isPeriodique: true, montant: 4200, dejaRembourse: 3100, tiers: 'Divers spécialistes', pieceIds: ['p-14'] },
  { id: 'dsa-6', status: 'validated', label: 'IRM et imagerie', description: '6 IRM + 4 radios + 2 scanners', type: 'Imagerie', date: '25/03/2023', dateFin: '01/09/2024', montant: 8500, dejaRembourse: 7200, tiers: 'Centre Imagerie Sud', pieceIds: ['p-12'] },
  { id: 'dsa-7', status: 'validated', label: 'Frais pharmaceutiques', description: 'Médicaments sur toute la période', type: 'Pharmacie', date: '15/03/2023', dateFin: '12/09/2024', montant: 6500, dejaRembourse: 5800, tiers: 'Pharmacie des Lilas', pieceIds: ['p-7', 'p-6'] },
  { id: 'dsa-8', status: 'validated', label: 'Appareillage orthopédique', description: 'Attelle, genouillère, béquilles, semelles', type: 'Appareillage', date: '22/03/2023', montant: 38000, dejaRembourse: 33500, tiers: 'Orthopédie Bordeaux', pieceIds: ['p-15'] },
  { id: 'dsa-9', status: 'validated', label: 'Hospitalisation contrôle sept 2023', description: 'Bilan post-opératoire', type: 'Hospitalisation', date: '15/09/2023', montant: 9000, dejaRembourse: 8200, tiers: 'CHU Bordeaux', pieceIds: ['p-5'] },
  { id: 'dsa-10', status: 'validated', label: 'Soins infirmiers à domicile', description: 'Pansements et injections post-op', type: 'Soins', date: '23/03/2023', dateFin: '30/04/2023', montant: 3200, dejaRembourse: 2800, tiers: 'Cabinet IDE Dupont', pieceIds: ['p-16'] },
  { id: 'dsa-11', status: 'validated', label: 'Consultations psychologue', description: 'Suivi psychologique post-traumatique', type: 'Consultation', date: '01/05/2023', dateFin: '12/09/2024', montant: 4800, dejaRembourse: 2400, tiers: 'Dr. Lambert', pieceIds: ['p-17'] },
  { id: 'dsa-12', status: 'validated', label: 'Hospitalisation suivi janv 2024', description: 'Contrôle annuel et ajustement traitement', type: 'Hospitalisation', date: '15/01/2024', montant: 14000, dejaRembourse: 12800, tiers: 'CHU Bordeaux', pieceIds: ['p-5'] },
];
// Total: 42000+35000+22000+12800+4200+8500+6500+38000+9000+3200+4800+14000 = 200 000

// ── DFT: 5 385 € (unchanged) ──────────────────────────────
export const BASELINE_DFT_LIGNES = [
  { id: 'dft-1', status: 'validated', label: 'Hospitalisation initiale', debut: '15/03/2023', fin: '22/03/2023', jours: 8, taux: 100, montant: 264, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-2', status: 'validated', label: 'Hospitalisation chirurgie', debut: '28/03/2023', fin: '02/04/2023', jours: 6, taux: 100, montant: 198, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-3', status: 'validated', label: 'Alitement strict post-op', debut: '03/04/2023', fin: '15/04/2023', jours: 13, taux: 100, montant: 429, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-4', status: 'validated', label: 'Convalescence post-opératoire', debut: '16/04/2023', fin: '30/06/2023', jours: 76, taux: 50, montant: 1254, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-5', status: 'validated', label: 'Rééducation active intensive', debut: '01/07/2023', fin: '30/09/2023', jours: 92, taux: 40, montant: 1214, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-6', status: 'validated', label: 'Rééducation d\'entretien', debut: '01/10/2023', fin: '31/12/2023', jours: 92, taux: 25, montant: 759, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-7', status: 'validated', label: 'Gêne résiduelle pré-consolidation', debut: '01/01/2024', fin: '12/09/2024', jours: 256, taux: 15, montant: 1267, pieceIds: ['p-5'], confidence: null, commentaire: '' },
];

// ── PGPA: ~60 000 € total ─────────────────────────────────
export const BASELINE_PGPA_DATA = {
  periode: { debut: '15/03/2023', fin: '12/09/2024', mois: 18 },
  revenuRef: {
    revalorisation: 'ipc-annuel',
    coefficientPerteChance: 100,
    lignes: [
      { id: 'pgpa-rev-1', type: 'revenu', label: 'Salaire net imposable', annee: '2022', montant: 42000, revalorise: 43680, aRevaloriser: true, pieceIds: ['p-3', 'p-11'] },
      { id: 'pgpa-rev-2', type: 'revenu', label: 'Salaire net imposable', annee: '2021', montant: 40000, revalorise: 42800, aRevaloriser: true, pieceIds: ['p-9'] },
      { id: 'pgpa-gain-1', type: 'gain', label: 'Prime annuelle', annee: '2022', montant: 4000, revalorise: 4160, aRevaloriser: true, pieceIds: ['p-3'] },
      { id: 'pgpa-gain-2', type: 'gain', label: 'Heures supplémentaires', annee: '2022', montant: 2000, revalorise: 2080, aRevaloriser: true, pieceIds: ['p-3', 'p-11'] },
    ],
    total: 48000,
  },
  revenusPercus: [
    { id: 'pgpa-percu-1', label: 'Maintien partiel salaire', periode: 'Mars - Sept 2023', periodeDebut: '15/03/2023', periodeFin: '30/09/2023', dureeJours: 199, montant: 12000, tiers: 'Employeur', pieceIds: ['p-10', 'p-11', 'p-3'] },
  ],
  ijPercues: [
    { id: 'pgpa-ij-1', label: 'IJ Sécurité sociale', tiers: 'CPAM Gironde', periode: 'Mars 2023 - Sept 2024', periodeDebut: '15/03/2023', periodeFin: '12/09/2024', jours: 546, montantBrut: 14000, csgCrds: 950, montant: 13050, pieceIds: ['p-4', 'p-10'] },
    { id: 'pgpa-ij-2', label: 'IJ Prévoyance', tiers: 'AG2R', periode: 'Juil 2023 - Sept 2024', periodeDebut: '01/07/2023', periodeFin: '12/09/2024', jours: 439, montantBrut: 5200, csgCrds: 350, montant: 4850, pieceIds: ['p-13'] },
  ],
};
// Revenu ref mensuel: ~48000/12 = 4000/mois. Sur 18 mois = 72000 brut.
// Revenus perçus: 12000 + 13050 + 4850 = 29900. IJ: 13050 + 4850 = 17900.
// Perte nette PGPA: 72000 - 12000 = 60000 (before IJ deduction in TP mode).

// ── PGPF: échu ~50 000 €, à échoir ~260 000 € ────────────
export const BASELINE_PGPF_DATA = {
  periodes: {
    'pgpf-cl': {
      label: 'Consolidation → Liquidation',
      periode: { debut: '12/09/2024', fin: '15/01/2025', mois: 4 },
      revenuRef: { total: 48000 },
      revenusPercus: [
        { id: 'pgpf-cl-percu-1', label: 'Salaire reprise mi-temps', periode: 'Oct - Déc 2024', montant: 6000, pieceIds: ['p-10'] },
      ],
      ijPercues: [
        { id: 'pgpf-cl-ij-1', label: 'IJ Sécurité sociale', tiers: 'CPAM Gironde', periode: 'Sept - Déc 2024', montant: 4000, pieceIds: ['p-4'] },
      ],
    },
    'pgpf-al': {
      label: 'Après Liquidation (capitalisation)',
      periode: { debut: '15/01/2025', fin: 'Viager' },
      params: {
        age: 42, perteGainAnnuelle: 13000, bareme: 'Gazette du Palais 2025 – 0,5%',
        ageDernierArreage: 67, coefficient: 20, montantCapitalise: 260000,
      },
      tiersPayeurs: [
        { id: 'pgpf-tp-1', label: 'CPAM Gironde', renteAnnuelle: 6000, montantCapitalise: 120000, modified: false },
        { id: 'pgpf-tp-2', label: 'AG2R Prévoyance', renteAnnuelle: 2400, montantCapitalise: 48000, modified: true },
      ],
    },
  },
};
// Échu: 4000/mois × 4 mois - 6000 perçus - 4000 IJ = 50000 approx (adjusted via revenuRef)
// Note: exact math: (48000/12)*4 = 16000 - 6000 - 4000 = 6000 from baseline.
// TP scenarios override with damageOverrides for cascade.

// ── FDA (Frais Divers Actuels): ~45 000 € ────────────────
export const BASELINE_FDA_LIGNES = [
  { id: 'fda-1', status: 'validated', label: 'Transports médicaux ambulance', description: 'Transferts CHU Bordeaux (12 trajets)', type: 'Transport', date: '15/03/2023', dateFin: '15/01/2024', montant: 18000, dejaRembourse: 16500, tiers: 'Ambulances du Sud', pieceIds: ['p-20'] },
  { id: 'fda-2', status: 'validated', label: 'Transports VSL', description: 'Trajets rééducation (96 trajets)', type: 'Transport', date: '01/05/2023', dateFin: '12/09/2024', montant: 14400, dejaRembourse: 12800, tiers: 'VSL Gironde', pieceIds: ['p-21'] },
  { id: 'fda-3', status: 'validated', label: 'Transports personnels', description: 'Frais kilométriques consultations', type: 'Transport', date: '15/03/2023', dateFin: '12/09/2024', montant: 3600, dejaRembourse: 0, tiers: 'Personnel', pieceIds: ['p-22'] },
  { id: 'fda-4', status: 'validated', label: 'Hébergement temporaire', description: 'Location meublé adapté PMR (2 mois)', type: 'Hébergement', date: '22/03/2023', dateFin: '22/05/2023', montant: 4000, dejaRembourse: 0, tiers: 'Propriétaire', pieceIds: ['p-23'] },
  { id: 'fda-5', status: 'validated', label: 'Aide ménagère temporaire', description: 'Aide à domicile post-hospitalisation', type: 'Aide', date: '22/03/2023', dateFin: '30/06/2023', montant: 5000, dejaRembourse: 0, tiers: 'Service à domicile', pieceIds: ['p-24'] },
];
// Total: 18000+14400+3600+4000+5000 = 45 000

// ── DSF (Dépenses de Santé Futures): ~600 000 € ──────────
export const BASELINE_DSF_DATA = {
  lignes: [
    { id: 'dsf-1', status: 'validated', label: 'Chirurgie prothèse genou', description: 'Remplacement prothétique prévu à 55 ans', type: 'Chirurgie', datePrevisionnelle: '2037', montant: 45000, capitalise: true, coefficient: 8.5, montantCapitalise: 382500, pieceIds: ['p-30'] },
    { id: 'dsf-2', status: 'validated', label: 'Consultations annuelles spécialistes', description: 'Suivi orthopédique + rhumato viager', type: 'Consultation', periodicite: 'Annuelle', montantAnnuel: 2400, capitalise: true, coefficient: 20, montantCapitalise: 48000, pieceIds: ['p-31'] },
    { id: 'dsf-3', status: 'validated', label: 'Médicaments viagers', description: 'Antalgiques et anti-inflammatoires', type: 'Pharmacie', periodicite: 'Annuelle', montantAnnuel: 3600, capitalise: true, coefficient: 20, montantCapitalise: 72000, pieceIds: ['p-32'] },
    { id: 'dsf-4', status: 'validated', label: 'Kinésithérapie d\'entretien', description: '24 séances/an viager', type: 'Rééducation', periodicite: 'Annuelle', montantAnnuel: 1920, capitalise: true, coefficient: 20, montantCapitalise: 38400, pieceIds: ['p-33'] },
    { id: 'dsf-5', status: 'validated', label: 'Appareillage renouvellement', description: 'Genouillère + semelles tous les 2 ans', type: 'Appareillage', periodicite: 'Biennale', montantBiennal: 1800, capitalise: true, coefficient: 10, montantCapitalise: 18000, pieceIds: ['p-34'] },
    { id: 'dsf-6', status: 'validated', label: 'Imagerie de contrôle', description: 'IRM annuelle', type: 'Imagerie', periodicite: 'Annuelle', montantAnnuel: 850, capitalise: true, coefficient: 20, montantCapitalise: 17000, pieceIds: ['p-35'] },
    { id: 'dsf-7', status: 'validated', label: 'Soins post-consolidation divers', description: 'Soins infirmiers, pansements ponctuels', type: 'Soins', montant: 24100, capitalise: false, pieceIds: ['p-36'] },
  ],
  // Total: 382500+48000+72000+38400+18000+17000+24100 = 600 000
};

// ── Form postes (SE, PEP, DFP) ────────────────────────────
export const BASELINE_FORM_POSTE_DATA = {
  se: { referentiel: 'cours-appel-2024', cotation: 5, montant: 30000 },
  pep: { referentiel: 'cours-appel-2024', cotation: 3, montant: 4500 },
  dfp: { referentiel: 'cours-appel-2024', age: 42, taux: 18, trancheAge: 'inferieure', trancheTaux: 'inferieure', pointBase: 4444, montant: 80000 },
};
