# Implementation Plan: More algorithms

**Branch**: `002-more-algorithms` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-more-algorithms/spec.md`

**Note**: Tasks are not generated here. Implement wave 1, then stop. Later waves start only after the previous one is green.

## Summary

Add the three ML-DSA signature parameter sets registered by RFC 9964,
then publish names for the six content-encryption algorithms the library
already accepts. Each wave keeps the current getting-started examples
working and links to `llm-docs/` instead of copying it. ML-DSA-65 ships
first. Key encapsulation, HPKE drafts, SLH-DSA, and HashML-DSA stay out.

`jose` 6.2.3 can already use ML-DSA where Web Crypto implements it. These
waves do not upgrade `jose`. Environments without that Web Crypto support
get a lazy portable fallback, same idea as the existing curve fallback
described in [llm-docs/portable-algorithms.md](../../llm-docs/portable-algorithms.md).

## Technical Context

**Language/Version**: TypeScript 7, published as ESM and CJS from `src/index.ts`

**Primary Dependencies**: `jose` 6.2.3 (unchanged), `@noble/curves` 2.x (unchanged). Wave 1 adds `@noble/post-quantum` for the ML-DSA fallback only.

**Storage**: N/A

**Testing**: `bun run test` / `bun run test-with-coverage` (Vitest). Browser-style checks use the existing happy-dom environment. Docs: `bun run docs:build`

**Target Platform**: Node.js, Cloudflare Workers, browsers, and Bun, as described in [llm-docs/runtime-compatibility.md](../../llm-docs/runtime-compatibility.md)

**Project Type**: Library

**Performance Goals**: No new work at import time. The post-quantum module loads only when a caller asks for an ML-DSA operation.

**Constraints**: Current major stays compatible. No copied product manual. No `none`, no skipped verification, no private seed in logs. `node:crypto` stays a dynamic import. `enc` stays a string so unnamed labels that already work are not rejected.

**Scale/Scope**: Three waves over `src/enums.ts`, `src/vendors/jwt/`, `src/vendors/jwe/`, and the matching `llm-docs/` pages. No new package entry point.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Portable library**: Pass, with the wave 1 fallback. ML-DSA code loads on use. `node:crypto` is not imported at load. If a promised environment still cannot complete the flow, that wave updates [llm-docs/runtime-compatibility.md](../../llm-docs/runtime-compatibility.md).
- **Published contract**: Pass. New names are additive. `checkTokenValidness`, the `*Legacy` aliases, and existing algorithm names stay. `enc` is not narrowed from `string`.
- **Tests gate every wave**: Pass. Each wave adds checks for the algorithms it introduces and requires the current suite to stay green. See [quickstart.md](./quickstart.md).
- **One manual**: Pass. This plan links to `llm-docs/` and `SECURITY.md`. Caller-visible waves edit the matching product page in the same change. They do not restate those pages here.
- **Security stays conservative**: Pass. Waves add registered signature strength and name existing content encryption. They do not add `none`, HashML-DSA, or a draft algorithm. The private key seed is not logged.

Post-design re-check: pass. Complexity Tracking records why three waves share one spec.

## Project Structure

### Documentation (this feature)

```text
specs/002-more-algorithms/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── algorithms.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks output, not created here
```

### Source Code (repository root)

```text
src/
├── index.ts
├── enums.ts                 # signature names; content-encryption names in wave 3
├── vendors/
│   ├── jwt/
│   │   ├── jwt-sign.ts      # key generation routing
│   │   ├── jwt-verify.ts    # verification routing
│   │   ├── interfaces.ts    # JWK key-type union grows an AKP member
│   │   ├── portable-algorithms.ts   # existing curves; leave their behavior
│   │   └── portable-ml-dsa.ts       # new; lazy @noble/post-quantum import
│   └── jwe/
│       └── jwe.ts           # enc stays a string; names are a vocabulary
llm-docs/                    # update the page the wave actually changes
```

**Structure Decision**: Single library. ML-DSA lives beside the existing
portable curve module so ES256K, Ed448, and X448 stay on their current
path. Product pages stay in `llm-docs/`.

## Wave sequence

### Wave 1 — ML-DSA-65

Add `ML-DSA-65` to the published algorithm list. Generate and accept
keys as AKP JWKs: `kty` of `AKP`, required `alg`, `pub` for the public
key, and `priv` only on private keys. `priv` is the 32-byte seed.
Signing uses an empty context string. Header `alg` is `ML-DSA-65`.

Prefer `jose` when the runtime can import that AKP key. Otherwise sign
and verify through a dynamic import of `@noble/post-quantum/ml-dsa.js`.
Do not import that module from `src/index.ts` at load. Do not add a PEM
encoding for this algorithm. Do not change `portable-algorithms.ts`
behavior for ES256K, Ed448, or X448.

Update [llm-docs/portable-algorithms.md](../../llm-docs/portable-algorithms.md)
and [llm-docs/runtime-compatibility.md](../../llm-docs/runtime-compatibility.md)
to name ML-DSA-65 and the JWK requirement. Leave the getting-started
examples unchanged.

Exit: one ML-DSA-65 key, sign, verify, and tamper-rejection check passes
in the current test run and in the existing browser-style environment.
`bun run test`, `bun run build`, and `bun run docs:build` pass.

### Wave 2 — ML-DSA-44 and ML-DSA-87

Use the wave 1 path for the other two registered parameter sets. A token
signed with one set fails verification when the caller requires another
set. Do not add new dependencies. Update the same two product pages only
to list the two additional names.

Exit: a sign-and-verify check passes for each new name, and one
cross-set rejection passes. Getting-started examples stay unchanged.

### Wave 3 — Named content encryption

Export the six names as a vocabulary callers can pass as `enc`:
`A128GCM`, `A192GCM`, `A256GCM`, `A128CBC-HS256`, `A192CBC-HS384`,
`A256CBC-HS512`. Keep `IEncryptJweOptions.enc` typed as `string`. Do not
reject a string `jose` already accepts.

Add one round trip per name. Update the encryption section of
[llm-docs/api.md](../../llm-docs/api.md) to list the six. Leave the
getting-started encryption example unchanged.

Exit: six round trips pass, the getting-started `A256GCM` example still
typechecks as a plain string, and the suite stays green.

## Out of scope

- ML-KEM and other key-encapsulation drafts (no finished JOSE registration).
- HPKE `alg` values that are still drafts.
- SLH-DSA, Falcon, and HashML-DSA.
- The `none` algorithm, and any weakening of existing algorithms.
- A `jose` upgrade, a Vitest major, and PEM for ML-DSA.
- Reopening `specs/001-modernization-waves/`.
- Copying any page out of `llm-docs/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Three waves share one spec | The order and the shared compatibility rules need to be visible before any wave is tasked | Three specs would repeat the same contract and the `llm-docs` boundary |
