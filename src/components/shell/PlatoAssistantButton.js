import React from 'react';
import PlatoIcon from './PlatoIcon';

// Bouton de réouverture du rail Plato Assistant (header du dossier, quand le
// rail est replié). Fond dégradé radial cuivré sur beige + bord bleu-gris
// #aabcd5, libellé mono uppercase. Hover : ombre portée md.
export default function PlatoAssistantButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all hover:shadow-md"
      title="Ouvrir Plato Assistant"
      style={{
        border: '1px solid #aabcd5',
        boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 36' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='0.2'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0 -3.29 7.6 -0.48 100 18)'><stop stop-color='rgba(185,112,63,1)' offset='0'/><stop stop-color='rgba(203,148,111,0.75)' offset='0.25'/><stop stop-color='rgba(220,183,159,0.5)' offset='0.5'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, #f8f7f5 0%, #f8f7f5 100%)`,
      }}
    >
      <PlatoIcon size={16} />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '12px', color: '#50443e', whiteSpace: 'nowrap' }}>
        PLATO ASSISTANT
      </span>
    </button>
  );
}
