import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileX2, Package, ArrowRight, Plus, X, SlidersHorizontal, List, LayoutGrid } from 'lucide-react';
import inventory from '../../data/designSystemInventory.json';
import { colors } from '../../design-system/tokens';
import InventoryRow from './InventoryRow';
import { getComponentDemo } from './componentDemos';

// L'organisation PRIMAIRE se choisit (« Grouper par ») : par type d'objet
// (primitive / composite / layout / nav / domaine), par usage, ou par couche.
// Les autres dimensions restent des filtres additionnels (« + Filtre ») que
// l'on empile à la demande. La couche s'affiche aussi en badge sur chaque carte.
const LAYER = {
  shadcn:            { label: 'Base shadcn', bg: colors.accents.stone.subtle,  fg: colors.accents.stone.text },
  'shadcn-extended': { label: 'Étendu',      bg: colors.feedback.info.subtle,  fg: colors.feedback.info.text },
  custom:            { label: 'Custom',      bg: colors.feedback.ai.subtle,    fg: colors.feedback.ai.text },
};

// Familles fonctionnelles : le rangement par défaut, aligné sur la nav de la
// sidebar. C'est le langage commun dev / PM / designer (« à quoi ça sert »),
// pas la couche technique. Ordre = du plus atomique au plus métier.
const FAMILY = {
  'Actions':               { desc: 'Boutons et déclencheurs - primaires, groupes, zones de dépôt.' },
  'Formulaires':           { desc: 'Champs de saisie et de sélection - texte, choix, dates.' },
  'Affichage de données':  { desc: 'Restitution - cartes, tables, badges, avatars, aperçus.' },
  'Retour & statut':       { desc: 'États système - alertes, progression, chargement, vides.' },
  'Overlays & menus':      { desc: 'Surfaces flottantes - modales, tiroirs, popovers, menus.' },
  'Navigation & shell':    { desc: 'Structure de l\'app - rails, barres, onglets, en-têtes.' },
  'Chat & assistant':      { desc: 'Conversation agent - bulles, composer, raisonnement.' },
  'Métier / droit':        { desc: 'Composants métier - JP, actes, bordereau, plans.' },
};
const FAMILY_ORDER = Object.keys(FAMILY);

// Maturité : le regard PM. Ordre = du plus abouti au reste à faire.
const MATURITY = {
  validated: { label: 'Validé',        desc: 'Vérifié contre Figma, prêt à consommer.' },
  pending:   { label: 'En cours',      desc: 'En code mais pas encore validé.' },
  missing:   { label: 'À construire',  desc: 'Pas encore de composant en code.' },
};
const MATURITY_ORDER = ['validated', 'pending', 'missing'];

// Dimensions filtrables additionnelles (au-delà du groupement primaire).
const DIMS = {
  usage:  { label: 'Usage',   options: [['used', 'En usage'], ['unused', 'Pas encore utilisé']] },
  layer:  { label: 'Couche',  options: [['shadcn', 'Base shadcn'], ['shadcn-extended', 'Étendu'], ['custom', 'Custom']] },
  family: { label: 'Famille', options: FAMILY_ORDER.map(f => [f, f]) },
  status: { label: 'Statut',  options: [['validated', 'Validé'], ['pending', 'En cours'], ['missing', 'À construire']] },
};

// Choix de groupement primaire, un axe par public : famille (designer),
// maturité (PM), couche (dev).
const GROUP_BY = [
  { id: 'family',  label: "Type d'objet" },
  { id: 'status',  label: 'Maturité' },
  { id: 'layer',   label: 'Couche' },
];

