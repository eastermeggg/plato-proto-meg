import React, { useEffect, useRef } from 'react';
import {
  Calendar, Gavel, Globe, Hash, Mail, Paperclip, Scissors, Sparkles, Stamp, X,
} from 'lucide-react';
import { colors, typography, typeStyle } from '../../design-system/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// PreviewAtoms — les composants ATOMIQUES du Doc Preview (PreviewPanel),
// pixel-perfect sur Figma « Plato — System » :
//
//   KindIcon      37375:9147  puce 28 (icône 16 sur fond subtle par kind)
//   PanelHeader   37375:8738  barre de titre h-56 (puce + serif 16 | nav · actions)
//   MetaChip      37375:9183  chip de métadonnée h-28 (14 types canoniques)
//   CiteRow       37375:8851  ligne du rail citations (Default / Hover / Active)
//   CitesPanel    37375:9168  le rail « EXTRAITS CITÉS » (compose CiteRow)
//   Previewer     37375:8874  le corps défilant (Body p-24 fond background)
//   PreviewerPage 37375:8876  la feuille (bordure noire 10%, ombre sm, carrée)
//
// PreviewPanel.js COMPOSE ces atomes - il ne les redéfinit jamais. Les accents
// par kind viennent de colors.accents (indigo / emerald / violet / sand), dont
// les subtle correspondent exactement aux variables Figma.
// ─────────────────────────────────────────────────────────────────────────────

const MONO = typography.fontFamily.mono;

// Titre serif du header - token typo « display-xs » (serif 16/20, -0.5).
export const SERIF_TITLE = typeStyle('display-xs');

export const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:ring-foreground/40';

const AI_ACCENT = colors.banner.ai.accent; // marqueur « généré par IA »

// ── KindIcon (Figma 37375:9147) ─────────────────────────────────────────────
// La puce d'identité du panneau : icône 16 sur carré arrondi 6, padding 6.
// Accent par kind (nœud) : Piece / Email / Modele → indigo · Jurisprudence →
// emerald · ArticleDeLoi → violet · Ligne (EditLine) → sand · Web → neutre.
export const KIND_ACCENTS = {
  piece:  { bg: colors.accents.indigo.subtle,  fg: colors.accents.indigo.text },
  modele: { bg: colors.accents.indigo.subtle,  fg: colors.accents.indigo.text },
  email:  { bg: colors.accents.indigo.subtle,  fg: colors.accents.indigo.text },
  jp:     { bg: colors.accents.emerald.subtle, fg: colors.accents.emerald.text },
  loi:    { bg: colors.accents.violet.subtle,  fg: colors.accents.violet.text },
  ligne:  { bg: colors.accents.sand.subtle,    fg: colors.accents.sand.text },
  web:    { bg: colors.semantic.backgroundSubtle, fg: colors.semantic.foregroundSecondary },
};

export function KindIcon({ kind, icon: Icon, accent, className = '' }) {
  const a = accent || KIND_ACCENTS[kind] || KIND_ACCENTS.piece;
  return (
    <span
      className={`inline-flex items-center justify-center p-1.5 rounded-md flex-shrink-0 ${className}`}
      style={{ background: a.bg, color: a.fg }}
    >
      {Icon && <Icon className="w-4 h-4" strokeWidth={1.75} />}
    </span>
  );
}

