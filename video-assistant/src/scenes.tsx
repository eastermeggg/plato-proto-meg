import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Lock, Mail, Users} from 'lucide-react';
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
  WHITE,
  softShadow,
} from './theme';
import {
  AddRow,
  ChapeauCard,
  Cursor,
  cursorXY,
  EmptyMailState,
  InvariantBanner,
  MailboxRow,
  monoLabel,
  MonoChip,
  PickerHeader,
  PickerRow,
  ScopeChip,
  SearchBar,
  SectionMono,
  SettingsCard,
  Toast,
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
          Norma · Prototype · Connexion des boîtes mail
        </span>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 96,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: '26px 0 0',
            ...rise(frame, fps, 12),
          }}
        >
          Une liste de boîtes, deux gestes
        </h1>
        <p
          style={{
            fontSize: 27,
            color: INK2,
            margin: '26px 0 0',
            maxWidth: 1040,
            textAlign: 'center',
            lineHeight: 1.45,
            ...rise(frame, fps, 22),
          }}
        >
          Le cabinet connecte ses boîtes communes ; chacun connecte la sienne.
          Chaque boîte porte son scope - et l'emplacement du geste dit la privacy.
        </p>
        <div style={{display: 'flex', gap: 14, marginTop: 44, ...rise(frame, fps, 34)}}>
          <MonoChip>Organisation › Connecteurs</MonoChip>
          <MonoChip>Votre compte › Ma boîte</MonoChip>
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
            maxWidth: 940,
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

export const ActeCommune: React.FC<{duration: number}> = ({duration}) => (
  <ActCard
    duration={duration}
    kicker="Geste 1 · Administrateur"
    title="Les boîtes communes"
    text="Organisation › Connecteurs - connectées une fois, consultables par tout le cabinet. Le token appartient au workspace, pas à la personne qui clique."
  />
);

export const ActePerso: React.FC<{duration: number}> = ({duration}) => (
  <ActCard
    duration={duration}
    kicker="Geste 2 · Chacun"
    title="Ma boîte"
    text="Votre compte › Ma boîte - self-service, visible par vous seul. Un non-admin ne peut brancher QUE du personnel : le garde-fou est structurel, jamais un réglage."
  />
);

export const ActeImport: React.FC<{duration: number}> = ({duration}) => (
  <ActCard
    duration={duration}
    kicker="Au moment d'importer"
    title="Le picker agrège vos canaux"
    text="Boîtes communes du cabinet + vos boîtes personnelles - en sections étiquetées, dédoublonnées par conversation. Jamais la boîte d'un autre."
  />
);

// ── 02 · terrain : deux réalités, un modèle ────────────────────────────────

const MiniRow: React.FC<{address: string; scope: 'commune' | 'perso'}> = ({address, scope}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 14px',
      borderTop: `1px solid #f0eeeb`,
    }}
  >
    <Mail style={{width: 15, height: 15, color: '#1e3a8a', flexShrink: 0}} strokeWidth={1.75} />
    <span style={{flex: 1, fontSize: 13.5, fontWeight: 500, color: INK}}>{address}</span>
    <ScopeChip scope={scope} />
  </div>
);

