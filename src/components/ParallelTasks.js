import React, { useState } from 'react';
import { ChevronRight, X, Layers } from 'lucide-react';
import ReasoningStepper, { STEP_COLORS } from './ReasoningStepper';

// ── ParallelTasks ────────────────────────────────────────────────────
// Several ReasoningStepper traces running at once (one per sub-agent),
// collapsed into a single inline line in chat:
//     [gif]  {X} tâches simultanément en cours          >
// Multiple such lines can coexist in the conversation. Each one expands
// on click — two UX variants:
//   - variant="inline"  → the sub-agent traces unfold inline in the chat
//   - variant="panel"   → a calm side panel opens, one card per sub-agent
//
// A `task` is: { id, label, status?: 'loading'|'done'|'error',
//                steps: [...ReasoningStepper steps], summary? }
// status defaults to 'loading' (running) when omitted.

const taskStatus = (task) => task.status || 'loading';

// Counter helper kept as public API for callers that want CRUD totals,
// even though the UI no longer renders coloured diamonds.
const mergeCounters = (a, b) => {
  const o = { ...a };
  ['add', 'update', 'delete', 'error'].forEach(k => { if (b[k]) o[k] = (o[k] || 0) + b[k]; });
  return o;
};
export const deriveCounters = (steps = []) => {
  let c = {};
  steps.forEach(s => {
    if (s.type === 'add_row') c.add = (c.add || 0) + 1;
    else if (s.type === 'update_row') c.update = (c.update || 0) + 1;
    else if (s.type === 'delete_row') c.delete = (c.delete || 0) + 1;
    else if (s.type === 'error' || s.status === 'error') c.error = (c.error || 0) + 1;
    if (s.children_steps) c = mergeCounters(c, deriveCounters(s.children_steps));
  });
  return c;
};

// ── Status dot ───────────────────────────────────────────────────────
// One neutral shape for every state — no icons, no coloured diamonds.
// loading = pulsing muted dot · done = solid muted dot · error = red dot.

const StatusDot = ({ status }) => {
  const base = { width: 6, height: 6, borderRadius: '50%', display: 'block' };
  return (
    <span className="flex items-center justify-center flex-shrink-0" style={{ width: 16, height: 18 }}>
      {status === 'loading'
        ? <span className="animate-pulse" style={{ ...base, backgroundColor: STEP_COLORS.muted }} />
        : <span style={{ ...base, backgroundColor: status === 'error' ? STEP_COLORS.red.icon : STEP_COLORS.secondary }} />}
    </span>
  );
};

// ── Loading gif (reserved for the chat line only) ────────────────────

const LoadingGif = () => (
  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
    <img src="/plato-thinking.gif" alt="" className="w-3 h-3" style={{ objectFit: 'contain' }} />
  </span>
);

// ── Collapsed line (inline in chat) ──────────────────────────────────

