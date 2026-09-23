import React, { useState } from 'react';
import {
  User, UsersRound, AlertTriangle, Receipt, Plus, Download,
  ChevronDown, ChevronRight, Settings2, CircleArrowUp,
  Bold, Italic, Underline,
  PanelRight, Copy, ThumbsUp, ThumbsDown, IterationCw,
} from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Item from '../ui/Item';
import TopBar from '../ui/TopBar';
import IVAvatar from '../IVAvatar';
import PlatoIcon from '../shell/PlatoIcon';
import AssistantComposer from '../assistant/AssistantComposer';
import SectionCalculation from '../ui/tables/SectionCalculation';
import RowCalculation from '../ui/tables/RowCalculation';
import TotalSubtotal from '../ui/tables/TotalSubtotal';
import TotalsAmountPills from '../ui/tables/TotalsAmountPills';
import RowPGP from '../ui/tables/RowPGP';
import JPListing from '../jp/JPListing';

// ─────────────────────────────────────────────────────────────────────────────
// Contenus MOCK des onglets du shell dossier, pour le playground Blocks.
// Compose UNIQUEMENT les composants canoniques (ui/, ui/tables/, jp/) sur des
// données locales - aucun state produit. Vérité Figma :
//   - Onglet Informations   → « PI - Infos Dossier & Victimes » (1078:48402)
//   - Onglet Chiffrage      → « PI - Chiffrage Overview » (1078:48403)
//   - Poste niveau 3 (PGPA) → « Poste - Layout Template (Base) » (1078:44413) :
//     params strip → table block(s) → total summary → notes → JP.
// ─────────────────────────────────────────────────────────────────────────────

const noop = () => {};

const mono11 = {
  fontFamily: typography.fontFamily.mono,
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
};
const body = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,
  lineHeight: `${typography.scale.body.lineHeight}px`,
  fontWeight: 400,
};
const bodyMedium = { ...body, fontWeight: 500 };
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,
  lineHeight: `${typography.scale.caption.lineHeight}px`,
  fontWeight: 400,
};

// ── Chat Plato (rail droit du dossier / fil central de conversation) ─────────
// Chrome relevé sur l'app (renderChatSidebar) : header h-12 (collapse + Plato +
// titre du fil), fil sur fond background, composer canonique en pied.

function UserBubble({ children }) {
  return (
    <div className="flex flex-col items-end" style={{ paddingLeft: 32 }}>
      <div style={{
        backgroundColor: colors.semantic.primary, borderRadius: 2, padding: '10px 12px',
        boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)', position: 'relative', maxWidth: '85%', overflow: 'hidden',
      }}>
        <p style={{ ...body, color: colors.semantic.primaryForeground, margin: 0, whiteSpace: 'pre-wrap' }}>{children}</p>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: 'inset 0px -5px 8px 0px rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

function AiMessage({ children }) {
  return (
    <div className="flex flex-col gap-2" style={{ paddingRight: 16 }}>
      <p style={{ ...body, color: colors.semantic.foreground, margin: 0, whiteSpace: 'pre-wrap' }}>{children}</p>
      <div className="flex items-center gap-1">
        {[Copy, ThumbsUp, ThumbsDown, IterationCw].map((Icon, i) => (
          <Button key={i} variant="ghost" size="icon-xs" icon={Icon} onClick={noop} />
        ))}
      </div>
    </div>
  );
}

function ChatThread({ messages }) {
  return messages.map((m, i) => (m.role === 'user'
    ? <UserBubble key={i}>{m.text}</UserBubble>
    : <AiMessage key={i}>{m.text}</AiMessage>));
}

// Panneau latéral Plato du dossier (l'app l'affiche à 408px ; ici 320 pour la
// densité du canvas de démo). Toujours visible dans le block matter.
export function MatterChatPanel({ title = "Prescription de l'action en indemnisation", messages = [] }) {
  return (
    <div className="flex flex-col flex-shrink-0 border-l border-border" style={{ width: 320, background: colors.semantic.background }}>
      {/* En-tête du panneau : la barre canonique TopBar (jamais de barre inline). */}
      <TopBar
        leading={(
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon-sm" icon={PanelRight} onClick={noop} title="Masquer le chat" />
            <PlatoIcon />
          </div>
        )}
        left={(
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="min-w-0 truncate" style={{ ...bodyMedium, color: colors.semantic.foreground }}>{title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
          </div>
        )}
        right={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={noop} title="Nouvelle conversation" />}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <ChatThread messages={messages} />
      </div>
      <div className="px-2.5 pb-2.5 flex-shrink-0">
        <AssistantComposer placeholder="Demander à Plato de calculer, chercher des JP, rédiger des actes…" />
      </div>
    </div>
  );
}

// Fil central de la page Conversation (shell générique) : thread + composer.
export function ConversationContent() {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: colors.semantic.background }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ChatThread messages={[
            { role: 'user', text: 'Quel est le délai de préavis en cas de rupture conventionnelle ?' },
            { role: 'ai', text: "La rupture conventionnelle ne comporte pas de préavis au sens strict : la date de rupture est fixée d'un commun accord dans la convention, au plus tôt le lendemain du jour de l'homologation par la DREETS (art. L. 1237-13 C. trav.). Le salarié bénéficie en revanche d'un délai de rétractation de 15 jours calendaires." },
          ]} />
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: '0 20px 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <AssistantComposer placeholder="Posez une question, chiffrez, rédigez…" />
        </div>
      </div>
    </div>
  );
}