export const Terrain: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Shell duration={duration} kicker="Terrain" title="Deux réalités, un seul modèle" index="01 / 04">
      <Panel x={90} y={250} w={640} s={1.08} delay={12}>
        <div style={{padding: '12px 16px 4px'}}>
          <p style={{...monoLabel, fontSize: 11, margin: 0}}>Cabinet nominatif - dominant</p>
          <p style={{fontSize: 13, color: '#57534e', margin: '4px 0 8px'}}>
            Chaque avocat sa boîte ; les dossiers se travaillent à plusieurs via cc et transferts.
          </p>
        </div>
        <MiniRow address="julien@cabinet-durand.fr" scope="perso" />
        <MiniRow address="marylin@cabinet-durand.fr" scope="perso" />
        <MiniRow address="marie@cabinet-durand.fr" scope="perso" />
      </Panel>
      <Panel x={90} y={560} w={640} s={1.08} delay={40}>
        <div style={{padding: '12px 16px 4px'}}>
          <p style={{...monoLabel, fontSize: 11, margin: 0}}>Cabinet à boîte partagée - réel</p>
          <p style={{fontSize: 13, color: '#57534e', margin: '4px 0 8px'}}>
            Une boîte commune, lue par tout le cabinet.
          </p>
        </div>
        <MiniRow address="cabinet@benzera-avocats.fr" scope="commune" />
      </Panel>
      <Beats
        x={920}
        y={280}
        w={880}
        items={[
          {
            at: 20,
            tag: 'Pas un modèle unique',
            text: 'Nominatif chez Julien et Marylin, partagé chez Benzera - et du mixte partout.',
          },
          {
            at: 90,
            tag: 'Un seul modèle',
            text: 'Le workspace porte une LISTE de boîtes. Chaque boîte porte son scope : commune ou personnelle - sans branche spéciale.',
          },
          {
            at: 160,
            tag: 'La règle',
            text: 'La boîte est privée ; le DOSSIER est le lieu du partage. Le scope découle de qui branche où.',
          },
        ]}
      />
    </Shell>
  );
};

// ── 03 · geste admin : boîtes communes ─────────────────────────────────────

export const Commune: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const emptyOut = 1 - clamp(frame, 96, 112);
  const listIn = clamp(frame, 106, 124);
  const addOpen = clamp(frame, 196, 210);
  const row2 = clamp(frame, 268, 286);
  const cur = cursorXY(frame, [
    {f: 0, x: 1030, y: 780},
    {f: 55, x: 452, y: 492},
    {f: 100, x: 452, y: 492},
    {f: 165, x: 185, y: 382},
    {f: 195, x: 185, y: 382},
    {f: 235, x: 940, y: 380},
    {f: 258, x: 940, y: 380},
    {f: 300, x: 1010, y: 560},
  ]);
  return (
    <Shell
      duration={duration}
      kicker="Organisation › Connecteurs"
      title="Le geste admin - à vide, puis en liste"
      index="02 / 04"
    >
      <Panel x={80} y={240} w={900} s={1.06} delay={8}>
        <SettingsCard
          icon="users"
          title="Boîtes communes du cabinet"
          note="Consultables par tout le cabinet · gérées par les administrateurs"
        >
          <div style={{position: 'relative', minHeight: 285}}>
            <div style={{position: 'absolute', inset: 0, opacity: emptyOut}}>
              <EmptyMailState
                icon="users"
                title="Connectez une boîte commune"
                body="cabinet@, accueil@, facturation@… Connectée une fois par un administrateur, elle devient consultable par tout le cabinet."
              />
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: listIn}}>
              <MailboxRow
                address="cabinet@hexa.com"
                meta="Outlook · Lecture seule · vérifiée il y a 2 min · connectée par Meghan Régior"
                scope="commune"
              />
              <div style={{opacity: row2, maxHeight: row2 > 0.02 ? 70 : 0, overflow: 'hidden'}}>
                <MailboxRow
                  address="contact@hexa.com"
                  meta="Gmail · Lecture seule · vérifiée à l'instant · connectée par Meghan Régior"
                  scope="commune"
                />
              </div>
              <AddRow label="Ajouter une nouvelle boîte" open={addOpen * (1 - row2)} />
              <div style={{padding: '2px 18px 12px'}}>
                <p style={{fontSize: 12, color: FAINT, margin: 0}}>
                  Votre boîte personnelle - visible par vous seul - se connecte dans Votre compte › Ma boîte.
                </p>
              </div>
            </div>
          </div>
        </SettingsCard>
      </Panel>
      <Beats
        x={1130}
        y={270}
        w={700}
        items={[
          {
            at: 14,
            tag: 'Vide au départ',
            text: 'Le flow commence à l\'empty state : le geste de connexion EST l\'écran - garanties comprises.',
          },
          {
            at: 116,
            tag: 'Un geste admin',
            text: 'OAuth chez le fournisseur, lecture seule. La liste dit qui a branché quoi - et reste visible par tous.',
          },
          {
            at: 210,
            tag: 'La liste grandit',
            text: 'UN CTA « Ajouter une nouvelle boîte », qui déplie ENSUITE le choix Outlook / Gmail. Accueil, contentieux, facturation…',
          },
        ]}
      />
      <Cursor frame={frame} x={cur.x} y={cur.y} clicks={[86, 186, 252]} />
    </Shell>
  );
};

