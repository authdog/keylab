import {
    createLocalJWKSet,
    importSPKI,
    jwtVerify,
    // createRemoteJWKSet,
    JWK,
    JWTVerifyResult,
    JWTPayload,
    JWSHeaderParameters,
    FlattenedJWSInput,
} from "jose";
import { extractAlgFromJwtHeader } from "../jwt";
import { JwtAlgorithmsEnum as Algs } from "../../enums";
import { INVALID_PUBLIC_KEY_FORMAT } from "../../errors/messages";
import { createPublicKey, createVerify, KeyObject, verify } from "crypto";

export interface IJwksClient {
    jwksUri?: string; // required for RS256
    domainUri?: string; // required when domainUri doesn't match jwksUri's host
    verifySsl?: boolean; // set it to true if you're using self-signed certificate in local environment
}

// https://datatracker.ietf.org/doc/html/rfc7517
export interface IJwkRecordVisible {
    kty: string; // key type
    kid: string; // key id
    use: string; // public key use
    alg: string; // algorithm
    e: string; // exponent
    n: string; // modulus
}

export interface IVerifyRSATokenCredentials {
    jwksUri?: string;
    verifySsl?: boolean;
    requiredAudiences?: string[];
    requiredIssuer?: string;
    requiredScopes?: string[];
    adhoc?: [IJwkRecordVisible];
}

export interface IRSAKeyStore {
    keys: [IJwkRecordVisible];
}

// TODO: add proper type for key parameter
/**
 * @param privateKey is a JSON Web Key object with private fields
 * @returns public key (without private fields)
 * will remove private fields from jwk, in order to make sure a jwk is exposable publicly
 */
export const makePublicKey = (privateKey: any) => {
    const publicKey = {
        kty: privateKey.kty,
        kid: privateKey.kid,
        use: privateKey.sig,
        alg: privateKey.alg,
        x5c: privateKey.x5c,
        x5t: privateKey.x5t,
        x5u: privateKey.x5u,
        key_ops: privateKey.key_ops,
        n: privateKey.n,
        e: privateKey.e,
        key_id: privateKey.key_id
    };

    Object.keys(publicKey).forEach((key) => {
        if (publicKey[key] === undefined) {
            delete publicKey[key];
        }
    });

    return publicKey;
};

export interface ITokenExtractedWithPubKey {
    payload: any;
    protectedHeader: any;
}

/**
 *
 * @param token token to verify
 * @param publicKey string is PEM, JWK is JSON Web Key
 * @param opts verifyRSA Token Credentials
 * @returns decoded payload if token is valid
 */
