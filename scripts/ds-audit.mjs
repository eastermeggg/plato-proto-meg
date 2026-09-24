#!/usr/bin/env node
// État du DS entier → rapport + issues (conventions §2). Uniquement des constats prouvés.
// Usage :
//   node scripts/ds-audit.mjs                       rapport (docs/audits/<date>.md + résumé)
//   node scripts/ds-audit.mjs --create-issues       + issues ds-gap/triage, dédupliquées par titre
//   node scripts/ds-audit.mjs --harvest [--create-issues]   SIGNALEMENTS.md → issues
import { spawnSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
import { resolvePackages, readComponentDocs, walk, rel, kebab, ROOT } from "./lib/ds-manifest.mjs";

const HARVEST = process.argv.includes("--harvest");
const CREATE = process.argv.includes("--create-issues");
const today = new Date().toISOString().slice(0, 10);
const groups = new Map(); // titre d'issue → { family, title, proofs: [] }
const add = (family, title, proof) => {
  if (!groups.has(title)) groups.set(title, { family, title, proofs: [] });
  groups.get(title).proofs.push(proof);
};

function runJson(name) {
  const script = path.join(HERE, name);
  if (!fs.existsSync(script)) return [];
  const r = spawnSync("node", [script, "--report", "--json"], { cwd: ROOT, encoding: "utf8" });
  try {
    const parsed = JSON.parse(r.stdout);
    // ds-doctor colombo : objet { errors, warns, findings } dont les constats
    // délégués (docs/boundaries) — déjà collectés ici en direct, on les saute.
    if (parsed.findings) return parsed.findings.filter((f) => !["docs", "boundaries"].includes(f.rule));
    return parsed;
  } catch {
    // Sortie texte « fichier:ligne — règle — correctif »
    return (r.stdout || "").split("\n").map((l) => l.split(" — ")).filter((p) => p.length >= 2).map(([file, rule, fix]) => ({ file, rule, fix }));
  }
}

if (HARVEST) {
  const f = path.join(ROOT, "SIGNALEMENTS.md");
  const lines = fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n") : [];
  for (const l of lines) {
    const m = l.match(/^\s*[-*]\s+(.+)$/) || l.match(/^\|\s*([^|-][^|]+)\|/);
    if (m && !/^(type|quoi|---)/i.test(m[1].trim())) add("signalement", `[ds-gap] ${m[1].trim().slice(0, 90)}`, `SIGNALEMENTS.md — ${m[1].trim()}`);
  }
} else {
  const pkgs = resolvePackages();
  const docs = pkgs.flatMap((p) => readComponentDocs(p).map((d) => ({ ...d, pkg: p })));

  // 1. Outils existants
  for (const f of runJson("ds-doctor.mjs")) add("tokens", `[ds-gap] ds:doctor — ${f.rule}`, `${f.file} — ${f.fix ?? ""}`);
  for (const f of runJson("ds-check-docs.mjs")) add("doc", `[ds-gap] fiches — ${f.rule.replace(/«[^»]*»\s*/g, "").replace(/:.*$/, "").trim()}`, `${f.file} — ${f.rule}`);
  for (const f of runJson("ds-check-boundaries.mjs")) add("frontière", `[ds-gap] frontière — ${f.rule.replace(/:.*$/, "")}`, `${f.file} — ${f.rule}`);

  const code = pkgs.flatMap((p) => walk(p.root, [".tsx", ".jsx", ".ts"]).map((f) => ({ f, text: fs.readFileSync(f, "utf8") })));

  // 2. Composants deprecated encore importés
  for (const { fm, pkg } of docs) {
    if (fm?.status !== "deprecated" || !fm.source) continue;
    const stem = path.join(pkg.root, fm.source).replace(/\.(tsx?|jsx?)$/, "").split(path.sep).slice(-3).join("/");
    for (const { f, text } of code)
      text.split("\n").forEach((line, i) => {
        if (line.includes(stem) && /import|from/.test(line))
          add("dette", `[ds-gap] ${fm.name} (deprecated) encore utilisé → ${fm.replacedBy ?? "?"}`, `${rel(f)}:${i + 1}`);
      });
  }

  // 3. Même className posé sur un composant DS dans ≥ 2 fichiers → variant probable
  const names = docs.map((d) => d.fm?.name).filter((n) => n && /^[A-Z]/.test(n));
  const seen = new Map(); // `${name}|${classes}` → Set(fichiers:ligne)
  const demoFiles = new Set(docs.map((d) => d.fm?.demo && path.join(d.pkg.root, d.fm.demo)));
  for (const { f, text } of code) {
    if (demoFiles.has(f) || /components\/ui\//.test(f)) continue;
    text.split("\n").forEach((line, i) => {
      for (const n of names) {
        const m = line.match(new RegExp(`<${n}\\b[^>]*?className=["'{\`]+([^"'\`}]+)`));
        if (!m) continue;
        const classes = m[1].trim().split(/\s+/).sort().join(" ");
        const key = `${n}|${classes}`;
        if (!seen.has(key)) seen.set(key, new Map());
        seen.get(key).set(rel(f), `${rel(f)}:${i + 1}`);
      }
    });
  }
  for (const [key, files] of seen) if (files.size >= 2) {
    const [n, classes] = key.split("|");
    for (const p of files.values()) add("variant", `[ds-gap] ${n} ajusté à l'identique dans ${files.size} fichiers (\`${classes}\`) — variant manquant ?`, p);
  }
}

// Rapport
const list = [...groups.values()].sort((a, b) => b.proofs.length - a.proofs.length);
const byFamily = list.reduce((acc, g) => ((acc[g.family] = (acc[g.family] || 0) + g.proofs.length), acc), {});
const md = [`# Audit DS — ${today}${HARVEST ? " (harvest)" : ""}`, "",
  "| Famille | Constats |", "|---|---|", ...Object.entries(byFamily).map(([k, v]) => `| ${k} | ${v} |`), "",
  ...list.flatMap((g) => [`## ${g.title}`, ...g.proofs.slice(0, 30).map((p) => `- ${p}`), g.proofs.length > 30 ? `- … +${g.proofs.length - 30}` : "", ""])].join("\n");

if (!HARVEST) {
  const dir = path.join(ROOT, "docs/audits");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${today}.md`), md);
}
console.log(`Audit ${today} : ${list.length} sujet(s), ${list.reduce((s, g) => s + g.proofs.length, 0)} constat(s).`);
for (const g of list.slice(0, 5)) console.log(`- ${g.title} (${g.proofs.length})`);
if (!HARVEST) console.log(`Détail : docs/audits/${today}.md`);

// Issues
if (CREATE && list.length) {
  const gh = (...a) => execFileSync("gh", a, { cwd: ROOT, encoding: "utf8" });
  try { gh("--version"); } catch { console.error("gh indisponible : issues non créées. Le rapport contient les corps prêts à coller."); process.exit(1); }
  for (const l of ["ds-gap", "triage"]) { try { gh("label", "create", l, "--force"); } catch {} }
  const open = new Set(JSON.parse(gh("issue", "list", "--label", "ds-gap", "--state", "open", "--limit", "500", "--json", "title")).map((i) => i.title));
  let created = 0;
  for (const g of list) {
    if (open.has(g.title)) continue;
    const body = [`**Famille** : ${g.family}`, `**Origine** : ${HARVEST ? "SIGNALEMENTS.md" : "audit"} du ${today}`, "", "**Preuves**", ...g.proofs.slice(0, 30).map((p) => `- \`${p}\``)].join("\n");
    gh("issue", "create", "--title", g.title, "--label", "ds-gap", "--label", "triage", "--body", body);
    created++;
  }
  console.log(`${created} issue(s) créée(s), ${list.length - created} déjà ouverte(s).`);
}
