/* eslint-disable react/jsx-no-target-blank */
// Inline preview implementations of missing primitives.
//
// These are NOT the final implementations — they are visual sketches that match
// the Plato design system so the user can validate look-and-feel against Figma
// before we promote them to real reusable components in src/components/ui/ in
// Phase B.
//
// Each preview accepts the props its eventual real version will accept, so the
// componentDemos.jsx render(values) call sites won't change when we migrate.

import React, { useState } from 'react';
import { Check, X as XIcon, Upload, Sparkles, Inbox, FileText, Plus, Calendar, Eye, EyeOff } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import BadgeReal from '../ui/Badge';
import InputReal from '../ui/Input';

// ============== BUTTON ==============
const BUTTON_VARIANTS = {
  primary:     { bg: '#292524', bgHover: '#44403c', fg: '#ffffff', border: 'transparent' },
  secondary:   { bg: '#eeece6', bgHover: '#e7e5e3', fg: '#44403c', border: 'transparent' },
  ghost:       { bg: 'transparent', bgHover: '#fafaf9', fg: '#44403c', border: 'transparent' },
  outline:     { bg: '#ffffff', bgHover: '#fafaf9', fg: '#292524', border: '#e7e5e3' },
  destructive: { bg: '#7f1d1d', bgHover: '#641515', fg: '#ffffff', border: 'transparent' },
};
const BUTTON_SIZES = {
  sm: { padX: 10, padY: 5,  font: 12, line: 16, radius: 6, iconSize: 14 },
  md: { padX: 14, padY: 7,  font: 14, line: 20, radius: 8, iconSize: 16 },
  lg: { padX: 18, padY: 10, font: 14, line: 20, radius: 8, iconSize: 18 },
};
export function Button({ variant = 'primary', size = 'md', icon: Icon, iconPosition = 'leading', label, disabled, onClick, fullWidth }) {
  const v = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const s = BUTTON_SIZES[size] || BUTTON_SIZES.md;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: `${s.padY}px ${s.padX}px`,
        fontSize: s.font, lineHeight: `${s.line}px`, fontWeight: 500,
        color: v.fg,
        background: hovered && !disabled ? v.bgHover : v.bg,
        border: `1px solid ${v.border === 'transparent' ? 'transparent' : v.border}`,
        borderRadius: s.radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'background 150ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      {Icon && iconPosition === 'leading' && <Icon style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={1.75} />}
      {label}
      {Icon && iconPosition === 'trailing' && <Icon style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={1.75} />}
    </button>
  );
}

// ============== INPUT ==============
// Promoted to a real component at src/components/ui/Input.js.
export const Input = InputReal;

// ============== TEXTAREA ==============
export function Textarea({ value = '', placeholder, disabled, rows = 4, onChange, label, helperText, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 480 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundTertiary }}>{label}</label>}
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        style={{
          width: '100%', resize: 'vertical',
          padding: '8px 12px',
          fontSize: 14, lineHeight: '20px',
          color: colors.semantic.foreground,
          background: disabled ? colors.semantic.backgroundSubtle : '#ffffff',
          border: `1px solid ${error ? '#991b1b' : colors.semantic.border}`,
          borderRadius: 8,
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      {helperText && (
        <span style={{ fontSize: 11, color: error ? '#991b1b' : colors.semantic.foregroundSecondary }}>{helperText}</span>
      )}
    </div>
  );
}

// ============== BADGE ==============
// Promoted to a real component at src/components/ui/Badge.js.
// Re-exported here so the existing /ui-kit/c/Badge sandbox keeps working.
export const Badge = BadgeReal;

// ============== CHECKBOX ==============
export function Checkbox({ checked = false, label, disabled, onChange }) {
  return (
    <label
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          width: 16, height: 16,
          padding: 0,
          borderRadius: 4,
          border: `1px solid ${checked ? colors.semantic.foreground : colors.semantic.border}`,
          background: checked ? colors.semantic.foreground : '#ffffff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'inherit',
        }}
        aria-checked={checked}
        role="checkbox"
      >
        {checked && <Check style={{ width: 11, height: 11, color: '#ffffff' }} strokeWidth={3} />}
      </button>
      {label && <span style={{ fontSize: 14, color: colors.semantic.foreground }}>{label}</span>}
    </label>
  );
}

