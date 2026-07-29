// Bordereau seed - MARTINIE-style example mapping the legacy 14 pieces
// (p-1 … p-14) into a hierarchical category tree, plus a few extra pieces
// to showcase the Hors bordereau section and the rare "Sans catégorie"
// case.
//
// IDs p-1 to p-14 are intentionally preserved: chiffrage data (FDP, FO,
// PRP, IV postes) references them via `pieceIds: ['p-1', 'p-7', …]` and
// renaming would break those references.
//
// Gaps at III & IV: root categories have orders [0, 1, 4] - « Frais médicaux »
// is now nested under Médical, not a root. The numbering helper derives romans
// from `order + 1`, so the displayed top-level sequence is I, II, V.

export const BORDEREAU_CATEGORIES = [
  // I. Procédure - empty, shows the design for an empty category
  { id: 'cat-procedure', name: 'Procédure', parentId: null, order: 0 },

  // II. Médical
  { id: 'cat-medical', name: 'Médical', parentId: null, order: 1 },
  { id: 'cat-expertises', name: 'Expertises', parentId: 'cat-medical', order: 0 },
  { id: 'cat-soins', name: 'Comptes-rendus & soins', parentId: 'cat-medical', order: 1 },
  // Frais médicaux - folder nested INSIDE Médical (holds the split factures).
  { id: 'cat-frais-med', name: 'Frais médicaux', parentId: 'cat-medical', order: 2 },

  // ── (root orders 2 & 3 deliberately absent → III and IV are skipped)

  // V. Pertes de revenus
  { id: 'cat-revenus', name: 'Pertes de revenus', parentId: null, order: 4 },
  { id: 'cat-bulletins', name: 'Bulletins de salaire', parentId: 'cat-revenus', order: 0 },
  { id: 'cat-indemnites', name: 'Indemnités & attestations', parentId: 'cat-revenus', order: 1 },

  // VI. Correspondance - home of the imported échanges (email bodies) ONLY.
  // Documents (including PJ, even Correspondance-typed ones) classify by
  // their own type into the folders above, never here.
  { id: 'cat-correspondance', name: 'Correspondance', parentId: null, order: 5 },
];

