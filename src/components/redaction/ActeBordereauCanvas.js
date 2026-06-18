import React, { useState } from 'react';
import { ListOrdered, Sparkles, X } from 'lucide-react';
import { numberEntries } from '../../data/bordereauModel';

// Read-only canvas for a `kind: 'bordereau'` artefact.
//
// Renders the bordereau as a bordered table (matches the Pièces tab visual
// language and the Figma RowBordereau component, 36448:16485). Entries can be
// flat (1, 2, 3…) or organised into thematic sections with hierarchical
// numbering (I, I-1, I-2, II, II-1…) — the numbering algorithm lives in
// bordereauModel.numberEntries.
//
// Reordering is driven through the chat, not direct manipulation — there is no
// drag-and-drop here. Title + export live in the acte sub-header (App.js).
//
// Props:
//   entries — heterogeneous: section markers + pieces
//   onGenerate — optional. When the bordereau is empty AND this callback is
//                provided, the empty state shows a primary "Générer mon
//                bordereau" button that launches the generation flow.
//   generateSource — 'acte' | 'dossier' (controls the button copy)
//   dossierPieces      — array of dossier pieces, used by the "Ajouter une
//                        pièce" search modal. Omit to hide the add button.
//   dossierCategories  — folder arbo from the same dossier; the modal renders
//                        the same tree as the Pièces tab so users can browse
//                        and search in parity.
//   onAddPiece(piece)  — called when the user picks a piece in the modal.
//   onPieceClick(pieceRow) — called when the user clicks a pièce row; opens the
//                        shared piece-detail panel.
//   onExclude(entriesIdx, pieceEntry) — called when the user removes a pièce
//                        from the bordereau. Index is over the original
//                        `entries` array. App decides whether the linked acte
//                        must be rewritten (the pièce is cited there).
export default function ActeBordereauCanvas({
  entries = [],
  onGenerate,
  generateSource = 'acte',
  shimmer = false,
  onExclude,
  onPieceClick,
}) {
  const numbered = numberEntries(entries);
  const pieceCount = numbered.filter((e) => e.kind === 'piece').length;

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: '#f8f7f5' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 32px' }}>
        {pieceCount === 0 ? (
          <EmptyState onGenerate={onGenerate} source={generateSource} />
        ) : (
          <>
            {/* Sub-header (Figma 2484:29442): bold count + chat helper.
                Editing the bordereau happens through the chat — no add button. */}
            <p className="mb-3" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: '#78716c', margin: '0 0 12px' }}>
              <span style={{ fontWeight: 600, color: '#292524' }}>
                {pieceCount} pièce{pieceCount > 1 ? 's' : ''}{generateSource === 'acte' ? (pieceCount > 1 ? ' citées' : ' citée') : ''}
              </span>
              {' '}— Vous pouvez modifier le bordereau directement via le chat
            </p>
            <BordereauTable rows={numbered} onExclude={onExclude} onPieceClick={onPieceClick} shimmer={shimmer} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Table ──────────────────────────────────────────────────────────
const COL_NUM_W = 72;
const COL_DATE_W = 130;

function BordereauTable({ rows, onExclude, onPieceClick, shimmer = false }) {
  // Alternating-row index across pieces only (sections don't count).
  let pieceIdx = -1;
  const excludeEnabled = !!onExclude && !shimmer;
  const clickEnabled = !!onPieceClick && !shimmer;

  return (
    <div
      style={{
        border: '1px solid #e7e5e3',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: 'white',
      }}
    >
      <ColumnHeader />
      {rows.map((row, i) => {
        if (row.kind === 'section') {
          return <SectionHeader key={`s-${i}`} number={row.number} name={row.name} />;
        }
        pieceIdx += 1;
        const isLast = i === rows.length - 1;
        return (
          <PieceRow
            key={`p-${i}-${row.pieceId || row.intitule}`}
            number={row.number}
            intitule={row.intitule}
            date={row.date}
            description={row.description}
            alternate={pieceIdx % 2 === 1}
            isLast={isLast}
            onExclude={excludeEnabled ? () => onExclude(i, row) : undefined}
            onClick={clickEnabled ? () => onPieceClick(row) : undefined}
            shimmer={shimmer}
            shimmerDelay={pieceIdx * 60}
          />
        );
      })}
    </div>
  );
}

function ColumnHeader() {
  const mono = "'IBM Plex Mono', monospace";
  const cell = {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: 500,
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 36,
        borderBottom: '1px solid #e7e5e3',
        backgroundColor: '#f8f7f5',
      }}
    >
      <div style={{ ...cell, width: COL_NUM_W, justifyContent: 'center', flexShrink: 0 }}>N°</div>
      <div style={{ ...cell, flex: 1, minWidth: 0 }}>Nom de la pièce</div>
      {/* Date column kept for alignment, unlabelled (Figma 2484:29442). */}
      <div style={{ ...cell, width: COL_DATE_W, flexShrink: 0 }} />
    </div>
  );
}

