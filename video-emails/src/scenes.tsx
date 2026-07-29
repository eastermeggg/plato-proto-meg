import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Mail, Plus, RefreshCw} from 'lucide-react';
import {
  CANVAS,
  CREAM,
  FAINT,
  INK,
  INK2,
  LINE,
  MONO,
  MUTE,
  PAPER,
  SERIF,
  SUIVI,
  WHITE,
  softShadow,
} from './theme';
import {
  CategoryRow,
  Checkbox,
  CountBadge,
  Cursor,
  cursorXY,
  DarkButton,
  Decoupe,
  FileCard,
  FolderCard,
  FolderRow,
  HistoryRow,
  monoLabel,
  MonoChip,
  MonoHeader,
  NouveautesRow,
  OutlineButton,
  OutlookLogo,
  PieceRow,
  PJLine,
  SearchBar,
  SourceRow,
  SuivreFoot,
  Switchy,
  SyncPill,
  ThreadCard,
  ThreadRow,
} from './ui';
import {fadeInOut, rise} from './anim';

// ── coquille commune ────────────────────────────────────────────────────────

const Shell: React.FC<{
  duration: number;
  kicker?: string;
  title?: string;
  index?: string;
  children: React.ReactNode;
  background?: string;
}> = ({duration, kicker, title, index, children, background = CANVAS}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background, opacity: fadeInOut(frame, duration)}}>
      {kicker ? (
        <div
          style={{
            position: 'absolute',
            top: 54,
            left: 80,
            right: 80,
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            ...rise(frame, fps, 0),
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: MUTE,
            }}
          >
            {kicker}
          </span>
          {title ? (
            <span style={{fontSize: 30, fontWeight: 600, color: INK, letterSpacing: '-0.02em'}}>
              {title}
            </span>
          ) : null}
          {index ? (
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: MONO,
                fontSize: 14,
                color: FAINT,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {index}
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};

// Panneau UI mis à l'échelle - les répliques gardent leurs métriques réelles.
const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  s: number;
  delay?: number;
  children: React.ReactNode;
  pad?: number;
  background?: string;
}> = ({x, y, w, s, delay = 0, children, pad = 0, background = WHITE}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = rise(frame, fps, delay, {dist: 22});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        opacity: r.opacity,
        transform: `${r.transform} scale(${s})`,
        transformOrigin: 'top left',
        background,
        border: `1px solid ${LINE}`,
        borderRadius: 14,
        boxShadow: '0px 18px 44px -18px rgba(28,25,23,0.18), 0px 2px 6px rgba(28,25,23,0.06)',
        padding: pad,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

// Colonne de pitch : les temps forts du geste, cadencés sur le curseur.
const Beats: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  items: {at: number; tag: string; text: string}[];
}> = ({x = 1180, y = 280, w = 640, items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        display: 'flex',
        flexDirection: 'column',
        gap: 46,
      }}
    >
      {items.map((b) => (
        <div key={b.tag} style={{...rise(frame, fps, b.at, {dist: 18})}}>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: MUTE,
              margin: 0,
            }}
          >
            {b.tag}
          </p>
          <p style={{fontSize: 23, lineHeight: 1.45, color: INK2, margin: '10px 0 0'}}>{b.text}</p>
        </div>
      ))}
    </div>
  );
};

const clamp = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// ── 01 · intro ──────────────────────────────────────────────────────────────

export const Intro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: CREAM,
        opacity: fadeInOut(frame, duration),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: MUTE,
            ...rise(frame, fps, 4),
          }}
        >
          Norma · Prototype · Import email
        </span>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 100,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: '26px 0 0',
            ...rise(frame, fps, 12),
          }}
        >
          Des emails aux pièces
        </h1>
        <p
          style={{
            fontSize: 27,
            color: INK2,
            margin: '26px 0 0',
            maxWidth: 980,
            textAlign: 'center',
            lineHeight: 1.45,
            ...rise(frame, fps, 22),
          }}
        >
          Alimenter un dossier depuis la boîte mail, sans export manuel.
          Deux gestes : ajouter - un prélèvement ponctuel. Suivre - une source vivante.
        </p>
        <div style={{display: 'flex', gap: 14, marginTop: 44, ...rise(frame, fps, 34)}}>
          <MonoChip>/ui-kit/import-dossier</MonoChip>
          <MonoChip>Outlook · Gmail</MonoChip>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── cartes d'acte ───────────────────────────────────────────────────────────

