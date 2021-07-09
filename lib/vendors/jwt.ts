import {atob} from './ponyfills'

import {JsonWebTokenError} from 'jsonwebtoken'
import * as jwt from 'jsonwebtoken'

const throwJwtError  = (message?: string) => {
    throw new JsonWebTokenError(message || "error jwt")
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
        throwJwtError("impossible to decode jwt")
    } else {
        headers = decodedToken.header;
        return headers;
    }       
}

export const getAlgorithmJwt = (token: string) => {
    let algorithm;
    const headers = readTokenHeaders(token)
    if (headers && headers.alg) {
        algorithm = headers.alg;
    } else {
        throw throwJwtError("malformed jwt headers")
    }
    return algorithm;
}

// https://stackoverflow.com/a/38552302/8483084
export const parseJwt = (token: string) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map((c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};