import { expect, it } from "vitest"
import { EnvironmentError } from "./environment"
import { JsonWebTokenError } from "./jwt-error"
import { UnauthorizedError } from "./unauthorized"
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
