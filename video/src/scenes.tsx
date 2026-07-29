import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {ChevronLeft, ChevronRight, Percent, X} from 'lucide-react';
import {
  ACCENT_BG,
  ACCENT_BORDER,
  ACCENT_EMP,
  ACCENT_NET,
  BADGE_TOKENS,
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
  fmtEUR,
} from './theme';
import {Badge, MonoChip, Regle, Row, RowSpec, SectionHeader, cardChrome} from './ui';
import {countUp, fadeInOut, rise} from './anim';

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
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0}}>
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
          Norma · Prototype · Droit social
        </span>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 104,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: '26px 0 0',
            ...rise(frame, fps, 12),
          }}
        >
          Cotisations et impôts
        </h1>
        <p
          style={{
            fontSize: 27,
            color: INK2,
            margin: '26px 0 0',
            maxWidth: 900,
            textAlign: 'center',
            lineHeight: 1.45,
            ...rise(frame, fps, 22),
          }}
        >
          Le passage du brut au net, automatique - et chaque chiffre
          se défend face à la partie adverse.
        </p>
        <div style={{display: 'flex', gap: 14, marginTop: 44, ...rise(frame, fps, 34)}}>
          <MonoChip>?demo=social</MonoChip>
          <MonoChip>/ui-kit/cotisations</MonoChip>
        </div>
        <div
          style={{
            ...cardChrome,
            marginTop: 52,
            padding: '16px 26px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            ...rise(frame, fps, 46),
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: ACCENT_BG,
              border: `1px solid ${ACCENT_BORDER}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              fontWeight: 600,
              color: ACCENT_EMP,
            }}
          >
            CA
          </span>
          <div style={{display: 'flex', flexDirection: 'column', gap: 3}}>
            <span style={{fontSize: 18, fontWeight: 600, color: INK}}>Camille Aubert c/ SAS Trans-Fret</span>
            <span style={{fontSize: 14.5, color: MUTE}}>
              Rappel d'heures supplémentaires · dossier fictif de démonstration
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 02 · la page Chiffrage ──────────────────────────────────────────────────

const PRELEVEMENTS = [
  {label: 'Cotisations salariales', value: '2 245 €'},
  {label: 'Contributions salariales (CSG-CRDS)', value: '1 408 €'},
  {label: 'Impôt sur le revenu', value: '—', motif: "à renseigner · taux d'imposition"},
  {label: 'Cotisations patronales', value: '5 988 €'},
];

export const Chiffrage: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Shell
      duration={duration}
      kicker="La page Chiffrage"
      title="« Combien vais-je vraiment toucher ? »"
      index="02 / 07"
    >
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 800, transform: 'scale(1.45)', transformOrigin: 'top center'}}>
          <p
            style={{
              fontSize: 14.5,
              color: INK2,
              lineHeight: 1.55,
              margin: '0 0 22px',
              maxWidth: 720,
              ...rise(frame, fps, 8),
            }}
          >
            Sous les montants demandés, la section « Cotisations et impôts » : quatre lignes,
            une par prélèvement. Aucun champ à remplir - une donnée qui manque s'affiche en
            tiret et se demande dans la conversation.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 6px',
              marginBottom: 16,
              ...rise(frame, fps, 18),
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: ACCENT_BG,
                  border: `1px solid ${ACCENT_BORDER}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Percent style={{width: 16, height: 16, color: ACCENT_EMP}} />
              </span>
              <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 500,
                    color: MUTE,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    lineHeight: 1,
                  }}
                >
                  Estimations
                </span>
                <span style={{fontSize: 14, fontWeight: 500, color: INK, lineHeight: '18px'}}>
                  Cotisations et impôts
                </span>
              </div>
            </div>
            <p style={{fontSize: 12, color: MUTE, lineHeight: '16px', textAlign: 'right', maxWidth: 365, margin: 0}}>
              Ce qui est ponctionné sur les montants demandés. Chaque ligne ouvre sa page :
              ce qui entre dans le calcul, puis le calcul lui-même.
            </p>
          </div>
          <div style={{...cardChrome, ...rise(frame, fps, 26)}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 34,
                padding: '0 16px',
                background: PAPER,
                borderBottom: `1px solid ${LINE}`,
              }}
            >
              <span style={{flex: 1}} />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 500,
                  color: MUTE,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: 176,
                  textAlign: 'right',
                  paddingRight: 12,
                }}
              >
                Montant prélevé
              </span>
              <span style={{width: 44}} />
            </div>
            {PRELEVEMENTS.map((l, i) => (
              <div
                key={l.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 56,
                  background: 'white',
                  borderBottom: i === PRELEVEMENTS.length - 1 ? 'none' : `1px solid ${LINE}`,
                  ...rise(frame, fps, 34 + i * 9, {dist: 10}),
                }}
              >
                <span style={{flex: 1, padding: '0 12px 0 16px', fontSize: 14, color: INK}}>{l.label}</span>
                <span
                  style={{
                    width: 176,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    paddingRight: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: l.value === '—' ? FAINT : INK,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {l.value}
                  </span>
                  {l.motif ? (
                    <span style={{fontSize: 10.5, color: FAINT, lineHeight: '13px'}}>{l.motif}</span>
                  ) : null}
                </span>
                <span style={{width: 44, display: 'flex', justifyContent: 'center'}}>
                  <ChevronRight style={{width: 16, height: 16, color: FAINT}} />
                </span>
              </div>
            ))}
          </div>
          <p style={{fontSize: 13, color: MUTE, margin: '16px 4px 0', ...rise(frame, fps, 84)}}>
            La colonne s'intitule « Montant prélevé » : la direction est portée par le titre,
            aucun signe collé aux nombres. Cliquer une ligne ouvre la page du prélèvement.
          </p>
        </div>
      </div>
    </Shell>
  );
};