const ActCard: React.FC<{
  duration: number;
  kicker: string;
  title: string;
  text: string;
}> = ({duration, kicker, title, text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: PAPER,
        opacity: fadeInOut(frame, duration),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: MUTE,
            ...rise(frame, fps, 2),
          }}
        >
          {kicker}
        </span>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 76,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: '22px 0 0',
            ...rise(frame, fps, 8),
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 25,
            color: INK2,
            margin: '22px 0 0',
            maxWidth: 900,
            textAlign: 'center',
            lineHeight: 1.5,
            ...rise(frame, fps, 16),
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const Acte1: React.FC<{duration: number}> = ({duration}) => (
  <ActCard
    duration={duration}
    kicker="Étape 1"
    title="L'ajout simple"
    text="Piocher dans la boîte, vérifier, ajouter. Un prélèvement ponctuel, figé - la curation fine reste légitime."
  />
);

export const Acte2: React.FC<{duration: number}> = ({duration}) => (
  <ActCard
    duration={duration}
    kicker="Étape 2"
    title="Avec la synchronisation"
    text="Les mêmes écrans, un calque en plus : la source reste vivante et le dossier s'alimente tout seul."
  />
);

// ── 02 · geste 1 : piocher ──────────────────────────────────────────────────

const PX = 120;
const PY = 150;
const PS = 1.3;

