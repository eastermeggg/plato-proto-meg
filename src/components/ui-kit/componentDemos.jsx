import React, { useState } from 'react';
import {
  Sparkles, FileText, BookOpen, Search, Calculator, Inbox, Plus, Briefcase,
  Heart, Scale, Mail, Bell, Settings, User, Trash2, Edit, Filter, Eye,
} from 'lucide-react';
import AlertDialog from '../AlertDialog';
import EmptyState from '../EmptyState';
import PromptSuggestionCard from '../PromptSuggestionCard';
import SuggestionsMenu from '../SuggestionsMenu';
import JPPill from '../jp/JPPill';
import JPRow from '../jp/JPRow';
import JPListingChat from '../jp/JPListingChat';
import JPListingPosteDetail from '../jp/JPListingPosteDetail';
import { getDecisionById as getMockDecisionById } from '../../data/mockDecisions';
import * as P from './previews';

const noop = () => {};

// Available Lucide icons exposed to the icon-type controls.
export const ICON_OPTIONS = {
  Sparkles, FileText, BookOpen, Search, Calculator, Inbox, Plus, Briefcase,
  Heart, Scale, Mail, Bell, Settings, User, Trash2, Edit, Filter, Eye,
};

const sampleDecision = {
  id: 'demo-decision-1',
  numero: '22/01234',
  jurisdiction: 'CA Paris',
  chambre: '2e ch. civile',
  date: '2024-09-12',
  category: 'Accident de la circulation',
  victimProfile: 'Homme, 31 ans',
  status: 'Survivant',
  resume: "La cour retient une valorisation du point de DFP à 2 350 € pour une victime jeune avec un déficit de 15%.",
  amounts: [{ poste: 'PGPF', displayValue: '12 450 €' }],
};

// Sandbox frame that scopes `position: fixed` descendants (like AlertDialog's
// fullscreen overlay) to the wrapper instead of the whole viewport.
// The `transform` creates a containing block for fixed-position children.
function ScopedDialogFrame({ width = 640, height = 360, children, onReopen, isOpen }) {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px dashed #cbc7c4',
        background: '#ffffff',
        backgroundImage: 'radial-gradient(#dfdcd9 1px, transparent 1px)',
        backgroundSize: '12px 12px',
        transform: 'translateZ(0)',
      }}
    >
      {children}
      {!isOpen && (
        <button
          onClick={onReopen}
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 1,
            padding: '6px 10px', fontSize: 12, fontWeight: 500,
            color: '#44403c', background: '#eeece6',
            border: 'none', borderRadius: 6, cursor: 'pointer',
          }}
        >
          Reopen dialog
        </button>
      )}
    </div>
  );
}

// AlertDialog rendered inline — open by default, contained in the sandbox frame.
function AlertDialogTrigger({ title, description, iconVariant, actionLabel, actionVariant, cancelLabel, warning }) {
  const [open, setOpen] = useState(true);
  // Reset to open whenever any control value changes
  React.useEffect(() => { setOpen(true); }, [title, description, iconVariant, actionLabel, actionVariant, cancelLabel, warning]);
  return (
    <ScopedDialogFrame isOpen={open} onReopen={() => setOpen(true)}>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        iconVariant={iconVariant}
        title={title}
        description={description}
        warning={warning || undefined}
        actionLabel={actionLabel}
        actionVariant={actionVariant}
        cancelLabel={cancelLabel}
        onAction={() => setOpen(false)}
      />
    </ScopedDialogFrame>
  );
}

