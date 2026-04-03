# Getting Started

## Install

Use the package manager that fits your project:

```bash
bun add keylab
```

```bash
npm install keylab
```

```bash
yarn add keylab
```

## Generate a key pair

```ts
import { getKeyPair, JwtAlgorithmsEnum as Algs } from "keylab"

const keyPair = await getKeyPair({
  keyFormat: "jwk",
  algorithmIdentifier: Algs.ES256,
  keySize: 2048,
})
```

## Sign a token

```ts
import { signJwtWithPrivateKey, JwtAlgorithmsEnum as Algs } from "keylab"

const token = await signJwtWithPrivateKey(
  {
    sub: "user-123",
    iss: "https://issuer.example",
    aud: ["web-app"],
    scp: "profile:read",
  },
  Algs.ES256,
  keyPair.privateKey,
  { kid: keyPair.kid },
)
```

## Verify with an in-memory public key

```ts
import { checkTokenValidness } from "keylab"

const verified = await checkTokenValidness(token, {
  adhoc: [keyPair.publicKey],
})
```

## Verify with a JWKS endpoint

```ts
import { checkTokenValidness } from "keylab"

const verified = await checkTokenValidness(token, {
  jwksUri: "https://issuer.example/.well-known/jwks.json",
  requiredIssuer: "https://issuer.example",
  requiredAudiences: ["web-app"],
})
```

## When to use JWK vs PEM

- Prefer `jwk` when you want runtime portability.
- Use `pem` when you are integrating with existing Node.js or OpenSSL-based systems.
- For `ES256K`, `Ed448`, and `X448`, prefer JWK in Workers and browsers.
