# Quickstart: validating an algorithm wave

Planning artifacts only. Do not copy pages out of `llm-docs/`. Behavior
and examples live there; this file is how to tell a wave is done.

## Prerequisites

- Bun 1.2.11, as pinned in `package.json`
- Dependencies installed with `bun install --frozen-lockfile`

## Every wave

```bash
bun run test
bun run build
bun run docs:build
```

Expected: all three exit 0. Getting-started examples are unchanged.
[contracts/algorithms.md](./contracts/algorithms.md) still holds.

## Wave 1 — ML-DSA-65

- The published algorithm list includes `ML-DSA-65` and does not yet
  include `ML-DSA-44` or `ML-DSA-87`.
- A test generates an AKP JWK, signs, verifies, and rejects a tampered
  token.
- The same flow passes in the existing browser-style test environment.
- `@noble/post-quantum` is imported from inside the ML-DSA operation,
  not from `src/index.ts` at load.
- `llm-docs/portable-algorithms.md` and
  `llm-docs/runtime-compatibility.md` mention ML-DSA-65.
- `llm-docs/getting-started.md` is unchanged.

## Wave 2 — ML-DSA-44 and ML-DSA-87

- Sign-and-verify passes for each new name.
- Verification fails when the required name is a different ML-DSA set
  than the one that signed the token.
- No new dependency was added in this wave.
- The two product pages from wave 1 list the two additional names.
- Getting-started examples are unchanged.

## Wave 3 — Named content encryption

- The six names in [data-model.md](./data-model.md) each round-trip
  through the existing encrypt and decrypt jobs.
- `enc` on the encrypt options is still a string.
- `llm-docs/api.md` lists the six names.
- The getting-started encryption example is unchanged.
