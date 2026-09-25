#!/usr/bin/env node
// ds-doctor — garde-fou zéro dépendance du design system Norma / Plato.
//
// Point d'entrée unique des vérifications DS (voir .claude/skills/_shared/conventions.md §4).
// Lit ds.manifest.json à la racine ; les chemins listés dans paths.doctorExclude
// sont exemptés des checks de style (jamais de la validation du manifeste).
//
// Usage :
//   node scripts/ds-doctor.mjs             # exit 1 au premier constat bloquant
//   node scripts/ds-doctor.mjs --report    # compte sans échouer (mode adoption)
//   node scripts/ds-doctor.mjs --json      # sortie machine (tous les constats)
//
// Règles bloquantes (error) :
//   hex-hardcode   couleur hex en dur hors sources de tokens
//   manifest       ds.manifest.json absent, invalide ou chemins déclarés manquants
//   docs           constat bloquant délégué à scripts/ds-check-docs.mjs (fiches)
//   boundaries     constat délégué à scripts/ds-check-boundaries.mjs (packages)
//   raw-elements   constat délégué à scripts/ds-check-raw-elements.mjs :
//                  ratchet des éléments HTML bruts (<button>, <input>, <select>,
//                  <textarea>) — existant grand-péré (ds-raw-baseline.json),
//                  tout fichier NOUVEAU doit être à zéro, les compteurs ne
//                  peuvent que descendre. Exception ligne : « ds-raw-ok: <raison> »
//   emoji          émoji dans une chaîne rendue (interdit dans l'UI Norma) —
//                  verrouillé en bloquant le 23/09/2026 après passage à 0
//   em-dash        tiret cadratin dans une chaîne rendue (préférer le tiret
//                  simple ; le placeholder « — » seul est toléré) — verrouillé
//                  en bloquant le 23/09/2026 après passage à 0
// Règles informatives (warn, ne font jamais échouer) :
//   hex-pending    hex listé dans doctor.pendingHex du manifeste : en attente
//                  d'arbitrage steward (voir doctor.decisions, DECISIONS-HEX.md)
//   shadow-inline  chaîne box-shadow inline (rgba…) hors tokens : utiliser
//                  l'échelle shadows 2xs→3xl (tokens.js + classes shadow-*)
//   motion-curve   cubic-bezier inconnue de tokens.motion.easing : utiliser
//                  les courbes nommées (navSignature, navPeek, bounce…) -
//                  doctrine docs/motion.md, règle 12
//
// Exceptions : une ligne portant « ds-hex-ok: <raison> » (commentaire) est
// exemptée du check hex — réservé aux couleurs de marques tierces et aux cas
// justifiés un par un. Comptées dans le rapport.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const REPORT = args.includes('--report');
const JSON_OUT = args.includes('--json');
const ROOT = process.cwd();

const findings = []; // { file, line, rule, severity, detail, fix }
const add = (file, line, rule, severity, detail, fix) =>
  findings.push({ file, line, rule, severity, detail, fix });

// ── 1. Manifeste ──────────────────────────────────────────────────────────
let manifest = {};
const manifestPath = join(ROOT, 'ds.manifest.json');
if (!existsSync(manifestPath)) {
  add('ds.manifest.json', 0, 'manifest', 'error', 'fichier absent',
    'créer ds.manifest.json à la racine (voir .claude/skills/_shared/conventions.md §1)');
} else {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const key of ['ds', 'owner', 'paths', 'figma']) {
      if (!manifest[key]) add('ds.manifest.json', 0, 'manifest', 'error',
        `clé "${key}" manquante`, 'compléter le manifeste');
    }
    const p = manifest.paths || {};
    for (const [k, v] of Object.entries({ rules: p.rules, theme: p.theme, inventory: p.inventory })) {
      if (v && !existsSync(join(ROOT, v))) add('ds.manifest.json', 0, 'manifest', 'error',
        `paths.${k} pointe vers "${v}" qui n'existe pas`, 'corriger le chemin ou créer le fichier');
    }
    if (manifest.figma && !['none', 'intent', 'mirror'].includes(manifest.figma.mode)) {
      add('ds.manifest.json', 0, 'manifest', 'error',
        `figma.mode "${manifest.figma.mode}" inconnu`, 'utiliser none | intent | mirror');
    }
  } catch (e) {
    add('ds.manifest.json', 0, 'manifest', 'error', `JSON invalide : ${e.message}`, 'corriger la syntaxe');
  }
}

