import {
    getAlgorithmJwt,
    verifyHSTokenWithSecretString,
    checkJwtFields,
    parseJwt,
    checkTokenValidness
} from "./jwt-verify";
import {
    JwtAlgorithmsEnum as Algs,
    JwtParts,
    JwtKeyTypes as Kty
} from "../../enums";
import * as c from "../../constants";
import { getKeyPair, signJwtWithPrivateKey } from "./jwt-sign";
import { vi, beforeEach, afterEach, it, expect } from "vitest";
import createFetchMock from "vitest-fetch-mock";


const fetchMock = createFetchMock(vi);

beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
});

afterEach(() => {
    fetchMock.resetMocks();
});

const DUMMY_HS256_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const DUMMY_NON_JWT_TOKEN = "hello-i-am-not-a-jwt";

it("extract properly token headers", async () => {
    const headers = parseJwt(DUMMY_HS256_TOKEN, JwtParts.HEADER);
    expect(headers).toBeTruthy();
    expect(headers.alg).toEqual(Algs.HS256);
    expect(headers.typ).toEqual(Kty.JWT.toUpperCase());
    expect(c.JWT_SUPPORTED_ALGS.includes(headers.alg)).toBeTruthy();
});

it("extract properly algorithm from token", async () => {
    expect(getAlgorithmJwt(DUMMY_HS256_TOKEN)).toEqual(Algs.HS256);
});

it("should throw an exception if token is malformed", async () => {
    expect(() => {
        parseJwt(DUMMY_NON_JWT_TOKEN, JwtParts.HEADER);
    }).toThrow(c.MALFORMED_URI);
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

    const shouldVerifysignedTokenNotExpired =
        await verifyHSTokenWithSecretString(
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
            iss: c.AUTHDOG_ID_ISSUER,
            scp: ["foo"]
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

it("parses token (payload and header)", async () => {
    const token = `
    eyJhbGciOiJSUzI1NiIsInR5cGUiOiJqd3QifQ.eyJhaWQiOiIxMjM0NSIsInN1YiI6InN1YjoxMjM0NSIsImlzcyI6Imlzc3VlcjoxMjM0NSIsImF1ZCI6WyJhdWQ6MTIzNDUiXSwic2NwIjoiLCwifQ.JNwBGaPC0QmQjEcCf9djyItd91GWP8cGZThIQUJ2XghZu6yg5sLJWrtPu8C405WqIcPYLwh2SaY6Tr4FrnmcEnS61VGOq47pnyz4MrCjRp9nFaQaKj1WgQwjlo9G_g5OpjwOyvhhHQo3cpMtBT7ns0vjhyZMbHcvx6hyAW7E6vqDM1XpE6KUx4gYj3pA8VhCrBiKnQXjFmxS4yecCJ6DOWDUtGykRgYDrNQDLjBn9fMff8xbCwtsTsBzaYafL4iTlJH_Q4Gz7t6HenGmK06CkXrUdqYav94kVxsWkJzuD19oWepPkRUiILXCcYD4Rnk0EFDllCeBGQIC-K5qCM5CmabEprkeoCVbtAcY1cd8Z2xJIqx4TM50Qc6Oe3HIB_NWFLydVK74sVRbBrNtyM1cmVj39RlBn8XsW6UT-B8qujhsoa8sIcUss_IEd2fEpc_PFHsoe0bU8iEfKgiRNTUBdzIvas15a4nOt6_RjXeI5XOkgVurSDkFfEqjqOtjUeUPzscc2HVgExIDqsQaSn-okSqbx_vxPgbWaQaLuTrIS9zVFNhUQ7ENqjGE2pa4zgkmdqwK4pbf0z_UXSv3Y2iay_a7dnQpLpSWD8wNqOXlkpg6oj49rMQE8_JY3qzw1VslJjrRiwiGCNasS5yKLLC7SyIkdNusTgp_SPbkcLl-_L0
    `;

    const parsedPayload = parseJwt(token);

    expect(parsedPayload).toEqual({
        aid: "12345",
        sub: "sub:12345",
        iss: "issuer:12345",
        aud: ["aud:12345"],
        scp: ",,"
    });

    const parsedHeaders = parseJwt(token, JwtParts.HEADER);

    expect(parsedHeaders).toEqual({
        alg: Algs?.RS256,
        type: Kty?.JWT
    });
});

it("verifies a token with checkTokenValidness signed with ES512 key - jwk", async () => {
    const keyPairES512 = await getKeyPair({
        algorithmIdentifier: Algs.ES512,
        keySize: 4096
    });
    const keys = [keyPairES512.publicKey];

    const jwks = {
        keys: [
            {
                crv: "P-256",
                x: "fqCXPnWs3sSfwztvwYU9SthmRdoT4WCXxS8eD8icF6U",
                y: "nP6GIc42c61hoKqPcZqkvzhzIJkBV3Jw3g8sGG7UeP8",
                kty: "EC",
                kid: "one"
            },
            ...keys
        ]
    };

    fetchMock.mockIf("https://as.example.com/jwks", () => ({ status: 200, body: JSON.stringify(jwks) }));

    const signedPayloadEs512 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.ES512,
        keyPairES512.privateKey,
        {
            kid: keyPairES512?.kid
        }
    );

    const jwksUri = `https://as.example.com/jwks`;

    const tokenInJwksStoreValidness = await checkTokenValidness(
        signedPayloadEs512,
        {
            jwksUri
        }
    );

    expect(tokenInJwksStoreValidness).toBeTruthy();

    fetchMock.disableMocks();
});


it("verifies a token with checkTokenValidness signed with Ed25519 key - jwk", async () => {
    const keyPairEd25519 = await getKeyPair({
        algorithmIdentifier: Algs.Ed25519,
        keySize: 4096
    });

    const keys = [keyPairEd25519.publicKey];

    const jwks = {
        keys: [
            {
                crv: "P-256",
                x: "fqCXPnWs3sSfwztvwYU9SthmRdoT4WCXxS8eD8icF6U",
                y: "nP6GIc42c61hoKqPcZqkvzhzIJkBV3Jw3g8sGG7UeP8",
                kty: "EC",
                kid: "one"
            },
            ...keys
        ]
    };

    fetchMock.mockIf("https://as.example.com/jwks", () => ({ status: 200, body: JSON.stringify(jwks) }));

    const signedPayloadEd25519 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.EdDSA,
        keyPairEd25519.privateKey,
        {
            kid: keyPairEd25519?.kid
        }
    );

    const jwksUri = `https://as.example.com/jwks`;

    const tokenInJwksStoreValidness = await checkTokenValidness(
        signedPayloadEd25519,
        {
            jwksUri
        }
    );

    expect(tokenInJwksStoreValidness).toBeTruthy();

    fetchMock.disableMocks();

});


it("verifies a token with checkTokenValidness signed with Ed448 key - jwk", async () => {
    const keyPairEd448 = await getKeyPair({
        algorithmIdentifier: Algs.Ed448,
        keySize: 4096
    });

    const keys = [keyPairEd448.publicKey];

    const jwks = {
        keys: [
            {
                crv: "P-256",
                x: "fqCXPnWs3sSfwztvwYU9SthmRdoT4WCXxS8eD8icF6U",
                y: "nP6GIc42c61hoKqPcZqkvzhzIJkBV3Jw3g8sGG7UeP8",
                kty: "EC",
                kid: "one"
            },
            ...keys
        ]
    };

    fetchMock.mockIf("https://as.example.com/jwks", () => ({ status: 200, body: JSON.stringify(jwks) }));

    const signedPayloadEd448 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.EdDSA,
        keyPairEd448.privateKey,
        {
            kid: keyPairEd448?.kid
        }
    );

    const jwksUri = `https://as.example.com/jwks`;

    const tokenInJwksStoreValidness = await checkTokenValidness(
        signedPayloadEd448,
        {
            jwksUri
        }
    );

    expect(tokenInJwksStoreValidness).toBeTruthy();

    fetchMock.disableMocks();

});





