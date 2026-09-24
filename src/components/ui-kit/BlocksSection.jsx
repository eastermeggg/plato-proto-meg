import React, { useMemo, useState } from 'react';
import { Search, ArrowRight, List, LayoutGrid, PanelRight, Table2 } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import { BLOCKS, BlockThumb } from './blocks';

// Section « Blocks » : un VRAI playground, comme l'inventaire des composants.
// Un block = une composition de page/section faite à partir des composants.
// Recherche + « Grouper par » + bascule grille/liste ; on CLIQUE une carte pour
// ENTRER dans le block (/ui-kit/b/<id>) où il se joue via ses controls.

// Familles = le rangement par défaut (à quoi ça sert).
const FAMILY = {
  'Shell & pages': { desc: "Les pages de l'app - même rail + mêmes barres. Jouables (page, état, collapse, peek)." },
  'Tables':        { desc: 'Système de tables custom (cellules typées + rangées métier). Décision : docs/table-system.md.' },
};
const FAMILY_ORDER = Object.keys(FAMILY);

// Maturité : le regard PM.
const MATURITY = {
  validated: { label: 'Validé',       desc: 'Vérifié contre Figma, prêt à consommer.' },
  pending:   { label: 'En cours',     desc: 'En code mais pas encore validé.' },
  missing:   { label: 'À construire', desc: 'Pas encore d\'assemblage en code.' },
};
const MATURITY_ORDER = ['validated', 'pending', 'missing'];

const GROUP_BY = [
  { id: 'family', label: "Type d'objet" },
  { id: 'status', label: 'Maturité' },
];

