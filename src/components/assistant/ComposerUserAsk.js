import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react';
import { colors, shadows, typeStyle } from '../../design-system/tokens';

// ── ComposerUserAsk ──────────────────────────────────────────────────
// État « UserAsk » du composer (Figma « Chat Input », node 1713:19701) :
// l'agent pose UNE question à la fois, avec des propositions numérotées et
// une réponse libre. Remplace tout le contenu de la carte tant qu'une
// réponse est attendue — jamais deux demandes simultanées.
//
// ask = { question, proposals: [string], step (1-based), total, answered?: {idx:bool} }
// onSubmit(answerText) · onSkip() · onClose() · onPrev() · onNext()

export default function ComposerUserAsk({ ask, onSubmit, onSkip, onClose, onPrev, onNext }) {
  const [selected, setSelected] = useState(null); // index | 'custom' | null
  const [customText, setCustomText] = useState('');
  const customRef = useRef(null);

  // Nouvelle question → sélection remise à zéro.
  useEffect(() => {
    setSelected(null);
    setCustomText('');
  }, [ask.step, ask.question]);

  const isCustom = selected === 'custom';
  const hasAnswer = (selected !== null && selected !== 'custom') || customText.trim().length > 0;

  const submit = () => {
    const answer = isCustom
      ? customText.trim()
      : selected !== null
        ? ask.proposals[selected]
        : null;
    if (!answer) return;
    onSubmit && onSubmit(answer);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Question — dégradé blanc → background, en-tête mono cream/500. */}
      <div
        className="flex flex-col gap-2.5 p-4 w-full"
        style={{
          borderBottom: `1px solid ${colors.semantic.border}`,
          background: `linear-gradient(to bottom, ${colors.semantic.white} 0%, ${colors.semantic.background} 100%)`,
        }}
      >
        <div className="flex items-start justify-between w-full">
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              color: colors.composer.askHeader,
              textTransform: 'uppercase',
            }}
          >
            USER ASK - {ask.step}/{ask.total}
          </span>
          {onClose && (
            <button type="button" aria-label="Fermer" onClick={onClose} className="hover:opacity-70 transition-opacity">
              <X className="w-3.5 h-3.5" style={{ color: colors.composer.askHeader }} strokeWidth={2} />
            </button>
          )}
        </div>
        <p
          className="w-full"
          style={{
            ...typeStyle('display-xs'),
            color: colors.semantic.foreground,
            margin: 0,
          }}
        >
          {ask.question}
        </p>
      </div>

      {/* Propositions numérotées + réponse libre. */}
      <div className="flex flex-col gap-1 pt-2.5 px-2.5 w-full">
        {(ask.proposals || []).map((prop, pi) => {
          const isSelected = selected === pi;
          return (
            <button
              key={pi}
              type="button"
              className="flex items-center gap-3 w-full text-left rounded-[2px] px-2.5 py-[7px] transition-colors"
              style={{ backgroundColor: isSelected ? colors.semantic.secondary : 'transparent' }}
              onClick={() => { setSelected(pi); setCustomText(''); }}
            >
              <span
                className="flex items-center justify-center flex-shrink-0 rounded-[2px] text-[12px] font-medium"
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: isSelected ? colors.semantic.primary : colors.semantic.muted,
                  color: isSelected ? colors.semantic.primaryForeground : colors.semantic.mutedForeground,
                  lineHeight: '16px',
                }}
              >
                {pi + 1}
              </span>
              <span className="text-[14px] leading-5" style={{ color: colors.semantic.foreground }}>{prop}</span>
            </button>
          );
        })}
        <button
          type="button"
          className="flex items-center gap-3 w-full text-left rounded-[2px] px-2.5 py-[7px] transition-colors"
          style={{ backgroundColor: isCustom ? colors.semantic.secondary : 'transparent' }}
          onClick={() => {
            setSelected('custom');
            setTimeout(() => customRef.current?.focus(), 50);
          }}
        >
          <span className="flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24 }}>
            <Pencil className="w-4 h-4" style={{ color: colors.semantic.mutedForeground }} strokeWidth={1.5} />
          </span>
          {isCustom ? (
            <input
              ref={customRef}
              type="text"
              className="flex-1 bg-transparent text-[14px] text-foreground focus:outline-none"
              placeholder="Votre réponse..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-[14px] leading-5" style={{ color: colors.semantic.mutedForeground }}>Votre réponse...</span>
          )}
        </button>
      </div>

      {/* Pied : pagination (losanges) + Passer / envoyer. */}
      <div className="flex items-center justify-between p-3 w-full">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Question précédente"
            className="flex items-center justify-center hover:opacity-70 transition-opacity"
            disabled={ask.step <= 1}
            style={{ opacity: ask.step <= 1 ? 0.3 : 1 }}
            onClick={() => { if (ask.step > 1 && onPrev) onPrev(); }}
          >
            <ChevronLeft className="w-3 h-3 text-foreground" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: ask.total }, (_, di) => (
              <div
                key={di}
                style={{
                  width: 6,
                  height: 6,
                  transform: 'rotate(45deg)',
                  backgroundColor:
                    di === ask.step - 1
                      ? colors.semantic.primary
                      : ask.answered && ask.answered[di]
                        ? colors.semantic.mutedForeground
                        : colors.semantic.borderAlt,
                  transition: 'background-color 0.2s',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Question suivante"
            className="flex items-center justify-center hover:opacity-70 transition-opacity"
            disabled={ask.step >= ask.total}
            style={{ opacity: ask.step >= ask.total ? 0.3 : 1 }}
            onClick={() => { if (ask.step < ask.total && onNext) onNext(); }}
          >
            <ChevronRight className="w-3 h-3 text-foreground" strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-[7px]">
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center justify-center transition-colors hover:bg-border"
            style={{
              height: 32,
              paddingLeft: 12,
              paddingRight: 12,
              borderRadius: 8,
              backgroundColor: colors.semantic.secondary,
              fontSize: 14,
              fontWeight: 500,
              color: colors.semantic.secondaryForeground,
            }}
          >
            Passer
          </button>
          <button
            type="button"
            aria-label="Envoyer la réponse"
            onClick={hasAnswer ? submit : undefined}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: hasAnswer ? colors.semantic.primary : colors.semantic.muted,
              boxShadow: hasAnswer ? shadows.xs : 'none',
              cursor: hasAnswer ? 'pointer' : 'default',
            }}
          >
            <ArrowUp
              className="w-4 h-4"
              strokeWidth={2.25}
              style={{ color: hasAnswer ? colors.semantic.primaryForeground : colors.semantic.mutedForeground }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
