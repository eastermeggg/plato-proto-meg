import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Download, Share2 } from 'lucide-react';
import LoiHoverCard, { LoiCard, LoiRef, loiSourceOf } from '../ui/LoiHoverCard';
import { BadgePill } from '../social/CotisationsSection';
import PreviewPanel from '../preview/PreviewPanel';

// ─────────────────────────────────────────────────────────────────────────────
// Popover article de loi - lab
//
// Le survol d'une référence de texte ouvre la fiche d'identité de l'article,
// partout où un article est cité : prose d'un acte en rédaction, badges de
// source du chiffrage, et corps du PreviewPanel (décision JP, document Word,
// renvois d'un article à un autre). Le clic « Voir l'article » ouvre la source
// loi complète ; Légifrance reste le lien externe.
// ─────────────────────────────────────────────────────────────────────────────

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";

const ARTICLES = {
  'l1221-6': {
    article: 'Art. L. 1221-6', code: 'Code du travail', statut: 'vigueur',
    creeLe: '1 mai 2008', version: '1 mai 2008',
    extrait: "Les informations demandées, sous quelque forme que ce soit, au candidat à un emploi ne peuvent avoir comme finalité que d'apprécier sa capacité à occuper l'emploi proposé ou ses aptitudes professionnelles. Ces informations doivent présenter un lien direct et nécessaire avec l'emploi proposé ou avec l'évaluation des aptitudes professionnelles.",
    alineas: [
      { text: "Les informations demandées, sous quelque forme que ce soit, au candidat à un emploi ne peuvent avoir comme finalité que d'apprécier sa capacité à occuper l'emploi proposé ou ses aptitudes professionnelles.", cite: true },
      { text: "Ces informations doivent présenter un lien direct et nécessaire avec l'emploi proposé ou avec l'évaluation des aptitudes professionnelles." },
      { text: "Le candidat est tenu de répondre de bonne foi à ces demandes d'informations." },
    ],
    legifranceId: 'LEGIARTI000006900843',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006900843',
  },
  'l1132-1': {
    article: 'Art. L. 1132-1', code: 'Code du travail', statut: 'modifie',
    creeLe: '1 mai 2008', version: '23 mars 2022',
    modifiePar: 'LOI n° 2022-401 du 21 mars 2022, art. 1',
    extrait: "Aucune personne ne peut être écartée d'une procédure de recrutement ou de l'accès à un stage ou à une période de formation en entreprise, aucun salarié ne peut être sanctionné, licencié ou faire l'objet d'une mesure discriminatoire, directe ou indirecte, en raison de son origine, de son sexe, de ses mœurs, de son orientation sexuelle, de son identité de genre, de son âge ou de sa situation de famille.",
    alineas: [
      { text: "Aucune personne ne peut être écartée d'une procédure de recrutement ou de l'accès à un stage ou à une période de formation en entreprise, aucun salarié ne peut être sanctionné, licencié ou faire l'objet d'une mesure discriminatoire, directe ou indirecte, telle que définie à l'article 1er de la loi n° 2008-496 du 27 mai 2008.", cite: true },
    ],
    legifranceId: 'LEGIARTI000045391558',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045391558',
  },
  'civ-9': {
    article: 'Art. 9', code: 'Code civil', statut: 'vigueur',
    creeLe: '19 juillet 1970', version: '1 août 1970',
    extrait: "Chacun a droit au respect de sa vie privée. Les juges peuvent, sans préjudice de la réparation du dommage subi, prescrire toutes mesures, telles que séquestre, saisie et autres, propres à empêcher ou faire cesser une atteinte à l'intimité de la vie privée.",
    alineas: [
      { text: "Chacun a droit au respect de sa vie privée.", cite: true },
      { text: "Les juges peuvent, sans préjudice de la réparation du dommage subi, prescrire toutes mesures, telles que séquestre, saisie et autres, propres à empêcher ou faire cesser une atteinte à l'intimité de la vie privée : ces mesures peuvent, s'il y a urgence, être ordonnées en référé." },
    ],
    legifranceId: 'LEGIARTI000006419288',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006419288',
  },
  'l122-14-4': {
    article: 'Art. L. 122-14-4', code: 'Code du travail (ancien)', statut: 'abroge',
    creeLe: '23 novembre 1973', version: '18 janvier 2002',
    abrogePar: 'Ordonnance n° 2007-329 du 12 mars 2007, art. 12',
    extrait: "Si le licenciement d'un salarié survient sans observation de la procédure requise, mais pour une cause réelle et sérieuse, le tribunal impose à l'employeur d'accomplir la procédure prévue et accorde au salarié une indemnité qui ne peut être supérieure à un mois de salaire.",
    alineas: [
      { text: "Si le licenciement d'un salarié survient sans observation de la procédure requise, mais pour une cause réelle et sérieuse, le tribunal impose à l'employeur d'accomplir la procédure prévue et accorde au salarié une indemnité qui ne peut être supérieure à un mois de salaire.", cite: true },
    ],
    legifranceId: 'LEGIARTI000006646284',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006646284',
  },
};