// Statut : chaque état une teinte DISTINCTE (aligné sur l'inventaire composant).
const STATUS = {
  validated: { label: 'Validé',       bg: colors.feedback.success.subtle,     fg: colors.feedback.success.text },
  pending:   { label: 'En cours',     bg: colors.feedback.warning.subtle,     fg: colors.feedback.warning.text },
  missing:   { label: 'À construire', bg: colors.feedback.destructive.subtle, fg: colors.feedback.destructive.text },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{ fontSize: 10.5, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: s.fg, backgroundColor: s.bg, borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// Carte de la vue grille : vignette + nom + statut + famille.
function BlockCard({ block, navigate }) {
  return (
    <button
      onClick={() => navigate(`/ui-kit/b/${block.id}`)}
      style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 150ms ease, box-shadow 150ms ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.semantic.borderStrong; e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(26,26,26,0.16)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.semantic.border; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Vignette (aperçu clippé) */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: block.kind === 'table' ? 16 : 0, background: colors.semantic.background, backgroundImage: `radial-gradient(${colors.semantic.border} 1px, transparent 1px)`, backgroundSize: '16px 16px', borderBottom: `1px solid ${colors.semantic.border}` }}>
        <BlockThumb block={block} />
      </div>
      {/* Métadonnées */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: colors.semantic.foreground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.title}</span>
          <StatusBadge status={block.status} />
        </div>
        <span style={{ fontSize: 12, color: colors.semantic.foregroundSecondary, lineHeight: '17px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {block.description}
        </span>
      </div>
    </button>
  );
}

// Ligne de la vue liste.
function BlockRow({ block, navigate }) {
  const Icon = block.kind === 'table' ? Table2 : PanelRight;
  return (
    <div
      onClick={() => navigate(`/ui-kit/b/${block.id}`)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 4px', borderBottom: `1px solid ${colors.semantic.border}`, cursor: 'pointer' }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.semantic.cream, border: `1px solid ${colors.semantic.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.semantic.foregroundTertiary, flexShrink: 0 }}>
        <Icon style={{ width: 18, height: 18 }} strokeWidth={1.6} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.semantic.foreground }}>{block.title}</span>
          <StatusBadge status={block.status} />
        </div>
        <div style={{ fontSize: 12, color: colors.semantic.foregroundSecondary, marginTop: 2 }}>
          {block.filePath
            ? <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{block.filePath}</span>
            : <span style={{ fontStyle: 'italic' }}>Pas encore d'assemblage en code</span>}
        </div>
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: colors.semantic.foreground, background: colors.semantic.cream, padding: '6px 12px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
        Ouvrir <ArrowRight style={{ width: 14, height: 14 }} />
      </span>
    </div>
  );
}

function groupHeader(label, n, desc) {
  return (
    <div style={{ padding: '22px 0 10px 0' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label} <span style={{ opacity: 0.6 }}>· {n}</span>
      </div>
      {desc && <div style={{ fontSize: 12, color: colors.semantic.foregroundMuted, marginTop: 3 }}>{desc}</div>}
    </div>
  );
}

export default function BlocksSection({ navigate }) {
  const [groupBy, setGroupBy] = useState('family'); // 'family' | 'status'
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCKS;
    return BLOCKS.filter(b => {
      const haystack = `${b.title} ${b.id} ${b.family} ${b.filePath || ''} ${b.description || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const groups = useMemo(() => {
    if (groupBy === 'status') {
      return MATURITY_ORDER
        .map(s => ({ label: MATURITY[s].label, desc: MATURITY[s].desc, rows: filtered.filter(b => b.status === s) }))
        .filter(g => g.rows.length);
    }
    return FAMILY_ORDER
      .map(f => ({ label: f, desc: FAMILY[f].desc, rows: filtered.filter(b => b.family === f) }))
      .filter(g => g.rows.length);
  }, [filtered, groupBy]);

  return (
    <div>
      <p style={{ fontSize: 13, color: colors.semantic.foregroundSecondary, lineHeight: '20px', margin: '0 0 14px 0', maxWidth: 800 }}>
        Un <strong>block</strong> est une composition de page ou de section, assemblée à partir des composants
        du DS - le cran au-dessus de l'inventaire (composants atomiques). Clique une carte pour <strong>entrer</strong> :
        la fiche a la même anatomie qu'un composant (canvas + rail <strong>Controls</strong> à droite). Les shells sont
        jouables (page, état, collapse, peek).
      </p>

      {/* Barre de contrôle : « Grouper par » + recherche + bascule vue */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: colors.semantic.foregroundMuted }}>Grouper par</span>
        <div style={{ display: 'inline-flex', background: colors.semantic.backgroundSubtle, border: `1px solid ${colors.semantic.border}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {GROUP_BY.map(t => {
            const active = groupBy === t.id;
            return (
              <button key={t.id} onClick={() => setGroupBy(t.id)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 500, color: active ? colors.semantic.foreground : colors.semantic.foregroundSecondary, background: active ? colors.semantic.card : 'transparent', border: active ? `1px solid ${colors.semantic.border}` : '1px solid transparent', boxShadow: active ? '0 1px 1px rgba(26,26,26,0.04)' : 'none', cursor: 'pointer' }}>
                {t.label}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 360, marginLeft: 'auto' }}>
          <Search style={{ position: 'absolute', left: 10, top: 9, width: 14, height: 14, color: colors.semantic.foregroundMuted }} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filtrer les blocks…" style={{ width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${colors.semantic.border}`, borderRadius: 6, fontSize: 13, color: colors.semantic.foreground, outline: 'none' }} />
        </div>
        <div style={{ display: 'inline-flex', background: colors.semantic.backgroundSubtle, border: `1px solid ${colors.semantic.border}`, borderRadius: 8, padding: 3, gap: 2 }}>
          {[{ id: 'grid', Icon: LayoutGrid, title: 'Grille' }, { id: 'list', Icon: List, title: 'Liste' }].map(({ id, Icon, title }) => {
            const active = view === id;
            return (
              <button key={id} onClick={() => setView(id)} title={title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 28, borderRadius: 6, color: active ? colors.semantic.foreground : colors.semantic.foregroundMuted, background: active ? colors.semantic.card : 'transparent', border: active ? `1px solid ${colors.semantic.border}` : '1px solid transparent', cursor: 'pointer' }}>
                <Icon style={{ width: 15, height: 15 }} strokeWidth={1.75} />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${colors.semantic.border}`, marginTop: 12 }}>
        {groups.map((g, i) => (
          <div key={g.label || i}>
            {groupHeader(g.label, g.rows.length, g.desc)}
            {view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18, padding: '4px 0 4px' }}>
                {g.rows.map(b => <BlockCard key={b.id} block={b} navigate={navigate} />)}
              </div>
            ) : (
              g.rows.map(b => <BlockRow key={b.id} block={b} navigate={navigate} />)
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: colors.semantic.foregroundSecondary, fontSize: 13 }}>
            Aucun block ne correspond à cette recherche.
          </div>
        )}
      </div>
    </div>
  );
}
