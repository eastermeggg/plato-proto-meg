import {interpolate, spring} from 'remotion';

// Entrée standard : fondu + petite montée, ressort amorti (le mouvement Plato
// est calme, jamais élastique).
export const rise = (
  frame: number,
  fps: number,
  delay: number,
  {dist = 16, dur = 24}: {dist?: number; dur?: number} = {}
) => {
  const p = spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: dur});
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * dist}px)`,
  } as const;
};

export const fadeInOut = (frame: number, duration: number, fade = 10) =>
  interpolate(frame, [0, fade, duration - fade, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const countUp = (frame: number, start: number, end: number, target: number) => {
  const t = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  return Math.round(target * t);
};
