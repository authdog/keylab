import * as enums from "../../enums";
import * as jwt from "jsonwebtoken";
import * as jose_ from "node-jose";

import {
    // generateKeyPair,
    // generateSecret,
    //FlattenedSign,
    importJWK,
    SignJWT
} from "jose";

import { generateKeyPair } from "crypto";

// import * as crypto from 'crypto'
// import { generateKey, generateKeyPairSync } from "crypto";

export const signJwtWithSecret = async (payload: any, secret: string) => {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: enums.JwtAlgorithmsEnum.HS256 })
        .sign(str2ToUint8Array(secret));
};

// function pubjwk(jwk) {
//     const { d, p, q, dp, dq, qi, ext, alg, ...publicJwk } = jwk
//     return publicJwk
// }

export const signJwtWithJwk = async (payload: any, jwk: jwt.Secret) => {
    return await jose_.JWS.createSign(
        {
            compact: true,
            jwk,
            fields: { typ: enums.JwtKeyTypes.JWT }
        },
        jwk
    )
        .update(JSON.stringify(payload))
        .final();
};

export const str2ToUint8Array = (str: string) => {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf;
};

export const uint8Array2str = (buf: Uint8Array) =>
    String.fromCharCode.apply(null, buf);

export const signWithJose = async () => {
    // generate key pair RSA512
    await generateKeyPair(
        "rsa",
        {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair ES256K
    // await generateKeyPair(
    //     "ec",
    //     {
    //         namedCurve: "P-256K",
    //         publicKeyEncoding: {
    //             type: "spki",
    //             format: "pem"
    //         },
    //         privateKeyEncoding: {
    //             type: "pkcs8",
    //             format: "pem"
    //         }
    //     },
    //     () => {}
    // );

    // generate key pair ES256
    await generateKeyPair(
        "ec",
        {
            namedCurve: "P-256",
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair ES384
    await generateKeyPair(
        "ec",
        {
            namedCurve: "P-384",
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair ES512
    await generateKeyPair(
        "ec",
        {
            namedCurve: "P-521",
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair RSA256
    await generateKeyPair(
        "rsa",
        {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair RSA384
    await generateKeyPair(
        "rsa",
        {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair RSA512
    await generateKeyPair(
        "rsa",
        {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair Ed25519
    await generateKeyPair(
        "ed25519",
        {
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair Ed448
    await generateKeyPair(
        "ed448",
        {
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair X25519
    await generateKeyPair(
        "x25519",
        {
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    // generate key pair X448
    await generateKeyPair(
        "x448",
        {
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },

            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {}
    );

    await generateKeyPair(
        "rsa",
        {
            modulusLength: 1024,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            }
        },
        () => {
            // sign String

            // console.log(publicKey);
            // var signerObject = createSign("RSA-SHA256");
            // signerObject.update(str);
            // var signature = signerObject.sign({key:privateKey,padding:crypto.constants.RSA_PKCS1_PSS_PADDING}, "base64");
            // console.info("signature: %s", signature);
            // //verify String
            // var verifierObject = crypto.createVerify("RSA-SHA256");
            // verifierObject.update(str);
            // var verified = verifierObject.verify({key:publicKey, padding:crypto.constants.RSA_PKCS1_PSS_PADDING}, signature, "base64");
            // console.info("is signature ok?: %s", verified);
        }
    );

    const pKey = {
        crv: "P-256",
        alg: "ES256",
        ext: false,
        x: "Sp3KpzPjwcCF04_W2GvSSf-vGDvp3Iv2kQYqAjnMB-Y",
        y: "lZmecT2quXe0i9f7b4qHvDAFDpxs0oxCoJx4tOOqsks",
        d: "hRVo5TGE_d_4tQC1KEQIlCdo9rteZmLSmaMPpFOjeDI",
        kty: "EC"
    };

    const pkeyObj = await importJWK(pKey);

    const anyTest = await new SignJWT({ test: "urn:a:b:c" })
        .setProtectedHeader({ alg: enums.JwtAlgorithmsEnum.ES256 })
        .sign(pkeyObj);

    return anyTest;
};
