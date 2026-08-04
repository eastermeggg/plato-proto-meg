// Modale connecteur email - la grammaire des connecteurs Notion, dans la voix
// Norma. Deux volets : un rail identité à gauche (fournisseur, types de
// connexion, garanties TOUJOURS visibles) et un panneau valeur à droite (héro
// dessiné en code, cas d'usage, périmètre exact de l'autorisation).
//
// Le parcours rassurant existant est CONSERVÉ et absorbé : le panneau
// « Import » porte le consentement (périmètre lecture seule affiché avant tout
// clic), puis l'autorisation OAuth stylisée (le mot de passe se saisit chez le
// fournisseur), puis la confirmation. La synchronisation automatique est un
// onglet « À venir » : on vend la suite sans la survendre.

import React, { useEffect, useState } from 'react';
import { Ban, Check, CheckCircle2, ExternalLink, FolderOpen, Loader2, Lock, RefreshCw, Scale, ShieldCheck, X } from 'lucide-react';
import {
  CONNECTOR_PROVIDERS, CONNECTION_TYPES, GUARANTEES,
  importUseCases, syncUseCases, SCOPE_READS,
} from './connectorData';
import { ConnectorHero, ProviderMark, OAuthWindow } from './ConnectorArt';

const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";
const serifTitle = { fontFamily: SERIF, fontWeight: 500, color: '#292524', letterSpacing: '-0.3px', lineHeight: 1.25 };
const monoLabel = { fontFamily: MONO, fontWeight: 500, fontSize: 11, color: '#292524', letterSpacing: '0.1em', textTransform: 'uppercase' };

const GUARANTEE_ICONS = { lock: Lock, shield: ShieldCheck, scale: Scale, ban: Ban };
const TYPE_ICONS = { import: FolderOpen, sync: RefreshCw };

// Coche verte de liste - le même dessin que Réglages > Connecteurs.
function CheckDot() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0 mt-[1px]" style={{ backgroundColor: '#e4efe8' }}>
      <Check className="w-2.5 h-2.5" style={{ color: '#4a9168' }} strokeWidth={3} />
    </span>
  );
}

