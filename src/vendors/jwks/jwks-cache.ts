import { JwksEndpointError } from "../../errors/jwks-endpoint"

/** A JSON Web Key Set as stored by a cache adapter. Must survive JSON serialization. */
export interface IJwksCacheEntry {
    keys: any[]
    kids: string[]
    fetchedAt: number
}

type MaybePromise<T> = T | Promise<T>

/**
 * Storage adapter for `JwksCache`, e.g. an in-memory map, Cloudflare Workers KV, or Redis.
 * `ttlMs` is a hint for stores that expire entries themselves; `JwksCache` also checks
 * `fetchedAt`, so a store may ignore it.
 */
export interface IJwksCacheStore {
    get(key: string): MaybePromise<IJwksCacheEntry | undefined | null>
    set(key: string, entry: IJwksCacheEntry, ttlMs: number): MaybePromise<void>
    delete(key: string): MaybePromise<void>
    /** Optional: remove every entry this cache wrote. */
    clear?(): MaybePromise<void>
}

export interface IJwksCacheOptions {
    /** Cache TTL in milliseconds (default: 600000 = 10 minutes) */
    ttlMs?: number
    /** Maximum fetch attempts (default: 3) */
    maxRetries?: number
    /** Request timeout in milliseconds (default: 5000) */
    timeoutMs?: number
    /** Callback fired when key rotation is detected */
    onKeyRotation?: (oldKids: string[], newKids: string[]) => void
    /** Storage adapter (default: in-memory, per cache instance) */
    store?: IJwksCacheStore
    /** Prefix for store keys, useful when the store is shared (default: "keylab:jwks:") */
    keyPrefix?: string
    /** Minimum age of an entry before `refresh` refetches it (default: 30000) */
    minRefreshIntervalMs?: number
}

const DEFAULT_TTL_MS = 600_000
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_TIMEOUT_MS = 5_000
const DEFAULT_KEY_PREFIX = "keylab:jwks:"
const DEFAULT_MIN_REFRESH_INTERVAL_MS = 30_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Client errors other than timeouts and rate limits will not succeed on retry.
const isRetryable = (error: unknown) =>
    !(error instanceof JwksEndpointError) ||
    error.statusCode < 400 ||
    error.statusCode >= 500 ||
    error.statusCode === 408 ||
    error.statusCode === 429

/** Default `IJwksCacheStore`: a process-local map. */
export class MemoryJwksCacheStore implements IJwksCacheStore {
    private entries = new Map<string, IJwksCacheEntry>()

    get(key: string) {
        return this.entries.get(key)
    }

    set(key: string, entry: IJwksCacheEntry) {
        this.entries.set(key, entry)
    }

    delete(key: string) {
        this.entries.delete(key)
    }

    clear() {
        this.entries.clear()
    }
}

export class JwksCache {
    private store: IJwksCacheStore
    private inflight = new Map<string, Promise<any[]>>()
    private ttlMs: number
    private maxRetries: number
    private timeoutMs: number
    private keyPrefix: string
    private minRefreshIntervalMs: number
    private onKeyRotation?: (oldKids: string[], newKids: string[]) => void

    constructor(options: IJwksCacheOptions = {}) {
        this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
        this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
        this.onKeyRotation = options.onKeyRotation
        this.store = options.store ?? new MemoryJwksCacheStore()
        this.keyPrefix = options.keyPrefix ?? DEFAULT_KEY_PREFIX
        this.minRefreshIntervalMs = options.minRefreshIntervalMs ?? DEFAULT_MIN_REFRESH_INTERVAL_MS
    }

    async getKeys(jwksUri: string, headers: Record<string, string> = {}): Promise<any[]> {
        const cached = await this.read(jwksUri)
        if (cached && Date.now() - cached.fetchedAt < this.ttlMs) {
            return cached.keys
        }

        return this.fetchDeduplicated(jwksUri, headers, cached)
    }

    /**
     * Refetches the key set, e.g. when a token names a `kid` the cached set lacks.
     * Within `minRefreshIntervalMs` of the last fetch it returns the cached keys instead,
     * so unknown `kid` values cannot force a fetch per request.
     */
    async refresh(jwksUri: string, headers: Record<string, string> = {}): Promise<any[]> {
        const cached = await this.read(jwksUri)
        if (cached && Date.now() - cached.fetchedAt < this.minRefreshIntervalMs) {
            return cached.keys
        }

        return this.fetchDeduplicated(jwksUri, headers, cached)
    }

    async clear(): Promise<void> {
        this.inflight.clear()
        await this.store.clear?.()
    }

    private storeKey(jwksUri: string) {
        return `${this.keyPrefix}${jwksUri}`
    }

    // A failing store degrades to fetching; it never fails verification on its own.
    private async read(jwksUri: string): Promise<IJwksCacheEntry | undefined> {
        try {
            return (await this.store.get(this.storeKey(jwksUri))) ?? undefined
        } catch {
            return undefined
        }
    }

    private async write(jwksUri: string, entry: IJwksCacheEntry) {
        try {
            await this.store.set(this.storeKey(jwksUri), entry, this.ttlMs)
        } catch {
            // Keys are still returned to the caller; the next call refetches.
        }
    }

    private async fetchDeduplicated(
        jwksUri: string,
        headers: Record<string, string>,
        previous: IJwksCacheEntry | undefined,
    ): Promise<any[]> {
        const existing = this.inflight.get(jwksUri)
        if (existing) {
            return existing
        }

        const promise = this.fetchWithRetry(jwksUri, headers, previous)
        this.inflight.set(jwksUri, promise)

        try {
            return await promise
        } finally {
            this.inflight.delete(jwksUri)
        }
    }

    private async fetchWithRetry(
        jwksUri: string,
        headers: Record<string, string>,
        previous: IJwksCacheEntry | undefined,
    ): Promise<any[]> {
        let lastError: unknown = null

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                return await this.fetchOnce(jwksUri, headers, previous)
            } catch (error) {
                lastError = error
                if (!isRetryable(error)) {
                    break
                }
                if (attempt < this.maxRetries - 1) {
                    await sleep(2 ** attempt * 100)
                }
            }
        }

        throw lastError
    }

    private async fetchOnce(
        jwksUri: string,
        headers: Record<string, string>,
        previous: IJwksCacheEntry | undefined,
    ): Promise<any[]> {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

        try {
            const response = await (globalThis as any).fetch(jwksUri, {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "authdog-agent",
                    ...headers,
                },
                signal: controller.signal,
            })

            if (!response?.ok) {
                throw new JwksEndpointError(
                    "Expected 200 OK from the JSON Web Key Set HTTP response",
                    response?.status || 0,
                )
            }

            const jwksJson = await response.json()
            const keys = Array.isArray(jwksJson?.keys) ? jwksJson.keys : []
            const newKids = keys
                .map((k: any) => k?.kid)
                .filter(Boolean)
                .sort()

            if (previous && this.onKeyRotation) {
                if (JSON.stringify(previous.kids) !== JSON.stringify(newKids)) {
                    this.onKeyRotation(previous.kids, newKids)
                }
            }

            await this.write(jwksUri, { keys, kids: newKids, fetchedAt: Date.now() })

            return keys
        } finally {
            clearTimeout(timeout)
        }
    }
}
