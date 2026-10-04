---
description: "Task list for additional keylab algorithms"
---

# Tasks: More algorithms

**Input**: Design documents from `/specs/002-more-algorithms/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/algorithms.md, quickstart.md

**Tests**: Each wave adds the checks named in `specs/002-more-algorithms/quickstart.md`. The current suite must stay green.

**Organization**: One phase per wave. Waves ship in id order. A later wave starts only after the previous one is green.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `US1` ML-DSA-65, `US2` other parameter sets, `US3` content-encryption names
- Paths are repository-relative

## Path Conventions

- Library code: `src/`
- Product manual: `llm-docs/` (only the pages a task names)
- Planning: `specs/002-more-algorithms/`

## Phase 1: Setup

**Purpose**: Prove the tree is green and add the post-quantum dependency once

- [x] T001 Run `bun run test` and `bun run build` from the repository root and stop if either command fails
- [x] T002 Add `@noble/post-quantum` to `dependencies` in `package.json` and refresh `bun.lock` with `bun install`. Do not change the `jose` version

---

## Phase 2: Foundational

**Purpose**: Shared guards that block every wave

**⚠️ CRITICAL**: No wave work starts until this phase is complete

- [x] T003 Confirm `src/vendors/jwt/jwt-sign.ts` and `src/vendors/jwt/portable-algorithms.ts` load `node:crypto` only from inside functions
- [x] T004 Confirm `specs/002-more-algorithms/data-model.md` still says "Must ship in id order. A later wave may start only after the previous one is green."

**Checkpoint**: Baseline is green and the compatibility contract matches the public entry

---

## Phase 3: User Story 1 - Sign and verify with one post-quantum algorithm (Priority: P1) 🎯 MVP

**Goal**: ML-DSA-65 key generation, signing, and verification through the published jobs. `priv` is the 32-byte seed and only on private keys. The ML-DSA context string is empty. Not a caller option in these waves.

**Independent Test**: Generate a key, sign, verify, and reject a tampered token with ML-DSA-65, including in the existing browser-style environment. Getting-started examples stay unchanged.

### Tests for User Story 1

- [x] T005 [P] [US1] Add `src/vendors/jwt/portable-ml-dsa.test.ts` that generates an AKP JWK for ML-DSA-65, asserts `priv` is absent on the public key and is 32 bytes on the private key, signs, verifies, and rejects a tampered signature
- [x] T006 [P] [US1] Add an ML-DSA-65 JWK sign-and-verify case to `src/vendors/jwt/browser-sign-verify.test.ts` using the existing happy-dom environment

### Implementation for User Story 1

- [x] T007 [US1] Add `ML_DSA_65 = "ML-DSA-65"` to `JwtAlgorithmsEnum` in `src/enums.ts` and to the algorithm union in `src/vendors/jwt/interfaces.ts`. Constraint from `specs/002-more-algorithms/data-model.md`: "Wave 1 cannot add ML-DSA-44, ML-DSA-87, or content-encryption names."
- [x] T008 [US1] Allow `kty` `"AKP"` plus optional `pub` and `priv` on `IJwkPrivateKey` and `IJwkPublicKey` in `src/vendors/jwt/interfaces.ts`. Constraint from `specs/002-more-algorithms/data-model.md`: "`priv` is the 32-byte seed and only on private keys."
- [x] T009 [US1] Add `src/vendors/jwt/portable-ml-dsa.ts` that dynamically imports `@noble/post-quantum/ml-dsa.js`, generates AKP JWKs, signs with an empty context, and verifies. Use `jose` when that runtime can import the AKP key. Reject PEM. Do not log the seed
- [x] T010 [US1] Route ML-DSA-65 key generation and signing through `src/vendors/jwt/portable-ml-dsa.ts` from `src/vendors/jwt/jwt-sign.ts` without changing ES256K, Ed448, or X448
- [x] T011 [US1] Verify ML-DSA-65 tokens from adhoc keys in `src/vendors/jwks/jwks.ts` and accept the algorithm in `checkTokenValidness` and `createSignedJwt` in `src/vendors/jwt/jwt-verify.ts`
- [x] T012 [P] [US1] Name ML-DSA-65 in `llm-docs/portable-algorithms.md` and `llm-docs/runtime-compatibility.md`. Leave `llm-docs/getting-started.md` unchanged
- [x] T013 [US1] Run `bun run test` and `bun run build`. Constraint from `specs/002-more-algorithms/data-model.md`: "A wave cannot be `green` if getting-started examples need edits."

**Checkpoint**: Wave 1 is green on its own. Stop here before wave 2.

---

## Phase 4: User Story 2 - Choose the other registered parameter sets (Priority: P2)

**Goal**: ML-DSA-44 and ML-DSA-87 use the wave 1 path. Verification fails when the required name differs from the name that signed the token.

**Independent Test**: Sign and verify each new name. A cross-set verification fails. No new dependency.

### Tests for User Story 2

- [x] T014 [US2] Extend `src/vendors/jwt/portable-ml-dsa.test.ts` with a sign-and-verify case for ML-DSA-44 and ML-DSA-87, plus one rejection when verification uses a different set

### Implementation for User Story 2

- [x] T015 [US2] Add `ML_DSA_44 = "ML-DSA-44"` and `ML_DSA_87 = "ML-DSA-87"` to `src/enums.ts` and `src/vendors/jwt/interfaces.ts`, and accept them in `src/vendors/jwt/portable-ml-dsa.ts`, `src/vendors/jwt/jwt-sign.ts`, `src/vendors/jwt/jwt-verify.ts`, and `src/vendors/jwks/jwks.ts`. Constraint from `specs/002-more-algorithms/data-model.md`: "Wave 2 cannot add a new dependency or a PEM encoding."
- [x] T016 [P] [US2] List ML-DSA-44 and ML-DSA-87 beside ML-DSA-65 in `llm-docs/portable-algorithms.md` and `llm-docs/runtime-compatibility.md`
- [x] T017 [US2] Run `bun run test` and `bun run build`

**Checkpoint**: All three registered post-quantum signature names work. Encryption examples are unchanged.

---

## Phase 5: User Story 3 - Name the content-encryption choices (Priority: P3)

**Goal**: Export the six content-encryption names. The field stays a string. A value outside this list that already works stays accepted.

**Independent Test**: Each of the six names round-trips. `enc` is still typed as `string`. The getting-started encryption example is unchanged.

### Tests for User Story 3

- [x] T018 [US3] Add a round trip for each of `A128GCM`, `A192GCM`, `A256GCM`, `A128CBC-HS256`, `A192CBC-HS384`, and `A256CBC-HS512` in `src/vendors/jwe/jwe.test.ts`, including one call whose `enc` value is a plain `string`

### Implementation for User Story 3

- [x] T019 [US3] Add a `JweContentEncryption` enum with those six string values in `src/enums.ts`. Constraint from `specs/002-more-algorithms/data-model.md`: "Wave 3 cannot change `enc` from a string to a closed list." Leave `enc` on `IEncryptJweOptions` in `src/vendors/jwe/jwe.ts` typed as `string`
- [x] T020 [P] [US3] List the six names in the encryption section of `llm-docs/api.md`. Leave `llm-docs/getting-started.md` unchanged
- [x] T021 [US3] Run `bun run test` and `bun run build`

**Checkpoint**: Content-encryption names are published and existing encryption calls still compile.

---

## Phase 6: Polish

**Purpose**: Checks that apply after the waves you chose to ship

- [x] T022 [P] Confirm `specs/002-more-algorithms/` links to `llm-docs/` and `SECURITY.md` and does not copy their API, migration, runtime, or security sections
- [x] T023 Run `bun run test`, `bun run build`, and `bun run docs:build` from `specs/002-more-algorithms/quickstart.md`
- [x] T024 [P] Update the algorithm and dependency rows in `llm-docs/migration.md` and the portable-curve feature line in `llm-docs/index.md` so they include the new signature names and `@noble/post-quantum`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. Blocks every wave
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on User Story 1 being green
- **User Story 3 (Phase 5)**: Depends on User Story 2 being green
- **Polish (Phase 6)**: Depends on the waves you implemented

Order quote from `specs/002-more-algorithms/data-model.md`: "Must ship in id order. A later wave may start only after the previous one is green."

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational. No dependency on later stories
- **User Story 2 (P2)**: Starts after User Story 1 is green. Must not add a dependency
- **User Story 3 (P3)**: Starts after User Story 2 is green. Must not narrow `enc`

### Within Each User Story

- Tests before implementation
- Enum and key shape before the portable module
- Portable module before sign and verify routing
- Routing before the suite run

### Parallel Opportunities

- T005 and T006 can run together
- T012 can run beside T009–T011 after the enum name exists
- T016 can run beside T015
- T020 can run beside T019
- Waves themselves stay sequential

---

## Parallel Example: User Story 1

```bash
# After T001–T004, these touch different files:
Task: "Add ML-DSA-65 cases in src/vendors/jwt/portable-ml-dsa.test.ts"
Task: "Add the browser-style case in src/vendors/jwt/browser-sign-verify.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `bun run test` and `bun run build` pass, and getting-started examples are unchanged
5. Leave waves 2 and 3 for later passes

### Incremental Delivery

1. Setup + Foundational
2. Wave 1 ML-DSA-65 → stop and validate
3. Wave 2 other parameter sets → stop and validate
4. Wave 3 content-encryption names → stop and validate

---

## Notes

- [P] tasks touch different files and do not depend on an unfinished task
- Do not rename `checkTokenValidness` or `IcheckTokenValidnessCredentials`
- Do not copy pages from `llm-docs/` into `specs/`
- Do not log ML-DSA seeds, tokens, or private keys
- Do not upgrade `jose` in these waves
