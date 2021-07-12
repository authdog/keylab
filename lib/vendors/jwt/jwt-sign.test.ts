import {signJwtWithSecret} from './jwt-sign'
import {readTokenHeaders} from './jwt'
import * as c from '../../constants'
import * as enums from '../../enums'

it("extract properly token headers", async () => {
    const token = signJwtWithSecret({ sub: '12345', aud: [c.AUTHDOG_ID_ISSUER] }, 'secret');
    expect(token).toBeTruthy();
    const {alg} = readTokenHeaders(token);
    expect(alg).toEqual(enums.JwtAlgorithmsEnum.HS256);
});