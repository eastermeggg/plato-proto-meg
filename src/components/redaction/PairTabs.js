import React from 'react';

// Segmented control for a linked acte/bordereau pair. Matches the
// "Par poste / Par victime" toggle used in the IV-victim chiffrage block
// (App.js:9614) so the rest of the app's visual language carries through:
// the segmented control itself signals that the two artefacts form a pair.
//
// Props:
//   acte        — { id, title } | null
//   bordereau   — { id, title } | null
//   activeId    — current canvasActeId
//   onSwitch    — (acteId) => void
export default function PairTabs({ acte, bordereau, activeId, onSwitch }) {
  if (!acte || !bordereau) return null;

  // Rendered inline in the acte sub-header alongside Copier / Télécharger —
  // the segmented control sits in the same horizontal band as the actions so
  // the whole canvas chrome fits in a single 52px strip.
  return (
    <div
      className="inline-flex items-center gap-0 h-8 rounded-lg p-1 flex-shrink-0"
      style={{ backgroundColor: '#eeece6' }}
    >
      <Segment
        label="Acte"
        active={activeId === acte.id}
        onClick={() => onSwitch?.(acte.id)}
        tooltip={`Lié à : ${bordereau.title}`}
      />
      <Segment
        label="Bordereau"
        active={activeId === bordereau.id}
        onClick={() => onSwitch?.(bordereau.id)}
        tooltip={`Lié à : ${acte.title}`}
      />
    </div>
  );
}

function Segment({ label, active, onClick, tooltip }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`h-full px-3 min-w-[72px] flex items-center justify-center rounded-md transition-all ${
        active
          ? 'bg-white shadow-[0_1px_4px_0_rgba(26,26,26,0.05),0_1px_2px_0_rgba(26,26,26,0.05)] border border-transparent'
          : ''
      }`}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 500,
        color: active ? '#292524' : '#78716c',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
