import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';
import {CANVAS, INK} from './theme';
import {
  ActeCommune,
  ActeImport,
  ActePerso,
  Commune,
  Intro,
  Outro,
  Perso,
  Picker,
  Terrain,
} from './scenes';

loadInter('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
loadPlexMono('normal', {weights: ['400', '500'], subsets: ['latin']});

// 30 fps · 1920×1080. Le modèle de connexion des boîtes mail en 4 temps :
// terrain (deux réalités) → geste admin (boîtes communes) → geste de chacun
// (Ma boîte) → picker agrégé (sections, dédup, signal d'exposition).
const SCENES: {C: React.FC<{duration: number}>; d: number}[] = [
  {C: Intro, d: 150},
  {C: Terrain, d: 260},
  {C: ActeCommune, d: 100},
  {C: Commune, d: 330},
  {C: ActePerso, d: 100},
  {C: Perso, d: 330},
  {C: ActeImport, d: 100},
  {C: Picker, d: 330},
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
    id="NormaBoites"
    component={Film}
    durationInFrames={TOTAL}
    fps={30}
    width={1920}
    height={1080}
  />
);
