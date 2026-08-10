import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, ExternalLink, Check, Minus, Calendar, Hash, Scissors, Mail, Paperclip, FileText, FileType2, Image as ImageIcon, Search as SearchIcon } from 'lucide-react';
import PreviewPanel, { PREVIEW_KINDS, MetaChip, META_CHIP_TYPES } from '../preview/PreviewPanel';
import { colors } from '../../design-system/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// Preview panel systématisé - lab
//
// Un seul shell (barre de titre · header méta · corps · pied), dérivé du lab
// preview-doc, décliné pour TOUS les types de source citables. Le sélecteur de
// gauche change le `kind` ; le panneau se reconfigure (méta, corps, pied) tout
// en gardant le même châssis et le même contrat « aller à la citation ».
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

export default function PreviewPanelLab() {
  const navigate = useNavigate();
  const [kind, setKind] = useState('piece');
  // Navigation croisée : une PJ d'email, ou « voir l'email » depuis une pièce,
  // ouvre une source dans le même panneau. `preview` surcharge le type sélectionné.
  const [preview, setPreview] = useState(null); // { kind, source } | null
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
          <h1 className="text-[19px] sm:text-[22px] font-semibold text-foreground mb-1.5 leading-tight">Preview panel - un seul panneau, tous les types</h1>
          <p className="text-body text-foreground-secondary max-w-[840px] leading-relaxed">
            Un seul châssis (barre de titre · métadonnées · corps · pied) qui se
            reconfigure par type de source. Viewer confortable pour les documents (zoom, plein écran,
            nav fluide), <span className="font-medium text-foreground">lecture / édition</span> des métadonnées
            avec résumé IA, et contrat commun <span className="font-medium text-foreground">« aller à la citation »</span> :
            un même document peut porter <span className="font-medium text-foreground">plusieurs passages</span>,
            tous surlignés, listés dans le rail droit et enchaînables via le stepper du pied.
          </p>
        </div>

        {/* Layout : selecteur au-dessus (mobile & tablette), à gauche à partir de lg.
             Sur mobile le sélecteur devient une barre horizontale scrollable pour
             que les 7 types tiennent sans dérouler la page. */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 items-start">
          {/* Sélecteur de type */}
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 lg:pb-0">
            {ORDER.map((k) => {
              const c = PREVIEW_KINDS[k];
              const Icon = c.icon;
              const active = k === kind;
              return (
                <button
                  key={k}
                  onClick={() => selectKind(k)}
                  className={`flex-shrink-0 lg:flex-shrink text-left rounded-lg border px-3 py-2.5 transition-colors ${active ? 'bg-white border-border-strong shadow-sm' : 'bg-transparent border-border hover:bg-white/60'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0" style={{ background: c.accent.bg, color: c.accent.fg }}>
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="text-[13.5px] font-medium text-foreground whitespace-nowrap">{c.label}</span>
                  </div>
                  {/* La description sous chaque type n'est utile que dans la colonne verticale */}
                  <p className="hidden lg:block text-[11.5px] text-foreground-muted mt-1.5 leading-snug pl-[38px]">{c.opens}</p>
                </button>
              );
            })}
          </div>

          {/* Panneau */}
          <div>
            {preview && (
              <div className="flex justify-end mb-4 min-h-8">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Revenir à {PREVIEW_KINDS[kind].label}
                </button>
              </div>
            )}
            {cfg.body === 'external' ? (
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
          <h2 className="text-[15px] font-semibold text-foreground-strong mb-3">Ce qu'on ouvre, et quand on défile jusqu'au passage</h2>
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
          <p className="text-[12px] text-foreground-muted mt-2 leading-relaxed max-w-[820px]">
            Règle : tout ce que Norma a ingéré ou rédigé s'ouvre en interne ; ce qui vit sur le web
            ouvre un onglet. La JP et l'article de loi s'ouvrent en interne car on les enrichit (quantum,
            version à la date). Le défilement jusqu'au passage n'est requis que pour les sources
            <span className="font-medium text-foreground"> longues</span> appuyant une affirmation à vérifier -
            l'article court, lui, est déjà le passage.
          </p>
        </div>

        {/* Ce que la fusion apporte (hérité de preview-doc) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Note title="Zoom & plein écran">
            Boutons - / + par paliers (50 → 200 %), mode « Ajusté » sur la largeur, et
            passage en <span className="font-medium text-foreground">inset-0</span> pour la lecture immersive.
            Réservé aux docs (piece, modele).
          </Note>
          <Note title="Lecture / édition">
            « Modifier » dans la barre méta remplace les chips par les vrais composants
            {' '}<span className="font-medium text-foreground">Input</span> du design system (Nom, Type, Date IA,
            Section, Numéro) + le callout de découpage. Résumé IA dépliable en lecture.
          </Note>
          <Note title="Aller à la citation">
            Commun à tous les types : à l'ouverture le panneau surligne le(s) passage(s) et défile
            jusqu'au chunk actif. Le rail droit liste tous les extraits ; le stepper du pied cycle
            entre eux.
          </Note>
        </div>

        {/* MetaChip - variants matrix ─────────────────────────────────────── */}
        <MetaChipCatalog />

        {/* MetaChip - un chip par type (date, pièce, découpage, source…) ────── */}
        <MetaChipTypes />

        {/* Librairies de rendu recommandées ──────────────────────────────── */}
        <RendererStack />
      </div>
    </div>
  );
}

// ── MetaChip : matrice complète des variantes + états ──────────────────────
//
// La forme UNIQUE des atomes de métadonnées du header. Tout chip du header
// (Date, Type, Pièce X n° Y, Découpé, Issu de l'email, Objet, Code…) passe
// par ce composant.
function MetaChipCatalog() {
  const rows = [
    {
      title: 'Composition',
      subtitle: 'les briques : icon · label · value · aside · ai · action',
      items: [
        { name: 'value seul', node: <MetaChip value="Rapport" /> },
        { name: 'label + value', node: <MetaChip label="Type" value="Rapport" /> },
        { name: 'icon + label + value', node: <MetaChip icon={Calendar} label="Date" value="15/03/2023" /> },
        { name: 'icon + value', node: <MetaChip icon={Hash} value="n° 12" /> },
        { name: '+ marqueur IA', node: <MetaChip icon={Calendar} label="Date" value="15/03/2023" ai /> },
        {
          name: 'value composé (ReactNode)',
          node: (
            <MetaChip
              icon={Hash}
              label="Pièce"
              value={<>I - MEDICAL <span className="text-foreground-muted mx-1">·</span><span className="tabular-nums">n° 2</span></>}
            />
          ),
        },
        { name: '+ aside truncable', node: <MetaChip icon={Scissors} label="Document découpé" aside="rapport_expertise_médicale_final_v3.pdf" /> },
      ],
    },
    {
      title: 'Variant',
      subtitle: 'fond canvas (défaut) vs fond cream (identité / chip primaire du doc)',
      items: [
        { name: 'default', node: <MetaChip icon={Calendar} label="Date" value="15/03/2023" /> },
        { name: 'strong', node: <MetaChip variant="strong" icon={Hash} label="Pièce" value={<>I - MEDICAL <span className="text-foreground-muted mx-1">·</span><span className="tabular-nums">n° 2</span></>} /> },
      ],
    },
    {
      title: 'Interactif — action',
      subtitle: 'chip statique + lien texte à droite (le chip lui-même n\'est pas cliquable)',
      items: [
        {
          name: 'action simple',
          node: <MetaChip icon={Scissors} label="Document découpé" aside="rapport_expertise.pdf" action={{ label: 'Ajuster', onClick: () => {} }} />,
        },
      ],
    },
    {
      title: 'Interactif — chip cliquable',
      subtitle: 'tout le chip est un bouton ; hover renforce contour + texte',
      items: [
        {
          name: 'default (clickable)',
          node: <MetaChip icon={Mail} label="Issu de l'email" aside="Indemnisation dossier Martin" onClick={() => {}} />,
        },
        {
          name: 'disabled',
          node: <MetaChip icon={Mail} label="Issu de l'email" aside="Indemnisation dossier Martin" onClick={() => {}} disabled />,
        },
      ],
    },
    {
      title: 'Usages hors doc',
      subtitle: 'les autres kinds passent aussi par MetaChip - un langage, un composant',
      items: [
        { name: 'jp · Juridiction', node: <MetaChip label="Juridiction" value="Cour de cassation, 2e civ." /> },
        { name: 'jp · n° dossier', node: <MetaChip icon={Hash} value="n° 18-21.234" /> },
        { name: 'email · PJ', node: <MetaChip icon={Paperclip} label="Pièces jointes" value={3} /> },
        { name: 'loi · en vigueur', node: <MetaChip icon={Calendar} label="En vigueur au" value="29/07/2026" /> },
      ],
    },
  ];

  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">MetaChip - la forme unique des métadonnées</h2>
          <p className="text-caption text-foreground-muted mt-1 max-w-[720px] leading-relaxed">
            Toute donnée du header (Pièce X n° Y, Date IA, Découpé, Issu de l'email, Objet, Code…) passe
            par un seul composant. Trois vecteurs de variation : COMPOSITION (icon / label / value / aside / ai),
            VARIANT (default vs strong), INTERACTION (statique · action inline · chip cliquable).
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {rows.map((row, i) => (
          <div key={i} className={`grid grid-cols-1 md:grid-cols-[220px_1fr] ${i > 0 ? 'border-t border-border' : ''}`}>
            <div className="p-4 sm:p-5 md:border-r border-b md:border-b-0 border-border bg-background-canvas">
              <div className="text-[13px] font-semibold text-foreground">{row.title}</div>
              <div className="text-caption text-foreground-muted mt-1 leading-relaxed">{row.subtitle}</div>
            </div>
            <div className="p-4 sm:p-5 flex flex-col gap-3">
              {row.items.map((it, j) => (
                <div key={j} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr] items-start sm:items-center gap-1.5 sm:gap-4">
                  <div className="text-caption text-foreground-muted" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{it.name}</div>
                  <div className="min-w-0">{it.node}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MetaChip : un chip canonique par TYPE ──────────────────────────────────
//
// La matrice ci-dessus montre les AXES de variation (composition / variant /
// interaction). Ici on montre l'autre lecture : un chip prêt à l'emploi par
// TYPE de métadonnée. Chaque type porte son icône + label depuis
// META_CHIP_TYPES ; on ne passe que la value (ou l'aside). Les deux colonnes
// Default / Strong reprennent les deux `Style` de l'atome Figma.
function MetaChipTypes() {
  const sep = <span className="text-foreground-muted mx-1" aria-hidden>·</span>;
  const rows = [
    { type: 'piece', hint: 'identité de la pièce', value: <>I - MEDICAL {sep}<span className="tabular-nums">n° 2</span></> },
    { type: 'date', hint: 'date du document', value: '15/03/2023' },
    { type: 'type', hint: 'nature du document', value: "Rapport d'expertise" },
    { type: 'decoupage', hint: 'issu d\'un découpage', aside: 'rapport_expertise.pdf' },
    { type: 'source', hint: 'provenance (email, dépôt…)', aside: 'Indemnisation dossier Martin' },
    { type: 'juridiction', hint: 'jurisprudence', value: 'Cour de cassation, 2e civ.' },
    { type: 'numero', hint: 'n° de dossier / pourvoi', value: '18-21.234' },
    { type: 'objet', hint: 'email', value: 'Notification expertise' },
    { type: 'messages', hint: 'fil de discussion', value: 4 },
    { type: 'piecesJointes', hint: 'pièces jointes email', value: 3 },
    { type: 'code', hint: 'texte de loi', value: 'Code civil' },
    { type: 'enVigueur', hint: 'version en vigueur', value: '29/07/2026' },
    { type: 'periode', hint: 'ligne structurée (cotisations…)', value: 'Janv. - Mars 2024' },
    { type: 'web', hint: 'source web', aside: 'legifrance.gouv.fr' },
  ];

  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">MetaChip - un chip par type</h2>
          <p className="text-caption text-foreground-muted mt-1 max-w-[720px] leading-relaxed">
            Chaque type de métadonnée (Date, Pièce, Découpage, Source, Juridiction, Objet, Code…) a son
            icône et son label canoniques dans <code className="text-foreground-secondary">META_CHIP_TYPES</code> :
            au point d'appel on ne passe que la valeur. Les deux colonnes reprennent les deux <em>Style</em> de
            l'atome Figma - Default (fond canvas) et Strong (fond cream, valeur medium).
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b border-border bg-background-canvas">
          <div className="p-3 sm:px-5 text-caption font-semibold text-foreground-secondary border-r border-border">Default</div>
          <div className="p-3 sm:px-5 text-caption font-semibold text-foreground-secondary">Strong</div>
        </div>
        {rows.map((r, i) => (
          <div key={r.type} className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] ${i > 0 ? 'border-t border-border' : ''}`}>
            <div className="p-4 sm:px-5 flex flex-col gap-2 border-r border-border min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-caption text-foreground-muted" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r.type}</span>
                <span className="text-caption text-foreground-muted">· {r.hint}</span>
              </div>
              <MetaChip type={r.type} variant="default" value={r.value} aside={r.aside} />
            </div>
            <div className="p-4 sm:px-5 flex items-center min-w-0">
              <MetaChip type={r.type} variant="strong" value={r.value} aside={r.aside} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-caption text-foreground-muted mt-3 leading-relaxed max-w-[720px]">
        Ces presets restent surchargeables : <code className="text-foreground-secondary">icon</code>,{' '}
        <code className="text-foreground-secondary">label</code> et <code className="text-foreground-secondary">variant</code>{' '}
        passés explicitement priment sur le type. On peut aussi ajouter <code className="text-foreground-secondary">ai</code>,{' '}
        <code className="text-foreground-secondary">action</code> ou <code className="text-foreground-secondary">onClick</code> sur n'importe quel type.
      </p>
    </div>
  );
}

function Note({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="text-[13px] font-semibold text-foreground mb-1">{title}</div>
      <p className="text-[12.5px] text-foreground-secondary leading-relaxed">{children}</p>
    </div>
  );
}

// ── Librairies de rendu ─────────────────────────────────────────────────────
// La coque du PreviewPanel est prête à recevoir un vrai moteur de rendu ; les
// bodies actuels sont des skeletons. Ce bloc documente le stack retenu, quand
// venir chercher chaque lib et le contrat de citation qu'elle doit respecter.
//
// Règle : la coque, le contrat `passages: [{page, quote}]`, le scroll-vers-
// citation et le stepper « Citation i / N » sont AGNOSTIQUES du moteur. Un
// switch de lib ne touche que le body du kind concerné.
function RendererStack() {
  const stack = [
    {
      key: 'pdf',
      icon: FileText,
      kinds: ['piece', 'modele'],
      lib: 'react-pdf',
      pkg: '@wojtekmaj/react-pdf',
      npm: 'react-pdf',
      underlying: 'Mozilla pdf.js',
      version: '~9.x',
      license: 'MIT',
      why: "Le wrapper React canonique autour de pdf.js. Expose un textLayer réel : on parcourt les spans du calque, on retrouve la quote, on l'entoure de data-cite - le contrat de citation existant continue de marcher sans modification.",
      integrate: [
        'Remplace DocPage.js par <Page /> de react-pdf',
        'Garde le container [data-page] pour que goToPage/onScroll continuent',
        'Après renderTextLayer, walker le DOM pour marquer les quotes en [data-cite]',
      ],
      caveat: 'Le worker pdfjs doit être servi statiquement (public/pdf.worker.min.js).',
    },
    {
      key: 'docx',
      icon: FileType2,
      kinds: ['piece (docx)', 'modele'],
      lib: 'docx-preview',
      pkg: 'docx-preview',
      npm: 'docx-preview',
      underlying: 'JSZip + DOM natif',
      version: '~0.3.x',
      license: 'Apache-2.0',
      why: "Rend un .docx en HTML DANS le container de scroll, ce qui préserve la sélection de texte, mark.js et le contrat data-cite. Alternative mammoth.js si l'objectif est un HTML propre plutôt qu'une mise en page fidèle (perd le layout).",
      integrate: [
        "renderAsync(buffer, containerEl) puis walker le DOM comme pour le PDF",
        'La pagination est logique (par saut de page) - on peut la lire via CSS pour émettre les [data-page]',
      ],
      caveat: 'Rendu bureau uniquement (pas de fallback texte accessible).',
    },
    {
      key: 'image',
      icon: ImageIcon,
      kinds: ['piece (jpg/png)'],
      lib: 'react-medium-image-zoom',
      pkg: 'react-medium-image-zoom',
      npm: 'react-medium-image-zoom',
      underlying: '<img> natif + lightbox',
      version: '~5.x',
      license: 'MIT',
      why: "Une pièce photo (constat, scan) ouvre en zoom plein-écran à un clic. Pour les évidences très haute résolution (plans, scans médicaux gigapixel), remplacer par OpenSeadragon (rendu en tuiles). Le highlight n'a pas d'équivalent - une overlay <mark> absolute-positionnée sert de citation.",
      integrate: [
        'body.image = <Zoom><img/></Zoom>',
        'Overlay <div data-cite style={{ position:absolute, inset:passage.rect }} /> pour marquer une zone citée',
      ],
      caveat: 'Le contrat quote → text-match ne marche pas sur image. La citation devient un rectangle (rect) ou une page.',
    },
    {
      key: 'search',
      icon: SearchIcon,
      kinds: ['tous'],
      lib: 'mark.js',
      pkg: 'mark.js',
      npm: 'mark.js',
      underlying: 'DOM walker',
      version: '~8.x',
      license: 'MIT',
      why: 'Le walker que le body du panneau utilise déjà logiquement : trouver la quote dans le texte rendu, entourer le noeud d\'un <mark data-cite>. Marche uniformément sur PDF (textLayer), DOCX (HTML), et sur les corps JP/loi/email/ligne existants.',
      integrate: [
        'new Mark(bodyEl).mark(passage.quote, { className: "data-cite", each: n => n.dataset.cite = "1" })',
        'La logique de scroll/stepper dans PreviewPanel.js est inchangée',
      ],
      caveat: 'Sur PDF, mark.js opère sur le textLayer une fois rendu - attendre onRenderSuccess de react-pdf avant de marquer.',
    },
  ];

  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Librairies de rendu - le stack pour brancher le vrai contenu</h2>
          <p className="text-caption text-foreground-muted mt-1 max-w-[820px] leading-relaxed">
            Aujourd'hui les bodies « doc » sont des skeletons. Voici les 4 briques open-source retenues pour
            porter le vrai rendu, avec l'endroit précis où chacune se branche dans la coque du PreviewPanel.
            La coque, le contrat <code className="text-[11.5px] px-1 rounded bg-background-subtle">passages</code>,
            le scroll-vers-citation et le stepper restent inchangés.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {stack.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={r.key} className={`grid grid-cols-1 md:grid-cols-[220px_1fr] ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className="p-4 sm:p-5 md:border-r border-b md:border-b-0 border-border bg-background-canvas flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white border border-border text-foreground-secondary flex-shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-foreground truncate">{r.lib}</div>
                    <div className="text-[11px] text-foreground-muted truncate" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{r.npm}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-1 text-[11.5px] text-foreground-secondary">
                  <div><span className="text-foreground-muted">Kind</span> <span className="text-foreground">{r.kinds.join(', ')}</span></div>
                  <div><span className="text-foreground-muted">Base</span> <span className="text-foreground">{r.underlying}</span></div>
                  <div><span className="text-foreground-muted">Version</span> <span className="text-foreground tabular-nums">{r.version}</span></div>
                  <div><span className="text-foreground-muted">Licence</span> <span className="text-foreground">{r.license}</span></div>
                </div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.04em' }}>Pourquoi ce choix</div>
                  <p className="text-[13px] leading-6 text-foreground-secondary">{r.why}</p>
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.04em' }}>Intégration dans la coque</div>
                  <ul className="text-[13px] leading-6 text-foreground-secondary space-y-1">
                    {r.integrate.map((step, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-foreground-muted flex-shrink-0" aria-hidden>·</span>
                        <span className="min-w-0"><code className="text-[12px] px-1 rounded bg-background-subtle">{step.split(' ')[0]}</code> {step.split(' ').slice(1).join(' ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {r.caveat && (
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.04em' }}>Attention</div>
                    <p className="text-[13px] leading-6 text-foreground-secondary">{r.caveat}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-lg border border-border bg-background-canvas p-4">
        <div className="text-[13px] font-semibold text-foreground mb-1.5">Alternative commerciale (unifiée)</div>
        <p className="text-[12.5px] leading-6 text-foreground-secondary">
          <span className="font-medium text-foreground">Apryse WebViewer</span> (ex-PDFTron) ou{' '}
          <span className="font-medium text-foreground">Nutrient</span> (ex-PSPDFKit) rendent PDF, .docx, .xlsx,
          .pptx et images derrière une seule API, avec annotation et rédaction en standard. À reconsidérer si
          l'annotation devient centrale à tous les kinds. Licence entreprise (~4 - 10 k€/an) et moins de
          contrôle sur la coque - on l'enveloppe au lieu de coller au DS Plato pixel-à-pixel. Le stack
          open-source ci-dessus reste la voie par défaut : l'architecture actuelle (dispatch{' '}
          <code className="text-[11.5px] px-1 rounded bg-background-subtle">cfg.body === 'doc'</code>,
          contrat <code className="text-[11.5px] px-1 rounded bg-background-subtle">data-cite</code>) est
          conçue pour rendre le swap chirurgical.
        </p>
      </div>
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
