import { getKeyPair, signJwtWithPrivateKey } from "./jwt-sign";
import { readTokenHeaders } from "./jwt";
import * as c from "../../constants";
import { JwtAlgorithmsEnum as Algs } from "../../enums";
import { parseJwt } from ".";
import { strToUint8Array, uint8ArrayToStr } from "./utils";
import { generateKeyPair, randomBytes } from "crypto";
import { IKeyPair } from "./interfaces";

it("jwt sign with payload fields - HS256", async () => {
    const payload = {
        sub: "12345",
        aud: [c.AUTHDOG_ID_ISSUER]
    };
    const token = await signJwtWithPrivateKey(payload, Algs.HS256, "secret");
    expect(token).toBeTruthy();
    const { alg } = readTokenHeaders(token);
    expect(alg).toEqual(Algs.HS256);
});

it("jwt sign with payload fields - HS384", async () => {
    const payload = {
        sub: "12345",
        aud: [c.AUTHDOG_ID_ISSUER]
    };
    const token = await signJwtWithPrivateKey(payload, Algs.HS384, "secret");
    expect(token).toBeTruthy();
    const { alg } = readTokenHeaders(token);
    expect(alg).toEqual(Algs.HS384);
});

it("jwt sign with payload fields - HS512", async () => {
    const payload = {
        sub: "12345",
        aud: [c.AUTHDOG_ID_ISSUER]
    };
    const token = await signJwtWithPrivateKey(payload, Algs.HS512, "secret");
    expect(token).toBeTruthy();
    const { alg } = readTokenHeaders(token);
    expect(alg).toEqual(Algs.HS512);
});

it("jwt sign with payload fields - RS256", async () => {
    // RS256
    const keyPairRS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS256,
        keySize: 4096
    });

    const signedPayloadRs256 = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(
                " "
            )
        },
        Algs.RS256,
        keyPairRS256.privateKey
    );

    const { iss, aud, sub, aid } = parseJwt(signedPayloadRs256);

    expect(iss).toEqual("issuer:12345");
    expect(aud).toEqual(["aud:12345"]);
    expect(sub).toEqual("sub:12345");
    expect(aid).toEqual("12345");
});

it("jwt sign with payload fields - RS384", async () => {
    const keyPairRS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS384,
        keySize: 4096
    });

    const signedPayloadRs384 = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(
                " "
            )
        },
        Algs.RS384,
        keyPairRS384.privateKey
    );

    const { iss, aud, sub, aid } = parseJwt(signedPayloadRs384);

    expect(iss).toEqual("issuer:12345");
    expect(aud).toEqual(["aud:12345"]);
    expect(sub).toEqual("sub:12345");
    expect(aid).toEqual("12345");
});

it("jwt sign with payload fields - RS512", async () => {
    const keyPairRS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS512,
        keySize: 4096
    });

    const signedPayloadRs512 = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(
                " "
            )
        },
        Algs.RS512,
        keyPairRS512.privateKey
    );

    const { iss, aud, sub, aid } = parseJwt(signedPayloadRs512);

    expect(iss).toEqual("issuer:12345");
    expect(aud).toEqual(["aud:12345"]);
    expect(sub).toEqual("sub:12345");
    expect(aid).toEqual("12345");
});

it("jwt sign with payload fields - ES256", async () => {
    // ES256
    const keyPairES256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES256,
        keySize: 4096
    });

    const signedPayloadEs256 = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(
                " "
            )
        },
        Algs.ES256,
        keyPairES256.privateKey
    );

    const { iss, aud, sub, aid } = parseJwt(signedPayloadEs256);

    expect(iss).toEqual("issuer:12345");
    expect(aud).toEqual(["aud:12345"]);
    expect(sub).toEqual("sub:12345");
    expect(aid).toEqual("12345");
});

it("jwt sign with payload fields - EDDSA", async () => {
    // EDDSA
    const keyPairEDDSA = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.EdDSA,
        keySize: 256
    });

    const signedPayloadEdDSA = await signJwtWithPrivateKey(
        {
            aid: "12345",
            sub: "sub:12345",
            iss: "issuer:12345",
            aud: ["aud:12345"],
            scp: [["a", "b:c", "d"].map((el: any) => el.permission?.name)].join(
                " "
            )
        },
        Algs.EdDSA,
        keyPairEDDSA.privateKey
    );

    const { iss, aud, sub, aid } = parseJwt(signedPayloadEdDSA);

    expect(iss).toEqual("issuer:12345");
    expect(aud).toEqual(["aud:12345"]);
    expect(sub).toEqual("sub:12345");
    expect(aid).toEqual("12345");
});

it("it converts string to uint8 and vice versa", async () => {
    const superSecret = "Lapsus$";
    const buffer: Uint8Array = strToUint8Array(superSecret);
    const debufferedString: string = uint8ArrayToStr(buffer);
    expect(debufferedString).toEqual(superSecret);
});

it("generate promisified key pair - rsa", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS256,
        keySize: 4096
    });
    expect(keyPair?.publicKey).toBeTruthy();
    expect(keyPair?.privateKey).toBeTruthy();

    const keyPairRsa384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS384,
        keySize: 4096
    });

    expect(keyPairRsa384?.publicKey).toBeTruthy();
    expect(keyPairRsa384?.privateKey).toBeTruthy();

    const keyPairRsa512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS512,
        keySize: 4096
    });

    expect(keyPairRsa512?.publicKey).toBeTruthy();
    expect(keyPairRsa512?.privateKey).toBeTruthy();
});

