<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - I. Portable JWT library (manual path)
  - IV. One manual: docs
  - V. Security stays conservative (no docs mirror)
- Added sections: none
- Removed sections: none
- Deferred TODOs: none
-->

# keylab Constitution

## Core Principles

### I. Portable JWT library

keylab creates, signs, verifies, and inspects JWTs and related JOSE
material. It MUST stay loadable in Node.js, Cloudflare Workers, browsers,
and Bun. Node-only cryptography MUST stay a lazy fallback for server-side
cases and MUST NOT run because the package was imported. Product behavior
is defined in `docs/`; this constitution does not restate it.

### II. Published contract is stable

Names, option shapes, and error types that callers already use MUST remain
compatible within the current major version. A rename, removal, or
signature change requires either a major version or a compatibility alias
removed only in a later major. Internal helpers MUST NOT become supported
API by being exported accidentally.

### III. Tests gate every wave

A modernization wave MUST NOT merge unless the existing test suite passes
and new or changed behavior has tests. Coverage of signing, verification,
JWKS, portable curves, and JWE MUST NOT regress. A wave that only
rearranges internals still MUST leave the current suite green.

### IV. One manual: docs

Consumer documentation lives in `docs/`. `README.md` is the project front
door and links into that manual. Specs, plans, tasks, and this constitution
MUST NOT copy API summaries, getting-started examples, migration mappings,
runtime matrices, or portable-algorithm tables. They MAY link to those
pages. When a wave changes caller-visible behavior, the same change MUST
update the matching page under `docs/` and MUST NOT add a second guide
under `specs/`.

### V. Security stays conservative

Cryptographic changes MUST NOT weaken accepted algorithms, skip
verification, or log secrets, tokens, or private key material.
Vulnerability intake follows `SECURITY.md`. Specs MUST link to that policy
instead of reproducing it.

## Documentation boundary

| Concern | Home | Spec Kit may |
| --- | --- | --- |
| Install overview and a short example | `README.md` | Link only |
| Getting started, API, migration, runtime, portable algorithms | `docs/` | Link only |
| Why a change exists, acceptance, sequencing, and risks | `specs/` | Own this |
| Conduct and vulnerability intake | `CODE_OF_CONDUCT.md`, `SECURITY.md` | Link only |
| Release history | `CHANGELOG.md` | Link only |

## Modernization workflow

Work proceeds in independently shippable waves. Each wave is one feature
under `specs/` and MUST leave the library usable if later waves slip.
Plans state the technical approach. They do not paste the product manual.

Preferred order: preserve caller behavior, tighten types and exports,
broaden runtime checks, then remove unused tooling. A breaking rename and
a dependency major MUST NOT share a wave unless that break is the point
of the wave.

## Governance

This constitution governs how keylab changes are planned. Amendments are a
pull request that updates this file, bumps the version below, and sets
Last Amended. MAJOR for a principle removal or redefinition, MINOR for a
new principle or a change of where a principle's artifact lives, PATCH for
wording only.

`/speckit-plan` MUST treat these as failing gates unless the Complexity
Tracking table justifies them: a spec that duplicates `docs/` content,
a change that weakens cryptography, or a caller-visible break with no
versioning note.

**Version**: 1.1.0 | **Ratified**: 2026-09-27 | **Last Amended**: 2026-10-20
