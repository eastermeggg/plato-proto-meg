import React, { useRef, useState } from 'react';
import { CircleArrowDown, Upload } from 'lucide-react';
import Badge from './Badge';
import Progress from './Progress';
import Spinner from './Spinner';
import { colors } from '../../design-system/tokens';

// Plato DropZone — source of truth: Figma « Drop Doc » (Plato---System,
// node 35747:41445). Set contexte × état :
//   context  'panel' (rangée 64px, centrée) · 'inline' (rangée 36px, alignée
//            gauche) · 'empty' (empty-state riche des tables : titre,
//            description, badges de suggestions, séparateur OU + action)
//   state    'default' · 'hover' · 'drop' · 'extraction' (empty seulement) —
//            dérivé automatiquement (survol interne, drag natif) ; le prop ne
//            sert qu'à forcer un état (labs, screenshots).
// Le contexte Figma « start » (écran d'import drop-first complet) est une
// COMPOSITION d'écran, pas ce composant. Voir DropZone.md.
//
// Compat : `variant` container/inline (ancienne API) est accepté et mappé
// (container → empty, inline → inline) ; `label` (libellé d'un seul tenant)
// remplace le libellé structuré « Déposez ou {action}{suffixe} ».

const CONTEXT_ALIASES = {
  'inline-tables': 'inline',
  'tables-empty': 'empty',
};

