// ─── Redaction Scenarios — Legal Document Drafting ─────────────────────
// Scripted demo flows for the /redaction slash command.
// Pattern mirrors demoScenarios.js: action arrays dispatched with delays.

import { Scale, FileText, Mail, MessageSquare, Gavel, Handshake, StickyNote } from 'lucide-react';

// ── Act types (v1) ──────────────────────────────────────────────────
export const REDACTION_ACT_TYPES = [
  {
    id: 'assignation',
    label: 'Assignation',
    description: 'Acte introductif d\'instance devant le tribunal',
    Icon: Scale,
    fields: [
      { id: 'tribunal', label: 'Tribunal compétent', placeholder: 'Ex: Tribunal judiciaire de Paris' },
      { id: 'partie_adverse', label: 'Partie adverse', placeholder: 'Ex: Mme Martin, née le 12/03/1985' },
      { id: 'objet', label: 'Objet de la demande', placeholder: 'Ex: Indemnisation du préjudice corporel suite à un accident de la route' },
    ],
  },
  {
    id: 'conclusions',
    label: 'Conclusions',
    description: 'Conclusions récapitulatives pour une audience',
    Icon: FileText,
    fields: [
      { id: 'audience', label: 'Date d\'audience', placeholder: 'Ex: 15/06/2026' },
      { id: 'arguments_adverses', label: 'Arguments adverses à contrer', placeholder: 'Ex: Contestation du lien de causalité, minoration du DFP' },
    ],
  },
  {
    id: 'email',
    label: 'Courrier',
    description: 'Email de relance assureur ou mise en demeure',
    Icon: Mail,
    fields: [
      { id: 'destinataire', label: 'Destinataire', placeholder: 'Ex: AXA France — Service sinistres corporels' },
      { id: 'ton', label: 'Ton souhaité', placeholder: 'Ex: Formel et ferme' },
      { id: 'objet', label: 'Objet', placeholder: 'Ex: Relance offre d\'indemnisation — dossier n°2024-1234' },
    ],
  },
  {
    id: 'dire',
    label: 'Dire à expert',
    description: 'Observations adressées à l\'expert judiciaire',
    Icon: MessageSquare,
    fields: [
      { id: 'expert', label: 'Nom de l\'expert', placeholder: 'Ex: Dr. Durand, expert orthopédiste' },
      { id: 'points', label: 'Points à soulever', placeholder: 'Ex: Sous-évaluation du DFP, absence de prise en compte du retentissement professionnel' },
    ],
  },
  {
    id: 'requete',
    label: 'Requête en référé',
    description: 'Requête en référé-expertise devant le tribunal',
    Icon: Gavel,
    fields: [
      { id: 'tribunal', label: 'Tribunal compétent', placeholder: 'Ex: Tribunal judiciaire de Lyon' },
      { id: 'urgence', label: 'Justification de l\'urgence', placeholder: 'Ex: Risque de dépérissement des preuves médicales' },
    ],
  },
  {
    id: 'protocole',
    label: 'Protocole transactionnel',
    description: 'Accord amiable d\'indemnisation',
    Icon: Handshake,
    fields: [
      { id: 'parties', label: 'Parties au protocole', placeholder: 'Ex: M. Dupont / AXA France' },
      { id: 'montant', label: 'Montant transactionnel', placeholder: 'Ex: 185 000 €' },
    ],
  },
  {
    id: 'note-delibere',
    label: 'Note en délibéré',
    description: 'Note complémentaire après clôture des débats',
    Icon: StickyNote,
    fields: [
      { id: 'audience', label: 'Date de l\'audience', placeholder: 'Ex: 03/04/2026' },
      { id: 'points', label: 'Points à compléter', placeholder: 'Ex: Production d\'une pièce nouvelle, réponse à un moyen soulevé d\'office' },
    ],
  },
];

// ── ACTE shape ──────────────────────────────────────────────────────
// kind = 'text' (prose) | 'bordereau' (numbered list of pièces communiquées)
// pairId links a text acte to its bordereau (same id on both, null when standalone)
// bordereauEntries = [{ pieceId, intitule, position }] — only when kind === 'bordereau'
export const EMPTY_ACTE = {
  id: '',
  actType: '',
  title: '',
  status: 'brouillon', // brouillon | pret | envoye
  lastUpdated: '',
  content: '',
  kind: 'text',
  pairId: null,
  bordereauEntries: null,
};

// ── Mock content for assignation ────────────────────────────────────
export const MOCK_ASSIGNATION_TEXT = `ASSIGNATION EN RÉFÉRÉ-EXPERTISE

DEVANT LE TRIBUNAL JUDICIAIRE DE PARIS

L'AN DEUX MILLE VINGT-SIX ET LE VINGT-QUATRE AVRIL

À LA REQUÊTE DE :

Monsieur Jean DUPONT, né le 15 mars 1982 à Lyon (69003), de nationalité française, demeurant au 42 rue des Lilas, 75011 Paris,

Ayant pour avocat : Maître Sophie BERNARD, Avocat au Barreau de Paris, AARPI BERNARD & ASSOCIÉS, 18 avenue de l'Opéra, 75001 Paris, Toque C0742

J'AI, Maître Pierre LEGRAND, Commissaire de Justice associé, titulaire d'un office situé au 5 rue du Faubourg Saint-Honoré, 75008 Paris,

DONNÉ ASSIGNATION À :

Madame Claire MARTIN, née le 12 mars 1985 à Bordeaux (33000), demeurant au 15 boulevard Haussmann, 75009 Paris,

À COMPARAÎTRE le [DATE D'AUDIENCE] à [HEURE] heures devant le Tribunal judiciaire de Paris, [CHAMBRE], siégeant en référé, sis au Palais de Justice, 1 boulevard du Palais, 75001 Paris,

ET LUI AI DÉCLARÉ CE QUI SUIT :

——————————————————————

I. EXPOSÉ DES FAITS

Le 14 septembre 2024, Monsieur DUPONT a été victime d'un accident de la circulation survenu à l'intersection de la rue de Rivoli et du boulevard de Sébastopol, à Paris (4ème arrondissement).

Alors que Monsieur DUPONT circulait à pied sur le passage protégé, le feu de signalisation étant au vert pour les piétons, le véhicule conduit par Madame MARTIN, un SUV Peugeot 3008 immatriculé AB-123-CD, a effectué un virage à droite sans marquer l'arrêt au feu rouge et a percuté violemment le requérant.

L'accident a été constaté par les services de police (main courante n° 2024/09/14-3847) [pièce:8:Compte-rendu passage urgences:15/03/2023]. Les témoignages recueillis sur place confirment la responsabilité exclusive de Madame MARTIN.

Monsieur DUPONT a été immédiatement transporté par les services du SAMU à l'hôpital de la Pitié-Salpêtrière, où ont été diagnostiqués [pièce:1:Facture hospitalisation CHU Bordeaux:15/03/2023] :
- Une fracture du plateau tibial droit (type Schatzker IV)
- Une entorse grave du ligament croisé antérieur du genou droit
- Un traumatisme crânien léger avec perte de connaissance initiale
- De multiples contusions et excoriations

II. PRÉJUDICE CORPOREL — ÉTAT ACTUEL

Depuis l'accident, Monsieur DUPONT a subi :

1. Trois interventions chirurgicales (ostéosynthèse le 15/09/2024, ablation de matériel le 12/03/2025, ligamentoplastie le 18/06/2025) [pièce:12:Facture IRM Centre Imagerie Sud:25/06/2023]
2. Huit mois de rééducation intensive en centre spécialisé [pièce:2:Factures kinésithérapie Cabinet Martin:01/04/2023]
3. Un arrêt de travail total de quatorze mois [pièce:10:Avis d'arrêt de travail initial:16/03/2023]

À ce jour, l'état de santé de Monsieur DUPONT n'est pas consolidé. Il conserve des douleurs persistantes au genou droit, une limitation de la flexion à 100° et une boiterie à la marche prolongée [pièce:5:Rapport d'expertise:12/09/2024].

Sa reprise professionnelle en tant qu'ingénieur informatique s'effectue à mi-temps thérapeutique depuis le 1er décembre 2025, entraînant une perte de revenus significative [pièce:3:Bulletins de salaire année 2022:10/01/2023] [pièce:11:Attestation de salaire employeur:20/03/2023].

III. NÉCESSITÉ D'UNE EXPERTISE MÉDICALE

Conformément aux articles 145 et 232 du Code de procédure civile, il est indispensable qu'une mesure d'expertise médicale soit ordonnée avant tout procès afin d'établir de manière contradictoire :

- La description des lésions initiales et de leur évolution
- La durée de l'incapacité temporaire totale et partielle
- La date de consolidation
- Le taux de déficit fonctionnel permanent
- L'existence et l'évaluation des souffrances endurées
- Le préjudice esthétique temporaire et permanent
- Le retentissement sur les activités professionnelles et personnelles
- La nécessité d'une aide humaine et d'aménagements du logement
- Les préjudices futurs prévisibles et les besoins en soins futurs

IV. DEMANDES

PAR CES MOTIFS, et sous toutes réserves,

Il est demandé au Président du Tribunal judiciaire de Paris, statuant en référé :

1° D'ORDONNER une expertise médicale et de désigner tel expert qu'il plaira au tribunal, avec pour mission celle définie par la nomenclature Dintilhac ;

2° DE DIRE que l'expert devra déposer son rapport dans un délai de six mois à compter de sa saisine ;

3° DE FIXER la provision à valoir sur les frais d'expertise à la somme de 2 500 euros, à la charge de Madame MARTIN ;

4° D'ALLOUER à Monsieur DUPONT une provision de 15 000 euros à valoir sur l'indemnisation de son préjudice corporel, au regard de l'évidence de la créance ;

5° DE CONDAMNER Madame MARTIN aux entiers dépens de la présente instance ;

6° DE CONDAMNER Madame MARTIN à payer à Monsieur DUPONT la somme de 3 000 euros au titre de l'article 700 du Code de procédure civile.

SOUS TOUTES RÉSERVES

Fait et signé à Paris, le 24 avril 2026.

Le Commissaire de Justice,
Maître Pierre LEGRAND`;

