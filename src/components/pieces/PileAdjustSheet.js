import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Scissors, Link2, Check, Pencil, Trash2, FileText, ChevronLeft, Play, RotateCcw, FoldHorizontal, Sparkles, Calendar } from 'lucide-react';

// Design tokens lifted from the Plato "DocumentPanelCut" Figma frame.
const SHADOW_LG = '0px 4px 6px -4px rgba(26,26,26,0.05), 0px 10px 15px -3px rgba(26,26,26,0.05)';
const SHADOW_MD = '0px 2px 4px -2px rgba(26,26,26,0.05), 0px 4px 6px -1px rgba(26,26,26,0.05)';
const SHADOW_XS = '0px 1px 2px rgba(26,26,26,0.05)';
const SHADOW_2XS = '0px 1px 1px rgba(26,26,26,0.05)';
const SANS = "'Inter', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

// "Ajuster le découpage" - right-side sheet (slideInRight, 1040px).
//
// Reading flow (Lecteur) + cut/heal interactions (Massicot), restyled:
// light neutral canvas, borderless pages floating on layered shadows,
// dark pill actions, quiet sommaire. The boundary between two documents
// is a hairline that reveals a « Recoller » pill on hover; between two
// pages of the same document, a ghost junction reveals « Couper ».
//
// Edits mutate a local copy of segments; cmd+Z reverts step by step.
// Exit buttons commit + resolve the pile in the chosen mode.

// The document's display title: a user-given custom name wins, else the
// first chunk of the extracted label ("Facture", "Bulletin"…).
function docTitle(seg) {
  return seg._customName || seg.label.split('·')[0].trim();
}

