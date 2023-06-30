import { throwJwtError } from "../../errors";
import * as c from "../../constants";
import {
    createLocalJWKSet,
    importSPKI,
    JSONWebKeySet,
    JWK,
    jwtVerify
} from "jose";
import { extractAlgFromJwtHeader } from "../jwt";

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
    adhoc?: IRSAKeyStore;
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

/**
 *
 * @param jwksUri is the endpoint to retrieve the public Json web keys
 * @param verifySsl can be used in a context where self-signed certificates are being used
 * @returns return an array with keys objects
 */
export const fetchJwksWithUri = async ({
    jwksUri,
    verifySsl = true
}): Promise<JSONWebKeySet> => {
    const fetch = require("node-fetch");
    const https = require("node:https");
    const httpsAgent = new https.Agent({
        rejectUnauthorized: verifySsl
    });
    return await fetch(jwksUri, {
        method: "GET",
        agent: httpsAgent
    })
        .then((res) => res.json())
        .catch((err) => {
            throw new Error(err.message);
        });
};

// NOT USED
/**
 *
 * @param keyId keyId to be checked
 * @param jwks JSON Web Key Set
 * @returns true if the key exists in the set passed as parameter
 */
export const keyExistsInSet = (keyId: string, jwks: IJwkRecordVisible[]) => {
    const exists = jwks.find((jwk: IJwkRecordVisible) => jwk.kid === keyId);
    return Boolean(exists);
};

/**
 *
 * @param keyId
 * @param jwks
 * @returns retrieves the key from the json web key set
 */
export const getKeyFromSet = (keyId: string, jwks: IJwkRecordVisible[]) => {
    if (keyExistsInSet(keyId, jwks)) {
        return jwks.find((jwk: IJwkRecordVisible) => jwk.kid === keyId);
    } else {
        throwJwtError(c.JWKS_MISSING_KEY_ID);
    }
};

export interface ITokenExtractedWithPubKey {
    payload: any;
    protectedHeader: any;
}

/**
 *
 * @param token token to verify
 * @param publicKey string is PEM, JWK is JSON Web Key
 * @param opts
 * @returns
 */
export const verifyTokenWithPublicKey = async (
    token: string,
    publicKey: string | JWK | null,
    opts: IVerifyRSATokenCredentials = null
): Promise<ITokenExtractedWithPubKey> => {
    let JWKS = null;
    let decoded = null;

    if (publicKey) {
        let jwk;
        if (typeof publicKey === "string") {
            const alg = extractAlgFromJwtHeader(token);
            const keyLike = await pemToJwk(publicKey, alg);

            decoded = await jwtVerify(token, keyLike, {
                issuer: opts?.requiredIssuer,
                audience: opts?.requiredAudiences
            });
            return decoded;
        } else {
            jwk = publicKey;
        }
        JWKS = createLocalJWKSet({
            keys: [jwk]
        });
    } else if (opts?.jwksUri) {
        // fetch jwk keys
        const remoteJwks: JSONWebKeySet = await fetchJwksWithUri({
            jwksUri: opts?.jwksUri
        });

        JWKS = createLocalJWKSet({
            keys: remoteJwks.keys
        });
    } else {
        throw new Error("Invalid public key format (must me JWK or JWKs URI)");
    }

    try {
        decoded = await jwtVerify(token, JWKS, {
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
