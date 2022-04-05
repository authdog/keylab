import { getKeyPair, signJwtWithPrivateKey } from '../jwt/jwt-sign';
import {keyExistsInSet, verifyTokenWithPublicKey} from './jwks'


import { JwtAlgorithmsEnum as Algs} from "../../enums";
// import { default as nock } from "nock";

// import { makePublicKey, verifyRSAToken } from "./jwks";

// import * as c from "../../constants";
// import * as enums from "../../enums";
// const AUTHDOG_API_ROOT = "https://api.authdog.xyz";

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


it ("verified token with public key - es256k", async () => {

    const keyPairES256k = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256K,
        keySize: 4096
    });

    expect(keyPairES256k?.privateKey).toBeTruthy();
    expect(keyPairES256k?.publicKey).toBeTruthy();


    const signedPayloadEs256k = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.ES256K,
        keyPairES256k.privateKey,
        {
            kid: keyPairES256k?.kid
        }
    );
    expect(signedPayloadEs256k).toBeTruthy();
    // "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".".
    const verifiedEs256k = await verifyTokenWithPublicKey(signedPayloadEs256k, Algs.ES256K, keyPairES256k.publicKey);
    expect(verifiedEs256k?.payload).toEqual( { urn: 'urn:test:test', kid: keyPairES256k?.kid })
    expect(verifiedEs256k?.protectedHeader).toEqual( { alg: 'ES256K', type: 'jwt' })


})


// it("verifies correctly token with public uri", async () => {
//     const tenantUuid2 = "d84ddef4-81dd-4ce6-9594-03ac52cac367";
//     const applicationUuid2 = "b867db48-4e11-4cae-bb03-086dc97c8ddd";
//     const store = createKeyStore();
//     const exposeJwkPrivateFields = true;
//     const keyGenerated = await generateKeyFromStore(
//         store,
//         Kty["RSA"].toUpperCase(),
//         Algs.RS256,
//         exposeJwkPrivateFields
//     );
//     const regExpPathAppJwks = new RegExp(
//         `api\/${c.AUTHDOG_JWKS_API_ID}\/${tenantUuid2}\/${applicationUuid2}\/.well-known\/jwks.json*`
//     );

//     const keys = [makePublicKey(keyGenerated)];

//     const scopeNock = nock(AUTHDOG_API_ROOT)
//         .persist()
//         .get(regExpPathAppJwks)
//         .reply(200, {
//             keys
//         });

//     const payload = {
//         userId: "a88f05c2-81ae-4e1b-9860-d4ac39170bfe",
//         userName: "dbrrt"
//     };

//     const token = await generateJwtFromPayload(
//         {
//             sub: payload?.userId,
//             aud: [c.AUTHDOG_ID_ISSUER, "https://my-app.com"],
//             iss: c.AUTHDOG_ID_ISSUER,
//             scp: "user openid"
//         },
//         {
//             compact: true,
//             fields: { typ: Kty.JWT },
//             jwk: keyGenerated,
//             sessionDuration: 8 * 60 // 8 hours
//         }
//     );

//     const jwksUri = `${AUTHDOG_API_ROOT}/api/${c.AUTHDOG_JWKS_API_ID}/${tenantUuid2}/${applicationUuid2}/.well-known/jwks.json`;

//     let verified = false;

//     try {
//         verified = await verifyRSAToken(token, {
//             jwksUri
//         });
//     } catch (e) {}

//     expect(verified).toBeTruthy();

//     scopeNock.persist(false);
// });

// it("verifies token with adhoc jwk store", async () => {
//     const store = createKeyStore();
//     const exposeJwkPrivateFields = true;
//     const keyGenerated = await generateKeyFromStore(
//         store,
//         Kty.RSA.toUpperCase(),
//         Algs.RS256,
//         exposeJwkPrivateFields
//     );

//     const payload = {
//         userId: "eb13a135-b84a-400c-b590-0c44febf6c4e",
//         userName: "dbrrt"
//     };

//     const token = await generateJwtFromPayload(
//         {
//             sub: payload?.userId,
//             iss: c.AUTHDOG_ID_ISSUER,
//             scp: "user openid",
//             aud: [c.AUTHDOG_ID_ISSUER, "https://my-app.com"]
//         },
//         {
//             compact: true,
//             fields: { typ: enums.JwtKeyTypes.JWT },
//             jwk: keyGenerated,
//             sessionDuration: 8 * 60 // 8 hours
//         }
//     );

//     let verified = false;

//     try {
//         const keys: any = [makePublicKey(keyGenerated)];
//         verified = await verifyRSAToken(token, {
//             adhoc: { keys }
//         });
//     } catch (e) {}

//     expect(verified).toBeTruthy();
// });

// it("generates jwk with generateKeyFromStore", async () => {
//     const store = createKeyStore();

//     const keyRsa256 = await generateKeyFromStore(
//         store,
//         Kty["RSA"].toUpperCase(),
//         Algs.RS256,
//         true
//     );

//     expect(keyRsa256).toBeTruthy();

//     const keyRsa384 = await generateKeyFromStore(
//         store,
//         Kty.RSA,
//         Algs.RS384,
//         true
//     );

//     expect(keyRsa384).toBeTruthy();

//     const keyRsa512 = await generateKeyFromStore(
//         store,
//         Kty.RSA,
//         Algs.RS512,
//         true
//     );

//     expect(keyRsa512).toBeTruthy();

//     const keyEs256 = await generateKeyFromStore(
//         store,
//         Kty.EC,
//         Algs.ES256,
//         true
//     );

//     // console.log(keyEs256);

//     expect(keyEs256).toBeTruthy();

//     const keyEs384 = await generateKeyFromStore(
//         store,
//         Kty.EC,
//         Algs.ES384,
//         true
//     );

//     expect(keyEs384).toBeTruthy();

//     const keyEs512 = await generateKeyFromStore(
//         store,
//         Kty.EC,
//         Algs.ES512,
//         true
//     );

//     expect(keyEs512).toBeTruthy();

//     // PS256 / PS384 / PS512
//     // also valid for PS384 and PS512 as RSA-PSS is used for all of them
//     const keyPs256 = await generateKeyFromStore(
//         store,
//         Kty.RSA,
//         Algs.RSAPSS,
//         true
//     );

//     expect(keyPs256).toBeTruthy();
// });
