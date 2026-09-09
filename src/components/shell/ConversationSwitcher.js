import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, MessageSquare, MessagesSquare, Plus, Check } from 'lucide-react';
import { formatThreadActivity, isThreadArchived } from '../../hooks/useThreads';

/**
 * ConversationSwitcher - en-tête du rail de conversation d'un dossier.
 *
 * Le rail montre toujours exactement une conversation du dossier ; ce switcher
 * liste les conversations DE CE DOSSIER uniquement (jamais de pièces, d'actes
 * ni d'ancres d'objets), chaque entrée est ouvrable, et il propose d'en créer
 * une nouvelle. Les fils inactifs 30 j sont repliés sous « Repliées » - jamais
 * supprimés.
 *
 * Multithread : un dossier peut porter PLUSIEURS conversations. Pour que la
 * fonction soit visible même quand il n'y en a qu'une, (1) le déclencheur se
 * lit comme un contrôle (icône « plusieurs bulles », titre en clair, pastille
 * de compte dès qu'il y a > 1 fil) et (2) « Nouvelle conversation » est promue
 * en bouton « + » toujours visible à côté, plus seulement dans le menu.
 *
 * Props:
 * - threads         Thread[]   conversations du dossier (triées par récence)
 * - activeThreadId  string
 * - onSelect        (threadId) => void
 * - onCreate        () => void
 */
export default function ConversationSwitcher({ threads = [], activeThreadId, onSelect, onCreate }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const active = threads.find(t => t.id === activeThreadId) || threads[0] || null;
  const recent = threads.filter(t => !isThreadArchived(t));
  const folded = threads.filter(t => isThreadArchived(t));
  const count = threads.length;
  const multi = count > 1;

  const row = (thread) => {
    const isActive = thread.id === activeThreadId;
    return (
      <button
        key={thread.id}
        type="button"
        onClick={() => { setOpen(false); onSelect?.(thread.id); }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-[6px] transition-colors ${isActive ? 'bg-cream' : 'hover:bg-background'}`}
      >
        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-foreground' : 'text-foreground-tertiary'}`} strokeWidth={1.75} />
        <span className={`flex-1 min-w-0 text-[13px] truncate ${isActive ? 'text-foreground font-medium' : 'text-foreground'}`}>{thread.title}</span>
        {isActive
          ? <Check className="w-3.5 h-3.5 text-foreground flex-shrink-0" strokeWidth={2} />
          : <span className="text-[11px] text-foreground-tertiary flex-shrink-0">{formatThreadActivity(thread.lastActivity)}</span>}
      </button>
    );
  };

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 flex items-center gap-1">
      {/* Déclencheur : lit comme un contrôle, pas comme un titre de section. */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="group flex items-center gap-1.5 min-w-0 flex-1 pl-1.5 pr-1 py-1 rounded-md hover:bg-background border border-transparent hover:border-border transition-colors"
        title="Changer de conversation"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MessagesSquare className="w-4 h-4 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
        <span className="min-w-0 truncate text-[13px] font-medium text-foreground">
          {active ? active.title : 'Conversation'}
        </span>
        {multi && (
          <span
            className="flex-shrink-0 inline-flex items-center justify-center rounded-full bg-cream text-foreground-secondary"
            style={{ minWidth: 18, height: 18, padding: '0 5px', fontSize: 11, fontWeight: 600, lineHeight: 1 }}
            title={`${count} conversations dans ce dossier`}
          >
            {count}
          </span>
        )}
        <ChevronDown
          className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0 transition-transform"
          strokeWidth={1.75}
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {/* Nouvelle conversation - toujours accessible en un clic (multithread). */}
      <button
        type="button"
        onClick={() => onCreate?.()}
        className="flex-shrink-0 p-1.5 rounded-md text-foreground-tertiary hover:text-foreground hover:bg-background transition-colors"
        title="Nouvelle conversation"
        aria-label="Nouvelle conversation"
      >
        <Plus className="w-4 h-4" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-[300px] max-w-[calc(100vw-32px)] bg-white border border-border rounded-[8px] overflow-hidden z-50"
          style={{ boxShadow: '0px 4px 6px -4px rgba(26,26,26,0.05), 0px 8px 10px -1px rgba(26,26,26,0.05)' }}
        >
          <div
            className="flex items-center justify-between px-[10px]"
            style={{ height: 32, backgroundColor: '#f8f7f5', borderBottom: '1px solid #dfdcd9' }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Conversations du dossier
            </span>
            {count > 0 && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#a8a29e' }}>
                {count}
              </span>
            )}
          </div>
          <div className="p-1.5 max-h-[320px] overflow-y-auto">
            {recent.map(row)}
            {folded.length > 0 && (
              <>
                <div className="px-2 pt-2 pb-1 text-[10.5px] uppercase tracking-wide text-foreground-tertiary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Repliées
                </div>
                {folded.map(row)}
              </>
            )}
            {threads.length === 0 && (
              <div className="px-2 py-2 text-[13px] text-foreground-tertiary">Aucune conversation</div>
            )}
            <div className="mt-1 pt-1 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => { setOpen(false); onCreate?.(); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-[6px] hover:bg-background transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
                <span className="text-[13px] text-foreground">Nouvelle conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
