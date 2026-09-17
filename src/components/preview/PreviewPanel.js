import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileText, FileType2, Image as ImageIcon, LayoutTemplate, Gavel, Mail, Stamp, Globe,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, Calendar, Hash,
  Sparkles, Sparkle, Scissors, Download, Trash2, ZoomIn, ZoomOut, Maximize2, Minimize2,
  ExternalLink, Search, ArrowDownToLine, Paperclip, Pencil, PencilLine, Check,
  Rows3,
} from 'lucide-react';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { colors, typography } from '../../design-system/tokens';
import { COT_BADGE_TOKENS } from '../../data/cotisationsSocial';
import { DOC_SAMPLE_IMAGES, docSampleIndex } from './docSamples';

// ─────────────────────────────────────────────────────────────────────────────
// PreviewPanel - le panneau de preview systématisé (fusion preview-doc + panel)
//
// Un seul « shell » (barre de titre · métadonnées · corps · pied) dont TROIS
// zones sont pluggables selon le type de source citée. Il réunit :
//   · du lab preview-doc  → le viewer confortable (zoom, plein écran, nav fluide),
//     les métadonnées en HEADER vs SIDE, le mode lecture/édition, le résumé IA.
//   · du lab preview-panel → la déclinaison par type (piece, modele, jp, email,
//     loi, ligne, web) et le contrat « aller à la citation ».
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

// Ring de focus keyboard-only cohérent, appliqué aux contrôles interactifs
// principaux du panneau. Reste discret (foreground @ 40%, offset 1px) mais
// visible sur les fonds blancs ET les fonds cream/canvas.
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:ring-foreground/40';

// ── PartyAvatar ─────────────────────────────────────────────────────────────
// Portage local du système d'avatars « Victimes / Intervenants » de l'App
// (App.js › VI_AVATAR_PALETTE + CHESS_PATHS) : une pastille carrée teintée
// contenant une pièce d'échec. Le fil d'email dans le doc kind = 'email' s'en
// sert pour habiller chaque expéditeur ; la couleur + la pièce sont dérivées
// du NOM (déterministe), sauf pour le cabinet (cream + roi, comme userAvatar
// pour un Admin dans l'App).
//
// Palette lue depuis les tokens (colors.avatar) - même source que l'App, donc
// une modif propage naturellement sans dupliquer les hex.
const CHESS_PATHS = {
  knight: 'M14.18 0c.02.11.01 1.02.01 1.17l-.001 2.8c.4.29 1.01.66 1.44.93l2.64 1.72c.16.56.29 1.14.43 1.7.06.23.1.49.2.71.14.34 1.84 1.93 2.23 2.32l-4.52 4.45-4.05-.02c-.28-.25-.6-.59-.88-.86-.47-.46-.93-.93-1.4-1.4.04-.87.01-2 .01-2.88-.44.01-.88.01-1.33.01-.04 1.1-.01 2.4-.01 3.51.62.66 1.31 1.29 1.94 1.94l.33.36 2.2-.002c.95 1.35 2.12 2.82 3.13 4.16l.003 2.72c.39.36 1.02.84 1.45 1.19.01.8.003 1.63 0 2.44l-7-0.001-8.74.004-.002-2.45c.45-.4.98-.79 1.44-1.19l-.004-2.73-4.41-.007c.08-.34.13-.79.19-1.15l.3-1.97c.78-.61 1.84-1.23 2.61-1.87.01-.15.04-.36.06-.52-.73.23-1.7.69-2.45.97.13-1.04.34-2.2.5-3.26.82-.42 1.65-.8 2.47-1.22.01-.16.02-.32.03-.48-.76.2-1.56.38-2.33.57.04-.2.07-.43.1-.64.17-1.27.44-2.55.59-3.81.75.25 1.49.5 2.23.76l.18-.37c-.6-.5-1.28-.97-1.87-1.47l2.37-2.33c.39-.39.81-.81 1.21-1.18.45-.03 1.16-.01 1.62-.01l3-.008c.23-.21.49-.49.72-.72.88-.85 1.74-1.75 2.62-2.59zm7.93 12.35c.16.08 1.84 1.82 2.08 2.06l-.04 3.04c-.44.37-.93.75-1.38 1.11-.36-.22-.68-.46-1.03-.7l-1.53-1.05-.31.3c.29.43.64.9.95 1.32.23.32.46.64.68.96l-2.84-.03c-.26-.8-.72-1.84-1.03-2.66.56-.58 1.24-1.23 1.83-1.8.86-.83 1.74-1.73 2.61-2.54zm-.19 2.46l-.004.68.57.06c.07.12.14.23.2.35.13.22.25.45.37.67l.02-1.74c-.04-.03-.02-.03-.06-.03-.35.01-.71.02-1.06.02zm-8.05-7.02c.31.21.64.37.94.56.01.24.01.5.03.74.21.15.48.29.72.41.25-.11.47-.22.72-.35.2.09.41.19.6.29l.21.11-.95-1.76h-2.27z',
  bishop: 'M12.67 20.83v3.08h-1.6l.81 3.95H1.1l.83-3.95H.31v-3.08h12.36zM6.49 0c.16.18.5.63.65.84.4.57.91 1.2 1.28 1.78L6.59 7.69c-.37 1.03-.79 2.12-1.13 3.15.12.39.31.87.45 1.25.18.51.37 1.07.57 1.56.13-.28.28-.77.38-1.07.26-.71.52-1.43.77-2.14l2.12-5.88c.19.26.41.6.59.87.38.57.76 1.14 1.13 1.72.3.47.6.95.89 1.43.21.33.43.69.6 1.05-.17.88-.41 1.87-.61 2.75-.11.47-.2.98-.31 1.46-.2.9-.39 1.8-.58 2.69-.12.6-.35 1.43-.43 2l-9.12.002c-.05-.34-.19-.92-.27-1.27-.12-.54-.24-1.08-.35-1.62l-.63-2.86C.46 11.74.24 10.68 0 9.63c.1-.23.33-.58.46-.8.38-.63.77-1.25 1.17-1.86 1.02-1.59 2.07-3.15 3.16-4.68.37-.53.75-1.05 1.14-1.56.19-.25.36-.49.56-.73z',
  rook: 'M21.14 27.17c.73.82 1.71 1.66 2.44 2.48l.005 2.76-2.49-.001-21.08.003C-.001 31.49.01 30.58 0 29.65c.79-.83 1.69-1.64 2.46-2.48.02-.6-.001-1.32.006-1.93l18.68-.002c-.004.65-.004 1.29 0 1.94zm-1.97-3.45c-.51.01-1.04.004-1.55.005l-13.18-.005 1.13-8.12c.13-.97.29-1.93.4-2.9l11.63-.002 1.56 11.03zm-.01-12.53H4.43c.004-.64.004-1.29 0-1.93h14.73l-.01 1.93zM6.1.01c.01 1.25-.001 2.54-.001 3.8 1.11.02 2.3 0 3.42.005l-.007-3.8 4.56.004v3.8l3.41-.002-.002-3.8c.32.001 3.56-.02 3.66.03l.002 7.7-18.69-.003-.004-7.72C3.61-.02 4.93.01 6.1.01z',
  pawn: 'M14 2a4 4 0 00-4 4c0 1.2.53 2.27 1.37 3H9.5a1.5 1.5 0 000 3h1.09A5.99 5.99 0 008 17v1h12v-1a5.99 5.99 0 00-2.59-4.93H18.5a1.5 1.5 0 000-3h-1.87A3.98 3.98 0 0018 6a4 4 0 00-4-4zM6 20v2h16v-2H6zm-2 4v2h20v-2H4z',
  crown: 'M19.85 21.59v2.79h-1.39l.7 3.48H8.71l.7-3.48H8.01v-2.79h11.84zM17.79 13.61l2.76-2.47 2.09 1.39-3.83 6.97H9.05l-3.83-6.97 2.09-1.39 2.76 2.47 3.86-3.86 3.86 3.86zM16.37 5.92l-2.44 2.44-2.44-2.44 2.44-2.44 2.44 2.44z',
  queen: 'M14 2a3 3 0 00-1 5.83V10H9L6 5l-4 9h3l1 8h16l1-8h3L22 5l-3 5h-4V7.83A3 3 0 0014 2zM6 24v2h16v-2H6z',
  king: 'M15 2h-2v3h-3v2h3v3h2V7h3V5h-3V2zM9 12a5 5 0 0110 0v1H9v-1zm-2 3h14l1 7H6l1-7zm-2 9h18v2H5v-2z',
};
const CHESS_VB = {
  knight: '0 0 24.19 27.63', bishop: '0 0 12.98 27.86', rook: '0 0 23.58 32.41',
  pawn: '0 0 28 28', crown: '0 0 27.86 27.86', queen: '0 0 28 28', king: '0 0 28 28',
};

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

