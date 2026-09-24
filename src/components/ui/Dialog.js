import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';

/**
 * Dialog — Plato design system. Source of truth: Figma « Dialog »
 * (Plato---System 6831:11140, composant 2759:16962). Modale de CONTENU
 * (formulaire, liste, texte) — pour une confirmation / action destructive,
 * c'est AlertDialog ; pour un panneau latéral, le Drawer ([a-dessiner]).
 *
 * Anatomie (Figma) :
 *  - scrim : token `overlay` (jamais un bg-black/NN ad hoc)
 *  - panneau : surface `surfaceRaised` (= card en light ; en dark l'élévation
 *    se lit par la surface, doctrine B), bordure `border`, radius 12,
 *    élévation `shadows['4xl']` (décision steward 24/09)
 *  - header : px-24 pt-24, titre serif display-sm (20/28, -0.6) + description
 *    body muted, slot `headerAction` à droite, croix 16px (opacité 70 %)
 *  - body : px-24 py-32, défilant (max-h 85vh sur l'ensemble)
 *  - footer : px-24 pb-24, actions alignées à droite (passer des `Button` DS)
 */

export default function Dialog({
  open,
  onOpenChange,
  title,
  description,
  headerAction = null,
  footer = null,
  children,
  width = 480,
  showClose = true,
  className,
  style,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange?.(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      <div
        className={`bg-surface-raised flex flex-col relative overflow-hidden ${className || ''}`}
        style={{
          width,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '85vh',
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: radius.xl,
          boxShadow: shadows['4xl'],
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — titre serif + description, slot action, croix */}
        {(title || description || headerAction) && (
          <div className="flex gap-3 items-start px-6 pt-6 flex-shrink-0">
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 2 }}>
              {title && (
                <h2
                  id="dialog-title"
                  style={{
                    fontFamily: typography.fontFamily.serif,
                    fontSize: 20,
                    lineHeight: '28px',
                    letterSpacing: '-0.6px',
                    fontWeight: 500,
                    color: colors.semantic.cardForeground,
                    margin: 0,
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  style={{
                    fontFamily: typography.fontFamily.sans,
                    fontSize: 14,
                    lineHeight: '20px',
                    fontWeight: 400,
                    color: colors.semantic.mutedForeground,
                    margin: 0,
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0" style={{ paddingRight: showClose ? 24 : 0 }}>{headerAction}</div>
            )}
          </div>
        )}

        {/* Body — défilant */}
        <div className="px-6 py-8 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer — actions à droite (Button DS) */}
        {footer && (
          <div className="flex gap-2 items-center justify-end px-6 pb-6 flex-shrink-0">
            {footer}
          </div>
        )}

        {/* Croix — 16px, opacité 70 % (Figma .Dialog Close) */}
        {showClose && (
          <button
            onClick={() => onOpenChange?.(false)}
            className="absolute hover:opacity-100 transition-opacity"
            style={{ top: 15, right: 15, opacity: 0.7, lineHeight: 0 }}
            aria-label="Fermer"
          >
            <X style={{ width: 16, height: 16, color: colors.semantic.foreground }} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
