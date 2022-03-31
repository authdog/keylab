import * as jwt from "jsonwebtoken";
import * as jose from "node-jose";

import { atob } from "../ponyfills/ponyfills";
import * as c from "../../constants";
import * as enums from "../../enums";
import { throwJwtError } from "../../errors";
import { verifyRSAToken } from "../jwks";
import { signJwtWithSecret } from "./jwt-sign";
import { IDecodedJwt } from "./interfaces";
import { IRSAKeyStore } from "../jwks/jwks";

export interface IcheckTokenValidnessCredentials {
    // HS256
    secret?: string;
    // RS256
    domainUri?: string;
    jwksUri?: string;
    verifySsl?: boolean;
    adhoc?: IRSAKeyStore;
    requiredScopes?: string[];
}

export interface ISignTokenCredentials {
    // HS256
    secret?: string;
    // RS256
    jwk: any;
    sessionDuration: number;
}

export interface IJwtTokenClaims {
    sub: string; // subject id
    iss: string; // issuer
    aud: string[]; // audiences
    scp: string; // scopes eg: "user openid"
    pld?: any; // payload
    aid?: string; // authdog global identifier
}

export interface IJwtTokenOpts {
    compact?: true;
    jwk: any;
    fields?: {
        typ: string;
    };
    sessionDuration: number;
}

export interface ICheckJwtFields {
    requiredAudiences?: string[];
    requiredIssuer?: string;
    requiredScopes?: string[];
}

export interface ICreateSignedJwtOptions {
    algorithm: string | enums.JwtAlgorithmsEnum;
    claims: IJwtTokenClaims;
    signinOptions: ISignTokenCredentials;
}

/**
 *
 * @param token
 * @returns headers from the jwt passed as parameter
 */
export const readTokenHeaders = (token: string) => {
    let headers;
    const decodedToken = jwt.decode(token, {
        complete: true
    });

    if (!decodedToken) {
        throwJwtError(c.JWT_CANNOT_BE_DECODED);
    } else {
        headers = decodedToken.header;
    }
    return headers;
};

/**
 *
 * @param token
 * @returns algorithm used for used
 */
export const getAlgorithmJwt = (token: string) => {
    let algorithm;
    const headers = readTokenHeaders(token);
    if (headers && headers.alg) {
        algorithm = headers.alg;
    } else {
        throw throwJwtError(c.JWT_MALFORMED_HEADERS);
    }
    return algorithm;
};

// https://stackoverflow.com/a/38552302/8483084
/**
 *
 * @param token
 * @returns JSON payload from token passed as parameter
 */
export const parseJwt = (token: string) => {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map((c: string) => {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );

    return JSON.parse(jsonPayload);
};

export const checkTokenValidness = async (
    token: string,
    {
        secret,
        jwksUri,
        verifySsl = true,
        adhoc,
        requiredScopes
    }: IcheckTokenValidnessCredentials
): Promise<boolean> => {
    const algorithm = getAlgorithmJwt(token);
    const missingCredentials = [];
    let isValid = false;

    const algEnums = enums.JwtAlgorithmsEnum;

    switch (algorithm) {
        case algEnums.HS256 || algEnums.HS384 || algEnums.HS512:
            if (!secret) {
                missingCredentials.push("secret");
            }

            if (missingCredentials.length === 0) {
                isValid = await verifyHSTokenWithSecretString(token, secret);
                break;
            } else {
                throwJwtError(
                    `${c.JWT_MISSING_VALIDATION_CREDENTIALS} ${JSON.stringify(
                        missingCredentials
                    )}`
                );
            }
        case algEnums.RS256 || algEnums.RS384 || algEnums.RS512:
            if (!adhoc && !jwksUri) {
                missingCredentials.push("jwksUri");
            }
            if (missingCredentials.length === 0) {
                isValid = await verifyRSAToken(token, {
                    jwksUri,
                    verifySsl,
                    adhoc,
                    requiredScopes
                });
                break;
            } else {
                throwJwtError(
                    `${c.JWT_MISSING_VALIDATION_CREDENTIALS} ${JSON.stringify(
                        missingCredentials
                    )}`
                );
            }

        case algEnums.ES256 ||
            algEnums.ES384 ||
            algEnums.ES512 ||
            algEnums.PS256 ||
            algEnums.PS384 ||
            algEnums.PS512 ||
            algEnums.ES256K ||
            algEnums.EdDSA:
            throwJwtError(c.JWT_NON_IMPLEMENTED_ALGORITHM);

        default:
            throwJwtError(c.JWT_NON_SUPPORTED_ALGORITHM);
    }

    return isValid;
};

// TODO: replace implementation with jose
export const verifyHSTokenWithSecretString = async (
    token: string,
    secret: string
) => {
    let isVerified = false;
    try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded === "object" && decoded.iat && decoded.exp) {
            isVerified = true;
        }
    } catch (err) {}
    return isVerified;
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

