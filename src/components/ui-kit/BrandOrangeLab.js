import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, Check, Heart } from 'lucide-react';

// ── Brand-orange exploration ─────────────────────────────────────────────
// Samples only. The live token stays #ff6d04 in tailwind.config.js /
// design-system/tokens.js — nothing here mutates it.
//
// Two findings drive this lab:
//   1. HUE alone can't kill the "danger" read - even a muted terracotta on a
//      big solid fill still shouts « warning ». The culprit is SURFACE AREA.
//   2. The same color as a small KICKER (mono surtitle, glow dot, 3px accent
//      bar, tiny icon) reads as brand warmth, not alarm.
// So: a couple of softer candidates to try, plus a usage doctrine showing the
// restrained placements that make any of them safe. The app already uses
// orange only in these small spots - never a big fill - so it already follows
// the doctrine; only the hue would change.

const CURRENT = {
  key: 'current',
  name: 'Actuel (vif)',
  note: 'Orange Figma en cours - « safety cone »',
  DEFAULT: '#ff6d04', subtle: '#fff0e0', border: '#ffbf80', deep: '#cc5700',
};

const CANDIDATES = [
  // ── Vif atténué : garde l'énergie du #ff6d04, enlève l'arête « néon ».
  //    La cible d'après le retour : « vif pas mal mais trop vif, marche sur
  //    les détails ». Un cran moins saturé = vif mais posé.
  {
    key: 'vif-attenue', name: 'Vif atténué', target: true,
    note: 'Même énergie, sans l\'arête néon',
    DEFAULT: '#f47a2c', subtle: '#fff0e4', border: '#fbc493', deep: '#c85f18',
  },
  {
    key: 'vif-chaud', name: 'Vif chaud', target: true,
    note: 'Un cran plus profond / cuivré',
    DEFAULT: '#ec7526', subtle: '#fdeee2', border: '#f6bd8e', deep: '#bf5a15',
  },
  {
    key: 'vif-doux', name: 'Vif adouci', target: true,
    note: 'Plus clair, plus pêche - le moins agressif des vifs',
    DEFAULT: '#f08a4a', subtle: '#fff2e8', border: '#f9cda6', deep: '#cc6d2c',
  },
  {
    key: 'terre-douce', name: 'Terre cuite douce', liked: true,
    note: 'Sableux, chaleureux, faible chroma',
    DEFAULT: '#c67a4e', subtle: '#f7ede6', border: '#e3c3ab', deep: '#9f5c35',
  },
  {
    key: 'argile', name: 'Argile (ancien brand)', liked: true,
    note: 'Le #b9703f d\'avant - sobre',
    DEFAULT: '#b9703f', subtle: '#f4ece5', border: '#ddc0a9', deep: '#985a30',
  },
  // ── Softer / further from « danger » : browner, greyer, or amber-leaning ──
  {
    key: 'gres', name: 'Grès', softer: true,
    note: 'Plus brun, chroma bas - s\'éloigne du rouge',
    DEFAULT: '#c08a63', subtle: '#f5efe8', border: '#ddc7b1', deep: '#8f6742',
  },
  {
    key: 'miel-brule', name: 'Miel brûlé', softer: true,
    note: 'Vire vers l\'ambre / miel - moins « rouge alarme »',
    DEFAULT: '#c68f4c', subtle: '#f7f0e2', border: '#e2cba0', deep: '#8f6326',
  },
  {
    key: 'rouille-fanee', name: 'Rouille fanée', softer: true,
    note: 'Rouille profonde mais désaturée, posée',
    DEFAULT: '#b17a56', subtle: '#f3ece5', border: '#d9c1ac', deep: '#8a5c3a',
  },
  {
    key: 'terre-grise', name: 'Terre grisée', softer: true,
    note: 'Presque taupe - le plus discret',
    DEFAULT: '#b08a6d', subtle: '#f2eee9', border: '#d6c8ba', deep: '#846753',
  },
  // ── Reference / warmer end (kept for comparison) ──
  {
    key: 'terracotta', name: 'Terracotta classique',
    note: 'Argile franche - le plus « rouge »',
    DEFAULT: '#bd5f3c', subtle: '#f6e9e2', border: '#e0b39d', deep: '#9a4a2c',
  },
  {
    key: 'ocre-brulee', name: 'Ocre brûlée',
    note: 'Un peu de peps, sans crier',
    DEFAULT: '#c96a3a', subtle: '#f7ebe2', border: '#e6b89b', deep: '#a4522a',
  },
];

