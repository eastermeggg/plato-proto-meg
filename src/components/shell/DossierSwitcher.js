import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Folder, Plus } from 'lucide-react';

/**
 * DossierSwitcher - le nom du dossier (en-tête du workspace / nav du dossier)
 * ouvre ce menu pour basculer vers un autre dossier ou en créer un.
 *
 * Changer de dossier change le WORKSPACE uniquement - jamais le périmètre de la
 * conversation courante (le rattachement est le seul geste qui change un
 * périmètre).
 *
 * Props:
 * - dossiers         Dossier[]           liste complète
 * - activeDossierId  string
 * - onSelect         (dossier) => void
 * - onCreate         () => void
 * - trigger          'title' | 'chip'    rendu du déclencheur (défaut 'title')
 * - label            string              libellé affiché (défaut : reference du dossier actif)
 */
export default function DossierSwitcher({ dossiers = [], activeDossierId, onSelect, onCreate, trigger = 'title', label }) {
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

  const active = dossiers.find(d => d.id === activeDossierId) || null;
  const display = label ?? active?.reference ?? 'Dossier';
  const others = dossiers.filter(d => d.statut !== 'fermé' || d.id === activeDossierId);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={
          trigger === 'title'
            ? 'group flex items-center gap-1.5 min-w-0 rounded-md px-1 hover:bg-background transition-colors'
            : 'flex items-center gap-1.5 min-w-0 px-2 py-1 rounded-md border border-border bg-white hover:bg-background transition-colors'
        }
        title="Changer de dossier"
      >
        <span
          className="min-w-0 truncate text-foreground whitespace-nowrap"
          style={trigger === 'title' ? { fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 500, maxWidth: 420 } : { fontSize: 13, fontWeight: 500, maxWidth: 260 }}
        >
          {display}
        </span>
        <ChevronDown className={`flex-shrink-0 text-foreground-tertiary ${trigger === 'title' ? 'w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity' : 'w-3.5 h-3.5'}`} strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-[320px] max-w-[calc(100vw-32px)] bg-white border border-border rounded-[8px] overflow-hidden z-50"
          style={{ boxShadow: '0px 4px 6px -4px rgba(26,26,26,0.05), 0px 8px 10px -1px rgba(26,26,26,0.05)' }}
        >
          <div
            className="flex items-center px-[10px]"
            style={{ height: 32, backgroundColor: '#f8f7f5', borderBottom: '1px solid #dfdcd9' }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dossiers
            </span>
          </div>
          <div className="p-1.5 max-h-[320px] overflow-y-auto">
            {others.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => { setOpen(false); if (d.id !== activeDossierId) onSelect?.(d); }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-[6px] transition-colors ${d.id === activeDossierId ? 'bg-background' : 'hover:bg-background'}`}
              >
                <Folder className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
                <span className="flex-1 min-w-0 text-[13px] text-foreground truncate">{d.reference}</span>
                <span className="text-[11px] text-foreground-tertiary flex-shrink-0">{d.domaine ?? ''}</span>
              </button>
            ))}
            {others.length === 0 && (
              <div className="px-2 py-2 text-[13px] text-foreground-tertiary">Aucun dossier</div>
            )}
            {onCreate && (
              <div className="mt-1 pt-1 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => { setOpen(false); onCreate(); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-[6px] hover:bg-background transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-[13px] text-foreground">Nouveau dossier</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
