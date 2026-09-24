# ECARTS - dettes assumées du design system

> Fichier steward (voir `.claude/skills/_shared/conventions.md` §2) : seules les
> dettes **assumées** vivent ici, avec leur raison et leur porte de sortie. Les
> écarts qu'un agent constate sans droit de corriger vont dans `SIGNALEMENTS.md`
> (local, gitignoré), jamais ici. Rédigé le 22/09/2026 dans le cadre de la
> préparation du handover ; à valider ligne à ligne par la steward.

| # | Dette | Raison / contexte | Porte de sortie |
|---|---|---|---|
| 1 | **Fonte « RL Para Trial Central » = version Trial**, licence non validée | Serif des titres (`typography.fontFamily.serif`), chargée localement | Valider ou acheter la licence avant tout usage production ; sinon basculer le fallback (Albra / Georgia) |
| 2 | ~~**`lyse audit` est mort**~~ **RÉSOLU (22/09)** | Le paquet npm `lyse` n'a plus de versions publiées | Remplacé par `npm run ds:doctor`. **Fichiers orphelins supprimés** (`.lyse.yaml`, `LYSE.md`, `lyse.components.json`), références purgées (`.gitignore`, `ds.manifest.json`, `llms.txt`, `README.md`, `AGENTS.md`, `HANDOVER.md`). Seules restent les mentions qui *documentent* la mort de lyse. RIP. |
| 3 | **`src/App.js` = monolithe de ~26 000 lignes** portant 1526 des 2656 hex en dur | Prototype construit par itérations rapides | Décision reportée : soit découpage par surfaces avant handover, soit assumé comme dette documentée du prototype |
| 4 | **Hex en dur : VRAI ZÉRO** (mission 22/09/2026 : 2656 → 0 bloquant → §6 tranché « all good » → 0 en attente, `pendingHex` vidé). Rapport : `DECISIONS-HEX.md` | 2 nouveaux tokens créés (`accents.ochre` #b9703f, `accents.meadow` #4a9168) ; 120 classes brutes migrées ; gradients d'identité décoratifs (`from/to-*`, 14) et 3 classes en labs conservés (hors périmètre) ; 10 exceptions `ds-hex-ok` (logos Gmail/WhatsApp, doc) | Rien à faire - CI verrouillée (`.github/workflows/ds.yml`). Passe visuelle steward avant commit. **NB : `tokens.js` (protégé) a été édité pour les 2 tokens - édition steward assumée sur cette branche de handover** |
| 5 | **Vérité Figma mixte par surface** - non standard vs les modes du set de skills (`none`/`intent`/`mirror`) | Historique du prototype : certaines surfaces portées depuis Figma, d'autres nées en code | Doctrine documentée dans `docs/design-truth.md` + `figma.note` du manifeste ; mode déclaré `intent` (le plus proche) |
| 6 | **`caption` letterSpacing 0.12 au lieu de 1 (Figma)** | En attente d'une vérification visuelle transverse (note dans `tokens.js`) | Vérifier visuellement puis aligner ou consigner la divergence via la clé du thème |
| 7 | **Labs `/ui-kit/*` exclus du doctor** (`paths.doctorExclude`) | Surfaces d'exploration, pas des livrables ; les nettoyer n'apporte rien au handover | Trancher au handover : conserver comme doc vivante, archiver, ou supprimer lab par lab |
| 8 | **33 émojis et 631 tirets cadratins** détectés (avertissements ds-doctor, non bloquants) | Une partie est dans des données de démo / commentaires, pas dans l'UI rendue | Passe de triage : corriger ceux qui touchent l'UI (règles AGENTS.md), ignorer les données |
| 9 | **Ombres inline famille C : ~21 warns `shadow-inline` conservés** (glows accent `0 0 6px`, keyframes de pulsation, rings/highlights déjà tokenisés `${HL_EDGE}`, insets, et illustrations in-code `ConnectorArt` en unités `cqw`) | Ce ne sont PAS de l'élévation : les écraser sur l'échelle `shadows` casserait le rendu (effets, artwork). La famille A (59 élévations) a été mappée le 24/09 ; voir `SIGNALEMENTS` §14 + `.context/shadow-mapping.md` | Rien à faire pour C. La famille B (11 tiroirs horizontaux, `[a-dessiner]`) attend la spec drawer steward — à ce moment, poser 1-2 tokens `shadows.drawer*` et mapper |
