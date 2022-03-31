import {
    signJwtWithSecret,
    // signJwtWithJwk,
    uint8Array2str,
    str2ToUint8Array,
    // signWithJose,
    getKeyPair
} from "./jwt-sign";
import {
    //createSignedJwt,
    readTokenHeaders
} from "./jwt";
// import { createKeyStore, generateKeyFromStore } from "../jwks";
import * as c from "../../constants";
import * as enums from "../../enums";
import { parseJwt, signJwtWithPrivateKey } from ".";
import { JwtAlgorithmsEnum } from "../../enums";

// import {generateSecret, jwtVerify} from 'jose'

// import {convertPemToJwk} from './jwt-sign'



it("jwt signin with secret", async () => {
    const token = await signJwtWithSecret(
        { sub: "12345", aud: [c.AUTHDOG_ID_ISSUER] },
        "secret"
    );
    expect(token).toBeTruthy();
    const { alg } = readTokenHeaders(token);
    expect(alg).toEqual(enums.JwtAlgorithmsEnum.HS256);
});

it("jwt created has all fields required from payload", async () => {
    // RS256
    const keyPairRS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa256",
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
        JwtAlgorithmsEnum.RS256,
        keyPairRS256.privateKey
    );

    const { iss, aud, sub, aid } = parseJwt(signedPayloadRs256);

    expect(iss).toEqual("issuer:12345");
    expect(aud).toEqual(["aud:12345"]);
    expect(sub).toEqual("sub:12345");
    expect(aid).toEqual("12345");
});

it("it converts string to uint8 and vice versa", async () => {
    const superSecret = "Lapsus$";
    const buffer: Uint8Array = str2ToUint8Array(superSecret);
    const debufferedString: string = uint8Array2str(buffer);
    expect(debufferedString).toEqual(superSecret);
});

it("generate promisified key pair - rsa", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa256",
        keySize: 4096
    });
    expect(keyPair?.publicKey).toBeTruthy();
    expect(keyPair?.privateKey).toBeTruthy();

    const keyPairRsa384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa384",
        keySize: 4096
    });

    expect(keyPairRsa384?.publicKey).toBeTruthy();
    expect(keyPairRsa384?.privateKey).toBeTruthy();

    const keyPairRsa512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa512",
        keySize: 4096
    });

    expect(keyPairRsa512?.publicKey).toBeTruthy();
    expect(keyPairRsa512?.privateKey).toBeTruthy();
});

it("generate promisified key pair - ec", async () => {
    const keyPair = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "es256",
        keySize: 4096
    });
    expect(keyPair?.publicKey).toBeTruthy();
    expect(keyPair?.privateKey).toBeTruthy();

    const keyPairEs384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "es384",
        keySize: 4096
    });

    expect(keyPairEs384?.publicKey).toBeTruthy();
    expect(keyPairEs384?.privateKey).toBeTruthy();

    const keyPairEs512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "es512",
        keySize: 4096
    });

    expect(keyPairEs512?.publicKey).toBeTruthy();
    expect(keyPairEs512?.privateKey).toBeTruthy();
});

// it("generate key pair - ps", async () => {
//     const keyPair = await getKeyPair({
//         keyFormat: "pem",
//         algorithmIdentifier: "ps256",
//         keySize: 4096
//     });

//     expect(keyPair?.publicKey).toBeTruthy();
//     expect(keyPair?.privateKey).toBeTruthy();

//     const keyPairPs384 = await getKeyPair({
//         keyFormat: "pem",
//         algorithmIdentifier: "ps384",
//         keySize: 4096
//     });

//     expect(keyPairPs384?.publicKey).toBeTruthy();
//     expect(keyPairPs384?.privateKey).toBeTruthy();

//     const keyPairPs512 = await getKeyPair({
//         keyFormat: "pem",
//         algorithmIdentifier: "ps521",
//         keySize: 4096
//     });

//     expect(keyPairPs512?.publicKey).toBeTruthy();
//     expect(keyPairPs512?.privateKey).toBeTruthy();
// });

// it("generate key pair - EdDSA", async () => {
//     const keyPair = await getKeyPair({
//         keyFormat: "pem",
//         algorithmIdentifier: "eddsa",
//         keySize: 4096
//     });
//     expect(keyPair?.publicKey).toBeTruthy();
//     expect(keyPair?.privateKey).toBeTruthy();
// });

// it("generate key pair - ed448", async () => {
//     const keyPair = await getKeyPair({
//         keyFormat: "pem",
//         algorithmIdentifier: "ed448",
//         keySize: 4096
//     });
//     expect(keyPair?.publicKey).toBeTruthy();
//     expect(keyPair?.privateKey).toBeTruthy();
// });

