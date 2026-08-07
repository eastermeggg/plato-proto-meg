import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, FolderPlus, Mail, RotateCcw, X } from 'lucide-react';
import { Droppable, monoLabel } from './import/atoms';
import HarvestColumn, { CandidateCard, FolderCandidateCard } from './import-v2/HarvestColumn';
import Bordereau, { Line, FolderBloc, GroupChapeau } from './import-v2/Bordereau';
import { useBordereau } from './import-v2/useBordereau';
import { threadImportInfo, detectionFor } from './import/labData';
import { folderModel, folderStats, folderBreadcrumbV2, buildFolderTree } from './import-v2/harvestData';
import { Badge } from './import-v2/pieceRow';

// « Import email - V2 Récolte & Bordereau ». La relecture du même problème
// (gestes C / C bis / B, douleurs identifiées) avec le cadrage inversé : le
// système RASSEMBLE (récolte proposée, avec preuves), l'avocat DÉCIDE
// (bordereau de pièces). Plus d'arbre Outlook à parcourir, plus de modale
// dense : une page, deux colonnes, un artefact natif du métier.

const PAINS = [
  { pain: 'Chasse dans Outlook', fix: 'Norma propose une récolte pour le dossier, chaque candidat avec sa preuve. La recherche manuelle reste là, en second.' },
  { pain: 'Décider vite', fix: 'L\'aperçu s\'ouvre EN PLACE d\'un clic (corps + PJ, résumés) - plus de carte au survol chronométrée.' },
  { pain: 'Étape de validation', fix: 'Transvasement conservé : un geste = la pièce est au bordereau. Décocher estompe, rien ne disparaît.' },
  { pain: 'Doublons silencieux', fix: 'Le doublon est une LIGNE du bordereau, avec ses actions : Ne pas ajouter / Remplacer. Le versement attend la décision.' },
  { pain: 'Dossier + fil en double', fix: 'Le dossier Outlook reste le geste en bloc (« Ajouter en entier ») ; l\'ajouter ABSORBE les échanges déjà pris et les cartes couvertes le disent - jamais deux fois la même pièce.' },
  { pain: 'Pièces méconnaissables', fix: 'Le bordereau garde le NOM D\'ORIGINE de chaque document (jamais renommé), groupé sous son échange - l\'avocat retrouve ses fichiers tels qu\'il les connaît.' },
  { pain: 'Découpe ambiguë', fix: 'Suggestion contextuelle par PJ (« Contient N documents ») qui liste les pièces produites - plus de bascule globale à trois états.' },
  { pain: 'Vocabulaire', fix: 'Les verbes verrouillés tiennent : Ajouter · Retirer · Découper. La confirmation reste un toast, jamais un écran.' },
  { pain: 'Plusieurs boîtes', fix: 'La recherche agrège les canaux du user courant - boîte cabinet + sa boîte personnelle - en sections étiquetées. Un fil reçu deux fois = un résultat, une pièce, double provenance.' },
  { pain: 'Boîte privée, dossier partagé', fix: 'Votre boîte n\'apparaît qu\'à vous ; le seul pont vers le cabinet est le geste de verser. Signal discret, une fois, au premier versement depuis votre boîte.' },
];

// ── Galerie de composants (bas de page) ─────────────────────────────────────
// Chaque état est le VRAI composant, monté avec des props figées - pas de
// capture, pas de copie : la galerie ne peut pas dériver du produit.

const noop = () => {};
const NOOP_API = {
  toggleIncluded: noop, toggleDecoupe: noop, acceptSuggestion: noop, dismissSuggestion: noop,
  resolveDoublon: noop, retryLine: noop, removeThread: noop, removeFolder: noop,
  toggleFolderNode: noop, toggleFolderDecoupe: noop, setFolderDecoupeMany: noop,
  folderDecoupe: new Set(),
};

let demoSeq = 0;
const dl = (o) => ({
  id: `demo-l-${demoSeq++}`, key: `demo-k-${demoSeq}`, threadId: null, kind: 'pj',
  title: '', provenance: '', included: true, nodeId: 'sans-categorie', suggestedNodeId: null,
  decoupable: false, detection: null, decoupe: false, status: 'ready',
  doublonStatus: null, doublon: null, tag: null, ...o,
});

