import { default as fetch } from "node-fetch";
import * as https from "https";
import * as jose from "node-jose";
import * as jwkToPem from "jwk-to-pem";
import * as jwt from "jsonwebtoken";

import { IJwkRecordVisible, IVerifyRSATokenCredentials } from "./jwks.d";
import { readTokenHeaders } from "../jwt";
import { throwJwtError } from "../../errors";
import * as enums from "../../enums";
import * as c from "../../constants";
import { IDecodedJwt } from "../jwt/jwt.d";

/**
 *
 * @returns new JWK store
 */
export const createKeyStore = () => {
    return jose.JWK.createKeyStore();
};

export const generateKeyFromStore: any = async (
    store: jose.JWK.KeyStore,
    keyType: enums.JwtKeyTypes,
    algorithm: enums.JwtAlgorithmsEnum,
    exposePrivateFields: boolean = false
) => {
    const generatedKey = await store.generate(keyType, 2048, {
        // jwa: https://datatracker.ietf.org/doc/html/rfc7518
        alg: algorithm,
        // https://datatracker.ietf.org/doc/html/rfc7517#section-4.3
        // The "use" and "key_ops" JWK members SHOULD NOT be used together;
        use: enums.JwtPublicKeyUse.SIGNATURE
    });
    return generatedKey.toJSON(exposePrivateFields);
};

// TODO
/**
 * will remove private fields from jwk, in order to make sure a jwk is exposable publicly
 */
export const makeKeyExposable = (key: any) => {
    // "kty":"RSA","kid":"LtQ8v6tdhTycscqav6FsIqjmdUpHNx0dli_q17A4lek","use":"sig","alg":"RS256","x5c":"","x5t":"","x5u":"","key_ops":"","n":"dVJSTFFEcEpPc01xS0E4eUtadlpSTUNUNXhWSjBodnZfd2w1Vm1qeGhrX1RNbTh1ZGdwdnBYYWRYeU5WSGxwQTVzdzdGOEFFWFBaUGFZY1VuQXhpQW0xUTAzUzBLWkJNMWRQTjRaY2JnX1pOcjFJRG8zRDJzMVlHTjlGaTFEUnJjVXg2THgwSXgyRm9TWjJoLU1MS3NSME1CS1ZVdDl5NWlwaHVCT3pvZzh4el9CLWZZYlhMRzRLbkNXQjk2aGxBTzVwUjlZbHFHN1hVTWZqSlBnNVNJWW9EVlFab2lMalIyMHVWVktjUVZyOVZqVklMZEpvdEhndWlLMWFncHc0NXdQTHZJdnB3N24zVnpTTEM2dW5xVjlsZjY4aG9NOFRiMGxweXV4djBjeER6RDNDZ3o3WjlHak5jdEZnLVhacjQxdjk3R0kxN2RIUjJZTGRVZzl6SnBR","e":"AQAB","key_id":"GC8skJWjSX8y5x3rLsRFLmbzqoRw6ALSwp1muUibeHk"
    return Object.freeze({
        kty: key.kty,
        kid: key.kid,
        use: key.sig,
        alg: key.alg,
        x5c: key.x5c,
        x5t: key.x5t,
        x5u: key.x5u,
        key_ops: key.key_ops,
        n: key.n,
        e: key.e,
        key_id: key.key_id
    });
};

export const fetchJwksWithUri = async ({ jwksUri, verifySsl = true }) => {
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

export const verifyRSATokenWithUri = async (
    token: string,
    {
        jwksUri,
        verifySsl = false,
        requiredAudiences = []
    }: IVerifyRSATokenCredentials
) => {
    const jwksResource = await fetchJwksWithUri({
        jwksUri,
        verifySsl
    });

    let verified = false;
    const { kid } = readTokenHeaders(token);
    const keyExists = keyExistsInSet(kid, jwksResource.keys);

    if (keyExists && kid) {
        const keyFromStore = getKeyFromSet(kid, jwksResource.keys);
        const publicKey = jwkToPem(keyFromStore);
        const decoded = <IDecodedJwt>jwt.verify(token, publicKey);

        if (decoded?.sub && requiredAudiences.length === 0) {
            verified = true;
        }

        if (
            decoded?.aud &&
            typeof decoded?.aud === "string" &&
            requiredAudiences.length > 0
        ) {
            if (decoded?.aud !== requiredAudiences[0]) {
                throwJwtError(c.JWT_NON_COMPLIANT_AUDIENCE);
            }
        } else if (
            decoded?.aud &&
            Array.isArray(decoded?.aud) &&
            requiredAudiences.length > 0
        ) {
            requiredAudiences.map((audience: string) => {
                if (!decoded?.aud.includes(audience)) {
                    throwJwtError(c.JWT_NON_COMPLIANT_AUDIENCE);
                }
            });
        }
        verified = true;
    } else {
        throwJwtError(c.JWK_MISSING_KEY_ID_FROM_HEADERS);
    }

    return verified;
};
