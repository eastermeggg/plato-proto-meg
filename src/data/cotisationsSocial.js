// ─────────────────────────────────────────────────────────────────────────────
// COTISATIONS & IMPÔTS (droit social) - modèle de données (spec v3)
//
// Le calcul est un graphe ; le rendu est une projection du graphe sur des
// surfaces. Les deux sont découplés. Quatre objets, toujours séparés :
//   1. VALEUR  - un montant identifiable, réutilisable en entrée d'une règle
//   2. RÈGLE   - produit une valeur à partir d'autres valeurs ; nom rédigé,
//                état d'application en mots, SES sources (≠ celles du poste)
//   3. SOURCE  - référence citée ; le type précis pilote le préfixe du badge,
//                la famille (donc la couleur) SE DÉDUIT du type
//   4. LIGNE   - objet « rendu » : famille × état × opérateur, indépendant
//                du calcul
//
// Invariants bloquants (spec agent §7) :
//   - la colonne s'additionne : les montants visibles d'une section donnent
//     son résultat, aux opérateurs près
//   - aucune valeur négative ; la direction vit dans l'opérateur ou le
//     libellé de colonne
//   - aucune formule dans un libellé, une note, un nom de règle ou un état
//     d'application - la formule vit dans la prose du panneau, chiffres
//     substitués et arrondi visible
//   - une condition non satisfaite ne produit AUCUNE ligne (jamais de zéro)
//   - un poste nul (0 €) et un poste écarté (qualificatif) sont distincts
//   - l'état « écartée » n'existe que sur un POSTE
//   - une déduction n'est jamais indentée (elle agit après le calcul) ;
//     l'indentation est réservée à ce qui sort d'une base
//   - `manque` obligatoire dès que la valeur est nulle ; `millesime`
//     obligatoire sur un RÉFÉRENTIEL
//   - tout montant cité dans une prose est une référence {montant:cle},
//     jamais un nombre recopié
// ─────────────────────────────────────────────────────────────────────────────

