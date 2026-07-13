import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Scissors, Link2, Layers, AlertCircle, RotateCcw, ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────
// Split Variants Lab — three UX explorations for the pile-split feature,
// behind an A/B/C toggle. Lives in the UI Components page (/ui-kit/split-variants).
//
//   A — La Liasse   : the pile is a physical stack you fan out or band up.
//   B — Le Massicot : a filmstrip where every boundary is a tactile cut.
//   C — Le Curseur  : splitting is a granularity dial, not a binary choice.
//
// All variants share the same demo pile (12 factures, 3 émetteurs, one
// anomaly) so they compare 1:1. Everything is mocked and local.
// ─────────────────────────────────────────────────────────────────────────

const DEMO_SEGMENTS = [
  { id: 's01', emetteur: 'CHU Poitiers',        date: '2023-01-12', montantCents: 24000, pages: 2 },
  { id: 's02', emetteur: 'CHU Poitiers',        date: '2023-02-03', montantCents: 18550, pages: 1 },
  { id: 's03', emetteur: 'Cabinet kiné Martin', date: '2023-02-17', montantCents: 12000, pages: 1 },
  { id: 's04', emetteur: 'Pharmacie du Centre', date: '2023-03-02', montantCents: 4360,  pages: 1 },
  { id: 's05', emetteur: 'CHU Poitiers',        date: '2023-03-28', montantCents: 32000, pages: 2 },
  { id: 's06', emetteur: 'Cabinet kiné Martin', date: '2023-04-11', montantCents: 12000, pages: 1 },
  { id: 's07', emetteur: 'Pharmacie du Centre', date: '2023-05-05', montantCents: null,  pages: 1, anomaly: 'Montant non détecté' },
  { id: 's08', emetteur: 'CHU Poitiers',        date: '2023-06-21', montantCents: 8900,  pages: 1 },
  { id: 's09', emetteur: 'Cabinet kiné Martin', date: '2023-07-08', montantCents: 12000, pages: 1 },
  { id: 's10', emetteur: 'Pharmacie du Centre', date: '2023-08-14', montantCents: 6720,  pages: 1 },
  { id: 's11', emetteur: 'CHU Poitiers',        date: '2023-09-30', montantCents: 15400, pages: 1 },
  { id: 's12', emetteur: 'Cabinet kiné Martin', date: '2023-10-19', montantCents: 12000, pages: 1 },
];

const ACCENT = '#a08355';
const ACCENT_BG = '#f3efe3';
const AMBER = '#b45309';

function formatEUR(cents) {
  if (cents == null) return '—';
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR');
}
function sumCents(segs) {
  return segs.reduce((a, s) => a + (s.montantCents || 0), 0);
}
function segLabel(seg) {
  return `Facture · ${formatDate(seg.date)} · ${seg.emetteur} · ${formatEUR(seg.montantCents)}`;
}

