import React from 'react';

// Onglet de vue du dossier (« Informations · Chiffrage · Pièces n · Actes ·
// JP ») - rangée sous le nom du dossier. L'onglet reste allumé au niveau 3
// (la nav de vue ne bouge pas quand un objet est ouvert).
//   count         compteur mono 11.5 (Pièces)
//   diamondColor  diamant de diff (6px, rotation 45°, halo teinté) - présent
//                 quand la zone porte des diffs non traités
//   streamingDot  point vert pulsant (extraction en cours, onglet inactif)
// États : inactif (foreground-secondary, hover foreground) / actif
// (foreground medium + soulignement 2px bg-foreground).
export default function DossierTab({ label, active, count = null, diamondColor = null, streamingDot = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-2.5 pt-1 flex items-center gap-1.5 text-[14px] transition-colors ${
        active ? 'text-foreground font-medium' : 'text-foreground-secondary hover:text-foreground'
      }`}
    >
      {diamondColor && (
        <span className="inline-flex items-center justify-center w-3 h-3 flex-shrink-0">
          <span className="w-[6px] h-[6px] flex-shrink-0" style={{
            background: diamondColor,
            transform: 'rotate(45deg)',
            borderRadius: '0.5px',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: `0 0 0 3px ${diamondColor}20, 0 1px 2px 0 rgba(26,26,26,0.05)`,
          }} />
        </span>
      )}
      {label}
      {count != null && (
        <span className="text-foreground-muted" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5 }}>
          {count}
        </span>
      )}
      {streamingDot && <span className="w-1.5 h-1.5 animate-pulse-scale" style={{ background: '#4a9168', transform: 'rotate(45deg)' }} />}
      {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />}
    </button>
  );
}
