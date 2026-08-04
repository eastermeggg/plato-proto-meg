// Carte « Prochains connecteurs » (Réglages > Connecteurs) - le cabinet ne
// vit pas que dans l'email : WhatsApp, e-Barreau/RPVA, logiciels métier.
// Chaque ligne est au futur assumé (chip À VENIR, pas de date) et « Me
// prévenir » transforme l'attente en signal de priorisation.
//
// Même anatomie que la carte « Boîte email » du réglage : une carte, des
// lignes divisées, tuile teintée + nom + description + action à droite.

import React from 'react';
import { Check, Plug2 } from 'lucide-react';
import { UPCOMING_CONNECTORS } from './connectorData';
import { UpcomingMark } from './ConnectorArt';

const MONO = "'IBM Plex Mono', monospace";

export default function UpcomingConnectorsCard({ interested = [], onNotify }) {
  return (
    <div className="bg-white rounded-md border border-border overflow-hidden divide-y divide-border shadow-sm">
      <div className="px-5 py-3 flex items-center gap-2">
        <Plug2 className="w-4 h-4 text-foreground-secondary" strokeWidth={1.75} />
        <span className="text-body-medium text-foreground">Prochains connecteurs</span>
        <span className="text-[12px] text-foreground-muted">« Me prévenir » nous aide à prioriser pour votre cabinet</span>
      </div>
      {UPCOMING_CONNECTORS.map(u => {
        const asked = interested.includes(u.id);
        return (
          <div key={u.id} className="px-5 py-4 flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: u.tint }}>
              <UpcomingMark id={u.id} size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-body-medium text-foreground">{u.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716c', backgroundColor: '#eeece6', borderRadius: 4, padding: '2px 5px', flexShrink: 0 }}>
                  À venir
                </span>
              </div>
              <p className="text-[13px] text-foreground-secondary truncate">{u.desc}</p>
            </div>
            {asked ? (
              <span className="inline-flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium flex-shrink-0" style={{ color: '#4a9168' }}>
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> On vous préviendra
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNotify?.(u)}
                className="h-9 px-3 text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-background rounded-lg transition-colors flex-shrink-0"
              >
                Me prévenir
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
