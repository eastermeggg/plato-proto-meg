import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { colors } from '../../design-system/tokens';

// Plato Button — LE bouton canonique. Établi depuis le set Figma « Button »
// (Plato---System, page 2814:11933, ~290 variants) : le code est la source,
// traduit du Figma vers les tokens (jamais de transcription pixel). Voir Button.md.
//
// Types Figma → variants : Default→primary · Secondary→secondary · Destructive→
// destructive · Outline→outline · Ghost→ghost · Link→link · Warning Link→
// warning-link · Success Link→success-link · Neutral Link→neutral-link
// Sizes Figma : XS→xs · Small→sm · Default→md · Large→lg · Icon*→icon-xs/-sm/icon/icon-lg
// States Figma : Enabled/Hover/Disabled (props) · Loading (prop `loading`) ·
// Focus (focus-visible ring via feuille injectée) · Active (pressed natif)
const VARIANTS = {
  primary:     { bg: colors.semantic.primary, bgHover: colors.semantic.foregroundTertiary, fg: colors.semantic.white, border: 'transparent' },
  secondary:   { bg: colors.semantic.muted, bgHover: colors.semantic.input, fg: colors.semantic.foregroundTertiary, border: 'transparent' },
  ghost:       { bg: 'transparent', bgHover: colors.banner.neutral.bgFrom, fg: colors.semantic.foregroundTertiary, border: 'transparent' },
  outline:     { bg: colors.semantic.white, bgHover: colors.banner.neutral.bgFrom, fg: colors.semantic.foreground, border: colors.semantic.border },
  destructive: { bg: colors.feedback.destructive.text, bgHover: colors.feedback.destructive.text, fg: colors.semantic.white, border: 'transparent' },
  // Variants subtils (promotion SmallBtn import V2, steward 24/09/2026) :
  // fond feedback.subtle + texte feedback.text — actions douces dans les rangées
  // (« Retirer » destructif, « Sera découpé » ai).
  'destructive-subtle': { bg: colors.feedback.destructive.subtle, bgHover: colors.feedback.destructive.subtle, fg: colors.feedback.destructive.text, border: 'transparent' },
  'ai-subtle':          { bg: colors.feedback.ai.subtle, bgHover: colors.feedback.ai.subtle, fg: colors.feedback.ai.text, border: 'transparent' },
  // Famille Link (Figma) : bouton-texte, transparent, souligné au survol.
  link:           { bg: 'transparent', bgHover: 'transparent', fg: colors.feedback.info.text, border: 'transparent', linkStyle: true },
  'warning-link': { bg: 'transparent', bgHover: 'transparent', fg: colors.feedback.warning.text, border: 'transparent', linkStyle: true },
  'success-link': { bg: 'transparent', bgHover: 'transparent', fg: colors.feedback.success.text, border: 'transparent', linkStyle: true },
  'neutral-link': { bg: 'transparent', bgHover: 'transparent', fg: colors.semantic.mutedForeground, border: 'transparent', linkStyle: true },
};
const SIZES = {
  xs: { padX: 8,  padY: 3,  font: 12, line: 16, radius: 6, iconSize: 12 },
  sm: { padX: 10, padY: 5,  font: 12, line: 16, radius: 6, iconSize: 14 },
  md: { padX: 14, padY: 7,  font: 14, line: 20, radius: 8, iconSize: 16 },
  lg: { padX: 18, padY: 10, font: 14, line: 20, radius: 8, iconSize: 18 },
  // Icon-only (Figma Icon XS/Small/Default/Large) : carrés alignés sur les hauteurs texte.
  'icon-xs': { square: 22, radius: 6, iconSize: 12 },
  'icon-sm': { square: 26, radius: 6, iconSize: 14 },
  icon:      { square: 34, radius: 8, iconSize: 16 },
  'icon-lg': { square: 40, radius: 8, iconSize: 18 },
};

// Focus ring (état Focus du set Figma) : :focus-visible n'existe pas en style
// inline — petite feuille injectée une fois, sur le token ring.
let focusCss = false;
function ensureFocusCss() {
  if (focusCss || typeof document === 'undefined') return;
  focusCss = true;
  const s = document.createElement('style');
  s.id = 'ds-btn-focus';
  s.textContent = `.ds-btn:focus-visible{outline:2px solid ${colors.semantic.ring};outline-offset:2px}`;
  document.head.appendChild(s);
}

export default function Button({
  variant = 'primary', size = 'md', icon: Icon, iconPosition = 'leading',
  label, children, disabled, loading = false, onClick, fullWidth, type = 'button', title,
  // Échappatoires (mêmes props que Badge) : ajustements de géométrie ponctuels
  // depuis un contexte précis (ex. CTA nav h32/px12 aligné à gauche) - jamais
  // pour changer les couleurs, qui restent aux variants.
  className = '', style,
}) {
  ensureFocusCss();
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const [hovered, setHovered] = useState(false);
  const iconOnly = !!s.square;
  const inactive = disabled || loading;
  const iconEl = loading
    ? <Loader2 className="animate-spin" style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={1.75} />
    : Icon ? <Icon style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={1.75} /> : null;
  return (
    <button
      type={type}
      className={`ds-btn ${className}`}
      onClick={inactive ? undefined : onClick}
      disabled={disabled}
      aria-busy={loading || undefined}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: iconOnly ? 0 : 6,
        padding: iconOnly ? 0 : `${s.padY}px ${s.padX}px`,
        width: iconOnly ? s.square : (fullWidth ? '100%' : 'auto'),
        height: iconOnly ? s.square : 'auto',
        fontSize: s.font, lineHeight: s.line ? `${s.line}px` : undefined, fontWeight: 500,
        color: v.fg,
        background: hovered && !inactive ? v.bgHover : v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: s.radius,
        cursor: inactive ? (loading ? 'progress' : 'not-allowed') : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textDecoration: v.linkStyle && hovered && !inactive ? 'underline' : 'none',
        textUnderlineOffset: 3,
        transition: 'background 150ms ease',
        whiteSpace: 'nowrap',
        flexShrink: iconOnly ? 0 : undefined,
        ...style,
      }}
    >
      {iconEl && iconPosition === 'leading' && iconEl}
      {!iconOnly && (label || children)}
      {iconEl && iconPosition === 'trailing' && !iconOnly && iconEl}
    </button>
  );
}