export const MOCK_ASSIGNATION_BORDEREAU_ENTRIES = [
  { kind: 'section', name: 'Médical' },
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023', description: 'CHU Pitié-Salpêtrière — diagnostic initial' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024', description: 'Dr. Martin — expertise contradictoire' },
  { kind: 'piece', pieceId: 'p-6', intitule: 'Ordonnance médicaments juillet', type: 'Ordonnance', date: '18/07/2023' },
  { kind: 'section', name: 'Frais médicaux' },
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-2', intitule: 'Factures kinésithérapie Cabinet Martin', type: 'Facture', date: '01/04/2023' },
  { kind: 'piece', pieceId: 'p-7', intitule: 'Facture pharmacie des Lilas', type: 'Facture', date: '20/07/2023' },
  { kind: 'piece', pieceId: 'p-12', intitule: 'Facture IRM Centre Imagerie Sud', type: 'Facture', date: '25/06/2023' },
  { kind: 'section', name: 'Pertes de revenus' },
  { kind: 'piece', pieceId: 'p-3', intitule: 'Bulletins de salaire année 2022', type: 'Bulletin', date: '10/01/2023' },
  { kind: 'piece', pieceId: 'p-11', intitule: 'Attestation de salaire employeur', type: 'Attestation', date: '20/03/2023' },
  { kind: 'piece', pieceId: 'p-10', intitule: "Avis d'arrêt de travail initial", type: 'Attestation', date: '16/03/2023' },
  { kind: 'piece', pieceId: 'p-4', intitule: 'Attestation de versement IJ CPAM', type: 'Attestation', date: '20/05/2023' },
];

// ── Modified content for assignation (after user requests changes) ──
export const MOCK_ASSIGNATION_MODIFIED_TEXT = `ASSIGNATION EN RÉFÉRÉ-EXPERTISE

DEVANT LE TRIBUNAL JUDICIAIRE DE PARIS

L'AN DEUX MILLE VINGT-SIX ET LE VINGT-QUATRE AVRIL

À LA REQUÊTE DE :

Monsieur Jean DUPONT, né le 15 mars 1982 à Lyon (69003), de nationalité française, demeurant au 42 rue des Lilas, 75011 Paris,

Ayant pour avocat : Maître Sophie BERNARD, Avocat au Barreau de Paris, AARPI BERNARD & ASSOCIÉS, 18 avenue de l'Opéra, 75001 Paris, Toque C0742

J'AI, Maître Pierre LEGRAND, Commissaire de Justice associé, titulaire d'un office situé au 5 rue du Faubourg Saint-Honoré, 75008 Paris,

DONNÉ ASSIGNATION À :

Madame Claire MARTIN, née le 12 mars 1985 à Bordeaux (33000), demeurant au 15 boulevard Haussmann, 75009 Paris,

Prise en sa qualité d'auteur du dommage, civilement responsable au sens de l'article 1240 du Code civil,

ET À :

La société AXA FRANCE IARD, SA au capital de 214 799 030 euros, immatriculée au RCS de Nanterre sous le n° 722 057 460, dont le siège social est situé au 313 Terrasses de l'Arche, 92727 Nanterre Cedex, prise en sa qualité d'assureur de responsabilité civile de Madame MARTIN,

À COMPARAÎTRE le [DATE D'AUDIENCE] à [HEURE] heures devant le Tribunal judiciaire de Paris, [CHAMBRE], siégeant en référé, sis au Palais de Justice, 1 boulevard du Palais, 75001 Paris,

ET LEUR AI DÉCLARÉ CE QUI SUIT :

——————————————————————

I. EXPOSÉ DES FAITS

Le 14 septembre 2024, Monsieur DUPONT a été victime d'un accident de la circulation survenu à l'intersection de la rue de Rivoli et du boulevard de Sébastopol, à Paris (4ème arrondissement).

Alors que Monsieur DUPONT circulait à pied sur le passage protégé, le feu de signalisation étant au vert pour les piétons, le véhicule conduit par Madame MARTIN, un SUV Peugeot 3008 immatriculé AB-123-CD, a effectué un virage à droite sans marquer l'arrêt au feu rouge et a percuté violemment le requérant.

L'accident a été constaté par les services de police (main courante n° 2024/09/14-3847) [pièce:8:Compte-rendu passage urgences:15/03/2023]. Les témoignages recueillis sur place confirment la responsabilité exclusive de Madame MARTIN. Le procès-verbal d'infraction n° 2024/09/14-PV-1182 relève une contravention de franchissement de feu rouge (article R412-30 du Code de la route).

Monsieur DUPONT a été immédiatement transporté par les services du SAMU à l'hôpital de la Pitié-Salpêtrière, où ont été diagnostiqués [pièce:1:Facture hospitalisation CHU Bordeaux:15/03/2023] :
- Une fracture du plateau tibial droit (type Schatzker IV)
- Une entorse grave du ligament croisé antérieur du genou droit
- Un traumatisme crânien léger avec perte de connaissance initiale
- De multiples contusions et excoriations
- Un syndrome de stress post-traumatique diagnostiqué le 20/10/2024

II. PRÉJUDICE CORPOREL — ÉTAT ACTUEL

Depuis l'accident, Monsieur DUPONT a subi :

1. Trois interventions chirurgicales (ostéosynthèse le 15/09/2024, ablation de matériel le 12/03/2025, ligamentoplastie le 18/06/2025) [pièce:12:Facture IRM Centre Imagerie Sud:25/06/2023]
2. Huit mois de rééducation intensive en centre spécialisé [pièce:2:Factures kinésithérapie Cabinet Martin:01/04/2023]
3. Un arrêt de travail total de quatorze mois [pièce:10:Avis d'arrêt de travail initial:16/03/2023]
4. Un suivi psychologique hebdomadaire depuis le 20/10/2024

À ce jour, l'état de santé de Monsieur DUPONT n'est pas consolidé. Il conserve des douleurs persistantes au genou droit, une limitation de la flexion à 100° et une boiterie à la marche prolongée. Le syndrome anxio-dépressif réactionnel persiste et nécessite un traitement médicamenteux quotidien [pièce:5:Rapport d'expertise:12/09/2024].

Sa reprise professionnelle en tant qu'ingénieur informatique s'effectue à mi-temps thérapeutique depuis le 1er décembre 2025, entraînant une perte de revenus significative [pièce:3:Bulletins de salaire année 2022:10/01/2023] [pièce:11:Attestation de salaire employeur:20/03/2023].

III. NÉCESSITÉ D'UNE EXPERTISE MÉDICALE

Conformément aux articles 145 et 232 du Code de procédure civile, il est indispensable qu'une mesure d'expertise médicale soit ordonnée avant tout procès afin d'établir de manière contradictoire :

- La description des lésions initiales et de leur évolution
- La durée de l'incapacité temporaire totale et partielle
- La date de consolidation
- Le taux de déficit fonctionnel permanent
- L'existence et l'évaluation des souffrances endurées
- Le préjudice esthétique temporaire et permanent
- Le retentissement sur les activités professionnelles et personnelles
- La nécessité d'une aide humaine et d'aménagements du logement
- Les préjudices futurs prévisibles et les besoins en soins futurs
- Le retentissement psychologique et la nécessité d'un suivi spécialisé

IV. DEMANDES

PAR CES MOTIFS, et sous toutes réserves,

Il est demandé au Président du Tribunal judiciaire de Paris, statuant en référé :

1° D'ORDONNER une expertise médicale confiée à un expert orthopédiste et un sapiteur psychiatre, avec pour mission celle définie par la nomenclature Dintilhac ;

2° DE DIRE que l'expert devra déposer son rapport dans un délai de six mois à compter de sa saisine ;

3° DE FIXER la provision à valoir sur les frais d'expertise à la somme de 4 000 euros, à la charge solidaire de Madame MARTIN et de la société AXA FRANCE IARD ;

4° D'ALLOUER à Monsieur DUPONT une provision de 25 000 euros à valoir sur l'indemnisation de son préjudice corporel, au regard de l'évidence de la créance et de la gravité des lésions ;

5° DE CONDAMNER solidairement Madame MARTIN et la société AXA FRANCE IARD aux entiers dépens de la présente instance ;

6° DE CONDAMNER solidairement Madame MARTIN et la société AXA FRANCE IARD à payer à Monsieur DUPONT la somme de 4 000 euros au titre de l'article 700 du Code de procédure civile ;

7° DE DÉCLARER l'ordonnance à intervenir commune à la CPAM de Paris et à l'organisme AG2R La Mondiale, en leur qualité de tiers payeurs.

SOUS TOUTES RÉSERVES

Fait et signé à Paris, le 24 avril 2026.

Le Commissaire de Justice,
Maître Pierre LEGRAND`;

