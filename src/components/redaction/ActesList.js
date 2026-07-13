import React, { useMemo } from 'react';
import { FileText, Plus, Pencil, MoreVertical, ListOrdered } from 'lucide-react';
import EmptyState from '../EmptyState';

const colHeaderStyle = { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '11px', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' };

export default function ActesList({ actes = [], onOpen, onNewActe, onNewBordereau, onSendPrompt }) {
  // Collapse paired (acte + bordereau) into a single row represented by the
  // text acte — the canvas exposes both sides via the Pair tabs, so listing
  // them separately would just duplicate the artefact.
  // Standalone bordereaux (no pairId) keep their own row.
  const rows = useMemo(() => {
    const pairIdsWithText = new Set(
      actes.filter(a => a.kind !== 'bordereau' && a.pairId).map(a => a.pairId),
    );
    return actes.filter(a => {
      if (a.kind === 'bordereau' && a.pairId && pairIdsWithText.has(a.pairId)) return false;
      return true;
    });
  }, [actes]);

  if (rows.length === 0) {
    const canCreate = !!(onSendPrompt || onNewActe);
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <EmptyState
          icon={Pencil}
          title={canCreate ? 'Rédigez votre premier acte' : 'Aucun acte rédigé'}
          description={canCreate
            ? "Assignation, référé, demande d'expertise, e-mails... demandez n'importe quel type d'acte à Plato."
            : "Ce dossier est en lecture seule."}
          primaryAction={canCreate ? {
            label: 'Rédiger un acte',
            onClick: () => {
              if (onSendPrompt) onSendPrompt('Rédige une assignation');
              else if (onNewActe) onNewActe();
            },
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col -mx-4 -mt-4">
      {/* Sub-header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div />
        <div className="flex items-center gap-2">
          {onNewBordereau && (
            <button
              onClick={onNewBordereau}
              className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-foreground-tertiary bg-cream rounded-md hover:bg-border transition-colors"
            >
              <ListOrdered className="w-4 h-4" strokeWidth={1.5} />
              Nouveau bordereau
            </button>
          )}
          {onNewActe && (
            <button
              onClick={onNewActe}
              className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-white bg-foreground rounded-md hover:bg-foreground-tertiary shadow-[0px_1px_2px_0px_rgba(26,26,26,0.05)] transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Nouvel acte
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="border border-border rounded-md overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center bg-white border-b border-border">
            <div className="w-[38px] h-10 shrink-0" />
            <div className="flex-1 min-w-0 px-3 py-3" style={colHeaderStyle}>Titre</div>
            <div className="w-[120px] shrink-0 px-3 py-3" style={colHeaderStyle}>Modifié</div>
            <div className="w-[44px] shrink-0" />
          </div>

          {/* Rows */}
          {rows.map(acte => {
            const isBordereau = acte.kind === 'bordereau';
            const Icon = isBordereau ? ListOrdered : FileText;
            return (
              <div
                key={acte.id}
                className="flex items-center h-14 bg-white border-b border-border last:border-b-0 cursor-pointer hover:bg-background transition-colors group"
                onClick={() => onOpen?.(acte.id)}
              >
                {/* Icon — FileText for actes, ListOrdered for bordereaux. The
                    icon alone signals doc vs bordereau; the paired relationship
                    surfaces inside the canvas via the Acte/Bordereau tabs. */}
                <div className="w-[38px] shrink-0 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-foreground-muted" strokeWidth={1.5} />
                </div>
                {/* Title */}
                <div className="flex-1 min-w-0 px-3">
                  <span className="text-sm font-medium text-black truncate block">{acte.title}</span>
                </div>
                {/* Date */}
                <div className="w-[120px] shrink-0 px-3">
                  <span className="text-sm text-foreground">{acte.lastUpdated || '—'}</span>
                </div>
                {/* Options */}
                <div className="w-[44px] shrink-0 flex items-center justify-end pr-4">
                  <MoreVertical className="w-4 h-4 text-foreground-secondary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
