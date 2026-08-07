// Colonne RÉCOLTE de la V2 : le système rassemble, l'avocat décide.
// En tête, ce que Norma propose pour le dossier (avec la preuve de chaque
// proposition). La recherche manuelle reste là, mais devient secondaire.
// Plus aucun arbre Outlook à parcourir : les candidats sont des échanges.

import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, FolderOpen, ListCollapse, Mail, Paperclip, Plus, Search, X } from 'lucide-react';
import { Checkbox, monoLabel } from '../import/atoms';
import outlookLogo from '../../../assets/outlook.svg';
import { LAB_THREADS, normalize, relDate, threadView, threadViewById, threadPreview, bodyKey, pjKey } from '../import/labData';
import {
  HARVEST_GROUPS, PROPOSED_TIDS, deltaInfoOf, MAILBOXES, mailboxOf,
  FOLDER_CANDIDATE_IDS, folderModel, folderStats, folderDelta, folderDeltaKeys, childFolderModels,
} from './harvestData';
import { kindColor, V2, Badge, SmallBtn, HoverReveal, MetaDot } from './pieceRow';

// Liste façon boîte de réception : PAS de carte - des lignes pleine largeur
// séparées par un filet fin (bords haut/bas de la liste). On gagne toute la
// place perdue en padding/bordures/gaps de cartes.
// DÉFINI AU MODULE : un composant inline serait recréé à chaque rendu et
// démonterait les lignes (perte de l'état « déplié » des cartes).
function Rows({ children }) {
  return <div className="divide-y divide-border-subtle border-y border-border-subtle">{children}</div>;
}

// ── Carte dossier Outlook ───────────────────────────────────────────────────
// Le geste en bloc de la V1 : un clic verse tout le dossier (sous-dossiers
// compris). La curation fine vit dans le bloc du bordereau, pas ici.
export function FolderCandidateCard({ fid, added, deltaAdded, onAddFolder, onRemoveFolder, onEnter, onAddFolderDelta }) {
  const m = folderModel(fid);
  const stats = useMemo(() => folderStats(fid), [fid]);
  const delta = folderDelta(fid);
  if (!m) return null;
  const linkedTo = m.linkedTo;
  const hasDelta = delta && delta.newCount > 0 && !deltaAdded;
  // Planche « Inbox / Folder » : rangée 44px (p-12), chevron 12 · folder-open
  // 16 VERT · nom 14 medium ; ajouté/lié = contenu à 50 % + badge ; du neuf =
  // filet indigo 3px + badge « Nouveau » ; le geste se révèle au survol.
  const dimmed = added || linkedTo || deltaAdded;

  let badge = null;
  if (linkedTo) badge = <Badge tone="secondary" className="!opacity-100">{`Déjà lié à ${linkedTo}`}</Badge>;
  else if (hasDelta) badge = <Badge tone="indigo">Nouveau</Badge>;
  else if (deltaAdded) badge = <Badge tone="success">Complément ajouté</Badge>;
  else if (added) badge = <Badge tone="success">Ajouté</Badge>;

  let hoverBtn = null;
  if (added) hoverBtn = <SmallBtn variant="destructive-subtle" icon={X} onClick={() => onRemoveFolder(fid)} title="Retirer le dossier du bordereau">Retirer</SmallBtn>;
  else if (deltaAdded) hoverBtn = <SmallBtn variant="destructive-subtle" icon={X} onClick={() => onRemoveFolder(fid)} title="Retirer le complément">Retirer</SmallBtn>;
  else if (hasDelta) hoverBtn = <SmallBtn variant="primary" icon={Plus} onClick={() => onAddFolderDelta(fid)} title={`Ajouter les ${delta.newCount} nouvelles pièces`}>Ajouter</SmallBtn>;
  else if (!linkedTo) hoverBtn = <SmallBtn variant="primary" icon={Plus} onClick={() => onAddFolder(fid)} title="Ajouter le dossier en entier, sous-dossiers compris">Ajouter</SmallBtn>;

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => onEnter?.(fid)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEnter?.(fid); } }}
      className="group relative flex items-center gap-2 p-3 bg-white cursor-pointer transition-colors"
      style={hasDelta ? { borderLeft: `3px solid ${V2.indigo}`, paddingLeft: 9 } : undefined}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = V2.accent; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
      title={`Ouvrir le dossier · ${stats.threads} échanges · ≈ ${stats.pieces} pièces${stats.folders > 0 ? ` · ${stats.folders} sous-dossiers` : ''}`}
    >
      <ChevronRight className={`w-3 h-3 flex-shrink-0 ${dimmed ? 'opacity-50' : ''}`} strokeWidth={2} style={{ color: V2.muted }} />
      <FolderOpen className={`w-4 h-4 flex-shrink-0 ${dimmed ? 'opacity-50' : ''}`} strokeWidth={1.33} style={{ color: V2.folder }} />
      <p className={`flex-1 min-w-0 text-[14px] leading-5 font-medium truncate ${dimmed ? 'opacity-50' : ''}`} style={{ color: V2.foreground }}>{m.name}</p>
      {badge}
      {hoverBtn && (
        <HoverReveal>
          <span onClick={(e) => e.stopPropagation()}>{hoverBtn}</span>
        </HoverReveal>
      )}
    </div>
  );
}

