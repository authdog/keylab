# keylab

![](https://github.com/authdog/keylab/workflows/adg-keylab-lib/badge.svg)
[![codecov](https://codecov.io/gh/authdog/keylab/branch/master/graph/badge.svg?token=6XA3OTMTAT)](https://codecov.io/gh/authdog/keylab)
[![npm version](https://badge.fury.io/js/keylab.svg)](https://badge.fury.io/js/keylab)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![bundle size](https://img.shields.io/bundlephobia/minzip/keylab?label=zipped)

Keylab is a Node.js/TypeScript library designed to simplify the creation and validation of JSON Web Tokens, eliminating the need for prior knowledge in cryptography. Built with full TypeScript support and comprehensive type exports for enhanced developer experience.

## Install

### with yarn

`yarn add keylab`

### with pnpm

`pnpm add keylab`

### with npm

`npm install keylab`

## Features

- 🔐 **Complete JWT Support**: Create, sign, verify, and validate JSON Web Tokens
- 🎯 **Full TypeScript Support**: Comprehensive type definitions for all interfaces
- 🛠️ **Multiple Algorithms**: Support for RS256, ES256, HS256, EdDSA, ES256K, and more
- 🌐 **Universal Compatibility**: Works in Node.js, Cloudflare Workers, and modern browsers
- 🔑 **Key Management**: Generate key pairs, handle JWKs, and PEM formats
- 📋 **JWKS Integration**: Built-in support for JWKS endpoints and verification
- ⚡ **Zero Dependencies**: Lightweight with minimal external dependencies
- 🔒 **Cryptographically Secure**: Built on industry-standard jose library

## TypeScript Support

Keylab is built with TypeScript and exports comprehensive type definitions for all interfaces and functions. Import types alongside functions for full type safety:

```typescript
import { 
  getKeyPair, 
  signJwtWithPrivateKey, 
  JwtAlgorithmsEnum,
  type IGetKeyPair,
  type IKeyPair,
  type IJwtTokenClaims 
} from "keylab"
```

## Get Started

### Signin a Token with a Private key

```typescript
// ES256 with TypeScript support

import {
  getKeyPair, 
  signJwtWithPrivateKey, 
  JwtAlgorithmsEnum as Algs,
  type IGetKeyPair,
  type IKeyPair
} from "keylab"

const keyPairConfig: IGetKeyPair = {
    keyFormat: "pem",
    algorithmIdentifier: Algs.ES256,
    keySize: 4096
};

const keyPairES256: IKeyPair = await getKeyPair(keyPairConfig);

const payload: Partial<IJwtTokenClaims> = {
    aid: "12345",
    sub: "sub:12345",
    iss: "issuer:12345",
    aud: ["aud:12345"],
    scp: ["a", "b:c", "d"].join(" ")
};

const signedPayloadEs256: string = await signJwtWithPrivateKey(
    payload,
    Algs.ES256,
    keyPairES256.privateKey
);

```

### Verify a token with private key (symetric)

- HS256 

```typescript

import {verifyHSTokenWithSecretString, Algs} from "keylab"

const isVerified = await verifyHSTokenWithSecretString(
    signedToken,
    SECRET_STRING,
    Algs.HS256
);
```

### Verify a token with a public OpenID endpoint (asymetric)

- ES512

```typescript
import {
  checkTokenValidness,
  type IcheckTokenValidnessCredentials
} from "keylab"

const signedPayloadEs512: string = "ey.....";
const jwksUri: string = "https://id.authdog.com/oidc/.well-known/jwks.json";

const credentials: IcheckTokenValidnessCredentials = {
    jwksUri,
    requiredIssuer: "https://id.authdog.com",
    requiredAudiences: ["your-app-id"]
};

const isValid: boolean = await checkTokenValidness(
    signedPayloadEs512,
    credentials
);

```

## Available Types

Keylab exports all TypeScript interfaces and types for comprehensive type safety:

### Core JWT Types
- `IDecodedJwt` - Structure of decoded JWT payload
- `IGetKeyPair` - Parameters for key pair generation  
- `IJwkPrivateKey` - JWK private key structure
- `IJwkPublicKey` - JWK public key structure
- `IKeyPair` - Key pair generation result

### JWT Operation Types
- `IcheckTokenValidnessCredentials` - Token validation parameters
- `ISignTokenCredentials` - Token signing credentials
- `IJwtTokenClaims` - JWT claims structure
- `IJwtTokenOpts` - JWT creation options
- `ICheckJwtFields` - JWT field validation options
- `ICreateSignedJwtOptions` - Complete JWT creation configuration

### JWKS Types
- `IJwksClient` - JWKS client configuration
- `IJwkRecordVisible` - Public JWK record structure
- `IVerifyRSATokenCredentials` - RSA token verification parameters
- `IRSAKeyStore` - RSA key store structure
- `ITokenExtractedWithPubKey` - Token extraction result

### Enums
- `JwtAlgorithmsEnum` - All supported JWT algorithms
- `JwtPublicKeyUse` - Key usage types (sig, enc)
- `JwtKeyTypes` - Key type definitions (RSA, EC, OKP, oct)
- `JwtParts` - JWT part identifiers (header, payload, signature)

## Changelog

- 0.1.34: **Major Type Export Release**
  - Comprehensive TypeScript type exports for all interfaces and functions
  - Fix dynamic require error for crypto module (bundler compatibility)
  - Enhanced developer experience with full type safety
  - Add 20+ exported interfaces including JWT, JWKS, and operation types
  - Export all enums (JwtAlgorithmsEnum, JwtKeyTypes, etc.)
  - Maintain full backward compatibility with existing code
- 0.1.33: 
  - Upgrade to jose v6 with full compatibility
  - Add support for all JOSE standard algorithms (RSA-OAEP, ECDH-ES, X25519, X448)
  - Implement Node.js crypto fallbacks for ES256K and EdDSA variants
  - Add ESM support to eliminate Vite CJS deprecation warning
  - Enhanced JWK handling with proper curve normalization
- 0.1.32: Leverage Adhoc keys
- 0.1.31: Bump jose dependency, fix fetch in Jest, enable Ed25519, Ed448
- 0.1.30: Fix support for adhoc jwks
- 0.1.29: Bug fixes and stability improvements
- 0.1.28: Performance optimizations and dependency updates
- 0.1.27: Minor bug fixes and improvements
- 0.1.26: Remove fetchJwksWithUri, remove node-fetch dependency
- 0.1.25: Bug fixes and error handling improvements
- 0.1.24: TypeScript improvements and build optimizations
- 0.1.23: Security patches and dependency updates
- 0.1.22: Performance improvements and bug fixes
- 0.1.21: Enhanced compatibility and stability fixes
- 0.1.20: Improve Cloudflare Workers compatibility for verify
- 0.1.19: Export `getKeyPair`
- 0.1.18: Export `pemToJwk`
- 0.1.17: Bug fixes and stability improvements
- 0.1.16: Enhanced error handling and validation
- 0.1.15: Build optimizations and dependency updates
- 0.1.14: Extract alg to verify token with PEM
- 0.1.13: Validate tokens signed with PEM (version 0.1.13 was skipped)
- 0.1.12: Remove `jws` from dependencies, improve compatibility with Cloudflare Workers
- 0.1.11: Add support for keyid injection in jwt header (required for Apple OAuth2.0 flow)
- 0.1.10: Bug fixes and improvements
- 0.1.9: Stability and performance improvements
- 0.1.8: Enhanced validation and error handling
- 0.1.7: Build improvements and optimizations
- 0.1.6: Bug fixes and dependency updates
- 0.1.5: Performance enhancements
- 0.1.4: Security improvements and bug fixes
- 0.1.3: Enhanced compatibility and stability
- 0.1.2: Bug fixes and improvements
- 0.1.1: Initial stability improvements
- 0.1.0: Initial release with basic JWT functionality

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://authdog.com/whitehat) details the procedure for disclosing security issues.


## References

- https://w3c.github.io/webcrypto/
- https://nodejs.org/docs/latest-v15.x/api/crypto.html

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
