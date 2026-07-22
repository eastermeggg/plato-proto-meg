import React, { useState, useMemo, useContext } from 'react';
import {
  FileText, SearchCode, XCircle,
  ChevronDown, ChevronRight, Plus, Pencil,
  ListChecks, Bot, Calculator,
  HeartPulse, AlignLeft, CheckCheck, Asterisk, SquareX,
} from 'lucide-react';

// ── Colors ───────────────────────────────────────────────────────────
// Muted-foreground for everything except CRUD actions

export const STEP_COLORS = {
  default: { icon: '#a8a29e', bg: 'transparent', text: '#78716c' },
  green:   { icon: '#059669', bg: '#cce6d9', text: '#064e3b' },
  orange:  { icon: '#bd6c1a', bg: '#f9ecd6', text: '#855b31' },
  red:     { icon: '#991b1b', bg: '#fef2f2', text: '#7f1d1d' },
  muted: '#a8a29e',
  primary: '#44403c',
  secondary: '#78716c',
};

// Controls the loading indicator used at the step/sub-agent (timeline) level.
// 'gif' (default) = plato-thinking gif · 'dot' = calm pulsing dot.
// ParallelTasks sets this to 'dot' so the gif is reserved for the card level.
export const StepLoadingIndicatorContext = React.createContext('gif');

const PulsingStepDot = () => (
  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
    <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#a8a29e', display: 'block' }} />
  </span>
);

// ── Icons ────────────────────────────────────────────────────────────

const DoubleSparkle = ({ className, style }) => (
  <svg className={className} style={style} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 1.5L5.6 3.8L8 4.5L5.6 5.2L5 7.5L4.4 5.2L2 4.5L4.4 3.8Z" />
    <path d="M10.5 7L10.9 8.5L12.5 9L10.9 9.5L10.5 11L10.1 9.5L8.5 9L10.1 8.5Z" />
  </svg>
);

const DocLinesIcon = ({ className, style }) => (
  <svg className={className} style={style} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="1" width="10" height="12" rx="1.5" />
    <line x1="5" y1="4.5" x2="9" y2="4.5" />
    <line x1="5" y1="7" x2="9" y2="7" />
    <line x1="5" y1="9.5" x2="7.5" y2="9.5" />
  </svg>
);

// ── Step type config ─────────────────────────────────────────────────

export const STEP_TYPE_CONFIG = {
  read_documents:  { Icon: DocLinesIcon,  color: 'default' },
  read_rapport:    { Icon: HeartPulse,    color: 'default' },
  search_document: { Icon: SearchCode,    color: 'default' },
  extract_data:    { Icon: AlignLeft,     color: 'default' },
  add_row:         { Icon: Plus,          color: 'green',  pill: 'ajout' },
  update_row:      { Icon: Pencil,        color: 'orange', pill: 'modif.' },
  delete_row:      { Icon: SquareX,       color: 'red',    pill: 'suppr.' },
  calculate:       { Icon: Calculator,    color: 'default' },
  verify_data:     { Icon: CheckCheck,    color: 'default' },
  summarize:       { Icon: ListChecks,    color: 'default' },
  navigate:        { Icon: Asterisk,      color: 'default' },
  sub_agent:       { Icon: Bot,           color: 'default' },
  error:           { Icon: XCircle,       color: 'red' },
};

const CRUD_TYPES = new Set(['add_row', 'update_row', 'delete_row']);

// ── Backend tool name → user-facing step ─────────────────────────────
// Real tool names from Plato Supervisor (PostHog traces).
// Each maps to a step type + a default French label the user sees.

export const BACKEND_TOOL_MAP = {
  getPosteProblemDetector: { type: 'verify_data', label: 'Vérification des données' },
  getHistoireSummaryTool:  { type: 'summarize',   label: 'Synthèse des résultats' },
  // Add real backend tool names here as they are confirmed:
  // getDossierContent:    { type: 'read_documents', label: 'Lecture du dossier' },
  // getCalculConfig:      { type: 'calculate',      label: 'Configuration du calcul' },
};

// ── Legacy normalizer ────────────────────────────────────────────────

