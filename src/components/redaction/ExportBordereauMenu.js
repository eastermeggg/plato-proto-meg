import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Check, Stamp } from 'lucide-react';

// Télécharger dropdown for the bordereau header. Scope picker + tamponnage
// toggle + confirm button. The actual export is faked in P1A — `onConfirm` is
// called with `{ scope, tamponnage }` and the parent shows a toast.
//
// Tamponnage only applies when the export includes pièces. With the current
// scopes (acte / bordereau / tout) that means: Acte seul disables tamponnage,
// Bordereau seul and Tout enable it.
export default function ExportBordereauMenu({ onConfirm, variant = 'subheader' }) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState('tout'); // 'acte' | 'bordereau' | 'tout'
  const [tamponnage, setTamponnage] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Tamponnage doesn't apply to Acte seul (no pièces).
  const tamponnageDisabled = scope === 'acte';
  const effectiveTamponnage = tamponnageDisabled ? false : tamponnage;

  const confirm = () => {
    setOpen(false);
    onConfirm?.({ scope, tamponnage: effectiveTamponnage });
  };

  // Trigger button — dark primary, sits next to the muted Copier button in the
  // sub-header. The primary treatment carries the principal "ship the
  // bordereau" action of the canvas.
  const triggerClass =
    variant === 'subheader'
      ? 'inline-flex items-center gap-1.5 px-3 h-8 rounded-[8px] text-[13px] font-medium transition-colors'
      : 'inline-flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-[13px] font-medium transition-colors';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
        style={{
          backgroundColor: open ? '#44403c' : '#292524',
          color: '#ffffff',
          boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.08)',
        }}
        title="Télécharger"
      >
        <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
        Télécharger
        <ChevronDown
          className="w-3.5 h-3.5"
          strokeWidth={2}
          style={{
            transition: 'transform 120ms ease-out',
            transform: open ? 'rotate(180deg)' : 'none',
            opacity: 0.9,
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 bg-white rounded-[10px] border border-[#e7e5e3] overflow-hidden"
          style={{ width: 300, boxShadow: '0px 4px 8px -2px rgba(26,26,26,0.06), 0px 8px 24px -4px rgba(26,26,26,0.08)' }}
        >
          {/* Scope */}
          <div className="px-3 pt-3 pb-1">
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Portée
            </span>
          </div>
          <div className="px-1 pb-1.5">
            <ScopeOption label="Acte seul" value="acte" selected={scope === 'acte'} onSelect={setScope} />
            <ScopeOption label="Bordereau seul" value="bordereau" selected={scope === 'bordereau'} onSelect={setScope} />
            <ScopeOption label="Tout" hint="(défaut)" value="tout" selected={scope === 'tout'} onSelect={setScope} />
          </div>

          <div style={{ height: 1, backgroundColor: '#e7e5e3' }} />

          {/* Tamponnage */}
          <div className="px-3 pt-3 pb-1">
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Options
            </span>
          </div>
          <div className="px-1 pb-2">
            <TamponnageToggle
              on={effectiveTamponnage}
              disabled={tamponnageDisabled}
              onToggle={() => !tamponnageDisabled && setTamponnage((t) => !t)}
            />
          </div>

          {/* Confirm */}
          <div className="p-2 border-t border-[#e7e5e3] bg-[#fafaf9]">
            <button
              onClick={confirm}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-[8px] text-[13px] font-medium text-white bg-[#292524] hover:bg-[#44403c] transition-colors"
              style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.08)' }}
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
              Télécharger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScopeOption({ label, hint, value, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(value)}
      className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded-[6px] hover:bg-[#fafaf9] transition-colors"
    >
      <span className="flex items-center gap-2">
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            border: `1.5px solid ${selected ? '#292524' : '#c7c2b8'}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {selected && (
            <span style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: '#292524' }} />
          )}
        </span>
        <span className="text-[14px] text-[#292524]">{label}</span>
      </span>
      {hint && (
        <span className="text-[11px] text-[#a8a29e]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {hint}
        </span>
      )}
    </button>
  );
}

function TamponnageToggle({ on, disabled, onToggle }) {
  // Description intentionally omitted — what tamponnage produces should be
  // documented once in Préférences and surfaced there, not repeated in every
  // export menu. The label + stamp glyph are enough at the point of action.
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-2 py-1.5 text-left rounded-[6px] transition-colors ${
        disabled ? 'cursor-not-allowed' : 'hover:bg-[#fafaf9]'
      }`}
      title={disabled ? "Le tamponnage s'applique aux pièces — sélectionnez Bordereau seul ou Tout." : undefined}
    >
      <span className="inline-flex items-center gap-2">
        <Stamp
          style={{ width: 14, height: 14, color: disabled ? '#c7c2b8' : '#78716c' }}
          strokeWidth={1.75}
        />
        <span className="text-[14px]" style={{ color: disabled ? '#a8a29e' : '#292524' }}>
          Avec tamponnage
        </span>
      </span>
      <span
        style={{
          width: 28,
          height: 16,
          borderRadius: 999,
          backgroundColor: disabled ? '#e7e5e3' : on ? '#292524' : '#d6d3d1',
          position: 'relative',
          transition: 'background-color 120ms',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: on ? 14 : 2,
            width: 12,
            height: 12,
            borderRadius: 999,
            backgroundColor: 'white',
            transition: 'left 120ms',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {on && !disabled && <Check style={{ width: 8, height: 8, color: '#292524' }} strokeWidth={3} />}
        </span>
      </span>
    </button>
  );
}
