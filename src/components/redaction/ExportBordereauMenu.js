import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Check, Stamp, FileText } from 'lucide-react';

// Télécharger dropdown for the bordereau header. The export ALWAYS bundles the
// acte + its bordereau + pièces — they're never downloaded apart, so there's
// no scope picker. The only option is tamponnage. The actual export is faked in
// P1A — `onConfirm` is called with `{ scope: 'tout', tamponnage }` and the
// parent shows a toast.
export default function ExportBordereauMenu({ onConfirm, variant = 'subheader' }) {
  const [open, setOpen] = useState(false);
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

  const confirm = () => {
    setOpen(false);
    onConfirm?.({ scope: 'tout', tamponnage });
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
          {/* What gets exported — always the full bundle, never one alone. */}
          <div className="px-3 pt-3 pb-2.5 flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#78716c]" strokeWidth={1.75} />
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, lineHeight: '16px', color: '#44403c' }}>
              <span style={{ fontWeight: 600, color: '#292524' }}>Acte + bordereau + pièces</span><br />
              Téléchargés ensemble dans un seul document.
            </span>
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
              on={tamponnage}
              disabled={false}
              onToggle={() => setTamponnage((t) => !t)}
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
