import React from 'react';
import JPRow from './JPRow';

// Mini-table for chat results: card chrome (border + radius + shadow xs) + an
// optional `JURIDICTION` label header + JPRow children with bottom borders.
// The last row's border is auto-dropped.
//
// JPRow stacks identity / subline / date+amount vertically (3 lines) so the
// row survives narrow chat widths without crowding — the column-aligned
// `DATE · TAUX` header has therefore been dropped; only `JURIDICTION` remains
// as a section label.
//
// Two ways to provide rows:
//   - `decisions[]` + `getRowProps(d) => extraJPRowProps`   (declarative)
//   - `children` = JPRow elements                            (custom rendering)
//
// Props:
//   - decisions[]       : Decision[] — when set, rows are auto-rendered
//   - getRowProps(d)    : (decision) => additional JPRow props (favorited,
//                         bookmarked, onClick, etc.)
//   - currentPosteId    : passed to every row, picks the matching amount
//   - selectedDecisionId: id whose row should render in the selected state
//   - showHeader        : render the JURIDICTION section header (default true)
//   - headerLabel       : optional override (default 'Juridiction')
//   - children          : JPRow nodes (custom rendering — bypasses decisions[])
//   - className

const COL_HEADER = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  fontWeight: 500,
  color: '#78716c',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
};

export default function JPListingChat({
  decisions = null,
  getRowProps,
  currentPosteId = null,
  selectedDecisionId = null,
  showHeader = true,
  headerLabel = 'Juridiction',
  children,
  className = '',
}) {
  const rows = decisions
    ? decisions.filter(Boolean).map(d => (
        <JPRow
          key={d.id}
          decision={d}
          isSelected={d.id === selectedDecisionId}
          currentPosteId={currentPosteId}
          {...(getRowProps ? getRowProps(d) : {})}
        />
      ))
    : React.Children.toArray(children).filter(Boolean);

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'white',
        border: '1px solid #dfdcd9',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(26,26,26,0.05)',
      }}
    >
      {showHeader && (
        <div
          className="flex items-center px-3 py-2"
          style={{ backgroundColor: 'white', borderBottom: '1px solid #dfdcd9' }}
        >
          <span style={COL_HEADER}>{headerLabel}</span>
        </div>
      )}
      {rows.map((row, i) =>
        React.isValidElement(row)
          ? React.cloneElement(row, { isLast: i === rows.length - 1 })
          : row
      )}
    </div>
  );
}
