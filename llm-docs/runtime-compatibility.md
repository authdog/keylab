# Runtime Compatibility

`keylab` is designed to work in:

- Node.js
- Cloudflare Workers
- modern browsers
- Bun

## Standard algorithms

For standard JOSE flows, `keylab` relies on modern `jose` behavior and Web Crypto friendly imports. That keeps the package usable in runtimes where Node-only crypto modules are not available at module load time.

Common supported signing algorithms include:

- `HS256`, `HS384`, `HS512`
- `RS256`, `RS384`, `RS512`
- `PS256`, `PS384`, `PS512`
- `ES256`, `ES384`, `ES512`
- `EdDSA`

## Portable algorithms

Recent `jose` versions do not directly cover every algorithm that older integrations may still need. `keylab` adds a portable layer for:

- `ES256K`
- `Ed448`
- `X448`

## Practical guidance

- Prefer `jwk` keys for cross-runtime use.
- Prefer `pem` only when you specifically need PEM interoperability.
- In Workers and browsers, portable algorithms should use JWK input and output.
- In Node.js, PEM remains available for more compatibility-heavy flows.

## Fallback behavior

When runtime crypto support is incomplete, `keylab` can fall back to Node.js crypto for selected operations. This is mainly useful for local tooling and server-side environments rather than browser-style runtimes.
