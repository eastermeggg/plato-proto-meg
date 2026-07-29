import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';
import {CANVAS, INK} from './theme';
import {Acte1, Acte2, Arrivees, Intro, Outro, Piocher, Sources, Suivre, Verifier} from './scenes';

loadInter('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
loadPlexMono('normal', {weights: ['400', '500'], subsets: ['latin']});

// 30 fps · 1920×1080. Le parcours utilisateur en 5 gestes clés :
// piocher → vérifier/ajouter (étape 1), suivre → laisser faire → garder la
// main (étape 2).
const SCENES: {C: React.FC<{duration: number}>; d: number}[] = [
  {C: Intro, d: 150},
  {C: Acte1, d: 110},
  {C: Piocher, d: 320},
  {C: Verifier, d: 320},
  {C: Acte2, d: 110},
  {C: Suivre, d: 280},
  {C: Arrivees, d: 300},
  {C: Sources, d: 320},
  {C: Outro, d: 170},
];

const TOTAL = SCENES.reduce((a, s) => a + s.d, 0);

const Film: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{background: CANVAS, fontFamily: "'Inter', sans-serif", color: INK}}>
      {SCENES.map(({C, d}, i) => {
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <C duration={d} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NormaEmails"
    component={Film}
    durationInFrames={TOTAL}
    fps={30}
    width={1920}
    height={1080}
  />
);
