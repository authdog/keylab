# easyjwt

![](https://github.com/authdog/easyjwt/workflows/adg-easyjwt-lib/badge.svg)
[![npm version](https://badge.fury.io/js/%40authdog%2Feasyjwt.svg)](https://badge.fury.io/js/%40authdog%2Feasyjwt)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![bundle size](https://img.shields.io/bundlephobia/minzip/@authdog/easyjwt?label=zipped)
<!-- [![dependencies Status](https://david-dm.org/authdog/easyjwt/status.svg)](https://david-dm.org/authdog/easyjwt)
[![devDependencies Status](https://david-dm.org/authdog/easyjwt/dev-status.svg)](https://david-dm.org/authdog/easyjwt?type=dev) -->

easyjwt is a nodejs library aiming to create and validate JSON Web Tokens without hussle or prerequisitie cryptography knowledge.

## Install

`yarn add @authdog/easyjwt`

## Usage

Creating a token:

- https://www.easyjwt.org/docs/jwt/signin-a-token

Verifying a token:

- https://www.easyjwt.org/docs/jwt/validating-a-token

## Roadmap Features

- [x] Basic readme validation info
- [x] Helpers to check issuer and audiences of a given token
- [x] Sign/Verify HS256 token
- [x] Sign/Verify RS256 token
- [x] Sign/Verify RS384 token
- [x] Sign/Verify RS512 token
- [x] Sign/Verify PS256 token
- [x] Sign/Verify PS384 token
- [x] Sign/Verify PS512 token

## Roadmap Documentation

- [x] Documentation End user *Introduction*
- [x] Documentation End user *JWT*
- [x] Translation foundations

### Next features

- [ ] Sign/Verify HS384 token 
- [ ] Sign/Verify ES256 token 
- [ ] Sign/Verify ES384 token 
- [ ] Sign/Verify ES512 token 
- [ ] Sign/Verify EdDSA token 
- [ ] Sign/Verify ES256K token 


### Roadmap Security

- [ ] Rate limiting

## Dependencies

- jsonwebtoken
- node-jose
- jwk-to-pem
- node-fetch

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://authdog.com/whitehat) details the procedure for disclosing security issues.

## Author

[Authdog Inc.](https://www.authdog.com)


## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
