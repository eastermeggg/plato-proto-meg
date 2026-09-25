import React, { useState, useEffect } from 'react';
import {
  Plus, MoreHorizontal, PencilLine, Copy, Trash2, FolderOpen, RefreshCw, FolderPlus,
} from 'lucide-react';
import { colors, radius, shadows } from '../../design-system/tokens';
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Dropdown from '../ui/Dropdown';
import Dialog from '../ui/Dialog';
import Sheet, { SheetSection } from '../ui/Sheet';
import AlertDialog from '../ui/AlertDialog';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import EmptyState from '../EmptyState';

// ─────────────────────────────────────────────────────────────────────────────
// Écran-gabarit — LE contrat d'un écran CRUD produit, composé UNIQUEMENT de
// primitives du DS. Sert de référence à copier (PM / dev / designer) : shell +
// PageHeader + table + Dialog de CRÉATION + Sheet de MODIFICATION + menu
// d'actions sur ligne (Dropdown) + les 5 états d'un écran de données.
//
// Doctrine : Dialog pour créer (modale centrée), Sheet pour modifier (panneau
// latéral, chat visible), AlertDialog pour confirmer une suppression. Menu de
// ligne = Dropdown (jamais un Popover recodé). Aucun <button>/<input> brut,
// aucune barre inline, aucun max-width sur la colonne.
// ─────────────────────────────────────────────────────────────────────────────

const MONO = "'IBM Plex Mono', monospace";

const TYPE_BADGE = {
  'Dommage corporel': 'info',
  'Droit social': 'accent',
};
const STATUT_BADGE = {
  'En cours': 'secondary',
  'À chiffrer': 'warning',
  'Clôturé': 'success',
};

const ROWS = [
  { id: 'd1', ref: 'Martel / AXA', client: 'Sophie Martel', type: 'Dommage corporel', statut: 'En cours', activity: 'il y a 2 h' },
  { id: 'd2', ref: 'Bonnet / MAIF', client: 'Luc Bonnet', type: 'Dommage corporel', statut: 'À chiffrer', activity: 'hier' },
  { id: 'd3', ref: 'Duval / Groupama', client: 'Claire Duval', type: 'Droit social', statut: 'En cours', activity: 'il y a 3 j' },
  { id: 'd4', ref: 'Renaud / Allianz', client: 'Paul Renaud', type: 'Dommage corporel', statut: 'Clôturé', activity: 'il y a 12 j' },
  { id: 'd5', ref: 'Faure / CPAM', client: 'Emma Faure', type: 'Droit social', statut: 'À chiffrer', activity: 'il y a 20 j' },
];

