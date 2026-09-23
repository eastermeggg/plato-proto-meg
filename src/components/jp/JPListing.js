import React, { useState } from 'react';
import { Bookmark, Plus, X } from 'lucide-react';
import { colors, typography, radius } from '../../design-system/tokens';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * JPListing — carte JP canonique du DS. Source : Figma « JP Cards »
 * (Plato---Design 09fvZrDgcY83Js7y864E4v, node 2219:19197, relevé 23/09/2026).
 *
 * La carte de décision de jurisprudence, en 4 contextes :
 *   detail   — Matter / page détail poste : carte complète, tags de pied au
 *              survol seulement.
 *   dropdown — Org / dropdown « mémoire pref » : rangée compacte (bord bas
 *              seul), en-tête + tags + bouton « Ajouter ».
 *   added    — Org / mémoire pref ajoutée : carte complète.
 *   tab      — Matter / onglet JP : carte complète, tags de pied toujours
 *              visibles.
 *
 * Anatomie : en-tête (juridiction 14 medium · date 12 · bookmark) + profil
 * 12 muted + tags (Badge secondary / destructive + badge quantum info) +
 * bloc « APPORT DE LA DÉCISION » (filet gauche 2px) + pied (n° mono 11 +
 * badges outline des postes). Compose Badge et Button — pas de re-roll.
 *
 * Tokens : filet du bloc apport = colors.cream[400] (promu 23/09) ;
 * divider d'en-tête #d9d9d9 → borderAlt (le plus proche, assumé).
 *
 * NB : JPRow (src/components/jp/JPRow.js) porte le layout hérité de cette
 * carte (valeurs dérivées : pills 999, fonds subtle) — à migrer vers ce
 * composant (chantier app).
 */

const MONO_11 = {
  fontFamily: typography.fontFamily.mono,
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 'normal',
  textTransform: 'uppercase',
  color: colors.semantic.mutedForeground,
};
const CAPTION = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size, // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`, // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`,
  color: colors.semantic.mutedForeground,
};

// Badge quantum « ATPT 24€/h » — teinte info (poste + valeur retenue).
function QuantumBadge({ poste, value }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: radius.md,
      background: colors.feedback.info.subtle,
      fontFamily: typography.fontFamily.sans, fontSize: 12, fontWeight: 500,
      lineHeight: '16px', color: colors.feedback.info.text, whiteSpace: 'nowrap',
    }}>
      {poste} {value}
    </span>
  );
}

// Badge outline de pied (postes attachés : DSA / DFT / Poste).
function FooterBadge({ label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: radius.md,
      border: `1px solid ${colors.semantic.border}`,
      fontFamily: typography.fontFamily.sans, fontSize: 12, fontWeight: 500,
      lineHeight: '16px', color: colors.semantic.secondaryForeground, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

export default function JPListing({
  variant = 'detail',           // 'detail' | 'dropdown' | 'added' | 'tab'
  jurisdiction = 'CA Rennes · 5e Ch.',
  date = '10/01/2024',
  numero = 'n°22/12458',
  profile = 'Femme, 35 ans',
  tags = [{ label: 'Type fait générateur' }, { label: 'Survivant' }],
  quantum = { poste: 'ATPT', value: '24€/h' },
  noteTitle = 'APPORT DE LA DÉCISION',
  note,
  posteChips = ['DSA', 'DFT', 'Poste'],
  saved = true,                 // bookmark d'en-tête
  selected = false,             // extension app : carte du drawer ouvert (ring ochre)
  onRemove,                     // extension app : X de retrait, révélé au survol
  removeTitle = 'Retirer',
  onAdd,                        // variant dropdown : clic « Ajouter »
  onClick,
  pinHover = false,
  width = '100%',
  style,
  className,
}) {
  const [hovered, setHovered] = useState(false);
  const hover = pinHover || hovered;
  const isDropdown = variant === 'dropdown';
  const footerVisible = variant === 'tab' || (variant !== 'dropdown' && hover);

  const divider = <span style={{ width: 1, height: 12, background: colors.semantic.borderAlt, flexShrink: 0 }} />;

  const header = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.scale['body-medium'].size, // 14
          fontWeight: typography.scale['body-medium'].weight, // 500
          lineHeight: `${typography.scale['body-medium'].lineHeight}px`, // 20
          color: colors.semantic.foreground, whiteSpace: 'nowrap',
        }}>
          {jurisdiction}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: isDropdown ? 9 : 6 }}>
          {isDropdown && <span style={{ ...MONO_11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{numero}</span>}
          {isDropdown && divider}
          <span style={{ ...CAPTION, whiteSpace: 'nowrap' }}>{date}</span>
          {!isDropdown && divider}
          {!isDropdown && saved && (
            <Bookmark style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.75} color={colors.accents.ochre} />
          )}
          {!isDropdown && onRemove && (
            <button
              type="button"
              title={removeTitle}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, border: 'none', background: 'transparent',
                borderRadius: radius.sm, cursor: 'pointer', padding: 0,
                color: colors.semantic.foregroundMuted,
                opacity: hover ? 1 : 0, transition: 'opacity 120ms ease-out',
              }}
            >
              <X style={{ width: 14, height: 14 }} strokeWidth={1.75} />
            </button>
          )}
        </span>
      </div>
      <span style={CAPTION}>{profile}</span>
    </div>
  );

  const tagsRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        {tags.map((t, i) => (
          <Badge key={i} variant={t.tone === 'destructive' ? 'destructive' : 'secondary'} label={t.label} />
        ))}
        {quantum && <QuantumBadge poste={quantum.poste} value={quantum.value} />}
      </div>
      {isDropdown && <Button variant="primary" icon={Plus} label="Ajouter" onClick={onAdd} />}
    </div>
  );

  const noteBlock = note && !isDropdown && (
    <div style={{ padding: '0 2px' }}>
      <div style={{
        borderLeft: `2px solid ${colors.cream[400]}`,
        padding: '4px 0 4px 15px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <span style={MONO_11}>{noteTitle}</span>
        <span style={{
          fontFamily: typography.fontFamily.sans, fontSize: 12, lineHeight: '16px',
          letterSpacing: '0.12px', color: colors.semantic.primary,
        }}>
          {note}
        </span>
      </div>
    </div>
  );

  const footer = !isDropdown && (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderTop: `1px solid ${colors.semantic.border}`,
      paddingTop: 10, paddingLeft: 2,
    }}>
      <span style={{ ...MONO_11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{numero}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        opacity: footerVisible ? 1 : 0,
        transition: 'opacity 120ms ease-out',
      }}>
        {posteChips.map((p, i) => <FooterBadge key={i} label={p} />)}
      </span>
    </div>
  );

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? colors.brand.subtle : colors.semantic.white,
        border: isDropdown ? 'none' : `1px solid ${selected ? colors.accents.ochre : colors.semantic.border}`,
        borderBottom: `1px solid ${colors.semantic.border}`,
        borderRadius: isDropdown ? 0 : radius.md,
        padding: isDropdown ? '12px 12px 13px' : 13,
        display: 'flex', flexDirection: 'column', gap: 14,
        width, boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {header}
        {tagsRow}
      </div>
      {noteBlock}
      {footer}
    </div>
  );
}

// Empilement simple de cartes (listing) — le wrapper de liste du DS.
export function JPListingStack({ children, gap = 8, width = '100%', style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width, ...style }}>
      {children}
    </div>
  );
}
