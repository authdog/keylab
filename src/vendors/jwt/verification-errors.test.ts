import { errors } from "jose"
import { expect, it } from "vitest"
import {
    AlgorithmMismatchError,
    JsonWebTokenError,
    JwksEndpointError,
    MalformedTokenError,
} from "../../errors"
import { toVerificationError } from "./verification-errors"

it("maps jose errors to the documented classes and keeps the cause", () => {
    const cases: [Error, new (...args: any[]) => Error][] = [
        [new errors.JOSEAlgNotAllowed("alg"), AlgorithmMismatchError],
        [new errors.JWSInvalid("jws"), MalformedTokenError],
        [new errors.JWTInvalid("jwt"), MalformedTokenError],
        [new errors.JWTClaimValidationFailed("claim", {}), JsonWebTokenError],
        [new errors.JWKSNoMatchingKey(), JsonWebTokenError],
    ]

    for (const [source, expected] of cases) {
        const mapped = toVerificationError(source) as JsonWebTokenError
        expect(mapped).toBeInstanceOf(expected)
        expect(mapped.cause).toBe(source)
    }
})

it("returns library and unrelated errors unchanged", () => {
    const endpoint = new JwksEndpointError("down", 503)
    const jwt = new JsonWebTokenError("jwt")
    const other = new TypeError("other")

    expect(toVerificationError(endpoint)).toBe(endpoint)
    expect(toVerificationError(jwt)).toBe(jwt)
    expect(toVerificationError(other)).toBe(other)
})
