// « Nouveau dossier » v2 - modale de création en 3 étapes (Figma « Create
// Matter — New Dossier Modal », Plato---Design 3698:29234) :
//   1. Nom du dossier   - question serif centrée + champ référence
//   2. Pièces client    - colonne mail (transvasement) + bordereau à droite
//   3. Pièces adverses  - mêmes mécaniques, camp adverse, colonne mail repliée
// Le stepper horizontal du header est la primitive `ui/Stepper` (états
// done / active / upcoming). Chaque étape de pièces a SON composer (les deux
// camps ne se mélangent jamais) ; la colonne mail est le MailColumn partagé.
// Frames de référence : 4226:63214 (étape 1) · 4226:63449 (étape 2 vide) ·
// 4226:63250 / 4226:63491 (étape 2 remplie) · 4226:63350 (étape 3).

import React, { useEffect, useState } from 'react';
import { Mail, Upload, X } from 'lucide-react';
import Button from '../../ui/Button';
import Stepper from '../../ui/Stepper';
import DropZone from '../../ui/DropZone';
import { colors, shadows, typography } from '../../../design-system/tokens';
import { Droppable, ConfirmDialog } from './atoms';
import MailColumn from './MailColumn';
import { useComposer } from './useComposer';
import {
  SectionHeader, ThreadCard, ZipCard, FolderCard, LocalFilesCard,
} from './bordereauCards';
import { approxPieces } from './labData';

const MAIL_W = 408; // Figma 4226:63449 : colonne mail de la modale = 408px
const STEPS = [
  { label: 'Nom du dossier' },
  { label: 'Pièces client' },
  { label: 'Pièces adverses' },
];