it("throws an error while verifying token with public uri whose key is missing from set", async () => {
    const tenantUuid2 = "d84ddef4-81dd-4ce6-9594-03ac52cac367";
    const applicationUuid2 = "b867db48-4e11-4cae-bb03-086dc97c8ddd";
    const keyPairES512 = await getKeyPair({
        algorithmIdentifier: Algs.ES512,
        keySize: 4096
    });

    const regExpPathAppJwks = new RegExp(
        `api\/${c.AUTHDOG_JWKS_API_ID}\/${tenantUuid2}\/${applicationUuid2}\/.well-known\/jwks.json*`
    );

    const keys = [keyPairES512.publicKey];
    const AUTHDOG_API_ROOT = "https://api.authdog.xyz";

    const fullRegex = new RegExp(
        `^${AUTHDOG_API_ROOT.replace(/\\./g, "\\.")}\/${regExpPathAppJwks.source}$`
    );
    fetchMock.mockIf(fullRegex, () => ({ status: 200, body: JSON.stringify({ keys }) }));

    const jwksUri = `${AUTHDOG_API_ROOT}/api/${c.AUTHDOG_JWKS_API_ID}/${tenantUuid2}/${applicationUuid2}/.well-known/jwks.json`;

    // test with a token that is not in jwks store
    const keyPairES256K = await getKeyPair({
        algorithmIdentifier: Algs.ES256K,
        keySize: 4096
    });

    const signedPayloadEs256k = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.ES256K,
        keyPairES256K.privateKey,
        {
            kid: keyPairES256K?.kid
        }
    );

    await expect(
        checkTokenValidness(signedPayloadEs256k, {
            jwksUri
        })
    ).rejects.toThrow(c.JWK_NO_APPLICABLE_KEY);

    fetchMock.disableMocks();
});
