import React, { useEffect, useMemo, useRef, useState } from 'react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';

/**
 * Chart — Plato design system. Source de vérité : page Figma « Chart »
 * (canvas 2819:21571) : Area Charts (6760:2820), Bar Charts (6915:1832),
 * Pie Charts (6915:2760), Chart Subcomponents (6924:5115 — Tooltip 6924:5312,
 * Legend 6926:1710, Chart Dot 6926:1714).
 *
 * Graphes SVG pur maison (aucune lib), data-driven, sur la rampe
 * `colors.chart` (5 bleus). Types couverts (relevés dans le set) :
 *   bar · bar-horizontal · bar-stacked · line · area · area-stacked ·
 *   pie · donut
 * Non couverts (maquettés mais hors périmètre V1, cf. fiche) : step, gradient,
 * radar, radial, barres négatives, labels sur barres.
 *
 * Relevé Figma → tokens :
 *  - Grille : 5 filets 1px — colors.semantic.border (Figma var(--border)).
 *  - Libellés d'axe : 12px, colors.semantic.mutedForeground.
 *  - Barres : fill rampe chart, radius 8 (plafonné à la demi-largeur).
 *  - Aires : trait 1px couleur de série + remplissage même couleur à 40 %.
 *  - Tooltip : fond background, bord border, radius 8, ombre (shadows.xs, le
 *    shadow/lg Figma n'a pas de token), titre caption-medium, clés 8px r2.
 *  - Légende : pastilles 8px r2 + libellé 12px foreground, gap 16.
 */

const CHART_COLORS = colors.chart; // rampe 5 bleus — chart-0 … chart-4
const GRID_STROKE = colors.semantic.border;

const AXIS_TEXT = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size, // 12
  fill: colors.semantic.mutedForeground,
};

const AXIS_BAND = 26;   // bande libellés X (texte 12 + écart 14, relevé Figma)
const Y_GUTTER = 36;    // gouttière libellés Y (option showYAxis)
const H_GUTTER = 56;    // gouttière libellés catégorie (bar-horizontal)
const BAR_GAP = 16;     // gap entre catégories (Figma Plots gap-4)
const GROUP_GAP = 4;    // gap intra-groupe (séries multiples)
const BAR_RADIUS = 8;   // Figma calc(radius - 2px)

// ── Échelle ──────────────────────────────────────────────────────────────
function niceCeil(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return n * p;
}