// ── Étape 1 : « Comment s'appelle ce dossier ? » (frame 4226:63214) ─────────
function NameStep({ nom, setNom, onSubmit }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-background flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6" style={{ width: 480 }}>
        {/* Gravure « dossier » (librairie d'illustrations Plato) - cadrage Figma. */}
        <div className="relative overflow-hidden pointer-events-none" style={{ width: 78, height: 72 }} aria-hidden>
          <img
            src="/illustrations/plato/dossier-folder.png"
            alt=""
            className="absolute max-w-none"
            style={{ height: '145.4%', width: '134.09%', left: '-17.05%', top: '-23.92%' }}
          />
        </div>
        <p
          className="text-display-lg whitespace-nowrap"
          style={{ fontFamily: typography.fontFamily.serif, color: colors.semantic.foreground }}
        >
          Comment s'appelle ce dossier ?
        </p>
        <div style={{ width: 270 }}>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
            placeholder="Référence - ex. Leblanc c/AXA"
            autoFocus
            aria-label="Nom du dossier"
            className="w-full h-9 px-3 text-sm rounded-lg bg-surface text-foreground focus:outline-none"
            style={{
              border: `1px solid ${focused ? colors.semantic.foreground : colors.semantic.border}`,
              boxShadow: focused
                ? `0 0 0 3px color-mix(in srgb, ${colors.semantic.foregroundMuted} 50%, transparent)`
                : shadows.xs,
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Étapes 2 & 3 : dépôt des pièces (client / adverse) ─────────────────────
// Colonne mail repliable à gauche (jamais démontée : la sélection survit),
// bordereau à droite. Vide : grand Drop Doc plein cadre (frame 4226:63449) ;
// rempli : rangée [boutons + drop inline] puis sections DOCUMENTS EMAILS /
// UPLOADÉS (frames 4226:63250 · 4226:63491 · 4226:63350).
function PiecesStep({ title, composer, mailOpen, setMailOpen, connected, onConnect }) {
  const c = composer;
  const hasItems = c.items.length > 0;
  const emailItems = c.items.filter(i => i.origin === 'emails');
  const localItems = c.items.filter(i => i.origin === 'ordinateur');
  const localFiles = localItems.filter(i => i.kind === 'file');
  const localOthers = localItems.filter(i => i.kind !== 'file');

  const renderCard = (item) => {
    if (item.kind === 'thread') return <ThreadCard key={item.id} item={item} onRemove={() => c.removeItem(item.id)} />;
    if (item.kind === 'folder') return <FolderCard key={item.id} item={item} onRemove={() => c.removeItem(item.id)} />;
    if (item.kind === 'zip') return <ZipCard key={item.id} item={item} onRemove={() => c.removeItem(item.id)} />;
    return null;
  };

  const toolbar = (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Button
        variant="outline"
        size="md"
        icon={Mail}
        label="Importer mes emails"
        onClick={() => setMailOpen(o => !o)}
        title={mailOpen ? 'Replier la boîte mail' : 'Ouvrir la boîte mail'}
      />
      <Button
        variant="outline"
        size="md"
        icon={Upload}
        label="Ajouter"
        onClick={() => c.addLocalFiles(1)}
        title="Ajouter des fichiers depuis l'ordinateur"
      />
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex">
      {/* Colonne mail - repli en largeur, jamais démontée (pattern GesteC). */}
      <div
        className="relative flex-shrink-0 h-full"
        style={{
          width: mailOpen ? MAIL_W : 0, overflow: 'hidden',
          visibility: mailOpen ? 'visible' : 'hidden',
          transition: `width 320ms cubic-bezier(0.4,0,0.2,1), visibility 0s ${mailOpen ? '0s' : '320ms'}`,
        }}
        aria-hidden={!mailOpen || undefined}
      >
        <div className="absolute inset-y-0 left-0" style={{ width: MAIL_W }}>
          <MailColumn
            width={MAIL_W}
            threadStateMap={c.threadStateMap}
            stagedFolderIds={c.stagedFolderIds}
            takeThread={c.takeThread}
            takeManyThreads={c.takeManyThreads}
            takeFolder={c.takeFolder}
            removeFolder={c.removeFolder}
            removeThread={c.removeThread}
            dejaSuiviFolderIds={new Set()}
            dejaSuiviThreadIds={new Set()}
            connected={connected}
            onConnect={onConnect}
            onCollapse={() => setMailOpen(false)}
          />
        </div>
      </div>

      {/* Panier / bordereau */}
      <div
        className="flex-1 min-w-0 h-full bg-background flex flex-col"
        style={{ padding: '20px 24px', gap: hasItems ? 24 : 16 }}
      >
        <p
          className="text-display-sm whitespace-nowrap flex-shrink-0"
          style={{ fontFamily: typography.fontFamily.serif, color: colors.semantic.foreground }}
        >
          {title}
        </p>

        {hasItems ? (
          <>
            <div className="flex items-center gap-6 w-full flex-shrink-0">
              {toolbar}
              <DropZone
                context="inline"
                className="justify-center flex-1 min-w-0"
                onClick={() => c.addLocalFiles(1)}
                onFiles={() => c.addLocalFiles(2)}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6">
              {emailItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  <SectionHeader>Documents emails</SectionHeader>
                  {emailItems.map(renderCard)}
                </div>
              )}
              {emailItems.length > 0 && localItems.length > 0 && (
                <div className="w-full h-px bg-border flex-shrink-0" aria-hidden />
              )}
              {localItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  <SectionHeader>Documents / dossiers uploadés depuis l'ordinateur</SectionHeader>
                  {localOthers.map(renderCard)}
                  {localFiles.length > 0 && (
                    <LocalFilesCard files={localFiles} decoupe={c.decoupe} onToggleDecoupe={c.toggleDecoupe} />
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {toolbar}
            {/* Grand Drop Doc plein cadre (état vide, frame 4226:63449). */}
            <div
              className="flex-1 min-h-0 w-full rounded-lg cursor-pointer"
              style={{ border: `1px dashed ${colors.semantic.borderHover}`, padding: 16 }}
              onClick={() => c.addLocalFiles(2)}
              role="button"
              aria-label="Déposer ou cliquer pour ajouter des documents"
            >
              <div
                className="w-full h-full rounded-lg flex flex-col items-center justify-center"
                style={{
                  gap: 32, padding: 32,
                  background: `linear-gradient(to top, rgba(238,236,230,0) 57%, ${colors.semantic.muted} 100%)`,
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    backgroundColor: colors.semantic.muted,
                    border: `1px solid ${colors.semantic.borderStrong}`,
                    padding: 16, boxShadow: shadows.xs,
                  }}
                >
                  <Upload className="w-6 h-6" strokeWidth={1.75} style={{ color: colors.semantic.foreground }} />
                </div>
                <p className="text-sm font-medium text-center" style={{ color: colors.semantic.cardForeground, maxWidth: 576 }}>
                  Déposez vos documents ici ou sélectionnez des échanges
                  <br />
                  depuis votre boîte mail à gauche.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── La modale ───────────────────────────────────────────────────────────────
export default function CreateMatterModal({ onClose, onCommit, connected, onConnect }) {
  const [step, setStep] = useState(0);
  const [nom, setNom] = useState('');
  // Un composer PAR camp : les pièces client et adverses ne se mélangent jamais.
  const client = useComposer();
  const adverse = useComposer();
  const [mailOpenClient, setMailOpenClient] = useState(true);
  // Étape 3 (frame 4226:63350) : colonne mail repliée par défaut.
  const [mailOpenAdverse, setMailOpenAdverse] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const nameOk = nom.trim().length > 0;
  const dirty = nameOk || client.items.length > 0 || adverse.items.length > 0;
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

  const activeComposer = step === 2 ? adverse : client;
  const uploading = client.items.some(i => i.status === 'uploading') || adverse.items.some(i => i.status === 'uploading');

  const next = () => {
    if (step === 0) { if (nameOk) setStep(1); return; }
    if (step === 1) { setStep(2); return; }
    if (uploading) return;
    onCommit({
      nom: nom.trim(),
      clientItems: client.items,
      adverseItems: adverse.items,
      decoupe: new Set([...client.decoupe, ...adverse.decoupe]),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: 20 }}
      onClick={requestClose}
    >
      <Droppable
        onFiles={() => { if (step > 0) activeComposer.addLocalFiles(2); }}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full bg-surface border border-border rounded-[10px] flex flex-col overflow-hidden"
        style={{ boxShadow: shadows.xl }}
        role="dialog"
        aria-modal="true"
        aria-label="Créer un nouveau dossier"
      >
        {/* Header : titre · stepper · fermer (trois zones flex-1, Figma 4226:63216). */}
        <div className="flex items-center border-b border-border flex-shrink-0" style={{ padding: '16px 12px 17px 20px' }}>
          <div className="flex-1 min-w-0 flex items-center">
            <h2 className="text-sm font-medium text-foreground truncate">Créer un nouveau dossier</h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Stepper steps={STEPS} current={step} onStepClick={(i) => setStep(i)} />
          </div>
          <div className="flex-1 flex items-center justify-end">
            <button
              type="button"
              onClick={requestClose}
              className="inline-flex items-center justify-center w-[26px] h-[26px] rounded bg-cream text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {step === 0 && <NameStep nom={nom} setNom={setNom} onSubmit={next} />}
        {step === 1 && (
          <PiecesStep
            title="Déposez les pièces client"
            composer={client}
            mailOpen={mailOpenClient}
            setMailOpen={setMailOpenClient}
            connected={connected}
            onConnect={onConnect}
          />
        )}
        {step === 2 && (
          <PiecesStep
            title="Déposez les pièces adverses"
            composer={adverse}
            mailOpen={mailOpenAdverse}
            setMailOpen={setMailOpenAdverse}
            connected={connected}
            onConnect={onConnect}
          />
        )}

        {/* Footer : Annuler · (Précédent) · Continuer / Créer le dossier. */}
        <div className="flex items-center gap-3 border-t border-border bg-surface flex-shrink-0" style={{ padding: '12px 20px 14px' }}>
          <Button variant="ghost" size="md" label="Annuler" onClick={requestClose} />
          <div className="flex-1" />
          {step > 0 && (
            <Button variant="secondary" size="md" label="Précédent" onClick={() => setStep(s => s - 1)} />
          )}
          <Button
            variant="primary"
            size="md"
            label={step === 2 ? (uploading ? 'Réception des fichiers…' : 'Créer le dossier') : 'Continuer'}
            onClick={next}
            disabled={(step === 0 && !nameOk) || (step === 2 && uploading)}
          />
        </div>

        {confirmClose && (
          <ConfirmDialog title="Abandonner la création ?" onClose={() => setConfirmClose(false)}>
            <p className="px-5 pt-1 pb-3 text-[13px] text-foreground-secondary leading-5">
              Le nom{client.items.length + adverse.items.length > 0 ? ' et les pièces déposées' : ''} seront perdus - le dossier n'a pas encore été créé.
            </p>
            <div className="px-5 pb-4 flex items-center justify-end gap-2.5">
              <Button variant="secondary" size="md" label="Continuer la création" onClick={() => setConfirmClose(false)} />
              <Button variant="primary" size="md" label="Abandonner" onClick={onClose} />
            </div>
          </ConfirmDialog>
        )}
      </Droppable>
    </div>
  );
}

// Récap utilitaire pour le commit côté lab.
export function createMatterRecap({ clientItems, adverseItems, decoupe }) {
  const nC = approxPieces(clientItems, decoupe);
  const nA = approxPieces(adverseItems, decoupe);
  return { nC, nA };
}