const ALL = [CURRENT, ...CANDIDATES];

const INK = '#292524';
const INK_SOFT = '#57534e';
const INK_MUTE = '#8a827b';
const HAIR = '#e7e5e3';
const CREAM = '#eeece6';
const CANVAS = '#f8f7f5';
const MONO = "'IBM Plex Mono', monospace";

// ── Déclinaison retenue : Vif atténué #f47a2c ─────────────────────────────
// Deux familles, cinq rôles chacune. Contrastes WCAG vérifiés (fg sur bg).
const DECLINAISON = {
  full: {
    name: 'Brand full',
    role: 'Aplats d\'accent, glow, liseré actif, icônes, pastilles',
    DEFAULT: '#f47a2c',           // la couleur de marque
    foreground: '#ffffff',        // texte/icône SUR l'aplat (gras/large : ~2.7:1)
    subtle: '#fff1e6',            // fond teinté clair
    subtleForeground: '#b8560f',  // texte SUR le subtle (~4.6:1)
    border: '#f9c79b',            // bord / anneau
  },
  darker: {
    name: 'Brand full darker',
    role: 'Liens, texte de marque, survol - contraste AA sur blanc',
    DEFAULT: '#b8560f',           // lien/texte sur blanc (~4.8:1)
    foreground: '#ffffff',        // texte SUR l'aplat foncé (~4.8:1)
    subtle: '#fbeadd',            // fond teinté clair
    subtleForeground: '#8f430c',  // texte SUR le subtle (~6:1)
    border: '#e7b184',            // bord / anneau
  },
};