const A = ARTICLES;

// ── Sources pour le PreviewPanel : les références sont dans la prose ─────────

// Décision JP : les motifs visent les textes, chaque visa est survolable.
const JP_PREVIEW = {
  name: 'Cass. soc., 25 juin 2025, n° 23-14.482',
  jp: {
    juridiction: 'Cour de cassation, chambre sociale', date: '25 juin 2025', numero: '23-14.482',
    faits: "Engagé le 3 janvier 2019 en qualité de technicien de maintenance, M. Karim a été licencié le 12 mars 2022 pour avoir refusé de renseigner un questionnaire interne portant notamment sur sa situation de famille et son intention d'avoir des enfants.",
    moyens: ["L'employeur fait grief à l'arrêt d'avoir jugé le licenciement nul, alors que les informations demandées présentaient, selon lui, un lien direct et nécessaire avec l'organisation des astreintes, au sens de l'article ", { loi: A['l1221-6'], label: 'L. 1221-6 du code du travail' }, "."],
    motifs: [
      { text: ["Vu les articles ", { loi: A['l1221-6'], label: 'L. 1221-6' }, " et ", { loi: A['l1132-1'], label: 'L. 1132-1' }, " du code du travail, ensemble l'article ", { loi: A['civ-9'], label: '9 du code civil' }, " :"] },
      { text: "Attendu que les questions relatives à la situation de famille du candidat sont dépourvues de lien direct et nécessaire avec l'emploi proposé ; qu'en les érigeant en condition de l'embauche puis du maintien dans l'emploi, l'employeur a méconnu les textes susvisés ;", cite: true },
      { text: "Qu'en statuant comme elle l'a fait, la cour d'appel a exactement caractérisé la nullité du licenciement ;" },
    ],
    dispositif: "REJETTE le pourvoi ; condamne la société Technimat Ouest aux dépens.",
  },
  passage: { anchor: true },
};

// Document Word (conclusions adverses) : la partie adverse cite les mêmes textes.
const DOC_PREVIEW = {
  name: 'Conclusions adverses - Technimat Ouest', docType: 'word', type: 'Conclusions', date: '02/09/2026',
  section: 'II - PROCEDURE', numero: '14', pages: 1,
  summary: "Conclusions en défense : le questionnaire relèverait de l'évaluation des aptitudes professionnelles et ne caractériserait aucune discrimination.",
  wordBody: [
    { heading: true, text: "II. Sur la légitimité du questionnaire d'embauche" },
    { text: ["La société concluante rappelle qu'aux termes de l'article ", { loi: A['l1221-6'], label: 'L. 1221-6 du Code du travail' }, ", l'employeur est fondé à solliciter du candidat toute information ayant pour finalité d'apprécier sa capacité à occuper l'emploi proposé ou ses aptitudes professionnelles."] },
    { text: ["Le questionnaire litigieux ne saurait caractériser une discrimination au sens de l'article ", { loi: A['l1132-1'], label: 'L. 1132-1' }, ", les questions posées visant exclusivement l'organisation des astreintes du service maintenance."], cite: true, page: 1 },
    { text: ["Il ne saurait davantage être reproché à la société une atteinte à la vie privée au sens de l'article ", { loi: A['civ-9'], label: '9 du Code civil' }, ", le salarié ayant librement renseigné les rubriques facultatives."] },
    { text: "À titre subsidiaire, la société conteste le quantum sollicité, la demande n'étant étayée par aucune pièce justificative." },
  ],
  passages: [{ page: 1, quote: "Le questionnaire litigieux ne saurait caractériser une discrimination au sens de l'article L. 1132-1." }],
};