// ============== SWITCH ==============
export function Switch({ checked = false, label, disabled, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          position: 'relative', width: 36, height: 20, padding: 0,
          borderRadius: 10, border: 'none',
          background: checked ? colors.semantic.foreground : colors.semantic.cream,
          transition: 'background 150ms ease',
          cursor: 'inherit',
          flexShrink: 0,
        }}
        role="switch"
        aria-checked={checked}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: 8, background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'left 150ms ease',
        }} />
      </button>
      {label && <span style={{ fontSize: 14, color: colors.semantic.foreground }}>{label}</span>}
    </label>
  );
}

// ============== RADIO GROUP ==============
export function RadioGroup({ value, options = [], onChange, name = 'radio' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(opt => {
        const checked = value === opt.value;
        return (
          <label key={opt.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <span
              role="radio"
              aria-checked={checked}
              onClick={() => onChange?.(opt.value)}
              style={{
                width: 16, height: 16, borderRadius: 8,
                border: `1px solid ${checked ? colors.semantic.foreground : colors.semantic.border}`,
                background: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {checked && <span style={{ width: 8, height: 8, borderRadius: 4, background: colors.semantic.foreground }} />}
            </span>
            <span style={{ fontSize: 14, color: colors.semantic.foreground }}>{opt.label}</span>
            <input type="radio" name={name} value={opt.value} checked={checked} onChange={() => onChange?.(opt.value)} style={{ display: 'none' }} />
          </label>
        );
      })}
    </div>
  );
}

// ============== TOOLTIP ==============
export function Tooltip({ content, side = 'top', children }) {
  const [show, setShow] = useState(false);
  const positions = {
    top:    { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top:    'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    left:   { right:  'calc(100% + 6px)', top:  '50%', transform: 'translateY(-50%)' },
    right:  { left:   'calc(100% + 6px)', top:  '50%', transform: 'translateY(-50%)' },
  };
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          style={{
            position: 'absolute',
            ...positions[side],
            padding: '5px 8px',
            borderRadius: 6,
            background: '#292524',
            color: '#fff',
            fontSize: 12, lineHeight: '16px', fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

// ============== AVATAR ==============
const AVATAR_SIZES = { sm: 24, md: 32, lg: 40, xl: 56 };
export function Avatar({ size = 'md', initials, image, color = 'cream', shape = 'circle' }) {
  const s = AVATAR_SIZES[size] || 32;
  const palette = {
    green:  { bg: '#cce6d9', fg: '#064E3B' },
    blue:   { bg: '#dbeafe', fg: '#1e3a8a' },
    plum:   { bg: '#ece0eb', fg: '#581c87' },
    orange: { bg: '#efdec4', fg: '#78350f' },
    rose:   { bg: '#ffe4e6', fg: '#881337' },
    cream:  { bg: '#eeece6', fg: '#44403c' },
  };
  const c = palette[color] || palette.cream;
  return (
    <span
      style={{
        width: s, height: s,
        borderRadius: shape === 'circle' ? s / 2 : 6,
        background: c.bg, color: c.fg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(10, s * 0.36), fontWeight: 600,
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        flexShrink: 0,
      }}
    >
      {!image && initials}
    </span>
  );
}

// ============== SEPARATOR ==============
export function Separator({ orientation = 'horizontal', label }) {
  if (orientation === 'vertical') {
    return <span style={{ display: 'inline-block', width: 1, height: 16, background: colors.semantic.border, verticalAlign: 'middle' }} />;
  }
  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <span style={{ flex: 1, height: 1, background: colors.semantic.border }} />
        <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.semantic.foregroundMuted, fontWeight: 500 }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: colors.semantic.border }} />
      </div>
    );
  }
  return <hr style={{ width: '100%', height: 1, background: colors.semantic.border, border: 'none', margin: 0 }} />;
}

// ============== SKELETON ==============
export function Skeleton({ width = '100%', height = 14, radius = 4, count = 1 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: width === '100%' ? '100%' : 'auto' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-shimmer"
          style={{
            width,
            height,
            borderRadius: radius,
            background: '#eeece6',
          }}
        />
      ))}
    </div>
  );
}

