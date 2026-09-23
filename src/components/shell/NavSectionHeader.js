import React from 'react';
import { Plus } from 'lucide-react';
import { colors } from '../../design-system/tokens';

// En-tête de section de la nav - IBM Plex Mono 11 uppercase, opacité 70,
// point brand 4px PLEIN en tête (nav finale 37416:1376 : px8 py6, gap 8,
// tracking 0).
// `action` = création portée par la section : petit bouton VISIBLE (bordé +
// libellé + « + » qui pivote au survol) à droite du titre.
//   action: { label, title?, onClick }
export default function NavSectionHeader({ label, action = null }) {
  return (
    <div className="px-2 py-1.5 flex items-center gap-2">
      <span aria-hidden className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: colors.brand.DEFAULT }} />
      <span className="flex-1 min-w-0 truncate" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.mutedForeground, textTransform: 'uppercase', letterSpacing: 0, opacity: 0.7 }}>
        {label}
      </span>
      {action && (
        <button
          onClick={action.onClick}
          title={action.title}
          className="group/add flex items-center gap-1 h-6 pl-1.5 pr-2 -my-0.5 rounded-md border border-border-strong bg-surface text-foreground-secondary hover:text-foreground hover:bg-cream hover:border-border-hover transition-colors flex-shrink-0 shadow-[0px_1px_1px_0px_rgba(26,26,26,0.03)]"
        >
          <Plus className="w-3 h-3 transition-transform duration-200 ease-out group-hover/add:rotate-90" strokeWidth={2.25} />
          <span className="text-[11px] font-medium leading-none">{action.label}</span>
        </button>
      )}
    </div>
  );
}
