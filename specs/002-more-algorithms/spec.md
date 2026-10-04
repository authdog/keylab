# Feature Specification: More algorithms

**Feature Branch**: `002-more-algorithms`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "Plan next waves for keylab, I'd like to support more algorithms"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign and verify with one post-quantum algorithm (Priority: P1)

A caller generates a key, signs a token, and verifies it using the
registered mid-strength post-quantum signature, ML-DSA-65. They use the
same published key, sign, and verify jobs they already use. The flow
works in each environment the product already promises, or that same
wave updates the runtime guide to state the exception.

**Why this priority**: The classical signature set is already published.
ML-DSA-65 is the one new signature that is useful on its own. Later
parameter sets and content-encryption names can slip without removing it.

**Independent Test**: Generate a key, sign a payload, and verify that
token with ML-DSA-65. Repeat one published sign-and-verify flow that
does not use the new algorithm and confirm it is unchanged.

**Acceptance Scenarios**:

1. **Given** a caller using the published key, sign, and verify jobs, **When** they choose ML-DSA-65, **Then** verification succeeds for a token that was just signed and fails for a token whose signature was altered.
2. **Given** the current getting-started examples, **When** this wave ships, **Then** those examples still succeed without edits.
3. **Given** a promised environment, **When** the ML-DSA-65 flow runs there, **Then** it succeeds or the runtime guide states the exception in the same wave.

---

### User Story 2 - Choose the other registered parameter sets (Priority: P2)

A caller who already has ML-DSA-65 can choose the smaller registered
set, ML-DSA-44, or the larger one, ML-DSA-87. Each set has its own
name. A token signed with one set does not verify as another set.

**Why this priority**: Callers need the full registered family, but one
set already delivers a working post-quantum signature.

**Independent Test**: Sign and verify once with ML-DSA-44 and once with
ML-DSA-87. Confirm a token from one set is rejected when verification
requires the other set.

**Acceptance Scenarios**:

1. **Given** ML-DSA-65 already works, **When** the caller selects ML-DSA-44 or ML-DSA-87, **Then** sign and verify succeed for that set.
2. **Given** a token signed with one of the three sets, **When** verification requires a different set, **Then** verification fails.
3. **Given** this wave ships without the content-encryption wave, **Then** existing encryption examples still succeed.

---

### User Story 3 - Name the content-encryption choices (Priority: P3)

A caller encrypting a token picks a content-encryption algorithm from
a published list instead of an unchecked label. The six algorithms
already defined for this purpose stay available: A128GCM, A192GCM,
A256GCM, A128CBC-HS256, A192CBC-HS384, and A256CBC-HS512. A label that
already works and is outside that list still works.

**Why this priority**: These algorithms already encrypt today. Naming
them helps callers pick a real one. It does not block the new signatures.

**Independent Test**: Round-trip one payload with each of the six names.
Confirm the current encryption example, which uses A256GCM, still succeeds
unchanged, and confirm an already-accepted label outside the six is not
rejected solely because it is unnamed.

**Acceptance Scenarios**:

1. **Given** a caller encrypting with one of the six names, **When** they decrypt with the matching key, **Then** the original plaintext comes back.
2. **Given** the current getting-started encryption example, **When** this wave ships, **Then** that example still succeeds without edits.
3. **Given** a content-encryption label the library already accepts that is not one of the six, **When** this wave ships, **Then** that label is still accepted.

---

### Edge Cases

