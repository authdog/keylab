---
layout: home

hero:
  name: keylab
  text: JWT and JWKS tooling that stays portable
  tagline: Create, sign, verify, and inspect tokens with PEM, JWK, and JWKS support across Node.js, Cloudflare Workers, browsers, and Bun.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: API Summary
      link: /api
    - theme: alt
      text: GitHub
      link: https://github.com/authdog/keylab

features:
  - title: Cross-runtime by default
    details: Use the same library in Node.js, Workers, browsers, and Bun without pulling Node-only crypto at module load time.
  - title: JWT and JWKS focused
    details: Generate keys, sign tokens, verify claims, and validate against adhoc keys or remote JWKS endpoints.
  - title: Portable curve support
    details: Keep using ES256K, Ed448, and X448 through keylab's portable fallback layer when modern jose does not cover them directly.
---

## Install

```bash
bun add keylab
```

```bash
npm install keylab
```

```bash
yarn add keylab
```

## Quick example

```ts
import {
  getKeyPair,
  signJwtWithPrivateKey,
  checkTokenValidness,
  JwtAlgorithmsEnum as Algs,
} from "keylab"

const keyPair = await getKeyPair({
  keyFormat: "jwk",
  algorithmIdentifier: Algs.ES256,
  keySize: 2048,
})

const token = await signJwtWithPrivateKey(
  { sub: "user-123", iss: "https://issuer.example" },
  Algs.ES256,
  keyPair.privateKey,
  { kid: keyPair.kid },
)

const verified = await checkTokenValidness(token, {
  adhoc: [keyPair.publicKey],
})
```
