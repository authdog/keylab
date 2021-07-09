import {
    fetchJwksWithUri,
    createKeyStore,
    generateKeyFromStore,
    keyExistsInSet,
    getKeyFromSet
} from ".";
import * as nock from "nock";

import { generateJwtFromPayload } from "./jwt";

import * as c from "../constants";
import * as jwkToPem from "jwk-to-pem";
import * as jwt from "jsonwebtoken";

const tenantUuid = "d84ddef4-81dd-4ce6-9594-03ac52cac367";
const applicationUuid = "b867db48-4e11-4cae-bb03-086dc97c8ddd";
const AUTHDOG_API_ROOT = "https://api.authdog.xyz";

it("initiate properly fetchJwksWithUri", async () => {
    const store = createKeyStore();
    const keyGenerated = await generateKeyFromStore(store, "RSA256", true);
    const regExpPathAppJwks = new RegExp(
        `api\/v1\/${tenantUuid}\/${applicationUuid}\/.well-known\/jwks.json*`
    );

    nock(AUTHDOG_API_ROOT)
        .persist()
        .get(regExpPathAppJwks)
        .reply(200, {
            // TODO: hide sensitive fields from the response
            keys: [keyGenerated]
        });

    const payload = {
        userId: "a88f05c2-81ae-4e1b-9860-d4ac39170bfe",
        userName: "dbrrt"
    };

    const token = await generateJwtFromPayload(
        {
            adid: payload?.userId,
            audiences: [c.AUTHDOG_ID_ISSUER, "https://my-app.com"],
            issuer: c.AUTHDOG_ID_ISSUER,
            scopes: "user",
            sessionDuration: 8 * 60
        },
        {
            compact: true,
            fields: { typ: "jwt" },
            jwk: keyGenerated
        }
    );

    expect(token).toBeTruthy();

    const jwksResource = await fetchJwksWithUri({
        jwksUri: `${AUTHDOG_API_ROOT}/api/v1/${tenantUuid}/${applicationUuid}/.well-known/jwks.json`,
        verifySsl: false
    });

    expect(jwksResource.keys).toBeTruthy();
    expect(jwksResource.keys.length).toEqual(1);

    expect(keyExistsInSet(keyGenerated.kid, jwksResource.keys)).toBeTruthy();

    const keyFromStore = getKeyFromSet(keyGenerated.kid, jwksResource.keys);

    expect(keyFromStore);

    const publicKey = jwkToPem(keyFromStore);
    const decoded = jwt.verify(token, publicKey);

    expect(decoded?.sub).toBeTruthy();
});

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
