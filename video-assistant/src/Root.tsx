import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';
// CSS de l'app (Tailwind + couches custom) - traité par postcss/tailwind.
import '../../src/index.css';
import {PAPER, INK} from './theme';
import {Accueil, Conversation, Conversations, Intro, Outro} from './scenes';
import {Poc, PocHome} from './Poc';

loadInter('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
loadPlexMono('normal', {weights: ['400', '500'], subsets: ['latin']});

// 30 fps · 1920×1080. L'assistant en 3 temps : on pose la question depuis
// l'accueil (composer hero) → la réponse arrive dans le fil → on retrouve le
// fil dans Mes conversations.
const SCENES: {C: React.FC<{duration: number}>; d: number}[] = [
  {C: Intro, d: 130},
  {C: Accueil, d: 256},
  {C: Conversation, d: 244},
  {C: Conversations, d: 226},
  {C: Outro, d: 150},
];

const TOTAL = SCENES.reduce((a, s) => a + s.d, 0);

const Film: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{background: PAPER, fontFamily: "'Inter', sans-serif", color: INK}}>
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
  <>
    <Composition
      id="NormaAssistant"
      component={Film}
      durationInFrames={TOTAL}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Preuves de concept : vrais composants DS rendus depuis src/ */}
    <Composition id="Poc" component={Poc} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="PocHome" component={PocHome} durationInFrames={120} fps={30} width={1920} height={1080} />
  </>
);
