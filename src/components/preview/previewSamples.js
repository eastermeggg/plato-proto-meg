// Échantillons partagés du Doc Preview (PreviewPanel) : une source par kind
// (piece / modele / jp / email / loi / ligne / web) + les lignes de poste pour
// le SUJET « ligne » (rail « Éditer la ligne »). Source unique consommée par le
// lab /ui-kit/preview-panel ET la fiche composant (componentDemos → gallery par
// kind + état d'édition). Données mock uniquement - aucune valeur de style ici.
// Réfs Figma : gallery par kind 37375:9358 · état « Éditer la ligne » 37611:19401.

export const PREVIEW_SAMPLES = {
  piece: {
    name: "Rapport d'expertise médicale Dr. Dubois",
    type: 'Rapport', date: '15/03/2023', pages: 6, section: 'I - MEDICAL', numero: '2',
    split: { source: 'rapport_expertise.pdf' },
    summary: "Rapport d'expertise médicale définitif du Dr. Dubois, consolidation fixée au 15/01/2024, AIPP 8 %, DFT total 45 jours, DFT partiel classe II 120 jours.",
    // Provenance : cette pièce a été importée depuis un email → « Voir l'email ».
    provenance: { subject: 'Indemnisation dossier Martin', from: 'M. Martin', date: '03/02/2024', open: { kind: 'email' } },
    // Multi-chunk : le même rapport appuie DEUX affirmations, sur deux pages.
    passages: [
      { page: 2, quote: "La consolidation est fixée au 15 janvier 2024." },
      { page: 4, quote: "Le déficit fonctionnel permanent est évalué à 12 %." },
    ],
  },
  modele: {
    name: 'Assignation devant le tribunal judiciaire - trame',
    type: 'Modèle', category: 'Contentieux civil', date: '02/06/2025', pages: 4, variables: 14,
    summary: "Trame d'assignation en réparation du préjudice corporel : en-tête juridiction, exposé des faits, discussion en droit, dispositif et bordereau de pièces.",
  },
  jp: {
    name: 'Cass. 2e civ., 12 déc. 2019, n° 18-21.234',
    jp: {
      juridiction: 'Cour de cassation, 2e chambre civile', date: '12 décembre 2019', numero: '18-21.234',
      quantum: 'DFP 12 % · 32 400 €',
      faits: "À la suite d'un accident de la circulation survenu le 3 mai 2015, la victime a saisi le juge afin d'obtenir la réparation intégrale de ses préjudices.",
      moyens: "Le demandeur au pourvoi fait grief à l'arrêt d'avoir limité l'indemnisation du déficit fonctionnel permanent sans tenir compte du taux retenu par l'expert judiciaire.",
      motifs: [
        { text: "Vu le principe de la réparation intégrale du préjudice, sans perte ni profit pour la victime ;" },
        { text: "Attendu que la cour d'appel a fixé le déficit fonctionnel permanent à un taux inférieur à celui retenu par l'expertise sans caractériser les éléments justifiant cette minoration ;", cite: true },
        { text: "Qu'en statuant ainsi, la cour d'appel a violé le principe susvisé ;" },
      ],
      dispositif: "CASSE ET ANNULE, mais seulement en ce qu'il a limité l'indemnisation du déficit fonctionnel permanent, l'arrêt rendu le 4 avril 2018 par la cour d'appel de Lyon.",
    },
    passage: { anchor: true },
  },
  email: {
    name: 'Fil - Indemnisation dossier Martin',
    email: {
      subject: 'Indemnisation dossier Martin',
      messages: [
        { from: 'M. Martin', to: 'Cabinet', date: '03/02/2024',
          body: "Bonjour Maître,\nJe vous transmets le rapport d'expertise reçu ce matin, ainsi que la photo de mon arrêt de travail.",
          // PJ image (photo / scan) : prévisualisée en corps « image ».
          attachments: [{
            name: 'arret_travail.jpg',
            source: {
              name: 'Arrêt de travail (photo)', docType: 'image', type: 'Certificat médical', date: '02/02/2024',
              section: 'I - MEDICAL', numero: '3',
              summary: "Photographie de l'avis d'arrêt de travail transmis par le client. Durée prescrite lisible sur le cliché.",
              provenance: { subject: 'Indemnisation dossier Martin', from: 'M. Martin', date: '03/02/2024', open: { kind: 'email' } },
              passages: [{ page: 1, quote: "Arrêt de travail prescrit pour une durée de 30 jours.", rect: { x: 16, y: 30, w: 62, h: 9 } }],
            },
          }] },
        { from: 'Cabinet', to: 'M. Martin', date: '04/02/2024', body: "Bien reçu, je regarde cela et reviens vers vous rapidement." },
        { from: 'M. Martin', to: 'Cabinet', date: '06/02/2024', cite: true,
          body: "Pour information, l'assureur propose une offre de 28 000 € au titre du DFP, ce qui me semble insuffisant au regard du taux de 12 % retenu par l'expert. Je vous joins mon projet de courrier de contestation.",
          // Deux PJ : un PDF (offre) et un Word (projet de courrier).
          attachments: [
            {
              name: 'Offre transactionnelle assureur',
              source: {
                name: 'Offre transactionnelle assureur', docType: 'pdf', type: 'Correspondance', date: '06/02/2024',
                pages: 2, section: 'II - CORRESPONDANCE', numero: '7',
                summary: "Offre d'indemnisation amiable de l'assureur au titre du déficit fonctionnel permanent.",
                provenance: { subject: 'Indemnisation dossier Martin', from: 'M. Martin', date: '06/02/2024', open: { kind: 'email' } },
                passages: [{ page: 1, quote: "Offre au titre du déficit fonctionnel permanent : 28 000 €." }],
              },
            },
            {
              name: 'contestation_offre.docx',
              source: {
                name: 'Projet de courrier de contestation', docType: 'word', type: 'Correspondance', date: '06/02/2024',
                pages: 1, section: 'II - CORRESPONDANCE', numero: '8',
                summary: "Projet de courrier contestant l'offre de l'assureur au regard du taux de DFP retenu par l'expert.",
                provenance: { subject: 'Indemnisation dossier Martin', from: 'M. Martin', date: '06/02/2024', open: { kind: 'email' } },
                wordBody: [
                  { heading: true, text: "Objet : Contestation de l'offre d'indemnisation" },
                  { text: "Maître,\n\nJe fais suite au courrier du 6 février 2024 par lequel la compagnie propose une indemnisation de 28 000 € au titre du déficit fonctionnel permanent." },
                  { text: "Cette proposition ne saurait être acceptée en l'état." },
                  { text: "L'expert judiciaire a retenu un taux de déficit fonctionnel permanent de 12 %, sensiblement supérieur à celui sur lequel repose l'offre. Le principe de la réparation intégrale impose une réévaluation du montant proposé.", cite: true, page: 1 },
                  { text: "Je vous saurais gré de bien vouloir me faire parvenir une offre révisée dans un délai de quinze jours." },
                  { text: "Je vous prie d'agréer, Maître, l'expression de mes salutations distinguées." },
                ],
                passages: [{ page: 1, quote: "L'expert judiciaire a retenu un taux de déficit fonctionnel permanent de 12 %." }],
              },
            },
          ] },
      ],
    },
    passage: { anchor: true },
  },
  loi: {
    name: 'Article L1234-9 - Code du travail',
    loi: {
      code: 'Code du travail', article: 'Article L1234-9', enVigueur: '29/07/2026',
      alineas: [
        { text: "Le salarié titulaire d'un contrat de travail à durée indéterminée, licencié alors qu'il compte huit mois d'ancienneté ininterrompus au service du même employeur, a droit, sauf en cas de faute grave, à une indemnité de licenciement." },
        { text: "Le taux de cette indemnité est déterminé par voie réglementaire, en fonction de la rémunération brute dont le salarié bénéficiait antérieurement à la rupture du contrat de travail.", cite: true },
      ],
    },
    passage: { anchor: true },
  },
  ligne: {
    name: 'Cotisation - CSG déductible',
    ligne: {
      authority: 'urssaf', periode: 'Janvier 2024',
      regle: "La CSG déductible s'applique au taux de 6,80 % sur 98,25 % de la rémunération brute, dans la limite de 4 plafonds annuels de la sécurité sociale.",
      rows: [
        { label: 'Assurance maladie', base: '3 200,00', montant: '- 224,00' },
        { label: 'CSG déductible', base: '3 144,00', montant: '- 213,79', cite: true },
        { label: 'CSG/CRDS non déductible', base: '3 144,00', montant: '- 76,93' },
        { label: 'Assurance chômage', base: '3 200,00', montant: '- 0,00' },
      ],
    },
    passage: { anchor: true },
  },
  web: {
    name: 'service-public.fr - Indemnité de licenciement',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F408',
  },
};