function TokenChip({ bg, fg, ring, label, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
      <div style={{
        height: 52, borderRadius: 8, background: bg,
        border: ring ? `2px solid ${ring}` : `1px solid ${HAIR}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {fg
          ? <span style={{ color: fg, fontSize: 15, fontWeight: 700 }}>Aa</span>
          : <span style={{ fontSize: 10.5, color: INK_MUTE, fontFamily: MONO }}>border</span>}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: INK }}>{label}</div>
      <div style={{ fontSize: 10.5, color: INK_MUTE, fontFamily: MONO, lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

function FamilyCard({ f, linkWarn }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${HAIR}`, borderRadius: 16, padding: 22, flex: 1, minWidth: 340 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>{f.name}</span>
        <span style={{ fontSize: 11.5, color: INK_MUTE, fontFamily: MONO }}>{f.DEFAULT}</span>
      </div>
      <div style={{ fontSize: 12.5, color: INK_MUTE, marginTop: 3, marginBottom: 16, lineHeight: 1.4 }}>{f.role}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        <TokenChip bg={f.DEFAULT} fg={f.foreground} label="brand" sub={`fg ${f.foreground}`} />
        <TokenChip bg={f.subtle} fg={f.subtleForeground} label="subtle" sub={`fg ${f.subtleForeground}`} />
        <TokenChip bg="#fff" ring={f.border} label="border" sub={f.border} />
      </div>

      {/* Applied - the three canonical placements */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={{
          background: f.DEFAULT, color: f.foreground, border: 'none', borderRadius: 8,
          padding: '8px 13px', fontSize: 12.5, fontWeight: 600, cursor: 'default',
        }}>Action</button>
        <span style={{
          background: f.subtle, color: f.subtleForeground, border: `1px solid ${f.border}`,
          borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 600,
        }}>Statut</span>
        <span style={{
          color: f.DEFAULT, fontSize: 13, fontWeight: 600,
          textDecoration: 'underline', textUnderlineOffset: 2,
        }}>Lien texte</span>
      </div>
      {linkWarn && (
        <div style={{ fontSize: 11.5, color: INK_MUTE, marginTop: 8, lineHeight: 1.4 }}>
          Le lien en <em>brand full</em> est trop clair sur blanc - utiliser <strong>darker</strong> pour les liens / le texte.
        </div>
      )}
    </div>
  );
}

// ── Recommended: orange only as small kickers / accents ───────────────────
function KickerAccents({ c }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Surtitre / kicker - mono uppercase eyebrow, the app's signature */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span aria-hidden style={{
            width: 5, height: 5, borderRadius: 999, background: c.DEFAULT, color: c.DEFAULT,
            animation: 'kicker-glow 2.4s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
            color: c.deep, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Dossiers récents
          </span>
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: INK }}>
          Bonjour Meghan
        </div>
      </div>

      {/* Active list item - 3px accent bar with glow + brand-tinted icon */}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', border: `1px solid ${HAIR}`, borderRadius: 8,
        padding: '10px 12px', overflow: 'hidden',
      }}>
        <span aria-hidden style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 18, borderRadius: '0 999px 999px 0',
          background: c.DEFAULT, color: c.DEFAULT,
          animation: 'kicker-glow 2.4s ease-in-out infinite',
        }} />
        <Sparkles size={15} color={c.DEFAULT} />
        <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>SCI Aurore / Generali</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: INK_MUTE }}>actif</span>
      </div>

      {/* Text link + inline citation tick */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: c.deep, fontSize: 13, fontWeight: 600 }}>
          Voir la source <ArrowUpRight size={14} />
        </span>
        <span style={{ fontSize: 13, color: INK_SOFT }}>
          Fait générateur <span style={{ color: c.DEFAULT, fontWeight: 700 }}>·</span> pièce n°4
        </span>
      </div>
    </div>
  );
}

// ── To avoid: orange on big solid fills = « danger zone » ─────────────────
function HeavySurfaces({ c }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, opacity: 0.96 }}>
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
        background: c.DEFAULT, color: '#fff', border: 'none',
        borderRadius: 8, padding: '9px 15px', fontSize: 13, fontWeight: 600, cursor: 'default',
      }}>
        <Sparkles size={15} /> Générer l'acte
      </button>
      <div style={{ height: 8, borderRadius: 999, background: CREAM, overflow: 'hidden' }}>
        <div style={{ width: '64%', height: '100%', background: c.DEFAULT }} />
      </div>
      <span style={{
        alignSelf: 'flex-start', background: c.DEFAULT, color: '#fff',
        borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600,
      }}>
        3 points de vigilance
      </span>
    </div>
  );
}

// ── Moving border glow : a comet of orange travelling around the border ───
// A rotating conic-gradient sits behind the card; an inset panel masks the
// centre, so only the ~1.5px ring shows the sweep. A blurred twin adds bloom.
// Pure border/light - never a fill - so it stays in the « détail » doctrine.
function MovingBorderGlow({ c, radius = 12, pad = 1.6, children, speed = '3.4s' }) {
  const conic = `conic-gradient(from 0deg, transparent 0deg, ${c.DEFAULT} 46deg, transparent 92deg)`;
  return (
    <div style={{ position: 'relative', borderRadius: radius, padding: pad, background: HAIR, overflow: 'hidden' }}>
      {/* bloom (blurred) */}
      <div className="mbg-spin" style={{
        position: 'absolute', inset: '-60%', background: conic,
        filter: 'blur(7px)', opacity: 0.75, animationDuration: speed,
      }} />
      {/* crisp ring */}
      <div className="mbg-spin" style={{
        position: 'absolute', inset: '-60%', background: conic, animationDuration: speed,
      }} />
      {/* content masks the centre */}
      <div style={{ position: 'relative', background: '#fff', borderRadius: radius - pad }}>
        {children}
      </div>
    </div>
  );
}

