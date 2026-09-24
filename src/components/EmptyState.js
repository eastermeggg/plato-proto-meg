import React from 'react';
import { colors, shadows } from '../design-system/tokens';

/**
 * EmptyState — Plato design system empty state component.
 * Matches Figma node 33462:51078 (Empty).
 *
 * Props:
 * - icon: Lucide icon component (rendered inside the circle)
 * - title: string
 * - description: string
 * - primaryAction: { label, onClick } — dark primary button
 * - secondaryAction: { label, onClick } — outlined secondary button (optional)
 */
export default function EmptyState({ icon: Icon, title, description, primaryAction, secondaryAction }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 24, maxWidth: 300 }}>
      {/* Header: icon + copy */}
      <div className="flex flex-col items-center w-full" style={{ gap: 16, maxWidth: 512 }}>
        {/* Circular icon */}
        {Icon && (
          <div
            className="flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              backgroundColor: colors.semantic.muted,
              border: `1px solid ${colors.semantic.borderStrong}`,
              boxShadow: shadows.xs,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: colors.semantic.mutedForeground }} strokeWidth={1.5} />
          </div>
        )}

        {/* Copy */}
        <div className="flex flex-col items-center text-center w-full" style={{ gap: 4 }}>
          <p style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 18, fontWeight: 500, color: colors.semantic.foreground, letterSpacing: '-0.5px', lineHeight: '24px', margin: 0 }}>
            {title}
          </p>
          {description && (
            <p style={{ fontSize: 14, fontWeight: 400, color: colors.semantic.mutedForeground, lineHeight: '20px', margin: 0 }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col items-center w-full" style={{ gap: 8, maxWidth: 384 }}>
          <div className="flex items-center justify-center gap-2">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="inline-flex items-center justify-center gap-2 font-medium transition-all hover:opacity-90"
                style={{
                  height: 36,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 8,
                  backgroundColor: colors.semantic.primary,
                  color: colors.semantic.primaryForeground,
                  fontSize: 14,
                  lineHeight: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: shadows.xs,
                }}
              >
                {primaryAction.icon && <primaryAction.icon className="w-4 h-4" strokeWidth={1.5} />}
                {primaryAction.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center justify-center gap-2 font-medium transition-all hover:bg-background"
                style={{
                  height: 36,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 8,
                  backgroundColor: colors.semantic.white,
                  color: colors.semantic.mutedForeground,
                  fontSize: 14,
                  lineHeight: '20px',
                  border: `1px solid ${colors.semantic.border}`,
                  cursor: 'pointer',
                  boxShadow: shadows.xs,
                }}
              >
                {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" strokeWidth={1.5} />}
                {secondaryAction.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
