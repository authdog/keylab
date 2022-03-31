import * as enums from "../../enums";
import { importPKCS8, SignJWT } from "jose";
import { generateKeyPair } from "crypto";
import { IGetKeyPair, IKeyPair } from "./interfaces";


export const signJwtWithSecret = async (payload: any, secret: string) => {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: enums.JwtAlgorithmsEnum.HS256 })
        .sign(str2ToUint8Array(secret));
};

export const signJwtWithPrivateKey = async (
    payload: any,
    algorithm: string,
    privateKey: string
) => {
    const privateKeyObj = await importPKCS8(privateKey, algorithm);
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: algorithm })
        .sign(privateKeyObj);
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

const algorithmsDict = [
    {
        algType: "rsa",
        algIds: ["rsa256", "rsa384", "rsa512", "rsa-pss"]
    },
    {
        algType: "ec",
        algIds: [
            "es256",
            "es384",
            "es512",
            "eddsa"
        ]
    },
    {
        algType: "oct",
        algIds: ["H256", "H384", "H512"]
    },
    {
        algType: "okp",
        algIds: ["EdDSA"]
    },
    // TODO: handle these algorithms
    // {
    //     algType: "ed448",
    //     algIds: ["ed448"]
    // },
    // {
    //     algType: "x25519",
    //     algIds: ["x25519"]
    // },
    // {
    //     algType: "x448",
    //     algIds: ["x448"]
    // }
];

const publicKeyEncodingPem = {
    type: "spki",
    format: "pem"
};

const privateKeyEncodingPem = {
    type: "pkcs8",
    format: "pem"
};

const namedCurves = {
    es256: "P-256",
    es384: "P-384",
    es512: "P-521",
    eddsa: "Ed25519"
};

export const getKeyPair = async ({
    algorithmIdentifier,
    keySize
}: IGetKeyPair): Promise<IKeyPair> => {
    return new Promise((resolve: Function, reject: Function) => {
        let algType: any;

        algorithmsDict.map((el) => {
            if (el.algIds.includes(algorithmIdentifier.toLowerCase())) {
                algType = el.algType;
            }
        });

        const useCurve = algType === "ec"

        generateKeyPair(
            algType,
            {
                namedCurve:
                useCurve
                        ? namedCurves?.[algorithmIdentifier.toLowerCase()]
                        : undefined,
                modulusLength: keySize,
                publicKeyEncoding: {
                    ...publicKeyEncodingPem
                },
                privateKeyEncoding: {
                    ...privateKeyEncodingPem
                }
            },
            (err, publicKey, privateKey) => {
                if (err) return reject(err);
                resolve({ publicKey, privateKey });
            }
        );
    });
};
