import React, { useEffect, useRef } from 'react';
import { Building2, Folder } from 'lucide-react';

const Checkmark = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Checkbox({ checked }) {
  return (
    <div
      className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
      style={{ borderColor: checked ? '#b9703f' : '#d6d3d1', backgroundColor: checked ? '#b9703f' : 'white' }}
    >
      {checked && <Checkmark />}
    </div>
  );
}

/**
 * Save flow with THREE independent scopes (Figma 36735:47838):
 *
 *   1. Cabinet (workspace)         — JP de référence du cabinet, visible à tous
 *   2. Dossier (transverse)        — attachée au dossier sans poste précis
 *   3. Postes de ce dossier        — attachée à un ou plusieurs postes
 *
 * Each row: [☐ checkbox] [icon or acronym chip] [label]. Header band on top:
 * "SAUVEGARDER LA DÉCISION AU NIVEAU" (mono, uppercase, muted).
 *
 * Props:
 *   - workspacePinned        — bool, Cabinet state
 *   - onToggleWorkspace()    — toggle workspace-scope attachment
 *   - matterPinned           — bool, Dossier (transverse) state
 *   - onToggleMatter()       — toggle matter-transverse attachment
 *   - assignedPosteIds[]     — checked poste ids
 *   - onTogglePoste(posteId) — toggle a matter+poste attachment
 *   - posteOptions[]         — { id, acronym, label }
 *   - onClose()              — required
 *   - className              — extra classes (positioning override)
 */
export default function SaveDestinationPopover({
  workspacePinned = false,
  onToggleWorkspace,
  matterPinned = false,
  onToggleMatter,
  assignedPosteIds = [],
  onTogglePoste,
  posteOptions = [],
  onClose,
  className = 'absolute top-full right-0 mt-1.5',
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`${className} w-[300px] bg-white border border-border rounded-lg shadow-lg overflow-hidden`}
      style={{ zIndex: 50 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Header band ─────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2">
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, fontWeight: 500, color: '#a8a29e',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          Sauvegarder la décision au niveau
        </span>
      </div>

      {/* ── 1. Cabinet (workspace) ─────────────────────────────────── */}
      {onToggleWorkspace && (
        <button
          onClick={onToggleWorkspace}
          className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-background transition-colors flex items-center gap-2.5"
        >
          <Checkbox checked={workspacePinned} />
          <Building2 className="w-4 h-4 flex-shrink-0" strokeWidth={1.5}
            style={{ color: workspacePinned ? '#b9703f' : '#78716c' }} />
          <span className="text-body-medium flex-1 truncate" title="Cabinet">Cabinet</span>
        </button>
      )}

      {/* ── 2. Dossier (transverse) ─────────────────────────────────── */}
      {onToggleMatter && (
        <button
          onClick={onToggleMatter}
          className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-background transition-colors flex items-center gap-2.5"
        >
          <Checkbox checked={matterPinned} />
          <Folder className="w-4 h-4 flex-shrink-0" strokeWidth={1.5}
            style={{ color: matterPinned ? '#b9703f' : '#78716c' }} />
          <span className="text-body-medium flex-1 truncate" title="Dossier (transverse)">Dossier (transverse)</span>
        </button>
      )}

      {/* ── 3. Postes du dossier ─────────────────────────────────────── */}
      {onTogglePoste && posteOptions.length > 0 && (
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          {posteOptions.map((p) => {
            const isChecked = assignedPosteIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onTogglePoste(p.id)}
                className="w-full text-left px-3 py-2 hover:bg-background transition-colors flex items-center gap-2.5"
              >
                <Checkbox checked={isChecked} />
                <span className="badge badge-sm badge-secondary flex-shrink-0">{p.acronym}</span>
                <span
                  className="text-body-medium text-foreground truncate min-w-0"
                  title={p.label}
                >
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {onTogglePoste && posteOptions.length === 0 && (
        <div className="px-3 pb-3 text-[13px] text-foreground-muted">Pas de poste sur ce dossier</div>
      )}
    </div>
  );
}
