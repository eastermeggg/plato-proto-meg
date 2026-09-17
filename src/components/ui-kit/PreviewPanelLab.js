import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, ExternalLink, Check, Minus, FileText, Pencil, Plus, ArrowLeftRight } from 'lucide-react';
import PreviewPanel, { PREVIEW_KINDS } from '../preview/PreviewPanel';
import { colors } from '../../design-system/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// Preview panel - lab
//
// Un seul châssis décliné par type de source (kind) et par sujet (pièce / ligne).
// Les variants (kind + sujet) sont au-dessus ; la sandbox prend toute la largeur.
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLES = {
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

const ORDER = ['piece', 'modele', 'jp', 'email', 'loi', 'ligne', 'web'];

// Sujet = LIGNE de poste : le doc devient la pièce attachée, un rail édite les
// valeurs de la ligne (schéma générique, marche pour tout poste). La pièce garde
// son édition de métadonnées (bouton « Modifier la pièce » dans la barre méta).
// Ici : de vraies lignes de postes cliquables → le panneau s'ouvre en drawer
// aux vraies proportions (PreviewPanel non-embedded).
const POSTE_TINT = {
  PGPA:   { bg: '#eef2ff', fg: '#4f46e5' },
  DFT:    { bg: '#fef2f2', fg: '#c2410c' },
  DSA:    { bg: '#ecfdf5', fg: '#047857' },
  SOCIAL: { bg: '#fffbeb', fg: '#b45309' },
};
const POSTE_LIGNES = [
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
const strongOf = (l) => (l.summary.find((s) => s.strong) || l.summary[l.summary.length - 1] || {}).value || '—';

// Table des vraies lignes de postes - chaque row ouvre le panneau en drawer.
function PosteLignesTable({ onOpen }) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-cream/50">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Postes du dossier</h3>
          <p className="text-[12px] text-foreground-muted mt-0.5">Clique une ligne - le panneau s'ouvre en drawer, aux vraies proportions</p>
        </div>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-[13px] font-medium text-foreground-secondary hover:bg-cream transition-colors"><Plus className="w-4 h-4" strokeWidth={1.75} /> Ajouter</button>
      </div>
      <div className="grid grid-cols-[88px_1fr_130px_44px] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-foreground-muted border-b border-border" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <div>Poste</div><div>Ligne</div><div className="text-right">Montant</div><div />
      </div>
      {POSTE_LIGNES.map((e, i) => {
        const tint = POSTE_TINT[e.ligne.poste] || POSTE_TINT.PGPA;
        return (
          <button key={i} onClick={() => onOpen(i)} className="w-full grid grid-cols-[88px_1fr_130px_44px] items-center px-4 py-3 text-left border-b border-border last:border-0 hover:bg-cream/60 transition-colors group">
            <div><span className="inline-flex items-center h-6 px-2 rounded-md text-[11px] font-semibold" style={{ background: tint.bg, color: tint.fg }}>{e.ligne.poste}</span></div>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-info-bg text-link flex-shrink-0"><FileText className="w-3.5 h-3.5" strokeWidth={1.75} /></span>
              <div className="min-w-0"><div className="text-[13.5px] text-foreground truncate">{e.ligne.titre}</div><div className="text-[11.5px] text-foreground-muted truncate">{e.piece.name}</div></div>
            </div>
            <div className="text-[13px] font-medium text-foreground tabular-nums text-right">{strongOf(e.ligne)}</div>
            <div className="flex justify-end"><span className="inline-flex items-center justify-center w-8 h-8 rounded-md text-foreground-muted group-hover:text-foreground group-hover:bg-white transition-colors" title="Modifier"><Pencil className="w-4 h-4" strokeWidth={1.75} /></span></div>
          </button>
        );
      })}
    </div>
  );
}

// Dans l'app, le chat vit à droite en permanence et il est REDIMENSIONNABLE
// (grip sur son bord gauche). Les drawers de contenu s'ouvrent FLUSH À GAUCHE
// du chat via --chat-offset, qui suit sa largeur variable. Le lab reproduit ça :
// chat mock resizable + panneau borné par `right: chatWidth` en live.
const CHAT_W_DEFAULT = 384;
const CHAT_W_MIN = 320;
const CHAT_W_MAX = 640;

