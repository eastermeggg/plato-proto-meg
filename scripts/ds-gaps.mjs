#!/usr/bin/env node
// ds-gaps — flagge ce qui MANQUE dans le design system (l'outil « complétude »,
// complément du ds-doctor qui flagge ce qui est INTERDIT).
//
// Vérifie :
//   fiche-manquante      composant ui/*.js sans fiche .md sœur
//   fiche-orpheline      fiche .md sans composant .js
//   docs-périmés         componentDocs.json plus vieux qu'une fiche .md (relancer ds:docs)
//   docs-absent          fiche .md absente de componentDocs.json
//   inventaire-exists    entrée d'inventaire dont `exists` contredit le filesystem
//   inventaire-absent    composant ui/*.js sans entrée d'inventaire
//   demo-manquante       composant ui/*.js sans démo dans componentDemos.jsx (info)
//   token-non-catalogué  token couleur de tokens.js absent du catalogue (info)
//
// Usage :
//   node scripts/ds-gaps.mjs          # rapport, exit 0
//   node scripts/ds-gaps.mjs --ci     # exit 1 s'il y a des manques bloquants
//                                     # (fiche-manquante, docs-périmés, docs-absent,
//                                     #  inventaire-exists)

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const CI = process.argv.includes('--ci');
const UI = 'src/components/ui';
const DOCS_JSON = 'src/data/componentDocs.json';
const INV_JSON = 'src/data/designSystemInventory.json';
const DEMOS = 'src/components/ui-kit/componentDemos.jsx';

const gaps = []; // { rule, blocking, msg }
const add = (rule, blocking, msg) => gaps.push({ rule, blocking, msg });

// ── composants ui/ ↔ fiches .md ──
const jsFiles = readdirSync(UI).filter((f) => f.endsWith('.js'));
const mdFiles = readdirSync(UI).filter((f) => f.endsWith('.md') && f !== 'CLAUDE.md');
const jsNames = new Set(jsFiles.map((f) => basename(f, '.js')));
const mdNames = new Set(mdFiles.map((f) => basename(f, '.md')));
for (const n of jsNames) if (!mdNames.has(n)) add('fiche-manquante', true, `${UI}/${n}.js n'a pas de fiche ${n}.md (modèle : Badge.md)`);
for (const n of mdNames) if (!jsNames.has(n)) add('fiche-orpheline', false, `${UI}/${n}.md n'a pas de composant ${n}.js`);

// ── componentDocs.json : fraîcheur + couverture ──
if (!existsSync(DOCS_JSON)) {
  add('docs-absent', true, `${DOCS_JSON} manquant — lancer \`npm run ds:docs\``);
} else {
  const docsM = statSync(DOCS_JSON).mtimeMs;
  const docs = JSON.parse(readFileSync(DOCS_JSON, 'utf8'));
  for (const f of mdFiles) {
    if (statSync(join(UI, f)).mtimeMs > docsM) add('docs-périmés', true, `${f} modifié après ${DOCS_JSON} — lancer \`npm run ds:docs\``);
    const id = basename(f, '.md');
    if (!(docs.components || {})[id]) add('docs-absent', true, `${id} absent de ${DOCS_JSON} — lancer \`npm run ds:docs\``);
  }
}

// ── inventaire : exists vs filesystem + couverture ui/ ──
const inv = JSON.parse(readFileSync(INV_JSON, 'utf8'));
const invById = Object.fromEntries((inv.components || []).map((c) => [c.id, c]));
for (const c of inv.components || []) {
  const real = !!c.filePath && existsSync(c.filePath);
  if (real !== !!c.exists) add('inventaire-exists', true, `${c.id} : exists=${c.exists} mais le fichier ${c.filePath || '(aucun)'} ${real ? 'existe' : "n'existe pas"}`);
}
for (const n of jsNames) if (!invById[n]) add('inventaire-absent', false, `${UI}/${n}.js sans entrée dans ${INV_JSON} (nouveau composant émis ?)`);

// ── démos (info) : clé top-level dans componentDemos.jsx ──
const demosSrc = existsSync(DEMOS) ? readFileSync(DEMOS, 'utf8') : '';
for (const n of jsNames) {
  const re = new RegExp(`^  ${n}:\\s*\\{`, 'm');
  if (!re.test(demosSrc)) add('demo-manquante', false, `${n} sans démo dans componentDemos.jsx (pas de Playground/controls)`);
}

// ── tokens : tokens.js vs catalogue (info) ──
try {
  const tokensSrc = readFileSync('src/design-system/tokens.js', 'utf8');
  const hexes = new Set((tokensSrc.match(/#[0-9a-fA-F]{6}\b/g) || []).map((h) => h.toLowerCase()));
  const catalogued = new Set(
    (inv.tokens?.colors || []).flatMap((t) => [
      ...String(t.value || '').toLowerCase().match(/#[0-9a-f]{6}/g) || [],
      ...String(t.valueDark || '').toLowerCase().match(/#[0-9a-f]{6}/g) || [],
    ])
  );
  const missing = [...hexes].filter((h) => !catalogued.has(h));
  if (missing.length) add('token-non-catalogué', false, `${missing.length} hex de tokens.js absents du catalogue (${missing.slice(0, 5).join(', ')}…) — régénérer la section tokens`);
} catch { /* tokens illisibles : le doctor s'en charge */ }

// ── sortie ──
const blocking = gaps.filter((g) => g.blocking);
const info = gaps.filter((g) => !g.blocking);
console.log(`ds-gaps — ${gaps.length} constat(s) : ${blocking.length} bloquant(s), ${info.length} info\n`);
for (const g of blocking) console.log(`  [!] ${g.rule.padEnd(20)} ${g.msg}`);
if (blocking.length && info.length) console.log('');
for (const g of info) console.log(`  [i] ${g.rule.padEnd(20)} ${g.msg}`);
if (!gaps.length) console.log('  Rien à signaler — le système est complet.');
process.exit(CI && blocking.length ? 1 : 0);
