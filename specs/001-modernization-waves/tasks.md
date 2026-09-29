---
description: "Task list for the next keylab modernization waves"
---

# Tasks: Next modernization waves

**Input**: Design documents from `/specs/001-modernization-waves/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/compatibility.md, quickstart.md

**Tests**: No new test files for waves 1, 2, or 4. Those waves rerun the existing suite. Wave 3 adds the load-time and browser-style checks the plan already requires.

**Organization**: One phase per wave. Waves ship in id order. A later wave starts only after the previous one is green.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1` surface, `US2` checks, `US3` environments, `US4` tooling
- Paths are repository-relative

## Path Conventions

- Library code: `src/`
- Product manual: `llm-docs/` (link only, unless a task names a page)
- Planning: `specs/001-modernization-waves/`

## Phase 1: Setup

**Purpose**: Prove the tree is green before any wave edits

- [x] T001 Run `bun run test` and `bun run build` from the repository root and stop if either command fails
- [x] T002 [P] Confirm `src/index.ts` still exports the names listed as stable in `specs/001-modernization-waves/contracts/compatibility.md`

---

## Phase 2: Foundational

**Purpose**: Shared guards that block every wave

**⚠️ CRITICAL**: No wave work starts until this phase is complete

- [x] T003 Confirm `src/vendors/jwt/jwt-sign.ts` and `src/vendors/jwt/portable-algorithms.ts` load `node:crypto` only from inside functions, and that `src/vendors/jwt/jwt-sign.ts` has no value import from `node:crypto`
- [x] T004 Confirm `specs/001-modernization-waves/data-model.md` still says "Must ship in id order. A later wave may start only after the previous one is green."

**Checkpoint**: Baseline is green and the compatibility contract matches the public entry

---

## Phase 3: User Story 1 - One supported way to do each published job (Priority: P1) 🎯 MVP

**Goal**: Narrow exported `any` types and collapse the duplicate JWKS interface definitions. Published names stay. `caller_visible` stays `no`.

**Independent Test**: Getting-started flows still succeed with the same calls. `src/index.ts` still exports `checkTokenValidness`, `IcheckTokenValidnessCredentials`, and the `*Legacy` JWKS aliases. `llm-docs/` is unchanged.

### Implementation for User Story 1

- [x] T005 [P] [US1] Replace `ext?: any` with `ext?: unknown` on `IJwkPrivateKey` and `IJwkPublicKey` in `src/vendors/jwt/interfaces.ts` without changing runtime values
- [x] T006 [P] [US1] In `src/vendors/jwt/jwt-types.ts`, type `jwkPrivateKey` as `IJwkPrivateKey`, `pld` as `unknown`, and `jwk` on `IJwtTokenOpts` as `IJwkPrivateKey | IJwkPublicKey`. Do not rename `IcheckTokenValidnessCredentials`
- [x] T007 [P] [US1] Make `src/vendors/jwks/jwks.ts` import and re-export `IJwksClient`, `IJwkRecordVisible`, and `IVerifyRSATokenCredentials` from `src/vendors/jwks/jwks-types.ts` so each interface has one definition and the same fields
- [x] T008 [P] [US1] Remove `export * from "./ponyfills"` from `src/vendors/index.ts`. Keep the direct import in `src/vendors/jwt/jwt-verify.ts`. Confirm `src/index.ts` does not export ponyfills
- [x] T009 [US1] Keep `IJwkRecordVisibleLegacy`, `IJwksClientLegacy`, and `IVerifyRSATokenCredentialsLegacy` in `src/index.ts`, still sourced from `src/vendors/jwks/jwks-types.ts`
- [x] T010 [US1] Fix call sites in `src/vendors/jwt/` and `src/vendors/jwks/` that fail after T005–T007, without changing runtime behavior
- [x] T011 [US1] Run `bun run test` and `bun run build`. Constraint from `specs/001-modernization-waves/data-model.md`: "A wave cannot be `green` if getting-started examples need edits." Leave `llm-docs/` unchanged

**Checkpoint**: Wave 1 is green on its own. Stop here before wave 2.

---

## Phase 4: User Story 2 - Unsafe edits fail before release (Priority: P2)

**Goal**: Enable `strictNullChecks` and drop obsolete TypeScript flags. No new caller-facing behavior and no test-runner upgrade.

**Independent Test**: `bun run test` and `bun run build` pass. The Vitest version in `package.json` is unchanged. Getting-started examples are unchanged.

### Implementation for User Story 2

- [x] T012 [US2] In `tsconfig.json`, set `strictNullChecks` to true and remove `ignoreDeprecations`, `experimentalDecorators`, and `emitDecoratorMetadata`. Constraint from `specs/001-modernization-waves/data-model.md`: "Wave 2 cannot include a test-runner upgrade." Do not change the `vitest` version in `package.json`
- [x] T013 [P] [US2] Fix strict-null errors under `src/vendors/jwt/` without changing runtime behavior
- [x] T014 [P] [US2] Fix strict-null errors under `src/vendors/jwks/` without changing runtime behavior
- [x] T015 [P] [US2] Fix strict-null errors under `src/vendors/jwe/`, `src/vendors/middleware/`, `src/vendors/headers/`, `src/vendors/ponyfills/`, and `src/errors/` without changing runtime behavior
- [x] T016 [US2] Run `bun run test` and `bun run build`. Constraint from `specs/001-modernization-waves/data-model.md`: "A wave cannot be `green` if getting-started examples need edits."

