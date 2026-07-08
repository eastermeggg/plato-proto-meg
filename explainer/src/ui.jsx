import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, serif, sans, mono, SHADOW } from "./theme";

// ---- animation helpers ----------------------------------------------------
export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
};

export const rise = (p, px = 24) => ({
  opacity: p,
  transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px)`,
});

// fades a whole scene in and out at its edges (local frame)
export const sceneOpacity = (frame, dur, pad = 14) =>
  interpolate(frame, [0, pad, dur - pad, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ---- primitives -----------------------------------------------------------
export const Stage = ({ children, style }) => (
  <AbsoluteFill style={{ background: C.PAPER, fontFamily: sans, color: C.INK }}>
    {/* faint registration frame nod to the client access backdrop */}
    <GridMarks />
    <AbsoluteFill style={{ padding: 90, ...style }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

export const GridMarks = () => (
  <AbsoluteFill style={{ opacity: 0.55 }}>
    <div style={{ position: "absolute", top: 130, left: 130, right: 130, height: 2, background: `linear-gradient(to right, transparent, ${C.LINE} 12%, ${C.LINE} 88%, transparent)` }} />
    <div style={{ position: "absolute", bottom: 130, left: 130, right: 130, height: 2, background: `linear-gradient(to right, transparent, ${C.LINE} 12%, ${C.LINE} 88%, transparent)` }} />
    {[[130, 130], [1920 - 130, 130], [130, 1080 - 130], [1920 - 130, 1080 - 130]].map(([x, y], i) => (
      <div key={i} style={{ position: "absolute", left: x, top: y, width: 11, height: 11, background: C.INK, transform: "translate(-50%,-50%) rotate(45deg)" }} />
    ))}
  </AbsoluteFill>
);

export const Card = ({ children, style, w = 760, pad = 40 }) => (
  <div style={{ width: w, background: C.WHITE, border: `1px solid ${C.LINE}`, borderRadius: 22, boxShadow: SHADOW, padding: pad, ...style }}>
    {children}
  </div>
);

export const Kicker = ({ children, style }) => (
  <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", color: C.MUTE, ...style }}>
    {children}
  </div>
);

export const Title = ({ children, size = 76, style }) => (
  <div style={{ fontFamily: serif, fontSize: size, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.05, color: C.INK, ...style }}>
    {children}
  </div>
);

export const Body = ({ children, size = 30, color = C.MUTE, style }) => (
  <div style={{ fontFamily: sans, fontSize: size, lineHeight: 1.4, color, ...style }}>{children}</div>
);

// blue « intrant » value badge (mono)
export const Badge = ({ children, tone = "blue" }) => {
  const map = {
    blue: { bg: C.BLUE_BG, fg: C.BLUE },
    green: { bg: "#d9ece2", fg: C.GREEN },
    cream: { bg: C.CREAM, fg: C.INK },
  }[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 40, padding: "0 14px", borderRadius: 9, background: map.bg, color: map.fg, fontFamily: mono, fontSize: 22, fontWeight: 500, letterSpacing: 0.4 }}>
      {children}
    </span>
  );
};

export const PlatoMark = ({ size = 40, color = C.WHITE, bg = C.INK }) => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: size * 0.28, background: bg }}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M5 20V6l7-3 7 3v14M5 20h14M9 20v-6h6v6" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  </span>
);

// bottom-of-frame narration line
export const Caption = ({ children, p = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 74, display: "flex", justifyContent: "center", opacity: p }}>
    <div style={{ fontFamily: sans, fontSize: 30, fontWeight: 500, color: C.INK2, background: "rgba(255,255,255,0.7)", padding: "10px 26px", borderRadius: 999, border: `1px solid ${C.LINE}`, backdropFilter: "blur(4px)" }}>
      {children}
    </div>
  </div>
);

// a compact « window » chrome to frame a product shot
export const Window = ({ children, title, w = 1180, style }) => (
  <div style={{ width: w, background: C.WHITE, border: `1px solid ${C.LINE}`, borderRadius: 18, boxShadow: SHADOW, overflow: "hidden", ...style }}>
    <div style={{ height: 46, display: "flex", alignItems: "center", gap: 8, padding: "0 18px", borderBottom: `1px solid ${C.LINE}`, background: C.SUBTLE }}>
      {["#e5786d", "#e7c14b", "#7fb972"].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 99, background: c, opacity: 0.7 }} />
      ))}
      <span style={{ fontFamily: sans, fontSize: 17, color: C.MUTE, marginLeft: 12 }}>{title}</span>
    </div>
    <div>{children}</div>
  </div>
);