export const MOCK_ASSIGNATION_MODIFIED_BORDEREAU_ENTRIES = [
  { kind: 'section', name: 'Médical' },
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
  { kind: 'piece', pieceId: 'p-6', intitule: 'Ordonnance médicaments juillet', type: 'Ordonnance', date: '18/07/2023' },
  { kind: 'section', name: 'Frais médicaux' },
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-2', intitule: 'Factures kinésithérapie Cabinet Martin', type: 'Facture', date: '01/04/2023' },
  { kind: 'piece', pieceId: 'p-7', intitule: 'Facture pharmacie des Lilas', type: 'Facture', date: '20/07/2023' },
  { kind: 'piece', pieceId: 'p-12', intitule: 'Facture IRM Centre Imagerie Sud', type: 'Facture', date: '25/06/2023' },
  { kind: 'section', name: 'Pertes de revenus' },
  { kind: 'piece', pieceId: 'p-3', intitule: 'Bulletins de salaire année 2022', type: 'Bulletin', date: '10/01/2023' },
  { kind: 'piece', pieceId: 'p-11', intitule: 'Attestation de salaire employeur', type: 'Attestation', date: '20/03/2023' },
  { kind: 'piece', pieceId: 'p-10', intitule: "Avis d'arrêt de travail initial", type: 'Attestation', date: '16/03/2023' },
  { kind: 'piece', pieceId: 'p-4', intitule: 'Attestation de versement IJ CPAM', type: 'Attestation', date: '20/05/2023' },
  { kind: 'piece', pieceId: 'p-13', intitule: 'Décompte indemnités prévoyance AG2R', type: 'Décompte', date: '15/08/2023' },
];

// ── Mock content for conclusions ────────────────────────────────────
export const MOCK_CONCLUSIONS_TEXT = `CONCLUSIONS RÉCAPITULATIVES

DEVANT LE TRIBUNAL JUDICIAIRE DE PARIS

POUR : Monsieur Jean DUPONT, né le 15 mars 1982 à Lyon (69003), demeurant au 42 rue des Lilas, 75011 Paris

Ayant pour avocat : Maître Sophie BERNARD, Avocat au Barreau de Paris, AARPI BERNARD & ASSOCIÉS, 18 avenue de l'Opéra, 75001 Paris, Toque C0742

Demandeur,

CONTRE : Madame Claire MARTIN, née le 12 mars 1985 à Bordeaux (33000), demeurant au 15 boulevard Haussmann, 75009 Paris

ET : La société AXA FRANCE IARD, SA, dont le siège social est situé au 313 Terrasses de l'Arche, 92727 Nanterre Cedex

Défendeurs.

——————————————————————

PLAISE AU TRIBUNAL,

I. RAPPEL DE LA PROCÉDURE

Par acte du 24 avril 2026, Monsieur DUPONT a fait assigner Madame MARTIN et la société AXA FRANCE IARD devant le Tribunal judiciaire de Paris, statuant en référé, aux fins d'obtenir une mesure d'expertise médicale et une provision [pièce:8:Compte-rendu passage urgences:15/03/2023].

Par ordonnance du 15 juin 2026, le juge des référés a fait droit à la demande et désigné le Docteur DURAND en qualité d'expert.

L'expert a déposé son rapport définitif le 12 septembre 2024 [pièce:5:Rapport d'expertise:12/09/2024].

II. DISCUSSION SUR LA RESPONSABILITÉ

La responsabilité exclusive de Madame MARTIN ne fait aucun doute. Le procès-verbal de police confirme le franchissement d'un feu rouge par la défenderesse.

Les défendeurs ne contestent d'ailleurs pas le principe de responsabilité mais cherchent à minorer l'étendue du préjudice.

III. DISCUSSION SUR LE PRÉJUDICE — LIQUIDATION POSTE PAR POSTE

A. Dépenses de santé actuelles (DSA)

Les dépenses de santé actuelles s'élèvent à la somme totale de 12 847,50 € [pièce:1:Facture hospitalisation CHU Bordeaux:15/03/2023] [pièce:2:Factures kinésithérapie Cabinet Martin:01/04/2023] [pièce:12:Facture IRM Centre Imagerie Sud:25/06/2023].

Après déduction des prestations versées par la CPAM [pièce:4:Attestation de versement IJ CPAM:20/05/2023], le reste à charge de la victime s'élève à 3 421,80 €.

B. Perte de gains professionnels actuels (PGPA)

Monsieur DUPONT justifie de revenus annuels de 48 000 € [pièce:3:Bulletins de salaire année 2022:10/01/2023] [pièce:11:Attestation de salaire employeur:20/03/2023].

La perte de gains sur la période d'arrêt de travail (14 mois) s'établit à 56 000 €, calculée selon la méthode du différentiel salaire net / indemnités journalières retenue par la jurisprudence [jp:jp-pgpa-01], sous déduction des indemnités journalières CPAM et des indemnités complémentaires AG2R [pièce:13:Décompte indemnités prévoyance AG2R:15/08/2023].

Reste à charge : 18 340 €.

C. Déficit fonctionnel temporaire (DFT)

Sur la base de 33 € par jour de DFT total, conformément à la jurisprudence récente des cours d'appel [jp:jp-dft-01], le DFT s'établit comme suit :
- DFT total (15/03/2023 au 15/09/2023) : 184 jours × 33 € = 6 072 €
- DFT partiel 50% (16/09/2023 au 12/09/2024) : 362 jours × 16,50 € = 5 973 € — prorata du taux total constamment admis [jp:jp-dft-02]

Total DFT : 12 045 €.

D. Souffrances endurées (SE)

Cotées à 4/7 par l'expert, les souffrances endurées justifient une indemnisation de 28 000 €. Cette évaluation s'inscrit dans la fourchette des décisions récentes pour une cotation équivalente [jp:jp-se-02], étant relevé qu'une cotation de 5/7 ouvre droit à des montants supérieurs [jp:jp-se-01].

IV. DISPOSITIF

PAR CES MOTIFS, et sous toutes réserves,

Monsieur Jean DUPONT demande au Tribunal de :

1° DÉCLARER Madame MARTIN entièrement responsable des conséquences dommageables de l'accident du 14 septembre 2024 ;

2° CONDAMNER solidairement Madame MARTIN et AXA FRANCE IARD à payer :
- DSA (reste à charge) : 3 421,80 €
- PGPA (reste à charge) : 18 340 €
- DFT : 12 045 €
- Souffrances endurées : 28 000 €

3° CONDAMNER solidairement les défendeurs aux entiers dépens et au paiement de 5 000 € au titre de l'article 700 du CPC.

SOUS TOUTES RÉSERVES

Fait à Paris, le 27 avril 2026.

Maître Sophie BERNARD`;

export const MOCK_CONCLUSIONS_BORDEREAU_ENTRIES = [
  { kind: 'section', name: 'Médical' },
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
  { kind: 'section', name: 'Frais médicaux' },
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-2', intitule: 'Factures kinésithérapie Cabinet Martin', type: 'Facture', date: '01/04/2023' },
  { kind: 'piece', pieceId: 'p-12', intitule: 'Facture IRM Centre Imagerie Sud', type: 'Facture', date: '25/06/2023' },
  { kind: 'section', name: 'Pertes de revenus' },
  { kind: 'piece', pieceId: 'p-3', intitule: 'Bulletins de salaire année 2022', type: 'Bulletin', date: '10/01/2023' },
  { kind: 'piece', pieceId: 'p-11', intitule: 'Attestation de salaire employeur', type: 'Attestation', date: '20/03/2023' },
  { kind: 'piece', pieceId: 'p-4', intitule: 'Attestation de versement IJ CPAM', type: 'Attestation', date: '20/05/2023' },
  { kind: 'piece', pieceId: 'p-13', intitule: 'Décompte indemnités prévoyance AG2R', type: 'Décompte', date: '15/08/2023' },
];

// ── Mock content for requête en référé ─────────────────────────────
export const MOCK_REQUETE_TEXT = `REQUÊTE EN RÉFÉRÉ-EXPERTISE

DEVANT LE PRÉSIDENT DU TRIBUNAL JUDICIAIRE DE PARIS

Monsieur le Président,

Monsieur Jean DUPONT, né le 15 mars 1982 à Lyon, demeurant au 42 rue des Lilas, 75011 Paris, ayant pour avocat Maître Sophie BERNARD (Toque C0742),

a l'honneur de vous exposer :

——————————————————————

I. OBJET DE LA REQUÊTE

La présente requête a pour objet de voir ordonner une mesure d'expertise médicale judiciaire, conformément aux articles 145 et 232 du Code de procédure civile, afin d'évaluer le préjudice corporel subi par le requérant.

II. EXPOSÉ DES FAITS

Le 14 septembre 2024, Monsieur DUPONT a été victime d'un accident de la circulation à Paris [pièce:8:Compte-rendu passage urgences:15/03/2023]. Il a été hospitalisé en urgence [pièce:1:Facture hospitalisation CHU Bordeaux:15/03/2023] et a subi trois interventions chirurgicales.

À ce jour, l'état de santé du requérant n'est pas consolidé [pièce:5:Rapport d'expertise:12/09/2024].

III. JUSTIFICATION DE L'URGENCE

Il existe un motif légitime de conserver ou d'établir avant tout procès la preuve des faits dont pourrait dépendre la solution du litige. L'état de santé du requérant évoluant, il est impératif de fixer l'étendue des préjudices dans un cadre contradictoire.

IV. DEMANDES

Le requérant sollicite de Monsieur le Président :

1° D'ORDONNER une expertise médicale ;

2° DE DÉSIGNER tel expert qu'il plaira avec pour mission la nomenclature Dintilhac ;

3° DE FIXER la provision sur frais d'expertise à 2 500 €.

Fait à Paris, le 27 avril 2026.

Maître Sophie BERNARD`;