const PARTY_PIECES = ['knight', 'bishop', 'rook', 'queen', 'crown'];

function PartyAvatar({ name = '', size = 28 }) {
  const cabinet = isCabinet(name);
  const pal = cabinet ? colors.avatar[5] : colors.avatar[hashName(name) % (colors.avatar.length - 1)]; // le cream (idx 5) est réservé au cabinet
  const piece = cabinet ? 'king' : PARTY_PIECES[hashName(name) % PARTY_PIECES.length];
  const d = CHESS_PATHS[piece];
  const vb = CHESS_VB[piece];
  return (
    <div
      className="flex items-end justify-center flex-shrink-0 overflow-hidden"
      style={{
        width: size, height: size,
        borderRadius: size <= 20 ? 4 : size <= 24 ? 6 : 8,
        backgroundColor: pal.bg,
        paddingTop: 2,
      }}
      title={name}
    >
      <svg viewBox={vb} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '80%', height: '80%', display: 'block' }}>
        <path d={d} fill={pal.fill} />
      </svg>
    </div>
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

// ── MetaChip ────────────────────────────────────────────────────────────────
// Chip d'atome de métadonnée - forme UNIQUE du header du panneau, avec toutes
// les variantes rangées dans un même composant.
//
// Composition (dans l'ordre visuel) :
//   [icon]  [label muted]  [value fg]  [· aside muted, truncable]  [✦ ai]  [action]
//
// Deux `variant` (fond) :
//   · default   fond canvas + border neutre               (Date, Type…)
//   · strong    fond cream + valeur medium                (chip d'identité)
//
// Deux comportements INTERACTIFS mutuellement exclusifs :
//   · action    { label, onClick } - petit lien texte à droite du chip
//                (le chip reste un <span>)
//   · onClick   TOUT le chip devient un <button> - hover renforce border+texte
//
// États : default · hover (interactif) · disabled (onClick) · truncated (aside).
//
// `value` accepte un ReactNode : on compose librement une valeur multi-parties
// (« I - MEDICAL · n° 2 ») sans multiplier les variants.
//
// TYPES — chaque « type » de métadonnée (date, pièce, découpage, source…) a son
// icône + label + variant canoniques, définis UNE seule fois dans META_CHIP_TYPES.
// Passer `type="date"` suffit ; icon / label / variant restent surchargeables au
// cas par cas. C'est le même langage partout : un type = une forme.
export const META_CHIP_TYPES = {
  // — métadonnées d'un document (pièce / modèle) —
  piece:         { icon: Hash,      label: 'Pièce', variant: 'strong' }, // chip d'identité
  date:          { icon: Calendar,  label: 'Date' },
  type:          { icon: null,      label: 'Type' },
  decoupage:     { icon: Scissors,  label: 'Document découpé' },
  source:        { icon: Mail,      label: 'Source' },        // provenance (email, dépôt…)
  // — jurisprudence —
  juridiction:   { icon: Gavel,     label: 'Juridiction' },
  numero:        { icon: Hash,      label: 'n°' },
  // — email —
  objet:         { icon: Mail,      label: 'Objet' },
  messages:      { icon: null,      label: 'Messages' },
  piecesJointes: { icon: Paperclip, label: 'Pièces jointes' },
  // — loi / texte —
  code:          { icon: Stamp,     label: 'Code' },
  enVigueur:     { icon: Calendar,  label: 'En vigueur au' },
  // — ligne structurée (cotisations…) —
  periode:       { icon: Calendar,  label: 'Période' },
  // — web —
  web:           { icon: Globe,     label: 'Source web' },
};

