import { signJwtWithSecret, signJwtWithJwk } from "./jwt-sign";
import { readTokenHeaders } from "./jwt";
import { createKeyStore, generateKeyFromStore } from "../jwks";
import * as c from "../../constants";
import * as enums from "../../enums";
import { parseJwt } from ".";

it("jwt signin with secret", async () => {
    const token = signJwtWithSecret(
        { sub: "12345", aud: [c.AUTHDOG_ID_ISSUER] },
        "secret"
    );
    expect(token).toBeTruthy();
    const { alg } = readTokenHeaders(token);
    expect(alg).toEqual(enums.JwtAlgorithmsEnum.HS256);
});

it("jwt signin with jwk", async () => {
    const universalPayload = { sub: "12345", aud: [c.AUTHDOG_ID_ISSUER] };
    const store = createKeyStore();

    // test RS256
    const jwk = await generateKeyFromStore(
        store,
        enums.JwtKeyTypes.RSA,
        enums.JwtAlgorithmsEnum.RS256,
        true
    );

    const token = await signJwtWithJwk(universalPayload, jwk);
    const { ["alg"]: alg1} = readTokenHeaders(token);
    expect(alg1).toEqual(enums.JwtAlgorithmsEnum.RS256);

    const { ['sub']: sub1  }  = parseJwt(token)
    expect(sub1).toEqual(universalPayload.sub);

    // test PS512
    const jwk2 = await generateKeyFromStore(
        store,
        enums.JwtKeyTypes.RSA,
        enums.JwtAlgorithmsEnum.PS512,
        true
    );

    const token2 = await signJwtWithJwk(universalPayload, jwk2);
    const { ["alg"]: alg2 } = readTokenHeaders(token2);
    expect(alg2).toEqual(enums.JwtAlgorithmsEnum.PS512);

    // test PS384
    const jwk3 = await generateKeyFromStore(
        store,
        enums.JwtKeyTypes.RSA,
        enums.JwtAlgorithmsEnum.PS384,
        true
    );

    const token3 = await signJwtWithJwk(universalPayload, jwk3);
    const { ["alg"]: alg3 } = readTokenHeaders(token3);
    expect(alg3).toEqual(enums.JwtAlgorithmsEnum.PS384);

    // test RS512
    const jwk4 = await generateKeyFromStore(
        store,
        enums.JwtKeyTypes.RSA,
        enums.JwtAlgorithmsEnum.RS512,
        true
    );

    const token4 = await signJwtWithJwk(universalPayload, jwk4);
    const { ["alg"]: alg4 } = readTokenHeaders(token4);
    expect(alg4).toEqual(enums.JwtAlgorithmsEnum.RS512);
});


it("jwt created has all fields required from payload", async () => {   
    
})