// ── 3. SOURCES ──────────────────────────────────────────────────────────────
// `type` précis : LOI | REGLEMENT | CONVENTION | CONTRAT (famille TEXTE) ·
// JP (DECISION) · BOSS | BOFIP | NOMENCLATURE | REFERENTIEL (REFERENCE) ·
// WEB (WEB) · PIECE (PIECE). La famille n'est jamais stockée : voir
// sourceFamille(). Un badge reflète ce qu'on INVOQUE, pas ce qu'est l'objet
// (un contrat cité pour son existence est une PIECE ; pour ce qu'il prescrit,
// un CONTRAT de famille TEXTE).
export const COTISATIONS_SOURCES = {
  'css-l241-17': { id: 'css-l241-17', type: 'LOI', citation: 'Art. L. 241-17 CSS', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045923062', extrait: 'Réduction des cotisations salariales sur la rémunération des heures supplémentaires.' },
  'css-l241-18': { id: 'css-l241-18', type: 'LOI', citation: 'Art. L. 241-18 CSS', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037948162', extrait: "Déduction forfaitaire des cotisations patronales par heure supplémentaire. Le montant dépend de l'effectif de l'entreprise." },
  'css-l242-1': { id: 'css-l242-1', type: 'LOI', citation: 'Art. L. 242-1 CSS', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042683657', extrait: "Les indemnités de rupture sont exclues de l'assiette dans la limite de 2 fois le plafond annuel de la sécurité sociale. Ce plafond est commun à l'ensemble des indemnités versées." },
  'cgi-81quater': { id: 'cgi-81quater', type: 'LOI', citation: 'Art. 81 quater CGI', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000046860862', extrait: "Exonération d'impôt sur le revenu des rémunérations d'heures supplémentaires dans la limite de 7 500 € par an. Au-delà, l'excédent est imposé." },
  'cgi-80duodecies': { id: 'cgi-80duodecies', type: 'LOI', citation: 'Art. 80 duodecies CGI', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036431128', extrait: 'Ne constituent pas une rémunération imposable les indemnités de licenciement et les dommages-intérêts alloués par le juge.' },
  'ctrav-l3121-28': { id: 'ctrav-l3121-28', type: 'LOI', citation: 'Art. L. 3121-28 C. trav.', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020376', extrait: 'Toute heure accomplie au-delà de la durée légale est une heure supplémentaire ouvrant droit à majoration.' },
  'ctrav-l1234-9': { id: 'ctrav-l1234-9', type: 'LOI', citation: 'Art. L. 1234-9 C. trav.', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035644154', extrait: "Le salarié licencié alors qu'il compte au moins huit mois d'ancienneté a droit à une indemnité de licenciement." },
  'ctrav-l1235-3': { id: 'ctrav-l1235-3', type: 'LOI', citation: 'Art. L. 1235-3 C. trav.', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036762052', extrait: "Si le licenciement est sans cause réelle et sérieuse, le juge octroie une indemnité comprise entre des montants minimaux et maximaux fixés par le barème." },
  'boss-rupture': { id: 'boss-rupture', type: 'BOSS', citation: 'BOSS · Indemnités de rupture', url: 'https://boss.gouv.fr/portail/accueil/indemnites-de-rupture.html', extrait: "Régime social des indemnités de rupture : exclusion d'assiette dans la limite d'un plafond de 2 PASS commun à l'ensemble des indemnités." },
  'boss-allegements': { id: 'boss-allegements', type: 'BOSS', citation: 'BOSS · Exonérations heures supp.', url: 'https://boss.gouv.fr/portail/accueil/exonerations/les-heures-supplementaires-et.html', extrait: 'Taux maximal de la réduction salariale fixé à 11,31 %.' },
  // Remplace la JP de 2018 (régime périmé) : depuis 2022 les indemnités
  // judiciaires sont exonérées de CSG-CRDS dans la limite du plafond de 2 PASS.
  'boss-csg': { id: 'boss-csg', type: 'BOSS', citation: 'BOSS · CSG-CRDS', url: 'https://boss.gouv.fr/portail/accueil/indemnites-de-rupture.html', extrait: 'Les indemnités de rupture, y compris les dommages-intérêts alloués par le juge, sont exonérées de CSG-CRDS dans la limite de 2 fois le plafond annuel de la sécurité sociale.' },
  'jp-cass-hs': { id: 'jp-cass-hs', type: 'JP', citation: 'Cass. soc., 27 janv. 2021, n° 17-31.046', url: '', extrait: "La preuve des heures supplémentaires n'incombe spécialement à aucune des parties." },
  // Pièces du dossier - la source « terrain » d'un chiffre (le montant remonte
  // jusqu'au document qui le justifie).
  'piece-releve': { id: 'piece-releve', type: 'PIECE', citation: "Pièce 4 · Relevé d'heures", url: '', extrait: '430 heures supplémentaires reconstituées à partir des badges d’accès et des e-mails.' },
  'piece-bulletins': { id: 'piece-bulletins', type: 'PIECE', citation: 'Pièce 3 · Bulletins de salaire', url: '', extrait: 'Douze bulletins de paie ; salaire de référence moyen 2 504 € brut.' },
  'piece-contrat': { id: 'piece-contrat', type: 'PIECE', citation: 'Pièce 1 · Contrat de travail', url: '', extrait: 'CDI, préavis de deux mois, ancienneté de 3 ans et 2 mois.' },
};

// La famille - donc la couleur et le comportement au clic - se déduit du type.
// TEXTE, DECISION, REFERENCE, WEB ouvrent un extrait/page ; PIECE ouvre le
// document ; VALEUR (badge de renvoi) NAVIGUE vers la ligne qui la produit.
export const sourceFamille = (type) => ({
  LOI: 'TEXTE', REGLEMENT: 'TEXTE', CONVENTION: 'TEXTE', CONTRAT: 'TEXTE',
  JP: 'DECISION',
  BOSS: 'REFERENCE', BOFIP: 'REFERENCE', NOMENCLATURE: 'REFERENCE', REFERENTIEL: 'REFERENCE',
  WEB: 'WEB', PIECE: 'PIECE',
}[type] || 'TEXTE');

// Jetons des familles de badge - cinq teintes + un traitement sans teinte.
// Géométrie Plato (Badge système) : bordure teintée un cran plus soutenue que
// le fond + ombre xs. Aucune n'est orange (alerte) ni rouge (destructif).
export const COT_BADGE_TOKENS = {
  PIECE: { bg: '#EDF2FE', color: '#3B5BDB', border: '#cdd9f5' },
  TEXTE: { bg: '#EFEBFE', color: '#6D46C8', border: '#ddd3f6' },
  DECISION: { bg: '#E8F2EA', color: '#3F7350', border: '#c8dccd' },
  REFERENCE: { bg: '#F3EEE4', color: '#7A6244', border: '#ded1ba' },
  VALEUR: { bg: '#EEF1F5', color: '#52657D', border: '#d6dde5' },
  WEB: { bg: 'transparent', color: '#78716C', dashed: '#C9C4BE' },
};

// ── 1. VALEURS ──────────────────────────────────────────────────────────────
// { key, label (auto-suffisant hors contexte), unit: 'EUR'|'PCT'|'H'|'NB',
//   value (null = manquante), manque: 'SAISIE'|'CALCUL' (obligatoire si null),
//   manqueDetail, approx?, domaine, partie, sources: [sourceId],
//   prose: [paragraphes] - l'explication du panneau, avec références typées
//   {montant:cle} / {source:id} / **gras** }
export const COTISATIONS_VALEURS = {
  // bases de calcul (section ①)
  'base.salaire': { key: 'base.salaire', label: 'Salaire de référence', unit: 'EUR', value: 2504, domaine: 'social', partie: 'salarie', sources: ['piece-bulletins'], prose: ["Moyenne des douze derniers bulletins {source:piece-bulletins}, primes au prorata. La ligne la plus importante de la page : la corriger met à jour presque tout en dessous."], tags: ['base'] },
  'base.heures': { key: 'base.heures', label: 'Heures supplémentaires cumulées', unit: 'H', value: 430, domaine: 'social', partie: 'salarie', sources: ['piece-releve'], prose: ["Volume reconstitué à partir des badges d'accès et des e-mails {source:piece-releve}. La preuve des heures supplémentaires n'incombe spécialement à aucune des parties {source:jp-cass-hs}."], tags: ['base'] },

  // postes (section ②)
  'poste.hs': { key: 'poste.hs', label: "Rappel d'heures supplémentaires", unit: 'EUR', value: 8874, domaine: 'social', partie: 'salarie', sources: ['ctrav-l3121-28', 'jp-cass-hs'], prose: ["Le rappel valorise {montant:base.heures} supplémentaires au taux horaire majoré, reconstituées à partir des badges d'accès et des e-mails {source:piece-releve}.", "Toute heure accomplie au-delà de la durée légale ouvre droit à majoration {source:ctrav-l3121-28}, et la preuve n'incombe spécialement à aucune des parties {source:jp-cass-hs}."], tags: ['poste'] },
  'poste.cp': { key: 'poste.cp', label: 'Congés payés sur heures supplémentaires', unit: 'EUR', value: 887, domaine: 'social', partie: 'salarie', sources: ['ctrav-l3121-28'], prose: ["L'indemnité de congés payés afférente au rappel d'heures supplémentaires ({montant:poste.hs}), au dixième."], tags: ['poste'] },
  'poste.prea': { key: 'poste.prea', label: 'Indemnité compensatrice de préavis', unit: 'EUR', value: 5008, domaine: 'social', partie: 'salarie', sources: [], prose: ["Deux mois de salaire de référence ({montant:base.salaire}), prévus par le contrat {source:piece-contrat}.", "Nature de salaire : l'indemnité est intégralement soumise à cotisations."], tags: ['poste'] },
  'poste.il': { key: 'poste.il', label: 'Indemnité légale de licenciement', unit: 'EUR', value: 1878, domaine: 'social', partie: 'salarie', sources: ['ctrav-l1234-9'], prose: ["Indemnité légale {source:ctrav-l1234-9} calculée sur l'ancienneté (trois ans et deux mois) à partir du salaire de référence ({montant:base.salaire})."], tags: ['poste'] },
  'poste.di': { key: 'poste.di', label: 'Dommages-intérêts LSCRS', unit: 'EUR', value: 10016, domaine: 'social', partie: 'salarie', sources: ['ctrav-l1235-3'], prose: ["Quatre mois de salaire de référence ({montant:base.salaire}), dans les bornes du barème {source:ctrav-l1235-3}, pour licenciement sans cause réelle et sérieuse."], tags: ['poste'] },
  'total.brut': { key: 'total.brut', label: 'Total demandé (brut)', unit: 'EUR', value: 26663, domaine: 'social', partie: 'salarie', sources: [], prose: ["La somme des postes de la demande : {montant:poste.hs}, {montant:poste.cp}, {montant:poste.prea}, {montant:poste.il} et {montant:poste.di}, soit **26 663 €**. La section suivante s'en sert sans le réafficher."], tags: ['resultat'] },

  // paramètres
  'param.pass2': { key: 'param.pass2', label: 'Deux fois le plafond annuel de la sécurité sociale', unit: 'EUR', value: 94200, domaine: 'social', partie: 'salarie', sources: ['css-l242-1'], prose: ["Le plafond annuel 2025, doublé. Commun à l'ensemble des indemnités de rupture : elles le consomment ensemble, pas chacune le sien."], tags: ['parametre'] },
  'param.tauxSal': { key: 'param.tauxSal', label: 'Taux de cotisations salariales', unit: 'PCT', value: 22, domaine: 'social', partie: 'salarie', sources: [], prose: ["Taux moyen : vieillesse, retraite complémentaire et CEG. Une estimation plus fine par statut se demande dans la conversation."], tags: ['parametre'] },
  'param.tauxReducHs': { key: 'param.tauxReducHs', label: 'Taux maximum de la réduction sur heures supplémentaires', unit: 'PCT', value: 11.31, domaine: 'social', partie: 'salarie', sources: ['boss-allegements'], prose: ["Le taux maximal de la réduction salariale {source:boss-allegements}. C'est un plafond, pas un taux fixe."], tags: ['parametre'] },
  'param.tauxCsg': { key: 'param.tauxCsg', label: 'Taux cumulé CSG et CRDS', unit: 'PCT', value: 9.7, domaine: 'social', partie: 'salarie', sources: [], prose: ["La CSG au taux de 9,2 % et la CRDS au taux de 0,5 %, appliquées ensemble à la base après abattement."], tags: ['parametre'] },
  'param.tauxPat': { key: 'param.tauxPat', label: 'Taux de cotisations patronales', unit: 'PCT', value: 42, domaine: 'social', partie: 'employeur', sources: [], prose: ["Taux employeur moyen avant allègements généraux."], tags: ['parametre'] },
  'param.effectif': { key: 'param.effectif', label: "Effectif de l'entreprise", unit: 'NB', value: 120, domaine: 'social', partie: 'employeur', sources: [], prose: ["Information du dossier (elle sert déjà au barème d'indemnisation). Elle conditionne le tarif de la déduction forfaitaire patronale."], tags: ['parametre', 'dossier'] },
  'param.tauxMarginal': { key: 'param.tauxMarginal', label: "Taux marginal d'imposition", unit: 'PCT', value: null, manque: 'SAISIE', manqueDetail: 'dépend du foyer fiscal', domaine: 'fiscal', partie: 'salarie', sources: [], prose: ["Le taux dépend du foyer fiscal du client : aucune pièce du dossier ne le contient.", "Indiquez le taux dans la conversation et l'estimation se complétera."], tags: ['parametre', 'manquant'] },

  // page cotisations salariales
  'base.sal': { key: 'base.sal', label: 'Base soumise à cotisations', unit: 'EUR', value: 14769, domaine: 'social', partie: 'salarie', sources: ['css-l242-1'], tags: ['base'] },
  'cot.salBrut': { key: 'cot.salBrut', label: 'Cotisations avant déduction', unit: 'EUR', value: 3249, domaine: 'social', partie: 'salarie', sources: [], tags: ['intermediaire'] },
  'reduc.tepaSal': { key: 'reduc.tepaSal', label: 'Réduction sur heures supplémentaires', unit: 'EUR', value: 1004, domaine: 'social', partie: 'salarie', sources: [], tags: ['deduction'] },
  'cot.sal': { key: 'cot.sal', label: 'Cotisations salariales', unit: 'EUR', value: 2245, domaine: 'social', partie: 'salarie', sources: [], tags: ['resultat'] },

  // page CSG-CRDS
  'abat.csg': { key: 'abat.csg', label: 'Abattement pour frais professionnels', unit: 'EUR', value: 258, domaine: 'social', partie: 'salarie', sources: [], tags: ['exclusion'] },
  'base.csg': { key: 'base.csg', label: 'Base CSG-CRDS', unit: 'EUR', value: 14511, domaine: 'social', partie: 'salarie', sources: ['boss-csg'], tags: ['base'] },
  'cot.csg': { key: 'cot.csg', label: 'Contributions salariales (CSG-CRDS)', unit: 'EUR', value: 1408, domaine: 'social', partie: 'salarie', sources: [], tags: ['resultat'] },

  // page impôt sur le revenu
  'exo.irHs': { key: 'exo.irHs', label: "Part des heures supplémentaires exonérée d'impôt", unit: 'EUR', value: 7500, domaine: 'fiscal', partie: 'salarie', sources: ['cgi-81quater'], tags: ['exclusion', 'partielle'] },
  'deduct.ir': { key: 'deduct.ir', label: 'Cotisations et CSG déductibles', unit: 'EUR', value: 3232, domaine: 'fiscal', partie: 'salarie', sources: [], prose: ["Les cotisations salariales ({montant:cot.sal}) et la part déductible de la CSG (6,8 points de la base CSG-CRDS, soit 987 €) viennent réduire le revenu imposable : **3 232 €** en tout.", "Le montant est repris des pages Cotisations salariales et CSG-CRDS : si l'une bouge, il se recalcule."], tags: ['deduction'] },
  'base.ir': { key: 'base.ir', label: 'Base imposable', unit: 'EUR', value: 4037, domaine: 'fiscal', partie: 'salarie', sources: ['cgi-81quater', 'cgi-80duodecies'], tags: ['base'] },
  'cot.ir': { key: 'cot.ir', label: "Impôt sur le revenu", unit: 'EUR', value: null, manque: 'SAISIE', manqueDetail: "taux d'imposition", domaine: 'fiscal', partie: 'salarie', sources: [], tags: ['resultat', 'manquant'] },

  // page cotisations patronales
  'base.pat': { key: 'base.pat', label: 'Base des cotisations patronales', unit: 'EUR', value: 14769, domaine: 'social', partie: 'employeur', sources: [], tags: ['base'] },
  'cot.patBrut': { key: 'cot.patBrut', label: 'Cotisations avant déduction', unit: 'EUR', value: 6203, domaine: 'social', partie: 'employeur', sources: [], tags: ['intermediaire'] },
  'deduc.tepaPat': { key: 'deduc.tepaPat', label: 'Déduction forfaitaire sur heures supplémentaires', unit: 'EUR', value: 215, domaine: 'social', partie: 'employeur', sources: [], tags: ['deduction'] },
  'cot.pat': { key: 'cot.pat', label: 'Cotisations patronales', unit: 'EUR', value: 5988, domaine: 'social', partie: 'employeur', sources: [], tags: ['resultat'] },

  // bloc de résultats
  'total.net': { key: 'total.net', label: 'Net estimé pour le salarié', unit: 'EUR', value: 23010, domaine: 'social', partie: 'salarie', sources: [], tags: ['resultat-bloc'] },
  'total.employeur': { key: 'total.employeur', label: 'Coût total employeur', unit: 'EUR', value: 32651, domaine: 'social', partie: 'employeur', sources: [], tags: ['resultat-bloc'] },
  'total.ecart': { key: 'total.ecart', label: 'Prélèvements sociaux (aucune des deux parties)', unit: 'EUR', value: 9641, domaine: 'social', partie: 'salarie', sources: [], tags: ['resultat-bloc'] },
};

// ── 2. RÈGLES ───────────────────────────────────────────────────────────────
// { key, nom (RÉDIGÉ pour être lu : « Plafond commun des indemnités de
//   rupture », pas « plafond commun (2 PASS) »), etatApplication (en mots,
//   sans chiffre - surchargable par ligne), entrees: [valueKey] (vide = la
//   règle est un paramètre), sortie: valueKey, ordreImputation (obligatoire
//   pour un plafond partagé : l'ordre de consommation est une propriété de la
//   règle, jamais de l'affichage), sources: [sourceId] (LES SOURCES DE LA
//   RÈGLE, distinctes de celles du poste), prose: [paragraphes] }
//
// `expression` a disparu du modèle : la formule n'est plus un champ, elle est
// racontée dans la prose, valeurs substituées et arrondi visible.
export const COTISATIONS_REGLES = {
  'regle.plafondRupture': {
    key: 'regle.plafondRupture', nom: 'Plafond commun des indemnités de rupture',
    entrees: ['poste.il', 'poste.di', 'param.pass2'], sortie: 'base.sal',
    ordreImputation: ['poste.il', 'poste.di'],
    sources: ['boss-rupture'],
    prose: [
      "Les indemnités versées à l'occasion de la rupture sont exclues de l'assiette des cotisations, dans la limite de deux fois le plafond annuel de la sécurité sociale {source:css-l242-1}, soit {montant:param.pass2}.",
      "Ce plafond est **commun** à l'ensemble des indemnités de rupture {source:boss-rupture} : l'indemnité légale ({montant:poste.il}) puis les dommages-intérêts ({montant:poste.di}) le consomment dans cet ordre. Leur cumul reste très en dessous du plafond : l'exclusion est totale, aucune fraction n'entre dans la base.",
      "Le principe de l'exclusion tient à la loi ; la mécanique du plafond partagé tient au BOSS, qu'un juge peut écarter. C'est sur ce second terrain qu'un contradicteur porterait l'attaque.",
    ],
  },
  'regle.baseSal': {
    key: 'regle.baseSal', nom: 'Base soumise à cotisations',
    entrees: ['poste.hs', 'poste.cp', 'poste.prea'], sortie: 'base.sal',
    sources: ['css-l242-1'],
    prose: [
      "Seules les sommes de nature salariale entrent dans la base {source:css-l242-1} : le rappel d'heures supplémentaires ({montant:poste.hs}), les congés payés afférents ({montant:poste.cp}) et l'indemnité compensatrice de préavis ({montant:poste.prea}), soit **14 769 €**.",
      "Les deux indemnités de rupture en sont écartées par le plafond commun. Elles restent visibles pour que la base se vérifie d'un regard, mais leur montant ne participe pas à la somme.",
    ],
  },
  'regle.tauxSal': {
    key: 'regle.tauxSal', nom: 'Taux de droit commun du régime général',
    entrees: [], sortie: 'param.tauxSal',
    sources: ['css-l242-1'],
    prose: [
      "Taux moyen des cotisations salariales : vieillesse, retraite complémentaire et CEG. Il s'applique à la base soumise à cotisations ({montant:base.sal}), pas au montant demandé.",
      "Une estimation plus fine par statut se demande dans la conversation.",
    ],
  },
  'regle.cotSalBrut': {
    key: 'regle.cotSalBrut', nom: 'Cotisations avant déduction',
    entrees: ['base.sal', 'param.tauxSal'], sortie: 'cot.salBrut',
    sources: [],
    prose: [
      "Le taux de cotisations salariales ({montant:param.tauxSal}) s'applique à la base soumise à cotisations ({montant:base.sal}), soit **3 249 €**.",
      "Ce montant intermédiaire reste affiché : sans lui, la réduction appliquée ensuite ne serait pas vérifiable.",
    ],
  },
  'regle.tepaSal': {
    key: 'regle.tepaSal', nom: 'Réduction salariale sur heures supplémentaires',
    etatApplication: 'appliquée au taux maximum',
    entrees: ['poste.hs', 'param.tauxReducHs'], sortie: 'reduc.tepaSal',
    sources: ['css-l241-17', 'boss-allegements'],
    prose: [
      "Les heures supplémentaires ouvrent droit à une réduction des cotisations vieillesse salariales {source:css-l241-17}. Elle se calcule sur le **rappel d'heures supplémentaires** ({montant:poste.hs}) au taux maximum de {montant:param.tauxReducHs} {source:boss-allegements}, soit 1 003,65 €, arrondi à **1 004 €**.",
      "Ce taux est un plafond : la réduction ne peut pas excéder le montant des cotisations effectivement dues sur ces heures.",
      "Elle s'applique au montant calculé et non à la base : c'est pourquoi elle figure dans « Calcul de la cotisation » et non parmi les postes.",
    ],
  },
  'regle.cotSal': {
    key: 'regle.cotSal', nom: 'Cotisations salariales',
    entrees: ['cot.salBrut', 'reduc.tepaSal'], sortie: 'cot.sal',
    sources: [],
    prose: [
      "Les cotisations avant déduction ({montant:cot.salBrut}), diminuées de la réduction sur heures supplémentaires ({montant:reduc.tepaSal}), donnent **2 245 €**.",
      "C'est le montant repris par la ligne « Cotisations salariales » de la page Chiffrage.",
    ],
  },
  'regle.abatCsg': {
    key: 'regle.abatCsg', nom: 'Abattement pour frais professionnels',
    etatApplication: 'part salariale uniquement',
    entrees: ['base.sal'], sortie: 'abat.csg',
    sources: ['boss-csg'],
    prose: [
      "La CSG et la CRDS se calculent après un abattement pour frais professionnels de 1,75 % appliqué à la part salariale : sur {montant:base.sal}, il retire **258 €** de la base.",
      "L'abattement ne vaut que pour la part salariale : si une fraction d'indemnité dépassait le plafond commun et entrait dans la base, elle y entrerait sans abattement.",
    ],
  },
  'regle.baseCsg': {
    key: 'regle.baseCsg', nom: 'Base CSG-CRDS',
    entrees: ['base.sal', 'abat.csg'], sortie: 'base.csg',
    sources: ['boss-csg'],
    prose: [
      "La base salariale ({montant:base.sal}), diminuée de l'abattement pour frais professionnels ({montant:abat.csg}), donne **14 511 €**.",
      "Les indemnités de rupture restent exonérées de CSG-CRDS dans la même limite de deux PASS {source:boss-csg} : aucune fraction n'entre ici.",
    ],
  },
  'regle.tauxCsg': {
    key: 'regle.tauxCsg', nom: 'Taux cumulé CSG et CRDS',
    entrees: [], sortie: 'param.tauxCsg',
    sources: ['boss-csg'],
    prose: [
      "La CSG au taux de 9,2 % et la CRDS au taux de 0,5 % s'appliquent ensemble, soit {montant:param.tauxCsg} sur la base après abattement.",
      "6,8 points de CSG seront déductibles du revenu imposable : ils se retrouvent sur la page Impôt sur le revenu.",
    ],
  },
  'regle.cotCsg': {
    key: 'regle.cotCsg', nom: 'Contributions salariales (CSG-CRDS)',
    entrees: ['base.csg', 'param.tauxCsg'], sortie: 'cot.csg',
    sources: [],
    prose: [
      "La base CSG-CRDS ({montant:base.csg}) au taux cumulé de {montant:param.tauxCsg} donne **1 408 €**.",
    ],
  },
  'regle.exoIrHs': {
    key: 'regle.exoIrHs', nom: "Exonération d'impôt des heures supplémentaires",
    etatApplication: 'plafond annuel atteint',
    entrees: ['poste.hs'], sortie: 'exo.irHs',
    sources: ['cgi-81quater'],
    prose: [
      "La rémunération des heures supplémentaires est exonérée d'impôt sur le revenu dans la limite de **7 500 € par an** {source:cgi-81quater}.",
      "Sur {montant:poste.hs} de rappel, la part exonérée atteint le plafond : **7 500 €** sortent de la base, **1 374 €** restent imposables. C'est l'arithmétique de la ligne indentée : le poste entre en entier, la part exonérée en sort.",
    ],
  },
  'regle.exoIrIl': {
    key: 'regle.exoIrIl', nom: "Exonération d'impôt des indemnités de licenciement",
    entrees: ['poste.il'], sortie: 'base.ir',
    sources: ['cgi-80duodecies'],
    prose: [
      "L'indemnité légale de licenciement ne constitue pas une rémunération imposable {source:cgi-80duodecies} : elle est exonérée en totalité, sans plafond à consommer.",
      "La ligne reste visible : « ce montant n'est pas imposé » est un argument de la demande, pas un détail.",
    ],
  },
  'regle.exoIrDi': {
    key: 'regle.exoIrDi', nom: "Exonération d'impôt des dommages-intérêts",
    etatApplication: 'même exonération que l’indemnité légale',
    entrees: ['poste.di'], sortie: 'base.ir',
    sources: ['cgi-80duodecies'],
    prose: [
      "Les dommages-intérêts alloués par le juge ne sont pas imposables {source:cgi-80duodecies}.",
      "Avec l'indemnité légale, {montant:poste.di} et {montant:poste.il} échappent entièrement à l'impôt : le meilleur argument fiscal de la demande.",
    ],
  },
  'regle.baseIr': {
    key: 'regle.baseIr', nom: 'Base imposable',
    entrees: ['poste.hs', 'poste.cp', 'poste.prea', 'exo.irHs', 'deduct.ir'], sortie: 'base.ir',
    sources: ['cgi-81quater', 'cgi-80duodecies'],
    prose: [
      "Entrent dans la base : la part imposable du rappel d'heures supplémentaires (**1 374 €**), les congés payés ({montant:poste.cp}) et le préavis ({montant:poste.prea}), moins les cotisations et la CSG déductibles ({montant:deduct.ir}).",
      "Soit une base imposable de **4 037 €**. Il ne manque plus que le taux d'imposition pour estimer l'impôt.",
    ],
  },
  'regle.impotIr': {
    key: 'regle.impotIr', nom: "Impôt sur le revenu",
    entrees: ['base.ir', 'param.tauxMarginal'], sortie: 'cot.ir',
    sources: [],
    prose: [
      "La base imposable ({montant:base.ir}) multipliée par le taux marginal d'imposition donnera l'estimation de l'impôt.",
      "Le taux manque : indiquez-le dans la conversation et l'estimation se complétera. Tant qu'il manque, le net de la page Chiffrage précise « hors impôt sur le revenu ».",
    ],
  },
  'regle.basePat': {
    key: 'regle.basePat', nom: 'Base des cotisations patronales',
    entrees: ['base.sal'], sortie: 'base.pat',
    sources: [],
    prose: [
      "La base des cotisations patronales reprend la base soumise à cotisations telle qu'elle est établie sur la page Cotisations salariales ({montant:base.sal}) : une valeur d'une autre page, pas un nouveau calcul.",
    ],
  },
  'regle.tauxPat': {
    key: 'regle.tauxPat', nom: 'Taux employeur moyen avant allègements',
    entrees: [], sortie: 'param.tauxPat',
    sources: [],
    prose: [
      "Taux moyen des cotisations patronales avant allègements généraux. Une estimation par branche se demande dans la conversation.",
    ],
  },
  'regle.cotPatBrut': {
    key: 'regle.cotPatBrut', nom: 'Cotisations avant déduction',
    entrees: ['base.pat', 'param.tauxPat'], sortie: 'cot.patBrut',
    sources: [],
    prose: [
      "La base des cotisations patronales ({montant:base.pat}) au taux employeur moyen ({montant:param.tauxPat}) donne **6 203 €**.",
    ],
  },
  'regle.tepaPat': {
    key: 'regle.tepaPat', nom: 'Déduction forfaitaire sur heures supplémentaires',
    etatApplication: 'au tarif des employeurs de vingt salariés ou plus',
    entrees: ['base.heures', 'param.effectif'], sortie: 'deduc.tepaPat',
    sources: ['css-l241-18'],
    prose: [
      "Chaque heure supplémentaire ouvre droit à une déduction forfaitaire de cotisations patronales {source:css-l241-18} : {montant:base.heures} à 0,50 € l'heure donnent **215 €**.",
      "Le tarif dépend de l'effectif : 1,50 € par heure en dessous de vingt salariés, 0,50 € à partir de vingt. L'employeur en compte {montant:param.effectif} : le tarif réduit s'applique.",
    ],
  },
  'regle.cotPat': {
    key: 'regle.cotPat', nom: 'Cotisations patronales',
    entrees: ['cot.patBrut', 'deduc.tepaPat'], sortie: 'cot.pat',
    sources: [],
    prose: [
      "Les cotisations avant déduction ({montant:cot.patBrut}), diminuées de la déduction forfaitaire ({montant:deduc.tepaPat}), donnent **5 988 €**.",
      "En rupture conventionnelle ou en mise à la retraite, une contribution patronale spécifique s'ajouterait. Le mode de rupture ne la déclenche pas ici : la ligne n'existe pas.",
    ],
  },
  'regle.net': {
    key: 'regle.net', nom: 'Net estimé pour le salarié',
    entrees: ['total.brut', 'cot.sal', 'cot.csg', 'cot.ir'], sortie: 'total.net',
    sources: [],
    prose: [
      "Le total demandé ({montant:total.brut}), diminué des cotisations salariales ({montant:cot.sal}) et de la CSG-CRDS ({montant:cot.csg}), donne **23 010 €**.",
      "L'impôt sur le revenu manque encore : indiquez le taux d'imposition dans la conversation et l'estimation se complétera. D'ici là, la mention « hors impôt sur le revenu » reste affichée.",
    ],
  },
  'regle.coutEmployeur': {
    key: 'regle.coutEmployeur', nom: 'Coût total employeur',
    entrees: ['total.brut', 'cot.pat'], sortie: 'total.employeur',
    sources: [],
    prose: [
      "Le total demandé ({montant:total.brut}), augmenté des cotisations patronales ({montant:cot.pat}), donne **32 651 €** : ce que la demande coûte à l'employeur, charges incluses.",
    ],
  },
  'regle.ecart': {
    key: 'regle.ecart', nom: 'Prélèvements sociaux',
    entrees: ['cot.sal', 'cot.csg', 'cot.pat'], sortie: 'total.ecart',
    sources: [],
    prose: [
      "Les cotisations salariales ({montant:cot.sal}), la CSG-CRDS ({montant:cot.csg}) et les cotisations patronales ({montant:cot.pat}) totalisent **9 641 €** : la part du coût employeur qui ne revient à aucune des deux parties.",
      "« Sociaux » parce que l'impôt, manquant, n'y figure pas encore.",
    ],
  },
};

// ── 4. LIGNES (layout) ──────────────────────────────────────────────────────
// Une ligne se décline par TROIS FAMILLES (poste / operation / resultat),
// QUATRE ÉTATS (active - défaut / ecartee / attente / en_cours) et DEUX
// RÉGLAGES (indentee, emphase). Les cas d'usage sont des combinaisons -
// aucun n'ajoute de composant.
//
// { id, famille, etat?, operateur: '+'|'-'|'x'|'='|null, valueKey, regleKey?,
//   label? (override), etatApplication? (surcharge celui de la règle),
//   qualificatif? (remplace la valeur d'un poste écarté : « non soumise »),
//   valeurSecondaire? (montant barré sous le qualificatif, hors colonne),
//   note? (provenance, dénombrement, constat de fait - ni source ni
//   paramètre, jamais de formule), renvois?: [sourceId] (les sources DU
//   POSTE, 2 max affichées puis compteur), renvoiValeur?: { label, target }
//   (badge de valeur qui NAVIGUE vers la page qui la produit), pieceId?,
//   indentee?, emphase?: 'section'|'tableau', panel?: false }
//
// Interdits : ecartee sur une operation ou un resultat ; une déduction
// indentée ; une ligne à zéro pour une condition non remplie.

// Section ③ de la page Chiffrage : quatre lignes, chacune ouvre sa page.
// La colonne s'intitule « Montant prélevé » : la direction est portée par le
// titre, plus aucun signe collé au nombre (règle : aucun montant négatif).
export const CHIFFRAGE_PRELEVEMENTS = [
  { id: 'c-sal', valueKey: 'cot.sal', label: 'Cotisations salariales', pageKey: 'cot-sal' },
  { id: 'c-csg', valueKey: 'cot.csg', label: 'Contributions salariales (CSG-CRDS)', pageKey: 'cot-csg' },
  { id: 'c-ir', valueKey: 'cot.ir', label: 'Impôt sur le revenu', pageKey: 'cot-ir' },
  { id: 'c-pat', valueKey: 'cot.pat', label: 'Cotisations patronales', pageKey: 'cot-pat' },
];

// Les quatre pages de prélèvement. Pas d'en-tête de tableau : l'en-tête de
// page porte le titre et le total. Chaque section NOMME CE QU'ELLE PRODUIT
// et porte le libellé de sa colonne de valeurs ; sa dernière ligne le délivre.
export const COTISATIONS_PAGES = {
  'cot-sal': {
    key: 'cot-sal', title: 'Cotisations salariales', amountKey: 'cot.sal',
    sections: [
      {
        titre: 'Base soumise à cotisations', libelleColonne: 'Montant demandé',
        description: 'Les montants demandés, et le sort de chacun - le total forme la base',
        lignes: [
          { id: 's-hs', famille: 'poste', operateur: '+', valueKey: 'poste.hs', pieceId: 'piece-releve', renvois: ['ctrav-l3121-28', 'jp-cass-hs'] },
          { id: 's-cp', famille: 'poste', operateur: '+', valueKey: 'poste.cp', renvois: ['ctrav-l3121-28'] },
          { id: 's-prea', famille: 'poste', operateur: '+', valueKey: 'poste.prea', pieceId: 'piece-contrat' },
          // Postes écartés : la valeur devient un qualificatif, le montant
          // demandé passe en dessous, barré, hors colonne. La règle qui les
          // écarte s'affiche avec SES sources ; l'état d'application (en
          // mots) distingue la seconde ligne du plafond partagé.
          { id: 's-il', famille: 'poste', etat: 'ecartee', operateur: '+', valueKey: 'poste.il', qualificatif: 'non soumise', valeurSecondaire: 1878, regleKey: 'regle.plafondRupture', renvois: ['ctrav-l1234-9'] },
          { id: 's-di', famille: 'poste', etat: 'ecartee', operateur: '+', valueKey: 'poste.di', qualificatif: 'non soumis', valeurSecondaire: 10016, regleKey: 'regle.plafondRupture', etatApplication: 'plafond déjà entamé', renvois: ['ctrav-l1235-3'] },
          { id: 's-base', famille: 'resultat', operateur: '=', valueKey: 'base.sal', regleKey: 'regle.baseSal', emphase: 'section', note: '3 postes sur 5 retenus' },
        ],
      },
      {
        titre: 'Calcul de la cotisation', libelleColonne: 'Montant',
        description: 'Le taux appliqué à la base, la réduction retirée - le total est prélevé',
        lignes: [
          { id: 's-taux', famille: 'operation', operateur: 'x', valueKey: 'param.tauxSal', label: 'Taux de cotisations salariales', regleKey: 'regle.tauxSal' },
          { id: 's-brut', famille: 'operation', operateur: '=', valueKey: 'cot.salBrut', regleKey: 'regle.cotSalBrut' },
          // Une déduction agit APRÈS le calcul : plein niveau, jamais indentée.
          { id: 's-reduc', famille: 'operation', operateur: '-', valueKey: 'reduc.tepaSal', regleKey: 'regle.tepaSal', note: 'plafonnée aux cotisations vieillesse effectivement dues' },
          { id: 's-total', famille: 'resultat', operateur: '=', valueKey: 'cot.sal', regleKey: 'regle.cotSal', emphase: 'tableau' },
        ],
      },
    ],
  },
  'cot-csg': {
    key: 'cot-csg', title: 'Contributions salariales (CSG-CRDS)', amountKey: 'cot.csg',
    sections: [
      {
        titre: 'Base CSG-CRDS', libelleColonne: 'Montant',
        description: 'La base salariale reprise, diminuée de l’abattement pour frais professionnels',
        lignes: [
          // Report d'un autre tableau : pas d'opérateur, un badge de valeur
          // qui navigue vers la ligne d'origine.
          { id: 'g-base', famille: 'poste', operateur: '+', valueKey: 'base.sal', label: 'Base soumise à cotisations', renvoiValeur: { label: 'Cotisations salariales', target: 'cot-sal' } },
          // Un plafonnement / une sortie de base : opérateur -, ligne indentée.
          { id: 'g-abat', famille: 'operation', operateur: '-', indentee: true, valueKey: 'abat.csg', regleKey: 'regle.abatCsg' },
          { id: 'g-basecsg', famille: 'resultat', operateur: '=', valueKey: 'base.csg', regleKey: 'regle.baseCsg', emphase: 'section' },
        ],
      },
      {
        titre: 'Calcul de la contribution', libelleColonne: 'Montant',
        description: 'Le taux cumulé CSG et CRDS appliqué à la base',
        lignes: [
          { id: 'g-taux', famille: 'operation', operateur: 'x', valueKey: 'param.tauxCsg', label: 'Taux cumulé CSG et CRDS', regleKey: 'regle.tauxCsg' },
          { id: 'g-total', famille: 'resultat', operateur: '=', valueKey: 'cot.csg', regleKey: 'regle.cotCsg', emphase: 'tableau' },
        ],
      },
    ],
  },
  'cot-ir': {
    key: 'cot-ir', title: 'Impôt sur le revenu', amountKey: 'cot.ir',
    sections: [
      {
        titre: 'Base imposable', libelleColonne: 'Montant demandé',
        description: 'Ce qui reste imposable une fois les exonérations appliquées',
        lignes: [
          { id: 'i-hs', famille: 'poste', operateur: '+', valueKey: 'poste.hs', pieceId: 'piece-releve' },
          // Exclusion PARTIELLE : le poste entre en entier, la part exonérée
          // sort par une ligne indentée - l'arithmétique porte une vraie
          // information. Le montant retiré EST le plafond.
          { id: 'i-hs-exo', famille: 'operation', operateur: '-', indentee: true, valueKey: 'exo.irHs', label: "Part exonérée d'impôt", regleKey: 'regle.exoIrHs' },
          { id: 'i-cp', famille: 'poste', operateur: '+', valueKey: 'poste.cp' },
          { id: 'i-prea', famille: 'poste', operateur: '+', valueKey: 'poste.prea' },
          { id: 'i-il', famille: 'poste', etat: 'ecartee', operateur: '+', valueKey: 'poste.il', qualificatif: 'non imposable', valeurSecondaire: 1878, regleKey: 'regle.exoIrIl', renvois: ['ctrav-l1234-9'] },
          { id: 'i-di', famille: 'poste', etat: 'ecartee', operateur: '+', valueKey: 'poste.di', qualificatif: 'non imposables', valeurSecondaire: 10016, regleKey: 'regle.exoIrDi', renvois: ['ctrav-l1235-3'] },
          { id: 'i-deduct', famille: 'operation', operateur: '-', valueKey: 'deduct.ir', note: 'repris des pages Cotisations salariales et CSG-CRDS' },
          { id: 'i-base', famille: 'resultat', operateur: '=', valueKey: 'base.ir', regleKey: 'regle.baseIr', emphase: 'section', note: 'hors indemnités exonérées en totalité' },
        ],
      },
      {
        titre: "Calcul de l'impôt", libelleColonne: 'Montant',
        description: 'Le taux marginal dépend du foyer fiscal du client - il se demande dans le chat',
        lignes: [
          // Valeur en attente d'une SAISIE : l'autre tiret - la différence
          // dit à l'agent s'il doit demander ou attendre.
          { id: 'i-taux', famille: 'operation', etat: 'attente', operateur: 'x', valueKey: 'param.tauxMarginal', label: "Taux marginal d'imposition" },
          { id: 'i-total', famille: 'resultat', operateur: '=', valueKey: 'cot.ir', regleKey: 'regle.impotIr', emphase: 'tableau' },
        ],
      },
    ],
  },
  'cot-pat': {
    key: 'cot-pat', title: 'Cotisations patronales', amountKey: 'cot.pat',
    sections: [
      {
        titre: 'Base des cotisations patronales', libelleColonne: 'Montant',
        description: 'La base salariale, reprise sans retraitement',
        lignes: [
          { id: 'p-report', famille: 'poste', operateur: '+', valueKey: 'base.sal', label: 'Base soumise à cotisations', renvoiValeur: { label: 'Cotisations salariales', target: 'cot-sal' } },
          { id: 'p-base', famille: 'resultat', operateur: '=', valueKey: 'base.pat', regleKey: 'regle.basePat', emphase: 'section', note: 'reprise sans retraitement' },
        ],
      },
      {
        titre: 'Calcul de la cotisation', libelleColonne: 'Montant',
        description: 'Le taux employeur appliqué à la base, puis la déduction forfaitaire',
        lignes: [
          { id: 'p-taux', famille: 'operation', operateur: 'x', valueKey: 'param.tauxPat', label: 'Taux de cotisations patronales', regleKey: 'regle.tauxPat' },
          { id: 'p-brut', famille: 'operation', operateur: '=', valueKey: 'cot.patBrut', regleKey: 'regle.cotPatBrut' },
          { id: 'p-deduc', famille: 'operation', operateur: '-', valueKey: 'deduc.tepaPat', regleKey: 'regle.tepaPat', note: 'employeur de 20 salariés ou plus' },
          { id: 'p-total', famille: 'resultat', operateur: '=', valueKey: 'cot.pat', regleKey: 'regle.cotPat', emphase: 'tableau' },
        ],
      },
    ],
  },
};

// Bloc de résultats : deux chiffres côte à côte (un seul argument de
// négociation), l'écart en dessous. Chaque bloc s'audite comme une ligne.
export const RESULTATS_BLOC = {
  blocs: [
    { id: 'r-net', valueKey: 'total.net', regleKey: 'regle.net', mentionWhenMissing: { dependsOn: 'cot.ir', mention: 'hors impôt sur le revenu' } },
    { id: 'r-emp', valueKey: 'total.employeur', regleKey: 'regle.coutEmployeur' },
  ],
  ecart: { id: 'r-ecart', valueKey: 'total.ecart', regleKey: 'regle.ecart', phrase: 'de prélèvements sociaux ne reviennent à aucune des deux parties' },
};

// ── helpers ─────────────────────────────────────────────────────────────────
export const pageSections = (page) => page.sections || [];
export const pageLignes = (page) => pageSections(page).flatMap(s => s.lignes);

export const getCotValeur = (key) => COTISATIONS_VALEURS[key] || null;
export const getCotRegle = (key) => COTISATIONS_REGLES[key] || null;
export const getCotSources = (ids = []) => ids.map(id => COTISATIONS_SOURCES[id]).filter(Boolean);

// Résout une ligne de layout en props de rendu. Tout ce qui peut se déduire
// se déduit ici (jamais stocké) : le motif d'un tiret, la prose du panneau,
// l'état d'application affiché, la famille des badges.
export function resolveCotLigne(ligne) {
  const regle = ligne.regleKey ? getCotRegle(ligne.regleKey) : null;
  const valeur = ligne.valueKey ? getCotValeur(ligne.valueKey) : (regle ? getCotValeur(regle.sortie) : null);
  const renvois = getCotSources(ligne.renvois || []);
  const pieces = ligne.pieceId ? getCotSources([ligne.pieceId]) : [];
  const prose = regle?.prose || valeur?.prose || null;
  const hasPanel = ligne.panel !== false && !!prose;
  return {
    ...ligne,
    label: ligne.label || valeur?.label || regle?.nom || '',
    valeur,
    regle,
    etatApplication: ligne.etatApplication ?? regle?.etatApplication ?? null,
    renvois,
    pieces,
    prose,
    hasPanel,
  };
}

// Format d'un montant. Un tiret quand la valeur manque - le motif se dérive
// de `manque` : SAISIE ⇒ « à renseigner · … », CALCUL ⇒ « à calculer · … ».
export const fmtCot = (v, unit = 'EUR', { approx = false } = {}) => {
  if (v == null) return '—';
  const n = v.toLocaleString('fr-FR');
  const s = unit === 'PCT' ? `${n} %` : unit === 'H' ? `${n} h` : unit === 'NB' ? n : `${n} €`;
  return approx ? `≈ ${s}` : s;
};

export const fmtCotValeur = (valeur) => valeur ? fmtCot(valeur.value, valeur.unit, { approx: valeur.approx }) : '—';

export const fmtCotManque = (valeur) => {
  if (!valeur || valeur.value != null || !valeur.manque) return null;
  const verbe = valeur.manque === 'SAISIE' ? 'à renseigner' : 'à calculer';
  return valeur.manqueDetail ? `${verbe} · ${valeur.manqueDetail}` : verbe;
};
