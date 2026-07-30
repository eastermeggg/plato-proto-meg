---
target: email import modal (lab /ui-kit/import-dossier)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-07-30T07-48-58Z
slug: src-components-ui-kit-importdossierlab-js
---
Method: dual-agent (A: a271480cca7405443 · B: af77eb48fa867e12e)

# Critique - Import email (modale geste C/B), lab /ui-kit/import-dossier

## Design Health Score (pre-fix)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Stale « Ajouter et suivre » CTA after removing followed item; « Import en cours… » during staging |
| 2 | Match System / Real World | 3 | « · destination » placeholder shipped in header; prendre/ajouter/sélectionner synonymy |
| 3 | User Control and Freedom | 2 | Escape/backdrop destroy the composition unguarded; no undo after commit |
| 4 | Consistency and Standards | 2 | Title-click = take OR remove by state; green « Sera découpé » breaks vert=Suivi; SelectAll at root |
| 5 | Error Prevention | 1 | Folder commit silently drops subfolders; folder+thread double import; destination default mis-files |
| 6 | Recognition Rather Than Recall | 3 | No preview/hover: evidentiary decisions from filenames |
| 7 | Flexibility and Efficiency | 2 | No keyboard path; SelectAll capped at visible 30 |
| 8 | Aesthetic and Minimalist Design | 4 | Disciplined; three legible actionability levels |
| 9 | Error Recovery | 1 | Doublon has reason but no action; failures flag-hidden |
| 10 | Help and Documentation | 3 | Lab pedagogy exemplary; in-modal help thin |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity Verdict
Authored, not template: corps du mail as first-class pièce, closed sender-role référentiel, doublon copy speaking to probatory anxiety, transvasement grammar faithfully implemented (single source of truth in useComposer). Weak spot: the decision moment itself (no preview, filenames only).

Deterministic scan: 3 findings - side-tab border-left on GestureCard (lab scaffolding, fixed anyway), 2× width layout-transition (considered trade-off: column collapses by width, never unmounts, selection survives). No browser overlay (no browser tool in session).

## Priority Issues (pre-fix)
1. [P0] Folder import silently dropped subfolder content while FolderCard claimed « tout entre avec le dossier » (commit imported direct threads only) - the faute-grave scenario.
2. [P1] Folder+thread double staging → duplicate import; parent+child folders both stageable.
3. [P1] Escape/backdrop discard the whole composition with zero guard (GesteC + GesteB).
4. [P1] « Tout sélectionner » rendered at the racine (locked rule: jamais à la racine).
5. [P2] Stale `suivre` set → CTA « Ajouter et suivre » lies after removals.
6. [P2] Header placeholder « {dossier} · destination » shipped; destination default 'correspondance' mis-files silently.
7. [P2] Doublon mention has reason but no action; invariant « échecs = lignes avec action » unmet.
8. [P2] Green « Sera découpé » pill uses Suivi colors; no decision support (no preview/hover card - parked, spec-preview-provenance).

## Persona Red Flags
- Alex: no keyboard path, SelectAll capped at visible slice, search can't find drill-down threads.
- Jordan: taken-thread title was an invisible remove button; destination selector appears only after first item.
- Sam: no role=dialog/aria-modal/focus management; collapsed column focusable while aria-hidden; hover-only ✕; toast not announced; 10px #a8a29e labels fail contrast.

## Minor
Singulars (+ 1 autres), GesteB duplicate step-2 header, toast truncates the receipt, approxPieces ignores zip/folder découpe counts, synthetic stats ×2.3 never match commit, split pieces carry no issuDe (parked with preview spec).

## Questions
1. When the winning pièce is two subfolders down and the commit dropped it, which artifact is shown to the bâtonnier?
2. Is committing evidence really an act whose only receipt is a 5-second toast? (Import receipt / acte de procédure - P2 candidate.)
3. Should the modal refuse to feel finished while pieces are unviewed (no preview), rather than lending its polish to blind imports?
