import { expect, it } from "vitest"
import { InsufficientScopeError } from "../../errors"
import { assertClaims, assertRequiredScopes, extractScopes, hasRequiredScopes } from "./claims"

it("extracts scopes from arrays, separated strings, and the OAuth scope claim", () => {
    expect(extractScopes({ scp: ["a", 1, "b"] })).toEqual(["a", "b"])
    expect(extractScopes({ scp: "a, b c" })).toEqual(["a", "b", "c"])
    expect(extractScopes({ scope: "openid email" })).toEqual(["openid", "email"])
    expect(extractScopes({ scp: null })).toEqual([])
    expect(extractScopes({})).toEqual([])
})

it("throws for scope claims of another type", () => {
    expect(() => extractScopes({ scp: { admin: true } })).toThrow("Invalid scp field type")
    expect(() => hasRequiredScopes({ scp: 1 }, ["admin"])).toThrow()
})

it("treats an unreadable scope claim as insufficient", () => {
    expect(() => assertRequiredScopes({ scp: { admin: true } }, ["admin"])).toThrow(
        InsufficientScopeError,
    )
    expect(() => assertRequiredScopes({}, ["admin"])).toThrow(InsufficientScopeError)
    expect(() => assertRequiredScopes({}, [])).not.toThrow()
    expect(() => assertRequiredScopes({}, undefined)).not.toThrow()
})

it("accepts a string audience and rejects a missing one", () => {
    expect(() => assertClaims({ aud: "api" }, { requiredAudiences: ["api"] })).not.toThrow()
    expect(() => assertClaims({}, { requiredAudiences: ["api"] })).toThrow(
        'unexpected "aud" claim value',
    )
})