// ── Swatch (raw scale) ────────────────────────────────────────────────────
function Swatch({ c, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left', cursor: 'pointer', background: '#fff', position: 'relative',
        border: `1.5px solid ${selected ? c.DEFAULT : HAIR}`,
        borderRadius: 12, padding: 12, width: 210,
        boxShadow: selected ? `0 0 0 3px ${c.subtle}` : 'none',
        transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      {c.liked && (
        <span title="Vous aimez celui-ci" style={{
          position: 'absolute', top: 10, right: 10, display: 'inline-flex',
        }}>
          <Heart size={13} color={c.DEFAULT} fill={c.DEFAULT} />
        </span>
      )}
      {c.target && (
        <span title="Piste cible : vif mais posé" style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 9.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase',
          color: '#fff', background: c.DEFAULT, borderRadius: 5, padding: '2px 6px',
        }}>
          cible
        </span>
      )}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {[c.subtle, c.border, c.DEFAULT, c.deep].map((v, i) => (
          <div key={i} style={{
            flex: 1, height: 30, borderRadius: 6, background: v,
            border: v === c.subtle ? `1px solid ${HAIR}` : 'none',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{c.name}</span>
        {selected && <Check size={14} color={c.DEFAULT} strokeWidth={3} />}
      </div>
      <div style={{ fontSize: 11.5, color: INK_MUTE, marginTop: 2, lineHeight: 1.35 }}>{c.note}</div>
      <div style={{ fontSize: 11, color: INK_MUTE, marginTop: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
        {c.DEFAULT}{c.target ? '  · cible' : c.softer ? '  · doux' : ''}
      </div>
    </button>
  );
}

export default function BrandOrangeLab() {
  const [sel, setSel] = useState('vif-attenue');
  const active = ALL.find(c => c.key === sel) || CURRENT;

  return (
    <div style={{
      minHeight: '100vh', background: '#faf9f7', padding: '40px 48px',
      fontFamily: "'Inter', system-ui, sans-serif", color: INK,
    }}>
      <style>{`
        @keyframes kicker-glow {
          0%, 100% { box-shadow: 0 0 3px currentColor; opacity: .85; }
          50%      { box-shadow: 0 0 9px currentColor; opacity: 1; }
        }
        @keyframes mbg-spin { to { transform: rotate(1turn); } }
        .mbg-spin { animation-name: mbg-spin; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
            color: INK_MUTE, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
          }}>
            UI Kit · Exploration
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
            Orange de marque · teinte + doctrine d'usage
          </h1>
          <p style={{ fontSize: 14, color: INK_SOFT, marginTop: 8, maxWidth: 660, lineHeight: 1.5 }}>
            Le « danger » ne vient pas surtout de la teinte mais de la <strong>surface</strong> :
            un aplat orange crie « warning » même en terracotta. En <strong>petit kicker</strong>
            {' '}(surtitre mono, point à glow, liseré 3px, icône), la même couleur = chaleur de marque.
            Le vif marche donc sur les détails - juste un cran moins saturé. Les pistes
            {' '}<strong>« cible »</strong> gardent son énergie sans l'arête néon.
          </p>
        </div>

        {/* Déclinaison retenue - le spec de tokens */}
        <div style={{
          fontFamily: MONO, fontSize: 11, fontWeight: 600, color: INK_SOFT,
          textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10,
        }}>
          Déclinaison · Vif atténué
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 40 }}>
          <FamilyCard f={DECLINAISON.full} linkWarn />
          <FamilyCard f={DECLINAISON.darker} />
        </div>

        {/* Swatch picker */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {ALL.map(c => (
            <Swatch key={c.key} c={c} selected={c.key === sel} onClick={() => setSel(c.key)} />
          ))}
        </div>

        {/* Doctrine : two regimes, same hue */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 40 }}>
          {/* Recommended */}
          <div style={{ background: CANVAS, border: `1px solid ${HAIR}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                color: '#346344', background: '#e3f2e8', borderRadius: 5, padding: '2px 7px',
              }}>Recommandé</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>En petit kicker / accent</span>
            </div>
            <p style={{ fontSize: 12.5, color: INK_MUTE, margin: '0 0 18px', lineHeight: 1.45 }}>
              Surtitre, point pulsé (glow), liseré actif, icône, lien. Lit comme la marque.
            </p>
            <KickerAccents c={active} />
          </div>

          {/* To avoid */}
          <div style={{ background: '#fff', border: `1px solid ${HAIR}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                color: '#855b31', background: '#f2ebe3', borderRadius: 5, padding: '2px 7px',
              }}>À éviter</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>En grande surface pleine</span>
            </div>
            <p style={{ fontSize: 12.5, color: INK_MUTE, margin: '0 0 18px', lineHeight: 1.45 }}>
              Bouton plein, jauge pleine, pill plein. C'est ça qui déclenche l'effet « zone danger ».
            </p>
            <HeavySurfaces c={active} />
          </div>
        </div>

        {/* Moving border glow - the « premium detail » accent */}
        <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: INK_SOFT }}>
          Bordure à glow mobile · {active.name} <span style={{ color: INK_MUTE, fontWeight: 500 }}>(détail premium, lumière qui tourne)</span>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginBottom: 40 }}>
          {/* Card */}
          <MovingBorderGlow c={active} radius={14}>
            <div style={{ padding: '16px 18px', maxWidth: 320 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Sparkles size={15} color={active.DEFAULT} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
                  color: active.deep, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>Norma travaille</span>
              </div>
              <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.45 }}>
                Préparation de la trame - 3 pièces citées, 2 points de vigilance.
              </div>
            </div>
          </MovingBorderGlow>

          {/* Pill / button outline */}
          <MovingBorderGlow c={active} radius={999} pad={1.4} speed="2.8s">
            <div style={{
              padding: '9px 16px', borderRadius: 999, display: 'inline-flex',
              alignItems: 'center', gap: 7,
            }}>
              <Sparkles size={14} color={active.DEFAULT} />
              <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Générer l'acte</span>
            </div>
          </MovingBorderGlow>

          {/* Compact input-like field */}
          <MovingBorderGlow c={active} radius={10} speed="4s">
            <div style={{ padding: '10px 14px', width: 240, fontSize: 13, color: INK_MUTE }}>
              Posez une question de droit…
            </div>
          </MovingBorderGlow>
        </div>

        {/* Every candidate AS A KICKER, to compare in the safe regime */}
        <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: INK_SOFT }}>
          Comparaison · chaque teinte en kicker (surtitre + point à glow + liseré)
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14,
        }}>
          {ALL.map(c => (
            <div key={c.key} style={{
              background: CANVAS, border: `1px solid ${c.key === sel ? c.DEFAULT : HAIR}`,
              borderRadius: 12, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span aria-hidden style={{
                  width: 5, height: 5, borderRadius: 999, background: c.DEFAULT, color: c.DEFAULT,
                  animation: 'kicker-glow 2.4s ease-in-out infinite',
                }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 500,
                  color: c.deep, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  Conv. récentes
                </span>
              </div>
              <div style={{
                position: 'relative', background: '#fff', border: `1px solid ${HAIR}`,
                borderRadius: 7, padding: '8px 10px 8px 12px', overflow: 'hidden',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span aria-hidden style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 15, borderRadius: '0 999px 999px 0',
                  background: c.DEFAULT, color: c.DEFAULT,
                  animation: 'kicker-glow 2.4s ease-in-out infinite',
                }} />
                <Sparkles size={13} color={c.DEFAULT} />
                <span style={{ fontSize: 12.5, color: INK, flex: 1, minWidth: 0 }}>Nouvelle conversation</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>
                  {c.name}{c.liked ? ' ♥' : ''}
                </span>
                <span style={{ fontSize: 11, color: INK_MUTE, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {c.DEFAULT}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
