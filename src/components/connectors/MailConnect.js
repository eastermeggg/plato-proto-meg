// Connexion boîte mail. Deux briques :
//
//   - MailConnectIntro : l'accueil INLINE de la carte « Adresses connectées »
//     quand rien n'est branché - héros dessiné, une ligne, un bouton par
//     fournisseur. La réassurance vit dans les chips + le bloc « peut/ne peut »
//     de la page, pas ici.
//   - MailConnectRun : le parcours de connexion, rendu en MODALE (le geste se
//     passe HORS de Plato : identifiants IMAP, autorisation OAuth chez le
//     fournisseur). IMAP = formulaire → vérification ; OAuth = fenêtre du
//     fournisseur ; puis confirmation. « Terminer » ferme, l'adresse rejoint la
//     liste dans la page.
//
// Même vérité que le reste du dispositif (connectorData) : lecture seule, rien
// ne se verse sans votre geste, réversible - hébergé en UE.

import React, { useEffect, useState } from 'react';
import { Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import { CONNECTOR_PROVIDERS, SCOPE_READS } from './connectorData';
import { ConnectorHero, ProviderMark, OAuthWindow } from './ConnectorArt';
import { BENEFITS } from './MailValueModal';
import { SyncSoonTeaser } from './ConnectorPromo';
import { colors, shadows } from '../../design-system/tokens';

const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const serifTitle = { fontFamily: SERIF, fontWeight: 500, color: colors.semantic.foreground, letterSpacing: '-0.3px', lineHeight: 1.25 };

// Le périmètre exact de l'autorisation - dit AVANT tout clic, c'est le consentement.
function ConsentBlock({ scope, label = 'Accès demandé : lecture seule' }) {
  return (
    <div className="rounded-lg" style={{ backgroundColor: colors.semantic.muted, padding: '12px 14px' }}>
      <div className="flex items-center gap-2 flex-wrap">
        <Lock className="w-4 h-4 flex-shrink-0 text-foreground" strokeWidth={1.75} />
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <span className="flex items-center gap-1.5 ml-1">
          {SCOPE_READS.map(s => (
            <span key={s} className="inline-flex items-center h-[22px] px-2 rounded-full bg-surface text-[11.5px] font-medium" style={{ color: colors.semantic.foregroundTertiary, border: `1px solid ${colors.semantic.border}` }}>{s}</span>
          ))}
        </span>
      </div>
      <p className="text-[12px] leading-[18px] mt-2" style={{ color: colors.semantic.foregroundQuaternary }}>
        Jamais d'envoi ni de suppression - rien n'entre dans un dossier sans votre geste.
      </p>
      <p className="text-[12px] leading-[18px] mt-1" style={{ color: colors.semantic.foregroundQuaternary }}>
        {scope === 'shared'
          ? 'Boîte commune du cabinet : consultable par tous les membres du workspace.'
          : 'Votre boîte personnelle : visible par vous seul. Ce que vous versez dans un dossier devient accessible au cabinet.'}
      </p>
    </div>
  );
}

// ── Le choix du fournisseur, partagé (Réglages + onboarding). ────────────────
// Le problème résolu ici : des avocats sur messagerie de cabinet cliquent
// « Outlook » parce qu'ils LISENT leurs mails dans Outlook - alors qu'il leur
// faut la 3e voie. La correction n'est pas d'auto-router (l'avocat perd la
// main) mais de rendre le bon bouton ÉVIDENT : une phrase de cadrage qui dit de
// choisir d'après son ADRESSE, puis un repère concret sous chaque option. Les
// trois options restent des vrais choix ; « Mon adresse de cabinet » nomme ce
// que l'avocat reconnaît (pas « IMAP »), la détection tranche le protocole.
export function ProviderChoice({ onPick, compact = false }) {
  // Cabinet EN PREMIER : c'est le cas majoritaire (la plupart des avocats sont
  // sur messagerie de cabinet), donc la prominence nudge vers le bon bouton et
  // réduit les clics « Outlook » à tort.
  const providers = ['imap', 'outlook', 'gmail'].map(k => CONNECTOR_PROVIDERS[k]);
  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      {/* La phrase de cadrage - règle la confusion d'un coup. */}
      <p className="text-[12.5px] leading-[17px]" style={{ color: colors.semantic.mutedForeground }}>
        Choisissez d'après votre <span className="font-medium" style={{ color: colors.semantic.foregroundTertiary }}>adresse email</span>, pas d'après l'application que vous ouvrez.
      </p>
      <div className="flex flex-col" style={{ gap: 8 }}>
        {providers.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick?.(p.id)}
            className="group flex items-center text-left bg-surface border border-border rounded-xl hover:border-border-strong transition-colors"
            style={{ gap: 12, padding: compact ? '11px 13px' : '13px 15px', boxShadow: shadows.xs }}
          >
            <ProviderMark provider={p.id} size={26} />
            <span className="flex flex-col flex-1 min-w-0" style={{ gap: 1 }}>
              <span className="text-[13.5px] font-medium text-foreground leading-[18px]">{p.pick}</span>
              <span className="text-[12px] leading-[16px]" style={{ color: colors.semantic.mutedForeground }}>{p.hint}</span>
            </span>
            <span
              className="flex-shrink-0 inline-flex items-center justify-center rounded-lg text-[12.5px] font-medium text-foreground-secondary group-hover:text-foreground transition-colors"
              style={{ height: 30, padding: '0 12px', border: `1px solid ${colors.semantic.border}` }}
            >
              Connecter
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Accueil (état vide) : héros + promesse + réassurance + chips + le choix du
//    fournisseur + ligne de sortie. INLINE dans la carte de la page. ──────────
export function MailConnectIntro({ onPick }) {
  return (
    <div className="px-6 py-6 flex flex-col gap-5">
      <ConnectorHero provider="outlook" kind="import" height={210} />

      <div className="flex flex-col gap-1">
        <h3 style={{ ...serifTitle, fontSize: 20 }}>Ne cherchez plus vos pièces : connectez votre boîte mail.</h3>
        <p className="text-[13px] text-foreground-secondary leading-5" style={{ maxWidth: 520 }}>
          Choisissez les échanges d'une affaire : Plato en extrait les pièces, prêtes à verser. Vous validez.
        </p>
      </div>

      {/* Le PUSH product-marketing sur l'empty state : les bénéfices (dont le
          découpage, l'argument qu'un dossier Outlook ne sait pas tenir) AVANT le
          geste. La réassurance défensive, elle, vit dans le tableau de confiance
          plus bas - deux registres distincts : ici on VEND, là on rassure. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-3.5" style={{ maxWidth: 640 }}>
        {BENEFITS.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-start" style={{ gap: 11 }}>
            <span
              className="inline-flex items-center justify-center flex-shrink-0"
              style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.semantic.muted, border: `1px solid ${colors.semantic.border}` }}
            >
              <Icon style={{ width: 15, height: 15, color: colors.semantic.foregroundTertiary }} strokeWidth={1.75} />
            </span>
            <div className="flex flex-col" style={{ gap: 1, paddingTop: 1 }}>
              <p className="text-[13px] font-medium text-foreground leading-[18px]">{title}</p>
              <p className="text-[12px] leading-[16px]" style={{ color: colors.semantic.mutedForeground }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Le geste : le choix du fournisseur, cadré par l'adresse (règle la
          confusion Outlook-vs-cabinet). Toute la réassurance (lecture seule, UE,
          réversible, peut / ne peut) est RÉUNIE dans le tableau de confiance en
          bas de page - aucun micro-élément ici. */}
      <div style={{ maxWidth: 520 }}>
        <ProviderChoice onPick={onPick} />
      </div>

      {/* La suite annoncée - synchronisation automatique « à venir ». */}
      <SyncSoonTeaser />
    </div>
  );
}

// ── Parcours de connexion, en MODALE (le geste se passe hors Plato) ──────────
export function MailConnectRun({ provider = 'outlook', account = null, scope = 'personal', onCancel, onConnected, onFinish }) {
  const p = CONNECTOR_PROVIDERS[provider] || CONNECTOR_PROVIDERS.outlook;
  const isImap = provider === 'imap';

  // OAuth : on entre directement dans l'autorisation (le consentement a été
  // porté par l'accueil). IMAP : on passe d'abord par le formulaire.
  const [step, setStep] = useState(isImap ? 'form' : 'connecting'); // 'form' | 'connecting'
  const [imapEmail, setImapEmail] = useState(account || '');
  const [imapPass, setImapPass] = useState('');
  const [showServer, setShowServer] = useState(false);

  const imapDomain = (imapEmail.split('@')[1] || '').trim().toLowerCase();
  const imapHost = imapDomain ? `imap.${imapDomain}` : 'imap.votre-serveur.fr';
  const imapReady = imapEmail.includes('@') && imapEmail.split('@')[1]?.includes('.') && imapPass.length > 0;
  const connectedAccount = (isImap ? imapEmail.trim() : '') || account || 'cabinet@durand-avocats.fr';
  const busy = step === 'connecting';

  // Le temps « connexion » simulé - déclenché à l'entrée de l'étape. Pas
  // d'écran de confirmation : on pose la boîte puis on ferme, le toast fait le
  // reçu (l'adresse apparaît dans la liste de la page).
  useEffect(() => {
    if (step !== 'connecting') return undefined;
    const t = setTimeout(() => {
      onConnected?.(connectedAccount);
      if (onFinish) onFinish(connectedAccount); else onCancel?.();
    }, isImap ? 1400 : 1900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Échap ferme (sauf pendant l'autorisation).
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(28,25,23,0.42)', backdropFilter: 'blur(4px)' }}
      onClick={() => { if (!busy) onCancel?.(); }}
      role="dialog"
      aria-modal="true"
    >
      {step === 'connecting' && !isImap ? (
        // ── OAuth : la fenêtre du fournisseur, hors Plato (pas de carte) ──
        <div className="flex flex-col items-center gap-5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <OAuthWindow provider={provider}>
            <div className="flex flex-col items-center gap-2.5">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: p.fg }} strokeWidth={1.75} />
              <p className="text-[13px] font-medium text-foreground">Autorisation chez {p.vendor}…</p>
              <p className="text-[12px] text-foreground-secondary leading-[18px]" style={{ maxWidth: 260 }}>
                Validez la lecture seule dans cette fenêtre. Plato ne voit ni votre mot de passe,
                ni rien d'autre que ce que vous acceptez.
              </p>
            </div>
          </OAuthWindow>
          <p className="flex items-center gap-1.5 text-[11.5px]" style={{ color: colors.semantic.input }}>
            <Lock className="w-3 h-3" strokeWidth={2} /> Connexion chiffrée (TLS) - hébergement dans l'Union européenne
          </p>
          <button onClick={onCancel} className="text-[12.5px] font-medium text-white/70 hover:text-white transition-colors">
            Annuler
          </button>
        </div>
      ) : (
        // ── Carte dialog : formulaire IMAP · vérification IMAP · confirmation ──
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-surface rounded-xl border border-border overflow-hidden animate-fadeIn"
          style={{ width: 560, maxWidth: '100%', boxShadow: '0 32px 72px -16px rgba(28,25,23,0.34)' }}
        >
          {!busy && (
            <button
              type="button"
              aria-label="Fermer"
              onClick={onCancel}
              className="absolute z-10 flex items-center justify-center w-8 h-8 rounded-md text-foreground-muted hover:text-foreground hover:bg-cream transition-colors"
              style={{ top: 12, right: 12 }}
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}

          <div className="px-6 py-6">
            {/* ── IMAP : formulaire d'identifiants ── */}
            {step === 'form' && (
              <>
                <div className="flex items-center gap-3 pr-8">
                  <ProviderMark provider={provider} size={28} />
                  <h3 style={{ ...serifTitle, fontSize: 20 }}>Connectez votre boîte par IMAP</h3>
                </div>
                <p className="text-[13px] text-foreground-secondary leading-[20px] mt-2">
                  Pour une adresse @avocats.fr ou une messagerie d'hébergeur (OVH, Infomaniak…).
                  Plato s'y connecte en lecture seule, avec un mot de passe d'application.
                </p>

                <div className="flex flex-col gap-3.5 mt-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-foreground">Adresse email</span>
                    <input
                      type="email"
                      value={imapEmail}
                      onChange={(e) => setImapEmail(e.target.value)}
                      placeholder="vous@avocats.fr"
                      className="h-9 px-3 rounded-lg border border-border bg-surface text-[14px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-border-strong"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-foreground">Mot de passe d'application</span>
                    <input
                      type="password"
                      value={imapPass}
                      onChange={(e) => setImapPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-9 px-3 rounded-lg border border-border bg-surface text-[14px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-border-strong"
                    />
                    <span className="text-[11.5px] leading-[16px]" style={{ color: colors.semantic.mutedForeground }}>
                      Créez un mot de passe d'application dédié dans votre messagerie - jamais votre
                      mot de passe principal. Révocable à tout moment.
                    </span>
                  </label>

                  <div className="rounded-lg" style={{ backgroundColor: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, padding: '10px 12px' }}>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 text-[12px] leading-[17px]" style={{ color: colors.semantic.foregroundQuaternary }}>
                        Serveur détecté : <span className="font-medium text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5 }}>{imapHost}</span> · port 993 · SSL
                      </p>
                      <button type="button" onClick={() => setShowServer(s => !s)} className="text-[12px] font-medium text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0">
                        {showServer ? 'Masquer' : 'Modifier'}
                      </button>
                    </div>
                    {showServer && (
                      <div className="flex gap-2 mt-2.5">
                        <input defaultValue={imapHost} placeholder="Serveur IMAP" className="flex-1 h-8 px-2.5 rounded-md border border-border bg-surface text-[13px] text-foreground focus:outline-none focus:border-border-strong" />
                        <input defaultValue="993" placeholder="Port" style={{ width: 72 }} className="h-8 px-2.5 rounded-md border border-border bg-surface text-[13px] text-foreground focus:outline-none focus:border-border-strong" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <ConsentBlock scope={scope} label="Accès en lecture seule" />
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <p className="flex items-center gap-2 text-[11.5px] text-foreground-secondary leading-4 flex-1 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.accents.meadow }} strokeWidth={1.75} />
                    Connexion chiffrée (TLS). Vos identifiants sont stockés de façon sécurisée, en lecture seule.
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={onCancel} className="h-9 px-4 text-[14px] font-medium text-foreground-tertiary bg-surface border border-border rounded-lg hover:bg-background transition-colors">
                      Annuler
                    </button>
                    <button
                      onClick={() => imapReady && setStep('connecting')}
                      disabled={!imapReady}
                      className="inline-flex items-center gap-2 h-9 px-4 text-[14px] font-medium text-primary-foreground bg-foreground rounded-lg hover:bg-foreground-tertiary transition-opacity disabled:opacity-40"
                    >
                      Connecter
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── IMAP : vérification serveur (travail in-app de Plato) ── */}
            {step === 'connecting' && isImap && (
              <div className="flex flex-col items-center justify-center gap-3.5 text-center" style={{ padding: '28px 0' }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.semantic.foregroundQuaternary }} strokeWidth={1.75} />
                <p className="text-[13px] font-medium text-foreground">Connexion à {imapHost}…</p>
                <p className="text-[12px] text-foreground-secondary leading-[18px]" style={{ maxWidth: 280 }}>
                  Vérification de vos identifiants, en lecture seule.
                </p>
                <p className="flex items-center gap-1.5 text-[11.5px] text-foreground-secondary mt-1">
                  <Lock className="w-3 h-3" strokeWidth={2} /> Connexion chiffrée (TLS) - hébergement dans l'Union européenne
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
