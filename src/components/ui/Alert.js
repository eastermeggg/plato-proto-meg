import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { colors, radius, typography } from '../../design-system/tokens';

/**
 * Alert — Plato design system. Source of truth: Figma node 2813:9373
 * (set "Alert" 152:2375 : Type=Default / Destructive / Info / Warning).
 *
 * Bandeau inline non bloquant : icône 16 + titre + description, 4 variants
 * sémantiques. Padding 16, gap 12, radius 8, largeur fluide.
 *
 * Couleurs relevées du Figma (icône = stroke réel des SVG du set) :
 *   default     fond card,           bord border,          icône foreground,
 *               titre foreground, description mutedForeground
 *   destructive fond card,           bord border,          tout destructive.base
 *   info        fond info.bg,        bord info.border,     icône info.text,
 *               titre foreground, description mutedForeground
 *   warning     fond warning.subtle, bord warning.border,  icône warning.base,
 *               titre + description warning.text
 *
 * Action optionnelle (variant Figma Button=True) : lien-bouton 12px
 * caption-medium, coloré par variant (info.text / destructive.text /
 * warning.text).
 *
 * Écart token (noté dans Alert.md) : le fond Info Figma est
 * rgba(223,232,245,0.4) ≈ #f2f6fb ; mappé sur colors.feedback.info.bg
 * (#eef3fa), le token le plus proche.
 */

const VARIANTS = {
  default: {
    bg: colors.semantic.card,
    border: colors.semantic.border,
    icon: colors.semantic.foreground,
    title: colors.semantic.foreground,
    description: colors.semantic.mutedForeground,
    action: colors.feedback.info.text,
  },
  destructive: {
    bg: colors.semantic.card,
    border: colors.semantic.border,
    icon: colors.feedback.destructive.base,
    title: colors.feedback.destructive.base,
    description: colors.feedback.destructive.base,
    action: colors.feedback.destructive.text,
  },
  info: {
    bg: colors.feedback.info.bg,
    border: colors.feedback.info.border,
    icon: colors.feedback.info.text,
    title: colors.semantic.foreground,
    description: colors.semantic.mutedForeground,
    action: colors.feedback.info.text,
  },
  warning: {
    bg: colors.feedback.warning.subtle,
    border: colors.feedback.warning.border,
    icon: colors.feedback.warning.base,
    title: colors.feedback.warning.text,
    description: colors.feedback.warning.text,
    action: colors.feedback.warning.text,
  },
};

const TITLE_TEXT = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale['body-medium'].size,               // 14
  lineHeight: `${typography.scale['body-medium'].lineHeight}px`, // 20
  fontWeight: typography.scale['body-medium'].weight,           // 500
};

const BODY_TEXT = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,               // 14
  lineHeight: `${typography.scale.body.lineHeight}px`, // 20
  fontWeight: typography.scale.body.weight,           // 400
};

const ACTION_TEXT = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale['caption-medium'].size,               // 12
  lineHeight: `${typography.scale['caption-medium'].lineHeight}px`, // 16
  fontWeight: typography.scale['caption-medium'].weight,           // 500
};

export default function Alert({
  variant = 'default',    // 'default' | 'destructive' | 'info' | 'warning'
  title,
  description,
  icon: Icon = AlertTriangle,
  hideIcon = false,
  // Action inline optionnelle (Figma Button=True) : lien-bouton sous le texte.
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  // Contenu libre additionnel sous la description
  children,
  className,
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <div
      role="alert"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: radius.lg,
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {!hideIcon && Icon && (
        <div style={{ paddingTop: 2, flexShrink: 0, display: 'flex' }}>
          <Icon style={{ width: 16, height: 16, color: v.icon }} strokeWidth={1.75} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
        {title != null && (
          <div style={{ ...TITLE_TEXT, color: v.title, width: '100%' }}>{title}</div>
        )}
        {description != null && (
          <div style={{ ...BODY_TEXT, color: v.description, width: '100%' }}>{description}</div>
        )}
        {children}
        {actionLabel != null && (
          <button
            type="button"
            onClick={onAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: 0,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: v.action,
              ...ACTION_TEXT,
            }}
          >
            {ActionIcon && <ActionIcon style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={1.75} />}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
