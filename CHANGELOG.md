# Changelog

## 0.1.41

- Add ML-DSA-44, ML-DSA-65, and ML-DSA-87 key generation, signing, and verification as AKP JWKs
- Keep the private key as a 32-byte seed, reject PEM for these algorithms, and sign with an empty context string
- Use `jose` when the runtime can import an AKP key, and `@noble/post-quantum` otherwise, loaded only for that operation
- Export `JweContentEncryption` for A128GCM, A192GCM, A256GCM, A128CBC-HS256, A192CBC-HS384, and A256CBC-HS512, while leaving `enc` a string

## 0.1.40

- Enable TypeScript `strictNullChecks` without renaming public functions or the `*Legacy` JWKS aliases
- Replace exported `any` on JWK `ext`, claim `pld`, `jwkPrivateKey`, and `IJwtTokenOpts.jwk` with `unknown` or the existing JWK interfaces
- Define `IJwksClient`, `IJwkRecordVisible`, and `IVerifyRSATokenCredentials` once, and stop re-exporting ponyfills from the internal vendors barrel
- Keep `node:crypto` off the import path, with a load-time check and a browser-style ES256 and ES256K sign-and-verify test
- Remove unused devDependencies `@swc/core`, `raw-loader`, `ts-node`, `codecov`, and `husky`

## 0.1.36

- Switch the codebase from `pnpm` to Bun, including lockfile, CI, and local scripts
- Upgrade `jose` to `6.2.2` and add portable curve support for `ES256K`, `Ed448`, and `X448`
- Remove Node-only crypto assumptions at module load so keylab works in Node.js, Cloudflare Workers, modern browsers, and Bun
- Add Bun-compatible key generation fallbacks and runtime-aware tests for unsupported native OpenSSL algorithms

## 0.1.34

- Comprehensive TypeScript type exports for all interfaces and functions
- Fix dynamic require error for crypto module (bundler compatibility)
- Enhanced developer experience with full type safety
- Add 20+ exported interfaces including JWT, JWKS, and operation types
- Export all enums (`JwtAlgorithmsEnum`, `JwtKeyTypes`, and others)
- Maintain full backward compatibility with existing code

## 0.1.33

- Upgrade to jose v6 with full compatibility
- Add support for all JOSE standard algorithms (RSA-OAEP, ECDH-ES, X25519, X448)
- Implement Node.js crypto fallbacks for ES256K and EdDSA variants
- Add ESM support to eliminate Vite CJS deprecation warning
- Enhanced JWK handling with proper curve normalization

## 0.1.32

- Leverage adhoc keys

## 0.1.31

- Bump jose dependency, fix fetch in Jest, enable Ed25519 and Ed448

## 0.1.30

- Fix support for adhoc JWKS

## 0.1.29

- Bug fixes and stability improvements

## 0.1.28

- Performance optimizations and dependency updates

## 0.1.27

- Minor bug fixes and improvements

## 0.1.26

- Remove `fetchJwksWithUri` and the `node-fetch` dependency

## 0.1.25

- Bug fixes and error handling improvements

## 0.1.24

- TypeScript improvements and build optimizations

## 0.1.23

- Security patches and dependency updates

## 0.1.22

- Performance improvements and bug fixes

## 0.1.21

- Enhanced compatibility and stability fixes

## 0.1.20

- Improve Cloudflare Workers compatibility for verify

## 0.1.19

- Export `getKeyPair`

## 0.1.18

- Export `pemToJwk`

## 0.1.17

- Bug fixes and stability improvements

## 0.1.16

- Enhanced error handling and validation

## 0.1.15

- Build optimizations and dependency updates

## 0.1.14

- Extract `alg` to verify a token with PEM

## 0.1.13

- Validate tokens signed with PEM (version 0.1.13 was skipped)

## 0.1.12

- Remove `jws` from dependencies and improve Cloudflare Workers compatibility

## 0.1.11

- Add support for key id injection in the JWT header (required for the Apple OAuth 2.0 flow)

## 0.1.10

- Bug fixes and improvements

## 0.1.9

- Stability and performance improvements

## 0.1.8

- Enhanced validation and error handling

## 0.1.7

- Build improvements and optimizations

## 0.1.6

- Bug fixes and dependency updates

## 0.1.5

- Performance enhancements

## 0.1.4

- Security improvements and bug fixes

## 0.1.3

- Enhanced compatibility and stability

## 0.1.2

- Bug fixes and improvements

## 0.1.1

- Initial stability improvements

## 0.1.0

- Initial release with basic JWT functionality
