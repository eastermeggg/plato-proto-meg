import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PencilLine, Plus, MoreHorizontal } from 'lucide-react';

// ── Unified top breadcrumb bar - exploration ─────────────────────────────
// Proposal: ONE top bar, shown only when  isDeep || navHidden.
//   · Top-level destinations (Accueil / Dossiers / Conversations), nav open → NO bar.
//   · Deeper surfaces (a conversation, inside a dossier, a niveau-3 object) → breadcrumb.
//   · Nav collapsed → the same bar appears and carries the « Menu » control at its
//     left edge (the only chrome a top-level page gets while collapsed).
// Sample only - nothing here is wired into the real shell.

const INK = '#292524';
const INK_SOFT = '#57534e';
const INK_TERT = '#78716c';
const INK_QUAT = '#a8a29e';
const HAIR = '#e7e5e3';
const CREAM = '#eeece6';
const CANVAS = '#f8f7f5';

// Panel-toggle glyph, matching the app's PanelToggleIcon (rect 18x18 + bar).
function PanelGlyph({ expand = true }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1.5" y="1.5" width="17" height="17" rx="3" stroke={INK_TERT} strokeWidth="1.33" />
      <line x1={expand ? 7.35 : 12.62} y1="1.5" x2={expand ? 7.35 : 12.62} y2="18.5" stroke={INK_TERT} strokeWidth="1.33" />
    </svg>
  );
}

// The « Menu » re-expand control (shown at the bar's left when nav is collapsed).
// Real Plato logo - same asset the app uses in renderNavExpandControl.
function MenuControl() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <img src="/logo-plato.png" alt="Plato" style={{ width: 24, height: 24, flexShrink: 0 }} />
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 8px', borderRadius: 6, border: 'none', background: 'transparent',
        color: INK_SOFT, fontSize: 14, cursor: 'default',
      }}>
        <PanelGlyph expand />
        Menu
      </button>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: HAIR, flexShrink: 0, margin: '0 2px' }} />;
}

// A breadcrumb trail: array of {label, muted, back}. Last item is the current page.
function Trail({ segments }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      {segments.map((seg, i) => {
        const last = i === segments.length - 1;
        return (
          <React.Fragment key={i}>
            {seg.back && <ChevronLeft size={15} color={INK_TERT} strokeWidth={2} style={{ flexShrink: 0 }} />}
            <span style={{
              fontSize: 13,
              fontWeight: last ? 600 : 500,
              color: last ? INK : INK_TERT,
              whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: last ? 260 : 180,
              cursor: last ? 'default' : 'pointer',
            }}>
              {seg.label}
            </span>
            {!last && <span style={{ fontSize: 13, color: INK_QUAT, flexShrink: 0 }}>/</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── inline style helpers ─────────────────────────────────────────────────
const mono = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 };
const ctrlLabel = {
  fontSize: 11, fontWeight: 600, color: INK_TERT, textTransform: 'uppercase',
  letterSpacing: '.06em', marginBottom: 8,
};
const cell = { padding: '12px 14px' };
const rightBtnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: INK, color: '#fff', border: 'none', borderRadius: 8,
  padding: '7px 13px', fontSize: 12.5, fontWeight: 600, cursor: 'default',
};
const rightBtnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'transparent', color: INK_SOFT, border: 'none', borderRadius: 6,
  padding: '6px 10px', fontSize: 13, cursor: 'default',
};
const iconBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'default',
};
const badgeSuccess = {
  fontSize: 12, fontWeight: 600, color: '#064e3b', background: '#e3f2ee',
  borderRadius: 999, padding: '3px 10px',
};

// ── Surface definitions ───────────────────────────────────────────────────
// isDeep decides whether the bar shows when nav is OPEN.
const SURFACES = {
  accueil: {
    label: 'Accueil', isDeep: false,
    crumb: 'Accueil',
    trail: null, right: null,
  },
  dossiersIndex: {
    label: 'Mes dossiers (index)', isDeep: false,
    crumb: 'Mes dossiers',
    trail: null,
    right: (
      <button style={rightBtnPrimary}><Plus size={15} /> Nouveau dossier</button>
    ),
  },
  conversationsIndex: {
    label: 'Mes conversations (index)', isDeep: false,
    crumb: 'Mes conversations',
    trail: null, right: null,
  },
  conversation: {
    label: 'Une conversation', isDeep: true,
    trail: [{ label: 'Mes conversations', back: true }, { label: 'Nouvelle conversation' }],
    right: (
      <button style={rightBtnGhost}><PencilLine size={14} strokeWidth={1.75} /> Renommer</button>
    ),
  },
  dossier: {
    label: 'Dans un dossier', isDeep: true,
    trail: [{ label: 'Mes dossiers', back: true }, { label: 'Camille Roux' }],
    right: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={badgeSuccess}>En cours</span>
        <button style={iconBtn}><MoreHorizontal size={16} color={INK_TERT} /></button>
      </div>
    ),
  },
  niveau3: {
    label: 'Niveau 3 (objet)', isDeep: true,
    trail: [
      { label: 'Mes dossiers', back: true },
      { label: 'Camille Roux' },
      { label: 'Poste - DFP' },
    ],
    right: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: INK_TERT, fontFamily: "'IBM Plex Mono', monospace" }}>3 / 12</span>
        <button style={iconBtn}><ChevronLeft size={16} color={INK_TERT} /></button>
        <button style={iconBtn}><ChevronRight size={16} color={INK_TERT} /></button>
      </div>
    ),
  },
};

