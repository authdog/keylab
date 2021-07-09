import * as jwt from "jsonwebtoken";
import { atob } from "../ponyfills/ponyfills";
import * as c from "../../constants";
import { throwJwtError } from "../../errors";
import {
    IJwtTokenClaims,
    IJwtTokenOpts,
    IValidateJwtCredentials
} from "./jwt.d";
import * as jose from "node-jose";

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

export const validateJwt = async (
    token: string,
    { secret, jwksUri }: IValidateJwtCredentials
): Promise<boolean> => {
    const algorithm = getAlgorithmJwt(token);
    const missingCredentials = [];
    let isValid = false;

    const algEnums = c.JwtAlgorithmsEnum;

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
            if (!jwksUri) {
                missingCredentials.push("jwksUri");
            }
            if (missingCredentials.length === 0) {
                throwJwtError(c.JWT_NON_IMPLEMENTED_ALGORITHM);
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
            algEnums.PS384:
            throwJwtError(c.JWT_NON_IMPLEMENTED_ALGORITHM);

        default:
            throwJwtError(c.JWT_NON_SUPPORTED_ALGORITHM);
    }

    return isValid;
};

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

export const verifyRSTokenWithUri = async (
    token: string,
    { jwksUri, verifySsl }
) => {
    console.log(token);
};

export const generateJwtFromPayload = async (
    { adid, issuer, audiences, sessionDuration, scopes, data }: IJwtTokenClaims,
    { compact, jwk, fields }: IJwtTokenOpts
) => {
    const payload = JSON.stringify({
        iss: issuer,
        sub: adid,
        aud: [...audiences],
        ...data,
        exp: Math.floor(Date.now() / 1000 + sessionDuration * 60),
        iat: Math.floor(Date.now() / 1000),
        azp: issuer,
        // https://stackoverflow.com/a/49492971/8483084
        gzp: "client-credentials",
        scp: scopes
    });

    const token = await jose.JWS.createSign(
        Object.assign({ compact, jwk, fields }),
        jwk
    )
        .update(payload)
        .final();

    return token;
};
