# Feature Specification: Contract hardening

**Feature Branch**: `003-contract-hardening`

**Created**: 2026-10-06

**Status**: Implemented (2026-10-06)

**Input**: User description: "Increase test coverage to 100% and plan next waves"

## Context

Reaching 100% line and branch coverage exposed code that tests could not
reach. Each unreachable path traced back to a promise the library makes
but does not keep. One of them, the expiry branch for HS tokens, was fixed
along with the coverage work (see Wave 0). The waves below cover the rest.
They are ordered by caller risk: first silent security gaps, then the
published error contract, then performance promises, then release gates.

The caller-facing contract lives in [llm-docs/api.md](../../llm-docs/api.md).
This spec links to that page and does not restate it.

## Wave 0 - Done with the coverage work

- `checkTokenValidness(token, { secret })` now throws `TokenExpiredError`
  with `expiredAt` for an expired HS token, as
  [llm-docs/api.md](../../llm-docs/api.md) documents. Before, it returned
  `false`, because `jose` rejected the token first and the library
  swallowed that error.
- Statements, branches, functions, and lines are at 100% with every file
  under `src/` counted. The ML-DSA fallback for environments without native
  ML-DSA now has its own checks, including a cross-check that tokens it
  signs verify with native `jose`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configured scope checks are enforced (Priority: P1)

A service protects a route with `createJwtMiddleware` or `createJwtHandler`
and sets `requiredScopes`. A token that lacks those scopes is rejected.
Today the option is accepted and passed through, but nothing enforces it.
A token with `scp: "read"` passes a handler configured with
`requiredScopes: ["admin"]`, for both HS256 and ES256.

**Why this priority**: This is a silent authorization bypass. Callers who
set the option believe they are protected.

**Independent Test**: Configure a handler with `requiredScopes: ["admin"]`.
Confirm that a validly signed token with `scp: "read"` is rejected and a
token with `scp: "admin"` is accepted, for one symmetric and one asymmetric
algorithm.

**Acceptance Scenarios**:

1. **Given** a handler with `requiredScopes`, **When** the token lacks a required scope, **Then** the handler reports failure and the middleware responds 401 (or calls `onError`).
2. **Given** `checkTokenValidness` called with `requiredScopes`, **When** the token lacks a required scope, **Then** it rejects, whichever verification path the algorithm uses.
3. **Given** an option that is accepted but has no effect (`verifySsl` today), **When** this wave ships, **Then** the option either works or is marked deprecated in the types and in `llm-docs`.

---

### User Story 2 - Failures raise the documented error classes (Priority: P2)

A caller follows the error-handling example in
[llm-docs/api.md](../../llm-docs/api.md) and branches on `instanceof`.
Each failure raises the class the manual names, whatever the algorithm.

Observed on 2026-10-06:

| Failure | Raised today | Documented |
| --- | --- | --- |
| Expired asymmetric token (RS256) | `jose` `JWTExpired` | `TokenExpiredError` |
| Wrong asymmetric key (RS256) | `jose` `JWSSignatureVerificationFailed` | `InvalidSignatureError` |
| Wrong HS secret | resolves `false` | `InvalidSignatureError` (implied) |
| Malformed token (`"abc"`) | `URIError` | `MalformedTokenError` |
| Header `alg` differs from expected | never raised | `AlgorithmMismatchError` |
| Expired ES256K, Ed448, or noble ML-DSA token | **accepted** | `TokenExpiredError` |

The last row was found while implementing this wave: the portable verifiers
checked only the signature, never `exp` or `nbf`. It is fixed by running the
same claim checks after every verification path.

**Why this priority**: The documented example misses every asymmetric
failure today. Changing what callers receive is visible to them, so this
wave needs an explicit compatibility decision (see the plan).

**Independent Test**: For HS256, RS256, ES256K, Ed448, and ML-DSA-65, run
expired, wrong-key, and malformed tokens through `checkTokenValidness` and
assert the documented class. The original `jose` error stays on `cause`.

**Acceptance Scenarios**:

1. **Given** an expired token for any supported algorithm, **When** it is verified, **Then** `TokenExpiredError` is raised with `expiredAt`.
2. **Given** a signature that does not verify, **When** it is verified, **Then** `InvalidSignatureError` is raised.
3. **Given** structurally invalid input, including base64url that contains characters outside the alphabet, **When** it is parsed or verified, **Then** `MalformedTokenError` is raised and no partial data is returned.
4. **Given** a caller that still catches `jose` errors by `code`, **When** this wave ships, **Then** the original error is reachable on `cause`, or the change waits for the next major version.

---

### User Story 3 - Remote key sets are cached as documented (Priority: P3)

