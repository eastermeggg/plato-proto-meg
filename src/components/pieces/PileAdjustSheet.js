import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Scissors, Link2, Sparkles, Check, IterationCcw, Pencil } from 'lucide-react';
import Input from '../ui/Input';

// "Ajuster le découpage" — right-side sheet (slideInRight, 1040px).
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

export default function PileAdjustSheet({ pile, rule, splitPrompt, onClose, onCommit, onChoose }) {
  const [segments, setSegments] = useState(pile.segments);
  const [activeIdx, setActiveIdx] = useState(0);
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
    setActiveIdx(0);
    undoStack.current = [];
  }, [pile.id, pile.segments]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        const prev = undoStack.current.pop();
        if (prev) setSegments(prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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
  }, [segments]);

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

  // Rename a document — stores a custom name that overrides the derived
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

  const recommended = rule === 'explode' ? 'exploded' : rule === 'group' ? 'bundle' : null;

  const commitAndChoose = (mode) => {
    onCommit(segments);
    onChoose(mode);
  };

  const scrollToSegment = (idx) => {
    setActiveIdx(idx); // immediate active state — don't wait for the scroll observer
    const el = segmentRefs.current.get(idx);
    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const safe = Math.min(activeIdx, segments.length - 1);
  const active = segments[safe];

  return (
    <>
    {/* Backdrop */}
    <div
      onClick={onClose}
      className="fixed inset-0 z-20"
      style={{ background: 'rgba(28, 25, 23, 0.5)', animation: 'fadeIn 0.2s ease-out' }}
    />
    <div
      className="fixed right-0 top-0 h-screen bg-white z-30 flex flex-col"
      style={{ width: '1040px', animation: 'slideInRight 0.2s ease-out', boxShadow: '-8px 0 40px -12px rgba(28, 25, 23, 0.18)' }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white border-b border-[#f0efed]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-[#f5f5f4] text-[#44403c]">
            <Scissors className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="text-[16px] leading-[24px] font-semibold text-[#1c1917] truncate tracking-[-0.01em]">Ajuster le découpage</div>
            <div className="text-[12px] leading-[16px] text-[#a8a29e] truncate">{pile.originalName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => commitAndChoose('bundle')}
            className="h-9 px-4 text-[14px] font-medium rounded-lg transition-all"
            style={recommended === 'bundle'
              ? { background: '#1c1917', color: 'white', boxShadow: '0 1px 2px rgba(28,25,23,0.2)' }
              : { background: 'white', color: '#44403c', border: '1px solid #e7e5e3' }}
          >
            Garder en une pièce
          </button>
          <button
            onClick={() => commitAndChoose('exploded')}
            className="h-9 px-4 text-[14px] font-medium rounded-lg transition-all"
            style={recommended === 'exploded'
              ? { background: '#1c1917', color: 'white', boxShadow: '0 1px 2px rgba(28,25,23,0.2)' }
              : { background: 'white', color: '#44403c', border: '1px solid #e7e5e3' }}
          >
            Éclater en {segments.length} pièces
          </button>
          <span className="w-px h-6 bg-[#e7e5e3] mx-1" />
          <button onClick={onClose} className="p-2 text-[#a8a29e] hover:text-[#44403c] hover:bg-[#f5f5f4] rounded-lg transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left — prompt + sommaire */}
        <div className="w-[296px] flex flex-col bg-white flex-shrink-0 border-r border-[#f0efed]">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
            <span className="text-[14px] leading-[20px] font-medium text-[#292524]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>Découpage</span>
            <span className="text-[12px] text-[#a8a29e] tabular-nums">{segments.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {segments.map((seg, idx) => {
              const isActive = idx === safe;
              const isRenaming = renamingIdx === idx;
              return (
                <div
                  key={seg.id}
                  ref={(el) => { if (el) sommaireRowRefs.current.set(idx, el); else sommaireRowRefs.current.delete(idx); }}
                  onClick={() => { if (!isRenaming) scrollToSegment(idx); }}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors flex items-start gap-2.5 group cursor-pointer"
                  style={{
                    background: isActive ? '#1c1917' : 'transparent',
                    boxShadow: isActive ? '0 1px 2px rgba(28,25,23,0.18), 0 6px 16px -6px rgba(28,25,23,0.35)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#fafaf9'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span
                    className="text-[11px] tabular-nums mt-[2px] w-6 flex-shrink-0 transition-colors"
                    style={{ color: isActive ? '#ffffff' : '#d6d3d1', fontWeight: isActive ? 600 : 400 }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {isRenaming ? (
                      <SommaireRenameInput
                        initial={seg._customName || seg.label}
                        onCommit={(name) => { renameSegment(idx, name); setRenamingIdx(null); }}
                        onCancel={() => setRenamingIdx(null)}
                      />
                    ) : (
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[14px] leading-[20px] truncate" style={{ color: isActive ? '#ffffff' : '#44403c', fontWeight: isActive ? 500 : 400 }}>
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
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className="inline-flex items-center h-[18px] px-1.5 rounded text-[10px] font-medium tabular-nums"
                        style={isActive ? { background: 'rgba(255,255,255,0.14)', color: '#e7e5e4' } : { background: '#f5f5f4', color: '#78716c' }}
                      >
                        {seg.pages === 1 ? `P.${seg.pageStart}` : `P.${seg.pageStart}–${seg.pageEnd}`}
                      </span>
                      <span
                        className="inline-flex items-center h-[18px] px-1.5 rounded text-[10px] font-medium tabular-nums"
                        style={isActive ? { background: 'rgba(255,255,255,0.14)', color: '#e7e5e4' } : { background: '#f5f5f4', color: '#78716c' }}
                      >
                        {seg.pages} p.
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <SplitPromptSection defaultPrompt={splitPrompt} />
        </div>

        {/* Right — continuous reading flow */}
        <div className="flex-1 min-w-0 relative bg-[#f8f7f5]">
          {/* Floating breadcrumb */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div
              className="flex items-center gap-2 h-8 px-3.5 rounded-full bg-white/85 text-[12px]"
              style={{ backdropFilter: 'blur(8px)', boxShadow: '0 1px 2px rgba(28,25,23,0.06), 0 4px 16px -4px rgba(28,25,23,0.12)' }}
            >
              <span className="text-[#78716c] tabular-nums">
                <span className="text-[#1c1917] font-semibold">{safe + 1}</span>
                <span className="mx-0.5 text-[#d6d3d1]">/</span>{segments.length}
              </span>
              <span className="w-px h-3.5 bg-[#e7e5e3]" />
              <span className="text-[#44403c] font-medium truncate" style={{ maxWidth: 320 }}>
                {active ? docTitle(active) : ''}
              </span>
              <span className="text-[#a8a29e] tabular-nums">{formatDateShort(active?.date)}</span>
            </div>
          </div>

          {/* Scrollable preview */}
          <div ref={previewScrollRef} className="absolute inset-0 overflow-y-auto px-10 pt-16 pb-10 flex flex-col items-center">
            {segments.map((seg, idx) => {
              // When a boundary is hovered, the doc above it slides down and
              // the doc below slides up — previewing the stitch. Pure transform
              // (no reflow) so the boundary's hit area never moves → no flicker.
              const dy = stitchHover === idx ? -16 : stitchHover === idx + 1 ? 16 : 0;
              return (
              <React.Fragment key={seg.id}>
                {idx > 0 && (
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
                      {p < seg.pages - 1 && <GhostCut onCut={() => splitAtPage(idx, p + 1)} />}
                    </React.Fragment>
                  ))}
                </div>
              </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Consigne de découpage — the prompt that drove this document's split.
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
    <div className="flex-shrink-0 border-t border-[#f0efed] px-5 pt-4 pb-4">
      <Input
        label="Consigne de découpage"
        aiGenerated
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={applying}
          placeholder="Décrivez comment découper ce document…"
          className="w-full rounded-md bg-[#f8f7f5] border border-[#e7e5e3] focus:outline-none focus:border-[#a8a29e] transition-colors"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            lineHeight: '20px',
            color: '#292524',
            padding: '8px 10px',
            minHeight: 96,
            maxHeight: 160,
            resize: 'vertical',
            overflowY: 'auto',
            boxShadow: '0 1px 2px rgba(26,26,26,0.05)',
            opacity: applying ? 0.6 : 1,
          }}
        />
      </Input>
      <div className="flex items-center gap-2 mt-2.5">
        <button
          type="button"
          onClick={() => setText(base)}
          disabled={!dirty || applying}
          className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md text-[14px] font-medium text-[#292524] hover:bg-[#f8f7f5] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-default transition-colors"
          title="Restaurer la consigne du cabinet"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          <IterationCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={apply}
          disabled={applying}
          className="ml-auto inline-flex items-center gap-1.5 h-9 px-3 text-[14px] font-medium text-[#292524] bg-white border border-[#e7e5e3] rounded-md hover:bg-[#f8f7f5] disabled:opacity-60 transition-colors"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          {applying ? (
            <>
              <span className="inline-block w-3 h-3 rounded-full border-[1.5px] border-[#a8a29e]/40 border-t-[#78716c] animate-spin" />
              Analyse…
            </>
          ) : appliedFlash ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: '#4a9168' }} />
              Relancé
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              Relancer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page card — borderless, floating on layered shadows
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
      className="bg-white rounded-2xl flex flex-col transition-shadow duration-200"
      style={{
        width: 520,
        minHeight: 680,
        boxShadow: '0 1px 2px rgba(28,25,23,0.04), 0 12px 32px -8px rgba(28,25,23,0.08)',
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
// Junctions — hairline boundaries with dark pill actions
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
        // Constant-size hit zone — never resizes on hover (otherwise the box
        // moves out from under the cursor and the hover flickers). The
        // "draw closer" effect is done by transforming the neighbour docs.
        paddingTop: 22,
        paddingBottom: 22,
        marginLeft: -40,
        marginRight: -40,
        // On hover the pill must straddle BOTH document cards — lift the
        // boundary above the (later-painted) card below.
        zIndex: hover ? 30 : 'auto',
      }}
      title="Recoller — fusionner les deux documents"
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
      {/* heal pill — revealed on hover, sits in the tightened gap */}
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
      title="Couper ici — insérer une frontière"
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
