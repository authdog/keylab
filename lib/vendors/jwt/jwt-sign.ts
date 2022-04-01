import { JwtAlgorithmsEnum as Algs, JwtKeyTypes } from "../../enums";
import { importPKCS8, SignJWT } from "jose";
import { generateKeyPair } from "crypto";
import { IGetKeyPair, IKeyPair } from "./interfaces";

export const signJwtWithSecret = async (
    payload: any,
    alg: Algs.HS256 | Algs.HS384 | Algs.HS512,
    secret: string
) => {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg })
        .sign(str2ToUint8Array(secret));
};

export const signJwtWithPrivateKey = async (
    payload: any,
    algorithm: string,
    privateKey: string
) => {
    const privateKeyObj = await importPKCS8(privateKey, algorithm);
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: algorithm, type: JwtKeyTypes?.JWT })
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
        algType: JwtKeyTypes.RSA,
        algIds: Object.values([
            Algs?.RS256,
            Algs?.RS384,
            Algs?.RS512,
            Algs?.RSAPSS
        ])
    },
    {
        algType: JwtKeyTypes.EC,
        algIds: Object.values([
            Algs?.ES256,
            Algs?.ES384,
            Algs?.ES512,
            Algs?.EdDSA
        ])
    },
    {
        algType: JwtKeyTypes.OCTET,
        algIds: Object.values([Algs?.HS256, Algs?.HS384, Algs?.HS512])
    },
    {
        algType: JwtKeyTypes.OKP,
        algIds: Object.values([Algs?.EdDSA])
    }
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
    eddsa: "ED25519"
};

export const getKeyPair = async ({
    algorithmIdentifier,
    keySize
}: IGetKeyPair): Promise<IKeyPair> => {
    return new Promise((resolve: Function, reject: Function) => {
        let algType: any;

        algorithmsDict.map((el) => {
            if (el.algIds.includes(algorithmIdentifier)) {
                algType = el.algType;
            }
        });

        const useCurve = algType === JwtKeyTypes.EC;

        generateKeyPair(
            algType,
            {
                namedCurve: useCurve
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
