import React, { useState } from 'react';
import JPMemoryRow from './JPMemoryRow';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { colors } from '../../design-system/tokens';

// Chato pre-fills a draft rationale from the decision's metadata.
function draftRationaleFor(decision) {
  if (!decision) return '';
  const amt = decision.amounts?.[0];
  const profile = decision.victimProfile ? ` pour ${decision.victimProfile.toLowerCase()}` : '';
  const sub = amt ? `${amt.poste} à ${amt.displayValue}` : 'une décision de référence';
  return `${decision.jurisdiction || 'Décision'} retenant ${sub}${profile}. À conserver comme référence cabinet pour les dossiers comparables.`;
}

/**
 * Modal that asks the lawyer to confirm WHY they're saving this JP as a
 * cabinet reference. Pre-fills a Chato-drafted rationale that the lawyer
 * can edit before saving.
 *
 * Coquille : ui/Dialog (adoption pilote 24/09 - scrim overlay, surface
 * surfaceRaised, ombre L4/4xl par rôle, titre display-sm). Le corps (aperçu
 * JPMemoryRow + textarea) est inchangé.
 *
 * Props:
 *   decision (object)        — the JP being saved (read-only preview at top)
 *   initialRationale         — optional override of the Chato draft
 *   onClose()
 *   onSave(rationale: string)
 */
export default function JPRationaleModal({ decision, initialRationale, onClose, onSave }) {
  const [rationale, setRationale] = useState(
    initialRationale != null && initialRationale.length > 0
      ? initialRationale
      : draftRationaleFor(decision)
  );

  if (!decision) return null;
  const canSave = rationale.trim().length > 0;

  return (
    <Dialog
      open
      onOpenChange={(o) => { if (!o) onClose?.(); }}
      width={520}
      title="Dites-nous pourquoi cette jurisprudence est pertinente ?"
      description="Cette note guide l'agent quand il citera la décision dans vos actes."
      footer={
        <>
          <Button variant="secondary" label="Annuler" onClick={onClose} />
          <Button label="Enregistrer" disabled={!canSave} onClick={() => onSave?.(rationale.trim())} />
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* JP card preview */}
        <div
          style={{
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <JPMemoryRow decision={decision} />
        </div>

        {/* Apport */}
        <Textarea
          label="Apport de la décision"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          rows={6}
          placeholder="Ex. Taux horaire ATPT de 28 €/h pour une étudiante résidant à Paris intra-muros."
          style={{ minHeight: 140 }}
        />
      </div>
    </Dialog>
  );
}