export const MOCK_REQUETE_BORDEREAU_ENTRIES = [
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023' },
];

// ── Mock content for dire à expert ─────────────────────────────────
export const MOCK_DIRE_TEXT = `DIRE À EXPERT

Docteur Philippe DURAND
Expert judiciaire
25 avenue de Wagram, 75017 Paris

Paris, le 27 avril 2026

Objet : Dossier DUPONT Jean — Expertise n° 2026/EXP/1847
Nos références : Cabinet BERNARD — Dossier 2024-3892

Docteur,

Faisant suite à votre rapport préliminaire du 15 mars 2026, nous avons l'honneur de vous adresser les présentes observations au nom de Monsieur Jean DUPONT, notre client.

——————————————————————

I. OBSERVATIONS SUR LE TAUX DE DFP

Votre rapport préliminaire retient un taux de déficit fonctionnel permanent de 8%. Cette évaluation nous paraît sous-estimée au regard des séquelles constatées [pièce:5:Rapport d'expertise:12/09/2024].

En effet, Monsieur DUPONT conserve :
- Une limitation de flexion du genou droit à 100° (contre 140° en moyenne)
- Une boiterie permanente à la marche prolongée
- Des douleurs chroniques nécessitant un traitement antalgique quotidien [pièce:6:Ordonnance médicaments juillet:18/07/2023]

La littérature médicale (Barème indicatif des déficits fonctionnels séquellaires en droit commun, Concours Médical) retient pour une raideur du genou avec limitation significative un taux de 12 à 15%. La jurisprudence valorise par ailleurs le point de DFP à 2 350 € pour une victime jeune dans une situation comparable [jp:jp-dfp-01], ce qui rend l'écart entre 8% et 12% particulièrement significatif sur le montant final.

Nous sollicitons la réévaluation du taux de DFP à 12%.

II. RETENTISSEMENT PROFESSIONNEL

Le rapport ne mentionne pas le retentissement professionnel des séquelles. Or, Monsieur DUPONT, ingénieur informatique, est contraint à un mi-temps thérapeutique depuis le 1er décembre 2025 [pièce:3:Bulletins de salaire année 2022:10/01/2023] [pièce:11:Attestation de salaire employeur:20/03/2023].

Nous vous prions de bien vouloir compléter votre rapport sur ce point.

III. DEMANDE D'INVESTIGATIONS COMPLÉMENTAIRES

Nous sollicitons :
- Un examen IRM de contrôle du genou droit [pièce:12:Facture IRM Centre Imagerie Sud:25/06/2023]
- Une évaluation neuropsychologique au regard du traumatisme crânien initial

Nous vous prions d'agréer, Docteur, l'expression de nos salutations distinguées.

Maître Sophie BERNARD`;