const LEGACY_TOOL_MAP = {
  readDocument: 'read_rapport', readExpertise: 'read_rapport', readBulletins: 'read_rapport', readBaremes: 'read_rapport',
  extractMontants: 'extract_data', extractPeriods: 'extract_data', extractRevenus: 'extract_data',
  extractInfoDossier: 'extract_data', analyseDocuments: 'read_documents', detectPostes: 'read_documents',
  calculDSA: 'calculate', calculDFT: 'calculate', calculPGPA: 'calculate', calculCapitalisation: 'calculate',
  calculPGPF: 'calculate', calculSE: 'calculate', calculDFP: 'calculate', calculPEP: 'calculate',
};

export function normalizeStep(step) {
  if (step._normalized) return step;
  // New shape — pass through
  if (step.type && STEP_TYPE_CONFIG[step.type]) {
    return { ...step, _normalized: true, status: step.status || 'done' };
  }
  // Real backend tool name — map to user-friendly type + label
  const backend = BACKEND_TOOL_MAP[step.tool];
  if (backend) {
    return {
      _normalized: true,
      type: backend.type,
      label: step.detail || backend.label,
      status: step.status || 'done',
      children: step.expandedText ? [step.expandedText] : step.children,
      poste: step.poste,
    };
  }
  // Legacy frontend tool name
  return {
    _normalized: true,
    type: LEGACY_TOOL_MAP[step.tool] || 'calculate',
    label: step.detail || step.tool,
    status: step.status || 'done',
    children: step.expandedText ? [step.expandedText] : undefined,
    poste: step.poste,
  };
}

// ── CRUD grouping ────────────────────────────────────────────────────

export function groupSteps(steps) {
  const result = [];
  let i = 0;
  while (i < steps.length) {
    const s = steps[i];
    if (s.type === 'sub_agent') {
      result.push({ ...s, _kind: 'sub_agent' });
      i++;
    } else if (CRUD_TYPES.has(s.type)) {
      const group = [s];
      while (i + group.length < steps.length && steps[i + group.length].type === s.type && steps[i + group.length].poste === s.poste) {
        group.push(steps[i + group.length]);
      }
      if (group.length === 1) {
        result.push({ ...s, _kind: 'step' });
      } else {
        result.push({
          _kind: 'group', type: s.type, poste: s.poste,
          status: group.every(g => g.status === 'done') ? 'done' : group.some(g => g.status === 'error') ? 'error' : 'loading',
          steps: group,
          label: `${group.length} ${s.type === 'update_row' ? 'champs' : 'lignes'} ${s.poste || ''}`.trim(),
        });
      }
      i += group.length;
    } else {
      result.push({ ...s, _kind: 'step' });
      i++;
    }
  }
  return result;
}

// ── Shared sub-components ────────────────────────────────────────────

export const ThinkingDots = ({ className = '', size = 'sm' }) => {
  const d = size === 'icon' ? 'w-1.5 h-1.5' : 'w-1 h-1';
  return (
    <span className={`flex items-center justify-center gap-0.5 flex-shrink-0 ${size === 'icon' ? 'w-4 h-4' : ''} ${className}`}>
      <span className={`${d} rounded-full bg-foreground-muted animate-thinking-dot-1`} />
      <span className={`${d} rounded-full bg-foreground-muted animate-thinking-dot-2`} />
      <span className={`${d} rounded-full bg-foreground-muted animate-thinking-dot-3`} />
    </span>
  );
};

export const PlatoDotGrid = () => (
  <div className="flex-shrink-0" style={{ width: 15, height: 15, display: 'flex', flexDirection: 'column', gap: 1 }}>
    {[0, 1, 2].map(r => (
      <div key={r} style={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        {[0, 1, 2].map(c => (
          <div key={c} style={{ width: 3, height: 3, backgroundColor: '#a8a29e', borderRadius: 0.5, transform: 'rotate(45deg)' }} />
        ))}
      </div>
    ))}
  </div>
);

const Diamond = ({ color, size = 6 }) => (
  <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: size + 4, height: size + 4 }}>
    <span className="flex-shrink-0" style={{
      width: size, height: size,
      background: color,
      transform: 'rotate(45deg)',
      borderRadius: '0.5px',
      border: '1px solid rgba(0,0,0,0.1)',
      boxShadow: '0 1px 2px rgba(26,26,26,0.05)',
    }} />
  </span>
);

