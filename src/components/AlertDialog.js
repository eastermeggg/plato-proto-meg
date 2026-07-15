import React, { useEffect } from 'react';
import { X, CircleAlert } from 'lucide-react';
import { colors } from '../design-system/tokens';

// Icon colors keyed by variant — applied directly to the bare 24px icon (no
// background container per Figma). Single source of truth: colors.icon.
const ICON_COLORS = colors.icon;

// Action button colors. The secondary (cancel) button mirrors the action variant's tone:
//  - destructive action → destructive-subtle cancel
//  - primary action     → secondary (cream) cancel
const ACTION_VARIANTS = {
  primary: {
    actionBg: '#292524', actionBgHover: '#44403c', actionFg: 'white',
    cancelBg: '#eeece6', cancelBgHover: '#e7e5e3', cancelFg: '#44403c',
  },
  destructive: {
    actionBg: '#7f1d1d', actionBgHover: '#641515', actionFg: 'white',
    cancelBg: '#fee2e2', cancelBgHover: '#fecaca', cancelFg: '#7f1d1d',
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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange?.(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
    >
      <div
        className="bg-white border border-border rounded-xl flex flex-col gap-4 p-6 w-full max-w-[512px] relative"
        style={{ boxShadow: '0px 4px 6px 0px rgba(26,26,26,0.05), 0px 10px 15px 0px rgba(26,26,26,0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        <div className="flex gap-4 items-start">
          {!hideIcon && Icon && (
            <Icon className="w-6 h-6 flex-shrink-0" style={{ color: iconColor }} strokeWidth={1.75} />
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-2 pr-6">
            <h2
              id="alert-dialog-title"
              style={{
                fontFamily: "'RL Para Trial Central', Georgia, serif",
                fontSize: 18,
                fontWeight: 500,
                color: '#292524',
                letterSpacing: '-0.5px',
                lineHeight: '20px',
                margin: 0,
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#78716c',
                  lineHeight: '20px',
                  margin: 0,
                }}
              >
                {description}
              </p>
            )}
            {warning && (
              <div
                className="flex items-center pl-2.5"
                style={{ borderLeft: '1.33px solid #eeb97e' }}
              >
                <p
                  className="flex-1"
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: '#855b31',
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

        {/* Footer */}
        <div className="flex gap-2 items-center justify-end">
          <button
            onClick={() => onOpenChange?.(false)}
            className="h-9 px-4 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: v.cancelBg, color: v.cancelFg, fontSize: 14, fontWeight: 500, lineHeight: '20px' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = v.cancelBgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = v.cancelBg; }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onAction}
            disabled={actionDisabled}
            className="h-9 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-border-strong disabled:cursor-not-allowed"
            style={{
              backgroundColor: actionDisabled ? undefined : v.actionBg,
              color: v.actionFg,
              fontSize: 14, fontWeight: 500, lineHeight: '20px',
              boxShadow: actionDisabled ? 'none' : '0px 1px 1px 0px rgba(26,26,26,0.05)',
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
            className="absolute top-[15px] right-[15px] hover:opacity-100 transition-opacity"
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