export const MOCK_DIRE_BORDEREAU_ENTRIES = [
  { kind: 'piece', pieceId: 'p-3', intitule: 'Bulletins de salaire année 2022', type: 'Bulletin', date: '10/01/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
  { kind: 'piece', pieceId: 'p-6', intitule: 'Ordonnance médicaments juillet', type: 'Ordonnance', date: '18/07/2023' },
  { kind: 'piece', pieceId: 'p-11', intitule: 'Attestation de salaire employeur', type: 'Attestation', date: '20/03/2023' },
  { kind: 'piece', pieceId: 'p-12', intitule: 'Facture IRM Centre Imagerie Sud', type: 'Facture', date: '25/06/2023' },
];

// ── Mock content for courrier / email ──────────────────────────────
export const MOCK_EMAIL_TEXT = `LETTRE RECOMMANDÉE AVEC ACCUSÉ DE RÉCEPTION

Maître Sophie BERNARD
Avocat au Barreau de Paris
AARPI BERNARD & ASSOCIÉS
18 avenue de l'Opéra, 75001 Paris

Paris, le 27 avril 2026

AXA FRANCE IARD
Service Sinistres Corporels
313 Terrasses de l'Arche
92727 Nanterre Cedex

Objet : Mise en demeure — Dossier sinistre n° 2024-AXA-78341
Réf. : Dossier DUPONT Jean c/ MARTIN Claire

Madame, Monsieur,

J'interviens en qualité de conseil de Monsieur Jean DUPONT, victime d'un accident de la circulation survenu le 14 septembre 2024, impliquant votre assurée Madame Claire MARTIN.

——————————————————————

I. RAPPEL DES FAITS

Le 14 septembre 2024, votre assurée a percuté mon client alors qu'il traversait sur un passage protégé. La responsabilité exclusive de Madame MARTIN est établie par le procès-verbal de police [pièce:8:Compte-rendu passage urgences:15/03/2023].

II. HISTORIQUE DES ÉCHANGES

Par courrier du 15 janvier 2025, nous vous avons adressé l'ensemble des justificatifs médicaux et financiers. Malgré deux relances (15 mars et 15 mai 2025), aucune offre d'indemnisation ne nous est parvenue à ce jour.

Ce silence est contraire aux obligations légales de l'assureur telles que prévues par les articles L. 211-9 et suivants du Code des assurances.

III. MISE EN DEMEURE

Par la présente, je vous mets en demeure de formuler une offre d'indemnisation provisionnelle dans un délai de QUINZE JOURS à compter de la réception de la présente.

À défaut, Monsieur DUPONT se verra contraint de saisir le tribunal compétent, et sollicitera l'application de la pénalité prévue à l'article L. 211-13 du Code des assurances (doublement des intérêts légaux).

IV. PIÈCES JOINTES

Les pièces justificatives du préjudice sont jointes en annexe [pièce:1:Facture hospitalisation CHU Bordeaux:15/03/2023] [pièce:5:Rapport d'expertise:12/09/2024].

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Maître Sophie BERNARD`;

export const MOCK_EMAIL_BORDEREAU_ENTRIES = [
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023' },
];

// ── Mock content for protocole transactionnel ──────────────────────
export const MOCK_PROTOCOLE_TEXT = `PROTOCOLE TRANSACTIONNEL

ENTRE LES SOUSSIGNÉS :

Monsieur Jean DUPONT, né le 15 mars 1982 à Lyon (69003), de nationalité française, demeurant au 42 rue des Lilas, 75011 Paris,

Représenté par Maître Sophie BERNARD, Avocat au Barreau de Paris,

Ci-après dénommé « la Victime »,

D'UNE PART,

ET :

La société AXA FRANCE IARD, SA au capital de 214 799 030 euros, dont le siège social est au 313 Terrasses de l'Arche, 92727 Nanterre Cedex, agissant en qualité d'assureur de responsabilité civile de Madame Claire MARTIN,

Représentée par Maître Laurent MOREAU, Avocat au Barreau de Nanterre,

Ci-après dénommée « l'Assureur »,

D'AUTRE PART,

——————————————————————

IL A ÉTÉ PRÉALABLEMENT EXPOSÉ CE QUI SUIT :

Le 14 septembre 2024, Monsieur DUPONT a été victime d'un accident de la circulation impliquant le véhicule conduit par Madame MARTIN, assurée auprès d'AXA FRANCE IARD.

L'expertise médicale du Docteur DURAND, en date du 12 septembre 2024, a retenu les conclusions suivantes [pièce:5:Rapport d'expertise:12/09/2024] :
- Date de consolidation : 12 septembre 2024
- DFP : 10%
- Souffrances endurées : 4/7
- Préjudice esthétique permanent : 2/7
- Incidence professionnelle : mi-temps thérapeutique définitif

CECI EXPOSÉ, IL A ÉTÉ CONVENU CE QUI SUIT :

Article 1 — Objet

Le présent protocole a pour objet de régler définitivement et transactionnellement l'ensemble des conséquences dommageables de l'accident.

Article 2 — Concessions réciproques

La Victime renonce à toute action judiciaire relative à l'accident.
L'Assureur reconnaît la responsabilité entière de son assurée et accepte d'indemniser la totalité du préjudice.

Article 3 — Indemnisation

L'Assureur versera à la Victime la somme globale et forfaitaire de CENT QUATRE-VINGT-CINQ MILLE EUROS (185 000 €), ventilée comme suit :

- Dépenses de santé actuelles (reste à charge) : 3 421,80 € [pièce:1:Facture hospitalisation CHU Bordeaux:15/03/2023]
- Perte de gains professionnels actuels : 18 340 € [pièce:3:Bulletins de salaire année 2022:10/01/2023] [jp:jp-pgpa-01]
- Déficit fonctionnel temporaire : 12 045 € [jp:jp-dft-01]
- Souffrances endurées : 28 000 € (cotation 4/7) [jp:jp-se-02]
- Déficit fonctionnel permanent : 42 000 € (10% × 2 350 €/pt × coefficient âge) [jp:jp-dfp-01]
- Préjudice esthétique permanent : 5 000 €
- Incidence professionnelle : 65 000 €
- Préjudice d'agrément : 8 000 €
- Article 700 CPC : 3 193,20 €

Article 4 — Modalités de paiement

Le règlement interviendra par virement bancaire dans un délai de 30 jours à compter de la signature du présent protocole.

Article 5 — Renonciation

Sous réserve de l'aggravation de son état de santé dûment constatée médicalement, la Victime déclare être intégralement indemnisée et renonce à tout recours.

Article 6 — Droit applicable

Le présent protocole est soumis au droit français. Les articles 2044 et suivants du Code civil s'appliquent.

Fait en deux exemplaires originaux à Paris, le 27 avril 2026.

Pour la Victime :                    Pour l'Assureur :
Maître Sophie BERNARD                Maître Laurent MOREAU`;

export const MOCK_PROTOCOLE_BORDEREAU_ENTRIES = [
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-3', intitule: 'Bulletins de salaire année 2022', type: 'Bulletin', date: '10/01/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
];

// ── Mock content for note en délibéré ──────────────────────────────
export const MOCK_NOTE_DELIBERE_TEXT = `NOTE EN DÉLIBÉRÉ

TRIBUNAL JUDICIAIRE DE PARIS
3ème chambre, 1ère section
Audience du 15 avril 2026

Affaire n° RG 25/12847
Monsieur Jean DUPONT c/ Madame Claire MARTIN et AXA FRANCE IARD

Monsieur le Président, Mesdames et Messieurs les membres du Tribunal,

À la suite de l'audience du 15 avril 2026, et conformément à l'autorisation donnée par le Tribunal, Monsieur DUPONT a l'honneur de porter à votre connaissance les éléments complémentaires suivants.

——————————————————————

I. OBJET DE LA PRÉSENTE NOTE

La présente note a pour objet de répondre au moyen soulevé d'office par le Tribunal lors de l'audience concernant l'application de l'article 25 de la loi du 5 juillet 1985, et de produire une pièce nouvelle.

II. SUR LE MOYEN SOULEVÉ D'OFFICE

Le Tribunal a interrogé les parties sur l'imputabilité du syndrome de stress post-traumatique à l'accident, au regard de l'antériorité psychiatrique du demandeur.

Monsieur DUPONT n'avait aucun antécédent psychiatrique avant l'accident du 14 septembre 2024. Le rapport d'expertise du Docteur DURAND confirme expressément cette absence d'état antérieur [pièce:5:Rapport d'expertise:12/09/2024] :

« L'examen du dossier médical antérieur ne révèle aucun suivi psychiatrique ni traitement psychotrope avant l'accident. Le syndrome de stress post-traumatique est en lien direct et exclusif avec l'accident. »

III. PRODUCTION D'UNE PIÈCE NOUVELLE

Postérieurement à l'audience, Monsieur DUPONT a obtenu l'attestation de son médecin traitant confirmant l'absence totale d'antécédent psychiatrique [pièce:10:Avis d'arrêt de travail initial:16/03/2023].

Cette pièce, qui n'a pu être produite plus tôt pour des raisons indépendantes de la volonté du demandeur, est communiquée contradictoirement aux défendeurs ce jour.

IV. CONCLUSION

Au vu de ces éléments, Monsieur DUPONT maintient l'intégralité de ses demandes telles que formulées dans ses dernières conclusions.

Fait à Paris, le 27 avril 2026.

Maître Sophie BERNARD`;

export const MOCK_NOTE_DELIBERE_BORDEREAU_ENTRIES = [
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
  { kind: 'piece', pieceId: 'p-10', intitule: "Avis d'arrêt de travail initial", type: 'Attestation', date: '16/03/2023' },
];

// Standalone bordereau — full dossier piece list, grouped by theme to
// demonstrate hierarchical numbering (I, I-1, I-2, II, II-1…).
export const MOCK_STANDALONE_BORDEREAU_ENTRIES = [
  { kind: 'section', name: 'Médical' },
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
  { kind: 'piece', pieceId: 'p-6', intitule: 'Ordonnance médicaments juillet', type: 'Ordonnance', date: '18/07/2023' },
  { kind: 'section', name: 'Frais médicaux' },
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-2', intitule: 'Factures kinésithérapie Cabinet Martin', type: 'Facture', date: '01/04/2023' },
  { kind: 'piece', pieceId: 'p-7', intitule: 'Facture pharmacie des Lilas', type: 'Facture', date: '20/07/2023' },
  { kind: 'piece', pieceId: 'p-12', intitule: 'Facture IRM Centre Imagerie Sud', type: 'Facture', date: '25/06/2023' },
  { kind: 'piece', pieceId: 'p-14', intitule: 'Consultation orthopédique Dr. Petit', type: 'Facture', date: '15/08/2023' },
  { kind: 'section', name: 'Pertes de revenus' },
  { kind: 'piece', pieceId: 'p-3', intitule: 'Bulletins de salaire année 2022', type: 'Bulletin', date: '10/01/2023' },
  { kind: 'piece', pieceId: 'p-9', intitule: 'Bulletins de salaire année 2021', type: 'Bulletin', date: '10/01/2022' },
  { kind: 'piece', pieceId: 'p-11', intitule: 'Attestation de salaire employeur', type: 'Attestation', date: '20/03/2023' },
  { kind: 'piece', pieceId: 'p-10', intitule: "Avis d'arrêt de travail initial", type: 'Attestation', date: '16/03/2023' },
  { kind: 'piece', pieceId: 'p-4', intitule: 'Attestation de versement IJ CPAM', type: 'Attestation', date: '20/05/2023' },
  { kind: 'piece', pieceId: 'p-13', intitule: 'Décompte indemnités prévoyance AG2R', type: 'Décompte', date: '15/08/2023' },
];

// Themed flat subsets — used by the `/redaction-bordereau` clarify flow
// (agent asks "quel type ?" then emits the matching subset).
export const MOCK_BORDEREAU_MEDICAL_ENTRIES = [
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-10', intitule: "Avis d'arrêt de travail initial", type: 'Attestation', date: '16/03/2023' },
  { kind: 'piece', pieceId: 'p-6', intitule: 'Ordonnance médicaments juillet', type: 'Ordonnance', date: '18/07/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
];

export const MOCK_BORDEREAU_PROCEDURE_ENTRIES = [
  { kind: 'piece', pieceId: 'p-proc-1', intitule: 'PV de constat d\'accident', type: 'PV', date: '14/09/2024', description: 'Police nationale — main courante n° 2024/09/14-3847' },
  { kind: 'piece', pieceId: 'p-proc-2', intitule: 'Ordonnance désignation expert', type: 'Ordonnance', date: '03/10/2024', description: 'TJ Paris — Dr. Martin' },
  { kind: 'piece', pieceId: 'p-proc-3', intitule: 'Convocation expertise contradictoire', type: 'Courrier', date: '15/10/2024' },
  { kind: 'piece', pieceId: 'p-proc-4', intitule: 'Avis de réception assignation', type: 'Acte d\'huissier', date: '24/04/2026' },
];

// Reordered version of the flat bordereau (most recent → oldest). Used by
// `/bordereau-reorder` to demo reordering with a brief skeleton/shimmer
// animation on the rows.
export const MOCK_REORDERED_BORDEREAU_ENTRIES = [
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
  { kind: 'piece', pieceId: 'p-13', intitule: 'Décompte indemnités prévoyance AG2R', type: 'Décompte', date: '15/08/2023' },
  { kind: 'piece', pieceId: 'p-14', intitule: 'Consultation orthopédique Dr. Petit', type: 'Facture', date: '15/08/2023' },
  { kind: 'piece', pieceId: 'p-7', intitule: 'Facture pharmacie des Lilas', type: 'Facture', date: '20/07/2023' },
  { kind: 'piece', pieceId: 'p-6', intitule: 'Ordonnance médicaments juillet', type: 'Ordonnance', date: '18/07/2023' },
  { kind: 'piece', pieceId: 'p-12', intitule: 'Facture IRM Centre Imagerie Sud', type: 'Facture', date: '25/06/2023' },
  { kind: 'piece', pieceId: 'p-4', intitule: 'Attestation de versement IJ CPAM', type: 'Attestation', date: '20/05/2023' },
  { kind: 'piece', pieceId: 'p-2', intitule: 'Factures kinésithérapie Cabinet Martin', type: 'Facture', date: '01/04/2023' },
  { kind: 'piece', pieceId: 'p-11', intitule: 'Attestation de salaire employeur', type: 'Attestation', date: '20/03/2023' },
  { kind: 'piece', pieceId: 'p-10', intitule: "Avis d'arrêt de travail initial", type: 'Attestation', date: '16/03/2023' },
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-3', intitule: 'Bulletins de salaire année 2022', type: 'Bulletin', date: '10/01/2023' },
  { kind: 'piece', pieceId: 'p-9', intitule: 'Bulletins de salaire année 2021', type: 'Bulletin', date: '10/01/2022' },
];

// Flat bordereau — same pieces as MOCK_STANDALONE but no sections, ordered
// chronologically. Used by `/redaction-bordereau` so the user can then run
// `/bordereau-modify-section` to demo the agent reorganising into themes.
export const MOCK_FLAT_BORDEREAU_ENTRIES = [
  { kind: 'piece', pieceId: 'p-9', intitule: 'Bulletins de salaire année 2021', type: 'Bulletin', date: '10/01/2022' },
  { kind: 'piece', pieceId: 'p-3', intitule: 'Bulletins de salaire année 2022', type: 'Bulletin', date: '10/01/2023' },
  { kind: 'piece', pieceId: 'p-1', intitule: 'Facture hospitalisation CHU Bordeaux', type: 'Facture', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-8', intitule: 'Compte-rendu passage urgences', type: 'Compte-rendu', date: '15/03/2023' },
  { kind: 'piece', pieceId: 'p-10', intitule: "Avis d'arrêt de travail initial", type: 'Attestation', date: '16/03/2023' },
  { kind: 'piece', pieceId: 'p-11', intitule: 'Attestation de salaire employeur', type: 'Attestation', date: '20/03/2023' },
  { kind: 'piece', pieceId: 'p-2', intitule: 'Factures kinésithérapie Cabinet Martin', type: 'Facture', date: '01/04/2023' },
  { kind: 'piece', pieceId: 'p-4', intitule: 'Attestation de versement IJ CPAM', type: 'Attestation', date: '20/05/2023' },
  { kind: 'piece', pieceId: 'p-12', intitule: 'Facture IRM Centre Imagerie Sud', type: 'Facture', date: '25/06/2023' },
  { kind: 'piece', pieceId: 'p-6', intitule: 'Ordonnance médicaments juillet', type: 'Ordonnance', date: '18/07/2023' },
  { kind: 'piece', pieceId: 'p-7', intitule: 'Facture pharmacie des Lilas', type: 'Facture', date: '20/07/2023' },
  { kind: 'piece', pieceId: 'p-14', intitule: 'Consultation orthopédique Dr. Petit', type: 'Facture', date: '15/08/2023' },
  { kind: 'piece', pieceId: 'p-13', intitule: 'Décompte indemnités prévoyance AG2R', type: 'Décompte', date: '15/08/2023' },
  { kind: 'piece', pieceId: 'p-5', intitule: "Rapport d'expertise", type: 'Rapport', date: '12/09/2024' },
];

// ── Scenario action sequences ───────────────────────────────────────
// The writing agent follows a 5-step flow:
//   1. Template check   — search library for matching templates
//   2. Reasoning #1     — context analysis (what I have, what's missing)
//   3. Clarify          — conditional, only if gaps found in step 2
//   4. Reasoning #2     — plan / outline / key decisions
//   5. Generation       — canvas + stream + artifact card
//
// Steps 1 and 3 are interactive (stepper states). Steps 2, 4, 5 are
// played as action sequences. The hook builds them dynamically based
// on act type, template status, and gap analysis.

export const REDACTION_SCENARIOS = {

  // ── Modification flow (existing) — no change ───────────────────────
  'redaction-modif': {
    label: 'Modification d\'acte',
    description: 'Modifier l\'acte ouvert dans le canvas',
    actions: [
      { type: 'USER_MESSAGE', text: 'Ajoute l\'assureur AXA comme co-défendeur, mentionne le PV d\'infraction, ajoute le préjudice psychologique et augmente la provision à 25 000 €.' },
      { type: 'DELAY', ms: 600 },
      { type: 'AGENT_REASONING_STEPS', label: 'Modification', steps: [
        { type: 'read_documents', label: 'Relecture de l\'acte en cours', status: 'done' },
        { type: 'search_document', label: 'Recherche des coordonnées AXA France IARD', status: 'done' },
        { type: 'calculate', label: 'Recalcul de la provision (15 000 → 25 000 €)', status: 'done' },
        { type: 'read_documents', label: 'Intégration du PV d\'infraction n° 2024/09/14-PV-1182', status: 'done' },
        { type: 'calculate', label: 'Ajout du préjudice psychologique et sapiteur psychiatre', status: 'done' },
      ]},
      { type: 'DELAY', ms: 500 },
      { type: 'RESTART_STREAMING' },
      { type: 'DELAY', ms: 200 },
      { type: 'STREAM_CONTENT', text: MOCK_ASSIGNATION_MODIFIED_TEXT, chunkSize: 60, chunkDelay: 20 },
      { type: 'DELAY', ms: 300 },
      { type: 'AGENT_MESSAGE', text: 'L\'assignation a été mise à jour avec les modifications demandées :\n\n— **AXA France IARD** ajoutée comme co-défenderesse\n— **PV d\'infraction** (franchissement feu rouge) intégré aux faits\n— **Préjudice psychologique** (SSPT) ajouté aux lésions et au préjudice actuel\n— **Sapiteur psychiatre** demandé en complément de l\'expert orthopédiste\n— **Provision portée à 25 000 €** (était 15 000 €)\n— **Article 700 porté à 4 000 €** (était 3 000 €)\n— **7ème demande** ajoutée : ordonnance commune aux tiers payeurs (CPAM + AG2R)\n\nRelisez l\'acte et dites-moi si d\'autres ajustements sont nécessaires.' },
    ],
  },

  // ── Standalone bordereau · clarify flow ────────────────────────────
  // Demo of the agent asking what TYPE of bordereau before generating.
  // After the user replies (handled in App.js via `awaiting-bordereau-type-reply`),
  // one of the bordereau-emit-* scenarios is played.
  'redaction-bordereau': {
    label: 'Bordereau · Simple (sans sections)',
    description: 'Demande le type de bordereau, puis génère un bordereau plat',
    actions: [
      { type: 'USER_MESSAGE', text: 'Génère-moi un bordereau pour ce dossier' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_MESSAGE', text: 'Ok, quel type de bordereau veux-tu — un bordereau dédié à un type de pièces (médical, procédure, frais…) ou un bordereau complet du dossier ?' },
      { type: 'SET_STEPPER_STATE', stepperType: 'awaiting-bordereau-type-reply' },
    ],
  },

  // Emit branches — picked by the App.js stepper handler after the user's reply
  'bordereau-emit-medical': {
    label: 'Bordereau · Médical',
    description: 'Bordereau plat — pièces médicales uniquement',
    actions: [
      { type: 'REASONING_COLLAPSED', text: 'Filtre · pièces médicales du dossier' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING_STEPS', label: 'Construction du bordereau médical', steps: [
        { type: 'read_documents', label: 'Sélection des pièces médicales (4 pièces)', status: 'done' },
        { type: 'calculate', label: 'Tri chronologique', status: 'done' },
        { type: 'calculate', label: 'Numérotation séquentielle 1…4', status: 'done' },
      ]},
      { type: 'DELAY', ms: 500 },
      { type: 'EMIT_BORDEREAU', title: 'Bordereau médical', entries: MOCK_BORDEREAU_MEDICAL_ENTRIES },
      { type: 'DELAY', ms: 200 },
      { type: 'AGENT_MESSAGE', text: 'Bordereau médical prêt avec **4 pièces**, triées par date.\n\nDites-moi si vous souhaitez en ajouter ou changer l\'ordre.' },
    ],
  },

  'bordereau-emit-procedure': {
    label: 'Bordereau · Procédure',
    description: 'Bordereau plat — pièces de procédure uniquement',
    actions: [
      { type: 'REASONING_COLLAPSED', text: 'Filtre · pièces de procédure du dossier' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING_STEPS', label: 'Construction du bordereau procédure', steps: [
        { type: 'read_documents', label: 'Sélection des pièces de procédure (4 pièces)', status: 'done' },
        { type: 'calculate', label: 'Tri chronologique', status: 'done' },
        { type: 'calculate', label: 'Numérotation séquentielle 1…4', status: 'done' },
      ]},
      { type: 'DELAY', ms: 500 },
      { type: 'EMIT_BORDEREAU', title: 'Bordereau procédure', entries: MOCK_BORDEREAU_PROCEDURE_ENTRIES },
      { type: 'DELAY', ms: 200 },
      { type: 'AGENT_MESSAGE', text: 'Bordereau procédure prêt avec **4 pièces**, triées par date.\n\nDites-moi si vous souhaitez en ajouter ou changer l\'ordre.' },
    ],
  },

  'bordereau-emit-full': {
    label: 'Bordereau · Complet',
    description: 'Bordereau plat — toutes les pièces du dossier',
    actions: [
      { type: 'REASONING_COLLAPSED', text: 'Préparation du bordereau · pièces du dossier' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING_STEPS', label: 'Construction du bordereau', steps: [
        { type: 'read_documents', label: 'Lecture des pièces du dossier (14 pièces)', status: 'done' },
        { type: 'calculate', label: 'Tri chronologique (plus ancienne → plus récente)', status: 'done' },
        { type: 'calculate', label: 'Numérotation séquentielle 1…14', status: 'done' },
      ]},
      { type: 'DELAY', ms: 500 },
      { type: 'EMIT_BORDEREAU', title: 'Bordereau — pièces du dossier', entries: MOCK_FLAT_BORDEREAU_ENTRIES },
      { type: 'DELAY', ms: 200 },
      { type: 'AGENT_MESSAGE', text: 'Bordereau prêt avec **14 pièces**, triées par date et numérotées 1 à 14.\n\nDites-moi si vous souhaitez les regrouper par thème (médical, frais, revenus…) ou changer l\'ordre.' },
    ],
  },

  // ── Reorganise bordereau: flat → sectioned (with shimmer anim) ─────
  // Updates the currently-open bordereau (canvas focus) by replacing its
  // entries with a sectioned version (Médical / Frais / Revenus). Rows
  // shimmer for ~1s while the agent "thinks", then the new entries snap in.
  // FILL_BORDEREAU_ENTRIES defaults its target to canvasActeId when no
  // acteId is provided, so the user must be on the bordereau canvas.
  'bordereau-modify-section': {
    label: 'Bordereau · Réorganiser en sections',
    description: 'Regroupe les pièces du bordereau par thème, avec animation skeleton',
    actions: [
      { type: 'USER_MESSAGE', text: 'Réorganise ce bordereau avec des sections I, II, III, classé par type, et trie les pièces dans l\'ordre où elles seront citées dans l\'acte.' },
      { type: 'DELAY', ms: 400 },
      { type: 'REASONING_COLLAPSED', text: 'Réorganisation du bordereau · regroupement par thème' },
      { type: 'DELAY', ms: 300 },
      { type: 'SET_REORDERING_BORDEREAU' },
      { type: 'AGENT_REASONING_STEPS', label: 'Réorganisation', steps: [
        { type: 'calculate', label: 'Classification des pièces par type (médical, frais, revenus)', status: 'done' },
        { type: 'read_documents', label: 'Ordre de citation dans l\'acte (apparition séquentielle)', status: 'done' },
        { type: 'calculate', label: 'Numérotation hiérarchique I, I-1, I-2, II, II-1…', status: 'done' },
      ]},
      { type: 'DELAY', ms: 900 },
      { type: 'FILL_BORDEREAU_ENTRIES', entries: MOCK_STANDALONE_BORDEREAU_ENTRIES },
      { type: 'DELAY', ms: 150 },
      { type: 'CLEAR_REORDERING_BORDEREAU' },
      { type: 'DELAY', ms: 100 },
      { type: 'AGENT_MESSAGE', text: 'Bordereau réorganisé en **3 sections** :\n\n— **I. Médical** — comptes-rendus, expertise, ordonnances\n— **II. Frais médicaux** — factures hospitalisation, kiné, pharmacie, IRM\n— **III. Pertes de revenus** — bulletins, attestations, indemnités\n\nLes pièces sont triées dans l\'ordre où elles apparaîtront dans l\'acte, et numérotées hiérarchiquement (I-1, I-2, II-1…).' },
    ],
  },

  // ── Standalone bordereau ────────────────────────────────────────────
  // Triggered from a chat NL query or the Pièces tab "Générer un bordereau"
  // button. Emits a single bordereau artefact (no paired acte).
  'bordereau-standalone': {
    label: 'Bordereau · Standalone',
    description: 'Génère un bordereau sans acte associé',
    actions: [
      { type: 'REASONING_COLLAPSED', text: 'Préparation du bordereau · pièces du dossier' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING_STEPS', label: 'Sélection des pièces', steps: [
        { type: 'read_documents', label: 'Lecture des pièces du dossier (14 pièces)', status: 'done' },
        { type: 'calculate', label: 'Numérotation séquentielle 1…N', status: 'done' },
      ]},
      { type: 'DELAY', ms: 500 },
      { type: 'EMIT_BORDEREAU', title: 'Bordereau — pièces du dossier', entries: MOCK_STANDALONE_BORDEREAU_ENTRIES },
      { type: 'DELAY', ms: 200 },
      { type: 'AGENT_MESSAGE', text: 'Bordereau prêt avec les pièces du dossier, regroupées par thème (Médical, Frais, Revenus).\n\nVous pouvez l\'associer à un acte plus tard, ou le télécharger tel quel.' },
    ],
  },

  // ── Onboarding — first-time acte empty state ────────────────────────
  'redaction-onboarding': {
    label: 'Rédaction · Onboarding',
    description: 'Bienvenue dans la rédaction d\'actes',
    actions: [
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_MESSAGE', text: 'Bienvenue dans la rédaction d\'actes ! Je peux vous aider à rédiger tout type de document juridique en dommage corporel :\n\n— **Assignation** en référé-expertise ou au fond\n— **Conclusions** récapitulatives\n— **Requête** en référé\n— **Dire à expert** (observations contradictoires)\n— **Courrier** de relance, mise en demeure\n— **Protocole transactionnel**\n— **Note en délibéré**\n\nQu\'est-ce qu\'on rédige ensemble ?' },
      { type: 'SET_STEPPER_STATE', stepperType: 'awaiting-onboarding-reply' },
    ],
  },

  // ── UserAsk demo — agent asks multi-question clarification ─────────
  'redaction-user-ask': {
    label: 'Rédaction · UserAsk',
    description: 'Demo du mode UserAsk (questions avec propositions)',
    actions: [
      { type: 'REASONING_COLLAPSED', text: 'Analyse du dossier · informations manquantes identifiées' },
      { type: 'DELAY', ms: 500 },
      { type: 'USER_ASK', questions: [
        {
          text: 'Pour adapter l\'acte à votre dossier, précisez-moi le tribunal compétent.',
          proposals: ['Tribunal judiciaire de Paris', 'Tribunal judiciaire de Lyon', 'Tribunal judiciaire de Bordeaux'],
        },
        {
          text: 'Qui est la partie adverse ?',
          proposals: ['Mme Martin seule', 'Mme Martin + son assureur AXA', 'Assureur AXA uniquement'],
        },
        {
          text: 'Souhaitez-vous demander une provision à valoir sur l\'indemnisation ?',
          proposals: ['Oui, provision de 15 000 €', 'Oui, provision de 25 000 €', 'Non, pas de provision'],
        },
      ]},
    ],
  },
};

