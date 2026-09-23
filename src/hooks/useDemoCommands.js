import { useReducer, useCallback, useMemo, useRef } from 'react';
import { DEMO_SCENARIOS } from '../data/demoScenarios';
import { getDecisionById as getMockDecisionById } from '../data/mockDecisions';

// ─── JP State Reducer ─────────────────────────────────────────────────
//
// Data model
// ──────────
// • attachments[] — one row per JPAttachment.
//     { id, decisionId, scope, scopeTargetId, lineItem?, addedAt, addedBy }
//     scope ∈ 'workspace' | 'matter'
//     lineItem is the poste tag (e.g. 'dfp', 'atpt'); null/undefined means
//     transverse (no specific poste).
//
// • customJPs[] — JP entities created via manual entry or PDF upload, i.e.
//     not present in mockDecisions.js.
//     { id, reference, jurisdiction?, date?, court?, lineItems[],
//       source: 'manual' | 'upload',
//       canonicalId?,
//       impact?,         // agent-facing impact summary (firm fiche)
//       pdfFileName?,    // uploaded PDF name (firm fiche, local-only)
//       summary?, amounts[]?, owner: 'user' | 'workspace' }
//
// Backwards-compat
// ────────────────
// Existing UI was built around `pinnedJP`, `pinDecision`, `togglePoste`,
// `getPinnedForPoste`, etc. Those still work — they're thin shims that map
// onto the new attachment model assuming the default current matter is
// 'dossier-1'. New callsites should use the attachment helpers directly.

const DEFAULT_MATTER_ID = 'dossier-1';
const DEFAULT_WORKSPACE_ID = 'workspace-cabinet';

const initialState = {
  attachments: [],
  customJPs: [],
  drawerDecisionId: null,
  drawerResultSet: [],
  drawerIndex: 0,
  drawerHighlightPosteIds: null,
  activeStepper: null, // 'jp-add' | 'jp-save' | null
};

