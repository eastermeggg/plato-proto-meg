import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileText, FileType2, Image as ImageIcon, LayoutTemplate, Gavel, Mail, Stamp, Globe,
  ChevronRight, ChevronDown, Calendar, Hash,
  Sparkle, Scissors, Download, Trash2,
  ExternalLink, Search, Paperclip, PencilLine, Check,
  Table, Calculator,
} from 'lucide-react';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import IVAvatar from '../IVAvatar';
import { colors, typography } from '../../design-system/tokens';
import { COT_BADGE_TOKENS } from '../../data/cotisationsSocial';
import { DOC_SAMPLE_IMAGES, docSampleIndex } from './docSamples';
import {
  PanelHeader, MetaChip, CitesPanel, Previewer, PreviewerPage,
  SERIF_TITLE, FOCUS_RING,
} from './PreviewAtoms';

// Les ATOMES du Doc Preview (KindIcon, PanelHeader, MetaChip, CiteRow,
// CitesPanel, Previewer) vivent dans PreviewAtoms.js - le panneau les COMPOSE.
// Ré-exportés ici pour compat des imports existants.
export { KindIcon, PanelHeader, MetaChip, META_CHIP_TYPES, CiteRow, CitesPanel, Previewer, PreviewerPage, KIND_ACCENTS } from './PreviewAtoms';

// ─────────────────────────────────────────────────────────────────────────────
// PreviewPanel - le panneau de preview systématisé (fusion preview-doc + panel)
//
// Un seul « shell » (barre de titre · barre méta · corps · rail citations) dont
// les zones sont pluggables selon le type de source citée. Aligné pixel-perfect
// sur Figma « Plato — System » › PreviewPanel 37375:9324 (états Default /
// LineEdit / Editing) : header 56px (titre serif, nav ‹ i/N ›, Télécharger
// primaire + Supprimer destructive-subtle + Fermer secondary), barre méta 52px
// (chips 12px + Modifier), PAS de footer (le doc est fit-width permanent), rail
// « Extraits cités » à l'actif stone (pastille foreground + dégradé cream).
//
// Contrat commun : `source.passages` (ou `passage`) décrit le/les endroit(s) que
// la citation vise. À l'ouverture, le panneau surligne tous les passages, défile
// jusqu'au chunk actif, et un stepper « Citation i / N » les enchaîne.
//
// Types :
//   piece  · document client paginé   modele · modèle paginé
//   jp     · décision de justice        email  · fil d'emails importé
//   loi    · article de loi (court)     ligne  · ligne structurée (cotisation…)
//   web    · lien externe (pas de panneau)
//
// Rendu documentaire = « skeleton » (pas de moteur PDF) ; en prod une lib
// (react-pdf / pdf.js) porterait le rendu, l'UX zoom / scroll / surlignage identique.
// ─────────────────────────────────────────────────────────────────────────────

// Surlignage citation - teinte warning du DS (cohérente avec DecisionDrawer).
const HL = colors.banner.warning.border;        // #fde68a
const HL_EDGE = colors.banner.warning.accent;   // #d97706 - liseré + outline du chunk actif
const AI_ACCENT = colors.banner.ai.accent;      // #9333ea - marqueur « généré par IA »
const MONO = typography.fontFamily.mono;
const SERIF = typography.fontFamily.serif;

// ── PartyAvatar ─────────────────────────────────────────────────────────────
// Avatar de partie du fil email (kind = 'email') : pièce + couleur dérivées du
// NOM (déterministe), cabinet = roi cream. Depuis le 23/09 il COMPOSE le
// IVAvatar canonique (set Figma 36533:7967, 6 pièces × 6 palettes) au lieu de
// porter ses propres vecteurs - le doublon CHESS_PATHS local est résorbé
// (SIGNALEMENTS §8).

// Hash déterministe simple (djb2 tronqué) : le même nom → même couleur + même
// pièce à travers les rendus.
function hashName(name) {
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) >>> 0;
  return h;
}

// Détection du cabinet : "Cabinet", "Cabinet Dupont", "Me. Martin", "Maître…"
// → traité comme un membre workspace (cream + roi, à la userAvatar Admin).
function isCabinet(name = '') {
  return /^\s*(cabinet|m(a[îi])?tre|me\.?\s)/i.test(name);
}

const PARTY_PIECES = ['knight', 'bishop', 'rook', 'queen', 'king'];
const PARTY_COLORS = ['green', 'blue', 'plum', 'orange', 'purple']; // cream = cabinet

function PartyAvatar({ name = '', size = 28 }) {
  const cabinet = isCabinet(name);
  const type = cabinet ? 'king' : PARTY_PIECES[hashName(name) % PARTY_PIECES.length];
  const color = cabinet ? 'cream' : PARTY_COLORS[hashName(name) % PARTY_COLORS.length];
  return (
    <span title={name} style={{ display: 'inline-flex', flexShrink: 0 }}>
      <IVAvatar type={type} color={color} size={size} />
    </span>
  );
}

// Glyphe § du badge TEXTE - un composant à interface Lucide pour rester
// interchangeable dans le registre des kinds ci-dessous.
function TexteGlyph({ className, style, strokeWidth: _sw, ...rest }) {
  return (
    <span aria-hidden className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontWeight: 600, fontSize: 13, ...style }} {...rest}>§</span>
  );
}

// ── Petits blocs partagés ────────────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <p
      className="text-foreground-secondary"
      style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}
    >
      {children}
    </p>
  );
}

// Bandeau surligné réutilisable : contient l'extrait cité, ancré pour le scroll.
function Citation({ children }) {
  return (
    <div
      data-cite="1"
      className="rounded-md px-3 py-2 my-1 text-[13px] leading-6 text-foreground scroll-mt-6"
      style={{ background: HL, boxShadow: `inset 3px 0 0 ${HL_EDGE}` }}
    >
      {children}
    </div>
  );
}

// Badge autorité juridique (cotisations) - 5 teintes spécifiées par la spec
// Social (pas encore promues en tokens - candidates /ui-kit/tokens) + neutre DS.
const AUTHORITY = {
  urssaf: { label: 'URSSAF', bg: colors.banner.info.bgFrom, fg: colors.piece.medical.fg },
  boss: { label: 'BOSS', bg: colors.banner.ai.bgFrom, fg: colors.banner.ai.accentHover },
  impots: { label: 'Impôts', bg: colors.banner.success.bgFrom, fg: colors.banner.success.accentHover },
  code: { label: 'Code du travail', bg: colors.feedback.warning.subtle, fg: colors.banner.warning.accentHover },
  conv: { label: 'Convention collective', bg: colors.step.red.bg, fg: colors.avatar[4].fill },
  none: { label: '-', bg: colors.semantic.backgroundSubtle, fg: colors.semantic.foregroundSecondary },
};
function AuthorityBadge({ authority }) {
  const a = AUTHORITY[authority] || AUTHORITY.none;
  return (
    <span className="inline-flex items-center h-7 px-2.5 rounded-md text-[13px] font-medium" style={{ background: a.bg, color: a.fg }}>
      {a.label}
    </span>
  );
}