- A promised environment cannot run ML-DSA-65. The wave fixes it or updates the runtime guide in the same change.
- A private key or seed is included in an error message or log. The wave does not ship until that output is removed.
- Verification is asked to accept a token without checking the signature. That request stays rejected.
- A caller passes the algorithm name `none`. It stays unsupported.
- A draft algorithm that is not yet a finished registration is requested. It is out of scope for these waves.
- A wave changes caller-visible behavior and only updates the planning notes. The wave is incomplete until the matching product-manual page changes.
- A planning note copies an API table, migration map, or security write-up from the product manual. That note is rewritten as a link.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each wave MUST be releasable on its own and MUST leave the library usable if later waves slip.
- **FR-002**: Waves MUST ship in this order: ML-DSA-65, then ML-DSA-44 and ML-DSA-87, then named content-encryption algorithms.
- **FR-003**: Published getting-started flows MUST keep working after every wave, without edits to those examples.
- **FR-004**: New algorithm names MUST be additive. A wave MUST NOT rename or remove a published algorithm.
- **FR-005**: ML-DSA-65 MUST support key generation, signing, and verification through the published jobs, and verification MUST fail when the signature is not valid.
- **FR-006**: ML-DSA-44 and ML-DSA-87 MUST support the same jobs, and a token MUST NOT verify under a different parameter set than the one that signed it.
- **FR-007**: The six content-encryption names listed in User Story 3 MUST each round-trip. A label the library already accepts outside that list MUST NOT start failing only because it is unnamed.
- **FR-008**: Each environment named in the runtime guide MUST pass the new sign-and-verify flow for the algorithms that wave adds, or the same wave MUST update that guide to state the exception.
- **FR-009**: A wave that changes caller-visible behavior MUST update the matching `llm-docs` page in the same change.
- **FR-010**: Planning notes MUST link to `llm-docs/` for install, API, migration, runtime, portable algorithms, and security narrative. They MUST NOT copy those pages.
- **FR-011**: The library MUST NOT log secrets, tokens, or private key material, including a post-quantum private seed.
- **FR-012**: These waves MUST NOT add `none`, MUST NOT skip verification, and MUST NOT weaken an algorithm the product already accepts.
- **FR-013**: Algorithms that do not yet have a finished signature or encryption registration MUST stay out of these waves. That includes key-encapsulation drafts, hybrid encryption drafts, hash-based signatures, and hash-then-sign variants of ML-DSA.
- **FR-014**: Vulnerability intake MUST stay in `SECURITY.md`. Planning notes MUST link to it.

### Key Entities

- **Wave**: One shippable slice with an order, an acceptance check, and a flag for whether it changes the published contract.
- **Signature algorithm**: A named way to sign and verify a token. These waves add ML-DSA-65, then ML-DSA-44 and ML-DSA-87.
- **Content-encryption algorithm**: A named way to protect the body of an encrypted token. These waves name six existing choices without removing other accepted labels.
- **Published contract**: The jobs, names, and examples callers already rely on. Described in `llm-docs/`, not restated here.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After wave 1, a caller can generate a key, sign, and verify with ML-DSA-65, and 100% of the current getting-started examples still succeed unchanged.
- **SC-002**: After wave 2, all three registered post-quantum signature names succeed a sign-and-verify check, and a cross-set verification fails in every case tried.
- **SC-003**: After wave 3, each of the six named content-encryption algorithms round-trips, and the current encryption example still succeeds unchanged.
- **SC-004**: A reader can skip any later wave and still complete the jobs from the product manual, including the algorithms shipped by earlier waves.
- **SC-005**: Planning documents for this feature contain links to the product manual and security policy, and they contain no copied API, migration, runtime, or security sections.

## Assumptions

- The current release line stays compatible. New names are additions. Public renames stay out of these waves.
- ML-DSA-65 is the first set because one registered signature is enough to ship, and the middle strength is the usual single choice when a profile picks one.
- The cross-runtime key format already recommended in the product manual is the format these waves publish for the new signatures. A server-only encoding is not added for them.
- `llm-docs/` remains the only consumer manual. Specs link to it.
- Key encapsulation, hybrid public-key encryption drafts, hash-based signatures, and hash-then-sign ML-DSA wait for a later feature after their registrations are finished.
- Server-only cryptography may remain a fallback when a caller asks for an operation the portable path cannot do. It must not run merely because the library was loaded.
- The modernization waves in `specs/001-modernization-waves/` are already complete. This feature does not reopen them.
