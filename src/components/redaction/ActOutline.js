import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Pin } from 'lucide-react';

// Floating sommaire (table-of-contents) for an acte — Notion-style minimap.
//
// Collapsed: a column of horizontal ticks whose width encodes depth (widest
// ancre → shortest sous-poste). Hover (or pin) expands inward to the full
// sommaire with labels + compact montants. Scroll-spy keeps the current section
// in ink and its ancestors on-path; clicking a row smooth-scrolls to it.
//
// This is a non-editing navigation overlay — it never mutates the acte.

const INK = '#292524';        // active — encre
const ON_PATH = '#78716c';    // ancestor of the current section
const MUTED = '#a8a29e';      // default label
const TICK = '#d6d3d1';       // default tick
const TICK_ON = '#a8a29e';    // on-path tick

// Tick width per display-rank. Ranks are derived from the levels actually
// present in the document, so a flat acte never renders an empty 5-level tree.
const TICK_WIDTHS = [22, 17, 13, 9, 6];

// Indentation is capped at this depth — deeper entries stay at the 2nd level
// rather than marching further right (fine nav is delegated to search).
const MAX_DEPTH = 2;

// Compact montant for the sommaire: euros rounded, French thousands grouping;
// reserve / mémoire keywords collapse to a short tag.
function compactMontant(m) {
  if (!m) return null;
  if (/r[ée]serv|m[ée]moire|n[ée]ant/i.test(m)) return 'rés.';
  const cleaned = m.replace(/[^\d,]/g, '').replace(',', '.');
  const v = parseFloat(cleaned);
  if (isNaN(v)) return null;
  return `${Math.round(v).toLocaleString('fr-FR')} €`;
}

export default function ActOutline({ headings, scrollRef, side = 'left' }) {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [activeId, setActiveId] = useState(headings[0]?.id ?? null);
  const [hoveredId, setHoveredId] = useState(null);
  const [availH, setAvailH] = useState(0);
  const activeRowRef = useRef(null);

  // Available height of the canvas → bounds the sommaire so it never overflows
  // (works the same in the real full-height canvas and a fixed-height frame).
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const measure = () => setAvailH(sc.clientHeight);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [scrollRef]);

  const open = expanded || pinned;

  // Tick density + depth cap. Indentation and tick width follow the outline
  // depth (document structure). Beyond a threshold we cap to 3 tick widths —
  // fine navigation is delegated to search.
  const rowH = useMemo(() => {
    const count = headings.length;
    return count > 45 ? 5 : count > 28 ? 7 : 11; // compress to stay one card
  }, [headings]);

  const tickWidth = useCallback((depth) => TICK_WIDTHS[Math.min(depth, MAX_DEPTH)], []);

  // Scroll-spy: the current section is the last heading whose top has crossed a
  // probe line just below the acte header. rAF-throttled.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = sc.getBoundingClientRect().top + 110;
      let current = headings[0]?.id ?? null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probe) current = h.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    sc.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      sc.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollRef, headings]);

  // Keep the active row visible while the expanded list scrolls.
  useEffect(() => {
    if (open && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [activeId, open]);

  // Ancestors of the active section → on-path, walking the parentId chain
  // established by the outline structure.
  const onPath = useMemo(() => {
    const byId = new Map(headings.map((h) => [h.id, h]));
    const set = new Set();
    let cur = byId.get(activeId);
    while (cur && cur.parentId) {
      set.add(cur.parentId);
      cur = byId.get(cur.parentId);
    }
    return set;
  }, [headings, activeId]);

  const goTo = useCallback(
    (id) => {
      const el = document.getElementById(id);
      const sc = scrollRef.current;
      if (!el || !sc) return;
      const offset = el.getBoundingClientRect().top - sc.getBoundingClientRect().top;
      sc.scrollTo({ top: sc.scrollTop + offset - 90, behavior: 'smooth' });
      setActiveId(id);
    },
    [scrollRef],
  );

  if (headings.length < 2) return null;

  const sideStyle = side === 'right' ? { right: 14 } : { left: 14 };

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        ...sideStyle,
        zIndex: 30,
        maxHeight: availH ? availH - 48 : 'calc(100% - 56px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {open ? (
        <div
          style={{
            width: 304,
            maxHeight: availH ? availH - 48 : 'calc(100vh - 200px)',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #e7e5e3',
            borderRadius: 12,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px 6px',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: MUTED,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Sommaire
            </span>
            <button
              onClick={() => setPinned((p) => !p)}
              title={pinned ? 'Détacher le sommaire' : 'Épingler le sommaire'}
              style={{
                display: 'flex',
                padding: 3,
                borderRadius: 5,
                border: 'none',
                cursor: 'pointer',
                background: pinned ? '#f0eee9' : 'transparent',
                color: pinned ? INK : MUTED,
              }}
            >
              <Pin style={{ width: 13, height: 13 }} strokeWidth={1.75} fill={pinned ? INK : 'none'} />
            </button>
          </div>

          {headings.map((h) => {
            const isActive = h.id === activeId;
            const isOnPath = onPath.has(h.id);
            const isHovered = h.id === hoveredId;
            const depth = Math.min(h.depth, MAX_DEPTH);
            const montant = compactMontant(h.montant);
            return (
              <button
                key={h.id}
                ref={isActive ? activeRowRef : null}
                onClick={() => goTo(h.id)}
                onMouseEnter={() => setHoveredId(h.id)}
                onMouseLeave={() => setHoveredId((id) => (id === h.id ? null : id))}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 9,
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '7px 11px',
                  paddingLeft: 11 + depth * 15,
                  borderRadius: 7,
                  background: isActive ? INK : isHovered ? '#f7f6f3' : 'transparent',
                  transition: 'background 110ms ease',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 10.5,
                    fontWeight: 600,
                    width: 20,
                    color: isActive ? 'rgba(255,255,255,0.6)' : isOnPath ? ON_PATH : MUTED,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {h.glyph}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    lineHeight: '18px',
                    fontWeight: isActive ? 600 : isOnPath ? 500 : 400,
                    color: isActive ? '#ffffff' : isOnPath ? ON_PATH : isHovered ? '#57534e' : '#8c857d',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={h.label}
                >
                  {h.label}
                </span>
                {montant && (
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 11,
                      color: isActive ? 'rgba(255,255,255,0.7)' : MUTED,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {montant}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: Math.max(0, rowH - 2),
            padding: '4px 2px',
            cursor: 'pointer',
            alignItems: side === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          {headings.map((h) => {
            const isActive = h.id === activeId;
            const isOnPath = onPath.has(h.id);
            const indent = Math.min(h.depth, MAX_DEPTH) * 5;
            return (
              <div
                key={h.id}
                style={{
                  width: tickWidth(h.depth),
                  marginRight: side === 'right' ? indent : 0,
                  marginLeft: side === 'right' ? 0 : indent,
                  height: isActive ? 3 : 2,
                  borderRadius: 2,
                  background: isActive ? INK : isOnPath ? TICK_ON : TICK,
                  transition: 'background 120ms ease, height 120ms ease',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
