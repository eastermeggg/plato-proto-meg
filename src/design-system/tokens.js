// Norma design system — single source of truth for tokens.
//
// PHASE A: this module consolidates the tokens currently scattered across
// src/index.css, src/App.js, src/components/ReasoningStepper.js, and
// src/components/AlertDialog.js. No existing component is refactored to
// consume it yet — it serves as the canonical reference that the
// /ui-kit/tokens validation interface reads from.
//
// PHASE B (next conversation, after the user validates the inventory):
// scattered hex/CSS values across the codebase will be replaced with
// references into this module, and Tailwind config will be extended to
// expose these tokens as utilities.

export const colors = {
  // Semantic foreground/background/border + Plato neutrals
  semantic: {
    foreground: '#292524',
    foregroundSecondary: '#78716c',
    foregroundMuted: '#a8a29e',
    foregroundTertiary: '#44403c',
    foregroundQuaternary: '#57534e',
    foregroundStrong: '#1c1917',
    border: '#e7e5e3',
    borderAlt: '#e7e5e4',
    borderStrong: '#d6d3d1',
    borderSubtle: '#f0efed',
    background: '#fafaf9',
    backgroundCanvas: '#F8F7F5',
    backgroundHover: '#f8f7f5',
    backgroundSubtle: '#f5f5f4',
    cream: '#eeece6',
    white: '#ffffff',
  },

  // Badge variants — sourced from src/index.css lines 184-193
  badge: {
    default:           { bg: '#292524', fg: '#ffffff' },
    secondary:         { bg: '#eeece6', fg: '#44403c' },
    outline:           { bg: 'transparent', border: '#e7e5e3', fg: '#292524' },
    destructive:       { bg: '#991b1b', fg: '#ffffff' },
    destructiveSubtle: { bg: '#fef2f2', fg: '#991b1b' },
    ai:                { bg: '#f3e8ff', fg: '#581c87' },
    success:           { bg: '#cce6d9', fg: '#064e3b' },
    info:              { bg: '#dfe8f5', fg: '#1e3a8a' },
    warning:           { bg: '#f9ecd6', fg: '#855b31' },
  },

  // Banner accents — sourced from src/index.css banner-* variants
  banner: {
    ai:      { accent: '#9333ea', accentHover: '#7e22ce', bgFrom: '#faf5ff', border: '#e9d5ff' },
    info:    { accent: '#2563eb', accentHover: '#1d4ed8', bgFrom: '#eff6ff', border: '#bfdbfe' },
    success: { accent: '#059669', accentHover: '#047857', bgFrom: '#ecfdf5', border: '#a7f3d0' },
    warning: { accent: '#d97706', accentHover: '#b45309', bgFrom: '#fffbeb', border: '#fde68a' },
    error:   { accent: '#dc2626', accentHover: '#b91c1c', bgFrom: '#fef2f2', border: '#fecaca' },
    neutral: { accent: '#57534e', accentHover: '#44403c', bgFrom: '#fafaf9', border: '#e7e5e4' },
  },

  // Reasoning step colors — sourced from src/components/ReasoningStepper.js
  step: {
    default:   { icon: '#a8a29e', bg: 'transparent', text: '#78716c' },
    green:     { icon: '#059669', bg: '#cce6d9',     text: '#064e3b' },
    orange:    { icon: '#bd6c1a', bg: '#f9ecd6',     text: '#855b31' },
    red:       { icon: '#991b1b', bg: '#fef2f2',     text: '#7f1d1d' },
    muted:     '#a8a29e',
    primary:   '#44403c',
    secondary: '#78716c',
  },

  // Piece type tags — sourced from src/App.js PIECE_TYPE_COLORS
  piece: {
    expertise:      { bg: '#dfe8f5', fg: '#1e3a8a' },
    decision:       { bg: '#ede9fe', fg: '#5b21b6' },
    revenus:        { bg: '#dcfce7', fg: '#166534' },
    factures:       { bg: '#f9ecd6', fg: '#855b31' },
    medical:        { bg: '#dbeafe', fg: '#1e40af' },
    correspondance: { bg: '#eeece6', fg: '#44403c' },
    administratif:  { bg: '#f1f5f9', fg: '#475569' },
  },

  // Avatar palette — sourced from src/App.js VI_AVATAR_PALETTE
  avatar: [
    { name: 'green',  bg: '#cce6d9', fill: '#064E3B' },
    { name: 'blue',   bg: '#dbeafe', fill: '#1e3a8a' },
    { name: 'plum',   bg: '#ece0eb', fill: '#581c87' },
    { name: 'orange', bg: '#efdec4', fill: '#78350f' },
    { name: 'rose',   bg: '#ffe4e6', fill: '#881337' },
    { name: 'cream',  bg: '#eeece6', fill: '#44403c' },
  ],

  // AlertDialog icon colors — sourced from src/components/AlertDialog.js ICON_COLORS
  icon: {
    default:     '#44403c',
    destructive: '#7f1d1d',
    warning:     '#855b31',
    success:     '#065f46',
    info:        '#1e3a8a',
  },

  // Diff/action colors — sourced from src/App.js ROW_DIFF_COLORS
  diff: {
    add:    '#059669',
    edit:   '#bd6c1a',
    delete: '#991b1b',
  },
};