export const BORDEREAU_PIECES = [
  // ── II-A. Expertises
  { id: 'p-5', nom: 'Rapport Dr. Martin.pdf', nomOriginal: 'rapport_expertise_martin.pdf', intitule: "Rapport d'expertise", date: '12/09/2024', type: 'Rapport', used: true,
    description: "Rapport d'expertise médicale du Dr Martin fixant la consolidation et évaluant les postes de préjudice.",
    categoryId: 'cat-expertises', inclureDansBordereau: true, orderInCategory: 0 },

  // ── II-B. Comptes-rendus & soins
  { id: 'p-8', nom: 'Compte-rendu urgences.pdf', nomOriginal: 'cr_urgences_150323.pdf', intitule: 'Compte-rendu passage urgences', date: '15/03/2023', type: 'Compte-rendu', used: true,
    description: "Compte-rendu du passage aux urgences le jour de l'accident, constatant les lésions initiales.",
    categoryId: 'cat-soins', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-6', nom: 'Ordonnance médicaments.pdf', nomOriginal: 'ordonnance_jul2023.pdf', intitule: 'Ordonnance médicaments juillet', date: '18/07/2023', type: 'Ordonnance', used: true,
    description: "Ordonnance de juillet 2023 prescrivant antalgiques et anti-inflammatoires.",
    categoryId: 'cat-soins', inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'p-10', nom: 'Avis arrêt travail.pdf', nomOriginal: 'arret_travail_mars2023.pdf', intitule: "Avis d'arrêt de travail initial", date: '16/03/2023', type: 'Attestation', used: true,
    description: "Avis initial d'arrêt de travail établi à la suite de l'accident.",
    categoryId: 'cat-soins', inclureDansBordereau: true, orderInCategory: 2 },

  // ── III. Frais médicaux (direct pieces, no subcategories)
  { id: 'p-1', nom: 'Facture CHU Bordeaux.pdf', nomOriginal: 'facture_chu_2023_03.pdf', intitule: 'Facture hospitalisation CHU Bordeaux', date: '15/03/2023', type: 'Facture', used: true,
    description: "Facture d'hospitalisation au CHU de Bordeaux pour la prise en charge initiale.",
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-2', nom: 'Factures kiné (lot).pdf', nomOriginal: 'frais_medicaux_scan.pdf', intitule: 'Factures kinésithérapie Cabinet Martin', date: '01/04/2023', type: 'Facture', used: true,
    description: "Lot de factures des séances de kinésithérapie au Cabinet Martin, découpé d'un scan de frais médicaux.",
    splitIndex: 0, pageRange: '1–4',
    siblings: [{ name: 'Factures kinésithérapie Cabinet Martin', pages: 4 }, { name: 'Facture pharmacie des Lilas', pages: 2 }],
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'p-12', nom: 'Facture IRM.pdf', nomOriginal: 'facture_irm_juin2023.pdf', intitule: 'Facture IRM Centre Imagerie Sud', date: '25/06/2023', type: 'Facture', used: true,
    description: "Facture de l'IRM réalisée au Centre d'Imagerie Sud.",
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 2 },
  { id: 'p-7', nom: 'Facture pharmacie.pdf', nomOriginal: 'pharmacie_2023.pdf', intitule: 'Facture pharmacie des Lilas', date: '20/07/2023', type: 'Facture', used: true,
    description: "Factures de la pharmacie des Lilas pour les traitements prescrits.",
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 3 },
  { id: 'p-14', nom: 'Facture consultation Dr. Petit.pdf', nomOriginal: 'consult_dr_petit.pdf', intitule: 'Consultation orthopédique Dr. Petit', date: '15/08/2023', type: 'Facture', used: true,
    description: "Facture de consultation orthopédique auprès du Dr Petit.",
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 4 },

  // ── V-A. Bulletins de salaire
  { id: 'p-3', nom: 'Bulletins salaire 2022.pdf', nomOriginal: 'bulletins_2022.pdf', intitule: 'Bulletins de salaire année 2022', date: '10/01/2023', type: 'Bulletin', used: true,
    description: "Bulletins de salaire de l'année 2022, base de calcul des pertes de revenus.",
    categoryId: 'cat-bulletins', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-9', nom: 'Bulletins salaire 2021.pdf', nomOriginal: 'bulletins_2021.pdf', intitule: 'Bulletins de salaire année 2021', date: '10/01/2022', type: 'Bulletin', used: true,
    description: "Bulletins de salaire de l'année 2021, période de référence avant l'accident.",
    categoryId: 'cat-bulletins', inclureDansBordereau: true, orderInCategory: 1 },

  // ── V-B. Indemnités & attestations
  { id: 'p-4', nom: 'Attestation CPAM.pdf', nomOriginal: 'cpam_attestation.pdf', intitule: 'Attestation de versement IJ CPAM', date: '20/05/2023', type: 'Attestation', used: true,
    description: "Attestation CPAM de versement des indemnités journalières.",
    categoryId: 'cat-indemnites', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-11', nom: 'Attestation employeur.pdf', nomOriginal: 'attestation_employeur.pdf', intitule: 'Attestation de salaire employeur', date: '20/03/2023', type: 'Attestation', used: true,
    description: "Attestation de salaire de l'employeur sur la période d'arrêt.",
    categoryId: 'cat-indemnites', inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'p-13', nom: 'Décompte AG2R.pdf', nomOriginal: 'decompte_ag2r.pdf', intitule: 'Décompte indemnités prévoyance AG2R', date: '15/08/2023', type: 'Décompte', used: true,
    description: "Décompte des indemnités de prévoyance versées par AG2R.",
    categoryId: 'cat-indemnites', inclureDansBordereau: true, orderInCategory: 2 },

  // ── Sans catégorie (not yet classified - newly arrived, rare in practice)
  { id: 'p-sc1', nom: 'Constat huissier voirie.pdf', nomOriginal: 'constat_huissier_2024.pdf', intitule: "Constat d'huissier - état de la chaussée", date: '18/03/2024', type: 'Constat', used: false,
    description: "Constat d'huissier sur l'état de la chaussée au lieu de l'accident.",
    categoryId: null, inclureDansBordereau: true, orderInCategory: 0 },

  // ── Extra dossier pieces NOT cited in the demo bordereau - so the "Ajouter
  // une pièce" modal shows a real mix of already-added (locked) and addable.

  // I. Procédure (was empty - now has pieces)
  { id: 'p-15', nom: 'PV gendarmerie.pdf', nomOriginal: 'pv_gendarmerie_140924.pdf', intitule: 'Procès-verbal de gendarmerie', date: '14/09/2024', type: 'PV', used: false,
    categoryId: 'cat-procedure', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-16', nom: 'Ordonnance référé.pdf', nomOriginal: 'ordonnance_refere_2024.pdf', intitule: 'Ordonnance de référé-expertise', date: '03/10/2024', type: 'Décision', used: false,
    categoryId: 'cat-procedure', inclureDansBordereau: true, orderInCategory: 1 },

  // II-A. Expertises
  { id: 'p-17', nom: 'Rapport sapiteur psy.pdf', nomOriginal: 'sapiteur_psychiatre.pdf', intitule: 'Rapport du sapiteur psychiatre', date: '20/11/2024', type: 'Rapport', used: false,
    categoryId: 'cat-expertises', inclureDansBordereau: true, orderInCategory: 1 },

  // II-B. Comptes-rendus & soins
  { id: 'p-18', nom: 'Certificat médical initial.pdf', nomOriginal: 'cmi_150323.pdf', intitule: 'Certificat médical initial', date: '15/03/2023', type: 'Compte-rendu', used: false,
    categoryId: 'cat-soins', inclureDansBordereau: true, orderInCategory: 3 },
  { id: 'p-19', nom: 'Bilan kiné.pdf', nomOriginal: 'bilan_kine_oct2023.pdf', intitule: 'Bilan kinésithérapique', date: '10/10/2023', type: 'Compte-rendu', used: false,
    categoryId: 'cat-soins', inclureDansBordereau: true, orderInCategory: 4 },

  // III. Frais médicaux
  { id: 'p-20', nom: 'Facture transport VSL.pdf', nomOriginal: 'vsl_2023.pdf', intitule: 'Factures transport VSL', date: '05/05/2023', type: 'Facture', used: false,
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 5 },
  { id: 'p-21', nom: 'Facture orthèse.pdf', nomOriginal: 'orthese_genou.pdf', intitule: 'Facture orthèse de genou', date: '28/09/2023', type: 'Facture', used: false,
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 6 },

  // V-A. Bulletins de salaire
  { id: 'p-22', nom: 'Bulletins salaire 2023.pdf', nomOriginal: 'bulletins_2023.pdf', intitule: 'Bulletins de salaire année 2023', date: '10/01/2024', type: 'Bulletin', used: false,
    categoryId: 'cat-bulletins', inclureDansBordereau: true, orderInCategory: 2 },

  // V-B. Indemnités & attestations
  { id: 'p-23', nom: 'Notification rente AT.pdf', nomOriginal: 'rente_atmp_cpam.pdf', intitule: 'Notification de rente AT/MP', date: '12/02/2024', type: 'Décompte', used: false,
    categoryId: 'cat-indemnites', inclureDansBordereau: true, orderInCategory: 3 },

  // Sans catégorie (more)
  { id: 'p-sc2', nom: 'Photos des lieux.pdf', nomOriginal: 'photos_carrefour.pdf', intitule: "Photographies du lieu de l'accident", date: '14/09/2024', type: 'Photo', used: false,
    categoryId: null, inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'p-sc3', nom: 'Échanges assureur.pdf', nomOriginal: 'mails_axa.pdf', intitule: "Échanges de courriels avec l'assureur", date: '02/12/2024', type: 'Correspondance', used: false,
    categoryId: null, inclureDansBordereau: true, orderInCategory: 2 },
];

