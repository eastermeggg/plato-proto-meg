import React, { useMemo, useState } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import { ICON_OPTIONS } from './componentDemos';
import Button from '../ui/Button';

/**
 * Sandbox du playground, en trois morceaux composables (façon Storybook) :
 *  - useDemoValues(demo)  — l'état des args (values / setValue / applyPreset / reset)
 *  - <DemoCanvas>         — presets + canvas de rendu (le composant React réel)
 *  - <ControlsPanel>      — le panneau de propriétés (rail droit sticky de la page)
 */
export function useDemoValues(demo) {
  const defaults = useMemo(() => {
    if (!demo?.controls) return {};
    return Object.fromEntries(Object.entries(demo.controls).map(([k, c]) => [k, c.default]));
  }, [demo]);
  const [values, setValues] = useState(defaults);
  React.useEffect(() => { setValues(defaults); }, [defaults]);
  return {
    values,
    setValue: (k, v) => setValues(prev => ({ ...prev, [k]: v })),
    applyPreset: (preset) => setValues(prev => ({ ...prev, ...preset.values })),
    reset: () => setValues(defaults),
  };
}

export function DemoCanvas({ demo, componentId, values, applyPreset }) {
  if (!demo) {
    return (
      <PlaceholderBox
        text={`Pas de démo pour ${componentId}. Le code est la source : établir le composant depuis Figma (ds-figma-build), puis sa démo dans componentDemos.jsx.`}
      />
    );
  }
  if (demo.placeholder) {
    return <PlaceholderBox text={demo.placeholder} link={demo.link} />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {demo.presets && demo.presets.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {demo.presets.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundTertiary, backgroundColor: colors.semantic.cream, border: 'none', cursor: 'pointer' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div
        data-demo={componentId ? `plato/${componentId}` : undefined}
        style={{
          padding: 40,
          borderRadius: 12,
          border: `1px solid ${colors.semantic.border}`,
          backgroundColor: colors.semantic.background,
          minHeight: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {demo.render ? demo.render(values) : null}
      </div>
    </div>
  );
}

// bare : mode « rail » — pas de carte propre (le rail fournit le bord), header
// h-12 collé en haut façon nav. Sinon : carte bordée autonome.
export function ControlsPanel({ demo, values, setValue, reset, bare = false }) {
  if (!demo || demo.placeholder || !demo.controls || !Object.keys(demo.controls).length) return null;
  const header = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: bare ? '0 14px' : '10px 14px', height: bare ? 48 : 'auto',
      borderBottom: `1px solid ${bare ? colors.semantic.borderStrong : colors.semantic.border}`,
      position: bare ? 'sticky' : 'static', top: 0, zIndex: 1,
      background: colors.semantic.background, flexShrink: 0,
    }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.mutedForeground, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Controls
      </span>
      <Button variant="ghost" size="xs" icon={RotateCcw} label="Reset" onClick={reset} title="Reset all controls to defaults" />
    </div>
  );
  // Rendu ordonné + en-têtes de groupe (control.group) quand le groupe change.
  const rows = [];
  let lastGroup = null;
  let prevWasHeader = false;
  Object.entries(demo.controls).forEach(([key, control], i) => {
    if (control.group && control.group !== lastGroup) {
      rows.push(
        <div key={`grp-${control.group}`} style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.semantic.foregroundMuted,
          padding: '10px 14px 4px', borderTop: i === 0 ? 'none' : `1px solid ${colors.semantic.border}`,
          background: colors.semantic.backgroundSubtle,
        }}>
          {control.group}
        </div>
      );
      lastGroup = control.group;
      prevWasHeader = true;
    }
    rows.push(
      <ControlRow key={key} propName={key} control={control} value={values[key]} onChange={v => setValue(key, v)} isFirst={i === 0 || prevWasHeader} />
    );
    prevWasHeader = false;
  });
  if (bare) return <>{header}<div>{rows}</div></>;
  return (
    <div style={{ border: `1px solid ${colors.semantic.border}`, borderRadius: 10, backgroundColor: colors.semantic.card, overflow: 'hidden' }}>
      {header}
      {rows}
    </div>
  );
}

// Une ligne de propriété (nom + type + input + description).
function ControlRow({ propName, control, value, onChange, isFirst }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderTop: isFirst ? 'none' : `1px solid ${colors.semantic.border}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: colors.semantic.foreground }}>
          {propName}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: colors.feedback.ai.text, backgroundColor: colors.feedback.ai.subtle, borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
          {control.type}
        </span>
      </div>
      <ControlInput control={control} value={value} onChange={onChange} />
      {control.description && (
        <span style={{ fontSize: 11.5, color: colors.semantic.foregroundSecondary, lineHeight: '16px' }}>
          {control.description}
        </span>
      )}
    </div>
  );
}

function ControlInput({ control, value, onChange }) {
  if (control.type === 'boolean') {
    return <Toggle value={!!value} onChange={onChange} />;
  }

  if (control.type === 'text') {
    return (
      <input
        type="text"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={control.default || ''}
        style={{
          width: '100%',
          padding: '6px 10px',
          fontSize: 13,
          color: colors.semantic.foreground,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 6,
          background: colors.semantic.card,
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    );
  }

  if (control.type === 'select') {
    // Vrai dropdown (natif, stylé tokens) — chevron custom via SVG en fond.
    const chevron = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>";
    return (
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '7px 30px 7px 10px',
          fontSize: 13,
          fontFamily: "'IBM Plex Mono', monospace",
          color: colors.semantic.foreground,
          background: `${colors.semantic.card} url("${chevron}") no-repeat right 10px center`,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 6,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        }}
      >
        {control.options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (control.type === 'icon') {
    const names = Object.keys(ICON_OPTIONS);
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {names.map(name => {
          const Icon = ICON_OPTIONS[name];
          const active = value === name;
          return (
            <button
              key={name}
              onClick={() => onChange(name)}
              title={name}
              style={{
                width: 30, height: 30,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6,
                color: active ? colors.semantic.white : colors.semantic.foregroundTertiary,
                backgroundColor: active ? colors.semantic.foreground : colors.semantic.cream,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon style={{ width: 16, height: 16 }} strokeWidth={1.6} />
            </button>
          );
        })}
      </div>
    );
  }

  return <span style={{ fontSize: 12, color: colors.semantic.foregroundMuted }}>(no control for type "{control.type}")</span>;
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        position: 'relative',
        width: 36,
        height: 20,
        padding: 0,
        borderRadius: 10,
        border: 'none',
        background: value ? colors.semantic.foreground : colors.semantic.cream,
        transition: 'background-color 150ms ease',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      role="switch"
      aria-checked={value}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: value ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: 8,
          background: colors.semantic.card,
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'left 150ms ease',
        }}
      />
    </button>
  );
}

function PlaceholderBox({ text, link }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 12,
        border: `1px dashed ${colors.semantic.border}`,
        backgroundColor: colors.semantic.backgroundSubtle,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: colors.semantic.foregroundSecondary, lineHeight: '20px' }}>
        {text}
      </p>
      {link && (
        <a
          href={link}
          style={{
            marginTop: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            color: colors.banner.info.accent,
            textDecoration: 'none',
          }}
        >
          <ExternalLink style={{ width: 12, height: 12 }} /> {link}
        </a>
      )}
    </div>
  );
}
