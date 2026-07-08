import React, { useState, useMemo } from 'react';
import {
  Search, X, ChevronDown, ChevronRight, SlidersHorizontal, Landmark,
  Bookmark, BookmarkCheck,
} from 'lucide-react';
import DECISIONS, { getPrimaryAmount, formatDateLong } from '../../data/mockDecisions';
import SaveDestinationPopover from './SaveDestinationPopover';

const ALL_JURISDICTIONS = [...new Set(DECISIONS.map(d => d.jurisdiction))].sort();
const ALL_POSTES = [...new Set(DECISIONS.flatMap(d => d.amounts.map(a => a.poste)))].sort();
// Build poste->label lookup from actual data
const POSTE_LABEL_MAP = {};
DECISIONS.forEach(d => d.amounts.forEach(a => { if (!POSTE_LABEL_MAP[a.poste]) POSTE_LABEL_MAP[a.poste] = a.label; }));

// ─── Subcomponents (defined before use) ──────────────────────────────

function FilterSection({ title, children, searchable = false }) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');
  const filtered = searchable && search
    ? React.Children.toArray(children).filter(child => {
        const lbl = typeof child.props?.label === 'string' ? child.props.label : '';
        const ttl = child.props?.title || '';
        return (lbl + ' ' + ttl).toLowerCase().includes(search.toLowerCase());
      })
    : children;
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 w-full text-left mb-1.5">
        {open ? <ChevronDown className="w-3 h-3 text-[#a8a29e]" /> : <ChevronRight className="w-3 h-3 text-[#a8a29e]" />}
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
      </button>
      {open && (
        <div>
          {searchable && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-2 py-1 mb-1.5 rounded-md border border-[#e7e5e3] bg-white text-[12px] text-[#292524] focus:outline-none focus:border-[#b9a07a]"
            />
          )}
          <div className="space-y-1">{filtered}</div>
        </div>
      )}
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange, title }) {
  return (
    <label onClick={onChange} className="flex items-center gap-2 py-1 cursor-pointer group" title={title}>
      <div
        className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
        style={{
          borderColor: checked ? '#b9703f' : '#d6d3d1',
          backgroundColor: checked ? '#b9703f' : 'white',
        }}
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </div>
      <span className="text-[12px] text-[#44403c] group-hover:text-[#292524] transition-colors leading-tight">{label}</span>
    </label>
  );
}

