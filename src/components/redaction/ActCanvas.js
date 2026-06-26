import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
import JPPill from '../jp/JPPill';
import { getDecisionById } from '../../data/mockDecisions';
import { parseActStructure } from './actStructure';
import ActOutline from './ActOutline';

// Simple markdown-aware line renderer (bold, italic, pièce + JP citations)
const renderInlineMarkdown = (text) => {
  // Split on pièce refs and JP refs: [pièce:N:name:date] or [jp:id]
  const parts = text.split(/(\[pièce:\d+:[^\]]+\]|\[jp:[a-z0-9-]+\])/g);
  return parts.map((part, i) => {
    // JP citation — rendered with the canonical JPPill, variant `acte`
    const jpMatch = part.match(/^\[jp:([a-z0-9-]+)\]$/);
    if (jpMatch) {
      const decision = getDecisionById(jpMatch[1]);
      if (!decision) return null;
      return <JPPill key={i} decision={decision} variant="acte" />;
    }
    // Pièce badge
    const pieceMatch = part.match(/^\[pièce:(\d+):([^:]+?)(?::([^\]]+))?\]$/);
    if (pieceMatch) {
      const num = pieceMatch[1];
      const name = pieceMatch[2];
      return (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#dfe8f5',
            borderRadius: 6,
            padding: '2px 8px',
            verticalAlign: 'middle',
            lineHeight: '16px',
            margin: '0 2px',
          }}
        >
          <FileText style={{ width: 12, height: 12, color: '#1e3a8a', flexShrink: 0 }} strokeWidth={1.5} />
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#1e3a8a',
            fontFamily: "'Inter', system-ui, sans-serif",
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 260,
          }}>
            Pièce {num} - {name}
          </span>
        </span>
      );
    }
    // Bold / italic
    const mdParts = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return mdParts.map((md, j) => {
      if (md.startsWith('**') && md.endsWith('**')) {
        return <strong key={`${i}-${j}`} style={{ fontWeight: 600 }}>{md.slice(2, -2)}</strong>;
      }
      if (md.startsWith('*') && md.endsWith('*')) {
        return <em key={`${i}-${j}`}>{md.slice(1, -1)}</em>;
      }
      return md;
    });
  });
};

// The bordereau is now its own artefact (ActeBordereauCanvas) emitted
// post-stream by useRedactionCommands. ActCanvas no longer renders an inline
// [bordereau] block — that content path was removed in the bordereau branch.

