import { afterEach, expect, it, vi } from "vitest"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { signJwtWithPrivateKey } from "./jwt-sign"
import { getTimeToExpiry, isTokenExpired } from "./token-expiry"

const SECRET = "test-secret-for-token-expiry"

const createToken = async (claims: Record<string, unknown>) => {
    return signJwtWithPrivateKey(claims, Algs.HS256, SECRET)
}

afterEach(() => {
    vi.useRealTimers()
})

it("returns false for a non-expired token", async () => {
    const token = await createToken({
        sub: "user-1",
        exp: Math.floor(Date.now() / 1000) + 3600,
    })
    expect(isTokenExpired(token)).toBe(false)
})

it("returns true for an expired token", async () => {
    const token = await createToken({
        sub: "user-1",
        exp: Math.floor(Date.now() / 1000) - 60,
    })
    expect(isTokenExpired(token)).toBe(true)
})

it("returns true when token has no exp claim", async () => {
    const token = await createToken({
        sub: "user-1",
    })
    expect(isTokenExpired(token)).toBe(true)
})

it("returns positive seconds for non-expired token", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"))

    const exp = Math.floor(Date.now() / 1000) + 300
    const token = await createToken({
        sub: "user-1",
        exp,
    })
    const ttl = getTimeToExpiry(token)
    expect(ttl).toBe(300)

    vi.useRealTimers()
})

it("returns 0 for an expired token", async () => {
    const token = await createToken({
        sub: "user-1",
        exp: Math.floor(Date.now() / 1000) - 60,
    })
    expect(getTimeToExpiry(token)).toBe(0)
})

it("returns -1 when token has no exp claim", async () => {
    const token = await createToken({
        sub: "user-1",
    })
    expect(getTimeToExpiry(token)).toBe(-1)
})

it("detects expiry transition with fake timers", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"))

    const exp = Math.floor(Date.now() / 1000) + 10
    const token = await createToken({
        sub: "user-1",
        exp,
    })

    expect(isTokenExpired(token)).toBe(false)
    expect(getTimeToExpiry(token)).toBe(10)

    vi.advanceTimersByTime(11_000)

    expect(isTokenExpired(token)).toBe(true)
    expect(getTimeToExpiry(token)).toBe(0)

    vi.useRealTimers()
})