// ── 03 · la page d'un prélèvement ───────────────────────────────────────────

const badgesLoi = (label: string) => ({famille: 'TEXTE', label});

const SECTION_BASE: RowSpec[] = [
  {
    op: '+',
    label: "Rappel d'heures supplémentaires",
    value: '8 874 €',
    piece: 1,
    badges: [badgesLoi('Art. L. 3121-28 C. trav.'), {famille: 'DECISION', label: 'Cass. soc., 27 janv. 2021'}],
  },
  {op: '+', label: 'Congés payés sur heures supplémentaires', value: '887 €', piece: 'empty', badges: [badgesLoi('Art. L. 3121-28 C. trav.')]},
  {op: '+', label: 'Indemnité compensatrice de préavis', value: '5 008 €', piece: 1},
  {
    op: '+',
    label: 'Indemnité légale de licenciement',
    qualificatif: 'non soumise',
    barre: '1 878 €',
    piece: 'empty',
    ecartee: true,
    badges: [badgesLoi('Art. L. 1234-9 C. trav.')],
    regle: {
      nom: 'Plafond commun des indemnités de rupture',
      badges: [{famille: 'REFERENCE', label: 'BOSS · Indemnités de rupture'}],
    },
  },
  {
    op: '+',
    label: 'Dommages-intérêts LSCRS',
    qualificatif: 'non soumis',
    barre: '10 016 €',
    piece: 'empty',
    ecartee: true,
    badges: [badgesLoi('Art. L. 1235-3 C. trav.')],
    regle: {nom: 'Plafond commun des indemnités de rupture', etat: 'plafond déjà entamé'},
  },
  {
    op: '=',
    label: 'Base soumise à cotisations',
    value: '14 769 €',
    emphase: 'section',
    noteInline: '3 postes sur 5 retenus',
  },
];

const SECTION_CALCUL: RowSpec[] = [
  {op: 'x', label: 'Taux de cotisations salariales', value: '22 %', euro: false, regle: {nom: 'Taux de droit commun du régime général'}},
  {op: '=', label: 'Cotisations avant déduction', value: '3 249 €'},
  {
    op: '-',
    label: 'Réduction sur heures supplémentaires',
    value: '1 004 €',
    note: 'plafonnée aux cotisations vieillesse effectivement dues',
    regle: {
      nom: 'Réduction salariale sur heures supplémentaires',
      etat: 'appliquée au taux maximum',
      badges: [badgesLoi('Art. L. 241-17 CSS')],
    },
  },
  {op: '=', label: 'Cotisations salariales', value: '2 245 €', emphase: 'tableau'},
];