export const CrudPill = ({ type }) => {
  const map = {
    add_row:    { label: 'AJOUT', bg: STEP_COLORS.green.bg,  color: STEP_COLORS.green.text,  diamond: STEP_COLORS.green.icon },
    update_row: { label: 'MODIF', bg: STEP_COLORS.orange.bg, color: STEP_COLORS.orange.text, diamond: STEP_COLORS.orange.icon },
    delete_row: { label: 'SUPPR', bg: STEP_COLORS.red.bg,    color: STEP_COLORS.red.text,    diamond: STEP_COLORS.red.icon },
  };
  const c = map[type];
  if (!c) return null;
  return (
    <span className="inline-flex items-center flex-shrink-0 overflow-hidden" style={{
      gap: 4, height: 17, padding: 4, borderRadius: 2,
      backgroundColor: c.bg, color: c.color,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, lineHeight: 'normal',
      textTransform: 'uppercase',
    }}>
      <Diamond color={c.diamond} size={6} />
      {c.label}
    </span>
  );
};

export const DotCounter = ({ color, count, label }) => {
  const c = STEP_COLORS[color]?.icon || color;
  const textColor = STEP_COLORS[color]?.text || STEP_COLORS.secondary;
  return (
    <span className="inline-flex items-center gap-0.5 flex-shrink-0">
      <Diamond color={c} size={6} />
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
        lineHeight: '16.5px', color: textColor,
      }}>
        {count != null ? count : label}
      </span>
    </span>
  );
};

// ── Children Tree — vertical connector line + plain text items ───────

const ChildrenTree = ({ children, className = '' }) => (
  <div className={className}>
    {children.map((child, ci) => {
      const isLast = ci === children.length - 1;
      return (
        <div key={ci} className="flex items-stretch">
          {/* Tree gutter — vertical line segment */}
          <div className="flex-shrink-0 relative" style={{ width: 20 }}>
            <div className="absolute" style={{ left: 12, top: 0, bottom: isLast ? '50%' : 0, width: 1, backgroundColor: '#e7e5e4' }} />
          </div>
          {/* Tree branch — horizontal connector */}
          <div className="flex-shrink-0 relative" style={{ width: 20 }}>
            <div className="absolute" style={{ left: 0, top: '50%', width: 10, height: 1, backgroundColor: '#e7e5e4' }} />
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0" style={{
            padding: 4, fontSize: 12, fontWeight: 400,
            color: STEP_COLORS.primary, lineHeight: '16px', letterSpacing: '0.12px',
          }}>
            {typeof child === 'string' ? child : child.label || String(child)}
          </div>
        </div>
      );
    })}
  </div>
);

// ── Icon Slot — shared by StepRow and GroupRow ───────────────────────

const IconSlot = ({ icon: Icon, color, isLoading, isExpandable, isExpanded }) => {
  const loadingIndicator = useContext(StepLoadingIndicatorContext);
  if (isLoading) return loadingIndicator === 'dot' ? <PulsingStepDot /> : (
    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
      <img src="/plato-thinking.gif" alt="" className="w-3 h-3" style={{ objectFit: 'contain' }} />
    </span>
  );
  return (
    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 relative rounded" >
      <span className="step-icon flex items-center justify-center">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </span>
      {isExpandable && (
        <span className="step-chevron absolute inset-0 flex items-center justify-center" style={isExpanded ? { opacity: 1 } : undefined}>
          {isExpanded
            ? <ChevronDown className="w-3.5 h-3.5" style={{ color: STEP_COLORS.secondary }} />
            : <ChevronRight className="w-3.5 h-3.5" style={{ color: STEP_COLORS.secondary }} />}
        </span>
      )}
    </span>
  );
};

// ── Step Row ─────────────────────────────────────────────────────────

