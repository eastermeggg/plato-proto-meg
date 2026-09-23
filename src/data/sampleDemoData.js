// ─────────────────────────────────────────────────────────────────────────────
// sampleDemoData — LES jeux d'exemple partagés des démos / sandboxes du DS.
//
// C'est ici qu'un agent trouve les SHAPES canoniques sans rétro-ingénier le
// code : chaque export documente son contrat en JSDoc. Un composant démoable
// consomme CES données (ou les sources canoniques ci-dessous), jamais des
// objets improvisés.
//
// Sources canoniques voisines (données riches, pas des démos) :
//   src/data/mockDecisions.js       décisions JP (getDecisionById, DECISIONS…)
//   src/data/redactionScenarios.js  actes + bordereaux mock (MOCK_*_TEXT…)
//   src/data/cotisationsSocial.js   social (valeurs, badges COT_BADGE_TOKENS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Postes de préjudice (sélecteurs, scopes JP, Niveau3Strip).
 * Shape : { id: string, acronym: string, label: string }
 * `id` = clé technique minuscule ; `acronym` = badge affiché ; `label` = libellé long.
 */
export const samplePosteOptions = [
  { id: 'atpt', acronym: 'ATPT', label: 'Assistance tierce personne temporaire' },
  { id: 'dft', acronym: 'DFT', label: 'Déficit fonctionnel temporaire' },
  { id: 'pgpf', acronym: 'PGPF', label: 'Pertes de gains professionnels futurs' },
  { id: 'dfp', acronym: 'DFP', label: 'Déficit fonctionnel permanent' },
];

/**
 * JP épinglées d'un dossier (JPSearch, JPListingPosteDetail).
 * Shape : { decisionId: string (id de mockDecisions), posteIds: string[] }
 */
export const samplePinnedJP = [
  { decisionId: 'jp-atpt-01', posteIds: ['atpt'] },
  { decisionId: 'jp-atpt-03', posteIds: ['atpt'] },
  { decisionId: 'jp-atpt-06', posteIds: ['atpt'] },
  { decisionId: 'jp-atpt-02', posteIds: ['atpt'] },
  { decisionId: 'jp-atpt-04', posteIds: ['atpt'] },
];

/**
 * Actes rédigés d'un dossier (ActesList).
 * Shape : { id, kind: 'text'|'bordereau', title, status: 'brouillon'|'pret'|'envoye',
 *           lastUpdated: 'JJ/MM/AAAA', pairId: string|null }
 * `pairId` apparie un acte texte et son bordereau (la liste replie le bordereau
 * apparié ; le couple se navigue par les onglets Acte/Bordereau du canvas).
 */
export const sampleActes = [
  { id: 'acte-1', kind: 'text', title: 'Assignation en référé-expertise', status: 'brouillon', lastUpdated: '27/04/2026', pairId: 'pair-1' },
  { id: 'acte-2', kind: 'bordereau', title: 'Bordereau de communication de pièces', status: 'pret', lastUpdated: '27/04/2026', pairId: 'pair-1' },
  { id: 'acte-3', kind: 'text', title: 'Conclusions récapitulatives', status: 'pret', lastUpdated: '22/04/2026', pairId: null },
  { id: 'acte-4', kind: 'text', title: 'Dire adressé à l’expert', status: 'envoye', lastUpdated: '18/04/2026', pairId: null },
];

/**
 * Étapes d'outils du backend (ReasoningStepper, ParallelTasks).
 * Shape : { type: 'read_documents'|'read_rapport'|'add_row'|'update_row'|'delete_row'|
 *                 'sub_agent'|…,
 *           label: string, status: 'done'|'loading'|'error',
 *           poste?: string (acronyme - groupe les rangées),
 *           children?: string[] (sous-lignes dépliables) }
 */
export const sampleReasoningSteps = [
  { type: 'read_documents', label: 'Analyse de 8 documents', status: 'done', children: ['rapport.pdf', 'facture_1.pdf', 'facture_2.pdf', 'bulletin_01.pdf'] },
  { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
  { type: 'add_row', label: '3 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire', 'Kinésithérapie'] },
  { type: 'add_row', label: 'Poste ATPT identifié', status: 'done', poste: 'ATPT' },
  { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
];

/**
 * Décision JP minimale (JPRow, JPPopoverCard, cartes de démo) - pour une
 * décision COMPLÈTE (textSections, prejudices…), passer par mockDecisions.js.
 * Shape (sous-ensemble du contrat mockDecisions) :
 *   { id, numero, jurisdiction, chambre, date: 'AAAA-MM-JJ', category,
 *     victimProfile, status, resume, amounts: [{ poste, displayValue }] }
 */
export const sampleDecision = {
  id: 'demo-decision-1',
  numero: '22/01234',
  jurisdiction: 'CA Paris',
  chambre: '2e ch. civile',
  date: '2024-09-12',
  category: 'Accident de la circulation',
  victimProfile: 'Homme, 31 ans',
  status: 'Survivant',
  resume: "La cour retient une valorisation du point de DFP à 2 350 € pour une victime jeune avec un déficit de 15%.",
  amounts: [{ poste: 'PGPF', displayValue: '12 450 €' }],
};
