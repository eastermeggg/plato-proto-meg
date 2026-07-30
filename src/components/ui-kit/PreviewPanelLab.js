import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, ExternalLink, Check, Minus, PanelTop, Columns2 } from 'lucide-react';
import PreviewPanel, { PREVIEW_KINDS } from '../preview/PreviewPanel';

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
        { from: 'M. Martin', to: 'Cabinet', date: '03/02/2024', body: "Bonjour Maître,\nJe vous transmets le rapport d'expertise reçu ce matin." },
        { from: 'Cabinet', to: 'M. Martin', date: '04/02/2024', body: "Bien reçu, je regarde cela et reviens vers vous rapidement." },
        { from: 'M. Martin', to: 'Cabinet', date: '06/02/2024', cite: true,
          body: "Pour information, l'assureur propose une offre de 28 000 € au titre du DFP, ce qui me semble insuffisant au regard du taux de 12 % retenu par l'expert.",
          // PJ prévisualisable : un clic ouvre la pièce dans le même panneau.
          attachments: [{
            name: 'Offre transactionnelle assureur',
            source: {
              name: 'Offre transactionnelle assureur', type: 'Correspondance', date: '06/02/2024',
              pages: 2, section: 'II - CORRESPONDANCE', numero: '7',
              summary: "Offre d'indemnisation amiable de l'assureur au titre du déficit fonctionnel permanent.",
              provenance: { subject: 'Indemnisation dossier Martin', from: 'M. Martin', date: '06/02/2024', open: { kind: 'email' } },
              passages: [{ page: 1, quote: "Offre au titre du déficit fonctionnel permanent : 28 000 €." }],
            },
          }] },
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
  const [metaLayout, setMetaLayout] = useState('header');
  // Navigation croisée : une PJ d'email, ou « voir l'email » depuis une pièce,
  // ouvre une source dans le même panneau. `preview` surcharge le type sélectionné.
  const [preview, setPreview] = useState(null); // { kind, source } | null
  const openSource = (t) => { if (t) setPreview({ kind: t.kind, source: t.source || SAMPLES[t.kind] }); };
  const selectKind = (k) => { setPreview(null); setKind(k); };

  const effKind = preview?.kind || kind;
  const effSource = preview?.source || SAMPLES[kind];
  const cfg = PREVIEW_KINDS[effKind];
  const isDoc = cfg.body === 'doc';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1320px] mx-auto px-8 py-10">
        <button
          onClick={() => navigate('/ui-kit')}
          className="flex items-center gap-1.5 text-[13px] text-foreground-secondary hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au UI Kit
        </button>

        <div className="mb-6">
          <h1 className="text-[22px] font-semibold text-foreground-strong mb-1.5">Preview panel - un seul panneau, tous les types</h1>
          <p className="text-[14px] text-foreground-secondary max-w-[840px] leading-relaxed">
            Fusion de <span className="font-medium text-foreground">preview-doc</span> et
            {' '}<span className="font-medium text-foreground">preview-panel</span> : un seul châssis
            (barre de titre · métadonnées · corps · pied). De preview-doc il hérite le viewer confortable
            (zoom, plein écran, nav fluide), les métadonnées en <span className="font-medium text-foreground">header vs side panel</span>,
            et le mode <span className="font-medium text-foreground">lecture / édition</span> avec résumé IA.
            De preview-panel, la déclinaison par type et le contrat <span className="font-medium text-foreground">« aller à la citation »</span> -
            un même document pouvant porter <span className="font-medium text-foreground">plusieurs passages</span>,
            tous surlignés, enchaînés par un stepper « Citation i / N ».
          </p>
        </div>

        <div className="grid grid-cols-[280px_1fr] gap-6 items-start">
          {/* Sélecteur de type */}
          <div className="flex flex-col gap-1.5">
            {ORDER.map((k) => {
              const c = PREVIEW_KINDS[k];
              const Icon = c.icon;
              const active = k === kind;
              return (
                <button
                  key={k}
                  onClick={() => selectKind(k)}
                  className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${active ? 'bg-white border-stone-300 shadow-sm' : 'bg-transparent border-border hover:bg-white/60'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0" style={{ background: c.accent.bg, color: c.accent.fg }}>
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="text-[13.5px] font-medium text-foreground">{c.label}</span>
                  </div>
                  <p className="text-[11.5px] text-foreground-muted mt-1.5 leading-snug pl-[38px]">{c.opens}</p>
                </button>
              );
            })}
          </div>

          {/* Panneau */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-4 min-h-8">
              {/* Toggle header / side panel - réservé aux docs (piece, modele) */}
              {isDoc ? (
                <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-cream border border-border">
                  <SegBtn active={metaLayout === 'header'} onClick={() => setMetaLayout('header')} icon={<PanelTop className="w-3.5 h-3.5" />}>
                    Métadonnées en header
                  </SegBtn>
                  <SegBtn active={metaLayout === 'side'} onClick={() => setMetaLayout('side')} icon={<Columns2 className="w-3.5 h-3.5" />}>
                    Métadonnées en side panel
                  </SegBtn>
                </div>
              ) : <span />}
              {/* Fil de navigation croisée */}
              {preview && (
                <button onClick={() => setPreview(null)} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Revenir à {PREVIEW_KINDS[kind].label}
                </button>
              )}
            </div>
            {cfg.body === 'external' ? (
              <ExternalCard source={SAMPLES.web} />
            ) : (
              <PreviewPanel
                key={preview ? `preview:${effKind}:${effSource.name}` : kind}
                kind={effKind}
                source={effSource}
                embedded
                metaLayout={metaLayout}
                onClose={() => {}}
                onOpenSource={openSource}
                navTotal={!preview && kind === 'piece' ? 17 : 1}
                navIndex={2}
              />
            )}
          </div>
        </div>

        {/* Légende / matrice de décision */}
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-foreground-strong mb-3">Ce qu'on ouvre, et quand on défile jusqu'au passage</h2>
          <div className="rounded-xl border border-border bg-white overflow-hidden">
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
                      ? <Check className="w-4 h-4" style={{ color: '#047857' }} strokeWidth={2} />
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
          <p className="text-[12px] text-foreground-muted mt-2 leading-relaxed max-w-[820px]">
            Règle : tout ce que Norma a ingéré ou rédigé s'ouvre en interne ; ce qui vit sur le web
            ouvre un onglet. La JP et l'article de loi s'ouvrent en interne car on les enrichit (quantum,
            version à la date). Le défilement jusqu'au passage n'est requis que pour les sources
            <span className="font-medium text-foreground"> longues</span> appuyant une affirmation à vérifier -
            l'article court, lui, est déjà le passage.
          </p>
        </div>

        {/* Ce que la fusion apporte (hérité de preview-doc) */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Note title="Zoom & plein écran">
            Boutons - / + par paliers (50 → 200 %), mode « Ajusté » sur la largeur, et
            passage en <span className="font-medium text-foreground">inset-0</span> pour la lecture immersive.
            Réservé aux docs (piece, modele).
          </Note>
          <Note title="Header vs side panel">
            Les métadonnées d'un doc vivent en <span className="font-medium text-foreground">header</span> (libère
            la largeur) ou en <span className="font-medium text-foreground">side panel</span> (layout actuel).
            Bascule via le toggle au-dessus du panneau.
          </Note>
          <Note title="Lecture / édition">
            En header, « Modifier » remplace les chips par les vrais composants
            {' '}<span className="font-medium text-foreground">Input</span> du design system (Nom, Type, Date IA,
            Section, Numéro) + le callout de découpage. Résumé IA dépliable en lecture.
          </Note>
          <Note title="Aller à la citation">
            Commun à tous les types : à l'ouverture le panneau surligne le(s) passage(s) et défile
            jusqu'au chunk actif. Plusieurs chunks → stepper « Citation i / N ».
          </Note>
        </div>
      </div>
    </div>
  );
}

function SegBtn({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium transition-colors ${
        active ? 'bg-white text-foreground shadow-sm border border-border' : 'text-foreground-secondary hover:text-foreground'
      }`}
    >
      {icon}
      {children}
    </button>
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

function ExternalCard({ source }) {
  return (
    <div className="rounded-xl border border-border bg-white h-[720px] flex flex-col items-center justify-center text-center px-10">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f5f5f4] text-foreground-tertiary mb-5">
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