// it("generate key pair - x25519", async () => {
//     const keyPair = await getKeyPair({
//         keyFormat: "pem",
//         algorithmIdentifier: "x25519",
//         keySize: 4096
//     });
//     expect(keyPair?.publicKey).toBeTruthy();
//     expect(keyPair?.privateKey).toBeTruthy();
// });

// it("generate key pair - x448", async () => {
//     const keyPair = await getKeyPair({
//         keyFormat: "pem",
//         algorithmIdentifier: "x448",
//         keySize: 4096
//     });

//     expect(keyPair?.publicKey).toBeTruthy();
//     expect(keyPair?.privateKey).toBeTruthy();
// });

it("signs payload with pkcs8 private key", async () => {
    // RS256
    const keyPairRS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa256",
        keySize: 4096
    });

    const signedPayloadRs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "RS256",
        keyPairRS256.privateKey
    );

    expect(signedPayloadRs256).toBeTruthy();

    // RS384
    const keyPairRS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa384",
        keySize: 4096
    });

    const signedPayloadRs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "RS384",
        keyPairRS384.privateKey
    );

    expect(signedPayloadRs384).toBeTruthy();

    // RS512
    const keyPairRS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa512",
        keySize: 4096
    });

    const signedPayloadRs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "RS512",
        keyPairRS512.privateKey
    );

    expect(signedPayloadRs512).toBeTruthy();

    // ES256
    const keyPairES256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "es256",
        keySize: 4096
    });

    const signedPayloadEs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "ES256",
        keyPairES256.privateKey
    );

    expect(signedPayloadEs256).toBeTruthy();

    // ES384
    const keyPairES384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "es384",
        keySize: 4096
    });

    const signedPayloadEs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "ES384",
        keyPairES384.privateKey
    );

    expect(signedPayloadEs384).toBeTruthy();

    // ES512
    const keyPairES512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "es512",
        keySize: 4096
    });

    const signedPayloadEs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "ES512",
        keyPairES512.privateKey
    );

    expect(signedPayloadEs512).toBeTruthy();

    // expect(signedPayloadP256).toBeTruthy();

    // Ed25519
    // const keyPairEd25519 = await getKeyPair({
    //     keyFormat: "pem",
    //     algorithmIdentifier: "ed25519",
    //     keySize: 4096
    // });

    // const signedPayloadEd25519 = await signJwtWithPrivateKey({ urn: "urn:test:test" }, "ED25519", keyPairEd25519.privateKey);

    // console.log(signedPayloadEd25519)

    // expect(signedPayloadEd25519).toBeTruthy();

    // PS256
    // const keyPairPS256 = await getKeyPair({
    //     keyFormat: "pem",
    //     algorithmIdentifier: "ps256",
    //     keySize: 4096
    // });
});

it("signs payload with pkcs8 private key - RSA-PSS", async () => {
    // PS256
    const keyPairPS256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa-pss",
        keySize: 4096
    });

    const signedPayloadPs256 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "PS256",
        keyPairPS256.privateKey
    );

    expect(signedPayloadPs256).toBeTruthy();

    // PS384
    const keyPairPS384 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa-pss",
        keySize: 4096
    });

    const signedPayloadPs384 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "PS384",
        keyPairPS384.privateKey
    );

    expect(signedPayloadPs384).toBeTruthy();

    // PS512

    const keyPairPS512 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: "rsa-pss",
        keySize: 4096
    });

    const signedPayloadPs512 = await signJwtWithPrivateKey(
        { urn: "urn:test:test" },
        "PS512",
        keyPairPS512.privateKey
    );

    expect(signedPayloadPs512).toBeTruthy();

    // x25519: does not work
    // const keyPairX25519 = await getKeyPair({
    //     keyFormat: "pem",
    //     algorithmIdentifier: "x25519",
    //     keySize: 4096
    // });

    // const signedPayloadX25519 = await signJwtWithPrivateKey({ urn: "urn:test:test" }, "X25519", keyPairX25519.privateKey);

    // const signedPayloadX25519 = await signJwtWithPrivateKey({ urn: "urn:test:test" }, "ECDH-ES", keyPairX25519.privateKey);

    // expect(signedPayloadX25519).toBeTruthy();
});



it("convert PEM to jwk", async () => {
 
    // const secret = await generateSecret('HS256');

    // const keyPairPS256 = await getKeyPair({
    //     keyFormat: "pem",
    //     algorithmIdentifier: "rsa-pss",
    //     keySize: 4096
    // });

    // const jwk = pem2jwk(keyPairPS256.privateKey);

    // expect(jwk).toBeTruthy();

    // const privateKeyPem = await convertPemToJwk(keyPairPS256?.privateKey, "private");


    // console.log(privateKeyPem)

    
})