// Callout « document découpé » utilisé en mode édition.
function SplitCallout({ split }) {
  return (
    <div className="rounded-lg border border-border bg-background-canvas p-3 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-surface border border-border flex items-center justify-center flex-shrink-0">
        <Scissors className="w-3.5 h-3.5 text-foreground-tertiary" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body-medium text-foreground">Document découpé</div>
        <div className="text-caption text-foreground-secondary truncate" title={split.source}>{split.source}</div>
      </div>
      <button type="button" className="text-[13px] font-medium text-link hover:underline flex-shrink-0">Ajuster</button>
    </div>
  );
}

// Callout « issu d'un email » - provenance d'une pièce importée depuis un fil.
// `prov.open` = target { kind, source } passé à onOpenSource pour ouvrir l'email.
function ProvenanceCallout({ prov, onOpen }) {
  return (
    <div className="rounded-lg border border-border bg-background-canvas p-3 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-surface border border-border flex items-center justify-center flex-shrink-0">
        <Mail className="w-3.5 h-3.5 text-foreground-tertiary" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body-medium text-foreground">Issu d'un email</div>
        <div className="text-caption text-foreground-secondary truncate" title={prov.subject}>
          {prov.subject}{prov.from ? ` · ${prov.from}` : ''}{prov.date ? ` · ${prov.date}` : ''}
        </div>
      </div>
      {prov.open && (
        <button type="button" onClick={() => onOpen(prov.open)} className="text-[13px] font-medium text-link hover:underline flex-shrink-0">Voir l'email</button>
      )}
    </div>
  );
}

// ── Corps « document » (piece + modele) : pages skeleton + surlignage passage ─

// `quotes` = extraits cités présents SUR cette page (un doc peut en porter
// plusieurs, sur des pages différentes ou la même). Chacun est ancré data-cite.
// `img` = la vraie page de document affichée (jeu docSamples) ; les extraits
// cités sont surlignés en overlay par-dessus, ce qui préserve le contrat
// « aller à la citation » (le rail lit leur texte via data-cite).
function DocPage({ pageNo, totalPages, width, quotes = [], img, highlight }) {
  return (
    <PreviewerPage pageNo={pageNo} width={width}>
      <img src={img} alt={`Page ${pageNo}`} className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" />
      {/* Surlignage « source » : où la valeur du champ survolé a été extraite. */}
      {highlight && (
        <div
          className="absolute rounded pointer-events-none"
          style={{ left: `${highlight.x}%`, top: `${highlight.y}%`, width: `${highlight.w}%`, height: `${highlight.h}%`, background: 'rgba(253,230,138,0.38)', boxShadow: `0 0 0 2px ${HL_EDGE}`, animation: 'fadeIn 0.12s ease-out' }}
        />
      )}
      {quotes.map((q, k) => (
        <div
          key={`c${k}`}
          data-cite="1"
          className="absolute rounded-sm text-foreground scroll-mt-6 shadow-sm"
          style={{ left: '7%', right: '7%', top: `${30 + k * 16}%`, background: HL, boxShadow: `inset 3px 0 0 ${HL_EDGE}`, padding: '2cqw 2.5cqw', fontSize: '2.4cqw', lineHeight: 1.4 }}
        >
          {q}
        </div>
      ))}
      <div className="absolute left-0 right-0 text-center text-foreground-muted tabular-nums" style={{ bottom: '2.5cqw', fontSize: '2cqw' }}>
        {pageNo} / {totalPages}
      </div>
    </PreviewerPage>
  );
}

// Type de rendu d'une pièce. Explicite via `source.docType`, sinon déduit de
// l'extension du nom de fichier. Défaut = « pdf » (le rendu paginé historique).
// Les trois familles partagent le même châssis (titre bleu PIECE, zoom, nav
// pages, contrat « aller à la citation ») - seul le CORPS change.
const DOC_ICON = { pdf: FileText, image: ImageIcon, word: FileType2 };

function docTypeOf(src) {
  if (!src) return 'pdf';
  if (src.docType) return src.docType;
  const n = (src.name || src.split?.source || '').toLowerCase();
  if (/\.(png|jpe?g|gif|webp|tiff?|heic|bmp|svg)$/.test(n)) return 'image';
  if (/\.(docx?|odt|rtf|pages)$/.test(n)) return 'word';
  return 'pdf';
}

// ── Corps « PDF » : pages skeleton paginées ─────────────────────────────────
function PdfDoc({ source, pageWidth, scrollRef, onScroll, highlight }) {
  const passages = source.passages || (source.passage ? [source.passage] : []);
  const byPage = {};
  passages.forEach((p) => { (byPage[p.page] || (byPage[p.page] = [])).push(p.quote); });
  // Page de départ déterministe par pièce ; on cycle ensuite dans le jeu pour un
  // rendu multi-pages crédible (chaque page = une vraie page de document).
  const start = docSampleIndex(source.name || '');
  return (
    <Previewer scrollRef={scrollRef} onScroll={onScroll}>
      {Array.from({ length: source.pages }, (_, i) => (
        <DocPage
          key={i}
          pageNo={i + 1}
          totalPages={source.pages}
          width={pageWidth}
          quotes={byPage[i + 1] || []}
          img={DOC_SAMPLE_IMAGES[(start + i) % DOC_SAMPLE_IMAGES.length]}
          highlight={highlight && highlight.page === i + 1 ? highlight.rect : null}
        />
      ))}
    </Previewer>
  );
}

