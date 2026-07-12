# Migration guide

This document describes how to move across breaking versions of the Norma
prototype. See [CHANGELOG.md](CHANGELOG.md) for the full list of changes per
version.

## Versioning policy

This project follows [Semantic Versioning](https://semver.org/). Breaking
changes bump the **major** version and are documented here with a step-by-step
upgrade path.

## No breaking migrations yet

The prototype is pre-1.0 (currently `0.1.0`) and has not shipped a breaking
release. There is nothing to migrate.

When a breaking change lands, a section will be added below in the form:

```
## Migrating from 0.x to 1.0

### <what changed>
- Before: <old API / token / component>
- After:  <new API / token / component>
- How to update: <codemod, find-and-replace, or manual steps>
```

Until then, upgrade by pulling the latest `main` and running `npm install`.
