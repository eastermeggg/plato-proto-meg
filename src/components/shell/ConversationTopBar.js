import React from 'react';
import { PencilLine } from 'lucide-react';

// Barre de contexte de la conversation centrale - h-48, filet bas, px-4.
// Fil : « Mes conversations / <titre> ». Le titre est un bouton de renommage
// (crayon en fade-in au survol). Une barre vide ne s'affiche jamais : la
// barre n'existe QUE sur la conversation centrale.
//   leading   slot à l'extrême gauche - le contrôle « Menu » quand la nav
//             est masquée (NavExpandControl), sinon null
//   children  slot overlay - la modale de renommage
export default function ConversationTopBar({
  title,
  indexLabel = 'Mes conversations',
  onOpenIndex,
  onRename,
  leading = null,
  children,
}) {
  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {leading}
        <button
          onClick={onOpenIndex}
          className="text-[13px] text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0"
        >
          {indexLabel}
        </button>
        <span className="text-[13px] text-foreground-quaternary flex-shrink-0">/</span>
        <button
          onClick={onRename}
          className="group flex items-center gap-1.5 min-w-0 hover:bg-background rounded px-1 -mx-1 py-0.5 transition-colors text-left"
          title="Renommer la conversation"
        >
          <span className="text-[13px] font-medium text-foreground truncate min-w-0">{title ?? 'Conversation'}</span>
          <PencilLine className="w-3.5 h-3.5 flex-shrink-0 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
        </button>
      </div>
      {children}
    </div>
  );
}
