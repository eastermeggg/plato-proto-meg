// Illustrations du connecteur email - tout est DESSINÉ EN CODE (aucun asset
// bitmap) : marques fournisseurs en SVG, carte Norma miniature qui rejoue le
// vrai bordereau (coche, pièce, coude de PJ, cote), et un seul moment animé -
// une pièce qui voyage de la boîte mail vers le dossier. L'illustration EST
// l'argument : elle montre le sens unique du flux (boîte → dossier, jamais
// l'inverse), ce que le texte promet juste en dessous.

import React from 'react';
import { Briefcase, Check, FileText, Landmark, Mail, Paperclip, RefreshCw } from 'lucide-react';
import { CONNECTOR_PROVIDERS } from './connectorData';
import outlookLogo from '../../assets/outlook.svg';

const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

// ── Marques fournisseurs ────────────────────────────────────────────────────

export function OutlookMark({ size = 24 }) {
  return <img src={outlookLogo} alt="" aria-hidden style={{ width: size, height: size * (29.77 / 32), display: 'block' }} />;
}

// Enveloppe Gmail dessinée (tracés officiels simplifiés).
export function GmailMark({ size = 24 }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="52 42 88 66" fill="none" aria-hidden style={{ display: 'block' }}>
      <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
      <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
      <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
      <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
      <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
    </svg>
  );
}

export function ProviderMark({ provider = 'outlook', size = 24 }) {
  return provider === 'gmail' ? <GmailMark size={size} /> : <OutlookMark size={size} />;
}

// Pastille WhatsApp dessinée (bulle verte + combiné blanc, tracé simplifié).
export function WhatsAppMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ display: 'block' }}>
      <path fill="#25d366" d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
      <path fill="#ffffff" d="M16.6 14.2c-.25-.13-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.37 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
    </svg>
  );
}

// Marque d'un connecteur à venir (réglages) : WhatsApp a sa pastille, les
// autres portent une icône métier dans la teinte de leur tuile.
export function UpcomingMark({ id, size = 20 }) {
  if (id === 'whatsapp') return <WhatsAppMark size={size} />;
  if (id === 'ebarreau') return <Landmark style={{ width: size, height: size, color: '#1e3a8a' }} strokeWidth={1.75} />;
  return <Briefcase style={{ width: size, height: size, color: '#57534e' }} strokeWidth={1.75} />;
}

// Logo Plato (roi d'échecs) - le même asset que la barre latérale de l'app.
export function PlatoMark({ size = 20 }) {
  return (
    <img
      src="/logo-plato.png"
      alt=""
      aria-hidden
      style={{ width: size, height: size, display: 'block', flexShrink: 0, userSelect: 'none' }}
    />
  );
}

// Tuile blanche qui porte une marque (fournisseur ou Norma).
export function MarkTile({ children, size = 56, radius = 14 }) {
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 bg-white"
      style={{ width: size, height: size, borderRadius: radius, border: '1px solid #e7e5e3', boxShadow: '0 2px 6px -1px rgba(28,25,23,0.10), 0 1px 2px rgba(28,25,23,0.06)' }}
    >
      {children}
    </span>
  );
}

// ── Briques internes de la carte Norma ──────────────────────────────────────

const Bar = ({ w, tone = '#e9e6e0' }) => (
  <span aria-hidden style={{ height: 7, borderRadius: 4, backgroundColor: tone, width: w, flexShrink: 1, minWidth: 14 }} />
);

const CheckTile = () => (
  <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: '#e4efe8' }}>
    <Check style={{ width: 9, height: 9, color: '#4a9168' }} strokeWidth={3.5} />
  </span>
);

const Cote = ({ n }) => (
  <span
    className="inline-flex items-center flex-shrink-0"
    style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 500, letterSpacing: '0.04em', color: '#78716c', backgroundColor: '#f1efeb', borderRadius: 4, padding: '2px 5px', lineHeight: 1 }}
  >
    N° {n}
  </span>
);

// Coude d'indentation d'une PJ - le même dessin que le vrai bordereau.
const MiniElbow = () => (
  <span aria-hidden style={{ width: 13, height: 13, flexShrink: 0, marginLeft: 2 }}>
    <span style={{ display: 'block', width: 10, height: 12, marginLeft: 3, borderLeft: '1px solid #d6d3d1', borderBottom: '1px solid #d6d3d1', borderBottomLeftRadius: 4 }} />
  </span>
);

// ── Héro de la modale ───────────────────────────────────────────────────────
// Composition Notion-like : tuile fournisseur · pointillé · carte Norma qui
// dépasse du cadre. kind='import' rejoue le versement ; kind='sync' montre la
// nouveauté proposée d'elle-même.

