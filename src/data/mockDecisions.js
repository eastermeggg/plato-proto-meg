// ─── Mock JP Decisions ────────────────────────────────────────────────
// 15 realistic French decisions following the Decision type spec.
// Each record uses: amounts[] (multi-poste), category, victimProfile, ville, status.

const DECISIONS = [
  // ── ATPT (6) ──────────────────────────────────────────────────────
  {
    id: 'jp-atpt-01',
    numero: '22/10011',
    jurisdiction: 'CA Rennes',
    chambre: '5e Ch.',
    ville: 'Rennes',
    date: '2024-01-10',
    victimProfile: 'Femme, 22 ans',
    category: 'Accident de la circulation',
    status: 'Survivante',
    contentieuxType: 'Plein contentieux',
    amounts: [
      { poste: 'ATPT', label: 'Assistance tierce personne temporaire', value: 28, unit: '€/h', displayValue: '28 €/h' },
    ],
    resume: "La cour retient un taux horaire de 28 €/h pour l'assistance tierce personne temporaire d'une étudiante résidant à Paris intra-muros, compte tenu du coût de la vie en Île-de-France et de la nécessité d'une aide qualifiée pour les actes de la vie quotidienne.",
    themes: [
      { label: 'Indemnisation des victimes', color: 'blue' },
      { label: 'Barème en réparation des dommages causés par des véhicules terrestres à moteur', color: 'purple' },
    ],
    donneesMedicales: {
      consolidation: '16 novembre 2023',
      items: [
        { label: 'Attestation tierce personne', detail: 'Mme Dupont, aide à domicile' },
        { label: 'Expertise Dr. Martin', detail: '12/04/2023 - besoin 4h/jour' },
      ],
    },
    prejudices: {
      temporaires: [
        { label: 'DSA - Dépenses de santé actuelles', montant: 4_280 },
        { label: 'ATPT - Assistance tierce personne temp.', montant: 38_077, highlighted: true },
        { label: 'DFT - Déficit fonctionnel temporaire', montant: 7_200 },
      ],
      permanents: [
        { label: 'DFP - Déficit fonctionnel permanent', montant: 35_250 },
        { label: 'PGPF - Pertes de gains prof. futurs', montant: 148_581 },
      ],
    },
    textSections: [
      { id: 'intro', title: 'Introduction', content: "La cour, statuant sur l'appel interjeté par Mme X..., étudiante domiciliée à Paris (75011), à l'encontre du jugement rendu le 15 mars 2022 par le tribunal judiciaire de Rennes.\n\nLe 16 février 2021, la demanderesse a été victime d'un accident de la circulation impliquant un véhicule en sens inverse conduit par M. Y..., assuré auprès de la société Thélem Assurances. Mme X., 22 ans, étudiante en droit, résidant à Paris intra-muros, a subi un polytraumatisme nécessitant une hospitalisation de 3 semaines." },
      { id: 'litige', title: 'Exposé du litige', content: "La victime sollicite la réformation du jugement de première instance en ce qu'il a fixé le taux horaire de l'assistance tierce personne temporaire à 22 euros, estimant que ce montant est insuffisant au regard du coût de la vie en région parisienne.\n\nElle produit à l'appui de sa demande les attestations de Mme Dupont, aide à domicile, et le rapport d'expertise du Dr. Martin en date du 12 avril 2023, qui évalue le besoin d'assistance à 4 heures par jour pendant 8 mois.\n\nLa société Thélem Assurances conclut à la confirmation du jugement et subsidiairement à la fixation du taux à 24 euros de l'heure." },
      { id: 'motivation', title: 'Motivation', content: "Sur le poste d'assistance tierce personne temporaire :\n\nConsidérant que la victime, étudiante âgée de 22 ans au moment de l'accident, a nécessité une aide quotidienne pour les actes essentiels de la vie courante pendant une période de 8 mois ;\n\nConsidérant le coût de la vie à Paris et la nécessité de recourir à une aide à domicile qualifiée ;\n\nConsidérant les références produites par la demanderesse, et notamment les tarifs pratiqués par les organismes prestataires agréés en Île-de-France ;\n\nLa cour fixe le taux horaire d'indemnisation de l'assistance tierce personne temporaire à 28 euros de l'heure, conformément aux référentiels en vigueur pour la région parisienne.\n\nLe nombre d'heures retenu est de 4 heures par jour, soit 960 heures sur la période de 8 mois. Le montant total alloué au titre de l'ATPT est par conséquent fixé à la somme de 26 880 euros." },
    ],
    fullText: "ARRÊT DE LA COUR D'APPEL DE RENNES\n5e Chambre\nArrêt du 10 janvier 2024\nn° 22/10011\n\nLa cour, statuant sur l'appel interjeté par Mme X..., étudiante domiciliée à Paris (75011), à l'encontre du jugement rendu le 15 mars 2022 par le tribunal judiciaire de Rennes...\n\nSur le poste d'assistance tierce personne temporaire :\n\nConsidérant que la victime, étudiante âgée de 22 ans au moment de l'accident, a nécessité une aide quotidienne pour les actes essentiels de la vie courante pendant une période de 8 mois ;\n\nConsidérant le coût de la vie à Paris et la nécessité de recourir à une aide à domicile qualifiée ;\n\nLa cour fixe le taux horaire d'indemnisation de l'assistance tierce personne temporaire à 28 euros de l'heure, conformément aux référentiels en vigueur pour la région parisienne.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000049012345',
  },
  {
    id: 'jp-atpt-02',
    numero: '21/08842',
    jurisdiction: 'CA Versailles',
    chambre: '3e Ch.',
    ville: 'Versailles',
    date: '2023-09-05',
    victimProfile: 'Homme, 28 ans',
    category: 'Accident de la circulation',
    status: 'Survivant',
    amounts: [
      { poste: 'ATPT', label: 'Assistance tierce personne temporaire', value: 26, unit: '€/h', displayValue: '26 €/h' },
    ],
    resume: "Taux horaire de 26 €/h retenu pour un jeune actif de 28 ans résidant en banlieue de Versailles, en raison d'une aide non spécialisée suffisante pour les besoins identifiés par l'expert.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE VERSAILLES\n3e Chambre\nArrêt du 5 septembre 2023\nn° 21/08842\n\nLa cour retient un taux horaire de 26 euros pour l'assistance tierce personne temporaire. Ce taux est justifié par la localisation en grande couronne et le caractère non spécialisé de l'aide requise.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000048012346',
  },
  {
    id: 'jp-atpt-03',
    numero: '23/01234',
    jurisdiction: 'CA Paris',
    chambre: '4e Ch.',
    ville: 'Paris',
    date: '2024-03-22',
    victimProfile: 'Homme, 68 ans',
    category: 'Accident de la circulation',
    status: 'Survivant',
    amounts: [
      { poste: 'ATPT', label: 'Assistance tierce personne temporaire', value: 27, unit: '€/h', displayValue: '27 €/h' },
    ],
    resume: "Taux de 27 €/h pour un retraité de 68 ans nécessitant une aide partiellement spécialisée suite à un polytraumatisme avec fractures multiples.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE PARIS\n4e Chambre\nArrêt du 22 mars 2024\nn° 23/01234\n\nSur le poste ATPT : La cour fixe le taux horaire à 27 euros compte tenu de l'âge de la victime et de la nature partiellement spécialisée de l'aide requise.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000049234567',
  },
  {
    id: 'jp-atpt-04',
    numero: '22/05567',
    jurisdiction: 'CA Lyon',
    chambre: '1re Ch. civ.',
    ville: 'Lyon',
    date: '2023-11-14',
    victimProfile: 'Femme, 35 ans',
    category: 'Accident de la circulation',
    status: 'Survivante',
    amounts: [
      { poste: 'ATPT', label: 'Assistance tierce personne temporaire', value: 24, unit: '€/h', displayValue: '24 €/h' },
    ],
    resume: "Taux de 24 €/h pour une mère au foyer de 35 ans à Lyon. La cour retient un taux inférieur au barème parisien en raison du coût de la vie moindre en province.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE LYON\n1re Chambre civile\nArrêt du 14 novembre 2023\nn° 22/05567\n\nLa cour fixe l'indemnisation de l'ATPT à 24 euros de l'heure, taux adapté à la région lyonnaise.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000048345678',
  },
  {
    id: 'jp-atpt-05',
    numero: '22/03301',
    jurisdiction: 'CA Aix-en-Provence',
    chambre: '10e Ch.',
    ville: 'Aix-en-Provence',
    date: '2023-06-20',
    victimProfile: 'Homme, 42 ans',
    category: 'Accident du travail',
    status: 'Survivant',
    amounts: [
      { poste: 'ATPT', label: 'Assistance tierce personne temporaire', value: 22, unit: '€/h', displayValue: '22 €/h' },
    ],
    resume: "Taux de 22 €/h pour un artisan résidant en zone rurale du Var. La cour retient le taux plancher du référentiel indicatif pour les zones à faible coût de la vie.",
    fullText: "ARRÊT DE LA COUR D'APPEL D'AIX-EN-PROVENCE\n10e Chambre\nArrêt du 20 juin 2023\nn° 22/03301\n\nLa cour fixe le taux d'ATPT à 22 euros de l'heure.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000047456789',
  },
  {
    id: 'jp-atpt-06',
    numero: '23/02156',
    jurisdiction: 'CA Douai',
    chambre: '3e Ch.',
    ville: 'Douai',
    date: '2024-02-08',
    victimProfile: 'Homme, 45 ans',
    category: 'Accident de la circulation',
    status: 'Survivant',
    amounts: [
      { poste: 'ATPT', label: 'Assistance tierce personne temporaire', value: 25, unit: '€/h', displayValue: '25 €/h' },
    ],
    resume: "Taux de 25 €/h pour un cadre supérieur de 45 ans à Lille. La cour applique un taux intermédiaire tenant compte de la métropole lilloise.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE DOUAI\n3e Chambre\nArrêt du 8 février 2024\nn° 23/02156\n\nLa cour retient un taux de 25 euros de l'heure pour l'ATPT.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000049123456',
  },

  // ── DFT (2) ───────────────────────────────────────────────────────
  {
    id: 'jp-dft-01',
    numero: '22/04489',
    jurisdiction: 'CA Bordeaux',
    chambre: '1re Ch. civ.',
    ville: 'Bordeaux',
    date: '2023-12-12',
    victimProfile: 'Homme, 31 ans',
    category: 'Accident de la route',
    status: 'Survivant',
    amounts: [
      { poste: 'DFT', label: 'Déficit fonctionnel temporaire', value: 30, unit: '€/jour', displayValue: '30 €/jour' },
    ],
    resume: "La cour retient une indemnisation de 30 €/jour pour le déficit fonctionnel temporaire total d'une durée de 3 mois suite à un accident de la route avec hospitalisation prolongée.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE BORDEAUX\n1re Chambre civile\nArrêt du 12 décembre 2023\nn° 22/04489\n\nSur le DFT total : la cour indemnise à hauteur de 30 euros par jour.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000048567890',
  },
  {
    id: 'jp-dft-02',
    numero: '23/03778',
    jurisdiction: 'CA Toulouse',
    chambre: '2e Ch.',
    ville: 'Toulouse',
    date: '2024-04-03',
    victimProfile: 'Femme, 55 ans',
    category: 'Chute domestique',
    status: 'Survivante',
    amounts: [
      { poste: 'DFT', label: 'Déficit fonctionnel temporaire', value: 15, unit: '€/jour', displayValue: '15 €/jour' },
    ],
    resume: "Indemnisation de 15 €/jour pour un DFT partiel à 50% suite à une chute domestique. La cour applique le prorata du taux de DFT total retenu à 30 €/jour.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE TOULOUSE\n2e Chambre\nArrêt du 3 avril 2024\nn° 23/03778\n\nLa cour retient 15 euros par jour pour le DFT partiel à 50%.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000049345678',
  },

  // ── DFP (2) ───────────────────────────────────────────────────────
  {
    id: 'jp-dfp-01',
    numero: '22-15.432',
    jurisdiction: 'Cass. 2e civ.',
    chambre: '',
    ville: 'Paris',
    date: '2023-07-06',
    victimProfile: 'Homme, 32 ans',
    category: 'Accident de la circulation / Polytraumatisme',
    status: 'Survivant',
    amounts: [
      { poste: 'DFP', label: 'Déficit fonctionnel permanent', value: 2350, unit: '€/pt', displayValue: '2 350 €/pt' },
    ],
    resume: "La Cour de cassation confirme une valorisation du point de DFP à 2 350 € pour une victime de 32 ans atteinte d'un déficit de 15%, en tenant compte de l'âge jeune et de l'impact sur la qualité de vie.",
    fullText: "ARRÊT DE LA COUR DE CASSATION\n2e Chambre civile\nArrêt du 6 juillet 2023\nn° 22-15.432\n\nLa Cour confirme le point de DFP à 2 350 euros.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000047890123',
  },
  {
    id: 'jp-dfp-02',
    numero: '22/06691',
    jurisdiction: 'CA Montpellier',
    chambre: '5e Ch. civ.',
    ville: 'Montpellier',
    date: '2024-01-25',
    victimProfile: 'Homme, 58 ans',
    category: 'Accident de la circulation',
    status: 'Survivant',
    amounts: [
      { poste: 'DFP', label: 'Déficit fonctionnel permanent', value: 1850, unit: '€/pt', displayValue: '1 850 €/pt' },
    ],
    resume: "Point de DFP fixé à 1 850 € pour une victime de 58 ans avec un DFP de 25%. Le taux inférieur reflète l'âge plus avancé de la victime conformément au barème indicatif.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE MONTPELLIER\n5e Chambre civile\nArrêt du 25 janvier 2024\nn° 22/06691\n\nLa cour fixe la valeur du point de DFP à 1 850 euros.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000049056789',
  },

  // ── PGPA (2) ──────────────────────────────────────────────────────
  {
    id: 'jp-pgpa-01',
    numero: '22/09012',
    jurisdiction: 'CA Paris',
    chambre: '2e Ch.',
    ville: 'Paris',
    date: '2023-10-18',
    victimProfile: 'Homme, 40 ans',
    category: 'Accident de la circulation',
    status: 'Survivant',
    amounts: [
      { poste: 'PGPA', label: 'Pertes de gains professionnels actuels', value: 42350, unit: '€', displayValue: '42 350 €' },
    ],
    resume: "Perte de gains professionnels actuels fixée à 42 350 € pour un cadre salarié ayant subi 8 mois d'arrêt de travail. La cour retient le différentiel entre le salaire net et les indemnités journalières perçues.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE PARIS\n2e Chambre\nArrêt du 18 octobre 2023\nn° 22/09012\n\nLa cour fixe la PGPA à 42 350 euros.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000048234567',
  },
  {
    id: 'jp-pgpa-02',
    numero: '23/00445',
    jurisdiction: 'CA Nîmes',
    chambre: '1re Ch. civ.',
    ville: 'Nîmes',
    date: '2024-02-14',
    victimProfile: 'Homme, 47 ans',
    category: 'Accident du travail',
    status: 'Survivant',
    amounts: [
      { poste: 'PGPA', label: 'Pertes de gains professionnels actuels', value: 28900, unit: '€', displayValue: '28 900 €' },
    ],
    resume: "PGPA de 28 900 € pour un travailleur indépendant dont l'activité a été réduite pendant 12 mois. La cour évalue la perte sur la base des déclarations fiscales des 3 années précédant l'accident.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE NÎMES\n1re Chambre civile\nArrêt du 14 février 2024\nn° 23/00445\n\nLa cour retient une PGPA de 28 900 euros.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000049167890',
  },

  // ── SE (3) ────────────────────────────────────────────────────────
  {
    id: 'jp-se-01',
    numero: '21/15678',
    jurisdiction: 'CA Paris',
    chambre: '4e Ch.',
    ville: 'Paris',
    date: '2023-05-11',
    victimProfile: 'Femme, 29 ans',
    category: 'Accident de la circulation / Polytraumatisme',
    status: 'Survivante',
    amounts: [
      { poste: 'SE', label: 'Souffrances endurées', value: 38000, unit: '€', displayValue: '38 000 €' },
    ],
    resume: "Souffrances endurées cotées 5/7 indemnisées à 38 000 € pour un polytraumatisme avec multiples interventions chirurgicales et rééducation prolongée.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE PARIS\n4e Chambre\nArrêt du 11 mai 2023\nn° 21/15678\n\nLa cour fixe l'indemnisation des souffrances endurées à 38 000 euros pour une cotation de 5/7.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000047567890',
  },
  {
    id: 'jp-se-02',
    numero: '22/07890',
    jurisdiction: 'CA Rennes',
    chambre: '5e Ch.',
    ville: 'Rennes',
    date: '2023-09-28',
    victimProfile: 'Homme, 51 ans',
    category: 'Chute sur la voie publique',
    status: 'Survivant',
    amounts: [
      { poste: 'SE', label: 'Souffrances endurées', value: 22500, unit: '€', displayValue: '22 500 €' },
    ],
    resume: "Souffrances endurées cotées 4/7 indemnisées à 22 500 € pour une fracture du fémur avec ostéosynthèse et ablation de matériel.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE RENNES\n5e Chambre\nArrêt du 28 septembre 2023\nn° 22/07890\n\nLa cour indemnise les souffrances endurées à hauteur de 22 500 euros.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000048123456',
  },
  {
    id: 'jp-se-03',
    numero: '23/04567',
    jurisdiction: 'CA Douai',
    chambre: '3e Ch.',
    ville: 'Douai',
    date: '2024-03-07',
    victimProfile: 'Homme, 19 ans',
    category: 'Accident médical / Traumatisme crânien',
    status: 'Décédé',
    amounts: [
      { poste: 'SE', label: 'Souffrances endurées', value: 55000, unit: '€', displayValue: '55 000 €' },
    ],
    resume: "Souffrances endurées cotées 6/7 indemnisées à 55 000 € pour un traumatisme crânien grave avec coma prolongé, multiples interventions et séquelles cognitives.",
    fullText: "ARRÊT DE LA COUR D'APPEL DE DOUAI\n3e Chambre\nArrêt du 7 mars 2024\nn° 23/04567\n\nLa cour retient une indemnisation de 55 000 euros pour les souffrances endurées cotées 6/7.",
    legifranceUrl: 'https://www.legifrance.gouv.fr/juri/id/JURITEXT000049278901',
  },
];

