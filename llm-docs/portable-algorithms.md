# Portable Algorithms

keylab includes a portable implementation layer for algorithms that are not universally supported by browser and edge runtime Web Crypto APIs.

## Which algorithms use the portable layer?

| Algorithm | Curve | Use case |
|---|---|---|
| ES256K | secp256k1 | Blockchain/DID signing (Bitcoin, Ethereum) |
| Ed448 | Ed448 | High-security EdDSA signing (448-bit) |
| X448 | X448 | Key agreement (448-bit Diffie-Hellman) |

EdDSA with Ed25519 does **not** use the portable layer — it goes through `jose` and Web Crypto directly.

## When is the portable layer used?

The portable path is activated automatically when:

1. You call `getKeyPair()` with `ES256K`, `Ed448`, or `X448`
2. You call `signJwtWithPrivateKey()` with one of these algorithms
3. You call `verifyTokenWithPublicKey()` or `checkTokenValidness()` and the token header or key material indicates one of these curves

You do not need to opt in — keylab detects the algorithm and routes accordingly.

## Implementation

The portable layer uses `@noble/curves`:

- **ES256K**: `secp256k1` from `@noble/curves/secp256k1`
- **Ed448** / **X448**: `ed448` / `x448` from `@noble/curves/ed448`

These are pure JavaScript implementations that work in every runtime without native crypto dependencies.

## Key formats

### JWK (recommended for portability)

JWK keys work in all runtimes (Node.js, Bun, Deno, Workers, browsers):

```ts
import { getKeyPair, JwtAlgorithmsEnum as Algs } from "keylab"

const es256kKeys = await getKeyPair({
  algorithmIdentifier: Algs.ES256K,
  keyFormat: "jwk",
  keySize: 256,
})
```

### PEM (Node.js only)

PEM export requires Node.js `crypto` module and will throw in Workers/browsers:

```ts
const ed448Keys = await getKeyPair({
  algorithmIdentifier: Algs.Ed448,
  keyFormat: "pem",
  keySize: 448,
})
```

## Signing

```ts
import { signJwtWithPrivateKey, JwtAlgorithmsEnum as Algs } from "keylab"

const token = await signJwtWithPrivateKey(
  { sub: "user-1", iss: "issuer" },
  Algs.ES256K,
  es256kKeys.privateKey,
  { kid: es256kKeys.kid },
)
```

## Verification

Portable algorithm tokens can be verified via any of the standard methods:

```ts
import { checkTokenValidness } from "keylab"

// Adhoc (in-memory keys)
const result = await checkTokenValidness(token, {
  adhoc: [es256kKeys.publicKey],
})

// JWKS endpoint (keys are bucketed automatically)
const result = await checkTokenValidness(token, {
  jwksUri: "https://issuer/.well-known/jwks.json",
})
```

## EdDSA detection

When using `EdDSA` as the algorithm, keylab inspects the key's `crv` field:

- `Ed25519` → standard `jose` path
- `Ed448` → portable `@noble/curves` path

This detection works for both signing and verification.
