import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArrowRight, MessageCircle, Sparkles} from 'lucide-react';
import {
  BRAND_DARK,
  CREAM,
  FAINT,
  INK,
  INK2,
  LINE,
  MONO,
  MUTE,
  SERIF,
  softShadow,
  WHITE,
} from './theme';
import {
  AppShell,
  AssistantBlock,
  ConversationsTable,
  Cursor,
  cursorXY,
  HeroComposer,
  MonoChip,
  PageHeaderBar,
  SuggestionPills,
  UserBubble,
} from './ui';
import {fadeInOut, rise} from './anim';

const clamp = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const QUESTION = 'Un salarié peut-il contester son licenciement 13 mois après ?';

// Légende basse discrète (le seul chrome vidéo posé sur l'app).
const Caption: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 46,
        display: 'flex',
        justifyContent: 'center',
        ...rise(frame, fps, at, {dist: 12}),
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 18px',
          borderRadius: 999,
          background: 'rgba(41,37,36,0.92)',
          color: WHITE,
          fontSize: 15,
          fontWeight: 500,
          boxShadow: '0 10px 30px -8px rgba(28,25,23,0.4)',
        }}
      >
        {children}
      </span>
    </div>
  );
};

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
          Norma · Prototype · L'assistant
        </span>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 92,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: '26px 0 0',
            textAlign: 'center',
            lineHeight: 1.05,
            ...rise(frame, fps, 12),
          }}
        >
          L'assistant répond
          <br />
          dès l'accueil
        </h1>
        <p
          style={{
            fontSize: 27,
            color: INK2,
            margin: '30px 0 0',
            maxWidth: 1000,
            textAlign: 'center',
            lineHeight: 1.45,
            ...rise(frame, fps, 22),
          }}
        >
          Une question de droit se pose directement depuis l'accueil - avant même
          d'ouvrir un dossier. Et chaque échange se retrouve dans Mes conversations.
        </p>
        <div style={{display: 'flex', gap: 14, marginTop: 44, ...rise(frame, fps, 34)}}>
          <MonoChip>Accueil › poser une question</MonoChip>
          <MonoChip>Mes conversations › retrouver le fil</MonoChip>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 02 · accueil : on tape la question dans le composer ─────────────────────

export const Accueil: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typedN = Math.floor(clamp(frame, 62, 152) * QUESTION.length);
  const typed = QUESTION.slice(0, typedN);
  const canSend = typedN > 0;
  const sendFlash = clamp(frame, 205, 214) * (1 - clamp(frame, 214, 226));
  const cur = cursorXY(frame, [
    {f: 0, x: 1320, y: 900},
    {f: 34, x: 800, y: 406},
    {f: 158, x: 800, y: 406},
    {f: 196, x: 1428, y: 470},
    {f: 250, x: 1428, y: 470},
  ]);
  return (
    <AbsoluteFill style={{opacity: fadeInOut(frame, duration)}}>
      <AppShell active="accueil">
        <div style={{position: 'absolute', left: 456, top: 212, width: 720}}>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: BRAND_DARK,
              margin: 0,
              ...rise(frame, fps, 4),
            }}
          >
            Bonjour Meghan
          </p>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 38,
              fontWeight: 400,
              letterSpacing: '-0.6px',
              lineHeight: '44px',
              color: INK,
              margin: '12px 0 0',
              ...rise(frame, fps, 8),
            }}
          >
            Que puis-je faire pour vous aujourd'hui ?
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: '24px',
              color: MUTE,
              margin: '12px 0 0',
              maxWidth: 560,
              ...rise(frame, fps, 14),
            }}
          >
            Une question de droit, une jurisprudence, l'état d'un dossier - je réponds
            avant même d'ouvrir un dossier.
          </p>
          <div style={{marginTop: 26, ...rise(frame, fps, 20)}}>
            <HeroComposer
              typed={typed}
              caret={frame > 55 && frame < 200}
              canSend={canSend}
              sendFlash={sendFlash}
            />
          </div>
          <div style={{marginTop: 18, ...rise(frame, fps, 28)}}>
            <SuggestionPills />
          </div>
        </div>
      </AppShell>
      <Caption at={40}>
        <Sparkles style={{width: 16, height: 16}} strokeWidth={2} />
        On pose la question directement, sans ouvrir de dossier
      </Caption>
      <Cursor frame={frame} x={cur.x} y={cur.y} clicks={[206]} />
    </AbsoluteFill>
  );
};

// ── 03 · conversation : la demande part, la réponse arrive ──────────────────

