# keylab

[![CI](https://github.com/authdog/keylab/actions/workflows/ci.yml/badge.svg)](https://github.com/authdog/keylab/actions/workflows/ci.yml)
[![CodeQL](https://github.com/authdog/keylab/actions/workflows/codeql.yml/badge.svg)](https://github.com/authdog/keylab/actions/workflows/codeql.yml)
[![Coverage](badges/coverage.svg)](https://github.com/authdog/keylab/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/keylab.svg)](https://www.npmjs.com/package/keylab)
[![code style: biome](https://img.shields.io/badge/code_style-biome-60a5fa.svg?style=flat-square)](https://biomejs.dev/)

Create, sign, verify, and inspect JSON Web Tokens with PEM, JWK, and JWKS support. keylab runs in Node.js, Cloudflare Workers, browsers, and Bun, including portable support for curves that modern `jose` no longer handles directly.

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

## Quick start

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

Prefer JWK for cross-runtime use. PEM for `ES256K`, `Ed448`, and `X448` still needs Node.js. `ML-DSA-44`, `ML-DSA-65`, and `ML-DSA-87` are JWK only.

## Documentation

- [Getting started](docs/getting-started.md)
- [API](docs/api.md)
- [Runtime compatibility](docs/runtime-compatibility.md)
- [Portable algorithms](docs/portable-algorithms.md)
- [Migration from jsonwebtoken](docs/migration.md)
- [Changelog](CHANGELOG.md)
- [Deep wiki](https://deepwiki.com/authdog/keylab)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Report vulnerabilities privately. See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
