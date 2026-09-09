import React from 'react';

// ── InlineToken ──────────────────────────────────────────────────────
// Typed, non-breaking reference token inserted in the composer's rich
// input. Two renderers share one look:
//   createTokenSpan(token) — raw DOM span for the contentEditable editor
//   <TokenChip token />    — read-only React chip for sent messages
// Plus the serialization helpers that turn the editor DOM back into a
// segments array ({kind:'text'|'token'}).

// Small textual glyph per token family (text, never an emoji).
const FAMILY_GLYPH = {
  piece: 'P',
  modele: 'M',
  referentiel: 'R',
  jp: 'JP',
  intention: '/',
};

const TOKEN_CLASS =
  'inline-block whitespace-nowrap max-w-full overflow-hidden text-ellipsis align-baseline ' +
  'rounded bg-cream text-foreground text-[13px] leading-[18px] px-1.5 border border-border/70 select-none';

export function createTokenSpan(token) {
  const span = document.createElement('span');
  span.contentEditable = 'false';
  span.setAttribute('data-token-id', String(token.id));
  span.setAttribute('data-token-type', token.type || '');
  span.setAttribute('data-token-label', token.label || '');
  span.setAttribute('data-token-family', token.family || token.type || '');
  span.className = TOKEN_CLASS;

  const glyph = FAMILY_GLYPH[token.family || token.type];
  if (glyph) {
    const g = document.createElement('span');
    g.textContent = glyph;
    g.style.fontFamily = "'IBM Plex Mono', monospace";
    g.style.fontSize = '10px';
    g.style.color = '#78716c';
    g.style.marginRight = '4px';
    span.appendChild(g);
  }
  span.appendChild(document.createTextNode(token.label || ''));
  return span;
}

export function TokenChip({ token }) {
  const glyph = FAMILY_GLYPH[token.family || token.type];
  return (
    <span className={TOKEN_CLASS} data-token-id={token.id}>
      {glyph && (
        <span
          className="text-foreground-secondary"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, marginRight: 4 }}
        >
          {glyph}
        </span>
      )}
      {token.label}
    </span>
  );
}

// ── Serialization ────────────────────────────────────────────────────

export function serializeEditor(rootEl) {
  const segments = [];
  const pushText = (raw) => {
    if (!raw) return;
    const text = raw.replace(/\u00a0/g, " ").replace(/\u200b/g, "");
    if (!text) return;
    const last = segments[segments.length - 1];
    if (last && last.kind === 'text') last.text += text;
    else segments.push({ kind: 'text', text });
  };
  const walk = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        pushText(child.nodeValue);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === 'BR') {
          pushText('\n');
        } else if (child.hasAttribute('data-token-id')) {
          segments.push({
            kind: 'token',
            token: {
              id: child.getAttribute('data-token-id'),
              type: child.getAttribute('data-token-type'),
              label: child.getAttribute('data-token-label'),
              family: child.getAttribute('data-token-family'),
            },
          });
        } else {
          // Block element a browser may have inserted: treat as a line.
          const isBlock = child.tagName === 'DIV' || child.tagName === 'P';
          if (isBlock && segments.length > 0) pushText('\n');
          walk(child);
        }
      }
    });
  };
  if (rootEl) walk(rootEl);
  return segments;
}

export function segmentsToBody(segments) {
  return segments
    .map((s) => (s.kind === 'token' ? s.token.label : s.text))
    .join('');
}

export function segmentsTokens(segments) {
  return segments.filter((s) => s.kind === 'token').map((s) => s.token);
}