// ── Per-act-type configuration for the 5-step flow ─────────────────
// Each entry describes what Reasoning #1 checks, possible gaps,
// and Reasoning #2 plan content for a given act type.
export const ACT_TYPE_FLOW_CONFIG = {
  assignation: {
    reasoning1: {
      steps: [
        { type: 'read_documents', label: 'Lecture de la demande : assignation en référé-expertise', status: 'done' },
        { type: 'read_documents', label: 'Contexte : dossier Dupont c/ Martin · 5 pièces · rapport médical', status: 'done' },
        { type: 'search_document', label: 'Template identifié dans la bibliothèque', status: 'done' },
        { type: 'calculate', label: 'Éléments manquants identifiés (2)', status: 'done' },
      ],
      hasGaps: true,
      gapMessage: 'Avant de rédiger l\'assignation, j\'ai besoin de quelques précisions :\n\n— **Tribunal compétent** — TJ Paris, Lyon, Bordeaux ?\n— **Type de procédure** — référé-expertise, référé-provision, ou au fond ?\n\nRépondez librement, je m\'adapte.',
    },
    reasoning2: {
      steps: [
        { type: 'calculate', label: 'Structure : Faits → Préjudice corporel → Nécessité expertise → Demandes', status: 'done' },
        { type: 'read_documents', label: 'Sources : rapport médical, PV police n° 2024/09/14-3847', status: 'done' },
        { type: 'search_document', label: 'Juridiction : TJ Paris (résidence du défendeur)', status: 'done' },
        { type: 'calculate', label: 'Mission d\'expertise : nomenclature Dintilhac', status: 'done' },
      ],
    },
    generation: {
      actType: 'assignation',
      title: 'Assignation en référé-expertise — Dupont c/ Martin',
      text: MOCK_ASSIGNATION_TEXT,
      artifactTitle: 'Assignation en référé-expertise — v1',
      artifactSubtitle: '3 pages · TJ Paris · M. Dupont c/ Mme Martin',
      doneMessage: 'L\'assignation en référé-expertise est prête. Elle reprend les faits du dossier, détaille le préjudice et formule les demandes d\'expertise et de provision.\n\nSélectionnez une zone du document pour demander des modifications.',
      bordereauTitle: 'Bordereau — Assignation Dupont c/ Martin',
      bordereauEntries: MOCK_FLAT_BORDEREAU_ENTRIES,
    },
  },
  conclusions: {
    reasoning1: {
      steps: [
        { type: 'read_documents', label: 'Lecture de la demande : conclusions récapitulatives', status: 'done' },
        { type: 'read_documents', label: 'Contexte : dossier Dupont, chiffrage complet, 5 pièces', status: 'done' },
        { type: 'calculate', label: 'Éléments manquants identifiés (2)', status: 'done' },
      ],
      hasGaps: true,
      gapMessage: 'Avant de rédiger les conclusions, j\'ai besoin de quelques précisions :\n\n— **Date d\'audience** — pour les mentions d\'en-tête\n— **Arguments adverses à contrer** — contestation de responsabilité ? minoration du DFP ?\n\nRépondez librement.',
    },
    reasoning2: {
      steps: [
        { type: 'calculate', label: 'Structure : Rappel procédure → Faits → Discussion → Dispositif', status: 'done' },
        { type: 'read_documents', label: 'Intégration du chiffrage complet Dintilhac', status: 'done' },
        { type: 'search_document', label: 'Jurisprudence applicable identifiée (3 décisions)', status: 'done' },
        { type: 'calculate', label: 'Réponse aux arguments adverses intégrée', status: 'done' },
      ],
    },
    generation: {
      actType: 'conclusions',
      title: 'Conclusions récapitulatives — Dupont c/ Martin',
      text: MOCK_CONCLUSIONS_TEXT,
      artifactTitle: 'Conclusions récapitulatives — v1',
      artifactSubtitle: '8 pages · TJ Paris · Dupont c/ Martin & AXA',
      doneMessage: 'Les conclusions récapitulatives sont prêtes. Elles intègrent l\'ensemble du chiffrage Dintilhac et répondent aux arguments adverses.\n\nSélectionnez une zone du document pour demander des modifications.',
      bordereauTitle: 'Bordereau — Conclusions Dupont c/ Martin',
      bordereauEntries: MOCK_FLAT_BORDEREAU_ENTRIES,
    },
  },
  requete: {
    reasoning1: {
      steps: [
        { type: 'read_documents', label: 'Lecture de la demande : requête en référé-expertise', status: 'done' },
        { type: 'read_documents', label: 'Contexte : dossier Dupont, rapport médical, pas de consolidation', status: 'done' },
        { type: 'calculate', label: 'Éléments manquants identifiés (1)', status: 'done' },
      ],
      hasGaps: true,
      gapMessage: 'Avant de rédiger la requête :\n\n— **Tribunal compétent** — TJ Paris, Lyon, ou autre ?\n\nRépondez librement.',
    },
    reasoning2: {
      steps: [
        { type: 'calculate', label: 'Structure : Objet → Faits → Urgence → Demandes', status: 'done' },
        { type: 'read_documents', label: 'Justification de l\'urgence : état non consolidé', status: 'done' },
        { type: 'search_document', label: 'Juridiction : TJ Paris (lieu de l\'accident)', status: 'done' },
      ],
    },
    generation: {
      actType: 'requete',
      title: 'Requête en référé-expertise — Dupont',
      text: MOCK_REQUETE_TEXT,
      artifactTitle: 'Requête en référé-expertise — v1',
      artifactSubtitle: '2 pages · TJ Paris · M. Dupont',
      doneMessage: 'La requête en référé-expertise est prête.\n\nSélectionnez une zone du document pour demander des modifications.',
      bordereauTitle: 'Bordereau — Requête Dupont',
      bordereauEntries: MOCK_FLAT_BORDEREAU_ENTRIES,
    },
  },
  dire: {
    reasoning1: {
      steps: [
        { type: 'read_documents', label: 'Lecture de la demande : dire à expert', status: 'done' },
        { type: 'read_documents', label: 'Contexte : rapport préliminaire Dr. Durand, 3 pièces médicales', status: 'done' },
        { type: 'calculate', label: 'Éléments manquants identifiés (1)', status: 'done' },
      ],
      hasGaps: true,
      gapMessage: 'Avant de rédiger le dire, une précision :\n\n— **Points à soulever** — sous-évaluation du DFP ? absence de prise en compte du retentissement professionnel ? autre ?\n\nDites-moi ce que vous souhaitez contester ou préciser.',
    },
    reasoning2: {
      steps: [
        { type: 'calculate', label: 'Structure : Observations → Contestations → Demandes complémentaires', status: 'done' },
        { type: 'read_documents', label: 'Analyse contradictoire du rapport préliminaire', status: 'done' },
        { type: 'search_document', label: 'Références médicales pour étayer les contestations', status: 'done' },
      ],
    },
    generation: {
      actType: 'dire',
      title: 'Dire à expert — Dr. Durand — Dupont',
      text: MOCK_DIRE_TEXT,
      artifactTitle: 'Dire à expert — v1',
      artifactSubtitle: '3 pages · Dr. Durand · M. Dupont',
      doneMessage: 'Le dire à expert est prêt. Il conteste les points identifiés et demande des investigations complémentaires.\n\nSélectionnez une zone du document pour demander des modifications.',
      bordereauTitle: 'Bordereau — Dire à expert Dupont',
      bordereauEntries: MOCK_FLAT_BORDEREAU_ENTRIES,
    },
  },
  email: {
    reasoning1: {
      steps: [
        { type: 'read_documents', label: 'Lecture de la demande : courrier / email', status: 'done' },
        { type: 'read_documents', label: 'Contexte : dossier Dupont, dernière correspondance il y a 3 mois', status: 'done' },
        { type: 'calculate', label: 'Éléments manquants identifiés (1)', status: 'done' },
      ],
      hasGaps: true,
      gapMessage: 'Pour adapter le ton et le contenu :\n\n— **Destinataire** — assureur (lequel ?), partie adverse, expert ?\n\nPrécisez le destinataire et l\'objet souhaité.',
    },
    reasoning2: {
      steps: [
        { type: 'calculate', label: 'Ton : formel, mise en demeure', status: 'done' },
        { type: 'read_documents', label: 'Historique des échanges identifié', status: 'done' },
        { type: 'calculate', label: 'Délai de réponse : 15 jours (usage)', status: 'done' },
      ],
    },
    generation: {
      actType: 'email',
      title: 'Courrier de relance — AXA — Dupont',
      text: MOCK_EMAIL_TEXT,
      artifactTitle: 'Courrier de relance — v1',
      artifactSubtitle: '1 page · AXA France · Dossier Dupont',
      doneMessage: 'Le courrier est prêt.\n\nSélectionnez une zone du document pour demander des modifications.',
      bordereauTitle: 'Bordereau — Courrier AXA Dupont',
      bordereauEntries: MOCK_FLAT_BORDEREAU_ENTRIES,
    },
  },
  protocole: {
    reasoning1: {
      steps: [
        { type: 'read_documents', label: 'Lecture de la demande : protocole transactionnel', status: 'done' },
        { type: 'read_documents', label: 'Contexte : chiffrage finalisé, offre assureur reçue', status: 'done' },
        { type: 'calculate', label: 'Éléments manquants identifiés (1)', status: 'done' },
      ],
      hasGaps: true,
      gapMessage: 'Pour le protocole transactionnel :\n\n— **Montant convenu** — quel montant global ? ventilation par poste ?\n\nPrécisez les termes de l\'accord.',
    },
    reasoning2: {
      steps: [
        { type: 'calculate', label: 'Structure : Parties → Rappel des faits → Concessions → Montant → Renonciation', status: 'done' },
        { type: 'read_documents', label: 'Vérification du chiffrage vs montant transactionnel', status: 'done' },
        { type: 'calculate', label: 'Clauses de renonciation et réserves', status: 'done' },
      ],
    },
    generation: {
      actType: 'protocole',
      title: 'Protocole transactionnel — Dupont / AXA',
      text: MOCK_PROTOCOLE_TEXT,
      artifactTitle: 'Protocole transactionnel — v1',
      artifactSubtitle: '4 pages · Dupont / AXA · 185 000 €',
      doneMessage: 'Le protocole transactionnel est prêt.\n\nSélectionnez une zone du document pour demander des modifications.',
      bordereauTitle: 'Bordereau — Protocole Dupont / AXA',
      bordereauEntries: MOCK_FLAT_BORDEREAU_ENTRIES,
    },
  },
  'note-delibere': {
    reasoning1: {
      steps: [
        { type: 'read_documents', label: 'Lecture de la demande : note en délibéré', status: 'done' },
        { type: 'read_documents', label: 'Contexte : audience terminée, délibéré en cours', status: 'done' },
        { type: 'calculate', label: 'Éléments manquants identifiés (1)', status: 'done' },
      ],
      hasGaps: true,
      gapMessage: 'Pour la note en délibéré :\n\n— **Points à compléter** — production d\'une pièce nouvelle ? réponse à un moyen soulevé d\'office ?\n\nPrécisez ce que vous souhaitez porter à la connaissance du tribunal.',
    },
    reasoning2: {
      steps: [
        { type: 'calculate', label: 'Structure : Objet → Rappel → Développement → Demande', status: 'done' },
        { type: 'read_documents', label: 'Analyse des points soulevés à l\'audience', status: 'done' },
      ],
    },
    generation: {
      actType: 'note-delibere',
      title: 'Note en délibéré — Dupont c/ Martin',
      text: MOCK_NOTE_DELIBERE_TEXT,
      artifactTitle: 'Note en délibéré — v1',
      artifactSubtitle: '2 pages · TJ Paris · Dupont c/ Martin',
      doneMessage: 'La note en délibéré est prête.\n\nSélectionnez une zone du document pour demander des modifications.',
      bordereauTitle: 'Bordereau — Note en délibéré Dupont',
      bordereauEntries: MOCK_FLAT_BORDEREAU_ENTRIES,
    },
  },
};

