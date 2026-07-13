import React from 'react';

/**
 * SuggestionsMenu — Plato design system.
 * Source of truth: Figma node 2057:17743 ("SelectMenu") in the
 * "Plato — Design" file.
 *
 * Compact popover-style menu that lists discrete prompt suggestions.
 * Used in:
 * - Chat sidebar empty state — first 3-5 actions to break the cold start
 * - Lightbulb dropdown — phrase-help suggestions inside the chat input
 *
 * Header bar (mono uppercase) + body of plain rows (icon + label).
 * No card frame around individual items.
 *
 * Props:
 * - header     string                                         Menu header. Default: "Suggestions d'actions".
 * - items      Array<{ icon, label, onClick, disabled }>      Menu items. `icon` is a Lucide component.
 * - disabled   boolean                                        Disables every row.
 * - className  string                                         Additional classes for the outer popover.
 */
export default function SuggestionsMenu({
  header = "Suggestions d'actions",
  items = [],
  disabled = false,
  className = '',
}) {
  return (
    <div
      className={`bg-white border border-border rounded-[8px] overflow-hidden ${className}`}
      style={{
        boxShadow:
          '0px 4px 6px -4px rgba(26,26,26,0.05), 0px 8px 10px -1px rgba(26,26,26,0.05)',
      }}
    >
      <div
        className="flex items-center px-[10px]"
        style={{
          height: 32,
          backgroundColor: '#f8f7f5',
          borderBottom: '1px solid #e7e5e3',
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            color: '#78716c',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {header}
        </span>
      </div>
      <div className="p-1">
        <div className="p-1 flex flex-col">
          {items.map((it, i) => {
            const Icon = it.icon;
            const isDisabled = disabled || it.disabled;
            return (
              <button
                key={i}
                type="button"
                onClick={it.onClick}
                disabled={isDisabled}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-[6px] hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
              >
                {Icon && (
                  <Icon
                    className="w-4 h-4 text-foreground-tertiary flex-shrink-0"
                    strokeWidth={1.5}
                  />
                )}
                <span className="flex-1 min-w-0 text-[14px] font-normal text-foreground leading-[20px] truncate">
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
