import React from 'react';
import { PencilLine, MessageSquare, Folder } from 'lucide-react';
import { isThreadArchived, formatThreadActivity } from '../../hooks/useThreads';

// Page index « Mes conversations » - titre serif 28 + CTA sombre « Nouvelle
// conversation », table blanche (Question / Dossier / Dernière activité),
// badge « Archivée » (30 j dérivés), empty state (icône cream + 2 lignes).
// Aucun renommage / épinglage / suppression sur cette surface.
// Le shell (bannière trial, slot de nav, contrôle « Menu ») est passé en
// slots : la page ne connaît pas l'état de la nav au-delà du padding.
//   threads       fils triés par la page (lastActivity desc)
//   onOpenThread  (thread, dossier|null) - fil rattaché → ouvre le dossier
// (miroir de App.js colHeaderStyle)
const colHeaderStyle = { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '11px', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' };

export default function ConversationsIndexPage({
  threads,
  dossiers,
  navHidden = false,
  trialBanner = null,
  navSlot = null,
  expandControl = null,
  onNewConversation,
  onOpenThread,
}) {
  const rows = [...threads].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  const dossierOf = (t) => dossiers.find(d => d.id === t.scope?.dossierId) || null;

  return (
    <div className="h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: '#27272a' }}>
      {trialBanner}
      <div className="flex-1 flex relative overflow-hidden">
        {navSlot}
        <div className="flex-1 flex flex-col overflow-hidden relative" style={{ backgroundColor: '#F8F7F5' }}>
          {/* Nav masquée : bande « Menu » en tête, au-dessus du titre. */}
          {expandControl && (
            <div className="px-8 pt-3 pb-1 flex-shrink-0">
              {expandControl}
            </div>
          )}
          {/* Header - pas d'onglets, un en-tête de page */}
          <div className={`px-8 ${navHidden ? 'pt-3' : 'pt-8'} pb-4`}>
            <div className="flex items-center justify-between">
              <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '28px', fontWeight: 400, color: '#18181b', letterSpacing: '-0.01em' }}>
                Mes conversations
              </h1>
              <button
                onClick={onNewConversation}
                className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-white text-body-medium rounded-lg hover:bg-foreground-tertiary transition-colors"
              >
                <PencilLine className="w-4 h-4" />
                Nouvelle conversation
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="flex-1 overflow-y-auto px-8 pb-6">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-foreground-muted" strokeWidth={1.5} />
                </div>
                <p className="text-body-medium text-foreground mb-1">Aucune conversation</p>
                <p className="text-body text-foreground-secondary">Posez une question depuis l'accueil pour commencer.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-border/60 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="px-5 py-3 text-left" style={colHeaderStyle}>Question</th>
                      <th className="px-5 py-3 text-left" style={colHeaderStyle}>Dossier</th>
                      <th className="px-5 py-3 text-left" style={colHeaderStyle}>Dernière activité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map(t => {
                      const d = dossierOf(t);
                      const archived = isThreadArchived(t);
                      return (
                        <tr
                          key={t.id}
                          onClick={() => onOpenThread(t, d)}
                          className="bg-white hover:bg-background cursor-pointer transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <MessageSquare className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.5} />
                              <span className="text-body-medium text-foreground truncate">{t.title}</span>
                              {archived && <span className="badge badge-sm badge-secondary flex-shrink-0">Archivée</span>}
                            </div>
                          </td>
                          {/* Dossier si rattaché, sinon rien */}
                          <td className="px-5 py-4">
                            {d ? (
                              <span className="inline-flex items-center gap-1.5 text-body text-foreground">
                                <Folder className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
                                {d.reference}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-5 py-4 text-body text-foreground-secondary">{formatThreadActivity(t.lastActivity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
