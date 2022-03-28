import * as enums from "../../enums";
import * as jwt from "jsonwebtoken";
import * as jose from "node-jose";

import * as jose_ from "jose";
const { SignJWT } = jose_;

export const signJwtWithSecret = async (payload: any, secret: string) => {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: enums.JwtAlgorithmsEnum.HS256 })
        .sign(str2ToUint8Array(secret));
};

export const signJwtWithJwk = async (payload: any, jwk: jwt.Secret) => {
    return await jose.JWS.createSign(
        {
            compact: true,
            jwk,
            fields: { typ: enums.JwtKeyTypes.JWT }
        },
        jwk
    )
        .update(JSON.stringify(payload))
        .final();
};

export const str2ToUint8Array = (str: string) => {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf;
};

export const uint8Array2str = (buf: Uint8Array) =>
    String.fromCharCode.apply(null, buf);
