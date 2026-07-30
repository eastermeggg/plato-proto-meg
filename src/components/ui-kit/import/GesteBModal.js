// Geste B (spec §4) - « Créer un dossier Plato ». B = C + fiche : même
// navigation, même panier, destination inexistante. Étape 1 la fiche, étape 2
// le contenu initial. Seul opt-out du système : un dossier Outlook ajouté ICI
// est suivi par défaut (création = déclaration de miroir) ; un thread reste
// OFF. « ← Retour » préserve la composition.

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import Button from '../../ui/Button';
import { ModalOverlay, Droppable, ConfirmDialog, monoLabel, usePhase2 } from './atoms';
import MailColumn from './MailColumn';
import Panier from './Panier';
import { useComposer } from './useComposer';
import { approxPieces, composerRecap, folderById } from './labData';

const MAIL_W = 440;

const inputStyle = { border: '1px solid #e7e5e3', boxShadow: '0px 1px 1px rgba(26,26,26,0.05)' };

// Pas de « Déjà suivi » ni d'habituels ici : ces états sont relatifs à UN
// dossier Plato, or on est en train de le créer. Seul « Déjà lié à … »
// (dossier Outlook miroir d'une AUTRE affaire) reste pertinent.
export default function GesteBModal({ onClose, onCommit, connected, onConnect }) {
  const phase2 = usePhase2();
  const c = useComposer();
  const { items, decoupe, suivre } = c;
  const [step, setStep] = useState(1);
  const [nom, setNom] = useState('');
  const [client, setClient] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  // Nom prérempli depuis le PREMIER dossier Outlook ajouté uniquement, jamais
  // par-dessus une saisie : on retient ce que l'auto-nommage a écrit.
  const autoNameRef = useRef(null);
  const [confirmClose, setConfirmClose] = useState(false);

  // Garde-fou de fermeture : fiche saisie ou contenu composé → on demande
  // avant de détruire (Échap, voile, ✕, Annuler).
  const dirty = items.length > 0 || nom.trim() !== '' || client.trim() !== '';
  const requestClose = () => { if (dirty) setConfirmClose(true); else onClose(); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (confirmClose) { setConfirmClose(false); return; }
      if (dirty) setConfirmClose(true); else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, dirty, confirmClose]);

  const confirmDialog = confirmClose && (
    <ConfirmDialog title="Abandonner la création ?" onClose={() => setConfirmClose(false)}>
      <p className="px-5 pt-1 pb-3 text-[13px] text-foreground-secondary leading-5">
        La fiche{items.length > 0 ? ' et le contenu composé' : ''} seront perdus - le dossier n'a pas encore été créé.
      </p>
      <div className="px-5 pb-4 flex items-center justify-end gap-2.5">
        <Button variant="secondary" size="md" label="Continuer" onClick={() => setConfirmClose(false)} />
        <Button variant="primary" size="md" label="Abandonner" onClick={onClose} />
      </div>
    </ConfirmDialog>
  );

  // Prendre un dossier à la création : suivi par défaut ON (miroir, seul opt-out
  // du système) et nom prérempli depuis le premier dossier ajouté.
  const takeFolderB = (fid) => {
    const it = c.takeFolder(fid);
    if (!it) return it;
    if (phase2) c.setSuivre(s => new Set([...s, it.id]));
    if (nom.trim() === '' || nom === autoNameRef.current) {
      const fname = folderById(fid)?.name || it.folder.name;
      autoNameRef.current = fname;
      setNom(fname);
    }
    return it;
  };

  const nameOk = nom.trim().length > 0;
  const nPieces = approxPieces(items, decoupe);
  const detail = composerRecap(items);
  const nSuivis = phase2 ? suivre.size : 0;
  const uploading = items.some(i => i.status === 'uploading');

  const recap = items.length === 0 ? 'Aucun contenu pour l\'instant - vous pouvez créer le dossier vide' : [
    `≈ ${nPieces} pièce${nPieces > 1 ? 's' : ''}`,
    detail || null,
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
    <ModalOverlay onClose={requestClose}>
      {step === 1 ? (
        <div className="relative bg-white rounded-md w-full h-full flex flex-col overflow-hidden" style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' }} role="dialog" aria-modal="true" aria-label="Nouveau dossier">
          <div className="flex items-center justify-between px-5 pt-4 pb-[15px] border-b border-border flex-shrink-0">
            <h2 className="text-foreground" style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: '20px', letterSpacing: '-0.5px' }}>Nouveau dossier</h2>
            <button type="button" onClick={requestClose} className="inline-flex items-center justify-center w-[26px] h-[26px] rounded bg-cream text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0" title="Fermer">
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
          {confirmDialog}
        </div>
      ) : (
        <Droppable
          onFiles={() => c.addLocalFiles(2)}
          className="bg-white rounded-md w-full h-full flex flex-col overflow-hidden"
          style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' }}
          role="dialog"
          aria-modal="true"
          aria-label={`Contenu initial de ${nom.trim()}`}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-[15px] border-b border-border flex-shrink-0">
            <div className="flex items-baseline gap-2.5 min-w-0">
              <h2 className="text-foreground flex-shrink-0" style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: '20px', letterSpacing: '-0.5px' }}>
                Contenu initial de « {nom.trim()} »
              </h2>
              <span className="flex-shrink-0" style={monoLabel}>Étape 2 sur 2</span>
            </div>
            <button type="button" onClick={requestClose} className="inline-flex items-center justify-center w-[26px] h-[26px] rounded bg-cream text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0" title="Fermer">
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex">
            <div
              className="relative flex-shrink-0 h-full"
              style={{
                width: collapsed ? 0 : MAIL_W, overflow: 'hidden',
                visibility: collapsed ? 'hidden' : 'visible',
                transition: `width 320ms cubic-bezier(0.4,0,0.2,1), visibility 0s ${collapsed ? '320ms' : '0s'}`,
              }}
              aria-hidden={collapsed || undefined}
            >
              <div className="absolute inset-y-0 left-0" style={{ width: MAIL_W }}>
                <MailColumn
                  width={MAIL_W}
                  threadStateMap={c.threadStateMap}
                  stagedFolderIds={c.stagedFolderIds}
                  takeThread={c.takeThread}
                  takeManyThreads={c.takeManyThreads}
                  takeFolder={takeFolderB}
                  removeFolder={c.removeFolder}
                  removeThread={c.removeThread}
                  dejaSuiviFolderIds={new Set()}
                  dejaSuiviThreadIds={new Set()}
                  connected={connected}
                  onConnect={onConnect}
                  onCollapse={() => setCollapsed(true)}
                />
              </div>
            </div>

            <Panier
              items={items}
              onRemove={c.removeItem}
              onTogglePiece={c.togglePieceById}
              onRedirectFolder={c.redirectFolder}
              onToggleFolderThread={c.toggleFolderThread}
              onToggleFolderPiece={c.toggleFolderPiece}
              decoupe={decoupe}
              onToggleDecoupe={c.toggleDecoupe}
              onToggleAllDecoupe={c.toggleAllDecoupe}
              suivre={suivre}
              onToggleSuivre={c.toggleSuivre}
              onAddFiles={() => c.addLocalFiles(1)}
              collapsed={collapsed}
              onExpand={() => setCollapsed(false)}
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
              <Button variant="secondary" size="md" label="Annuler" onClick={requestClose} />
              <Button
                variant="primary" size="md"
                label={uploading ? 'Réception des fichiers…' : nSuivis > 0 ? 'Créer et suivre' : 'Créer le dossier'}
                onClick={() => create(false)}
                disabled={!nameOk || uploading}
              />
            </div>
          </div>
          {confirmDialog}
        </Droppable>
      )}
    </ModalOverlay>
  );
}
