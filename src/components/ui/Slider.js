import React, { useCallback, useRef, useState } from 'react';
import { colors, radius, shadows } from '../../design-system/tokens';

/**
 * Slider — Plato design system. Source of truth: Figma node 2819:30565
 * (set "Slider" 2785:10703 : Range=False / True ; ".Slider Item"
 * 6895:13278 : State=Enabled / Focus).
 *
 * Curseur horizontal : rail 6px (fond secondary, radius full), plage
 * remplie (primary), poignée 16px (fond background, bord 1px primary,
 * ombre). `range` active deux poignées (plage entre les deux).
 *
 * Contrôlé (`value` + `onChange`) ou non contrôlé (`defaultValue`).
 * Interactions réelles : drag pointeur (clic rail inclus), clavier
 * (flèches / Home / End / PageUp / PageDown), focus ring 3px (état
 * Focus du set), disabled (opacité 0.5, état absent de la maquette,
 * aligné sur InputGroup).
 *
 * Écarts tokens (notés dans Slider.md) :
 *  - ombre poignée Figma shadow/md (2 couches) → shadows.xs (plus proche).
 *  - halo focus Figma rgba(163,163,163,0.5) → color-mix 50% sur
 *    colors.semantic.borderHover, comme InputGroup.
 */

const TRACK_H = 6;
const THUMB = 16;
// Focus : token unique shadows.focusRing (arbitrage 24/09) - jamais de halo local.
const FOCUS_RING = shadows.focusRing;

// :focus-visible n'existe pas en style inline — feuille injectée une fois.
let focusCss = false;
function ensureFocusCss() {
  if (focusCss || typeof document === 'undefined') return;
  focusCss = true;
  const s = document.createElement('style');
  s.id = 'ds-slider-focus';
  s.textContent = `.ds-slider-thumb:focus-visible{outline:none;box-shadow:${FOCUS_RING}}`;
  document.head.appendChild(s);
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function snap(raw, min, max, step) {
  const stepped = Math.round((raw - min) / step) * step + min;
  // Évite les flottants type 0.30000000000000004
  const decimals = (String(step).split('.')[1] || '').length;
  return clamp(Number(stepped.toFixed(decimals)), min, max);
}

export default function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  range = false,           // deux poignées, valeur = [bas, haut]
  onChange,
  onChangeCommitted,
  disabled = false,
  ariaLabel = 'Curseur',
  className,
  style,
  width,
}) {
  ensureFocusCss();
  const trackRef = useRef(null);
  const draggingRef = useRef(null); // index de poignée en cours de drag

  const fallback = range ? [min, min + (max - min) / 2] : (max + min) / 2;
  const [internal, setInternal] = useState(defaultValue ?? fallback);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  // Normalise en tableau de valeurs de poignées
  const values = range
    ? (Array.isArray(current) ? current : [min, Number(current)])
    : [Array.isArray(current) ? current[0] : Number(current)];

  const emit = useCallback((next) => {
    const out = range ? next : next[0];
    if (!controlled) setInternal(out);
    if (onChange) onChange(out);
  }, [controlled, onChange, range]);

  const valueFromClientX = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return snap(min + ratio * (max - min), min, max, step);
  }, [min, max, step]);

  const setThumbValue = useCallback((index, v) => {
    const next = [...values];
    next[index] = v;
    if (range) {
      // Les poignées ne se croisent pas
      if (index === 0) next[0] = Math.min(next[0], next[1]);
      else next[1] = Math.max(next[0], next[1]);
    }
    emit(next);
  }, [values, range, emit]);

  // Refs stables pour les listeners window (valeurs fraîches à chaque rendu)
  const setThumbValueRef = useRef(setThumbValue);
  const valueFromClientXRef = useRef(valueFromClientX);
  const valuesRef = useRef(values);
  setThumbValueRef.current = setThumbValue;
  valueFromClientXRef.current = valueFromClientX;
  valuesRef.current = values;

  const handlePointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    const v = valueFromClientX(e.clientX);
    // Poignée la plus proche du point de clic
    let index = 0;
    if (range) index = Math.abs(v - values[0]) <= Math.abs(v - values[1]) ? 0 : 1;
    draggingRef.current = index;
    setThumbValue(index, v);

    const onMove = (ev) => {
      if (draggingRef.current === null) return;
      setThumbValueRef.current(draggingRef.current, valueFromClientXRef.current(ev.clientX));
    };
    const onUp = () => {
      draggingRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (onChangeCommitted) onChangeCommitted(range ? valuesRef.current : valuesRef.current[0]);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleKeyDown = (index) => (e) => {
    if (disabled) return;
    const big = (max - min) / 10;
    let v = values[index];
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown': v = snap(v - step, min, max, step); break;
      case 'ArrowRight':
      case 'ArrowUp':   v = snap(v + step, min, max, step); break;
      case 'PageDown':  v = snap(v - big, min, max, step); break;
      case 'PageUp':    v = snap(v + big, min, max, step); break;
      case 'Home':      v = min; break;
      case 'End':       v = max; break;
      default: return;
    }
    e.preventDefault();
    setThumbValue(index, v);
  };

  const pct = (v) => ((v - min) / (max - min)) * 100;
  const lo = range ? pct(values[0]) : 0;
  const hi = range ? pct(values[1]) : pct(values[0]);

  const thumbStyle = (v) => ({
    position: 'absolute',
    left: `${pct(v)}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: THUMB,
    height: THUMB,
    background: colors.semantic.background,
    border: `1px solid ${colors.semantic.primary}`,
    borderRadius: radius.full,
    boxShadow: shadows.xs,
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'grab',
    touchAction: 'none',
  });

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        height: THUMB,
        display: 'flex',
        alignItems: 'center',
        width: width ?? '100%',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        touchAction: 'none',
        ...style,
      }}
      onPointerDown={handlePointerDown}
    >
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          width: '100%',
          height: TRACK_H,
          background: colors.semantic.secondary,
          borderRadius: radius.full,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${lo}%`,
            width: `${hi - lo}%`,
            top: 0,
            height: TRACK_H,
            background: colors.semantic.primary,
            borderRadius: radius.full,
          }}
        />
      </div>
      {values.map((v, i) => (
        <div
          key={i}
          className="ds-slider-thumb"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={range ? `${ariaLabel} ${i === 0 ? 'minimum' : 'maximum'}` : ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={v}
          aria-disabled={disabled || undefined}
          aria-orientation="horizontal"
          onKeyDown={handleKeyDown(i)}
          style={thumbStyle(v)}
        />
      ))}
    </div>
  );
}
