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

## Token expiration utilities

Check if a token has expired or get time remaining:

```ts
import { isTokenExpired, getTimeToExpiry } from "keylab"

if (isTokenExpired(token)) {
  console.log("Token has expired")
}

const secondsLeft = getTimeToExpiry(token)
if (secondsLeft < 60) {
  // proactively refresh
}
```

## JWE (Encryption)

Encrypt and decrypt data using JWE compact serialization:

```ts
import { encryptJwe, decryptJwe, getKeyPair, JwtAlgorithmsEnum as Algs } from "keylab"

// Generate RSA-OAEP keys
const keys = await getKeyPair({
  algorithmIdentifier: Algs.RSA_OAEP,
  keyFormat: "jwk",
  keySize: 2048,
})

// Encrypt
const jwe = await encryptJwe("sensitive payload", {
  alg: "RSA-OAEP",
  enc: "A256GCM",
  key: keys.publicKey,
})

// Decrypt
const { plaintext } = await decryptJwe(jwe, {
  key: keys.privateKey,
  expectedAlg: "RSA-OAEP",
})
```

## JWKS Cache

Use the built-in cache for efficient JWKS endpoint access:

```ts
import { JwksCache } from "keylab"

const cache = new JwksCache({
  ttlMs: 600_000,    // cache for 10 minutes
  maxRetries: 3,      // retry failed requests
  timeoutMs: 5_000,   // 5s request timeout
  onKeyRotation: (oldKids, newKids) => {
    console.log("Key rotation detected")
  },
})

const keys = await cache.getKeys("https://issuer.example/.well-known/jwks.json")
```

## Express middleware

Protect routes with JWT verification:

```ts
import express from "express"
import { createJwtMiddleware } from "keylab"

const app = express()

app.use(createJwtMiddleware({
  jwksUri: "https://issuer.example/.well-known/jwks.json",
}))

app.get("/api/me", (req, res) => {
  res.json(req.auth)
})
```

## Workers / Bun / Deno handler

Use `createJwtHandler` for non-Express runtimes:

```ts
import { createJwtHandler } from "keylab"

const verify = createJwtHandler({
  jwksUri: "https://issuer.example/.well-known/jwks.json",
})

export default {
  async fetch(request: Request) {
    const result = await verify(request)
    if (!result.success) {
      return new Response("Unauthorized", { status: 401 })
    }
    return new Response(JSON.stringify(result.auth))
  },
}
```

## Error handling

Use specific error classes for programmatic error handling:

```ts
import { checkTokenValidness, TokenExpiredError, InvalidSignatureError } from "keylab"

try {
  const result = await checkTokenValidness(token, { secret: "my-secret" })
} catch (err) {
  if (err instanceof TokenExpiredError) {
    console.log("Token expired at:", err.expiredAt)
  } else if (err instanceof InvalidSignatureError) {
    console.log("Invalid signature")
  }
}
```