A caller verifies tokens against `jwksUri`. Repeated verifications reuse
the documented cache, and `clearJwksCache()` empties the cache that
verification actually uses. Today verification by `jwksUri` fetches the key
set on every call, and the default cache that `clearJwksCache()` clears is
never read.

The cache takes a storage adapter (`IJwksCacheStore`), so key sets can live
in Workers KV, Redis, or another store shared across processes or isolates.

**Why this priority**: This affects performance and the load on identity
providers, not correctness. It depends on Wave 2's error mapping for
`JwksEndpointError`.

**Independent Test**: Verify two tokens with the same `jwksUri` and count
fetches. Clear the cache and confirm the next verification fetches again.

**Acceptance Scenarios**:

1. **Given** two verifications against one `jwksUri` within the TTL, **When** both complete, **Then** the key set was fetched once.
2. **Given** a token whose `kid` is not in the cached set, **When** it is verified, **Then** the set is refetched once before `JWK_NO_APPLICABLE_KEY` is raised.
3. **Given** `clearJwksCache()`, **When** the next verification runs, **Then** it fetches again.
4. **Given** a cache built with a custom `store`, **When** two cache instances share that store, **Then** the second reads the first's entry without fetching, and a failing store degrades to fetching.

---

### User Story 4 - Release gates catch what review missed (Priority: P4)

A maintainer cannot merge a change that drops coverage, breaks types or
lint, or produces a broken published bundle.

**Why this priority**: The other waves stay fixed only if CI enforces
them. It does not change caller behavior, so it ships last or alongside
any wave.

**Independent Test**: In separate throwaway branches, delete a test, add a
type error, and build with the Bun version from `package.json`
`packageManager` and with the current latest Bun. Confirm that CI fails
for each.

**Acceptance Scenarios**:

1. **Given** a change that lowers any coverage metric below 100%, **When** CI runs, **Then** it fails.
2. **Given** `bun run lint` and a type check of `src/`, **When** CI runs, **Then** both run and must pass. The existing debt (223 Biome errors, 42 type errors in `pem.test.ts`) is cleared first.
3. **Given** the published `build:js` command, **When** it runs with a newer Bun, **Then** the built `dist/index.js` loads and exports every name from `src/index.ts`. Bun 1.3.14 with `"sideEffects": false` emits a 1 KB bundle with no implementation.

---

### Edge Cases

- A token carries a scope as a space-separated string, as an array, or not at all. Scope enforcement treats each the same way `checkJwtFields` already does.
- A caller relies on `checkTokenValidness` resolving `false` for a wrong HS secret. Wave 2 either keeps that within the major version or ships it behind a documented major bump.
- The JWKS endpoint is down while a cached set is still valid. Verification uses the cache, and only an expired cache surfaces `JwksEndpointError`.
- A runtime without native ML-DSA. The noble fallback must keep the same error classes as the native path.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `requiredScopes` MUST be enforced on every path that accepts it: `checkTokenValidness`, `createJwtMiddleware`, and `createJwtHandler`.
- **FR-002**: An accepted option that has no effect MUST either be implemented or be deprecated in types and in `llm-docs` in the same wave.
- **FR-003**: Verification failures MUST raise the classes documented in [llm-docs/api.md](../../llm-docs/api.md), with the underlying error on `cause`.
- **FR-004**: Base64url decoding MUST reject characters outside the alphabet instead of decoding them as zero bits.
- **FR-005**: Verification by `jwksUri` MUST use the default `JwksCache`, or the one passed as `jwksCache`, and `clearJwksCache()` MUST affect the default.
- **FR-005a**: `JwksCache` MUST accept a storage adapter, and store failures MUST NOT fail verification.
- **FR-006**: CI MUST enforce 100% for statements, branches, functions, and lines, with every file under `src/` counted.
- **FR-007**: CI MUST run lint and a type check, and both MUST pass.
- **FR-008**: CI MUST build the published bundle and confirm it loads and exports the full public surface.
- **FR-009**: Any caller-visible change MUST update the matching `llm-docs` page in the same wave, per the constitution.

### Key Entities

- **Verification path**: The HS secret path, the `jose` path, the portable curve path, and the ML-DSA path. Each wave's checks cover all four.
- **Published error class**: The classes exported from `src/errors` and documented in [llm-docs/api.md](../../llm-docs/api.md).

## Success Criteria *(mandatory)*

- **SC-001**: Zero accepted options without an effect remain undocumented.
- **SC-002**: The `llm-docs` error-handling example catches every failure in the Story 2 table.
- **SC-003**: Verifying N tokens against one `jwksUri` within the TTL performs one fetch.
- **SC-004**: CI fails on any coverage drop, type error, lint error, or broken bundle.