const EXPERTISE_DELTA_KEYS = new Set((threadImportInfo('th-expertise')?.delta || []).map(d => d.key));
const DEMO_FOLDER = (() => {
  const m = folderModel('fd-leblanc');
  return { fid: 'fd-leblanc', name: m.name, path: folderBreadcrumbV2('fd-leblanc'), stats: folderStats('fd-leblanc'), tree: buildFolderTree('fd-leblanc') };
})();
const DOUBLON_NOTE = { note: 'Semble identique à « Certificat de prolongation d\'arrêt de travail - Dr Lefèvre » versée le 2 juil.' };

function Spec({ label, note, children }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="rounded-lg p-3 flex-1" style={{ backgroundColor: '#f8f7f5', border: '1px solid #e7e5e3' }}>
        {children}
      </div>
      <p style={monoLabel}>{label}</p>
      {note && <p className="text-[11px] text-foreground-secondary leading-4">{note}</p>}
    </div>
  );
}

function SpecLine({ label, note, line }) {
  return (
    <Spec label={label} note={note}>
      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <Line line={line} api={NOOP_API} />
      </div>
    </Spec>
  );
}

function GallerySection({ title, intro, cols = 2, children }) {
  return (
    <div className="mt-8">
      <p style={monoLabel} className="mb-1">{title}</p>
      {intro && <p className="text-[12px] text-foreground-secondary mb-3 max-w-[760px]">{intro}</p>}
      <div className={`grid gap-4 ${cols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {children}
      </div>
    </div>
  );
}

function ComponentGallery() {
  const cardProps = { onAddThread: noop, onTogglePiece: noop, onAddThreadDelta: noop, onRemoveThread: noop };
  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-[16px] font-semibold text-foreground mb-1">Composants & états - le détail</h2>
      <p className="text-[13px] text-foreground-secondary max-w-[820px] leading-relaxed">
        Chaque spécimen ci-dessous est le composant réel monté dans un état figé (cliquer déplie les cartes,
        les actions sont neutralisées). La démo au-dessus reste la référence des enchaînements.
      </p>

      <GallerySection title="Carte échange - récolte" cols={3}
        intro="L'unité de la récolte. Sa preuve (ligne étoilée) dit pourquoi Norma la propose ; son contrôle de droite dit exactement où elle en est.">
        <Spec label="Disponible" note="Un clic sur Ajouter = tout l'échange (corps + PJ) entre au bordereau. Cliquer la carte déplie l'aperçu en place.">
          <CandidateCard tid="th-mutuelle" evidence="L'objet mentionne la prise en charge n°2024-1147 du dossier" demoInfo={null} {...cardProps} />
        </Spec>
        <Spec label="Ajouté" note="Estompée, badge « Ajouté » ; le survol du badge le retourne en « Retirer » - seul inverseur.">
          <CandidateCard tid="th-mutuelle" evidence="L'objet mentionne la prise en charge n°2024-1147 du dossier" demoInfo={null} taken={new Set(['a', 'b', 'c'])} {...cardProps} />
        </Spec>
        <Spec label="Partiel" note="Une partie des pièces est au bordereau (chip n/N) ; « Tout ajouter » complète le reste.">
          <CandidateCard tid="th-mutuelle" evidence="L'objet mentionne la prise en charge n°2024-1147 du dossier" demoInfo={null} taken={new Set(['a'])} {...cardProps} />
        </Spec>
        <Spec label="Inclus via le dossier" note="Couverte par un bloc dossier ajouté : désarmée, la curation fine vit dans le bloc du bordereau.">
          <CandidateCard tid="th-mutuelle" evidence="L'objet mentionne la prise en charge n°2024-1147 du dossier" demoInfo={null} covered {...cardProps} />
        </Spec>
        <Spec label="Objet illisible" note="Quand l'objet du mail est illisible (ex. « SCAN_0034 »), le titre affiché est un résumé du contenu (en italique) + un marqueur « Objet illisible » ; l'objet d'origine reste lisible au survol. L'avocat sait que ce n'est pas l'objet réel.">
          <CandidateCard tid="th-scan" evidence="Même expéditeur que le certificat du 28/01 · objet illisible, résumé affiché" demoInfo={null} {...cardProps} />
        </Spec>
        <Spec label="Déjà importé · à jour" note="Le dossier a un instantané de ce fil et rien n'a bougé depuis : constat inerte, aucun geste à faire.">
          <CandidateCard tid="th-arret" evidence="Expéditeur connu du dossier · 2 échanges déjà importés depuis cette adresse" demoInfo={{ importedOn: '2 juil.', delta: [], inSet: new Set() }} {...cardProps} />
        </Spec>
        <Spec label="Déjà importé · a grossi" note="Le fil a gagné des pièces depuis l'import : état ambre + le bouton ne prend QUE le delta. Déplier montre l'état pièce par pièce.">
          <CandidateCard tid="th-expertise" evidence="Fil de l'expertise Dr Martin - le dossier en a un instantané du 2 juil." {...cardProps} />
        </Spec>
        <Spec label="Complément ajouté" note="Le delta est au bordereau ; le badge retire le complément entier.">
          <CandidateCard tid="th-expertise" evidence="Fil de l'expertise Dr Martin - le dossier en a un instantané du 2 juil." taken={EXPERTISE_DELTA_KEYS} {...cardProps} />
        </Spec>
      </GallerySection>

      <GallerySection title="Carte dossier Outlook - récolte" cols={3}
        intro="Le geste en bloc : « Ajouter en entier » verse le dossier, sous-dossiers compris. La carte s'ouvre au clic (drill : entrer dans le dossier). Jamais masquée quand elle est indisponible - désarmée, avec la raison.">
        <Spec label="Disponible" note="Stats profondes annoncées = ce que le commit versera, jamais moins. Le chevron ouvre le dossier.">
          <FolderCandidateCard fid="fd-leblanc" onAddFolder={noop} onRemoveFolder={noop} />
        </Spec>
        <Spec label="Ajouté en entier" note="Le bloc vit maintenant au bordereau ; le badge retire tout.">
          <FolderCandidateCard fid="fd-leblanc" added onAddFolder={noop} onRemoveFolder={noop} />
        </Spec>
        <Spec label="Déjà au dossier · a du neuf" note="Dossier déjà versé qui a grossi : accent ambre + « Ajouter les N nouvelles » (delta seul). Ouvrir montre ce qui est nouveau.">
          <FolderCandidateCard fid="fd-axa-corr" onAddFolder={noop} onAddFolderDelta={noop} onRemoveFolder={noop} />
        </Spec>
        <Spec label="Déjà lié à un autre dossier" note="Cas limite §9 : un dossier Outlook qui alimente déjà une autre affaire ne se verse pas deux fois.">
          <FolderCandidateCard fid="fd-moreau" onAddFolder={noop} onRemoveFolder={noop} />
        </Spec>
      </GallerySection>

      <GallerySection title="Groupe échange - bordereau" cols={2}
        intro="Ce qui vient du même échange reste ensemble : un chapeau (sujet · expéditeur · date, dits une fois) et ses pièces liées dessous. « Retirer » agit sur l'échange entier.">
        <Spec label="Chapeau standard">
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            <GroupChapeau
              title="Transmission des pièces justificatives - CPAM"
              onRemove={noop}
            />
            <Line line={dl({ kind: 'body', title: 'Corps du mail', provenance: '2 messages', suggestedNodeId: 'correspondance' })} api={NOOP_API} />
          </div>
        </Spec>
        <Spec label="Chapeau complément" note="Fil déjà importé complété : le chapeau porte le tag ambre, les lignes disent « nouvelle » / « actualisé ».">
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            <GroupChapeau
              title="Compte rendu d'expertise médicale du 04/03/2025"
              tag={<span className="inline-flex items-center h-4 px-1.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#f6ead9', color: '#8a5a2a' }}>Complément de l'import du 2 juil.</span>}
              onRemove={noop}
            />
            <Line line={dl({ kind: 'body', title: 'Corps du mail', provenance: 'version actualisée · +2 nouveaux messages', tag: 'actualisé', suggestedNodeId: 'correspondance' })} api={NOOP_API} />
          </div>
        </Spec>
      </GallerySection>

      <GallerySection title="Multi-boîtes - provenance et privacy" cols={3}
        intro="Le picker agrège les canaux du user courant : boîtes du cabinet + ses boîtes personnelles, en sections étiquetées. La boîte est privée, le DOSSIER est le lieu du partage - la provenance le dit sans dramatiser.">
        <Spec label="Reçu deux fois - dédoublonné" note="Le même fil dans la boîte cabinet ET votre boîte (dédup par conversationId) : un seul résultat, la note méta dit la seconde boîte. Chercher « greffe » dans la démo.">
          <CandidateCard tid="th-greffe" demoInfo={null} mailboxNote="aussi dans votre boîte" {...cardProps} />
        </Spec>
        <Spec label="Chapeau - depuis votre boîte" note="Pièce versée depuis une boîte personnelle : le chip porte le signal d'exposition - visible par le cabinet une fois dans le dossier. Un toast le dit aussi, une seule fois, au premier versement.">
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            <GroupChapeau title="Compte rendu d'imagerie - Centre Imagerie Sud" tag={<Badge tone="secondary" title="Versé depuis votre boîte - visible par le cabinet une fois dans le dossier.">Depuis votre boîte</Badge>} onRemove={noop} />
            <Line line={dl({ kind: 'body', title: 'Corps du mail', provenance: '1 message' })} api={NOOP_API} />
          </div>
        </Spec>
        <Spec label="Chapeau - reçu dans deux boîtes" note="Fil dédoublonné au bordereau : une seule pièce versée, la double provenance reste dite.">
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            <GroupChapeau title="Notification d'audience - TJ Paris" tag={<Badge tone="secondary" title="Reçu par la boîte cabinet et dans votre boîte - dédoublonné : une seule pièce.">Aussi dans votre boîte</Badge>} onRemove={noop} />
            <Line line={dl({ kind: 'body', title: 'Corps du mail', provenance: '2 messages' })} api={NOOP_API} />
          </div>
        </Spec>
      </GallerySection>

      <GallerySection title="Ligne de pièce - bordereau" cols={3}
        intro="Une ligne = une pièce, sous son NOM D'ORIGINE (jamais renommée). Décocher estompe (rien ne disparaît) ; tout ce qui doit être su est une ligne : le doublon, l'échec, la découpe.">
        <SpecLine label="Standard"
          note="Le titre est le nom de fichier d'origine, seul repère - ni pagination ni catégorie sous la ligne."
          line={dl({ title: 'Releve_indemnites_journalieres.pdf', provenance: '', decoupable: true })} />
        <SpecLine label="Corps du mail"
          note="Le corps de l'échange est une pièce comme une autre."
          line={dl({ kind: 'body', title: 'Corps du mail', provenance: '2 messages' })} />
        <SpecLine label="Écartée"
          note="Estompée à 45 % - re-cocher la fait revenir, elle n'a jamais disparu."
          line={dl({ title: 'Tableau_garanties_contrat.pdf', provenance: '', included: false })} />
        <SpecLine label="Découpe détectée - proposée"
          note="La détection propose, l'utilisateur dispose : le chip annonce le compte exact."
          line={dl({ title: 'Decompte_prestations_2024.pdf', provenance: '', decoupable: true, detection: detectionFor('Decompte_prestations_2024.pdf') })} />
        <SpecLine label="Découpe active"
          note="Le fichier devient un chapeau ; les pièces produites sont de vraies lignes du bordereau, indentées."
          line={dl({ title: 'Decompte_prestations_2024.pdf', provenance: '', decoupable: true, detection: detectionFor('Decompte_prestations_2024.pdf'), decoupe: true })} />
        <SpecLine label="Découpe manuelle"
          note="Sans détection, tout PDF/doc reste découpable (verrou V1) - le contenu se définira à l'aperçu."
          line={dl({ title: 'constat_amiable.pdf', provenance: 'Déposé depuis l\'ordinateur', kind: 'file', decoupable: true, decoupe: true })} />
        <SpecLine label="Doublon à trancher"
          note="Le doublon est une ligne, jamais silencieux ; le versement attend la décision (CTA bloqué)."
          line={dl({ title: 'Certificat_prolongation_arret.pdf', provenance: '', doublon: DOUBLON_NOTE, doublonStatus: 'pending' })} />
        <SpecLine label="Doublon - gardée"
          note="« Garder les deux » : la pièce entre, celle du dossier reste - dit en chip."
          line={dl({ title: 'Certificat_prolongation_arret.pdf', provenance: '', doublon: DOUBLON_NOTE, doublonStatus: 'kept' })} />
        <SpecLine label="Doublon - supprimée"
          note="Écartée, avec la raison ; la pièce du dossier reste intouchée."
          line={dl({ title: 'Certificat_prolongation_arret.pdf', provenance: '', doublon: DOUBLON_NOTE, doublonStatus: 'ignored', included: false })} />
        <SpecLine label="Complément - nouvelle"
          note="PJ arrivée depuis l'instantané : tag ambre (le bleu « Nouveau » reste réservé à la sync P2)."
          line={dl({ title: 'Annexes_imagerie.pdf', provenance: '', tag: 'nouvelle' })} />
        <SpecLine label="Téléversement"
          note="Le fichier arrive ; le CTA global passe en « Réception des fichiers… » tant que ça charge."
          line={dl({ title: 'releve_frais_2025.pdf', kind: 'file', provenance: '', status: 'uploading' })} />
        <SpecLine label="Échec de téléversement"
          note="Un échec est une ligne avec action - pas un toast qui disparaît, rien n'est entré."
          line={dl({ title: 'Devis_reparation.docx', kind: 'file', provenance: '', status: 'error' })} />
      </GallerySection>

      <GallerySection title="Bloc dossier - bordereau" cols={1}
        intro="Un dossier pris en entier n'explose pas en N lignes : un bloc compact, dépliable vers l'arbre à cases. Tri-state par nœud (dossier / sous-dossier / échange / pièce), découpe par PJ au survol, « Tout découper » par niveau. Déplier ci-dessous pour voir l'arbre.">
        <FolderBloc folder={DEMO_FOLDER} api={NOOP_API} detectionFor={detectionFor} />
      </GallerySection>

      <GallerySection title="Pied du bordereau - états du CTA" cols={3}
        intro="Le CTA ne ment jamais : il dit pourquoi il attend.">
        <Spec label="Prêt" note="Récap honnête : découpes développées, remplacements comptés.">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-foreground-secondary">≈ 21 pièces · 1 découpe</p>
            <span className="h-8 px-4 rounded-lg text-[13px] font-medium text-white inline-flex items-center" style={{ backgroundColor: '#292524' }}>Ajouter au dossier</span>
          </div>
        </Spec>
        <Spec label="Doublon à trancher" note="Jamais de versement avec une question ouverte.">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] leading-4" style={{ color: '#8a5a2a' }}>1 doublon à trancher avant d'ajouter</p>
            <span className="h-8 px-4 rounded-lg text-[13px] font-medium text-white inline-flex items-center opacity-40" style={{ backgroundColor: '#292524' }}>Ajouter au dossier</span>
          </div>
        </Spec>
        <Spec label="Réception en cours" note="Verrou V1 : on ne verse pas des fichiers qui ne sont pas encore là.">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-foreground-secondary">≈ 3 pièces</p>
            <span className="h-8 px-4 rounded-lg text-[13px] font-medium text-white inline-flex items-center opacity-40" style={{ backgroundColor: '#292524' }}>Réception des fichiers…</span>
          </div>
        </Spec>
      </GallerySection>
    </div>
  );
}

// Les 3 pistes répondent au même feedback : « pas évident que ce petit bouton
// ramène au top-level ». Chacune donne au retour une place STRUCTURELLE au
// lieu d'un pictogramme.
// ── En-tête de la modale en mode « création » ───────────────────────────────
// La référence (= nom du dossier) doit se lire d'un coup. Quatre partis pris
// commutables : le champ EST le titre, l'eyebrow au-dessus, le champ étiqueté
// et séparé, ou un bandeau teinté qui isole le contexte création.
const HEADER_VARIANTS = [
  { id: 'title', label: 'A · Titre éditable', desc: 'La référence EST le titre de la modale - saisie inline, sans boîte (pattern Notion/Linear). Le contexte « nouveau dossier » est porté par le pictogramme et le CTA « Créer ».' },
  { id: 'stacked', label: 'B · Eyebrow + champ', desc: 'Surtitre « Nouveau dossier » discret, la référence en gros dessous. Hiérarchie limpide, en-tête un peu plus haut.' },
  { id: 'field', label: 'C · Champ étiqueté', desc: 'Le libellé de mode et le champ sont séparés par un filet ; le champ porte son étiquette « Référence ». Le plus explicite, très « formulaire ».' },
  { id: 'band', label: 'D · Bandeau teinté', desc: 'Un bandeau crème isole le contexte création ; le champ blanc y ressort franchement (corrige le « on voit pas »).' },
];

function CloseBtn({ onClose }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-background transition-colors flex-shrink-0"
      aria-label="Fermer"
      title="Fermer (réinitialise le lab)"
    >
      <X className="w-3.5 h-3.5" strokeWidth={2} />
    </button>
  );
}

function CreationHeader({ variant, reference, setReference, onClose }) {
  const bind = {
    id: 'dossier-ref',
    value: reference,
    onChange: (e) => setReference(e.target.value),
    autoFocus: true,
  };

  if (variant === 'stacked') {
    return (
      <div className="flex items-center gap-3 pl-5 pr-4 border-b border-border flex-shrink-0 bg-white" style={{ height: 76 }}>
        <FolderPlus className="w-[18px] h-[18px] text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <label htmlFor="dossier-ref" className="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted leading-4">Nouveau dossier</label>
          <input
            {...bind}
            placeholder="Référence - ex. Leblanc c/ AXA"
            className="w-full bg-transparent text-[16px] font-semibold text-foreground placeholder:text-foreground-muted placeholder:font-normal focus:outline-none leading-6"
          />
        </div>
        <CloseBtn onClose={onClose} />
      </div>
    );
  }

  if (variant === 'field') {
    // Branded : titre en serif Georgia comme la vraie modale (GesteCModal),
    // filet, puis le champ « Référence » qui s'ouvre déjà focalisé - anneau
    // couleur brand (#b9703f) pour dire « c'est ici qu'on écrit ».
    return (
      <div className="flex items-center gap-3 pl-5 pr-4 border-b border-border flex-shrink-0 bg-white" style={{ height: 58 }}>
        <h2 className="text-foreground flex-shrink-0" style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: '20px', letterSpacing: '-0.5px' }}>
          Nouveau dossier
        </h2>
        <div className="w-px h-5 bg-border flex-shrink-0 self-center" />
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <label htmlFor="dossier-ref" className="text-[11px] font-medium uppercase tracking-[0.06em] text-foreground-muted flex-shrink-0">Référence</label>
          <input
            {...bind}
            placeholder="ex. Leblanc c/ AXA"
            className="flex-1 min-w-0 max-w-[380px] h-9 px-3 rounded-lg border border-[#b9703f] bg-white text-[14px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(185,112,63,0.18)] transition-shadow"
          />
        </div>
        <CloseBtn onClose={onClose} />
      </div>
    );
  }

  if (variant === 'band') {
    return (
      <div className="flex items-center gap-2.5 pl-5 pr-4 border-b border-border flex-shrink-0" style={{ height: 58, backgroundColor: '#f8f7f5' }}>
        <FolderPlus className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
        <label htmlFor="dossier-ref" className="text-[14px] font-medium text-foreground flex-shrink-0">Nouveau dossier</label>
        <input
          {...bind}
          placeholder="Référence - ex. Leblanc c/ AXA"
          className="flex-1 min-w-0 max-w-[420px] h-9 px-3 rounded-lg border border-border bg-white text-[14px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-border-strong transition-colors"
        />
        <CloseBtn onClose={onClose} />
      </div>
    );
  }

  // 'title' (défaut) : la référence est le titre, saisie inline sans boîte.
  return (
    <div className="flex items-center gap-2.5 pl-5 pr-4 border-b border-border flex-shrink-0 bg-white" style={{ height: 58 }}>
      <FolderPlus className="w-[18px] h-[18px] text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
      <input
        {...bind}
        placeholder="Nommer le dossier…"
        className="flex-1 min-w-0 bg-transparent text-[15px] font-semibold text-foreground placeholder:text-foreground-muted placeholder:font-normal focus:outline-none leading-6"
      />
      <CloseBtn onClose={onClose} />
    </div>
  );
}

export default function ImportV2Lab() {
  const navigate = useNavigate();
  const api = useBordereau();
  // Panneau email repliable : le bordereau reste la scène, la boîte se
  // convoque depuis sa tête (« Ajouter depuis mes emails »).
  const [mailOpen, setMailOpen] = useState(true);

  // Deux contextes pour la MÊME modale : « ajout » verse dans un dossier qui
  // existe déjà (titre figé) ; « création » ouvre un dossier neuf, donc il faut
  // d'abord le nommer - un champ « Référence » (le nom du dossier) en tête.
  const [mode, setMode] = useState('ajout'); // 'ajout' | 'creation'
  const [reference, setReference] = useState('');
  const [headerVariant, setHeaderVariant] = useState('field'); // parti pris d'en-tête en création
  const creating = mode === 'creation';

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5200);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Signal d'exposition (spec « Connexion boîtes mail ») : la PREMIÈRE pièce
  // issue de la boîte personnelle qui entre au bordereau déclenche un signal
  // discret - une fois, pas à chaque pièce. La provenance pérenne reste sur le
  // chapeau du groupe (« Depuis votre boîte »).
  const exposureSignaled = useRef(false);
  useEffect(() => {
    if (exposureSignaled.current) return;
    if (api.lines.some(l => l.threadMailbox === 'personal')) {
      exposureSignaled.current = true;
      showToast('Versé depuis votre boîte - visible par le cabinet une fois dans le dossier.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.lines]);

  const commit = () => {
    const n = api.approx;
    const d = api.decoupeCount;
    const r = api.lines.filter(l => l.included && l.doublonStatus === 'replace').length;
    const target = creating ? (reference.trim() || 'Sans référence') : 'Leblanc c/ AXA';
    api.reset();
    if (creating) {
      const suffix = n > 0
        ? ` avec ≈ ${n} pièce${n > 1 ? 's' : ''}${d > 0 ? ` · ${d} découpe${d > 1 ? 's' : ''}` : ''}`
        : ' - vide pour l\'instant';
      setReference('');
      showToast(`Dossier « ${target} » créé${suffix}`);
      return;
    }
    showToast(`≈ ${n} pièce${n > 1 ? 's' : ''} ajoutée${n > 1 ? 's' : ''} au dossier ${target}${d > 0 ? ` · ${d} découpe${d > 1 ? 's' : ''}` : ''}${r > 0 ? ` · ${r} remplacement${r > 1 ? 's' : ''}` : ''}`);
  };

  const reset = () => { api.reset(); setReference(''); exposureSignaled.current = false; showToast('Lab réinitialisé'); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1320px] mx-auto px-8 pt-8 pb-12">
        <button
          onClick={() => navigate('/ui-kit')}
          className="flex items-center gap-1.5 text-[13px] text-foreground-secondary hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au UI Kit
        </button>

        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-[22px] font-semibold text-foreground mb-1.5">Import email - V2 « Récolte & Bordereau »</h1>
            <p className="text-[14px] text-foreground-secondary max-w-[820px] leading-relaxed">
              Le même problème que la modale d'import, repris à la racine : au lieu de faire chercher l'avocat
              dans un arbre Outlook, le système rassemble et l'avocat décide. À gauche la récolte proposée
              (avec preuves) et la recherche manuelle ; à droite le bordereau de pièces qui se construit en direct.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-white text-[12px] text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} /> Réinitialiser
          </button>
        </div>

        {/* ── Contexte de la modale : le même écran sert à VERSER dans un
            dossier existant et à EN CRÉER un neuf. La création demande d'abord
            une référence (le nom du dossier), saisie en tête de modale. ── */}
        <div className="mb-3 flex items-center gap-3 flex-wrap">
          <p style={monoLabel} className="flex-shrink-0">Contexte</p>
          <div className="inline-flex rounded-lg border border-border bg-white p-0.5 flex-shrink-0">
            {[{ id: 'ajout', label: 'Ajout de pièces' }, { id: 'creation', label: 'Nouveau dossier' }].map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => setMode(o.id)}
                className={`h-7 px-3 rounded-md text-[12px] font-medium transition-colors ${mode === o.id ? 'bg-stone-800 text-white' : 'text-foreground-secondary hover:text-foreground'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-[12px] leading-4 text-foreground-secondary min-w-0">
            {creating
              ? 'Un dossier neuf : on le nomme (référence), puis on y dépose le plus de pièces possible - chacune crée et nourrit le contexte du dossier. Seule la référence est requise.'
              : 'On verse dans un dossier qui existe déjà - son titre est figé en tête.'}
          </p>
        </div>

        {/* ── Parti pris d'en-tête (création seule) : 4 façons de faire lire la
            référence. Commutables pour trancher en direct. ────────────────── */}
        {creating && (
          <div className="mb-3 flex items-center gap-3 flex-wrap">
            <p style={monoLabel} className="flex-shrink-0">En-tête</p>
            <div className="inline-flex rounded-lg border border-border bg-white p-0.5 flex-shrink-0">
              {HEADER_VARIANTS.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setHeaderVariant(o.id)}
                  className={`h-7 px-3 rounded-md text-[12px] font-medium transition-colors ${headerVariant === o.id ? 'bg-stone-800 text-white' : 'text-foreground-secondary hover:text-foreground'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="text-[12px] leading-4 text-foreground-secondary min-w-0">{HEADER_VARIANTS.find(o => o.id === headerVariant)?.desc}</p>
          </div>
        )}

        {/* ── La démo : la MODALE de la planche (GesteCModal 58px · contenu ·
            pied 62px avec Annuler + Ajouter au dossier). ─────────────────── */}
        <div className="rounded-xl border border-border bg-white overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 560 }}>
          {creating ? (
            <CreationHeader variant={headerVariant} reference={reference} setReference={setReference} onClose={reset} />
          ) : (
            <div className="flex items-center gap-3 pl-5 pr-4 border-b border-border flex-shrink-0 bg-white" style={{ height: 58 }}>
              <p className="text-[14px] leading-5 font-medium text-foreground flex-1 min-w-0">Ajouter des pièces - Leblanc c/ AXA</p>
              <CloseBtn onClose={reset} />
            </div>
          )}
          <Droppable onFiles={api.addLocalFile} className="flex-1 min-h-0 flex">
            {/* Replié par la largeur, jamais démonté (l'état de la colonne
                survit) ; visibility:hidden le sort du focus clavier. */}
            <div
              className="flex-shrink-0 h-full overflow-hidden"
              style={{ width: mailOpen ? 456 : 0, transition: 'width 240ms ease', visibility: mailOpen ? 'visible' : 'hidden' }}
              aria-hidden={!mailOpen}
            >
              <HarvestColumn
                threadState={api.threadState}
                coveredTids={api.coveredTids}
                addedFolderIds={api.addedFolderIds}
                lineKeys={api.lineKeys}
                onAddThread={api.addThread}
                onAddPiece={api.addPiece}
                onTogglePiece={api.togglePieceIncluded}
                onAddThreadDelta={api.addThreadDelta}
                onRemoveThread={api.removeThread}
                onAddFolder={api.addFolder}
                onAddFolderDelta={api.addFolderDelta}
                onRemoveFolder={api.removeFolder}
                onCollapse={() => setMailOpen(false)}
              />
            </div>
            <Bordereau api={api} mailOpen={mailOpen} onToggleMail={() => setMailOpen(o => !o)} detectionFor={detectionFor} creating={creating} />
          </Droppable>
          {/* Pied de modale (planche « Footer ») : constat à gauche, filet,
              Annuler + CTA sombre. Le CTA ne ment jamais. */}
          <div className="flex items-center gap-4 px-5 border-t border-border flex-shrink-0 bg-white" style={{ height: 62 }}>
            <p className="text-[12px] leading-4 text-foreground-secondary flex-shrink-0">
              {api.approx > 0
                ? `≈ ${api.approx} pièce${api.approx > 1 ? 's' : ''}${api.decoupeCount > 0 ? ` · ${api.decoupeCount} découpe${api.decoupeCount > 1 ? 's' : ''}` : ''}`
                : creating ? 'Déposez des pièces pour nourrir le dossier - vous pourrez toujours en ajouter plus tard' : 'Aucune pièce sélectionnée'}
              {api.pendingDoublons > 0 && <span className="ml-2" style={{ color: '#855b31' }}>{api.pendingDoublons} doublon{api.pendingDoublons > 1 ? 's' : ''} à trancher</span>}
            </p>
            <div className="flex-1 h-px bg-border" />
            <button
              type="button"
              onClick={reset}
              className="h-9 px-4 rounded-lg border border-border bg-white text-[13px] font-medium text-foreground hover:bg-cream transition-colors flex-shrink-0"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={(creating ? reference.trim() === '' : api.approx === 0) || api.pendingDoublons > 0 || api.uploadingCount > 0}
              onClick={commit}
              className="h-9 px-4 rounded-lg text-[13px] font-medium text-white transition-opacity disabled:opacity-40 flex-shrink-0"
              style={{ backgroundColor: '#292524' }}
            >
              {api.uploadingCount > 0 ? 'Réception des fichiers…' : creating ? 'Créer le dossier' : 'Ajouter au dossier'}
            </button>
          </div>
        </div>

        {/* ── Douleur → réponse ───────────────────────────────────────────── */}
        <div className="mt-8">
          <p style={monoLabel} className="mb-3">Ce que cette V2 rejoue autrement</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PAINS.map(p => (
              <div key={p.pain} className="rounded-lg border border-border bg-white px-3.5 py-3">
                <p className="text-[12px] font-semibold text-foreground mb-1">{p.pain}</p>
                <p className="text-[12px] text-foreground-secondary leading-4.5">{p.fix}</p>
              </div>
            ))}
          </div>
        </div>

        <ComponentGallery />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] text-white shadow-lg" style={{ backgroundColor: '#292524' }}>
          <Check className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} style={{ color: '#8fc7a6' }} />
          {toast}
        </div>
      )}
    </div>
  );
}