function JPSearchResultCard({ decision: d, isPinned, assignedPosteIds = [], isSelected, onOpen, onTogglePoste, posteOptions }) {
  const [showSavePopover, setShowSavePopover] = useState(false);
  return (
    <div
      onClick={onOpen}
      className="group bg-white rounded cursor-pointer"
      style={{
        boxShadow: isSelected
          ? '0 0 0 1px #b9703f, 0 2px 8px rgba(185,112,63,0.1)'
          : '0 1px 2px rgba(41,37,36,0.06), 0 1px 3px rgba(41,37,36,0.04)',
        transition: 'box-shadow 0.15s ease',
      }}
      onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = '0 2px 8px rgba(41,37,36,0.08), 0 1px 3px rgba(41,37,36,0.04)'; }}
      onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = '0 1px 2px rgba(41,37,36,0.06), 0 1px 3px rgba(41,37,36,0.04)'; }}
    >
      {/* Header: jurisdiction + save */}
      <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#a8a29e', textTransform: 'uppercase' }}>
            {d.numero}
          </span>
          <Landmark className="w-3 h-3 text-[#b9703f] flex-shrink-0" />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#b9703f', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {d.jurisdiction}{d.chambre ? ` · ${d.chambre}` : ''}
          </span>
        </div>
        <div className="relative flex-shrink-0">
          <div className="flex items-center gap-1">
            {isPinned && assignedPosteIds.length > 0 && (
              <div className="flex items-center gap-1">
                {assignedPosteIds.slice(0, 3).map(pid => (
                  <span key={pid} title={POSTE_LABEL_MAP[pid] || pid}
                    className="badge badge-sm badge-secondary">
                    {pid.toUpperCase()}
                  </span>
                ))}
                {assignedPosteIds.length > 3 && (
                  <span className="text-[12px] text-[#a8a29e]">+{assignedPosteIds.length - 3}</span>
                )}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowSavePopover(!showSavePopover); }}
              className="p-1.5 -mr-1 rounded-md transition-colors hover:bg-[#eeece6] flex-shrink-0"
              title={isPinned ? 'Modifier les postes' : 'Sauvegarder à un poste'}
            >
              {isPinned
                ? <BookmarkCheck className="w-3.5 h-3.5" style={{ color: '#b9703f', fill: '#b9703f' }} />
                : <Bookmark className="w-3.5 h-3.5 text-[#d6d3d1] group-hover:text-[#a8a29e] transition-colors" />
              }
            </button>
          </div>
          {showSavePopover && (
            <SaveDestinationPopover
              assignedPosteIds={assignedPosteIds}
              posteOptions={posteOptions}
              onTogglePoste={(posteId) => onTogglePoste?.(posteId)}
              onClose={() => setShowSavePopover(false)}
            />
          )}
        </div>
      </div>

      {/* Title + victim */}
      <div className="px-3.5 pb-2">
        <div style={{ fontFamily: "'EB Garamond', 'Georgia', serif", fontSize: 16, color: '#292524', lineHeight: '22px' }}>
          Arrêt du {formatDateLong(d.date)}
        </div>
        {d.victimProfile && (
          <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', marginTop: 2, display: 'block' }}>{d.victimProfile}</span>
        )}
      </div>

      {/* Tags: category, status, contentieux, amounts */}
      <div className="px-3.5 pb-2 flex items-center gap-1.5 flex-wrap">
        {d.category && (
          <span className="badge badge-sm badge-outline">{d.category}</span>
        )}
        {d.status && (() => {
          const isDeceased = d.status === 'Décédée' || d.status === 'Décédé';
          return (
            <span className={`badge badge-sm ${isDeceased ? 'badge-destructive-subtle' : ''}`}
              style={!isDeceased ? { backgroundColor: '#f5f5f4', color: '#57534e' } : undefined}>{d.status}</span>
          );
        })()}
        {d.contentieuxType && (
          <span className="badge badge-sm badge-outline">{d.contentieuxType}</span>
        )}
        {d.amounts.map((amt, i) => (
          <span key={i} className="badge badge-sm badge-secondary" title={POSTE_LABEL_MAP[amt.poste] || amt.poste}>
            {amt.poste} : <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#b9703f' }}>{amt.displayValue}</span>
          </span>
        ))}
      </div>

      {/* Resume */}
      <div className="px-3.5 pb-3">
        <p style={{ fontSize: 14, lineHeight: '20px', color: '#a8a29e', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {d.resume}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────

export default function JPSearchView({
  pinnedJP = [],
  selectedDecisionId = null,
  onOpenDrawer,
  onSaveToDossier,
  onTogglePoste,
  onUnpin,
  onAddClick,
  posteOptions = [],
  // Per-decision workspace state — when supplied, the save popover gains a
  // "Aussi au cabinet" toggle that adds/removes a workspace-scope attachment.
  isWorkspacePinned,    // (decisionId) => boolean
  onToggleWorkspace,    // (decisionId) => void
  // Cabinet (org-level) JPs surfaced as a tab. Caller passes pre-resolved
  // decision-like objects (same shape as JPListing's decisionsOverride),
  // typically derived from the org-level preferences textarea.
  cabinetItems = null,
  onCabinetItemClick,
}) {
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [viewMode, setViewMode] = useState('search'); // 'search' | 'cabinet'
  const [filters, setFilters] = useState({
    jurisdictions: [],
    postes: [],
    dateFrom: '',
    dateTo: '',
  });

  const pinnedIds = useMemo(() => new Set(pinnedJP.map(p => p.decisionId)), [pinnedJP]);
  const pinnedMap = useMemo(() => {
    const m = {};
    pinnedJP.forEach(p => { m[p.decisionId] = p; });
    return m;
  }, [pinnedJP]);
  // Filter + search
  const results = useMemo(() => {
    let filtered = [...DECISIONS];

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(d =>
        d.jurisdiction.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.resume.toLowerCase().includes(q) ||
        d.numero.toLowerCase().includes(q) ||
        (getPrimaryAmount(d)?.displayValue || '').toLowerCase().includes(q) ||
        (d.chambre && d.chambre.toLowerCase().includes(q))
      );
    }

    if (filters.jurisdictions.length > 0) {
      filtered = filtered.filter(d => filters.jurisdictions.includes(d.jurisdiction));
    }
    if (filters.postes.length > 0) {
      filtered = filtered.filter(d => d.amounts.some(a => filters.postes.includes(a.poste)));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(d => d.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(d => d.date <= filters.dateTo);
    }

    filtered.sort((a, b) => b.date.localeCompare(a.date));
    return filtered;
  }, [query, filters]);

  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters({ jurisdictions: [], postes: [], dateFrom: '', dateTo: '' });
    setQuery('');
  };

  const activeFilterCount =
    filters.jurisdictions.length + filters.postes.length +
    (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#F8F7F5', height: '100%', overflow: 'hidden' }}>

      {/* FIXED TOP BAR: Search */}
      <div className="flex-shrink-0 border-b border-[#e7e5e3] px-6 py-3" style={{ backgroundColor: '#F8F7F5' }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#e7e5e3] transition-colors"
            style={query ? { borderColor: '#b9a07a', boxShadow: '0 0 0 1px rgba(185,160,122,0.15)' } : {}}>
            <Search className="w-4 h-4 text-[#a8a29e] flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par juridiction, contexte, montant, n de decision..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-[#292524] placeholder-[#a8a29e] focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-0.5 hover:bg-[#eeece6] rounded transition-colors">
                <X className="w-3.5 h-3.5 text-[#a8a29e]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABS: Recherche / Cabinet — under the search bar */}
      <div className="flex-shrink-0 border-b border-[#e7e5e3] px-6" style={{ backgroundColor: '#F8F7F5' }}>
        <div className="flex items-center gap-1">
          {[
            { id: 'search', label: 'Recherche', count: null },
            { id: 'cabinet', label: 'JP de référence', count: (cabinetItems || []).length },
          ].map(t => {
            const active = viewMode === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setViewMode(t.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: active ? '#292524' : '#78716c',
                  borderBottom: active ? '2px solid #292524' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t.label}
                {t.count != null && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold"
                    style={active
                      ? { backgroundColor: '#fdf3ec', color: '#b9703f' }
                      : { backgroundColor: '#eeece6', color: '#78716c' }}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN AREA: fixed sidebar + scrollable results */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* Fixed filter sidebar — hidden in cabinet tab */}
        <div className="flex-shrink-0 overflow-y-auto border-r border-[#e7e5e3]" style={{ width: viewMode === 'cabinet' ? 0 : (filtersOpen ? 220 : 0), transition: 'width 0.15s ease', backgroundColor: '#fafaf9' }}>
          {filtersOpen && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3 text-[#a8a29e]" />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Filtres
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#b9703f' }}>
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-[10px] text-[#b9703f] hover:underline font-medium">
                    Reinitialiser
                  </button>
                )}
              </div>

              <FilterSection title="Juridiction" searchable>
                {ALL_JURISDICTIONS.map(j => (
                  <FilterCheckbox key={j} label={j} checked={filters.jurisdictions.includes(j)} onChange={() => toggleFilter('jurisdictions', j)} />
                ))}
              </FilterSection>

              <FilterSection title="Poste" searchable>
                {ALL_POSTES.map(p => (
                  <FilterCheckbox
                    key={p}
                    title={POSTE_LABEL_MAP[p] || p}
                    label={p.toUpperCase()}
                    checked={filters.postes.includes(p)}
                    onChange={() => toggleFilter('postes', p)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Periode">
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-[#a8a29e] uppercase font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Du</label>
                    <input type="date" value={filters.dateFrom} onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 rounded-md border border-[#e7e5e3] bg-white text-[12px] text-[#292524] focus:outline-none focus:border-[#b9a07a]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#a8a29e] uppercase font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Au</label>
                    <input type="date" value={filters.dateTo} onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 rounded-md border border-[#e7e5e3] bg-white text-[12px] text-[#292524] focus:outline-none focus:border-[#b9a07a]" />
                  </div>
                </div>
              </FilterSection>
            </div>
          )}
        </div>

        {/* Scrollable results area */}
        <div className="flex-1 overflow-y-auto min-w-0">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 px-5 py-2 border-b border-[#e7e5e3] flex items-center justify-between" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="flex items-center gap-3">
              {viewMode !== 'cabinet' && (
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium text-[#78716c] hover:bg-[#eeece6] transition-colors"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Filtres
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#b9703f' }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}
              <span className="text-[12px] text-[#a8a29e]">
                {viewMode === 'cabinet'
                  ? `${(cabinetItems || []).length} JP de référence${(cabinetItems || []).length !== 1 ? 's' : ''}`
                  : `${results.length} resultat${results.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Cards grid */}
          {viewMode === 'cabinet' ? (
            <div className="px-5 py-3" style={{ maxWidth: 1100 }}>
              {(cabinetItems || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Landmark className="w-8 h-8 text-stone-300 mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-[#a8a29e]">Aucune jurisprudence de référence</p>
                  <p className="text-[12px] text-[#d6d3d1] mt-1 max-w-md text-center">
                    Ajoutez vos décisions de référence dans Mémoire et préférences.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {cabinetItems.map((d) => {
                    const isOrphan = d._status === 'orphan';
                    const isFiche = d._status === 'ficheCabinet';
                    return (
                      <div
                        key={d.id}
                        onClick={() => onCabinetItemClick?.(d)}
                        className="group bg-white rounded cursor-pointer flex items-center gap-3 px-3 py-2.5"
                        style={{
                          boxShadow: '0 1px 2px rgba(41,37,36,0.05)',
                          transition: 'box-shadow 0.15s ease',
                          borderLeft: isOrphan ? '3px solid #f59e0b' : 'none',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(41,37,36,0.07)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(41,37,36,0.05)'; }}
                      >
                        <Landmark className="w-3 h-3 text-[#b9703f] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 14, color: '#292524', fontWeight: 500 }}>
                              {d.jurisdiction}{d.chambre ? ` · ${d.chambre}` : ''}
                            </span>
                            {d.numero && (
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#c8c5c0', textTransform: 'uppercase' }}>
                                {d.numero}
                              </span>
                            )}
                          </div>
                          <div className="truncate" style={{ fontSize: 12, color: '#a8a29e', marginTop: 1 }}>
                            {d.category || d.resume || ''}
                          </div>
                        </div>
                        {isFiche && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#fdf3ec', color: '#b9703f' }}>
                            Fiche cabinet
                          </span>
                        )}
                        {isOrphan && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                            Non référencée
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-3">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="w-8 h-8 text-stone-300 mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-[#a8a29e]">Aucun resultat trouve</p>
                  <p className="text-[12px] text-[#d6d3d1] mt-1">Essayez d'elargir vos criteres de recherche</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))', gap: 10, maxWidth: 1100 }}>
                  {results.map(d => {
                    const isPinned = pinnedIds.has(d.id);
                    const pin = pinnedMap[d.id];
                    const isSelected = d.id === selectedDecisionId;
                    return (
                      <JPSearchResultCard
                        key={d.id}
                        decision={d}
                        isPinned={isPinned}
                        assignedPosteIds={pin?.posteIds || []}
                        isSelected={isSelected}
                        onOpen={() => onOpenDrawer?.(d.id, results.map(r => r.id))}
                        onTogglePoste={(posteId) => onTogglePoste?.(d.id, posteId)}
                        posteOptions={posteOptions}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
