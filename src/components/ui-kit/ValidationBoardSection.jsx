import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Check, ListChecks } from 'lucide-react';
import { colors, radius, shadows } from '../../design-system/tokens';
import dsInventory from '../../data/designSystemInventory.json';
import { getComponentDemo } from './componentDemos';
import StatusPill from './StatusPill';
import Checkbox from '../ui/Checkbox';
import Button from '../ui/Button';

// ─────────────────────────────────────────────────────────────────────────────
// Board de validation groupée - la passe steward « pending -> validated »
// en 15 minutes au lieu de 27 pages.
//
// Tous les composants `pending` de l'inventaire, mini-démo côte à côte.
// Pour chacun : Valider (checkbox) ou À revoir (+ note). En pied : UN SEUL
// « Copy prompt » pour le lot, collé ensuite dans Claude Code - même mécanique
// que la page /ui-kit/c/<id> (UpdateEntryForm), le steward ne touche jamais
// le JSON à la main.
// ─────────────────────────────────────────────────────────────────────────────

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";

// Valeurs par défaut d'une démo : les defaults déclarés par ses controls -
// exactement ce que la sandbox affiche à l'ouverture.
const demoDefaults = (demo) =>
  Object.fromEntries(Object.entries(demo?.controls || {}).map(([k, c]) => [k, c.default]));

function DemoBox({ id }) {
  const demo = getComponentDemo(id);
  if (!demo || demo.placeholder || typeof demo.render !== 'function') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, fontSize: 12, color: colors.semantic.mutedForeground }}>
        Démo manquante - valider depuis la fiche
      </div>
    );
  }
  return (
    <div style={{ padding: 16, minHeight: 120, maxHeight: 280, overflow: 'auto', display: 'flex', alignItems: 'flex-start' }}>
      {demo.render(demoDefaults(demo))}
    </div>
  );
}