export const Prelevement: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // La caméra descend le long du tableau pendant que le calcul se déroule.
  const pan = interpolate(frame, [150, 200], [0, -470], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  return (
    <Shell
      duration={duration}
      kicker="La page d'un prélèvement"
      title="La colonne s'additionne"
      index="03 / 07"
    >
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 900,
            transform: `scale(1.28) translateY(${pan}px)`,
            transformOrigin: 'top center',
          }}
        >
          {/* en-tête de page - bande flush, bordée, collante dans l'app */}
          <div
            style={{
              ...cardChrome,
              borderRadius: 10,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              height: 52,
              padding: '0 16px',
              gap: 12,
              ...rise(frame, fps, 4),
            }}
          >
            <ChevronLeft style={{width: 16, height: 16, color: MUTE}} />
            <span style={{fontSize: 15, fontWeight: 600, color: INK}}>Cotisations salariales</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 15,
                fontWeight: 600,
                color: INK,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              2 245 €
            </span>
            <span
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                background: INK,
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Copier chiffrage
            </span>
          </div>

          <div style={{...cardChrome, ...rise(frame, fps, 10)}}>
            <SectionHeader
              titre="Base soumise à cotisations"
              description="Les montants demandés, et le sort de chacun - le total forme la base"
              libelleColonne="Montant demandé"
              showPieceCell
            />
            {SECTION_BASE.map((r, i) => (
              <div key={r.label} style={rise(frame, fps, 18 + i * 14, {dist: 8})}>
                <Row spec={r} isLast={i === SECTION_BASE.length - 1} showPieceCell />
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 13,
              color: MUTE,
              margin: '14px 4px 20px',
              ...rise(frame, fps, 108),
            }}
          >
            8 874 + 887 + 5 008 = 14 769 - les montants visibles s'additionnent, l'écarté ne
            compte pas. La règle qui l'écarte est nommée, avec ses propres textes.
          </p>

          <div style={{...cardChrome, ...rise(frame, fps, 150)}}>
            <SectionHeader
              titre="Calcul de la cotisation"
              description="Le taux appliqué à la base, la réduction retirée - le total est prélevé"
              libelleColonne="Montant"
              showPieceCell
            />
            {SECTION_CALCUL.map((r, i) => (
              <div key={r.label} style={rise(frame, fps, 172 + i * 16, {dist: 8})}>
                <Row spec={r} isLast={i === SECTION_CALCUL.length - 1} showPieceCell />
              </div>
            ))}
          </div>

          <p style={{fontSize: 13, color: MUTE, margin: '14px 4px 0', ...rise(frame, fps, 250)}}>
            Le résultat du tableau porte la seule teinte de la page : c'est LE chiffre qu'elle
            produit, repris tel quel sur la page Chiffrage.
          </p>
        </div>
      </div>
    </Shell>
  );
};

// ── 04 · les badges ─────────────────────────────────────────────────────────

const BADGE_ROWS: {el: React.ReactNode; label: string}[] = [
  {
    el: <Badge famille="PIECE" label="Pièce 4 · Relevé d'heures" />,
    label: 'Pièce du dossier · ouvre le document',
  },
  {
    el: (
      <span style={{display: 'inline-flex', gap: 8}}>
        <Badge famille="TEXTE" label="Art. L. 242-1 CSS" />
        <Badge famille="TEXTE" label="CCN Transport routier, art. 12" />
      </span>
    ),
    label: "Texte contraignant (loi, règlement, convention, contrat) · ouvre l'extrait",
  },
  {
    el: <Badge famille="DECISION" label="Cass. soc., 27 janv. 2021, n° 17-31.046" />,
    label: "Décision de justice · ouvre l'extrait",
  },
  {
    el: (
      <span style={{display: 'inline-flex', gap: 8}}>
        <Badge famille="REFERENCE" label="BOSS · Indemnités de rupture" />
        <Badge famille="REFERENCE" label="Référentiel Mornet" millesime="2024" />
      </span>
    ),
    label: 'Référence non contraignante · millésime obligatoire',
  },
  {
    el: <Badge famille="VALEUR" label="Cotisations salariales" />,
    label: 'Valeur dérivée · navigue vers la ligne qui la produit',
  },
  {
    el: <Badge famille="VARIABLE" label="Salaire de référence" />,
    label: 'Variable de chiffrage · un levier réglable dans le chat',
  },
  {
    el: <Badge famille="WEB" label="service-public.fr" />,
    label: 'Source web · aucune valeur probante, donc aucune teinte',
  },
];