const CHAT_BADGES = [
  { key: 'l1221-6', source: { type: 'LOI', citation: 'Art. L. 1221-6 C. trav.' } },
  { key: 'l1132-1', source: { type: 'LOI', citation: 'Art. L. 1132-1 C. trav.' } },
  { key: 'civ-9', source: { type: 'LOI', citation: 'Art. 9 C. civ.' } },
];

const COMPORTEMENT = [
  { regle: 'Portée', detail: "Partout où un article est cité : prose d'un acte, badges de source (famille TEXTE), corps du PreviewPanel (décision, document Word, renvois d'un article)." },
  { regle: 'Ouverture', detail: 'Survol franc de 300 ms, ou focus clavier sur la référence.' },
  { regle: 'Fermeture', detail: "160 ms de grâce : le pointeur peut traverser l'écart jusqu'à la carte. Échap et le scroll ferment." },
  { regle: 'Position', detail: 'Sous la référence, centrée et bornée au viewport ; bascule au-dessus si la place manque en bas.' },
  { regle: 'Hiérarchie', detail: "Le survol donne l'aperçu ; « Voir l'article » ouvre le panneau interne ; Légifrance ouvre l'onglet externe." },
  { regle: 'Extrait', detail: "4 lignes maximum : l'aperçu situe, il ne remplace pas la lecture de l'article." },
];

// ── Page mock : chrome fixe + en-tête de page sticky + acte + assistant ──────

function PageTabs() {
  return (
    <div className="flex items-center gap-0.5">
      {['Aperçu', 'Pièces', 'Chiffrage', 'Rédaction'].map((t) => (
        <span key={t} className={`h-7 px-2.5 inline-flex items-center rounded-md text-[12.5px] font-medium ${t === 'Rédaction' ? 'bg-cream text-foreground' : 'text-foreground-secondary'}`}>{t}</span>
      ))}
    </div>
  );
}