function jpReducer(state, action) {
  switch (action.type) {
    case 'ADD_ATTACHMENT': {
      const { decisionId, scope, scopeTargetId, lineItem = null } = action;
      // Idempotent: a (decisionId, scope, scopeTargetId, lineItem) tuple is unique
      const exists = state.attachments.some(a =>
        a.decisionId === decisionId &&
        a.scope === scope &&
        a.scopeTargetId === scopeTargetId &&
        (a.lineItem || null) === (lineItem || null)
      );
      if (exists) return state;
      return {
        ...state,
        attachments: [...state.attachments, {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          decisionId,
          scope,
          scopeTargetId,
          lineItem,
          addedAt: new Date().toISOString(),
          addedBy: 'user',
        }],
      };
    }
    case 'REMOVE_ATTACHMENT':
      return {
        ...state,
        attachments: state.attachments.filter(a => a.id !== action.attachmentId),
      };
    case 'REMOVE_ATTACHMENTS_MATCHING':
      return {
        ...state,
        attachments: state.attachments.filter(a => !action.predicate(a)),
      };
    case 'SET_RATIONALE': {
      // Update rationale on one attachment, or on all matching a predicate (multi-poste save).
      const { attachmentId, predicate, rationale } = action;
      return {
        ...state,
        attachments: state.attachments.map(a => {
          const match = attachmentId ? a.id === attachmentId : predicate?.(a);
          return match ? { ...a, rationale: rationale || null } : a;
        }),
      };
    }
    case 'UPSERT_CUSTOM_JP': {
      const { jp } = action;
      const idx = state.customJPs.findIndex(c => c.id === jp.id);
      if (idx >= 0) {
        const next = state.customJPs.slice();
        next[idx] = { ...next[idx], ...jp };
        return { ...state, customJPs: next };
      }
      return { ...state, customJPs: [...state.customJPs, jp] };
    }
    case 'REMOVE_CUSTOM_JP': {
      const { id } = action;
      return {
        ...state,
        customJPs: state.customJPs.filter(c => c.id !== id),
        // also drop any attachments pointing at this JP
        attachments: state.attachments.filter(a => a.decisionId !== id),
      };
    }

    case 'OPEN_DRAWER': {
      const resultSet = action.resultSet || [];
      const index = resultSet.indexOf(action.decisionId);
      return {
        ...state,
        drawerDecisionId: action.decisionId,
        drawerResultSet: resultSet,
        drawerIndex: index >= 0 ? index : 0,
        drawerHighlightPosteIds: action.highlightPosteIds || null,
        // When true, DecisionDrawer mounts with the Sauver popover already open.
        // Used by JP Tab cards to route the "remove" intent through the popover.
        drawerAutoOpenSave: !!action.autoOpenSavePopover,
        // Bumped on every OPEN_DRAWER so DecisionDrawer can re-apply autoOpen
        // even if the same decisionId is requested twice in a row.
        drawerOpenNonce: (state.drawerOpenNonce || 0) + 1,
      };
    }
    case 'CLOSE_DRAWER':
      return { ...state, drawerDecisionId: null, drawerResultSet: [], drawerIndex: 0, drawerHighlightPosteIds: null, drawerAutoOpenSave: false };
    case 'DRAWER_PREV': {
      if (state.drawerIndex <= 0) return state;
      const newIdx = state.drawerIndex - 1;
      return { ...state, drawerIndex: newIdx, drawerDecisionId: state.drawerResultSet[newIdx] };
    }
    case 'DRAWER_NEXT': {
      if (state.drawerIndex >= state.drawerResultSet.length - 1) return state;
      const newIdx = state.drawerIndex + 1;
      return { ...state, drawerIndex: newIdx, drawerDecisionId: state.drawerResultSet[newIdx] };
    }

    case 'SET_STEPPER':
      return { ...state, activeStepper: action.stepperType };
    case 'CLOSE_STEPPER':
      return { ...state, activeStepper: null };

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────
export default function useDemoCommands({ setChatMessages, setNavStack, tabsConfig } = {}) {
  const [state, dispatch] = useReducer(jpReducer, initialState);
  const timeoutsRef = useRef([]);

  // ── Lookups ──────────────────────────────────────────────────────────
  const getJPById = useCallback((id) => {
    if (!id) return null;
    return getMockDecisionById(id) || state.customJPs.find(c => c.id === id) || null;
  }, [state.customJPs]);

  const getAttachmentsForJP = useCallback((decisionId) => {
    return state.attachments.filter(a => a.decisionId === decisionId);
  }, [state.attachments]);

  const getJPsByScope = useCallback((scope, scopeTargetId) => {
    // Returns an array of attachments. Caller may dedupe by decisionId.
    return state.attachments.filter(a =>
      a.scope === scope && (scopeTargetId == null || a.scopeTargetId === scopeTargetId)
    );
  }, [state.attachments]);

  const getJPsForMatterPoste = useCallback((matterId, posteId) => {
    return state.attachments.filter(a =>
      a.scope === 'matter' &&
      a.scopeTargetId === (matterId || DEFAULT_MATTER_ID) &&
      a.lineItem === posteId
    );
  }, [state.attachments]);

  // ── Backwards-compat shims ───────────────────────────────────────────
  // Synthesize `pinnedJP` (one row per decisionId aggregating posteIds)
  // from matter-scope attachments on the default matter, for legacy
  // consumers (JPListing).
  const pinnedJP = useMemo(() => {
    const byDecision = new Map();
    state.attachments.forEach(a => {
      if (a.scope !== 'matter') return;
      if (a.scopeTargetId !== DEFAULT_MATTER_ID) return;
      if (!byDecision.has(a.decisionId)) {
        byDecision.set(a.decisionId, {
          id: `pin-${a.decisionId}`,
          decisionId: a.decisionId,
          dossierId: a.scopeTargetId,
          posteIds: [],
          impact: '',
          addedAt: a.addedAt,
          addedBy: a.addedBy,
        });
      }
      if (a.lineItem) {
        const rec = byDecision.get(a.decisionId);
        if (!rec.posteIds.includes(a.lineItem)) rec.posteIds.push(a.lineItem);
      }
    });
    return Array.from(byDecision.values());
  }, [state.attachments]);

  const jpState = useMemo(() => ({
    pinnedJP,
    drawerDecisionId: state.drawerDecisionId,
    drawerResultSet: state.drawerResultSet,
    drawerIndex: state.drawerIndex,
    drawerHighlightPosteIds: state.drawerHighlightPosteIds,
    activeStepper: state.activeStepper,
  }), [pinnedJP, state.drawerDecisionId, state.drawerResultSet, state.drawerIndex, state.drawerHighlightPosteIds, state.activeStepper]);

  // ── Demo scenarios ───────────────────────────────────────────────────
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const playScenario = useCallback((scenarioKey) => {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (!scenario) return;
    clearTimeouts();
    let cumulativeDelay = 0;
    scenario.actions.forEach((action) => {
      if (action.type === 'DELAY') { cumulativeDelay += action.ms; return; }
      const t = setTimeout(() => {
        switch (action.type) {
          case 'USER_MESSAGE':
            setChatMessages?.(prev => [...prev, { type: 'user', text: action.text }]);
            break;
          case 'AGENT_REASONING':
            setChatMessages?.(prev => [...prev, {
              type: 'ai-thinking',
              label: action.headline,
              status: 'done',
              summary: action.detail,
              steps: [{ label: action.detail, status: 'done' }],
            }]);
            break;
          case 'AGENT_CARDS_MESSAGE':
            setChatMessages?.(prev => [...prev, {
              type: 'ai-jp-cards',
              text: action.text || '',
              decisionIds: action.decisionIds || [],
              highlightPosteIds: action.highlightPosteIds || null,
            }]);
            break;
          case 'AGENT_PLAIN_MESSAGE':
            setChatMessages?.(prev => [...prev, {
              type: 'ai',
              text: action.text,
            }]);
            break;
          case 'OPEN_DRAWER':
            dispatch({
              type: 'OPEN_DRAWER',
              decisionId: action.decisionId,
              resultSet: action.resultSet,
              highlightPosteIds: action.highlightPosteIds || null,
            });
            break;
          case 'TRIGGER_STEPPER':
            dispatch({ type: 'SET_STEPPER', stepperType: action.stepperType });
            break;
          case 'SWITCH_CANVAS_VIEW':
            if (action.view === 'jp-list' && setNavStack) {
              setNavStack(prev => {
                const base = prev.length > 0 ? [{ ...prev[0], activeTab: 'jp' }] : [];
                return base;
              });
            }
            break;
          case 'ARTIFACT_CARD':
            setChatMessages?.(prev => [...prev, { type: 'ai', text: `${action.title} — ${action.summary}` }]);
            break;
          default:
            break;
        }
      }, cumulativeDelay);
      timeoutsRef.current.push(t);
    });
  }, [setChatMessages, setNavStack, clearTimeouts]);

  // ── Drawer ───────────────────────────────────────────────────────────
  // options:
  //   - highlightPosteIds?: string[] — filters the "Montants retenus" sidebar
  //   - autoOpenSavePopover?: bool   — mount the Sauver popover open (used for
  //     the JP Tab "remove" intent: click card → drawer + popover open so the
  //     user can uncheck the scopes they want to remove)
  const openDrawer = useCallback((decisionId, resultSet, options = {}) => {
    dispatch({
      type: 'OPEN_DRAWER',
      decisionId,
      resultSet,
      highlightPosteIds: options.highlightPosteIds || null,
      autoOpenSavePopover: !!options.autoOpenSavePopover,
    });
  }, []);
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), []);
  const drawerPrev = useCallback(() => dispatch({ type: 'DRAWER_PREV' }), []);
  const drawerNext = useCallback(() => dispatch({ type: 'DRAWER_NEXT' }), []);

  // ── Attachment commands ──────────────────────────────────────────────
  const addAttachment = useCallback((decisionId, scope, scopeTargetId, lineItem = null) => {
    dispatch({ type: 'ADD_ATTACHMENT', decisionId, scope, scopeTargetId, lineItem });
  }, []);

  const removeAttachment = useCallback((attachmentId) => {
    dispatch({ type: 'REMOVE_ATTACHMENT', attachmentId });
  }, []);

  // Set the rationale on a specific attachment, or on all attachments matching a predicate.
  // Pass `rationale: null` (or empty) to clear.
  const setRationale = useCallback((attachmentId, rationale) => {
    dispatch({ type: 'SET_RATIONALE', attachmentId, rationale });
  }, []);
  const setRationaleMatching = useCallback((predicate, rationale) => {
    dispatch({ type: 'SET_RATIONALE', predicate, rationale });
  }, []);

  // Set the full set of (lineItem) attachments for a (decisionId, scope, scopeTargetId)
  // Used by the multi-select Save popover: pass the checked posteIds and we sync.
  const setAttachmentsForDecision = useCallback((decisionId, scope, scopeTargetId, lineItems = []) => {
    dispatch({
      type: 'REMOVE_ATTACHMENTS_MATCHING',
      predicate: (a) =>
        a.decisionId === decisionId &&
        a.scope === scope &&
        a.scopeTargetId === scopeTargetId,
    });
    // Re-add for each line item; if empty array, leave nothing (transverse off too).
    setTimeout(() => {
      lineItems.forEach(li => dispatch({
        type: 'ADD_ATTACHMENT', decisionId, scope, scopeTargetId, lineItem: li,
      }));
    }, 0);
  }, []);

  const upsertCustomJP = useCallback((jp) => {
    dispatch({ type: 'UPSERT_CUSTOM_JP', jp });
  }, []);

  const removeCustomJP = useCallback((id) => {
    dispatch({ type: 'REMOVE_CUSTOM_JP', id });
  }, []);

  // ── Legacy helpers (shims) ───────────────────────────────────────────
  // These wrap the new attachment model but assume scope='matter' on the
  // default dossier — preserves behavior for the 9 existing callsites.

  const pinDecision = useCallback((decisionId, opts = {}) => {
    const matterId = opts.dossierId || DEFAULT_MATTER_ID;
    // Always create a transverse "pin" row so `isDecisionPinned` can answer true
    // even when no posteId is provided. If posteId is present, also add a
    // matter+poste attachment.
    dispatch({ type: 'ADD_ATTACHMENT', decisionId, scope: 'matter', scopeTargetId: matterId, lineItem: null });
    if (opts.posteId) {
      dispatch({ type: 'ADD_ATTACHMENT', decisionId, scope: 'matter', scopeTargetId: matterId, lineItem: opts.posteId });
    }
  }, []);

  const unpinDecision = useCallback((decisionId) => {
    dispatch({
      type: 'REMOVE_ATTACHMENTS_MATCHING',
      predicate: (a) =>
        a.decisionId === decisionId &&
        a.scope === 'matter' &&
        a.scopeTargetId === DEFAULT_MATTER_ID,
    });
  }, []);

  const attachToPoste = useCallback((decisionId, posteId) => {
    dispatch({
      type: 'ADD_ATTACHMENT',
      decisionId,
      scope: 'matter',
      scopeTargetId: DEFAULT_MATTER_ID,
      lineItem: posteId,
    });
  }, []);

  const togglePoste = useCallback((decisionId, posteId) => {
    const existing = state.attachments.find(a =>
      a.decisionId === decisionId &&
      a.scope === 'matter' &&
      a.scopeTargetId === DEFAULT_MATTER_ID &&
      a.lineItem === posteId
    );
    if (existing) {
      dispatch({ type: 'REMOVE_ATTACHMENT', attachmentId: existing.id });
    } else {
      dispatch({
        type: 'ADD_ATTACHMENT',
        decisionId,
        scope: 'matter',
        scopeTargetId: DEFAULT_MATTER_ID,
        lineItem: posteId,
      });
    }
  }, [state.attachments]);

  const isDecisionPinned = useCallback((decisionId) => {
    return state.attachments.some(a =>
      a.decisionId === decisionId &&
      a.scope === 'matter' &&
      a.scopeTargetId === DEFAULT_MATTER_ID
    );
  }, [state.attachments]);

  const getPinnedForPoste = useCallback((posteId) => {
    // Returns synthetic pin records with posteIds=[posteId] for compatibility
    // with the JPListing component, which expects { decisionId, posteIds[] }.
    const seen = new Set();
    const out = [];
    state.attachments.forEach(a => {
      if (a.scope !== 'matter') return;
      if (a.scopeTargetId !== DEFAULT_MATTER_ID) return;
      if (a.lineItem !== posteId) return;
      if (seen.has(a.decisionId)) return;
      seen.add(a.decisionId);
      out.push({
        id: `pin-${a.decisionId}`,
        decisionId: a.decisionId,
        dossierId: a.scopeTargetId,
        posteIds: [posteId],
        impact: '',
        addedAt: a.addedAt,
        addedBy: a.addedBy,
      });
    });
    return out;
  }, [state.attachments]);

  const openStepper = useCallback((type) => dispatch({ type: 'SET_STEPPER', stepperType: type }), []);
  const closeStepper = useCallback(() => dispatch({ type: 'CLOSE_STEPPER' }), []);

  return {
    // New attachment-first surface
    attachments: state.attachments,
    customJPs: state.customJPs,
    addAttachment,
    removeAttachment,
    setRationale,
    setRationaleMatching,
    setAttachmentsForDecision,
    upsertCustomJP,
    removeCustomJP,
    getJPById,
    getAttachmentsForJP,
    getJPsByScope,
    getJPsForMatterPoste,
    DEFAULT_MATTER_ID,
    DEFAULT_WORKSPACE_ID,

    // Legacy / drawer / scenario surface
    jpState,
    dispatch,
    playScenario,
    openDrawer,
    closeDrawer,
    drawerPrev,
    drawerNext,
    pinDecision,
    unpinDecision,
    attachToPoste,
    togglePoste,
    isDecisionPinned,
    getPinnedForPoste,
    openStepper,
    closeStepper,
  };
}
