# easyjwt

easyjwt is a library aiming to create and validate JSON Web Tokens without hussle or prerequisitie cryptography knowledge.

## Install

`yarn add easyjwt`

## Usage

### Verifying a token signed with a secret string (HS256) 

```typescript

import { checkTokenValidness } from "easyjwt"

const myToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const initializeSession = async () => {
    // server only !!!
    let isValid: boolean = false;
    
    try {
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

import { checkTokenValidness } from "easyjwt"

const myToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.POstGetfAytaZS82wHcjoTyoqhMyxXiWdR7Nn7A29DNSl0EiXLdwJ6xC6AfgZWF1bOsS_TuYI3OG85AmiExREkrS6tDfTQ2B3WXlrr-wp5AokiRbz3_oB4OxG-W9KcEEbDRcZc0nH3L7LzYptiy1PtAylQGxHTWZXtGz4ht0bAecBgmpdgXMguEIcoqPJ1n3pIWk_dUZegpqx0Lka21H6XxUTxiy8OcaarA8zdnPUnV6AmNP3ecFawIFYdvJB_cm-GvpCSbr8G8y_Mllj8f4x9nBH8pQux89_6gUY618iYv7tuPWBFfEbLxtF2pZS6YC1aSfLQxeNe8djT9YjpvRZA";

const initializeSession = async () => {
    // server only !!!
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


## Roadmap

- [ ] Validate HS256 token
- [ ] Validate RS256 token
- [ ] End user Documentation

## Dependencies

- jsonwebtoken
- node-jose
- jwk-to-pem
- node-fetch

## Credits

@dbrrt