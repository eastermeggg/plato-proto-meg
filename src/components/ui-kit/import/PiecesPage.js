// Geste A (spec §5) - le dossier vivant, dans l'ANATOMIE RÉELLE de l'onglet
// Pièces de l'app : une seule colonne, recherche en tête, tableau-arbre
// (colonnes Dossier / Date) où les catégories sont des lignes dépliables.
// Le calque sync se pose à ses places exactes : ligne « Nouveautés » en tête
// d'arbre (bleue, transverse), point bleu + badge « Nouveau » sur les lignes,
// provenance en sous-titre avec filtre « source : X », panneau Sources au
// bord droit. L'import manuel (drop) et la sync coexistent toujours.

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder, Mail, Plus, Scissors, Search, Sparkles, X } from 'lucide-react';
import Button from '../../ui/Button';
import { ModalOverlay, Droppable, NouveauBadge, CountBadge, WarnBadge, LabSeg, monoLabel, usePhase2 } from './atoms';
import SourcesPanel from './SourcesPanel';
import { PIECES_NODES, nodeLabel, normalize } from './labData';

const PAGE = 25;

function CategoryRow({ label, empty, collapsed, onToggle }) {
  const Chevron = collapsed || empty ? ChevronRight : ChevronDown;
  return (
    <button
      type="button"
      onClick={empty ? undefined : onToggle}
      className={`w-full flex items-center border-b border-border/60 text-left transition-colors ${empty ? 'cursor-default' : 'hover:bg-background-canvas/70'}`}
      style={{ height: 44 }}
    >
      <span style={{ width: 16 }} className="flex-shrink-0" />
      <Chevron className={`w-3.5 h-3.5 flex-shrink-0 ${empty ? 'opacity-0' : 'text-foreground-muted'}`} strokeWidth={1.75} />
      <Folder className={`w-4 h-4 flex-shrink-0 ml-1.5 ${empty ? 'text-foreground-muted' : 'text-foreground-secondary'}`} strokeWidth={1.75} />
      <span className={`ml-2 text-sm truncate ${empty ? 'text-foreground-muted' : 'font-medium text-foreground'}`}>{label}</span>
    </button>
  );
}

function PieceRow({ piece, depth = 1, showNode = false, onFilterSource }) {
  const Icon = piece.kind === 'email' ? Mail : piece.split ? Scissors : FileText;
  const p = piece.provenance;
  return (
    <div className="group flex items-center border-b border-border/60 hover:bg-background-canvas/70 transition-colors" style={{ height: 58 }}>
      <span style={{ width: 16 + depth * 24 }} className="flex-shrink-0" />
      {piece.isNew && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mr-2" style={{ backgroundColor: '#1e3a8a' }} aria-hidden />}
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: piece.kind === 'email' ? '#1e3a8a' : '#78716c' }} />
      <span className="flex-1 min-w-0 ml-2.5 mr-3">
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{piece.name}</span>
          {piece.isNew && <NouveauBadge />}
        </span>
        {(p || showNode) && (
          <span className="text-xs text-foreground-muted truncate block mt-0.5">
            {showNode && <span>{nodeLabel(piece.nodeId)}{p ? ' · ' : ''}</span>}
            {p && (p.kind === 'source' ? (
              <button
                type="button"
                onClick={() => onFilterSource(p)}
                className="hover:text-foreground-secondary hover:underline decoration-dotted underline-offset-2 transition-colors"
                title="Filtrer les pièces de cette source"
              >
                via {p.label}
              </button>
            ) : p.label)}
          </span>
        )}
      </span>
      <span className="flex-shrink-0 text-xs text-foreground-muted tabular-nums text-right mr-4" style={{ width: 44 }}>{piece.pagesLabel || ''}</span>
      <span className="flex-shrink-0 text-sm text-foreground-secondary tabular-nums pr-4 text-right" style={{ width: 96 }}>{piece.dateLabel || '—'}</span>
    </div>
  );
}

