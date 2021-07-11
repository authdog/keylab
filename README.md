# easyjwt

easyjwt is a library aiming to create and validate JSON Web Tokens without hussle or prerequisitie cryptography knowledge.

## Install

`yarn add easyjwt`

## Usage

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