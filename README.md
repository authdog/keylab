# easyjwt

![](https://github.com/authdog/easyjwt/workflows/adg-easyjwt-lib/badge.svg)
[![npm version](https://badge.fury.io/js/%40authdog%2Feasyjwt.svg)](https://badge.fury.io/js/%40authdog%2Feasyjwt)
[![dependencies Status](https://david-dm.org/authdog/easyjwt/status.svg)](https://david-dm.org/authdog/easyjwt)
[![devDependencies Status](https://david-dm.org/authdog/easyjwt/dev-status.svg)](https://david-dm.org/authdog/easyjwt?type=dev)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![bundle size](https://img.shields.io/bundlephobia/minzip/@authdog/easyjwt?label=zipped)

easyjwt is a library aiming to create and validate JSON Web Tokens without hussle or prerequisitie cryptography knowledge.

## Install

`yarn add @authdog/easyjwt`

## Usage

### Verifying a token signed with a secret string (HS256) 

```typescript

import { checkTokenValidness } from "@authdog/easyjwt"

const myToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const initializeSession = async () => {
    let isValid: boolean = false;
    
    try {
        // !!!BEWARE NEVER EVER STORE A SIGNIN SECRET IN THE BROWSER!!!
        isValid = await checkTokenValidness(myToken, { secret: process.env.JWT_SECRET })
    } catch(e) {
        // handle exception
    }

    if (isValid) {
        // do something
    }
}

```

### Verifying a token signed with a RSA JWK (RS256) 

```typescript

import { checkTokenValidness } from "@authdog/easyjwt"

const myToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.POstGetfAytaZS82wHcjoTyoqhMyxXiWdR7Nn7A29DNSl0EiXLdwJ6xC6AfgZWF1bOsS_TuYI3OG85AmiExREkrS6tDfTQ2B3WXlrr-wp5AokiRbz3_oB4OxG-W9KcEEbDRcZc0nH3L7LzYptiy1PtAylQGxHTWZXtGz4ht0bAecBgmpdgXMguEIcoqPJ1n3pIWk_dUZegpqx0Lka21H6XxUTxiy8OcaarA8zdnPUnV6AmNP3ecFawIFYdvJB_cm-GvpCSbr8G8y_Mllj8f4x9nBH8pQux89_6gUY618iYv7tuPWBFfEbLxtF2pZS6YC1aSfLQxeNe8djT9YjpvRZA";

const initializeSession = async () => {
    let isValid: boolean = false;
    try {
        isValid = await checkTokenValidness(myToken, { jwksUri: process.env.JWKS_URI })
    } catch(e) {
        // handle exception
    }

    if (isValid) {
        // do something
    }
}

```

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
- [ ] Sign/Verify HS384 token 
- [ ] Sign/Verify ES256 token 
- [ ] Sign/Verify ES384 token 
- [ ] Sign/Verify ES512 token 
- [ ] Sign/Verify EdDSA token 
- [ ] Sign/Verify ES256K token 


## Roadmap Security

- [ ] Rate limiting

## Roadmap Documentation

- [ ] Documentation End user *Introduction*
- [ ] Documentation End user *Get Started*
- [ ] Documentation End user *API*


## Dependencies

- jsonwebtoken
- node-jose
- jwk-to-pem
- node-fetch

## References

### documentation

https://www.easyjwt.org

### typedoc

https://types.easyjwt.org

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://authdog.com/whitehat) details the procedure for disclosing security issues.

## Author

[Authdog](https://authdog.com)


## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.