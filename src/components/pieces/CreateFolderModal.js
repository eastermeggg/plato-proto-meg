import React, { useEffect, useRef, useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import AlertDialog from '../AlertDialog';

// Create a new folder. The parent folder name is shown in the description
// so the user knows where the new folder will land.

export default function CreateFolderModal({
  open,
  onOpenChange,
  parentLabel,         // string — "Pièces" for root, or the parent folder's name
  onConfirm,
}) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onConfirm?.(trimmed);
    onOpenChange?.(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={FolderPlus}
      title="Nouveau dossier"
      description={`Créer un dossier dans ${parentLabel || 'Pièces'}.`}
      cancelLabel="Annuler"
      actionLabel="Créer"
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
