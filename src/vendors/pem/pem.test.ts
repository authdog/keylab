import { jwtVerify } from "jose";
import { JwtAlgorithmsEnum as Algs } from "../../enums";
import { pemToJwk } from "../jwks/jwks";
import { getKeyPair, signJwtWithPrivateKey } from "../jwt/jwt-sign";

it("test verify token with pem - ES256", async () => {
    const keyPairES256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.ES256,
        keySize: 4096
    });

    expect(keyPairES256?.privateKey).toBeTruthy();
    expect(keyPairES256?.publicKey).toBeTruthy();

    expect(typeof keyPairES256?.publicKey === "string");
    expect(typeof keyPairES256?.privateKey === "string");

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

    const jwk = await pemToJwk(keyPairES256?.publicKey, Algs.ES256)

    expect(
        await jwtVerify(signedPayloadEs256, jwk)
    ).toBeTruthy();
});

it("test verify token with pem - ES384", async () => {
    const keyPairES384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.ES384,
        keySize: 4096
    });

    expect(keyPairES384?.privateKey).toBeTruthy();
    expect(keyPairES384?.publicKey).toBeTruthy();

    expect(typeof keyPairES384?.publicKey === "string");
    expect(typeof keyPairES384?.privateKey === "string");

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
    const jwk = await pemToJwk(keyPairES384?.publicKey,  Algs.ES384);   
    expect(
        await jwtVerify(signedPayloadEs384, jwk)
    ).toBeTruthy();
});

it("test verify token with pem - ES512", async () => {
    const keyPairES512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.ES512,
        keySize: 4096
    });

    expect(keyPairES512?.privateKey).toBeTruthy();
    expect(keyPairES512?.publicKey).toBeTruthy();

    expect(typeof keyPairES512?.publicKey === "string");
    expect(typeof keyPairES512?.privateKey === "string");

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

    const jwk = await pemToJwk(keyPairES512?.publicKey,  Algs.ES512);   

    expect(
        await jwtVerify(signedPayloadEs512, jwk)
    ).toBeTruthy();
});


it("test verify token with pem - RS256", async () => {
    const keyPairRS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.RS256,
        keySize: 4096
    });

    expect(keyPairRS256?.privateKey).toBeTruthy();
    expect(keyPairRS256?.publicKey).toBeTruthy();

    expect(typeof keyPairRS256?.publicKey === "string");
    expect(typeof keyPairRS256?.privateKey === "string");

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

    const jwk = await pemToJwk(keyPairRS256?.publicKey,  Algs.RS256);
    expect(
        await jwtVerify(signedPayloadRs256, jwk)
    ).toBeTruthy();
});


it("test verify token with pem - RS384", async () => {
    const keyPairRS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.RS384,
        keySize: 4096
    });

    expect(keyPairRS384?.privateKey).toBeTruthy();
    expect(keyPairRS384?.publicKey).toBeTruthy();

    expect(typeof keyPairRS384?.publicKey === "string");
    expect(typeof keyPairRS384?.privateKey === "string");

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

    const jwk = await pemToJwk(keyPairRS384?.publicKey,  Algs.RS384);
    expect(
        await jwtVerify(signedPayloadRs384, jwk)
    ).toBeTruthy();
});

it("test verify token with pem - RS512", async () => {
    const keyPairRS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.RS512,
        keySize: 4096
    });

    expect(keyPairRS512?.privateKey).toBeTruthy();
    expect(keyPairRS512?.publicKey).toBeTruthy();

    expect(typeof keyPairRS512?.publicKey === "string");
    expect(typeof keyPairRS512?.privateKey === "string");

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

    const jwk = await pemToJwk(keyPairRS512?.publicKey,  Algs.RS512);
    expect(
        await jwtVerify(signedPayloadRs512, jwk)
    ).toBeTruthy();
});