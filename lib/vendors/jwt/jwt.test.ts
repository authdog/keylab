import {
    readTokenHeaders,
    getAlgorithmJwt,
    verifyHSTokenWithSecretString,
    checkJwtFields,
    parseJwt
} from "./jwt";
import {JwtAlgorithmsEnum as Algs, JwtParts, JwtKeyTypes as Kty} from '../../enums'
import * as c from "../../constants";
import { signJwtWithPrivateKey } from "./jwt-sign";


const DUMMY_HS256_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const DUMMY_NON_JWT_TOKEN = "hello-i-am-not-a-jwt";

it("extract properly token headers", async () => {
    const headers = readTokenHeaders(DUMMY_HS256_TOKEN);
    expect(headers).toBeTruthy();
    expect(headers.alg).toEqual(Algs.HS256);
    expect(headers.typ).toEqual(Kty.JWT.toUpperCase());
    expect(c.JWT_SUPPORTED_ALGS.includes(headers.alg)).toBeTruthy();
});

it("extract properly algorithm from token", async () => {
    expect(getAlgorithmJwt(DUMMY_HS256_TOKEN)).toEqual(
        Algs.HS256
    );
});

it("should throw an exception if token is malformed", async () => {
    expect(() => {
        readTokenHeaders(DUMMY_NON_JWT_TOKEN);
    }).toThrow(c.JWT_CANNOT_BE_DECODED);

    expect(() => {
        readTokenHeaders(DUMMY_NON_JWT_TOKEN);
    }).toThrowError(c.JWT_CANNOT_BE_DECODED);
});

it("verifies HS256 token", async () => {
    const SECRET_STRING = "secret";
    const signedToken = await signJwtWithPrivateKey(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            data: "foobar"
        },
        Algs.HS256,
        SECRET_STRING
    );

    const isVerified = await verifyHSTokenWithSecretString(
        signedToken,
        SECRET_STRING,
        Algs.HS256
    );
    expect(isVerified).toBeTruthy();

    const shouldNotBeVerified = await verifyHSTokenWithSecretString(
        signedToken,
        "wrong-secret",
        Algs.HS256
    );
    expect(shouldNotBeVerified).toBeFalsy();

    const signedTokenAlreadyExpired = await signJwtWithPrivateKey(
        {
            exp: Math.floor(Date.now() / 1000),
            data: "foobar"
        },
        Algs.HS256,
        SECRET_STRING
    );
    

    const shouldNotBeVerifiedAsExpired = await verifyHSTokenWithSecretString(
        signedTokenAlreadyExpired,
        SECRET_STRING,
        Algs.HS256
    );
    expect(shouldNotBeVerifiedAsExpired).toBeFalsy();


    const signedTokenNotExpired = await signJwtWithPrivateKey(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            data: "foobar"
        },
        Algs.HS256,
        SECRET_STRING
    );

    const shouldVerifysignedTokenNotExpired = await verifyHSTokenWithSecretString(
        signedTokenNotExpired,
        SECRET_STRING,
        Algs.HS256
    );
    expect(shouldVerifysignedTokenNotExpired).toBeTruthy();

});

it("verifies token audience", async () => {
    // invalid token
    const token = "dummy-string";
    const valid = checkJwtFields(token, {});
    expect(valid).toBeFalsy();

    // wrong audience
    const token2 = await signJwtWithPrivateKey(
        { aud: c.AUTHDOG_ID_ISSUER },
        Algs.HS256,
        "secret"
    );
    
    const valid2 = checkJwtFields(token2, {
        requiredAudiences: ["wrong-audience"]
    });
    expect(valid2).toBeFalsy();

    // right audience - aud string
    const token3 = await signJwtWithPrivateKey(
        { aud: c.AUTHDOG_ID_ISSUER },
        Algs.HS256,
        "secret"
    );
    
    const valid3 = checkJwtFields(token3, {
        requiredAudiences: [c.AUTHDOG_ID_ISSUER]
    });
    expect(valid3).toBeTruthy();

    // right audience - aud array
    const token4 = await signJwtWithPrivateKey(
        { aud: [c.AUTHDOG_ID_ISSUER] },
        Algs.HS256,
        "secret"
    );
    const valid4 = checkJwtFields(token4, {
        requiredAudiences: [c.AUTHDOG_ID_ISSUER]
    });
    expect(valid4).toBeTruthy();

    // right audience - aud array, but missing `missing-audience`
    const token5 = await signJwtWithPrivateKey(
        { aud: [c.AUTHDOG_ID_ISSUER] },
        Algs.HS256,
        "secret"
    );
    const valid5 = checkJwtFields(token5, {
        requiredAudiences: [c.AUTHDOG_ID_ISSUER, "missing-audience"]
    });
    expect(valid5).toBeFalsy();

    // issuer
    // wrong issuer
    const token6 = await signJwtWithPrivateKey(
        {
            aud: c.AUTHDOG_ID_ISSUER,
            iss: c.AUTHDOG_ID_ISSUER
        },
        Algs.HS256,
        "secret"
    );

    const valid6 = checkJwtFields(token6, {
        requiredAudiences: [c.AUTHDOG_ID_ISSUER],
        requiredIssuer: "https://wrong-issuer"
    });
    expect(valid6).toBeFalsy();

    // right issuer
    const valid7 = checkJwtFields(token6, {
        requiredAudiences: [c.AUTHDOG_ID_ISSUER],
        requiredIssuer: c.AUTHDOG_ID_ISSUER
    });
    expect(valid7).toBeTruthy();
});

