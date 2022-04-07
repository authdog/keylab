// import * as jwt from "jsonwebtoken";
import * as jws from "jws";
import { atob } from "../ponyfills/ponyfills";
import * as c from "../../constants";
import * as enums from "../../enums";
import { msg, throwJwtError } from "../../errors";
import { IDecodedJwt } from "./interfaces";
import {
    ICheckJwtFields,
    IcheckTokenValidnessCredentials,
    ICreateSignedJwtOptions
} from "..";
import { signJwtWithPrivateKey } from "./jwt-sign";
import { verifyTokenWithPublicKey } from "../jwks";

/**
 *
 * @param token
 * @returns algorithm used for used
 */
export const getAlgorithmJwt = (token: string) => {
    let algorithm;
    const headers = parseJwt(token, enums?.JwtParts?.HEADER);
    if (headers && headers.alg) {
        algorithm = headers.alg;
    } else {
        throw throwJwtError(c.JWT_MALFORMED_HEADERS);
    }
    return algorithm;
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
        case algEnums.HS256:
        case algEnums.HS384:
        case algEnums.HS512:
            if (!secret) {
                missingCredentials.push("secret");
            }

            if (missingCredentials.length === 0) {
                isValid = !!(await verifyHSTokenWithSecretString(
                    token,
                    secret
                ));
                break;
            } else {
                throwJwtError(
                    `${c.JWT_MISSING_VALIDATION_CREDENTIALS} ${JSON.stringify(
                        missingCredentials
                    )}`
                );
            }
        case algEnums.RS256:
        case algEnums.RS384:
        case algEnums.RS512:
        case algEnums.ES256:
        case algEnums.ES384:
        case algEnums.ES512:
        case algEnums.PS256:
        case algEnums.PS384:
        case algEnums.PS512:
        case algEnums.EdDSA:
        case algEnums.ES256K:
            if (!adhoc && !jwksUri) {
                missingCredentials.push("jwksUri");
            }
            if (missingCredentials.length === 0) {
                isValid = await verifyTokenWithPublicKey(token, null, {
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

        default:
            throwJwtError(c.JWT_NON_SUPPORTED_ALGORITHM);
    }

    return isValid;
};

export const verifyHSTokenWithSecretString = async (
    token: string,
    secret: string,
    algorithm: enums.JwtAlgorithmsEnum = enums.JwtAlgorithmsEnum.HS256
) => {
    let isValid = false;
    let isVerified = false;

    // check algorithm validity
    isValid = jws.verify(token, algorithm, secret);

    if (isValid) {
        const { exp } = parseJwt(token, enums.JwtParts.PAYLOAD);

        if (exp) {
            const now = Math.floor(Date.now() / 1000);
            isVerified = now < exp;
        }
    }

    return isVerified;
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
                if (parsedToken?.scp.includes(c.CHARS.SPACE)) {
                    scopes = parsedToken?.scp.split(c.CHARS.SPACE);
                } else if (parsedToken?.scp.includes(c.CHARS.COMMA)) {
                    scopes = parsedToken?.scp.split(c.CHARS.COMMA);
                } else {
                    scopes = [parsedToken?.scp];
                }
            } else if (Array.isArray(parsedToken?.scp)) {
                scopes = parsedToken?.scp;
            } else {
                throw new Error(msg.INVALID_SCOPE_FIELD_TYPE);
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

// https://stackoverflow.com/a/38552302/8483084
/**
 *
 * @param token
 * @returns JSON payload from token passed as parameter
 */
export const parseJwt = (
    token: string,
    part: enums.JwtParts = enums.JwtParts.PAYLOAD
) => {
    let indexPart = -1;

    switch (part) {
        case enums.JwtParts.HEADER:
            indexPart = 0;
            break;
        case enums.JwtParts.PAYLOAD:
            indexPart = 1;
            break;
        case enums.JwtParts.SIGNATURE:
            indexPart = 2;
            break;
        default:
            throw throwJwtError("unknown jwt part");
    }

    var base64Url = token.split(".")[indexPart];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split(c.EMPTY_STRING)
            .map((c: string) => {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(c.EMPTY_STRING)
    );

    return JSON.parse(jsonPayload);
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
        case algEnums.HS384:
        case algEnums.HS512:
            token = signJwtWithPrivateKey(
                jwtClaims,
                algorithm,
                signinOptions?.secret
            );
            break;

        case algEnums.RS256:
        case algEnums.RS384:
        case algEnums.RS512:
        case algEnums.PS256:
        case algEnums.PS384:
        case algEnums.PS512:
        case algEnums.ES256:
        case algEnums.ES384:
        case algEnums.ES512:
        case algEnums.EdDSA:
        case algEnums.ES256K:
            if (signinOptions?.pemPrivateKey) {
                token = await signJwtWithPrivateKey(
                    jwtClaims,
                    algorithm,
                    signinOptions.pemPrivateKey
                );
            } else if (signinOptions?.jwkPrivateKey) {
                token = await signJwtWithPrivateKey(
                    jwtClaims,
                    algorithm,
                    signinOptions.jwkPrivateKey
                );
            }
            break;

        default:
            throwJwtError(c.JWT_NON_IMPLEMENTED_ALGORITHM);
    }

    return token;
};