**Checkpoint**: Wave 2 is green. Published examples still need no edits.

---

## Phase 5: User Story 3 - Promised environments stay honest (Priority: P3)

**Goal**: Fail if `node:crypto` loads at import, and run one published sign-and-verify flow outside Node. Leave the Express middleware as documented.

**Independent Test**: The new load-time check passes, one JWK ES256 sign-and-verify flow passes in a browser-style environment, and `createJwtMiddleware` is unchanged.

### Implementation for User Story 3

- [x] T017 [P] [US3] Add `src/index.load.test.ts` that imports `src/index.ts` and fails when `node:crypto` has been loaded. A type-only import in `src/vendors/jwt/jwt-sign.ts` remains allowed
- [x] T018 [P] [US3] Add `src/vendors/jwt/browser-sign-verify.test.ts` that runs the JWK ES256 key, sign, and verify flow from `llm-docs/getting-started.md` in a browser-style Vitest environment. Add that environment package only if it is missing. Do not change `createJwtMiddleware` in `src/vendors/middleware/middleware.ts`
- [x] T019 [US3] If the portable-curve path fails in that environment, fix `src/vendors/jwt/portable-algorithms.ts` or update `llm-docs/runtime-compatibility.md` in the same change. Constraint from `specs/001-modernization-waves/data-model.md`: "`caller_visible: yes` is invalid unless `manual_edit` names a page."
- [x] T020 [US3] Run `bun run test` and `bun run build`

**Checkpoint**: The runtime page matches what the new checks cover.

---

## Phase 6: User Story 4 - Maintenance matches what is still used (Priority: P4)

**Goal**: Remove devDependencies that nothing calls. Keep `terser`.

**Independent Test**: The five named packages are gone, `terser` remains, and test, build, and docs build all exit 0.

### Implementation for User Story 4

- [x] T021 [US4] Confirm `@swc/core`, `raw-loader`, `ts-node`, `codecov`, and `husky` have no imports under `src/`, `scripts/`, or `.github/`, and that `.husky/` is absent. Constraint from `specs/001-modernization-waves/data-model.md`: "Wave 4 cannot remove a dependency that a script still imports."
- [x] T022 [US4] Remove those five packages from `devDependencies` in `package.json`, keep `terser`, and refresh `bun.lock` with `bun install`
- [x] T023 [US4] Run `bun run test`, `bun run build`, and `bun run docs:build`

**Checkpoint**: Upgrade surface matches the tools the repo still invokes.

---

## Phase 7: Polish

**Purpose**: Checks that apply after the waves you chose to ship

- [x] T024 [P] Confirm `specs/001-modernization-waves/` links to `llm-docs/` and `SECURITY.md` and does not copy their API, migration, runtime, or security sections
- [x] T025 Run the every-wave commands in `specs/001-modernization-waves/quickstart.md` for each wave that was implemented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. Blocks every wave
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on User Story 1 being green
- **User Story 3 (Phase 5)**: Depends on User Story 2 being green
- **User Story 4 (Phase 6)**: Depends on User Story 3 being green
- **Polish (Phase 7)**: Depends on the waves you implemented

Order quote from `specs/001-modernization-waves/data-model.md`: "Must ship in id order. A later wave may start only after the previous one is green."

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational. No dependency on later stories
- **User Story 2 (P2)**: Starts after User Story 1 is green. Must not upgrade Vitest
- **User Story 3 (P3)**: Starts after User Story 2 is green. Must not redesign Express middleware
- **User Story 4 (P4)**: Starts after User Story 3 is green. Must not remove `terser`

### Within Each User Story

- Type and export edits before call-site fixes
- Call-site fixes before `bun run test` / `bun run build`
- A story is done only when its checkpoint commands exit 0

### Parallel Opportunities

- T001 and T002 can run together
- T005, T006, T007, and T008 can run together. T009 and T010 wait on them
- T013, T014, and T015 can run together after T012
- T017 and T018 can run together. T019 waits on T018
- Waves themselves stay sequential

---

## Parallel Example: User Story 1

```bash
# After T001–T004, these touch different files:
Task: "Replace ext?: any in src/vendors/jwt/interfaces.ts"
Task: "Retype jwkPrivateKey, pld, and jwk in src/vendors/jwt/jwt-types.ts"
Task: "Re-export JWKS interfaces from src/vendors/jwks/jwks-types.ts through src/vendors/jwks/jwks.ts"
Task: "Remove the ponyfills barrel export from src/vendors/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `bun run test` and `bun run build` pass, and `llm-docs/` is unchanged
5. Leave waves 2–4 for later passes

### Incremental Delivery

1. Setup + Foundational
2. Wave 1 surface → stop and validate
3. Wave 2 stricter checks → stop and validate
4. Wave 3 environments → stop and validate
5. Wave 4 unused tooling → stop and validate

---

## Notes

- [P] tasks touch different files and do not depend on an unfinished task
- Do not rename `checkTokenValidness` or `IcheckTokenValidnessCredentials`
- Do not copy pages from `llm-docs/` into `specs/`
- Do not combine a Vitest major with wave 2