it("verifies token scopes", async () => {
    const tokenWithOneScopeFoo = await signJwtWithPrivateKey(
        {
            aud: [c.AUTHDOG_ID_ISSUER],
            iss: c.AUTHDOG_ID_ISSUER, scp: ["foo"]
        },
        Algs.HS256,
        "secret"
    );

    const tokenHasRequiredScopes = checkJwtFields(tokenWithOneScopeFoo, {
        requiredScopes: ["foo"]
    });
    expect(tokenHasRequiredScopes).toBeTruthy();

    const tokenHasNotRightScope = checkJwtFields(tokenWithOneScopeFoo, {
        requiredScopes: ["bar"]
    });
    expect(tokenHasNotRightScope).toBeFalsy();

    const tokenMissesAScope = checkJwtFields(tokenWithOneScopeFoo, {
        requiredScopes: ["foo", "bar"]
    });
    expect(tokenMissesAScope).toBeFalsy();

    const tokenWithMoreThanOneScope = await signJwtWithPrivateKey(
        {
            aud: [c.AUTHDOG_ID_ISSUER],
            iss: c.AUTHDOG_ID_ISSUER,
            scp: ["foo", "bar"]
        },
        Algs.HS256,
        "secret"
    );
    

    const tokenHasRequiredScopes2 = checkJwtFields(tokenWithMoreThanOneScope, {
        requiredScopes: ["foo", "bar"]
    });

    expect(tokenHasRequiredScopes2).toBeTruthy();

    const tokenHasNotRightScope2 = checkJwtFields(tokenWithMoreThanOneScope, {
        requiredScopes: ["foo", "baz"]
    });

    expect(tokenHasNotRightScope2).toBeFalsy();

    const tokenMissesAScope2 = checkJwtFields(tokenWithMoreThanOneScope, {
        requiredScopes: ["foo", "bar", "baz"]
    });

    expect(tokenMissesAScope2).toBeFalsy();
});


it("parses token", async () => {
    const token = `
    eyJhbGciOiJSUzI1NiIsInR5cGUiOiJqd3QifQ.eyJhaWQiOiIxMjM0NSIsInN1YiI6InN1YjoxMjM0NSIsImlzcyI6Imlzc3VlcjoxMjM0NSIsImF1ZCI6WyJhdWQ6MTIzNDUiXSwic2NwIjoiLCwifQ.JNwBGaPC0QmQjEcCf9djyItd91GWP8cGZThIQUJ2XghZu6yg5sLJWrtPu8C405WqIcPYLwh2SaY6Tr4FrnmcEnS61VGOq47pnyz4MrCjRp9nFaQaKj1WgQwjlo9G_g5OpjwOyvhhHQo3cpMtBT7ns0vjhyZMbHcvx6hyAW7E6vqDM1XpE6KUx4gYj3pA8VhCrBiKnQXjFmxS4yecCJ6DOWDUtGykRgYDrNQDLjBn9fMff8xbCwtsTsBzaYafL4iTlJH_Q4Gz7t6HenGmK06CkXrUdqYav94kVxsWkJzuD19oWepPkRUiILXCcYD4Rnk0EFDllCeBGQIC-K5qCM5CmabEprkeoCVbtAcY1cd8Z2xJIqx4TM50Qc6Oe3HIB_NWFLydVK74sVRbBrNtyM1cmVj39RlBn8XsW6UT-B8qujhsoa8sIcUss_IEd2fEpc_PFHsoe0bU8iEfKgiRNTUBdzIvas15a4nOt6_RjXeI5XOkgVurSDkFfEqjqOtjUeUPzscc2HVgExIDqsQaSn-okSqbx_vxPgbWaQaLuTrIS9zVFNhUQ7ENqjGE2pa4zgkmdqwK4pbf0z_UXSv3Y2iay_a7dnQpLpSWD8wNqOXlkpg6oj49rMQE8_JY3qzw1VslJjrRiwiGCNasS5yKLLC7SyIkdNusTgp_SPbkcLl-_L0
    `;

    const parsedPayload = parseJwt(token);

    expect(parsedPayload).toEqual({
        aid: '12345',
        sub: 'sub:12345',
        iss: 'issuer:12345',
        aud: [ 'aud:12345' ],
        scp: ',,'
      })

    const parsedHeaders = parseJwt(token, JwtParts.HEADER);

    expect(parsedHeaders).toEqual({
        alg: Algs?.RS256,
        type: Kty?.JWT
    })
})

