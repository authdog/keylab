# Research: Next modernization waves

## Decision: Four waves, current cryptographic stack

**Decision**: Plan surface cleanup, stricter types, runtime honesty, and
unused-tool removal as four shippable waves. Keep `jose` and
`@noble/curves`. Do not add jobs.

**Rationale**: The library already signs, verifies, looks up JWKS, covers
portable curves, and encrypts JWE. The debt is types, a single-runtime
CI job, and unused devDependencies, not a missing product.

**Alternatives considered**: A single rewrite branch (too large to review,
and it would mix breaks with cleanup). Replacing `jose` (no caller
benefit, and it would fight the portable-curve layer described in
`llm-docs/portable-algorithms.md`).

## Decision: Product manual stays in llm-docs

**Decision**: Specs and plans link to `llm-docs/` and `SECURITY.md`. A
wave updates a product page only when caller-visible behavior changes.

**Rationale**: `llm-docs/` already has getting started, API, migration,
runtime, portable algorithms, and a security mirror. Copying them into
`specs/` would drift.

**Alternatives considered**: A second modernization guide under `md/` or
`specs/` (rejected by constitution principle IV).

## Decision: No public renames in these waves

**Decision**: Keep `checkTokenValidness` and
`IcheckTokenValidnessCredentials`. Keep the `*Legacy` JWKS type aliases
exported from `src/index.ts`. A future major can drop them.

**Rationale**: Those names are already part of the published entry
(`src/index.ts`) and the API summary. Renaming them is a break and does
not belong in a cleanup wave.

**Alternatives considered**: Rename now with aliases (still a wide type
diff, and the spec forbids a break without calling it out as the point
of the wave).

## Decision: strictNullChecks is its own wave

**Decision**: Wave 2 enables `strictNullChecks` and removes
`ignoreDeprecations: "6.0"` plus unused decorator flags. It does not
upgrade Vitest.

**Rationale**: `tsconfig.json` has `strictNullChecks: false` while the
package is on TypeScript 7. Turning checks on will touch many call sites
(`any` is widespread under `src/vendors/`). Combining that with a Vitest
4/5 migration would make failures ambiguous.

**Alternatives considered**: Enable the full `strict` flag family at once
(larger than this wave; `strictNullChecks` is the gap that hides missing
values). Stay on the current flags (leaves story 2 unmet).

## Decision: Prove portability without redesigning middleware

**Decision**: Wave 3 guards the existing dynamic `node:crypto` imports and
adds one non-Node sign-and-verify run. `createJwtMiddleware` stays the
Express adapter already documented in `llm-docs/api.md`.

**Rationale**: `jwt-sign.ts` and `portable-algorithms.ts` already import
`node:crypto` lazily. CI runs Node 22 plus Bun only, so the Workers and
browser promise is unchecked. Middleware is documented as Express and is
not the portability gap.

**Alternatives considered**: A Workers port of the Express middleware
(new product surface; out of scope). Deleting the Node fallback (would
drop server-side PEM paths the runtime guide still allows).

## Decision: Remove only dependencies with no caller

**Decision**: Wave 4 removes `@swc/core`, `raw-loader`, `ts-node`,
`codecov`, and `husky`. Keep `terser`.

**Rationale**: Those five names appear only in `package.json`. There is
no `.husky/` directory. `scripts/optimize-build.ts` imports `terser`.

**Alternatives considered**: Drop `terser` too (would break
`build:optimize`). Upgrade every Dependabot PR in this wave (mixes
unrelated majors, including Vitest, into cleanup).
