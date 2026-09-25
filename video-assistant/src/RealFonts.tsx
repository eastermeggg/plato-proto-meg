import React, {useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

// Charge la vraie serif de marque (RL Albra Trial - Book) pour que les VRAIS
// composants du DS (qui demandent 'RL Para Trial Central' / 'Albra') la rendent
// au lieu du fallback Georgia. On déclare la famille sous les deux noms.
const url = staticFile('fonts/rl-albra-book.otf');
const css = `
@font-face{font-family:'RL Para Trial Central';src:url('${url}') format('opentype');font-weight:400 600;font-style:normal;font-display:block;}
@font-face{font-family:'Albra';src:url('${url}') format('opentype');font-weight:400 600;font-style:normal;font-display:block;}
`;

export const RealFonts: React.FC = () => {
  const [handle] = useState(() => delayRender('Chargement RL Albra'));
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const fonts = (document as unknown as {fonts: FontFaceSet}).fonts;
    Promise.all([
      fonts.load("400 20px 'RL Para Trial Central'"),
      fonts.load("500 20px 'RL Para Trial Central'"),
    ])
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
    return () => {
      document.head.removeChild(style);
    };
  }, [handle]);
  return null;
};
