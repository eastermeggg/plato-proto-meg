import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * PromptSuggestionCard — Plato design system.
 * Source of truth: Figma node 2057:17330 ("ChatPromptSuggestionsCard")
 * in the "Plato — Design" file.
 *
 * Used in the chat sidebar empty state to expose the 3 cold-start prompts
 * as clickable cards. The card itself has no chat awareness — the click
 * handler is responsible for dispatching the user message (directly or via
 * a scenario).
 *
 * Visual states (per Figma):
 * - Default: white card, stone border, muted-cream icon container, stone icon,
 *   no arrow, small two-layer shadow.
 * - Hover: same card frame, dark stone-900 icon container with white icon,
 *   trailing arrow fades + slides in (neutral stone color), larger two-layer
 *   drop shadow.
 *
 * Props:
 * - icon       Lucide icon component (rendered inside the 36px square)
 * - label      string
 * - onClick    () => void
 * - disabled   boolean (optional)
 * - pinHover   boolean (optional — force the hover visuals; for design-system specimens only)
 * - className  string (optional — merges into outer classes for layout overrides)
 */
export default function PromptSuggestionCard({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  pinHover = false,
  className = '',
}) {
  const shadowDefault = '0px 1px 4px 0px rgba(26,26,26,0.05), 0px 1px 2px 0px rgba(26,26,26,0.05)';
  const shadowHover = '0px 4px 6px 0px rgba(26,26,26,0.05), 0px 10px 15px 0px rgba(26,26,26,0.05)';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group/psc relative w-full max-w-[320px] flex items-center bg-white border border-border rounded-[4px] transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${pinHover ? '' : 'hover:shadow-[0px_4px_6px_0px_rgba(26,26,26,0.05),0px_10px_15px_0px_rgba(26,26,26,0.05)] disabled:hover:shadow-[0px_1px_4px_0px_rgba(26,26,26,0.05),0px_1px_2px_0px_rgba(26,26,26,0.05)]'} ${className}`}
      style={{
        paddingLeft: 9,
        paddingRight: 17,
        paddingTop: 9,
        paddingBottom: 9,
        boxShadow: pinHover ? shadowHover : shadowDefault,
      }}
    >
      <span className="flex-1 min-w-0 flex items-center gap-3">
        <span className={`flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-[2px] transition-colors duration-200 ${pinHover ? 'bg-foreground' : 'bg-cream group-hover/psc:bg-foreground'}`}>
          {Icon && (
            <Icon
              className={`w-5 h-5 transition-colors duration-200 ${pinHover ? 'text-white' : 'text-foreground-secondary group-hover/psc:text-white'}`}
              strokeWidth={1.75}
            />
          )}
        </span>
        <span className="flex-1 min-w-0 text-left text-[14px] font-medium text-foreground leading-[20px] truncate">
          {label}
        </span>
      </span>
      <ArrowRight
        className={`w-4 h-4 flex-shrink-0 text-foreground-secondary transition-all duration-200 ${pinHover ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover/psc:opacity-100 group-hover/psc:translate-x-0'}`}
        strokeWidth={1.75}
      />
    </button>
  );
}
