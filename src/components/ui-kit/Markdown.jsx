// Markdown renderer for the DS playground docs (contenu de confiance : les
// fiches .md de l'équipe). marked → HTML, stylé via les variables CSS du thème
// (theme.js) donc theme-aware (light/dark). Injecte ses styles une seule fois.
import React from 'react';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

let injected = false;
function ensureStyles() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.id = 'ds-md-styles';
  s.textContent = `
  .ds-md { color: var(--semantic-foreground, #292524); font-size: 14px; line-height: 1.65; }
  .ds-md h1, .ds-md h2, .ds-md h3 { color: var(--semantic-foreground, #292524); font-weight: 600; line-height: 1.3; margin: 1.4em 0 .5em; }
  .ds-md h1 { font-size: 20px; } .ds-md h2 { font-size: 17px; } .ds-md h3 { font-size: 14px; letter-spacing: .01em; }
  .ds-md h3:first-child, .ds-md > :first-child { margin-top: 0; }
  .ds-md p { margin: .5em 0; }
  .ds-md ul { margin: .5em 0; padding-left: 1.25em; } .ds-md li { margin: .25em 0; }
  .ds-md a { color: var(--feedback-info-text, #1e3a8a); text-decoration: underline; text-underline-offset: 2px; }
  .ds-md strong { font-weight: 600; }
  .ds-md code { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; background: var(--semantic-muted, #eeece6); padding: 1px 5px; border-radius: 4px; }
  .ds-md pre { background: var(--semantic-backgroundSubtle, #f5f5f4); border: 1px solid var(--semantic-border, #dfdcd9); border-radius: 8px; padding: 12px 14px; overflow-x: auto; margin: .75em 0; }
  .ds-md pre code { background: none; padding: 0; font-size: 12.5px; line-height: 1.6; }
  .ds-md table { border-collapse: collapse; width: 100%; margin: .75em 0; font-size: 13px; }
  .ds-md th, .ds-md td { border: 1px solid var(--semantic-border, #dfdcd9); padding: 7px 10px; text-align: left; vertical-align: top; }
  .ds-md th { background: var(--semantic-muted, #eeece6); font-weight: 600; }
  .ds-md blockquote { border-left: 3px solid var(--semantic-borderStrong, #cbc7c4); margin: .75em 0; padding: 2px 0 2px 14px; color: var(--semantic-foregroundSecondary, #78716c); }
  `;
  document.head.appendChild(s);
}

export default function Markdown({ children = '', className = '' }) {
  ensureStyles();
  const html = marked.parse(String(children || ''));
  return <div className={`ds-md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