const StepRow = ({ step, isLast, isStreaming }) => {
  const [open, setOpen] = useState(false);
  const config = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.calculate;
  const colors = STEP_COLORS[config.color] || STEP_COLORS.default;
  const isLoading = step.status === 'loading' || (isStreaming && isLast && step.status !== 'done' && step.status !== 'error');
  const isError = step.status === 'error';
  const isCrud = CRUD_TYPES.has(step.type);
  const childCount = (!isError && step.children?.length) || 0;
  const isDescription = childCount === 1;
  const isSubItems = childCount > 1;

  return (
    <div className={isStreaming ? 'animate-step-slide-in' : ''}>
      <div
        className={`flex items-start gap-2 p-1 rounded ${isSubItems ? 'step-row-expandable cursor-pointer' : ''}`}
        onClick={isSubItems ? () => setOpen(v => !v) : undefined}
      >
        <IconSlot
          icon={config.Icon}
          color={isError ? STEP_COLORS.red.icon : colors.icon}
          isLoading={isLoading}
          isExpandable={isSubItems}
          isExpanded={open}
        />
        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 2 }}>
          <span className="flex items-center gap-1.5" style={{ minHeight: 16 }}>
            {config.pill && <CrudPill type={step.type} />}
            <span className="truncate" style={{
              fontSize: 12, fontWeight: 400, lineHeight: '16px', letterSpacing: '0.12px',
              color: isError ? STEP_COLORS.red.text : isLoading ? STEP_COLORS.secondary : STEP_COLORS.primary,
            }}>
              {step.label}
              {isSubItems && !open && <span style={{ color: STEP_COLORS.muted }}>{` (${childCount})`}</span>}
            </span>
          </span>
          {isDescription && (
            <span className="truncate" style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', letterSpacing: '0.12px', color: STEP_COLORS.secondary }}>
              {typeof step.children[0] === 'string' ? step.children[0] : step.children[0].label || String(step.children[0])}
            </span>
          )}
        </div>
              </div>
      {isSubItems && open && (
        <ChildrenTree children={step.children} className="reasoning-children-expand" />
      )}
    </div>
  );
};

// ── Group Row (CRUD grouping) ────────────────────────────────────────

const GroupRow = ({ group }) => {
  const [open, setOpen] = useState(false);
  const config = STEP_TYPE_CONFIG[group.type] || STEP_TYPE_CONFIG.add_row;
  const colors = STEP_COLORS[config.color] || STEP_COLORS.green;
  const allChildren = group.steps.flatMap(s => s.children || []);

  return (
    <div>
      <div className="flex items-start gap-2 p-1 rounded step-row-expandable cursor-pointer" onClick={() => setOpen(v => !v)}>
        <IconSlot icon={config.Icon} color={colors.icon} isExpandable isExpanded={open} />
        <span className="flex-1 min-w-0 flex items-center gap-1.5" style={{ minHeight: 16 }}>
          <CrudPill type={group.type} />
          <span className="truncate" style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', letterSpacing: '0.12px', color: STEP_COLORS.primary }}>
            {group.label}
          </span>
        </span>
      </div>
      {open && allChildren.length > 0 && (
        <ChildrenTree children={allChildren} className="reasoning-children-expand" />
      )}
    </div>
  );
};

// ── Sub-Agent Block ──────────────────────────────────────────────────

