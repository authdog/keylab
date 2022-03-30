import * as enums from "../../enums";
import * as jwt from "jsonwebtoken";
import * as jose_ from "node-jose";

import {
    // generateKeyPair,
    // generateSecret,
    //FlattenedSign,
    importJWK,
    importPKCS8,
    // importPKCS8,
    // importSPKI,
    SignJWT
} from "jose";

import { generateKeyPair, randomBytes } from "crypto";

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

// keys
type AlgorithmIdentifier =
    | "rsa256"
    | "rsa384"
    | "rsa512"
    | "es256"
    | "es384"
    | "es512"
    | "p256"
    | "p384"
    | "p521"
    // | "secp256k1"
    // | "rsassa-pss-sha256"
    // | "rsassa-pss-sha384"
    // | "rsassa-pss-sha512"
    // | "rsassa-pss-sha256-mgf1"
    // | "rsassa-pss-sha384-mgf1"
    // | "rsassa-pss-sha512-mgf1"
    // | "ecdsa-sha256"
    // | "ecdsa-sha384"
    // | "ecdsa-sha512"
    // | "ecdsa-secp256k1"
    // | "ecdsa-secp256k1-sha256"
    // | "ecdsa-secp256k1-sha384"
    // | "ecdsa-secp256k1-sha512"
    // | "ecdsa-secp256k1-sha256-mgf1"
    // | "ecdsa-secp256k1-sha384-mgf1"
    // | "ecdsa-secp256k1-sha512-mgf1"
    // | "aes128-cbc"
    // | "aes192-cbc"
    // | "aes256-cbc"
    // | "aes128-ctr"
    // | "aes192-ctr"

    | "rsa-pss"
    | "ecdsa"
    | "ecdsa-pss"
    | "ed25519"
    | "ed448"
    | "x25519"
    | "x448";

const algorithmsDict = [
    {
        algType: "rsa",
        algIds: ["rsa256", "rsa384", "rsa512", "rsa-pss"]
    },
    {
        algType: "ec",
        algIds: ["es256", "es384", "es512", "ecdsa", "ecdsa-pss"]
    },
    {
        algType: "ed25519",
        algIds: ["ed25519"]
    },
    {
        algType: "ed448",
        algIds: ["ed448"]
    },
    {
        algType: "x25519",
        algIds: ["x25519"]
    },
    {
        algType: "x448",
        algIds: ["x448"]
    }
];

export interface IGetKeyPair {
    algorithmIdentifier: AlgorithmIdentifier;
    keySize: number;
    keyFormat: "pem";
    passphrase?: string;
}

export interface IKeyPair {
    publicKey: string;
    privateKey: string;
}

const publicKeyEncodingPem = {
    type: "spki",
    format: "pem"
};

// const publicKeyEncodingJwk = {
//     type: "jwk",
//     format: "pem"
// }


const privateKeyEncodingPem = {
    type: "pkcs8",
    format: "pem"
};

const namedCurves = {
    es256: "P-256",
    es384: "P-384",
    es512: "P-521"
}

export const getKeyPair = async ({
    algorithmIdentifier,
    keySize,
    passphrase
}: IGetKeyPair): Promise<IKeyPair> => {
    return new Promise((resolve: Function, reject: Function) => {
        let alg: any;

        algorithmsDict.map((el) => {
            if (el.algIds.includes(algorithmIdentifier)) {
                alg = el.algType;
            }
        });

        generateKeyPair(
            alg,
            {
                namedCurve: alg === "ec" ? namedCurves?.[algorithmIdentifier]: undefined,
                modulusLength: keySize,
                publicKeyEncoding: {
                    ...publicKeyEncodingPem
                },
                privateKeyEncoding: {
                    ...privateKeyEncodingPem,
                    cipher: "aes-256-cbc",
                    passphrase: passphrase || randomBytes(20).toString("hex")
                }
            },
            (err, publicKey, privateKey) => {
                if (err) return reject(err);
                resolve({ publicKey, privateKey });
            }
        );
    });
};

export const signWithJose = async () => {

    // generate key pair jwk


    // const keyPair = await getKeyPair({
    //     keyFormat: "pem",
    //     algorithmIdentifier: "es512",
    //     keySize: 4096
    // });


    // const importedPublic = await importSPKI(keyPair?.publicKey, "es512");
    // console.log(importedPublic)

    // console.log(keyPair?.privateKey)

    // TODO: use not encrypted private key
    const importedPrivate = await importPKCS8(`-----BEGIN ENCRYPTED PRIVATE KEY-----
    MIIBrzBJBgkqhkiG9w0BBQ0wPDAbBgkqhkiG9w0BBQwwDgQImQO8S8BJYNACAggA
    MB0GCWCGSAFlAwQBKgQQ398SY1Y6moXTJCO0PSahKgSCAWDeobyqIkAb9XmxjMmi
    hABtlIJBsybBymdIrtPjtRBTmz+ga40KFNfKgTrtHO/3qf0wSHpWmKlQotRh6Ufk
    0VBh4QjbcNFQLzqJqblW4E3v853PK1G4OpQNpFLDLaPZLIyzxWOom9c9GXNm+ddG
    LbdeQRsPoolIdL61lYB505K/SXJCpemb1RCHO/dzsp/kRyLMQNsWiaJABkSyskcr
    eDJBZWOGQ/WJKl1CMHC8XgjqvmpXXas47G5sMSgFs+NUqVSkMSrsWMa+XkH/oT/x
    P8ze1v0RDu0AIqaxdZhZ389h09BKFvCAFnLKK0tadIRkZHtNahVWnFUks5EP3C1k
    2cQQtWBkaZnRrEkB3H0/ty++WB0owHe7Pd9GKSnTMIo8gmQzT2dfZP3+flUFHTBs
    RZ9L8UWp2zt5hNDtc82hyNs70SETaSsaiygYNbBGlVAWVR9Mp8SMNYr1kdeGRgc3
    7r5E
    -----END ENCRYPTED PRIVATE KEY-----`, "es512");
    console.log(importedPrivate)


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