function SectionHeader({ number, name }) {
  const mono = "'IBM Plex Mono', monospace";
  const font = "'Inter', system-ui, sans-serif";
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: 40,
        backgroundColor: 'white',
        borderBottom: '1px solid #e7e5e3',
        borderTop: '1px solid #e7e5e3',
      }}
    >
      {/* Number + name in a single cell: "I - Médical" */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            fontWeight: 600,
            color: '#44403c',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {number} -
        </span>
        <span
          style={{
            fontFamily: font,
            fontSize: 13,
            fontWeight: 600,
            color: '#292524',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}

function PieceRow({
  number,
  intitule,
  date,
  description,
  alternate,
  isLast,
  onExclude,
  onClick,
  shimmer = false,
  shimmerDelay = 0,
}) {
  const font = "'Inter', system-ui, sans-serif";
  const mono = "'IBM Plex Mono', monospace";
  const [hover, setHover] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const clickable = !!onClick;

  if (shimmer) {
    return (
      <SkeletonRow
        alternate={alternate}
        isLast={isLast}
        delayMs={shimmerDelay}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minHeight: 52,
        backgroundColor: hover && clickable ? '#f5f4f0' : (alternate ? '#fafaf9' : 'white'),
        borderBottom: isLast ? 'none' : '1px solid #e7e5e3',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background-color 120ms',
      }}
    >
      {/* N° badge */}
      <div
        style={{
          width: COL_NUM_W,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 38,
            height: 22,
            padding: '0 6px',
            borderRadius: 6,
            backgroundColor: '#eeece6',
            fontFamily: mono,
            fontSize: 11,
            fontWeight: 600,
            color: '#78716c',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {number}
        </span>
      </div>
      {/* Intitulé + description */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: '10px 12px',
          fontFamily: font,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#292524',
            lineHeight: '20px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {intitule}
        </div>
        {description && (
          <div
            style={{
              fontSize: 12,
              color: '#78716c',
              lineHeight: '16px',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </div>
        )}
      </div>
      {/* Date */}
      <div
        style={{
          width: COL_DATE_W,
          flexShrink: 0,
          padding: '0 12px',
          fontFamily: mono,
          fontSize: 12,
          color: '#44403c',
          letterSpacing: '0.02em',
        }}
      >
        {date || '—'}
      </div>

      {/* Exclure — small icon CTA revealed on hover, far right, with a custom
          tooltip. Excludes the pièce from the bordereau; the App handles
          rewriting the acte if it's cited. */}
      {onExclude && (
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onExclude(); }}
            aria-label="Exclure du bordereau"
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            className="inline-flex items-center justify-center"
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              color: btnHover ? '#b91c1c' : '#a8a29e',
              backgroundColor: btnHover ? '#fef2f2' : 'transparent',
              opacity: hover ? 1 : 0,
              transition: 'opacity 120ms, background-color 120ms, color 120ms',
              cursor: 'pointer',
            }}
          >
            <X className="w-3 h-3" strokeWidth={2} />
          </button>
          {/* Tooltip */}
          <span
            role="tooltip"
            style={{
              position: 'absolute',
              right: '100%',
              marginRight: 6,
              top: '50%',
              whiteSpace: 'nowrap',
              padding: '3px 7px',
              borderRadius: 5,
              backgroundColor: '#292524',
              color: 'white',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              lineHeight: 1,
              opacity: btnHover ? 1 : 0,
              transform: btnHover ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(2px)',
              transition: 'opacity 120ms, transform 120ms',
              pointerEvents: 'none',
              boxShadow: '0px 2px 6px rgba(26,26,26,0.18)',
            }}
          >
            Exclure du bordereau
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────
function EmptyState({ onGenerate, source }) {
  const font = "'Inter', system-ui, sans-serif";
  const fromActe = source === 'acte';
  const title = onGenerate
    ? (fromActe
      ? 'Générez le bordereau depuis les pièces citées'
      : 'Générez le bordereau depuis les pièces du dossier')
    : 'Aucune pièce communiquée';
  const subtitle = onGenerate
    ? (fromActe
      ? "L'agent reprend les pièces citées dans l'acte, dans l'ordre d'apparition, et les numérote."
      : 'L\'agent reprend les pièces du dossier et les regroupe par thème.')
    : 'Ajoutez des pièces depuis le chat pour démarrer.';

  return (
    <div
      style={{
        border: '1px solid #e7e5e3',
        borderRadius: 6,
        backgroundColor: 'white',
        padding: '56px 24px',
        textAlign: 'center',
      }}
    >
      <div
        className="inline-flex items-center justify-center mb-4"
        style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f5f4f0' }}
      >
        <ListOrdered className="w-5 h-5 text-[#a8a29e]" strokeWidth={1.5} />
      </div>
      <p style={{ fontFamily: font, fontSize: 15, fontWeight: 600, color: '#292524', margin: 0 }}>
        {title}
      </p>
      <p style={{ fontFamily: font, fontSize: 13, color: '#78716c', margin: '6px 0 0', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: '18px' }}>
        {subtitle}
      </p>
      {onGenerate && (
        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-[8px] text-[14px] font-medium text-white bg-[#292524] hover:bg-[#44403c] transition-colors mt-5"
          style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.08)' }}
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.75} />
          Générer mon bordereau
        </button>
      )}
    </div>
  );
}

// ─── Skeleton row (shimmer while /bordereau-reorder is reordering) ──
const SKELETON_KEYFRAMES_ID = 'bordereau-skeleton-keyframes';
function ensureSkeletonKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SKELETON_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = SKELETON_KEYFRAMES_ID;
  style.textContent = `
    @keyframes bordereauShimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
  `;
  document.head.appendChild(style);
}

function SkeletonBar({ width, height = 10, delayMs = 0 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: 4,
        background: 'linear-gradient(90deg, #eeece6 0%, #f5f4f0 50%, #eeece6 100%)',
        backgroundSize: '200px 100%',
        animation: `bordereauShimmer 1.2s ease-in-out ${delayMs}ms infinite`,
        verticalAlign: 'middle',
      }}
    />
  );
}

function SkeletonRow({ alternate, isLast, delayMs = 0 }) {
  ensureSkeletonKeyframes();
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minHeight: 52,
        backgroundColor: alternate ? '#fafaf9' : 'white',
        borderBottom: isLast ? 'none' : '1px solid #e7e5e3',
      }}
    >
      <div style={{ width: COL_NUM_W, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <SkeletonBar width={32} height={14} delayMs={delayMs} />
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '10px 12px' }}>
        <SkeletonBar width="60%" height={11} delayMs={delayMs + 80} />
      </div>
      <div style={{ width: COL_DATE_W, flexShrink: 0, padding: '0 12px' }}>
        <SkeletonBar width={70} height={10} delayMs={delayMs + 160} />
      </div>
    </div>
  );
}