// ── The unified bar ─────────────────────────────────────────────────────
function UnifiedBar({ surface, navHidden }) {
  const s = SURFACES[surface];
  const isDeep = s.isDeep;
  const show = isDeep || navHidden;
  if (!show) return null;

  // Top-level page, shown only because nav is collapsed: NO breadcrumb - the
  // page's big serif title already says « where am I ». Just the Menu control.
  return (
    <div style={{
      height: 48, borderBottom: `1px solid ${HAIR}`, background: CANVAS,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {navHidden && <MenuControl />}
        {navHidden && isDeep && <Divider />}
        {isDeep && <Trail segments={s.trail} />}
      </div>
      <div style={{ flexShrink: 0 }}>{isDeep ? s.right : null}</div>
    </div>
  );
}

// Faint page skeleton so the bar reads in context.
function PageSkeleton({ surface, navHidden }) {
  const s = SURFACES[surface];
  const showBar = s.isDeep || navHidden;
  return (
    <div style={{
      background: CANVAS, minHeight: 220,
      padding: showBar ? '28px 32px' : '24px 32px', position: 'relative',
    }}>
      {/* Top-level page always owns its big serif title - whether nav is open
          (no bar) or collapsed (bar shows just Menu). This is exactly why the
          bar carries NO crumb on these pages: the title already says where. */}
      {!s.isDeep && (
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: INK, marginBottom: 20 }}>
          {s.crumb}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[92, 68, 80].map((w, i) => (
          <div key={i} style={{ height: 12, width: `${w}%`, borderRadius: 6, background: '#eceae6' }} />
        ))}
        <div style={{ height: 12, width: '40%', borderRadius: 6, background: '#eceae6' }} />
      </div>
    </div>
  );
}

// ── Whole app frame preview (rail + surface) ─────────────────────────────
function FramePreview({ surface, navHidden }) {
  return (
    <div style={{
      display: 'flex', border: `1px solid ${HAIR}`, borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(41,37,36,.05)',
    }}>
      {/* Nav rail (disappears entirely when collapsed - no icon rail) */}
      {!navHidden && (
        <div style={{ width: 190, background: CANVAS, borderRight: `1px solid ${HAIR}`, padding: 14, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 5, background: INK, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, fontFamily: 'Georgia, serif',
            }}>P</div>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: INK }}>Plato</span>
            <div style={{ marginLeft: 'auto' }}><PanelGlyph expand={false} /></div>
          </div>
          {['Accueil', 'Mes dossiers', 'Mes conversations'].map((l, i) => (
            <div key={i} style={{
              fontSize: 12.5, padding: '6px 8px', borderRadius: 6, marginBottom: 2,
              color: INK_SOFT,
              background: (l === SURFACES[surface].crumb || (surface === 'dossier' && l === 'Mes dossiers') || (surface === 'niveau3' && l === 'Mes dossiers') || (surface === 'conversation' && l === 'Mes conversations')) ? '#fff' : 'transparent',
              border: (l === SURFACES[surface].crumb || (surface === 'dossier' && l === 'Mes dossiers') || (surface === 'niveau3' && l === 'Mes dossiers') || (surface === 'conversation' && l === 'Mes conversations')) ? `1px solid ${HAIR}` : '1px solid transparent',
              fontWeight: 500,
            }}>{l}</div>
          ))}
        </div>
      )}
      {/* Surface */}
      <div style={{ flex: 1, minWidth: 0, background: CANVAS }}>
        <UnifiedBar surface={surface} navHidden={navHidden} />
        <PageSkeleton surface={surface} navHidden={navHidden} />
      </div>
    </div>
  );
}

