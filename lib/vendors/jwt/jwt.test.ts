import {
    readTokenHeaders,
    getAlgorithmJwt,
    verifyHSTokenWithSecretString
} from "./jwt";
import { JsonWebTokenError } from "jsonwebtoken";
import * as c from "../../constants";
import * as enums from "../../enums";
import * as jwt from "jsonwebtoken";

const DUMMY_HS256_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const DUMMY_NON_JWT_TOKEN = "hello-i-am-not-a-jwt";

it("extract properly token headers", async () => {
    const headers = readTokenHeaders(DUMMY_HS256_TOKEN);
    expect(headers).toBeTruthy();
    expect(headers.alg).toEqual(enums.JwtAlgorithmsEnum.HS256);
    expect(headers.typ).toEqual("JWT");
    expect(c.JWT_SUPPORTED_ALGS.includes(headers.alg)).toBeTruthy();
});

it("extract properly algorithm from token", async () => {
    expect(getAlgorithmJwt(DUMMY_HS256_TOKEN)).toEqual(
        enums.JwtAlgorithmsEnum.HS256
    );
});

it("should throw an exception if token is malformed", async () => {
    expect(() => {
        readTokenHeaders(DUMMY_NON_JWT_TOKEN);
    }).toThrow(c.JWT_CANNOT_BE_DECODED);

    expect(() => {
        readTokenHeaders(DUMMY_NON_JWT_TOKEN);
    }).toThrowError(JsonWebTokenError);
});

it("verifies HS256 token", async () => {
    const SECRET_STRING = "secret";
    const signedToken = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            data: "foobar"
        },
        SECRET_STRING
    );

    const isVerified = await verifyHSTokenWithSecretString(
        signedToken,
        SECRET_STRING
    );
    expect(isVerified).toBeTruthy();

    const shouldNotBeVerified = await verifyHSTokenWithSecretString(
        signedToken,
        "wrong-secret"
    );
    expect(shouldNotBeVerified).toBeFalsy();

    const signedTokenAlreadyExpired = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 0,
            data: "foobar"
        },
        SECRET_STRING
    );

    const shouldNotBeVerifiedAsExpired = await verifyHSTokenWithSecretString(
        signedTokenAlreadyExpired,
        SECRET_STRING
    );
    expect(shouldNotBeVerifiedAsExpired).toBeFalsy();
});
