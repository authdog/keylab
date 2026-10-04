# Algorithm contract

This is the invariant set for the three waves. Caller-facing behavior
stays in `llm-docs/`. This file does not restate those pages.

## Must remain true after every wave

- The package entry stays `src/index.ts`, with the current `exports` map
  (`types`, `import`, `require`).
- Getting-started flows for key generation, signing, in-memory verify,
  JWKS verify, and JWE still succeed with the same calls.
- `checkTokenValidness` and `IcheckTokenValidnessCredentials` keep their
  names.
- Published algorithm names already in `src/enums.ts` keep their string
  values.
- Portable curves `ES256K`, `Ed448`, and `X448` still route through the
  portable layer described in
  [llm-docs/portable-algorithms.md](../../../llm-docs/portable-algorithms.md).
- `node:crypto` is loaded only when a server-side fallback runs, not when
  the module is imported.
- The post-quantum implementation loads only when an ML-DSA operation runs.
- Accepted algorithms are not removed or weakened. Verification is not
  skipped. Secrets, tokens, private keys, and ML-DSA seeds are not logged.
- `none` stays unsupported.
- Vulnerability intake stays in [SECURITY.md](../../../SECURITY.md).

## Allowed inside a wave

- Adding one or more algorithm names listed for that wave in
  [data-model.md](../data-model.md).
- An AKP member on the JWK key-type union when wave 1 needs it.
- A lazy portable ML-DSA module and the `@noble/post-quantum` dependency,
  in wave 1 only.
- A `llm-docs` edit named by that wave's `manual_edit`.
- Tests that cover the new name, tamper rejection, and cross-set mismatch.

## Not allowed inside these waves

- A second consumer guide under `specs/` or `md/`.
- A public rename or a removal of an existing algorithm.
- Narrowing JWE `enc` so that a string outside the six names becomes a
  type error or a runtime rejection.
- ML-KEM, HPKE draft algorithms, SLH-DSA, Falcon, HashML-DSA, or `none`.
- A `jose` upgrade, a Vitest major, or PEM export for ML-DSA.
- Logging key material while debugging a failed signature.