// ============== TABS ==============
export function Tabs({ value, options = [], onChange, variant = 'underline' }) {
  if (variant === 'pills') {
    return (
      <div style={{ display: 'inline-flex', padding: 3, background: colors.semantic.cream, borderRadius: 8, gap: 2 }}>
        {options.map(o => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange?.(o.value)}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                color: active ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
                background: active ? '#ffffff' : 'transparent',
                border: 'none', cursor: 'pointer',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${colors.semantic.border}` }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange?.(o.value)}
            style={{
              padding: '8px 14px', fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
              background: 'transparent',
              border: 'none',
              borderBottom: active ? `2px solid ${colors.semantic.foreground}` : '2px solid transparent',
              marginBottom: -1, cursor: 'pointer',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ============== SELECT ==============
export function Select({ value, options = [], onChange, placeholder = 'Select…', disabled }) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value);
  return (
    <div style={{ position: 'relative', maxWidth: 240 }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          width: '100%',
          padding: '7px 12px',
          fontSize: 14, color: colors.semantic.foreground,
          background: disabled ? colors.semantic.backgroundSubtle : '#fff',
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={{ color: current ? colors.semantic.foreground : colors.semantic.foregroundMuted }}>
          {current ? current.label : placeholder}
        </span>
        <span style={{ color: colors.semantic.foregroundMuted, fontSize: 10 }}>▼</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#fff',
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 8px 10px rgba(0,0,0,0.05)',
            padding: 4, zIndex: 5,
          }}
        >
          {options.map(o => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                onClick={() => { onChange?.(o.value); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '6px 10px', borderRadius: 6,
                  fontSize: 14,
                  color: colors.semantic.foreground,
                  background: active ? colors.semantic.cream : 'transparent',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                {o.label}
                {active && <Check style={{ width: 14, height: 14, color: colors.semantic.foreground }} strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============== DROPZONE ==============
export function DropZone({ variant = 'container', label = 'Drop a file here or click to upload', sublabel = 'PDF, DOCX up to 20 MB', onFiles, isDragging }) {
  if (variant === 'inline') {
    return (
      <div
        className={`dropzone-inline ${isDragging ? 'dropzone-drop' : ''}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          border: '1px dashed #d6d3d1',
          borderRadius: 6, background: '#fff',
          fontSize: 13, color: colors.semantic.foregroundSecondary,
          cursor: 'pointer',
        }}
      >
        <Upload style={{ width: 14, height: 14 }} strokeWidth={1.75} />
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div
      className={`dropzone-container ${isDragging ? 'dropzone-drop' : ''}`}
      style={{
        position: 'relative',
        padding: 32,
        border: '2px dashed #d6d3d1',
        borderRadius: 12,
        background: '#fff',
        textAlign: 'center',
        cursor: 'pointer',
        minWidth: 320,
      }}
    >
      <div className="dropzone-default-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: colors.semantic.cream, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Upload style={{ width: 18, height: 18, color: colors.semantic.foregroundTertiary }} strokeWidth={1.75} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: colors.semantic.foreground }}>{label}</div>
        <div style={{ fontSize: 12, color: colors.semantic.foregroundSecondary }}>{sublabel}</div>
      </div>
    </div>
  );
}

// ============== POPOVER ==============
export function Popover({ open: openProp, anchor, children, side = 'bottom', align = 'start' }) {
  const [openInternal, setOpen] = useState(false);
  const open = openProp !== undefined ? openProp : openInternal;
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
      >{anchor}</span>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: side === 'bottom' ? 'calc(100% + 6px)' : undefined,
            bottom: side === 'top' ? 'calc(100% + 6px)' : undefined,
            left: align === 'start' ? 0 : align === 'center' ? '50%' : undefined,
            right: align === 'end' ? 0 : undefined,
            transform: align === 'center' ? 'translateX(-50%)' : undefined,
            background: '#fff',
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 8px 10px rgba(0,0,0,0.05)',
            padding: 12,
            zIndex: 10,
            minWidth: 180,
          }}
        >
          {children}
        </div>
      )}
    </span>
  );
}