it("generate promisified key pair - ec", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES256,
        keySize: 4096
    });
    expect(keyPair?.publicKey).toBeTruthy();
    expect(keyPair?.privateKey).toBeTruthy();

    const keyPairEs384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES384,
        keySize: 4096
    });

    expect(keyPairEs384?.publicKey).toBeTruthy();
    expect(keyPairEs384?.privateKey).toBeTruthy();

    const keyPairEs512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES512,
        keySize: 4096
    });

    expect(keyPairEs512?.publicKey).toBeTruthy();
    expect(keyPairEs512?.privateKey).toBeTruthy();
});

it("signs payload with pkcs8 private key", async () => {
    // RS256
    const keyPairRS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS256,
        keySize: 4096
    });

    const signedPayloadRs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.RS256,
        keyPairRS256.privateKey
    );

    expect(signedPayloadRs256).toBeTruthy();

    // RS384
    const keyPairRS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS384,
        keySize: 4096
    });

    const signedPayloadRs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs?.RS384,
        keyPairRS384.privateKey
    );

    expect(signedPayloadRs384).toBeTruthy();

    // RS512
    const keyPairRS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RS512,
        keySize: 4096
    });

    const signedPayloadRs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.RS512,
        keyPairRS512.privateKey
    );

    expect(signedPayloadRs512).toBeTruthy();

    // ES256
    const keyPairES256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES256,
        keySize: 4096
    });

    const signedPayloadEs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.ES256,
        keyPairES256.privateKey
    );

    expect(signedPayloadEs256).toBeTruthy();

    // ES384
    const keyPairES384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES384,
        keySize: 4096
    });

    const signedPayloadEs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.ES384,
        keyPairES384.privateKey
    );

    expect(signedPayloadEs384).toBeTruthy();

    // ES512
    const keyPairES512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.ES512,
        keySize: 4096
    });

    const signedPayloadEs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.ES512,
        keyPairES512.privateKey
    );

    expect(signedPayloadEs512).toBeTruthy();
});

it("signs payload with pkcs8 private key - RSA-PSS", async () => {
    // PS256
    const keyPairPS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RSAPSS,
        keySize: 4096
    });

    const signedPayloadPs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.PS256,
        keyPairPS256.privateKey
    );

    expect(signedPayloadPs256).toBeTruthy();

    // PS384
    const keyPairPS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RSAPSS,
        keySize: 4096
    });

    const signedPayloadPs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.PS384,
        keyPairPS384.privateKey
    );

    expect(signedPayloadPs384).toBeTruthy();

    // PS512

    const keyPairPS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs?.RSAPSS,
        keySize: 4096
    });

    const signedPayloadPs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.PS512,
        keyPairPS512.privateKey
    );

    expect(signedPayloadPs512).toBeTruthy();
});

it("signs payload with pkcs8 private key - EdDSA", async () => {
    const keyPairEddsa = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.EdDSA,
        keySize: 4096
    });

    expect(keyPairEddsa?.privateKey).toBeTruthy();

    const signedPayloadEddsa = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        Algs.EdDSA,
        keyPairEddsa.privateKey
    );

    expect(signedPayloadEddsa).toBeTruthy();
});

it("signs payload with pkcs8 private key - ES256k", async () => {
    const keyPairES256k = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.ES256K,
        keySize: 4096
    });

    expect(keyPairES256k?.privateKey).toBeTruthy();
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
});


it("signs payload with pkcs8 private key - unsupported yet", async () => {

    // works but not signin
    // const keyPairEd25519 = await getKeyPair({
    //     keyFormat: "pem",
    //     algorithmIdentifier: Algs.Ed25519,
    //     keySize: 4096
    // });

    // expect(keyPairEd25519?.privateKey).toBeTruthy();

    // const keyPairX25519 = await getKeyPair({
    //     keyFormat: "pem",
    //     // @ts-ignore
    //     algorithmIdentifier: "x25519",
    //     keySize: 4096
    // });

    // expect(keyPairX25519?.privateKey).toBeTruthy();

    // const signedPayloadX25519 = await signJwtWithPrivateKey(
    //     { urn: "urn:test:test" },
    //     Algs.X25519,
    //     keyPairX25519.privateKey
    // );

    // expect(signedPayloadX25519).toBeTruthy();


})



it("experiment algorithm", async () => {
    
    const generateKey = async ({
        alg,
    }): Promise<IKeyPair> => {
        return new Promise((resolve: Function, reject: Function) => {

            generateKeyPair(alg, {
                modulusLength: 530,
                publicKeyEncoding: {
                    ...c.publicKeyEncodingPem
                },
                privateKeyEncoding: {
                  ...c.privateKeyEncodingPem
                }
              },
              (err, publicKey, privateKey) => {
                  if (err) return reject(err);
  
                  // TODO: define kid length in constants
                  const kid = randomBytes(16).toString("hex");
  
                  resolve({ publicKey, privateKey, kid });
              })

        });
    }

    const keyEd25519 = await generateKey({alg: Algs.Ed25519.toLowerCase()});
    expect(keyEd25519?.privateKey).toBeTruthy();

    const keyEd448 = await generateKey({alg: 'ed448'});
    expect(keyEd448?.privateKey).toBeTruthy();

    const keyX25519 = await generateKey({alg: 'x25519'});
    expect(keyX25519?.privateKey).toBeTruthy();

    const keyX448 = await generateKey({alg: 'x448'});
    expect(keyX448?.privateKey).toBeTruthy();


});