export const PREVIEW_ORDER = ['piece', 'modele', 'jp', 'email', 'loi', 'ligne', 'web'];

// Lignes de poste réelles pour le SUJET « ligne » : le doc devient la pièce
// attachée, un rail édite les valeurs de la ligne (schéma générique `fields`).
export const POSTE_LIGNES = [
  {
    ligne: {
      poste: 'PGPA', titre: 'Technimat Ouest - Juin 2022',
      fields: [
        { label: 'Libellé', type: 'text', value: 'Technimat Ouest - Juin 2022', full: true },
        { label: 'Début', type: 'date', value: '01/06/2022', sourced: true, docHint: { page: 1, rect: { x: 49, y: 10.5, w: 47, h: 4 } } },
        { label: 'Fin', type: 'date', value: '30/06/2022', sourced: true, docHint: { page: 1, rect: { x: 49, y: 14, w: 47, h: 4 } } },
        { label: 'Revenu net', type: 'money', value: '2 874,88', full: true, sourced: true, docHint: { page: 1, rect: { x: 57, y: 29, w: 39, h: 4 } } },
      ],
      summary: [
        { label: 'Coefficient', value: '1,097096' },
        { label: 'Revenu net revalorisé', value: '3 154,02 €', strong: true },
      ],
      pieces: ['Bulletin de paie - juin 2022', 'Bulletin de paie - juillet 2022'],
      pieceSources: [
        { name: 'Bulletin de paie - juin 2022', docType: 'pdf', type: 'Bulletin', date: '30/06/2022', section: 'III - REVENUS', numero: '12', pages: 4, split: { source: 'bulletins_technimat_2022.pdf' }, summary: 'Bulletin de paie de juin 2022 - Technimat Ouest, net 2 874,88 €.' },
        { name: 'Bulletin de paie - juillet 2022', docType: 'pdf', type: 'Bulletin', date: '31/07/2022', section: 'III - REVENUS', numero: '13', pages: 4, summary: 'Bulletin de paie de juillet 2022 - Technimat Ouest.' },
      ],
    },
    piece: { name: 'Bulletin de paie - juin 2022', docType: 'pdf', type: 'Bulletin', date: '30/06/2022', section: 'III - REVENUS', numero: '12', pages: 4, split: { source: 'bulletins_technimat_2022.pdf' }, summary: 'Bulletin de paie de juin 2022 - Technimat Ouest, salaire net 2 874,88 €.' },
  },
  {
    ligne: {
      poste: 'SOCIAL', titre: 'Heures supplémentaires majorées 2023',
      fields: [
        { label: 'Libellé', type: 'text', value: 'Heures supplémentaires majorées', full: true },
        { label: 'Période', type: 'text', value: 'Janv. → Déc. 2023', sourced: true },
        { label: "Nombre d'heures", type: 'number', value: '156', suffix: 'h', sourced: true },
        { label: 'Taux horaire', type: 'money', value: '18,95', sourced: true },
        { label: 'Majoration', type: 'percent', value: '25' },
      ],
      summary: [
        { label: 'Montant brut', value: '3 695,25 €' },
        { label: 'Rappel de salaire dû', value: '4 619,06 €', strong: true },
      ],
      pieces: ['Contrat de travail', 'Relevé des heures 2023'],
      pieceSources: [
        { name: 'Contrat de travail', docType: 'word', type: 'Contrat', date: '02/01/2020', section: 'I - SOCIAL', numero: '3', pages: 3, summary: 'Contrat de travail Technimat - durée du travail et rémunération.' },
        { name: 'Relevé des heures 2023', docType: 'pdf', type: 'Relevé', date: '31/12/2023', section: 'I - SOCIAL', numero: '4', pages: 2, summary: 'Relevé des heures supplémentaires 2023.' },
      ],
    },
    piece: { name: 'Contrat de travail', docType: 'word', type: 'Contrat', date: '02/01/2020', section: 'I - SOCIAL', numero: '3', pages: 3, summary: 'Contrat de travail Technimat - clause de durée du travail et rémunération.' },
  },
  {
    ligne: {
      poste: 'DFT', titre: 'DFT partiel classe II',
      fields: [
        { label: 'Libellé', type: 'text', value: 'DFT partiel - classe II', full: true },
        { label: 'Début', type: 'date', value: '15/03/2023', sourced: true },
        { label: 'Fin', type: 'date', value: '12/07/2023', sourced: true },
        { label: 'Classe', type: 'select', value: 'Classe II (25 %)', options: ['Classe I (10 %)', 'Classe II (25 %)', 'Classe III (50 %)', 'Classe IV (75 %)'], sourced: true },
        { label: 'Indemnité / jour', type: 'money', value: '23,00' },
      ],
      summary: [
        { label: 'Durée', value: '120 jours' },
        { label: 'Indemnisation DFT', value: '690,00 €', strong: true },
      ],
      pieces: ["Rapport d'expertise médicale"],
    },
    piece: { name: "Rapport d'expertise médicale Dr. Dubois", docType: 'pdf', type: 'Expertise', date: '15/01/2024', section: 'I - MEDICAL', numero: '2', pages: 6, split: { source: 'rapport_expertise.pdf' }, summary: 'Rapport définitif Dr. Dubois - consolidation 15/01/2024, AIPP 8 %, DFT 120 jours.' },
  },
  {
    ligne: {
      poste: 'DSA', titre: 'Hospitalisation CHU Bordeaux',
      fields: [
        { label: 'Libellé', type: 'text', value: 'Hospitalisation CHU Bordeaux', full: true },
        { label: 'Date des soins', type: 'date', value: '18/03/2023', sourced: true },
        { label: 'Montant facturé', type: 'money', value: '4 250,00', sourced: true },
        { label: 'Pris en charge (CPAM)', type: 'money', value: '3 900,00', sourced: true },
        { label: 'Organisme', type: 'select', value: 'CPAM Gironde', options: ['CPAM Gironde', 'Mutuelle', 'Aucun'] },
      ],
      summary: [
        { label: 'Reste à charge', value: '350,00 €', strong: true },
      ],
      pieces: ['Facture CHU Bordeaux', 'Décompte CPAM'],
      pieceSources: [
        { name: 'Facture CHU Bordeaux', docType: 'pdf', type: 'Facture', date: '18/03/2023', section: 'II - FRAIS', numero: '9', pages: 2, summary: 'Facture hospitalière CHU Bordeaux - total 4 250,00 € TTC.' },
        { name: 'Décompte CPAM', docType: 'pdf', type: 'Décompte', date: '02/04/2023', section: 'II - FRAIS', numero: '10', pages: 1, summary: 'Décompte CPAM - prise en charge des frais.' },
      ],
    },
    piece: { name: 'Facture CHU Bordeaux', docType: 'pdf', type: 'Facture', date: '18/03/2023', section: 'II - FRAIS', numero: '9', pages: 2, summary: 'Facture hospitalière CHU Bordeaux - total 4 250,00 € TTC.' },
  },
];