function ValidationCard({ entry, decision, onDecide, navigate }) {
  const verdict = decision?.verdict || null;
  const borderColor =
    verdict === 'validated' ? colors.badge.success.fg
      : verdict === 'needs-revision' ? colors.badge.warning.fg
        : colors.semantic.border;
  return (
    <div style={{ border: `1px solid ${borderColor}`, borderRadius: radius.xl, background: colors.semantic.card, boxShadow: shadows.xs, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* En-tête : nom (lien fiche) + famille + statut */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${colors.semantic.borderSubtle}` }}>
        <button /* ds-raw-ok: lien-titre serif vers la fiche - pas un bouton d'action, aucun variant Button ne couvre ce rôle */
          onClick={() => navigate(`/ui-kit/c/${entry.id}`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: SERIF, fontSize: 17, fontWeight: 500, color: colors.semantic.foreground }}
        >
          {entry.id}
          <ArrowUpRight style={{ width: 13, height: 13, color: colors.semantic.mutedForeground }} />
        </button>
        <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.semantic.mutedForeground }}>
          {entry.family}
        </span>
        <span style={{ marginLeft: 'auto' }}><StatusPill status={entry.status} /></span>
      </div>

      {/* La démo, sur ses valeurs par défaut */}
      <div style={{ flex: 1, background: colors.semantic.background }}>
        <DemoBox id={entry.id} />
      </div>

      {/* Verdict */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: `1px solid ${colors.semantic.borderSubtle}` }}>
        <Checkbox
          checked={verdict === 'validated'}
          label="Valider"
          onChange={(next) => onDecide(entry.id, next ? { verdict: 'validated' } : null)}
        />
        <Checkbox
          checked={verdict === 'needs-revision'}
          label="À revoir"
          onChange={(next) => onDecide(entry.id, next ? { verdict: 'needs-revision', note: decision?.note || '' } : null)}
        />
        {verdict === 'needs-revision' && (
          <input /* ds-raw-ok: champ de note inline du board steward - l'Input DS (label vertical) serait disproportionné ici */
            value={decision?.note || ''}
            onChange={(e) => onDecide(entry.id, { verdict: 'needs-revision', note: e.target.value })}
            placeholder="Quoi revoir ?"
            style={{ flex: 1, minWidth: 0, fontSize: 12, padding: '4px 8px', border: `1px solid ${colors.semantic.border}`, borderRadius: radius.md, background: colors.semantic.card, color: colors.semantic.foreground, outline: 'none' }}
          />
        )}
      </div>
    </div>
  );
}

const buildLotPrompt = (validated, revisions) => {
  const lines = [
    'Passe de validation steward (board /ui-kit/validation).',
    '',
    'Dans `src/data/designSystemInventory.json`, applique EXACTEMENT ceci, sans toucher aux autres champs ni aux autres entrées :',
  ];
  if (validated.length) {
    lines.push('', `Passe \`"status": "validated"\` pour : ${validated.join(', ')}.`);
  }
  if (revisions.length) {
    lines.push('', 'Passe `"status": "needs-revision"` pour :');
    for (const r of revisions) lines.push(`- ${r.id}${r.note ? ` - note à ajouter dans "notes" : ${r.note}` : ''}`);
  }
  lines.push('', 'Ensuite : `npm run ds:doctor && npm run build` (0 constat bloquant), puis commit `chore(ds): passe de validation steward - N composants`.');
  return lines.join('\n');
};

export default function ValidationBoardSection({ navigate }) {
  const pending = useMemo(
    () => (dsInventory.components || []).filter((c) => c.status === 'pending'),
    [],
  );
  const [decisions, setDecisions] = useState({});
  const [copied, setCopied] = useState(false);

  const onDecide = (id, decision) => {
    setCopied(false);
    setDecisions((d) => ({ ...d, [id]: decision }));
  };

  const validated = pending.filter((c) => decisions[c.id]?.verdict === 'validated').map((c) => c.id);
  const revisions = pending
    .filter((c) => decisions[c.id]?.verdict === 'needs-revision')
    .map((c) => ({ id: c.id, note: (decisions[c.id]?.note || '').trim() }));
  const decided = validated.length + revisions.length;

  const checkAllRemaining = () => {
    setCopied(false);
    setDecisions((d) => {
      const next = { ...d };
      for (const c of pending) if (!next[c.id]?.verdict) next[c.id] = { verdict: 'validated' };
      return next;
    });
  };

  const onCopy = async () => {
    const prompt = buildLotPrompt(validated, revisions);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      window.prompt('Copie ce prompt :', prompt);
    }
  };

  if (!pending.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24, border: `1px solid ${colors.semantic.border}`, borderRadius: radius.xl, background: colors.semantic.card, maxWidth: 560 }}>
        <Check style={{ width: 18, height: 18, color: colors.badge.success.fg }} />
        <div style={{ fontSize: 14, color: colors.semantic.foreground }}>
          Aucun composant en attente - l'inventaire est tout vert.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080 }}>
      <p style={{ fontSize: 14, color: colors.semantic.foregroundSecondary, lineHeight: '20px', marginTop: 0, marginBottom: 20 }}>
        La passe steward en une page : chaque composant <StatusPill status="pending" /> avec sa
        démo sur ses valeurs par défaut. Coche <strong>Valider</strong> (ou <strong>À revoir</strong> +
        note), puis copie <strong>un seul prompt</strong> pour tout le lot et colle-le dans Claude
        Code - le JSON n'est jamais édité à la main. Pour inspecter en profondeur : le nom ouvre
        la fiche.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14, marginBottom: 88 }}>
        {pending.map((entry) => (
          <ValidationCard key={entry.id} entry={entry} decision={decisions[entry.id]} onDecide={onDecide} navigate={navigate} />
        ))}
      </div>

      {/* Barre de lot - sticky en bas */}
      <div style={{ position: 'sticky', bottom: 16, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', border: `1px solid ${colors.semantic.border}`, borderRadius: radius.xl, background: colors.semantic.surfaceRaised, boxShadow: shadows.lg, maxWidth: 720 }}>
        <ListChecks style={{ width: 16, height: 16, color: colors.semantic.mutedForeground, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: colors.semantic.foreground }}>
          <strong>{validated.length}</strong> validé{validated.length > 1 ? 's' : ''} · <strong>{revisions.length}</strong> à revoir · {pending.length - decided} restant{pending.length - decided > 1 ? 's' : ''}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" label="Valider tout le reste" onClick={checkAllRemaining} />
          <Button
            variant="primary"
            size="sm"
            icon={copied ? Check : undefined}
            label={copied ? 'Copié - colle dans Claude Code' : `Copier le prompt (${decided})`}
            disabled={!decided}
            onClick={onCopy}
          />
        </span>
      </div>
    </div>
  );
}