export const checkJwtFields = (
    token: string,
    {
        requiredAudiences = [],
        requiredIssuer = null,
        requiredScopes = []
    }: ICheckJwtFields
) => {
    let validFields = true;
    try {
        const parsedToken: any = parseJwt(token);
        // audience
        if (
            parsedToken?.aud &&
            typeof parsedToken?.aud === "string" &&
            requiredAudiences.length > 0
        ) {
            validFields = parsedToken?.aud === requiredAudiences[0];
        } else if (
            parsedToken?.aud &&
            Array.isArray(parsedToken?.aud) &&
            requiredAudiences.length > 0
        ) {
            requiredAudiences.map((el: string) => {
                if (!parsedToken?.aud.includes(el)) {
                    validFields = false;
                }
            });
        }
        // issuer
        if (
            parsedToken?.iss &&
            typeof parsedToken?.iss === "string" &&
            requiredIssuer
        ) {
            validFields = parsedToken?.iss === requiredIssuer;
        }

        // scopes
        if (parsedToken?.scp && requiredScopes?.length > 0) {
            let scopes = [];
            if (typeof parsedToken?.scp === "string") {
                if (parsedToken?.scp.includes(" ")) {
                    scopes = parsedToken?.scp.split(" ");
                } else if (parsedToken?.scp.includes(",")) {
                    scopes = parsedToken?.scp.split(",");
                } else {
                    scopes = [parsedToken?.scp];
                }
            } else if (Array.isArray(parsedToken?.scp)) {
                scopes = parsedToken?.scp;
            } else {
                throw new Error("Invalid scp field type");
            }

            requiredScopes.map((el: string) => {
                if (!scopes.includes(el)) {
                    validFields = false;
                }
            });
        }
    } catch (e) {
        validFields = false;
    }
    return validFields;
};

export const createSignedJwt = async (
    payload: any,
    { algorithm, claims, signinOptions }: ICreateSignedJwtOptions
): Promise<string> => {
    const algEnums = enums.JwtAlgorithmsEnum;
    let token;
    // TODO: reflect all fields standard JWT
    const jwtClaims: IDecodedJwt = {
        iss: claims?.iss,
        aud: claims?.aud,
        scp: claims?.scp,
        aid: claims?.aid,
        sub: claims?.sub,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(
            Date.now() / 1000 + signinOptions?.sessionDuration * 60
        ),
        ...payload
    };

    switch (algorithm) {
        case algEnums.HS256:
            token = signJwtWithSecret(jwtClaims, signinOptions?.secret);
            break;

        // to be tested
        case algEnums.HS384 || algEnums.HS512:
            throwJwtError(c.JWT_NON_IMPLEMENTED_ALGORITHM);

        // case algEnums.RS256 ||
        //     algEnums.RS384 ||
        //     algEnums.RS512 ||
        //     algEnums.PS256 ||
        //     algEnums.PS384 ||
        //     algEnums.PS512:
        //     token = await signJwtWithJwk(jwtClaims, signinOptions.jwk);
        //     break;

        // to be implemented
        case algEnums.ES256 ||
            algEnums.ES384 ||
            algEnums.ES512 ||
            algEnums.ES256K ||
            algEnums.EdDSA:
            throwJwtError(c.JWT_NON_IMPLEMENTED_ALGORITHM);
    }

    return token;
};
