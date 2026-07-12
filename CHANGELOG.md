# Changelog

All notable changes to this prototype are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Design-system audit surface: `.lyse.yaml`, `AGENTS.md`, `LYSE.md`, `llms.txt`, and `lyse.components.json`.

### Fixed
- Accessibility: associated form labels with their controls (`htmlFor`/`id`) and added roles + keyboard handlers to interactive overlays in the UI-kit previews.

## [0.1.0] - 2026-06-30

Initial prototype baseline. Highlights from the development history:

### Added
- **Sommaire** — floating table of contents for actes, indentation capped at 2 levels.
- **Pricing** — per-user licences (PRO / MAX / MAX+), weekly usage quota gauge, and settings/usage/billing redesign.
- **Pièces** — document-first split/fusion flow, "À vérifier" review zone, side-panel drawers beside chat, auto-split, and harmonized drop ingest.
- **Bordereau** — paired acte/bordereau canvas, hierarchical numbering, edit-in-place placement, folder-aware pickers, and export bundle.
- **Jurisprudence (JP)** — search view, decision drawers, add/rationale steppers.
- **Préférences** — méthode-de-travail cards (chiffrage, rédaction, nommage, découpage) aligned on Figma.
- **Parrainage** — sidebar promo and referral modal.
- **Design tokens** — consolidated color / spacing / typography tokens in `src/design-system/tokens.js`.

[Unreleased]: https://github.com/hexa/norma-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/hexa/norma-app/releases/tag/v0.1.0