export const Piocher: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const typed = 'leblanc'.slice(0, Math.round(clamp(frame, 35, 70, 0, 7)));
  const rootOp = clamp(frame, 58, 74, 1, 0);
  const resOp = clamp(frame, 66, 82);
  const chkFolder = clamp(frame, 120, 128);
  const chkThread = clamp(frame, 160, 168);
  const trayOp = clamp(frame, 172, 186);
  const pressed = frame >= 250 && frame < 258;

  const cur = cursorXY(frame, [
    {f: 0, x: 760, y: 640},
    {f: 30, x: PX + 220 * PS, y: PY + 80 * PS},
    {f: 95, x: PX + 220 * PS, y: PY + 80 * PS},
    {f: 115, x: PX + 21 * PS, y: PY + 163 * PS},
    {f: 140, x: PX + 21 * PS, y: PY + 163 * PS},
    {f: 158, x: PX + 21 * PS, y: PY + 227 * PS},
    {f: 185, x: PX + 21 * PS, y: PY + 227 * PS},
    {f: 240, x: PX + 358 * PS, y: PY + 594 * PS},
  ]);

  return (
    <Shell
      duration={duration}
      kicker="Étape 1 · L'ajout simple"
      title="Geste 1 - Piocher dans la boîte"
      index="01 / 05"
    >
      <Panel x={PX} y={PY} w={440} s={PS} delay={4} background={PAPER}>
        <div style={{height: 660, position: 'relative', display: 'flex', flexDirection: 'column'}}>
          {/* Header colonne mail */}
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 10px'}}>
            <OutlookLogo />
            <span style={{minWidth: 0}}>
              <span style={{display: 'block', fontSize: 14, fontWeight: 500, color: INK}}>
                Ajouter ou suivre depuis votre boîte mail
              </span>
              <span style={{display: 'block', fontSize: 12, color: FAINT}}>
                cabinet@durand-avocats.fr
              </span>
            </span>
          </div>
          <div style={{padding: '0 16px 10px'}}>
            <SearchBar text={typed} caret={frame >= 35 && frame < 78} />
          </div>

          {/* Racine : habituels (s'efface quand la recherche prend) */}
          <div style={{position: 'absolute', top: 108, left: 6, right: 6, opacity: rootOp}}>
            <MonoHeader>Vos habituels</MonoHeader>
            <FolderRow name="Leblanc c/ AXA" path="/Clients/Leblanc c/ AXA" meta="12 échanges" />
            <ThreadRow
              subject="Compte rendu d'expertise médicale"
              sender="Expert · Cabinet Expertise - Dr Martin"
              date="22 juil."
              msg={4}
              pj={2}
            />
            <ThreadRow
              subject="Relevé de remboursements - CPAM"
              sender="CPAM · Service RCT"
              date="14 juil."
              pj={1}
            />
            <MonoHeader>Toute la boîte</MonoHeader>
            <FolderRow name="Boîte de réception" meta="214 échanges" />
            <FolderRow name="Clients" meta="134 dossiers" />
          </div>

          {/* Résultats de recherche */}
          <div style={{position: 'absolute', top: 108, left: 6, right: 6, opacity: resOp}}>
            <MonoHeader>Dossiers Outlook · 1</MonoHeader>
            <FolderRow
              name="Leblanc c/ AXA"
              path="/Clients/Leblanc c/ AXA"
              meta="12 échanges"
              check={chkFolder}
            />
            <MonoHeader>Échanges · 2</MonoHeader>
            <ThreadRow
              subject="Compte rendu d'expertise médicale"
              sender="Expert · Cabinet Expertise - Dr Martin"
              date="22 juil."
              msg={4}
              pj={2}
              check={chkThread}
            />
            <ThreadRow
              subject="Créance récap - n°2024-1147"
              sender="CPAM · Service RCT"
              date="14 juil."
              pj={1}
            />
          </div>

          {/* Tray flottant */}
          <div
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              bottom: 11,
              opacity: trayOp,
              transform: `translateY(${(1 - trayOp) * 16}px)`,
            }}
          >
            <div
              style={{
                background: WHITE,
                border: '1px solid #d6d3d1',
                borderRadius: 6,
                padding: '12px 12px 12px 14px',
                boxShadow:
                  'inset 4px 0px 0px 0px #292524, 0px 8px 17px rgba(0,0,0,0.04), 0px 30px 30px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12}}>
                <span style={{fontSize: 13, fontWeight: 500, color: INK}}>
                  1 dossier (≈ 27 pièces) + 1 échange
                </span>
                <DarkButton label="Ajouter à la liste" pressed={pressed} />
              </div>
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <Checkbox p={1} />
                <span style={{fontSize: 12, color: INK}}>Inclure les 2 pièces jointes</span>
              </span>
            </div>
          </div>
        </div>
      </Panel>

      <Beats
        items={[
          {
            at: 40,
            tag: 'Recherche globale',
            text: 'Toute la boîte se traverse d\'un champ - 134 dossiers, 1 800 échanges. C\'est le chemin principal.',
          },
          {
            at: 130,
            tag: 'Une seule coche',
            text: 'Cocher = prendre le contenu. Dossier Outlook entier ou échange isolé : même geste, à tous les niveaux.',
          },
          {
            at: 205,
            tag: 'À gauche on choisit',
            text: 'La sélection se récapitule dans le tray, puis rejoint la liste. La colonne mail est le seul lieu de curation.',
          },
        ]}
      />

      <Cursor frame={frame} x={cur.x} y={cur.y} clicks={[120, 160, 250]} />
    </Shell>
  );
};

// ── 03 · geste 2 : vérifier, découper, ajouter ─────────────────────────────

const VX = 90;
const VY = 180;
const VS = 1.15;