const colHead = { fontFamily: MONO, fontWeight: 500, fontSize: 11, color: colors.semantic.mutedForeground, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' };

// ── La table (état idéal / partiel) ──────────────────────────────────────────
function DossiersTable({ rows, onEdit, onDelete }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden" style={{ backgroundColor: colors.semantic.card }}>
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.semantic.borderSubtle}` }}>
            <th className="px-5 py-3 text-left" style={colHead}>Référence</th>
            <th className="px-5 py-3 text-left" style={colHead}>Client</th>
            <th className="px-5 py-3 text-left" style={colHead}>Type</th>
            <th className="px-5 py-3 text-left" style={colHead}>Statut</th>
            <th className="px-5 py-3 text-left" style={colHead}>Dernière activité</th>
            <th className="px-5 py-3" style={{ ...colHead, width: 44 }} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="transition-colors hover:bg-background" style={{ borderTop: i === 0 ? 'none' : `1px solid ${colors.semantic.border}`, backgroundColor: colors.semantic.card }}>
              <td className="px-5 py-3.5">
                <span className="inline-flex items-center gap-2.5 min-w-0">
                  <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: colors.semantic.foregroundTertiary }} strokeWidth={1.75} />
                  <span className="text-body-medium text-foreground truncate">{r.ref}</span>
                </span>
              </td>
              <td className="px-5 py-3.5 text-body text-foreground-secondary">{r.client}</td>
              <td className="px-5 py-3.5"><Badge variant={TYPE_BADGE[r.type] || 'secondary'} label={r.type} /></td>
              <td className="px-5 py-3.5"><Badge variant={STATUT_BADGE[r.statut] || 'secondary'} label={r.statut} /></td>
              <td className="px-5 py-3.5 text-body text-foreground-secondary">{r.activity}</td>
              <td className="px-5 py-3.5">
                <Dropdown
                  align="end"
                  width={180}
                  trigger={
                    <Button variant="ghost" size="icon-xs" icon={MoreHorizontal} title={`Actions - ${r.ref}`} />
                  }
                  items={[
                    { key: 'edit', label: 'Modifier', icon: PencilLine, onSelect: () => onEdit(r) },
                    { key: 'dup', label: 'Dupliquer', icon: Copy },
                    { key: 'del', label: 'Supprimer', icon: Trash2, group: ' ', onSelect: () => onDelete(r) },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Skeleton (état chargement) ───────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden" style={{ backgroundColor: colors.semantic.card }}>
      <div style={{ borderBottom: `1px solid ${colors.semantic.borderSubtle}`, padding: '12px 20px' }}>
        <span style={colHead}>Chargement des dossiers…</span>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5" style={{ height: 52, borderTop: i === 0 ? 'none' : `1px solid ${colors.semantic.border}` }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, background: colors.semantic.muted, flexShrink: 0 }} className="ds-shimmer" />
          <span style={{ width: '32%', height: 10, borderRadius: 999, background: colors.semantic.muted }} className="ds-shimmer" />
          <span style={{ width: '18%', height: 10, borderRadius: 999, background: colors.semantic.muted }} className="ds-shimmer" />
          <span style={{ width: 70, height: 18, borderRadius: 999, background: colors.semantic.muted }} className="ds-shimmer" />
          <span style={{ flex: 1 }} />
          <Spinner size={14} />
        </div>
      ))}
      <style>{'@keyframes ds-shim{0%{opacity:.55}50%{opacity:1}100%{opacity:.55}}.ds-shimmer{animation:ds-shim 1.3s ease-in-out infinite}'}</style>
    </div>
  );
}

// ── Le formulaire de création (Dialog) ───────────────────────────────────────
function CreateDialog({ open, onOpenChange }) {
  const [ref, setRef] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState('Dommage corporel');
  const [note, setNote] = useState('');
  useEffect(() => { if (open) { setRef(''); setClient(''); setType('Dommage corporel'); setNote(''); } }, [open]);
  const canCreate = ref.trim() && client.trim();
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      width={520}
      title="Nouveau dossier"
      description="Créez un dossier ; les pièces s'y rattacheront ensuite."
      footer={(
        <>
          <Button variant="secondary" label="Annuler" onClick={() => onOpenChange(false)} />
          <Button label="Créer le dossier" disabled={!canCreate} onClick={() => onOpenChange(false)} />
        </>
      )}
    >
      <div className="flex flex-col gap-4">
        <Input label="Référence" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Nom / AXA" />
        <Input label="Client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Prénom Nom" />
        <Input label="Type de dossier">
          <Select
            value={type}
            onChange={setType}
            width="100%"
            options={[
              { value: 'Dommage corporel', label: 'Dommage corporel' },
              { value: 'Droit social', label: 'Droit social' },
            ]}
          />
        </Input>
        <Textarea label="Note (facultatif)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Contexte, échéances…" />
      </div>
    </Dialog>
  );
}

// ── Le panneau de modification (Sheet) ──────────────────────────────────────
function EditSheet({ row, onClose }) {
  const [statut, setStatut] = useState('En cours');
  const [ref, setRef] = useState('');
  useEffect(() => { if (row) { setStatut(row.statut); setRef(row.ref); } }, [row]);
  return (
    <Sheet
      open={!!row}
      onOpenChange={(o) => { if (!o) onClose(); }}
      side="right"
      size="sm"
      title={row ? row.ref : ''}
      icon={FolderOpen}
      footer={(
        <>
          <span />
          <Button label="Enregistrer" onClick={onClose} />
        </>
      )}
    >
      <SheetSection title="Identité" bordered>
        <Input label="Référence" value={ref} onChange={(e) => setRef(e.target.value)} />
      </SheetSection>
      <SheetSection title="Suivi">
        <Input label="Statut">
          <Select
            value={statut}
            onChange={setStatut}
            width="100%"
            options={[
              { value: 'En cours', label: 'En cours' },
              { value: 'À chiffrer', label: 'À chiffrer' },
              { value: 'Clôturé', label: 'Clôturé' },
            ]}
          />
        </Input>
      </SheetSection>
    </Sheet>
  );
}

// ── L'écran complet, piloté par `state` (5 états) + overlays interactifs ──────
export default function GabaritContent({ menu, state = 'ideal', forcedOverlay = 'none' }) {
  const [overlay, setOverlay] = useState('none'); // 'none' | 'create' | 'delete'
  const [editRow, setEditRow] = useState(null);
  const [target, setTarget] = useState(null);

  // Le control `couche` du block force une couche ouverte (pour valider à l'œil) ;
  // l'écran reste jouable (Nouveau / ⋯ ouvrent les vraies couches).
  useEffect(() => {
    if (forcedOverlay === 'create') { setOverlay('create'); setEditRow(null); }
    else if (forcedOverlay === 'edit') { setEditRow(ROWS[0]); setOverlay('none'); }
    else if (forcedOverlay === 'delete') { setTarget(ROWS[0]); setOverlay('delete'); setEditRow(null); }
    else { setOverlay('none'); setEditRow(null); }
  }, [forcedOverlay]);

  const openEdit = (r) => { setEditRow(r); setOverlay('none'); };
  const openDelete = (r) => { setTarget(r); setOverlay('delete'); };

  const partialRows = ROWS.slice(0, 2);

  const body = () => {
    if (state === 'loading') return <TableSkeleton />;
    if (state === 'empty') {
      return (
        <div className="flex items-center justify-center" style={{ minHeight: 320 }}>
          <EmptyState
            icon={FolderPlus}
            title="Aucun dossier pour l'instant"
            description="Créez votre premier dossier ; les pièces et le chiffrage s'y rattacheront."
            primaryAction={{ label: 'Nouveau dossier', icon: Plus, onClick: () => setOverlay('create') }}
          />
        </div>
      );
    }
    if (state === 'error') {
      return (
        <Alert
          variant="destructive"
          title="Impossible de charger les dossiers"
          description="La connexion au serveur a échoué. Vérifiez votre réseau et réessayez."
          actionLabel="Réessayer"
          actionIcon={RefreshCw}
          onAction={() => {}}
        />
      );
    }
    if (state === 'partial') {
      return (
        <div className="flex flex-col gap-4">
          <Alert
            variant="warning"
            title="Import partiel"
            description="2 dossiers sur 5 ont été synchronisés. La récupération des autres est en cours."
          />
          <DossiersTable rows={partialRows} onEdit={openEdit} onDelete={openDelete} />
        </div>
      );
    }
    return <DossiersTable rows={ROWS} onEdit={openEdit} onDelete={openDelete} />;
  };

  return (
    <>
      {menu}
      <PageHeader
        title="Mes dossiers"
        action={<Button variant="primary" size="sm" icon={Plus} label="Nouveau dossier" onClick={() => setOverlay('create')} />}
        tabs={[{ key: 'ouverts', label: 'Ouverts', count: 50 }, { key: 'archives', label: 'Archivés', count: 8 }]}
        activeTab="ouverts"
        onTabChange={() => {}}
      />
      <div className="flex-1 overflow-y-auto px-8 py-6" style={{ minHeight: 0 }}>
        {body()}
      </div>

      {/* Couche CRÉATION : Dialog centré */}
      <CreateDialog open={overlay === 'create'} onOpenChange={(o) => setOverlay(o ? 'create' : 'none')} />

      {/* Couche MODIFICATION : Sheet latéral */}
      <EditSheet row={editRow} onClose={() => setEditRow(null)} />

      {/* Couche CONFIRMATION : AlertDialog destructif */}
      <AlertDialog
        open={overlay === 'delete'}
        onOpenChange={(o) => setOverlay(o ? 'delete' : 'none')}
        iconVariant="destructive"
        title={target ? `Supprimer « ${target.ref} » ?` : 'Supprimer le dossier ?'}
        description="Le dossier et ses pièces seront définitivement supprimés. Cette action est irréversible."
        cancelLabel="Annuler"
        actionLabel="Supprimer"
        actionVariant="destructive"
        onAction={() => setOverlay('none')}
      />
    </>
  );
}
