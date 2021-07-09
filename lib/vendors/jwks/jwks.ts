import { default as fetch } from "node-fetch";
import * as https from "https";
import * as jose from "node-jose";
import { JwkRecordVisible } from "./jwks.d";
import { throwJwtError } from "../../errors";
import * as enums from "../../enums";
import * as c from "../../constants";

/**
 *
 * @returns new JWK store
 */
export const createKeyStore = () => {
    return jose.JWK.createKeyStore();
};

export const generateKeyFromStore: any = async (
    store: jose.JWK.KeyStore,
    algorithm: enums.JwtAlgorithmsEnum, // TODO: use enum
    // keyType default = RSA
    exposePrivateFields: boolean = false
) => {
    const generatedKey = await store.generate("RSA", 2048, {
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
export const makeKeyExposable = async () => {};

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
        throwJwtError(c.JWKS_MISSING_KEY_ID);
    }
};
