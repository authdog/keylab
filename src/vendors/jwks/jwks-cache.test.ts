import { afterEach, beforeEach, expect, it, vi } from "vitest"
import createFetchMock from "vitest-fetch-mock"
import { JwksEndpointError } from "../../errors/jwks-endpoint"
import { JwksCache } from "./jwks-cache"

const fetchMock = createFetchMock(vi)

beforeEach(() => {
    fetchMock.enableMocks()
    fetchMock.resetMocks()
})

afterEach(() => {
    fetchMock.resetMocks()
    vi.useRealTimers()
})

const JWKS_URI = "https://example.com/.well-known/jwks.json"

const makeJwks = (kids: string[]) => ({
    keys: kids.map((kid) => ({
        kty: "RSA",
        kid,
        use: "sig",
        alg: "RS256",
        n: "test",
        e: "AQAB",
    })),
})

it("fetches and caches keys", async () => {
    const jwks = makeJwks(["key-1"])
    fetchMock.mockResponseOnce(JSON.stringify(jwks))

    const cache = new JwksCache()
    const keys = await cache.getKeys(JWKS_URI)
    expect(keys).toHaveLength(1)
    expect(keys[0].kid).toBe("key-1")

    // Second call should use cache (no second fetch)
    const keys2 = await cache.getKeys(JWKS_URI)
    expect(keys2).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
})

it("respects TTL expiry", async () => {
    vi.useFakeTimers()
    const jwks1 = makeJwks(["key-1"])
    const jwks2 = makeJwks(["key-2"])
    fetchMock.mockResponseOnce(JSON.stringify(jwks1))
    fetchMock.mockResponseOnce(JSON.stringify(jwks2))

    const cache = new JwksCache({ ttlMs: 1000 })
    const keys1 = await cache.getKeys(JWKS_URI)
    expect(keys1[0].kid).toBe("key-1")

    vi.advanceTimersByTime(1100)

    const keys2Result = await cache.getKeys(JWKS_URI)
    expect(keys2Result[0].kid).toBe("key-2")
    expect(fetchMock).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
})

it("retries on failure with exponential backoff", async () => {
    fetchMock.mockResponseOnce("", { status: 503 })
    fetchMock.mockResponseOnce("", { status: 503 })
    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["key-1"])))

    const cache = new JwksCache({ maxRetries: 3 })
    const keys = await cache.getKeys(JWKS_URI)
    expect(keys).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
})

it("throws after exhausting retries", async () => {
    fetchMock.mockResponse("", { status: 500 })

    const cache = new JwksCache({ maxRetries: 2 })
    await expect(cache.getKeys(JWKS_URI)).rejects.toThrow(JwksEndpointError)
})

it("deduplicates concurrent requests", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["key-1"])))

    const cache = new JwksCache()
    const [keys1, keys2, keys3] = await Promise.all([
        cache.getKeys(JWKS_URI),
        cache.getKeys(JWKS_URI),
        cache.getKeys(JWKS_URI),
    ])

    expect(keys1).toEqual(keys2)
    expect(keys2).toEqual(keys3)
    expect(fetchMock).toHaveBeenCalledTimes(1)
})

it("detects key rotation", async () => {
    const rotated = vi.fn()
    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["key-1"])))

    const cache = new JwksCache({ ttlMs: 0, onKeyRotation: rotated })

    await cache.getKeys(JWKS_URI)
    expect(rotated).not.toHaveBeenCalled()

    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["key-2"])))
    await cache.getKeys(JWKS_URI)

    expect(rotated).toHaveBeenCalledWith(["key-1"], ["key-2"])
})

it("clears the cache", async () => {
    fetchMock.mockResponse(JSON.stringify(makeJwks(["key-1"])))

    const cache = new JwksCache()
    await cache.getKeys(JWKS_URI)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    cache.clear()

    await cache.getKeys(JWKS_URI)
    expect(fetchMock).toHaveBeenCalledTimes(2)
})

it("handles timeout via AbortController", async () => {
    fetchMock.mockImplementationOnce(
        () =>
            new Promise((resolve) =>
                setTimeout(
                    () => resolve({ status: 200, body: JSON.stringify(makeJwks(["key-1"])) }),
                    10_000,
                ),
            ),
    )

    const cache = new JwksCache({ timeoutMs: 50, maxRetries: 1 })
    await expect(cache.getKeys(JWKS_URI)).rejects.toThrow()
})
