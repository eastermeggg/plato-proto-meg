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
  // Scope de la boîte (spec « Connexion boîtes mail ») : 'personal' = visible
  // par son owner seul, self-service · 'shared' = boîte du cabinet, geste
  // admin. Le scope découle de QUI branche OÙ - jamais un toggle offert ici.
  scope = 'personal',
  initialTab = 'import',
  onClose, // fermeture sans terminer (X, voile, Annuler, Échap)
  onConnected, // la connexion vient d'aboutir (le parent pose son état)
  onFinish, // « Terminer » depuis l'écran de confirmation
}) {
  const p = CONNECTOR_PROVIDERS[provider] || CONNECTOR_PROVIDERS.outlook;
  const [tab, setTab] = useState(initialTab);
  const [step, setStep] = useState('overview'); // 'overview' | 'connecting' | 'done'

  // IMAP : pas d'OAuth (aucune redirection fournisseur) - on saisit des
  // identifiants. Formulaire minimal : email + mot de passe d'application ; le
  // serveur est déduit du domaine, modifiable si besoin.
  const isImap = provider === 'imap';
  const [imapEmail, setImapEmail] = useState(account || '');
  const [imapPass, setImapPass] = useState('');
  const [showServer, setShowServer] = useState(false);
  const imapDomain = (imapEmail.split('@')[1] || '').trim().toLowerCase();
  const imapHost = imapDomain ? `imap.${imapDomain}` : 'imap.votre-serveur.fr';
  const imapReady = imapEmail.includes('@') && imapEmail.split('@')[1]?.includes('.') && imapPass.length > 0;

  const busy = step === 'connecting';
  const close = () => { if (!busy) onClose?.(); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  const connectedAccount = (isImap ? imapEmail.trim() : '') || account || 'cabinet@durand-avocats.fr';

  const authorize = () => {
    if (isImap && !imapReady) return;
    setStep('connecting');
    setTimeout(() => {
      // On remonte l'adresse effectivement connectée (l'email saisi pour IMAP).
      onConnected?.(p, connectedAccount);
      setStep('done');
    }, isImap ? 1400 : 1900);
  };

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

          {/* ── IMAP - formulaire d'identifiants (pas d'OAuth) ── */}
          {step === 'overview' && tab === 'import' && isImap && (
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '22px 32px 18px' }}>
              <h3 style={{ ...serifTitle, fontSize: 22 }}>Connectez votre boîte par IMAP</h3>
              <p className="text-[13.5px] text-foreground-secondary leading-[21px] mt-2" style={{ maxWidth: 520 }}>
                Pour une adresse @avocats.fr ou une messagerie d'hébergeur (OVH, Infomaniak…).
                Norma s'y connecte en lecture seule, avec un mot de passe d'application.
              </p>

              <div className="flex flex-col gap-3.5 mt-5" style={{ maxWidth: 460 }}>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-foreground">Adresse email</span>
                  <input
                    type="email"
                    value={imapEmail}
                    onChange={(e) => setImapEmail(e.target.value)}
                    placeholder="vous@avocats.fr"
                    className="h-9 px-3 rounded-lg border border-border bg-white text-[14px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-border-strong"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-foreground">Mot de passe d'application</span>
                  <input
                    type="password"
                    value={imapPass}
                    onChange={(e) => setImapPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-9 px-3 rounded-lg border border-border bg-white text-[14px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-border-strong"
                  />
                  <span className="text-[11.5px] leading-[16px]" style={{ color: '#78716c' }}>
                    Créez un mot de passe d'application dédié dans votre messagerie - jamais votre
                    mot de passe principal. Révocable à tout moment.
                  </span>
                </label>

                {/* Serveur : déduit du domaine, replié par défaut. */}
                <div className="rounded-lg" style={{ backgroundColor: '#f6f5f2', border: '1px solid #e7e5e3', padding: '10px 12px' }}>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-[12px] leading-[17px]" style={{ color: '#57534e' }}>
                      Serveur détecté : <span className="font-medium text-foreground" style={{ fontFamily: MONO, fontSize: 11.5 }}>{imapHost}</span> · port 993 · SSL
                    </p>
                    <button type="button" onClick={() => setShowServer(s => !s)} className="text-[12px] font-medium text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0">
                      {showServer ? 'Masquer' : 'Modifier'}
                    </button>
                  </div>
                  {showServer && (
                    <div className="flex gap-2 mt-2.5">
                      <input defaultValue={imapHost} placeholder="Serveur IMAP" className="flex-1 h-8 px-2.5 rounded-md border border-border bg-white text-[13px] text-foreground focus:outline-none focus:border-border-strong" />
                      <input defaultValue="993" placeholder="Port" style={{ width: 72 }} className="h-8 px-2.5 rounded-md border border-border bg-white text-[13px] text-foreground focus:outline-none focus:border-border-strong" />
                    </div>
                  )}
                </div>
              </div>

              {/* Le périmètre exact - même consentement que l'OAuth. */}
              <div className="rounded-lg mt-5" style={{ backgroundColor: '#eeece6', padding: '12px 14px', maxWidth: 460 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Lock className="w-4 h-4 flex-shrink-0 text-foreground" strokeWidth={1.75} />
                  <p className="text-[13px] font-medium text-foreground">Accès en lecture seule</p>
                  <span className="flex items-center gap-1.5 ml-1">
                    {SCOPE_READS.map(s => (
                      <span key={s} className="inline-flex items-center h-[22px] px-2 rounded-full bg-white text-[11.5px] font-medium" style={{ color: '#44403c', border: '1px solid #e0ddd6' }}>{s}</span>
                    ))}
                  </span>
                </div>
                <p className="text-[12px] leading-[18px] mt-2" style={{ color: '#57534e' }}>
                  Jamais d'envoi ni de suppression. Votre boîte reste visible par vous seul - rien
                  n'entre dans un dossier sans votre geste.
                </p>
              </div>
            </div>
          )}

          {/* ── Import - présentation + consentement (OAuth) ── */}
          {step === 'overview' && tab === 'import' && !isImap && (
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
                  {/* Qui verra cette boîte - dit AVANT le clic, comme le périmètre. */}
                  <p className="text-[12px] leading-[18px] mt-1" style={{ color: '#57534e' }}>
                    {scope === 'shared'
                      ? 'Boîte commune du cabinet : consultable par tous les membres du workspace.'
                      : 'Votre boîte personnelle : visible par vous seul. Ce que vous versez dans un dossier devient accessible au cabinet.'}
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
                {isImap
                  ? 'Connexion chiffrée (TLS). Vos identifiants sont stockés de façon sécurisée, en lecture seule.'
                  : `Votre mot de passe reste chez ${p.vendor}.`}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={close} className="h-9 px-4 text-[14px] font-medium text-foreground-tertiary bg-white border border-border rounded-lg hover:bg-background transition-colors">
                  Annuler
                </button>
                {isImap ? (
                  <button
                    onClick={authorize}
                    disabled={!imapReady}
                    className="inline-flex items-center gap-2 h-9 px-4 text-[14px] font-medium text-white bg-foreground rounded-lg hover:bg-foreground-tertiary transition-opacity disabled:opacity-40"
                  >
                    Connecter
                  </button>
                ) : (
                  <button onClick={authorize} className="inline-flex items-center gap-2 h-9 px-4 text-[14px] font-medium text-white bg-foreground rounded-lg hover:bg-foreground-tertiary transition-colors">
                    Se connecter avec {p.short} <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Autorisation en cours ── */}
          {step === 'connecting' && (
            isImap ? (
              // IMAP : pas de fenêtre fournisseur - simple vérification serveur.
              <div className="flex-1 flex flex-col items-center justify-center gap-3.5 text-center" style={{ padding: '32px' }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#57534e' }} strokeWidth={1.75} />
                <p className="text-[13px] font-medium text-foreground">Connexion à {imapHost}…</p>
                <p className="text-[12px] text-foreground-secondary leading-[18px]" style={{ maxWidth: 280 }}>
                  Vérification de vos identifiants, en lecture seule.
                </p>
                <p className="flex items-center gap-1.5 text-[11.5px] text-foreground-secondary mt-1">
                  <Lock className="w-3 h-3" strokeWidth={2} /> Connexion chiffrée (TLS) - hébergement dans l'Union européenne
                </p>
              </div>
            ) : (
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
            )
          )}

          {/* ── Confirmation ── */}
          {step === 'done' && (
            <>
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3.5" style={{ padding: '32px 48px' }}>
                <span className="inline-flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 99, backgroundColor: '#e4efe8' }}>
                  <CheckCircle2 className="w-6 h-6" style={{ color: '#4a9168' }} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 style={{ ...serifTitle, fontSize: 22 }}>{scope === 'shared' ? 'La boîte commune est connectée' : 'Votre boîte est connectée'}</h3>
                  <p className="text-[13px] text-foreground-secondary mt-1">{connectedAccount}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {[scope === 'shared' ? 'Pour tout le cabinet' : 'Visible par vous seul', 'Lecture seule', 'Vous choisissez chaque pièce', 'Réversible à tout moment'].map(t => (
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
