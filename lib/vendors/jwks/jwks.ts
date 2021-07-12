import { default as fetch } from "node-fetch";
import * as https from "https";
import * as jose from "node-jose";
import { default as jwkToPem } from "jwk-to-pem";
import * as jwt from "jsonwebtoken";

import { IJwkRecordVisible, IVerifyRSATokenCredentials } from "./jwks.d";
import { checkJwtFields, readTokenHeaders } from "../jwt";
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
    keyType: string,
    algorithm: string,
    exposePrivateFields: boolean = false
) => {
    const generatedKey = await store.generate(
        enums.JwtKeyTypes[keyType],
        2048,
        {
            // jwa: https://datatracker.ietf.org/doc/html/rfc7518
            alg: enums.JwtAlgorithmsEnum[algorithm],
            // https://datatracker.ietf.org/doc/html/rfc7517#section-4.3
            // The "use" and "key_ops" JWK members SHOULD NOT be used together;
            use: enums.JwtPublicKeyUse.SIGNATURE
        }
    );
    return generatedKey.toJSON(exposePrivateFields);
};

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
    return publicKey;
};

/**
 *
 * @param jwksUri is the endpoint to retrieve the public Json web keys
 * @param verifySsl can be used in a context where self-signed certificates are being used
 * @returns return an array with keys objects
 */
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
        requiredAudiences = [],
        requiredIssuer = null
    }: IVerifyRSATokenCredentials
) => {
    const jwksResource = await fetchJwksWithUri({
        jwksUri,
        verifySsl
    });

    let verified = false;
    let validFields = false;
    const { kid } = readTokenHeaders(token);
    const keyExists = keyExistsInSet(kid, jwksResource.keys);

    if (keyExists && kid) {
        const keyFromStore = getKeyFromSet(kid, jwksResource.keys);
        const publicKey = jwkToPem(keyFromStore);
        const decoded = <IDecodedJwt>jwt.verify(token, publicKey);

        if (decoded?.iat && decoded?.exp) {
            verified = true;
        }

        // check requiredAudiences and/or requiredIssuer
        if (requiredAudiences || requiredIssuer) {
            validFields = checkJwtFields(token, {
                requiredAudiences,
                requiredIssuer
            });
        }
    } else {
        throwJwtError(c.JWK_MISSING_KEY_ID_FROM_HEADERS);
    }

    return verified && validFields;
};