// ── 04 · geste perso : ma boîte ────────────────────────────────────────────

export const Perso: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const emptyOut = 1 - clamp(frame, 96, 112);
  const listIn = clamp(frame, 106, 124);
  const cur = cursorXY(frame, [
    {f: 0, x: 1030, y: 780},
    {f: 55, x: 452, y: 478},
    {f: 100, x: 452, y: 478},
    {f: 150, x: 760, y: 690},
    {f: 210, x: 760, y: 690},
  ]);
  return (
    <Shell
      duration={duration}
      kicker="Votre compte › Ma boîte"
      title="Le geste de chacun - self-service"
      index="03 / 04"
    >
      <Panel x={80} y={240} w={900} s={1.06} delay={8}>
        <SettingsCard
          icon="mail"
          title="Ma boîte"
          note="Personnelle - aucun autre membre ne peut la consulter"
        >
          <div style={{position: 'relative', minHeight: 240}}>
            <div style={{position: 'absolute', inset: 0, opacity: emptyOut}}>
              <EmptyMailState
                icon="mail"
                title="Connectez votre boîte personnelle"
                body="Visible par vous seul : Norma vous propose vos échanges dossier par dossier, et seul ce que vous versez devient accessible au cabinet."
              />
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: listIn}}>
              <MailboxRow
                address="marie@cabinet-durand.fr"
                meta="Outlook · Lecture seule · vérifiée il y a 2 min"
                scope="perso"
              />
              <AddRow label="Ajouter une nouvelle adresse" open={0} />
              <div style={{padding: '2px 18px 12px'}}>
                <p style={{fontSize: 12, color: FAINT, margin: 0}}>
                  Une boîte commune du cabinet (cabinet@, accueil@…) se connecte dans Organisation › Connecteurs.
                </p>
              </div>
            </div>
          </div>
        </SettingsCard>
      </Panel>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 616,
          width: 954,
          ...rise(frame, fps, 150, {dist: 18}),
        }}
      >
        <InvariantBanner />
      </div>
      <Beats
        x={1130}
        y={270}
        w={700}
        items={[
          {
            at: 14,
            tag: 'Self-service',
            text: 'Chaque membre connecte la sienne - jamais celle d\'un autre. Même écran vide, mêmes garanties.',
          },
          {
            at: 116,
            tag: 'Visible par vous seul',
            text: 'Ni le picker, ni la recherche, ni les sources d\'un autre membre ne voient cette boîte.',
          },
          {
            at: 196,
            tag: 'Le seul pont : verser',
            text: 'Ce qui entre au dossier est partagé avec le cabinet. Le reste de la boîte, jamais.',
          },
        ]}
      />
      <Cursor frame={frame} x={cur.x} y={cur.y} clicks={[86]} />
    </Shell>
  );
};

// ── 05 · picker : sections, dédup, signal d'exposition ─────────────────────

