#!/usr/bin/env node
// Vérifie les fiches composant (conventions §9). Délégué par ds:doctor.
// Adapté colombo : inventaire JSON (designSystemInventory.json), vérif
// bidirectionnelle bornée aux entrées canoniques (exists + filePath dans
// docsComponents), et absorbe les checks uniques de l'ancien ds-gaps.mjs
// (docs-périmés, docs-absent, inventaire-exists, demo-manquante,
// token-non-catalogué).
//
// Sévérités : error (bloquant) · info (visible, ne fait pas échouer).
// Usage : node scripts/ds-check-docs.mjs [--report] [--json]
import fs from "node:fs";
import path from "node:path";
import { resolvePackages, readComponentDocs, rel, kebab } from "./lib/ds-manifest.mjs";

const REPORT = process.argv.includes("--report");
const JSON_OUT = process.argv.includes("--json");
const REQUIRED = ["name", "package", "status", "usage", "source", "demo"];
const ALLOWED = new Set([...REQUIRED, "replacedBy", "figma"]);
const STATUSES = ["draft", "beta", "stable", "deprecated"];
const findings = [];
const add = (file, rule, fix, severity = "error") =>
  findings.push({ file: rel(file), rule, fix, severity });

for (const pkg of resolvePackages()) {
  const docs = readComponentDocs(pkg);
  const docNames = new Set(); // kebab(name) et kebab(inventoryId)

  for (const { file, fm } of docs) {
    if (!fm) { add(file, "fiche sans frontmatter", "partir de templates/component.md"); continue; }
    for (const k of REQUIRED) if (fm[k] == null || fm[k] === "") add(file, `champ requis manquant : ${k}`, "compléter le frontmatter");
    if (fm.status && !STATUSES.includes(fm.status)) add(file, `status invalide : ${fm.status}`, STATUSES.join(" · "));
    if (fm.status === "deprecated" && !fm.replacedBy) add(file, "deprecated sans replacedBy", "indiquer le composant de remplacement");
    if (fm.package && fm.package !== pkg.name) add(file, `package déclaré « ${fm.package} » ≠ « ${pkg.name} »`, "corriger le champ package ou déplacer la fiche");
    for (const k of ["source", "demo"]) if (fm[k] && !fs.existsSync(path.join(pkg.root, fm[k]))) add(file, `${k} introuvable : ${fm[k]}`, "mettre à jour le chemin");
    // §7 : format minimal — aucun champ hors ALLOWED, aucune section hors format.
    for (const k of Object.keys(fm)) if (!ALLOWED.has(k)) add(file, `champ non autorisé : ${k}`, "supprimer (§7 : dérivé ou hors fiche)");
    const body = fs.readFileSync(file, "utf8").replace(/^---\n[\s\S]*?\n---\n?/, "");
    if (/^>\s*\*\*(Type|Status)\*\*/m.test(body)) add(file, "en-tête qui répète le frontmatter", "supprimer la citation");
    if (/^##\s+(Tokens used|Sprint|Proto demo)/mi.test(body)) add(file, "section hors format", "supprimer ; une dette devient une issue ds-gap");
    const prose = body.replace(/```[\s\S]*?```/g, "");
    if (/#[0-9a-fA-F]{6}\b|#[0-9a-f]*[a-f][0-9a-f]*\b|\b\d+px\b/i.test(prose)) add(file, "valeur brute (hex/px) dans la prose", "nommer le token ou supprimer");
    if (fm.name) docNames.add(kebab(fm.name));
    if (fm.inventoryId) docNames.add(kebab(fm.inventoryId));
  }

  // Inventaire ↔ fiches.
  const invPath = path.join(pkg.root, pkg.paths.inventory);
  if (!fs.existsSync(invPath)) { add(invPath, "inventaire introuvable", "vérifier paths.inventory (conventions §1)"); continue; }

  if (invPath.endsWith(".json")) {
    // Format colombo : { components: [{ id, filePath, exists, status }] }.
    let inv;
    try { inv = JSON.parse(fs.readFileSync(invPath, "utf8")); }
    catch (e) { add(invPath, `inventaire JSON invalide : ${e.message}`, "corriger la syntaxe"); continue; }
    const entries = inv.components || [];
    const docsDir = pkg.paths.docsComponents.replace(/\/$/, "") + "/";

    // exists ↔ filesystem (toutes les entrées — ex ds-gaps `inventaire-exists`).
    for (const c of entries) {
      const real = !!c.filePath && fs.existsSync(path.join(pkg.root, c.filePath));
      if (real !== !!c.exists) add(invPath, `inventaire : ${c.id} exists=${c.exists} mais ${c.filePath || "(aucun fichier)"} ${real ? "existe" : "n'existe pas"}`, "resynchroniser l'inventaire");
    }

    // Entrées canoniques (promues dans docsComponents) → chaque entrée a sa fiche.
    // Les esquisses non promues (exists:false / hors docsComponents) sont le
    // backlog de promotion : visibles via ds-audit, pas des constats bloquants.
    const canonical = entries.filter((c) => c.exists && (c.filePath || "").startsWith(docsDir));
    for (const c of canonical) if (!docNames.has(kebab(c.id)))
      add(invPath, `composant « ${c.id} » sans fiche`, `créer ${pkg.paths.docsComponents}/${c.id}.md depuis templates/component.md`);

    // Chaque fiche a son entrée d'inventaire (toutes entrées confondues).
    const invIds = new Set(entries.map((c) => kebab(c.id)));
    for (const { file, fm } of docs) {
      const id = fm?.inventoryId || fm?.name;
      if (id && !invIds.has(kebab(id))) add(file, `fiche « ${id} » absente de l'inventaire`, "ajouter l'entrée d'inventaire, ou retirer la fiche");
    }

    // Démos : composant promu sans clé top-level dans le registre des démos
    // (ex ds-gaps `demo-manquante`, info — la promotion de démo suit).
    const demosPath = pkg.paths.demos && path.join(pkg.root, pkg.paths.demos);
    if (demosPath && fs.existsSync(demosPath)) {
      const demosSrc = fs.readFileSync(demosPath, "utf8");
      for (const c of canonical) {
        const key = path.basename(c.filePath, path.extname(c.filePath));
        if (!new RegExp(`^  ${key}:\\s*\\{`, "m").test(demosSrc))
          add(demosPath, `démo manquante : ${key} sans entrée dans ${path.basename(demosPath)}`, "ajouter la démo (jouable, jamais de placeholder)", "info");
      }
    }

    // Fraîcheur des docs générées (ex ds-gaps `docs-périmés` / `docs-absent`).
    const docsJson = path.join(pkg.root, "src/data/componentDocs.json");
    if (!fs.existsSync(docsJson)) {
      add(docsJson, "componentDocs.json manquant", "lancer `npm run ds:docs`");
    } else {
      const built = statMtime(docsJson);
      const generated = JSON.parse(fs.readFileSync(docsJson, "utf8"));
      for (const { file } of docs) {
        if (statMtime(file) > built) add(file, "fiche modifiée après componentDocs.json", "lancer `npm run ds:docs`");
        const id = path.basename(file, ".md");
        if (!(generated.components || {})[id]) add(file, `${id} absent de componentDocs.json`, "lancer `npm run ds:docs`");
      }
    }

    // Tokens couleur non catalogués (ex ds-gaps `token-non-catalogué`, info).
    try {
      const tokensSrc = fs.readFileSync(path.join(pkg.root, pkg.paths.theme), "utf8");
      const hexes = new Set((tokensSrc.match(/#[0-9a-fA-F]{6}\b/g) || []).map((h) => h.toLowerCase()));
      const catalogued = new Set((inv.tokens?.colors || []).flatMap((t) => [
        ...String(t.value || "").toLowerCase().match(/#[0-9a-f]{6}/g) || [],
        ...String(t.valueDark || "").toLowerCase().match(/#[0-9a-f]{6}/g) || [],
      ]));
      const missing = [...hexes].filter((h) => !catalogued.has(h));
      if (missing.length) add(invPath, `${missing.length} hex de tokens.js absents du catalogue (${missing.slice(0, 5).join(", ")}…)`, "régénérer la section tokens de l'inventaire", "info");
    } catch { /* thème illisible : le doctor s'en charge */ }
  } else {
    // Format kit (index TS de démos) : heuristique d'imports d'origine.
    const src = fs.readFileSync(invPath, "utf8");
    const entries = [...src.matchAll(/from\s+["']\.\/([\w.-]+)["']/g)].map((m) => kebab(m[1].replace(/[.-]?demo$/i, "")));
    for (const e of new Set(entries)) if (!docNames.has(e)) add(invPath, `composant « ${e} » sans fiche`, `créer ${pkg.paths.docsComponents}${e}.md depuis templates/component.md`);
    const invSet = new Set(entries);
    for (const n of docNames) if (!invSet.has(n)) add(path.join(pkg.root, pkg.paths.docsComponents, `${n}.md`), `fiche « ${n} » absente de l'inventaire`, "ajouter la démo et son entrée, ou retirer la fiche");
  }
}

function statMtime(p) { return fs.statSync(p).mtimeMs; }

const errors = findings.filter((f) => f.severity !== "info");
if (JSON_OUT) console.log(JSON.stringify(findings, null, 2));
else for (const f of findings) console.log(`${f.file} — ${f.rule} — ${f.fix}${f.severity === "info" ? " [info]" : ""}`);
if (!JSON_OUT) console.log(findings.length ? `\n${errors.length} constat(s) bloquant(s), ${findings.length - errors.length} info.` : "Fiches : OK");
process.exitCode = errors.length && !REPORT ? 1 : 0; // jamais process.exit : tronque stdout pipé
