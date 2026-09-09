import { useCallback, useEffect, useRef, useState } from 'react';

// Store des conversations (port Plato - data contract §2).
// Thread {
//   id, title, isUntitled,
//   scope: { dossierId: string|null, vertical: string|null },
//   createdAt, lastActivity,      // ISO - les libellés d'affichage sont dérivés
//   attachedAt?, movedFrom?,      // trace du rattachement (marqueur + reçu dans la liste d'origine)
//   messages: []                  // même forme que chatMessages (renderer du rail)
// }
// isArchived est dérivé à la lecture (inactif 30 j) - aucun fil n'est jamais supprimé.

const LS_THREADS = 'plato_threads';
const ARCHIVE_DAYS = 30;

const lsLoad = () => {
  try {
    const raw = localStorage.getItem(LS_THREADS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};
const lsSave = (threads) => {
  try { localStorage.setItem(LS_THREADS, JSON.stringify(threads)); } catch (e) { console.warn('LS threads:', e); }
};

let idCounter = 0;
const newThreadId = () => `th-${Date.now()}-${++idCounter}`;

export const deriveThreadTitle = (question) => {
  const clean = (question || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Nouvelle conversation';
  return clean.length > 60 ? `${clean.slice(0, 60).trimEnd()}…` : clean;
};

export const isThreadArchived = (thread) => {
  if (!thread?.lastActivity) return false;
  const age = Date.now() - new Date(thread.lastActivity).getTime();
  return age > ARCHIVE_DAYS * 24 * 60 * 60 * 1000;
};

// Libellé de récence court pour les listes (sidebar, index).
export const formatThreadActivity = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `aujourd'hui ${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'hier';
  const days = Math.floor((now - d) / (24 * 60 * 60 * 1000));
  if (days < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export default function useThreads() {
  const [threads, setThreads] = useState(() => lsLoad() || []);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    lsSave(threads);
  }, [threads]);

  const getThread = useCallback((id) => threads.find(t => t.id === id) || null, [threads]);

  const threadsForDossier = useCallback((dossierId) => (
    threads
      .filter(t => t.scope?.dossierId === dossierId)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
  ), [threads]);

  const recentThreads = useCallback((limit = 5) => (
    [...threads]
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, limit)
  ), [threads]);

  const createThread = useCallback(({ scope, title } = {}) => {
    const now = new Date().toISOString();
    const thread = {
      id: newThreadId(),
      title: title || 'Nouvelle conversation',
      isUntitled: !title,
      scope: { dossierId: scope?.dossierId ?? null, vertical: scope?.vertical ?? null },
      createdAt: now,
      lastActivity: now,
      messages: [],
    };
    setThreads(prev => [...prev, thread]);
    return thread;
  }, []);

  const renameThread = useCallback((id, title) => {
    setThreads(prev => prev.map(t => (t.id === id ? { ...t, title, isUntitled: false } : t)));
  }, []);

  const setThreadMessages = useCallback((id, messages) => {
    setThreads(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.messages === messages) return t;
      return { ...t, messages, lastActivity: new Date().toISOString() };
    }));
  }, []);

  const touchThread = useCallback((id) => {
    setThreads(prev => prev.map(t => (t.id === id ? { ...t, lastActivity: new Date().toISOString() } : t)));
  }, []);

  // Rattachement : le fil MIGRE (il n'est pas recréé). Marqueur posté au point
  // exact + movedFrom pour le reçu persistant dans la liste d'origine.
  const attachThreadToDossier = useCallback((id, dossierId, dossierLabel, vertical) => {
    const now = new Date().toISOString();
    setThreads(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        scope: { dossierId, vertical: vertical ?? t.scope?.vertical ?? null },
        attachedAt: now,
        movedFrom: t.scope?.dossierId == null ? 'libre' : t.scope.dossierId,
        lastActivity: now,
        messages: [...(t.messages || []), { type: 'marker', dossierId, dossierLabel, at: now }],
      };
    }));
  }, []);

  // Seed premier lancement : injecte des fils déjà formés (titre, horodatage,
  // messages) pour peupler la navigation. Idempotent (ne tourne que si le store
  // est vide) pour ne jamais écraser des conversations réelles.
  const seedThreads = useCallback((seedThreadObjs) => {
    setThreads(prev => {
      if (prev.length > 0 || !seedThreadObjs?.length) return prev;
      return seedThreadObjs.map(o => ({
        id: o.id || newThreadId(),
        title: o.title || 'Conversation',
        isUntitled: o.isUntitled ?? !o.title,
        scope: { dossierId: o.scope?.dossierId ?? null, vertical: o.scope?.vertical ?? null },
        createdAt: o.createdAt || o.lastActivity || new Date().toISOString(),
        lastActivity: o.lastActivity || o.createdAt || new Date().toISOString(),
        messages: o.messages || [],
      }));
    });
  }, []);

  // Seed premier lancement : une conversation vide par dossier existant pour
  // que chaque rail ait un fil actif. Idempotent (ne tourne que si le store est vide).
  const seedFromDossiers = useCallback((dossiers) => {
    setThreads(prev => {
      if (prev.length > 0 || !dossiers?.length) return prev;
      const now = new Date().toISOString();
      return dossiers.map(d => ({
        id: newThreadId(),
        title: 'Conversation',
        isUntitled: true,
        scope: { dossierId: d.id, vertical: d.matterType === 'social' ? 'Droit social' : 'Dommage corporel' },
        createdAt: d.lastEditDate || now,
        lastActivity: d.lastEditDate || now,
        messages: [],
      }));
    });
  }, []);

  return {
    threads,
    getThread,
    threadsForDossier,
    recentThreads,
    createThread,
    renameThread,
    setThreadMessages,
    touchThread,
    attachThreadToDossier,
    seedThreads,
    seedFromDossiers,
  };
}
