// ─── Demo Scenarios — JP Integration ──────────────────────────────────
// Each scenario is an ordered array of DemoAction payloads.
// The reducer in useDemoCommands dispatches them sequentially with delays.

export const DEMO_SCENARIOS = {
  'jp-cards': {
    label: 'JP - cards listées',
    description: 'Agent renvoie une liste de JP sous forme de cards (JPCard stack)',
    actions: [
      { type: 'USER_MESSAGE', text: 'Liste-moi les jurisprudences récentes sur l\'ATPT, je veux comparer les taux.' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Recherche JP', detail: 'Récupération de 5 décisions sur l\'ATPT, triées par pertinence…' },
      { type: 'DELAY', ms: 1100 },
      { type: 'AGENT_CARDS_MESSAGE', text: "Sur le taux horaire d'ATPT, la jurisprudence récente s'échelonne de **24 à 28 €/h** selon le profil de la victime et la nature de l'aide.\n\n**1.** CA Rennes, 5e ch., 10 janvier 2024, n° {{jp:jp-atpt-01:ref}} - Étudiante de 22 ans, aide non-spécialisée\n\nLa cour a retenu un taux horaire de **28 €/h** pour l'assistance tierce personne temporaire d'une étudiante de 22 ans victime d'un accident de la circulation, en motivant son choix par la jeunesse de la victime et le caractère non-spécialisé de l'aide quotidienne nécessaire à son autonomie universitaire.\n\n→ **Apport clé** : plafond actuel pour ce profil, sans technicité médicale particulière.\n\n**2.** CA Paris, 4e ch., 22 mars 2024, n° {{jp:jp-atpt-03:ref}} - Victime plus âgée, aide partiellement spécialisée\n\nLa cour a fixé le taux à **27 €/h** pour un homme de 68 ans, en motivant son choix par le caractère partiellement spécialisé de l'aide (suivi médical, kinésithérapie quotidienne) ainsi que par l'âge de la victime.\n\n→ **Apport clé** : marge d'**1 €/h** au-dessus de la moyenne lorsqu'une dimension technique est requise.\n\n**3.** CA Versailles, 3e ch., 5 septembre 2023, n° {{jp:jp-atpt-02:ref}} - Profil intermédiaire\n\nLa cour a retenu **26 €/h**, en ligne avec la moyenne nationale pour un profil masculin actif avec aide quotidienne standard.\n\n**4.** CA Douai, 3e ch., 8 février 2024, n° {{jp:jp-atpt-06:ref}} - Référence basse en région\n\nLa cour a retenu **25 €/h** pour un profil comparable en province, illustrant la légère dégradation du taux hors Île-de-France.\n\n**5.** CA Lyon, 1re ch. civ., 14 novembre 2023, n° {{jp:jp-atpt-04:ref}} - Plancher actuel\n\nLa cour a fixé **24 €/h** sur le profil d'une femme active de 35 ans en province - plancher de la fourchette actuelle.\n\n→ **Synthèse** : un taux entre **25 et 28 €/h** paraît défendable selon la qualification retenue par l'expertise.", decisionIds: ['jp-atpt-01', 'jp-atpt-03', 'jp-atpt-02', 'jp-atpt-06', 'jp-atpt-04'], highlightPosteIds: ['atpt'] },
    ],
  },

  'search-atpt-paris': {
    label: 'Recherche ATPT Paris',
    description: 'Agent recherche des JP sur le taux horaire ATPT en région parisienne',
    actions: [
      { type: 'USER_MESSAGE', text: 'Recherche des jurisprudences sur le taux horaire ATPT pour une étudiante à Paris' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Recherche JP', detail: 'Interrogation de la base Plato JP pour les décisions relatives au taux horaire d\'ATPT en Île-de-France…' },
      { type: 'DELAY', ms: 1200 },
      { type: 'AGENT_CARDS_MESSAGE', text: "Pour une étudiante en Île-de-France, la jurisprudence parisienne récente sur le taux horaire d'ATPT converge entre **25 et 28 €/h**.\n\n**1.** CA Rennes, 5e ch., 10 janvier 2024, n° {{jp:jp-atpt-01:ref}} - Profil quasi-identique à votre dossier\n\nÉtudiante de 22 ans victime d'un accident de la circulation, la cour a retenu un taux de **28 €/h** en motivant son choix par la jeunesse de la victime et le caractère non-spécialisé de l'aide quotidienne.\n\n→ **Apport clé** : référence principale à citer - profil et contexte alignés avec votre cliente.\n\n**2.** CA Paris, 4e ch., 22 mars 2024, n° {{jp:jp-atpt-03:ref}} - Motivation détaillée sur l'aide partiellement spécialisée\n\nLa cour a fixé **27 €/h** pour un homme de 68 ans, en détaillant le raisonnement sur le caractère partiellement spécialisé de l'aide.\n\n→ **Apport clé** : motivation transposable si l'expertise retient une dimension technique.\n\n**3.** CA Versailles, 3e ch., 5 septembre 2023, n° {{jp:jp-atpt-02:ref}} - Profil intermédiaire\n\nLa cour a retenu **26 €/h** pour un profil masculin actif, en ligne avec la moyenne francilienne.\n\n**4.** CA Douai, 3e ch., 8 février 2024, n° {{jp:jp-atpt-06:ref}} - Plancher de la fourchette régionale\n\nLa cour a fixé **25 €/h** sur un profil comparable hors Île-de-France.\n\n→ **Recommandation** : demander **28 €/h** en citant n° {{jp:jp-atpt-01:ref}} comme référence principale, avec n° {{jp:jp-atpt-03:ref}} en appui sur la motivation technique.", decisionIds: ['jp-atpt-01', 'jp-atpt-03', 'jp-atpt-02', 'jp-atpt-06'], highlightPosteIds: ['atpt'] },
    ],
  },

  'search-dfp': {
    label: 'Recherche DFP',
    description: 'Agent recherche des JP sur la valeur du point de DFP',
    actions: [
      { type: 'USER_MESSAGE', text: 'Quelles sont les jurisprudences récentes sur la valeur du point de DFP ?' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Recherche JP', detail: 'Recherche de décisions relatives à la valorisation du point de déficit fonctionnel permanent…' },
      { type: 'DELAY', ms: 1000 },
      { type: 'AGENT_CARDS_MESSAGE', text: "La valeur du point de DFP varie significativement selon l'âge de la victime et le taux retenu, sur une fourchette de **1 850 à 2 350 €/pt**.\n\n**1.** Cass. 2e civ., 6 juillet 2023, n° {{jp:jp-dfp-01:ref}} - Jeune victime, DFP modéré\n\nLa Cour de cassation a fixé le point à **2 350 €/pt** pour une victime de **32 ans** atteinte d'un DFP de **15 %**, en motivant sa décision par la jeunesse de la victime et par l'impact significatif du déficit sur sa qualité de vie sur les décennies restantes.\n\n→ **Apport clé** : référence haute pour un profil jeune - la motivation peut être reprise pour soutenir un point soutenu malgré un DFP modéré.\n\n**2.** CA Montpellier, 5e ch. civ., 25 janvier 2024, n° {{jp:jp-dfp-02:ref}} - Victime plus âgée, DFP élevé\n\nLa cour a retenu **1 850 €/pt** pour un homme de **58 ans** avec un DFP de **25 %**, en application stricte du barème indicatif qui dégrade la valeur du point avec l'âge à la consolidation.\n\n→ **Apport clé** : illustration du plafond barémique à âge avancé, même lorsque le taux retenu est important.\n\n→ **Synthèse** : la valeur à demander dépend prioritairement de l'âge à la consolidation et du taux retenu par l'expertise. Les deux paramètres se combinent dans la motivation à présenter.", decisionIds: ['jp-dfp-01', 'jp-dfp-02'], highlightPosteIds: ['dfp'] },
    ],
  },

  'open-rennes': {
    label: 'Ouvrir CA Rennes',
    description: 'Ouvre le drawer sur la décision CA Rennes 10/01/2024',
    actions: [
      { type: 'OPEN_DRAWER', decisionId: 'jp-atpt-01' },
    ],
  },

  'open-nav': {
    label: 'Drawer avec navigation',
    description: 'Ouvre le drawer avec un result set de 4 décisions pour tester prev/next',
    actions: [
      { type: 'OPEN_DRAWER', decisionId: 'jp-atpt-01', resultSet: ['jp-atpt-01', 'jp-atpt-02', 'jp-atpt-03', 'jp-atpt-06'] },
    ],
  },

  'add-manual': {
    label: 'Ajout manuel',
    description: "Déclenche le stepper d'ajout manuel de JP",
    actions: [
      { type: 'USER_MESSAGE', text: "J'ai trouvé une décision intéressante sur Légifrance, je voudrais l'ajouter au dossier" },
      { type: 'DELAY', ms: 400 },
      { type: 'TRIGGER_STEPPER', stepperType: 'jp-add' },
    ],
  },

  'save': {
    label: 'Sauvegarder JP',
    description: "Déclenche le stepper de sauvegarde depuis le drawer",
    actions: [
      { type: 'TRIGGER_STEPPER', stepperType: 'jp-save' },
    ],
  },

  'view-jp': {
    label: 'Onglet JP',
    description: "Bascule le canvas vers l'onglet Jurisprudence du dossier",
    actions: [
      { type: 'SWITCH_CANVAS_VIEW', view: 'jp-list' },
    ],
  },

  'view-poste-atpt': {
    label: 'Poste ATPT',
    description: 'Ouvre le PosteDetailView pour ATPT',
    actions: [
      { type: 'SWITCH_CANVAS_VIEW', view: 'poste-detail', posteId: 'atpt' },
    ],
  },

  'demo': {
    label: 'Parcours complet',
    description: 'Recherche ATPT → ouverture drawer avec navigation',
    actions: [
      { type: 'USER_MESSAGE', text: 'Recherche des jurisprudences sur le taux horaire ATPT pour une étudiante à Paris' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Recherche JP', detail: 'Interrogation de la base Plato JP pour les décisions relatives au taux horaire d\'ATPT en Île-de-France…' },
      { type: 'DELAY', ms: 1200 },
      { type: 'AGENT_CARDS_MESSAGE', text: "Pour une étudiante en Île-de-France, la jurisprudence parisienne récente sur le taux horaire d'ATPT converge entre **25 et 28 €/h**.\n\n**1.** CA Rennes, 5e ch., 10 janvier 2024, n° {{jp:jp-atpt-01:ref}} - Profil quasi-identique à votre dossier\n\nÉtudiante de 22 ans victime d'un accident de la circulation, la cour a retenu un taux de **28 €/h** en motivant son choix par la jeunesse de la victime et le caractère non-spécialisé de l'aide quotidienne.\n\n→ **Apport clé** : référence principale à citer - profil et contexte alignés avec votre cliente.\n\n**2.** CA Paris, 4e ch., 22 mars 2024, n° {{jp:jp-atpt-03:ref}} - Motivation détaillée sur l'aide partiellement spécialisée\n\nLa cour a fixé **27 €/h** pour un homme de 68 ans, en détaillant le raisonnement sur le caractère partiellement spécialisé de l'aide.\n\n→ **Apport clé** : motivation transposable si l'expertise retient une dimension technique.\n\n**3.** CA Versailles, 3e ch., 5 septembre 2023, n° {{jp:jp-atpt-02:ref}} - Profil intermédiaire\n\nLa cour a retenu **26 €/h** pour un profil masculin actif, en ligne avec la moyenne francilienne.\n\n**4.** CA Douai, 3e ch., 8 février 2024, n° {{jp:jp-atpt-06:ref}} - Plancher de la fourchette régionale\n\nLa cour a fixé **25 €/h** sur un profil comparable hors Île-de-France.\n\n→ **Recommandation** : demander **28 €/h** en citant n° {{jp:jp-atpt-01:ref}} comme référence principale, avec n° {{jp:jp-atpt-03:ref}} en appui sur la motivation technique.", decisionIds: ['jp-atpt-01', 'jp-atpt-03', 'jp-atpt-02', 'jp-atpt-06'], highlightPosteIds: ['atpt'] },
      { type: 'DELAY', ms: 800 },
      { type: 'OPEN_DRAWER', decisionId: 'jp-atpt-01', resultSet: ['jp-atpt-01', 'jp-atpt-02', 'jp-atpt-03', 'jp-atpt-06'], highlightPosteIds: ['atpt'] },
    ],
  },

  // Canvas-anchored prompt suggestions (see .context/attachments/prompt-suggestions-v1.md)
  'canvas-dossier-info': {
    label: 'Compléter le dossier',
    description: 'Chato lit les pièces et propose un résumé / pose des questions',
    actions: [
      { type: 'USER_MESSAGE', text: 'Complète les informations du dossier' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Lecture du dossier', detail: 'Analyse des pièces et des informations déjà saisies…' },
      { type: 'DELAY', ms: 1200 },
      { type: 'AGENT_PLAIN_MESSAGE', text: "J'ai parcouru les pièces du dossier. Quelques précisions me seraient utiles :\n\n• La date d'accident retenue est-elle bien le **14/03/2024** (PV de gendarmerie n°2024-031) ?\n• Souhaitez-vous que je rédige un résumé des faits à partir du PV et du rapport d'expertise ?" },
    ],
  },
  'canvas-commencer-chiffrage': {
    label: 'Commencer le chiffrage',
    description: 'Chato propose les postes pertinents à chiffrer',
    actions: [
      { type: 'USER_MESSAGE', text: 'Commençons le chiffrage de ce dossier' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Analyse du dossier', detail: 'Identification des postes de préjudice pertinents au regard des pièces et de l\'expertise…' },
      { type: 'DELAY', ms: 1400 },
      { type: 'AGENT_PLAIN_MESSAGE', text: "Au vu du dossier, je propose de chiffrer les postes suivants en priorité :\n\n• **DSA** - Dépenses de santé actuelles (factures CPAM disponibles)\n• **DFT** - Déficit fonctionnel temporaire (période d'arrêt de 4 mois)\n• **PGPA** - Pertes de gains professionnels actuels\n• **DFP** - Déficit fonctionnel permanent (taux fixé à 12% par l'expert)\n\nPar lequel souhaitez-vous commencer ?" },
    ],
  },
  'canvas-jp-generic': {
    label: 'Rechercher une JP',
    description: 'Chato cherche une JP contextuelle pour le poste courant',
    actions: [
      { type: 'USER_MESSAGE', text: 'Recherche une jurisprudence pour ce poste, en fonction du contexte du dossier' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Recherche JP', detail: 'Interrogation de la base Plato JP en fonction du poste et du profil de la victime…' },
      { type: 'DELAY', ms: 1200 },
      { type: 'AGENT_MESSAGE', text: "Voici 3 décisions qui me paraissent pertinentes au regard du dossier :\n\n{pill:jp-atpt-01} Cour d'appel de Paris, sur un profil similaire (étudiante, région parisienne). {pill:jp-dfp-01} Cassation, qui pose le barème actuel pour le point de DFP. {pill:jp-dft-01} CA Lyon, pour la valorisation du DFT en période d'arrêt prolongé.", pills: ['jp-atpt-01', 'jp-dfp-01', 'jp-dft-01'] },
    ],
  },
};

export const SCENARIO_LIST = Object.entries(DEMO_SCENARIOS).map(([key, s]) => ({
  command: key,
  label: s.label,
  description: s.description,
}));