export default function MailConnectorModal({
  provider = 'outlook',
  account = null, // adresse pressentie (affichée sur le CTA quand connue)
  initialTab = 'import',
  onClose, // fermeture sans terminer (X, voile, Annuler, Échap)
  onConnected, // la connexion vient d'aboutir (le parent pose son état)
  onFinish, // « Terminer » depuis l'écran de confirmation
}) {
  const p = CONNECTOR_PROVIDERS[provider] || CONNECTOR_PROVIDERS.outlook;
  const [tab, setTab] = useState(initialTab);
  const [step, setStep] = useState('overview'); // 'overview' | 'connecting' | 'done'

  const busy = step === 'connecting';
  const close = () => { if (!busy) onClose?.(); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  const authorize = () => {
    setStep('connecting');
    setTimeout(() => {
      onConnected?.(p);
      setStep('done');
    }, 1900);
  };

  const connectedAccount = account || 'cabinet@durand-avocats.fr';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(28,25,23,0.42)', backdropFilter: 'blur(4px)' }}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={`Connecteur ${p.name}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white flex overflow-hidden"
        style={{
          width: 920, maxWidth: 'calc(100vw - 48px)',
          height: 596, maxHeight: 'calc(100vh - 48px)',
          borderRadius: 16,
          boxShadow: '0 32px 80px -16px rgba(28,25,23,0.34), 0 8px 24px -8px rgba(28,25,23,0.14)',
        }}
      >
        {/* ══ Rail gauche - identité, types de connexion, garanties ══ */}
        <div
          className="flex-shrink-0 flex flex-col"
          style={{ width: 264, backgroundColor: '#f6f5f2', borderRight: '1px solid #e7e5e3', padding: '26px 20px 20px' }}
        >
          <ProviderMark provider={provider} size={36} />
          <h2 className="mt-3.5" style={{ ...serifTitle, fontSize: 21 }}>{p.name}</h2>
          <p className="text-[12.5px] mt-1 leading-[18px] whitespace-nowrap" style={{ color: '#57534e' }}>
            {p.desc}
          </p>

          <nav className="flex flex-col gap-1.5 mt-5" aria-label="Types de connexion">
            {CONNECTION_TYPES.map(t => {
              const Icon = TYPE_ICONS[t.id];
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={busy}
                  onClick={() => { setTab(t.id); setStep('overview'); }}
                  className="w-full text-left rounded-lg transition-colors"
                  style={{
                    padding: '9px 10px',
                    backgroundColor: active ? '#ffffff' : 'transparent',
                    border: `1px solid ${active ? '#e7e5e3' : 'transparent'}`,
                    boxShadow: active ? '0 1px 3px rgba(28,25,23,0.07)' : 'none',
                    cursor: busy ? 'default' : 'pointer',
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center flex-shrink-0 bg-white" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e7e5e3' }}>
                      <Icon className="w-4 h-4" style={{ color: active ? '#292524' : '#78716c' }} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium leading-4" style={{ color: active ? '#292524' : '#44403c' }}>{t.title}</span>
                        {!t.available && (
                          <span style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716c', backgroundColor: '#eeece6', borderRadius: 4, padding: '2px 5px', flexShrink: 0 }}>
                            À venir
                          </span>
                        )}
                      </span>
                      <span className="block text-[11.5px] leading-4 mt-0.5" style={{ color: '#78716c' }}>{t.sub}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Les garanties ne quittent jamais l'écran, quel que soit l'onglet. */}
          <div className="mt-auto pt-4" style={{ borderTop: '1px solid #e7e5e3' }}>
            <p style={{ ...monoLabel, fontSize: 10, color: '#57534e' }}>Vos garanties</p>
            <ul className="flex flex-col gap-2 mt-2.5">
              {GUARANTEES.map(g => {
                const Icon = GUARANTEE_ICONS[g.icon];
                return (
                  <li key={g.label} className="flex items-start gap-2 text-[11.5px] leading-4" style={{ color: '#57534e' }}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#4a9168' }} strokeWidth={1.75} />
                    {g.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ══ Panneau droit ══ */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          <button
            onClick={close}
            disabled={busy}
            aria-label="Fermer"
            className="absolute z-10 flex items-center justify-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-background transition-colors"
            style={{ top: 14, right: 14, width: 32, height: 32, opacity: busy ? 0 : 1 }}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* ── Import - présentation + consentement ── */}
          {step === 'overview' && tab === 'import' && (
              <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '22px 32px 18px' }}>
                <ConnectorHero provider={provider} kind="import" height={182} />

                <h3 className="mt-5" style={{ ...serifTitle, fontSize: 22 }}>Vos échanges deviennent des pièces</h3>
                <p className="text-[13.5px] text-foreground-secondary leading-[21px] mt-2" style={{ maxWidth: 520 }}>
                  Versez vos emails et leurs pièces jointes directement dans vos dossiers,
                  sans export manuel.
                </p>

                <ul className="flex flex-col gap-2.5 mt-5">
                  {importUseCases(p).map(t => (
                    <li key={t} className="flex items-start gap-2.5 text-[13px] text-foreground-secondary leading-5">
                      <CheckDot /> {t}
                    </li>
                  ))}
                </ul>

                {/* Le périmètre exact, AVANT le clic - c'est le consentement. */}
                <div className="rounded-lg mt-6" style={{ backgroundColor: '#eeece6', padding: '12px 14px' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Lock className="w-4 h-4 flex-shrink-0 text-foreground" strokeWidth={1.75} />
                    <p className="text-[13px] font-medium text-foreground">Accès demandé : lecture seule</p>
                    <span className="flex items-center gap-1.5 ml-1">
                      {SCOPE_READS.map(s => (
                        <span key={s} className="inline-flex items-center h-[22px] px-2 rounded-full bg-white text-[11.5px] font-medium" style={{ color: '#44403c', border: '1px solid #e0ddd6' }}>{s}</span>
                      ))}
                    </span>
                  </div>
                  <p className="text-[12px] leading-[18px] mt-2" style={{ color: '#57534e' }}>
                    Jamais d'envoi ni de suppression - rien n'entre dans un dossier sans votre geste.
                  </p>
                </div>
              </div>
          )}

          {/* ── Synchronisation automatique - la suite, annoncée sans être survendue ── */}
          {step === 'overview' && tab === 'sync' && (
              <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '22px 32px 18px' }}>
                <ConnectorHero provider={provider} kind="sync" height={182} />

                <h3 className="mt-5" style={{ ...serifTitle, fontSize: 22 }}>Votre dossier se tient à jour</h3>
                <p className="text-[13.5px] text-foreground-secondary leading-[21px] mt-2" style={{ maxWidth: 520 }}>
                  Suivez un dossier de votre boîte : chaque nouvel échange vous est proposé
                  dès son arrivée.
                </p>

                <ul className="flex flex-col gap-2.5 mt-5">
                  {syncUseCases().map(t => (
                    <li key={t} className="flex items-start gap-2.5 text-[13px] text-foreground-secondary leading-5">
                      <CheckDot /> {t}
                    </li>
                  ))}
                </ul>

                <div className="flex items-start gap-3 rounded-lg mt-6" style={{ backgroundColor: '#eef3fa', border: '1px solid #c4d5ea', padding: '12px 14px' }}>
                  <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#dbeafe' }}>
                    <RefreshCw className="w-4 h-4" style={{ color: '#1e3a8a' }} strokeWidth={1.75} />
                  </span>
                  <p className="text-[12.5px] leading-[19px]" style={{ color: '#44403c' }}>
                    <span className="font-medium text-foreground">À venir</span> - s'activera pour
                    les boîtes déjà connectées, sans nouvelle autorisation.
                  </p>
                </div>
              </div>
          )}

          {/* ── Footer unique des deux onglets : toujours le même geste, se
              connecter chez le fournisseur ── */}
          {step === 'overview' && (
            <div className="flex items-center gap-4 flex-shrink-0" style={{ padding: '14px 32px', borderTop: '1px solid #e7e5e3' }}>
              <p className="flex items-center gap-2 text-[11.5px] text-foreground-secondary leading-4 flex-1 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4a9168' }} strokeWidth={1.75} />
                Votre mot de passe reste chez {p.vendor}.
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={close} className="h-9 px-4 text-[14px] font-medium text-foreground-tertiary bg-white border border-border rounded-lg hover:bg-background transition-colors">
                  Annuler
                </button>
                <button onClick={authorize} className="inline-flex items-center gap-2 h-9 px-4 text-[14px] font-medium text-white bg-foreground rounded-lg hover:bg-foreground-tertiary transition-colors">
                  Se connecter avec {p.short} <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* ── Autorisation en cours - la fenêtre du fournisseur, pas la nôtre ── */}
          {step === 'connecting' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5" style={{ padding: '32px' }}>
              <OAuthWindow provider={provider}>
                <div className="flex flex-col items-center gap-2.5">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: p.fg }} strokeWidth={1.75} />
                  <p className="text-[13px] font-medium text-foreground">Autorisation chez {p.vendor}…</p>
                  <p className="text-[12px] text-foreground-secondary leading-[18px]" style={{ maxWidth: 260 }}>
                    Validez la lecture seule dans cette fenêtre. Norma ne voit ni votre mot de passe,
                    ni rien d'autre que ce que vous acceptez.
                  </p>
                </div>
              </OAuthWindow>
              <p className="flex items-center gap-1.5 text-[11.5px] text-foreground-secondary">
                <Lock className="w-3 h-3" strokeWidth={2} /> Connexion chiffrée (TLS) - hébergement dans l'Union européenne
              </p>
            </div>
          )}

          {/* ── Confirmation ── */}
          {step === 'done' && (
            <>
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3.5" style={{ padding: '32px 48px' }}>
                <span className="inline-flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 99, backgroundColor: '#e4efe8' }}>
                  <CheckCircle2 className="w-6 h-6" style={{ color: '#4a9168' }} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 style={{ ...serifTitle, fontSize: 22 }}>Votre boîte est connectée</h3>
                  <p className="text-[13px] text-foreground-secondary mt-1">{connectedAccount}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {['Lecture seule', 'Vous choisissez chaque pièce', 'Réversible à tout moment'].map(t => (
                    <span key={t} className="inline-flex items-center h-6 px-2 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#eeece6', color: '#57534e' }}>{t}</span>
                  ))}
                </div>
                <p className="text-[13px] text-foreground-secondary leading-5" style={{ maxWidth: 380 }}>
                  Retrouvez vos échanges dans chaque dossier via « Ajouter des pièces » :
                  Norma vous les propose, vous versez ce que vous voulez.
                </p>
              </div>
              <div className="flex justify-end flex-shrink-0" style={{ padding: '14px 32px', borderTop: '1px solid #e7e5e3' }}>
                <button
                  onClick={() => (onFinish ? onFinish(connectedAccount) : onClose?.())}
                  className="h-9 px-4 text-[14px] font-medium text-white bg-foreground rounded-lg hover:bg-foreground-tertiary transition-colors"
                >
                  Terminer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