// ============== MODAL ==============
export function Modal({ open, onClose, title, description, children, size = 'md' }) {
  if (!open) return null;
  const widths = { sm: 380, md: 512, lg: 640 };
  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Fermer"
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, zIndex: 5,
      }}
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          width: '100%', maxWidth: widths[size],
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: "'RL Para Trial Central', Georgia, serif", fontSize: 18, fontWeight: 500, color: colors.semantic.foreground }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, color: colors.semantic.foregroundSecondary }}>
            <XIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
        {description && (
          <p style={{ margin: 0, fontSize: 14, color: colors.semantic.foregroundSecondary, lineHeight: '20px' }}>{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}

// ============== SHEET / DRAWER ==============
export function Sheet({ open, side = 'right', onClose, title, children, width = 360 }) {
  if (!open) return null;
  const sideStyles = {
    right:  { right: 0, top: 0, bottom: 0, width },
    left:   { left: 0,  top: 0, bottom: 0, width },
    bottom: { left: 0,  right: 0, bottom: 0, height: 320 },
    top:    { left: 0,  right: 0, top: 0,    height: 320 },
  };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
      <div
        role="button"
        tabIndex={-1}
        aria-label="Fermer"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
      />
      <div
        style={{
          position: 'absolute',
          ...sideStyles[side],
          background: '#fff',
          padding: 20,
          boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', gap: 12,
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.semantic.foreground }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <XIcon style={{ width: 16, height: 16, color: colors.semantic.foregroundSecondary }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============== SIDEBAR ==============
export function Sidebar({ items = [], active, onChange, header }) {
  return (
    <div style={{ width: 220, padding: '16px 12px', background: '#fff', border: `1px solid ${colors.semantic.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {header && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, paddingLeft: 8 }}>
          {header}
        </div>
      )}
      {items.map(it => {
        const isActive = active === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => onChange?.(it.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 6,
              fontSize: 14, fontWeight: isActive ? 500 : 400,
              color: isActive ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
              background: isActive ? colors.semantic.backgroundSubtle : 'transparent',
              border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%',
            }}
          >
            {Icon && <Icon style={{ width: 14, height: 14 }} strokeWidth={1.75} />}
            <span>{it.label}</span>
            {it.badge && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.semantic.foregroundMuted, background: colors.semantic.cream, padding: '1px 6px', borderRadius: 10 }}>
                {it.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============== SCROLL AREA ==============
export function ScrollArea({ children, height = 200, width = '100%' }) {
  return (
    <div
      style={{
        height, width,
        overflow: 'auto',
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 8,
        padding: 12,
        background: '#fff',
      }}
    >
      {children}
    </div>
  );
}

// ============== TABLE ==============
export function Table({ columns = [], rows = [], variant = 'default' }) {
  return (
    <div style={{ border: `1px solid ${colors.semantic.border}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: colors.semantic.backgroundSubtle }}>
            {columns.map(col => (
              <th key={col.key} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderTop: `1px solid ${colors.semantic.border}`,
                backgroundColor:
                  variant === 'striped' && i % 2 === 1 ? colors.semantic.backgroundSubtle : 'transparent',
              }}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '10px 12px', verticalAlign: 'top', color: colors.semantic.foreground }}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Header / Row / Cell are exposed standalone for variant exploration but most
// usage will go through the composite Table above.
export function TableHeader({ columns = [] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: colors.semantic.backgroundSubtle }}>
          {columns.map(col => (
            <th key={col.key} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
    </table>
  );
}
export function TableRow({ cells = [], diff }) {
  const stripColors = { add: '#059669', edit: '#bd6c1a', delete: '#991b1b' };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: `1px solid ${colors.semantic.border}` }}>
      <tbody>
        <tr style={{ position: 'relative' }}>
          {diff && (
            <td style={{ width: 4, padding: 0, background: stripColors[diff] || 'transparent' }} />
          )}
          {cells.map((cell, i) => (
            <td key={i} style={{ padding: '10px 12px', fontSize: 13, color: colors.semantic.foreground }}>{cell}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
export function TableCell({ children, align = 'left', mono }) {
  return (
    <span style={{ fontSize: 13, color: colors.semantic.foreground, fontFamily: mono ? "'IBM Plex Mono', monospace" : 'inherit', textAlign: align, display: 'block' }}>
      {children}
    </span>
  );
}

// ============== PLAN CARD ==============
export function PlanCard({ name, price, period = '/mo', description, features = [], featured, ctaLabel = 'Choose plan', onCta }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 240,
        padding: 20,
        background: featured ? colors.semantic.foreground : '#fff',
        color: featured ? '#fff' : colors.semantic.foreground,
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
            <Check style={{ width: 14, height: 14, color: featured ? '#fff' : '#059669', flexShrink: 0, marginTop: 2 }} strokeWidth={2} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: 13, fontWeight: 500,
          color: featured ? colors.semantic.foreground : '#fff',
          background: featured ? '#fff' : colors.semantic.foreground,
          border: 'none', cursor: 'pointer',
          marginTop: 'auto',
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

// ============== CHAT BUBBLE ==============
export function ChatBubble({ author = 'user', content, timestamp, avatar }) {
  const isUser = author === 'user';
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      {avatar}
      <div
        style={{
          maxWidth: 420,
          padding: '10px 14px',
          borderRadius: 12,
          background: isUser ? colors.semantic.foreground : colors.semantic.cream,
          color: isUser ? '#fff' : colors.semantic.foreground,
          fontSize: 14, lineHeight: '20px',
        }}
      >
        {content}
        {timestamp && (
          <div style={{ marginTop: 4, fontSize: 11, color: isUser ? 'rgba(255,255,255,0.6)' : colors.semantic.foregroundMuted }}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}

// ============== CHAT MESSAGE LIST ==============
export function ChatMessageList({ messages = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#fff', border: `1px solid ${colors.semantic.border}`, borderRadius: 12, maxWidth: 520 }}>
      {messages.map((m, i) => (
        <ChatBubble
          key={i}
          author={m.author}
          content={m.content}
          timestamp={m.timestamp}
          avatar={m.author === 'assistant' ? <Avatar size="sm" initials="N" color="cream" /> : <Avatar size="sm" initials="M" color="blue" />}
        />
      ))}
    </div>
  );
}

// ============== CHAT COMPOSER ==============
export function ChatComposer({ value = '', placeholder = 'Demande à Norma…', onChange, onSend, disabled, maxRows = 6 }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: 8,
        background: '#fff',
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 12,
        maxWidth: 520,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <textarea
        value={value}
        onChange={onChange}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1, resize: 'none',
          padding: '8px 10px',
          fontSize: 14, lineHeight: '20px',
          color: colors.semantic.foreground,
          background: 'transparent',
          border: 'none', outline: 'none',
          fontFamily: 'inherit',
          maxHeight: maxRows * 24,
        }}
      />
      <Button variant="primary" size="sm" label="Envoyer" onClick={onSend} disabled={disabled || !value} />
    </div>
  );
}

// ============== COMBOBOX ==============
export function Combobox({ value, options = [], onChange, placeholder = 'Search…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ position: 'relative', maxWidth: 280 }}>
      <input
        value={query || (value ? options.find(o => o.value === value)?.label : '')}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '7px 12px',
          fontSize: 14, color: colors.semantic.foreground,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 8, background: '#fff',
          outline: 'none', fontFamily: 'inherit',
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: `1px solid ${colors.semantic.border}`, borderRadius: 8, padding: 4, zIndex: 5, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxHeight: 200, overflow: 'auto' }}>
          {filtered.map(o => (
            <button
              key={o.value}
              onMouseDown={() => { onChange?.(o.value); setQuery(''); setOpen(false); }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '6px 10px', borderRadius: 6,
                fontSize: 14, color: colors.semantic.foreground,
                background: value === o.value ? colors.semantic.cream : 'transparent',
                border: 'none', cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Re-exports under a registry so componentDemos.jsx can pick by name.
export const PREVIEWS = {
  Button, Input, Textarea, Badge, Checkbox, Switch, RadioGroup, Tooltip, Avatar,
  Separator, Skeleton, Tabs, Select, DropZone, Popover, Modal, Sheet, Sidebar,
  ScrollArea, Table, TableHeader, TableRow, TableCell, PlanCard, ChatBubble,
  ChatMessageList, ChatComposer, Combobox,
};

// Sample data exports for use in componentDemos.jsx
export const SAMPLE_ICONS = { Sparkles, Inbox, FileText, Plus, Calendar, Eye, EyeOff, Upload };