// One-time CSS for the lab's keyframe animations.
function useLabStyles() {
  useEffect(() => {
    if (document.getElementById('split-lab-styles')) return;
    const style = document.createElement('style');
    style.id = 'split-lab-styles';
    style.textContent = `
      @keyframes lab-row-in {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes lab-row-up {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes lab-band-snap {
        0%   { transform: scaleX(0.2); opacity: 0; }
        70%  { transform: scaleX(1.12); opacity: 1; }
        100% { transform: scaleX(1); opacity: 1; }
      }
      @keyframes lab-cut-draw {
        from { clip-path: inset(0 0 100% 0); }
        to   { clip-path: inset(0 0 0 0); }
      }
      @keyframes lab-detent-tick {
        0%   { transform: scale(1); }
        45%  { transform: scale(1.12); }
        100% { transform: scale(1); }
      }
      @keyframes lab-pulse-once {
        0%   { box-shadow: 0 0 0 0 rgba(180, 83, 9, 0.35); }
        100% { box-shadow: 0 0 0 10px rgba(180, 83, 9, 0); }
      }
      @keyframes lab-digit-in {
        from { opacity: 0; transform: translateY(60%); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

// Rolling number — digits swap with a vertical roll on change.
function RollingNumber({ value, style }) {
  return (
    <span style={{ display: 'inline-flex', overflow: 'hidden', ...style }}>
      {String(value).split('').map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          style={{ display: 'inline-block', animation: 'lab-digit-in 220ms cubic-bezier(0.2, 0.9, 0.3, 1)' }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Lab shell — switcher + active variant
// ─────────────────────────────────────────────────────────────────────────

const VARIANTS = [
  { key: 'A', name: 'La Liasse',   tagline: 'La pile est un objet. Éclater = l\'éventail s\'ouvre, garder = la sangle se pose.' },
  { key: 'B', name: 'Le Massicot', tagline: 'Chaque frontière est une coupe visible. On coupe, on recolle — le geste est l\'explication.' },
  { key: 'C', name: 'Le Curseur',  tagline: 'Pas un choix binaire : un grain. Une pièce ↔ par émetteur ↔ par document.' },
];

export default function SplitVariantsLab() {
  useLabStyles();
  const [variant, setVariant] = useState('A');
  const active = VARIANTS.find(v => v.key === variant);

  return (
    <div>
      {/* Switcher */}
      <div className="flex items-center gap-4 mb-2">
        <div className="inline-flex rounded-lg border border-border bg-background p-1">
          {VARIANTS.map(v => (
            <button
              key={v.key}
              onClick={() => setVariant(v.key)}
              className="px-4 h-8 rounded-md text-[13px] font-medium transition-all"
              style={
                variant === v.key
                  ? { background: '#292524', color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
                  : { background: 'transparent', color: '#78716c' }
              }
            >
              {v.key} — {v.name}
            </button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#78716c', marginBottom: 20 }}>{active.tagline}</p>

      <div
        key={variant}
        className="rounded-xl border border-border bg-white p-6"
        style={{ animation: 'lab-row-in 240ms ease-out' }}
      >
        {variant === 'A' && <VariantALiasse />}
        {variant === 'B' && <VariantBMassicot />}
        {variant === 'C' && <VariantCCurseur />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// VARIANT A — La Liasse
// ─────────────────────────────────────────────────────────────────────────

function MiniStack({ fan, banded }) {
  // 4 offset page cards. fan ∈ [0,1] drives the spread.
  const cards = [
    { r: -9, x: -14 },
    { r: -3, x: -5 },
    { r: 3,  x: 5 },
    { r: 9,  x: 14 },
  ];
  const idle = [
    { r: -2, x: -2 },
    { r: -0.5, x: -0.5 },
    { r: 1, x: 1 },
    { r: 2.5, x: 2.5 },
  ];
  return (
    <div style={{ position: 'relative', width: 72, height: 88, flexShrink: 0 }}>
      {cards.map((c, i) => {
        const t = banded ? { r: 0, x: 0 } : {
          r: idle[i].r + (c.r - idle[i].r) * fan,
          x: idle[i].x + (c.x - idle[i].x) * fan,
        };
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: '4px 8px',
              background: 'white',
              border: '1px solid #e0dcd0',
              borderRadius: 4,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transform: `rotate(${t.r}deg) translateX(${t.x}px)`,
              transition: 'transform 260ms cubic-bezier(0.34, 1.3, 0.5, 1)',
              transformOrigin: '50% 80%',
            }}
          >
            <div style={{ margin: '8px 6px 0', height: 2, background: '#ede9dd', borderRadius: 1 }} />
            <div style={{ margin: '4px 6px 0', height: 2, width: '70%', background: '#ede9dd', borderRadius: 1 }} />
            <div style={{ margin: '4px 6px 0', height: 2, width: '50%', background: '#ede9dd', borderRadius: 1 }} />
          </div>
        );
      })}
      {/* Elastic band */}
      <div
        style={{
          position: 'absolute',
          left: -4, right: -4, top: '46%', height: 7,
          background: ACCENT,
          borderRadius: 3,
          opacity: banded ? 1 : 0,
          animation: banded ? 'lab-band-snap 240ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          transition: 'opacity 120ms',
        }}
      />
    </div>
  );
}

function PaperEdgeRow({ count, totalLabel, onExplode }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', marginTop: 6 }}
    >
      {/* stacked paper edges — the depth IS the affordance */}
      {[2, 1].map(o => (
        <div
          key={o}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'white',
            border: '1px solid #e7e5e3',
            borderRadius: 8,
            transform: `translate(${hover ? o * 3 : o * 2}px, ${hover ? -o * 3 : -o * 2}px)`,
            transition: 'transform 200ms cubic-bezier(0.34, 1.3, 0.5, 1)',
            zIndex: 0,
          }}
        />
      ))}
      <div
        className="relative flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-lg"
        style={{ zIndex: 1, boxShadow: hover ? '0 4px 12px rgba(0,0,0,0.07)' : '0 1px 2px rgba(0,0,0,0.04)', transition: 'box-shadow 200ms' }}
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0" style={{ background: ACCENT_BG, color: ACCENT }}>
          <Layers className="w-4 h-4" strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] text-foreground">
            <span className="font-medium">Factures médicales</span>
            <span className="text-foreground-secondary"> ({count}) · {totalLabel}</span>
          </div>
          <div className="text-[11px] text-foreground-muted mt-0.5">issues de factures_medicales_2023.pdf</div>
        </div>
        <button
          onClick={onExplode}
          className="text-[12px] px-3 py-1.5 rounded-md border border-border-strong text-foreground-tertiary hover:bg-background-canvas transition-colors"
        >
          Éclater en {count} pièces
        </button>
      </div>
    </div>
  );
}

function VariantALiasse() {
  const [phase, setPhase] = useState('review'); // review | grouped | exploded
  const [hoverSide, setHoverSide] = useState(null); // 'keep' | 'explode' | null
  const total = formatEUR(sumCents(DEMO_SEGMENTS));
  const count = DEMO_SEGMENTS.length;

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-wide text-foreground-muted font-medium">Zone « À vérifier »</span>
        {phase !== 'review' && (
          <button
            onClick={() => { setPhase('review'); setHoverSide(null); }}
            className="inline-flex items-center gap-1.5 text-[12px] text-foreground-secondary hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
            Rejouer la décision
          </button>
        )}
      </div>

      {/* Review card */}
      {phase === 'review' && (
        <div className="rounded-xl border bg-white p-5 flex items-center gap-5" style={{ borderColor: '#ece8db', background: '#faf8f3' }}>
          <MiniStack fan={hoverSide === 'explode' ? 1 : 0} banded={hoverSide === 'keep'} />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] text-foreground">
              <span className="font-medium">Factures médicales</span>
              <span className="text-foreground-secondary"> · {count} documents détectés · {total} · janv. → oct. 2023</span>
            </div>
            <div className="text-[12px] text-foreground-muted mt-0.5 mb-3">factures_medicales_2023.pdf</div>
            <div className="flex items-center gap-2">
              <button
                onMouseEnter={() => setHoverSide('keep')}
                onMouseLeave={() => setHoverSide(null)}
                onClick={() => setPhase('grouped')}
                className="h-9 px-4 text-[13px] font-medium rounded-md border bg-white transition-all"
                style={{ borderColor: hoverSide === 'keep' ? ACCENT : '#d6d3d1', color: hoverSide === 'keep' ? ACCENT : '#292524' }}
              >
                Garder en une pièce
              </button>
              <button
                onMouseEnter={() => setHoverSide('explode')}
                onMouseLeave={() => setHoverSide(null)}
                onClick={() => setPhase('exploded')}
                className="h-9 px-4 text-[13px] font-medium rounded-md border bg-white transition-all"
                style={{ borderColor: hoverSide === 'explode' ? ACCENT : '#d6d3d1', color: hoverSide === 'explode' ? ACCENT : '#292524' }}
              >
                Éclater en {count} pièces
              </button>
            </div>
            <div className="text-[11px] text-foreground-muted mt-2" style={{ minHeight: 14 }}>
              {hoverSide === 'keep' && 'La pile reste un seul objet — la sangle se pose.'}
              {hoverSide === 'explode' && 'L\'éventail s\'ouvre — chaque document devient une pièce.'}
            </div>
          </div>
        </div>
      )}

      {/* Result list */}
      {phase === 'grouped' && (
        <div style={{ animation: 'lab-row-in 280ms cubic-bezier(0.2, 0.9, 0.3, 1)' }}>
          <PaperEdgeRow count={count} totalLabel={total} onExplode={() => setPhase('exploded')} />
        </div>
      )}

      {phase === 'exploded' && (
        <div>
          {/* group bandeau */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg border border-b-0 border-border bg-background text-[11px] text-foreground-secondary"
            style={{ animation: 'lab-row-in 200ms ease-out' }}
          >
            <Layers className="w-3 h-3" strokeWidth={1.75} />
            <span>
              <RollingNumber value={count} /> pièces issues de factures_medicales_2023.pdf
            </span>
            <button
              onClick={() => setPhase('grouped')}
              className="ml-auto underline underline-offset-2 text-foreground hover:text-[#a08355] font-medium transition-colors"
            >
              Regrouper en une pièce
            </button>
          </div>
          <div className="border border-border rounded-b-lg overflow-hidden">
            {DEMO_SEGMENTS.map((seg, i) => (
              <div
                key={seg.id}
                className="flex items-center gap-3 px-4 py-2 bg-white border-b border-[#f5f4f1] last:border-b-0"
                style={{ animation: `lab-row-in 320ms cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 45}ms both` }}
              >
                <span className="text-[11px] tabular-nums text-foreground-muted w-6">{i + 1}</span>
                <span className="text-[13px] text-foreground flex-1 truncate">{segLabel(seg)}</span>
                {seg.anomaly && <AlertCircle className="w-3.5 h-3.5" style={{ color: AMBER }} strokeWidth={1.75} title={seg.anomaly} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// VARIANT B — Le Massicot
// ─────────────────────────────────────────────────────────────────────────

function VariantBMassicot() {
  const [segments, setSegments] = useState(DEMO_SEGMENTS);
  const [justCutKey, setJustCutKey] = useState(null);
  const junctionRefs = useRef(new Map());
  const stripRef = useRef(null);

  const reset = () => { setSegments(DEMO_SEGMENTS); setJustCutKey(null); };

  // Flatten into page list with junction metadata.
  // junction after page (segIdx, relIdx): 'cut' if last page of a segment
  // (and not the global last), 'within' otherwise.
  const pages = useMemo(() => {
    const out = [];
    segments.forEach((seg, segIdx) => {
      for (let p = 0; p < seg.pages; p++) {
        out.push({ seg, segIdx, relIdx: p, first: p === 0, last: p === seg.pages - 1 });
      }
    });
    return out;
  }, [segments]);

  const mergeAt = (segIdx) => {
    // remove boundary between segIdx and segIdx+1
    setSegments(prev => {
      if (segIdx >= prev.length - 1) return prev;
      const a = prev[segIdx], b = prev[segIdx + 1];
      const merged = {
        ...a,
        id: `${a.id}+${b.id}`,
        pages: a.pages + b.pages,
        montantCents: (a.montantCents || 0) + (b.montantCents || 0),
        anomaly: a.anomaly || b.anomaly,
      };
      return [...prev.slice(0, segIdx), merged, ...prev.slice(segIdx + 2)];
    });
  };

  const splitAt = (segIdx, relPage) => {
    const key = `${segIdx}-${relPage}`;
    setJustCutKey(key);
    setSegments(prev => {
      const seg = prev[segIdx];
      if (relPage < 1 || relPage >= seg.pages) return prev;
      const a = { ...seg, id: `${seg.id}-a`, pages: relPage, montantCents: seg.montantCents != null ? Math.round(seg.montantCents / 2) : null };
      const b = { ...seg, id: `${seg.id}-b`, pages: seg.pages - relPage, montantCents: seg.montantCents != null ? seg.montantCents - Math.round(seg.montantCents / 2) : null };
      return [...prev.slice(0, segIdx), a, b, ...prev.slice(segIdx + 1)];
    });
    setTimeout(() => setJustCutKey(null), 400);
  };

  const total = sumCents(segments);

  // Barcode minimap: tick at each boundary position (fraction of pages).
  const totalPages = pages.length;
  const boundaries = useMemo(() => {
    const out = [];
    let acc = 0;
    segments.forEach((seg, i) => {
      acc += seg.pages;
      if (i < segments.length - 1) {
        out.push({ frac: acc / totalPages, anomaly: !!(seg.anomaly || segments[i + 1].anomaly), segIdx: i });
      }
    });
    return out;
  }, [segments, totalPages]);

  const scrollToJunction = (segIdx) => {
    const el = junctionRefs.current.get(segIdx);
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div style={{ maxWidth: 880 }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-wide text-foreground-muted font-medium">Carte « À vérifier » — dépliée en établi de coupe</span>
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-[12px] text-foreground-secondary hover:text-foreground transition-colors">
          <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
          Réinitialiser
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#ece8db' }}>
        {/* Header with live ticker */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ece8db]" style={{ background: '#faf8f3' }}>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0" style={{ background: ACCENT_BG, color: ACCENT }}>
            <Scissors className="w-4 h-4" strokeWidth={1.75} />
          </span>
          <div className="flex-1 text-[14px] text-foreground">
            <span className="font-medium">Factures médicales</span>
            <span className="text-foreground-secondary"> · factures_medicales_2023.pdf</span>
          </div>
          <div className="text-[13px] tabular-nums text-foreground flex items-baseline gap-1">
            <RollingNumber value={segments.length} style={{ fontWeight: 600 }} />
            <span className="text-foreground-secondary">documents ·</span>
            <span className="font-medium">{formatEUR(total)}</span>
          </div>
        </div>

        {/* Filmstrip */}
        <div ref={stripRef} className="overflow-x-auto px-5 py-6" style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #f4f1ea 100%)' }}>
          <div className="flex items-center" style={{ width: 'max-content' }}>
            {pages.map((pg, i) => {
              const isLastGlobal = i === pages.length - 1;
              return (
                <React.Fragment key={`${pg.seg.id}-${pg.relIdx}`}>
                  <PageThumb pg={pg} />
                  {!isLastGlobal && pg.last && (
                    <CutJunction
                      ref={(el) => { if (el) junctionRefs.current.set(pg.segIdx, el); else junctionRefs.current.delete(pg.segIdx); }}
                      justCut={justCutKey != null}
                      anomaly={!!(pg.seg.anomaly || segments[pg.segIdx + 1]?.anomaly)}
                      onHeal={() => mergeAt(pg.segIdx)}
                    />
                  )}
                  {!isLastGlobal && !pg.last && (
                    <GhostJunction onCut={() => splitAt(pg.segIdx, pg.relIdx + 1)} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Barcode minimap */}
        <div className="px-5 pb-4" style={{ background: '#f4f1ea' }}>
          <div
            className="relative h-5 rounded border bg-white"
            style={{ borderColor: '#e0dcd0' }}
            title="Minimap — un trait par coupe. Cliquer pour y aller."
          >
            {boundaries.map((b, i) => (
              <button
                key={i}
                onClick={() => scrollToJunction(b.segIdx)}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${b.frac * 100}%`,
                  width: 7,
                  marginLeft: -3.5,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <span style={{ width: 2, height: '100%', background: b.anomaly ? AMBER : ACCENT, opacity: 0.85, borderRadius: 1 }} />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-foreground-muted">p. 1</span>
            <span className="text-[10px] text-foreground-muted">{segments.length - 1} coupes · p. {totalPages}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[#ece8db] bg-white">
          <span className="text-[11px] text-foreground-muted mr-auto">Survolez entre deux pages pour couper · survolez une coupe pour recoller</span>
          <button className="h-8 px-3 text-[12px] font-medium rounded-md border border-border-strong bg-background text-foreground hover:bg-[#f5f4f1] transition-colors">
            Garder en une pièce
          </button>
          <button className="h-8 px-3 text-[12px] font-medium rounded-md text-white transition-colors" style={{ background: '#292524' }}>
            Éclater en <RollingNumber value={segments.length} /> pièces
          </button>
        </div>
      </div>
    </div>
  );
}

function PageThumb({ pg }) {
  const lines = useMemo(() => {
    const seed = pg.seg.id.charCodeAt(1) * 7 + pg.relIdx * 13;
    return Array.from({ length: 6 }).map((_, i) => 0.5 + ((seed + i * 11) % 45) / 100);
  }, [pg.seg.id, pg.relIdx]);
  return (
    <div
      className="flex-shrink-0 bg-white rounded border flex flex-col"
      style={{
        width: 92,
        height: 122,
        borderColor: pg.seg.anomaly ? AMBER : '#e0dcd0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        animation: pg.seg.anomaly ? 'lab-pulse-once 900ms ease-out 300ms 1' : 'none',
      }}
      title={segLabel(pg.seg)}
    >
      <div className="px-2 pt-2 pb-1 border-b border-[#f5f4f1]">
        {pg.first ? (
          <>
            <div className="text-[7px] uppercase tracking-wide truncate" style={{ color: ACCENT }}>{pg.seg.emetteur}</div>
            <div className="text-[8px] text-foreground-secondary truncate">{formatDate(pg.seg.date)}</div>
          </>
        ) : (
          <div className="text-[7px] text-foreground-muted">(suite)</div>
        )}
      </div>
      <div className="flex-1 px-2 py-1.5 space-y-1">
        {lines.map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w * 100}%`, background: '#ede9dd', borderRadius: 1 }} />
        ))}
      </div>
      <div className="px-2 pb-1.5 text-right">
        {pg.last && (
          <span className="text-[8px] font-medium tabular-nums" style={{ color: pg.seg.montantCents == null ? AMBER : '#44403c' }}>
            {formatEUR(pg.seg.montantCents)}
          </span>
        )}
      </div>
    </div>
  );
}

// Existing cut between two documents — hover morphs it into a heal pill.
const CutJunction = React.forwardRef(function CutJunction({ onHeal, anomaly, justCut }, ref) {
  const [hover, setHover] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex-shrink-0 relative flex flex-col items-center justify-center"
      style={{
        width: hover ? 64 : 28,
        height: 122,
        transition: 'width 220ms cubic-bezier(0.34, 1.3, 0.5, 1)',
        cursor: 'pointer',
      }}
      onClick={onHeal}
      title="Recoller — fusionner les deux documents"
    >
      {/* cut line */}
      <div
        style={{
          position: 'absolute',
          top: 6, bottom: 6,
          left: '50%',
          width: 0,
          borderLeft: `2px dashed ${anomaly ? AMBER : ACCENT}`,
          opacity: hover ? 0.35 : 0.8,
          animation: justCut ? 'lab-cut-draw 140ms ease-out' : 'none',
          transition: 'opacity 150ms',
        }}
      />
      {/* grip notch */}
      <div
        style={{
          position: 'absolute',
          top: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 10, height: 10,
          borderRadius: 5,
          background: anomaly ? AMBER : ACCENT,
          opacity: hover ? 0 : 1,
          transition: 'opacity 150ms',
        }}
      />
      {/* heal pill on hover */}
      <span
        className="relative inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-white text-[10px] font-medium whitespace-nowrap"
        style={{
          borderColor: ACCENT,
          color: ACCENT,
          opacity: hover ? 1 : 0,
          transform: hover ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 150ms, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Link2 className="w-3 h-3" strokeWidth={2} />
        Recoller
      </span>
    </div>
  );
});

// Potential cut between two pages of the same document — ghost line + scissors.
function GhostJunction({ onCut }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onCut}
      className="flex-shrink-0 relative flex flex-col items-center justify-center"
      style={{
        width: hover ? 52 : 10,
        height: 122,
        transition: 'width 220ms cubic-bezier(0.34, 1.3, 0.5, 1)',
        cursor: hover ? 'pointer' : 'default',
      }}
      title="Couper ici"
    >
      <div
        style={{
          position: 'absolute',
          top: 6, bottom: 6,
          left: '50%',
          width: 0,
          borderLeft: `2px dashed ${ACCENT}`,
          opacity: hover ? 0.5 : 0,
          transition: 'opacity 150ms',
        }}
      />
      <span
        className="relative inline-flex items-center gap-1 px-2 py-1 rounded-full border border-dashed bg-white text-[10px] font-medium whitespace-nowrap"
        style={{
          borderColor: ACCENT,
          color: ACCENT,
          opacity: hover ? 1 : 0,
          transform: hover ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 150ms, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Scissors className="w-3 h-3" strokeWidth={2} />
        Couper
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// VARIANT C — Le Curseur
// ─────────────────────────────────────────────────────────────────────────

const GRAIN_STOPS = [
  { key: 'one',      label: 'Une pièce' },
  { key: 'emitter',  label: 'Par émetteur' },
  { key: 'document', label: 'Par document' },
];

function VariantCCurseur() {
  const [grain, setGrain] = useState('one');
  const [dragX, setDragX] = useState(null); // px within track while dragging
  const [ticking, setTicking] = useState(false);
  const trackRef = useRef(null);

  const emitterGroups = useMemo(() => {
    const map = new Map();
    DEMO_SEGMENTS.forEach(seg => {
      if (!map.has(seg.emetteur)) map.set(seg.emetteur, []);
      map.get(seg.emetteur).push(seg);
    });
    return [...map.entries()].map(([emetteur, segs]) => ({ emetteur, segs }));
  }, []);

  const stopIdx = GRAIN_STOPS.findIndex(s => s.key === grain);
  const total = formatEUR(sumCents(DEMO_SEGMENTS));

  const pieceCount = grain === 'one' ? 1 : grain === 'emitter' ? emitterGroups.length : DEMO_SEGMENTS.length;

  // Thumb position: while dragging follow pointer with magnetic detents;
  // otherwise sit on the active stop.
  const thumbFrac = (() => {
    if (dragX != null && trackRef.current) {
      const w = trackRef.current.offsetWidth;
      let f = Math.max(0, Math.min(1, dragX / w));
      // magnetic detents — ease toward the nearest stop when within 12%
      for (let i = 0; i < 3; i++) {
        const stop = i / 2;
        if (Math.abs(f - stop) < 0.12) { f = stop + (f - stop) * 0.35; break; }
      }
      return f;
    }
    return stopIdx / 2;
  })();

  const applyFromFrac = (f) => {
    const nearest = Math.round(f * 2);
    const next = GRAIN_STOPS[Math.max(0, Math.min(2, nearest))].key;
    if (next !== grain) {
      setGrain(next);
      setTicking(true);
      setTimeout(() => setTicking(false), 320);
    }
  };

  const onPointerDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const move = (ev) => setDragX(ev.clientX - rect.left);
    const up = (ev) => {
      const f = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      applyFromFrac(f);
      setDragX(null);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    setDragX(e.clientX - rect.left);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-wide text-foreground-muted font-medium">Le grain de la pile — un seul contrôle, partout</span>
        <span className="text-[12px] tabular-nums text-foreground-secondary">
          <RollingNumber value={pieceCount} style={{ fontWeight: 600, color: '#292524' }} /> pièce{pieceCount > 1 ? 's' : ''} · {total}
        </span>
      </div>

      {/* The dial */}
      <div className="rounded-xl border bg-white p-5 mb-4" style={{ borderColor: '#ece8db', background: '#faf8f3' }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0" style={{ background: ACCENT_BG, color: ACCENT }}>
            <Layers className="w-4 h-4" strokeWidth={1.75} />
          </span>
          <div className="text-[14px] text-foreground">
            <span className="font-medium">Factures médicales</span>
            <span className="text-foreground-secondary"> · factures_medicales_2023.pdf</span>
          </div>
        </div>

        <div className="px-2 pt-1 pb-0.5">
          {/* track */}
          <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            className="relative h-8 cursor-pointer select-none"
            style={{ touchAction: 'none' }}
          >
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full" style={{ background: '#e0dcd0' }} />
            {/* fill */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full"
              style={{
                width: `${thumbFrac * 100}%`,
                background: ACCENT,
                transition: dragX != null ? 'none' : 'width 280ms cubic-bezier(0.34, 1.3, 0.5, 1)',
              }}
            />
            {/* detent dots */}
            {[0, 1, 2].map(i => (
              <button
                key={i}
                onClick={() => applyFromFrac(i / 2)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 bg-white"
                style={{ left: `${(i / 2) * 100}%`, borderColor: i <= stopIdx ? ACCENT : '#d6d3d1', transition: 'border-color 200ms' }}
              />
            ))}
            {/* thumb */}
            <div
              className="absolute top-1/2 w-5 h-5 rounded-full border-2 bg-white shadow-md"
              style={{
                left: `${thumbFrac * 100}%`,
                transform: 'translate(-50%, -50%)',
                borderColor: ACCENT,
                transition: dragX != null ? 'none' : 'left 280ms cubic-bezier(0.34, 1.3, 0.5, 1)',
                animation: ticking ? 'lab-detent-tick 240ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                cursor: 'grab',
              }}
            />
          </div>
          {/* labels */}
          <div className="relative h-5 mt-0.5">
            {GRAIN_STOPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => applyFromFrac(i / 2)}
                className="absolute text-[11px] font-medium transition-colors whitespace-nowrap"
                style={{
                  left: `${(i / 2) * 100}%`,
                  transform: i === 0 ? 'none' : i === 2 ? 'translateX(-100%)' : 'translateX(-50%)',
                  color: grain === s.key ? '#292524' : '#a8a29e',
                }}
              >
                {s.label}
                {s.key === 'emitter' && ` (${emitterGroups.length})`}
                {s.key === 'document' && ` (${DEMO_SEGMENTS.length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[11px] text-foreground-muted mt-2 px-2">La position du curseur est l'état — revenir en arrière, c'est annuler. Aucune confirmation nécessaire.</div>
      </div>

      {/* Live preview — morphs with the grain */}
      <div key={grain} className="border border-border rounded-lg overflow-hidden">
        {grain === 'one' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white" style={{ animation: 'lab-row-up 260ms cubic-bezier(0.2, 0.9, 0.3, 1)' }}>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md" style={{ background: ACCENT_BG, color: ACCENT }}>
              <Layers className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <div className="text-[14px] text-foreground">
              <span className="font-medium">Factures médicales</span>
              <span className="text-foreground-secondary"> (12) · {total} · janv. → oct. 2023</span>
            </div>
          </div>
        )}
        {grain === 'emitter' && emitterGroups.map((g, i) => (
          <div
            key={g.emetteur}
            className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-[#f5f4f1] last:border-b-0"
            style={{ animation: `lab-row-up 280ms cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 60}ms both` }}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md" style={{ background: ACCENT_BG, color: ACCENT }}>
              <Layers className="w-3.5 h-3.5" strokeWidth={1.75} />
            </span>
            <div className="text-[13px] text-foreground flex-1">
              <span className="font-medium">Factures — {g.emetteur}</span>
              <span className="text-foreground-secondary"> ({g.segs.length}) · {formatEUR(sumCents(g.segs))}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-foreground-muted" strokeWidth={1.75} />
          </div>
        ))}
        {grain === 'document' && DEMO_SEGMENTS.map((seg, i) => (
          <div
            key={seg.id}
            className="flex items-center gap-3 px-4 py-2 bg-white border-b border-[#f5f4f1] last:border-b-0"
            style={{ animation: `lab-row-up 300ms cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 30}ms both` }}
          >
            <span className="text-[11px] tabular-nums text-foreground-muted w-6">{i + 1}</span>
            <span className="text-[13px] text-foreground flex-1 truncate">{segLabel(seg)}</span>
            {seg.anomaly && <AlertCircle className="w-3.5 h-3.5" style={{ color: AMBER }} strokeWidth={1.75} title={seg.anomaly} />}
          </div>
        ))}
      </div>
    </div>
  );
}