export const Verifier: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const decoupeOn = frame >= 146;
  const pieces = Math.round(clamp(frame, 146, 158, 31, 34));
  const pressed = frame >= 270 && frame < 278;

  const cur = cursorXY(frame, [
    {f: 0, x: 1000, y: 780},
    {f: 40, x: 1000, y: 780},
    {f: 70, x: VX + 628 * VS, y: VY + 148 * VS},
    {f: 146, x: VX + 628 * VS, y: VY + 148 * VS},
    {f: 200, x: VX + 628 * VS, y: VY + 465 * VS},
    {f: 255, x: VX + 628 * VS, y: VY + 465 * VS},
  ]);

  return (
    <Shell
      duration={duration}
      kicker="Étape 1 · L'ajout simple"
      title="Geste 2 - Vérifier, puis ajouter"
      index="02 / 05"
    >
      <Panel x={VX} y={VY} w={720} s={VS} delay={4} pad={20}>
        <p style={{fontSize: 13, color: INK2, margin: '0 0 14px', lineHeight: '18px'}}>
          Les pièces ajoutées rejoindront le dossier. Vous pourrez les découper et les ranger ensuite.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <OutlineButton
            label="Ajouter depuis l'ordinateur"
            icon={<Plus style={{width: 14, height: 14}} strokeWidth={2} />}
          />
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
            <span style={{fontSize: 14, fontWeight: 500, color: INK}}>Tout découper</span>
            <Switchy p={0} />
          </span>
        </div>

        <p style={{...monoLabel, margin: '0 0 8px'}}>Documents</p>
        <div style={{...rise(frame, fps, 10, {dist: 12})}}>
          <FileCard name="releve_frais_2025.pdf" meta="PDF · 12 pages" decoupe={decoupeOn} />
        </div>

        <p style={{...monoLabel, margin: '16px 0 8px'}}>Depuis les emails</p>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <div style={{...rise(frame, fps, 22, {dist: 12})}}>
            <ThreadCard
              subject="Compte rendu d'expertise médicale"
              meta="Expert · Dr Martin · 22 juil. · 2 PJ incluses"
              pj={[
                {name: 'Rapport_expertise_complementaire.pdf', decoupe: false},
                {name: 'Annexes_imagerie.pdf', decoupe: false},
              ]}
            />
          </div>
          <div style={{...rise(frame, fps, 34, {dist: 12})}}>
            <FolderCard
              name="Leblanc c/ AXA"
              meta="/Clients/Leblanc c/ AXA · 12 échanges · ≈ 27 pièces"
            />
          </div>
        </div>

        {/* Footer : récap + CTA */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: `1px solid ${LINE}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{fontSize: 13, color: INK2, fontVariantNumeric: 'tabular-nums'}}>
            ≈ {pieces} pièces · 1 fichier · 1 échange · 1 dossier Outlook
            {decoupeOn ? ' · 1 découpé' : ''}
          </span>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 10}}>
            <span style={{fontSize: 12, color: FAINT}}>Ajouter dans : Correspondance</span>
            <OutlineButton label="Annuler" />
            <DarkButton label="Ajouter au dossier" pressed={pressed} />
          </span>
        </div>
      </Panel>

      <Beats
        x={1210}
        w={620}
        items={[
          {
            at: 30,
            tag: 'À droite on vérifie',
            text: 'Le panier est un récapitulatif, pas un second lieu de tri. Les PJ restent rattachées à leur échange.',
          },
          {
            at: 150,
            tag: 'La découpe',
            text: 'Un document, plusieurs pièces - « 3 pièces détectées », mais la décision reste à vous. Jamais par défaut.',
          },
          {
            at: 235,
            tag: 'Un import figé',
            text: '« Ajouter au dossier » : les pièces entrent, traçables, avec leur destination. Le geste est terminé.',
          },
        ]}
      />

      <Cursor frame={frame} x={cur.x} y={cur.y} clicks={[146, 270]} />
    </Shell>
  );
};

// ── 04 · geste 3 : suivre ───────────────────────────────────────────────────

const SX = 110;
const SY = 220;
const SS = 1.2;

export const Suivre: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p1 = clamp(frame, 90, 98);
  const p2 = clamp(frame, 150, 158);
  const nSuivis = (p1 > 0.5 ? 1 : 0) + (p2 > 0.5 ? 1 : 0);
  const morphed = frame >= 158;
  const pressed = frame >= 226 && frame < 234;

  const cur = cursorXY(frame, [
    {f: 0, x: 900, y: 760},
    {f: 60, x: 174, y: 351},
    {f: 110, x: 174, y: 351},
    {f: 140, x: 174, y: 498},
    {f: 175, x: 174, y: 498},
    {f: 216, x: 838, y: 588},
  ]);

  return (
    <Shell
      duration={duration}
      kicker="Étape 2 · Avec la synchronisation"
      title="Geste 3 - Suivre : activer le flux"
      index="03 / 05"
    >
      <Panel x={SX} y={SY} w={700} s={SS} delay={4} pad={20} background={PAPER}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{...rise(frame, fps, 8, {dist: 12})}}>
            <ThreadCard
              subject="Compte rendu d'expertise médicale"
              meta="Expert · Dr Martin · 22 juil. · 2 PJ incluses"
              suivre={p1}
            />
          </div>
          <div style={{...rise(frame, fps, 18, {dist: 12})}}>
            <FolderCard
              name="Leblanc c/ AXA"
              meta="/Clients/Leblanc c/ AXA · 12 échanges · ≈ 27 pièces"
              suivre={p2}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: `1px solid ${LINE}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{fontSize: 13, color: INK2, fontVariantNumeric: 'tabular-nums'}}>
            ≈ 34 pièces{nSuivis > 0 ? ` · ${nSuivis} suivi${nSuivis > 1 ? 's' : ''}` : ''}
          </span>
          <DarkButton label={morphed ? 'Ajouter et suivre' : 'Ajouter au dossier'} pressed={pressed} />
        </div>
      </Panel>

      <Beats
        x={1150}
        w={670}
        items={[
          {
            at: 30,
            tag: 'Le calque sync',
            text: 'Le même panier - rien ne change de place. Un interrupteur « Suivre » se pose sur chaque source d\'emails.',
          },
          {
            at: 115,
            tag: 'Défaut conservateur',
            text: 'Rien ne se suit tout seul : suivre est un geste explicite. Un fichier déposé, lui, ne se suit pas - il est juste posé.',
          },
          {
            at: 195,
            tag: 'Le CTA suit',
            text: '« Ajouter et suivre » : l\'import d\'aujourd\'hui, plus le lien vivant pour la suite.',
          },
        ]}
      />

      <Cursor frame={frame} x={cur.x} y={cur.y} clicks={[90, 150, 226]} />
    </Shell>
  );
};