// Splits "28 €/h", "2 350 €/pt", "42 350 €" → { num, unit }.
export const splitValue = (display) => {
  if (!display) return { num: '—', unit: '' };
  const m = String(display).match(/^([\d\s ,.]+?)\s+([^0-9]+)$/);
  return m ? { num: m[1].trim(), unit: m[2].trim() } : { num: display, unit: '' };
};

// ─── Helpers ──────────────────────────────────────────────────────────

/** Get the primary (first) amount of a decision */
export const getPrimaryAmount = (d) => d.amounts?.[0] || null;

export const getDecisionById = (id) => DECISIONS.find(d => d.id === id) || null;

export const getDecisionsByPoste = (poste) =>
  DECISIONS.filter(d => d.amounts.some(a => a.poste.toLowerCase() === poste.toLowerCase()));

export const getDecisionsByIds = (ids) => ids.map(id => getDecisionById(id)).filter(Boolean);

export const formatDateShort = (isoDate) => {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y.slice(2)}`;
};

export const formatDateLong = (isoDate) => {
  const [y, m, d] = isoDate.split('-');
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
};

export const getStats = (decisions) => {
  if (!decisions.length) return null;
  const values = decisions.map(d => getPrimaryAmount(d)?.value).filter(v => v != null).sort((a, b) => a - b);
  if (!values.length) return null;
  const min = values[0];
  const max = values[values.length - 1];
  const mid = Math.floor(values.length / 2);
  const mediane = values.length % 2 ? values[mid] : Math.round((values[mid - 1] + values[mid]) / 2);
  const unit = getPrimaryAmount(decisions[0])?.unit || '€';
  const fmt = (v) => v.toLocaleString('fr-FR');
  return {
    mediane: `${fmt(mediane)} ${unit}`,
    fourchette: `${fmt(min)}–${fmt(max)} ${unit}`,
    count: decisions.length,
  };
};

export default DECISIONS;