export default function DropZone({
  context,
  state,
  isDragging,
  onClick,
  onFiles,
  // Libellé structuré (Figma) : « Déposez ou {action}{suffixe} », le mot
  // d'action en médium bleu info (souligné en context empty).
  labelPrefix = 'Déposez ou ',
  labelAction,
  labelSuffix,
  label,
  sublabel,
  dropLabel = 'Déposez vos fichiers ici',
  // context 'empty'
  description,
  suggestions,
  action,
  // state 'extraction' (context 'empty')
  extractionTitle = 'Extraction en cours',
  extractionDescription,
  progress = 0,
  progressLabel,
  // Legacy API (Panier, ReleveHeuresLab) : container → empty, inline → inline.
  variant,
  className = '',
  style,
}) {
  const ctx =
    CONTEXT_ALIASES[context] ||
    context ||
    (variant === 'container' ? 'empty' : variant === 'inline' ? 'inline' : 'panel');
  const isEmptyCtx = ctx === 'empty';
  const isInline = ctx === 'inline';

  const rootRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [dragged, setDragged] = useState(false);

  const eff =
    state ||
    (isDragging || dragged ? 'drop' : hovered ? 'hover' : 'default');
  const isDrop = eff === 'drop';
  const isExtraction = eff === 'extraction';

  // Défauts du libellé structuré par contexte (copy Figma).
  const actionWord = labelAction || (isEmptyCtx ? 'parcourez' : 'cliquez');
  const suffix =
    labelSuffix || (isEmptyCtx ? ' pour ajouter les justificatifs' : ' pour ajouter un justificatif');
  const desc = description || sublabel;

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isExtraction) setDragged(true);
  };
  const handleDragLeave = (e) => {
    if (!rootRef.current || !rootRef.current.contains(e.relatedTarget)) setDragged(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragged(false);
    const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []);
    if (files.length > 0 && onFiles) onFiles(files);
  };

  // Bordure : pointillée border-strong au repos, border-hover au survol/drop ;
  // pleine bleu translucide (50%) pendant l'extraction.
  const border = isExtraction
    ? `1px solid color-mix(in srgb, ${colors.dropzone.extractionBorder} 50%, transparent)`
    : `1px dashed ${eff === 'default' ? colors.semantic.borderStrong : colors.semantic.borderHover}`;

  // Dégradé du conteneur interne (panel / empty) : transparent → accent au
  // repos, → muted au survol/drop, bleu pâle (60%) pendant l'extraction.
  const containerGradient = isExtraction
    ? `linear-gradient(to top, transparent 40%, color-mix(in srgb, ${colors.dropzone.extractionTint} 60%, transparent) 100%)`
    : `linear-gradient(to top, rgba(238,236,230,0) 50%, ${eff === 'default' ? colors.semantic.accent : colors.semantic.muted} 100%)`;

  // Libellé par défaut (default/hover) : structuré, ou `label` d'un seul tenant.
  const bodyText = (color) =>
    label ? (
      <span style={{ fontSize: 14, lineHeight: '20px', color }}>{label}</span>
    ) : (
      <span style={{ fontSize: 14, lineHeight: '20px', color, whiteSpace: isInline ? 'nowrap' : undefined }}>
        {labelPrefix}
        <span
          style={{
            fontWeight: 500,
            color: colors.feedback.info.text,
            textDecoration: isEmptyCtx ? 'underline' : 'none',
          }}
        >
          {actionWord}
        </span>
        {suffix}
      </span>
    );

  const interactiveProps = {
    ref: rootRef,
    onClick: isExtraction ? undefined : onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    role: onClick && !isExtraction ? 'button' : undefined,
    style: {
      border,
      borderRadius: 8,
      cursor: onClick && !isExtraction ? 'pointer' : 'default',
      ...style,
    },
  };

  // ── inline — rangée 36px alignée à gauche, sans conteneur dégradé ──
  if (isInline) {
    const InlineIcon = isDrop ? CircleArrowDown : Upload;
    return (
      <div
        {...interactiveProps}
        className={`flex items-center gap-2 h-9 px-2.5 py-1.5 ${className}`}
        style={{
          ...interactiveProps.style,
          backgroundColor: eff === 'default' ? 'transparent' : colors.semantic.accent,
        }}
      >
        <InlineIcon
          className="w-4 h-4 flex-shrink-0"
          strokeWidth={1.75}
          style={{ color: isDrop ? colors.semantic.foreground : colors.semantic.mutedForeground }}
        />
        {isDrop ? (
          <span style={{ fontSize: 14, lineHeight: '20px', color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
            {dropLabel}
          </span>
        ) : (
          bodyText(colors.semantic.mutedForeground)
        )}
      </div>
    );
  }

  // ── panel / empty — cadre pointillé p-1.5 + conteneur dégradé interne ──
  let content;
  if (isExtraction) {
    content = (
      <>
        <Spinner size="md" color={colors.feedback.info.text} label="Extraction en cours" />
        <div className="flex flex-col gap-1 items-center text-center w-full" style={{ maxWidth: 512 }}>
          <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 500, color: colors.semantic.secondaryForeground }}>
            {extractionTitle}
          </span>
          {extractionDescription && (
            <span style={{ fontSize: 14, lineHeight: '20px', color: colors.semantic.mutedForeground }}>
              {extractionDescription}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 15 }}>
          <Progress value={progress} width={82} label={progressLabel || extractionTitle} />
          {progressLabel && (
            <span style={{ fontSize: 12, lineHeight: '16px', letterSpacing: 0.12, color: colors.semantic.mutedForeground }}>
              {progressLabel}
            </span>
          )}
        </div>
      </>
    );
  } else if (isDrop) {
    content = (
      <>
        <CircleArrowDown className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.semantic.foreground }} />
        <span style={{ fontSize: 14, lineHeight: '20px', color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
          {dropLabel}
        </span>
      </>
    );
  } else if (isEmptyCtx) {
    content = (
      <>
        <Upload className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.semantic.secondaryForeground }} />
        <div className="flex flex-col gap-1 items-center text-center w-full" style={{ maxWidth: 512 }}>
          <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 500, color: colors.semantic.secondaryForeground }}>
            {bodyText(colors.semantic.secondaryForeground)}
          </span>
          {desc && (
            <span style={{ fontSize: 14, lineHeight: '20px', color: colors.semantic.mutedForeground }}>{desc}</span>
          )}
        </div>
        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-3 items-start justify-center w-full">
            {suggestions.map((s) => (
              <Badge key={s} variant="secondary" size="md" label={s} />
            ))}
          </div>
        )}
        {action && (
          <div className="flex flex-col gap-3 items-center">
            <div className="flex gap-3 items-center justify-center">
              <span style={{ width: 80, height: 1, backgroundColor: colors.semantic.borderStrong }} />
              <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: colors.semantic.mutedForeground }}>
                OU
              </span>
              <span style={{ width: 80, height: 1, backgroundColor: colors.semantic.borderStrong }} />
            </div>
            <button
              type="button"
              className="flex gap-2 items-center justify-center hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick && action.onClick();
              }}
            >
              {action.icon && (
                <action.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.feedback.info.text }} />
              )}
              <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 500, color: colors.feedback.info.text }}>
                {action.label}
              </span>
            </button>
          </div>
        )}
      </>
    );
  } else {
    // panel default / hover
    content = (
      <>
        <Upload className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.semantic.mutedForeground }} />
        {bodyText(colors.semantic.mutedForeground)}
      </>
    );
  }

  const emptyLayout = isEmptyCtx && (isExtraction || !isDrop);
  return (
    <div {...interactiveProps} className={`flex items-center justify-center w-full ${className}`} style={{ ...interactiveProps.style, padding: 6 }}>
      <div
        className={`flex flex-1 items-center justify-center min-w-0 self-stretch ${emptyLayout ? 'flex-col' : ''}`}
        style={{
          borderRadius: 8,
          background: containerGradient,
          gap: emptyLayout ? 16 : eff === 'default' ? 16 : 10,
          padding: emptyLayout ? '24px 16px' : 16,
          // L'empty-state garde de la hauteur pendant le drag (Figma : 180px).
          minHeight: isEmptyCtx && isDrop ? 168 : undefined,
        }}
      >
        {content}
      </div>
    </div>
  );
}
