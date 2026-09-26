# Implementation Plan: Next modernization waves

**Branch**: `main` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-modernization-waves/spec.md`

**Note**: Tasks are in [tasks.md](./tasks.md). Implement User Story 1, then stop. Later waves start only after the previous one is green.

## Summary

Sequence four non-overlapping modernization waves for keylab. Each wave
keeps the current getting-started examples working, leaves the
cryptographic stack in place, and links to `llm-docs/` instead of copying
it. Public renames wait for a later major. The test-runner major
(Vitest 1 to 5) is a separate follow-up.

## Technical Context

**Language/Version**: TypeScript 7, published as ESM and CJS from `src/index.ts`

**Primary Dependencies**: `jose` 6.2.3, `@noble/curves` 2.x. Dev: Vitest 1, Biome, VitePress, Bun 1.2.11

**Storage**: N/A

**Testing**: `bun run test` / `bun run test-with-coverage` (Vitest). Docs: `bun run docs:build`

**Target Platform**: Node.js, Cloudflare Workers, browsers, and Bun, as described in [llm-docs/runtime-compatibility.md](../../llm-docs/runtime-compatibility.md)

**Project Type**: Library

**Performance Goals**: No new throughput target. Do not add work at import time.

**Constraints**: Current major stays compatible. No copied product manual. No weaker cryptography. Server-only `node:crypto` stays a dynamic import.

**Scale/Scope**: Four waves over the existing `src/` tree, `tsconfig.json`, `package.json`, and CI. No new package and no new caller-facing job.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Portable library**: Pass. Waves do not add a static `node:crypto` import. Wave 3 checks the existing lazy fallback.
- **Published contract**: Pass. Renames of `checkTokenValidness` and `IcheckTokenValidnessCredentials` are deferred. Duplicate type aliases stay as aliases until a major.
- **Tests gate every wave**: Pass. Each wave requires the current suite to stay green. See [quickstart.md](./quickstart.md).
- **One manual**: Pass. This plan links to `llm-docs/` and `SECURITY.md`. It does not restate API, migration, runtime, or security pages.
- **Security stays conservative**: Pass. No algorithm, verification, or logging changes.

Post-design re-check: pass. Complexity Tracking records why four waves share one spec.

## Project Structure

### Documentation (this feature)

```text
specs/001-modernization-waves/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── compatibility.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks output
```

### Source Code (repository root)

```text
src/
├── index.ts                 # public exports
├── enums.ts
├── errors/
└── vendors/
    ├── jwt/                 # sign, verify, portable curves
    ├── jwks/
    ├── jwe/
    ├── middleware/          # Express adapter; already documented as such
    ├── headers/
    └── ponyfills/           # internal; not re-exported by src/index.ts
llm-docs/                    # product manual; update only when behavior changes
.github/workflows/ci.yml     # Node 22 + Bun test job
```

**Structure Decision**: Single library. Waves edit the tree above. Product
pages stay in `llm-docs/`. Planning stays in this directory.

## Wave sequence

### Wave 1 — Supported surface

Tighten exported types that are still `any` (`jwkPrivateKey`, `pld`, `jwk`,
`ext`) using the JWK and payload shapes already in the library. Keep one
definition for the duplicated JWKS record types and leave the `*Legacy`
aliases in `src/index.ts` in place. Do not rename `checkTokenValidness` or
`IcheckTokenValidnessCredentials`. Do not export `ponyfills`.

Exit: published examples unchanged; `llm-docs/api.md` updated only if an
exported type's public description actually changes.

### Wave 2 — Stricter checks

Turn on `strictNullChecks`. Remove `ignoreDeprecations: "6.0"`,
`experimentalDecorators`, and `emitDecoratorMetadata` (no decorators in
`src/`). Fix the fallout without changing runtime behavior. Do not upgrade
Vitest in this wave.

Exit: `bun run test` and `bun run build` pass. No `llm-docs` change unless
a public signature had to change, which this wave forbids.

### Wave 3 — Promised environments

Keep `node:crypto` behind the existing dynamic imports in `jwt-sign.ts` and
`portable-algorithms.ts`. Add a load-time check that importing the package
does not pull `node:crypto`. Add one non-Node execution of a published
sign-and-verify flow (browser-style or worker-style). Leave
`createJwtMiddleware` as the Express adapter already described in
`llm-docs/api.md` and `llm-docs/getting-started.md`. If a portable-curve
case fails outside Node, fix it or update
`llm-docs/runtime-compatibility.md` in the same change.

Exit: the new check passes, and the runtime page matches what the check covers.

### Wave 4 — Unused tooling

Remove devDependencies with no remaining caller: `@swc/core`, `raw-loader`,
`ts-node`, `codecov`, and `husky` (no `.husky/` hooks). Keep `terser`
because `scripts/optimize-build.ts` imports it. Do not bump `jose`,
`@noble/curves`, or Vitest here.

Exit: `bun run test`, `bun run build`, and `bun run docs:build` pass after
the lockfile update.

## Out of scope

- Vitest 5 (open dependency-update work; its own spec when picked up).
- Renaming `checkTokenValidness` / `IcheckTokenValidnessCredentials`.
- New algorithms, a new JWE surface, or a Workers middleware.
- Copying any page out of `llm-docs/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Four waves share one spec | The sequence and the shared compatibility rules need to be visible before any wave is tasked | Four specs would repeat the same contract and the `llm-docs` boundary |
