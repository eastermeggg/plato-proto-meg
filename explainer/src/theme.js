import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

// Plato « stone + cream + blue » palette (mirrors the app design system)
export const C = {
  INK: "#292524",
  INK2: "#44403c",
  MUTE: "#78716c",
  FAINT: "#a8a29e",
  LINE: "#e7e5e3",
  LINE2: "#d6d3d1",
  PAPER: "#f8f7f5",
  CREAM: "#eeece6",
  SUBTLE: "#fafaf9",
  WHITE: "#ffffff",
  BLUE: "#1e3a8a",
  BLUE_BG: "#dfe8f5",
  BLUE_BORDER: "#aabcd5",
  GREEN: "#3f7d5f",
  RED: "#b4453a",
};

// Fraunces stands in for the app's « RL Para Trial Central » serif display face
export const serif = loadFraunces("normal", { weights: ["400", "500", "600"] }).fontFamily;
export const sans = loadInter("normal", { weights: ["400", "500", "600", "700"] }).fontFamily;
export const mono = loadMono("normal", { weights: ["400", "500"] }).fontFamily;

export const SHADOW = "0px 1px 2px rgba(26,26,26,0.05), 0px 18px 40px -12px rgba(26,26,26,0.18)";
export const SHADOW_SM = "0px 1px 2px rgba(26,26,26,0.06), 0px 8px 20px -10px rgba(26,26,26,0.12)";
