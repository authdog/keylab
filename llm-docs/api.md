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

## Verification

### `checkTokenValidness()`

High-level verification helper that supports:

- shared-secret validation
- adhoc in-memory public keys
- remote JWKS endpoints
- issuer, audience, and scope checks

### `verifyHSTokenWithSecretString()`

Validate symmetric JWTs directly from a secret string.

### `checkJwtFields()`

Validate issuer, audience, and scopes from a JWT payload.

## Parsing helpers

### `parseJwt()`

Decode JWT headers, payload, or signature sections.

### `extractAlgFromJwtHeader()`

Read the `alg` value from the JWT header.

## JWKS helpers

### `verifyTokenWithPublicKey()`

Verify a token with a PEM key, JWK, or JWKS source.

### `pemToJwk()`

Convert a PEM public key into a JWK representation.