export function MetaChip({
  type,                // clé de META_CHIP_TYPES - fournit icon/label/variant par défaut
  icon,
  label,
  value,
  aside,
  ai,
  variant,             // 'default' | 'strong' - surcharge le variant du type
  action,              // { label, onClick } - lien texte à droite (span uniquement)
  onClick,             // rend le chip entier cliquable (button)
  disabled,
  title,
  className,
}) {
  const preset = (type && META_CHIP_TYPES[type]) || null;
  const Icon = icon !== undefined ? icon : preset?.icon;
  const resolvedLabel = label !== undefined ? label : preset?.label;
  const resolvedVariant = variant || preset?.variant || 'default';
  const clickable = !!onClick;
  const strong = resolvedVariant === 'strong';

  const chrome = [
    'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border text-[13px] text-foreground-secondary min-w-0 max-w-full',
    strong ? 'bg-cream' : 'bg-background-canvas',
    clickable
      ? 'transition-colors hover:border-border-strong disabled:hover:border-border disabled:cursor-not-allowed disabled:opacity-60'
      : '',
    className || '',
  ].filter(Boolean).join(' ');

  // Contraste : sur bg-canvas (#f8f7f5) et bg-cream (#eeece6), foreground-muted
  // (#a8a29e) tombe à ~2.4:1 - sous le plancher WCAG. On monte à
  // foreground-secondary (#78716c ≈ 4.7:1) tout en gardant la hiérarchie
  // muted-label / strong-value. Le séparateur « · » de l'aside reste plus léger
  // (foreground-muted) : c'est un signe typographique, pas du texte.
  const inner = (
    <>
      {Icon && <Icon className="w-3.5 h-3.5 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />}
      {resolvedLabel && <span className="text-foreground-secondary flex-shrink-0 whitespace-nowrap">{resolvedLabel}</span>}
      {value != null && (
        <span className={`text-foreground flex-shrink-0 whitespace-nowrap ${strong ? 'font-medium' : ''}`}>{value}</span>
      )}
      {aside && (
        <span
          className="text-foreground-secondary truncate min-w-0"
          title={typeof aside === 'string' ? aside : undefined}
        >
          <span className="text-foreground-muted mr-1" aria-hidden>·</span>{aside}
        </span>
      )}
      {ai && <Sparkles className="w-3 h-3 flex-shrink-0" strokeWidth={2} style={{ color: AI_ACCENT }} />}
    </>
  );

  if (clickable) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} title={title} className={chrome}>
        {inner}
      </button>
    );
  }

  return (
    <span title={title} className={chrome}>
      {inner}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="ml-0.5 font-medium text-link hover:underline underline-offset-2 flex-shrink-0"
        >
          {action.label}
        </button>
      )}
    </span>
  );
}

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
  urssaf: { label: 'URSSAF', bg: '#eff6ff', fg: '#1e40af' },
  boss: { label: 'BOSS', bg: '#f5f3ff', fg: '#6d28d9' },
  impots: { label: 'Impôts', bg: '#ecfdf5', fg: '#047857' },
  code: { label: 'Code du travail', bg: '#fff7ed', fg: '#c2410c' },
  conv: { label: 'Convention collective', bg: '#fdf2f8', fg: '#be185d' },
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
      <div className="w-7 h-7 rounded-md bg-white border border-border flex items-center justify-center flex-shrink-0">
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
      <div className="w-7 h-7 rounded-md bg-white border border-border flex items-center justify-center flex-shrink-0">
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
    <div
      className="relative bg-white rounded-md shadow-md border border-border shrink-0 overflow-hidden"
      style={{ width, aspectRatio: '1 / 1.414', containerType: 'inline-size' }}
      data-page={pageNo}
    >
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
    </div>
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
    <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-auto min-w-0">
      <div className="flex flex-col items-center gap-5 py-5 px-5">
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
      </div>
    </div>
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
      <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3', background: 'linear-gradient(135deg,#e9e4dc,#d9d3c8 58%,#cec7ba)' }}>
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
      <div className="px-3 py-2.5 border-t border-border bg-white">
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
    <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-auto min-w-0">
      <div className="flex flex-col items-center gap-5 py-5 px-5">
        {Array.from({ length: total }, (_, i) => (
          <ImagePage key={i} source={source} pageNo={i + 1} totalPages={total} width={pageWidth} quotes={byPage[i + 1] || []} />
        ))}
      </div>
    </div>
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
    <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-auto min-w-0">
      <div className="flex flex-col items-center gap-5 py-5 px-5">
        {Array.from({ length: total }, (_, i) => (
          <WordPage key={i} source={source} pageNo={i + 1} totalPages={total} width={pageWidth} paras={byPage[i + 1] || []} />
        ))}
      </div>
    </div>
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
          <div className="rounded-xl border border-border bg-white p-4">
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
            <div className={`rounded-xl border bg-white p-4 ${m.cite ? 'border-transparent' : 'border-border'}`}>
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
          <div className="rounded-xl border border-border bg-white p-4 mb-5">
            <FieldLabel>Règle appliquée</FieldLabel>
            <p className="mt-2 text-[13.5px] leading-6 text-foreground-secondary">{g.regle}</p>
          </div>
        )}
        <div className="rounded-xl border border-border bg-white overflow-hidden">
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
                {r.cite && <span className="sr-only"> — base {r.base}, montant {r.montant}</span>}
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
function CitesPanel({ items, active, onGo }) {
  const activeRef = useRef(null);
  // Suit le stepper : quand la citation active change (clic dans le doc,
  // flèches du pied, popover), on ramène la ligne dans le rail. Nearest
  // évite de re-scroller quand elle est déjà visible.
  useEffect(() => {
    if (activeRef.current) activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [active]);
  if (!items || items.length === 0) return null;
  // Sur mobile / tablette étroite, le rail vole trop de largeur au doc. On le
  // masque : la liste reste accessible via le popover du stepper dans le pied.
  //
  // Traitement typographique inbox-like : PAGE tient lieu d'objet (mono
  // uppercase, bold quand actif = « non lu ») ; l'extrait tient lieu de snippet
  // (deux lignes claires, pas de fioritures). Le numéro à gauche reprend la
  // logique du stepper. L'état actif se déclare via une barre amber pleine à
  // gauche (3px) + un fond cream - rappel visuel du surlignage dans le corps.
  return (
    <aside className="hidden md:flex w-[240px] lg:w-[300px] max-w-[38%] border-l border-border bg-white flex-col flex-shrink-0 min-h-0">
      {/* Header : eyebrow mono + compteur en pastille discrète */}
      <div className="px-4 pt-4 pb-3 border-b border-border-subtle flex-shrink-0 flex items-baseline justify-between gap-3">
        <span className="uppercase tracking-wide text-foreground-secondary" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em' }}>
          Extraits cités
        </span>
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-background-subtle text-[11px] font-medium text-foreground-secondary tabular-nums">
          {items.length}
        </span>
      </div>
      {/* Liste : items séparés par un filet très léger, tension respirable */}
      <div className="overflow-auto flex-1 min-h-0">
        {items.map((it, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              ref={isActive ? activeRef : undefined}
              onClick={() => onGo(i)}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Citation ${i + 1}${it.page ? `, page ${it.page}` : ''}${it.text ? `. ${it.text.slice(0, 80)}${it.text.length > 80 ? '…' : ''}` : ''}`}
              className={`group relative w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${FOCUS_RING} focus-visible:ring-inset ${i > 0 ? 'border-t border-border-subtle' : ''} ${isActive ? 'bg-cream' : 'hover:bg-background-canvas'}`}
            >
              {/* Barre amber pleine à gauche quand actif - rappelle le liseré
                  du chunk dans le doc */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: HL_EDGE }}
                />
              )}
              {/* Numéro dans une pastille carrée douce, amber quand actif */}
              <span
                className={`inline-flex items-center justify-center flex-shrink-0 w-[22px] h-[22px] rounded text-[11px] font-medium tabular-nums transition-colors ${
                  isActive ? 'text-foreground' : 'text-foreground-secondary bg-background-subtle group-hover:bg-white group-hover:text-foreground'
                }`}
                style={isActive ? { background: HL, boxShadow: `0 1px 2px ${HL_EDGE}33` } : undefined}
              >
                {i + 1}
              </span>
              {/* Contenu : eyebrow page + extrait sobre.
                  Traitement inbox-like : la page tient lieu d'objet (bold quand
                  actif, comme un mail non-lu), l'extrait tient lieu de snippet
                  (deux lignes claires, pas de fioritures typographiques). */}
              <span className="min-w-0 flex-1">
                {it.page && (
                  <span
                    className={`block uppercase tabular-nums mb-1 ${isActive ? 'text-foreground' : 'text-foreground-secondary'}`}
                    style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: isActive ? 600 : 500, letterSpacing: '0.06em' }}
                  >
                    page {it.page}
                  </span>
                )}
                <span
                  className={`block ${isActive ? 'text-foreground' : 'text-foreground-secondary'}`}
                  style={{
                    fontSize: 13,
                    lineHeight: '19px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                  }}
                >
                  {it.text || <em className="text-foreground-muted">Extrait indisponible</em>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

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

// Enchaîne les passages cités d'un même document. 1 chunk → bouton simple ;
// plusieurs → stepper avec flèches, dont le compteur ouvre la LISTE complète
// (page + extrait) - un clic pour sauter à n'importe quelle citation.
function CiteNav({ count, active, items, onGo, onStep }) {
  const [open, setOpen] = useState(false);
  if (count <= 0) return null;
  if (count === 1) {
    return (
      <button type="button" onClick={() => onGo(0)} className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors">
        <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={1.75} /> Aller à la citation
      </button>
    );
  }
  return (
    <div className="inline-flex items-center gap-0.5 relative">
      <button type="button" onClick={() => onStep(-1)} disabled={active <= 0} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors disabled:opacity-40 disabled:pointer-events-none" aria-label="Citation précédente">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors tabular-nums whitespace-nowrap"
        title="Voir toutes les citations"
      >
        Citation <span className="font-medium text-foreground">{active + 1}</span> / {count}
        <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.75} />
      </button>
      <button type="button" onClick={() => onStep(1)} disabled={active >= count - 1} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors disabled:opacity-40 disabled:pointer-events-none" aria-label="Citation suivante">
        <ChevronRight className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute bottom-full mb-2 right-0 z-20 w-[380px] max-h-[340px] overflow-auto bg-white border border-border rounded-lg shadow-lg py-1"
            style={{ animation: 'fadeIn 0.15s ease-out' }}
          >
            <div className="px-3 pt-2 pb-1.5 sticky top-0 bg-white border-b border-border-subtle">
              <FieldLabel>Citations dans ce document ({count})</FieldLabel>
            </div>
            {items.map((it, i) => {
              const isActive = i === active;
              return (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  onClick={() => { onGo(i); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors border-l-2 ${isActive ? 'bg-cream border-l-[color:var(--cite-edge)]' : 'border-l-transparent hover:bg-background'}`}
                  style={{ '--cite-edge': HL_EDGE }}
                >
                  <span className={`inline-flex items-center justify-center flex-shrink-0 w-5 h-5 rounded text-[11px] font-medium tabular-nums mt-0.5 ${isActive ? 'text-foreground' : 'text-foreground-secondary bg-background-subtle'}`} style={isActive ? { background: HL, boxShadow: `inset 2px 0 0 ${HL_EDGE}` } : undefined}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    {it.page && <span className="block text-[11px] text-foreground-muted tabular-nums mb-0.5">page {it.page}</span>}
                    <span className={`block text-[12.5px] leading-5 ${isActive ? 'text-foreground' : 'text-foreground-secondary'}`} style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {it.text || <span className="italic text-foreground-muted">Extrait indisponible</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const ZOOM_STEPS = [50, 67, 80, 100, 125, 150, 200];

// ── Rail d'édition « valeurs de la ligne » ────────────────────────────────────
// Quand le SUJET du panneau est une ligne de poste (déclenché depuis un poste /
// une ligne de chiffrage), le doc devient sa pièce attachée et ce rail édite les
// VALEURS de la ligne. Il est exclusif du rail de citations (on édite, on ne
// scanne pas des citations). Générique : rendu depuis un schéma `ligne.fields`
// (+ `summary` dérivé), donc il sert n'importe quel poste (PGPA, DFT, DSA,
// social…). L'édition des MÉTADONNÉES de la pièce reste, elle, dans la barre méta
// (bouton « Modifier la pièce »).
const LIGNE_INPUT = 'w-full h-9 px-3 text-[13.5px] text-foreground bg-white border border-border rounded-lg shadow-xs outline-none focus:border-foreground-muted transition-colors';

function LigneField({ f }) {
  // Repère « sourcé » : signale que la valeur a été extraite du document ouvert
  // à gauche (date / montant). Rappelle que la donnée vient de la pièce.
  const label = (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[12px] font-medium text-foreground-secondary">{f.label}</label>
      {f.sourced && (
        // State « sourcé » du DS : une sparkle discrète à côté du label. Survoler
        // le champ surligne l'emplacement dans le document.
        <span title="Valeur extraite du document" className="inline-flex items-center flex-shrink-0" style={{ color: AI_ACCENT }}>
          <Sparkle className="w-3 h-3" strokeWidth={2} fill="currentColor" />
        </span>
      )}
    </div>
  );
  if (f.type === 'date') {
    return (<div>{label}<div className="flex items-center gap-2 h-9 px-3 bg-white border border-border rounded-lg shadow-xs focus-within:border-foreground-muted transition-colors"><Calendar className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} /><input defaultValue={f.value} className="flex-1 min-w-0 bg-transparent outline-none text-[13.5px] text-foreground" /></div></div>);
  }
  if (f.type === 'money') {
    return (<div>{label}<div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-[13.5px]">€</span><input defaultValue={f.value} className={`${LIGNE_INPUT} pl-7 tabular-nums`} /></div></div>);
  }
  if (f.type === 'number' || f.type === 'percent') {
    const suffix = f.type === 'percent' ? '%' : (f.suffix || '');
    return (<div>{label}<div className="relative"><input defaultValue={f.value} className={`${LIGNE_INPUT} tabular-nums ${suffix ? 'pr-8' : ''}`} />{suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted text-[13.5px]">{suffix}</span>}</div></div>);
  }
  if (f.type === 'select') {
    return (<div>{label}<div className="relative"><select defaultValue={f.value} className={`${LIGNE_INPUT} appearance-none pr-8`}>{(f.options || [f.value]).map((o) => <option key={o}>{o}</option>)}</select><ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" /></div></div>);
  }
  return (<div>{label}<input defaultValue={f.value} className={LIGNE_INPUT} /></div>);
}

// Une ligne porte une ou plusieurs pièces justificatives. Chaque ligne = la
// pièce + ses actions PROPRES : voir en contexte (œil → affiche la pièce dans le
// doc), télécharger, retirer. La pièce active (affichée dans le doc) est mise en
// avant. C'est ici que vivent télécharger/supprimer (plus dans le header).
function LignePieces({ pieces, activePiece = 0, onView }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-foreground-secondary mb-1.5">Pièces justificatives</label>
      <div className="space-y-2">
        {pieces.map((p, i) => {
          const active = i === activePiece;
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => onView && onView(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView && onView(i); } }}
              title="Voir la pièce"
              aria-pressed={active}
              className={`group flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${FOCUS_RING} ${active ? 'bg-cream border-border-strong' : 'bg-white border-border hover:bg-cream/50 hover:border-border-strong'}`}
            >
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 transition-colors ${active ? 'bg-foreground text-white' : 'bg-cream text-foreground-tertiary'}`}><FileText className="w-3.5 h-3.5" strokeWidth={1.75} /></span>
              <span className={`flex-1 min-w-0 text-[13px] truncate text-foreground ${active ? 'font-medium' : ''}`}>{p}</span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button type="button" onClick={(e) => e.stopPropagation()} title="Télécharger" aria-label="Télécharger la pièce" className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-white transition-colors"><Download className="w-4 h-4" strokeWidth={1.75} /></button>
                <button type="button" onClick={(e) => e.stopPropagation()} title="Retirer" aria-label="Retirer la pièce" className="p-1 rounded text-foreground-muted hover:text-danger hover:bg-danger-subtle transition-colors"><Trash2 className="w-4 h-4" strokeWidth={1.75} /></button>
              </div>
            </div>
          );
        })}
        <button type="button" className="w-full flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background-canvas text-foreground-muted text-left hover:border-border-strong transition-colors">
          <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} /><span className="text-[13px] flex-1 truncate">Rechercher une pièce…</span><ChevronDown className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function LigneEditRail({ ligne, onClose, pieceNames, activePiece, onView, onSourceHover = () => {} }) {
  return (
    <aside className="w-[360px] max-w-[42%] flex-shrink-0 bg-white flex flex-col min-h-0">
      <div className="min-h-[44px] px-4 border-b border-border flex items-center gap-2 flex-shrink-0">
        <Pencil className="w-3.5 h-3.5 text-foreground-secondary" strokeWidth={1.75} />
        <span className="text-[13px] font-semibold text-foreground">Modifier la ligne</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Cadre mental : les valeurs viennent du document (à gauche) ; on ajuste
            la ligne, pas le document. */}
        <p className="flex items-start gap-1.5 text-[12px] leading-snug text-foreground-secondary">
          <Sparkle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: AI_ACCENT }} strokeWidth={2} fill="currentColor" />
          <span>Valeurs extraites du document.</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(ligne.fields || []).map((f, i) => {
            const hov = f.sourced && f.docHint;
            return (
              <div
                key={i}
                className={f.full ? 'col-span-2' : ''}
                onMouseEnter={hov ? () => onSourceHover(f.docHint) : undefined}
                onMouseLeave={hov ? () => onSourceHover(null) : undefined}
                onFocusCapture={hov ? () => onSourceHover(f.docHint) : undefined}
                onBlurCapture={hov ? () => onSourceHover(null) : undefined}
              >
                <LigneField f={f} />
              </div>
            );
          })}
        </div>
        {pieceNames?.length > 0 && <LignePieces pieces={pieceNames} activePiece={activePiece} onView={onView} />}
        {ligne.summary?.length > 0 && (
          <>
            <div className="h-px bg-border -mx-4" />
            <div className="space-y-2.5 pt-1">
              {ligne.summary.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[12.5px] text-foreground-muted">{s.label}</span>
                  <span className={s.strong ? 'text-[14px] font-semibold text-foreground tabular-nums' : 'text-[13px] text-foreground-secondary tabular-nums'}>{s.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="px-4 h-[52px] border-t border-border flex items-center justify-between gap-2 flex-shrink-0">
        <button type="button" onClick={onClose} className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-danger hover:bg-danger-subtle transition-colors" aria-label="Supprimer la ligne"><Trash2 className="w-4 h-4" strokeWidth={1.75} /></button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="h-9 px-3.5 rounded-lg text-[13px] font-medium text-foreground-secondary hover:bg-cream transition-colors">Annuler</button>
          <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-foreground hover:bg-foreground-tertiary transition-colors">Enregistrer</button>
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
  const TitleIcon = subjectIsLigne ? Rows3 : Icon;
  const titleEyebrow = subjectIsLigne ? (ligne.poste || 'Ligne') : cfg.label;
  const titleName = subjectIsLigne ? ligne.titre : source.name;
  const openSource = (t) => { if (t && onOpenSource) onOpenSource(t); };

  const [zoom, setZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  // ESC ferme les menus ouverts ; si plein écran, ferme d'abord le plein écran.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (fullscreen) { setFullscreen(false); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);
  const [docHi, setDocHi] = useState(null); // { page, rect } - surlignage doc au survol d'un champ sourcé
  const scrollRef = useRef(null);

  const [fitPx, setFitPx] = useState(640);
  useEffect(() => {
    if (!fitWidth || !isDoc) return;
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setFitPx(Math.max(320, Math.min(el.clientWidth - 40, 980)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitWidth, fullscreen, isDoc]);

  const pageWidth = fitWidth ? fitPx : Math.round(640 * (zoom / 100));

  // ── Contrat « citation » ── Un doc peut porter plusieurs passages (chunks) :
  // tous surlignés, un stepper les enchaîne, le chunk actif reçoit un liseré.
  // Ordre = ordre du DOM (page, puis position).
  const passages = source.passages || (source.passage ? [source.passage] : []);
  const [activeCite, setActiveCite] = useState(0);
  const [citeCount, setCiteCount] = useState(passages.length);
  // Extraits + page dérivés de la source de vérité (le DOM rendu) : identique
  // à la logique du stepper, donc list & flèches sont toujours en phase.
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
    cites[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    if (!passages.length) return;
    const t = setTimeout(() => {
      const el = scrollRef.current;
      const cites = el ? el.querySelectorAll('[data-cite]') : [];
      setCiteCount(cites.length);
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

  const stepZoom = (dir) => {
    setFitWidth(false);
    setZoom((z) => {
      const idx = ZOOM_STEPS.reduce((best, v, i) => (Math.abs(v - z) < Math.abs(ZOOM_STEPS[best] - z) ? i : best), 0);
      return ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, idx + dir))];
    });
  };
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const mid = el.scrollTop + el.clientHeight / 2;
    let cur = 1;
    el.querySelectorAll('[data-page]').forEach((p) => { if (p.offsetTop <= mid) cur = Number(p.dataset.page); });
    setCurrentPage(cur);
  }, []);
  const goToPage = (n) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-page="${n}"]`);
    if (target) el.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
  };

  // ── Métadonnées documents : lecture (chips) / édition (Inputs) ──
  const docReadChips = () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
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
      </div>
      {/* Résumé IA : sujet Pièce uniquement. Depuis une ligne, pas besoin. */}
      {!subjectIsLigne && source.summary && (
        <div className="flex items-start gap-1.5">
          <p
            className="text-[13px] leading-5 text-foreground-secondary min-w-0 flex-1"
            style={metaExpanded ? undefined : { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            title={source.summary}
          >
            {source.summary}
          </p>
          <button type="button" onClick={() => setMetaExpanded((v) => !v)} className="flex-shrink-0 inline-flex items-center gap-0.5 text-caption text-foreground-muted hover:text-foreground-secondary transition-colors mt-0.5">
            {metaExpanded ? <>Réduire <ChevronUp className="w-3 h-3" /></> : <>Détails <ChevronDown className="w-3 h-3" /></>}
          </button>
        </div>
      )}
    </div>
  );

  const docEditInputs = () => (
    <div className="flex flex-col gap-3.5" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <FieldLabel>Informations du document</FieldLabel>
      <Input label="Nom du document" aiGenerated defaultValue={source.name} />
      <div className="flex gap-3">
        {kind === 'piece' ? (
          <Input label="Type" className="flex-1">
            <div className="relative">
              <select defaultValue={source.type} className="w-full h-9 pl-3 pr-8 bg-white border border-border rounded-lg shadow-xs text-body text-foreground outline-none appearance-none focus:border-foreground-muted">
                {['Rapport', 'Correspondance', 'Facture', 'Certificat médical', 'Autre'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </Input>
        ) : (
          <Input label="Catégorie" className="flex-1" defaultValue={source.category} />
        )}
        <Input label={kind === 'piece' ? 'Date du document' : 'Mise à jour'} aiGenerated={kind === 'piece'} className="flex-1">
          <div className="flex items-center gap-2 h-9 px-3 bg-white border border-border rounded-lg shadow-xs focus-within:border-foreground-muted focus-within:ring-1 focus-within:ring-border-alt">
            <Calendar className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
            <input defaultValue={source.date} placeholder="jj/mm/aaaa" className="flex-1 min-w-0 bg-transparent outline-none text-body text-foreground" />
          </div>
        </Input>
      </div>
      {source.split && <SplitCallout split={source.split} />}
      {source.provenance && <ProvenanceCallout prov={source.provenance} onOpen={openSource} />}
      {kind === 'piece' && (
        <>
          <div className="h-px bg-border -mx-4" />
          <FieldLabel>Numérotation de la pièce</FieldLabel>
          <div className="flex gap-3">
            <Input label="Section" className="flex-1" defaultValue={source.section} />
            <Input label="Numéro" className="flex-1" defaultValue={source.numero} />
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
        <div className="flex items-center gap-2 flex-wrap">
          <MetaChip label="Juridiction" value={s.juridiction} />
          <MetaChip icon={Calendar} label="Date" value={s.date} />
          <MetaChip icon={Hash} value={`n° ${s.numero}`} />
          {s.quantum && <Badge variant="info" size="md" label={s.quantum} />}
        </div>
      );
    }
    if (kind === 'email') {
      const e = source.email || {};
      const attCount = (e.messages || []).reduce((n, m) => n + (m.attachments?.length || 0), 0);
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <MetaChip label="Objet" value={e.subject} />
          <MetaChip label="Messages" value={e.messages?.length} />
          {attCount > 0 && <MetaChip icon={Paperclip} label="Pièces jointes" value={attCount} />}
        </div>
      );
    }
    if (kind === 'loi') {
      const l = source.loi || {};
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <MetaChip label="Code" value={l.code} />
          <MetaChip icon={Calendar} label="En vigueur au" value={l.enVigueur} />
        </div>
      );
    }
    if (kind === 'ligne') {
      const g = source.ligne || {};
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <AuthorityBadge authority={g.authority} />
          {g.periode && <MetaChip label="Période" value={g.periode} />}
        </div>
      );
    }
    return null;
  };

  const renderBody = () => {
    if (cfg.body === 'doc') return <DocBody source={source} pageWidth={pageWidth} scrollRef={scrollRef} onScroll={onScroll} highlight={docHi} />;
    if (cfg.body === 'jp') return <JpBody source={source} scrollRef={scrollRef} />;
    if (cfg.body === 'email') return <EmailBody source={source} scrollRef={scrollRef} onOpen={openSource} />;
    if (cfg.body === 'loi') return <LoiBody source={source} scrollRef={scrollRef} />;
    if (cfg.body === 'ligne') return <LigneBody source={source} scrollRef={scrollRef} />;
    return null;
  };

  // Pied extrait en variable : rendu en bas du panneau (sujet pièce/record) ou
  // à l'intérieur de la colonne document (sujet ligne, à côté du rail de valeurs).
  const footerBar = cfg.footer === 'doc' ? (
    <div className="px-3 h-[52px] border-t border-border bg-white flex-shrink-0 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => stepZoom(-1)} className={`p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors ${FOCUS_RING}`} aria-label="Dézoomer">
          <ZoomOut className="w-4 h-4" strokeWidth={1.75} />
        </button>
        <button type="button" onClick={() => setFitWidth((f) => !f)} aria-pressed={fitWidth} className={`px-2 h-7 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors min-w-[62px] text-center tabular-nums ${FOCUS_RING}`}>
          {fitWidth ? 'Ajusté' : `${zoom}%`}
        </button>
        <button type="button" onClick={() => stepZoom(1)} className={`p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors ${FOCUS_RING}`} aria-label="Zoomer">
          <ZoomIn className="w-4 h-4" strokeWidth={1.75} />
        </button>
        <span className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => setFullscreen((f) => !f)} aria-pressed={fullscreen} className={`inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors ${FOCUS_RING}`}>
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
          {fullscreen ? 'Réduire' : 'Plein écran'}
        </button>
        {citeCount > 0 && (
          <>
            <span className="w-px h-4 bg-border mx-1" />
            <CiteNav count={citeCount} active={activeCite} items={citeItems} onGo={goToCite} onStep={(d) => goToCite(activeCite + d)} />
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className={`p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors disabled:opacity-40 disabled:pointer-events-none ${FOCUS_RING}`} aria-label="Page précédente">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-caption text-foreground-muted tabular-nums min-w-[54px] text-center">page {currentPage} / {source.pages}</span>
        <button type="button" onClick={() => goToPage(Math.min(source.pages, currentPage + 1))} disabled={currentPage >= source.pages} className={`p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors disabled:opacity-40 disabled:pointer-events-none ${FOCUS_RING}`} aria-label="Page suivante">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : cfg.footer === 'passage' ? (
    <div className="px-3 py-2 border-t border-border bg-white flex-shrink-0 flex items-center justify-between gap-2 flex-wrap">
      <button type="button" className="flex items-center gap-2 flex-1 min-w-0 max-w-[320px] h-8 px-2.5 rounded-lg border border-border bg-background-canvas text-foreground-muted text-left transition-colors hover:border-border-strong hover:text-foreground-secondary">
        <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
        <span className="text-[13px] truncate">Rechercher dans le texte</span>
      </button>
      {citeCount > 0 && (
        <CiteNav count={citeCount} active={activeCite} items={citeItems} onGo={goToCite} onStep={(d) => goToCite(activeCite + d)} />
      )}
    </div>
  ) : null;

  // Barre de métadonnées de la pièce (chips lecture / Inputs édition + Modifier
  // en sujet Pièce ; identité + select de pièce en sujet Ligne). Placée pleine
  // largeur en sujet Pièce, mais DANS la colonne doc en sujet Ligne pour que le
  // rail d'édition s'étende jusque sous la barre de titre.
  const metaBand = (
    <div className={`px-4 border-b border-border bg-white flex-shrink-0 flex gap-3 ${subjectIsLigne ? 'min-h-[44px] items-center' : 'py-3 items-start'}`}>
      <div className="flex-1 min-w-0">
        {subjectIsLigne && isDoc && !editing ? (
          // Ligne : identité (icône + nom, sans switch) + chips pièce, TOUT sur une
          // seule ligne flex, séparés par un filet. Le changement de pièce se fait
          // via les cards « Pièces justificatives » du rail, pas ici.
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.accent.fg }} strokeWidth={1.75} />
              <span className="text-[13px] font-medium text-foreground truncate">{source.name}</span>
            </span>
            {/* Métadonnées du doc en bout de ligne (dead space à droite), à l'écart
                du nom : visibles d'un coup d'œil sans gêner la lecture. */}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <MetaChip variant="strong" icon={Hash} label="Pièce" value={<>{source.section}<span className="text-foreground-muted mx-1">·</span><span className="tabular-nums">n° {source.numero}</span></>} />
              <MetaChip icon={Calendar} label="Date" value={source.date} ai />
              <MetaChip label="Type" value={source.type} />
            </div>
          </div>
        ) : (
          isDoc ? (editing ? docEditInputs() : docReadChips()) : otherMeta()
        )}
      </div>
      {/* Édition des métadonnées pièce : sujet Pièce uniquement. */}
      {isDoc && !subjectIsLigne && (
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-pressed={editing}
          className={`inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[13px] font-medium transition-colors flex-shrink-0 ${FOCUS_RING} ${editing ? 'text-foreground hover:bg-cream' : 'text-link hover:bg-info-bg'}`}
        >
          {editing ? <><Check className="w-3.5 h-3.5" strokeWidth={2} /> Terminé</> : <><PencilLine className="w-3.5 h-3.5" strokeWidth={1.75} /> Modifier</>}
        </button>
      )}
    </div>
  );

  return (
    <div
      className={`bg-background-canvas flex flex-col overflow-hidden ${
        fullscreen ? 'fixed inset-0 z-50' : embedded ? 'relative rounded-xl border border-border shadow-sm h-[520px] sm:h-[640px] lg:h-[720px]' : 'relative h-full w-full'
      }`}
      style={{ animation: fullscreen ? 'fadeIn 0.15s ease-out' : undefined }}
    >
      {/* ── Barre de titre ── */}
      <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 ${subjectIsLigne ? 'bg-cream text-foreground-tertiary' : ''}`} style={subjectIsLigne ? undefined : { background: cfg.accent.bg, color: cfg.accent.fg }}>
            <TitleIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
          </span>
          {/* Eyebrow : uniquement en sujet ligne (le poste). En sujet pièce, le
              header du design = icône + titre, l'icône teintée porte le kind. */}
          {subjectIsLigne && (
            <span className="hidden sm:inline text-[11px] font-medium uppercase tracking-wide flex-shrink-0 text-foreground-muted" style={{ fontFamily: MONO }}>{titleEyebrow}</span>
          )}
          <span className="text-body-medium text-foreground-strong truncate min-w-0">{titleName}</span>
        </div>
        <div className="flex items-center flex-shrink-0">
          {navTotal > 1 && (
            <>
              <div className="flex items-center gap-1 pr-2">
                <button type="button" onClick={onPrev} className={`p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors ${FOCUS_RING}`} aria-label="Pièce précédente">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-caption text-foreground-muted min-w-[38px] text-center tabular-nums" aria-label={`Pièce ${navIndex} sur ${navTotal}`}>{navIndex} / {navTotal}</span>
                <button type="button" onClick={onNext} className={`p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors ${FOCUS_RING}`} aria-label="Pièce suivante">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <span className="w-px h-5 bg-border" />
            </>
          )}
          {/* Actions - une seule pastille par famille :
                · lien externe (jp/loi/ligne) → icône seule, tooltip = nom
                · overflow ⋯ (docs)          → Télécharger + Supprimer
              Le bouton Fermer ferme la ligne. */}
          <div className="flex items-center gap-1.5 px-1.5">
            {cfg.link && (
              <button
                type="button"
                className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors ${FOCUS_RING}`}
                aria-label={`Ouvrir dans ${cfg.link}`}
                title={`Ouvrir dans ${cfg.link}`}
              >
                <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
            {/* Télécharger + Supprimer : actions de la PIÈCE → uniquement en sujet
                Pièce. Depuis une ligne, elles vivent par-pièce dans le rail
                « Pièces justificatives » (le header porte la ligne, pas la pièce). */}
            {isDoc && !subjectIsLigne && (
              <>
                <button
                  type="button"
                  title="Télécharger"
                  aria-label="Télécharger"
                  className={`inline-flex items-center gap-2 h-8 px-2 sm:px-3 rounded-lg bg-foreground text-white hover:bg-foreground-tertiary transition-colors text-[13px] font-medium ${FOCUS_RING}`}
                >
                  <Download className="w-4 h-4" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Télécharger</span>
                </button>
                {/* Supprimer : bouton dédié destructive-subtle (Figma), pas un menu */}
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
            {/* Fermer : bouton secondary rempli (Figma) */}
            <button type="button" onClick={onClose} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cream text-foreground-secondary hover:text-foreground hover:brightness-95 transition-all ${FOCUS_RING}`} aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Corps + zone de droite ──
           · sujet ligne  → colonne doc (méta pièce + doc + pied) à gauche, le rail
             de valeurs s'étend en pleine hauteur jusque sous la barre de titre.
           · sujet pièce  → méta pleine largeur, doc + rail de citations, pied en bas */}
      {subjectIsLigne ? (
        (() => {
          const docCol = (
            <div className="flex-1 min-w-0 flex flex-col">
              {metaBand}
              {renderBody()}
              {footerBar}
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
            />
          );
          const divider = <div className="w-px bg-border flex-shrink-0" />;
          return (
            <div className="flex flex-1 min-h-0">
              {railLeft ? <>{rail}{divider}{docCol}</> : <>{docCol}{divider}{rail}</>}
            </div>
          );
        })()
      ) : (
        <>
          {metaBand}
          <div className="flex flex-1 min-h-0">
            {renderBody()}
            <CitesPanel items={citeItems} active={activeCite} onGo={goToCite} />
          </div>
          {footerBar}
        </>
      )}
    </div>
  );
}