// Échange DÉJÀ AU DOSSIER (drill d'un dossier versé) : la carte Threads en
// état « added » de la planche - contenu à 50 %, badge « Ajouté » plein, aucun
// geste (c'est un constat, le retrait vit au bordereau).
function ReadonlyThreadRow({ tid }) {
  const tv = threadViewById(tid);
  if (!tv) return null;
  const excerpt = tv.illegible ? null : tv.summary;
  return (
    <div className="flex items-start gap-2 p-3.5 bg-white">
      <span className="flex items-center py-1 flex-shrink-0 opacity-50">
        <ChevronRight className="w-3 h-3" strokeWidth={2} style={{ color: V2.muted }} />
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-2 opacity-50">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className={`text-[14px] leading-5 font-medium truncate ${tv.illegible ? 'italic' : ''}`} style={{ color: V2.foreground }}>{tv.subject}</p>
          <p className="flex items-center gap-1 min-w-0">
            <span className="text-[12px] leading-4 font-medium flex-shrink-0" style={{ color: V2.muted }}>{relDate(tv.date)}</span>
            <MetaDot />
            <span className="text-[12px] leading-4 truncate" style={{ color: V2.muted, letterSpacing: 0.12 }}>{tv.sender}</span>
            {tv.pj > 0 && (
              <>
                <MetaDot />
                <span className="inline-flex items-center gap-1 flex-shrink-0">
                  <Paperclip className="w-3 h-3 opacity-60" strokeWidth={1.75} style={{ color: V2.pjMini }} />
                  <span className="uppercase leading-none" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: V2.muted }}>{tv.pj}</span>
                </span>
              </>
            )}
          </p>
        </div>
        {excerpt && (
          <p className="text-[12px] leading-4 line-clamp-2 pl-2 border-l-2" style={{ color: V2.muted, letterSpacing: 0.12, borderColor: V2.ai }}>{excerpt}</p>
        )}
      </div>
      <Badge tone="success">Ajouté</Badge>
    </div>
  );
}

