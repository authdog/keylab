import { getKeyPair, signJwtWithPrivateKey } from "../jwt/jwt-sign";
import { keyExistsInSet, verifyTokenWithPublicKey } from "./jwks";

import { JwtAlgorithmsEnum as Algs, JwtKeyTypes as Kty } from "../../enums";
import { default as nock } from "nock";

import * as c from "../../constants";
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

it("verifies token with public key - es256k", async () => {
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
    const verifiedEs256k = await verifyTokenWithPublicKey(
        signedPayloadEs256k,
        keyPairES256k.publicKey
    );
    expect(verifiedEs256k?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairES256k?.kid
    });
    expect(verifiedEs256k?.protectedHeader).toEqual({
        alg: "ES256K",
        type: Kty.JWT
    });
});

it("verifies token with public key - rs256", async () => {
    const keyPairRS256 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.RS256,
        keySize: 4096
    });

    expect(keyPairRS256?.privateKey).toBeTruthy();
    expect(keyPairRS256?.publicKey).toBeTruthy();

    const signedPayloadRs256 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.RS256,
        keyPairRS256.privateKey,
        {
            kid: keyPairRS256?.kid
        }
    );
    expect(signedPayloadRs256).toBeTruthy();
    const verifiedRs256 = await verifyTokenWithPublicKey(
        signedPayloadRs256,
        keyPairRS256.publicKey
    );
    expect(verifiedRs256?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairRS256?.kid
    });
    expect(verifiedRs256?.protectedHeader).toEqual({
        alg: Algs.RS256,
        type: Kty.JWT
    });
});

it("verifies token with public key - rs384", async () => {
    const keyPairRS384 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.RS384,
        keySize: 4096
    });

    expect(keyPairRS384?.privateKey).toBeTruthy();
    expect(keyPairRS384?.publicKey).toBeTruthy();

    const signedPayloadRs384 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.RS384,
        keyPairRS384.privateKey,
        {
            kid: keyPairRS384?.kid
        }
    );
    expect(signedPayloadRs384).toBeTruthy();
    const verifiedRs384 = await verifyTokenWithPublicKey(
        signedPayloadRs384,
        keyPairRS384.publicKey
    );
    expect(verifiedRs384?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairRS384?.kid
    });
    expect(verifiedRs384?.protectedHeader).toEqual({
        alg: Algs?.RS384,
        type: Kty.JWT
    });
});

it("verifies token with public key - rs512", async () => {
    const keyPairRS512 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.RS512,
        keySize: 4096
    });

    expect(keyPairRS512?.privateKey).toBeTruthy();
    expect(keyPairRS512?.publicKey).toBeTruthy();

    const signedPayloadRs512 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.RS512,
        keyPairRS512.privateKey,
        {
            kid: keyPairRS512?.kid
        }
    );
    expect(signedPayloadRs512).toBeTruthy();
    const verifiedRs512 = await verifyTokenWithPublicKey(
        signedPayloadRs512,
        keyPairRS512.publicKey
    );
    expect(verifiedRs512?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairRS512?.kid
    });
    expect(verifiedRs512?.protectedHeader).toEqual({
        alg: Algs?.RS512,
        type: Kty.JWT
    });
});

it("verifies token with public key - ps256", async () => {
    const keyPairPS256 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.PS256,
        keySize: 4096
    });

    expect(keyPairPS256?.privateKey).toBeTruthy();
    expect(keyPairPS256?.publicKey).toBeTruthy();

    const signedPayloadPs256 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.PS256,
        keyPairPS256.privateKey,
        {
            kid: keyPairPS256?.kid
        }
    );
    expect(signedPayloadPs256).toBeTruthy();
    const verifiedPs256 = await verifyTokenWithPublicKey(
        signedPayloadPs256,
        keyPairPS256.publicKey
    );
    expect(verifiedPs256?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairPS256?.kid
    });
    expect(verifiedPs256?.protectedHeader).toEqual({
        alg: Algs?.PS256,
        type: Kty.JWT
    });
});

it("verifies token with public key - ps384", async () => {
    const keyPairPS384 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.PS384,
        keySize: 4096
    });

    expect(keyPairPS384?.privateKey).toBeTruthy();
    expect(keyPairPS384?.publicKey).toBeTruthy();

    const signedPayloadPs384 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.PS384,
        keyPairPS384.privateKey,
        {
            kid: keyPairPS384?.kid
        }
    );
    expect(signedPayloadPs384).toBeTruthy();
    const verifiedPs384 = await verifyTokenWithPublicKey(
        signedPayloadPs384,
        keyPairPS384.publicKey
    );
    expect(verifiedPs384?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairPS384?.kid
    });
    expect(verifiedPs384?.protectedHeader).toEqual({
        alg: Algs?.PS384,
        type: Kty.JWT
    });
});

it("verifies token with public key - ps512", async () => {
    const keyPairPS512 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.PS512,
        keySize: 4096
    });

    expect(keyPairPS512?.privateKey).toBeTruthy();
    expect(keyPairPS512?.publicKey).toBeTruthy();

    const signedPayloadPs512 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.PS512,
        keyPairPS512.privateKey,
        {
            kid: keyPairPS512?.kid
        }
    );
    expect(signedPayloadPs512).toBeTruthy();
    const verifiedPs512 = await verifyTokenWithPublicKey(
        signedPayloadPs512,
        keyPairPS512.publicKey
    );
    expect(verifiedPs512?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairPS512?.kid
    });
    expect(verifiedPs512?.protectedHeader).toEqual({
        alg: Algs?.PS512,
        type: Kty.JWT
    });
});