export const Badges: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Shell
      duration={duration}
      kicker="Les badges"
      title="Cinq teintes par poids d'autorité"
      index="04 / 07"
    >
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 860, transform: 'scale(1.5)', transformOrigin: 'top center'}}>
          <p style={{fontSize: 14.5, color: INK2, lineHeight: 1.55, margin: '0 0 20px', ...rise(frame, fps, 6)}}>
            La couleur dit ce qui se passe au clic et quel poids d'autorité on invoque.
            Le BOSS est opposable à l'administration, pas au juge - et ça se voit avant de
            lire le libellé. Un badge ne porte jamais de montant.
          </p>
          <div style={{...cardChrome, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 13}}>
            {BADGE_ROWS.map((r, i) => (
              <div
                key={r.label}
                style={{display: 'flex', alignItems: 'center', gap: 16, ...rise(frame, fps, 14 + i * 11, {dist: 10})}}
              >
                <span style={{minWidth: 340, display: 'inline-flex'}}>{r.el}</span>
                <span style={{fontSize: 13.5, color: MUTE}}>{r.label}</span>
              </div>
            ))}
          </div>
          <div style={{...cardChrome, marginTop: 18, padding: '16px 22px', ...rise(frame, fps, 110)}}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: MUTE,
                marginBottom: 10,
              }}
            >
              La règle - un composant, pas une note
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              <Regle
                nom="Plafond commun des indemnités de rupture"
                badges={[{famille: 'REFERENCE', label: 'BOSS · Indemnités de rupture'}]}
              />
              <Regle nom="Plafond commun des indemnités de rupture" etat="plafond déjà entamé" />
            </div>
            <p style={{fontSize: 12.5, color: MUTE, margin: '10px 0 0', lineHeight: 1.5}}>
              Nom rédigé, état d'application en mots, et ses propres sources - jamais de chiffre.
              C'est elle que la partie adverse attaquera.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ── 05 · le panneau ─────────────────────────────────────────────────────────

const Montant: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: '0.92em',
      fontVariantNumeric: 'tabular-nums',
      color: INK,
      borderBottom: `1px dashed ${FAINT}`,
    }}
  >
    {children}
  </span>
);

