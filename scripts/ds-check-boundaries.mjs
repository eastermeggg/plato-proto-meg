#!/usr/bin/env node
// Vérifie le sens des dépendances entre packages (conventions §6). Délégué par ds:doctor.
// Usage : node scripts/ds-check-boundaries.mjs [--report] [--json]
import fs from "node:fs";
import path from "node:path";
import { resolvePackages, walk, rel } from "./lib/ds-manifest.mjs";

const REPORT = process.argv.includes("--report");
const JSON_OUT = process.argv.includes("--json");
const pkgs = resolvePackages();
const findings = [];

if (pkgs.length > 1) {
  const names = pkgs.map((p) => p.name);
  const source = pkgs.find((p) => p.role === "source");
  const TOKEN_DECL = /(?:^|[{;\s])(--[\w-]+)\s*:/g;
  const sourceTokens = new Set();
  if (source) for (const f of walk(source.root, [".css"])) for (const m of fs.readFileSync(f, "utf8").matchAll(TOKEN_DECL)) sourceTokens.add(m[1]);

  for (const pkg of pkgs) {
    const allowed = new Set([pkg.name, ...pkg.dependsOn]);
    for (const file of walk(pkg.root)) {
      const text = fs.readFileSync(file, "utf8");
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        // imports par nom de package (workspace) ou par chemin relatif sortant vers un autre package
        for (const m of line.matchAll(/(?:from\s+|import\s*\(\s*|require\(\s*)["']([^"']+)["']/g)) {
          const spec = m[1];
          const byName = names.find((n) => spec === n || spec.startsWith(`${n}/`) || spec.includes(`/${n}/`) || spec.startsWith(`@${n}`));
          let target = byName;
          if (!target && spec.startsWith(".")) {
            const abs = path.resolve(path.dirname(file), spec);
            target = pkgs.find((p) => p.name !== pkg.name && abs.startsWith(p.root + path.sep))?.name;
          }
          if (target && !allowed.has(target))
            findings.push({ file: `${rel(file)}:${i + 1}`, rule: `${pkg.name} importe ${target} (hors dependsOn)`, fix: target === source?.name ? "déclarer la dépendance dans le manifeste" : "le source n'importe jamais une extension : remonter l'élément via ds-promote" });
        }
      });
      // Une extension ne redéclare pas un token du source.
      if (pkg !== source && file.endsWith(".css"))
        lines.forEach((line, i) => {
          for (const m of line.matchAll(TOKEN_DECL)) if (sourceTokens.has(m[1])) findings.push({ file: `${rel(file)}:${i + 1}`, rule: `token du source redéclaré : ${m[1]}`, fix: "étendre avec un token préfixé (--mkt-*) au lieu de redéclarer" });
        });
    }
  }
}

if (JSON_OUT) console.log(JSON.stringify(findings, null, 2));
else for (const f of findings) console.log(`${f.file} — ${f.rule} — ${f.fix}`);
if (!JSON_OUT) console.log(pkgs.length < 2 ? "Frontières : mono-package, rien à vérifier" : findings.length ? `\n${findings.length} violation(s) de frontière.` : "Frontières : OK");
process.exitCode = findings.length && !REPORT ? 1 : 0; // jamais process.exit : tronque stdout pipé
