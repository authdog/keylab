import { expect, it } from "vitest"
import { EnvironmentError } from "./environment"
import { JsonWebTokenError } from "./jwt-error"
import { UnauthorizedError } from "./unauthorized"
import { TokenExpiredError } from "./token-expired"
import { InvalidSignatureError } from "./invalid-signature"
import { AlgorithmMismatchError } from "./algorithm-mismatch"
import { MalformedTokenError } from "./malformed-token"
import { JwksEndpointError } from "./jwks-endpoint"
import { throwEnvironmentError, throwJwtError, throwUnauthorized } from "./index"
import * as c from "../constants"

it("creates custom error instances with expected metadata", () => {
    const jwtError = new JsonWebTokenError("jwt failure")
    const unauthorizedError = new UnauthorizedError("unauthorized", {
        message: "blocked",
    })
    const environmentError = new EnvironmentError("missing browser runtime")

    expect(jwtError.name).toEqual("JsonWebTokenError")
    expect(jwtError.code).toEqual(401)

    expect(unauthorizedError.name).toEqual("UnauthorizedError")
    expect(unauthorizedError.code).toEqual(401)
    expect(unauthorizedError.message).toEqual("blocked")

    expect(environmentError.name).toEqual("EnvironmentError")
    expect(environmentError.code).toEqual(500)
})

it("throws exported helpers with default fallback messages", () => {
    expect(() => throwJwtError()).toThrow(c.JWT_GENERIC_ERROR_MESSAGE)
    expect(() => throwUnauthorized()).toThrow(c.GENERIC_UNAUTHORIZED_MESSAGE)
    expect(() => throwEnvironmentError()).toThrow(c.CODE_NOT_RUNNING_IN_BROWSER)
})

it("throws exported helpers with custom messages", () => {
    expect(() => throwJwtError("bad token")).toThrow("bad token")
    expect(() => throwUnauthorized("nope")).toThrow("nope")
    expect(() => throwEnvironmentError("edge only")).toThrow("edge only")
})

it("creates TokenExpiredError with expiredAt date", () => {
    const expiredAt = new Date("2024-01-01T00:00:00Z")
    const error = new TokenExpiredError("Token has expired", expiredAt)

    expect(error).toBeInstanceOf(TokenExpiredError)
    expect(error).toBeInstanceOf(JsonWebTokenError)
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toEqual("TokenExpiredError")
    expect(error.code).toEqual(401)
    expect(error.expiredAt).toEqual(expiredAt)
    expect(error.message).toEqual("Token has expired")
})

it("creates InvalidSignatureError with default message", () => {
    const error = new InvalidSignatureError()

    expect(error).toBeInstanceOf(InvalidSignatureError)
    expect(error).toBeInstanceOf(JsonWebTokenError)
    expect(error.name).toEqual("InvalidSignatureError")
    expect(error.code).toEqual(401)
    expect(error.message).toEqual("Invalid signature")
})

it("creates InvalidSignatureError with custom message", () => {
    const error = new InvalidSignatureError("bad sig")
    expect(error.message).toEqual("bad sig")
})

it("creates AlgorithmMismatchError with default message", () => {
    const error = new AlgorithmMismatchError()

    expect(error).toBeInstanceOf(AlgorithmMismatchError)
    expect(error).toBeInstanceOf(JsonWebTokenError)
    expect(error.name).toEqual("AlgorithmMismatchError")
    expect(error.code).toEqual(401)
    expect(error.message).toEqual("Algorithm mismatch")
})

it("creates MalformedTokenError with default message", () => {
    const error = new MalformedTokenError()

    expect(error).toBeInstanceOf(MalformedTokenError)
    expect(error).toBeInstanceOf(JsonWebTokenError)
    expect(error.name).toEqual("MalformedTokenError")
    expect(error.code).toEqual(401)
    expect(error.message).toEqual("Malformed token")
})

it("creates JwksEndpointError with statusCode and code 502", () => {
    const error = new JwksEndpointError("JWKS fetch failed", 503)

    expect(error).toBeInstanceOf(JwksEndpointError)
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toEqual("JwksEndpointError")
    expect(error.code).toEqual(502)
    expect(error.statusCode).toEqual(503)
    expect(error.message).toEqual("JWKS fetch failed")
})

it("exports ERROR_CODES constant", () => {
    expect(c.ERROR_CODES).toBeDefined()
    expect(c.ERROR_CODES.TOKEN_EXPIRED).toEqual("TOKEN_EXPIRED")
    expect(c.ERROR_CODES.INVALID_SIGNATURE).toEqual("INVALID_SIGNATURE")
    expect(c.ERROR_CODES.ALGORITHM_MISMATCH).toEqual("ALGORITHM_MISMATCH")
    expect(c.ERROR_CODES.MALFORMED_TOKEN).toEqual("MALFORMED_TOKEN")
    expect(c.ERROR_CODES.JWKS_ENDPOINT_ERROR).toEqual("JWKS_ENDPOINT_ERROR")
    expect(c.ERROR_CODES.UNAUTHORIZED).toEqual("UNAUTHORIZED")
    expect(c.ERROR_CODES.JWT_ERROR).toEqual("JWT_ERROR")
    expect(c.ERROR_CODES.ENVIRONMENT_ERROR).toEqual("ENVIRONMENT_ERROR")
})