// Typography — sourced from src/index.css TYPESCALE SYSTEM (lines 152-176)
export const typography = {
  fontFamily: {
    sans:  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    serif: "'RL Para Trial Central', 'Albra', Georgia, serif",
    mono:  "'IBM Plex Mono', monospace",
  },
  scale: {
    'display-lg':         { size: 30, lineHeight: 28, letterSpacing: -0.6, weight: 400 },
    'display-sm':         { size: 24, lineHeight: 28, letterSpacing: -0.6, weight: 500 },
    'display-xs':         { size: 18, lineHeight: 20, letterSpacing: -0.5, weight: 500 },
    'heading-xl':         { size: 24, lineHeight: 28, letterSpacing: -0.6, weight: 600 },
    'heading-xl-medium':  { size: 24, lineHeight: 32, letterSpacing: -0.6, weight: 500 },
    'heading-lg':         { size: 20, lineHeight: 28, letterSpacing: -0.6, weight: 600 },
    'heading-lg-medium':  { size: 20, lineHeight: 28, letterSpacing: -0.6, weight: 500 },
    'heading-md':         { size: 18, lineHeight: 28, letterSpacing: 0,    weight: 600 },
    'heading-md-medium':  { size: 18, lineHeight: 28, letterSpacing: 0,    weight: 500 },
    'heading-sm':         { size: 16, lineHeight: 24, letterSpacing: 0,    weight: 600 },
    'heading-sm-medium':  { size: 16, lineHeight: 24, letterSpacing: 0,    weight: 500 },
    'body':               { size: 14, lineHeight: 20, letterSpacing: 0,    weight: 400 },
    'body-medium':        { size: 14, lineHeight: 20, letterSpacing: 0,    weight: 500 },
    'caption':            { size: 12, lineHeight: 16, letterSpacing: 0.12, weight: 400 },
    'caption-medium':     { size: 12, lineHeight: 16, letterSpacing: 0,    weight: 500 },
    'counter':            { size: 10, lineHeight: 'normal', letterSpacing: 0, weight: 500 },
  },
};

// Spacing scale — observed values across src/index.css and inline styles.
// Tailwind config is currently default (no extension); these document the
// scale actually used by components today.
export const spacing = {
  '0.5': '2px',
  '1':   '4px',
  '1.25':'5px',
  '1.5': '6px',
  '1.75':'7px',
  '2':   '8px',
  '2.5': '10px',
  '3':   '12px',
  '3.5': '14px',
  '4':   '16px',
  '5':   '20px',
};

// Border radius — observed values across src/index.css
export const radius = {
  sm:   '4px',    // is-highlighted
  xs:   '5px',    // is-zone-highlighted
  md:   '6px',    // badge label, banner-minimal button
  lg:   '8px',    // banner button primary
  xl:   '12px',   // banner
  full: '9999px', // badge number / icon-only (pill)
};

// Shadows — sourced from src/index.css banner button + glow pulse, plus
// `xs` matched to the Figma "shadows/xs" effect used by inputs.
export const shadows = {
  xs:                '0 1px 2px rgba(26,26,26,0.05)',
  bannerButton:      '0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05), inset 0 -1px 2px rgba(0,0,0,0.04)',
  bannerButtonHover: '0 2px 6px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06), inset 0 -1px 2px rgba(0,0,0,0.04)',
  glowPulseStart:    '0 0 8px rgba(99, 102, 241, 0.3)',
  glowPulseEnd:      '0 0 20px rgba(99, 102, 241, 0.5)',
};

// Motion — durations + named animations from src/index.css
export const motion = {
  duration: {
    instant: '100ms',
    fast:    '150ms',
    base:    '250ms',
    slow:    '350ms',
    slower:  '600ms',
    pulse:   '2000ms',
    spinSlow:'2500ms',
    gradient:'3000ms',
  },
  easing: {
    standard: 'ease',
    out:      'ease-out',
    inOut:    'ease-in-out',
    bounce:   'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    linear:   'linear',
  },
  animation: {
    shimmer:               { duration: '1.5s',  easing: 'ease-in-out' },
    bounceIn:              { duration: '0.4s',  easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    fadeSlideUp:           { duration: '0.35s', easing: 'ease-out' },
    spinSlow:              { duration: '2.5s',  easing: 'linear' },
    fadeIn:                { duration: '0.2s',  easing: 'ease-out' },
    gradientShift:         { duration: '3s',    easing: 'ease' },
    pulseScale:            { duration: '2s',    easing: 'ease-in-out' },
    glowPulse:             { duration: '2s',    easing: 'ease-in-out' },
    slideInRight:          { duration: '0.25s', easing: 'ease-out' },
    highlightFade:         { duration: '3s',    easing: 'ease-out' },
    diffAccepted:          { duration: '0.6s',  easing: 'ease-out' },
    diffRejected:          { duration: '0.6s',  easing: 'ease-out' },
    stepSlideIn:           { duration: '0.25s', easing: 'ease-out' },
    reasoningChildExpand:  { duration: '0.2s',  easing: 'ease-out' },
  },
};

const tokens = { colors, typography, spacing, radius, shadows, motion };
export default tokens;