// freezeChip : fige la pièce en transit à mi-course (capture / export statique).
export function ConnectorHero({ provider = 'outlook', kind = 'import', height = 204, freezeChip = false }) {
  const p = CONNECTOR_PROVIDERS[provider] || CONNECTOR_PROVIDERS.outlook;
  return (
    <div
      aria-hidden
      className="relative overflow-hidden select-none"
      style={{ height, borderRadius: 12, border: '1px solid #e7e5e3', backgroundColor: '#f7f6f3' }}
    >
      <style>{`
        @keyframes nconn-dot { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.9; } }
        @keyframes nconn-travel {
          0%   { transform: translateX(0) translateY(-50%); opacity: 0; }
          10%  { transform: translateX(14px) translateY(-50%); opacity: 1; }
          52%  { transform: translateX(148px) translateY(-50%); opacity: 1; }
          64%  { transform: translateX(182px) translateY(-50%); opacity: 0; }
          100% { transform: translateX(182px) translateY(-50%); opacity: 0; }
        }
        @keyframes nconn-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes nconn-glow { 0%, 100% { background-color: #eef3fa; } 50% { background-color: #e2ecf8; } }
        @media (prefers-reduced-motion: reduce) {
          .nconn-anim { animation: none !important; }
        }
      `}</style>

      {/* Lavis de teinte fournisseur à gauche, encre très diluée à droite. */}
      <span className="absolute inset-0" style={{ background: `radial-gradient(420px 300px at 12% 45%, ${p.tint} 0%, rgba(255,255,255,0) 62%)` }} />
      <span className="absolute inset-0" style={{ background: 'radial-gradient(380px 280px at 96% 55%, #eeece6 0%, rgba(255,255,255,0) 60%)' }} />

      <div className="absolute inset-0 flex items-center">
        {/* Tuile fournisseur */}
        <div className="flex items-center justify-center" style={{ width: '34%' }}>
          <MarkTile size={64} radius={16}>
            <ProviderMark provider={provider} size={34} />
          </MarkTile>
        </div>

        {/* Pointillé animé - le canal, jamais un tuyau plein. */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="nconn-anim"
              style={{ width: 5, height: 5, borderRadius: 99, backgroundColor: '#a8a29e', animation: `nconn-dot 2.6s ease-in-out ${i * 0.35}s infinite` }}
            />
          ))}
          {kind === 'sync' && (
            <span className="inline-flex items-center justify-center bg-white" style={{ width: 24, height: 24, borderRadius: 99, border: '1px solid #e7e5e3', boxShadow: '0 1px 3px rgba(28,25,23,0.08)' }}>
              <RefreshCw className="nconn-anim" style={{ width: 12, height: 12, color: '#1e3a8a', animation: 'nconn-spin 14s linear infinite' }} strokeWidth={1.75} />
            </span>
          )}
        </div>

        {/* Pièce qui voyage (import) - l'unique moment animé du panneau. */}
        {kind === 'import' && (
          <span
            className="nconn-anim absolute inline-flex items-center gap-1.5 bg-white"
            style={{
              left: '30%', top: '50%',
              padding: '4px 8px', borderRadius: 99, border: '1px solid #e7e5e3',
              boxShadow: '0 3px 8px -2px rgba(28,25,23,0.16)',
              ...(freezeChip
                ? { transform: 'translateX(118px) translateY(-50%)', opacity: 1 }
                : { transform: 'translateX(0) translateY(-50%)', opacity: 0, animation: 'nconn-travel 5.6s ease-in-out 0.8s infinite' }),
            }}
          >
            <FileText style={{ width: 11, height: 11, color: '#b4483c' }} strokeWidth={1.75} />
            <Bar w={30} tone="#e2dfd8" />
          </span>
        )}

        {/* Carte Norma - déborde du cadre à droite, comme la référence. */}
        <div
          className="ml-auto bg-white flex-shrink-0"
          style={{ width: 316, marginRight: -34, borderRadius: '12px 0 0 12px', border: '1px solid #e7e5e3', borderRight: 'none', boxShadow: '0 14px 34px -10px rgba(28,25,23,0.18)' }}
        >
          {/* Le débord droit (-34px) est compensé par le padding : les cotes
              restent entières dans la zone visible. */}
          <div className="flex items-center gap-2" style={{ padding: '10px 48px 10px 14px', borderBottom: '1px solid #f0efed' }}>
            <PlatoMark size={18} />
            <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 14, color: '#292524', letterSpacing: '-0.2px' }}>Plato</span>
            <span className="ml-auto" style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716c', backgroundColor: '#eeece6', borderRadius: 4, padding: '3px 6px' }}>
              Dossier Leblanc
            </span>
          </div>

          {kind === 'import' ? (
            <div className="flex flex-col" style={{ padding: '12px 48px 12px 14px', gap: 9 }}>
              <div className="flex items-center" style={{ gap: 8 }}>
                <CheckTile />
                <Mail style={{ width: 13, height: 13, color: '#1e3a8a', flexShrink: 0 }} strokeWidth={1.75} />
                <Bar w={132} />
                <span className="ml-auto"><Cote n={12} /></span>
              </div>
              <div className="flex items-center" style={{ gap: 8, paddingLeft: 6 }}>
                <MiniElbow />
                <Paperclip style={{ width: 12, height: 12, color: '#b4483c', flexShrink: 0 }} strokeWidth={1.75} />
                <Bar w={96} />
                <span className="ml-auto"><Cote n={13} /></span>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <CheckTile />
                <FileText style={{ width: 13, height: 13, color: '#b4483c', flexShrink: 0 }} strokeWidth={1.75} />
                <Bar w={110} />
                <span className="ml-auto"><Cote n={14} /></span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col" style={{ padding: '12px 48px 12px 14px', gap: 9 }}>
              <div
                className="nconn-anim flex items-center"
                style={{ gap: 8, margin: '-4px -6px', padding: '4px 6px', borderRadius: 7, animation: 'nconn-glow 4.4s ease-in-out infinite' }}
              >
                <span className="flex-shrink-0" style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: '#2563eb' }} />
                <Mail style={{ width: 13, height: 13, color: '#1e3a8a', flexShrink: 0 }} strokeWidth={1.75} />
                <Bar w={104} tone="#d9e4f2" />
                <span className="ml-auto flex-shrink-0" style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1e3a8a', backgroundColor: '#dbeafe', borderRadius: 4, padding: '3px 6px' }}>
                  Proposé
                </span>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <CheckTile />
                <Mail style={{ width: 13, height: 13, color: '#a8a29e', flexShrink: 0 }} strokeWidth={1.75} />
                <Bar w={128} />
                <span className="ml-auto"><Cote n={12} /></span>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <CheckTile />
                <FileText style={{ width: 13, height: 13, color: '#a8a29e', flexShrink: 0 }} strokeWidth={1.75} />
                <Bar w={102} />
                <span className="ml-auto"><Cote n={13} /></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mini-composition pour les promos (hors modale) ──────────────────────────
