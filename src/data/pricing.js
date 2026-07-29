// ───────────────────────────────────────────────────────────────────────────
// Pricing model (Réflexion Vic) - single source of truth, shared by the app
// (settings: plan/facturation/usage/collaborateurs/invite) and the onboarding
// flow. Per-user licences + a weekly usage quota shown only as a 0-100 % gauge
// (never tokens, never euros). `quotaMult` (×1/×2/×6) is the relative weekly
// headroom; the euro-equivalent budget is internal.
// ───────────────────────────────────────────────────────────────────────────
import {
  ChessPawn, ChessRook, ChessQueen,
  Folder, Users, Sparkles, Calculator, BookOpen, ClipboardList, ShieldCheck, Download,
  Scale, FileSpreadsheet, Stamp,
} from 'lucide-react';

export const PRICING_PLANS = [
  // weeklyEuros = euro-equivalent of real AI usage the weekly quota covers (admin-facing
  // pricing context only - lawyers only ever see the 0-100 % gauge).
  // usage / usageDesc = what the quota means in practice, so an admin can size a licence.
  { id: 'PRO',  name: 'Pro',   monthly: 150, quotaMult: 1, weeklyEuros: 40,  usage: 'Usage léger',    usageDesc: 'Quelques dossiers actifs, rédaction ponctuelle.' },
  { id: 'MAX',  name: 'Max',   monthly: 290, quotaMult: 2, weeklyEuros: 80,  usage: 'Usage modéré',   usageDesc: 'Plusieurs dossiers en parallèle, rédaction régulière.' },
  { id: 'MAX+', name: 'Max +', monthly: 590, quotaMult: 6, weeklyEuros: 160, usage: 'Usage intensif', usageDesc: 'Gros volume de dossiers et de rédaction IA.' },
];
export const PLAN_BY_ID = Object.fromEntries(PRICING_PLANS.map((p) => [p.id, p]));

// Weekly-usage gauge ramp - on-brand stone → amber → peach as the week fills.
// No green/red: stays inside the stone+cream+peach palette.
export const quotaTone = (pct) => {
  if (pct >= 90) return { fill: '#bd6c1a', text: '#855b31', track: '#f1e4d3', warn: true };
  if (pct >= 70) return { fill: '#c98a3c', text: '#855b31', track: '#eeece6', warn: false };
  return { fill: '#292524', text: '#78716c', track: '#eeece6', warn: false };
};

// Demo weekly-usage % for the current user, driven by the billing demo switcher.
export const QUOTA_FILL_PCT = { fresh: 16, mid: 63, high: 92, full: 100 };

// What every licence includes - shown on "Mon usage" (per-user recap).
export const PLAN_FEATURES = [
  { icon: Folder, label: 'Dossiers illimités' },
  { icon: Users, label: 'Utilisateurs illimités' },
  { icon: Sparkles, label: 'Agent IA - quota hebdomadaire selon le plan' },
  { icon: Calculator, label: 'Chiffrages illimités' },
  { icon: BookOpen, label: 'Accès à Plato Jurisprudence illimité' },
  { icon: ClipboardList, label: 'Bordereau et découpe automatique des documents', hint: "jusqu'à 1 000p par PDF" },
  { icon: ShieldCheck, label: 'Tamponnage automatique des pièces' },
  { icon: Download, label: 'Export PDF et Word' },
];

// What each licence includes - shown on the cabinet "Plan et facturation" page.
export const LICENCE_INCLUDED_FEATURES = [
  { icon: Sparkles, label: 'Agent IA illimité' },
  { icon: Calculator, label: 'Chiffrages illimités' },
  { icon: Scale, label: 'Accès à Plato Jurisprudence illimité' },
  { icon: FileSpreadsheet, label: 'Bordereau et découpe automatique des documents' },
  { icon: Stamp, label: 'Tamponnage automatique des pièces' },
  { icon: Download, label: 'Export PDF et Word' },
];

// Tier glyph + quota label, mirrored between the licence picker and the
// billing summary. Pawn → Rook → Queen.
export const TIER_GLYPH = { PRO: ChessPawn, MAX: ChessRook, 'MAX+': ChessQueen };
export const QUOTA_LABEL = { PRO: 'QUOTA DE BASE', MAX: 'QUOTA X2', 'MAX+': 'QUOTA X6' };

// French-locale price formatting (space thousands separator).
export const fmtEur = (n) => n.toLocaleString('fr-FR');
