import { default as fetch } from "node-fetch";
import * as https from "https";
import * as jose from "node-jose";
import { JwkRecordVisible } from "./jwks.d";
import { throwJwtError } from "../errors";

/**
 *
 * @returns
 */
export const createKeyStore = () => {
    return jose.JWK.createKeyStore();
};

export const generateKeyFromStore: any = async (
    store: jose.JWK.KeyStore,
    algorithm: string,
    exposePrivateFields: boolean = false
) => {
    const generatedKey = await store.generate("RSA", 2048, {
        alg: "RS256",
        use: "sig"
    });
    return generatedKey.toJSON(exposePrivateFields);
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
        .catch((err) => console.log(err));
};

/**
 *
 * @param keyId keyId to be checked
 * @param jwks JSON Web Key Set
 * @returns true if the key exists in the set passed as parameter
 */
export const keyExistsInSet = (keyId: string, jwks: JwkRecordVisible[]) => {
    const exists = jwks.find((jwk: JwkRecordVisible) => jwk.kid === keyId);
    return Boolean(exists);
};

/**
 *
 * @param keyId
 * @param jwks
 * @returns retrieves the key from the json web key set
 */
export const getKeyFromSet = (keyId: string, jwks: JwkRecordVisible[]) => {
    if (keyExistsInSet(keyId, jwks)) {
        return jwks.find((jwk: JwkRecordVisible) => jwk.kid === keyId);
    } else {
        throwJwtError("keyId does not exist in the target set");
    }
};
