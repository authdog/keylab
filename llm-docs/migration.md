# Migration from jsonwebtoken

This guide maps the `jsonwebtoken` package API to `keylab` equivalents.

## Signing

### jsonwebtoken

```ts
import jwt from "jsonwebtoken"

const token = jwt.sign({ sub: "user-1" }, "secret", {
  algorithm: "HS256",
  expiresIn: "1h",
})
```

### keylab

```ts
import { signJwtWithPrivateKey, JwtAlgorithmsEnum as Algs } from "keylab"

const token = await signJwtWithPrivateKey(
  {
    sub: "user-1",
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
  Algs.HS256,
  "secret",
)
```

Or use the higher-level `createSignedJwt`:

```ts
import { createSignedJwt, JwtAlgorithmsEnum as Algs } from "keylab"

const token = await createSignedJwt(
  {},
  {
    algorithm: Algs.HS256,
    claims: { sub: "user-1", iss: "me", aud: ["app"], scp: "read" },
    signinOptions: { secret: "secret", sessionDuration: 60 },
  },
)
```

## Verification

### jsonwebtoken

```ts
const decoded = jwt.verify(token, "secret")
```

### keylab

```ts
import { checkTokenValidness } from "keylab"

// Symmetric
const result = await checkTokenValidness(token, { secret: "secret" })

// Asymmetric with JWKS
const result = await checkTokenValidness(token, {
  jwksUri: "https://issuer/.well-known/jwks.json",
})

// Asymmetric with adhoc keys
const result = await checkTokenValidness(token, {
  adhoc: [publicKeyJwk],
})
```

## Decoding (without verification)

### jsonwebtoken

```ts
const payload = jwt.decode(token)
const header = jwt.decode(token, { complete: true }).header
```

### keylab

```ts
import { parseJwt } from "keylab"
import { JwtParts } from "keylab"

const payload = parseJwt(token, JwtParts.PAYLOAD)
const header = parseJwt(token, JwtParts.HEADER)
```

## Error handling

### jsonwebtoken

```ts
try {
  jwt.verify(token, "secret")
} catch (err) {
  if (err instanceof jwt.TokenExpiredError) { ... }
  if (err instanceof jwt.JsonWebTokenError) { ... }
}
```

### keylab

```ts
import { TokenExpiredError, InvalidSignatureError, JsonWebTokenError } from "keylab"

try {
  await checkTokenValidness(token, { secret: "secret" })
} catch (err) {
  if (err instanceof TokenExpiredError) {
    console.log(err.expiredAt) // Date object
  }
  if (err instanceof InvalidSignatureError) { ... }
  if (err instanceof JsonWebTokenError) { ... } // catch-all
}
```

## Key differences

| Feature | jsonwebtoken | keylab |
|---|---|---|
| Async | No (sync API) | Yes (all async) |
| Algorithms | RS/HS/ES/PS | RS/HS/ES/PS + EdDSA, ES256K, Ed448, X448, ECDH-ES, AES KW, PBES2 |
| JWE | Not supported | `encryptJwe` / `decryptJwe` |
| JWKS | Requires `jwks-rsa` | Built-in with caching |
| Cross-runtime | Node.js only | Node.js, Bun, Deno, Workers, browsers |
| Middleware | Requires `express-jwt` | Built-in `createJwtMiddleware` |
| Token expiry utils | Not included | `isTokenExpired`, `getTimeToExpiry` |
| Dependencies | 0 | 2 (`jose`, `@noble/curves`) |