function PageMock({ artRef, openPanel }) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Chrome fixe : breadcrumb + onglets + outils */}
      <div className="h-12 px-4 border-b border-border flex items-center gap-5 bg-white">
        <div className="flex items-center gap-1.5 text-[13px] min-w-0">
          <span className="text-foreground-muted">Dossiers</span>
          <ChevronRight className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
          <span className="font-medium text-foreground truncate">Karim c. Technimat Ouest</span>
        </div>
        <PageTabs />
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cream text-[11px] font-semibold text-foreground-tertiary">MR</span>
        </div>
      </div>

      <div className="flex" style={{ height: 640 }}>
        {/* Contenu : en-tête de page sticky + papier de l'acte */}
        <div className="flex-1 min-w-0 overflow-y-auto" style={{ background: '#f8f7f5' }}>
          <div className="sticky top-0 z-10 px-8 py-3 border-b border-border bg-background/95 backdrop-blur-sm flex items-center gap-3">
            <h3 className="text-[15px] font-semibold text-foreground">Conclusions au fond</h3>
            <span className="inline-flex items-center h-5.5 px-2 py-0.5 rounded-md bg-cream text-[11px] font-medium text-foreground-tertiary">Brouillon</span>
            <div className="ml-auto flex items-center gap-1">
              <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12.5px] font-medium text-foreground-secondary hover:bg-cream transition-colors"><Download className="w-3.5 h-3.5" strokeWidth={1.75} /> Exporter</button>
              <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12.5px] font-medium text-foreground-secondary hover:bg-cream transition-colors"><Share2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Partager</button>
            </div>
          </div>
          <div className="px-8 py-7">
            <div className="max-w-[680px] mx-auto bg-white border border-border shadow-sm rounded-md px-12 py-11">
              <div className="text-center">
                <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, letterSpacing: '-0.4px' }} className="text-foreground">Conclusions au fond</div>
                <div className="text-[12px] text-foreground-muted mt-1.5">Pour M. Yanis Karim · Contre SAS Technimat Ouest</div>
              </div>
              <div className="h-px bg-border my-7" />
              <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-4" style={{ fontFamily: MONO }}>II. Discussion</div>
              <div className="space-y-4 text-[13.5px] leading-[23px] text-foreground-secondary text-justify">
                <p>
                  Attendu qu'aux termes de l'article {artRef('l1221-6', 'L. 1221-6 du Code du travail')}, les informations
                  demandées au candidat à un emploi ne peuvent avoir pour finalité que d'apprécier sa capacité à occuper
                  l'emploi proposé ou ses aptitudes professionnelles ; que le questionnaire remis à M. Karim porte sur sa
                  situation de famille et son intention d'avoir des enfants (pièce n° 4) ;
                </p>
                <p>
                  Que l'article {artRef('l1132-1', 'L. 1132-1')} du même code prohibe toute mesure discriminatoire, directe
                  ou indirecte, à raison notamment de la situation de famille du salarié ; que le questionnaire litigieux
                  méconnaît en outre l'article {artRef('civ-9', '9 du Code civil')}, qui garantit à chacun le droit au
                  respect de sa vie privée ;
                </p>
                <p>
                  Que la défenderesse ne saurait utilement invoquer l'ancien article {artRef('l122-14-4', 'L. 122-14-4')},
                  abrogé depuis l'ordonnance du 12 mars 2007, pour cantonner la sanction à un mois de salaire (pièce n° 12) ;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rail assistant : les badges de source portent le même survol */}
        <div className="w-[320px] flex-shrink-0 border-l border-border flex flex-col bg-white">
          <div className="h-11 px-4 border-b border-border flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-foreground text-white text-[11px] font-semibold">N</span>
            <span className="text-[13px] font-medium text-foreground">Assistant</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3">
            <div className="max-w-[88%] ml-auto rounded-2xl rounded-br-md bg-cream px-3 py-2 text-[12.5px] text-foreground">Fonde la discussion sur la protection du candidat.</div>
            <div className="max-w-[95%] rounded-2xl rounded-bl-md border border-border px-3 py-2.5 text-[12.5px] leading-relaxed text-foreground-secondary" style={{ background: '#f8f7f5' }}>
              <p>J'ai appuyé la discussion sur trois textes :</p>
              <span className="flex flex-wrap gap-1.5 my-2">
                {CHAT_BADGES.map(({ key, source }) => (
                  <LoiHoverCard key={key} article={ARTICLES[key]} onOpen={openPanel(key)}>
                    <BadgePill source={source} onOpen={openPanel(key)} />
                  </LoiHoverCard>
                ))}
              </span>
              <p>Le questionnaire porte sur la situation de famille : le terrain discriminatoire est le plus solide, la vie privée vient en renfort.</p>
            </div>
          </div>
          <div className="p-3 border-t border-border flex-shrink-0">
            <div className="h-9 rounded-xl border border-border flex items-center px-3 text-[12.5px] text-foreground-muted" style={{ background: '#f8f7f5' }}>Message à l'assistant…</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PreviewPanel embarqué avec navigation croisée (ref → source loi) ─────────

function EmbeddedPanelDemo({ kind, source }) {
  const [preview, setPreview] = useState(null); // { kind, source } | null
  const effKind = preview?.kind || kind;
  const effSource = preview?.source || source;
  return (
    <div>
      {preview && (
        <button
          type="button"
          onClick={() => setPreview(null)}
          className="mb-2 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Revenir à {source.name}
        </button>
      )}
      <PreviewPanel
        key={`${effKind}:${effSource.name}`}
        kind={effKind}
        source={effSource}
        embedded
        onClose={() => {}}
        onOpenSource={(t) => { if (t) setPreview({ kind: t.kind, source: t.source }); }}
      />
    </div>
  );
}