export default function PiecesPage({ onClose, onToast, onOpenGesteC, pieces, sources, suggestions, api, connected, onConnect }) {
  const phase2 = usePhase2();
  const [view, setView] = useState('tree'); // 'tree' | 'nouveautes'
  const [searchQ, setSearchQ] = useState('');
  const [sourceFilter, setSourceFilter] = useState(null); // { sourceId, label }
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [caps, setCaps] = useState(() => ({})); // nodeId → limit
  const [panel, setPanel] = useState(null); // null | {view:'list'} | {view:'detail', id} | {view:'add'}
  const [emptyMode, setEmptyMode] = useState(false); // scénario lab « dossier sans pièce »

  const shownPieces = useMemo(() => (emptyMode ? [] : pieces), [emptyMode, pieces]);
  const newCount = shownPieces.filter(p => p.isNew).length;
  const totalNew = emptyMode ? 0 : sources.reduce((n, s) => n + (s.newCount || 0), 0);
  const totalFail = emptyMode ? 0 : sources.reduce((n, s) => n + s.history.filter(h => h.kind === 'failure' && !h.resolved).length, 0);

  // Quitter la vue Nouveautés éteint les marqueurs ; la provenance reste.
  const leaveNouveautes = () => {
    if (view === 'nouveautes' && newCount > 0) api.clearNew();
    setView('tree');
  };

  const nq = normalize(searchQ.trim());
  const flatMode = !!nq || !!sourceFilter || view === 'nouveautes';
  const flatPieces = useMemo(() => {
    if (nq) return shownPieces.filter(p => normalize(p.name).includes(nq) || (p.provenance && normalize(p.provenance.label).includes(nq)));
    if (sourceFilter) return shownPieces.filter(p => p.provenance?.sourceId === sourceFilter.sourceId);
    if (view === 'nouveautes') return shownPieces.filter(p => p.isNew);
    return [];
  }, [shownPieces, nq, sourceFilter, view]);
  const [flatCap, setFlatCap] = useState(PAGE);

  const byNode = (nodeId) => shownPieces.filter(p => p.nodeId === nodeId);

  const toggleNode = (nodeId) => setCollapsed(prev => { const n = new Set(prev); n.has(nodeId) ? n.delete(nodeId) : n.add(nodeId); return n; });
  const capFor = (nodeId) => caps[nodeId] || PAGE;

  // Une synchro bascule sur Nouveautés (spec §5.1).
  const afterSync = (added) => {
    if (added > 0) { setView('nouveautes'); setSourceFilter(null); setSearchQ(''); setFlatCap(PAGE); }
  };

  // Échap remonte d'un niveau dans la surface Sources.
  useEffect(() => {
    if (!panel) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setPanel(p => (p && p.view !== 'list' ? { view: 'list' } : null));
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [panel]);

  const filterSource = (prov) => {
    setSourceFilter({ sourceId: prov.sourceId, label: prov.label });
    setSearchQ('');
    setFlatCap(PAGE);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-md w-full h-full flex flex-col overflow-hidden" style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' }}>
        {/* Bandeau lab - contrôles de scénario, hors UI produit. */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-border flex-shrink-0" style={{ backgroundColor: '#fcfbfa' }}>
          <div className="flex items-center gap-3 min-w-0">
            <span style={monoLabel}>Onglet Pièces · Leblanc c/ AXA</span>
            <LabSeg
              value={emptyMode ? 'vide' : 'rempli'}
              onChange={(v) => {
                setEmptyMode(v === 'vide');
                setView('tree');
                setSourceFilter(null);
                setSearchQ('');
              }}
              options={[{ value: 'rempli', label: 'Dossier rempli' }, { value: 'vide', label: 'Dossier vide' }]}
            />
          </div>
          <button type="button" onClick={onClose} className="p-1 text-foreground-muted hover:text-foreground-secondary hover:bg-cream rounded-lg transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 min-h-0 flex relative">
          <Droppable
            onFiles={() => {
              const n = api.addDropPieces('sans-categorie');
              onToast(`${n} pièce${n > 1 ? 's' : ''} ajoutée${n > 1 ? 's' : ''} au dossier - à classer`);
            }}
            className="flex-1 min-w-0 flex flex-col overflow-hidden"
          >
            {/* Recherche - pleine largeur en tête d'onglet, comme l'app. */}
            <div className="border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2.5 px-5 h-11">
                <Search className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => { setSearchQ(e.target.value); setFlatCap(PAGE); }}
                  placeholder="Rechercher une pièce…"
                  className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder-foreground-muted focus:outline-none"
                />
                {searchQ && (
                  <button type="button" onClick={() => setSearchQ('')} className="p-0.5 text-foreground-muted hover:text-foreground-secondary rounded"><X className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>

            {/* Header d'onglet : compte + filtre · Sources email + Ajouter. */}
            <div className="px-5 pt-3.5 pb-3 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm font-medium text-foreground flex-shrink-0">{shownPieces.length} pièce{shownPieces.length > 1 ? 's' : ''}</span>
                {sourceFilter && (
                  <button
                    type="button"
                    onClick={() => setSourceFilter(null)}
                    className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[11px] font-medium transition-colors hover:opacity-80 min-w-0"
                    style={{ backgroundColor: '#dfe8f5', color: '#1e3a8a' }}
                    title="Retirer le filtre"
                  >
                    <span className="truncate">source : {sourceFilter.label}</span>
                    <X className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {phase2 && (
                  <span className="relative inline-flex">
                    <Button variant="outline" size="md" icon={Mail} label="Sources email" onClick={() => setPanel({ view: 'list' })} />
                    <span className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5">
                      <CountBadge n={totalNew} />
                      <WarnBadge n={totalFail} title="Échecs de récupération non résolus" />
                    </span>
                  </span>
                )}
                <Button variant="primary" size="md" icon={Plus} label="Ajouter" onClick={onOpenGesteC} />
              </div>
            </div>

            {/* Corps */}
            {shownPieces.length === 0 ? (
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 text-center px-8">
                <span className="inline-flex items-center justify-center rounded-full p-4" style={{ backgroundColor: '#eeece6', border: '1px solid #d6d3d1' }}>
                  <FileText className="w-6 h-6 text-foreground" strokeWidth={1.75} />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">Aucune pièce pour l'instant</p>
                  <p className="text-[13px] text-foreground-secondary leading-5" style={{ maxWidth: 360 }}>
                    Ajoutez des mails, des PJ ou des fichiers - ou déposez-les directement sur cette page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="md" icon={Plus} label="Ajouter des pièces" onClick={onOpenGesteC} />
                  {phase2 && (
                    <Button variant="outline" size="md" icon={Mail} label="Suivre une source" onClick={() => setPanel({ view: 'add' })} />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
                <div className="border border-border rounded-xl overflow-hidden bg-white">
                  {/* En-tête de colonnes */}
                  <div className="flex items-center px-4 h-8 border-b border-border" style={{ backgroundColor: '#f8f7f5' }}>
                    <span className="flex-1" style={monoLabel}>Dossier</span>
                    <span className="flex-shrink-0 text-right mr-4" style={{ ...monoLabel, width: 44 }}>Pages</span>
                    <span className="flex-shrink-0 text-right pr-0" style={{ ...monoLabel, width: 96 }}>Date</span>
                  </div>

                  {/* Ligne « Nouveautés » en tête d'arbre (phase 2, transverse). */}
                  {phase2 && !nq && !sourceFilter && (
                    <button
                      type="button"
                      onClick={() => (view === 'nouveautes' ? leaveNouveautes() : (setView('nouveautes'), setFlatCap(PAGE)))}
                      className="w-full flex items-center border-b border-border/60 text-left transition-colors hover:bg-background-canvas/70"
                      style={{ height: 44, backgroundColor: view === 'nouveautes' ? '#f4f7fc' : undefined }}
                    >
                      <span style={{ width: 16 }} className="flex-shrink-0" />
                      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${view === 'nouveautes' ? 'rotate-90' : ''}`} strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
                      <Sparkles className="w-4 h-4 flex-shrink-0 ml-1.5" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
                      <span className="ml-2 text-sm font-medium truncate" style={{ color: '#1e3a8a' }}>Nouveautés</span>
                      <span className="ml-2"><CountBadge n={newCount} /></span>
                      {view === 'nouveautes' && (
                        <span className="ml-auto mr-4 text-[11px]" style={{ color: '#1e3a8a' }}>vue transverse - cliquer pour revenir à l'arborescence</span>
                      )}
                    </button>
                  )}

                  {flatMode ? (
                    <>
                      {flatPieces.length === 0 ? (
                        <p className="px-4 py-8 text-center text-xs text-foreground-muted">
                          {view === 'nouveautes' && !nq && !sourceFilter
                            ? 'Aucune nouveauté - les sources suivies sont à jour.'
                            : `Aucune pièce ne correspond${nq ? ` à « ${searchQ.trim()} »` : ''}.`}
                        </p>
                      ) : flatPieces.slice(0, flatCap).map(p => (
                        <PieceRow key={p.id} piece={p} depth={1} showNode onFilterSource={filterSource} />
                      ))}
                      {flatPieces.length > flatCap && (
                        <button type="button" onClick={() => setFlatCap(c => c + PAGE)} className="w-full text-left px-[52px] py-2.5 text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-background-canvas/70 transition-colors">
                          + {flatPieces.length - flatCap} autres
                        </button>
                      )}
                    </>
                  ) : (
                    PIECES_NODES.map(node => {
                      const items = byNode(node.id);
                      const isCollapsed = collapsed.has(node.id);
                      const cap = capFor(node.id);
                      return (
                        <React.Fragment key={node.id}>
                          <CategoryRow
                            label={node.label}
                            empty={items.length === 0}
                            collapsed={isCollapsed}
                            onToggle={() => toggleNode(node.id)}
                          />
                          {!isCollapsed && items.slice(0, cap).map(p => (
                            <PieceRow key={p.id} piece={p} depth={1} onFilterSource={filterSource} />
                          ))}
                          {!isCollapsed && items.length > cap && (
                            <button type="button" onClick={() => setCaps(prev => ({ ...prev, [node.id]: cap + PAGE }))} className="w-full text-left px-[52px] py-2.5 text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-background-canvas/70 transition-colors border-b border-border/60">
                              + {items.length - cap} autres
                            </button>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </Droppable>

          {/* Surface Sources : un seul siège au bord droit, navigation en push. */}
          {phase2 && panel && (
            <SourcesPanel
              panel={panel}
              setPanel={setPanel}
              sources={sources}
              suggestions={suggestions}
              api={api}
              onToast={onToast}
              afterSync={afterSync}
              connected={connected}
              onConnect={onConnect}
            />
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