// Lissage Catmull-Rom → Bézier (variante « Curved » du set).
function smoothPath(pts) {
  if (pts.length < 3) return 'M ' + pts.map((p) => `${p[0]} ${p[1]}`).join(' L ');
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
function linearPath(pts) {
  return 'M ' + pts.map((p) => `${p[0]} ${p[1]}`).join(' L ');
}

// Secteur annulaire (pie r0=0, donut r0>0). Angles en radians depuis -90°.
function arcPath(cx, cy, r0, r1, a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = cx + r1 * Math.cos(a0), y0 = cy + r1 * Math.sin(a0);
  const x1 = cx + r1 * Math.cos(a1), y1 = cy + r1 * Math.sin(a1);
  if (r0 <= 0) {
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} Z`;
  }
  const x2 = cx + r0 * Math.cos(a1), y2 = cy + r0 * Math.sin(a1);
  const x3 = cx + r0 * Math.cos(a0), y3 = cy + r0 * Math.sin(a0);
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

const defaultFormatter = (v) => (typeof v === 'number' ? v.toLocaleString('fr-FR') : String(v));

// ── Sous-composants (Figma « Chart Subcomponents ») ─────────────────────
function LegendRow({ names, seriesColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
      {names.map((name, i) => (
        <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: seriesColor(i), flexShrink: 0 }} />
          <span
            style={{
              fontFamily: typography.fontFamily.sans,
              fontSize: typography.scale.caption.size, // 12
              lineHeight: 1,
              color: colors.semantic.foreground,
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
        </span>
      ))}
    </div>
  );
}

function Tooltip({ title, items, unit, formatter, x, containerWidth }) {
  // Ancrage horizontal borné (demi-largeur estimée 76px).
  const HALF = 76;
  const left = Math.max(HALF, Math.min(containerWidth - HALF, x));
  const text12 = { fontFamily: typography.fontFamily.sans, fontSize: 12, lineHeight: 1 };
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        background: colors.semantic.background,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: radius.lg, // 8
        boxShadow: shadows.xs,
        padding: '6px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 128,
        zIndex: 2,
      }}
    >
      {title && (
        <span
          style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.scale['caption-medium'].size,               // 12
            lineHeight: `${typography.scale['caption-medium'].lineHeight}px`, // 16
            fontWeight: typography.scale['caption-medium'].weight,           // 500
            color: colors.semantic.foreground,
          }}
        >
          {title}
        </span>
      )}
      {items.map((it) => (
        <span key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: it.color, flexShrink: 0 }} />
          <span style={{ ...text12, color: colors.semantic.mutedForeground, flex: 1, whiteSpace: 'nowrap' }}>{it.name}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <span style={{ ...text12, color: colors.semantic.foreground }}>{formatter(it.value)}</span>
            {unit && <span style={{ ...text12, color: colors.semantic.mutedForeground }}>{unit}</span>}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Chart({
  type = 'bar',        // 'bar' | 'bar-horizontal' | 'bar-stacked' | 'line' | 'area' | 'area-stacked' | 'pie' | 'donut'
  data = [],           // [{ label: 'Jan', values: [125, 66] }] — ou values: nombre
  series = [],         // noms de séries (légende + tooltip) : ['Desktop', 'Mobile']
  height = 192,        // hauteur du tracé (Figma Chart / Bar / Default = 192)
  curved = true,       // line / area : variante Curved (true) ou Linear (false)
  showGrid = true,     // 5 filets horizontaux (cartésien)
  showLegend = false,
  showTooltip = true,
  showYAxis = false,   // graduations Y (variante « Axes » du set)
  showXAxis = true,
  unit = '',           // suffixe des valeurs du tooltip (Figma « kcal »)
  valueFormatter,
  className,
  style,
}) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState(null); // index de catégorie / de part

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const formatter = valueFormatter || defaultFormatter;

  // Normalisation : values toujours en tableau.
  const rows = useMemo(
    () => data.map((d) => ({ label: d.label, values: Array.isArray(d.values) ? d.values : [d.values] })),
    [data]
  );
  const seriesCount = rows.reduce((m, r) => Math.max(m, r.values.length), 0);
  const seriesNames = Array.from({ length: seriesCount }, (_, i) => series[i] || `Série ${i + 1}`);
  const seriesColor = (i) => CHART_COLORS[i % CHART_COLORS.length];

  const stacked = type === 'bar-stacked' || type === 'area-stacked';
  const isPie = type === 'pie' || type === 'donut';
  const isHorizontal = type === 'bar-horizontal';
  const isLineArea = type === 'line' || type === 'area' || type === 'area-stacked';

  const maxValue = useMemo(() => {
    if (!rows.length) return 1;
    const per = rows.map((r) =>
      stacked ? r.values.reduce((a, b) => a + Math.max(0, b), 0) : Math.max(...r.values.map((v) => Math.max(0, v)))
    );
    return niceCeil(Math.max(...per));
  }, [rows, stacked]);

  if (!rows.length) return <div ref={wrapRef} className={className} style={style} />;

  const leftGutter = isHorizontal ? H_GUTTER : showYAxis ? Y_GUTTER : 0;
  const plotW = Math.max(0, width - leftGutter);
  const plotH = isPie ? height : height - (showXAxis && !isHorizontal ? AXIS_BAND : 0);
  const n = rows.length;

  const hoverItems = (i) =>
    rows[i].values.map((v, s) => ({ name: seriesNames[s], value: v, color: seriesColor(s) }));

  // ── Rendus par famille ────────────────────────────────────────────────
  let plot = null;
  let overlay = null;
  let tooltipEl = null;

  if (width > 0 && isPie) {
    const cx = width / 2;
    const cy = plotH / 2;
    const r1 = Math.min(plotW, plotH) / 2;
    const r0 = type === 'donut' ? r1 * 0.62 : 0;
    const values = rows.map((r) => Math.max(0, r.values[0] || 0));
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let angle = -Math.PI / 2;
    plot = (
      <g>
        {values.map((v, i) => {
          const a0 = angle;
          const a1 = (angle += (v / total) * Math.PI * 2);
          if (v <= 0) return null;
          return (
            <path
              key={i}
              d={arcPath(cx, cy, r0, r1, a0, a1)}
              fill={seriesColor(i)}
              stroke={colors.semantic.background}
              strokeWidth={2}
              opacity={hover === null || hover === i ? 1 : 0.6}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ transition: 'opacity 150ms ease' }}
            />
          );
        })}
      </g>
    );
    if (showTooltip && hover !== null) {
      tooltipEl = (
        <Tooltip
          title={rows[hover].label}
          items={[{ name: seriesNames[0], value: values[hover], color: seriesColor(hover) }]}
          unit={unit}
          formatter={formatter}
          x={cx}
          containerWidth={width}
        />
      );
    }
  } else if (width > 0 && isHorizontal) {
    const slotH = n > 0 ? (plotH - BAR_GAP * (n - 1)) / n : 0;
    plot = (
      <g>
        {showGrid &&
          Array.from({ length: 5 }, (_, k) => {
            const x = leftGutter + (plotW * k) / 4;
            return <line key={k} x1={x} x2={x} y1={0} y2={plotH} stroke={GRID_STROKE} strokeWidth={1} />;
          })}
        {rows.map((r, i) => {
          const y = i * (slotH + BAR_GAP);
          const barH = seriesCount > 1 ? (slotH - GROUP_GAP * (seriesCount - 1)) / seriesCount : slotH;
          return (
            <g key={i} opacity={hover === null || hover === i ? 1 : 0.55} style={{ transition: 'opacity 150ms ease' }}>
              {r.values.map((v, s) => {
                const w = (Math.max(0, v) / maxValue) * plotW;
                return (
                  <rect
                    key={s}
                    x={leftGutter}
                    y={y + s * (barH + GROUP_GAP)}
                    width={Math.max(w, 0)}
                    height={Math.max(barH, 0)}
                    rx={Math.min(BAR_RADIUS, barH / 2, w / 2)}
                    fill={seriesColor(seriesCount > 1 ? s : 0)}
                  />
                );
              })}
              <text
                x={leftGutter - 8}
                y={y + slotH / 2}
                textAnchor="end"
                dominantBaseline="central"
                style={AXIS_TEXT}
              >
                {r.label}
              </text>
            </g>
          );
        })}
      </g>
    );
    overlay = (
      <rect
        x={0}
        y={0}
        width={width}
        height={plotH}
        fill="transparent"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const my = e.clientY - rect.top;
          const i = Math.max(0, Math.min(n - 1, Math.floor(my / (slotH + BAR_GAP))));
          setHover(i);
        }}
        onMouseLeave={() => setHover(null)}
      />
    );
    if (showTooltip && hover !== null) {
      tooltipEl = (
        <Tooltip
          title={rows[hover].label}
          items={hoverItems(hover)}
          unit={unit}
          formatter={formatter}
          x={leftGutter + plotW / 2}
          containerWidth={width}
        />
      );
    }
  } else if (width > 0 && isLineArea) {
    const isArea = type !== 'line';
    const px = (i) => leftGutter + (n > 1 ? (i * plotW) / (n - 1) : plotW / 2);
    const py = (v) => plotH - (Math.max(0, v) / maxValue) * plotH;
    const toPath = curved ? smoothPath : linearPath;

    // Cumuls pour l'empilé ; sinon séries indépendantes.
    const layers = Array.from({ length: seriesCount }, (_, s) =>
      rows.map((r, i) => {
        const base = stacked ? r.values.slice(0, s).reduce((a, b) => a + Math.max(0, b), 0) : 0;
        return { x: px(i), y0: py(base), y1: py(base + Math.max(0, r.values[s] || 0)) };
      })
    );

    plot = (
      <g>
        {layers.map((pts, s) => {
          const top = pts.map((p) => [p.x, p.y1]);
          const lineD = toPath(top);
          let areaD = null;
          if (isArea) {
            if (stacked && s > 0) {
              const base = [...pts].reverse().map((p) => [p.x, p.y0]);
              areaD = `${lineD} L ${base.map((p) => `${p[0]} ${p[1]}`).join(' L ')} Z`;
            } else {
              areaD = `${lineD} L ${pts[pts.length - 1].x} ${plotH} L ${pts[0].x} ${plotH} Z`;
            }
          }
          return (
            <g key={s}>
              {areaD && <path d={areaD} fill={seriesColor(s)} opacity={0.4} />}
              <path d={lineD} fill="none" stroke={seriesColor(s)} strokeWidth={1} />
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line x1={px(hover)} x2={px(hover)} y1={0} y2={plotH} stroke={GRID_STROKE} strokeWidth={1} />
            {layers.map((pts, s) => (
              // Chart Dot (6926:1714) : pastille 8px cerclée du fond.
              <circle
                key={s}
                cx={pts[hover].x}
                cy={pts[hover].y1}
                r={4}
                fill={seriesColor(s)}
                stroke={colors.semantic.background}
                strokeWidth={2}
              />
            ))}
          </g>
        )}
      </g>
    );
    overlay = (
      <rect
        x={leftGutter}
        y={0}
        width={plotW}
        height={plotH}
        fill="transparent"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const i = n > 1 ? Math.round((mx / plotW) * (n - 1)) : 0;
          setHover(Math.max(0, Math.min(n - 1, i)));
        }}
        onMouseLeave={() => setHover(null)}
      />
    );
    if (showTooltip && hover !== null) {
      tooltipEl = (
        <Tooltip
          title={rows[hover].label}
          items={hoverItems(hover)}
          unit={unit}
          formatter={formatter}
          x={px(hover)}
          containerWidth={width}
        />
      );
    }
  } else if (width > 0) {
    // Barres verticales — Chart / Bar / Default · Multiple · Stacked
    const slotW = n > 0 ? (plotW - BAR_GAP * (n - 1)) / n : 0;
    const slotX = (i) => leftGutter + i * (slotW + BAR_GAP);
    plot = (
      <g>
        {rows.map((r, i) => {
          const x = slotX(i);
          if (stacked) {
            let acc = 0;
            return (
              <g key={i} opacity={hover === null || hover === i ? 1 : 0.55} style={{ transition: 'opacity 150ms ease' }}>
                {r.values.map((v, s) => {
                  const h = (Math.max(0, v) / maxValue) * plotH;
                  const y = plotH - acc - h;
                  acc += h + 2; // fine respiration entre segments (relevé visuel)
                  return (
                    <rect key={s} x={x} y={y} width={slotW} height={Math.max(h, 0)} rx={Math.min(2, slotW / 2)} fill={seriesColor(s)} />
                  );
                })}
              </g>
            );
          }
          const barW = seriesCount > 1 ? (slotW - GROUP_GAP * (seriesCount - 1)) / seriesCount : slotW;
          return (
            <g key={i} opacity={hover === null || hover === i ? 1 : 0.55} style={{ transition: 'opacity 150ms ease' }}>
              {r.values.map((v, s) => {
                const h = (Math.max(0, v) / maxValue) * plotH;
                return (
                  <rect
                    key={s}
                    x={x + s * (barW + GROUP_GAP)}
                    y={plotH - h}
                    width={Math.max(barW, 0)}
                    height={Math.max(h, 0)}
                    rx={Math.min(BAR_RADIUS, barW / 2, h / 2)}
                    fill={seriesColor(seriesCount > 1 ? s : 0)}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    );
    overlay = (
      <rect
        x={leftGutter}
        y={0}
        width={plotW}
        height={plotH}
        fill="transparent"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const i = Math.max(0, Math.min(n - 1, Math.floor(mx / (slotW + BAR_GAP))));
          setHover(i);
        }}
        onMouseLeave={() => setHover(null)}
      />
    );
    if (showTooltip && hover !== null) {
      tooltipEl = (
        <Tooltip
          title={rows[hover].label}
          items={hoverItems(hover)}
          unit={unit}
          formatter={formatter}
          x={slotX(hover) + slotW / 2}
          containerWidth={width}
        />
      );
    }
  }

  // Position X des libellés de catégorie (barres : centre de slot ; lignes /
  // aires : position du point, extrémités ancrées dans le cadre — Figma
  // « x-axis labels » justify-between).
  const xLabelInfo = (i) => {
    if (isLineArea) {
      const x = leftGutter + (n > 1 ? (i * plotW) / (n - 1) : plotW / 2);
      const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
      return { x, anchor };
    }
    const slotW = n > 0 ? (plotW - BAR_GAP * (n - 1)) / n : 0;
    return { x: leftGutter + i * (slotW + BAR_GAP) + slotW / 2, anchor: 'middle' };
  };

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', width: '100%', ...style }}>
      {width > 0 && (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
          {/* Grille — 5 filets horizontaux (Figma « Lines ») */}
          {!isPie && !isHorizontal && showGrid && (
            <g>
              {Array.from({ length: 5 }, (_, k) => {
                const y = (plotH * k) / 4;
                return <line key={k} x1={leftGutter} x2={width} y1={y} y2={y} stroke={GRID_STROKE} strokeWidth={1} />;
              })}
            </g>
          )}
          {/* Graduations Y (variante « Axes ») */}
          {!isPie && !isHorizontal && showYAxis && (
            <g>
              {Array.from({ length: 5 }, (_, k) => (
                <text
                  key={k}
                  x={leftGutter - 8}
                  y={(plotH * k) / 4}
                  textAnchor="end"
                  dominantBaseline="central"
                  style={AXIS_TEXT}
                >
                  {formatter(maxValue * (1 - k / 4))}
                </text>
              ))}
            </g>
          )}
          {plot}
          {/* Libellés X — 12px muted-foreground, 14px sous le tracé */}
          {!isPie && !isHorizontal && showXAxis && (
            <g>
              {rows.map((r, i) => {
                const { x, anchor } = xLabelInfo(i);
                return (
                  <text key={i} x={x} y={plotH + 14} textAnchor={anchor} dominantBaseline="hanging" style={AXIS_TEXT}>
                    {r.label}
                  </text>
                );
              })}
            </g>
          )}
          {overlay}
        </svg>
      )}
      {tooltipEl}
      {showLegend && seriesCount > 0 && (
        <LegendRow names={isPie ? rows.map((r) => r.label) : seriesNames} seriesColor={seriesColor} />
      )}
    </div>
  );
}
