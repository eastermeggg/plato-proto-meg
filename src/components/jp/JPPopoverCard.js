import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { formatDateLong, getPrimaryAmount } from '../../data/mockDecisions';

export default function JPPopoverCard({
  decision,
  anchorRect,
  onOpenDrawer,
  onMouseEnter,
  onMouseLeave,
}) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, placement: 'below', ready: false });

  useEffect(() => {
    if (!anchorRect || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 8;

    let top = anchorRect.bottom + gap;
    let placement = 'below';
    if (top + rect.height > vh - 20) {
      top = anchorRect.top - rect.height - gap;
      placement = 'above';
    }

    let left = anchorRect.left + anchorRect.width / 2 - rect.width / 2;
    left = Math.max(16, Math.min(left, vw - rect.width - 16));

    setPos({ top, left, placement, ready: true });
  }, [anchorRect]);

  if (!decision || !anchorRect) return null;

  return (
    <div
      ref={cardRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        top: pos.placement === 'below' ? pos.top - 14 : pos.top,
        left: pos.left,
        zIndex: 50,
        width: 320,
        paddingTop: pos.placement === 'below' ? 14 : 0,
        paddingBottom: pos.placement === 'above' ? 14 : 0,
        opacity: pos.ready ? 1 : 0,
        transform: pos.ready ? 'translateY(0)' : pos.placement === 'below' ? 'translateY(-3px)' : 'translateY(3px)',
        transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
      }}
    >
      <div style={{
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'white',
        border: '1px solid #dfdcd9',
        boxShadow: '0 8px 24px rgba(41, 37, 36, 0.08), 0 2px 8px rgba(41, 37, 36, 0.04)',
      }}>

        {/* ── Identity: jurisdiction + date + number ──────── */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500,
            color: '#b9703f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4,
          }}>
            {decision.jurisdiction}{decision.chambre ? ` · ${decision.chambre}` : ''}
          </div>
          <div style={{
            fontFamily: "'EB Garamond', 'Georgia', serif", fontSize: 16, color: '#292524',
            lineHeight: '20px',
          }}>
            Arrêt du {formatDateLong(decision.date)} · <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#78716c' }}>n° {decision.numero}</span>
          </div>
        </div>

        {/* ── Key data block: amount + context + poste ────── */}
        <div style={{ padding: '0 16px 12px' }}>
          {/* Context + amount */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: '#a8a29e', textTransform: 'uppercase', width: 58, flexShrink: 0, paddingTop: 2 }}>
                Contexte
              </span>
              <span style={{ fontSize: 14, color: '#44403c', lineHeight: '20px' }}>
                {decision.category}
              </span>
            </div>
            {getPrimaryAmount(decision) && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: '#a8a29e', textTransform: 'uppercase', flexShrink: 0 }}>
                  Poste
                </span>
                <span className="badge badge-sm badge-secondary" title={getPrimaryAmount(decision).label}>
                  {getPrimaryAmount(decision).poste} : <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#b9703f' }}>{getPrimaryAmount(decision).displayValue}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Resume — scrollable with fade ───────────────── */}
        <div style={{ borderTop: '1px solid #f0efed', position: 'relative' }}>
          <div style={{
            padding: '8px 16px 12px',
            maxHeight: 72,
            overflow: 'hidden',
          }}>
            <p style={{
              fontSize: 14, color: '#78716c', lineHeight: '20px', margin: 0,
            }}>
              {decision.resume}
            </p>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* ── CTA ─────────────────────────────────────────── */}
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDrawer?.(decision.id); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '8px 16px',
            backgroundColor: '#fafaf9', border: 'none',
            borderTop: '1px solid #f0efed',
            cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#44403c',
            transition: 'background-color 0.12s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0efed'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fafaf9'; }}
        >
          Ouvrir la décision
          <ArrowRight style={{ width: 12, height: 12, color: '#a8a29e' }} />
        </button>
      </div>
    </div>
  );
}