export default function ActCanvas({ content, streaming, onZoneSelect, hasActiveZone }) {
  const scrollRef = useRef(null);
  const pageRef = useRef(null);
  const [highlightRects, setHighlightRects] = useState([]);

  // Derived legal structure → drives the floating sommaire and anchors each
  // detected heading line so the sommaire can scroll-spy / jump to it.
  const structure = useMemo(() => parseActStructure(content), [content]);
  const headingIdByLine = useMemo(() => {
    const map = {};
    structure.forEach((h) => { map[h.lineIndex] = h.id; });
    return map;
  }, [structure]);

  // Auto-scroll while streaming
  useEffect(() => {
    if (streaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, streaming]);

  // Clear highlight overlay when zone is deselected
  useEffect(() => {
    if (!hasActiveZone) setHighlightRects([]);
  }, [hasActiveZone]);

  // Capture native text selection → overlay highlight + send to context bar
  const handleMouseUp = useCallback(() => {
    if (!onZoneSelect) return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 0 && pageRef.current) {
      const range = sel.getRangeAt(0);
      if (!pageRef.current.contains(range.commonAncestorContainer)) return;

      // Compute highlight rects relative to the page container
      const pageRect = pageRef.current.getBoundingClientRect();
      const rects = Array.from(range.getClientRects()).map(r => ({
        top: r.top - pageRect.top,
        left: r.left - pageRect.left,
        width: r.width,
        height: r.height,
      }));
      setHighlightRects(rects);

      // Truncate for context bar label
      const truncated = text.length > 60 ? text.slice(0, 60).replace(/\s\S*$/, '') + '…' : text;
      sel.removeAllRanges();
      onZoneSelect(truncated);
    }
  }, [onZoneSelect]);

  // Parse content into styled paragraphs
  const renderContent = () => {
    if (!content) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#b9703f] animate-pulse" />
            <span style={{ fontSize: 13, color: '#a8a29e' }}>Rédaction en cours...</span>
          </div>
        </div>
      );
    }

    const font = "'Inter', system-ui, sans-serif";

    const lines = content.split('\n');

    const renderLine = (line, i) => {
      const trimmed = line.trim();

      if (!trimmed) return <div key={i} style={{ height: 8 }} />;

      // H1 — first few all-caps lines
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('-') && i < 3) {
        return <h1 key={i} style={{ fontFamily: font, fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px', lineHeight: '32px' }}>{trimmed}</h1>;
      }

      // H2 — all-caps section titles
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('-')) {
        return <h2 key={i} style={{ fontFamily: font, fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: '28px 0 8px', lineHeight: '26px' }}>{trimmed}</h2>;
      }

      // H3 — roman numeral sections (I. II. III.)
      if (/^[IVX]+\.\s/.test(trimmed)) {
        return <h3 key={i} style={{ fontFamily: font, fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '24px 0 6px', lineHeight: '24px' }}>{renderInlineMarkdown(trimmed)}</h3>;
      }

      // Numbered items (1° 2°)
      if (/^\d+°\s/.test(trimmed)) {
        return <p key={i} style={{ fontFamily: font, fontSize: 14, lineHeight: '22px', color: '#37352f', margin: '4px 0', paddingLeft: 24 }}>{renderInlineMarkdown(trimmed)}</p>;
      }

      // Numbered list (1. 2. 3.)
      if (/^\d+\.\s/.test(trimmed)) {
        return <p key={i} style={{ fontFamily: font, fontSize: 14, lineHeight: '22px', color: '#37352f', margin: '3px 0', paddingLeft: 24 }}>{renderInlineMarkdown(trimmed)}</p>;
      }

      // Bullet points
      if (trimmed.startsWith('- ')) {
        return <p key={i} style={{ fontFamily: font, fontSize: 14, lineHeight: '22px', color: '#37352f', margin: '2px 0', paddingLeft: 28, textIndent: -14 }}>{renderInlineMarkdown(trimmed)}</p>;
      }

      // Horizontal rule
      if (/^[—─\-]{3,}$/.test(trimmed)) {
        return <hr key={i} style={{ border: 'none', borderTop: '1px solid #e7e5e3', margin: '20px 0' }} />;
      }

      // Regular paragraph
      return <p key={i} style={{ fontFamily: font, fontSize: 14, lineHeight: '22px', color: '#37352f', margin: '3px 0' }}>{renderInlineMarkdown(trimmed)}</p>;
    };

    // Anchor detected heading lines so the sommaire can target them.
    return lines.map((line, i) => {
      const el = renderLine(line, i);
      const id = headingIdByLine[i];
      return id && React.isValidElement(el) ? React.cloneElement(el, { id }) : el;
    });
  };

  return (
    <div className="h-full relative" style={{ backgroundColor: '#f8f7f5' }}>
      {/* Floating sommaire — overlays the margin, anchored to the stable wrapper
          so it stays put while the acte scrolls underneath. Pinned to the right
          edge, vertically centered. Hidden while streaming to avoid jitter as
          the structure forms. */}
      {!streaming && <ActOutline headings={structure} scrollRef={scrollRef} side="right" />}
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto"
      >
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 32px' }}>
        <div
          ref={pageRef}
          onMouseUp={handleMouseUp}
          className="relative"
          style={{
            backgroundColor: 'white',
            borderRadius: 3,
            border: '1px solid #e7e5e3',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.025)',
            padding: '48px 64px',
            minHeight: 600,
            cursor: 'text',
            userSelect: 'text',
            position: 'relative',
          }}
        >
          {/* Highlight overlays */}
          {highlightRects.map((r, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: r.top,
                left: r.left,
                width: r.width,
                height: r.height,
                backgroundColor: '#dbeafe',
                opacity: 0.5,
                borderRadius: 2,
                pointerEvents: 'none',
              }}
            />
          ))}
          {renderContent()}
        </div>
      </div>
      </div>
    </div>
  );
}
