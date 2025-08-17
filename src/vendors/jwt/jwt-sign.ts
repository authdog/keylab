/* global window crypto */
import { JwtAlgorithmsEnum as Algs, JwtKeyTypes } from "../../enums";
import { importPKCS8, importJWK, SignJWT, JWTHeaderParameters } from "jose";
import { IGetKeyPair, IKeyPair } from "./interfaces";
import * as c from "../../constants";
import { isNodeJs, strToUint8Array } from "./utils";
import { createSign, createPrivateKey, KeyObject } from "crypto";

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
    // Use JWA names for imports. For EdDSA curves always use 'EdDSA'.
    let importAlg: any = alg === Algs.EdDSA || alg === (Algs as any).Ed25519 || alg === (Algs as any).Ed448 ? Algs.EdDSA : alg;

    // Prefer Node fallback for EdDSA/ES256K to avoid subtle runtime support issues
    if (alg === Algs.EdDSA || alg === (Algs as any).Ed25519 || alg === (Algs as any).Ed448 || alg === Algs.ES256K) {
        const token = signWithNodeFallback(payload, alg, privateKey, opts, altOpts);
        if (token) return token;
    }

    if (privateKey?.kty) {
        // Some runtimes/JWKs include an incompatible "alg" parameter. Remove it to avoid v6 import errors.
        const { alg: _algIgnored, crv, ...rest } = privateKey;
        // Ensure correct crv casing for OKP and EC
        const normalizedCrv = (() => {
            const v = String(crv || "");
            if (/^ed25519$/i.test(v)) return "Ed25519";
            if (/^ed448$/i.test(v)) return "Ed448";
            if (/^secp256k1$/i.test(v)) return "secp256k1";
            if (/^p-256$/i.test(v)) return "P-256";
            if (/^p-384$/i.test(v)) return "P-384";
            if (/^p-521$/i.test(v)) return "P-521";
            return crv;
        })();
        const sanitizedJwk = crv ? { ...rest, crv: normalizedCrv } : rest;
        try {
            privateKeyObj = await importJWK(sanitizedJwk, importAlg);
        } catch (e) {
            if (alg === Algs.ES256K || alg === Algs.EdDSA) {
                // Node-crypto fallback
                const token = signWithNodeFallback(payload, alg, privateKey, opts, altOpts);
                if (token) return token;
            }
            throw e;
        }
    } else {
        try {
            privateKeyObj = await importPKCS8(privateKey, importAlg);
        } catch (e) {
            if ([Algs.HS256, Algs.HS384, Algs.HS512].includes(alg)) {
                privateKeyObj = strToUint8Array(privateKey);
            } else if (alg === Algs.ES256K || alg === Algs.EdDSA) {
                // Node-crypto fallback for ES256K (not supported by WebCrypto in many runtimes)
                const token = signWithNodeFallback(payload, alg, privateKey, opts, altOpts);
                if (token) return token;
                throw new Error(`Invalid private key for algorithm ${alg}`);
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

// --- Node-crypto fallback helpers (ES256K only) ---
const b64url = (buf: Buffer) =>
    buf
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

const derToJoseConcat = (der: Buffer, size: number) => {
    // Basic DER ECDSA signature decoding
    // DER: 0x30 len 0x02 rLen r 0x02 sLen s
    let offset = 0;
    if (der[offset++] !== 0x30) throw new Error("Invalid DER signature");
    offset++; // skip sequence length
    if (der[offset++] !== 0x02) throw new Error("Invalid DER signature");
    let rLen = der[offset++];
    let r = der.slice(offset, offset + rLen);
    offset += rLen;
    if (der[offset++] !== 0x02) throw new Error("Invalid DER signature");
    let sLen = der[offset++];
    let s = der.slice(offset, offset + sLen);

    // Remove leading zeros and pad to size
    const strip = (b: Buffer) => {
        while (b.length > 0 && b[0] === 0x00) b = b.slice(1);
        return b;
    };
    r = strip(r);
    s = strip(s);
    if (r.length > size || s.length > size) throw new Error("Invalid r/s length");
    const rPadded = Buffer.concat([Buffer.alloc(size - r.length, 0), r]);
    const sPadded = Buffer.concat([Buffer.alloc(size - s.length, 0), s]);
    return Buffer.concat([rPadded, sPadded]);
};

const signWithNodeFallback = (
    payload: any,
    alg: Algs,
    privateKey: string | any,
    opts: ISignJwtOpts,
    altOpts: any
): string | null => {
    const supportsES256K = alg === Algs.ES256K;
    const supportsEdDSA = alg === Algs.EdDSA || (Algs as any).Ed25519 === alg || (Algs as any).Ed448 === alg;
    if (!supportsES256K && !supportsEdDSA) return null;

    // Ensure we have a PEM PKCS8 or JWK private key
    let pemKey: string | undefined;
    let keyObj: KeyObject | undefined;
    if (typeof privateKey === "string") {
        try {
            keyObj = createPrivateKey(privateKey);
            pemKey = privateKey;
        } catch (_) {
            // not a PEM string we can load
        }
    } else if (privateKey?.kty) {
        try {
            keyObj = createPrivateKey({ key: privateKey, format: "jwk" as any });
            pemKey = keyObj.export({ format: "pem", type: "pkcs8" }) as unknown as string;
        } catch (e) {
            return null;
        }
    } else {
        return null;
    }

    // Build header
    const header: any = { alg: supportsES256K ? Algs.ES256K : Algs.EdDSA, type: JwtKeyTypes?.JWT };
    if (altOpts?.keyId) header.kid = altOpts.keyId;

    const headerB64 = b64url(Buffer.from(JSON.stringify(header)));
    const payloadB64 = b64url(Buffer.from(JSON.stringify({ ...payload, ...opts })));
    const signingInput = `${headerB64}.${payloadB64}`;

    let sigB64: string;
    if (supportsES256K) {
        if (!pemKey) return null;
        const signer = createSign("SHA256");
        signer.update(signingInput);
        signer.end();
        const derSig = signer.sign({ key: pemKey, dsaEncoding: "der" });
        // secp256k1 size is 32 bytes for r and s
        const joseSig = derToJoseConcat(derSig, 32);
        sigB64 = b64url(joseSig);
    } else {
        try {
            const { sign } = require("crypto");
            const rawSig: Buffer = sign(null, Buffer.from(signingInput), keyObj ?? pemKey);
            sigB64 = b64url(rawSig);
        } catch {
            return null;
        }
    }
    return `${signingInput}.${sigB64}`;
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
            Algs?.PS512,
            Algs?.RSA_OAEP,
            Algs?.RSA_OAEP_256,
            Algs?.RSA_OAEP_384,
            Algs?.RSA_OAEP_512
        ])
    },
    {
        algType: JwtKeyTypes.EC,
        algIds: Object.values([
            Algs?.ES256,
            Algs?.ES384,
            Algs?.ES512,
            Algs?.ES256K,
            Algs?.ECDH_ES,
            Algs?.ECDH_ES_A128KW,
            Algs?.ECDH_ES_A192KW,
            Algs?.ECDH_ES_A256KW
        ])
    },
    {
        algType: JwtKeyTypes.OCTET,
        algIds: Object.values([Algs?.HS256, Algs?.HS384, Algs?.HS512])
    },
    {
        algType: JwtKeyTypes.OKP,
        algIds: Object.values([Algs?.EdDSA, Algs?.Ed25519, Algs?.Ed448, Algs?.X25519, Algs?.X448])
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

            // Map algorithm identifiers to Node.js crypto algorithm names
            let algorithmForGenerate: string;
            switch (algorithmIdentifier) {
                case Algs.Ed448:
                    algorithmForGenerate = "ed448";
                    break;
                case Algs.Ed25519:
                case Algs.EdDSA:
                    algorithmForGenerate = "ed25519";
                    break;
                case Algs.X25519:
                    algorithmForGenerate = "x25519";
                    break;
                case Algs.X448:
                    algorithmForGenerate = "x448";
                    break;
                case Algs.ES256:
                case Algs.ES384:
                case Algs.ES512:
                case Algs.ES256K:
                case Algs.ECDH_ES:
                case Algs.ECDH_ES_A128KW:
                case Algs.ECDH_ES_A192KW:
                case Algs.ECDH_ES_A256KW:
                    algorithmForGenerate = "ec";
                    break;
                case Algs.RS256:
                case Algs.RS384:
                case Algs.RS512:
                case Algs.RSAPSS:
                case Algs.PS256:
                case Algs.PS384:
                case Algs.PS512:
                case Algs.RSA_OAEP:
                case Algs.RSA_OAEP_256:
                case Algs.RSA_OAEP_384:
                case Algs.RSA_OAEP_512:
                    algorithmForGenerate = "rsa";
                    break;
                default:
                    algorithmForGenerate = (algType ?? String(algorithmIdentifier).toLowerCase());
            }

            const { publicKey, privateKey } = generateKeyPairSync(algorithmForGenerate, {
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