// ── Carte candidat ──────────────────────────────────────────────────────────
// Sujet · expéditeur · preuve. Un clic ouvre l'aperçu EN PLACE (corps + PJ,
// ajout pièce par pièce) : décider vite, sans survol chronométré ni panneau.
export function CandidateCard({ tid, covered, taken, demoInfo, mailboxNote, onAddThread, onTogglePiece, onAddThreadDelta, onRemoveThread }) {
  const [open, setOpen] = useState(false);
  const raw = useMemo(() => LAB_THREADS.find(t => t.id === tid), [tid]);
  const tv = useMemo(() => threadView(raw), [raw]);
  const preview = useMemo(() => (open ? threadPreview(tid) : null), [open, tid]);
  // État « fil déjà importé » : instantané au dossier ; s'il a grossi depuis,
  // seul le DELTA est proposé (jamais les pièces déjà versées).
  // `demoInfo` : la galerie de composants force un état sans toucher aux seeds.
  const info = demoInfo === undefined ? deltaInfoOf(tid) : demoInfo;
  const delta = info ? info.delta.length : 0;
  const upToDate = info && delta === 0;
  const deltaAdded = info && delta > 0 && info.delta.every(d => taken?.has(d.key));
  if (!tv) return null;

  const total = 1 + tv.pj;
  const nTaken = taken ? taken.size : 0;
  const all = !info && nTaken >= total;
  const partial = !info && nTaken > 0 && !all;
  const settled = upToDate || covered || deltaAdded;
  const hasDelta = info && delta > 0 && !deltaAdded;
  // Planche « Inbox / Threads » : ajouté/inclus = contenu à 50 %, les badges
  // restent pleins ; « new » = filet indigo 3px à gauche.
  const dimmed = all || deltaAdded || covered || upToDate;
  // Extrait du mail : décider sur le contenu réel - barre VIOLETTE (résumé IA).
  // Pas pour un objet illisible (le titre EST déjà le résumé dans ce cas).
  const excerpt = tv.illegible ? null : tv.summary;

  // Badge d'état (toujours visible) : Ajouté vert · Nouveau indigo ·
  // n/N ajouté et Déjà inclus en secondaire.
  let badge = null;
  if (all) badge = <Badge tone="success">Ajouté</Badge>;
  else if (deltaAdded) badge = <Badge tone="success">Complément ajouté</Badge>;
  else if (hasDelta) badge = <Badge tone="indigo" className="cursor-pointer" title={`${delta} nouvelle${delta > 1 ? 's' : ''} pièce${delta > 1 ? 's' : ''} depuis le ${info.importedOn}`}>Nouveau</Badge>;
  else if (partial) badge = <Badge tone="secondary">{nTaken}/{total} ajouté{nTaken > 1 ? 's' : ''}</Badge>;
  else if (covered) badge = <Badge tone="secondary" title="Cet échange entre avec le dossier - curation dans le bloc du bordereau">Déjà inclus</Badge>;
  else if (upToDate) badge = <Badge tone="secondary" title="Tout ce fil est déjà au dossier, rien de neuf depuis">À jour</Badge>;

  // Le geste au survol (planche Hover) : « + Ajouter » sombre, « ✕ Retirer »
  // destructif subtil sur un fil déjà ajouté.
  let hoverBtn = null;
  if (all || deltaAdded) hoverBtn = <SmallBtn variant="destructive-subtle" icon={X} onClick={() => onRemoveThread(tid)} title="Retirer du bordereau">Retirer</SmallBtn>;
  else if (hasDelta) hoverBtn = <SmallBtn variant="primary" icon={Plus} onClick={() => onAddThreadDelta(tid)} title={`Ajouter les ${delta} nouvelle${delta > 1 ? 's' : ''} pièce${delta > 1 ? 's' : ''} depuis le ${info.importedOn}`}>Ajouter</SmallBtn>;
  else if (!settled) hoverBtn = <SmallBtn variant="primary" icon={Plus} onClick={() => onAddThread(tid)} title={partial ? 'Ajouter le reste de l\'échange' : 'Ajouter l\'échange au bordereau'}>Ajouter</SmallBtn>;

  return (
    <div className="bg-white">
      <div
        role="button" tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
        className="group relative flex items-start gap-2 p-3.5 cursor-pointer transition-colors"
        style={hasDelta ? { borderLeft: `3px solid ${V2.indigo}`, paddingLeft: 11, backgroundColor: open ? V2.accent : undefined } : { backgroundColor: open ? V2.accent : undefined }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = V2.accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = open ? V2.accent : ''; }}
      >
        <span className={`flex items-center py-1 flex-shrink-0 ${dimmed ? 'opacity-50' : ''}`}>
          <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} strokeWidth={2} style={{ color: V2.muted }} />
        </span>
        <div className={`flex-1 min-w-0 flex flex-col gap-2 ${dimmed ? 'opacity-50' : ''}`}>
          <div className="flex flex-col gap-0.5 min-w-0">
            {/* Ligne 1 : objet 14 medium. */}
            <div className="flex items-center gap-1.5 min-w-0">
              <p className={`min-w-0 text-[14px] leading-5 font-medium truncate ${tv.illegible ? 'italic' : ''}`} style={{ color: V2.foreground }}>{tv.subject}</p>
              {tv.illegible && (
                <Badge tone="secondary" className="!text-[10px] uppercase" title={`L'objet d'origine du mail (« ${raw?.subject} ») est illisible - ce titre est un résumé de son contenu.`}>Objet illisible</Badge>
              )}
            </div>
            {/* Ligne 2 : date · expéditeur · trombone + compte (mono). */}
            <p className="flex items-center gap-1 min-w-0">
              <span className="text-[12px] leading-4 font-medium flex-shrink-0" style={{ color: V2.muted }}>{relDate(tv.date)}</span>
              <MetaDot />
              <span className="text-[12px] leading-4 truncate" style={{ color: V2.muted, letterSpacing: 0.12 }}>{tv.sender}</span>
              {tv.pj > 0 && (
                <>
                  <MetaDot />
                  <span className="inline-flex items-center gap-1 flex-shrink-0">
                    <Paperclip className="w-3 h-3 opacity-60" strokeWidth={1.75} style={{ color: V2.pjMini }} />
                    <span className="uppercase leading-none" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: V2.muted }}>{tv.pj}</span>
                  </span>
                </>
              )}
              {/* Provenance multi-boîtes : le même fil reçu dans deux boîtes =
                  UN résultat - la note dit la seconde boîte, le tooltip la dédup. */}
              {mailboxNote && (
                <>
                  <MetaDot />
                  <span className="text-[12px] leading-4 flex-shrink-0" style={{ color: V2.muted, letterSpacing: 0.12 }} title="Reçu dans la boîte cabinet et dans votre boîte - dédoublonné : un seul résultat, une seule pièce.">{mailboxNote}</span>
                </>
              )}
            </p>
          </div>
          {/* Ligne 3 : résumé du fil, barre violette (résumé IA), 2 lignes. */}
          {excerpt && (
            <p className="text-[12px] leading-4 line-clamp-2 pl-2 border-l-2" style={{ color: V2.muted, letterSpacing: 0.12, borderColor: V2.ai }}>{excerpt}</p>
          )}
        </div>
        {badge}
        {hoverBtn && (
          <HoverReveal className="!items-start pt-3.5">
            <span onClick={(e) => e.stopPropagation()}>{hoverBtn}</span>
          </HoverReveal>
        )}
      </div>

      {open && preview && !settled && (
        <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Sélection pièce par pièce (planche « Inbox / Body PJs ») : rangée
              36px, pl-32, case = « au bordereau », cochable dans les deux sens.
              Fil déjà importé : les pièces au dossier sont un constat sans case. */}
          {preview.pieces.map(p => {
            const key = p.kind === 'body' ? bodyKey(tid) : pjKey(tid, p.name);
            const deltaEntry = info ? info.delta.find(d => (p.kind === 'body' ? d.kind === 'body' : d.key === key)) : null;
            const atDossier = info && !deltaEntry;
            const addKey = deltaEntry ? deltaEntry.key : key;
            const inB = !!taken?.has(addKey);
            const Icon = p.kind === 'body' ? Mail : Paperclip;
            return (
              <div
                key={key}
                className="flex items-center gap-2 pl-8 pr-3.5 py-2 bg-white transition-colors"
                onMouseEnter={(e) => { if (!atDossier) e.currentTarget.style.backgroundColor = V2.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
              >
                {atDossier ? (
                  <span className="w-4 flex-shrink-0" aria-hidden />
                ) : (
                  <Checkbox checked={inB} onToggle={() => onTogglePiece(tid, addKey)} title={inB ? 'Retirer cette pièce du bordereau' : 'Ajouter cette pièce au bordereau'} />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${atDossier ? 'opacity-50' : ''}`} strokeWidth={1.33} style={{ color: p.kind === 'body' ? V2.muted : V2.pj }} />
                <p className={`flex-1 min-w-0 text-[14px] leading-5 truncate ${inB ? 'font-medium' : ''} ${atDossier ? 'opacity-50' : ''}`} style={{ color: V2.foreground }}>{p.name}</p>
                {info && (
                  deltaEntry ? (
                    <Badge tone="warning">{deltaEntry.reason === 'actualisé' ? `actualisé · +${deltaEntry.newMessages} messages` : 'nouvelle'}</Badge>
                  ) : (
                    <span className="text-[12px] leading-4 flex-shrink-0" style={{ color: V2.muted }}>Au dossier · {info.importedOn}</span>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Colonne complète ────────────────────────────────────────────────────────
// Navigation du drill (retenue 2026-08-07, pattern iOS) : en dossier ouvert,
// l'en-tête du panneau DEVIENT la barre du dossier - bouton retour + titre +
// chemin. La recherche, elle, reste GLOBALE : taper sort du dossier (l'en-tête
// redevient « Vos boîtes ») et un bandeau au-dessus des résultats offre le
// retour ; effacer la requête rend le dossier tel quel.
export default function HarvestColumn({ threadState, coveredTids, addedFolderIds, lineKeys, onAddThread, onAddPiece, onTogglePiece, onAddThreadDelta, onRemoveThread, onAddFolder, onAddFolderDelta, onRemoveFolder, onCollapse, drillNav }) {
  const [query, setQuery] = useState('');
  const [drill, setDrill] = useState(null); // fid ouvert (drill), ou null = racine
  const q = normalize(query.trim());
  // Un dossier déjà versé est « complété » quand toutes ses nouvelles pièces
  // sont au bordereau.
  const folderDeltaAdded = (fid) => { const ks = folderDeltaKeys(fid); return ks.length > 0 && ks.every(k => lineKeys.has(k)); };

  // Chaîne racine → dossier courant (courant inclus).
  const chainOf = (fid) => {
    const chain = [];
    let cur = folderModel(fid);
    let guard = 0;
    while (cur && guard++ < 6) { chain.unshift(cur); cur = cur.parent ? folderModel(cur.parent) : null; }
    return chain;
  };
  const drillChain = drill ? chainOf(drill) : [];
  const drillParent = drillChain.length > 1 ? drillChain[drillChain.length - 2] : null;

  // La recherche balaie TOUS les canaux du user courant (boîtes cabinet + ses
  // boîtes personnelles), pas seulement la récolte ni le dossier ouvert : le
  // manuel n'est jamais bridé - zéro faux « aucun résultat ». Sections
  // étiquetées par boîte ; un fil reçu dans deux boîtes est dédoublonné
  // (conversationId) : il sort UNE fois, côté cabinet, avec sa double
  // provenance.
  const results = useMemo(() => {
    if (!q) return null;
    const match = (t) => {
      const tv = threadView(t);
      return normalize(`${t.subject} ${tv.sender} ${tv.summary || ''}`).includes(q);
    };
    const hits = LAB_THREADS.filter(match).map(t => t.id);
    const others = hits.filter(id => !PROPOSED_TIDS.has(id));
    return {
      proposed: hits.filter(id => PROPOSED_TIDS.has(id)),
      cabinet: others.filter(id => mailboxOf(id) !== 'personal'),
      personal: others.filter(id => mailboxOf(id) === 'personal'),
    };
  }, [q]);

  const evidenceOf = (tid) => HARVEST_GROUPS.flatMap(g => g.candidates).find(c => c.tid === tid);

  const card = (tid, extra = {}) => (
    <CandidateCard
      key={tid} tid={tid}
      taken={threadState.get(tid)}
      covered={coveredTids.has(tid)}
      onAddThread={onAddThread} onTogglePiece={onTogglePiece} onAddThreadDelta={onAddThreadDelta} onRemoveThread={onRemoveThread}
      {...extra}
    />
  );

  // La recherche prend le pas sur le drill ; sinon on montre le dossier ouvert.
  const showDrill = drill && !results;

  // Ligne sous-dossier (dans le drill) : la MÊME rangée que la planche
  // « Inbox / Folder » (44px, nom seul, stats en tooltip). `added` = variante
  // « New » : le sous-dossier est déjà au dossier - 50 % + badge « Ajouté ».
  const folderRow = (sf, { added = false } = {}) => {
    const st = folderStats(sf.id);
    return (
      <div
        key={sf.id} role="button" tabIndex={0}
        onClick={() => setDrill(sf.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDrill(sf.id); } }}
        className="flex items-center gap-2 p-3 bg-white cursor-pointer transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = V2.accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
        title={`Ouvrir le sous-dossier · ${st.threads} échanges · ≈ ${st.pieces} pièces`}
      >
        <ChevronRight className={`w-3 h-3 flex-shrink-0 ${added ? 'opacity-50' : ''}`} strokeWidth={2} style={{ color: V2.muted }} />
        <FolderOpen className={`w-4 h-4 flex-shrink-0 ${added ? 'opacity-50' : ''}`} strokeWidth={1.33} style={{ color: V2.folder }} />
        <p className={`flex-1 min-w-0 text-[14px] leading-5 font-medium truncate ${added ? 'opacity-50' : ''}`} style={{ color: V2.foreground }}>{sf.name}</p>
        {added && <Badge tone="success">Ajouté</Badge>}
      </div>
    );
  };

  // Vue « dossier ouvert » : fil d'Ariane, geste en bloc, sous-dossiers, échanges.
  // Pour un dossier déjà versé au dossier, le neuf est isolé en tête.
  const drillView = () => {
    const m = folderModel(drill);
    if (!m) return null;
    const subs = childFolderModels(drill);
    const st = folderStats(drill);
    const delta = folderDelta(drill);
    const isAdded = addedFolderIds.has(drill);
    const deltaDone = folderDeltaAdded(drill);
    const newTids = delta ? [...delta.newTids] : [];
    const existingTids = (m.tids || []).filter(t => !delta || !delta.newTids.has(t));
    const newPjByTid = {};
    if (delta) delta.newPjKeys.forEach(k => { const tid = k.split('::')[0]; const name = k.slice(tid.length + 2); (newPjByTid[tid] = newPjByTid[tid] || []).push(name); });

    // Variante « New » = drill d'un dossier déjà versé qui a du neuf ; sinon
    // variante « Drill Down » (planche MailColumn 3377-47379).
    const isNewState = !!delta && delta.newCount > 0 && !deltaDone;
    const hasNewContent = delta && (newTids.length > 0 || Object.keys(newPjByTid).length > 0);
    const statsTitle = `${st.threads} échanges · ≈ ${st.pieces} pièces${st.folders > 0 ? ` · ${st.folders} sous-dossiers` : ''}`;

    // Le CTA pleine largeur sous le fil d'Ariane : le geste en bloc du dossier.
    const wideBtn = (variant, label, Icon, onClick, title) => (
      <div className="px-3.5 py-2">
        <button
          type="button"
          onClick={onClick}
          className="w-full h-9 rounded-lg flex items-center justify-center gap-2 text-[14px] leading-5 font-medium transition-opacity hover:opacity-90"
          style={variant === 'primary'
            ? { backgroundColor: V2.foreground, color: '#ffffff', boxShadow: '0 1px 1px rgba(26,26,26,0.05)' }
            : variant === 'destructive'
              ? { backgroundColor: V2.destructiveSubtle, color: V2.destructiveText }
              : { backgroundColor: V2.secondary, color: V2.secondaryText }}
          title={title}
        >
          {label}
          {Icon && <Icon className="w-4 h-4" strokeWidth={1.75} />}
        </button>
      </div>
    );

    return (
      <div className="flex flex-col gap-2">
        {/* La localisation vit dans l'en-tête du panneau (barre du dossier) -
            rien à répéter ici, la liste commence au geste. */}

        {isNewState ? (
          <>
            {/* ── Variante « New » : NOUVEAU (indigo) → CTA sombre → cartes new,
                puis DOSSIERS (déjà ajoutés) et DÉJÀ AU DOSSIER. ── */}
            <section>
              <p style={{ ...monoLabel, color: V2.indigo }} className="px-3.5 py-2" title={`Depuis l'ajout du ${delta.addedOn}`}>Nouveau</p>
              {wideBtn('primary', `+ Ajouter les nouvelles pièces`, null, () => onAddFolderDelta(drill), `Ajouter les ${delta.newCount} nouvelles pièces au bordereau`)}
              {hasNewContent && (
                <Rows>
                  {newTids.map(t => card(t))}
                  {Object.entries(newPjByTid).map(([tid, names]) => {
                    // Feedback : la ligne dit si sa (ses) PJ sont déjà au bordereau.
                    const added = names.every(n => lineKeys.has(pjKey(tid, n)));
                    return (
                      <div
                        key={tid}
                        className="flex items-start gap-2 p-3 bg-white"
                        style={added ? undefined : { borderLeft: `3px solid ${V2.indigo}`, paddingLeft: 9 }}
                      >
                        <Paperclip className={`w-4 h-4 mt-[2px] flex-shrink-0 ${added ? 'opacity-50' : ''}`} strokeWidth={1.33} style={{ color: V2.pj }} />
                        <div className={`flex-1 min-w-0 ${added ? 'opacity-50' : ''}`}>
                          <p className="text-[14px] leading-5 font-medium truncate" style={{ color: V2.foreground }}>{threadViewById(tid)?.subject}</p>
                          <p className="text-[12px] leading-4 truncate mt-0.5" style={{ color: V2.muted }}>{names.length} nouvelle{names.length > 1 ? 's' : ''} PJ : {names.join(', ')}</p>
                        </div>
                        <div className="flex-shrink-0 pt-0.5">
                          {added
                            ? <span className="inline-flex items-center gap-1.5"><Badge tone="success">Ajouté</Badge><SmallBtn variant="destructive-subtle" icon={X} onClick={() => onRemoveThread(tid)} title="Retirer du bordereau">Retirer</SmallBtn></span>
                            : <span className="inline-flex items-center gap-1.5"><Badge tone="indigo">Nouveau</Badge><SmallBtn variant="primary" icon={Plus} onClick={() => names.forEach(n => onAddPiece(tid, pjKey(tid, n)))} title="Ajouter ces nouvelles PJ au bordereau">Ajouter</SmallBtn></span>}
                        </div>
                      </div>
                    );
                  })}
                </Rows>
              )}
            </section>
            {subs.length > 0 && (
              <section>
                <p style={monoLabel} className="px-3.5 py-2">Dossiers</p>
                <Rows>{subs.map(sf => folderRow(sf, { added: true }))}</Rows>
              </section>
            )}
            {existingTids.length > 0 && (
              <section>
                <p style={monoLabel} className="px-3.5 py-2" title={`Instantané du ${delta.addedOn}`}>Déjà au dossier</p>
                <Rows>{existingTids.map(t => <ReadonlyThreadRow key={t} tid={t} />)}</Rows>
              </section>
            )}
          </>
        ) : (
          <>
            {/* ── Variante « Drill Down » : CTA « Ajouter tout le dossier → »,
                puis DOSSIERS et ÉCHANGES DU DOSSIER. ── */}
            {m.linkedTo ? (
              <div className="px-3.5 py-2">
                <div className="w-full h-9 rounded-lg flex items-center justify-center gap-2 text-[14px] leading-5 font-medium" style={{ backgroundColor: V2.secondary, color: V2.secondaryText, opacity: 0.6 }} title={`Ce dossier Outlook alimente déjà « ${m.linkedTo} » - il ne se verse pas deux fois`}>
                  Déjà lié à {m.linkedTo}
                </div>
              </div>
            ) : isAdded ? (
              wideBtn('destructive', 'Retirer le dossier du bordereau', X, () => onRemoveFolder(drill), 'Le bloc et ses pièces quittent le bordereau')
            ) : deltaDone ? (
              wideBtn('destructive', 'Retirer le complément', X, () => { newTids.forEach(t => onRemoveThread(t)); Object.keys(newPjByTid).forEach(t => onRemoveThread(t)); }, 'Retirer les nouvelles pièces du bordereau')
            ) : (
              wideBtn('secondary', 'Ajouter tout le dossier', ArrowRight, () => onAddFolder(drill), `Ajouter le dossier en entier, sous-dossiers compris · ${statsTitle}`)
            )}
            {subs.length > 0 && (
              <section>
                <p style={monoLabel} className="px-3.5 py-2">Dossiers</p>
                <Rows>{subs.map(sf => folderRow(sf))}</Rows>
              </section>
            )}
            <section>
              <p style={monoLabel} className="px-3.5 py-2">Échanges du dossier</p>
              {(delta ? existingTids : (m.tids || [])).length > 0 ? (
                <Rows>
                  {delta
                    ? existingTids.map(t => <ReadonlyThreadRow key={t} tid={t} />)
                    : (m.tids || []).map(t => card(t))}
                </Rows>
              ) : (
                <p className="text-[12px] text-foreground-secondary px-3.5 py-3">Aucun échange directement dans ce dossier.</p>
              )}
            </section>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-[456px] h-full flex flex-col">
      {/* Structure finale (Meg) : [1] EN-TÊTE D'IDENTITÉ fixe - petit logo
          Outlook + « Importez depuis vos emails » + Réduire. Il dit ce que le
          panneau EST, jamais où on se trouve. */}
      <div className="px-3.5 pt-4 pb-2 flex items-center gap-3 flex-shrink-0">
        <img src={outlookLogo} alt="" className="flex-shrink-0" style={{ width: 22, height: 22 }} />
        <p className="flex-1 min-w-0 text-[13px] leading-5 font-medium truncate" style={{ color: V2.foreground }}>Importez depuis vos emails</p>
        <button
          type="button"
          onClick={onCollapse}
          className="inline-flex items-center gap-1.5 h-[26px] px-2 -mr-2 rounded text-[12px] font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors flex-shrink-0"
          title="Réduire le panneau email"
        >
          <ListCollapse className="w-3.5 h-3.5" strokeWidth={1.75} /> Réduire
        </button>
      </div>

      {/* [2] La RECHERCHE - immobile, GLOBALE (jamais bornée au dossier
          ouvert) : placeholder fixe, ✕ = clear simple qui rend le dossier
          ouvert tel quel (le drill survit à la recherche). */}
      <div className="px-3.5 pb-1 flex-shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un dossier ou un échange…"
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-white text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-border-strong"
          />
          {query !== '' && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-cream transition-colors"
              title="Effacer la recherche"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* [3] L'EN-TÊTE CONTEXTUEL - uniquement en drill (barre du dossier :
          retour + titre + chemin). À la racine, rien (Meg a retiré le bloc
          « Vos boîtes / adresses » - les adresses restent dans les tooltips
          et les settings) ; pendant une recherche, rien non plus (Meg :
          « si recherche enlève cette partie »). */}
      {!results && drill && (
        /* Planche MonoHeader 3557:4893 : bouton retour OUTLINE 36×36 (blanc,
           bordé, arrondi 10) + à droite le fil d'Ariane 12 muet « Inbox /
           parent » (séparateur /) sur le titre FolderOpen + nom 14 medium. */
        <div className="px-3.5 pt-1 pb-3 flex items-center gap-3 flex-shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => setDrill(drillParent ? drillParent.id : null)}
            className="w-9 h-9 rounded-[10px] border border-border bg-white flex items-center justify-center hover:bg-cream transition-colors flex-shrink-0"
            style={{ boxShadow: '0 1px 1px rgba(26,26,26,0.05)' }}
            title={drillParent ? `Revenir à « ${drillParent.name} »` : 'Revenir à la boîte de réception'}
            aria-label={drillParent ? `Revenir à « ${drillParent.name} »` : 'Revenir à la boîte de réception'}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} style={{ color: V2.foreground }} />
          </button>
          <div className="min-w-0 flex flex-col gap-1">
            <p className="text-[12px] leading-4 truncate" style={{ color: V2.muted, letterSpacing: 0.12 }}>
              <button type="button" onClick={() => setDrill(null)} className="hover:underline" title="Revenir à la boîte de réception">Inbox</button>
              {drillChain.slice(0, -1).map(f => (
                <React.Fragment key={f.id}>
                  {' / '}
                  <button type="button" onClick={() => setDrill(f.id)} className="hover:underline" title={`Revenir à « ${f.name} »`}>{f.name}</button>
                </React.Fragment>
              ))}
            </p>
            <div className="flex items-center gap-1.5 min-w-0">
              <FolderOpen className="w-4 h-4 flex-shrink-0" strokeWidth={1.33} style={{ color: V2.folder }} />
              <p className="text-[14px] leading-5 font-medium truncate" style={{ color: V2.foreground }}>{drillChain[drillChain.length - 1]?.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto pb-3 flex flex-col gap-3">
        {showDrill && drillView()}

        {!showDrill && !results && (
          <section>
            <p style={monoLabel} className="mb-1 px-3.5" title={`Dossiers de la ${MAILBOXES.shared.label.toLowerCase()} · ${MAILBOXES.shared.address}`}>Dossiers Outlook</p>
            <Rows>
              {FOLDER_CANDIDATE_IDS.map(fid => (
                <FolderCandidateCard
                  key={fid} fid={fid}
                  added={addedFolderIds.has(fid)}
                  deltaAdded={folderDeltaAdded(fid)}
                  onAddFolder={onAddFolder} onAddFolderDelta={onAddFolderDelta}
                  onRemoveFolder={onRemoveFolder} onEnter={setDrill}
                />
              ))}
            </Rows>
          </section>
        )}
        {!showDrill && !results && HARVEST_GROUPS.map(g => (
          <section key={g.id}>
            <p style={monoLabel} className="mb-1 px-3.5">{g.label}</p>
            <Rows>
              {g.candidates.map(c => card(c.tid, { evidence: c.evidence }))}
            </Rows>
          </section>
        ))}

        {/* Résultats globaux, que la recherche parte de la racine ou d'un
            dossier ouvert - pas de bandeau (Meg : « plutôt un clear search
            simple ») : le ✕ du champ efface et rend le dossier tel quel. */}
        {!showDrill && results && (
          <>
            {results.proposed.length > 0 && (
              <section>
                <p style={monoLabel} className="mb-1 px-3.5">Dans les propositions</p>
                <Rows>
                  {results.proposed.map(tid => { const c = evidenceOf(tid); return card(tid, { evidence: c?.evidence, mailboxNote: mailboxOf(tid) === 'both' ? 'aussi dans votre boîte' : undefined }); })}
                </Rows>
              </section>
            )}
            {/* Sections étiquetées par boîte (spec) : boîtes cabinet d'abord,
                puis les boîtes personnelles du user courant - jamais celles
                d'un autre membre. */}
            {results.cabinet.length > 0 && (
              <section>
                <p style={monoLabel} className="mb-1 px-3.5">{MAILBOXES.shared.label} · {MAILBOXES.shared.address}</p>
                <Rows>
                  {results.cabinet.map(tid => card(tid, { mailboxNote: mailboxOf(tid) === 'both' ? 'aussi dans votre boîte' : undefined }))}
                </Rows>
              </section>
            )}
            {results.personal.length > 0 && (
              <section>
                <p style={monoLabel} className="mb-1 px-3.5">{MAILBOXES.personal.label} · {MAILBOXES.personal.address}</p>
                <Rows>
                  {results.personal.map(tid => card(tid))}
                </Rows>
              </section>
            )}
            {results.proposed.length === 0 && results.cabinet.length === 0 && results.personal.length === 0 && (
              <p className="text-[13px] text-foreground-secondary px-3.5 py-6 text-center">Aucun échange ne correspond à « {query.trim()} » dans vos boîtes.</p>
            )}
          </>
        )}
      </div>

    </div>
  );
}
