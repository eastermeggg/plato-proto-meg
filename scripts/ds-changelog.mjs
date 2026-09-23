#!/usr/bin/env node
// Changelog par composant dérivé de git (conventions §10).
// Usage :
//   node scripts/ds-changelog.mjs [--days 15] [--component button] [--package ui-product] [--md|--json]
//   node scripts/ds-changelog.mjs --pr --base origin/main [--days 15] [--md]
//   node scripts/ds-changelog.mjs --release [--since <tag>]   (contrats stables modifiés depuis la dernière release)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { resolvePackages, readComponentDocs, walk, rel, kebab, ROOT } from "./lib/ds-manifest.mjs";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const DAYS = Number(opt("days", 15));
const ONLY = opt("component") && kebab(opt("component"));
const ONLY_PKG = opt("package");
const PR = flag("pr");
const RELEASE = flag("release");
const BASE = opt("base", "origin/main");
const FORMAT = flag("json") ? "json" : flag("md") ? "md" : "text";

const git = (...a) => { try { return execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return ""; } };

// 1. Construire le registre des composants à partir des fiches.
const pkgs = resolvePackages().filter((p) => !ONLY_PKG || p.name === ONLY_PKG);
const components = [];
for (const pkg of pkgs) {
  const demoDir = path.dirname(path.join(pkg.root, pkg.paths.inventory));
  const demos = fs.existsSync(demoDir) ? fs.readdirSync(demoDir) : [];
  for (const { file, fm } of readComponentDocs(pkg)) {
    if (!fm?.name) continue;
    const id = kebab(fm.name);
    const files = [rel(file)];
    if (fm.source) files.push(rel(path.join(pkg.root, fm.source)));
    const demo = fm.demo ? path.join(pkg.root, fm.demo) : demos.map((d) => path.join(demoDir, d)).find((d) => kebab(path.basename(d)).startsWith(id));
    if (demo) files.push(rel(demo));
    components.push({ id, name: fm.name, pkg: pkg.name, status: fm.status, dependsOn: fm.dependsOn || [], source: fm.source ? path.join(pkg.root, fm.source) : null, files });
  }
}

// 2. Historique d'un composant sur la fenêtre.
function history(c) {
  const out = git("log", `--since=${DAYS} days ago`, "--date=short", "--format=%h%x09%ad%x09%s", "--", ...c.files);
  return out ? out.split("\n").map((l) => { const [sha, date, subject] = l.split("\t"); const type = (subject.match(/^(\w+)(\(|:)/) || [])[1] || "autre"; return { sha, date, type, subject }; }) : [];
}

// 3. Dépendants : fiches qui déclarent la dépendance + fichiers qui importent la source.
const allCode = resolvePackages().flatMap((p) => walk(p.root, [".ts", ".tsx", ".js", ".jsx"]).map((f) => ({ f, pkg: p.name })));
function dependents(c) {
  const byDoc = components.filter((o) => o.dependsOn.map(kebab).includes(c.id)).map((o) => `${o.pkg}/${o.id}`);
  let byImport = [];
  if (c.source) {
    const stem = c.source.replace(/\.(tsx?|jsx?)$/, "").split(path.sep).slice(-3).join("/"); // ex. components/ui/button
    const re = new RegExp(`["'][^"']*${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`);
    byImport = allCode.filter(({ f }) => f !== c.source && re.test(fs.readFileSync(f, "utf8"))).map(({ f, pkg }) => `${pkg}:${rel(f)}`);
  }
  return { byDoc, byImport };
}

// 4. Mode PR : composants touchés et contrat modifié ou non.
let prInfo = null;
if (PR) {
  const changed = git("diff", "--name-only", `${BASE}...HEAD`).split("\n").filter(Boolean);
  const touched = components.filter((c) => c.files.some((f) => changed.includes(f)));
  prInfo = touched.map((c) => {
    const srcDiff = c.source ? git("diff", `${BASE}...HEAD`, "--", rel(c.source)) : "";
    const apiChanged = /^[+-].*(variants\s*:|export\s+(function|const|interface|type)|Props\b)/m.test(srcDiff);
    return { ...c, apiChanged };
  });
}

// 4 bis. Mode release : composants stables dont le contrat a changé depuis le dernier tag.
if (RELEASE) {
  const since = opt("since", git("describe", "--tags", "--abbrev=0"));
  if (!since) { console.log("Aucun tag trouvé : passer --since <ref>."); process.exit(0); }
  const hits = components.filter((c) => c.status === "stable" && c.source).filter((c) =>
    /^[+-].*(variants\s*:|export\s+(function|const|interface|type)|Props\b)/m.test(git("diff", `${since}..HEAD`, "--", rel(c.source))));
  const bumped = /"version"\s*:/.test(git("diff", `${since}..HEAD`, "--", "ds.manifest.json"));
  console.log(`Depuis ${since} : ${hits.length} composant(s) stable(s) au contrat modifié.`);
  for (const c of hits) console.log(`- ${c.pkg}/${c.id}`);
  if (hits.length && !bumped) { console.log("⚠️ ds.version n'a pas bougé depuis ce tag : à bumper avant la release."); process.exit(1); }
  process.exit(0);
}

// 5. Sortie.
const selected = PR ? prInfo : components.filter((c) => !ONLY || c.id === ONLY);
const result = selected.map((c) => ({ ...c, history: history(c), dependents: dependents(c) })).filter((c) => PR || ONLY || c.history.length);

if (FORMAT === "json") { console.log(JSON.stringify({ days: DAYS, pr: PR, components: result }, null, 2)); process.exit(0); }

const lines = [];
if (PR) {
  lines.push(`## Flag DS — composants touchés par cette PR (historique ${DAYS} j)`, "");
  if (!result.length) lines.push("Aucun composant du DS touché.");
  else {
    lines.push("| Composant | Status | Changements (fenêtre) | Dépendants | Contrat |", "|---|---|---|---|---|");
    for (const c of result) {
      const d = c.dependents; const n = d.byDoc.length + d.byImport.length;
      lines.push(`| ${c.pkg}/${c.id} | ${c.status || "?"} | ${c.history.length} | ${n}${d.byImport.some((x) => !x.startsWith(c.pkg)) ? " (dont autres packages)" : ""} | ${c.apiChanged ? (c.status === "stable" ? "contrat d'un composant stable modifié" : "contrat modifié") : "—"} |`);
    }
    lines.push("", "Dépendants à vérifier dans la régression visuelle :");
    for (const c of result) for (const x of [...c.dependents.byDoc, ...c.dependents.byImport]) lines.push(`- ${c.id} ← ${x}`);
  }
} else {
  lines.push(`# Changelog DS — ${DAYS} derniers jours`, "");
  if (!result.length) lines.push("Aucun changement sur la fenêtre.");
  for (const c of result) {
    lines.push(`## ${c.pkg}/${c.id} — status: ${c.status || "?"}`, "", "| Date | Commit | Type | Résumé |", "|---|---|---|---|");
    for (const h of c.history) lines.push(`| ${h.date} | ${h.sha} | ${h.type} | ${h.subject.replace(/\|/g, "\\|")} |`);
    const d = c.dependents;
    lines.push("", `**Dépendants** : ${[...d.byDoc, ...d.byImport].join(", ") || "aucun"}`, "");
  }
}
console.log(FORMAT === "md" ? lines.join("\n") : lines.join("\n").replace(/\*\*/g, ""));
