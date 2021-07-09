import * as jwt from "jsonwebtoken";
import { atob } from "./ponyfills";
import * as c from "../constants";
import { throwJwtError } from "../errors";
import {IValidateJwtCredentials} from './jwt.d'

/**
 *
 * @param token
 * @returns headers from the jwt passed as parameter
 */
export const readTokenHeaders = (token: string) => {
    let headers;
    const decodedToken = jwt.decode(token, {
        complete: true,
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


// export type IValidateJwtCredentials =
// IValidateJwtCredentialsHS |
// IValidateJwtCredentialsRS




export const validateJwt = async (token: string, {secret}: IValidateJwtCredentials) => {

    const algorithm = getAlgorithmJwt(token);

    switch (algorithm) {
        case "HS256" || "HS384":
            console.log('decode HS256');
            break;
        
        case "RS256":
            console.log('decode RS256');
            break;
        
        default:
            throwJwtError(c.JWT_NON_SUPPORTED_ALGORITHM)
    }

    console.log(token)
    console.log(secret)
}
