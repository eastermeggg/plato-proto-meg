import React from 'react';
import { MessageCircle, Folder, FolderOpen, CornerDownRight, Link2, Hash, ChevronRight } from 'lucide-react';

// ── Dossier flag - exploration de variantes ──────────────────────────────
// Le « flag dossier » = le marqueur qui, dans une ligne « Conv. récentes »,
// indique à QUEL dossier une conversation est rattachée (vs un fil libre).
// Ce lab décline plein de traitements du même signal, en contexte (une petite
// liste de conversations mêlant fils rattachés et fils libres) pour comparer.
// Rien n'est câblé : échantillon visuel uniquement.

const INK = '#292524';
const INK_SOFT = '#57534e';
const INK_TERT = '#78716c';
const INK_MUTED = '#a8a29e';
const HAIR = '#dfdcd9';
const HAIR_STRONG = '#cbc7c4';
const CREAM = '#eeece6';
const CANVAS = '#f8f7f5';
const BRAND = '#f47a2c';
const BRAND_DEEP = '#b8560f';
const MONO = "'IBM Plex Mono', monospace";

// Jeu d'essai : quatre conversations, deux rattachées, deux libres.
const SAMPLE = [
  { id: 1, title: 'Prescription - assignation Renault', dossier: 'Nguyen / Allianz' },
  { id: 2, title: 'Nouvelle conversation', dossier: null },
  { id: 3, title: 'Barème Mornet - DFP', dossier: 'Lefèvre / MAIF' },
  { id: 4, title: 'Notification - mise à jour des politiques', dossier: 'Martel / AXA' },
];

// Coquille d'une ligne : icône de tête + titre (tronqué) + slot flag optionnel.
function Row({ children, leading = null }) {
  return (
    <div
      style={{
        height: 32, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 6px 0 8px', borderRadius: 6, cursor: 'default',
      }}
    >
      {leading ?? <MessageCircle size={16} color={INK_MUTED} strokeWidth={1.75} style={{ flexShrink: 0 }} />}
      {children}
    </div>
  );
}

const titleStyle = (dimmed = false) => ({
  flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
  whiteSpace: 'nowrap', fontSize: 14, color: dimmed ? INK_TERT : INK,
});

// ── Les variantes de flag ─────────────────────────────────────────────────
// Chacune reçoit `ref` (nom du dossier) ; retourne le contenu de la ligne
// (titre + flag) OU null pour le titre par défaut. Les fils libres (ref null)
// n'affichent jamais de flag.

const VARIANTS = [
  {
    key: 'chip-cream',
    name: 'Puce crème (actuel)',
    note: 'Folder + réf sur fond crème, à droite du titre.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, maxWidth: 96, padding: '2px 6px 2px 6px', borderRadius: 4, background: 'rgba(238,236,230,0.7)' }}>
            <Folder size={12} color={INK_TERT} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <span style={{ ...ellipsis, fontSize: 11, color: INK_TERT }}>{ref}</span>
          </span>
        )}
      </>
    ),
  },
  {
    key: 'chip-outline',
    name: 'Puce contour',
    note: 'Bord fin, pas d\'aplat - plus léger.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, maxWidth: 96, padding: '1px 6px', borderRadius: 4, border: `1px solid ${HAIR_STRONG}` }}>
            <Folder size={11} color={INK_TERT} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <span style={{ ...ellipsis, fontSize: 11, color: INK_TERT }}>{ref}</span>
          </span>
        )}
      </>
    ),
  },
  {
    key: 'icon-only',
    name: 'Icône seule',
    note: 'Juste un dossier à droite, réf en tooltip. Ultra discret.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span title={ref} style={{ display: 'flex', flexShrink: 0 }}>
            <Folder size={13} color={INK_MUTED} strokeWidth={1.75} />
          </span>
        )}
      </>
    ),
  },
  {
    key: 'text-muted',
    name: 'Texte estompé',
    note: 'Réf en gris clair, sans icône ni fond.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span style={{ ...ellipsis, flexShrink: 0, maxWidth: 96, fontSize: 11.5, color: INK_MUTED }}>{ref}</span>
        )}
      </>
    ),
  },
  {
    key: 'slash',
    name: 'Réf. après slash',
    note: 'Titre / dossier, façon fil d\'Ariane inline.',
    render: (ref) => (
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, color: INK }}>
        {title(ref)}
        {ref && <span style={{ color: INK_MUTED }}>{'  ·  '}{ref}</span>}
      </span>
    ),
  },
  {
    key: 'leading-folder',
    name: 'Icône de tête = dossier',
    note: 'Le fil rattaché prend une icône dossier au lieu de la bulle.',
    render: (ref) => (
      <span style={titleStyle()}>{title(ref)}</span>
    ),
    leading: (ref) => ref
      ? <FolderOpen size={16} color={INK_TERT} strokeWidth={1.75} style={{ flexShrink: 0 }} />
      : <MessageCircle size={16} color={INK_MUTED} strokeWidth={1.75} style={{ flexShrink: 0 }} />,
  },
  {
    key: 'accent-bar',
    name: 'Liseré dossier',
    note: 'Barre verticale à gauche des fils rattachés + réf estompée.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span style={{ ...ellipsis, flexShrink: 0, maxWidth: 96, fontSize: 11, color: INK_TERT }}>{ref}</span>
        )}
      </>
    ),
    rowStyle: (ref) => ref ? { boxShadow: `inset 2px 0 0 0 ${HAIR_STRONG}` } : null,
  },
  {
    key: 'brand-chip',
    name: 'Puce accent brand',
    note: 'Teinte orange discrète - le rattachement est « la » notion Plato.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, maxWidth: 96, padding: '2px 6px', borderRadius: 4, background: 'rgba(244,122,44,0.10)' }}>
            <Folder size={11} color={BRAND_DEEP} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ ...ellipsis, fontSize: 11, fontWeight: 500, color: BRAND_DEEP }}>{ref}</span>
          </span>
        )}
      </>
    ),
  },
  {
    key: 'link-glyph',
    name: 'Glyphe lien',
    note: 'Maillon (rattaché) + réf - insiste sur le « lien » plutôt que le contenant.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, maxWidth: 96 }}>
            <Link2 size={12} color={INK_MUTED} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <span style={{ ...ellipsis, fontSize: 11, color: INK_TERT }}>{ref}</span>
          </span>
        )}
      </>
    ),
  },
  {
    key: 'mono-tag',
    name: 'Tag mono #',
    note: 'Style « tag » monospace, comme un label technique.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, maxWidth: 100, padding: '1px 5px', borderRadius: 3, background: CANVAS, border: `1px solid ${HAIR}` }}>
            <Hash size={10} color={INK_MUTED} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ ...ellipsis, fontFamily: MONO, fontSize: 10.5, color: INK_TERT }}>{ref}</span>
          </span>
        )}
      </>
    ),
  },
  {
    key: 'two-line',
    name: 'Sur deux lignes',
    note: 'Réf en sous-titre - lisible mais double la hauteur.',
    render: (ref) => (
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ ...ellipsis, fontSize: 14, color: INK, lineHeight: '17px' }}>{title(ref)}</span>
        {ref && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}>
            <CornerDownRight size={10} color={INK_MUTED} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <span style={{ ...ellipsis, fontSize: 11, color: INK_MUTED, lineHeight: '14px' }}>{ref}</span>
          </span>
        )}
      </span>
    ),
    tall: true,
  },
  {
    key: 'dot',
    name: 'Pastille + réf',
    note: 'Petite pastille dossier avant la réf, sans contenant.',
    render: (ref) => (
      <>
        <span style={titleStyle()}>{title(ref)}</span>
        {ref && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, maxWidth: 100 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: BRAND, flexShrink: 0 }} />
            <span style={{ ...ellipsis, fontSize: 11.5, color: INK_TERT }}>{ref}</span>
          </span>
        )}
      </>
    ),
  },
];