// Fallback config for unknown act types
export const DEFAULT_FLOW_CONFIG = {
  reasoning1: {
    steps: [
      { type: 'read_documents', label: 'Lecture de la demande', status: 'done' },
      { type: 'read_documents', label: 'Analyse du contexte du dossier', status: 'done' },
      { type: 'calculate', label: 'Éléments manquants identifiés', status: 'done' },
    ],
    hasGaps: true,
    gapMessage: 'Avant de rédiger, quelques précisions :\n\n— **Parties** — qui sont les parties en présence ?\n— **Juridiction** — quel tribunal ?\n\nRépondez librement.',
  },
  reasoning2: {
    steps: [
      { type: 'calculate', label: 'Structure de l\'acte déterminée', status: 'done' },
      { type: 'read_documents', label: 'Sources du dossier intégrées', status: 'done' },
    ],
  },
  generation: {
    actType: 'assignation',
    title: 'Acte juridique — Dupont',
    text: MOCK_ASSIGNATION_TEXT,
    artifactTitle: 'Acte — v1',
    artifactSubtitle: 'TJ Paris · M. Dupont',
    doneMessage: 'L\'acte est prêt.\n\nSélectionnez une zone du document pour demander des modifications.',
  },
};

// ── Command list for SlashCommandPalette ────────────────────────────
export const REDACTION_COMMAND_LIST = [
  { command: 'redaction-assignation', label: 'Rédaction · Assignation', description: 'Assignation en référé-expertise' },
  { command: 'redaction-conclusions', label: 'Rédaction · Conclusions', description: 'Conclusions récapitulatives' },
  { command: 'redaction-dire', label: 'Rédaction · Dire à expert', description: 'Observations adressées à l\'expert' },
  { command: 'redaction-requete', label: 'Rédaction · Requête en référé', description: 'Requête en référé-expertise' },
  { command: 'redaction-email', label: 'Rédaction · Courrier', description: 'Courrier ou mise en demeure' },
  { command: 'redaction-protocole', label: 'Rédaction · Protocole', description: 'Protocole transactionnel' },
  { command: 'redaction-bordereau', label: 'Bordereau · Simple', description: 'Bordereau plat, pièces ordonnées chronologiquement' },
  { command: 'bordereau-modify-section', label: 'Bordereau · Réorganiser en sections', description: 'Regroupe le bordereau ouvert par thème, avec animation skeleton' },
  { command: 'redaction-modif', label: 'Modification d\'acte', description: 'Modifier l\'acte ouvert dans le canvas' },
  { command: 'redaction-user-ask', label: 'Rédaction · UserAsk', description: 'Questions avec propositions de réponse' },
];

export const REDACTION_COMMAND_MAP = Object.fromEntries(
  Object.keys(REDACTION_SCENARIOS).map(key => [key, key])
);