function ModalTrigger(props) {
  const [open, setOpen] = useState(true);
  React.useEffect(() => { setOpen(true); }, [props.title, props.description, props.size]);
  return (
    <ScopedDialogFrame width={520} height={300} isOpen={open} onReopen={() => setOpen(true)}>
      <P.Modal {...props} open={open} onClose={() => setOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <P.Button variant="ghost" label="Cancel" onClick={() => setOpen(false)} />
          <P.Button variant="primary" label="Confirm" onClick={() => setOpen(false)} />
        </div>
      </P.Modal>
    </ScopedDialogFrame>
  );
}

function SheetTrigger(props) {
  const [open, setOpen] = useState(true);
  React.useEffect(() => { setOpen(true); }, [props.title, props.side, props.width]);
  return (
    <ScopedDialogFrame width={560} height={320} isOpen={open} onReopen={() => setOpen(true)}>
      <P.Sheet {...props} open={open} onClose={() => setOpen(false)}>
        <p style={{ margin: 0, fontSize: 14, color: '#78716c', lineHeight: '20px' }}>
          Slide-out panel for secondary content. Click the dim background or the close button to dismiss.
        </p>
      </P.Sheet>
    </ScopedDialogFrame>
  );
}

/**
 * Demo registry. Each entry is either:
 *   {
 *     description: string,
 *     controls: { [prop]: { type, default, options?, description? } },
 *     render: (values) => ReactNode,
 *     presets?: [{ label, values }]
 *   }
 * or a placeholder for components we haven't built yet:
 *   { placeholder: string, link?: string }
 *
 * Control types: 'boolean' | 'text' | 'select' | 'icon'
 */
export const componentDemos = {
  // ========================================================================
  // Real Plato components (existing files)
  // ========================================================================
  AlertDialog: {
    description: 'Confirmation dialog. Click the button to open.',
    controls: {
      title:         { type: 'text',    default: 'Confirm action',                                    description: 'Headline.' },
      description:   { type: 'text',    default: 'You are about to apply these changes to the dossier.', description: 'Body text under title.' },
      warning:       { type: 'text',    default: '',                                                   description: 'Optional amber warning block.' },
      iconVariant:   { type: 'select',  default: 'default',  options: ['default', 'destructive', 'warning', 'success', 'info'], description: 'Icon color.' },
      actionLabel:   { type: 'text',    default: 'Confirm',                                            description: 'Primary action button label.' },
      actionVariant: { type: 'select',  default: 'primary',  options: ['primary', 'destructive'],     description: 'Primary action color + matching cancel tone.' },
      cancelLabel:   { type: 'text',    default: 'Cancel',                                             description: 'Cancel button label.' },
    },
    render: v => <AlertDialogTrigger {...v} />,
    presets: [
      { label: 'Primary',     values: { iconVariant: 'default',     actionVariant: 'primary',     title: 'Confirm action',           description: 'You are about to apply these changes to the dossier.', actionLabel: 'Confirm' } },
      { label: 'Destructive', values: { iconVariant: 'destructive', actionVariant: 'destructive', title: 'Delete this dossier?',     description: 'This will permanently delete the dossier and all its pieces.', actionLabel: 'Delete' } },
    ],
  },

  EmptyState: {
    description: 'Centered empty state with icon, title, description, and optional primary/secondary actions.',
    controls: {
      icon:                 { type: 'icon',    default: 'Inbox',                                                description: 'Icon shown in the cream circle.' },
      title:                { type: 'text',    default: 'Aucun dossier',                                        description: 'Headline (serif).' },
      description:          { type: 'text',    default: 'Crée ton premier dossier pour commencer.',             description: 'Supporting copy under title.' },
      primaryActionLabel:   { type: 'text',    default: '',                                                     description: 'Primary action label. Leave empty to hide.' },
      secondaryActionLabel: { type: 'text',    default: '',                                                     description: 'Secondary action label. Leave empty to hide.' },
    },
    render: v => (
      <EmptyState
        icon={ICON_OPTIONS[v.icon]}
        title={v.title}
        description={v.description || undefined}
        primaryAction={v.primaryActionLabel ? { label: v.primaryActionLabel, icon: Plus, onClick: noop } : undefined}
        secondaryAction={v.secondaryActionLabel ? { label: v.secondaryActionLabel, onClick: noop } : undefined}
      />
    ),
    presets: [
      { label: 'No actions',   values: { icon: 'Inbox',     title: 'Aucun dossier',  description: 'Crée ton premier dossier pour commencer.', primaryActionLabel: '',          secondaryActionLabel: '' } },
      { label: 'With actions', values: { icon: 'FileText',  title: 'Aucune pièce',   description: "Importe une pièce pour démarrer l'analyse.", primaryActionLabel: 'Importer', secondaryActionLabel: 'En savoir plus' } },
    ],
  },

  PromptSuggestionCard: {
    description: 'Cold-start prompt card used in the chat sidebar empty state.',
    controls: {
      icon:     { type: 'icon',    default: 'Sparkles',              description: 'Icon shown in the 36px square.' },
      label:    { type: 'text',    default: 'Résume ce dossier',     description: 'Suggestion text.' },
      pinHover: { type: 'boolean', default: false,                   description: 'Force the hover visuals (specimens only).' },
      disabled: { type: 'boolean', default: false,                   description: 'Disabled state.' },
    },
    render: v => (
      <PromptSuggestionCard
        icon={ICON_OPTIONS[v.icon]}
        label={v.label}
        pinHover={v.pinHover}
        disabled={v.disabled}
        onClick={noop}
      />
    ),
    presets: [
      { label: 'Default',        values: { icon: 'Sparkles',   label: 'Résume ce dossier',  pinHover: false, disabled: false } },
      { label: 'Hover (pinned)', values: { icon: 'Calculator', label: 'Calcule la PGPF',     pinHover: true,  disabled: false } },
      { label: 'Disabled',       values: { icon: 'BookOpen',   label: 'Cherche une décision', pinHover: false, disabled: true  } },
    ],
  },

  SuggestionsMenu: {
    description: "Compact popover menu — header bar + icon+label rows.",
    controls: {
      header:       { type: 'text',    default: "Suggestions d'actions", description: 'Mono uppercase header.' },
      itemCount:    { type: 'select',  default: '4', options: ['1', '2', '3', '4', '5'], description: 'Number of items to show.' },
      disabled:     { type: 'boolean', default: false,                   description: 'Disable all rows.' },
    },
    render: v => {
      const allItems = [
        { icon: Sparkles,   label: 'Résume ce dossier' },
        { icon: Calculator, label: 'Calcule la PGPF' },
        { icon: BookOpen,   label: 'Cherche une décision' },
        { icon: Search,     label: "Rechercher dans l'expertise" },
        { icon: FileText,   label: 'Génère une note de synthèse' },
      ];
      return (
        <div style={{ width: 280 }}>
          <SuggestionsMenu
            header={v.header}
            disabled={v.disabled}
            items={allItems.slice(0, parseInt(v.itemCount, 10))}
          />
        </div>
      );
    },
  },

  JPPill: {
    description: 'Inline JP citation. Four variants share the same height + baseline so they flow inside running prose. **`ref`** = `[saved?] n° ↗` (bare reference identifier — pair with textual citation in prose: "Cass. 2e civ., 12 décembre 2019, n° [pill]"). **`xs`** = `[saved?] jurisdiction · n°` (standalone inline citation). **`sm`** = `[saved?] jurisdiction · date · n° · poste · quantum` (dense result lists). **`quantum`** = `[saved?] n° · poste · quantum` (focus on the saved JP value). Chamber is always hidden — it lives on the JPRow card. Bookmark icon (in `#b9703f`) appears when the JP is `saved`. Hover = orange ring (`#b9703f`). Selected = orange tint + ring (drawer-open).',
    controls: {
      variant:      { type: 'select',  default: 'ref',         options: ['ref', 'quantum', 'acte', 'xs', 'sm'], description: 'Context + density. **Chat**: `ref` (n° + icon), `quantum` (n° + poste·value + icon). **Acte**: `acte` (juridiction · date · n°, no icon). Legacy: `xs`, `sm`.' },
      jurisdiction: { type: 'text',    default: 'CA Paris',    description: 'Court / jurisdiction (e.g. "CA Paris", "Cass. 2e civ.", "TJ Versailles"). Hidden in `ref` and `quantum`.' },
      date:         { type: 'text',    default: '2024-09-12',  description: 'ISO date — rendered short (dd/mm/yy) in `sm` only.' },
      numero:       { type: 'text',    default: '22/01234',    description: 'N° pourvoi / RG — the citable identifier (always shown).' },
      poste:        { type: 'text',    default: 'PGPF',        description: 'Poste tag shown in `sm` and `quantum`.' },
      amount:       { type: 'text',    default: '12 450 €',    description: 'Quantum value shown in `sm` and `quantum` (accent color `#b9703f`).' },
      saved:        { type: 'boolean', default: false,         description: 'Prepend the bookmark icon — signals the JP is saved at poste or org scope.' },
      isSelected:   { type: 'boolean', default: false,         description: 'Selected state — orange tint + ring (drawer-open).' },
    },
    render: v => (
      <JPPill
        variant={v.variant}
        decision={{
          ...sampleDecision,
          jurisdiction: v.jurisdiction,
          date: v.date,
          numero: v.numero,
          amounts: [{ poste: v.poste, displayValue: v.amount }],
        }}
        saved={v.saved}
        isSelected={v.isSelected}
      />
    ),
    presets: [
      // Two real contexts. Use the variant select to add quantum (`quantum`)
      // and toggle `saved` / `isSelected` directly. Override values via the
      // text inputs.
      { label: 'Chat',  values: { variant: 'ref',  jurisdiction: 'Cass. 2e civ.', date: '2019-12-12', numero: '18-22.727', poste: 'PGPF', amount: '12 450 €', saved: false } },
      { label: 'Acte',  values: { variant: 'acte', jurisdiction: 'CA Paris',      date: '2024-09-12', numero: '22/01234',  poste: 'PGPF', amount: '12 450 €', saved: false } },
    ],
  },

  JPRow: {
    description: 'Unit row primitive. Wrap inside JPListingChat (mini-table) or use directly with `asCard` inside JPListingPosteDetail (floating cards). Two save states: ⭐ favorited (firm canon) + 🔖 bookmarked (this poste).',
    controls: {
      jurisdiction: { type: 'text',    default: 'CA Paris',          description: 'Court / jurisdiction.' },
      chambre:      { type: 'text',    default: '2e ch. civile',     description: 'Chamber.' },
      numero:       { type: 'text',    default: '22/01234',          description: 'N° pourvoi / RG.' },
      poste:        { type: 'text',    default: 'PGPF',              description: 'Poste tag.' },
      amount:       { type: 'text',    default: '12 450 €',          description: 'Quantum value.' },
      showAmount:   { type: 'boolean', default: true,                description: 'Show the date + amount right columns.' },
      favorited:    { type: 'boolean', default: false,               description: '⭐ In firm JP de référence (workspace scope).' },
      bookmarked:   { type: 'boolean', default: false,               description: '🔖 Attached to this poste on this matter.' },
      isSelected:   { type: 'boolean', default: false,               description: 'Selected (drawer-open) state.' },
      asCard:       { type: 'boolean', default: false,               description: 'Standalone card chrome (border + radius + shadow).' },
    },
    render: v => (
      <JPRow
        decision={{
          ...sampleDecision,
          jurisdiction: v.jurisdiction,
          chambre: v.chambre,
          numero: v.numero,
          amounts: [{ poste: v.poste, displayValue: v.amount }],
        }}
        showAmount={v.showAmount}
        favorited={v.favorited}
        bookmarked={v.bookmarked}
        isSelected={v.isSelected}
        asCard={v.asCard}
      />
    ),
    presets: [
      { label: 'Default',         values: { favorited: false, bookmarked: false } },
      { label: 'Favorited',       values: { favorited: true,  bookmarked: false } },
      { label: 'Bookmarked',      values: { favorited: false, bookmarked: true  } },
      { label: 'Both',            values: { favorited: true,  bookmarked: true  } },
      { label: 'No amount',       values: { showAmount: false } },
      { label: 'As card',         values: { asCard: true } },
    ],
  },

  ReasoningStepper: {
    placeholder: 'Live demo lives in /ui-kit/reasoning. The Reasoning Stepper renders backend tool steps with collapsible groups, color-coded by step type.',
    link: '/ui-kit/reasoning',
  },

  // ========================================================================
  // Missing primitives — using inline preview implementations from previews.jsx
  // (Phase A sketches — to be promoted to real components in src/components/ui/
  // during Phase B once Figma references are validated.)
  // ========================================================================
  Button: {
    description: 'Primary, secondary, ghost, outline, and destructive button variants.',
    controls: {
      label:        { type: 'text',    default: 'Action',                                                   description: 'Button label.' },
      variant:      { type: 'select',  default: 'primary', options: ['primary', 'secondary', 'ghost', 'outline', 'destructive'], description: 'Visual variant.' },
      size:         { type: 'select',  default: 'md',      options: ['sm', 'md', 'lg'],                     description: 'Button size.' },
      icon:         { type: 'icon',    default: 'Plus',                                                     description: 'Optional leading/trailing icon.' },
      iconPosition: { type: 'select',  default: 'leading', options: ['leading', 'trailing', 'none'],        description: 'Icon position.' },
      disabled:     { type: 'boolean', default: false,                                                      description: 'Disabled state.' },
      fullWidth:    { type: 'boolean', default: false,                                                      description: 'Stretch to container width.' },
    },
    render: v => (
      <P.Button
        variant={v.variant}
        size={v.size}
        icon={v.iconPosition === 'none' ? undefined : ICON_OPTIONS[v.icon]}
        iconPosition={v.iconPosition === 'none' ? 'leading' : v.iconPosition}
        label={v.label}
        disabled={v.disabled}
        fullWidth={v.fullWidth}
      />
    ),
    presets: [
      { label: 'Primary',     values: { variant: 'primary',     label: 'Save',     iconPosition: 'none' } },
      { label: 'Secondary',   values: { variant: 'secondary',   label: 'Filter',   icon: 'Filter', iconPosition: 'leading' } },
      { label: 'Outline',     values: { variant: 'outline',     label: 'Cancel',   iconPosition: 'none' } },
      { label: 'Ghost',       values: { variant: 'ghost',       label: 'Skip',     iconPosition: 'none' } },
      { label: 'Destructive', values: { variant: 'destructive', label: 'Delete',   icon: 'Trash2', iconPosition: 'leading' } },
    ],
  },

  Input: {
    description: 'Field component — label + helper + slot. The slot defaults to a text input but can hold any input shape (Select, Combobox, Textarea, custom). Source: src/components/ui/Input.js · Figma node 33541:69574.',
    controls: {
      label:          { type: 'text',    default: 'Label',                                                                       description: 'Field label.' },
      helperText:     { type: 'text',    default: 'Info. manquante pour calculer',                                              description: 'Helper / description text.' },
      layout:         { type: 'select',  default: 'vertical',  options: ['vertical', 'horizontal'],                              description: 'Field layout.' },
      helperPosition: { type: 'select',  default: 'below',     options: ['below', 'between'],                                    description: 'Helper position (vertical only). below = under the input. between = between label and input.' },
      placeholder:    { type: 'text',    default: 'Placeholder text',                                                            description: 'Placeholder for the default text input.' },
      value:          { type: 'text',    default: '',                                                                            description: 'Current value (default text input only).' },
      error:          { type: 'boolean', default: false,                                                                         description: 'Error state — colors the label.' },
      warning:        { type: 'boolean', default: false,                                                                         description: 'Warning state — colors the label and helper.' },
      aiGenerated:    { type: 'boolean', default: false,                                                                         description: 'Show the AI sparkle icon next to the label.' },
      disabled:       { type: 'boolean', default: false,                                                                         description: 'Disable the default text input.' },
    },
    render: v => (
      <div style={{ width: 320 }}>
        <P.Input
          label={v.label || undefined}
          helperText={v.helperText || undefined}
          layout={v.layout}
          helperPosition={v.helperPosition}
          error={v.error}
          warning={v.warning}
          aiGenerated={v.aiGenerated}
          placeholder={v.placeholder}
          value={v.value}
          onChange={() => {}}
          disabled={v.disabled}
        />
      </div>
    ),
    presets: [
      { label: 'Default · helper below',   values: { layout: 'vertical', helperPosition: 'below',   error: false, warning: false, label: 'Label', helperText: 'Info. manquante pour calculer' } },
      { label: 'Helper between',           values: { layout: 'vertical', helperPosition: 'between', error: false, warning: false, label: 'Label', helperText: 'Info. manquante pour calculer' } },
      { label: 'Horizontal',               values: { layout: 'horizontal', error: false, warning: false, label: 'Label', helperText: 'Info. manquante pour…' } },
      { label: 'Error',                    values: { layout: 'vertical', helperPosition: 'below',   error: true,  warning: false, label: 'Label', helperText: 'Info. manquante pour calculer' } },
      { label: 'Warning',                  values: { layout: 'vertical', helperPosition: 'below',   error: false, warning: true,  label: 'Label', helperText: 'Info. manquante pour calculer' } },
      { label: 'AI generated',             values: { layout: 'vertical', helperPosition: 'below',   error: false, warning: false, aiGenerated: true, label: 'Montant suggéré', helperText: 'Inféré depuis l\'expertise' } },
    ],
  },

  Textarea: {
    description: 'Multi-line text input.',
    controls: {
      label:       { type: 'text',    default: 'Notes',                                  description: 'Label.' },
      placeholder: { type: 'text',    default: 'Add internal notes about this dossier…', description: 'Placeholder.' },
      value:       { type: 'text',    default: '',                                       description: 'Current value.' },
      rows:        { type: 'select',  default: '4', options: ['2', '4', '6', '8'],       description: 'Visible rows.' },
      error:       { type: 'boolean', default: false,                                    description: 'Error state.' },
      disabled:    { type: 'boolean', default: false,                                    description: 'Disabled.' },
    },
    render: v => (
      <P.Textarea
        label={v.label || undefined}
        placeholder={v.placeholder}
        value={v.value}
        rows={parseInt(v.rows, 10)}
        error={v.error}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  Badge: {
    description: 'Inline status / tag badge. Three modes: label, number (pill), and icon-only (pill). Source: src/components/ui/Badge.js · Figma node 136:1178 (Plato---System).',
    controls: {
      mode:          { type: 'select',  default: 'label',   options: ['label', 'number', 'icon-only'],            description: 'Badge mode. label = text with optional icons. number = pill with count. icon-only = pill with one icon.' },
      label:         { type: 'text',    default: 'Label',                                                          description: 'Badge text (label mode).' },
      count:         { type: 'text',    default: '8',                                                              description: 'Count (number mode). > 99 renders as "99+".' },
      icon:          { type: 'icon',    default: 'Sparkles',                                                       description: 'Icon for label-mode left/right and icon-only mode.' },
      hasLeftIcon:   { type: 'boolean', default: false,                                                            description: 'Show the leading icon (label mode).' },
      hasRightIcon:  { type: 'boolean', default: false,                                                            description: 'Show the trailing icon (label mode).' },
      variant:       { type: 'select',  default: 'default', options: ['default', 'secondary', 'outline', 'destructive', 'ai', 'success', 'info', 'warning'], description: 'Color variant.' },
      size:          { type: 'select',  default: 'sm',      options: ['sm', 'md'],                                 description: 'Size.' },
    },
    render: v => {
      const Icon = ICON_OPTIONS[v.icon];
      if (v.mode === 'icon-only') {
        return <P.Badge variant={v.variant} size={v.size} icon={Icon} iconOnly />;
      }
      if (v.mode === 'number') {
        const n = parseInt(v.count, 10);
        return <P.Badge variant={v.variant} size={v.size} count={Number.isFinite(n) ? n : v.count} />;
      }
      return (
        <P.Badge
          variant={v.variant}
          size={v.size}
          leftIcon={v.hasLeftIcon ? Icon : undefined}
          rightIcon={v.hasRightIcon ? Icon : undefined}
          label={v.label}
        />
      );
    },
    presets: [
      { label: 'Label · default',   values: { mode: 'label',     variant: 'default',     label: 'Label' } },
      { label: 'Label · success',   values: { mode: 'label',     variant: 'success',     label: 'Validated' } },
      { label: 'Label · warning',   values: { mode: 'label',     variant: 'warning',     label: 'À revoir' } },
      { label: 'Label + icon · AI', values: { mode: 'label',     variant: 'ai',          label: 'AI',  hasLeftIcon: true,  icon: 'Sparkles' } },
      { label: 'Label · outline',   values: { mode: 'label',     variant: 'outline',     label: 'Tag' } },
      { label: 'Number · default',  values: { mode: 'number',    variant: 'default',     count: '8' } },
      { label: 'Number · 99+',      values: { mode: 'number',    variant: 'destructive', count: '124' } },
      { label: 'Icon-only · AI',    values: { mode: 'icon-only', variant: 'ai',          icon: 'Sparkles' } },
    ],
  },

  Checkbox: {
    description: 'Single checkbox with optional label.',
    controls: {
      label:    { type: 'text',    default: 'I agree to the terms', description: 'Optional label.' },
      checked:  { type: 'boolean', default: false,                  description: 'Checked state.' },
      disabled: { type: 'boolean', default: false,                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Checkbox
        checked={v.checked}
        label={v.label || undefined}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  Switch: {
    description: 'Boolean toggle switch with optional label.',
    controls: {
      label:    { type: 'text',    default: 'Enable notifications', description: 'Optional label.' },
      checked:  { type: 'boolean', default: true,                   description: 'Checked state.' },
      disabled: { type: 'boolean', default: false,                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Switch
        checked={v.checked}
        label={v.label || undefined}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  RadioGroup: {
    description: 'Vertical stack of mutually exclusive radio options.',
    controls: {
      value: { type: 'select', default: 'monthly', options: ['monthly', 'yearly', 'enterprise'], description: 'Selected option value.' },
    },
    render: v => (
      <P.RadioGroup
        value={v.value}
        options={[
          { value: 'monthly',    label: 'Monthly billing' },
          { value: 'yearly',     label: 'Yearly billing (save 20%)' },
          { value: 'enterprise', label: 'Enterprise' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Tooltip: {
    description: 'Tooltip — hover the trigger to reveal.',
    controls: {
      content: { type: 'text',    default: 'Apply changes to the dossier',          description: 'Tooltip text.' },
      side:    { type: 'select',  default: 'top', options: ['top', 'bottom', 'left', 'right'], description: 'Position relative to trigger.' },
    },
    render: v => (
      <P.Tooltip content={v.content} side={v.side}>
        <P.Button variant="outline" label="Hover me" />
      </P.Tooltip>
    ),
  },

  Avatar: {
    description: 'Initials-only or image-backed circular/square avatar.',
    controls: {
      initials: { type: 'text',    default: 'MR',                                                description: 'Initials shown when no image.' },
      size:     { type: 'select',  default: 'md',  options: ['sm', 'md', 'lg', 'xl'],            description: 'Size.' },
      color:    { type: 'select',  default: 'cream', options: ['green', 'blue', 'plum', 'orange', 'rose', 'cream'], description: 'Background color from VI palette.' },
      shape:    { type: 'select',  default: 'circle', options: ['circle', 'rounded'],            description: 'Shape.' },
    },
    render: v => <P.Avatar initials={v.initials} size={v.size} color={v.color} shape={v.shape} />,
  },

  Separator: {
    description: 'Visual divider — horizontal, vertical, or labelled.',
    controls: {
      orientation: { type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'], description: 'Direction.' },
      label:       { type: 'text',   default: '',                                                description: 'Optional centre label (horizontal only).' },
    },
    render: v => (
      <div style={{ width: v.orientation === 'horizontal' ? 280 : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: v.orientation === 'vertical' ? 60 : 'auto' }}>
        <P.Separator orientation={v.orientation} label={v.orientation === 'horizontal' ? (v.label || undefined) : undefined} />
      </div>
    ),
  },

  Skeleton: {
    description: 'Shimmering placeholder for loading states.',
    controls: {
      width:  { type: 'text',    default: '240px',         description: 'Bar width (CSS length).' },
      height: { type: 'text',    default: '14',            description: 'Bar height in px.' },
      count:  { type: 'select',  default: '3', options: ['1', '2', '3', '4'], description: 'Number of bars.' },
    },
    render: v => (
      <P.Skeleton width={v.width} height={parseInt(v.height, 10)} count={parseInt(v.count, 10)} />
    ),
  },

  Tabs: {
    description: 'Tabbed navigation. Underline (default) or pill style.',
    controls: {
      value:   { type: 'select', default: 'overview', options: ['overview', 'pieces', 'chronologie'], description: 'Active tab.' },
      variant: { type: 'select', default: 'underline', options: ['underline', 'pills'],               description: 'Visual variant.' },
    },
    render: v => (
      <P.Tabs
        value={v.value}
        variant={v.variant}
        options={[
          { value: 'overview',    label: 'Overview' },
          { value: 'pieces',      label: 'Pièces' },
          { value: 'chronologie', label: 'Chronologie' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Select: {
    description: 'Custom dropdown selector. Click to open the option list.',
    controls: {
      value:       { type: 'select', default: 'paris', options: ['paris', 'lyon', 'bordeaux', 'lille'], description: 'Selected value.' },
      placeholder: { type: 'text',   default: 'Select a court…',                                       description: 'Placeholder when nothing is selected.' },
      disabled:    { type: 'boolean', default: false,                                                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Select
        value={v.value}
        placeholder={v.placeholder}
        disabled={v.disabled}
        options={[
          { value: 'paris',    label: 'CA Paris' },
          { value: 'lyon',     label: 'CA Lyon' },
          { value: 'bordeaux', label: 'CA Bordeaux' },
          { value: 'lille',    label: 'CA Lille' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Combobox: {
    description: 'Searchable selector — type to filter options.',
    controls: {
      placeholder: { type: 'text', default: 'Search a poste…', description: 'Placeholder text.' },
    },
    render: v => (
      <P.Combobox
        placeholder={v.placeholder}
        options={[
          { value: 'pgpf',  label: 'PGPF — Pertes de gains professionnels futurs' },
          { value: 'dfpa',  label: 'DFPA — Déficit fonctionnel permanent' },
          { value: 'sff',   label: 'SFF — Souffrances endurées' },
          { value: 'prej_e',label: 'Préjudice esthétique permanent' },
          { value: 'pgpa',  label: 'PGPA — Pertes de gains professionnels actuels' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Dropdown: {
    description: 'Context menu / action dropdown. Click the trigger to open.',
    controls: {
      triggerLabel: { type: 'text', default: 'Actions', description: 'Trigger button label.' },
    },
    render: v => (
      <P.Popover
        anchor={<P.Button variant="outline" label={v.triggerLabel} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180 }}>
          {[
            { icon: Edit,   label: 'Renommer' },
            { icon: Eye,    label: 'Voir détails' },
            { icon: Trash2, label: 'Supprimer' },
          ].map((it, i) => (
            <button
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                fontSize: 14, color: '#292524',
                background: 'transparent', border: 'none', textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <it.icon style={{ width: 14, height: 14, color: '#44403c' }} strokeWidth={1.75} />
              {it.label}
            </button>
          ))}
        </div>
      </P.Popover>
    ),
  },

  Popover: {
    description: 'Anchored popover — click the trigger to open.',
    controls: {
      side:  { type: 'select', default: 'bottom', options: ['top', 'bottom'],          description: 'Side relative to trigger.' },
      align: { type: 'select', default: 'start',  options: ['start', 'center', 'end'], description: 'Alignment along the side.' },
    },
    render: v => (
      <P.Popover
        side={v.side}
        align={v.align}
        anchor={<P.Button variant="outline" label="Open popover" />}
      >
        <div style={{ fontSize: 13, color: '#292524', maxWidth: 220 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Quick actions</strong>
          <p style={{ margin: 0, color: '#78716c' }}>Anchored to the trigger. Click outside to dismiss.</p>
        </div>
      </P.Popover>
    ),
  },

  Modal: {
    description: 'Modal overlay scoped to the sandbox area.',
    controls: {
      title:       { type: 'text',   default: 'Modal title',                                                       description: 'Header.' },
      description: { type: 'text',   default: 'Generic modal body. Replace with the AlertDialog for confirmations.', description: 'Body text.' },
      size:        { type: 'select', default: 'md', options: ['sm', 'md', 'lg'],                                    description: 'Width preset.' },
    },
    render: v => <ModalTrigger title={v.title} description={v.description} size={v.size} />,
  },

  Drawer: {
    description: 'Generic side-mounted drawer. Same primitive as Sheet — semantic alias.',
    controls: {
      side:  { type: 'select', default: 'right', options: ['right', 'left'], description: 'Side.' },
      title: { type: 'text',   default: 'Drawer',                            description: 'Header.' },
      width: { type: 'select', default: '360', options: ['280', '360', '480'], description: 'Width.' },
    },
    render: v => <SheetTrigger side={v.side} title={v.title} width={parseInt(v.width, 10)} />,
  },

  Sheet: {
    description: 'Side / bottom sheet for secondary content.',
    controls: {
      side:  { type: 'select', default: 'right', options: ['right', 'left', 'bottom', 'top'], description: 'Side.' },
      title: { type: 'text',   default: 'Sheet',                                              description: 'Header.' },
    },
    render: v => <SheetTrigger side={v.side} title={v.title} />,
  },

  Sidebar: {
    description: 'Vertical navigation list with active state and optional badge counts.',
    controls: {
      active: { type: 'select', default: 'dossiers', options: ['dossiers', 'jurisprudence', 'redaction', 'settings'], description: 'Active item.' },
      header: { type: 'text',   default: 'Workspace',                                                                  description: 'Optional header.' },
    },
    render: v => (
      <P.Sidebar
        header={v.header}
        active={v.active}
        items={[
          { id: 'dossiers',     label: 'Dossiers',      icon: FileText, badge: 12 },
          { id: 'jurisprudence',label: 'Jurisprudence', icon: BookOpen },
          { id: 'redaction',    label: 'Rédaction',     icon: Edit },
          { id: 'settings',     label: 'Paramètres',    icon: Settings },
        ]}
        onChange={() => {}}
      />
    ),
  },

  ScrollArea: {
    description: 'Bordered scrollable area.',
    controls: {
      height: { type: 'select', default: '160', options: ['120', '160', '240', '320'], description: 'Height in px.' },
    },
    render: v => (
      <P.ScrollArea height={parseInt(v.height, 10)} width={320}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ fontSize: 13, color: '#292524', padding: '6px 8px', borderRadius: 6, background: i % 2 ? '#fafaf9' : 'transparent' }}>
              Row {i + 1} — sample content for scroll area
            </div>
          ))}
        </div>
      </P.ScrollArea>
    ),
  },

  DropZone: {
    description: 'File drop zone — full-block container variant or compact inline variant.',
    controls: {
      variant:  { type: 'select',  default: 'container', options: ['container', 'inline'], description: 'Visual variant.' },
      label:    { type: 'text',    default: 'Drop a file here or click to upload',          description: 'Primary label.' },
      sublabel: { type: 'text',    default: 'PDF, DOCX up to 20 MB',                        description: 'Secondary label (container variant only).' },
    },
    render: v => <P.DropZone variant={v.variant} label={v.label} sublabel={v.sublabel} />,
  },

  Table: {
    description: 'Tabular data with header + body. Striped variant alternates row backgrounds.',
    controls: {
      variant: { type: 'select', default: 'default', options: ['default', 'striped'], description: 'Row variant.' },
    },
    render: v => (
      <P.Table
        variant={v.variant}
        columns={[
          { key: 'date',   label: 'Date' },
          { key: 'titre',  label: 'Pièce' },
          { key: 'type',   label: 'Type' },
          { key: 'statut', label: 'Statut' },
        ]}
        rows={[
          { date: '12/03/2024', titre: 'Expertise médicale', type: 'Expertise',     statut: <P.Badge variant="success" size="sm" label="Validé" /> },
          { date: '04/04/2024', titre: 'Constat huissier',   type: 'Administratif', statut: <P.Badge variant="warning" size="sm" label="À revoir" /> },
          { date: '22/05/2024', titre: 'Bulletin de salaire', type: 'Revenus',      statut: <P.Badge variant="info"    size="sm" label="Pending" /> },
        ]}
      />
    ),
  },

  TableHeader: {
    description: 'Standalone table header row.',
    controls: {},
    render: () => (
      <P.TableHeader columns={[
        { key: 'date',   label: 'Date' },
        { key: 'titre',  label: 'Pièce' },
        { key: 'type',   label: 'Type' },
        { key: 'statut', label: 'Statut' },
      ]} />
    ),
  },
  TableRow: {
    description: 'Standalone table row with optional left diff strip.',
    controls: {
      diff: { type: 'select', default: 'none', options: ['none', 'add', 'edit', 'delete'], description: 'Diff type — colors the 4px left strip.' },
    },
    render: v => (
      <div style={{ width: 480, border: '1px solid #dfdcd9', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <P.TableRow
          diff={v.diff === 'none' ? undefined : v.diff}
          cells={['12/03/2024', 'Expertise médicale', 'Expertise', '4 500 €']}
        />
      </div>
    ),
  },
  TableCell: {
    description: 'Single cell — supports mono font and alignment.',
    controls: {
      mono:  { type: 'boolean', default: false,    description: 'Mono font.' },
      align: { type: 'select',  default: 'left',   options: ['left', 'center', 'right'], description: 'Text align.' },
    },
    render: v => (
      <div style={{ width: 200 }}>
        <P.TableCell mono={v.mono} align={v.align}>4 500,00 €</P.TableCell>
      </div>
    ),
  },

  PlanCard: {
    description: 'Pricing tier card. Featured variant inverts to dark.',
    controls: {
      name:        { type: 'text',    default: 'Studio',                                              description: 'Plan name.' },
      price:       { type: 'text',    default: '€39',                                                  description: 'Price.' },
      period:      { type: 'text',    default: '/mo',                                                  description: 'Period suffix.' },
      description: { type: 'text',    default: 'Unlimited dossiers + collaboration up to 5 members.', description: 'Tagline.' },
      featured:    { type: 'boolean', default: false,                                                  description: 'Featured (dark) variant.' },
    },
    render: v => (
      <P.PlanCard
        name={v.name}
        price={v.price}
        period={v.period}
        description={v.description}
        featured={v.featured}
        features={[
          'Unlimited dossiers',
          '5 team members',
          'AI assistance',
          'Priority support',
        ]}
        ctaLabel="Choose plan"
      />
    ),
  },

  ChatBubble: {
    description: 'Single chat message bubble — user (filled dark) or assistant (cream).',
    controls: {
      author:  { type: 'select', default: 'assistant', options: ['user', 'assistant'], description: 'Bubble author / alignment.' },
      content: { type: 'text',   default: "Voici un résumé du dossier en 3 points…",  description: 'Message text.' },
      timestamp: { type: 'text', default: '14:32',                                     description: 'Optional timestamp.' },
    },
    render: v => (
      <ChatBubbleWithAvatar author={v.author} content={v.content} timestamp={v.timestamp} />
    ),
  },

  ChatMessageList: {
    description: 'Scrollable list of ChatBubbles representing a conversation.',
    controls: {},
    render: () => (
      <P.ChatMessageList
        messages={[
          { author: 'user',      content: 'Résume ce dossier en 3 points.',                                              timestamp: '14:30' },
          { author: 'assistant', content: 'Voici les éléments saillants : (1) accident de la circulation — (2) hospitalisation 12 jours — (3) ITT 6 mois.', timestamp: '14:30' },
          { author: 'user',      content: 'Quelle est la PGPF probable ?',                                                timestamp: '14:32' },
          { author: 'assistant', content: 'Sous réserve de validation des justificatifs, je projette une PGPF de l\'ordre de 12 450 €.', timestamp: '14:33' },
        ]}
      />
    ),
  },

  ChatComposer: {
    description: 'Chat input with auto-growing textarea + send button.',
    controls: {
      placeholder: { type: 'text',    default: 'Demande à Norma…', description: 'Placeholder.' },
      value:       { type: 'text',    default: '',                  description: 'Current value.' },
      disabled:    { type: 'boolean', default: false,               description: 'Disabled state.' },
    },
    render: v => (
      <P.ChatComposer
        value={v.value}
        placeholder={v.placeholder}
        disabled={v.disabled}
        onChange={() => {}}
        onSend={() => {}}
      />
    ),
  },

  // ========================================================================
  // Domain components
  // ========================================================================
  JPListingChat: {
    description: 'Mini-table for chat results: card chrome + JURIDICTION · DATE · TAUX header + JPRow children. Use in chat ai-jp-cards rendering.',
    controls: {
      itemCount:  { type: 'select',  default: '4', options: ['1', '2', '4', '5'], description: 'Number of rows.' },
      showHeader: { type: 'boolean', default: true,                                description: 'Show the column header row.' },
    },
    render: v => {
      const samplePinned = ['jp-atpt-01', 'jp-atpt-03', 'jp-atpt-06', 'jp-atpt-02', 'jp-atpt-04'];
      const count = parseInt(v.itemCount, 10);
      return (
        <div style={{ width: 560 }}>
          <JPListingChat
            decisions={samplePinned.slice(0, count).map(getMockDecisionById).filter(Boolean)}
            showHeader={v.showHeader}
            getRowProps={() => ({ onClick: noop })}
          />
        </div>
      );
    },
    presets: [
      { label: '4 rows + header',  values: { itemCount: '4', showHeader: true } },
      { label: 'No header',        values: { itemCount: '4', showHeader: false } },
      { label: '1 row',            values: { itemCount: '1', showHeader: true } },
    ],
  },

  JPListingPosteDetail: {
    description: 'Section wrapper for PosteDetailView. Renders the "Jurisprudences retenues" section header + a stack of floating JPRow cards (each with its own border + shadow). No add button, no stats.',
    controls: {
      itemCount:     { type: 'select', default: '3', options: ['0', '1', '3', '5'], description: 'Number of pinned decisions. 0 shows the empty state.' },
      currentPosteId:{ type: 'text',   default: 'atpt',                              description: 'Poste used to pick the matching amount on each row.' },
    },
    render: v => {
      const samplePinned = [
        { decisionId: 'jp-atpt-01', posteIds: ['atpt'] },
        { decisionId: 'jp-atpt-03', posteIds: ['atpt'] },
        { decisionId: 'jp-atpt-06', posteIds: ['atpt'] },
        { decisionId: 'jp-atpt-02', posteIds: ['atpt'] },
        { decisionId: 'jp-atpt-04', posteIds: ['atpt'] },
      ];
      const count = parseInt(v.itemCount, 10);
      return (
        <div style={{ width: 560 }}>
          <JPListingPosteDetail
            pinnedJP={samplePinned.slice(0, count)}
            currentPosteId={v.currentPosteId}
            onOpenDrawer={noop}
            onSearchJP={noop}
          />
        </div>
      );
    },
    presets: [
      { label: 'Empty state',  values: { itemCount: '0', currentPosteId: 'atpt' } },
      { label: '3 cards',      values: { itemCount: '3', currentPosteId: 'atpt' } },
      { label: '5 cards',      values: { itemCount: '5', currentPosteId: 'atpt' } },
    ],
  },

  // ========================================================================
  // Domain components — placeholder until we wire mock data
  // ========================================================================
  JPPopoverCard:           { placeholder: 'Live demo TBD — JPPopoverCard positions itself relative to a JPPill anchor and needs a hover trigger. View in app: open a JP pill in any chat thread.', link: '/ui-kit' },
  DecisionDrawer:          { placeholder: 'Live demo TBD — DecisionDrawer is a full-width right drawer that requires decision data and works best in flow.', link: '/dossier' },
  JPAddStepper:            { placeholder: 'Live demo TBD — multi-step modal (search / paste link / upload PDF) wired to scope checkboxes.', link: '/dossier' },
  JPSearchView:            { placeholder: 'Live demo TBD — search UI with filter sidebar + result cards. Needs search index data.', link: '/dossier' },
  SaveDestinationPopover:  { placeholder: 'Live demo TBD — popover used by DecisionDrawer and JPSearchView to save into matter/postes/usuals.', link: '/dossier' },
  SlashCommandPalette:     { placeholder: 'Live demo TBD — keyboard-navigable command palette triggered from the chat input.', link: '/dossier' },
  ActesList:               { placeholder: 'Live demo TBD — table of drafted actes for a dossier. Needs redaction scenarios.', link: '/dossier' },
  RedactionStepper:        { placeholder: 'Live demo TBD — 2x2 grid for selecting document type to draft.', link: '/dossier' },
  ActCanvas:               { placeholder: 'Live demo TBD — markdown-aware canvas with inline pièce badges. Needs redaction scenario data.', link: '/dossier' },
};

function ChatBubbleWithAvatar({ author, content, timestamp }) {
  return (
    <P.ChatBubble
      author={author}
      content={content}
      timestamp={timestamp}
    />
  );
}

export function getComponentDemo(id) {
  return componentDemos[id] || null;
}