// La même grammaire, réduite : boîte · pointillé · Norma.

export function ConnectorMiniLink({ provider = 'outlook', both = false, tileSize = 46 }) {
  return (
    <span aria-hidden className="inline-flex items-center" style={{ gap: 10 }}>
      {both ? (
        <span className="inline-flex items-center" style={{ position: 'relative', width: tileSize + 18, height: tileSize }}>
          <span style={{ position: 'absolute', left: 0, top: 0, transform: 'rotate(-5deg)' }}>
            <MarkTile size={tileSize} radius={12}><GmailMark size={tileSize * 0.46} /></MarkTile>
          </span>
          <span style={{ position: 'absolute', left: 16, top: 0, transform: 'rotate(4deg)' }}>
            <MarkTile size={tileSize} radius={12}><OutlookMark size={tileSize * 0.5} /></MarkTile>
          </span>
        </span>
      ) : (
        <MarkTile size={tileSize} radius={12}>
          <ProviderMark provider={provider} size={tileSize * 0.5} />
        </MarkTile>
      )}
      <span className="inline-flex items-center" style={{ gap: 5 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 4, height: 4, borderRadius: 99, backgroundColor: '#a8a29e' }} />
        ))}
      </span>
      <MarkTile size={tileSize} radius={12}>
        <PlatoMark size={tileSize * 0.5} />
      </MarkTile>
    </span>
  );
}

// ── Fenêtre d'autorisation stylisée (étape « connexion en cours ») ──────────
// Un mini-navigateur dessiné : la barre d'adresse VERROUILLÉE du fournisseur
// est l'argument visuel - le mot de passe se saisit chez lui, jamais ici.

export function OAuthWindow({ provider = 'outlook', children }) {
  const p = CONNECTOR_PROVIDERS[provider] || CONNECTOR_PROVIDERS.outlook;
  return (
    <div className="bg-white overflow-hidden" style={{ width: 360, borderRadius: 12, border: '1px solid #e7e5e3', boxShadow: '0 18px 44px -12px rgba(28,25,23,0.22)' }}>
      <div className="flex items-center" style={{ gap: 6, padding: '9px 12px', backgroundColor: '#f6f5f2', borderBottom: '1px solid #e7e5e3' }}>
        {['#e0ddd6', '#e0ddd6', '#e0ddd6'].map((c, i) => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: c }} />
        ))}
        <span className="flex-1 flex items-center justify-center" style={{ gap: 5, marginLeft: -22 }}>
          <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden>
            <rect x="0.5" y="4.5" width="8" height="6" rx="1.5" fill="none" stroke="#4a9168" />
            <path d="M2.5 4.5V3a2 2 0 1 1 4 0v1.5" fill="none" stroke="#4a9168" strokeWidth="1" />
          </svg>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#57534e', letterSpacing: '0.02em' }}>{p.authDomain}</span>
        </span>
      </div>
      <div className="flex flex-col items-center text-center" style={{ padding: '26px 24px', gap: 12 }}>
        <ProviderMark provider={provider} size={30} />
        {children}
      </div>
    </div>
  );
}