export default function LoiHoverLab() {
  const navigate = useNavigate();
  const [openArticle, setOpenArticle] = useState(null); // clé ARTICLES | null
  const openPanel = useCallback((key) => () => setOpenArticle(key), []);
  const closePanel = useCallback(() => setOpenArticle(null), []);
  useEffect(() => {
    if (!openArticle) return;
    const onKey = (ev) => { if (ev.key === 'Escape') closePanel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openArticle, closePanel]);

  const artRef = (key, label) => (
    <LoiHoverCard article={ARTICLES[key]} onOpen={openPanel(key)}>
      <LoiRef>{label}</LoiRef>
    </LoiHoverCard>
  );

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
          <h1 className="text-[19px] sm:text-[22px] font-semibold text-foreground mb-1.5 leading-tight">Popover article de loi</h1>
          <p className="text-body text-foreground-secondary max-w-[720px] leading-relaxed">
            Survoler une référence de texte ouvre la <span className="font-medium text-foreground">fiche d'identité</span> de
            l'article : intitulé, statut de version, extrait et repères, sans quitter la lecture. Partout où un article
            est cité : acte en rédaction, badges de source, corps du PreviewPanel. Le clic ouvre l'article complet dans
            le panneau ; Légifrance reste le lien externe.
          </p>
        </div>

        {/* ── En pleine page : rédaction + assistant ── */}
        <div className="mb-10">
          <h2 className="text-[15px] font-semibold text-foreground-strong mb-1">En pleine page - rédaction d'un acte</h2>
          <p className="text-[13px] text-foreground-secondary mb-4 max-w-[760px] leading-relaxed">
            La prose de l'acte et les badges de source de l'assistant portent le même survol.
            « Voir l'article » ouvre le panneau loi aux vraies proportions.
          </p>
          <PageMock artRef={artRef} openPanel={openPanel} />
        </div>

        {/* ── Dans le PreviewPanel ── */}
        <div className="mb-10">
          <h2 className="text-[15px] font-semibold text-foreground-strong mb-1">Dans le PreviewPanel</h2>
          <p className="text-[13px] text-foreground-secondary mb-4 max-w-[760px] leading-relaxed">
            Les corps du panneau citent des articles dans leur prose : visas et motifs d'une décision,
            paragraphes d'un document Word. Le survol donne la fiche ; « Voir l'article » rouvre le
            même panneau sur la source loi, avec retour.
          </p>
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-2" style={{ fontFamily: MONO }}>Décision (JP) · visas et motifs survolables</div>
              <EmbeddedPanelDemo kind="jp" source={JP_PREVIEW} />
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mb-2" style={{ fontFamily: MONO }}>Document Word (conclusions adverses) · références dans les paragraphes</div>
              <EmbeddedPanelDemo kind="piece" source={DOC_PREVIEW} />
            </div>
          </div>
        </div>

        {/* ── États de version ── */}
        <div className="mb-10">
          <h2 className="text-[15px] font-semibold text-foreground-strong mb-1">États de version</h2>
          <p className="text-[13px] text-foreground-secondary mb-4 max-w-[720px] leading-relaxed">
            Le tampon dit d'emblée si le texte fait foi. Un article modifié affiche la loi de dernière
            modification ; un article abrogé affiche le texte abrogatif.
          </p>
          <div className="flex flex-wrap items-start gap-5">
            {[
              { key: 'civ-9', caption: 'En vigueur' },
              { key: 'l1132-1', caption: 'Modifié - version courante datée' },
              { key: 'l122-14-4', caption: 'Abrogé - cité pour mémoire' },
            ].map(({ key, caption }) => (
              <div key={key}>
                <LoiCard article={ARTICLES[key]} onOpen={openPanel(key)} />
                <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted mt-2.5" style={{ fontFamily: MONO }}>{caption}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comportement ── */}
        <div className="mb-8">
          <h2 className="text-[15px] font-semibold text-foreground-strong mb-3">Comportement</h2>
          <div className="rounded-xl border border-border bg-white overflow-hidden max-w-[820px]">
            {COMPORTEMENT.map((r, i) => (
              <div key={i} className="grid grid-cols-[130px_1fr] text-[13px] border-b border-border last:border-0">
                <div className="px-4 py-3 font-medium text-foreground">{r.regle}</div>
                <div className="px-4 py-3 text-foreground-secondary leading-relaxed">{r.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau loi aux vraies proportions, ouvert par « Voir l'article » */}
      {openArticle && (
        <div className="fixed inset-0 z-50" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <PreviewPanel
            kind="loi"
            source={loiSourceOf(ARTICLES[openArticle])}
            onClose={closePanel}
            onOpenSource={() => {}}
          />
        </div>
      )}
    </div>
  );
}