// ── PanelHeader (Figma 37375:8738) ──────────────────────────────────────────
// La barre de titre du panneau : h-56, pl-16 pr-12, fond blanc, filet bas.
//   gauche  puce KindIcon (+ eyebrow Badge optionnel) + titre serif 16 (-0.5)
//   droite  nav ‹ i/N › (14, chevrons medium) · séparateur 1x20 · actions
//           (gap 7px, slot) · Fermer (32, secondary)
// Variant `small` (kind=PieceSmall 37613:19640) : icône 16 nue + titre 14
// medium + action texte à droite (« Détail › ») - le sous-header d'une pièce
// dans un sujet ligne.
export function PanelHeader({
  small = false,
  kind,
  icon,
  accent,
  eyebrow,          // ReactNode optionnel (Badge code, kind EditLine)
  title,
  nav,              // { index, total, onPrev, onNext } - masqué si total <= 1
  actions,          // slot d'actions à droite (Télécharger, Supprimer…)
  onClose,
  trailing,         // small : action texte à droite (ex. « Détail › »)
  className = '',
}) {
  const a = accent || KIND_ACCENTS[kind] || KIND_ACCENTS.piece;
  const Icon = icon;
  return (
    <div className={`h-14 pl-4 pr-3 bg-surface border-b border-border flex items-center justify-between gap-3 flex-shrink-0 ${className}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {small
          ? (Icon && <Icon className="w-4 h-4 flex-shrink-0" style={{ color: a.fg }} strokeWidth={1.75} />)
          : <KindIcon kind={kind} icon={Icon} accent={accent} />}
        {eyebrow}
        <span
          className={small ? 'text-[14px] leading-5 font-medium text-foreground-strong truncate min-w-0' : 'text-foreground-strong truncate min-w-0'}
          style={small ? undefined : SERIF_TITLE}
        >
          {title}
        </span>
      </div>
      {small ? (
        trailing
      ) : (
        <div className="flex items-center gap-3.5 flex-shrink-0">
          {nav && nav.total > 1 && (
            <>
              <div className="flex items-center gap-2 text-[14px] text-foreground-secondary">
                <button type="button" onClick={nav.onPrev} className={`px-0.5 rounded font-medium hover:text-foreground transition-colors ${FOCUS_RING}`} aria-label="Document précédent">‹</button>
                <span className="tabular-nums" aria-label={`Document ${nav.index} sur ${nav.total}`}>{nav.index} / {nav.total}</span>
                <button type="button" onClick={nav.onNext} className={`px-0.5 rounded font-medium hover:text-foreground transition-colors ${FOCUS_RING}`} aria-label="Document suivant">›</button>
              </div>
              <span className="w-px h-5 bg-border" aria-hidden />
            </>
          )}
          <div className="flex items-center gap-[7px]">
            {actions}
            {onClose && (
              <button type="button" onClick={onClose} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cream text-foreground-tertiary hover:text-foreground hover:brightness-95 transition-all ${FOCUS_RING}`} aria-label="Fermer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MetaChip (Figma 37375:9183) ─────────────────────────────────────────────
// Chip d'atome de métadonnée - forme UNIQUE de la barre méta du panneau.
//
// Composition : [icon 14] [label muted 12] [value fg medium 12] [· aside] [✦ ai] [action]
// Deux variants : default (fond canvas) · strong (fond cream, chip d'identité).
// Interactif : `action` (lien à droite) OU `onClick` (chip entier bouton).
// TYPES — chaque type de métadonnée a son icône + label + variant canoniques
// (les 14 types du nœud), surchargeables au cas par cas.
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
    'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border text-[12px] leading-4 text-foreground-secondary min-w-0 max-w-full',
    strong ? 'bg-cream' : 'bg-background-canvas',
    clickable
      ? 'transition-colors hover:border-border-strong disabled:hover:border-border disabled:cursor-not-allowed disabled:opacity-60'
      : '',
    className || '',
  ].filter(Boolean).join(' ');

  // Contraste : sur bg-canvas et bg-cream, foreground-muted tombe sous le
  // plancher WCAG - on tient foreground-secondary pour les libellés, la
  // hiérarchie muted-label / strong-value reste.
  const inner = (
    <>
      {Icon && <Icon className="w-3.5 h-3.5 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />}
      {resolvedLabel && <span className="text-foreground-secondary flex-shrink-0 whitespace-nowrap" style={{ letterSpacing: '0.12px' }}>{resolvedLabel}</span>}
      {value != null && (
        <span className="text-foreground font-medium flex-shrink-0 whitespace-nowrap">{value}</span>
      )}
      {aside && (
        <span
          className="font-medium text-foreground-secondary truncate min-w-0"
          title={typeof aside === 'string' ? aside : undefined}
        >
          <span className="font-normal text-foreground-muted mr-1" aria-hidden>·</span>{aside}
        </span>
      )}
      {ai && <Sparkles className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={2} style={{ color: AI_ACCENT }} />}
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

// ── CiteRow (Figma 37375:8851) ──────────────────────────────────────────────
// Une ligne du rail citations : pastille numéro + eyebrow PAGE (mono 11) +
// extrait 2 lignes. États : default (blanc) · hover (accent) · active
// (dégradé cream→blanc + pastille foreground + liseré 2px).
export function CiteRow({ index, page, text, active, onClick, innerRef, ariaLabel }) {
  return (
    <button
      type="button"
      ref={innerRef}
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      aria-label={ariaLabel}
      className={`group relative w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${FOCUS_RING} focus-visible:ring-inset ${active ? 'bg-gradient-to-r from-cream to-white' : 'hover:bg-background-canvas'}`}
    >
      {/* Liseré stone plein à gauche quand actif */}
      {active && <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground" />}
      {/* Numéro en pastille ronde : foreground plein quand actif, cream sinon */}
      <span
        className={`inline-flex items-center justify-center flex-shrink-0 h-5 min-w-[20px] px-1 rounded-full text-[12px] font-medium tabular-nums transition-colors ${
          active ? 'bg-foreground text-primary-foreground' : 'bg-cream text-foreground-tertiary'
        }`}
      >
        {index + 1}
      </span>
      {/* Contenu : eyebrow page (mono) + extrait deux lignes */}
      <span className="min-w-0 flex-1 flex flex-col gap-1">
        {page && (
          <span
            className={`block uppercase tabular-nums ${active ? 'text-foreground' : 'text-foreground-secondary'}`}
            style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500 }}
          >
            page {page}
          </span>
        )}
        <span
          className={`block ${active ? 'text-foreground' : 'text-foreground-secondary'}`}
          style={{
            fontSize: 12,
            lineHeight: '16px',
            letterSpacing: '0.12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {text || <em className="text-foreground-muted">Extrait indisponible</em>}
        </span>
      </span>
    </button>
  );
}

// ── CitesPanel (Figma 37375:9168) ───────────────────────────────────────────
// Le rail « EXTRAITS CITÉS » : header h-48 (label 11 semibold tracking 0.5 +
// compteur en pastille), liste de CiteRow séparées d'un filet subtil.
export function CitesPanel({ items, active, onGo, width, title = 'Extraits cités' }) {
  const activeRef = useRef(null);
  const listRef = useRef(null);
  // Suit le stepper : quand la citation active change, on ramène la ligne dans
  // le rail. Scroll MANUEL du seul conteneur de liste - jamais scrollIntoView,
  // qui ferait défiler tous les ancêtres scrollables (sandbox, drawer…).
  useEffect(() => {
    const row = activeRef.current;
    const list = listRef.current;
    if (!row || !list) return;
    const r = row.getBoundingClientRect();
    const lr = list.getBoundingClientRect();
    if (r.top < lr.top) {
      list.scrollTo({ top: list.scrollTop + (r.top - lr.top), behavior: 'smooth' });
    } else if (r.bottom > lr.bottom) {
      list.scrollTo({ top: list.scrollTop + (r.bottom - lr.bottom), behavior: 'smooth' });
    }
  }, [active]);
  if (!items || items.length === 0) return null;
  return (
    <aside className="flex border-l border-border bg-surface flex-col flex-shrink-0 min-h-0" style={{ width }}>
      <div className="h-12 px-4 border-b border-border-subtle flex-shrink-0 flex items-center justify-between gap-3">
        <span className="uppercase text-[11px] font-semibold text-foreground-secondary" style={{ letterSpacing: '0.5px' }}>
          {title}
        </span>
        <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-[10px] bg-background-subtle text-[11px] font-semibold text-foreground-secondary tabular-nums">
          {items.length}
        </span>
      </div>
      <div ref={listRef} className="overflow-auto flex-1 min-h-0">
        {items.map((it, i) => (
          <div key={i} className={i > 0 ? 'border-t border-border-subtle' : ''}>
            <CiteRow
              index={i}
              page={it.page}
              text={it.text}
              active={i === active}
              onClick={() => onGo(i)}
              innerRef={i === active ? activeRef : undefined}
              ariaLabel={`Citation ${i + 1}${it.page ? `, page ${it.page}` : ''}${it.text ? `. ${it.text.slice(0, 80)}${it.text.length > 80 ? '…' : ''}` : ''}`}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

// ── Previewer (Figma 37375:8874) ────────────────────────────────────────────
// Le corps défilant du panneau : Body fond background, padding 24, contenu
// centré. Les corps par kind (pages doc, fil email, décision, carte lien)
// vivent dans PreviewPanel - le Previewer est le châssis commun.
export function Previewer({ scrollRef, onScroll, padded = true, className = '', children }) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={`flex-1 min-w-0 min-h-0 overflow-auto bg-background-canvas ${className}`}
    >
      <div className={`flex flex-col items-center ${padded ? 'p-6' : ''} gap-6`}>
        {children}
      </div>
    </div>
  );
}

// ── PreviewerPage (Figma 37375:8876) ────────────────────────────────────────
// La feuille du document : fond blanc, bordure noire 10%, ombre sm, CARRÉE
// (une feuille de papier, pas une carte). `aspect` A4 par défaut.
export function PreviewerPage({ pageNo, width, aspect = '1 / 1.414', className = '', style, children }) {
  return (
    <div
      className={`relative bg-white border shadow-sm shrink-0 overflow-hidden ${className}`}
      style={{ width, aspectRatio: aspect, borderColor: 'rgba(0,0,0,0.1)', containerType: 'inline-size', ...style }}
      data-page={pageNo}
    >
      {children}
    </div>
  );
}
