// Geste C (spec §3) - « Ajouter des pièces à un dossier existant ». Modale
// deux colonnes : à gauche on choisit (colonne mail), à droite on vérifie
// (panier). Le suivi ne se décide qu'ici via les toggles « Suivre » du panier
// (défaut conservateur : OFF) ; le CTA devient « Ajouter et suivre » dès
// qu'un suivi est actif.

import React, { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import Button from '../../ui/Button';
import { ModalOverlay, Droppable, ConfirmDialog, usePhase2 } from './atoms';
import MailColumn from './MailColumn';
import Panier from './Panier';
import { useComposer } from './useComposer';
import { approxPieces, composerRecap, PIECES_NODES, nodeLabel } from './labData';

const MAIL_W = 440;

// Sélecteur « Ajouter dans : … » (question ouverte n°1 de la spec - tranchée
// ici : défaut = dossier courant de l'arborescence, modifiable près du CTA).
function DestinationSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-foreground bg-white border border-border hover:bg-background-canvas transition-colors"
      >
        {nodeLabel(value)}
        <ChevronDown className="w-3 h-3 text-foreground-muted" strokeWidth={2} />
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <span className="absolute z-50 bottom-8 left-0 bg-white border border-border rounded-lg shadow-xl overflow-hidden py-1 flex flex-col" style={{ minWidth: 180 }}>
            {PIECES_NODES.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => { onChange(n.id); setOpen(false); }}
                className={`text-left px-3 h-8 text-[13px] transition-colors ${n.id === value ? 'bg-cream text-foreground font-medium' : 'text-foreground-secondary hover:bg-background-canvas'}`}
              >
                {n.label}
              </button>
            ))}
          </span>
        </>
      )}
    </span>
  );
}

// `habituels` : la section n'existe que si le dossier a DÉJÀ importé depuis la
// boîte mail (la frecency se construit) - premier import → boîte nue.
export default function GesteCModal({ onClose, onCommit, connected, onConnect, dejaSuiviFolderIds, dejaSuiviThreadIds, dossierLabel = 'Leblanc c/ AXA' }) {
  const phase2 = usePhase2();
  const c = useComposer();
  const { items, decoupe, suivre } = c;
  const [collapsed, setCollapsed] = useState(false);
  // Défaut CONSERVATEUR : « Sans catégorie ». Un défaut métier (Correspondance)
  // rangerait silencieusement un rapport d'expertise au mauvais endroit.
  const [destination, setDestination] = useState('sans-categorie');
  const [confirmClose, setConfirmClose] = useState(false);

  // Garde-fou de fermeture : une sélection en cours ne se détruit jamais sur
  // un Échap ou un clic de voile - on demande d'abord.
  const dirty = items.length > 0;
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

  // Récap footer (grammaire spec §5).
  const nPieces = approxPieces(items, decoupe);
  const detail = composerRecap(items);
  const nDecoupes = decoupe.size;
  const nSuivis = phase2 ? suivre.size : 0;
  const uploading = items.some(i => i.status === 'uploading');
  const canCommit = items.length > 0 && !uploading;
  const ctaLabel = nSuivis > 0 ? 'Ajouter et suivre' : 'Ajouter au dossier';

  const recap = items.length === 0 ? 'Aucune pièce ajoutée' : [
    `≈ ${nPieces} pièce${nPieces > 1 ? 's' : ''}`,
    detail || null,
    nDecoupes ? `${nDecoupes} découpé${nDecoupes > 1 ? 's' : ''}` : null,
    nSuivis ? `${nSuivis} suivi${nSuivis > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ');

  const commit = () => {
    if (!canCommit) return;
    onCommit({ items, decoupe, suivre: phase2 ? suivre : new Set(), destinationId: destination });
  };

  const stagedFolderIds = c.stagedFolderIds;

  return (
    <ModalOverlay onClose={requestClose}>
      <Droppable
        onFiles={() => c.addLocalFiles(2)}
        className="bg-white rounded-md w-full h-full flex flex-col overflow-hidden"
        style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Ajouter des pièces au dossier ${dossierLabel}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-[15px] border-b border-border flex-shrink-0">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <h2 className="text-foreground flex-shrink-0" style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: '20px', letterSpacing: '-0.5px' }}>
              Ajouter des pièces au dossier
            </h2>
            <span className="text-[13px] text-foreground-muted truncate">{dossierLabel}</span>
          </div>
          <button type="button" onClick={requestClose} className="inline-flex items-center justify-center w-[26px] h-[26px] rounded bg-cream text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0" title="Fermer">
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex">
          {/* Colonne mail - repli en largeur, jamais démontée : la sélection
              survit. `visibility` suit le repli (en fin de transition) pour
              sortir les contrôles du parcours clavier et de l'arbre d'a11y. */}
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
                stagedFolderIds={stagedFolderIds}
                takeThread={c.takeThread}
                takeManyThreads={c.takeManyThreads}
                takeFolder={c.takeFolder}
                removeFolder={c.removeFolder}
                removeThread={c.removeThread}
                dejaSuiviFolderIds={dejaSuiviFolderIds}
                dejaSuiviThreadIds={dejaSuiviThreadIds}
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
            decoupe={decoupe}
            onToggleDecoupe={c.toggleDecoupe}
            onToggleAllDecoupe={c.toggleAllDecoupe}
            suivre={suivre}
            onToggleSuivre={c.toggleSuivre}
            onAddFiles={() => c.addLocalFiles(1)}
            collapsed={collapsed}
            onExpand={() => setCollapsed(false)}
            introCopy="Les pièces ajoutées rejoindront le dossier. Vous pourrez les découper et les ranger ensuite."
          />
        </div>

        {/* Footer global */}
        <div className="px-5 pt-3 pb-3.5 border-t border-border flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-[13px] text-foreground-secondary truncate">{recap}</p>
            {items.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-foreground-muted flex-shrink-0">
                Ajouter dans :
                <DestinationSelect value={destination} onChange={setDestination} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Button variant="secondary" size="md" label="Annuler" onClick={requestClose} />
            <Button variant="primary" size="md" label={uploading ? 'Réception des fichiers…' : ctaLabel} onClick={commit} disabled={!canCommit} />
          </div>
        </div>

        {confirmClose && (
          <ConfirmDialog title="Abandonner la sélection ?" onClose={() => setConfirmClose(false)}>
            <p className="px-5 pt-1 pb-3 text-[13px] text-foreground-secondary leading-5">
              Votre sélection (≈ {nPieces} pièce{nPieces > 1 ? 's' : ''}) sera libérée - rien n'a encore été ajouté au dossier.
            </p>
            <div className="px-5 pb-4 flex items-center justify-end gap-2.5">
              <Button variant="secondary" size="md" label="Continuer la sélection" onClick={() => setConfirmClose(false)} />
              <Button variant="primary" size="md" label="Abandonner" onClick={onClose} />
            </div>
          </ConfirmDialog>
        )}
      </Droppable>
    </ModalOverlay>
  );
}
