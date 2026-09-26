# Compatibility contract

This is the invariant set for the four waves. Caller-facing behavior
stays in `llm-docs/`. This file does not restate those pages.

## Must remain true after every wave

- The package entry stays `src/index.ts`, with the current `exports` map
  (`types`, `import`, `require`).
- Getting-started flows for key generation, signing, in-memory verify,
  and JWKS verify still succeed with the same calls.
- `checkTokenValidness` and `IcheckTokenValidnessCredentials` keep their
  names.
- `*Legacy` JWKS type aliases stay exported until a future major.
- `createJwtMiddleware` stays the Express `(req, res, next)` adapter
  described in `llm-docs/api.md`.
- Portable curves `ES256K`, `Ed448`, and `X448` still route through the
  portable layer described in `llm-docs/portable-algorithms.md`.
- `node:crypto` is loaded only when a server-side fallback runs, not when
  the module is imported.
- Accepted algorithms are not removed or weakened. Verification is not
  skipped. Secrets, tokens, and private keys are not logged.
- Vulnerability intake stays in `SECURITY.md`.

## Allowed inside a wave

- Narrowing `any` on exported types when the runtime value does not change.
- Stricter compiler checks that reject code the current tests already forbid.
- Deleting a devDependency that nothing imports.
- A `llm-docs` edit that records an environment exception found in wave 3.

## Not allowed inside these waves

- A second consumer guide under `specs/` or `md/`.
- A public rename, even with a temporary alias, unless a later spec makes
  that rename its purpose.
- A Vitest major, a `jose` replacement, or a Workers middleware.