export default function BreadcrumbBarLab() {
  const [surface, setSurface] = useState('conversation');
  const [navHidden, setNavHidden] = useState(false);
  const s = SURFACES[surface];
  const barShown = s.isDeep || navHidden;

  return (
    <div style={{
      minHeight: '100vh', background: '#faf9f7', padding: '40px 48px',
      fontFamily: "'Inter', system-ui, sans-serif", color: INK,
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
            color: INK_TERT, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
          }}>
            UI Kit · Exploration
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
            Barre de fil d'Ariane unifiée
          </h1>
          <p style={{ fontSize: 14, color: INK_SOFT, marginTop: 8, maxWidth: 640, lineHeight: 1.5 }}>
            Une seule barre, affichée quand <code style={mono}>isDeep || navHidden</code>. En surface
            de premier niveau avec nav ouverte : aucune barre. En profondeur : fil d'Ariane. Nav repliée :
            la même barre réapparaît et porte le contrôle « Menu ».
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <div style={ctrlLabel}>Surface</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(SURFACES).map(([k, v]) => {
                const on = k === surface;
                return (
                  <button key={k} onClick={() => setSurface(k)} style={{
                    padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: on ? 600 : 500,
                    border: `1px solid ${on ? INK : HAIR}`, cursor: 'pointer',
                    background: on ? INK : '#fff', color: on ? '#fff' : INK_SOFT,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    {v.label}
                    <span style={{
                      fontSize: 9.5, fontWeight: 700, letterSpacing: '.04em',
                      padding: '1px 5px', borderRadius: 4,
                      background: v.isDeep ? (on ? 'rgba(255,255,255,.18)' : '#efe7df') : (on ? 'rgba(255,255,255,.18)' : CREAM),
                      color: v.isDeep ? (on ? '#fff' : '#9a4a2c') : (on ? '#fff' : INK_TERT),
                    }}>{v.isDeep ? 'DEEP' : 'TOP'}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setNavHidden(v => !v)}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${navHidden ? INK : HAIR}`,
              background: navHidden ? INK : '#fff', color: navHidden ? '#fff' : INK_SOFT,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <PanelGlyph expand={!navHidden} />
            Navigation {navHidden ? 'repliée' : 'ouverte'}
          </button>
        </div>

        {/* Verdict line */}
        <div style={{
          fontSize: 12.5, color: barShown ? '#9a4a2c' : INK_TERT, marginBottom: 12,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          {barShown
            ? `→ barre affichée (${s.isDeep ? 'profondeur' : 'nav repliée'})`
            : '→ aucune barre (surface de 1er niveau, nav ouverte)'}
        </div>

        {/* Live frame */}
        <FramePreview surface={surface} navHidden={navHidden} />

        {/* Matrix: every surface x {open, collapsed} at a glance */}
        <div style={{ marginTop: 40, marginBottom: 12, fontSize: 13, fontWeight: 600, color: INK_SOFT }}>
          Matrice · barre seule par état
        </div>
        <div style={{ border: `1px solid ${HAIR}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '150px 1fr 1fr',
            background: CREAM, fontSize: 11, fontWeight: 600, color: INK_TERT,
            textTransform: 'uppercase', letterSpacing: '.06em',
          }}>
            <div style={cell}>Surface</div>
            <div style={cell}>Nav ouverte</div>
            <div style={cell}>Nav repliée</div>
          </div>
          {Object.entries(SURFACES).map(([k, v]) => (
            <div key={k} style={{
              display: 'grid', gridTemplateColumns: '150px 1fr 1fr',
              borderTop: `1px solid ${HAIR}`, alignItems: 'stretch',
            }}>
              <div style={{ ...cell, fontSize: 12, fontWeight: 600, color: INK, display: 'flex', alignItems: 'center' }}>
                {v.label}
              </div>
              <div style={{ ...cell, padding: 0, borderLeft: `1px solid ${HAIR}` }}>
                <BarOrEmpty surface={k} navHidden={false} />
              </div>
              <div style={{ ...cell, padding: 0, borderLeft: `1px solid ${HAIR}` }}>
                <BarOrEmpty surface={k} navHidden={true} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarOrEmpty({ surface, navHidden }) {
  const s = SURFACES[surface];
  const show = s.isDeep || navHidden;
  if (!show) {
    return (
      <div style={{
        minHeight: 48, display: 'flex', alignItems: 'center', padding: '0 14px',
        fontSize: 11.5, color: INK_QUAT, fontStyle: 'italic',
      }}>
        aucune barre
      </div>
    );
  }
  return <UnifiedBar surface={surface} navHidden={navHidden} />;
}