function LayerBadge({ layer }) {
  const l = LAYER[layer];
  if (!l) return null;
  return (
    <span style={{ fontSize: 10.5, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace", color: l.fg, backgroundColor: l.bg, borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>
      {l.label}
    </span>
  );
}

// UN SEUL tag d'état (pour ne pas surcharger) qui fusionne maturité + usage,
// chaque état une teinte distincte :
//   À construire (rouge, pas de code) · Pas utilisé (bleu, en code mais non branché)
//   · En cours (ambre) · Validé (vert).
const STATE = {
  missing:   { label: 'À construire', bg: colors.feedback.destructive.subtle, fg: colors.feedback.destructive.text },
  unused:    { label: 'Pas utilisé',  bg: colors.feedback.info.subtle,        fg: colors.feedback.info.text },
  pending:   { label: 'En cours',     bg: colors.feedback.warning.subtle,     fg: colors.feedback.warning.text },
  validated: { label: 'Validé',       bg: colors.feedback.success.subtle,     fg: colors.feedback.success.text },
};
function stateKey(c) {
  if (!c.exists) return 'missing';
  if (!c.used) return 'unused';
  return c.status === 'validated' ? 'validated' : 'pending';
}
function StateBadge({ c }) {
  const s = STATE[stateKey(c)];
  return (
    <span style={{ fontSize: 10.5, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: s.fg, backgroundColor: s.bg, borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// Aperçu vivant d'un composant depuis le registre de démos (valeurs par défaut),
// non interactif et clippé - juste pour reconnaître le composant d'un coup d'oeil.
function DemoPreview({ id }) {
  const demo = getComponentDemo(id);
  const values = useMemo(() => {
    if (!demo || !demo.controls) return {};
    return Object.fromEntries(Object.entries(demo.controls).map(([k, c]) => [k, c.default]));
  }, [demo]);
  if (!demo || demo.placeholder || typeof demo.render !== 'function') return null;
  return (
    <div style={{ pointerEvents: 'none', transform: 'scale(0.92)', transformOrigin: 'center' }}>
      {demo.render(values)}
    </div>
  );
}

// Carte de la vue grille : aperçu + nom + statut + pastilles usage/couche.
function InventoryCard({ c, navigate }) {
  const demo = getComponentDemo(c.id);
  const hasPreview = demo && !demo.placeholder && typeof demo.render === 'function';
  return (
    <button
      onClick={() => navigate(`/ui-kit/c/${c.id}`)}
      style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 150ms ease, box-shadow 150ms ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.semantic.borderStrong; e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(26,26,26,0.16)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.semantic.border; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Aperçu (clippé) - grand */}
      <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: colors.semantic.background, backgroundImage: `radial-gradient(${colors.semantic.border} 1px, transparent 1px)`, backgroundSize: '16px 16px', borderBottom: `1px solid ${colors.semantic.border}` }}>
        {hasPreview ? (
          <DemoPreview id={c.id} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: 12, background: c.exists ? colors.semantic.cream : colors.semantic.backgroundSubtle, border: c.exists ? `1px solid ${colors.semantic.border}` : `1px dashed ${colors.semantic.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.exists ? colors.semantic.foregroundTertiary : colors.semantic.foregroundMuted }}>
            {c.exists ? <Package style={{ width: 24, height: 24 }} strokeWidth={1.5} /> : <FileX2 style={{ width: 24, height: 24 }} strokeWidth={1.5} />}
          </div>
        )}
      </div>
      {/* Métadonnées */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: colors.semantic.foreground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.id}</span>
          <StateBadge c={c} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <LayerBadge layer={c.layer} />
        </div>
      </div>
    </button>
  );
}

export default function ComponentsInventorySection() {
  const navigate = useNavigate();
  const [groupBy, setGroupBy] = useState('family'); // 'family' | 'status' | 'layer'
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState([]); // [{ dim, value }]
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  const components = inventory.components;

  const hasFilter = (dim, value) => filters.some(f => f.dim === dim && f.value === value);
  const toggleFilter = (dim, value) => setFilters(prev => (
    prev.some(f => f.dim === dim && f.value === value)
      ? prev.filter(f => !(f.dim === dim && f.value === value))
      : [...prev, { dim, value }]
  ));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Filtres additionnels : AND entre dimensions, OR à l'intérieur d'une dimension.
    const byDim = {};
    filters.forEach(f => { (byDim[f.dim] = byDim[f.dim] || new Set()).add(f.value); });
    return components.filter(c => {
      for (const dim of Object.keys(byDim)) {
        const val = dim === 'usage' ? (c.used ? 'used' : 'unused') : c[dim];
        if (!byDim[dim].has(val)) return false;
      }
      if (q) {
        const haystack = `${c.id} ${c.filePath || ''} ${c.figmaPage || ''} ${c.notes || ''} ${c.family || ''} ${c.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [components, query, filters]);

  // Groupes selon « Grouper par » : type d'objet / famille (défaut, designer),
  // maturité / statut (PM), ou couche (dev).
  const sortRows = (arr) => [...arr].sort((a, b) => (a.sort || a.id).localeCompare(b.sort || b.id));
  const groups = useMemo(() => {
    if (groupBy === 'status') {
      return MATURITY_ORDER
        .map(s => ({ label: MATURITY[s].label, desc: MATURITY[s].desc, rows: sortRows(filtered.filter(c => c.status === s)) }))
        .filter(g => g.rows.length);
    }
    if (groupBy === 'layer') {
      return ['shadcn', 'shadcn-extended', 'custom']
        .map(l => ({ label: LAYER[l].label, rows: sortRows(filtered.filter(c => c.layer === l)) }))
        .filter(g => g.rows.length);
    }
    // Famille (défaut)
    return FAMILY_ORDER
      .map(f => ({ label: f, desc: FAMILY[f].desc, rows: sortRows(filtered.filter(c => c.family === f)) }))
      .filter(g => g.rows.length);
  }, [filtered, groupBy]);

  const renderRow = (c) => {
    const preview = c.exists ? (
      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.semantic.cream, border: `1px solid ${colors.semantic.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.semantic.foregroundTertiary }}>
        <Package style={{ width: 18, height: 18 }} strokeWidth={1.6} />
      </div>
    ) : (
      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.semantic.backgroundSubtle, border: `1px dashed ${colors.semantic.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.semantic.foregroundMuted }}>
        <FileX2 style={{ width: 18, height: 18 }} strokeWidth={1.6} />
      </div>
    );

    const meta = (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {c.filePath
          ? <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{c.filePath}</span>
          : <span style={{ fontStyle: 'italic' }}>Pas encore de composant code</span>}
        {c.figmaPage && <span style={{ fontSize: 11, color: colors.semantic.foregroundMuted }}>Figma : page « {c.figmaPage} »</span>}
      </span>
    );

    const goToDetail = () => navigate(`/ui-kit/c/${c.id}`);
    const actions = (
      <button onClick={goToDetail} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: colors.semantic.foreground, background: colors.semantic.cream, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }} title="Open component page">
        Open page <ArrowRight style={{ width: 14, height: 14 }} />
      </button>
    );

    return (
      <div key={c.id} onClick={goToDetail} style={{ cursor: 'pointer' }}>
        <InventoryRow
          preview={preview}
          name={<>{c.id} <StateBadge c={c} /> <LayerBadge layer={c.layer} /></>}
          meta={meta}
          status={null}
          figmaRef={c.figmaRef}
          notes={c.notes}
          actions={actions}
        />
      </div>
    );
  };

  const groupHeader = (label, n, desc) => (
    <div style={{ padding: '22px 0 10px 0' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label} <span style={{ opacity: 0.6 }}>· {n}</span>
      </div>
      {desc && <div style={{ fontSize: 12, color: colors.semantic.foregroundMuted, marginTop: 3 }}>{desc}</div>}
    </div>
  );

  const filterChip = (dim, value) => {
    const opt = DIMS[dim].options.find(o => o[0] === value);
    return (
      <span key={`${dim}:${value}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: colors.semantic.foreground, background: colors.semantic.backgroundSubtle, border: `1px solid ${colors.semantic.border}`, borderRadius: 6, padding: '3px 6px 3px 9px' }}>
        <span style={{ color: colors.semantic.foregroundMuted }}>{DIMS[dim].label} :</span> {opt ? opt[1] : value}
        <button onClick={() => toggleFilter(dim, value)} style={{ display: 'inline-flex', border: 'none', background: 'transparent', cursor: 'pointer', color: colors.semantic.foregroundMuted, padding: 0 }} title="Retirer">
          <X style={{ width: 13, height: 13 }} />
        </button>
      </span>
    );
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: colors.semantic.foregroundSecondary, lineHeight: '20px', margin: '0 0 14px 0', maxWidth: 800 }}>
        Rangé par <strong>famille fonctionnelle</strong> par défaut (à quoi ça sert), comme la nav.
        Change l'axe avec <strong>Grouper par</strong> - un regard par métier : famille (design),
        <strong> maturité</strong> (produit), couche (dev) - et empile des
        <strong> filtres</strong> (usage, couche, statut). Les gros assemblages (shell, pages, tables)
        vivent dans <strong>Blocks</strong>. Aller droit à un composant ou un token :
        <kbd style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, border: `1px solid ${colors.semantic.border}`, borderRadius: 4, padding: '1px 5px', marginLeft: 4 }}>⌘K</kbd>.
      </p>

      {/* Barre de contrôle : « Grouper par » (gauche) + recherche + vue (droite) */}
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
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filtrer dans l'inventaire…" style={{ width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${colors.semantic.border}`, borderRadius: 6, fontSize: 13, color: colors.semantic.foreground, outline: 'none' }} />
        </div>
        {/* Bascule vue grille / liste */}
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

      {/* Filtres additionnels : chips actifs + « + Filtre » */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4, position: 'relative' }}>
        {filters.map(f => filterChip(f.dim, f.value))}
        <button
          onClick={() => setAddOpen(o => !o)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundSecondary, background: 'transparent', border: `1px dashed ${colors.semantic.borderStrong}`, borderRadius: 6, padding: '4px 9px', cursor: 'pointer' }}
        >
          <Plus style={{ width: 13, height: 13 }} /> Filtre
        </button>
        {filters.length > 0 && (
          <button onClick={() => setFilters([])} style={{ fontSize: 12, color: colors.semantic.foregroundMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}>Tout effacer</button>
        )}

        {addOpen && (
          <>
            <div onClick={() => setAddOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 21, width: 320, background: colors.semantic.card, border: `1px solid ${colors.semantic.borderStrong}`, borderRadius: 10, boxShadow: '0 12px 32px -12px rgba(26,26,26,0.28)', padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.semantic.foregroundMuted, padding: '2px 4px 8px' }}>
                <SlidersHorizontal style={{ width: 12, height: 12 }} /> Ajouter des filtres
              </div>
              {Object.entries(DIMS).map(([dim, cfg]) => (
                <div key={dim} style={{ padding: '6px 4px' }}>
                  <div style={{ fontSize: 11.5, color: colors.semantic.foregroundSecondary, marginBottom: 5 }}>{cfg.label}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {cfg.options.map(([value, label]) => {
                      const on = hasFilter(dim, value);
                      return (
                        <button key={value} onClick={() => toggleFilter(dim, value)} style={{ fontSize: 12, fontWeight: 500, color: on ? colors.semantic.foreground : colors.semantic.foregroundSecondary, background: on ? colors.semantic.cream : colors.semantic.backgroundSubtle, border: `1px solid ${on ? colors.semantic.borderStrong : colors.semantic.border}`, borderRadius: 6, padding: '4px 9px', cursor: 'pointer' }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${colors.semantic.border}`, marginTop: 12 }}>
        {groups.map((g, i) => (
          <div key={g.label || i}>
            {g.label && groupHeader(g.label, g.rows.length, g.desc)}
            {view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))', gap: 18, padding: `${g.label ? 4 : 12}px 0 4px` }}>
                {g.rows.map(c => <InventoryCard key={c.id} c={c} navigate={navigate} />)}
              </div>
            ) : (
              g.rows.map(renderRow)
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: colors.semantic.foregroundSecondary, fontSize: 13 }}>
            Aucun composant ne correspond à ces filtres.
          </div>
        )}
      </div>
    </div>
  );
}