export const Picker: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typed = 'leblanc'.slice(0, Math.floor(clamp(frame, 55, 90) * 7));
  const results = clamp(frame, 95, 112);
  return (
    <Shell
      duration={duration}
      kicker="Ajouter des pièces"
      title="Une recherche, vos boîtes"
      index="04 / 04"
    >
      <Panel x={80} y={240} w={520} s={1.05} delay={8}>
        <PickerHeader />
        <div style={{padding: '8px 14px 6px'}}>
          <SearchBar text={typed} caret={frame > 50 && frame < 100} />
        </div>
        <div style={{opacity: results, paddingBottom: 8}}>
          <SectionMono>Boîte cabinet · cabinet@durand-avocats.fr</SectionMono>
          <PickerRow
            subject="Notification d'audience - TJ Paris"
            date="18 déc. 2025"
            sender="Greffe · Greffe TJ Paris"
            pj={1}
            note="aussi dans votre boîte"
            excerpt="Convocation à l'audience de mise en état du 15 janvier - dossier Leblanc c/ AXA."
          />
          <SectionMono>Ma boîte · marie@durand-avocats.fr</SectionMono>
          <PickerRow
            subject="Compte rendu d'imagerie - genou droit"
            date="25 juin"
            sender="Centre Imagerie Sud"
            pj={1}
            excerpt="Résultats d'IRM de M. Leblanc, transmis directement à Maître Durand à sa demande."
          />
        </div>
      </Panel>
      <div
        style={{
          position: 'absolute',
          left: 660,
          top: 330,
          width: 520,
          ...rise(frame, fps, 150, {dist: 20}),
        }}
      >
        <ChapeauCard
          title="Compte rendu d'imagerie - genou droit"
          tag="perso"
          pieces={['Corps du mail', 'CR_IRM_genou_droit.pdf']}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 660,
          top: 560,
          ...rise(frame, fps, 210, {dist: 14}),
        }}
      >
        <Toast text="Versé depuis votre boîte - visible par le cabinet une fois dans le dossier." />
      </div>
      <Beats
        x={1290}
        y={270}
        w={560}
        items={[
          {
            at: 14,
            tag: 'Sections par boîte',
            text: 'La recherche balaie boîte cabinet + votre boîte, en sections étiquetées. La boîte d\'un autre membre n\'apparaît jamais.',
          },
          {
            at: 110,
            tag: 'Dédoublonné',
            text: 'Le même fil reçu deux fois = UN résultat, UNE pièce - « aussi dans votre boîte » dit la double provenance.',
          },
          {
            at: 205,
            tag: 'Signal d\'exposition',
            text: 'Versé depuis votre boîte : un signal discret, une fois - et le chapeau garde la provenance.',
          },
        ]}
      />
    </Shell>
  );
};

// ── 06 · outro ──────────────────────────────────────────────────────────────

export const Outro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 14,
    padding: '30px 36px',
    width: 470,
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
            fontSize: 62,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: 0,
            textAlign: 'center',
            ...rise(frame, fps, 4),
          }}
        >
          La boîte est privée. Le dossier est le lieu du partage.
        </h2>
        <div style={{display: 'flex', gap: 20, marginTop: 46}}>
          <div style={{...card, ...rise(frame, fps, 18)}}>
            <p style={{...monoLabel, fontSize: 12, margin: 0, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 6}}>
              <Users style={{width: 13, height: 13}} strokeWidth={2} /> Commune
            </p>
            <p style={{fontSize: 21, color: INK, margin: '10px 0 0', lineHeight: 1.45}}>
              Un admin la branche dans Organisation › Connecteurs - tout le cabinet la consulte.
            </p>
          </div>
          <div style={{...card, ...rise(frame, fps, 26)}}>
            <p style={{...monoLabel, fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 6}}>
              <Lock style={{width: 13, height: 13}} strokeWidth={2} /> Personnelle
            </p>
            <p style={{fontSize: 21, color: INK, margin: '10px 0 0', lineHeight: 1.45}}>
              Chacun la sienne, dans Ma boîte - visible par soi seul, versée pièce par pièce.
            </p>
          </div>
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 46, ...rise(frame, fps, 36)}}>
          <MonoChip>P0 · deux gestes + picker agrégé</MonoChip>
          <MonoChip>P1 · réconciliation multi-boîtes</MonoChip>
          <MonoChip>P2 · suggestion au propriétaire</MonoChip>
        </div>
      </div>
    </AbsoluteFill>
  );
};