// ── 05 · geste 4 : laisser faire ────────────────────────────────────────────

export const Arrivees: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = (frame >= 80 ? 1 : 0) + (frame >= 120 ? 1 : 0) + (frame >= 160 ? 1 : 0);

  const arriving = (at: number): React.CSSProperties => ({
    ...rise(frame, fps, at + 4, {dist: 14}),
    maxHeight: 58 * clamp(frame, at, at + 10),
    overflow: 'hidden',
  });

  return (
    <Shell
      duration={duration}
      kicker="Étape 2 · Avec la synchronisation"
      title="Geste 4 - Laisser faire"
      index="04 / 05"
    >
      <Panel x={70} y={170} w={950} s={1.25} delay={4} pad={0}>
        {/* Header d'onglet */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${LINE}`,
          }}
        >
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 12}}>
            <span style={{fontSize: 14, fontWeight: 500, color: INK}}>Pièces - Leblanc c/ AXA</span>
            <SyncPill label={frame < 60 ? 'Sync Outlook · cette nuit' : 'Sync Outlook · il y a 5 min'} />
          </span>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
            <span style={{position: 'relative', display: 'inline-flex'}}>
              <OutlineButton
                label="Sources email"
                icon={<Mail style={{width: 14, height: 14}} strokeWidth={1.75} />}
              />
              <span style={{position: 'absolute', top: -8, right: -8}}>
                <CountBadge n={n} />
              </span>
            </span>
            <DarkButton label="Ajouter" icon />
          </span>
        </div>

        {/* En-tête de colonnes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            height: 32,
            background: PAPER,
            borderBottom: `1px solid ${LINE}`,
          }}
        >
          <span style={{...monoLabel, flex: 1}}>Dossier</span>
          <span style={{...monoLabel, width: 60, textAlign: 'right', marginRight: 16}}>Pages</span>
          <span style={{...monoLabel, width: 96, textAlign: 'right'}}>Date</span>
        </div>

        <NouveautesRow n={n} />

        <CategoryRow label="Pièces médicales" />
        <div style={arriving(80)}>
          <PieceRow
            name="Factures kinésithérapie - juillet 2026"
            provenance="via /Clients/Leblanc c/ AXA"
            pages="4 p."
            date="24/07/2026"
            isNew
          />
        </div>
        <PieceRow
          name="Certificat de prolongation d'arrêt de travail - Dr Lefèvre"
          provenance="Import du 2 juil."
          pages="1 p."
          date="28/01/2025"
        />

        <CategoryRow label="Correspondance" />
        <div style={arriving(120)}>
          <PieceRow
            name="Échange courriel - CPAM - Relevé T2 2026"
            provenance="via /Clients/Leblanc c/ AXA"
            pages="1 p."
            date="25/07/2026"
            email
            isNew
          />
        </div>
        <PieceRow
          name="Échange courriel - Dr Martin - Expertise du 04/03/2025"
          provenance="Import du 2 juil."
          pages="2 p."
          date="09/04/2025"
          email
        />

        <CategoryRow label="Expertise" />
        <div style={arriving(160)}>
          <PieceRow
            name="Rapport complémentaire d'expertise - Dr Martin"
            provenance="via Re : Compte rendu d'expertise médicale"
            pages="6 p."
            date="26/07/2026"
            isNew
          />
        </div>
        <PieceRow
          name="Rapport d'expertise médicale - Dr Martin - 04/03/2025"
          provenance="Import du 2 juil."
          pages="24 p."
          date="04/03/2025"
        />
      </Panel>

      <Beats
        x={1330}
        w={510}
        y={300}
        items={[
          {
            at: 40,
            tag: 'La nuit travaille',
            text: 'Batch nocturne + « Vérifier maintenant ». Pas de temps réel promis, pas de bruit.',
          },
          {
            at: 130,
            tag: 'Marquées « Nouveau »',
            text: 'La sync ajoute, ne supprime jamais. Chaque arrivée est signalée et rangée dans la destination de sa source.',
          },
          {
            at: 215,
            tag: 'La provenance reste',
            text: '« via /Clients/Leblanc c/ AXA » : une métadonnée et un filtre - jamais un rangement.',
          },
        ]}
      />
    </Shell>
  );
};

// ── 06 · geste 5 : garder la main ───────────────────────────────────────────

const DX = 100;
const DY = 160;
const DS = 1.15;

export const Sources: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const syncing = frame >= 120 && frame < 150;
  const newArrival = clamp(frame, 152, 166);

  const cur = cursorXY(frame, [
    {f: 0, x: 950, y: 700},
    {f: 90, x: DX + 462 * DS, y: DY + 192 * DS},
    {f: 150, x: DX + 462 * DS, y: DY + 192 * DS},
    {f: 200, x: DX + 300 * DS, y: DY + 420 * DS},
  ]);

  return (
    <Shell
      duration={duration}
      kicker="Étape 2 · Avec la synchronisation"
      title="Geste 5 - Garder la main"
      index="05 / 05"
    >
      <Panel x={DX} y={DY} w={580} s={DS} delay={4} pad={0}>
        {/* Header du panneau */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: `1px solid ${LINE}`,
          }}
        >
          <span style={{minWidth: 0}}>
            <span style={{display: 'block', fontSize: 14, fontWeight: 600, color: INK}}>
              Sources email
            </span>
            <span style={{display: 'block', fontSize: 11, color: FAINT}}>Leblanc c/ AXA</span>
          </span>
          <OutlookLogo size={24} />
        </div>

        <div style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 14}}>
          {/* Connexion */}
          <div
            style={{
              border: `1px solid ${LINE}`,
              borderRadius: 10,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              boxShadow: softShadow,
            }}
          >
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0}}>
              <span style={{width: 7, height: 7, borderRadius: 999, background: SUIVI, flexShrink: 0}} />
              <span style={{minWidth: 0}}>
                <span style={{display: 'block', fontSize: 12, fontWeight: 500, color: INK}}>
                  Connexion active
                </span>
                <span style={{display: 'block', fontSize: 11, color: FAINT}}>
                  {syncing ? 'vérification en cours…' : 'dernière vérification il y a 5 min'}
                </span>
              </span>
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                height: 26,
                padding: '0 8px',
                borderRadius: 6,
                border: `1px solid ${LINE}`,
                fontSize: 11,
                fontWeight: 500,
                color: INK,
                flexShrink: 0,
              }}
            >
              <RefreshCw
                style={{
                  width: 12,
                  height: 12,
                  transform: syncing ? `rotate(${(frame - 120) * 14}deg)` : undefined,
                }}
                strokeWidth={1.75}
              />
              Vérifier maintenant
            </span>
          </div>

          {/* Sources suivies */}
          <div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6}}>
              <span style={monoLabel}>Sources suivies · 3</span>
              <span style={{fontSize: 11, fontWeight: 500, color: MUTE}}>+ Ajouter une source</span>
            </div>
            <div style={{border: `1px solid ${LINE}`, borderRadius: 10, overflow: 'hidden'}}>
              <SourceRow
                kind="folder"
                path="/Clients/Leblanc c/ AXA"
                meta="12 échanges · synchro cette nuit"
                count={frame >= 160 ? 3 : 2}
                syncing={syncing}
              />
              <SourceRow
                kind="thread"
                path="Re : Compte rendu d'expertise médicale"
                meta="dr.martin@cabinet-expertise.fr · Experts & médecins"
                count={1}
              />
              <SourceRow
                kind="sender"
                path="facturation@cabinet-martin-kine.fr"
                meta="correspondant dédié · 4 échanges · découpe auto"
              />
            </div>
          </div>

          {/* Historique */}
          <div>
            <p style={{...monoLabel, margin: '0 0 6px'}}>Historique - /Clients/Leblanc c/ AXA</p>
            <div style={{border: `1px solid ${LINE}`, borderRadius: 10, overflow: 'hidden'}}>
              <div
                style={{
                  opacity: newArrival,
                  maxHeight: newArrival > 0 ? 44 : 0,
                  transform: `translateY(${(1 - newArrival) * -8}px)`,
                  overflow: 'hidden',
                }}
              >
                <HistoryRow
                  date="28 juil."
                  kind="arrival"
                  name="Relevé d'indemnités journalières - T3 2026"
                  tag="Médical"
                />
              </div>
              <HistoryRow
                date="25 juil."
                kind="arrival"
                name="Échange courriel - CPAM - Relevé T2 2026"
                tag="Correspondance"
              />
              <HistoryRow
                date="18 juil."
                kind="doublon"
                name="Attestation employeur - Dupont Martin SAS"
                note="déjà présent via Import du 2 juil. - ignoré, et dit"
              />
              <HistoryRow
                date="12 juil."
                kind="decoupe"
                name="Bulletins de salaire 2024"
                note="découpée en 3 pièces"
              />
              <HistoryRow date="2 juil." kind="initial" count={9} />
            </div>
          </div>
        </div>
      </Panel>

      <Beats
        x={1200}
        w={620}
        items={[
          {
            at: 30,
            tag: 'Le lien vivant, visible',
            text: 'Chemin complet, toggle inline, sync manuelle par source : l\'état est le contrôle.',
          },
          {
            at: 120,
            tag: 'Tout est journalisé',
            text: 'Arrivées, doublons ignorés - et dits, découpes, import initial. La traçabilité de l\'automatique.',
          },
          {
            at: 215,
            tag: 'Jamais de silence',
            text: 'Une PJ non récupérée est une ligne visible, avec raison et action. Et couper un lien ne supprime jamais une pièce.',
          },
        ]}
      />

      <Cursor frame={frame} x={cur.x} y={cur.y} clicks={[120]} />
    </Shell>
  );
};

// ── 07 · outro ──────────────────────────────────────────────────────────────

export const Outro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 14,
    padding: '30px 36px',
    width: 430,
    boxShadow: softShadow,
  };
  return (
    <AbsoluteFill
      style={{
        background: CREAM,
        opacity: fadeInOut(frame, duration),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 66,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: 0,
            ...rise(frame, fps, 4),
          }}
        >
          Chaque pièce dit d'où elle vient
        </h2>
        <div style={{display: 'flex', gap: 20, marginTop: 46}}>
          <div style={{...card, ...rise(frame, fps, 18)}}>
            <p style={{...monoLabel, fontSize: 12, margin: 0}}>Ajouter</p>
            <p style={{fontSize: 21, color: INK, margin: '10px 0 0', lineHeight: 1.45}}>
              Un prélèvement ponctuel, figé. On pioche, on vérifie, on ajoute.
            </p>
          </div>
          <div style={{...card, ...rise(frame, fps, 26)}}>
            <p style={{...monoLabel, fontSize: 12, margin: 0, color: SUIVI}}>Suivre</p>
            <p style={{fontSize: 21, color: INK, margin: '10px 0 0', lineHeight: 1.45}}>
              Une source vivante. Le dossier s'alimente tout seul - sans jamais rien détruire.
            </p>
          </div>
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 46, ...rise(frame, fps, 36)}}>
          <MonoChip>/ui-kit/import-dossier</MonoChip>
          <MonoChip>spec · Import & synchronisation email</MonoChip>
        </div>
      </div>
    </AbsoluteFill>
  );
};
