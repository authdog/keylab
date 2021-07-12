
import {JwtAlgorithmsEnum} from '../../enums'
import * as jwt from 'jsonwebtoken'

export const signJwtWithSecret = (payload: any, secret: string) => {
    return jwt.sign({ ...payload }, secret, {algorithm: JwtAlgorithmsEnum.HS256 });
}

export const signJwtWithJwk = () => {

}