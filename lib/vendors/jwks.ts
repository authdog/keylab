import { default as fetch } from "node-fetch";
import * as https from "https";
import * as jose from "node-jose";
import { JwkRecordVisible } from "./jwks.d";

export const createKeyStore = () => {
    return jose.JWK.createKeyStore();
};

export const generateKeyFromStore: any = async (
    store: jose.JWK.KeyStore,
    exposePrivateFields: boolean = false
) => {
    const generatedKey = await store.generate("RSA", 2048, {
        alg: "RS256",
        use: "sig",
    });
    return generatedKey.toJSON(exposePrivateFields);
};

export const fetchJwksWithUri = async ({ jwksUri, verifySsl }) => {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: verifySsl,
    });

    return await fetch(jwksUri, {
        method: "GET",
        // headers: headers,
        // body: body,
        agent: httpsAgent,
    })
        .then((res) => res.json())
        .catch((err) => console.log(err));
};

export const verifyRSTokenWithUri = async (
    token: string,
    { jwksUri, verifySsl }
) => {};

/**
 *
 * @param keyId keyId to be checked
 * @param jwks JSON Web Key Set
 * @returns true if the keyExists in the set passed as parameter
 */
export const keyExistsInSet = (keyId: string, jwks: JwkRecordVisible[]) => {
    const exists = jwks.find((jwk: JwkRecordVisible) => jwk.kid === keyId);
    return Boolean(exists);
};