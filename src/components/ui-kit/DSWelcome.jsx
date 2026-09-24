import React from 'react';
import { Layers, PanelRight, ClipboardList, ArrowUpRight, UserRound, Command } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import inventory from '../../data/designSystemInventory.json';

// Accueil plein écran de la plateforme DS - le point d'entrée de la team Plato
// (designers, product, devs). Remplace l'ancien « dump » de toutes les sections.
// Pas de rail : on entre dans le DS par les cartes, ou par ⌘K (n'importe où).
const CARDS = [
  { id: 'tokens',      icon: Layers,        title: 'Design Tokens',            desc: 'Couleurs, typo, espacements, radius, ombres, motion - source unique, theme-aware.', path: '/ui-kit/tokens' },
  { id: 'blocks',      icon: PanelRight,    title: 'Blocks',                   desc: 'Les gros assemblages : le shell, les pages de l\'app, les tables.', path: '/ui-kit/blocks' },
  { id: 'inventory',   icon: ClipboardList, title: 'Inventaire composants',    desc: 'Le catalogue par type d\'objet, avec aperçus, la fiche + playground de chaque composant.', path: '/ui-kit/inventory' },
];

export default function DSWelcome({ navigate }) {
  const comps = inventory.components || [];
  const used = comps.filter(c => c.used).length;
  const tokenGroups = inventory.tokens || {};
  const tokenCount = Object.keys(tokenGroups).reduce((n, g) => n + (Array.isArray(tokenGroups[g]) ? tokenGroups[g].length : 0), 0);

  const stats = [
    { n: used, label: 'composants en usage' },
    { n: comps.length, label: 'composants au catalogue' },
    { n: tokenCount, label: 'tokens' },
  ];

  return (
    <div
      className="h-screen w-full overflow-y-auto"
      style={{ background: colors.semantic.background, fontFamily: "'Inter', system-ui, sans-serif", color: colors.semantic.foreground }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '9vh 32px 64px' }}>
        {/* Marque + titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <img src="/logo-plato.svg" alt="" style={{ width: 34, height: 34 }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.brand.darker.DEFAULT, border: `1px solid ${colors.semantic.borderStrong}`, borderRadius: 6, padding: '3px 8px' }}>
            Design System
          </span>
        </div>
        <h1 style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: 46, fontWeight: 500, letterSpacing: '-1px', lineHeight: '48px', margin: 0 }}>
          Plato Design System
        </h1>
        <p style={{ fontSize: 16, color: colors.semantic.foregroundSecondary, lineHeight: '24px', margin: '14px 0 0', maxWidth: 620 }}>
          La plateforme du système - tokens, composants, fiches et sandboxes. Designers,
          product et devs travaillent d'ici ; le proto Plato s'ouvre depuis la nav ou
          la palette.
        </p>

        {/* ⌘K */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 10, background: colors.semantic.card, border: `1px solid ${colors.semantic.borderStrong}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}
          title="Ouvrir la palette de navigation"
        >
          <Command style={{ width: 16, height: 16, color: colors.semantic.foregroundTertiary }} />
          <span style={{ fontSize: 13.5, color: colors.semantic.foregroundSecondary }}>Aller n'importe où -</span>
          <kbd style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: colors.semantic.foreground, background: colors.semantic.backgroundSubtle, border: `1px solid ${colors.semantic.border}`, borderRadius: 5, padding: '2px 7px' }}>⌘K</kbd>
        </button>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 28, marginTop: 30, flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'RL Para Trial Central', Georgia, serif", fontSize: 30, fontWeight: 500, letterSpacing: '-0.5px', lineHeight: '32px' }}>{s.n}</div>
              <div style={{ fontSize: 12.5, color: colors.semantic.foregroundMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cartes d'entrée */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 34 }}>
          {CARDS.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className="group"
                style={{ textAlign: 'left', background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 14, padding: 18, cursor: 'pointer', transition: 'border-color 150ms ease, box-shadow 150ms ease', display: 'flex', flexDirection: 'column', gap: 10 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.semantic.borderStrong; e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(26,26,26,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.semantic.border; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: colors.semantic.backgroundSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.semantic.foregroundTertiary }}>
                    <Icon style={{ width: 18, height: 18 }} strokeWidth={1.75} />
                  </span>
                  <ArrowUpRight style={{ width: 16, height: 16, color: colors.semantic.foregroundMuted }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.semantic.foreground }}>{card.title}</div>
                <div style={{ fontSize: 12.5, color: colors.semantic.foregroundSecondary, lineHeight: '18px' }}>{card.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Accès proto */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/app')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: colors.semantic.foreground, color: colors.semantic.white, border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}
          >
            Ouvrir le proto Plato <ArrowUpRight style={{ width: 15, height: 15 }} />
          </button>
          <button
            onClick={() => navigate('/welcome')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: colors.semantic.foregroundSecondary, border: `1px solid ${colors.semantic.border}`, borderRadius: 9, padding: '10px 16px', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}
          >
            <UserRound style={{ width: 15, height: 15 }} /> Première connexion (onboarding)
          </button>
        </div>

        <p style={{ fontSize: 12, color: colors.semantic.foregroundMuted, marginTop: 34 }}>
          Règles agents : <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>AGENTS.md</code> ·
          handover : <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>HANDOVER.md</code> ·
          garde-fou : <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>npm run ds:doctor</code>
        </p>
      </div>
    </div>
  );
}
