/* global window crypto */
import { JwtAlgorithmsEnum as Algs, JwtKeyTypes } from "../../enums";
import { importPKCS8, importJWK, SignJWT, JWTHeaderParameters } from "jose";
import { IGetKeyPair, IKeyPair } from "./interfaces";
import * as c from "../../constants";
import { isNodeJs, strToUint8Array } from "./utils";

interface ISignJwtOpts {
    kid?: string;
}

export const signJwtWithPrivateKey = async (
    payload: any,
    alg: Algs,
    privateKey: string | any,
    opts: ISignJwtOpts = {},
    altOpts: any = {}
) => {
    let privateKeyObj;

    if (privateKey?.kty) {
        privateKeyObj = await importJWK(privateKey, alg);
    } else {
        try {
            privateKeyObj = await importPKCS8(privateKey, alg);
        } catch (e) {
            if ([Algs.HS256, Algs.HS384, Algs.HS512].includes(alg)) {
                privateKeyObj = strToUint8Array(privateKey);
            } else {
                throw new Error(`Invalid private key for algorithm ${alg}`);
            }
        }
    }

    let protectedHeaders: JWTHeaderParameters = {
        alg,
        type: JwtKeyTypes?.JWT
    };

    if (altOpts?.keyId) {
        protectedHeaders = { ...protectedHeaders, kid: altOpts.keyId };
    }

    return await new SignJWT({ ...payload, ...opts })
        .setProtectedHeader(protectedHeaders)
        .sign(privateKeyObj);
};

const algorithmsDict = [
    {
        algType: JwtKeyTypes.RSA,
        algIds: Object.values([
            Algs?.RS256,
            Algs?.RS384,
            Algs?.RS512,
            Algs?.RSAPSS,
            Algs?.PS256,
            Algs?.PS384,
            Algs?.PS512
        ])
    },
    {
        algType: JwtKeyTypes.EC,
        algIds: Object.values([
            Algs?.ES256,
            Algs?.ES384,
            Algs?.ES512,
            Algs?.ES256K
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
];

export const getKeyPair = async ({
    keyFormat = "jwk",
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

        const IS_NODE = isNodeJs();
        if (IS_NODE) {
            const { generateKeyPairSync, randomBytes } = require("crypto");

            const { publicKey, privateKey } = generateKeyPairSync(algType ?? algorithmIdentifier?.toLowerCase(), {
                namedCurve: useCurve
                    ? c.namedCurves?.[algorithmIdentifier.toLowerCase()]
                    : undefined,
                modulusLength: keySize,
                publicKeyEncoding: {
                    ...c.publicKeyEncodingPem,
                    format: keyFormat
                },
                privateKeyEncoding: {
                    ...c.privateKeyEncodingPem,
                    format: keyFormat
                }
            });

            const kid = randomBytes(16).toString("hex");
            return resolve({ publicKey, privateKey, kid });
        }
    });
};