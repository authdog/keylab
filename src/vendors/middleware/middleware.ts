import { extractBearerTokenFromHeaders } from "../headers/headers"
import type { ITokenExtractedWithPubKey } from "../jwks/jwks"
import type { IcheckTokenValidnessCredentials } from "../jwt/jwt_d"
import { checkTokenValidness } from "../jwt/jwt-verify"

export interface IMiddlewareOptions extends IcheckTokenValidnessCredentials {
    /** Custom function to extract headers from the request (for non-Express frameworks) */
    getHeaders?: (req: any) => Record<string, string>
    /** Custom error handler */
    onError?: (error: Error, req: any, res: any) => void
}

export interface IJwtHandlerResult {
    success: boolean
    auth?: ITokenExtractedWithPubKey | boolean
    error?: Error
}

const headersToRecord = (headers: any): Record<string, string> => {
    if (headers instanceof Headers) {
        const record: Record<string, string> = {}
        headers.forEach((value, key) => {
            record[key] = value
        })
        return record
    }
    return headers || {}
}

/**
 * Express-compatible JWT middleware.
 * Sets `req.auth` on success, calls `next(error)` or responds 401 on failure.
 */
export const createJwtMiddleware = (options: IMiddlewareOptions) => {
    return async (req: any, res: any, next: any) => {
        try {
            const headers = options.getHeaders
                ? options.getHeaders(req)
                : headersToRecord(req.headers)

            const token = extractBearerTokenFromHeaders(headers)

            const result = await checkTokenValidness(token, {
                secret: options.secret,
                jwksUri: options.jwksUri,
                verifySsl: options.verifySsl,
                adhoc: options.adhoc,
                requiredScopes: options.requiredScopes,
                publicKey: options.publicKey,
            })

            req.auth = result
            next()
        } catch (error) {
            if (options.onError) {
                options.onError(error as Error, req, res)
            } else {
                res.status(401).json({ error: "Unauthorized" })
            }
        }
    }
}

/**
 * Generic async JWT handler for Workers, Bun, and Deno.
 * Accepts a Request-like object with headers, returns a result object.
 */
export const createJwtHandler = (options: IMiddlewareOptions) => {
    return async (request: {
        headers: Headers | Record<string, string>
    }): Promise<IJwtHandlerResult> => {
        try {
            const headers = options.getHeaders
                ? options.getHeaders(request)
                : headersToRecord(request.headers)

            const token = extractBearerTokenFromHeaders(headers)

            const result = await checkTokenValidness(token, {
                secret: options.secret,
                jwksUri: options.jwksUri,
                verifySsl: options.verifySsl,
                adhoc: options.adhoc,
                requiredScopes: options.requiredScopes,
                publicKey: options.publicKey,
            })

            return { success: true, auth: result }
        } catch (error) {
            return { success: false, error: error as Error }
        }
    }
}
