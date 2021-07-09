import { default as fetch } from "node-fetch";
import * as https from "https";
import * as jose from "node-jose";

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

export const verifyRSTokenWithUri = async ({ jwksUri, verifySsl }) => {
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
