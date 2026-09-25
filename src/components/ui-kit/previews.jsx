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
import SeparatorReal from '../ui/Separator';
import CheckboxReal from '../ui/Checkbox';
import SwitchReal from '../ui/Switch';
import RadioGroupReal from '../ui/RadioGroup';
import TooltipReal from '../ui/Tooltip';
import PopoverReal from '../ui/Popover';
import TextareaReal from '../ui/Textarea';
import SelectReal from '../ui/Select';
import TabsReal from '../ui/Tabs';
import AvatarReal from '../ui/Avatar';
import ComboboxReal from '../ui/Combobox';

// ============== BUTTON ==============
const BUTTON_VARIANTS = {
  primary:     { bg: '#292524', bgHover: '#44403c', fg: '#ffffff', border: 'transparent' },
  secondary:   { bg: '#eeece6', bgHover: '#dfdcd9', fg: '#44403c', border: 'transparent' },
  ghost:       { bg: 'transparent', bgHover: '#fafaf9', fg: '#44403c', border: 'transparent' },
  outline:     { bg: '#ffffff', bgHover: '#fafaf9', fg: '#292524', border: '#dfdcd9' },
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
export const Textarea = TextareaReal;

// ============== BADGE ==============
// Promoted to a real component at src/components/ui/Badge.js.
// Re-exported here so the existing /ui-kit/c/Badge sandbox keeps working.
export const Badge = BadgeReal;

// ============== CHECKBOX ==============
export const Checkbox = CheckboxReal;

// ============== SWITCH ==============
export const Switch = SwitchReal;

// ============== RADIO GROUP ==============
// Promu -> src/components/ui/RadioGroup.js (fiche RadioGroup.md, tokenisé, variantes list + card).
export const RadioGroup = RadioGroupReal;

// ============== TOOLTIP ==============
// Promu -> src/components/ui/Tooltip.js (fiche Tooltip.md, tokenisé, surface dérivée).
export const Tooltip = TooltipReal;

// ============== AVATAR ==============
// Promu -> src/components/ui/Avatar.js (fiche Avatar.md, palettes tokens colors.avatar).
export const Avatar = AvatarReal;


// ============== SEPARATOR ==============
export const Separator = SeparatorReal;

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
// Promu -> src/components/ui/Tabs.js (fiche Tabs.md, variant inline seul).
export const Tabs = TabsReal;


// ============== SELECT ==============
// Promu -> src/components/ui/Select.js (fiche Select.md). Re-export pour la sandbox.
export const Select = SelectReal;


// ============== DROPZONE ==============
export function DropZone({ variant = 'container', label = 'Drop a file here or click to upload', sublabel = 'PDF, DOCX up to 20 MB', onFiles, isDragging }) {
  if (variant === 'inline') {
    return (
      <div
        className={`dropzone-inline ${isDragging ? 'dropzone-drop' : ''}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          border: '1px dashed #cbc7c4',
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
        border: '2px dashed #cbc7c4',
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
// Promu -> src/components/ui/Popover.js (fiche Popover.md, tokenisé, clic-extérieur + Échap).
export const Popover = PopoverReal;

// Modal : promu en composant DS -> src/components/ui/Dialog.js (fiche Dialog.md).


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
// Promu -> src/components/ui/Combobox.js (fiche Combobox.md, shadcn brut tokenisé).
export const Combobox = ComboboxReal;


// Re-exports under a registry so componentDemos.jsx can pick by name.
export const PREVIEWS = {
  Button, Input, Textarea, Badge, Checkbox, Switch, RadioGroup, Tooltip, Avatar,
  Separator, Skeleton, Tabs, Select, DropZone, Popover, Sheet, Sidebar,
  ScrollArea, Table, TableHeader, TableRow, TableCell, PlanCard, ChatBubble,
  ChatMessageList, ChatComposer, Combobox,
};

// Sample data exports for use in componentDemos.jsx
export const SAMPLE_ICONS = { Sparkles, Inbox, FileText, Plus, Calendar, Eye, EyeOff, Upload };
