// Geste B (spec §4) - « Créer un dossier Plato ». B = C + fiche : même
// navigation, même panier, destination inexistante. Étape 1 la fiche, étape 2
// le contenu initial. Seul opt-out du système : un dossier Outlook coché ICI
// est suivi par défaut (création = déclaration de miroir) ; un thread reste
// OFF. « ← Retour » préserve la composition.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import Button from '../../ui/Button';
import { ModalOverlay, Droppable, monoLabel, usePhase2 } from './atoms';
import MailColumn from './MailColumn';
import Panier from './Panier';
import {
  buildStagedItems, localFileToItem, MOCK_LOCAL_FILES, approxPieces,
  decoupableKeys, folderById,
} from './labData';

const MAIL_W = 440;

const inputStyle = { border: '1px solid #e7e5e3', boxShadow: '0px 1px 1px rgba(26,26,26,0.05)' };

// Pas de « Déjà suivi » ni d'habituels ici : ces états sont relatifs à UN
// dossier Plato, or on est en train de le créer. Seul « Déjà lié à … »
// (dossier Outlook miroir d'une AUTRE affaire) reste pertinent.
export default function GesteBModal({ onClose, onCommit, connected, onConnect }) {
  const phase2 = usePhase2();
  const [step, setStep] = useState(1);
  const [nom, setNom] = useState('');
  const [client, setClient] = useState('');
  const [items, setItems] = useState([]);
  const [decoupe, setDecoupe] = useState(() => new Set());
  const [suivre, setSuivre] = useState(() => new Set());
  const [selection, setSelection] = useState({ folders: new Set(), threads: new Set() });
  const [includePJ, setIncludePJ] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const fileCursor = useRef(0);
  const timers = useRef([]);
  // Nom prérempli depuis le PREMIER dossier Outlook coché uniquement, jamais
  // par-dessus une saisie : on retient ce que l'auto-nommage a écrit.
  const autoNameRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const t = timers.current;
    return () => { window.removeEventListener('keydown', onKey); t.forEach(clearTimeout); };
  }, [onClose]);

  const settle = (ids) => {
    const t = setTimeout(() => {
      setItems(prev => prev.map(i => (ids.includes(i.id) && i.status === 'uploading' ? { ...i, status: 'ready' } : i)));
    }, 1400);
    timers.current.push(t);
  };

  const addLocalFiles = (n = 1) => {
    const added = Array.from({ length: n }, () => localFileToItem(MOCK_LOCAL_FILES[fileCursor.current++ % MOCK_LOCAL_FILES.length]));
    setItems(prev => [...prev, ...added]);
    settle(added.map(i => i.id));
  };

  const addFromTray = (picked) => {
    const added = buildStagedItems(picked, items);
    if (!added.length) return;
    // Sync par défaut : ON pour un dossier Outlook coché à la création
    // (miroir - seul opt-out du système), OFF pour un thread.
    if (phase2) {
      const folderIds = added.filter(i => i.kind === 'folder').map(i => i.id);
      if (folderIds.length) setSuivre(s => new Set([...s, ...folderIds]));
    }
    // Nom prérempli depuis le premier dossier coché, jamais par-dessus une saisie.
    const firstFolder = added.find(i => i.kind === 'folder');
    if (firstFolder && (nom.trim() === '' || nom === autoNameRef.current)) {
      const fname = folderById(firstFolder.folder.folderId)?.name || firstFolder.folder.name;
      autoNameRef.current = fname;
      setNom(fname);
    }
    setItems(prev => [...prev, ...added]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSuivre(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const toggleDecoupe = (key) => setDecoupe(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const allKeys = useMemo(() => items.flatMap(decoupableKeys).map(k => k.key), [items]);
  const toggleAllDecoupe = () => setDecoupe(prev => {
    const allOn = allKeys.length > 0 && allKeys.every(k => prev.has(k));
    return allOn ? new Set() : new Set(allKeys);
  });
  const toggleSuivre = (id) => setSuivre(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const stagedFolderIds = useMemo(() => new Set(items.filter(i => i.kind === 'folder').map(i => i.folder.folderId)), [items]);
  const stagedThreadIds = useMemo(() => new Set(items.filter(i => i.kind === 'thread' && i.thread.threadId).map(i => i.thread.threadId)), [items]);

  const nameOk = nom.trim().length > 0;
  const nPieces = approxPieces(items, decoupe);
  const nSuivis = phase2 ? suivre.size : 0;
  const uploading = items.some(i => i.status === 'uploading');
  const nFiles = items.filter(i => i.kind === 'file').length;
  const nThreads = items.filter(i => i.kind === 'thread').length;
  const nFolders = items.filter(i => i.kind === 'folder').length;

  const recap = items.length === 0 ? 'Aucun contenu pour l\'instant - vous pouvez créer le dossier vide' : [
    `≈ ${nPieces} pièce${nPieces > 1 ? 's' : ''}`,
    nFiles ? `${nFiles} fichier${nFiles > 1 ? 's' : ''}` : null,
    nThreads ? `${nThreads} échange${nThreads > 1 ? 's' : ''}` : null,
    nFolders ? `${nFolders} dossier${nFolders > 1 ? 's' : ''} Outlook` : null,
    decoupe.size ? `${decoupe.size} découpé${decoupe.size > 1 ? 's' : ''}` : null,
    nSuivis ? `${nSuivis} source${nSuivis > 1 ? 's' : ''} suivie${nSuivis > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ');

  const create = (empty = false) => {
    if (!nameOk || (uploading && !empty)) return;
    onCommit({
      nom: nom.trim(), client: client.trim(),
      items: empty ? [] : items,
      decoupe, suivre: phase2 && !empty ? suivre : new Set(),
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      {step === 1 ? (
        <div className="bg-white rounded-md w-full h-full flex flex-col overflow-hidden" style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' }}>
          <div className="flex items-center justify-between px-5 pt-4 pb-[15px] border-b border-border flex-shrink-0">
            <h2 className="text-foreground" style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: '20px', letterSpacing: '-0.5px' }}>Nouveau dossier</h2>
            <button type="button" onClick={onClose} className="inline-flex items-center justify-center w-[26px] h-[26px] rounded bg-cream text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0" title="Fermer">
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto flex items-start justify-center" style={{ backgroundColor: '#fcfbfa' }}>
            <div className="w-full flex flex-col gap-5 bg-white border border-border rounded-xl p-6 shadow-sm" style={{ maxWidth: 460, marginTop: 72 }}>
              <div className="flex flex-col gap-1">
                <span style={monoLabel}>Étape 1 · Le dossier</span>
                <p className="text-sm text-foreground-secondary leading-5">La fiche d'abord, le contenu ensuite - un mélange de dossier Outlook, de fils épars et de fichiers du bureau.</p>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Référence du dossier</span>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex. Lefèvre c/ CPAM"
                  autoFocus
                  className="h-9 px-3 text-sm bg-white rounded-lg focus:outline-none focus:border-foreground-secondary transition-colors"
                  style={inputStyle}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Client</span>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="ex. Mme Anne Lefèvre"
                  className="h-9 px-3 text-sm bg-white rounded-lg focus:outline-none focus:border-foreground-secondary transition-colors"
                  style={inputStyle}
                />
              </label>
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button variant="outline" size="md" label="Créer sans contenu" onClick={() => create(true)} disabled={!nameOk} title="Dossier-coquille - vous le brancherez ensuite" />
                <Button variant="primary" size="md" label="Continuer" onClick={() => setStep(2)} disabled={!nameOk} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Droppable onFiles={() => addLocalFiles(2)} className="bg-white rounded-md w-full h-full flex flex-col overflow-hidden" style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' }}>
          <div className="flex items-center justify-between px-5 pt-4 pb-[15px] border-b border-border flex-shrink-0">
            <div className="flex items-baseline gap-2.5 min-w-0">
              <h2 className="text-foreground flex-shrink-0" style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: '20px', letterSpacing: '-0.5px' }}>
                Contenu initial de « {nom.trim()} »
              </h2>
              <span className="text-[13px] text-foreground-muted flex-shrink-0" style={monoLabel}>Étape 2 · Contenu initial</span>
            </div>
            <button type="button" onClick={onClose} className="inline-flex items-center justify-center w-[26px] h-[26px] rounded bg-cream text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0" title="Fermer">
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex">
            <div
              className="relative flex-shrink-0 h-full"
              style={{ width: collapsed ? 0 : MAIL_W, overflow: 'hidden', transition: 'width 320ms cubic-bezier(0.4,0,0.2,1)' }}
              aria-hidden={collapsed || undefined}
            >
              <div className="absolute inset-y-0 left-0" style={{ width: MAIL_W }}>
                <MailColumn
                  width={MAIL_W}
                  selection={selection}
                  onSelectionChange={setSelection}
                  includePJ={includePJ}
                  onIncludePJ={setIncludePJ}
                  onAddToBasket={addFromTray}
                  stagedFolderIds={stagedFolderIds}
                  stagedThreadIds={stagedThreadIds}
                  habituels={false}
                  connected={connected}
                  onConnect={onConnect}
                  onCollapse={() => setCollapsed(true)}
                />
              </div>
            </div>

            <Panier
              items={items}
              onRemove={removeItem}
              decoupe={decoupe}
              onToggleDecoupe={toggleDecoupe}
              onToggleAllDecoupe={toggleAllDecoupe}
              suivre={suivre}
              onToggleSuivre={toggleSuivre}
              onAddFiles={() => addLocalFiles(1)}
              collapsed={collapsed}
              onExpand={() => setCollapsed(false)}
              expandBadge={selection.folders.size + selection.threads.size}
              introCopy={`Composez le contenu initial de « ${nom.trim()} » - boîte mail à gauche, ordinateur ici.`}
            />
          </div>

          <div className="px-5 pt-3 pb-3.5 border-t border-border flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0" title="La composition est conservée">
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} /> Retour
              </button>
              <p className="text-[13px] text-foreground-secondary truncate">{recap}</p>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Button variant="secondary" size="md" label="Annuler" onClick={onClose} />
              <Button
                variant="primary" size="md"
                label={uploading ? 'Import en cours…' : nSuivis > 0 ? 'Créer et suivre' : 'Créer le dossier'}
                onClick={() => create(false)}
                disabled={!nameOk || uploading}
              />
            </div>
          </div>
        </Droppable>
      )}
    </ModalOverlay>
  );
}
