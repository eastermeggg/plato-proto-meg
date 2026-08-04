// Lab « Connecteur email - engagement & confiance ».
//
// Trois moments d'un même parcours, avec les VRAIS composants montés en
// situation (jamais de captures) :
//   1. L'engagement avant les réglages - bandeau et état vide qui amènent vers
//      le connecteur là où le besoin se manifeste.
//   2. La modale connecteur (grammaire Notion, voix Norma) - présentation,
//      consentement, autorisation OAuth stylisée, confirmation.
//   3. La galerie des briques - héros dessinés en code, fenêtre OAuth, marques.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plug2 } from 'lucide-react';
import MailConnectorModal from '../connectors/MailConnectorModal';
import { ConnectorPromoBanner, ConnectorPromoPanel, GuaranteeChips } from '../connectors/ConnectorPromo';
import { ConnectorHero, ConnectorMiniLink, OAuthWindow, ProviderMark } from '../connectors/ConnectorArt';
import { CONNECTOR_PROVIDERS } from '../connectors/connectorData';

const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";
const serifTitle = { fontFamily: SERIF, fontWeight: 500, color: '#292524', letterSpacing: '-0.3px', lineHeight: 1.2 };
const monoLabel = { fontFamily: MONO, fontWeight: 500, fontSize: 11, color: '#78716c', letterSpacing: '0.1em', textTransform: 'uppercase' };

