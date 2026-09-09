import React, { useEffect, useRef, useState } from 'react';

// TypewriterPlaceholder — placeholder animé du composer d'accueil : tape une
// phrase, marque une pause, l'efface, passe à la suivante. Les phrases sont
// des GESTES DE CONNAISSANCE (questions de droit, recherche de JP, info sur un
// dossier) - jamais une action complexe (ouvrir un dossier, chiffrer, rédiger).
// Autonome : seul ce composant se re-rend à chaque frappe, pas la surface.
//
// Respecte prefers-reduced-motion : affiche alors la première phrase, fixe.

const DEFAULT_PHRASES = [
  'Un salarié peut-il contester son licenciement 13 mois après ?',
  'Cherche une jurisprudence sur la prescription biennale',
  'Quel délai pour agir devant le conseil de prud’hommes ?',
  'Résume l’arrêt Cass. soc. du 11 mai 2023',
  'Où en est le dossier Martel cette semaine ?',
  'Quelles pièces demander après une fracture du poignet ?',
  'Explique la méthode de capitalisation d’une rente',
  'Que dit le barème Macron pour 8 ans d’ancienneté ?',
];

const TYPE_MS = 42;      // vitesse de frappe
const DELETE_MS = 22;    // vitesse d'effacement
const HOLD_MS = 1900;    // pause phrase complète
const GAP_MS = 350;      // pause avant la phrase suivante

export default function TypewriterPlaceholder({ phrases = DEFAULT_PHRASES }) {
  const [text, setText] = useState('');
  const stateRef = useRef({ phrase: 0, char: 0, deleting: false });
  const timerRef = useRef(null);

  useEffect(() => {
    let reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* garde */ }
    if (reduced) { setText(phrases[0]); return undefined; }

    const tick = () => {
      const s = stateRef.current;
      const full = phrases[s.phrase % phrases.length];
      if (!s.deleting) {
        s.char += 1;
        setText(full.slice(0, s.char));
        if (s.char >= full.length) {
          s.deleting = true;
          timerRef.current = setTimeout(tick, HOLD_MS);
          return;
        }
        timerRef.current = setTimeout(tick, TYPE_MS);
      } else {
        s.char -= 1;
        setText(full.slice(0, Math.max(0, s.char)));
        if (s.char <= 0) {
          s.deleting = false;
          s.phrase += 1;
          timerRef.current = setTimeout(tick, GAP_MS);
          return;
        }
        timerRef.current = setTimeout(tick, DELETE_MS);
      }
    };
    timerRef.current = setTimeout(tick, 500);
    return () => clearTimeout(timerRef.current);
  }, [phrases]);

  return (
    <>
      {text}
      <span
        aria-hidden="true"
        className="tw-caret"
        style={{ display: 'inline-block', width: 1, marginLeft: 1, transform: 'translateY(1px)' }}
      >
        <span style={{ borderLeft: '1.5px solid currentColor', paddingRight: 0 }}>&#8203;</span>
      </span>
      <style>{`
        @keyframes tw-blink { 0%, 45% { opacity: 1; } 55%, 100% { opacity: 0; } }
        .tw-caret { animation: tw-blink 1.1s step-end infinite; }
        @media (prefers-reduced-motion: reduce) { .tw-caret { display: none !important; } }
      `}</style>
    </>
  );
}
