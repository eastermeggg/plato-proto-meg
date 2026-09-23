import React, { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import AlertDialog from '../AlertDialog';

// Simple rename modal for folders. Text input pre-filled with current name.
// Enter submits, Escape cancels (handled by AlertDialog).

export default function RenameFolderModal({
  open,
  onOpenChange,
  currentName = '',
  onConfirm,
}) {
  const [value, setValue] = useState(currentName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(currentName);
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    }
  }, [open, currentName]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && trimmed !== currentName;

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
      title="Renommer le dossier"
      description="Modifier le nom du dossier. La numérotation hiérarchique est conservée."
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
        placeholder="Nom du dossier"
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
    </AlertDialog>
  );
}