export const Conversation: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const thinking = clamp(frame, 30, 40) * (1 - clamp(frame, 66, 76));
  const l1 = clamp(frame, 78, 92);
  const l2 = clamp(frame, 116, 130);
  const l3 = clamp(frame, 150, 164);
  const navGlow = clamp(frame, 190, 206);
  const cur = cursorXY(frame, [
    {f: 0, x: 1200, y: 880},
    {f: 40, x: 1200, y: 880},
    {f: 188, x: 150, y: 268},
    {f: 240, x: 150, y: 268},
  ]);
  return (
    <AbsoluteFill style={{opacity: fadeInOut(frame, duration)}}>
      <AppShell active="conversations" navGlow={navGlow}>
        {/* barre de contexte du fil */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 40px',
            height: 76,
            borderBottom: `1px solid ${LINE}`,
          }}
        >
          <MessageCircle style={{width: 18, height: 18, color: MUTE}} strokeWidth={1.75} />
          <span style={{fontFamily: SERIF, fontSize: 22, fontWeight: 500, letterSpacing: '-0.4px', color: INK}}>
            Contestation d'un licenciement - délai
          </span>
          <span
            style={{
              marginLeft: 12,
              fontSize: 13,
              color: FAINT,
              fontFamily: MONO,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            Sans dossier
          </span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 76, bottom: 0, overflow: 'hidden'}}>
          <div
            style={{
              width: 760,
              margin: '0 auto',
              paddingTop: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: 26,
            }}
          >
            <div style={{...rise(frame, fps, 4, {dist: 14})}}>
              <UserBubble text={QUESTION} />
            </div>
            <AssistantBlock
              thinking={thinking}
              lines={[
                {
                  shown: l1,
                  text: (
                    <>
                      Non, en principe l'action est prescrite. La contestation de la rupture du
                      contrat de travail se prescrit par <b>12 mois</b> à compter de la notification
                      du licenciement (
                      <span style={{color: BRAND_DARK, fontWeight: 500}}>
                        art. L1471-1 du Code du travail
                      </span>
                      ).
                    </>
                  ),
                },
                {
                  shown: l2,
                  text: <>À 13 mois, le délai est dépassé : la demande serait déclarée irrecevable.</>,
                },
                {
                  shown: l3,
                  text: (
                    <>
                      Deux réserves à vérifier : le <b>point de départ exact</b> (date de
                      notification) et les cas de suspension ou d'interruption du délai.
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </AppShell>
      <Caption at={168}>
        <ArrowRight style={{width: 16, height: 16}} strokeWidth={2} />
        Le fil est créé - retrouvez-le dans Mes conversations
      </Caption>
      <Cursor frame={frame} x={cur.x} y={cur.y} clicks={[210]} />
    </AbsoluteFill>
  );
};

// ── 04 · mes conversations : tous les fils, réunis ──────────────────────────

export const Conversations: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fresh = clamp(frame, 24, 48);
  return (
    <AbsoluteFill style={{opacity: fadeInOut(frame, duration)}}>
      <AppShell active="conversations">
        <PageHeaderBar title="Mes conversations" />
        <div style={{padding: '32px 40px', ...rise(frame, fps, 8, {dist: 18})}}>
          <ConversationsTable
            rows={[
              {
                question: QUESTION,
                dossier: null,
                activity: "À l'instant",
                fresh,
              },
              {
                question: 'Prescription biennale sur les cotisations',
                dossier: 'Sociale · URSSAF c/ Martel',
                activity: 'Il y a 2 h',
              },
              {
                question: "Barème Macron pour 8 ans d'ancienneté",
                dossier: 'Sociale · Leblanc c/ Novapar',
                activity: 'Hier',
              },
              {
                question: 'Quelles pièces après une fracture du poignet ?',
                dossier: 'DC · Leblanc c/ AXA',
                activity: 'Lundi',
              },
              {
                question: "Résumé de l'arrêt Cass. soc. 11 mai 2023",
                dossier: null,
                activity: '3 janv.',
              },
            ]}
          />
        </div>
      </AppShell>
      <Caption at={30}>
        <MessageCircle style={{width: 16, height: 16}} strokeWidth={2} />
        Chaque question devient un fil, réuni ici - avec ou sans dossier
      </Caption>
    </AbsoluteFill>
  );
};

// ── 05 · outro ──────────────────────────────────────────────────────────────

export const Outro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 14,
    padding: '26px 30px',
    width: 460,
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
            fontSize: 60,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.1,
            ...rise(frame, fps, 4),
          }}
        >
          De la question à la conversation,
          <br />
          sans ouvrir un dossier.
        </h2>
        <div style={{display: 'flex', gap: 20, marginTop: 46}}>
          <div style={{...card, ...rise(frame, fps, 18)}}>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: BRAND_DARK,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles style={{width: 13, height: 13}} strokeWidth={2} /> Accueil
            </p>
            <p style={{fontSize: 21, color: INK, margin: '10px 0 0', lineHeight: 1.45}}>
              Une question posée directement - une réponse, sourcée, avant tout dossier.
            </p>
          </div>
          <div style={{...card, ...rise(frame, fps, 26)}}>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: MUTE,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MessageCircle style={{width: 13, height: 13}} strokeWidth={2} /> Mes conversations
            </p>
            <p style={{fontSize: 21, color: INK, margin: '10px 0 0', lineHeight: 1.45}}>
              Tous les fils réunis - rattachés à un dossier, ou libres.
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
