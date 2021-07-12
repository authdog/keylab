import { createKeyStore, generateKeyFromStore, keyExistsInSet } from "..";
import * as nock from "nock";

import { makePublicKey, verifyRSATokenWithUri } from "./jwks";
import { generateJwtFromPayload } from "../jwt/jwt";

import * as c from "../../constants";
import * as enums from "../../enums";
const AUTHDOG_API_ROOT = "https://api.authdog.xyz";

it("check if key exists in set", () => {
    const jwks = [
        {
            kty: "RSA",
            kid: "THxOr1j3MA7jcXKNCJvrqHysckPAcgma-vm0w0HPP00",
            use: "sig",
            alg: "RS256",
            e: "AQAB",
            n: "s5rjPEt0pnbEUzYKKN6BsB5OdK4P5WRnYyil-lAgySihNUr8P3qzNUcEUnMrrhd2W2M3a4DI0tfd1qWINpIjr14udvZkUV9zTeep24LwFU7JZ2NyvIO8yJ8ZXyNNhGgcW3MFKO5pcGb54Q2k0dViSWSyJJ8pzJCpsHMcUduJRooTuB9SkPwz1p14LMHJTUjdZCB1wAnjjSMmoX-9oaLHLAfSJ1laB2m4P_cZfsXZiR_uMhxoMd6JZAm3SfmoKc23UbNypDdIeUfMTj7av09nxq2V5P06wt4Hi1pEehgC9BPRfVvERW4LHtRBtRb9sBpki5AjhUcSzFgxjQlQNnLW2Q"
        }
    ];

    const exists = keyExistsInSet(
        "THxOr1j3MA7jcXKNCJvrqHysckPAcgma-vm0w0HPP00",
        jwks
    );

    expect(exists).toBeTruthy();

    const shouldNotExist = keyExistsInSet(
        "THxOr1j3MA7jcXKNCJvrqHysckPAcgma-vm0w0HPP00",
        []
    );

    expect(shouldNotExist).toBeFalsy();
});

it("verifies correctly token with public uri", async () => {
    const tenantUuid2 = "d84ddef4-81dd-4ce6-9594-03ac52cac367";
    const applicationUuid2 = "b867db48-4e11-4cae-bb03-086dc97c8ddd";
    const store = createKeyStore();
    const exposeJwkPrivateFields = true;
    const keyGenerated = await generateKeyFromStore(
        store,
        enums.JwtKeyTypes.RSA,
        enums.JwtAlgorithmsEnum.RS256,
        exposeJwkPrivateFields
    );
    const regExpPathAppJwks = new RegExp(
        `api\/${c.AUTHDOG_JWKS_API_ID}\/${tenantUuid2}\/${applicationUuid2}\/.well-known\/jwks.json*`
    );

    const scopeNock = nock(AUTHDOG_API_ROOT)
        .persist()
        .get(regExpPathAppJwks)
        .reply(200, {
            keys: [makePublicKey(keyGenerated)]
        });

    const payload = {
        userId: "a88f05c2-81ae-4e1b-9860-d4ac39170bfe",
        userName: "dbrrt"
    };

    const token = await generateJwtFromPayload(
        {
            sub: payload?.userId,
            audiences: [c.AUTHDOG_ID_ISSUER, "https://my-app.com"],
            issuer: c.AUTHDOG_ID_ISSUER,
            scopes: "user openid",
            sessionDuration: 8 * 60 // 8 hours
        },
        {
            compact: true,
            fields: { typ: enums.JwtKeyTypes.JWT },
            jwk: keyGenerated
        }
    );

    const jwksUri = `${AUTHDOG_API_ROOT}/api/${c.AUTHDOG_JWKS_API_ID}/${tenantUuid2}/${applicationUuid2}/.well-known/jwks.json`;

    let verified = false;

    try {
        verified = await verifyRSATokenWithUri(token, {
            jwksUri,
            verifySsl: false
        });
    } catch (e) {}

    expect(verified).toBeTruthy();

    scopeNock.persist(false);
});
