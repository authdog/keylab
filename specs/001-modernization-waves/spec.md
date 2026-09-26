# Feature Specification: Next modernization waves

**Feature Branch**: `001-modernization-waves`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Configure spec-kit for keylab, don't duplicate with llm-docs, I want to plan next modernization waves"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One supported way to do each published job (Priority: P1)

A caller signs, verifies, and inspects tokens using the jobs already
described in the product manual. Maintainers collapse duplicate names and
stop treating accidental exports as supported, while every published
example keeps working.

**Why this priority**: Callers feel a messy surface before they feel
internal cleanup. This wave is useful even if later waves never start.

**Independent Test**: Run the published getting-started flows and confirm
each job still has exactly one supported entry point, with previous names
still accepted where a compatibility alias exists.

**Acceptance Scenarios**:

1. **Given** a caller following the current getting-started guide, **When** they generate a key, sign, and verify, **Then** the same steps succeed without edits.
2. **Given** two names that mean the same published job, **When** this wave ships, **Then** one name is the supported entry and the other is either an alias or explicitly unsupported.
3. **Given** a type or helper that was never part of the product manual, **When** this wave ships, **Then** it is no longer presented as supported API.

---

### User Story 2 - Unsafe edits fail before release (Priority: P2)

A maintainer changes internals and learns, before release, when a required
value is missing or a published promise no longer holds. The wave adds no
new caller-facing jobs.

**Why this priority**: Later runtime and tooling work is unsafe while
missing values can pass unnoticed.

**Independent Test**: Introduce a missing required value in a published
flow and confirm the project check fails. Revert it and confirm the
existing suite passes.

**Acceptance Scenarios**:

1. **Given** the current test suite, **When** this wave ships, **Then** that suite still passes with no published example rewritten.
2. **Given** a published option that callers may omit, **When** a maintainer treats it as always present, **Then** the project check fails.
3. **Given** signing, verification, remote key lookup, portable curves, and encrypted tokens, **When** this wave ships, **Then** each of those promises still has a passing check.

---

### User Story 3 - Promised environments stay honest (Priority: P3)

A caller on Node.js, Cloudflare Workers, a browser, or Bun can run the
published flows. Server-only cryptography stays a fallback and does not
run merely because the library was loaded.

**Why this priority**: The product already promises those environments.
The check today does not show that promise holding outside one server
runtime.

**Independent Test**: Load the library and complete one published sign and
verify flow in each promised environment, and confirm a server-only
fallback does not run at load time.

**Acceptance Scenarios**:

1. **Given** a published sign-and-verify example, **When** it runs in each promised environment, **Then** it succeeds or the product manual is updated to state the exception in the same wave.
2. **Given** the library is imported and no server-only operation is requested, **When** the module finishes loading, **Then** no server-only cryptography has run.
3. **Given** a portable curve called out in the product manual, **When** it is used from a browser-style environment with the recommended key format, **Then** the documented result still holds.

---

### User Story 4 - Maintenance matches what is still used (Priority: P4)

A maintainer reviews and upgrades only the tools the build and checks
still invoke. Unused tools are removed after confirming nothing calls
them.

**Why this priority**: It reduces upgrade noise, but it does not change
caller behavior and should not ride along with the earlier waves.

**Independent Test**: List tools removed in the wave, show each had no
remaining caller, and show build, tests, and the product-manual build
still succeed.

**Acceptance Scenarios**:

1. **Given** a tool with no remaining caller, **When** this wave removes it, **Then** build, tests, and the product-manual build still succeed.
2. **Given** a tool a script still invokes, **When** this wave is reviewed, **Then** that tool stays.
3. **Given** an upgrade that changes how checks are written, **When** it is proposed inside an earlier wave, **Then** it is split out so that wave can still ship alone.

---

### Edge Cases

- A name that looks internal is imported by an existing caller. The wave keeps a compatibility alias or stops and records the break before shipping.
- A flow passes on the server and fails in a browser or worker. The wave either fixes it or updates the product manual in the same change.
- Removing a tool breaks a script that was not in the package manifest's scripts list. The tool stays until that caller is removed or rewritten.
- A wave changes caller-visible behavior and only updates the planning notes. The wave is incomplete until the matching product-manual page changes.
- A planning note copies an API table, migration map, or security write-up from the product manual. That note is rewritten as a link.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each wave MUST be releasable on its own and MUST leave the library usable if later waves slip.
- **FR-002**: Waves MUST ship in this order: supported-surface cleanup, stricter checks, promised-environment honesty, unused-tool removal.
- **FR-003**: Published getting-started flows MUST keep working after every wave, without edits to those examples.
- **FR-004**: A caller-visible rename or removal MUST be either deferred to a new major version or shipped with a compatibility alias. The wave MUST say which.
- **FR-005**: The project check MUST fail when a published flow omits a value the implementation treats as required.
- **FR-006**: Signing, verification, remote key lookup, portable curves, and encrypted tokens MUST keep a passing check after every wave.
- **FR-007**: The library MUST NOT run server-only cryptography at load time.
- **FR-008**: Each environment named in the runtime guide MUST pass one published sign-and-verify flow, or the same wave MUST update that guide to state the exception.
- **FR-009**: A tool MAY be removed only after confirming no script or check still invokes it.
- **FR-010**: A dependency upgrade that changes how checks are written MUST be its own follow-up, not part of waves 1–3.
- **FR-011**: Planning notes MUST link to `llm-docs/` for install, API, migration, runtime, portable algorithms, and security narrative. They MUST NOT copy those pages.
- **FR-012**: A wave that changes caller-visible behavior MUST update the matching `llm-docs` page in the same change.
- **FR-013**: Vulnerability intake MUST stay in `SECURITY.md`. Planning notes MUST link to it.
- **FR-014**: These waves MUST NOT add new caller-facing jobs beyond what the product manual already describes.

### Key Entities

- **Wave**: One shippable slice with an order, an acceptance check, and a flag for whether it changes the published contract.
- **Published contract**: The jobs, names, and examples callers already rely on. Described in `llm-docs/`, not restated here.
- **Product manual**: The VitePress site under `llm-docs/`. Specs link to it; they do not replace it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After each wave, 100% of the current getting-started examples succeed unchanged.
- **SC-002**: Zero new consumer guides are added outside `llm-docs/`.
- **SC-003**: A reader can skip any later wave and still complete the jobs from the current product manual.
- **SC-004**: Every caller-visible break is named before that wave starts, or the wave does not ship it.
- **SC-005**: Planning documents for this feature contain links to the product manual and security policy, and they contain no copied API, migration, runtime, or security sections.

## Assumptions

- The current release line stays compatible. Public renames wait for a later major unless a wave explicitly adopts an alias.
- `llm-docs/` remains the only consumer manual. Deep wiki and `SECURITY.md` stay where they are.
- These four waves are planned together so the sequence is visible. Implementation happens one wave at a time, after tasks are generated for that wave.
- The cryptographic stack and the set of published jobs stay as they are. This feature does not add algorithms or a new product surface.
- Server-only cryptography may remain as a fallback when a caller asks for an operation the portable path cannot do. It must not run at import.
- An upgrade of the test runner is out of scope for these four waves because it would mix with the stricter-check wave.