// ────────────────────────────────────────────────────────────────────────
// DROIT SOCIAL (prud'hommes) — folders + pièces adapted to the matter type.
// Used when the dossier's matterType === 'social'.

export const BORDEREAU_CATEGORIES_SOCIAL = [
  { id: 'soc-contrat', name: 'Contrat & rémunération', parentId: null, order: 0 },
  { id: 'soc-temps', name: 'Temps de travail', parentId: null, order: 1 },
  { id: 'soc-rupture', name: 'Rupture', parentId: null, order: 2 },
  { id: 'soc-proc', name: 'Procédure', parentId: null, order: 3 },
  // V. Correspondance - imported échanges (email bodies) land here.
  { id: 'soc-correspondance', name: 'Correspondance', parentId: null, order: 4 },
];

export const BORDEREAU_PIECES_SOCIAL = [
  // I. Contrat & rémunération
  { id: 'sp-1', nom: 'Contrat de travail.pdf', nomOriginal: 'contrat_cdi_aubert.pdf', intitule: 'Contrat de travail (CDI)', date: '02/05/2020', type: 'Contrat', used: true,
    description: 'Contrat à durée indéterminée, poste de cariste.', categoryId: 'soc-contrat', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'sp-2', nom: 'Avenant n°1.pdf', nomOriginal: 'avenant_1.pdf', intitule: 'Avenant n°1 au contrat', date: '01/09/2021', type: 'Contrat', used: true,
    description: 'Passage en horaires postés (équipes 2×8).', categoryId: 'soc-contrat', inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'sp-3', nom: 'Bulletins de salaire 2022-2023.pdf', nomOriginal: 'bulletins_paie.pdf', intitule: 'Bulletins de salaire (12 mois)', date: '30/06/2023', type: 'Bulletin', used: true,
    description: 'Bulletins de paie des 12 derniers mois, base du salaire de référence.', categoryId: 'soc-contrat', inclureDansBordereau: true, orderInCategory: 2 },
  // II. Temps de travail
  { id: 'sp-4', nom: "Relevé d'heures.pdf", nomOriginal: 'releve_heures.pdf', intitule: "Relevé d'heures", date: '30/06/2023', type: 'Relevé', used: true,
    description: 'Heures travaillées reconstituées sur la période.', categoryId: 'soc-temps', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'sp-5', nom: "Relevés de badge d'accès.pdf", nomOriginal: 'badges_acces.csv', intitule: "Relevés de badge d'accès", date: '12/06/2023', type: 'Preuve', used: true,
    description: "Heures d'entrée et de sortie issues du contrôle d'accès.", categoryId: 'soc-temps', inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'sp-6', nom: 'E-mails professionnels.pdf', nomOriginal: 'emails_pro.pdf', intitule: "E-mails (preuves d'horaires)", date: '03/05/2023', type: 'Preuve', used: true,
    description: 'Courriels matinaux et tardifs attestant des dépassements horaires.', categoryId: 'soc-temps', inclureDansBordereau: true, orderInCategory: 2 },
  // III. Rupture
  { id: 'sp-7', nom: 'Convocation entretien préalable.pdf', nomOriginal: 'convocation_ep.pdf', intitule: 'Convocation à entretien préalable', date: '15/06/2023', type: 'Courrier', used: true,
    description: "Convocation à l'entretien préalable au licenciement.", categoryId: 'soc-rupture', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'sp-8', nom: 'Lettre de licenciement.pdf', nomOriginal: 'lettre_licenciement.pdf', intitule: 'Lettre de licenciement', date: '30/06/2023', type: 'Courrier', used: true,
    description: 'Notification du licenciement et de ses motifs.', categoryId: 'soc-rupture', inclureDansBordereau: true, orderInCategory: 1 },
  // IV. Procédure
  { id: 'sp-9', nom: "Requête au conseil de prud'hommes.pdf", nomOriginal: 'requete_cph.pdf', intitule: 'Requête au CPH', date: '12/09/2023', type: 'Procédure', used: true,
    description: 'Saisine du conseil de prud’hommes de Nanterre.', categoryId: 'soc-proc', inclureDansBordereau: true, orderInCategory: 0 },
];