// Zone scrollable commune : le contenu d'onglet vit dans le workspace du shell.
function TabScroll({ children, maxWidth = 960 }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: colors.semantic.background }}>
      <div style={{ maxWidth, margin: '0 auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

// Carte de section (Infos dossier) : en-tête mono + rangées de champs.
function SectionCard({ icon: Icon, title, action, children }) {
  return (
    <div className="bg-surface rounded-[5px] border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-foreground-secondary" strokeWidth={1.5} />
          <span style={{ ...mono11, color: colors.semantic.mutedForeground }}>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, long = false }) {
  return (
    <div className="flex-1 px-5 py-4 space-y-1">
      <div className="text-caption-medium text-foreground-secondary">{label}</div>
      <div className={`text-body text-foreground ${long ? 'leading-relaxed' : ''}`}>{value}</div>
    </div>
  );
}

// ── Onglet Informations ──────────────────────────────────────────────────────

const VICTIMES_INDIRECTES = [
  { nom: 'Julien Martel', meta: 'Époux · 34 ans', color: 'plum', type: 'king' },
  { nom: 'Emma Martel', meta: 'Fille · 6 ans', color: 'green', type: 'pawn' },
];

const TIERS_PAYEURS = [
  {
    id: 'cpam', sigle: 'CPAM', nom: 'Île-de-France', total: '874 500 €',
    creances: [
      { acronym: 'DSA', label: 'Dépenses de santé actuelles', montant: '5 530 €' },
      { acronym: 'PGPA', label: 'Indemnités journalières', montant: '11 650 €' },
      { acronym: 'PGPF', label: 'Rente accident du travail', montant: '857 320 €' },
    ],
  },
  {
    id: 'harmonie', sigle: 'Harmonie', nom: 'Mutuelles', total: '12 300 €',
    creances: [
      { acronym: 'DSA', label: 'Frais de santé complémentaires', montant: '12 300 €' },
    ],
  },
];

export function InfosTabContent() {
  const [openTP, setOpenTP] = useState('cpam');
  return (
    <TabScroll>
      {/* Victime directe */}
      <SectionCard icon={User} title="Victime directe">
        <div className="flex border-b border-border">
          <Field label="Nom" value="Martel" />
          <Field label="Prénom" value="Annabelle-Sophie" />
        </div>
        <div className="flex">
          <Field label="Sexe" value="Féminin" />
          <Field
            label="Date de naissance"
            value={(
              <span className="flex items-center gap-2">
                28/09/1994
                <span className="w-1 h-1 rounded-full bg-border-alt" />
                <span className="text-body text-foreground-secondary">31 ans</span>
              </span>
            )}
          />
        </div>
      </SectionCard>

      {/* Victimes indirectes */}
      <SectionCard
        icon={UsersRound}
        title="Victimes indirectes"
        action={<Button variant="ghost" size="sm" icon={Plus} label="Ajouter" onClick={noop} />}
      >
        {VICTIMES_INDIRECTES.map((vi, i) => (
          <div key={vi.nom} className={i < VICTIMES_INDIRECTES.length - 1 ? 'border-b border-border' : ''}>
            <Item
              media={<IVAvatar size={32} color={vi.color} type={vi.type} />}
              title={vi.nom}
              description={vi.meta}
              actions={<ChevronRight className="w-4 h-4 text-foreground-muted" strokeWidth={1.75} />}
              onClick={noop}
            />
          </div>
        ))}
      </SectionCard>

      {/* Fait générateur */}
      <SectionCard icon={AlertTriangle} title="Fait générateur">
        <div className="flex border-b border-border">
          <Field label="Type" value="Accident de la route" />
          <Field label="Date du fait générateur" value="15/03/2023" />
        </div>
        <div className="flex border-b border-border">
          <Field label="Date de consolidation" value="12/09/2024" />
          <Field label="Date de liquidation" value="12/01/2025" />
        </div>
        <div className="flex">
          <Field
            long
            label="Résumé des faits"
            value="Accident de la circulation survenu le 15 mars 2023. Mme Martel circulait à vélo lorsqu'elle a été percutée par un véhicule automobile. Traumatisme du membre inférieur gauche avec fracture du plateau tibial. Hospitalisation de 8 jours au CHU de Bordeaux, suivie d'une rééducation de 18 mois."
          />
        </div>
      </SectionCard>

      {/* Tiers payeurs */}
      <SectionCard icon={Receipt} title="Tiers payeurs">
        {TIERS_PAYEURS.map((tp, i) => {
          const expanded = openTP === tp.id;
          return (
            <div key={tp.id} className={i < TIERS_PAYEURS.length - 1 ? 'border-b border-border' : ''}>
              <Item
                icon={expanded ? ChevronDown : ChevronRight}
                title={tp.sigle}
                description={tp.nom}
                actions={(
                  <span style={{ fontFamily: typography.fontFamily.mono, fontSize: 13, fontWeight: 500, color: colors.semantic.foreground }}>
                    {tp.total}
                  </span>
                )}
                onClick={() => setOpenTP(expanded ? null : tp.id)}
              />
              {expanded && (
                <div className="pb-2 pl-8">
                  {tp.creances.map((c) => (
                    <Item
                      key={c.label}
                      size="sm"
                      media={<Badge variant="outline" label={c.acronym} />}
                      title={c.label}
                      description={null}
                      actions={<span style={{ ...caption, color: colors.semantic.mutedForeground }}>{c.montant}</span>}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </SectionCard>
    </TabScroll>
  );
}

// ── Onglet Chiffrage (overview) ──────────────────────────────────────────────

const POSTES_VD = [
  {
    group: 'Préjudices patrimoniaux temporaires',
    rows: [
      { accronym: 'DSA', label: 'Dépenses de santé actuelles', amounts: ['5 530 €', '712,50 €'], amount: '6 242,50 €', nature: 'CPAM' },
      { accronym: 'PGPA', label: 'Pertes de gains professionnels actuels', amounts: ['16 500 €', '6 700 €'], amount: '6 700 €', nature: 'Salariale' },
      { accronym: 'ATPT', label: 'Assistance tierce personne temporaire', amounts: ['—', '4 800 €'], amount: '4 800 €', nature: 'Familiale' },
    ],
  },
  {
    group: 'Préjudices extrapatrimoniaux temporaires',
    rows: [
      { accronym: 'DFT', label: 'Déficit fonctionnel temporaire', amounts: ['—', '5 385 €'], amount: '5 385 €', nature: 'Référentiel' },
      { accronym: 'SE', label: 'Souffrances endurées', amounts: ['—', '15 000 €'], amount: '15 000 €', nature: 'Référentiel' },
    ],
  },
  {
    group: 'Préjudices patrimoniaux permanents',
    rows: [
      { accronym: 'PGPF', label: 'Pertes de gains professionnels futurs', amounts: ['857 320 €', '6 922,50 €'], amount: '6 922,50 €', showRente: true, rente: '+ 9 450 € / an', nature: 'Salariale' },
    ],
  },
  {
    group: 'Préjudices extrapatrimoniaux permanents',
    rows: [
      { accronym: 'DFP', label: 'Déficit fonctionnel permanent', amounts: ['—', '27 000 €'], amount: '27 000 €', nature: 'Référentiel' },
      { accronym: 'PEP', label: 'Préjudice esthétique permanent', amounts: ['—', '4 500 €'], amount: '4 500 €', nature: 'Référentiel' },
    ],
  },
];

const POSTES_VI = [
  {
    accronym: 'FDV', label: 'Frais divers des proches', amount: '1 200 €',
    sublines: [
      { name: 'Julien Martel', lien: '(Époux)', amount: '700 €', color: 'plum' },
      { name: 'Emma Martel', lien: '(Fille)', amount: '500 €', color: 'green' },
    ],
  },
  {
    accronym: 'PAF', label: "Préjudice d'affection", amount: '15 350 €',
    sublines: [
      { name: 'Julien Martel', lien: '(Époux)', amount: '9 000 €', color: 'plum' },
      { name: 'Emma Martel', lien: '(Fille)', amount: '6 350 €', color: 'green' },
    ],
  },
];

const TableCard = ({ children }) => (
  <div className="bg-surface rounded-[5px] border border-border shadow-sm overflow-hidden">
    {children}
  </div>
);

export function ChiffrageTabContent({ withVI = true }) {
  return (
    <TabScroll maxWidth={1200}>
      {/* Barre d'outils : totaux + actions (wrap si le rail réduit la place) */}
      <div className="flex items-center flex-wrap gap-2">
        <TotalsAmountPills type="totalIndemn" label="Total demandé" value={withVI ? '93 100 €' : '76 550 €'} />
        <TotalsAmountPills type="totalExp" label="Total dépenses" value="6 242,50 €" />
        <TotalsAmountPills type="rac" label="Reste à charge" value="712,50 €" />
        <div className="flex-1" />
        <Button variant="outline" size="sm" icon={Download} label="Exporter" onClick={noop} />
        <Button variant="primary" size="sm" icon={Plus} label="Nouveau poste" onClick={noop} />
      </div>

      {/* Victime directe */}
      <SectionCalculation victimType="direct" name="Annabelle-Sophie Martel" amount="76 550 €" style={{ marginTop: 4 }} />
      <TableCard>
        {POSTES_VD.map((g) => (
          <React.Fragment key={g.group}>
            <RowCalculation type="header" victims="direct" label={g.group} />
            {g.rows.map((r) => (
              <RowCalculation
                key={r.accronym}
                type="multiCol"
                victims="direct"
                accronym={r.accronym}
                label={r.label}
                amounts={r.amounts}
                amount={r.amount}
                nature={r.nature}
                showRente={r.showRente}
                rente={r.rente}
                onClick={noop}
              />
            ))}
          </React.Fragment>
        ))}
      </TableCard>

      {withVI && (
        <>
          {/* Victimes indirectes - par poste */}
          <SectionCalculation victimType="indirect" count={2} amount="16 550 €" activeTab={0} onTabChange={noop} style={{ marginTop: 8 }} />
          <TableCard>
            {POSTES_VI.map((p) => (
              <React.Fragment key={p.accronym}>
                <RowCalculation
                  type="multiCol"
                  victims="direct"
                  accronym={p.accronym}
                  label={p.label}
                  amounts={['—', p.amount]}
                  amount={p.amount}
                  nature={p.accronym === 'FDV' ? 'Familiale' : 'Référentiel'}
                  onClick={noop}
                />
                {p.sublines.map((s) => (
                  <RowCalculation
                    key={s.name}
                    type="subline"
                    victims="indirect"
                    name={s.name}
                    lien={s.lien}
                    amount={s.amount}
                    avatarColor={s.color}
                    onClick={noop}
                  />
                ))}
              </React.Fragment>
            ))}
          </TableCard>

          {/* Total consolidé */}
          <TotalSubtotal
            variant="emphasis"
            title="Indemnisation totale"
            amount="93 100 €"
            details={[
              { label: 'Victime directe', value: '76 550 €' },
              { label: 'Victimes indirectes', value: '16 550 €' },
              { label: 'Tiers payeurs', value: '886 800 €' },
            ]}
          />
        </>
      )}
    </TabScroll>
  );
}

// ── Chiffrage > détail poste (PGPA) - Layout Template (Base) ────────────────
// Ordre du template : params strip → table block(s) → total summary → notes → JP.

function BlockHeader({ label, count }) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      <span style={{ ...mono11, color: colors.semantic.mutedForeground }}>{label}</span>
      {count != null && <Badge variant="outline" count={count} />}
    </div>
  );
}

const NOTES_PGPA = [
  "La victime occupait un poste de cadre commercial avec un revenu annuel de référence de 37 800 € net, établi sur la moyenne des revenus 2021-2022 revalorisés selon l'indice IPC.",
  "Durant la période d'arrêt de travail (18 mois, du 15/03/2023 au 12/09/2024), la victime a perçu un maintien partiel de salaire par son employeur (8 500 €) ainsi que des indemnités journalières CPAM (11 650 €) et de prévoyance AG2R (4 850 €). La perte nette s'établit à 6 700 €.",
];

export function PosteDetailContent() {
  return (
    <TabScroll maxWidth={1040}>
      {/* PARAMS STRIP - Badges canoniques en attendant le composant Params dédié
          (Figma « LOCAL COMPONENTS > PARAMS » 1613:113399, non porté). */}
      <div className="bg-surface rounded-[5px] border border-border shadow-sm px-3 py-2.5 flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" icon={Settings2} onClick={noop} title="Paramètres du poste" />
        <Badge variant="info" size="md" leftIcon={CircleArrowUp} label="Revaloriser · IPC Annuel" />
        <Badge variant="secondary" size="md" label="Perte de chance · 100 %" />
        <Badge variant="secondary" size="md" label="Période · 15/03/2023 → 12/09/2024" />
      </div>

      {/* TABLE BLOCK - Salaire de référence */}
      <TableCard>
        <RowPGP
          family="reference"
          type="title"
          title="Salaire de référence"
          amount="3 150 € "
          amountSuffix="/ mois"
          description="soit 31 700 € attendus sur la période (18 mois)"
        />
        <RowPGP family="reference" type="header" />
        <RowPGP family="reference" type="line" label="Salaire net imposable — 2022" showRevalorisation revalue="42 000 €" amount="43 680 €" onClick={noop} />
        <RowPGP family="reference" type="line" label="Salaire net imposable — 2021" showRevalorisation revalue="39 500 €" amount="41 900 €" onClick={noop} />
        <RowPGP family="reference" type="footer" label="Moyenne mensuelle revalorisée" amount="3 150 € / mois" />
      </TableCard>

      {/* TABLE BLOCK × TIMES - Revenus perçus & IJ */}
      <TableCard>
        <RowPGP family="perceived" type="title" title="Revenus perçus & indemnités journalières" amount="25 000 €" />
        <RowPGP family="perceived" type="header" />
        <RowPGP family="perceived" type="line" showDescription label="Maintien de salaire" sublabel="Employeur" dateStart="15/03/2023" dateEnd="12/09/2024" amount="8 500 €" onClick={noop} />
        <RowPGP family="perceived" type="line" showDescription label="Indemnités journalières" sublabel="CPAM" dateStart="15/03/2023" dateEnd="12/09/2024" amount="11 650 €" onClick={noop} />
        <RowPGP family="perceived" type="line" showDescription label="Indemnités journalières" sublabel="Prévoyance AG2R" dateStart="15/03/2023" dateEnd="12/09/2024" amount="4 850 €" onClick={noop} />
      </TableCard>

      {/* TOTAL SUMMARY BLOCK */}
      <TotalSubtotal
        variant="expanded"
        defaultExpanded
        title="Total perte PGPA"
        amount="6 700 €"
        details={[
          { label: 'Revenus attendus sur la période (18 mois)', value: '31 700 €' },
          { label: 'Maintien de salaire perçu', value: '− 8 500 €' },
          { label: 'Indemnités journalières perçues', value: '− 16 500 €' },
        ]}
      />

      {/* NOTES / ARGUMENTAIRE */}
      <div className="flex flex-col gap-2.5 pt-2">
        <BlockHeader label="Notes / Argumentaire" />
        <div className="bg-surface rounded-[5px] border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border">
            {[Bold, Italic, Underline].map((Icon, i) => (
              <Button key={i} variant="ghost" size="icon-sm" icon={Icon} onClick={noop} />
            ))}
          </div>
          <div className="px-4 py-3.5 space-y-3">
            {NOTES_PGPA.map((p, i) => (
              <p key={i} style={{ ...body, color: colors.semantic.foreground }} className="leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </div>

      {/* JP */}
      <div className="flex flex-col gap-2.5 pt-2">
        <BlockHeader label="Jurisprudences retenues" count={1} />
        <JPListing
          variant="detail"
          jurisdiction="CA Bordeaux · 5e Ch."
          date="12/03/2024"
          numero="n°22/04581"
          profile="Homme, 42 ans, cadre commercial"
          tags={[{ label: 'Accident de la circulation' }, { label: 'Arrêt 18 mois' }]}
          quantum={{ poste: 'PGPA', value: '42 350 €' }}
          note="La cour retient le différentiel entre le salaire net et les indemnités journalières perçues sur la période d'arrêt, revalorisé selon l'indice IPC."
          posteChips={['PGPA']}
          onClick={noop}
        />
      </div>
    </TabScroll>
  );
}
