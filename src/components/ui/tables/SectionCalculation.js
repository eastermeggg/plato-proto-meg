import React from 'react';
import { UsersRound } from 'lucide-react';
import { colors, typography, radius, shadows } from '../../../design-system/tokens';
import Badge from '../Badge';
import IVAvatar from '../../IVAvatar';

/**
 * SectionCalculation — Plato design system. Source : Figma node 36554:7459
 * (+ « Container » node 36554:7447), page ComponentTable, famille
 * « Chiffrage / PGP / Totaux ».
 *
 * Bandeau de section d'une table de chiffrage : identité de la (des)
 * victime(s) à gauche, montant total SERIF à droite (+ mini-tabs
 * « par poste / par victime » pour les indirectes).
 *
 * Variants (prop `victimType`) et hauteurs Figma :
 *   indirect  32px  pictogramme users + libellé mono + badge compteur + tabs + montant serif
 *   direct    34px  IVAvatar 32 + surtitre mono + nom Inter 500 + montant serif
 *
 * Le montant est en RL Para (style Figma display-xs 16/20, -0.5) — marqueur
 * voulu de la famille (« Component uses RL Para font »).
 *
 * Compose IVAvatar et Badge (outline count). Tokens uniquement.
 */

const monoCol = {
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size,  // 11
  fontWeight: 500,
  textTransform: 'uppercase',
  lineHeight: 'normal',
  textBoxTrim: 'trim-both',
  textBoxEdge: 'cap alphabetic',
};
const bodyMedium = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale['body-medium'].size,          // 14
  lineHeight: `${typography.scale['body-medium'].lineHeight}px`, // 20
  fontWeight: typography.scale['body-medium'].weight,      // 500
};
const serifAmount = {
  fontFamily: typography.fontFamily.serif,
  fontSize: typography.scale['display-xs'].size,           // 16
  lineHeight: '20px',
  fontWeight: typography.scale['display-xs'].weight,       // 500
  letterSpacing: `${typography.scale['display-xs'].letterSpacing}px`, // -0.5
};

/**
 * VictimContainer — port du nœud Figma « Container » 36554:7447
 * (Property 1 = direct / indirect). Identité de la partie gauche du bandeau.
 */
export function VictimContainer({
  type = 'direct',            // 'direct' | 'indirect'
  name,                       // nom de la victime directe
  label,                      // surtitre mono (« Victime directe » / « Victimes indirectes »)
  count = 2,                  // compteur (indirect)
  avatarColor = 'green',
  style,
}) {
  if (type === 'indirect') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...style }}>
        <span style={{
          width: 32, height: 32, flexShrink: 0, overflow: 'hidden',
          background: colors.semantic.muted,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UsersRound style={{ width: 18, height: 16 }} strokeWidth={1.75} color={colors.semantic.foregroundQuaternary} />
        </span>
        <span style={{ ...monoCol, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
          {label ?? 'Victimes indirectes'}
        </span>
        <Badge variant="outline" count={count} />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...style }}>
      <IVAvatar size={32} color={avatarColor} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, minWidth: 0 }}>
        <span style={{ ...monoCol, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
          {label ?? 'Victime directe'}
        </span>
        <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
          {name ?? 'Annabelle-Sophie Martin'}
        </span>
      </div>
    </div>
  );
}

// Mini-tabs mono 11 (relevé du nœud Tabs I36554:7463) — h 32, fond secondary,
// item actif : fond blanc + ombre xs.
function MiniTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', height: 32, padding: 4,
      background: colors.semantic.secondary, borderRadius: radius.lg,
      boxSizing: 'border-box', flexShrink: 0,
    }}>
      {tabs.map((tab, i) => {
        const active = i === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={onTabChange ? () => onTabChange(i) : undefined}
            style={{
              ...monoCol,
              color: active ? colors.semantic.foreground : colors.semantic.mutedForeground,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 56, height: '100%', padding: '4px 8px', gap: 8,
              background: active ? colors.semantic.white : colors.semantic.secondary,
              border: 'none', borderRadius: radius.md,
              boxShadow: active ? shadows.xs : 'none',
              cursor: onTabChange ? 'pointer' : 'default',
              whiteSpace: 'nowrap', boxSizing: 'border-box',
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

export default function SectionCalculation({
  victimType = 'indirect',    // 'indirect' | 'direct'
  amount = '96 880 €',
  name,                       // nom de la victime directe
  label,                      // surtitre mono override
  count = 2,                  // compteur d'indirectes
  avatarColor = 'green',
  tabs = ['par poste', 'par victime'],
  activeTab = 0,
  onTabChange,
  showTabs,                   // défaut : true en indirect
  width = '100%',
  className,
  style,
}) {
  const isIndirect = victimType === 'indirect';
  const withTabs = showTabs ?? isIndirect;
  return (
    <div className={className} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 6px', width, boxSizing: 'border-box', ...style,
    }}>
      <VictimContainer
        type={victimType}
        name={name}
        label={label}
        count={count}
        avatarColor={avatarColor}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: withTabs ? 12 : 0, flexShrink: 0 }}>
        {withTabs && <MiniTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />}
        <span style={{ ...serifAmount, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
          {amount}
        </span>
      </div>
    </div>
  );
}
