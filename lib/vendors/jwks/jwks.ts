import { default as fetch } from "node-fetch";
import * as https from "https";
import * as jose from "node-jose";

import { throwJwtError } from "../../errors";
// import * as enums from "../../enums";
import {JwtAlgorithmsEnum as Algs} from '../../enums'
import * as c from "../../constants";

import * as jwt from "jsonwebtoken";

import {
    checkJwtFields,
    IJwtTokenClaims,
    IJwtTokenOpts,
    readTokenHeaders
} from "../jwt";
import { IDecodedJwt } from "../jwt/interfaces";

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

/**
 *
 * @returns new JWK store
 */
export const createKeyStore = () => {
    return jose.JWK.createKeyStore();
};

const defaultKeyOptions = (algorithm: any) => {
    return Object.freeze({
        alg: algorithm,
        use: "sig",
    })
}

export const generateKeyFromStore: any = async (
    store: jose.JWK.KeyStore,
    keyType: string,
    algorithm: string,
    exposePrivateFields: boolean = false,
    keySize: number = 2048
) => {
    let generatedKey = null;

    switch (algorithm) {
        // RSA
        case Algs.RS256:
        case Algs.RS384:
        case Algs.RS512:
        case Algs.RSAPSS:
        // case Algs.PS256:
        // case Algs.PS384:
        // case Algs.PS512:
            generatedKey = await store.generate(
                keyType.toUpperCase(),
                keySize,
                {
                    ...defaultKeyOptions(algorithm),
                }
            );
            break;
        
        // EC
        case Algs.ES256:
        case Algs.ES384:
        case Algs.ES512:
            generatedKey = await store.generate(
                keyType.toUpperCase(),
                c.namedCurves[algorithm.toLowerCase()],
                {
                    ...defaultKeyOptions(algorithm),
                }                    
            ); 
            break;
        
        // case Algs.EdDSA:
        //     generatedKey = await store.generate(
        //         keyType.toUpperCase(),
        //         c.namedCurves[algorithm.toLowerCase()],
        //         {
        //             ...defaultKeyOptions(algorithm),
        //         }
        //     );
        //     break;



        default:
            throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    
    //     await store.generate(
    //     // enums.JwtKeyTypes[keyType],
    //     keyType,
    //     2048,
    //     {
    //         // jwa: https://datatracker.ietf.org/doc/html/rfc7518
    //         alg: algorithm, //enums.JwtAlgorithmsEnum[algorithm],
    //         // https://datatracker.ietf.org/doc/html/rfc7517#section-4.3
    //         // The "use" and "key_ops" JWK members SHOULD NOT be used together;
    //         use: enums.JwtPublicKeyUse.SIGNATURE
    //     }
    // );
    return generatedKey.toJSON(exposePrivateFields);
};

export const generateJwtFromPayload = async (
    { sub, iss, aud, scp, pld }: IJwtTokenClaims,
    { compact, jwk, fields, sessionDuration }: IJwtTokenOpts
) => {
    const payload = JSON.stringify({
        iss,
        sub,
        aud,
        ...pld,
        exp: Math.floor(Date.now() / 1000 + sessionDuration * 60),
        iat: Math.floor(Date.now() / 1000),
        azp: iss,
        // https://stackoverflow.com/a/49492971/8483084
        gzp: "client-credentials",
        scp
    });

    const token = await jose.JWS.createSign(
        Object.assign({ compact, jwk, fields }),
        jwk
    )
        .update(payload)
        .final();

    return token;
};

export const generatePrivateJwk: any = async (
    keyType: string,
    algorithm: string
) => {
    const store = createKeyStore();
    const jsonWebKey = await generateKeyFromStore(
        store,
        keyType,
        algorithm,
        true
    );
    return jsonWebKey;
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
}): Promise<IRSAKeyStore> => {
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

export const verifyRSAToken = async (
    token: string,
    {
        jwksUri,
        verifySsl = false,
        requiredAudiences = [],
        requiredIssuer = null,
        requiredScopes = [],
        adhoc
    }: IVerifyRSATokenCredentials
) => {
    const jwksResource = !!adhoc
        ? adhoc
        : await fetchJwksWithUri({
              jwksUri,
              verifySsl
          });

    let verified = false;
    let validFields = false;
    let validationFieldsPassed = false;
    let requiresFieldsCheck = requiredAudiences || requiredIssuer;
    const { kid } = readTokenHeaders(token);

    const keyExists = keyExistsInSet(kid, jwksResource.keys);

    if (keyExists && kid) {
        const keyFromStore = getKeyFromSet(kid, jwksResource.keys);

        const publicKey = await jose.JWK.asKey(keyFromStore);

        const decoded = <IDecodedJwt>jwt.verify(token, publicKey.toPEM());

        if (decoded?.iat && decoded?.exp) {
            verified = true;
        }

        if (requiresFieldsCheck) {
            validFields = checkJwtFields(token, {
                requiredAudiences,
                requiredIssuer,
                requiredScopes
            });
        }
    } else if (!kid) {
        throwJwtError(c.JWK_MISSING_KEY_ID_FROM_HEADERS);
    } else if (!keyExists) {
        throwJwtError(c.JWKS_MISSING_KEY_ID);
    }

    validationFieldsPassed = requiresFieldsCheck ? validFields : true;

    return verified && validationFieldsPassed;
};
