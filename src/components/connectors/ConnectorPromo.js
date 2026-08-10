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
import { ArrowRight, ChevronRight, Lock, Mail, Plug2, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { ConnectorMiniLink, ProviderMark } from './ConnectorArt';
import { CONNECTOR_PROVIDERS } from './connectorData';

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

// ── Carte nav « Nouveau » - l'annonce du connecteur là où l'avocat passe
//    chaque jour (sidebar). Même grammaire que la carte Parrainage (eyebrow
//    mono + hairline, titre sans, CTA fléché, rail accent), déclinée dans le
//    vert « lecture seule » des garanties. Congédiable d'une croix. ──────────
export function MailNavPromoCard({ onOpen, onDismiss }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(); } }}
      className="group relative block w-full text-left cursor-pointer"
      style={{
        borderTop: '1px solid #e7e5e3',
        padding: '12px 16px',
        background: 'linear-gradient(90deg, #cce6d9 0%, rgba(204,230,217,0) 59.5%)',
        boxShadow: 'inset 2px 0 0 0 #064e3b',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Eyebrow - Mail + « Nouveau » + hairline fondu */}
      <div className="flex items-center" style={{ gap: 6 }}>
        <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#78716c' }} />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, fontWeight: 500,
            color: '#78716c',
            textTransform: 'uppercase',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          Nouveau
        </span>
        <span
          aria-hidden
          className="flex-1"
          style={{ height: 1, background: 'linear-gradient(90deg, #e7e5e3 0%, rgba(231,229,227,0) 100%)' }}
        />
      </div>

      <div className="flex flex-col mt-2" style={{ gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#18181b', lineHeight: '20px' }}>
          Vos emails deviennent des pièces
        </div>
        <div className="inline-flex items-center" style={{ gap: 8, fontSize: 14, fontWeight: 500, color: '#064e3b', lineHeight: '20px' }}>
          Connecter ma boîte
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          aria-label="Masquer"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="absolute flex items-center justify-center w-6 h-6 rounded-md text-foreground-muted hover:text-foreground hover:bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ top: 8, right: 8 }}
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ── Interstitiel de connexion - quand une entrée « importer des emails » est
//    actionnée sans aucune boîte connectée, on remplace le picker par la
//    promesse + le choix du fournisseur. Un seul écran, un seul geste. ───────
export function MailConnectDialog({ open, onClose, providers, onPick }) {
  if (!open) return null;
  const list = providers && providers.length ? providers : Object.values(CONNECTOR_PROVIDERS);
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-xl border border-border flex flex-col overflow-hidden"
        style={{ width: 460, boxShadow: '0 24px 60px -12px rgba(28,25,23,0.28)' }}
      >
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute flex items-center justify-center w-7 h-7 rounded-md text-foreground-muted hover:text-foreground hover:bg-cream transition-colors"
          style={{ top: 12, right: 12 }}
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* La promesse - même vocabulaire que la modale et les réglages */}
        <div className="flex flex-col items-center text-center px-8 pt-8 pb-5 gap-4">
          <ConnectorMiniLink both tileSize={44} />
          <div className="flex flex-col gap-1.5" style={{ maxWidth: 340 }}>
            <h2 style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: 21, fontWeight: 500, color: '#292524', letterSpacing: '-0.2px', lineHeight: '27px' }}>
              Versez vos emails dans vos dossiers
            </h2>
            <p className="text-[13px] text-foreground-secondary leading-5">
              Connectez votre boîte : Norma vous propose vos échanges dossier par dossier,
              avec leurs pièces jointes - sans export manuel. Rien n'est versé sans votre geste.
            </p>
          </div>
          <GuaranteeChips compact />
        </div>

        {/* Le geste - un fournisseur, un clic */}
        <div className="px-5 pb-3 flex flex-col gap-1.5">
          {list.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick?.(p.id)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white border border-border rounded-lg hover:bg-background transition-colors text-left group"
            >
              <ProviderMark provider={p.id} size={20} />
              <span className="flex-1 min-w-0 flex flex-col">
                <span className="text-[13.5px] font-medium text-foreground leading-5">{p.name}</span>
                <span className="text-[12px] text-foreground-muted leading-4 truncate">{p.desc}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-foreground-secondary transition-colors flex-shrink-0" strokeWidth={1.75} />
            </button>
          ))}
        </div>

        <p
          className="text-center pb-5 pt-1"
          style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716c' }}
        >
          2 minutes, réversible
        </p>
      </div>
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
