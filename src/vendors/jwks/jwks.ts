import {
    createLocalJWKSet,
    importSPKI,
    jwtVerify,
    createRemoteJWKSet,
    JWK,
    JWTVerifyResult,
    JWTPayload,
    JWSHeaderParameters,
    KeyLike,
    FlattenedJWSInput,
} from "jose";
import { extractAlgFromJwtHeader } from "../jwt";
import { INVALID_PUBLIC_KEY_FORMAT } from "../../errors/messages";

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
    let jwks: (protectedHeader?: JWSHeaderParameters, token?: FlattenedJWSInput) => Promise<KeyLike> = null;
    let decoded: JWTVerifyResult<JWTPayload> = null;

    if (publicKey || opts?.adhoc) {
        let jwk: JWK = null;
        if (typeof publicKey === "string") {
            const alg = extractAlgFromJwtHeader(token);
            const keyLike = await pemToJwk(publicKey, alg);

            decoded = await jwtVerify(token, keyLike, {
                issuer: opts?.requiredIssuer,
                audience: opts?.requiredAudiences
            });
            return decoded;
        } else if (typeof publicKey === "object") {
            jwk = publicKey;
        }

        let adhocKeys = opts?.adhoc; // adhoc keys

        if (jwk) {
            jwks = createLocalJWKSet({
                keys: [jwk]
            });
        } else {
            jwks = createLocalJWKSet({
                keys: adhocKeys ? <JWK[]>adhocKeys.map((key) => {
                    return {
                        kty: key.kty,
                        use: key.use,
                        kid: key.kid,
                        e: key.e,
                        n: key.n,
                        alg: key.alg
                    };
                }): []
            });
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
        jwks = createLocalJWKSet(jwksJson as any);
    } else {
        throw new Error(INVALID_PUBLIC_KEY_FORMAT);
    }

    try {
        decoded = await jwtVerify(token, jwks, {
            issuer: opts?.requiredIssuer,
            audience: opts?.requiredAudiences
        });
    } catch (e) {
        throw new Error(e.message);
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
    return await importSPKI(pemString, algorithm);
};