const SubAgentBlock = ({ step, isStreaming }) => {
  const loadingIndicator = useContext(StepLoadingIndicatorContext);
  const childSteps = (step.children_steps || []).map(normalizeStep);
  const isError = step.status === 'error';
  const isLoading = step.status === 'loading' || (isStreaming && step.status !== 'done' && step.status !== 'error');
  return (
    <div className={isStreaming ? 'animate-step-slide-in' : ''}>
      <div className="flex items-start gap-2 p-1 rounded">
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {isLoading
            ? (loadingIndicator === 'dot'
                ? <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: STEP_COLORS.muted, display: 'block' }} />
                : <img src="/plato-thinking.gif" alt="" className="w-3 h-3" style={{ objectFit: 'contain' }} />)
            : <Bot className="w-3.5 h-3.5" style={{ color: STEP_COLORS.default.icon }} />}
        </span>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', letterSpacing: '0.12px', color: STEP_COLORS.primary }}>{step.label}</span>
        {isError && <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: STEP_COLORS.red.icon }} />}
      </div>
      {childSteps.length > 0 && (
        <div>
          {childSteps.map((cs, ci) => {
            const isLastChild = ci === childSteps.length - 1;
            return (
              <div key={ci} className="flex items-stretch">
                {/* Tree gutter — vertical line through sub-agent children */}
                <div className="flex-shrink-0 relative" style={{ width: 20 }}>
                  <div className="absolute" style={{ left: 12, top: 0, bottom: isLastChild ? '50%' : 0, width: 1, backgroundColor: '#e7e5e4' }} />
                </div>
                <div className="flex-shrink-0 relative" style={{ width: 4 }}>
                  <div className="absolute" style={{ left: 0, top: '50%', width: 4, height: 1, backgroundColor: '#e7e5e4' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <StepRow step={cs} isLast={ci === childSteps.length - 1} isStreaming={isStreaming} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {isError && step.errorMessage && (
        <div style={{ paddingLeft: 24, fontSize: 12, color: STEP_COLORS.red.text, lineHeight: '16px', padding: '2px 0 2px 24px' }}>
          {step.errorMessage}
        </div>
      )}
    </div>
  );
};

// ── Collapsed Header ─────────────────────────────────────────────────

const CollapsedHeader = ({ summary, counters = {}, expanded, onToggle, stepCount }) => {
  const entries = [];
  if (counters.add)    entries.push({ color: 'green',  count: counters.add });
  if (counters.update) entries.push({ color: 'orange', count: counters.update });
  if (counters.delete) entries.push({ color: 'red',    count: counters.delete });

  return (
    <div className="flex items-center gap-2 cursor-pointer select-none p-1 w-full reasoning-header-fade-in rounded" onClick={onToggle}>
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5" style={{ color: STEP_COLORS.secondary }} />
          : <ChevronRight className="w-3.5 h-3.5" style={{ color: STEP_COLORS.secondary }} />}
      </span>
      <span className="flex-1 min-w-0 truncate" style={{ fontSize: 12, fontWeight: 500, color: STEP_COLORS.secondary, lineHeight: '16px' }}>
        {summary || `${stepCount} étape${stepCount > 1 ? 's' : ''}`}
      </span>
      {entries.length > 0 && (
        <span className="flex items-center gap-2 flex-shrink-0">
          {entries.map((e, i) => <DotCounter key={i} color={e.color} count={e.count} />)}
        </span>
      )}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────

const ReasoningStepper = ({
  steps: rawSteps = [],
  label = '',
  status: statusProp,
  summary,
  counters,
  done, // legacy
  expanded = false,
  onToggle,
  loadingIndicator = 'gif',
}) => {
  const status = statusProp || (done ? 'done' : 'streaming');
  const isStreaming = status === 'streaming';
  const isDone = status === 'done' || status === 'error';

  const normalizedSteps = useMemo(() => rawSteps.map(normalizeStep), [rawSteps]);

  const resolvedCounters = useMemo(() => {
    if (counters) return counters;
    if (!isDone) return {};
    const c = {};
    normalizedSteps.forEach(s => {
      if (s.type === 'add_row') c.add = (c.add || 0) + 1;
      else if (s.type === 'update_row') c.update = (c.update || 0) + 1;
      else if (s.type === 'delete_row') c.delete = (c.delete || 0) + 1;
      else if (s.type === 'error' || s.status === 'error') c.error = (c.error || 0) + 1;
    });
    return c;
  }, [counters, isDone, normalizedSteps]);

  const grouped = useMemo(() => groupSteps(normalizedSteps), [normalizedSteps]);

  const content = isStreaming ? (
    <div className="flex flex-col gap-px w-full">
      {normalizedSteps.map((step, si) =>
        step.type === 'sub_agent'
          ? <SubAgentBlock key={si} step={step} isStreaming />
          : <StepRow key={si} step={step} isLast={si === normalizedSteps.length - 1} isStreaming />
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-px w-full">
      <CollapsedHeader summary={summary} counters={resolvedCounters} expanded={expanded} onToggle={onToggle} stepCount={normalizedSteps.length} />
      {expanded && grouped.length > 0 && (
        <div className="flex flex-col gap-px w-full">
          {grouped.map((item, gi) => {
            if (item._kind === 'sub_agent') return <SubAgentBlock key={gi} step={item} isStreaming={false} />;
            if (item._kind === 'group') return <GroupRow key={gi} group={item} />;
            return <StepRow key={gi} step={item} isLast={false} isStreaming={false} />;
          })}
        </div>
      )}
    </div>
  );

  return (
    <StepLoadingIndicatorContext.Provider value={loadingIndicator}>
      {content}
    </StepLoadingIndicatorContext.Provider>
  );
};

export default ReasoningStepper;