// ── 2. Palette de référence (tokens.js + tailwind.config.js) ─────────────
const HEX_RE = /(?<!&)#[0-9a-fA-F]{3,8}\b/g; // (?<!&) : ignore les entités HTML &#8203;
const themePath = manifest.paths?.theme || 'src/design-system/tokens.js';
const tokenSources = [themePath, 'tailwind.config.js'];
const knownHex = new Map(); // hex (lowercase, forme longue) -> nom de token
const canon = (h) => {
  h = h.toLowerCase();
  if (h.length === 4) h = '#' + [...h.slice(1)].map((c) => c + c).join('');
  return h;
};
for (const src of tokenSources) {
  const full = join(ROOT, src);
  if (!existsSync(full)) continue;
  for (const line of readFileSync(full, 'utf8').split('\n')) {
    const named = line.match(/['"]?([\w.-]+)['"]?\s*:\s*['"](#[0-9a-fA-F]{3,8})\b/);
    for (const m of line.match(HEX_RE) || []) {
      const c = canon(m);
      if (!knownHex.has(c)) knownHex.set(c, named && canon(named[2]) === c ? named[1] : null);
    }
  }
}

// ── 3. Parcours de src ────────────────────────────────────────────────────
const excludes = [
  'node_modules',
  themePath,
  ...(manifest.paths?.doctorExclude || []),
].map((e) => e.split('/').join(sep));
const isExcluded = (rel) => excludes.some((e) => rel === e || rel.startsWith(e + sep));
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\u{FE0F}?/u;
const SCAN_EXT = ['.js', '.jsx', '.css'];

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(ROOT, full);
    if (isExcluded(rel)) continue;
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (SCAN_EXT.some((e) => name.endsWith(e)) && !name.endsWith('.test.js')) scan(full, rel);
  }
};

const pendingHex = new Set((manifest.doctor?.pendingHex || []).map(canon));
let exceptions = 0;