export const verifyTokenWithPublicKey = async (
    token: string,
    publicKey: string | JWK | null,
    opts: IVerifyRSATokenCredentials = null,
): Promise<ITokenExtractedWithPubKey> => {
    let jwks: (protectedHeader?: JWSHeaderParameters, token?: FlattenedJWSInput) => Promise<CryptoKey> = null;
    let decoded: JWTVerifyResult<JWTPayload> = null;
    let candidateKeys: any[] = [];

    if (publicKey || opts?.adhoc) {
        let jwk: JWK = null;
        if (typeof publicKey === "string") {
            let alg = extractAlgFromJwtHeader(token);
            // Use EdDSA for Ed25519/Ed448 imports
            if (alg === (Algs as any)?.Ed25519 || alg === (Algs as any)?.Ed448) alg = "EdDSA" as any;
            
            // For ES256K or other unsupported algorithms, go straight to Node fallback
            if (alg === Algs.ES256K) {
                const [h, p, s] = token.split(".");
                const signingInput = `${h}.${p}`;
                const derSig = joseConcatToDer(Buffer.from(s, "base64url"));
                const verifier = createVerify("SHA256");
                verifier.update(signingInput);
                verifier.end();
                const ok = verifier.verify({ key: publicKey, dsaEncoding: "der" }, derSig);
                if (!ok) throw new Error("Invalid signature");
                const payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
                const protectedHeaderRaw = JSON.parse(Buffer.from(h, "base64url").toString("utf8"));
                const protectedHeader = { ...protectedHeaderRaw, typ: protectedHeaderRaw.typ || "JWT" };
                return { payload, protectedHeader } as any;
            }
            
            try {
                const keyLike = await pemToJwk(publicKey, alg);
                decoded = await jwtVerify(token, keyLike, {
                    issuer: opts?.requiredIssuer,
                    audience: opts?.requiredAudiences
                });
                return decoded;
            } catch (_) {
                // Node verification fallback for algorithms not supported by importSPKI (e.g., Ed448)
                const [h, p, s] = token.split(".");
                const signingInput = `${h}.${p}`;
                const ok = verify(null, Buffer.from(signingInput), createPublicKey(publicKey), Buffer.from(s, "base64url"));
                if (!ok) throw _;
                const payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
                const protectedHeaderRaw = JSON.parse(Buffer.from(h, "base64url").toString("utf8"));
                const protectedHeader = { ...protectedHeaderRaw, typ: protectedHeaderRaw.typ || "JWT" };
                return { payload, protectedHeader } as any;
            }
        } else if (typeof publicKey === "object") {
            // Drop conflicting alg on JWKs to avoid jose v6 errors and normalize crv
            const { alg: _algIgnored, crv, ...rest } = publicKey as any;
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
            jwk = (crv ? { ...rest, crv: normalizedCrv } : rest) as any;
        }

        let adhocKeys = opts?.adhoc; // adhoc keys

        if (jwk) {
            jwks = createLocalJWKSet({
                keys: [jwk]
            });
            candidateKeys = [jwk as any];
        } else {
            jwks = createLocalJWKSet({
                keys: adhocKeys ? <JWK[]>adhocKeys.map((key) => {
                    const { alg: _algIgnored2, ...rest } = key as any;
                    return rest as any;
                }): []
            });
            candidateKeys = adhocKeys as any || [];
        }

    } else if (opts?.jwksUri) {
        // Fetch JWKS over HTTP(S) using global fetch so tests can mock easily
        const response = await (globalThis as any).fetch(opts.jwksUri, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "authdog-agent",
                ...(opts?.requiredIssuer ? { "X-Issuer": opts.requiredIssuer } : {})
            }
        });
        if (!response?.ok) {
            throw new Error('Expected 200 OK from the JSON Web Key Set HTTP response');
        }
        const jwksJson = await response.json();
        // Sanitize alg field from fetched JWKs which can cause v6 errors
        const sanitized = {
            keys: Array.isArray((jwksJson as any)?.keys)
                ? (jwksJson as any).keys.map((k: any) => {
                      const { alg: _algIgnored, crv, ...rest } = k || {};
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
                      return crv ? { ...rest, crv: normalizedCrv } : rest;
                  })
                : []
        } as any;
        jwks = createLocalJWKSet(sanitized);
        candidateKeys = sanitized.keys as any;
    } else {
        throw new Error(INVALID_PUBLIC_KEY_FORMAT);
    }

    try {
        decoded = await jwtVerify(token, jwks, {
            issuer: opts?.requiredIssuer,
            audience: opts?.requiredAudiences
        });
    } catch (e) {
        // Attempt Node-crypto fallbacks for ES256K and Ed448
        const headerB64 = token.split(".")[0];
        const payloadB64 = token.split(".")[1];
        const sigB64 = token.split(".")[2];
        const protectedHeader = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
        const signingInput = `${headerB64}.${payloadB64}`;

        const alg = protectedHeader?.alg as string;

        const getFirstMatchingJwk = (): any => {
            if (publicKey && typeof publicKey === "object") return publicKey;
            const keysArr: any[] = candidateKeys || [];
            if (alg === Algs.ES256K) {
                return keysArr.find((k) => k.kty === "EC" && /secp256k1/i.test(k.crv || ""));
            }
            if (alg === Algs.EdDSA) {
                // prefer Ed448
                return keysArr.find((k) => /Ed448/i.test(k.crv || "")) || keysArr.find((k) => /Ed25519/i.test(k.crv || ""));
            }
            return undefined;
        };

        const jwkForFallback = getFirstMatchingJwk();

        const verifyWithNode = (): boolean => {
            try {
                if (alg === Algs.ES256K) {
                    // ES256K: ecdsa with sha256, signature provided is JOSE (r||s), convert to DER
                    const publicKeyPem = typeof publicKey === "string" ? publicKey : createPublicKey({ key: jwkForFallback, format: "jwk" as any }).export({ format: "pem", type: "spki" }) as unknown as string;
                    const derSig = joseConcatToDer(Buffer.from(sigB64, "base64url"));
                    const verifier = createVerify("SHA256");
                    verifier.update(signingInput);
                    verifier.end();
                    return verifier.verify({ key: publicKeyPem, dsaEncoding: "der" }, derSig);
                }
                if (alg === Algs.EdDSA) {
                    const keyObj: KeyObject = typeof publicKey === "string" ? createPublicKey(publicKey) : createPublicKey({ key: jwkForFallback, format: "jwk" as any });
                    return verify(null, Buffer.from(signingInput), keyObj, Buffer.from(sigB64, "base64url"));
                }
            } catch (_) {}
            return false;
        };

        const ok = verifyWithNode();
        if (!ok) {
            const msg = (e as any)?.message || String(e);
            if (/Invalid or unsupported JWK "alg"/i.test(msg)) {
                throw new Error("no applicable key found in the JSON Web Key Set");
            }
            throw new Error(msg);
        }

        // Build decoded result manually
        const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
        return {
            payload,
            protectedHeader
        } as any;
    }

    return decoded;
};

/**
 *
 * @param pemString
 * @param algorithm
 * @returns
 */
export const pemToJwk = async (pemString: string, algorithm: string) => {
    // jose v6 expects JWA identifiers here (e.g., RS256, ES256, EdDSA)
    try {
        return await importSPKI(pemString, algorithm === "Ed25519" || algorithm === "Ed448" ? "EdDSA" : algorithm);
    } catch (e) {
        // Some algorithms like ES256K may not be supported by importSPKI in all environments
        // This will be handled by Node-crypto fallbacks in the calling code
        throw e;
    }
};

// Convert JOSE r||s signature (64 bytes) to DER encoded ECDSA signature
const joseConcatToDer = (jose: Buffer): Buffer => {
    const size = jose.length / 2;
    const r = jose.slice(0, size);
    const s = jose.slice(size);
    const toUnsigned = (buf: Buffer) => {
        let i = 0;
        while (i < buf.length && buf[i] === 0) i++;
        let out = buf.slice(i);
        if (out[0] & 0x80) out = Buffer.concat([Buffer.from([0]), out]);
        return out.length === 0 ? Buffer.from([0]) : out;
    };
    const rU = toUnsigned(r);
    const sU = toUnsigned(s);
    const sequenceLen = 2 + rU.length + 2 + sU.length;
    return Buffer.concat([
        Buffer.from([0x30, sequenceLen, 0x02, rU.length]),
        rU,
        Buffer.from([0x02, sU.length]),
        sU,
    ]);
};
