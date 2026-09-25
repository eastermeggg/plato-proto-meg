import React from 'react';
import { Package, Layers, ClipboardList, PanelRight, ArrowUpRight, ArrowRight } from 'lucide-react';
import { colors } from '../../design-system/tokens';

// Section /ui-kit/ui-product - présente le package @plato/ui-product : la source
// de vérité du DS (tokens + composants canoniques), sa frontière à sens unique,
// et l'accès aux surfaces existantes (tokens / composants / blocks).
const LINKS = [
  { id: 'tokens', icon: Layers, title: 'Design Tokens', desc: 'Couleurs, typo, espacements, radius, ombres, motion - theme-aware.', path: '/ui-kit/tokens' },
  { id: 'inventory', icon: ClipboardList, title: 'Composants', desc: 'Le catalogue canonique, fiches + playground de chaque composant.', path: '/ui-kit/inventory' },
  { id: 'blocks', icon: PanelRight, title: 'Blocks', desc: 'Les gros assemblages : shell, pages de l\'app, tables.', path: '/ui-kit/blocks' },
];

const SURFACE = [
  'colors, shadows, typography (tokens, theme-aware)',
  'Button, PageHeader, AppSidebar',
  'AssistantComposer, SuggestionPill, ConversationsIndexPage',
];

export default function UIProductSection({ navigate }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: colors.semantic.foreground, maxWidth: 920 }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.brand.darker.DEFAULT }}>
        @plato/ui-product
      </span>
      <p style={{ fontSize: 15, color: colors.semantic.foregroundSecondary, lineHeight: '22px', margin: '10px 0 0', maxWidth: 640 }}>
        Le <strong style={{ color: colors.semantic.foreground }}>design system produit</strong> : la source de vérité (tokens + composants
        canoniques) que consomment l'app et l'extension marketing. Aujourd'hui package <em>logique</em> -
        le split physique s'activera quand le DS sera clean (ds:doctor 0, inventaire stable).
      </p>

      {/* Frontière */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 20, padding: '14px 16px', borderRadius: 12, background: colors.semantic.backgroundSubtle, border: `1px solid ${colors.semantic.border}` }}>
        <Package style={{ width: 18, height: 18, color: colors.semantic.foregroundTertiary, flexShrink: 0, marginTop: 1 }} strokeWidth={1.75} />
        <p style={{ fontSize: 13, lineHeight: '20px', color: colors.semantic.foregroundSecondary, margin: 0 }}>
          <strong style={{ color: colors.semantic.foreground }}>Dépendance à sens unique.</strong> ui-product ne dépend d'aucune
          extension et n'importe jamais ui-marketing (gardé par ds-check-boundaries). Ce qu'une extension
          invente et qui mérite le DS remonte via <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>ds-promote</code>.
        </p>
      </div>

      {/* Surface publique */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.semantic.foreground, margin: '28px 0 10px' }}>Surface publique (échantillon)</h3>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {SURFACE.map((s) => (
          <li key={s} style={{ fontSize: 13, color: colors.semantic.foregroundSecondary, lineHeight: '20px' }}>{s}</li>
        ))}
      </ul>

      {/* Entrées vers les surfaces existantes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 28 }}>
        {LINKS.map((card) => {
          const Icon = card.icon;
          return (
            <button /* ds-raw-ok: carte de navigation custom (icone + titre + desc), meme pattern que DSWelcome */
              key={card.id}
              onClick={() => navigate(card.path)}
              style={{ textAlign: 'left', background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 14, padding: 18, cursor: 'pointer', transition: 'border-color 150ms ease, box-shadow 150ms ease', display: 'flex', flexDirection: 'column', gap: 10 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.semantic.borderStrong; e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(26,26,26,0.16)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.semantic.border; e.currentTarget.style.boxShadow = 'none'; }}
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

      <button /* ds-raw-ok: lien de navigation inline entre sections ; cible Button variant link */
        onClick={() => navigate('/ui-kit/ui-marketing')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 26, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: colors.brand.darker.DEFAULT }}
      >
        Voir l'extension UI Marketing <ArrowRight style={{ width: 15, height: 15 }} strokeWidth={2} />
      </button>
    </div>
  );
}