function MockChat({ width, onGripDown }) {
  return (
    <div className="fixed top-0 right-0 bottom-0 z-[55] bg-white border-l border-border flex flex-col" style={{ width }}>
      {/* Grip de redimensionnement (bord gauche du chat) */}
      <div onMouseDown={onGripDown} className="absolute top-0 left-0 bottom-0 w-2 -translate-x-1/2 cursor-col-resize group z-10" aria-hidden>
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:bg-foreground-muted transition-colors" />
      </div>
      <div className="h-12 px-4 border-b border-border flex items-center gap-2 flex-shrink-0">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-foreground text-white text-[11px] font-semibold">N</span>
        <span className="text-[13px] font-medium text-foreground">Assistant</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="max-w-[85%] ml-auto rounded-2xl rounded-br-md bg-cream px-3 py-2 text-[13px] text-foreground">Vérifie le revenu net de juin sur le bulletin.</div>
        <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-background-canvas border border-border px-3 py-2 text-[13px] text-foreground-secondary leading-relaxed">
          Le net de juin 2022 est <span className="font-medium text-foreground">2 874,88 €</span>, cohérent avec la ligne PGPA. J'ai ouvert le bulletin à gauche.
        </div>
      </div>
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="h-10 rounded-xl border border-border bg-background-canvas flex items-center px-3 text-[13px] text-foreground-muted">Message à l'assistant…</div>
      </div>
    </div>
  );
}

