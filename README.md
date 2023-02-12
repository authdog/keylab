# keylab

![](https://github.com/authdog/keylab/workflows/adg-keylab-lib/badge.svg)
[![Build Status](https://travis-ci.com/authdog/keylab.svg?branch=master)](https://travis-ci.com/authdog/keylab)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/authdog/keylab/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/authdog/keylab/tree/master)
[![codecov](https://codecov.io/gh/authdog/keylab/branch/master/graph/badge.svg?token=6XA3OTMTAT)](https://codecov.io/gh/authdog/keylab)
[![npm version](https://badge.fury.io/js/keylab.svg)](https://badge.fury.io/js/keylab)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![bundle size](https://img.shields.io/bundlephobia/minzip/keylab?label=zipped)

Keylab is a Node.js library designed to simplify the creation and validation of JSON Web Tokens, eliminating the need for prior knowledge in cryptography.

## Install

### with yarn

`yarn add keylab`

### with pnpm

`pnpm add keylab`

### with npm

`npm install keylab`


## Changelog

- 0.1.11: Add support for keyid injection in jwt header (required for Apple OAuth2.0 flow)
- 0.0.0: JWT signed with a JSON Web Key can be "ad-hoc" validated
- 0.0.0: `verifyRSATokenWithUri` has been replaced with `verifyRSAToken`


## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://authdog.com/whitehat) details the procedure for disclosing security issues.


## References

- https://w3c.github.io/webcrypto/
- https://nodejs.org/docs/latest-v15.x/api/crypto.html

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
