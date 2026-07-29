import React from 'react';
import {Composition, Sequence, AbsoluteFill} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';
import {CANVAS, INK} from './theme';
import {Badges, Chiffrage, Intro, Outro, Panneau, Prelevement, Resultats} from './scenes';

loadInter('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
loadPlexMono('normal', {weights: ['400', '500'], subsets: ['latin']});

// 30 fps · 1920×1080. Les durées par scène (en frames) :
const SCENES: {C: React.FC<{duration: number}>; d: number}[] = [
  {C: Intro, d: 140},
  {C: Chiffrage, d: 240},
  {C: Prelevement, d: 330},
  {C: Badges, d: 240},
  {C: Panneau, d: 240},
  {C: Resultats, d: 220},
  {C: Outro, d: 150},
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
    id="NormaSocial"
    component={Film}
    durationInFrames={TOTAL}
    fps={30}
    width={1920}
    height={1080}
  />
);
