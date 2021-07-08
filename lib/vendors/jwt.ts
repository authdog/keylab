import {atob} from './ponyfills'

import * as jwt from 'jsonwebtoken'

export const readTokenHeaders = (token: string) => {
    const decodedToken = jwt.decode(token, {
    complete: true
    });
    
    if (!decodedToken) {
        throw new Error(`provided token does not decode as JWT`);
    }
      
    return decodedToken.header;
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