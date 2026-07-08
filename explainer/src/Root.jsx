import React from "react";
import { AbsoluteFill, Composition, Series } from "remotion";
import { C } from "./theme";
import {
  TitleScene, ContextScene, ChiffrageScene, PeriodScene,
  ClientScene, DuplicateScene, TotalScene, OutroScene,
} from "./scenes";

const SCENES = [
  [TitleScene, 100],
  [ContextScene, 150],
  [ChiffrageScene, 150],
  [PeriodScene, 175],
  [ClientScene, 180],
  [DuplicateScene, 165],
  [TotalScene, 150],
  [OutroScene, 110],
];

const TOTAL = SCENES.reduce((a, [, d]) => a + d, 0); // 1180 frames @ 30fps ≈ 39s

const Main = () => (
  <AbsoluteFill style={{ background: C.PAPER }}>
    <Series>
      {SCENES.map(([Comp, dur], i) => (
        <Series.Sequence key={i} durationInFrames={dur}>
          <Comp />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);

export const RemotionRoot = () => (
  <Composition
    id="Explainer"
    component={Main}
    durationInFrames={TOTAL}
    fps={30}
    width={1920}
    height={1080}
  />
);