// Plein écran (pas d'overlay) : le panneau occupe tout le canvas à gauche du
// chat, edge-to-edge, sans backdrop assombri. Fermeture par ✕ ou Esc. La largeur
// du panneau suit en live celle du chat (grip redimensionnable).
function LigneDrawer({ entry, idx, total, onClose, onPrev, onNext }) {
  const [chatWidth, setChatWidth] = useState(CHAT_W_DEFAULT);
  const [railLeft, setRailLeft] = useState(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('invert') === '1'); // rail d'édition à gauche ?
  useEffect(() => {
    const onKey = (ev) => { if (ev.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const onGripDown = useCallback((e) => {
    e.preventDefault();
    const onMove = (ev) => setChatWidth(Math.min(CHAT_W_MAX, Math.max(CHAT_W_MIN, window.innerWidth - ev.clientX)));
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); document.body.style.userSelect = ''; };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);
  return (
    <>
      {/* Conteneur unique (chat + panneau) - cible propre pour la capture Figma. */}
      <div id="ligne-capture" className="fixed inset-0 z-50">
        <MockChat width={chatWidth} onGripDown={onGripDown} />
        <div className="fixed top-0 left-0 bottom-0 z-50" style={{ right: chatWidth, animation: 'fadeIn 0.15s ease-out' }}>
          <PreviewPanel
            kind="piece"
            source={entry.piece}
            ligne={entry.ligne}
            railLeft={railLeft}
            onClose={onClose}
            onPrev={onPrev}
            onNext={onNext}
            navIndex={idx + 1}
            navTotal={total}
            onOpenSource={() => {}}
          />
        </div>
      </div>
      {/* Contrôle de lab : comparer doc/édition à gauche ou à droite */}
      <button
        type="button"
        onClick={() => setRailLeft((v) => !v)}
        className="fixed bottom-4 left-4 z-[60] inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-foreground text-white text-[12px] font-medium shadow-lg hover:bg-foreground-tertiary transition-colors"
      >
        <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={1.75} /> {railLeft ? 'Édition à gauche' : 'Édition à droite'}
      </button>
    </>
  );
}

// Documentation vivante : une barre qui montre comment le CORPS du panneau
// (colonne document + rail de droite) se répartit. `doc`/`rail` en px → % dérivé.
function SplitBar({ doc, rail, railLabel }) {
  const total = doc + rail;
  const docPct = Math.round((doc / total) * 100);
  const railPct = 100 - docPct;
  return (
    <div className="flex h-11 rounded-lg overflow-hidden border border-border">
      <div style={{ width: `${docPct}%`, background: '#ffffff' }} className="flex flex-col items-center justify-center border-r border-border min-w-0 px-1">
        <span className="text-[12px] font-medium text-foreground truncate max-w-full">Document · flex-1</span>
        <span className="text-[10.5px] text-foreground-muted tabular-nums">{doc}px · {docPct}%</span>
      </div>
      <div style={{ width: `${railPct}%`, background: '#eeece6' }} className="flex flex-col items-center justify-center min-w-0 px-1">
        <span className="text-[12px] font-medium text-foreground truncate max-w-full">{railLabel}</span>
        <span className="text-[10.5px] text-foreground-muted tabular-nums">{rail}px · {railPct}%</span>
      </div>
    </div>
  );
}

export default function PreviewPanelLab() {
  const navigate = useNavigate();
  const [kind, setKind] = useState('piece');
  // Navigation croisée : une PJ d'email, ou « voir l'email » depuis une pièce,
  // ouvre une source dans le même panneau. `preview` surcharge le type sélectionné.
  const [preview, setPreview] = useState(null); // { kind, source } | null
  const _params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [subject, setSubject] = useState(_params.get('subject') === 'ligne' ? 'ligne' : 'piece'); // 'piece' | 'ligne'
  const [openLigne, setOpenLigne] = useState(_params.get('open') != null ? Number(_params.get('open')) : null);
  const closeLigne = useCallback(() => setOpenLigne(null), []);
  const prevLigne = useCallback(() => setOpenLigne((i) => (i == null ? i : (i - 1 + POSTE_LIGNES.length) % POSTE_LIGNES.length)), []);
  const nextLigne = useCallback(() => setOpenLigne((i) => (i == null ? i : (i + 1) % POSTE_LIGNES.length)), []);
  const openSource = (t) => { if (t) setPreview({ kind: t.kind, source: t.source || SAMPLES[t.kind] }); };
  const selectKind = (k) => { setPreview(null); setKind(k); };

  const effKind = preview?.kind || kind;
  const effSource = preview?.source || SAMPLES[kind];
  const cfg = PREVIEW_KINDS[effKind];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <button
          onClick={() => navigate('/ui-kit')}
          className="flex items-center gap-1.5 text-[13px] text-foreground-secondary hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au UI Kit
        </button>

        <div className="mb-6">
          <h1 className="text-[19px] sm:text-[22px] font-semibold text-foreground mb-1.5 leading-tight">Preview panel</h1>
          <p className="text-body text-foreground-secondary max-w-[720px] leading-relaxed">
            Un seul châssis qui se reconfigure selon la source. Deux sujets :
            une <span className="font-medium text-foreground">pièce</span> (métadonnées éditables) ou une{' '}
            <span className="font-medium text-foreground">ligne de poste</span> (valeurs éditables, sa pièce en lecture).
            Contrat commun : ouvrir sur le passage cité.
          </p>
        </div>

        {/* Barre de contrôles labellisée au-dessus, sandbox pleine largeur en dessous. */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4 rounded-xl border border-border bg-background-canvas px-4 py-3.5">
            {/* Type de source */}
            <div className="min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Type de source</div>
              <div className="flex flex-wrap gap-1.5">
                {ORDER.map((k) => {
                  const c = PREVIEW_KINDS[k];
                  const Icon = c.icon;
                  const active = k === kind;
                  return (
                    <button
                      key={k}
                      onClick={() => selectKind(k)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors ${active ? 'bg-white border-border-strong shadow-sm' : 'bg-white/70 border-border hover:bg-white'}`}
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0" style={{ background: c.accent.bg, color: c.accent.fg }}>
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </span>
                      <span className="text-[13px] font-medium text-foreground whitespace-nowrap">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sujet du panneau */}
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Sujet</div>
              <div className="inline-flex rounded-lg border border-border bg-white p-1">
                {[{ id: 'piece', label: 'Pièce' }, { id: 'ligne', label: 'Ligne (poste)' }].map((s) => (
                  <button key={s.id} type="button" onClick={() => { setSubject(s.id); setPreview(null); }} className={`h-8 px-3 rounded-md text-[13px] font-medium transition-colors ${subject === s.id ? 'bg-foreground text-white' : 'text-foreground-secondary hover:bg-cream'}`}>{s.label}</button>
                ))}
              </div>
            </div>

            {/* Retour navigation croisée */}
            {preview && (
              <button type="button" onClick={() => setPreview(null)} className="ml-auto self-end inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Revenir à {PREVIEW_KINDS[kind].label}
              </button>
            )}
          </div>

          {/* Sandbox pleine largeur */}
          <div>
            {subject === 'ligne' ? (
              <PosteLignesTable onOpen={setOpenLigne} />
            ) : cfg.body === 'external' ? (
              <ExternalCard source={SAMPLES.web} />
            ) : (
              <PreviewPanel
                key={preview ? `preview:${effKind}:${effSource.name}` : kind}
                kind={effKind}
                source={effSource}
                embedded
                onClose={() => {}}
                onOpenSource={openSource}
                navTotal={!preview && kind === 'piece' ? 17 : 1}
                navIndex={2}
              />
            )}
          </div>
        </div>

        {/* Légende / matrice de décision - scrollable horizontalement en mobile */}
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-foreground-strong mb-3">Ce qu'on ouvre</h2>
          <div className="rounded-xl border border-border bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[160px_1fr_120px_130px] text-[11px] font-medium uppercase tracking-wide text-foreground-muted bg-cream border-b border-border" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  <div className="px-4 py-2.5">Type</div>
                  <div className="px-4 py-2.5">Ce qu'on ouvre</div>
                  <div className="px-4 py-2.5 text-center">Passage</div>
                  <div className="px-4 py-2.5 text-center">Lien externe</div>
                </div>
                {ORDER.map((k) => {
                  const c = PREVIEW_KINDS[k];
                  const hasPassage = !!(SAMPLES[k].passage || SAMPLES[k].passages);
                  const Icon = c.icon;
                  return (
                    <div key={k} className="grid grid-cols-[160px_1fr_120px_130px] text-[13px] border-b border-border last:border-0 items-center">
                      <div className="px-4 py-3 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0" style={{ background: c.accent.bg, color: c.accent.fg }}>
                          <Icon className="w-3 h-3" strokeWidth={1.75} />
                        </span>
                        <span className="font-medium text-foreground">{c.label}</span>
                      </div>
                      <div className="px-4 py-3 text-foreground-secondary">{c.opens}</div>
                      <div className="px-4 py-3 flex justify-center">
                        {hasPassage
                          ? <Check className="w-4 h-4" style={{ color: colors.banner.success.accentHover }} strokeWidth={2} />
                          : <Minus className="w-4 h-4 text-foreground-muted" strokeWidth={2} />}
                      </div>
                      <div className="px-4 py-3 flex justify-center">
                        {c.link
                          ? <span className="inline-flex items-center gap-1 text-[12px] text-foreground-secondary"><ExternalLink className="w-3 h-3" strokeWidth={1.75} /> {c.link}</span>
                          : k === 'web'
                            ? <span className="inline-flex items-center gap-1 text-[12px] text-foreground-secondary"><ExternalLink className="w-3 h-3" strokeWidth={1.75} /> onglet</span>
                            : <Minus className="w-4 h-4 text-foreground-muted" strokeWidth={2} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-[12px] text-foreground-muted mt-2 leading-relaxed max-w-[720px]">
            Ingéré ou rédigé par Norma → interne ; web → onglet. Le défilement au passage ne sert
            qu'aux sources longues appuyant une affirmation à vérifier.
          </p>
        </div>

        {/* ── Largeurs & proportions ── */}
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-foreground-strong mb-1">Largeurs &amp; proportions</h2>
          <p className="text-[13px] text-foreground-secondary mb-4 max-w-[760px] leading-relaxed">
            Panneau = viewport − chat, à gauche du chat (suit le grip). Document en <span className="font-medium text-foreground">flex-1</span>,
            rail de droite fluide. Les seuils se mesurent sur la largeur du panneau, pas du viewport.
          </p>

          {/* Constantes */}
          <div className="rounded-xl border border-border bg-white overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[1.5fr_1.3fr_1.8fr] text-[11px] font-medium uppercase tracking-wide text-foreground-muted bg-cream border-b border-border" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  <div className="px-4 py-2.5">Zone</div>
                  <div className="px-4 py-2.5">Largeur</div>
                  <div className="px-4 py-2.5">Contrainte</div>
                </div>
                {[
                  { zone: 'Chat (assistant)', w: '384px défaut', c: 'min 320 · max 640 · redimensionnable (grip)' },
                  { zone: 'Panneau preview', w: 'viewport − chat', c: 'flush à gauche du chat, suit sa largeur en live' },
                  { zone: 'Colonne document', w: 'flex-1', c: 'prend tout le reste (min-w-0)' },
                  { zone: 'Rail « Éditer la ligne »', w: 'clamp(320 – 360)px', c: '≈ 34 % du panneau · jamais masqué (surface d\'action)' },
                  { zone: 'Rail « Extraits cités »', w: 'clamp(220 – 300)px', c: '≈ 26 % · masqué si panneau < 620px' },
                  { zone: 'Page document', w: 'min(colonne − 48, 980)', c: 'fit-width · plancher 320px' },
                ].map((r, i) => (
                  <div key={i} className="grid grid-cols-[1.5fr_1.3fr_1.8fr] text-[13px] border-b border-border last:border-0 items-center">
                    <div className="px-4 py-2.5 font-medium text-foreground">{r.zone}</div>
                    <div className="px-4 py-2.5 text-foreground-secondary tabular-nums">{r.w}</div>
                    <div className="px-4 py-2.5 text-foreground-secondary">{r.c}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Breakdown proportionnel */}
          <div className="rounded-xl border border-border bg-background-canvas p-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Répartition du corps · grand écran, chat 384 → panneau 1056px (rails à leur cap)
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[12px] font-medium text-foreground mb-1.5">Sujet Ligne — document + rail d'édition</div>
                <SplitBar doc={697} rail={359} railLabel="Éditer la ligne" />
              </div>
              <div>
                <div className="text-[12px] font-medium text-foreground mb-1.5">Sujet Pièce — document + rail citations</div>
                <SplitBar doc={781} rail={275} railLabel="Extraits cités" />
              </div>
            </div>
            <p className="text-[12px] text-foreground-muted mt-3 leading-relaxed max-w-[760px]">
              Panneau étroit : les rails rétrécissent vers leur plancher (édition 320, citations 220).
              Sous <span className="tabular-nums">620px</span>, le rail citations s'efface. Page = <span className="tabular-nums">min(colonne − 48, 980)</span>, plancher 320.
              Le rail d'édition n'est jamais masqué.
            </p>
          </div>
        </div>
      </div>

      {/* Drawer aux vraies proportions, ouvert depuis une ligne du poste */}
      {subject === 'ligne' && openLigne != null && POSTE_LIGNES[openLigne] && (
        <LigneDrawer
          entry={POSTE_LIGNES[openLigne]}
          idx={openLigne}
          total={POSTE_LIGNES.length}
          onClose={closeLigne}
          onPrev={prevLigne}
          onNext={nextLigne}
        />
      )}
    </div>
  );
}


function ExternalCard({ source }) {
  return (
    <div className="rounded-xl border border-border bg-white h-[520px] sm:h-[640px] lg:h-[720px] flex flex-col items-center justify-center text-center px-6 sm:px-10">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-background-subtle text-foreground-tertiary mb-5">
        <Globe className="w-6 h-6" strokeWidth={1.5} />
      </span>
      <div className="text-[15px] font-semibold text-foreground-strong">Lien web - pas de panneau</div>
      <p className="text-[13px] text-foreground-secondary mt-2 max-w-[360px] leading-relaxed">
        On ne contrôle pas la source : la prévisualiser en interne serait une fidélité factice.
        Le clic ouvre directement l'onglet.
      </p>
      <div className="mt-5 inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-background-canvas text-[13px] text-foreground-secondary max-w-full">
        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-foreground-muted" strokeWidth={1.75} />
        <span className="truncate">{source.url}</span>
      </div>
    </div>
  );
}
