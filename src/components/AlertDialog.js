import React, { useEffect } from 'react';
import { X, CircleAlert } from 'lucide-react';
import { colors, typeStyle, shadows } from '../design-system/tokens';

// Icon colors keyed by variant — applied directly to the bare 24px icon (no background container per Figma).
const ICON_COLORS = {
  default:     colors.semantic.foregroundTertiary,
  destructive: colors.feedback.destructive.text, // colors/light/destructive-text
  warning:     colors.feedback.warning.text, // colors/light/warning-text
  success:     colors.icon.success,
  info:        colors.feedback.info.text,
};

// Action button colors. By default the secondary (cancel) button mirrors the
// action variant's tone (destructive action → destructive-subtle cancel,
// primary action → secondary cream cancel) ; `cancelVariant` force le siège
// (Figma 3402:3576 : geste destructeur en subtil + « Rester » primaire).
const ACTION_VARIANTS = {
  primary: {
    // Figma 1:78 : bouton primaire = token primary (l'ancien `ring` rendait la
    // même valeur mais détournait un token de focus — realigné 24/09).
    actionBg: colors.semantic.primary, actionBgHover: colors.semantic.foregroundTertiary, actionFg: colors.semantic.primaryForeground,
  },
  destructive: {
    actionBg: colors.feedback.destructive.text, actionBgHover: colors.feedback.destructive.text, actionFg: 'white',
  },
};
const CANCEL_VARIANTS = {
  // neutre : secondary cream (Figma primary pairing).
  neutral: {
    cancelBg: colors.semantic.muted, cancelBgHover: colors.semantic.input, cancelFg: colors.semantic.foregroundTertiary,
  },
  // destructive-subtle (Figma colors/light/destructive-subtle + destructive-text).
  destructive: {
    cancelBg: colors.feedback.destructive.subtle, cancelBgHover: colors.feedback.destructive.border, cancelFg: colors.feedback.destructive.text,
  },
};

/**
 * AlertDialog — Plato design system confirmation dialog.
 * Figma node: 0eKtlRkT1Hbjh8Nqd47Woy / 1:78 — "Breakpoint=Medium and up"
 *
 * Variant-controlled secondary button: destructive actions get a destructive-subtle
 * cancel; primary actions get a neutral cream cancel.
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - icon: Lucide icon component — defaults to CircleAlert (Figma default)
 * - iconVariant: 'default' | 'destructive' | 'warning' | 'success' | 'info'
 * - title: string (required)
 * - description: string
 * - warning: string — renders an amber left-bordered warning block under the description
 * - children: ReactNode — extra body content rendered after the description block
 * - cancelLabel: string (default: 'Annuler')
 * - cancelVariant: 'neutral' | 'destructive' — force le style du bouton secondaire
 *   (défaut : suit actionVariant, comme avant)
 * - onCancel: () => void — action du bouton secondaire (défaut : fermer)
 * - actionLabel: string (required)
 * - actionVariant: 'primary' | 'destructive' (default: 'primary')
 * - actionDisabled: boolean (default: false)
 * - onAction: () => void
 * - showClose: boolean — top-right X (default: true, per Figma)
 * - hideIcon: boolean — hide the leading icon (default: false)
 */
export default function AlertDialog({
  open,
  onOpenChange,
  icon: Icon = CircleAlert,
  iconVariant = 'default',
  title,
  description,
  warning,
  children,
  cancelLabel = 'Annuler',
  cancelVariant,
  onCancel,
  actionLabel,
  actionVariant = 'primary',
  actionDisabled = false,
  onAction,
  showClose = true,
  hideIcon = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const iconColor = ICON_COLORS[iconVariant] || ICON_COLORS.default;
  const v = ACTION_VARIANTS[actionVariant] || ACTION_VARIANTS.primary;
  const cv = CANCEL_VARIANTS[cancelVariant] || CANCEL_VARIANTS[actionVariant === 'destructive' ? 'destructive' : 'neutral'];

  return (
    <div
      className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange?.(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
    >
      {/* Figma 1:78 (Medium and up) / 2759:16913 (Small, empilé centré) :
          carte p-24 gap-16, radius 12, élévation token shadows.lg, sans bord.
          Scrim = token overlay (validé steward 24/09). */}
      <div
        className="bg-surface-raised rounded-xl flex flex-col gap-4 p-6 w-full max-w-[512px] relative"
        style={{ boxShadow: shadows.lg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row — Small : colonne centrée ; sm+ : rangée (Figma) */}
        <div className="flex flex-col items-center text-center gap-2 sm:flex-row sm:items-start sm:text-left sm:gap-4">
          {!hideIcon && Icon && (
            <Icon className="w-6 h-6 flex-shrink-0" style={{ color: iconColor }} strokeWidth={1.75} />
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-2 sm:pr-6">
            {/* Titre = display-xs (Figma : serif medium 16/20, -0.5). */}
            <h2
              id="alert-dialog-title"
              style={{ ...typeStyle('display-xs'), color: colors.semantic.foreground, margin: 0 }}
            >
              {title}
            </h2>
            {description && (
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: colors.semantic.mutedForeground,
                  lineHeight: '20px',
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {description}
              </p>
            )}
            {warning && (
              <div
                className="flex items-center pl-2.5"
                style={{ borderLeft: `1.33px solid ${colors.feedback.warning.border}` }}
              >
                <p
                  className="flex-1"
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: colors.feedback.warning.text,
                    lineHeight: '20px',
                    margin: 0,
                  }}
                >
                  {warning}
                </p>
              </div>
            )}
            {children}
          </div>
        </div>

        {/* Footer — Small : boutons empilés pleine largeur ; sm+ : rangée à droite */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={onCancel || (() => onOpenChange?.(false))}
            className="h-9 px-4 rounded-lg flex items-center justify-center transition-colors w-full sm:w-auto"
            style={{ backgroundColor: cv.cancelBg, color: cv.cancelFg, fontSize: 14, fontWeight: 500, lineHeight: '20px' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = cv.cancelBgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = cv.cancelBg; }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onAction}
            disabled={actionDisabled}
            className="h-9 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-border-strong disabled:cursor-not-allowed w-full sm:w-auto"
            style={{
              backgroundColor: actionDisabled ? undefined : v.actionBg,
              color: v.actionFg,
              fontSize: 14, fontWeight: 500, lineHeight: '20px',
              boxShadow: actionDisabled ? 'none' : shadows['2xs'],
            }}
            onMouseEnter={(e) => { if (!actionDisabled) e.currentTarget.style.backgroundColor = v.actionBgHover; }}
            onMouseLeave={(e) => { if (!actionDisabled) e.currentTarget.style.backgroundColor = v.actionBg; }}
          >
            {actionLabel}
          </button>
        </div>

        {/* Top-right close */}
        {showClose && (
          <button
            onClick={() => onOpenChange?.(false)}
            className="absolute top-4 right-4 hover:opacity-100 transition-opacity"
            style={{ opacity: 0.7 }}
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-foreground" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
