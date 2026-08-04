// Engagement AVANT les réglages - deux surfaces qui amènent l'avocat vers le
// connecteur là où le besoin se manifeste, pas dans un menu :
//
//   - ConnectorPromoBanner : bandeau discret et congédiable, posé sur une page
//     pièces / import (« vos pièces arrivent par email ? »).
//   - ConnectorPromoPanel : l'état vide de la colonne mail quand aucune boîte
//     n'est connectée - la promesse, les garanties, un seul geste.
//
// Même vocabulaire, mêmes garanties que la modale : une seule vérité
// (connectorData), déclinée par surface.

import React from 'react';
import { Lock, Plug2, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { ConnectorMiniLink } from './ConnectorArt';

const MONO = "'IBM Plex Mono', monospace";

// Chips de garanties - la réassurance en trois mots, jamais un paragraphe.
export function GuaranteeChips({ compact = false }) {
  const items = [
    { Icon: Lock, label: 'Lecture seule' },
    { Icon: ShieldCheck, label: 'Hébergé en UE' },
    { Icon: RotateCcw, label: 'Réversible' },
  ];
  return (
    <span className={`inline-flex items-center flex-wrap justify-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {items.map(({ Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 rounded-full bg-white font-medium"
          style={{ height: compact ? 20 : 24, padding: compact ? '0 7px' : '0 9px', fontSize: compact ? 10.5 : 11.5, color: '#57534e', border: '1px solid #e0ddd6' }}
        >
          <Icon style={{ width: compact ? 10 : 12, height: compact ? 10 : 12, color: '#4a9168' }} strokeWidth={2} />
          {label}
        </span>
      ))}
    </span>
  );
}

// ── Bandeau promo (pages pièces, import, accueil dossier) ───────────────────
export function ConnectorPromoBanner({ onConnect, onDismiss }) {
  return (
    <div
      className="relative flex items-center gap-4 rounded-xl overflow-hidden"
      style={{
        padding: '14px 18px',
        border: '1px solid #e0ddd6',
        background: 'linear-gradient(105deg, #f1efe9 0%, #faf9f7 55%, #eef3fa 130%)',
      }}
    >
      <ConnectorMiniLink both tileSize={40} />
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-foreground leading-5">Vos pièces arrivent par email ?</p>
        <p className="text-[12.5px] leading-[18px] mt-0.5" style={{ color: '#57534e' }}>
          Connectez votre boîte et versez emails et pièces jointes directement dans vos dossiers.{' '}
          <span className="whitespace-nowrap">Lecture seule, rien ne sort sans votre geste.</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onConnect}
        className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-white bg-foreground rounded-lg hover:bg-foreground-tertiary transition-colors flex-shrink-0"
      >
        <Plug2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Connecter ma boîte
      </button>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Masquer"
          className="flex items-center justify-center w-7 h-7 rounded-md text-foreground-muted hover:text-foreground hover:bg-white/70 transition-colors flex-shrink-0 -mr-1.5"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ── État vide « aucune boîte connectée » (colonne mail, panneaux d'import) ──
export function ConnectorPromoPanel({ provider = 'outlook', onConnect, compact = false, vendorLabel = 'Outlook' }) {
  return (
    <div className={`flex-1 min-h-0 flex flex-col items-center justify-center text-center ${compact ? 'px-6 py-8 gap-4' : 'px-10 py-12 gap-5'}`}>
      <ConnectorMiniLink provider={provider} tileSize={compact ? 44 : 50} />
      <div className="flex flex-col gap-1" style={{ maxWidth: 340 }}>
        <p className="text-sm font-medium text-foreground">Vos échanges deviennent des pièces</p>
        <p className="text-[13px] text-foreground-secondary leading-5">
          Connectez votre boîte pour verser emails et pièces jointes directement dans vos
          dossiers - sans export manuel. Norma propose, vous décidez.
        </p>
      </div>
      <GuaranteeChips compact={compact} />
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#292524' }}
        >
          <Plug2 className="w-4 h-4" strokeWidth={1.75} /> Connecter {vendorLabel}
        </button>
        <p style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716c' }}>
          2 minutes, réversible
        </p>
      </div>
    </div>
  );
}
