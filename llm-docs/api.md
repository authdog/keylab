# API Summary

This page is a short map of the most commonly used exports.

## Key generation

### `getKeyPair()`

Generate a key pair or symmetric key material.

Typical inputs:

- `algorithmIdentifier`
- `keyFormat`
- `keySize`

## Signing

### `signJwtWithPrivateKey()`

Sign a payload with a PEM string, JWK private key, or secret depending on the algorithm.

Useful for:

- HS-based shared-secret tokens
- RSA and EC signing
- EdDSA and portable curve signing

### `createSignedJwt()`

High-level helper that builds standard JWT claims (`iss`, `aud`, `sub`, `scp`, `nbf`, `jti`, `nonce`, `azp`) and signs with `signJwtWithPrivateKey`.

```ts
const token = await createSignedJwt(
  { custom: "data" },
  {
    algorithm: Algs.HS256,
    claims: {
      iss: "https://issuer.example",
      aud: ["web-app"],
      scp: "profile:read",
      sub: "user-123",
      nbf: Math.floor(Date.now() / 1000),
      jti: "unique-id",
      nonce: "abc123",
      azp: "client-id",
    },
    signinOptions: { secret: "my-secret", sessionDuration: 60 },
  },
)
```

## Verification

### `checkTokenValidness()`

High-level verification helper that supports:

- shared-secret validation
- adhoc in-memory public keys
- remote JWKS endpoints, cached through `JwksCache`
- scope checks with `requiredScopes`

Every algorithm goes through the same checks after its signature verifies: `exp`, `nbf`, and `requiredScopes`. A token whose `scp` claim (an array, or a space- or comma-separated string) or OAuth `scope` claim lacks a required scope raises `InsufficientScopeError`. A token with no scope claim at all fails the check too.

```ts
await checkTokenValidness(token, {
  jwksUri: "https://issuer.example/.well-known/jwks.json",
  requiredScopes: ["orders:read"],
})
```

Shared-secret tokens resolve `true` when valid and `false` for a wrong secret. An expired token or missing scopes raise an error, as on every other path.

`verifySsl` is deprecated and has no effect: `fetch` cannot turn off TLS verification portably.

### `verifyHSTokenWithSecretString()`

Validate symmetric JWTs directly from a secret string.

### `checkJwtFields()`

Validate issuer, audience, and scopes from a JWT payload.

## Parsing helpers

### `parseJwt()`

Decode JWT headers, payload, or signature sections. Raises `MalformedTokenError` for input that is not a JWT.

## JWKS helpers

### `verifyTokenWithPublicKey()`

Verify a token with a PEM key, JWK, or JWKS source. Accepts `requiredIssuer`, `requiredAudiences`, and `requiredScopes`, and enforces them for every algorithm, including ES256K, Ed448, and ML-DSA. Pass `jwksCache` to use your own `JwksCache` for `jwksUri` lookups.

### `pemToJwk()`

Convert a PEM public key into a JWK representation.

### `makePublicKey()`

Strip private fields from a JWK, returning only public-safe fields.

## Token expiration utilities

### `isTokenExpired(token)`

Returns `true` if the token's `exp` claim is in the past or missing.

```ts
import { isTokenExpired } from "keylab"

if (isTokenExpired(token)) {
  // refresh or redirect
}
```

### `getTimeToExpiry(token)`

Returns the number of seconds until the token expires. Returns `0` if already expired, `-1` if no `exp` claim.

```ts
import { getTimeToExpiry } from "keylab"

const ttl = getTimeToExpiry(token)
if (ttl < 60) {
  // proactively refresh
}
```

## JWKS Cache

### `JwksCache`

JWKS cache with configurable TTL, retry with exponential backoff, request deduplication, and key rotation detection. Verification by `jwksUri` goes through a shared default cache, so repeated verifications fetch the key set once per TTL. When a token names a `kid` the cached set lacks, the set is refetched once, at most every `minRefreshIntervalMs`.

```ts
import { JwksCache } from "keylab"

const cache = new JwksCache({
  ttlMs: 600_000,               // 10 minutes (default)
  maxRetries: 3,                // fetch attempts; 4xx other than 408/429 are not retried (default)
  timeoutMs: 5_000,             // request timeout (default)
  minRefreshIntervalMs: 30_000, // cooldown for unknown-kid refetches (default)
  onKeyRotation: (oldKids, newKids) => {
    console.log("Keys rotated", { oldKids, newKids })
  },
})

const keys = await cache.getKeys("https://issuer.example/.well-known/jwks.json")
```

Pass a cache to verification with `jwksCache`. `checkTokenValidness`, `verifyTokenWithPublicKey`, `createJwtMiddleware`, and `createJwtHandler` all accept it.

### Cache storage adapters

