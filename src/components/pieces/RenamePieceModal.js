import React, { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import AlertDialog from '../AlertDialog';

// Rename a piece's display name. Shows the current display label + the
// original filename underneath so the user has context for what they're
// renaming away from.

export default function RenamePieceModal({
  open,
  onOpenChange,
  piece,
  onConfirm,
}) {
  const currentLabel = piece?.intitule || (piece?.nom ? piece.nom.replace(/\.[^/.]+$/, '') : '');
  const [value, setValue] = useState(currentLabel);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(currentLabel);
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    }
  }, [open, currentLabel]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && trimmed !== currentLabel;

  const submit = () => {
    if (!canSubmit) return;
    onConfirm?.(trimmed);
    onOpenChange?.(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Pencil}
      title="Renommer la pièce"
      description="Modifier le titre affiché de la pièce. Le nom d'origine du fichier est conservé."
      cancelLabel="Annuler"
      actionLabel="Enregistrer"
      actionVariant="primary"
      actionDisabled={!canSubmit}
      onAction={submit}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Nom de la pièce"
        style={{
          width: '100%',
          marginTop: 4,
          padding: '8px 12px',
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 6,
          fontFamily: typography.fontFamily.sans,
          fontSize: 14,
          color: colors.semantic.foreground,
          outline: 'none',
          backgroundColor: colors.semantic.white,
        }}
        onFocus={(e) => { e.target.style.borderColor = colors.feedback.info.text; }}
        onBlur={(e) => { e.target.style.borderColor = colors.semantic.border; }}
      />
      {piece?.nomOriginal && (
        <div style={{
          marginTop: 8,
          fontFamily: typography.fontFamily.mono,
          fontSize: 11,
          color: colors.semantic.foregroundMuted,
        }}>
          Nom d'origine : {piece.nomOriginal}
        </div>
      )}
    </AlertDialog>
  );
}