const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 };
function title(ref) {
  // Titre légèrement raccourci quand un flag l'accompagne (place pour la puce).
  return ref ? 'Prescription - assignation' : 'Nouvelle conversation';
}

function VariantCard({ variant }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{variant.name}</div>
        <div style={{ fontSize: 12, color: INK_TERT, marginTop: 2, lineHeight: '16px' }}>{variant.note}</div>
      </div>
      {/* Mini-rail : largeur nav (~264px), fond canvas. */}
      <div style={{ width: 264, background: CANVAS, border: `1px solid ${HAIR}`, borderRadius: 10, padding: 8 }}>
        {/* En-tête de section mono, comme le vrai rail. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px 8px' }}>
          <span style={{ width: 4, height: 4, borderRadius: 999, background: BRAND, opacity: 0.6 }} />
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, color: INK_TERT, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.7 }}>
            Conv. récentes
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SAMPLE.map(c => {
            const rowExtra = variant.rowStyle ? variant.rowStyle(c.dossier) : null;
            const lead = variant.leading ? variant.leading(c.dossier) : null;
            return (
              <div
                key={c.id}
                style={{
                  height: variant.tall ? 42 : 32, display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0 6px 0 8px', borderRadius: 6, ...(rowExtra || {}),
                }}
              >
                {lead ?? <MessageCircle size={16} color={INK_MUTED} strokeWidth={1.75} style={{ flexShrink: 0 }} />}
                {variant.render(c.dossier)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DossierFlagLab() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 80px' }}>
        <div style={{ marginBottom: 8, fontFamily: MONO, fontSize: 11, fontWeight: 500, color: BRAND_DEEP, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          UI Kit - exploration
        </div>
        <h1 style={{ fontFamily: "'RL Para Trial Central', Georgia, serif", fontSize: 30, fontWeight: 500, letterSpacing: '-0.4px', margin: 0 }}>
          Flag « appartient à un dossier »
        </h1>
        <p style={{ fontSize: 14, color: INK_SOFT, marginTop: 10, maxWidth: 680, lineHeight: '21px' }}>
          Le marqueur qui distingue, dans « Conv. récentes », un fil rattaché à un dossier d'un fil libre.
          Chaque carte montre le même jeu de conversations (deux rattachées, deux libres) avec un traitement
          différent. Objectif : trouver le plus lisible sans alourdir la ligne. Aucune n'est câblée.
        </p>

        <div style={{ height: 1, background: HAIR, margin: '28px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px 28px' }}>
          {VARIANTS.map(v => <VariantCard key={v.key} variant={v} />)}
        </div>
      </div>
    </div>
  );
}