function Section({ title, intro, children }) {
  return (
    <section className="mt-10">
      <h2 style={{ ...serifTitle, fontSize: 19 }}>{title}</h2>
      {intro && <p className="text-[13px] text-foreground-secondary leading-5 mt-1.5" style={{ maxWidth: 640 }}>{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Frame({ label, children, pad = true }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className={`rounded-xl border border-border overflow-hidden ${pad ? 'p-5' : ''}`} style={{ backgroundColor: '#fdfdfc' }}>
        {children}
      </div>
      <p style={monoLabel}>{label}</p>
    </div>
  );
}

export default function ConnecteursLab() {
  const navigate = useNavigate();
  // Deep-link de revue : /ui-kit/connecteurs?modal=outlook|gmail&tab=import|sync
  // Capture : ?hero=import|sync&provider=outlook|gmail rend le héro SEUL,
  // plein cadre (fenêtre 592×182) - pour exporter le visuel tel que rendu.
  const params = new URLSearchParams(window.location.search);
  const heroKind = params.get('hero');
  const [modal, setModal] = useState(params.get('modal')); // null | 'outlook' | 'gmail'
  // Scope de la boîte en cours de connexion (spec « Connexion boîtes mail ») :
  // personal = Ma boîte, visible par son owner seul · shared = boîte du
  // cabinet, geste admin. Deep-link : ?scope=shared.
  const [modalScope, setModalScope] = useState(params.get('scope') === 'shared' ? 'shared' : 'personal');
  const initialTab = params.get('tab') === 'sync' ? 'sync' : 'import';
  const [connected, setConnected] = useState(null); // provider id une fois « Terminer »
  const [bannerGone, setBannerGone] = useState(false);
  const [toast, setToast] = useState(null);

  // Capture : le héro seul, plein cadre - APRÈS les hooks (ordre stable).
  if (heroKind) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#ffffff' }}>
        <ConnectorHero provider={params.get('provider') || 'outlook'} kind={heroKind} height={182} freezeChip={params.get('chip') === '1'} />
      </div>
    );
  }

  const finish = (account) => {
    setConnected(modal);
    setModal(null);
    setToast(`${account} connectée en lecture seule.`);
    setTimeout(() => setToast(null), 3200);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f7f5' }}>
      <div className="mx-auto" style={{ maxWidth: 1040, padding: '28px 32px 72px' }}>
        <button
          onClick={() => navigate('/ui-kit')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} /> UI Kit
        </button>

        <h1 className="mt-4" style={{ ...serifTitle, fontSize: 27 }}>Connecteur email - engagement et confiance</h1>
        <p className="text-[13.5px] text-foreground-secondary leading-[21px] mt-2" style={{ maxWidth: 680 }}>
          Le parcours de connexion d'une boîte mail, pensé pour des avocats exigeants sur la donnée :
          l'engagement commence avant les réglages, la modale vend la valeur en montrant le produit
          (illustrations dessinées en code), et les garanties RGPD - lecture seule, hébergement UE,
          réversibilité - restent visibles à chaque étape. Le workspace porte une liste de boîtes,
          chacune avec son scope : personnelle (visible par son owner seul) ou cabinet (partagée) -
          l'emplacement du geste dit la privacy. Périmètre : dossiers, emails, pièces jointes ;
          la synchronisation automatique est annoncée « à venir ».
        </p>

        {/* ── 1 · Avant les réglages ── */}
        <Section
          title="1 · L'engagement avant les réglages"
          intro="Le connecteur ne vit pas caché dans un menu : un bandeau congédiable sur les pages pièces, et l'état vide de la colonne mail qui porte la promesse. Les deux ouvrent la même modale."
        >
          <div className="flex flex-col gap-6">
            <Frame label="Bandeau - page pièces d'un dossier (congédiable)">
              {bannerGone ? (
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] text-foreground-muted">Bandeau masqué - il ne reviendra pas sur ce dossier.</p>
                  <button onClick={() => setBannerGone(false)} className="text-[12.5px] font-medium text-foreground-secondary hover:text-foreground transition-colors">Réafficher</button>
                </div>
              ) : (
                <ConnectorPromoBanner onConnect={() => setModal('outlook')} onDismiss={() => setBannerGone(true)} />
              )}
            </Frame>

            <Frame label="État vide - colonne mail, aucune boîte connectée" pad={false}>
              <div className="flex" style={{ height: 380 }}>
                <div className="flex flex-col border-r border-border" style={{ width: 440, backgroundColor: '#f8f7f5' }}>
                  <ConnectorPromoPanel provider="outlook" compact onConnect={() => setModal('outlook')} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[12px] text-foreground-muted px-8 text-center leading-5">Le panier reste vide tant que la boîte n'est pas connectée - la colonne porte seule l'argument.</p>
                </div>
              </div>
            </Frame>
          </div>
        </Section>

        {/* ── 2 · La modale ── */}
        <Section
          title="2 · La modale connecteur"
          intro="La grammaire des connecteurs Notion dans la voix Norma : rail identité à gauche (types de connexion, garanties permanentes), panneau valeur à droite. Le consentement est le périmètre affiché avant tout clic ; l'autorisation se joue dans la fenêtre stylisée du fournisseur ; la synchronisation automatique est un onglet « à venir »."
        >
          <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 640 }}>
            {['outlook', 'gmail'].map(id => {
              const p = CONNECTOR_PROVIDERS[id];
              const isConnected = connected === id;
              return (
                <div key={id} className="bg-white rounded-xl border border-border p-5 flex flex-col items-start gap-3" style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.05)' }}>
                  <ProviderMark provider={id} size={30} />
                  <div>
                    <p className="text-[14px] font-medium text-foreground">{p.name}</p>
                    <p className="text-[12px] text-foreground-secondary mt-0.5">{p.desc}</p>
                  </div>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[11.5px] font-medium" style={{ backgroundColor: '#e4efe8', color: '#4a9168' }}>
                      <Check className="w-3 h-3" strokeWidth={3} /> Connectée - lecture seule
                    </span>
                  ) : (
                    <button
                      onClick={() => { setModalScope('personal'); setModal(id); }}
                      className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-white bg-foreground rounded-lg hover:bg-foreground-tertiary transition-colors"
                    >
                      <Plug2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Ouvrir la modale
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── 3 · Deux gestes, deux emplacements ── */}
        <Section
          title="3 · Deux gestes, deux emplacements"
          intro="Le workspace porte une LISTE de boîtes ; chaque boîte porte son scope. La localisation du geste dit la privacy : un non-admin ne peut brancher QUE du personal - le scope n'est jamais un toggle offert. La boîte est privée, le DOSSIER est le lieu du partage : le seul pont est le geste de verser."
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                scope: 'personal', place: 'Votre compte › Ma boîte', title: 'Connecter ma boîte',
                copy: 'Votre boîte - visible par vous seul. Ce que vous versez dans un dossier devient accessible au cabinet.',
                note: 'Self-service, le geste PRINCIPAL. Cas dominant (Julien, Marylin) : chaque avocat sa boîte, les dossiers se travaillent à plusieurs via le dossier commun.',
              },
              {
                scope: 'shared', place: 'Organisation › Connecteurs', title: 'Boîtes communes du cabinet',
                copy: 'Boîtes communes - cabinet@, accueil@… - connectées une fois pour tout le cabinet.',
                note: 'Geste admin, token rattaché au workspace. Liste visible par tous (statut, dernière vérification), actions admin only. Cas Benzera : la boîte commune est le cas SIMPLE du modèle.',
              },
            ].map(c => (
              <div key={c.scope} className="bg-white rounded-xl border border-border p-5 flex flex-col items-start gap-2" style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.05)' }}>
                <p style={monoLabel}>{c.place}</p>
                <p className="text-[15px] font-medium text-foreground">{c.title}</p>
                <p className="text-[12.5px] text-foreground-secondary leading-[19px]">{c.copy}</p>
                <p className="text-[12px] text-foreground-muted leading-[18px]">{c.note}</p>
                <button
                  onClick={() => { setModalScope(c.scope); setModal('outlook'); }}
                  className="mt-2 inline-flex items-center gap-2 h-8 px-3 text-[12.5px] font-medium text-foreground-secondary bg-white border border-border rounded-lg hover:bg-cream hover:text-foreground transition-colors"
                >
                  <Plug2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Modale en scope {c.scope}
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4 · Les briques ── */}
        <Section
          title="4 · Les briques, dessinées en code"
          intro="Aucun asset bitmap : marques SVG, carte Norma miniature qui rejoue le vrai bordereau (coche, coude de PJ, cote), pièce qui voyage de la boîte vers le dossier, fenêtre OAuth stylisée dont la barre d'adresse verrouillée est l'argument."
        >
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <Frame label="Héro « import » - la pièce voyage, sens unique" pad={false}>
                <div className="p-4"><ConnectorHero provider="outlook" kind="import" height={188} /></div>
              </Frame>
              <Frame label="Héro « synchronisation » - la nouveauté se propose" pad={false}>
                <div className="p-4"><ConnectorHero provider="gmail" kind="sync" height={188} /></div>
              </Frame>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Frame label="Fenêtre d'autorisation stylisée - le mot de passe reste chez le fournisseur">
                <div className="flex justify-center py-2">
                  <OAuthWindow provider="outlook">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[13px] font-medium text-foreground">Autorisation chez Microsoft…</p>
                      <p className="text-[12px] text-foreground-secondary leading-[18px]" style={{ maxWidth: 250 }}>
                        Validez la lecture seule dans cette fenêtre.
                      </p>
                    </div>
                  </OAuthWindow>
                </div>
              </Frame>
              <Frame label="Mini-lien et chips de garanties - la réassurance en trois mots">
                <div className="flex flex-col items-center gap-6 py-6">
                  <ConnectorMiniLink both tileSize={46} />
                  <ConnectorMiniLink provider="gmail" tileSize={46} />
                  <GuaranteeChips />
                </div>
              </Frame>
            </div>
          </div>
        </Section>
      </div>

      {modal && (
        <MailConnectorModal
          provider={modal}
          account={modalScope === 'shared' ? 'cabinet@durand-avocats.fr' : 'marie@durand-avocats.fr'}
          scope={modalScope}
          initialTab={initialTab}
          onClose={() => setModal(null)}
          onFinish={finish}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-foreground text-white text-[13px] font-medium rounded-lg px-4 py-2.5" style={{ boxShadow: '0 8px 24px -6px rgba(28,25,23,0.35)' }}>
          <Check className="w-4 h-4" strokeWidth={2.5} /> {toast}
        </div>
      )}
    </div>
  );
}
