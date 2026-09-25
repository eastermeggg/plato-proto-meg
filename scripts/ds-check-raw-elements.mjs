#!/usr/bin/env node
// ds-check-raw-elements — ratchet sur les éléments HTML bruts (kit v3, délégué du doctor).
//
// La règle : un écran se construit avec les composants du DS (Button, Input,
// Select, Textarea de src/components/ui/), jamais avec l'élément HTML nu.
// L'existant (App.js, labs) est GRAND-PÉRÉ fichier par fichier dans une
// baseline ; les compteurs ne peuvent que descendre, et tout fichier NOUVEAU
// doit être à zéro. C'est le verrou mécanique de la règle AGENTS.md 11
// (« imiter /ui-kit, jamais App.js ») pour les protos agent-first.
//
// Usage :
//   node scripts/ds-check-raw-elements.mjs                  # humain, exit 1 si constat bloquant
//   node scripts/ds-check-raw-elements.mjs --report --json  # contrat de délégation du doctor
//   node scripts/ds-check-raw-elements.mjs --write          # (re)génère la baseline — geste steward,
//                                                           #  après un lot de résorption validé
//
// Exemptions :
//   - src/components/ui/ : la couche DS elle-même enveloppe des éléments bruts
//     (Button.js contient <button>) — c'est son rôle, et elle est gardée par
//     CODEOWNERS.
//   - une ligne portant « ds-raw-ok: <raison> » (commentaire) est exemptée —
//     réservé aux cas justifiés un par un (ex. wrapper technique d'un primitif
//     métier hors ui/).
//
// Baseline : scripts/ds-raw-baseline.json (comptes par fichier et par élément).

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const WRITE = args.includes('--write');
const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, 'scripts', 'ds-raw-baseline.json');

const ELEMENTS = ['button', 'input', 'select', 'textarea'];
const RAW_RE = new RegExp(`<(${ELEMENTS.join('|')})\\b`, 'g');
const EXEMPT_DIRS = ['src/components/ui'].map((e) => e.split('/').join(sep));
const isExempt = (rel) => EXEMPT_DIRS.some((e) => rel === e || rel.startsWith(e + sep));

// ── Comptage ────────────────────────────────────────────────────────────────
const counts = {}; // rel -> { button: n, ... }
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(ROOT, full);
    if (rel.includes('node_modules') || isExempt(rel)) continue;
    const st = statSync(full);
    if (st.isDirectory()) { walk(full); continue; }
    if (!/\.(js|jsx)$/.test(name) || name.endsWith('.test.js')) continue;
    const perFile = {};
    for (const line of readFileSync(full, 'utf8').split('\n')) {
      const t = line.trimStart();
      if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*')) continue;
      if (line.includes('ds-raw-ok:')) continue;
      for (const m of line.matchAll(RAW_RE)) perFile[m[1]] = (perFile[m[1]] || 0) + 1;
    }
    if (Object.keys(perFile).length) counts[rel.split(sep).join('/')] = perFile;
  }
};
walk(join(ROOT, 'src'));

// ── Écriture de la baseline ─────────────────────────────────────────────────
if (WRITE) {
  const sorted = Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(BASELINE_PATH, JSON.stringify({
    note: 'Baseline ratchet des éléments HTML bruts (ds-check-raw-elements). Régénérer via --write UNIQUEMENT après un lot de résorption validé — jamais pour faire passer un nouveau constat.',
    files: sorted,
  }, null, 2) + '\n');
  console.log(`Baseline écrite : ${Object.keys(sorted).length} fichier(s) grand-pérés.`);
  process.exit(0);
}

// ── Comparaison ─────────────────────────────────────────────────────────────
const findings = []; // { file, severity, rule, fix } — contrat de délégation du doctor
const FIX = 'utiliser les composants DS (Button / Input / Select / Textarea de src/components/ui/) ; cas justifié un par un : « ds-raw-ok: <raison> » en commentaire de ligne';

if (!existsSync(BASELINE_PATH)) {
  findings.push({ file: 'scripts/ds-raw-baseline.json', severity: 'error', rule: 'baseline absente', fix: 'node scripts/ds-check-raw-elements.mjs --write' });
} else {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).files || {};
  const allFiles = new Set([...Object.keys(counts), ...Object.keys(baseline)]);
  for (const file of [...allFiles].sort()) {
    const cur = counts[file] || {};
    const base = baseline[file] || {};
    const over = [];
    const under = [];
    for (const el of ELEMENTS) {
      const c = cur[el] || 0;
      const b = base[el] || 0;
      if (c > b) over.push(`<${el}> ${c} > baseline ${b}`);
      else if (c < b) under.push(`<${el}> ${c} < baseline ${b}`);
    }
    if (over.length) {
      const isNew = !baseline[file];
      findings.push({
        file,
        severity: 'error',
        rule: `éléments bruts${isNew ? ' dans un fichier NOUVEAU' : ''} : ${over.join(', ')}`,
        fix: FIX,
      });
    }
    if (under.length) {
      findings.push({
        file,
        severity: 'info',
        rule: `baseline à resserrer : ${under.join(', ')}`,
        fix: 'node scripts/ds-check-raw-elements.mjs --write (après revue du lot)',
      });
    }
  }
}

// ── Sortie ──────────────────────────────────────────────────────────────────
const errors = findings.filter((f) => f.severity === 'error');
if (JSON_OUT) {
  console.log(JSON.stringify(findings, null, 2));
  process.exitCode = 0; // le doctor décide ; --report ne fait jamais échouer
} else {
  for (const f of findings) console.log(`${f.severity.padEnd(5)} ${f.file} — ${f.rule} — ${f.fix}`);
  console.log(`\n${errors.length} constat(s) bloquant(s), ${findings.length - errors.length} info(s).`);
  process.exitCode = errors.length ? 1 : 0;
}
