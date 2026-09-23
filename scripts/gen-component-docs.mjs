#!/usr/bin/env node
// gen-component-docs — lit les fiches best-in-class des composants
// (src/components/ui/<Nom>.md) et produit src/data/componentDocs.json que le
// kitchen-sink consomme. Le `.md` est la SOURCE DE VÉRITÉ ; ce JSON en dérive.
// Zéro dépendance. À relancer après toute modif d'une fiche : `npm run ds:docs`.
//
// Parse : frontmatter YAML minimal (key: value, listes [a, b], blocs `>` repliés)
// + découpe le corps en sections `## <titre>` (dont les 3 canoniques :
// « Pattern / Variants / Examples », « Sprint / Explos », « Proto demo »).

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UI_DIR = 'src/components/ui';
const OUT = 'src/data/componentDocs.json';

// — frontmatter parser (suffisant pour notre schéma, pas un YAML complet) —
function parseFrontmatter(fm) {
  const out = {};
  const lines = fm.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) { i++; continue; }
    const key = m[1];
    let val = m[2].trim();
    if (val === '>' || val === '|') {
      // bloc replié : lignes indentées suivantes
      const buf = [];
      i++;
      while (i < lines.length && /^\s+\S/.test(lines[i])) { buf.push(lines[i].trim()); i++; }
      out[key] = buf.join(' ');
      continue;
    }
    if (val.startsWith('[') && val.endsWith(']')) {
      out[key] = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      out[key] = val.replace(/^["']|["']$/g, '');
    }
    i++;
  }
  return out;
}

// — découpe le corps markdown en sections de niveau ## —
function splitSections(body) {
  const sections = {};
  const re = /^##\s+(.+)$/gm;
  const marks = [];
  let m;
  while ((m = re.exec(body))) marks.push({ title: m[1].trim(), start: m.index, contentStart: re.lastIndex });
  marks.forEach((mk, idx) => {
    const end = idx + 1 < marks.length ? marks[idx + 1].start : body.length;
    sections[mk.title] = body.slice(mk.contentStart, end).trim();
  });
  return sections;
}

const docs = {};
for (const file of readdirSync(UI_DIR).filter((f) => f.endsWith('.md') && f !== 'CLAUDE.md')) {
  const raw = readFileSync(join(UI_DIR, file), 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!fmMatch) { console.warn(`  ⚠ ${file} : pas de frontmatter, ignoré`); continue; }
  const meta = parseFrontmatter(fmMatch[1]);
  const body = fmMatch[2];
  const sections = splitSections(body);
  const id = meta.inventoryId || meta.name || file.replace(/\.md$/, '');
  docs[id] = {
    ...meta,
    docFile: `${UI_DIR}/${file}`,
    sections: {
      pattern: sections['Pattern / Variants / Examples'] || '',
      explos: sections['Sprint / Explos'] || '',
      demo: sections['Proto demo'] || '',
    },
  };
}

writeFileSync(OUT, JSON.stringify({ _doc: 'GÉNÉRÉ depuis src/components/ui/*.md par scripts/gen-component-docs.mjs — ne pas éditer à la main.', generatedFrom: UI_DIR, components: docs }, null, 2) + '\n');
console.log(`${OUT} régénéré — ${Object.keys(docs).length} fiches : ${Object.keys(docs).join(', ')}`);
