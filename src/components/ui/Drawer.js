import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';

/**
 * Drawer — Plato design system. Source of truth: Figma « Panel »
 * (Plato---System 37749:1024 - SidePanel 37734:55506/55546, Section Header
 * 37740:1059…, Panel Section Content 37732:13180…).
 *
 * Master component for side drawers (right or left). Two sizes: sm (408) and
 * wide (860). The overlay NEVER hides the chat: scrim and panel stop at
 * `var(--chat-offset)` so the user can keep talking to the assistant about
 * what the drawer shows (doctrine du panneau, App.js:2189).
 *
 * Anatomy (Figma):
 *  - header: border-b `border`, pl-20 pr-14 py-14 - optional 16px icon or
 *    24px avatar + serif display-xs title (16/20, -0.5) + close button
 *    (26px square, `secondary` fill, radius 4, X 14)
 *  - content: flex-1, scrollable (slot)
 *  - footer (optional): border-t `border`, p-20, justify-between slot
 *    (Figma: destructive-subtle secondary on the left, primary on the right)
 *  - elevation: L3 role (§10) -> `shadows['2xl']` + border on the chat side
 *
 * `DrawerSection` is the section sub-component: mono 11 uppercase header
 * (4 types: icon+subtitle / icon / action / simple) + free content. The 8
 * Figma content variants (Time Slots, Licence, Role, Detail, Notes, Expense,
 * Form) are COMPOSITIONS of existing primitives - see the fiche.
 */

const SIZES = { sm: 408, wide: 860 };

export default function Drawer({
  open,
  onOpenChange,
  side = 'right',
  size = 'sm',
  title,
  icon: Icon,
  avatar,
  footer = null,
  children,
  showClose = true,
  respectChatOffset = true,
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

  const width = typeof size === 'number' ? size : SIZES[size] || SIZES.sm;
  const offset = respectChatOffset && side === 'right' ? 'var(--chat-offset, 0px)' : '0px';

  return (
    <div
      className="fixed top-0 left-0 bottom-0 z-50"
      style={{ right: offset }}
      onClick={() => onOpenChange?.(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
    >
      {/* Scrim — stops at the chat edge (token overlay) */}
      <div className="absolute inset-0 bg-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }} />

      <div
        className={`absolute top-0 bottom-0 bg-surface flex flex-col ${className || ''}`}
        style={{
          [side === 'left' ? 'left' : 'right']: 0,
          width,
          maxWidth: `calc(100vw - ${offset})`,
          [side === 'left' ? 'borderRight' : 'borderLeft']: `1px solid ${colors.semantic.border}`,
          boxShadow: shadows['2xl'],
          animation: side === 'right' ? 'slideInRight 0.2s ease-out' : undefined,
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: '14px 14px 14px 20px', borderBottom: `1px solid ${colors.semantic.border}` }}
        >
          <div className="flex items-center flex-1 min-w-0" style={{ gap: 16 }}>
            {Icon && <Icon style={{ width: 16, height: 16, flexShrink: 0, color: colors.semantic.foreground }} strokeWidth={1.75} />}
            {avatar && <span className="flex-shrink-0 inline-flex">{avatar}</span>}
            <h2
              id="drawer-title"
              className="flex-1 min-w-0 truncate"
              style={{
                fontFamily: typography.fontFamily.serif,
                fontSize: 16,
                lineHeight: '20px',
                letterSpacing: '-0.5px',
                fontWeight: 500,
                color: colors.semantic.foreground,
                margin: 0,
              }}
            >
              {title}
            </h2>
          </div>
          {showClose && (
            <button
              onClick={() => onOpenChange?.(false)}
              aria-label="Fermer"
              className="flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
              style={{ width: 26, height: 26, background: colors.semantic.secondary, borderRadius: radius.sm, border: 'none' }}
            >
              <X style={{ width: 14, height: 14, color: colors.semantic.foreground }} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Content — scrollable slot */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>

        {/* Footer — slot (Figma: secondary left / primary right) */}
        {footer && (
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{ padding: 20, borderTop: `1px solid ${colors.semantic.border}` }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Section header — 4 Figma types: icon+subtitle / icon / action / simple.
export function DrawerSection({
  title,
  icon: Icon,
  subtitle,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  bordered = false,
  children,
  className,
  style,
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '16px 20px',
        borderBottom: bordered ? `1px solid ${colors.semantic.border}` : 'none',
        ...style,
      }}
    >
      {title && (
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 10 }}>
            {Icon && <Icon style={{ width: 16, height: 16, flexShrink: 0, color: colors.semantic.mutedForeground }} strokeWidth={1.75} />}
            <span
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                color: colors.semantic.mutedForeground,
              }}
            >
              {title}
            </span>
          </div>
          {subtitle && (
            <span
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                color: colors.semantic.foreground,
              }}
            >
              {subtitle}
            </span>
          )}
          {actionLabel && (
            <button
              onClick={onAction}
              className="flex items-center transition-opacity hover:opacity-80"
              style={{ gap: 8, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              {ActionIcon && <ActionIcon style={{ width: 12, height: 12, color: colors.feedback.info.text }} strokeWidth={1.75} />}
              <span
                style={{
                  fontFamily: typography.fontFamily.sans,
                  fontSize: 12,
                  lineHeight: '16px',
                  fontWeight: 500,
                  color: colors.feedback.info.text,
                }}
              >
                {actionLabel}
              </span>
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
