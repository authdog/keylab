# Quickstart: validating a modernization wave

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

Expected: all three exit 0. Getting-started examples are unchanged unless
the wave's `manual_edit` says otherwise.

## Wave 1 — supported surface

- Exported types that were `any` use the library's existing JWK and
  payload types.
- `src/index.ts` still exports the current function names and the
  `*Legacy` aliases.
- `ponyfills` is not exported from `src/index.ts`.
- Diff `llm-docs/` and expect no edits, unless a public type description
  had to change.

## Wave 2 — stricter checks

- `tsconfig.json` has `strictNullChecks` enabled.
- `ignoreDeprecations`, `experimentalDecorators`, and
  `emitDecoratorMetadata` are gone.
- Vitest version is unchanged.
- `bun run test` and `bun run build` pass.

## Wave 3 — promised environments

- Importing the package does not load `node:crypto`.
- One published sign-and-verify flow runs outside Node (browser-style or
  worker-style) and passes.
- If that flow cannot, `llm-docs/runtime-compatibility.md` states the
  exception in the same change.
- `createJwtMiddleware` is still the Express adapter. Do not port it.

## Wave 4 — unused tooling

- `@swc/core`, `raw-loader`, `ts-node`, `codecov`, and `husky` are gone
  from `package.json` and the lockfile.
- `terser` remains.
- `bun run test`, `bun run build`, and `bun run docs:build` pass.

## When to generate tasks

Run `/speckit-tasks` for the single wave about to be implemented. Do not
generate tasks for all four waves at once.
