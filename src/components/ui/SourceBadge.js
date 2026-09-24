import React, { useState } from 'react';
import {
  FileText, Gavel, Scale, BookOpen, LayoutTemplate, Mail, Globe, Table2, Landmark, Calculator,
} from 'lucide-react';
import { colors } from '../../design-system/tokens';

// Plato SourceBadge — pill INTERACTIVE de source, établie depuis le set custom
// Figma « Source Badge » (page Badge de Plato---System : ×60 = 10 sources ×
// 2 tailles × 3 états) + la doc `badge-usage-guide` / `source-badge-docs`.
//
// Règle des deux familles (spec badge-rationalization) :
//   STATUS / SEVERITY / CATEGORY → Badge (non interactif)
//   SOURCE TYPE (cliquable, ouvre la source) → SourceBadge (ici)
//
// Identité par source = icône + teinte (familles accents/feedback des tokens).
// NB : teintes traduites vers les tokens les plus proches ; à réconcilier avec
// les fills exacts du Figma si besoin (relevé non fait sur ce set).
export const SOURCE_TYPES = {
  piece:    { label: 'Pièce',    icon: FileText,       fam: colors.feedback.info },
  jp:       { label: 'JP',       icon: Gavel,          fam: colors.accents.violet },
  loi:      { label: 'Loi',      icon: Scale,          fam: colors.accents.indigo },
  code:     { label: 'Code',     icon: BookOpen,       fam: colors.accents.sand },
  modele:   { label: 'Modèle',   icon: LayoutTemplate, fam: colors.accents.stone },
  email:    { label: 'Email',    icon: Mail,           fam: colors.accents.emerald },
  web:      { label: 'Web',      icon: Globe,          fam: colors.accents.slate },
  ligne:    { label: 'Ligne',    icon: Table2,         fam: colors.feedback.warning },
  pass:     { label: 'PASS',     icon: Landmark,       fam: colors.feedback.info },
  assiette: { label: 'Assiette', icon: Calculator,     fam: colors.accents.sand },
};

const SIZES = {
  sm: { padX: 8, padY: 2, font: 12,   icon: 11, gap: 4, radius: 6 },
  md: { padX: 10, padY: 4, font: 12.5, icon: 13, gap: 5, radius: 6 },
};

export default function SourceBadge({
  type = 'piece', size = 'sm', selected = false, showIcon = true,
  label, children, onClick, onMouseEnter, onMouseLeave, className = '', style, ...rest
}) {
  const t = SOURCE_TYPES[type] || SOURCE_TYPES.piece;
  const s = SIZES[size] || SIZES.sm;
  const [hovered, setHovered] = useState(false);
  const Icon = t.icon;
  // 3 états du set Figma : default (fond subtle, bord transparent) ·
  // hover (bord de la famille) · selected (bord appuyé + texte de la famille).
  const borderColor = selected ? t.fam.text : hovered ? t.fam.border : 'transparent';
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      {...rest}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e); }}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'baseline', gap: s.gap,
        padding: `${s.padY}px ${s.padX}px`,
        fontSize: s.font, fontWeight: 500, lineHeight: '16px',
        color: colors.semantic.foregroundTertiary,
        backgroundColor: t.fam.subtle,
        border: `1px solid ${borderColor}`,
        borderRadius: s.radius,
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap', verticalAlign: 'baseline',
        transition: 'border-color 0.15s, background-color 0.15s',
        ...style,
      }}
    >
      {showIcon && (
        <Icon style={{ width: s.icon, height: s.icon, color: t.fam.text, position: 'relative', top: 1, flexShrink: 0 }} strokeWidth={1.75} />
      )}
      {label && <span style={{ color: t.fam.text }}>{label}</span>}
      {children}
    </span>
  );
}
