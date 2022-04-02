import { JwtAlgorithmsEnum as Algs, JwtKeyTypes } from "../../enums";
import { importPKCS8, SignJWT } from "jose";
import { generateKeyPair } from "crypto";
import { IGetKeyPair, IKeyPair } from "./interfaces";
import * as c from "../../constants";
import { strToUint8Array } from "./utils";

export const signJwtWithPrivateKey = async (
    payload: any,
    alg: Algs,
    privateKey: string
) => {
    let privateKeyObj;
    try {
        privateKeyObj = await importPKCS8(privateKey, alg);
    } catch (e) {
        if ([Algs.HS256, Algs.HS384, Algs.HS512].includes(alg)) {
            privateKeyObj = strToUint8Array(privateKey);
        } else {
            throw new Error(`Invalid private key for algorithm ${alg}`);
        }
    }

    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg, type: JwtKeyTypes?.JWT })
        .sign(privateKeyObj);
};

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
    // TODO: implement these algorithms
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
                    ? c.namedCurves?.[algorithmIdentifier.toLowerCase()]
                    : undefined,
                modulusLength: keySize,
                publicKeyEncoding: {
                    ...c.publicKeyEncodingPem
                },
                privateKeyEncoding: {
                    ...c.privateKeyEncodingPem
                }
            },
            (err, publicKey, privateKey) => {
                if (err) return reject(err);
                resolve({ publicKey, privateKey });
            }
        );
    });
};
