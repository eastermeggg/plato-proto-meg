import React from 'react';

// Bouton de réouverture du rail Plato Assistant (header du dossier, quand le
// rail est replié). Style « Plato Assistant Button » de Plato - System
// (37444:5885) : pilule blanche, chip Plato sombre 19px (« Sparkle IA »),
// libellé Inter Medium 14, HALO orange flouté clippé au bas de la pilule
// (radial #F47A2C, blur 4.5) qui s'élargit au hover.
// + Bordure à glow mobile (même comète que le composer hero, déclinaison
// pilule du BrandOrangeLab : rotation 2.8s) : l'anneau de base remplace le
// bord statique, la comète orange le survole. Fallbacks : sans conic-gradient
// ou en reduced-motion, retour au bord statique border-strong.

// Glyphe exact de l'asset Figma « Sparkle IA » (19×19, tête Plato évidée).
const SparkleIA = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative flex-shrink-0">
    <path
      d="M19 19H13.0625L12.5879 16.625H13.5371V14.7246H5.46289V16.625H6.41211L5.9375 19H0V0H19V19ZM6.86719 9.28223L4.9873 7.59961L3.5625 8.5498L6.1748 13.2998H12.8252L15.4375 8.5498L14.0127 7.59961L12.1318 9.28223L9.5 6.65039L6.86719 9.28223ZM7.83789 4.03711L9.5 5.7002L11.1621 4.03711L9.5 2.375L7.83789 4.03711Z"
      fill="#292524"
    />
  </svg>
);

export default function PlatoAssistantButton({ onClick }) {
  return (
    <>
      <style>{`
        @property --plato-glow-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes pab-glow-spin { to { --plato-glow-angle: 360deg; } }
        .pab-glow-ring, .pab-glow-bloom {
          position: absolute;
          border-radius: 7px;
          pointer-events: none;
          background: conic-gradient(from var(--plato-glow-angle),
            transparent 0deg, #f47a2c 46deg, transparent 92deg);
          animation: pab-glow-spin 2.8s linear infinite;
        }
        /* anneau net 1px : comète PAR-DESSUS l'anneau de base border-strong */
        .pab-glow-ring {
          inset: -1px;
          padding: 1px;
          z-index: 1;
          background:
            conic-gradient(from var(--plato-glow-angle), transparent 0deg, #f47a2c 46deg, transparent 92deg),
            linear-gradient(#cbc7c4, #cbc7c4);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
        }
        /* jumeau flou (bloom) autour du bord */
        .pab-glow-bloom {
          inset: -3px;
          padding: 4px;
          z-index: 0;
          filter: blur(7px);
          opacity: 0.75;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
        }
        @supports not (background: conic-gradient(from 0deg, red, blue)) {
          .pab-glow-ring { background: #cbc7c4; }
          .pab-glow-bloom { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pab-glow-ring { animation: none; background: #cbc7c4; }
          .pab-glow-bloom { display: none; }
        }
      `}</style>
      <button
        onClick={onClick}
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-white transition-shadow"
        title="Ouvrir Plato Assistant"
        style={{
          boxShadow:
            '0px 8px 10px -1px rgba(26,26,26,0.05), 0px 4px 6px -4px rgba(26,26,26,0.05), 0px 24px 84px -20px rgba(0,0,0,0.25)',
        }}
      >
        <span className="pab-glow-bloom" aria-hidden="true" />
        <span className="pab-glow-ring" aria-hidden="true" />
        {/* Halo bas - clippé par la pilule (calque interne, le bouton reste overflow-visible pour le glow) */}
        <span aria-hidden="true" className="absolute inset-0 rounded-[6px] overflow-hidden pointer-events-none">
          <span
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-200 group-hover:scale-x-110"
            style={{
              bottom: -14,
              width: 116,
              height: 26,
              opacity: 0.9,
              filter: 'blur(4.5px)',
              background:
                'radial-gradient(50% 50% at 50% 50%, rgba(244,122,44,0.55) 0%, rgba(244,122,44,0.18) 60%, rgba(244,122,44,0) 100%)',
            }}
          />
        </span>
        <SparkleIA />
        <span className="relative text-[14px] font-medium leading-5 text-foreground whitespace-nowrap">
          Plato Assistant
        </span>
      </button>
    </>
  );
}