By default a `JwksCache` keeps entries in memory. To share key sets across processes or Worker isolates, pass a `store` that implements `IJwksCacheStore`. Each method may be synchronous or return a promise.

```ts
import { createJwtHandler, JwksCache, type IJwksCacheStore } from "keylab"

// Cloudflare Workers KV
const kvStore = (kv: KVNamespace): IJwksCacheStore => ({
  get: (key) => kv.get(key, "json"),
  set: (key, entry, ttlMs) =>
    kv.put(key, JSON.stringify(entry), { expirationTtl: Math.max(60, Math.ceil(ttlMs / 1000)) }),
  delete: (key) => kv.delete(key),
})

const handler = createJwtHandler({
  jwksUri: "https://issuer.example/.well-known/jwks.json",
  jwksCache: new JwksCache({ store: kvStore(env.JWKS_KV), keyPrefix: "jwks:" }),
})
```

Entries are plain JSON (`{ keys, kids, fetchedAt }`). `JwksCache` checks `fetchedAt` against its own TTL, so a store does not have to expire entries itself. If the store throws, the cache fetches the key set instead of failing verification. `keyPrefix` (default `"keylab:jwks:"`) namespaces the keys in a shared store. `MemoryJwksCacheStore` is the default store.

### `createJwksCache(options?)`

Factory function to create a new `JwksCache` instance.

### `clearJwksCache()`

Clear the default JWKS cache that `jwksUri` verification uses.

## JWE (JSON Web Encryption)

### `encryptJwe(plaintext, options)`

Encrypt plaintext into a JWE compact serialization string.

```ts
import { encryptJwe } from "keylab"

const jwe = await encryptJwe("sensitive data", {
  alg: "RSA-OAEP",
  enc: "A256GCM",
  key: publicKeyJwk,
  kid: "my-key-id",
})
```

### `decryptJwe(compact, options)`

Decrypt a JWE compact serialization string back to plaintext.

```ts
import { decryptJwe } from "keylab"

const { plaintext, protectedHeader } = await decryptJwe(jwe, {
  key: privateKeyJwk,
  expectedAlg: "RSA-OAEP",
})
```

Supported algorithm families:

- **RSA**: RSA-OAEP, RSA-OAEP-256, RSA1_5
- **ECDH**: ECDH-ES, ECDH-ES+A128KW, ECDH-ES+A192KW, ECDH-ES+A256KW
- **Symmetric**: dir, A128KW, A192KW, A256KW, A128GCMKW, A192GCMKW, A256GCMKW
- **Password**: PBES2-HS256+A128KW, PBES2-HS384+A192KW, PBES2-HS512+A256KW

Content encryption (`enc`) names:

- `A128GCM`, `A192GCM`, `A256GCM`
- `A128CBC-HS256`, `A192CBC-HS384`, `A256CBC-HS512`

These names are exported as `JweContentEncryption`. `enc` still accepts any string the library already accepted.

## Middleware

### `createJwtMiddleware(options)`

Express-compatible `(req, res, next)` middleware. Sets `req.auth` on success. Without `onError`, it responds 403 when `requiredScopes` are missing and 401 for any other failure.

```ts
import { createJwtMiddleware } from "keylab"

app.use(createJwtMiddleware({
  secret: "my-secret",
}))

app.get("/protected", (req, res) => {
  res.json({ user: req.auth })
})
```

### `createJwtHandler(options)`

Generic async handler for Workers, Bun, and Deno. Accepts a `Request`-like object with `headers`.

```ts
import { createJwtHandler } from "keylab"

const handler = createJwtHandler({
  jwksUri: "https://issuer.example/.well-known/jwks.json",
})

const result = await handler(request)
if (result.success) {
  // result.auth contains the verified payload
}
```

## Error classes

All error classes extend `JsonWebTokenError` (which extends `Error`):

| Class | `code` | Use case |
|---|---|---|
| `TokenExpiredError` | 401 | Token `exp` is in the past. Has `expiredAt: Date` |
| `InsufficientScopeError` | 403 | Token lacks a scope from `requiredScopes`. Has `requiredScopes` |
| `InvalidSignatureError` | 401 | Signature verification failed |
| `AlgorithmMismatchError` | 401 | Algorithm in header doesn't match expected |
| `MalformedTokenError` | 401 | Token structure is invalid |
| `JwksEndpointError` | 502 | JWKS endpoint returned non-200. Has `statusCode` |

These classes are raised for every algorithm. When one wraps an error from `jose`, the original stays on `cause`. Other claim failures (`nbf`, `iss`, `aud`) raise `JsonWebTokenError`.

```ts
import { TokenExpiredError, InvalidSignatureError } from "keylab"

try {
  await checkTokenValidness(token, { secret })
} catch (err) {
  if (err instanceof TokenExpiredError) {
    console.log("Expired at:", err.expiredAt)
  }
}
```
