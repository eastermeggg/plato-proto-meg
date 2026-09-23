// Modale de valeur « connecteur email » - la surface produit-marketing la plus
// visible du dispositif d'awareness. Elle s'ouvre au retour dans Plato (accueil
// dossiers) tant qu'aucune boîte n'est connectée, congédiable d'un geste.
//
// Le parti pris : un seul écran qui VEND. Le héros animé rejoue le versement
// (l'argument EST le visuel : boîte -> dossier, jamais l'inverse), puis quatre
// bénéfices concrets, les garanties invariables, un seul geste.
//
// Même vérité que le reste du dispositif (connectorData) : lecture seule, rien
// ne se verse sans votre geste, réversible - hébergé en UE. Le CTA renvoie vers
// le choix du fournisseur (MailConnectDialog), pas vers un formulaire.

import React, { useEffect } from 'react';
import { ArrowRight, Mail, Paperclip, Plug2, Search, ShieldCheck, X } from 'lucide-react';
import { ConnectorHero } from './ConnectorArt';
import { GuaranteeChips, SyncSoonTeaser } from './ConnectorPromo';
import { colors } from '../../design-system/tokens';

const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

// Quatre bénéfices - cadrage PLEIN (ce que vous obtenez), pas creux (ce que
// vous ne ferez plus). Strictement vrai : Plato extrait des échanges, aide à
// retrouver, conserve la provenance, reste en lecture seule - vous validez.
// Jamais de promesse de nommage/numérotage automatique. Icône en tuile pierre,
// titre gras + une ligne.
export const BENEFITS = [
  {
    Icon: Paperclip,
    title: 'Extraction directe',
    sub: 'Les pièces jointes rejoignent le dossier depuis vos emails, sans téléchargement.',
  },
  {
    Icon: Mail,
    title: 'L\'échange entier',
    sub: 'Le fil et ses pièces arrivent ensemble, pas fichier par fichier.',
  },
  {
    Icon: Search,
    title: 'Navigation facile',
    sub: 'Parcourez vos emails et retrouvez les bons échanges sans quitter Plato.',
  },
  {
    Icon: ShieldCheck,
    title: 'Vous gardez la main',
    sub: 'Lecture seule : rien n\'entre au dossier sans votre validation.',
  },
];

export default function MailValueModal({ open, onConnect, onDismiss }) {
  // Escape congédie - même convention que les autres modales.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onDismiss?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28,25,23,0.42)', backdropFilter: 'blur(4px)' }}
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mail-value-title"
        className="relative bg-surface rounded-xl border border-border flex flex-col overflow-hidden animate-fade-up"
        style={{ width: 600, maxWidth: '100%', boxShadow: '0 32px 72px -16px rgba(28,25,23,0.34)' }}
      >
        <button
          type="button"
          aria-label="Fermer"
          onClick={onDismiss}
          className="absolute z-10 flex items-center justify-center w-8 h-8 rounded-md text-foreground-muted hover:text-foreground hover:bg-cream transition-colors"
          style={{ top: 14, right: 14 }}
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* En-tête : eyebrow + promesse. Le titre en serif porte la valeur. */}
        <div className="flex flex-col px-8 pt-8 pb-5" style={{ gap: 12 }}>
          <div className="flex items-center">
            <span
              style={{
                fontFamily: MONO, fontSize: 11, fontWeight: 500,
                color: colors.semantic.mutedForeground, textTransform: 'uppercase',
                letterSpacing: '0.08em', lineHeight: 1,
              }}
            >
              Nouveau · Boîte mail
            </span>
          </div>
          <div className="flex flex-col" style={{ gap: 6, maxWidth: 500 }}>
            <h2
              id="mail-value-title"
              style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, color: colors.semantic.foreground, letterSpacing: '-0.4px', lineHeight: '32px' }}
            >
              Ne cherchez plus vos pièces : connectez votre boîte mail.
            </h2>
            <p className="text-[13.5px] text-foreground-secondary leading-[20px]">
              Choisissez les échanges d'une affaire : Plato en extrait les pièces, prêtes à verser. Vous validez.
            </p>
          </div>
        </div>

        {/* Héros animé - le versement rejoué. L'unique moment de mouvement. */}
        <div className="px-8">
          <ConnectorHero provider="outlook" kind="import" height={186} />
        </div>

        {/* Trois bénéfices concrets. */}
        <div className="flex flex-col px-8 pt-6" style={{ gap: 14 }}>
          {BENEFITS.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-start" style={{ gap: 12 }}>
              <span
                className="inline-flex items-center justify-center flex-shrink-0"
                style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: colors.semantic.muted, border: `1px solid ${colors.semantic.border}` }}
              >
                <Icon style={{ width: 16, height: 16, color: colors.semantic.foregroundTertiary }} strokeWidth={1.75} />
              </span>
              <div className="flex flex-col" style={{ gap: 1, paddingTop: 1 }}>
                <p className="text-[13.5px] font-medium text-foreground leading-5">{title}</p>
                <p className="text-[12.5px] leading-[17px]" style={{ color: colors.semantic.mutedForeground }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Garanties invariables - la réassurance en trois mots. */}
        <div className="flex justify-center px-8 pt-6">
          <GuaranteeChips />
        </div>

        {/* La suite annoncée - synchronisation automatique « à venir ». */}
        <div className="px-8 pt-5">
          <SyncSoonTeaser />
        </div>

        {/* Le geste - CTA plein + sortie en rendez-vous (pas un abandon), ce
            qui autorise à re-solliciter sans être insistant. */}
        <div className="flex flex-col items-center px-8 pt-6 pb-7" style={{ gap: 10 }}>
          <button
            type="button"
            onClick={onConnect}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-lg text-white transition-colors"
            style={{ height: 44, backgroundColor: colors.semantic.primary, fontSize: 14, fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.semantic.foregroundTertiary; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.semantic.foreground; }}
          >
            <Plug2 className="w-4 h-4" strokeWidth={1.75} />
            Connecter ma boîte · 2 min
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-[13px] font-medium text-foreground-muted hover:text-foreground-secondary transition-colors"
          >
            Plus tard
          </button>
          <p className="text-[12px] italic text-center leading-4" style={{ color: colors.semantic.foregroundMuted }}>
            On vous le reproposera à la prochaine pièce ajoutée à la main.
          </p>
        </div>
      </div>
    </div>
  );
}