it("verifies token with public key - ES256", async () => {
    const keyPairES256 = await getKeyPair({
        keyFormat: "jwk",
        algorithmIdentifier: Algs.ES256,
        keySize: 4096
    });

    expect(keyPairES256?.privateKey).toBeTruthy();
    expect(keyPairES256?.publicKey).toBeTruthy();

    const signedPayloadEs256 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.ES256,
        keyPairES256.privateKey,
        {
            kid: keyPairES256?.kid
        }
    );
    expect(signedPayloadEs256).toBeTruthy();
    const verifiedEs256 = await verifyTokenWithPublicKey(
        signedPayloadEs256,
        keyPairES256.publicKey
    );
    expect(verifiedEs256?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairES256?.kid
    });
    expect(verifiedEs256?.protectedHeader).toEqual({
        alg: Algs?.ES256,
        type: Kty.JWT
    });
});

it("verifies token with public key - ES384", async () => {
    const keyPairES384 = await getKeyPair({
        algorithmIdentifier: Algs.ES384,
        keySize: 4096
    });

    expect(keyPairES384?.privateKey).toBeTruthy();
    expect(keyPairES384?.publicKey).toBeTruthy();

    const signedPayloadEs384 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.ES384,
        keyPairES384.privateKey,
        {
            kid: keyPairES384?.kid
        }
    );
    expect(signedPayloadEs384).toBeTruthy();
    const verifiedEs384 = await verifyTokenWithPublicKey(
        signedPayloadEs384,
        keyPairES384.publicKey
    );
    expect(verifiedEs384?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairES384?.kid
    });
    expect(verifiedEs384?.protectedHeader).toEqual({
        alg: Algs?.ES384,
        type: Kty.JWT
    });
});

it("verifies token with public key - ES512", async () => {
    const keyPairES512 = await getKeyPair({
        algorithmIdentifier: Algs.ES512,
        keySize: 4096
    });

    expect(keyPairES512?.privateKey).toBeTruthy();
    expect(keyPairES512?.publicKey).toBeTruthy();

    const signedPayloadEs512 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.ES512,
        keyPairES512.privateKey,
        {
            kid: keyPairES512?.kid
        }
    );
    expect(signedPayloadEs512).toBeTruthy();
    const verifiedEs512 = await verifyTokenWithPublicKey(
        signedPayloadEs512,
        keyPairES512.publicKey
    );
    expect(verifiedEs512?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairES512?.kid
    });
    expect(verifiedEs512?.protectedHeader).toEqual({
        alg: Algs?.ES512,
        type: Kty.JWT
    });
});


it("verifies token with public key - EdDSA", async () => {

    const keyPairEDDSA = await getKeyPair({
        algorithmIdentifier: Algs.EdDSA,
        keySize: 4096
    });

    expect(keyPairEDDSA?.privateKey).toBeTruthy();

    const signedPayloadEdDSA = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.EdDSA,
        keyPairEDDSA.privateKey,
        {
            kid: keyPairEDDSA?.kid
        }
    );

    expect(signedPayloadEdDSA).toBeTruthy();


    const verifiedEdDSA = await verifyTokenWithPublicKey(
        signedPayloadEdDSA,
        keyPairEDDSA.publicKey
    );

    expect(verifiedEdDSA?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairEDDSA?.kid
    });

    expect(verifiedEdDSA?.protectedHeader).toEqual({
        alg: Algs?.EdDSA,
        type: Kty.JWT
    });
})



it("THROWS an error: verifies token with public key - ES256k / pem", async () => {
    const keyPairES256k = await getKeyPair({
        keyFormat: "pem",
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

    await expect(
        verifyTokenWithPublicKey(signedPayloadEs256k, keyPairES256k.publicKey)
    ).rejects.toThrow("JSON Web Key Set malformed");
});

it("verifies correctly token with public uri", async () => {
    const tenantUuid2 = "d84ddef4-81dd-4ce6-9594-03ac52cac367";
    const applicationUuid2 = "b867db48-4e11-4cae-bb03-086dc97c8ddd";
    const keyPairES512 = await getKeyPair({
        algorithmIdentifier: Algs.ES512,
        keySize: 4096
    });

    const regExpPathAppJwks = new RegExp(
        `api\/${c.AUTHDOG_JWKS_API_ID}\/${tenantUuid2}\/${applicationUuid2}\/.well-known\/jwks.json*`
    );

    const keys = [keyPairES512.publicKey];

    const scopeNock = nock(AUTHDOG_API_ROOT)
        .persist()
        .get(regExpPathAppJwks)
        .reply(200, {
            keys
        });

    const signedPayloadEs512 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.ES512,
        keyPairES512.privateKey,
        {
            kid: keyPairES512?.kid
        }
    );

    const jwksUri = `${AUTHDOG_API_ROOT}/api/${c.AUTHDOG_JWKS_API_ID}/${tenantUuid2}/${applicationUuid2}/.well-known/jwks.json`;

    let verified = null;

    try {
        verified = await verifyTokenWithPublicKey(signedPayloadEs512, null, {
            jwksUri
        });
    } catch (e) {}

    expect(verified?.protectedHeader).toEqual({ alg: "ES512", type: "jwt" });
    expect(verified?.payload).toEqual({
        urn: "urn:test:test",
        kid: keyPairES512?.kid
    });

    scopeNock.persist(false);
});
