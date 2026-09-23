import React from 'react';
import { ArrowLeft, ChevronRight, PencilLine } from 'lucide-react';
import TopBar from '../ui/TopBar';

// Barre de tête de la conversation centrale — compose le chrome canonique
// TopBar (variant « Conversation » du nœud Figma Plato---System 37443:5796) :
// breadcrumb « ← Mes conversations » (12px muted) › chevron › titre 14 medium.
// Le titre est un bouton de renommage : au survol, souligné + crayon en
// fade-in. Une barre vide ne s'affiche jamais : la barre n'existe QUE sur la
// conversation centrale.
//   navCollapsed + onNav*  nav masquée : le TopBar rend le contrôle « Menu »
//   leading                échappatoire (slot custom en tête)
//   children               slot overlay - la modale de renommage
export default function ConversationTopBar({
  title,
  indexLabel = 'Mes conversations',
  onOpenIndex,
  onRename,
  navCollapsed = false,
  onNavExpand,
  onNavHome,
  onNavPeekEnter,
  onNavPeekLeave,
  leading = null,
  children,
}) {
  return (
    <TopBar
      navCollapsed={navCollapsed}
      onNavExpand={onNavExpand}
      onNavHome={onNavHome}
      onNavPeekEnter={onNavPeekEnter}
      onNavPeekLeave={onNavPeekLeave}
      leading={leading}
      left={(
        <div className="flex items-center gap-1.5 pl-1.5 min-w-0">
          <button
            onClick={onOpenIndex}
            className="group/index flex items-center gap-1.5 flex-shrink-0"
            title={indexLabel}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-foreground-secondary group-hover/index:text-foreground transition-colors" strokeWidth={1.75} />
            <span className="text-[12px] leading-4 text-foreground-secondary tracking-[0.01em] group-hover/index:text-foreground transition-colors">
              {indexLabel}
            </span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
          <button
            onClick={onRename}
            className="group flex items-center gap-1.5 min-w-0 text-left"
            title="Renommer la conversation"
          >
            <span className="text-[14px] leading-5 font-medium text-foreground truncate min-w-0 group-hover:underline">
              {title ?? 'Conversation'}
            </span>
            <PencilLine className="w-4 h-4 flex-shrink-0 text-foreground-secondary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
          </button>
        </div>
      )}
      right={children}
    />
  );
}
