import React from 'react';
import { Check } from 'lucide-react';
import { colors } from '../../design-system/tokens';

export default function PlanCard({ name, price, period = '/mo', description, features = [], featured, ctaLabel = 'Choose plan', onCta }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 240,
        padding: 20,
        background: featured ? colors.semantic.foreground : colors.semantic.white,
        color: featured ? colors.semantic.white : colors.semantic.foreground,
        border: `1px solid ${featured ? colors.semantic.foreground : colors.semantic.border}`,
        borderRadius: 12,
        display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: featured ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: featured ? 'rgba(255,255,255,0.7)' : colors.semantic.foregroundSecondary, marginBottom: 4 }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>{price}</span>
          <span style={{ fontSize: 13, color: featured ? 'rgba(255,255,255,0.6)' : colors.semantic.foregroundMuted }}>{period}</span>
        </div>
        {description && (
          <p style={{ margin: '6px 0 0 0', fontSize: 13, lineHeight: '18px', color: featured ? 'rgba(255,255,255,0.7)' : colors.semantic.foregroundSecondary }}>
            {description}
          </p>
        )}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, lineHeight: '18px' }}>
            <Check style={{ width: 14, height: 14, color: featured ? colors.semantic.white : colors.diff.add, flexShrink: 0, marginTop: 2 }} strokeWidth={2} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        style={{
          padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          color: featured ? colors.semantic.foreground : colors.semantic.white,
          background: featured ? colors.semantic.white : colors.semantic.foreground,
          border: 'none', cursor: 'pointer', marginTop: 'auto',
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