export const ParallelTasksLine = ({ tasks = [], expanded = false, onClick, className = '' }) => {
  const total = tasks.length;
  const doneCount = tasks.filter(t => taskStatus(t) !== 'loading').length;
  const runningCount = total - doneCount;
  const errorCount = tasks.filter(t => taskStatus(t) === 'error').length;
  const allDone = runningCount === 0 && total > 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 p-1 rounded w-full cursor-pointer select-none transition-colors hover:bg-background ${className}`}
    >
      {allDone ? <StatusDot status={errorCount ? 'error' : 'done'} /> : <LoadingGif />}
      <span className="flex-1 min-w-0 truncate" style={{ fontSize: 12, fontWeight: 500, lineHeight: '16px', color: STEP_COLORS.secondary }}>
        {allDone
          ? `${total} tâche${total > 1 ? 's' : ''} terminée${total > 1 ? 's' : ''}`
          : `${runningCount} tâche${runningCount > 1 ? 's' : ''} simultanément en cours`}
      </span>
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <ChevronRight className="w-3.5 h-3.5 transition-transform" style={{ color: STEP_COLORS.secondary, transform: expanded ? 'rotate(90deg)' : 'none' }} />
      </span>
    </div>
  );
};

// ── One sub-agent section — card (panel) or plain row (inline) ───────

const TaskSection = ({ task, defaultOpen, card }) => {
  const status = taskStatus(task);
  const [open, setOpen] = useState(defaultOpen);

  const header = (
    <button
      type="button"
      onClick={() => setOpen(o => !o)}
      className={`w-full flex items-start gap-2 text-left transition-colors hover:bg-background ${card ? 'px-3 py-2.5' : 'p-1 rounded'}`}
    >
      {status === 'loading' ? <LoadingGif /> : <StatusDot status={status} />}
      <span className="flex-1 min-w-0 flex flex-col" style={{ gap: 1 }}>
        <span className="truncate" style={{
          fontSize: 13, fontWeight: 500, lineHeight: '18px',
          color: status === 'loading' ? STEP_COLORS.secondary : STEP_COLORS.primary,
        }}>
          {task.label}
        </span>
        {task.summary && (
          <span className="truncate" style={{ fontSize: 11, fontWeight: 400, lineHeight: '15px', color: STEP_COLORS.muted }}>
            {task.summary}
          </span>
        )}
      </span>
      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 16, height: 18 }}>
        <ChevronRight className="w-4 h-4 transition-transform" style={{ color: STEP_COLORS.muted, transform: open ? 'rotate(90deg)' : 'none' }} />
      </span>
    </button>
  );

  const trace = open && (
    <div style={card
      ? { padding: '8px 12px 12px 34px', backgroundColor: '#fcfbfa', borderTop: '1px solid #e7e5e4' }
      : { paddingLeft: 24, paddingBottom: 4 }}>
      <ReasoningStepper status="streaming" steps={task.steps} loadingIndicator="dot" onToggle={() => {}} />
    </div>
  );

  if (card) {
    return (
      <div className="rounded-lg border border-border bg-white overflow-hidden">
        {header}
        {trace}
      </div>
    );
  }
  return <div>{header}{trace}</div>;
};

// ── Inline expansion (unfolds in the chat) ───────────────────────────

const InlineTasks = ({ tasks = [] }) => (
  <div className="reasoning-children-expand" style={{ marginLeft: 8, paddingLeft: 12, borderLeft: '1px solid #e7e5e4' }}>
    {tasks.map((task, i) => (
      <TaskSection
        key={task.id != null ? task.id : i}
        task={task}
        defaultOpen={taskStatus(task) === 'loading' || i === 0}
      />
    ))}
  </div>
);

// ── Side panel (drawer, flush left of chat via --chat-offset) ────────

const SECTION_LABEL = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: STEP_COLORS.muted };

export const ParallelTasksPanel = ({ tasks = [], onClose, onClear, title = 'Tâches parallèles' }) => {
  const total = tasks.length;
  const running = tasks.filter(t => taskStatus(t) === 'loading');
  const finished = tasks.filter(t => taskStatus(t) !== 'loading');
  const doneCount = finished.length;
  const allDone = doneCount === total && total > 0;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          right: 'var(--chat-offset, 0px)', zIndex: 59,
          backgroundColor: 'rgba(41, 37, 36, 0.12)',
        }}
      />
      <div
        className="fixed top-0 h-screen bg-white border-l border-border flex flex-col"
        style={{
          width: 480,
          maxWidth: 'calc(100vw - var(--chat-offset, 0px))',
          right: 'var(--chat-offset, 0px)',
          zIndex: 60,
          boxShadow: '-20px 0 28px -16px rgba(28,25,23,0.16)',
          animation: 'slideInRight 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border flex-shrink-0">
          <Layers className="w-4 h-4 flex-shrink-0" style={{ color: STEP_COLORS.secondary }} />
          <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 1 }}>
            <span className="truncate" style={{ fontSize: 14, fontWeight: 600, color: STEP_COLORS.primary, lineHeight: '18px' }}>
              {title}
            </span>
            <span style={{ fontSize: 11, color: STEP_COLORS.muted, lineHeight: '14px' }}>
              {allDone ? `${total} terminée${total > 1 ? 's' : ''}` : `${doneCount}/${total} terminée${doneCount > 1 ? 's' : ''}`}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-background flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" style={{ color: STEP_COLORS.secondary }} />
          </button>
        </div>
        {/* Body — grouped by status, one calm card per sub-agent */}
        <div className="flex-1 overflow-y-auto px-4" style={{ backgroundColor: '#faf9f7' }}>
          {running.length > 0 && (
            <section>
              <div className="pt-4 pb-1.5"><span style={SECTION_LABEL}>En cours d'exécution</span></div>
              <div className="flex flex-col gap-2">
                {running.map((task, i) => (
                  <TaskSection key={task.id != null ? task.id : `r${i}`} task={task} card defaultOpen={false} />
                ))}
              </div>
            </section>
          )}
          {finished.length > 0 && (
            <section className="pb-4">
              <div className="pt-4 pb-1.5 flex items-center justify-between">
                <span style={SECTION_LABEL}>Terminé {finished.length}</span>
                {onClear && (
                  <button type="button" onClick={onClear} className="hover:underline" style={{ fontSize: 11, color: STEP_COLORS.muted }}>
                    Effacer
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {finished.map((task, i) => (
                  <TaskSection key={task.id != null ? task.id : `f${i}`} task={task} card defaultOpen={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

// ── Orchestrator ─────────────────────────────────────────────────────
// variant: 'inline' (unfold in chat) | 'panel' (open side panel, default)

const ParallelTasks = ({ tasks = [], variant = 'panel', defaultOpen = false, title, onClear, className }) => {
  const [open, setOpen] = useState(defaultOpen);
  if (!tasks.length) return null;
  const isInline = variant === 'inline';

  return (
    <div className={className}>
      <ParallelTasksLine
        tasks={tasks}
        expanded={isInline && open}
        onClick={() => setOpen(o => (isInline ? !o : true))}
      />
      {isInline && open && <InlineTasks tasks={tasks} />}
      {!isInline && open && (
        <ParallelTasksPanel tasks={tasks} title={title} onClear={onClear} onClose={() => setOpen(false)} />
      )}
    </div>
  );
};

export default ParallelTasks;
