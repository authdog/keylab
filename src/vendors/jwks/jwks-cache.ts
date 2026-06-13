import { JwksEndpointError } from "../../errors/jwks-endpoint"

export interface IJwksCacheOptions {
    /** Cache TTL in milliseconds (default: 600000 = 10 minutes) */
    ttlMs?: number
    /** Maximum retry attempts (default: 3) */
    maxRetries?: number
    /** Request timeout in milliseconds (default: 5000) */
    timeoutMs?: number
    /** Callback fired when key rotation is detected */
    onKeyRotation?: (oldKids: string[], newKids: string[]) => void
}

interface CacheEntry {
    keys: any[]
    kids: string[]
    fetchedAt: number
}

const DEFAULT_TTL_MS = 600_000
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_TIMEOUT_MS = 5_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class JwksCache {
    private cache = new Map<string, CacheEntry>()
    private inflight = new Map<string, Promise<any[]>>()
    private ttlMs: number
    private maxRetries: number
    private timeoutMs: number
    private onKeyRotation?: (oldKids: string[], newKids: string[]) => void

    constructor(options: IJwksCacheOptions = {}) {
        this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
        this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
        this.onKeyRotation = options.onKeyRotation
    }

    async getKeys(jwksUri: string, headers: Record<string, string> = {}): Promise<any[]> {
        const cached = this.cache.get(jwksUri)
        if (cached && Date.now() - cached.fetchedAt < this.ttlMs) {
            return cached.keys
        }

        const existing = this.inflight.get(jwksUri)
        if (existing) {
            return existing
        }

        const promise = this.fetchWithRetry(jwksUri, headers)
        this.inflight.set(jwksUri, promise)

        try {
            return await promise
        } finally {
            this.inflight.delete(jwksUri)
        }
    }

    clear(): void {
        this.cache.clear()
        this.inflight.clear()
    }

    private async fetchWithRetry(jwksUri: string, headers: Record<string, string>): Promise<any[]> {
        let lastError: Error | null = null

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                return await this.fetchOnce(jwksUri, headers)
            } catch (error) {
                lastError = error as Error
                if (attempt < this.maxRetries - 1) {
                    await sleep(2 ** attempt * 100)
                }
            }
        }

        throw lastError
    }

    private async fetchOnce(jwksUri: string, headers: Record<string, string>): Promise<any[]> {
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

            const oldEntry = this.cache.get(jwksUri)
            if (oldEntry && this.onKeyRotation) {
                const oldKids = oldEntry.kids
                if (JSON.stringify(oldKids) !== JSON.stringify(newKids)) {
                    this.onKeyRotation(oldKids, newKids)
                }
            }

            this.cache.set(jwksUri, {
                keys,
                kids: newKids,
                fetchedAt: Date.now(),
            })

            return keys
        } finally {
            clearTimeout(timeout)
        }
    }
}
