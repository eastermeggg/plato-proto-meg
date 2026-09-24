import React from 'react';
import { CircleArrowUp } from 'lucide-react';
import { colors, radius, typography } from '../../design-system/tokens';

/**
 * ParamPill — Plato design system. Source de vérité : Figma Plato---Design
 * 1095:15027 (« Reference Text », section LOCAL COMPONENTS > PARAMS
 * 1613:113399). Pilule de paramètre de calcul : rangées PGP (Revalo / Barème /
 * Capit / Base journalière) et strip de params du chat.
 *
 *  - OFF (défaut) : libellé medium muted, bord `borderStrong`, fond transparent.
 *  - ON : fond `feedback.info.bg`, bord `.border`, libellé medium + valeur
 *    regular en `.text` — le paramètre est actif, sa valeur s'affiche.
 *  - Clicked (Figma) : halo 3px `background` — rendu sur :active /
 *    :focus-visible (feuille injectée, même pattern que Button).
 *  - Diff (Figma 1337:2 / 1337:8, losange orange) : NON COUVERT — la famille
 *    de teintes diff (#fcf4ef / #d4845a / #a6592e) n'a pas de tokens
 *    (SIGNALEMENTS §19). À câbler quand la famille sera promue.
 */

let haloCss = false;
function ensureHaloCss() {
  if (haloCss || typeof document === 'undefined') return;
  haloCss = true;
  const s = document.createElement('style');
  s.id = 'ds-parampill-halo';
  s.textContent = [
    `.ds-parampill:active,.ds-parampill:focus-visible{box-shadow:0 0 0 3px ${colors.semantic.background};outline:none}`,
    `.ds-parampill-off:active,.ds-parampill-off:focus-visible{background-color:${colors.semantic.background}}`,
  ].join('\n');
  document.head.appendChild(s);
}

export default function ParamPill({
  label,
  value, // affichée seulement quand `on` (variant ON du set Figma)
  on = false,
  icon: Icon = CircleArrowUp, // l'icône de la maquette (lucide circle-arrow-up)
  onClick,
  title,
  disabled,
  // Échappatoires (mêmes props que Badge) : géométrie ponctuelle, jamais les couleurs
  className = '',
  style,
}) {
  ensureHaloCss();
  const c = on
    ? { bg: colors.feedback.info.bg, border: colors.feedback.info.border, fg: colors.feedback.info.text }
    : { bg: 'transparent', border: colors.semantic.borderStrong, fg: colors.semantic.mutedForeground };
  const t = typography.scale['body-medium']; // 14/20 medium (label)
  return (
    <button
      type="button"
      className={`ds-parampill ${on ? '' : 'ds-parampill-off'} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      aria-pressed={on}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: radius.full,
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.fg,
        fontFamily: typography.fontFamily.sans,
        fontSize: t.size,
        lineHeight: `${t.lineHeight}px`,
        fontWeight: t.weight,
        cursor: onClick && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'background-color 150ms ease, box-shadow 150ms ease',
        ...style,
      }}
    >
      {Icon && <Icon style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={1.75} />}
      <span>{label}</span>
      {on && value != null && (
        <span style={{ fontWeight: typography.scale.body.weight }}>{value}</span>
      )}
    </button>
  );
}