// Courbes de motion connues : toutes les cubic-bezier déclarées dans les
// sources de tokens (tokens.js + index.css, où vivent les keyframes).
const CURVE_RE = /cubic-bezier\(\s*[\d.,\s-]+\)/g;
// Normalisation : espaces retirés + zéros de tête ajoutés (`.22` == `0.22`).
const canonCurve = (s) => s.replace(/\s+/g, '').replace(/([(,])\./g, '$10.');
const knownCurves = new Set();
for (const src of [themePath, 'src/index.css']) {
  const full = join(ROOT, src);
  if (!existsSync(full)) continue;
  for (const m of readFileSync(full, 'utf8').match(CURVE_RE) || []) knownCurves.add(canonCurve(m));
}

const scan = (full, rel) => {
  const lines = readFileSync(full, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const n = i + 1;
    const excepted = line.includes('ds-hex-ok:');
    // Un hex dans une ligne de commentaire n'est pas une couleur rendue
    // (specs internes, références Figma) — hors périmètre du check hex.
    const t = line.trimStart();
    const isComment = t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*');
    // Commentaire de fin de ligne (`x, // #hex`) : le hex documente, il n'est pas rendu.
    const sl = line.indexOf('//');
    const codePart = sl > 0 && line[sl - 1] !== ':' ? line.slice(0, sl) : line;
    for (const m of (isComment ? [] : codePart.match(HEX_RE) || [])) {
      const c = canon(m);
      if (excepted) { exceptions++; continue; }
      if (pendingHex.has(c)) {
        add(rel, n, 'hex-pending', 'warn', m,
          `en attente d'arbitrage steward (${manifest.doctor?.decisions || 'DECISIONS-HEX.md'})`);
        continue;
      }
      const token = knownHex.get(c);
      add(rel, n, 'hex-hardcode', 'error', m,
        knownHex.has(c)
          ? `remplacer par le token ${token ? `« ${token} »` : 'équivalent'} (tokens.js / classe Tailwind nommée)`
          : 'hors palette : mapper sur un token proche ou faire entrer la valeur dans le thème (ds-decide)');
    }
    // Émojis / cadratins : seules les chaînes RENDUES comptent — un commentaire
    // n'est pas de l'UI (même périmètre que le check hex).
    if (!isComment && EMOJI_RE.test(codePart)) {
      add(rel, n, 'emoji', 'error', line.trim().slice(0, 60),
        'pas d\'émoji dans l\'UI Norma : icône lucide, typo ou motion');
    }
    // Les placeholders « — » seuls entre quotes sont retirés avant le test :
    // seuls les cadratins restants (texte UI) comptent.
    if (!isComment && codePart.replace(/(['"`])\s*—\s*\1/g, '').includes('—')) {
      add(rel, n, 'em-dash', 'error', line.trim().slice(0, 60),
        'préférer le tiret simple « - » dans les textes UI (« — » seul = placeholder toléré)');
    }
    // Courbe de motion improvisée : toute cubic-bezier absente des sources de
    // tokens (tokens.motion.easing + keyframes index.css). Warn - doctrine
    // docs/motion.md.
    if (!isComment) {
      for (const m of codePart.match(CURVE_RE) || []) {
        if (!knownCurves.has(canonCurve(m))) {
          add(rel, n, 'motion-curve', 'warn', m,
            'utiliser une courbe nommée de tokens.motion.easing (navSignature, navPeek, bounce…) - docs/motion.md');
        }
      }
    }
    // Ombre inline (boxShadow: '0 … rgba(…)') hors tokens : l'échelle vit dans
    // tokens.js `shadows` (2xs → 3xl) + classes Tailwind shadow-*. Warn.
    if (!isComment && /box-?shadow\s*[:=]/i.test(codePart) && /rgba?\(/.test(codePart)
        && !/shadows\.|dsShadows\./.test(codePart)) {
      add(rel, n, 'shadow-inline', 'warn', line.trim().slice(0, 70),
        'utiliser l\'échelle : classe shadow-2xs…shadow-3xl ou tokens `shadows.*` (jamais de chaîne box-shadow inline)');
    }
  });
};

walk(join(ROOT, 'src'));

// ── 3 bis. Délégation (kit v3, CHANGEMENTS.md) : fiches + frontières ──────
// Les constats des checks délégués sont FUSIONNÉS dans ceux du doctor : la
// sortie --json reste un seul document valide, --report les compte, et un
// constat bloquant délégué fait échouer le doctor hors --report.
const DELEGATED = {
  'ds-check-docs.mjs': 'docs',
  'ds-check-boundaries.mjs': 'boundaries',
  'ds-check-raw-elements.mjs': 'raw-elements',
};
for (const [s, rule] of Object.entries(DELEGATED)) {
  const r = spawnSync('node', [join(ROOT, 'scripts', s), '--report', '--json'], { encoding: 'utf8' });
  try {
    for (const f of JSON.parse(r.stdout))
      add(f.file, 0, rule, f.severity === 'info' ? 'warn' : 'error', f.rule, f.fix);
  } catch {
    add(`scripts/${s}`, 0, rule, 'error',
      `sortie illisible : ${(r.stderr || r.stdout || '(vide)').trim().slice(0, 120)}`,
      'lancer le script seul pour le détail');
  }
}

// ── 4. Sortie ─────────────────────────────────────────────────────────────
const errors = findings.filter((f) => f.severity === 'error');
const warns = findings.filter((f) => f.severity === 'warn');

if (JSON_OUT) {
  // process.exitCode (jamais process.exit) : un exit immédiat tronque le JSON
  // à 64 Ko quand stdout est un pipe (spawnSync de ds-audit, `| python3`…).
  console.log(JSON.stringify({ errors: errors.length, warns: warns.length, findings }, null, 2));
  process.exitCode = REPORT || errors.length === 0 ? 0 : 1;
} else if (REPORT) {
  const byRule = {};
  for (const f of findings) byRule[f.rule] = (byRule[f.rule] || 0) + 1;
  const byFile = {};
  for (const f of errors) byFile[f.file] = (byFile[f.file] || 0) + 1;
  const hexFreq = {};
  for (const f of errors.filter((f) => f.rule === 'hex-hardcode')) {
    const c = canon(f.detail);
    hexFreq[c] = (hexFreq[c] || 0) + 1;
  }
  const mappable = errors.filter((f) => f.rule === 'hex-hardcode' && knownHex.has(canon(f.detail))).length;

  console.log('ds-doctor — rapport (aucun échec en mode --report)\n');
  if (exceptions) console.log(`Exceptions « ds-hex-ok » : ${exceptions} occurrence(s)\n`);
  console.log('Par règle :');
  for (const [r, c] of Object.entries(byRule)) console.log(`  ${r.padEnd(14)} ${c}`);
  console.log(`\nHex en dur : ${byRule['hex-hardcode'] || 0} au total, dont ${mappable} avec équivalent exact dans la palette (mécaniquement migrables).`);
  console.log('\nTop 15 fichiers (constats bloquants) :');
  Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 15)
    .forEach(([f, c]) => console.log(`  ${String(c).padStart(5)}  ${f}`));
  console.log('\nTop 20 valeurs hex :');
  Object.entries(hexFreq).sort((a, b) => b[1] - a[1]).slice(0, 20)
    .forEach(([h, c]) => {
      const t = knownHex.has(h) ? (knownHex.get(h) ? `= token « ${knownHex.get(h)} »` : '= dans la palette') : 'hors palette';
      console.log(`  ${String(c).padStart(5)}  ${h}  ${t}`);
    });
  process.exitCode = 0;
} else {
  const CAP = 100;
  for (const f of errors.slice(0, CAP)) {
    console.log(`${f.file}:${f.line} — ${f.rule} (${f.detail}) — ${f.fix}`);
  }
  if (errors.length > CAP) console.log(`… + ${errors.length - CAP} autres constats — utiliser --json ou --report`);
  if (warns.length) console.log(`\n${warns.length} avertissement(s) non bloquant(s) (shadow-inline / hex-pending / motion-curve / infos déléguées) — détail via --json`);
  console.log(`\n${errors.length} constat(s) bloquant(s).`);
  process.exitCode = errors.length ? 1 : 0;
}
