import React from 'react';
import { Landmark, Search } from 'lucide-react';
import { getDecisionsByIds, getPrimaryAmount } from '../../data/mockDecisions';
import JPListing from './JPListing';
import EmptyState from '../EmptyState';
import { colors } from '../../design-system/tokens';

// Section wrapper for PosteDetailView. Renders:
//   - Section header  : "Jurisprudences retenues" + count + search CTA
//   - Empty state     : icon + message + "Rechercher une JP" button
//   - Cards           : stack of the canonical JPListing card (Figma « JP
//                       Cards » 2219:19197) - migré depuis JPRow asCard le
//                       23/09 (SIGNALEMENTS §9). Le mapping Decision → props
//                       de carte vit ici ; JPRow reste la rangée dense de la
//                       mini-table du chat (JPListingChat).
//
// Props:
//   - pinnedJP[]         : [{ decisionId, posteIds[] }] — used to derive decisions
//   - decisionsOverride[]: skip the lookup and pass decisions directly
//   - selectedDecisionId : id whose card renders in the selected state
//   - currentPosteId     : pick the amount matching this poste
//   - getFavorited(id)   : (decisionId) => bool — bookmark d'en-tête
//   - getBookmarked(id)  : (decisionId) => bool — bookmark d'en-tête
//   - getRationale(id)   : (decisionId) => string|null — bloc « Apport »
//   - getPosteChips(id)  : (decisionId) => string[]|null — badges de pied
//                          (vue cross-poste) ; la carte passe alors en variant
//                          `tab` (pied toujours visible) et masque le quantum
//   - onOpenDrawer(id, ids[]) : open the drawer with the result set
//   - onSearchJP()       : invoked from the header search link
//   - onEmptySearchJP()  : invoked from the empty state CTA (falls back to onSearchJP)
//   - sectionTitle       : optional override (default "Jurisprudences retenues")
//   - emptyMessage       : optional empty-state message override
//   - showHeader         : when false, drops the section header (parent owns it)

// dd/mm/yyyy depuis l'ISO des mocks.
const formatDateShort = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const isDeceased = (s) => s === 'Décédé' || s === 'Décédée';

// Decision (mockDecisions) → props de la carte JPListing.
function decisionToCardProps(d, { currentPosteId, chips }) {
  const amount = currentPosteId
    ? d.amounts?.find(a => a.poste.toLowerCase() === String(currentPosteId).toLowerCase()) || getPrimaryAmount(d)
    : getPrimaryAmount(d);
  const tags = [];
  if (d.category) tags.push({ label: d.category });
  if (d.status) tags.push({ label: d.status, tone: isDeceased(d.status) ? 'destructive' : undefined });
  return {
    jurisdiction: d.chambre ? `${d.jurisdiction} · ${d.chambre}` : d.jurisdiction,
    date: formatDateShort(d.date),
    numero: `n°${d.numero}`,
    profile: d.victimProfile || '',
    tags,
    quantum: !chips && amount ? { poste: amount.poste, value: amount.displayValue } : null,
    posteChips: chips || [],
  };
}

export default function JPListingPosteDetail({
  pinnedJP = [],
  decisionsOverride = null,
  selectedDecisionId = null,
  currentPosteId = null,
  getFavorited,
  getBookmarked,
  getRationale,
  getPosteChips,
  onOpenDrawer,
  onRemove,
  removeTitle,
  onSearchJP,
  onEmptySearchJP,
  sectionTitle = 'Jurisprudences retenues',
  emptyMessage = 'Aucune jurisprudence retenue',
  showHeader = true,
}) {
  const decisionIds = pinnedJP.map(p => p.decisionId);
  const decisions = decisionsOverride || getDecisionsByIds(decisionIds);

  const headerLabel = (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.mutedForeground, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {sectionTitle}
    </span>
  );

  if (decisions.length === 0) {
    const emptyAction = onEmptySearchJP || onSearchJP;
    return (
      <div>
        {showHeader && <div style={{ marginBottom: 10 }}>{headerLabel}</div>}
        <div className="flex items-center justify-center" style={{ padding: '24px 0' }}>
          <EmptyState
            icon={Landmark}
            title={emptyMessage}
            description="L'agent privilégie vos JP de référence du cabinet, puis cherche dans Plato JP en fonction du contexte du dossier."
            primaryAction={emptyAction ? { label: 'Rechercher une JP', icon: Search, onClick: emptyAction } : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {headerLabel}
            <span className="text-[11px] text-border-strong">{decisions.length}</span>
          </div>
          {onSearchJP && (
            <button
              onClick={onSearchJP}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                height: 24, padding: '0 8px', borderRadius: 6,
                backgroundColor: 'transparent', color: colors.semantic.mutedForeground,
                border: 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12, fontWeight: 500, lineHeight: '16px',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = colors.semantic.muted; e.currentTarget.style.color = colors.semantic.foreground; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.semantic.mutedForeground; }}
            >
              <Search className="w-3 h-3" strokeWidth={2} />
              Rechercher
            </button>
          )}
        </div>
      )}
      {/* Floating cards — 2-column grid keeps the date/tags compact near the title. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2" style={{ maxWidth: 960 }}>
        {decisions.map((d) => {
          const chips = getPosteChips ? getPosteChips(d.id) : null;
          const card = decisionToCardProps(d, { currentPosteId, chips });
          return (
            <JPListing
              key={d.id}
              variant={chips ? 'tab' : 'detail'}
              {...card}
              note={getRationale ? getRationale(d.id) : null}
              saved={!!((getFavorited && getFavorited(d.id)) || (getBookmarked && getBookmarked(d.id)))}
              selected={d.id === selectedDecisionId}
              onClick={() => onOpenDrawer?.(d.id, decisionIds)}
              onRemove={onRemove ? () => onRemove(d.id) : undefined}
              removeTitle={removeTitle}
            />
          );
        })}
      </div>
    </div>
  );
}
