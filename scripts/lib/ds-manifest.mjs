// Lecture du manifeste et résolution des packages — zéro dépendance.
// Partagé par ds-check-docs, ds-check-boundaries et ds-changelog.
import fs from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();

const DEFAULT_PATHS = {
  rules: "CLAUDE.md",
  inventory: "src/app/design-system/demos/index.ts",
  docs: "docs/design-system.md",
  docsComponents: "docs/components/",
  theme: "ds-theme.json",
  kitchenSink: "/design-system",
  visualBaselines: "tests/visual/__snapshots__",
};

export function readManifest() {
  const file = path.join(ROOT, "ds.manifest.json");
  if (!fs.existsSync(file)) {
    console.warn("⚠ ds.manifest.json absent — défauts appliqués (conventions §1).");
    return {};
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Retourne toujours une liste de packages. Mono-package = un seul, à la racine.
export function resolvePackages(manifest = readManifest()) {
  const rootPaths = { ...DEFAULT_PATHS, ...(manifest.paths || {}) };
  const list = manifest.packages?.length
    ? manifest.packages
    : [{ name: manifest.ds?.name || "ds", path: ".", role: "source" }];
  return list.map((p) => ({
    name: p.name,
    role: p.role || "source",
    dependsOn: p.dependsOn || [],
    root: path.join(ROOT, p.path || "."),
    rel: p.path || ".",
    paths: { ...rootPaths, ...(p.paths || {}) },
  }));
}

// Frontmatter YAML — sous-ensemble : scalaires, listes [a, b], un niveau d'imbrication.
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  let parent = null;
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, "");
    if (!line.trim()) continue;
    const nested = line.match(/^\s{2,}([\w-]+):\s*(.*)$/);
    const top = line.match(/^([\w-]+):\s*(.*)$/);
    if (nested && parent) {
      out[parent][nested[1]] = scalar(nested[2]);
    } else if (top) {
      if (top[2] === "") { out[top[1]] = {}; parent = top[1]; }
      else { out[top[1]] = scalar(top[2]); parent = null; }
    }
  }
  return out;
}

function scalar(v) {
  v = v.trim();
  if (v === "null" || v === "~" || v === "") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (v.startsWith("[") && v.endsWith("]"))
    return v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  return v.replace(/^["']|["']$/g, "");
}

// Toutes les fiches d'un package : [{ file, fm }]
export function readComponentDocs(pkg) {
  const dir = path.join(pkg.root, pkg.paths.docsComponents);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !/^(index|readme|claude|agents)\.md$/i.test(f))
    .map((f) => {
      const file = path.join(dir, f);
      return { file, fm: parseFrontmatter(fs.readFileSync(file, "utf8")) };
    });
}

export function walk(dir, exts = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", "dist", "build", ".git"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (exts.includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

export const rel = (p) => path.relative(ROOT, p) || ".";
export const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