export const Panneau: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slide = interpolate(frame, [8, 34], [480, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  return (
    <Shell
      duration={duration}
      kicker="Le panneau"
      title="Une explication en prose"
      index="05 / 07"
    >
      {/* la ligne d'origine, en retrait derrière le voile */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 120,
          width: 860,
          opacity: 0.5,
        }}
      >
        <div style={cardChrome}>
          <Row
            spec={{
              op: '-',
              label: 'Réduction sur heures supplémentaires',
              value: '1 004 €',
              regle: {nom: 'Réduction salariale sur heures supplémentaires', etat: 'appliquée au taux maximum'},
            }}
            isLast
          />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(41,37,36,0.10)',
          opacity: interpolate(frame, [8, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      />
      <p
        style={{
          position: 'absolute',
          top: 420,
          left: 120,
          width: 560,
          fontSize: 19,
          color: INK2,
          lineHeight: 1.6,
          ...rise(frame, fps, 60),
        }}
      >
        Trois blocs, jamais plus : le titre, le montant, l'explication en français courant.
        Les formules vivent ici, valeurs substituées et arrondi visible. Un montant cité
        navigue vers la ligne qui le produit ; une source s'ouvre pour lire le texte.
      </p>
      {/* le panneau - 400 px, glisse depuis la droite comme dans l'app */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 620,
          background: 'white',
          borderLeft: `1px solid ${LINE}`,
          boxShadow: '-8px 0 24px rgba(26,26,26,0.08)',
          transform: `translateX(${slide}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{transform: 'scale(1.4)', transformOrigin: 'top left', width: 443}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '18px 20px 14px',
              borderBottom: `1px solid ${LINE}`,
            }}
          >
            <span style={{flex: 1, fontSize: 15, fontWeight: 600, color: INK, lineHeight: '20px'}}>
              Réduction sur heures supplémentaires
            </span>
            <X style={{width: 16, height: 16, color: MUTE, marginTop: 2}} />
          </div>
          <div style={{padding: '16px 20px', borderBottom: `1px solid ${LINE}`, ...rise(frame, fps, 40)}}>
            <span style={{fontFamily: SERIF, fontSize: 28, color: INK, letterSpacing: '-0.5px'}}>1 004 €</span>
          </div>
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: 13.5,
              color: INK2,
              lineHeight: '21px',
              ...rise(frame, fps, 52),
            }}
          >
            <p style={{margin: 0}}>
              Les heures supplémentaires ouvrent droit à une réduction des cotisations
              vieillesse salariales <Badge famille="TEXTE" label="Art. L. 241-17 CSS" />. Elle se
              calcule sur le <strong style={{color: INK}}>rappel d'heures supplémentaires</strong>{' '}
              (<Montant>8 874 €</Montant>) au taux maximum de <Montant>11,31 %</Montant>{' '}
              <Badge famille="REFERENCE" label="BOSS · Exonérations heures supp." />, soit
              1 003,65 €, arrondi à <strong style={{color: INK}}>1 004 €</strong>.
            </p>
            <p style={{margin: 0}}>
              Ce taux est un plafond : la réduction ne peut pas excéder le montant des
              cotisations effectivement dues sur ces heures.
            </p>
            <p style={{margin: 0}}>
              Elle s'applique au montant calculé et non à la base : c'est pourquoi elle figure
              dans « Calcul de la cotisation » et non parmi les postes.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ── 06 · le bloc de résultats ───────────────────────────────────────────────

export const Resultats: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const net = countUp(frame, 20, 80, 23010);
  const emp = countUp(frame, 30, 90, 32651);
  const ecart = countUp(frame, 95, 130, 9641);
  return (
    <Shell
      duration={duration}
      kicker="Le bloc de résultats"
      title="Les deux chiffres de la négociation"
      index="06 / 07"
    >
      <div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 760, transform: 'scale(1.7)', transformOrigin: 'top center'}}>
          <div
            style={{
              background: 'white',
              border: `1px solid ${LINE}`,
              borderRadius: 12,
              boxShadow: '0px 8px 28px rgba(26,26,26,0.10)',
              overflow: 'hidden',
              ...rise(frame, fps, 8),
            }}
          >
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${LINE}`}}>
              {[
                {
                  id: 'net',
                  label: 'Net estimé pour le salarié',
                  value: net,
                  accent: ACCENT_NET,
                  mention: 'hors impôt sur le revenu',
                },
                {
                  id: 'emp',
                  label: 'Coût total employeur',
                  value: emp,
                  accent: ACCENT_EMP,
                  mention: '',
                },
              ].map((b, i) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    padding: '18px 22px 14px',
                    borderLeft: i > 0 ? `1px solid ${LINE}` : 'none',
                  }}
                >
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: 7}}>
                    <span style={{width: 8, height: 8, borderRadius: 8, background: b.accent}} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: MUTE,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {b.label}
                    </span>
                  </span>
                  <span style={{fontFamily: SERIF, fontSize: 34, fontWeight: 500, color: INK, letterSpacing: '-0.75px'}}>
                    {fmtEUR(b.value)}
                  </span>
                  <span style={{fontSize: 11, color: b.mention ? ACCENT_EMP : FAINT, minHeight: 14}}>
                    {b.mention}
                  </span>
                </div>
              ))}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', background: PAPER}}>
              <span style={{fontSize: 12, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums'}}>
                {fmtEUR(ecart)}
              </span>
              <span style={{fontSize: 12, color: MUTE}}>
                de prélèvements sociaux ne reviennent à aucune des deux parties
              </span>
            </div>
          </div>
          <p style={{fontSize: 13.5, color: MUTE, margin: '20px 4px 0', lineHeight: 1.6, ...rise(frame, fps, 110)}}>
            La mention « hors impôt sur le revenu » est dérivée, jamais écrite à la main :
            elle disparaît d'elle-même quand le taux arrive dans la conversation. Chaque
            chiffre s'ouvre et se vérifie comme n'importe quelle ligne.
          </p>
        </div>
      </div>
    </Shell>
  );
};

// ── 07 · outro ──────────────────────────────────────────────────────────────

export const Outro: React.FC<{duration: number}> = ({duration}) => {
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
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 76,
            fontWeight: 500,
            color: INK,
            letterSpacing: '-0.02em',
            margin: 0,
            ...rise(frame, fps, 6),
          }}
        >
          D'où viennent ces 2 245 € ?
        </h2>
        <p style={{fontSize: 25, color: INK2, margin: '24px 0 0', ...rise(frame, fps, 18)}}>
          Chaque montant s'ouvre, s'explique, et remonte jusqu'à ses textes.
        </p>
        <div style={{display: 'flex', gap: 14, marginTop: 46, ...rise(frame, fps, 30)}}>
          <MonoChip>?demo=social</MonoChip>
          <MonoChip>/ui-kit/cotisations</MonoChip>
        </div>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 14,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: MUTE,
            marginTop: 56,
            ...rise(frame, fps, 40),
          }}
        >
          Norma · Prototype droit social
        </span>
      </div>
    </AbsoluteFill>
  );
};
