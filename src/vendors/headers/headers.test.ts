import { extractBearerTokenFromHeaders } from "./headers"
import { expect, it } from "vitest"
import * as c from "../../constants"

it("extracts properly Bearer token from req", () => {
    expect(
        extractBearerTokenFromHeaders({
            authorization: "Bearer eyJ0eXAiOiJK",
        }),
    ).toEqual("eyJ0eXAiOiJK")
})

it("extracts properly Bearer token from req with custom header name", () => {
    expect(
        extractBearerTokenFromHeaders(
            {
                "x-authorization-zzz": "Bearer eyJ0eXAiOiJK",
            },
            "x-authorization-zzz",
        ),
    ).toEqual("eyJ0eXAiOiJK")
})

it("throws an exception is credentials scheme is incorrect", () => {
    expect(() => {
        extractBearerTokenFromHeaders({
            foo: "bar",
        })
    }).toThrowError(c.HEADERS_CREDENTIALS_FORMAT)

    expect(() => {
        extractBearerTokenFromHeaders({})
    }).toThrowError(c.HEADERS_CREDENTIALS_FORMAT)
})

it("throws an exception when authorization header format is invalid", () => {
    expect(() => {
        extractBearerTokenFromHeaders({
            authorization: "Bearer only-token extra-part",
        })
    }).toThrowError(c.HEADERS_CREDENTIALS_FORMAT)
})

it("throws an exception when scheme is not bearer", () => {
    expect(() => {
        extractBearerTokenFromHeaders({
            authorization: "Basic abc123",
        })
    }).toThrowError(c.HEADERS_CREDENTIALS_FORMAT)
})
