import { afterEach, beforeEach, expect, it, vi } from "vitest"
import createFetchMock from "vitest-fetch-mock"
import { JwksEndpointError } from "../../errors/jwks-endpoint"
import {
    type IJwksCacheEntry,
    type IJwksCacheStore,
    JwksCache,
    MemoryJwksCacheStore,
} from "./jwks-cache"

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

it("reports status 0 when fetch resolves without a response", async () => {
    fetchMock.mockImplementationOnce(() => Promise.resolve(undefined as unknown as Response))

    const cache = new JwksCache({ maxRetries: 1 })
    const error = await cache.getKeys(JWKS_URI).catch((e) => e)

    expect(error).toBeInstanceOf(JwksEndpointError)
    expect(error.statusCode).toBe(0)
})

it("treats a JWKS response without a keys array as empty", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ keys: "not-an-array" }))

    const cache = new JwksCache()
    await expect(cache.getKeys(JWKS_URI)).resolves.toEqual([])
})

const makeStore = () => {
    const entries = new Map<string, IJwksCacheEntry>()
    return {
        entries,
        get: vi.fn(async (key: string) => entries.get(key)),
        set: vi.fn(async (key: string, entry: IJwksCacheEntry) => {
            entries.set(key, JSON.parse(JSON.stringify(entry)))
        }),
        delete: vi.fn(async (key: string) => {
            entries.delete(key)
        }),
    } satisfies IJwksCacheStore & { entries: Map<string, IJwksCacheEntry> }
}

it("reads and writes through a custom store with a key prefix and TTL hint", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["key-1"])))
    const store = makeStore()

    const writer = new JwksCache({ store, keyPrefix: "tenant-a:", ttlMs: 1_000 })
    await writer.getKeys(JWKS_URI)
    expect(store.set).toHaveBeenCalledWith(
        `tenant-a:${JWKS_URI}`,
        expect.objectContaining({ kids: ["key-1"] }),
        1_000,
    )

    // A second instance sharing the store, e.g. another worker isolate, does not refetch.
    const reader = new JwksCache({ store, keyPrefix: "tenant-a:" })
    const keys = await reader.getKeys(JWKS_URI)
    expect(keys[0].kid).toBe("key-1")
    expect(fetchMock).toHaveBeenCalledTimes(1)
})

it("falls back to fetching when the store fails", async () => {
    fetchMock.mockResponse(JSON.stringify(makeJwks(["key-1"])))
    const store: IJwksCacheStore = {
        get: () => {
            throw new Error("store down")
        },
        set: async () => {
            throw new Error("store down")
        },
        delete: () => undefined,
    }

    const cache = new JwksCache({ store })
    await expect(cache.getKeys(JWKS_URI)).resolves.toHaveLength(1)
    await expect(cache.getKeys(JWKS_URI)).resolves.toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
})

it("clears a store that supports clear and tolerates one that does not", async () => {
    const clearable = { ...makeStore(), clear: vi.fn() }
    await new JwksCache({ store: clearable }).clear()
    expect(clearable.clear).toHaveBeenCalled()

    await expect(new JwksCache({ store: makeStore() }).clear()).resolves.toBeUndefined()
})

it("detects key rotation from an entry in the store", async () => {
    const store = makeStore()
    store.entries.set(`keylab:jwks:${JWKS_URI}`, { keys: [], kids: ["old"], fetchedAt: 0 })
    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["new"])))
    const onKeyRotation = vi.fn()

    await new JwksCache({ store, onKeyRotation }).getKeys(JWKS_URI)

    expect(onKeyRotation).toHaveBeenCalledWith(["old"], ["new"])
})

it("refresh refetches only after the minimum refresh interval", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["key-1"])))
    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["key-2"])))

    const cooling = new JwksCache({ minRefreshIntervalMs: 60_000 })
    await cooling.getKeys(JWKS_URI)
    const cached = await cooling.refresh(JWKS_URI)
    expect(cached[0].kid).toBe("key-1")
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const eager = new JwksCache({ minRefreshIntervalMs: 0 })
    const refreshed = await eager.refresh(JWKS_URI)
    expect(refreshed[0].kid).toBe("key-2")
    expect(fetchMock).toHaveBeenCalledTimes(2)
})

it("does not retry client errors but retries rate limits", async () => {
    fetchMock.mockResponse("", { status: 404 })
    await expect(new JwksCache({ maxRetries: 3 }).getKeys(JWKS_URI)).rejects.toThrow(
        JwksEndpointError,
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)

    fetchMock.resetMocks()
    fetchMock.mockResponseOnce("", { status: 429 })
    fetchMock.mockResponseOnce(JSON.stringify(makeJwks(["key-1"])))
    await expect(new JwksCache({ maxRetries: 2 }).getKeys(JWKS_URI)).resolves.toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
})

it("MemoryJwksCacheStore supports get, set, delete, and clear", () => {
    const store = new MemoryJwksCacheStore()
    const entry = { keys: [], kids: [], fetchedAt: 1 }

    store.set("a", entry)
    expect(store.get("a")).toBe(entry)
    store.delete("a")
    expect(store.get("a")).toBeUndefined()
    store.set("b", entry)
    store.clear()
    expect(store.get("b")).toBeUndefined()
})