function formatDateShort(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function PileAdjustSheet({ pile, splitPrompt, initialMode = 'adjust', activeSegmentId = null, onClose, onCommit, onChoose }) {
  const [segments, setSegments] = useState(pile.segments);
  // 'view' = read the document + its metadata; 'adjust' = cut/heal the découpage.
  // Both modes share the same persistent document pane (no layout shift on switch).
  const [mode, setMode] = useState(initialMode);
  // Initialise to the opened part so it renders correctly on first paint
  // (no flash of part 1 before the effect corrects it).
  const [activeIdx, setActiveIdx] = useState(() => {
    const i = activeSegmentId ? pile.segments.findIndex(s => s.id === activeSegmentId) : 0;
    return i >= 0 ? i : 0;
  });
  // Index of the boundary being hovered (between segments[i-1] and segments[i]).
  // Drives the "draw closer" transform on the two adjacent documents.
  const [stitchHover, setStitchHover] = useState(null);
  // Sommaire row currently in rename mode.
  const [renamingIdx, setRenamingIdx] = useState(null);
  const undoStack = useRef([]);
  const segmentRefs = useRef(new Map());
  const sommaireRowRefs = useRef(new Map());
  const previewScrollRef = useRef(null);

  useEffect(() => {
    setSegments(pile.segments);
    const idx = activeSegmentId ? pile.segments.findIndex(s => s.id === activeSegmentId) : 0;
    setActiveIdx(idx >= 0 ? idx : 0);
    undoStack.current = [];
  }, [pile.id, pile.segments, activeSegmentId]);

  // Adjust mode commits only through the explicit footer (Enregistrer); closing
  // it any other way (✕ / Échap / backdrop) discards the in-progress cuts. View
  // mode keeps its lightweight autosave so rename / delete persist on close.
  const closePanel = () => {
    if (mode !== 'adjust') onCommit(segments);
    onClose();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { closePanel(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        const prev = undoStack.current.pop();
        if (prev) setSegments(prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, onCommit, segments, mode]);

  // On open, bring the clicked segment into view (the observer keeps it active).
  useEffect(() => {
    // Only auto-scroll when the whole document is shown (adjust mode). In view
    // mode a single part renders already in position - scrolling it would jump.
    if (!activeSegmentId || mode === 'view') return;
    const idx = pile.segments.findIndex(s => s.id === activeSegmentId);
    if (idx <= 0) return;
    const t = setTimeout(() => {
      const el = segmentRefs.current.get(idx);
      if (el) el.scrollIntoView({ block: 'start' });
    }, 60);
    return () => clearTimeout(t);
  }, [pile.id, activeSegmentId, pile.segments, mode]);

  // Scroll-sync: the most visible document drives the floating breadcrumb
  // and the sommaire highlight.
  useEffect(() => {
    const root = previewScrollRef.current;
    if (!root) return;
    const visible = new Map();
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = Number(entry.target.getAttribute('data-seg-idx'));
        if (entry.isIntersecting) visible.set(idx, entry.intersectionRatio);
        else visible.delete(idx);
      });
      if (visible.size === 0) return;
      let best = -1, bestRatio = -1;
      visible.forEach((ratio, idx) => { if (ratio > bestRatio) { bestRatio = ratio; best = idx; } });
      if (best >= 0) setActiveIdx(prev => (prev === best ? prev : best));
    }, { root, threshold: [0, 0.25, 0.5, 0.75, 1] });
    segmentRefs.current.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [segments, mode]);

  useEffect(() => {
    const el = sommaireRowRefs.current.get(activeIdx);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIdx]);

  const pushUndo = () => { undoStack.current.push(segments); };

  // Heal the boundary after segments[i] (merge i and i+1).
  const healBoundary = (i) => {
    if (i < 0 || i >= segments.length - 1) return;
    pushUndo();
    setSegments(prev => {
      const a = prev[i], b = prev[i + 1];
      const merged = {
        ...a,
        label: `${a.label} + ${b.label.split('·').slice(-1).join('·').trim()}`,
        pages: a.pages + b.pages,
        pageEnd: b.pageEnd,
        montantCents: (a.montantCents || 0) + (b.montantCents || 0),
        _merged: true,
        _anomaly: a._anomaly || b._anomaly,
      };
      return [...prev.slice(0, i), merged, ...prev.slice(i + 2)];
    });
  };

  // Réunir tout en 1 document - heal every boundary at once, collapsing the
  // whole découpage into a single segment (vs. clicking « Recoller » N times).
  // The first part keeps its name/metadata; pages run end to end.
  const mergeAll = () => {
    if (segments.length <= 1) return;
    pushUndo();
    setSegments(prev => {
      const first = prev[0];
      const last = prev[prev.length - 1];
      return [{
        ...first,
        pages: prev.reduce((n, s) => n + s.pages, 0),
        pageStart: first.pageStart,
        pageEnd: last.pageEnd,
        montantCents: prev.reduce((n, s) => n + (s.montantCents || 0), 0),
        _merged: true,
        _anomaly: null,
      }];
    });
    setActiveIdx(0);
  };

  // Split segments[i] before its relative page `relPage` (1-based).
  const splitAtPage = (i, relPage) => {
    pushUndo();
    setSegments(prev => {
      const seg = prev[i];
      if (relPage < 1 || relPage >= seg.pages) return prev;
      const a = {
        ...seg,
        id: `${seg.id}-a`,
        pages: relPage,
        pageEnd: seg.pageStart + relPage - 1,
        montantCents: seg.montantCents != null ? Math.round(seg.montantCents * (relPage / seg.pages)) : null,
        _split: true,
      };
      const b = {
        ...seg,
        id: `${seg.id}-b`,
        pages: seg.pages - relPage,
        pageStart: seg.pageStart + relPage,
        montantCents: seg.montantCents != null ? seg.montantCents - Math.round(seg.montantCents * (relPage / seg.pages)) : null,
        _split: true,
      };
      return [...prev.slice(0, i), a, b, ...prev.slice(i + 1)];
    });
  };

  // Rename a document - stores a custom name that overrides the derived
  // title everywhere (page card, sommaire, breadcrumb). Empty clears it.
  const renameSegment = (i, name) => {
    const clean = (name || '').trim();
    setSegments(prev => {
      const seg = prev[i];
      if (!seg) return prev;
      const next = clean || null;
      if (seg._customName === next || (!seg._customName && !next)) return prev;
      pushUndo();
      return prev.map((s, idx) => idx === i ? { ...s, _customName: next } : s);
    });
  };

  // Remove a part from the découpage (view-mode delete). Guard the last one.
  const deleteSegment = (i) => {
    if (segments.length <= 1) return;
    pushUndo();
    setSegments(prev => prev.filter((_, idx) => idx !== i));
    setActiveIdx(a => Math.max(0, Math.min(a, segments.length - 2)));
  };

  // Always-on name edit (view metadata) - no undo entry per keystroke.
  const setSegmentName = (i, name) => {
    setSegments(prev => prev.map((s, idx) => idx === i ? { ...s, _customName: name } : s));
  };

  const commitAndChoose = (choice) => {
    onCommit(segments);
    onChoose(choice);
  };

  // Single "Enregistrer" action: save the current découpage and close. The
  // mode follows the découpage itself - one part left = one document (bundle),
  // several = exploded - so there's no separate keep/explode choice to make.
  const saveAndClose = () => commitAndChoose(segments.length > 1 ? 'exploded' : 'bundle');

  const scrollToSegment = (idx) => {
    setActiveIdx(idx); // immediate active state - don't wait for the scroll observer
    const el = segmentRefs.current.get(idx);
    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const safe = Math.min(activeIdx, segments.length - 1);
  const active = segments[safe];
  // In view mode opened on a specific split part, preview ONLY that part's pages.
  // Adjust mode (and bundles, opened with no specific part) show the whole doc.
  const previewSingle = mode === 'view' && !!activeSegmentId;

  return (
    <>
    {/* Backdrop */}
    <div
      onClick={closePanel}
      className="fixed top-0 left-0 bottom-0 z-20"
      style={{ right: 'var(--chat-offset, 0px)', background: 'rgba(28, 25, 23, 0.5)', animation: 'fadeIn 0.2s ease-out' }}
    />
    <div
      className="fixed top-0 h-screen bg-white border-l border-[#e7e5e3] z-30 flex flex-col"
      style={{ width: '1040px', maxWidth: 'calc(100vw - var(--chat-offset, 0px))', right: 'var(--chat-offset, 0px)', boxShadow: '-20px 0 28px -16px rgba(28,25,23,0.16)', animation: 'slideInRight 0.2s ease-out' }}
    >
      {/* Header - harmonized with the document preview panel. Title + actions
          depend on the mode; the document pane below is shared across modes. */}
      <div className="px-4 py-3.5 border-b border-[#e7e5e3] flex items-center justify-between gap-3 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {mode === 'adjust' && initialMode === 'view' && (
            <button
              type="button"
              onClick={() => setMode('view')}
              title="Retour à l'aperçu du document"
              className="p-1 -ml-1 flex-shrink-0 text-[#a8a29e] hover:text-[#44403c] hover:bg-[#f5f5f4] rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 bg-[#eeece6] text-[#292524]">
            {mode === 'adjust'
              ? <Scissors className="w-3.5 h-3.5" strokeWidth={1.75} />
              : <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />}
          </span>
          <span className="flex-1 min-w-0 text-[14px] leading-[20px] font-medium text-black whitespace-nowrap truncate" style={{ fontFamily: SANS }}>
            {mode === 'adjust' ? pile.originalName : (active ? docTitle(active) : 'Document')}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {mode === 'adjust' && (
            <>
              <button
                onClick={saveAndClose}
                className="inline-flex items-center h-8 px-3 rounded-lg text-[14px] font-medium text-white transition-colors"
                style={{ fontFamily: SANS, background: '#292524', boxShadow: SHADOW_2XS }}
              >
                Enregistrer
              </button>
              <span className="w-px h-[15px] bg-[#d9d9d9] mx-1" />
            </>
          )}
          <button onClick={closePanel} className="p-1 text-[#78716c] hover:text-[#292524] hover:bg-[#f5f5f4] rounded-md transition-colors" aria-label="Fermer" title="Fermer sans enregistrer">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left - document reading flow. Shared across view/adjust; only the
            cut/heal junctions appear in adjust mode, so the pages never move. */}
        <div className="flex-1 min-w-0 relative bg-[#f8f7f5]">
          {/* Scrollable preview */}
          <div ref={previewScrollRef} className="absolute inset-0 overflow-y-auto px-10 pt-10 pb-10 flex flex-col items-center">
            {segments.map((seg, idx) => {
              // View mode on a single split part: render only that part's pages.
              if (previewSingle && idx !== safe) return null;
              // When a boundary is hovered, the doc above it slides down and
              // the doc below slides up - previewing the stitch. Pure transform
              // (no reflow) so the boundary's hit area never moves → no flicker.
              const dy = stitchHover === idx ? -16 : stitchHover === idx + 1 ? 16 : 0;
              return (
              <React.Fragment key={seg.id}>
                {idx > 0 && mode === 'adjust' && (
                  <CutBoundary
                    onHeal={() => healBoundary(idx - 1)}
                    onHoverChange={(on) => setStitchHover(on ? idx : (v) => (v === idx ? null : v))}
                  />
                )}
                <div
                  ref={(el) => { if (el) segmentRefs.current.set(idx, el); else segmentRefs.current.delete(idx); }}
                  data-seg-idx={idx}
                  className="flex flex-col items-center w-full"
                  style={{ scrollMarginTop: 60, transform: `translateY(${dy}px)`, transition: 'transform 220ms cubic-bezier(0.34, 1.3, 0.5, 1)' }}
                >
                  {Array.from({ length: seg.pages }).map((_, p) => (
                    <React.Fragment key={p}>
                      <MockPage pageNum={seg.pageStart + p} relIdx={p} segment={seg} docNumber={idx + 1} first={p === 0} last={p === seg.pages - 1} />
                      {mode === 'adjust' && p < seg.pages - 1 && <GhostCut onCut={() => splitAtPage(idx, p + 1)} />}
                    </React.Fragment>
                  ))}
                </div>
              </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right - controls. Adjust: découpage sommaire + prompt. View: the
            active part's document metadata. */}
        <div className="w-[440px] flex flex-col bg-white flex-shrink-0 border-l border-[#e7e5e3]">
          {mode === 'adjust' ? (
            <>
              <div className="px-5 py-4 flex items-center justify-between flex-shrink-0">
                <span className="text-[11px] uppercase text-[#78716c]" style={{ fontFamily: MONO }}>Découpage</span>
                <span className="text-[11px] uppercase text-[#292524] tabular-nums" style={{ fontFamily: MONO }}>
                  {segments.length} pièce{segments.length > 1 ? 's' : ''}
                </span>
              </div>
              {segments.length > 1 && (
                <div className="px-2 pb-2 w-full flex-shrink-0">
                  <button
                    type="button"
                    onClick={mergeAll}
                    title="Recoller toutes les parties en un seul document"
                    className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-[14px] font-medium text-[#44403c] bg-[#eeece6] hover:bg-[#e7e5e3] transition-colors"
                    style={{ fontFamily: SANS }}
                  >
                    <FoldHorizontal className="w-4 h-4" strokeWidth={1.75} />
                    Réunir en 1 seul document
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-2 pb-3">
                {segments.map((seg, idx) => {
                  const isActive = idx === safe;
                  const isRenaming = renamingIdx === idx;
                  return (
                    <div
                      key={seg.id}
                      ref={(el) => { if (el) sommaireRowRefs.current.set(idx, el); else sommaireRowRefs.current.delete(idx); }}
                      onClick={() => { if (!isRenaming) scrollToSegment(idx); }}
                      className="w-full text-left px-4 pt-2 pb-2.5 rounded-lg transition-colors flex items-start gap-2 group cursor-pointer"
                      style={{
                        background: isActive ? '#292524' : 'transparent',
                        boxShadow: isActive ? SHADOW_MD : 'none',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f8f7f5'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span
                        className="text-[11px] uppercase tabular-nums py-1.5 w-[30px] flex-shrink-0 transition-colors"
                        style={{ fontFamily: MONO, color: isActive ? '#ffffff' : '#78716c' }}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        {isRenaming ? (
                          <SommaireRenameInput
                            initial={seg._customName || seg.label}
                            onCommit={(name) => { renameSegment(idx, name); setRenamingIdx(null); }}
                            onCancel={() => setRenamingIdx(null)}
                          />
                        ) : (
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-[14px] leading-[20px] truncate" style={{ fontFamily: SANS, color: isActive ? '#ffffff' : '#292524', fontWeight: isActive ? 500 : 400 }}>
                              {seg._customName || seg.label}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setRenamingIdx(idx); }}
                              className="flex-shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: isActive ? 'rgba(255,255,255,0.6)' : '#a8a29e' }}
                              title="Renommer"
                            >
                              <Pencil className="w-3 h-3" strokeWidth={1.75} />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <SegBadge active={isActive}>
                            {seg.pages === 1 ? `P.${seg.pageStart}` : `P.${seg.pageStart}-${seg.pageEnd}`}
                          </SegBadge>
                          <SegBadge active={isActive}>{seg.pages} P.</SegBadge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Consignes de découpage - hidden for now */}
              {false && <SplitPromptSection defaultPrompt={splitPrompt} />}
            </>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-4 px-5 py-5">
                {/* Nom du document */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label htmlFor="pile-segment-name" className="text-[14px] leading-[20px] font-medium text-[#292524]" style={{ fontFamily: SANS }}>Nom du document</label>
                    <Sparkles className="w-3 h-3 text-[#7c3aed]" strokeWidth={1.75} />
                  </div>
                  <input
                    id="pile-segment-name"
                    value={active ? (active._customName || active.label) : ''}
                    onChange={(e) => setSegmentName(safe, e.target.value)}
                    className="w-full text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-3 py-2.5 hover:border-zinc-300 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-colors"
                    style={{ fontFamily: SANS, boxShadow: SHADOW_XS }}
                  />

                  {/* Document découpé - provenance callout (« the splitted box ») */}
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-[#e7e5e3] bg-[#f8f7f5]">
                    <span className="flex items-center justify-center w-7 h-7 rounded-md border border-[#e7e5e3] bg-white flex-shrink-0">
                      <Scissors className="w-3.5 h-3.5 text-[#44403c]" strokeWidth={1.75} />
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="text-[14px] leading-[20px] font-medium text-[#292524]" style={{ fontFamily: SANS }}>Document découpé</span>
                      <span className="text-[12px] leading-[16px] text-[#78716c] truncate" style={{ fontFamily: SANS }} title={pile.originalName}>
                        Nom original · {pile.originalName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('adjust')}
                      title="Revoir et ajuster le découpage"
                      className="flex-shrink-0 text-[14px] leading-[20px] font-medium hover:underline underline-offset-2"
                      style={{ fontFamily: SANS, color: '#1e3a8a' }}
                    >
                      Ajuster
                    </button>
                  </div>
                </div>

                {/* Date du document */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] leading-[20px] font-medium text-[#292524]" style={{ fontFamily: SANS }}>Date du document</span>
                    <Sparkles className="w-3 h-3 text-[#7c3aed]" strokeWidth={1.75} />
                  </div>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#e7e5e3] bg-white" style={{ boxShadow: SHADOW_XS }}>
                    <Calendar className="w-4 h-4 text-[#78716c] flex-shrink-0" strokeWidth={1.75} />
                    <span className="text-[14px] text-[#292524] tabular-nums" style={{ fontFamily: SANS }}>
                      {active ? formatDateShort(active.date) : '—'}
                    </span>
                  </div>
                </div>

                {/* Classement */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[12px] text-[#a8a29e]" style={{ fontFamily: SANS }}>Type</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-medium bg-[#f5f5f4] text-[#78716c]">{pile.aggregate.typeForClassification}</span>
                </div>
              </div>

              <div className="flex-1" />

              {/* Footer */}
              <div className="border-t border-[#e7e5e3] px-5 py-4 flex-shrink-0">
                <button
                  onClick={() => deleteSegment(safe)}
                  disabled={segments.length <= 1}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[14px] font-medium text-[#7f1d1d] bg-[#fee2e2] hover:bg-[#fecaca] disabled:opacity-40 disabled:hover:bg-[#fee2e2] transition-colors"
                  style={{ fontFamily: SANS }}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// Page-range / page-count badge in the sommaire. Filled secondary on the
// selected (dark) row, outlined elsewhere.
function SegBadge({ active, children }) {
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[12px] leading-[16px] font-medium tabular-nums whitespace-nowrap"
      style={active
        ? { background: '#eeece6', color: '#44403c', fontFamily: SANS }
        : { border: '1px solid #e7e5e3', color: '#44403c', fontFamily: SANS }}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Consigne de découpage - the prompt that drove this document's split.
// Seeded from the cabinet's découpage preference; editable per document.
// "Relancer le découpage" fakes a re-analysis (front sandbox).
// ─────────────────────────────────────────────────────────────────────────

function SplitPromptSection({ defaultPrompt }) {
  const base = defaultPrompt || '';
  const [text, setText] = useState(base);
  const [applying, setApplying] = useState(false);
  const [appliedFlash, setAppliedFlash] = useState(false);
  const dirty = text !== base;

  useEffect(() => { setText(defaultPrompt || ''); }, [defaultPrompt]);

  const apply = () => {
    if (applying) return;
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setAppliedFlash(true);
      setTimeout(() => setAppliedFlash(false), 2200);
    }, 1200);
  };

  return (
    <div className="flex-shrink-0 border-t border-[#e7e5e3] flex flex-col gap-4 px-5 py-4">
      <span className="text-[11px] uppercase text-[#78716c]" style={{ fontFamily: MONO }}>
        Consignes de découpage
      </span>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={applying}
        placeholder="Décrivez comment découper ce document…"
        className="w-full rounded-md bg-white border border-[#e7e5e3] focus:outline-none focus:border-[#a8a29e] transition-colors"
        style={{
          fontFamily: SANS,
          fontSize: 14,
          lineHeight: '20px',
          color: '#292524',
          padding: '10px 12px',
          minHeight: 80,
          maxHeight: 160,
          resize: 'vertical',
          overflowY: 'auto',
          boxShadow: SHADOW_XS,
          opacity: applying ? 0.6 : 1,
        }}
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setText(base)}
          disabled={!dirty || applying}
          className="inline-flex items-center gap-2 h-8 px-3 rounded-lg text-[14px] font-medium text-[#292524] hover:bg-[#f8f7f5] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-default transition-colors"
          title="Restaurer la consigne du cabinet"
          style={{ fontFamily: SANS }}
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={apply}
          disabled={applying}
          className="inline-flex items-center gap-2 h-8 px-3 text-[14px] font-medium text-[#44403c] bg-[#eeece6] rounded-lg hover:bg-[#e7e5e3] disabled:opacity-60 transition-colors"
          style={{ fontFamily: SANS }}
        >
          {applying ? (
            <>
              <span className="inline-block w-3.5 h-3.5 rounded-full border-[1.5px] border-[#a8a29e]/40 border-t-[#78716c] animate-spin" />
              Analyse…
            </>
          ) : appliedFlash ? (
            <>
              <Check className="w-4 h-4" strokeWidth={2.5} style={{ color: '#4a9168' }} />
              Relancé
            </>
          ) : (
            <>
              <Play className="w-4 h-4" strokeWidth={2} />
              Relancer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page card - borderless, floating on layered shadows
// ─────────────────────────────────────────────────────────────────────────

// Inline rename input for a sommaire row. Enter / blur commits, Esc cancels.
function SommaireRenameInput({ initial, onCommit, onCancel }) {
  const [draft, setDraft] = useState(initial);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); onCommit(draft); }
        else if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
      }}
      className="w-full text-[14px] leading-[20px] font-medium text-[#1c1917] bg-white rounded px-1.5 py-0.5 -ml-1.5 outline-none ring-2 ring-[#1c1917]/15"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    />
  );
}

function MockPage({ pageNum, relIdx, segment, docNumber, first, last }) {
  const blocks = useMemo(() => {
    const rows = [];
    const seed = pageNum * 31 + relIdx;
    const lineCount = 14 + (seed % 6);
    for (let i = 0; i < lineCount; i++) rows.push(0.55 + ((seed + i * 17) % 38) / 100);
    return rows;
  }, [pageNum, relIdx]);

  return (
    <div
      className="bg-white rounded-xl border border-[#e7e5e3] flex flex-col transition-shadow duration-200"
      style={{
        width: 520,
        minHeight: 680,
        boxShadow: SHADOW_LG,
      }}
    >
      <div className="px-11 pt-11 pb-7">
        {first ? (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[12px] uppercase tracking-[0.12em] text-[#a8a29e] font-medium truncate">{segment.emetteur || '—'}</div>
              <div className="text-[18px] leading-[28px] text-[#1c1917] font-semibold mt-1 tracking-[-0.01em] truncate">{docTitle(segment)}</div>
              <div className="text-[14px] leading-[20px] text-[#78716c] mt-0.5 tabular-nums">
                {formatDateShort(segment.date)}
              </div>
            </div>
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-lg bg-[#f5f5f4] text-[12px] font-semibold text-[#78716c] tabular-nums">
              {docNumber}
            </span>
          </div>
        ) : (
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#d6d3d1] font-medium">Suite</div>
        )}
      </div>

      <div className="flex-1 px-11 pb-11 space-y-[11px]">
        {blocks.map((w, i) => (
          <div key={i} className="h-[5px] rounded-full" style={{ width: `${Math.round(w * 100)}%`, background: i % 7 === 6 ? 'transparent' : '#f1f0ee' }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Junctions - hairline boundaries with dark pill actions
// ─────────────────────────────────────────────────────────────────────────

// Boundary between two documents: a fading hairline with a center dot.
// Hover widens the zone and springs in the dark « Recoller » pill.
function CutBoundary({ onHeal, onHoverChange }) {
  const [hover, setHover] = useState(false);
  const setH = (v) => { setHover(v); onHoverChange?.(v); };
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onHeal}
      className="relative self-stretch flex items-center justify-center cursor-pointer"
      style={{
        // Constant-size hit zone - never resizes on hover (otherwise the box
        // moves out from under the cursor and the hover flickers). The
        // "draw closer" effect is done by transforming the neighbour docs.
        paddingTop: 22,
        paddingBottom: 22,
        marginLeft: -40,
        marginRight: -40,
        // On hover the pill must straddle BOTH document cards - lift the
        // boundary above the (later-painted) card below.
        zIndex: hover ? 30 : 'auto',
      }}
      title="Recoller - fusionner les deux documents"
    >
      {/* dashed cut line, full width, always visible */}
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
        style={{
          height: 0,
          borderTop: '2px dashed',
          borderColor: hover ? 'rgba(28,25,23,0.28)' : 'rgba(168,162,158,0.6)',
          transition: 'border-color 150ms',
        }}
      />
      {/* heal pill - revealed on hover, sits in the tightened gap */}
      <span
        className="absolute left-1/2 top-1/2 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12px] font-medium text-white whitespace-nowrap"
        style={{
          background: '#1c1917',
          boxShadow: '0 2px 8px rgba(28,25,23,0.25), 0 8px 24px -6px rgba(28,25,23,0.3)',
          opacity: hover ? 1 : 0,
          transform: hover ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.85)',
          transition: 'opacity 130ms, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      >
        <Link2 className="w-3.5 h-3.5" strokeWidth={2} />
        Recoller
      </span>
    </div>
  );
}

// Ghost junction between two pages of the same document: invisible at
// rest, hover reveals the hairline + the dark « Couper » pill.
function GhostCut({ onCut }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onCut}
      className="relative w-full max-w-[560px] flex items-center justify-center cursor-pointer"
      style={{ height: hover ? 44 : 14, transition: 'height 200ms cubic-bezier(0.3, 1.2, 0.4, 1)' }}
      title="Couper ici - insérer une frontière"
    >
      <div
        className="absolute left-4 right-4 top-1/2 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(168, 162, 158, 0.5) 18%, rgba(168, 162, 158, 0.5) 82%, transparent)',
          opacity: hover ? 0.5 : 0,
          transition: 'opacity 150ms',
        }}
      />
      <span
        className="relative inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12px] font-medium text-white whitespace-nowrap"
        style={{
          background: '#1c1917',
          boxShadow: '0 2px 8px rgba(28,25,23,0.25), 0 8px 24px -6px rgba(28,25,23,0.3)',
          opacity: hover ? 1 : 0,
          transform: hover ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(2px)',
          transition: 'opacity 130ms, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      >
        <Scissors className="w-3.5 h-3.5" strokeWidth={2} />
        Couper
      </span>
    </div>
  );
}
