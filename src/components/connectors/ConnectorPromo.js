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
import { ArrowRight, ChevronRight, Eye, Lock, Mail, Plug2, RefreshCw, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { ConnectorMiniLink, ProviderMark } from './ConnectorArt';
import { CONNECTOR_PROVIDERS } from './connectorData';
import { colors, typeStyle, shadows } from '../../design-system/tokens';

const MONO = "'IBM Plex Mono', monospace";

// ── Teaser « à venir : synchronisation automatique » ────────────────────────
// La suite du connecteur, annoncée sans sur-promettre : on prépare le terrain
// (spec §09 - la proactivité passera comme continuité) en gardant « vous
// validez » invariant. Teinte bleue (info/à venir), jamais l'orange du
// « nouveau » de maintenant. Compact = une ligne serrée.
export function SyncSoonTeaser({ compact = false }) {
  return (
    <div
      className="flex items-start rounded-lg"
      style={{ gap: 10, backgroundColor: colors.piece.administratif.bg, border: `1px solid ${colors.feedback.info.subtle}`, padding: compact ? '9px 11px' : '11px 13px' }}
    >
      <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: colors.piece.expertise.bg }}>
        <RefreshCw style={{ width: 14, height: 14, color: colors.feedback.info.text }} strokeWidth={1.75} />
      </span>
      <div className="flex flex-col min-w-0" style={{ gap: 1 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, color: colors.feedback.info.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          À venir · Synchronisation automatique
        </span>
        <p className="text-[12.5px] leading-[17px]" style={{ color: colors.piece.administratif.fg }}>
          Les nouveaux emails d'un dossier s'y verseront tout seuls - vous validerez toujours.
        </p>
      </div>
    </div>
  );
}

// Chips de garanties - la réassurance en trois mots, jamais un paragraphe.
// « Visible de vous seul » remonte des réglages (où personne ne va) au moment
// de la décision : c'est l'objection « mes associés vont voir mes mails », qui
// décide en cabinet de la moitié des refus.
export function GuaranteeChips({ compact = false, only = null }) {
  const all = [
    { Icon: Lock, label: 'Lecture seule' },
    { Icon: Eye, label: 'Visible de vous seul' },
    { Icon: ShieldCheck, label: 'Hébergé en UE' },
    { Icon: RotateCcw, label: 'Réversible' },
  ];
  const items = only ? only.map(l => all.find(i => i.label === l)).filter(Boolean) : all;
  return (
    <span className={`inline-flex items-center flex-wrap justify-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {items.map(({ Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 rounded-full bg-surface font-medium"
          style={{ height: compact ? 20 : 24, padding: compact ? '0 7px' : '0 9px', fontSize: compact ? 10.5 : 11.5, color: colors.semantic.foregroundQuaternary, border: `1px solid ${colors.semantic.border}` }}
        >
          <Icon style={{ width: compact ? 10 : 12, height: compact ? 10 : 12, color: colors.accents.meadow }} strokeWidth={2} />
          {label}
        </span>
      ))}
    </span>
  );
}

// ── Bandeau promo (pages pièces, import, accueil dossier) ───────────────────
// Une seule version : la promesse. CTA en verbe (« Ajouter depuis mes emails »),
// jamais de titre interrogatif.
export function ConnectorPromoBanner({ onConnect, onDismiss }) {
  return (
    <div
      className="relative flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-xl overflow-hidden"
      style={{
        padding: '14px 16px',
        paddingRight: onDismiss ? 40 : 16, // place réservée à la croix (absolue)
        border: `1px solid ${colors.semantic.border}`,
        background: `linear-gradient(105deg, ${colors.semantic.muted} 0%, ${colors.semantic.background} 55%, ${colors.banner.info.bgFrom} 130%)`,
      }}
    >
      <ConnectorMiniLink both tileSize={40} />
      {/* Largeur mini pour ne jamais tomber à un mot par ligne ; flex-1 sinon. */}
      <div className="flex-1" style={{ minWidth: 160 }}>
        <p className="text-[13.5px] font-medium text-foreground leading-5">Ne cherchez plus vos pièces dans vos emails.</p>
        <p className="text-[12.5px] leading-[18px] mt-0.5" style={{ color: colors.semantic.foregroundQuaternary }}>
          Choisissez les échanges, Plato en extrait les pièces.
        </p>
      </div>
      {/* CTA secondaire - passe SOUS le texte quand la place manque (flex-wrap). */}
      <button
        type="button"
        onClick={onConnect}
        className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-foreground bg-surface border border-border rounded-lg hover:bg-background transition-colors flex-shrink-0"
        style={{ boxShadow: shadows.xs }}
      >
        <Mail className="w-3.5 h-3.5" strokeWidth={1.75} /> Ajouter depuis mes emails
      </button>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Masquer"
          className="absolute flex items-center justify-center w-7 h-7 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors"
          style={{ top: 8, right: 8 }}
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ── Encart flottant « Nouveauté » (coin de l'accueil) - le nudge passif à la
//    Linear / Intercom : mini visuel + titre, appelant, congédiable, qui attire
//    l'œil sans bloquer. Deux portes : le corps ouvre la modale de valeur (le
//    pitch complet), le CTA va droit aux réglages. Surface PASSIVE - elle
//    remplace l'ouverture automatique de la modale sur l'accueil (jamais deux
//    sollicitations sur le même écran). ─────────────────────────────────────
export function MailFloatingPromo({ onOpen, onConnect, onDismiss }) {
  // Bas-droite, mais JAMAIS par-dessus le chat : `right` suit la largeur du
  // panneau de chat (--chat-offset, global) - l'encart glisse à sa gauche quand
  // il est ouvert, et revient au coin quand il est fermé.
  return (
    <div className="fixed z-40 animate-fade-up" style={{ right: 'calc(var(--chat-offset, 0px) + 24px)', bottom: 24, width: 288 }}>
      <div className="relative">
        {/* Halo qui respire - blur derrière la carte, attire l'œil sans crier. */}
        <div
          aria-hidden
          className="absolute -inset-2 rounded-2xl blur-xl animate-conn-halo pointer-events-none"
          style={{ background: 'radial-gradient(60% 60% at 78% 12%, rgba(234,122,46,0.26), rgba(234,122,46,0) 70%), radial-gradient(70% 70% at 20% 90%, rgba(201,138,63,0.16), rgba(201,138,63,0) 72%)' }}
        />

        {/* Bord animé (signal « nouveau ») : un arc bleu qui fait le tour d'un
            liseré crème. Le liseré fait office de bordure ; la carte blanche
            couvre le centre. */}
        <div
          className="relative overflow-hidden"
          style={{ borderRadius: 13, padding: 1.5, boxShadow: '0 18px 40px -14px rgba(28,25,23,0.32)' }}
        >
          <div
            aria-hidden
            className="absolute animate-conn-border pointer-events-none"
            style={{ inset: '-60%', background: `conic-gradient(from 0deg, ${colors.semantic.muted} 0deg, ${colors.semantic.muted} 200deg, rgba(234,122,46,0.28) 262deg, ${colors.brand.DEFAULT} 312deg, ${colors.brand.darker.border} 338deg, ${colors.semantic.muted} 360deg)` }}
          />

          <div className="relative bg-surface overflow-hidden" style={{ borderRadius: 11.5 }}>
          <button
            type="button"
            aria-label="Masquer"
            onClick={onDismiss}
            className="absolute z-10 flex items-center justify-center w-6 h-6 rounded-md text-foreground-muted hover:text-foreground hover:bg-cream transition-colors"
            style={{ top: 7, right: 7 }}
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>

          {/* Corps cliquable -> réglages. Mini-visuel + eyebrow orange + titre
              serif + sous-ligne, et un bouton rond fléché pour le geste. */}
          <div
            role="button" tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(); } }}
            className="group block w-full text-left cursor-pointer"
            style={{ padding: '13px 14px 14px' }}
          >
            <ConnectorMiniLink both tileSize={30} />
            <div className="pt-3">
              <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: colors.banner.warning.accentHover, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Nouveau
              </span>
              <h3
                className="group-hover:text-foreground-tertiary transition-colors"
                style={{ fontFamily: "'RL Para Trial Central', Georgia, serif", fontSize: 16, fontWeight: 500, color: colors.semantic.foreground, letterSpacing: '-0.2px', lineHeight: '20px', marginTop: 3 }}
              >
                Ne cherchez plus vos pièces, connectez votre boîte mail.
              </h3>
            </div>
            <div className="flex items-end justify-between mt-2.5" style={{ gap: 12 }}>
              <p className="text-[11.5px] leading-[16px] flex-1 min-w-0" style={{ color: colors.semantic.mutedForeground }}>
                Choisissez les échanges à ajouter, Plato extrait les pièces.
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onConnect(); }}
                aria-label="Connecter ma boîte mail"
                className="inline-flex items-center justify-center rounded-full text-white flex-shrink-0 transition-colors"
                style={{ width: 38, height: 38, backgroundColor: colors.semantic.primary }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.semantic.foregroundTertiary; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.semantic.foreground; }}
              >
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
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
        borderTop: `1px solid ${colors.semantic.border}`,
        padding: '12px 16px',
        background: `linear-gradient(90deg, ${colors.brand.darker.subtle} 0%, rgba(247,227,210,0) 59.5%)`,
        boxShadow: `inset 2px 0 0 0 ${colors.banner.warning.accent}`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Eyebrow - Mail + « Nouveau » + hairline fondu */}
      <div className="flex items-center" style={{ gap: 6 }}>
        <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.semantic.mutedForeground }} />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, fontWeight: 500,
            color: colors.semantic.mutedForeground,
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
          style={{ height: 1, background: `linear-gradient(90deg, ${colors.semantic.input} 0%, rgba(231,229,227,0) 100%)` }}
        />
      </div>

      <div className="flex flex-col mt-2" style={{ gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: colors.semantic.foreground, lineHeight: '20px' }}>
          Ne cherchez plus vos pièces
        </div>
        <div className="inline-flex items-center" style={{ gap: 8, fontSize: 14, fontWeight: 500, color: colors.banner.warning.accentHover, lineHeight: '20px' }}>
          Connecter ma boîte
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          aria-label="Masquer"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="absolute flex items-center justify-center w-6 h-6 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-subtle opacity-0 group-hover:opacity-100 transition-opacity"
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
        className="relative bg-surface rounded-xl border border-border flex flex-col overflow-hidden"
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
            <h2 style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: 21, fontWeight: 500, color: colors.semantic.foreground, letterSpacing: '-0.2px', lineHeight: '27px' }}>
              Ne cherchez plus vos pièces : connectez votre boîte mail.
            </h2>
            <p className="text-[13px] text-foreground-secondary leading-5">
              Choisissez les échanges, Plato en extrait les pièces.
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
              className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-surface border border-border rounded-lg hover:bg-background transition-colors text-left group"
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
          style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.semantic.mutedForeground }}
        >
          2 minutes, réversible
        </p>
      </div>
    </div>
  );
}

// ── État vide « aucune boîte connectée » (colonne mail, panneaux d'import) ──
// Compact = le « Connector Promo » du Figma Import Inbox (3345:36790 /
// 3644:36743) : tuiles 50, titre display-xs, sous-ligne 14 sur 300px, un seul
// CTA sombre « Connecter ma boîte ». Les garanties et le teaser sync restent
// sur la variante pleine (surfaces settings / marketing).
export function ConnectorPromoPanel({ provider = 'outlook', onConnect, compact = false, vendorLabel = 'ma boîte' }) {
  if (compact) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-10 gap-4">
        <ConnectorMiniLink provider={provider} tileSize={50} />
        <div className="flex flex-col items-center gap-2">
          <p className="text-foreground" style={{ ...typeStyle('display-xs'), maxWidth: 300 }}>
            Ne cherchez plus vos pièces : connectez votre boîte mail.
          </p>
          <p className="text-sm text-foreground-secondary leading-5" style={{ maxWidth: 300 }}>
            Choisissez les échanges d'une affaire : Plato en extrait les pièces, prêtes à verser.
          </p>
        </div>
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-primary-foreground transition-colors"
          style={{ backgroundColor: colors.semantic.primary }}
        >
          <Plug2 className="w-4 h-4" strokeWidth={1.75} /> Connecter {vendorLabel}
        </button>
      </div>
    );
  }
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-10 py-12 gap-5">
      <ConnectorMiniLink provider={provider} tileSize={50} />
      <div className="flex flex-col gap-1" style={{ maxWidth: 360 }}>
        <p className="text-sm font-medium text-foreground">Ne cherchez plus vos pièces : connectez votre boîte mail.</p>
        <p className="text-[13px] text-foreground-secondary leading-5">
          Choisissez les échanges d'une affaire : Plato en extrait les pièces, prêtes à verser.
        </p>
      </div>
      <GuaranteeChips only={['Lecture seule', 'Visible de vous seul', 'Réversible']} />
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-primary-foreground transition-colors"
          style={{ backgroundColor: colors.semantic.primary }}
        >
          <Plug2 className="w-4 h-4" strokeWidth={1.75} /> Connecter {vendorLabel}
        </button>
        <p style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.semantic.mutedForeground }}>
          2 minutes, réversible
        </p>
      </div>
      <div style={{ maxWidth: 360, width: '100%' }}>
        <SyncSoonTeaser compact />
      </div>
    </div>
  );
}