// ── Corps « image » : la pièce est une photo / un scan ───────────────────────
// Placeholder honnête (pas d'asset) : une feuille photographiée, légèrement
// inclinée, sur un fond « bureau ». Les extraits cités (issus de l'OCR) sont des
// zones surlignées sur l'image, ancrées data-cite + reprises en légende.
function ImagePage({ source, pageNo, totalPages, width, quotes }) {
  const seed = (source.name || '').length + pageNo * 7;
  const lines = Array.from({ length: 15 }, (_, i) => 0.42 + ((seed + i * 13) % 48) / 100);
  return (
    <div
      data-page={pageNo}
      className="relative bg-white rounded-md shadow-md border border-border shrink-0 overflow-hidden"
      style={{ width, containerType: 'inline-size' }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3', background: `linear-gradient(135deg,${colors.feedback.warning.subtle},${colors.accents.sand.border} 58%,${colors.accents.sand.border})` }}>
        {/* La feuille photographiée */}
        <div
          className="absolute bg-white"
          style={{ left: '11%', top: '7%', width: '78%', height: '88%', transform: 'rotate(-1.4deg)', padding: '6cqw 7cqw', borderRadius: '0.6cqw', boxShadow: '0 4cqw 8cqw rgba(41,37,32,0.22)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
            {lines.map((w, i) => (
              <div key={i} className={`rounded-full ${i % 6 === 5 ? '' : 'bg-border'}`} style={{ height: '1.4cqw', width: `${Math.round(w * 100)}%` }} />
            ))}
          </div>
        </div>
        {/* Zones citées (OCR) */}
        {quotes.map((q, k) => {
          const r = q.rect || { x: 15, y: 32 + k * 15, w: 60, h: 8 };
          return (
            <div
              key={k}
              data-cite="1"
              className="absolute rounded-sm scroll-mt-6"
              style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%`, background: 'rgba(253,230,138,0.42)', boxShadow: `0 0 0 2px ${HL_EDGE}`, transform: 'rotate(-1.4deg)' }}
            >
              <span data-cite-text className="sr-only">{q.quote}</span>
            </div>
          );
        })}
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 h-6 px-2 rounded-md bg-black/45 text-white text-[11px] font-medium" style={{ backdropFilter: 'blur(2px)' }}>
          <ImageIcon className="w-3 h-3" strokeWidth={2} /> Image
        </div>
      </div>
      {/* Légende : nom + extraits cités lisibles */}
      <div className="px-3 py-2.5 border-t border-border bg-surface">
        <div className="text-[12px] text-foreground-muted tabular-nums">{source.name} · {pageNo}/{totalPages}</div>
        {quotes.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1">
            {quotes.map((q, k) => (
              <div key={k} className="text-[12px] leading-5 text-foreground-secondary flex items-start gap-1.5">
                <span className="mt-[3px] w-2 h-2 rounded-sm flex-shrink-0" style={{ background: HL, boxShadow: `inset 2px 0 0 ${HL_EDGE}` }} />
                <span className="min-w-0">« {q.quote} »</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageDoc({ source, pageWidth, scrollRef, onScroll }) {
  const passages = source.passages || (source.passage ? [source.passage] : []);
  const byPage = {};
  passages.forEach((p) => { const pg = p.page || 1; (byPage[pg] || (byPage[pg] = [])).push(p); });
  const total = source.pages || 1;
  return (
    <Previewer scrollRef={scrollRef} onScroll={onScroll}>
      {Array.from({ length: total }, (_, i) => (
        <ImagePage key={i} source={source} pageNo={i + 1} totalPages={total} width={pageWidth} quotes={byPage[i + 1] || []} />
      ))}
    </Previewer>
  );
}

// ── Corps « Word » : document texte continu, marges généreuses ───────────────
// Contrairement au PDF (lignes grises), le Word rend du VRAI texte (source.wordBody :
// suite de { text, heading?, cite?, page? }). Les paragraphes cités reçoivent le
// même surlignage inline que les autres corps prose.
function WordPage({ source, pageNo, totalPages, width, paras }) {
  return (
    <div
      data-page={pageNo}
      className="relative bg-white rounded-md shadow-md border border-border shrink-0 overflow-hidden"
      style={{ width, aspectRatio: '1 / 1.414', containerType: 'inline-size' }}
    >
      <div style={{ padding: '9cqw 10cqw 7cqw' }}>
        {pageNo === 1 && (
          <>
            <div className="font-semibold text-foreground leading-snug" style={{ fontSize: '4cqw' }}>{source.name}</div>
            {source.date && <div className="text-foreground-muted mt-1 tabular-nums" style={{ fontSize: '2.3cqw' }}>{source.date}</div>}
            <div className="bg-border-subtle" style={{ height: '1px', margin: '4cqw 0 1cqw' }} />
          </>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3cqw', marginTop: pageNo === 1 ? '3cqw' : 0 }}>
          {paras.map((p, i) =>
            p.cite ? (
              <p
                key={i}
                data-cite="1"
                data-cite-text
                className="scroll-mt-6 text-foreground rounded-sm whitespace-pre-line"
                style={{ background: HL, boxShadow: `inset 3px 0 0 ${HL_EDGE}`, padding: '2cqw 2.5cqw', margin: '0.5cqw 0', fontSize: '2.9cqw', lineHeight: 1.7 }}
              >
                {p.text}
              </p>
            ) : p.heading ? (
              <div key={i} className="font-semibold text-foreground" style={{ fontSize: '3.2cqw', lineHeight: 1.4 }}>{p.text}</div>
            ) : (
              <p key={i} className="text-foreground-secondary whitespace-pre-line" style={{ fontSize: '2.9cqw', lineHeight: 1.7, textAlign: 'justify' }}>{p.text}</p>
            )
          )}
        </div>
      </div>
      <div className="absolute left-0 right-0 text-center text-foreground-muted tabular-nums" style={{ bottom: '3cqw', fontSize: '2cqw' }}>
        {pageNo} / {totalPages}
      </div>
    </div>
  );
}

function WordDoc({ source, pageWidth, scrollRef, onScroll }) {
  const body = source.wordBody || [];
  const byPage = {};
  body.forEach((p) => { const pg = p.page || 1; (byPage[pg] || (byPage[pg] = [])).push(p); });
  const total = source.pages || Math.max(1, ...Object.keys(byPage).map(Number));
  return (
    <Previewer scrollRef={scrollRef} onScroll={onScroll}>
      {Array.from({ length: total }, (_, i) => (
        <WordPage key={i} source={source} pageNo={i + 1} totalPages={total} width={pageWidth} paras={byPage[i + 1] || []} />
      ))}
    </Previewer>
  );
}

// Dispatcher : choisit le corps selon le type de la pièce.
function DocBody({ source, pageWidth, scrollRef, onScroll, highlight }) {
  const props = { source, pageWidth, scrollRef, onScroll, highlight };
  const t = docTypeOf(source);
  if (t === 'image') return <ImageDoc {...props} />;
  if (t === 'word') return <WordDoc {...props} />;
  return <PdfDoc {...props} />;
}

// ── Corps « décision de justice » ────────────────────────────────────────────

function JpBody({ source, scrollRef }) {
  const s = source.jp || {};
  const Section = ({ title, children }) => (
    <div className="mb-5">
      <FieldLabel>{title}</FieldLabel>
      <div className="mt-2 space-y-2 text-[13.5px] leading-6 text-foreground-secondary">{children}</div>
    </div>
  );
  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-w-0">
      <div className="max-w-[720px] mx-auto py-8 px-8">
        <div className="text-center mb-6">
          <div className="text-[15px] font-semibold text-foreground-strong">{s.juridiction}</div>
          <div className="text-[13px] text-foreground-muted mt-0.5 tabular-nums">{s.date} · n° {s.numero}</div>
        </div>
        <Section title="Faits et procédure"><p>{s.faits}</p></Section>
        <Section title="Moyens"><p>{s.moyens}</p></Section>
        <Section title="Motifs">
          {(s.motifs || []).map((m, i) => (m.cite ? <Citation key={i}>{m.text}</Citation> : <p key={i}>{m.text}</p>))}
        </Section>
        <Section title="Dispositif"><p>{s.dispositif}</p></Section>
      </div>
    </div>
  );
}

// ── Corps « fil d'emails » ───────────────────────────────────────────────────

// Normalise une pièce jointe : string → { name } ; objet → tel quel. Une PJ avec
// `.source` est prévisualisable (clic → onOpen({ kind:'piece', source })).
function normAtt(a) {
  return typeof a === 'string' ? { name: a } : a;
}

function EmailBody({ source, scrollRef, onOpen }) {
  const msgs = source.email?.messages || [];
  // Toutes les PJ du fil, à plat, pour la liste consolidée en tête.
  const allAtts = msgs.flatMap((m) => (m.attachments || []).map((a) => ({ ...normAtt(a), from: m.from, date: m.date })));

  const AttButton = ({ att, className }) => {
    const AIcon = DOC_ICON[docTypeOf(att.source || att)];
    return (
      <button
        onClick={() => att.source && onOpen({ kind: 'piece', source: att.source })}
        disabled={!att.source}
        className={className}
        title={att.source ? 'Prévisualiser' : att.name}
      >
        <AIcon className="w-3 h-3 text-foreground-muted flex-shrink-0" strokeWidth={1.75} /> {att.name}
      </button>
    );
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-w-0 bg-background-canvas">
      <div className="max-w-[720px] mx-auto py-6 px-6 space-y-3">
        {/* Liste consolidée des pièces jointes du fil - prévisualisables */}
        {allAtts.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <FieldLabel>Pièces jointes du fil ({allAtts.length})</FieldLabel>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {allAtts.map((a, i) => {
                const AIcon = DOC_ICON[docTypeOf(a.source || a)];
                return (
                <button
                  key={i}
                  onClick={() => a.source && onOpen({ kind: 'piece', source: a.source })}
                  disabled={!a.source}
                  className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-cream disabled:opacity-60 disabled:hover:bg-transparent"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-cream text-foreground-tertiary flex-shrink-0">
                    <AIcon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-foreground truncate">{a.name}</div>
                    <div className="text-[11.5px] text-foreground-muted truncate">{a.from} · {a.date}</div>
                  </div>
                  {a.source && <ChevronRight className="w-4 h-4 text-foreground-muted flex-shrink-0" />}
                </button>
                );
              })}
            </div>
          </div>
        )}

        {msgs.map((m, i) => {
          const inner = (
            <div className={`rounded-xl border bg-surface p-4 ${m.cite ? 'border-transparent' : 'border-border'}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <PartyAvatar name={m.from} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-foreground truncate">{m.from}</div>
                  <div className="text-[11.5px] text-foreground-muted truncate">à {m.to}</div>
                </div>
                <div className="text-[11.5px] text-foreground-muted tabular-nums flex-shrink-0">{m.date}</div>
              </div>
              <p data-cite-text className="text-[13.5px] leading-6 text-foreground-secondary whitespace-pre-line">{m.body}</p>
              {m.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.attachments.map((a, j) => (
                    <AttButton
                      key={j}
                      att={normAtt(a)}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-background border border-border text-[12px] text-foreground-secondary transition-colors hover:bg-cream hover:text-foreground disabled:hover:bg-background disabled:hover:text-foreground-secondary"
                    />
                  ))}
                </div>
              )}
            </div>
          );
          return m.cite
            ? <div key={i} data-cite="1" className="rounded-xl scroll-mt-6" style={{ boxShadow: `0 0 0 2px ${HL}` }}>{inner}</div>
            : <div key={i}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

// ── Corps « article de loi » (court, non paginé) ─────────────────────────────

function LoiBody({ source, scrollRef }) {
  const l = source.loi || {};
  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-w-0">
      <div className="max-w-[680px] mx-auto py-8 px-8">
        <div className="text-[15px] font-semibold text-foreground-strong">{l.article}</div>
        <div className="text-[12.5px] text-foreground-muted mt-1">{l.code} · Version en vigueur au {l.enVigueur}</div>
        <div className="h-px bg-border my-5" />
        <div className="space-y-3 text-[13.5px] leading-6 text-foreground-secondary">
          {(l.alineas || []).map((a, i) => (a.cite ? <Citation key={i}>{a.text}</Citation> : <p key={i}>{a.text}</p>))}
        </div>
      </div>
    </div>
  );
}

// ── Corps « ligne structurée » (cotisation / relevé) ─────────────────────────

function LigneBody({ source, scrollRef }) {
  const g = source.ligne || {};
  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-w-0 bg-background-canvas">
      <div className="max-w-[760px] mx-auto py-8 px-8">
        {g.regle && (
          <div className="rounded-xl border border-border bg-surface p-4 mb-5">
            <FieldLabel>Règle appliquée</FieldLabel>
            <p className="mt-2 text-[13.5px] leading-6 text-foreground-secondary">{g.regle}</p>
          </div>
        )}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] text-[11px] font-medium uppercase tracking-wide text-foreground-muted bg-cream border-b border-border" style={{ fontFamily: MONO }}>
            <div className="px-4 py-2">Libellé</div>
            <div className="px-4 py-2 text-right">Base</div>
            <div className="px-4 py-2 text-right">Montant</div>
          </div>
          {(g.rows || []).map((r, i) => (
            <div
              key={i}
              {...(r.cite ? { 'data-cite': '1' } : {})}
              className={`grid grid-cols-[1fr_auto_auto] text-[13px] border-b border-border last:border-0 scroll-mt-6 ${r.cite ? '' : 'text-foreground-secondary'}`}
              style={r.cite ? { background: HL, boxShadow: `inset 3px 0 0 ${HL_EDGE}` } : undefined}
            >
              <div className={`px-4 py-2.5 ${r.cite ? 'text-foreground font-medium' : ''}`} {...(r.cite ? { 'data-cite-text': '1' } : {})}>
                {r.label}
                {r.cite && <span className="sr-only"> - base {r.base}, montant {r.montant}</span>}
              </div>
              <div className="px-4 py-2.5 text-right tabular-nums">{r.base}</div>
              <div className={`px-4 py-2.5 text-right tabular-nums ${r.cite ? 'text-foreground font-medium' : ''}`}>{r.montant}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CitesPanel ─────────────────────────────────────────────────────────────
// Rail latéral droite qui n'apparaît QUE si la source porte au moins UNE
// citation. Rend l'ensemble des chunks lisible d'un coup : page + extrait +
// état actif. Complète le stepper du pied (raccourci nav) - la même donnée,
// dans deux surfaces au poids différent : le rail pour SCANNER, le stepper
// pour cycler.
//
// La liste lit `items` (dérivés du DOM) donc marche uniformément pour tous
// les kinds sans logique spécifique par corps.
// ── Registre des types ───────────────────────────────────────────────────────
// Accents et icônes alignés sur les badges SOURCE (COT_BADGE_TOKENS) : le titre
// du panneau parle le même langage visuel que la pilule qui l'a ouvert.
//
//   piece / modele / email → PIECE   (bleu · document)
//   jp                     → DECISION (vert · marteau)
//   loi                    → TEXTE   (violet · § )
//   ligne                  → REFERENCE (sépia · tampon) — barème / cotisation
//   web                    → WEB     (neutre · globe)
//
// L'icône reste distinctive par kind (LayoutTemplate pour modèle, Mail pour
// email, Calculator pour ligne) mais la teinte porte la famille de source.
// WEB a un fond transparent + bord pointillé sur la pilule ; dans la puce du
// titre (fond blanc), on retombe sur un neutre subtil pour rester visible.
const BADGE_ACCENT = (family) => {
  const t = COT_BADGE_TOKENS[family];
  return { bg: t.bg === 'transparent' ? colors.semantic.backgroundSubtle : t.bg, fg: t.color };
};

export const PREVIEW_KINDS = {
  piece:  { label: 'Pièce',              icon: FileText,       accent: BADGE_ACCENT('PIECE'),     footer: 'doc',     opens: 'Previewer interne (drawer à gauche du chat)',           body: 'doc' },
  modele: { label: 'Modèle',             icon: LayoutTemplate, accent: BADGE_ACCENT('PIECE'),     footer: 'doc',     opens: 'Previewer interne (modèle)',                             body: 'doc' },
  jp:     { label: 'Jurisprudence',      icon: Gavel,          accent: BADGE_ACCENT('DECISION'),  footer: 'passage', opens: 'DecisionDrawer interne + lien Légifrance/Judilibre',    body: 'jp',    link: 'Légifrance' },
  email:  { label: 'Email',              icon: Mail,           accent: BADGE_ACCENT('PIECE'),     footer: 'passage', opens: 'Panneau fil (drawer import), ancré sur le message',     body: 'email' },
  loi:    { label: 'Article de loi',     icon: TexteGlyph,     accent: BADGE_ACCENT('TEXTE'),     footer: 'none',    opens: 'Panneau léger interne (version à la date)',              body: 'loi',   link: 'Légifrance' },
  ligne:  { label: 'Cotisation / relevé', icon: Stamp,         accent: BADGE_ACCENT('REFERENCE'), footer: 'none',    opens: 'Vue structurée interne, ligne surlignée',                body: 'ligne', link: 'BOSS' },
  web:    { label: 'Lien web',           icon: Globe,          accent: BADGE_ACCENT('WEB'),       footer: 'none',    opens: 'Lien externe (nouvel onglet) - pas de panneau',          body: 'external' },
};

// ── Rail d'édition « valeurs de la ligne » ────────────────────────────────────
// Quand le SUJET du panneau est une ligne de poste (déclenché depuis un poste /
// une ligne de chiffrage), le doc devient sa pièce attachée et ce rail édite les
// VALEURS de la ligne. Il est exclusif du rail de citations (on édite, on ne
// scanne pas des citations). Générique : rendu depuis un schéma `ligne.fields`
// (+ `summary` dérivé), donc il sert n'importe quel poste (PGPA, DFT, DSA,
// social…). L'édition des MÉTADONNÉES de la pièce reste, elle, dans la barre méta
// (bouton « Modifier la pièce »).
const LIGNE_INPUT = 'w-full h-9 px-3 text-[14px] text-foreground bg-surface border border-border rounded-lg shadow-xs outline-none focus:border-foreground-muted transition-colors';

function LigneField({ f }) {
  // Repère « sourcé » : signale que la valeur a été extraite du document ouvert
  // à gauche (date / montant). Rappelle que la donnée vient de la pièce.
  const label = (
    <div className="flex items-center gap-1 mb-1.5">
      <label className="text-[14px] leading-5 font-medium text-foreground">{f.label}</label>
      {f.sourced && (
        // State « sourcé » du DS : une sparkle discrète à côté du label. Survoler
        // le champ surligne l'emplacement dans le document.
        <span title="Valeur extraite du document" className="inline-flex items-center flex-shrink-0" style={{ color: AI_ACCENT }}>
          <Sparkle className="w-3 h-3" strokeWidth={2} fill="currentColor" />
        </span>
      )}
    </div>
  );
  const helper = f.helper ? (
    <p className="mt-1.5 text-[12px] leading-4 text-foreground-secondary" style={{ letterSpacing: '0.12px' }}>{f.helper}</p>
  ) : null;
  if (f.type === 'date') {
    return (<div>{label}<div className="flex items-center gap-2 h-9 px-3 bg-surface border border-border rounded-lg shadow-xs focus-within:border-foreground-muted transition-colors"><Calendar className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} /><input defaultValue={f.value} className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-foreground" /></div>{helper}</div>);
  }
  if (f.type === 'money') {
    return (<div>{label}<div className="flex items-center gap-2 h-9 px-3 bg-surface border border-border rounded-lg shadow-xs focus-within:border-foreground-muted transition-colors"><span className="text-foreground-muted text-[14px] flex-shrink-0">€</span><input defaultValue={f.value} className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-foreground tabular-nums" /></div>{helper}</div>);
  }
  if (f.type === 'number' || f.type === 'percent') {
    const suffix = f.type === 'percent' ? '%' : (f.suffix || '');
    return (<div>{label}<div className="relative"><input defaultValue={f.value} className={`${LIGNE_INPUT} tabular-nums ${suffix ? 'pr-8' : ''}`} />{suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted text-[14px]">{suffix}</span>}</div>{helper}</div>);
  }
  if (f.type === 'select') {
    return (<div>{label}<div className="relative"><select defaultValue={f.value} className={`${LIGNE_INPUT} appearance-none pr-8`}>{(f.options || [f.value]).map((o) => <option key={o}>{o}</option>)}</select><ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" /></div>{helper}</div>);
  }
  return (<div>{label}<input defaultValue={f.value} className={LIGNE_INPUT} />{helper}</div>);
}

// Pièces justificatives de la ligne : un champ de recherche pour EN AJOUTER +
// la liste des pièces déjà liées, rendue par le composant « Doc List »
// (Figma 37634:12714, états Default / Hover / Active). Chaque ligne = trombone
// + nom + actions Télécharger / Retirer ; la pièce active (affichée dans le
// document) porte le liseré brand orange à glow + un fond canvas encadré.
function DocListItem({ name, active, onView }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView && onView(); } }}
      title="Voir la pièce"
      aria-pressed={active}
      className={`group relative flex items-center gap-2.5 pr-3 rounded-md cursor-pointer transition-colors ${FOCUS_RING} focus-visible:ring-inset ${active ? 'bg-background-canvas border border-border shadow-xs' : 'border border-transparent hover:bg-background-canvas'}`}
    >
      {/* Liseré actif brand orange (à glow) - langage « détail » du DS. */}
      {active && (
        <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[26px] rounded-r-sm bg-brand" style={{ boxShadow: '0 0 6px rgba(244,122,44,0.38)' }} />
      )}
      <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2.5">
        <span className="inline-flex items-center justify-center w-[22px] h-[22px] flex-shrink-0">
          <Paperclip className="w-4 h-4 text-foreground-secondary" strokeWidth={1.75} />
        </span>
        <span className={`min-w-0 truncate text-[14px] leading-5 text-foreground ${active ? 'font-medium' : ''}`}>{name}</span>
      </div>
      <button type="button" onClick={(e) => e.stopPropagation()} title="Télécharger" aria-label="Télécharger la pièce" className="p-0.5 rounded text-foreground-muted hover:text-foreground transition-colors flex-shrink-0"><Download className="w-4 h-4" strokeWidth={1.75} /></button>
      <button type="button" onClick={(e) => e.stopPropagation()} title="Retirer" aria-label="Retirer la pièce" className="p-0.5 rounded text-foreground-muted hover:text-danger transition-colors flex-shrink-0"><Trash2 className="w-4 h-4" strokeWidth={1.75} /></button>
    </div>
  );
}

function LignePieces({ pieces, activePiece = 0, onView }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-[14px] leading-5 font-medium text-foreground mb-1.5">Ajouter des pièces justificatives</label>
        <div className="flex items-center gap-2 h-9 px-3 bg-surface border border-border rounded-lg shadow-xs focus-within:border-foreground-muted transition-colors">
          <Search className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
          <input placeholder="Recherchez une pièce..." className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-foreground placeholder:text-foreground-secondary" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {pieces.map((p, i) => (
          <DocListItem key={i} name={p} active={i === activePiece} onView={() => onView && onView(i)} />
        ))}
      </div>
    </div>
  );
}

// Rail « Éditer la ligne » (Figma 37614:20252) : titre serif + champs pleine
// largeur, pièces justificatives, grille de champs, puis le bloc Total calculé
// (dégradé canvas) et les actions Supprimer / Enregistrer.
function LigneEditRail({ ligne, onClose, pieceNames, activePiece, onView, onSourceHover = () => {}, width }) {
  const fields = ligne.fields || [];
  const fullFields = fields.filter((f) => f.full);
  const gridFields = fields.filter((f) => !f.full);
  const hoverProps = (f) => (f.sourced && f.docHint ? {
    onMouseEnter: () => onSourceHover(f.docHint),
    onMouseLeave: () => onSourceHover(null),
    onFocusCapture: () => onSourceHover(f.docHint),
    onBlurCapture: () => onSourceHover(null),
  } : {});
  const summary = ligne.summary || [];
  const totalRow = summary.find((s) => s.strong);
  const detailRows = summary.filter((s) => !s.strong);
  return (
    <aside className="flex-shrink-0 bg-surface flex flex-col min-h-0" style={{ width }}>
      <div className="flex-1 overflow-y-auto overflow-x-clip py-5 flex flex-col gap-4 min-h-0">
        {/* Titre serif + champs pleine largeur (libellé…) */}
        <div className="px-5 flex flex-col gap-4">
          <h3 className="m-0 text-foreground-strong" style={{ fontFamily: SERIF, fontSize: 20, lineHeight: '28px', letterSpacing: '-0.6px', fontWeight: 500 }}>
            Éditer la ligne
          </h3>
          {fullFields.map((f, i) => (
            <div key={i} {...hoverProps(f)}><LigneField f={f} /></div>
          ))}
        </div>
        {pieceNames?.length > 0 && (
          <>
            <div className="h-px bg-border flex-shrink-0" />
            <div className="px-5">
              <LignePieces pieces={pieceNames} activePiece={activePiece} onView={onView} />
            </div>
          </>
        )}
        {gridFields.length > 0 && (
          <>
            <div className="h-px bg-border flex-shrink-0" />
            <div className="px-5 grid grid-cols-2 gap-4">
              {gridFields.map((f, i) => (
                <div key={i} {...hoverProps(f)}><LigneField f={f} /></div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Total calculé (dégradé canvas → transparent) + actions */}
      <div className="border-t border-border flex-shrink-0">
        {summary.length > 0 && (
          <div className="p-5 flex flex-col gap-3.5" style={{ background: `linear-gradient(180deg, ${colors.semantic.background} 50%, rgba(248,247,245,0) 100%)` }}>
            {detailRows.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="text-[12px] leading-4 text-foreground-secondary">{s.label}</span>
                <span className="text-[13px] text-foreground-secondary tabular-nums">{s.value}</span>
              </div>
            ))}
            {totalRow && (
              <div className="flex items-end justify-between gap-3">
                <span className="inline-flex items-start gap-[7px]">
                  <span className="text-[14px] leading-5 font-medium text-foreground">{totalRow.label}</span>
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-cream flex-shrink-0" title="Montant calculé">
                    <Calculator className="w-3 h-3 text-foreground-tertiary" strokeWidth={2} />
                  </span>
                </span>
                <span className="text-[20px] leading-7 font-semibold text-foreground tabular-nums" style={{ letterSpacing: '-0.6px' }}>{totalRow.value}</span>
              </div>
            )}
          </div>
        )}
        <div className="p-5 bg-surface border-t border-border flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} className={`h-9 px-4 rounded-lg bg-danger-subtle text-danger-text text-[14px] font-medium hover:brightness-95 transition-all ${FOCUS_RING}`}>Supprimer</button>
          <Button variant="primary" size="md" label="Enregistrer" onClick={onClose} />
        </div>
      </div>
    </aside>
  );
}

// ── Le shell systématisé ─────────────────────────────────────────────────────

export default function PreviewPanel({
  kind,
  source: sourceProp,
  onClose,
  onPrev,
  onNext,
  navIndex,
  navTotal,
  embedded = false,
  onOpenSource, // (target { kind, source }) => void - navigation croisée
  ligne = null, // descripteur de ligne de poste → sujet = ligne (doc = pièce attachée)
  railLeft = false, // sujet ligne : mettre le rail d'édition à GAUCHE (comparaison)
}) {
  // Une ligne peut porter PLUSIEURS pièces justificatives (ligne.pieceSources).
  // Le sélecteur de la barre pièce choisit laquelle est affichée ; tout le
  // panneau (doc, chips, pied) suit `source` = la pièce active.
  const pieceList = ligne && ligne.pieceSources && ligne.pieceSources.length ? ligne.pieceSources : null;
  const [piecePicked, setPiecePicked] = useState(0);
  const source = pieceList ? pieceList[Math.min(piecePicked, pieceList.length - 1)] : sourceProp;

  const cfg = PREVIEW_KINDS[kind] || PREVIEW_KINDS.piece;
  // Pour une pièce, l'icône du titre suit le type de fichier (pdf/image/word) ;
  // la teinte reste bleue (famille PIECE). Les autres kinds gardent leur icône.
  const Icon = kind === 'piece' ? DOC_ICON[docTypeOf(source)] : cfg.icon;
  const isDoc = cfg.body === 'doc';
  // Sujet = ligne ? → l'objet du panneau est la ligne, le doc = sa pièce attachée.
  // Le titre porte la ligne (icône neutre + eyebrow poste), un rail édite ses
  // valeurs, et l'édition des métadonnées de la pièce reste dans la barre méta.
  const subjectIsLigne = !!ligne;
  const TitleIcon = subjectIsLigne ? Table : Icon;
  const titleEyebrow = subjectIsLigne ? (ligne.poste || 'Ligne') : cfg.label;
  const titleName = subjectIsLigne ? ligne.titre : source.name;
  const openSource = (t) => { if (t && onOpenSource) onOpenSource(t); };

  const [editing, setEditing] = useState(false);
  const [docHi, setDocHi] = useState(null); // { page, rect } - surlignage doc au survol d'un champ sourcé
  const scrollRef = useRef(null);
  const rootRef = useRef(null);

  // ── Adaptativité pilotée par la largeur RÉELLE du panneau ──
  // Les avocats travaillent souvent sur de petits écrans, et le chat (à droite)
  // ampute encore la largeur : le panneau peut tomber à ~600px alors que le
  // viewport fait 1440. On mesure donc le panneau lui-même (pas le viewport)
  // pour dimensionner les rails et décider d'afficher le rail citations.
  const [panelW, setPanelW] = useState(1120);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setPanelW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Rails fluides : px fixe borné (garde le formulaire / les citations lisibles),
  // qui se réduit sur petit panneau pour que le document reste dominant.
  const clamp = (min, val, max) => Math.round(Math.max(min, Math.min(val, max)));
  const editRailW = clamp(320, panelW * 0.34, 360);   // « Éditer la ligne »
  const citesRailW = clamp(220, panelW * 0.26, 300);  // « Extraits cités »
  // Sous ce seuil, le rail citations volerait trop de largeur au doc → masqué
  // (les surlignages du corps restent la source de vérité). Le rail d'édition,
  // lui, est la surface d'action principale d'une ligne : jamais masqué.
  const showCites = panelW >= 620;
  // Header compact : sur panneau étroit, le libellé « Télécharger » passe en icône seule.
  const compact = panelW < 720;

  // Largeur de page ajustée en continu à la colonne document (fit-width).
  const [fitPx, setFitPx] = useState(640);
  useEffect(() => {
    if (!isDoc) return;
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setFitPx(Math.max(320, Math.min(el.clientWidth - 48, 980)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDoc]);

  const pageWidth = fitPx;

  // ── Contrat « citation » ── Un doc peut porter plusieurs passages (chunks) :
  // tous surlignés, un stepper les enchaîne, le chunk actif reçoit un liseré.
  // Ordre = ordre du DOM (page, puis position).
  const passages = source.passages || (source.passage ? [source.passage] : []);
  const [activeCite, setActiveCite] = useState(0);
  // Extraits + page dérivés de la source de vérité (le DOM rendu) : le rail
  // « Extraits cités » et le surlignage du corps restent toujours en phase.
  const [citeItems, setCiteItems] = useState([]);

  const goToCite = useCallback((idx) => {
    const el = scrollRef.current;
    if (!el) return;
    const cites = el.querySelectorAll('[data-cite]');
    if (!cites.length) return;
    const i = Math.max(0, Math.min(cites.length - 1, idx));
    setActiveCite(i);
    cites.forEach((n, k) => {
      n.style.outline = k === i ? `2px solid ${HL_EDGE}` : 'none';
      n.style.outlineOffset = '1px';
    });
    // Scroll MANUEL du seul scroller du document - jamais scrollIntoView, qui
    // ferait défiler TOUS les ancêtres scrollables (la sandbox du playground,
    // un conteneur overflow-hidden…) et sortirait le header du cadre.
    const r = cites[i].getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const top = el.scrollTop + (r.top - er.top) - (el.clientHeight - r.height) / 2;
    el.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!passages.length) return;
    const t = setTimeout(() => {
      const el = scrollRef.current;
      const cites = el ? el.querySelectorAll('[data-cite]') : [];
      setCiteItems(Array.from(cites).map((n) => {
        const pageEl = n.closest('[data-page]');
        // Certains bodies (email, ligne) marquent une zone plus large que
        // l'extrait avec data-cite (pour ancrer le highlight sur la carte
        // entière). Un [data-cite-text] optionnel restreint l'extraction du
        // texte à l'élément qui porte VRAIMENT le contenu cité.
        const textEl = n.querySelector('[data-cite-text]') || n;
        const raw = (textEl.textContent || '').replace(/\s+/g, ' ').trim();
        return {
          text: raw.length > 220 ? raw.slice(0, 217) + '…' : raw,
          page: pageEl ? Number(pageEl.dataset.page) : undefined,
        };
      }));
      goToCite(source.activePassage || 0);
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, goToCite]);

  const goToPage = (n) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-page="${n}"]`);
    if (target) el.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
  };

  // ── Métadonnées documents : lecture (une rangée de chips, Figma MetaBar) ──
  const docReadChips = () => (
    <>
      {kind === 'piece' ? (
        <>
          {/* Identité de la pièce - chip strong (fond cream + valeur medium) */}
          <MetaChip
            variant="strong"
            icon={Hash}
            label="Pièce"
            value={
              <>
                {source.section}
                <span className="text-foreground-muted mx-1">·</span>
                <span className="tabular-nums">n° {source.numero}</span>
              </>
            }
          />
          <MetaChip icon={Calendar} label="Date" value={source.date} ai />
          <MetaChip label="Type" value={source.type} />
        </>
      ) : (
        <>
          {source.category && <MetaChip label="Catégorie" value={source.category} />}
          <MetaChip icon={Calendar} label="Mise à jour" value={source.date} />
          {source.variables != null && <MetaChip label="Variables" value={source.variables} />}
        </>
      )}
      {source.split && (
        <MetaChip
          icon={Scissors}
          label="Document découpé"
          aside={source.split.source}
          action={{ label: 'Ajuster', onClick: () => {} }}
        />
      )}
      {source.provenance && (
        <MetaChip
          icon={Mail}
          label="Issu de l'email"
          aside={source.provenance.subject}
          onClick={() => openSource(source.provenance.open)}
          disabled={!source.provenance.open}
        />
      )}
    </>
  );

  // ── Mode édition (Figma MetaBar mode=Edit, 37375:9392) : la barre méta est
  // REMPLACÉE par la section d'édition - en-tête serif + Enregistrer primaire,
  // « Informations générales » (nom + nom original + résumé + date), puis
  // « Numérotation de la pièce ». Le corps du document reste visible dessous.
  const originalName = source.originalName || source.split?.source;
  const docEditForm = (
    <div className="bg-surface border-b border-border flex-shrink-0 flex flex-col gap-4 py-4" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div className="px-4 flex items-center justify-between gap-3">
        <span className="text-foreground truncate" style={SERIF_TITLE}>Modifier les informations du document</span>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={`inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-foreground text-primary-foreground text-[14px] font-medium hover:bg-foreground-tertiary transition-colors flex-shrink-0 ${FOCUS_RING}`}
        >
          <Check className="w-4 h-4" strokeWidth={2} /> Enregistrer
        </button>
      </div>
      <div className="px-5 flex flex-col gap-4">
        <FieldLabel>Informations générales</FieldLabel>
        <div className="flex flex-col gap-2">
          <Input label="Nom du document" aiGenerated defaultValue={source.name} />
          {(originalName || source.summary) && (
            <div className="px-0.5 flex flex-col gap-1.5 text-[12px] text-foreground-secondary" style={{ letterSpacing: '0.12px' }}>
              {originalName && <p className="m-0 leading-4"><span className="font-medium">Nom original</span> - {originalName}</p>}
              {source.summary && <p className="m-0 leading-5">{source.summary}</p>}
            </div>
          )}
        </div>
        <Input label={kind === 'piece' ? 'Date du document' : 'Mise à jour'} aiGenerated={kind === 'piece'}>
          <div className="flex items-center gap-2 h-9 px-3 bg-surface border border-border rounded-lg shadow-xs focus-within:border-foreground-muted transition-colors">
            <Calendar className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
            <input defaultValue={source.date} placeholder="jj/mm/aaaa" className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-foreground" />
          </div>
        </Input>
        {kind !== 'piece' && <Input label="Catégorie" defaultValue={source.category} />}
        {source.split && <SplitCallout split={source.split} />}
        {source.provenance && <ProvenanceCallout prov={source.provenance} onOpen={openSource} />}
      </div>
      {kind === 'piece' && (
        <>
          <div className="h-px bg-border" />
          <div className="px-5 flex flex-col gap-5">
            <FieldLabel>Numérotation de la pièce</FieldLabel>
            <div className="flex gap-5">
              <Input label="Section" className="flex-1" defaultValue={source.section} />
              <Input label="Numéro" className="flex-1" defaultValue={source.numero} />
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ── Métadonnées non-doc (jp / email / loi / ligne) : chips par type ──
  const otherMeta = () => {
    if (kind === 'jp') {
      const s = source.jp || {};
      return (
        <>
          <MetaChip label="Juridiction" value={s.juridiction} />
          <MetaChip icon={Calendar} label="Date" value={s.date} />
          <MetaChip icon={Hash} value={`n° ${s.numero}`} />
          {s.quantum && <Badge variant="info" size="md" label={s.quantum} />}
        </>
      );
    }
    if (kind === 'email') {
      const e = source.email || {};
      const attCount = (e.messages || []).reduce((n, m) => n + (m.attachments?.length || 0), 0);
      return (
        <>
          <MetaChip label="Objet" value={e.subject} />
          <MetaChip label="Messages" value={e.messages?.length} />
          {attCount > 0 && <MetaChip icon={Paperclip} label="Pièces jointes" value={attCount} />}
        </>
      );
    }
    if (kind === 'loi') {
      const l = source.loi || {};
      return (
        <>
          <MetaChip label="Code" value={l.code} />
          <MetaChip icon={Calendar} label="En vigueur au" value={l.enVigueur} />
        </>
      );
    }
    if (kind === 'ligne') {
      const g = source.ligne || {};
      return (
        <>
          <AuthorityBadge authority={g.authority} />
          {g.periode && <MetaChip label="Période" value={g.periode} />}
        </>
      );
    }
    return null;
  };

  const renderBody = () => {
    if (cfg.body === 'doc') return <DocBody source={source} pageWidth={pageWidth} scrollRef={scrollRef} highlight={docHi} />;
    if (cfg.body === 'jp') return <JpBody source={source} scrollRef={scrollRef} />;
    if (cfg.body === 'email') return <EmailBody source={source} scrollRef={scrollRef} onOpen={openSource} />;
    if (cfg.body === 'loi') return <LoiBody source={source} scrollRef={scrollRef} />;
    if (cfg.body === 'ligne') return <LigneBody source={source} scrollRef={scrollRef} />;
    return null;
  };

  // Barre de métadonnées (Figma MetaBar, h-52) : UNE rangée de chips + le
  // bouton « Modifier » à droite (sujet Pièce). En mode édition, la barre est
  // remplacée par docEditForm (voir plus haut).
  const metaBand = (
    <div className="h-[52px] px-4 border-b border-border bg-surface flex-shrink-0 flex items-center gap-2">
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
        {isDoc ? docReadChips() : otherMeta()}
      </div>
      {isDoc && !subjectIsLigne && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`inline-flex items-center gap-2 h-8 px-2 rounded-md text-[14px] font-medium text-link hover:bg-info-bg transition-colors flex-shrink-0 ${FOCUS_RING}`}
        >
          <PencilLine className="w-3 h-3" strokeWidth={2} /> Modifier
        </button>
      )}
    </div>
  );

  // Sujet ligne : la colonne document porte son propre sous-header (atome
  // PanelHeader small, Figma kind=PieceSmall 37613:19640) - icône + nom de la
  // pièce, « Détail › » ouvre la pièce en preview pleine.
  const docSubHeader = (
    <PanelHeader
      small
      icon={Icon}
      accent={cfg.accent}
      title={source.name}
      trailing={(
        <button
          type="button"
          onClick={() => openSource({ kind: 'piece', source })}
          className={`inline-flex items-center gap-2 rounded-md text-[14px] font-medium text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0 ${FOCUS_RING}`}
        >
          Détail <ChevronRight className="w-3 h-3" strokeWidth={2} />
        </button>
      )}
    />
  );

  return (
    <div
      ref={rootRef}
      className={`bg-background-canvas flex flex-col overflow-hidden ${
        embedded ? 'relative rounded-lg border border-border shadow-sm h-[520px] sm:h-[640px] lg:h-[720px]' : 'relative h-full w-full'
      }`}
    >
      {/* ── Barre de titre : atome PanelHeader (Figma 37375:8738, h-56) ── */}
      <PanelHeader
        kind={subjectIsLigne ? 'ligne' : kind}
        icon={TitleIcon}
        accent={subjectIsLigne ? undefined : cfg.accent}
        eyebrow={subjectIsLigne ? (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-cream text-[12px] leading-4 font-medium text-foreground-tertiary flex-shrink-0">{titleEyebrow}</span>
        ) : null}
        title={titleName}
        nav={{ index: navIndex, total: navTotal, onPrev, onNext }}
        onClose={onClose}
        actions={(
          <>
            {cfg.link && (
              <button
                type="button"
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors ${FOCUS_RING}`}
                aria-label={`Ouvrir dans ${cfg.link}`}
                title={`Ouvrir dans ${cfg.link}`}
              >
                <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
            {/* Télécharger + Supprimer : actions de la PIÈCE → uniquement en sujet
                Pièce. Depuis une ligne, le header porte la ligne, pas la pièce. */}
            {isDoc && !subjectIsLigne && (
              <>
                <button
                  type="button"
                  title="Télécharger"
                  aria-label="Télécharger"
                  className={`inline-flex items-center gap-2 h-8 px-2 sm:px-3 rounded-lg bg-foreground text-primary-foreground hover:bg-foreground-tertiary transition-colors text-[14px] font-medium ${FOCUS_RING}`}
                >
                  <Download className="w-4 h-4" strokeWidth={1.75} />
                  {!compact && <span>Télécharger</span>}
                </button>
                {/* Supprimer : bouton dédié destructive-subtle (Figma) */}
                <button
                  type="button"
                  aria-label="Supprimer"
                  title="Supprimer"
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-danger-subtle text-danger hover:brightness-95 transition-all ${FOCUS_RING}`}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </>
            )}
          </>
        )}
      />

      {/* ── Corps + zone de droite ──
           · sujet ligne  → colonne doc (sous-header pièce + doc) et rail
             « Éditer la ligne » en pleine hauteur jusque sous la barre de titre.
           · sujet pièce  → barre méta (ou section d'édition), doc + rail citations */}
      {subjectIsLigne ? (
        (() => {
          const docCol = (
            <div className="flex-1 min-w-0 flex flex-col">
              {docSubHeader}
              {renderBody()}
            </div>
          );
          const rail = (
            <LigneEditRail
              ligne={ligne}
              onClose={onClose}
              pieceNames={pieceList ? pieceList.map((p) => p.name) : ligne.pieces}
              activePiece={piecePicked}
              onView={setPiecePicked}
              onSourceHover={(h) => { setDocHi(h); if (h && h.page) goToPage(h.page); }}
              width={editRailW}
            />
          );
          const divider = <div className="w-px bg-border flex-shrink-0" aria-hidden />;
          return (
            <div className="flex flex-1 min-h-0">
              {railLeft ? <>{rail}{divider}{docCol}</> : <>{docCol}{divider}{rail}</>}
            </div>
          );
        })()
      ) : (
        <>
          {isDoc && editing ? docEditForm : metaBand}
          <div className="flex flex-1 min-h-0">
            {renderBody()}
            {showCites && <CitesPanel items={citeItems} active={activeCite} onGo={goToCite} width={citesRailW} />}
          </div>
        </>
      )}
    </div>
  );
}
