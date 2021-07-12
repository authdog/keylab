import * as enums from "../../enums";
import * as jwt from "jsonwebtoken";
import * as jose from "node-jose";

export const signJwtWithSecret = (payload: any, secret: string) => {
    return jwt.sign({ ...payload }, secret, {
        algorithm: enums.JwtAlgorithmsEnum.HS256
    });
};

export const signJwtWithJwk = async (payload: any, jwk: jwt.Secret) => {
    return await jose.JWS.createSign(
        Object.assign({
            compact: true,
            jwk,
            fields: { typ: enums.JwtKeyTypes.JWT }
        }),
        jwk
    )
        .update(payload)
        .final();
};
