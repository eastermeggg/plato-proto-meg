/** @type {import('tailwindcss').Config} */
// Couleurs = références aux variables CSS du thème (src/design-system/tokens.js
// via theme.js). Chaque valeur : var(--token, #fallbackLight). Le fallback garde
// le light identique même sans injection ; sous .dark les vars basculent.
// GÉNÉRÉ depuis tokens.js — ne pas éditer les valeurs à la main (regénérer).
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: { colors: {
            "foreground": {
                    "DEFAULT": "var(--semantic-foreground, #292524)",
                    "secondary": "var(--semantic-foregroundSecondary, #78716c)",
                    "muted": "var(--semantic-foregroundMuted, #a8a29e)",
                    "tertiary": "var(--semantic-foregroundTertiary, #44403c)",
                    "quaternary": "var(--semantic-foregroundQuaternary, #57534e)",
                    "strong": "var(--semantic-foregroundStrong, #1c1917)"
            },
            "border": {
                    "DEFAULT": "var(--semantic-border, #dfdcd9)",
                    "alt": "var(--semantic-borderAlt, #dfdcda)",
                    "strong": "var(--semantic-borderStrong, #cbc7c4)",
                    "hover": "var(--semantic-borderHover, #a8a29e)",
                    "subtle": "var(--semantic-borderSubtle, #f0efed)"
            },
            "background": {
                    "DEFAULT": "var(--semantic-background, #f8f7f5)",
                    "canvas": "var(--semantic-backgroundCanvas, #f8f7f5)",
                    "subtle": "var(--semantic-backgroundSubtle, #f5f5f4)"
            },
            "cream": "var(--semantic-cream, #eeece6)",
            // Surfaces theme-aware (basculent en dark via --semantic-*). `surface`
            // remplace `bg-white` : #ffffff en light, carte sombre en dark.
            "surface": "var(--semantic-card, #ffffff)",
            "surface-raised": "var(--semantic-surfaceRaised, #ffffff)",
            "overlay": "var(--semantic-overlay, rgba(41,37,36,0.40))",
            "card": {
                    "DEFAULT": "var(--semantic-card, #ffffff)",
                    "foreground": "var(--semantic-cardForeground, #292524)"
            },
            "popover": {
                    "DEFAULT": "var(--semantic-popover, #ffffff)",
                    "foreground": "var(--semantic-popoverForeground, #292524)"
            },
            "primary": {
                    "DEFAULT": "var(--semantic-primary, #292524)",
                    "foreground": "var(--semantic-primaryForeground, #ffffff)"
            },
            "secondary": {
                    "DEFAULT": "var(--semantic-secondary, #eeece6)",
                    "foreground": "var(--semantic-secondaryForeground, #44403c)"
            },
            "link": "var(--feedback-info-text, #1e3a8a)",
            "info": {
                    "DEFAULT": "var(--feedback-info-base, #5593ea)",
                    "subtle": "var(--feedback-info-subtle, #e3e7f2)",
                    "border": "var(--feedback-info-border, #c7ccdb)",
                    "text": "var(--feedback-info-text, #1e3a8a)",
                    "bg": "var(--feedback-info-bg, #eef3fa)"
            },
            "danger": {
                    "DEFAULT": "var(--feedback-destructive-base, #991b1b)",
                    "subtle": "var(--feedback-destructive-subtle, #f2e3e3)",
                    "border": "var(--feedback-destructive-border, #dbc7c7)",
                    "text": "var(--feedback-destructive-text, #7f1d1d)"
            },
            "success": {
                    "DEFAULT": "var(--feedback-success-base, #059669)",
                    "subtle": "var(--feedback-success-subtle, #e3f2ee)",
                    "border": "var(--feedback-success-border, #c7dbd6)",
                    "text": "var(--feedback-success-text, #064e3b)"
            },
            "warning": {
                    "DEFAULT": "var(--feedback-warning-base, #bd6c1a)",
                    "subtle": "var(--feedback-warning-subtle, #f2ebe3)",
                    "border": "var(--feedback-warning-border, #dbd1c7)",
                    "text": "var(--feedback-warning-text, #855b31)"
            },
            "ai": {
                    "DEFAULT": "var(--feedback-ai-base, #9333ea)",
                    "subtle": "var(--feedback-ai-subtle, #ebe3f2)",
                    "border": "var(--feedback-ai-border, #d2c7db)",
                    "text": "var(--feedback-ai-text, #581c87)"
            },
            "brand": {
                    "DEFAULT": "var(--brand-DEFAULT, #f47a2c)",
                    "foreground": "var(--brand-foreground, #ffffff)",
                    "subtle": "var(--brand-subtle, #fff1e6)",
                    "subtle-foreground": "var(--brand-subtleForeground, #b8560f)",
                    "border": "var(--brand-border, #f9c79b)",
                    "muted": "var(--brand-mutedForeground, #b8560f)",
                    "darker": {
                            "DEFAULT": "var(--brand-darker-DEFAULT, #b8560f)",
                            "foreground": "var(--brand-darker-foreground, #ffffff)",
                            "subtle": "var(--brand-darker-subtle, #fbeadd)",
                            "subtle-foreground": "var(--brand-darker-subtleForeground, #8f430c)",
                            "border": "var(--brand-darker-border, #e7b184)"
                    }
            },
            "indigo": {
                    "DEFAULT": "var(--accents-indigo-base, #3b5bdb)",
                    "subtle": "var(--accents-indigo-subtle, #e3e6f2)",
                    "border": "var(--accents-indigo-border, #c7cbdb)",
                    "text": "var(--accents-indigo-text, #2143cc)"
            },
            "violet": {
                    "DEFAULT": "var(--accents-violet-base, #6d46c8)",
                    "subtle": "var(--accents-violet-subtle, #e8e3f2)",
                    "border": "var(--accents-violet-border, #cdc7db)",
                    "text": "var(--accents-violet-text, #5931b4)"
            },
            "emerald": {
                    "DEFAULT": "var(--accents-emerald-base, #3f7350)",
                    "subtle": "var(--accents-emerald-subtle, #e3f2e8)",
                    "border": "var(--accents-emerald-border, #c7dbce)",
                    "text": "var(--accents-emerald-text, #346344)"
            },
            "sand": {
                    "DEFAULT": "var(--accents-sand-base, #7a6244)",
                    "subtle": "var(--accents-sand-subtle, #f2ebe3)",
                    "border": "var(--accents-sand-border, #dbd2c7)",
                    "text": "var(--accents-sand-text, #695339)"
            },
            "slate": {
                    "DEFAULT": "var(--accents-slate-base, #52657d)",
                    "subtle": "var(--accents-slate-subtle, #e3eaf2)",
                    "border": "var(--accents-slate-border, #c7d0db)",
                    "text": "var(--accents-slate-text, #45566b)"
            },
            "stone": {
                    "DEFAULT": "var(--accents-stone-base, #78716c)",
                    "subtle": "var(--accents-stone-subtle, #edeae9)",
                    "border": "var(--accents-stone-border, #d5d0cd)",
                    "text": "var(--accents-stone-text, #66605c)"
            },
            "ochre": "var(--accents-ochre, #b9703f)",
            "meadow": "var(--accents-meadow, #4a9168)",
            "chart": {
                    "1": "var(--chart-0, #8fc6ff)",
                    "2": "var(--chart-1, #297eff)",
                    "3": "var(--chart-2, #155dfc)",
                    "4": "var(--chart-3, #1447e6)",
                    "5": "var(--chart-4, #193cb8)"
            },
            "piece": {
                    "expertise-bg": "var(--piece-expertise-bg, #dfe8f5)",
                    "expertise-fg": "var(--piece-expertise-fg, #1e3a8a)",
                    "decision-bg": "var(--piece-decision-bg, #ede9fe)",
                    "decision-fg": "var(--piece-decision-fg, #5b21b6)",
                    "revenus-bg": "var(--piece-revenus-bg, #dcfce7)",
                    "revenus-fg": "var(--piece-revenus-fg, #166534)",
                    "factures-bg": "var(--piece-factures-bg, #f9ecd6)",
                    "factures-fg": "var(--piece-factures-fg, #855b31)",
                    "medical-bg": "var(--piece-medical-bg, #dbeafe)",
                    "medical-fg": "var(--piece-medical-fg, #1e40af)",
                    "correspondance-bg": "var(--piece-correspondance-bg, #eeece6)",
                    "correspondance-fg": "var(--piece-correspondance-fg, #44403c)",
                    "administratif-bg": "var(--piece-administratif-bg, #f1f5f9)",
                    "administratif-fg": "var(--piece-administratif-fg, #475569)"
            }
    },
    // Échelle d'ombres du DS (source : tokens.js `shadows`, relevé Figma
    // shadows/2xs → 4xl). Échelle COMPLÈTE validée steward 24/09/2026 (miroir
    // de tokens.js `shadows`) : md/lg/2xl/4xl remplacent les défauts Tailwind
    // (noirs) par les crans DS — les 36 usages existants de shadow-md/lg/2xl
    // basculent sur l'échelle (teinte 26,26,26, plus douce).
    boxShadow: {
            "2xs": "0px 1px 1px rgba(26,26,26,0.05)",
            "xs": "0 1px 2px rgba(26,26,26,0.05)",
            "sm": "0px 1px 4px -1px rgba(26,26,26,0.05), 0px 1px 2px -1px rgba(26,26,26,0.05)",
            "md": "0 2px 6px -1px rgba(26,26,26,0.10), 0 1px 2px rgba(26,26,26,0.06)",
            "lg": "0 6px 16px -4px rgba(26,26,26,0.12), 0 2px 6px -2px rgba(26,26,26,0.08)",
            "xl": "0px 8px 10px -1px rgba(26,26,26,0.05), 0px 4px 6px -4px rgba(26,26,26,0.05)",
            "2xl": "0 14px 36px -8px rgba(26,26,26,0.14), 0 4px 10px -4px rgba(26,26,26,0.08)",
            "3xl": "0px 8px 17px rgba(0,0,0,0.03), 0px 30px 30px rgba(0,0,0,0.03), 0px 68px 41px rgba(0,0,0,0.02)",
            "4xl": "0 24px 60px -14px rgba(28,25,23,0.28), 0 8px 20px -8px rgba(28,25,23,0.18)"
    } } },
  plugins: [],
};
