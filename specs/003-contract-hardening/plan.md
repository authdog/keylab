# Implementation Plan: Contract hardening

**Branch**: `003-contract-hardening` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Note**: All four waves are implemented. See "Decisions taken" and "Follow-ups".

## Summary

The four waves close the gaps that the 100% coverage work exposed. Each
wave ships on its own, in this order. Wave 1 (scope enforcement) is
security-relevant and should ship as a patch release.

## Technical Context

**Language/Version**: TypeScript 7, ESM and CJS from `src/index.ts`

**Primary Dependencies**: `jose` 6.x, `@noble/curves` 2.x, `@noble/post-quantum` (unchanged)

**Testing**: `bun run test-with-coverage` (Vitest, v8). Bun is pinned to 1.2.11 in CI.

**Constraints**: Current major stays compatible unless a wave states otherwise. Nothing new runs at import time.

## Waves

| Wave | Main files | Caller-visible | Release |
| --- | --- | --- | --- |
| 1 Scope enforcement | `vendors/jwt/jwt-verify.ts`, `vendors/jwks/jwks.ts`, `vendors/middleware/middleware.ts`, `jwks-types.ts` | Yes: tokens that passed before now fail | Patch (security fix) |
| 2 Error contract | `vendors/jwks/jwks.ts`, `vendors/jwt/jwt-verify.ts`, `vendors/jwt/utils.ts`, `errors/` | Yes: error classes change | Minor, with `cause`, or the next major |
| 3 JWKS cache wiring | `vendors/jwks/jwks.ts`, `jwks-cache.ts` | Fewer fetches only | Minor |
| 4 Release gates | `vitest.config.ts`, `.github/workflows/ci.yml`, `package.json`, `src/vendors/pem/pem.test.ts` | No | None needed |

### Wave 1: Scope enforcement

- Apply the existing scope logic from `checkJwtFields` to the verified
  payload in `checkTokenValidness`, after the signature verifies and on
  every path.
- `verifySsl`: `fetch` has no portable way to set it. Deprecate it in the
  types and in [llm-docs/api.md](../../llm-docs/api.md) instead of
  implementing it.
- Tests: each path (HS, `jose`, portable, ML-DSA) × (missing scope,
  present scope, string form, array form).

### Wave 2: Error contract

- Add a single `mapVerificationError` at the `checkTokenValidness` and
  `verifyTokenWithPublicKey` boundary: `JWTExpired` → `TokenExpiredError`,
  `JWSSignatureVerificationFailed` → `InvalidSignatureError`, parse and
  decode failures → `MalformedTokenError`. Keep the original error on
  `cause`.
- Make `base64ToBytes` strict, then remove the now-dead "invalid" branch in
  `portable-ml-dsa.ts` `decodeFixed`, or keep it covered.
- `AlgorithmMismatchError` is exported and documented but never raised.
  Either raise it when the header `alg` disagrees with the key's `alg`, or
  remove it from the docs.

### Wave 3: JWKS cache wiring

- Route the `jwksUri` branch of `verifyTokenWithPublicKey` through
  `getDefaultJwksCache().getKeys()` and pass the `X-Issuer` header through.
- Refetch once when the `kid` is missing, for key rotation, then raise
  `JWK_NO_APPLICABLE_KEY`.

### Wave 4: Release gates

- `vitest.config.ts`: `all: true`, `include: ["src/**"]`, and `thresholds`
  at 100 for all four metrics. This already passes today.
- Fix the 42 type errors in `pem.test.ts` and the Biome backlog, then add
  `bun run lint` and `tsc --noEmit` to CI.
- Bundle smoke test: run the real `build:js`, then import `dist/index.js`
  and compare its exports with `src/index.ts`. Run it in CI with both the
  pinned Bun and the latest Bun, so the `"sideEffects": false` problem in
  Bun 1.3 surfaces before a local publish. The likely fix is to drop
  `sideEffects` or set it to `["./dist/index.js"]`, then confirm
  tree-shaking still works for consumers.
- Make `index.load.test.ts` build to a temp dir instead of `dist/`.

## Decisions taken

1. **Wave 2 compatibility**: Errors are remapped within the current major version. The `jose` error stays on `cause`, and `JsonWebTokenError` declares `cause` for TypeScript callers.
2. **Wrong HS secret**: Still resolves `false`. An expired HS token and missing scopes raise errors, as on the asymmetric paths.
3. **Return shape**: Unchanged (`true` for HS, `{ payload, protectedHeader }` otherwise). Revisit in the next major version.
4. **Bun bundling**: `"sideEffects"` is now `["./src/**"]`. Bun keeps the source when it builds, and the shipped `dist` files stay side-effect-free for consumers' bundlers.
5. **Scope failures**: `InsufficientScopeError` (code 403), a `JsonWebTokenError` subclass. The middleware responds 403 for it.

## Follow-ups

- `signJwtWithPrivateKey(payload, alg, key, { kid })` merges `kid` into the payload. Only the fifth argument, `{ keyId }`, sets the header `kid`. Decide whether to fix this in a minor version or document it.
- [llm-docs/api.md](../../llm-docs/api.md) lists `verifyHSTokenWithSecretString`, `checkJwtFields`, and `makePublicKey`, but `src/index.ts` does not export them. Either export them or remove them from the page. The same page says every error class extends `JsonWebTokenError`, but `JwksEndpointError` extends `Error`.
- `index.load.test.ts` still writes its probe into `dist/`, because the probe imports `jose` and only resolves from inside the repository.
- About 109 `noExplicitAny` lint warnings remain. They do not fail `bun run lint`.

## Constitution Check

- **Portable library**: Pass. No new imports at load time.
- **Published contract**: Waves 1 and 2 change what callers observe. Wave 1 is a security fix. Wave 2 waits on open decision 1.
- **Tests gate every wave**: Pass. Wave 4 turns this principle into a CI gate.
- **One manual**: Pass. Links only. Waves 1–3 edit [llm-docs/api.md](../../llm-docs/api.md).
- **Security stays conservative**: Pass. Wave 1 closes a bypass. Report it per [SECURITY.md](../../SECURITY.md) if a release has already shipped `requiredScopes` in the middleware.
