import { msg } from "../../errors"
import { InsufficientScopeError } from "../../errors/insufficient-scope"
import { JsonWebTokenError } from "../../errors/jwt-error"
import { TOKEN_EXPIRED } from "../../errors/messages"
import { TokenExpiredError } from "../../errors/token-expired"

export interface IRequiredClaims {
    requiredIssuer?: string
    requiredAudiences?: string[]
    requiredScopes?: string[]
}

/**
 * Reads granted scopes from `scp` (array, or a space- or comma-separated string),
 * falling back to the OAuth `scope` claim. Throws when `scp` has another type.
 */
export const extractScopes = (payload: Record<string, unknown>): string[] => {
    const scp = payload.scp ?? payload.scope
    if (scp === undefined || scp === null) {
        return []
    }
    if (Array.isArray(scp)) {
        return scp.filter((scope): scope is string => typeof scope === "string")
    }
    if (typeof scp === "string") {
        return scp.split(/[\s,]+/).filter(Boolean)
    }
    throw new Error(msg.INVALID_SCOPE_FIELD_TYPE)
}

export const hasRequiredScopes = (payload: Record<string, unknown>, requiredScopes: string[]) => {
    const granted = extractScopes(payload)
    return requiredScopes.every((scope) => granted.includes(scope))
}

export const assertRequiredScopes = (
    payload: Record<string, unknown>,
    requiredScopes: string[] | undefined,
) => {
    if (!requiredScopes?.length) {
        return
    }

    let satisfied = false
    try {
        satisfied = hasRequiredScopes(payload, requiredScopes)
    } catch {
        satisfied = false
    }

    if (!satisfied) {
        throw new InsufficientScopeError(requiredScopes)
    }
}

const assertTimestamp = (payload: Record<string, unknown>, claim: "exp" | "nbf") => {
    const value = payload[claim]
    if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value))) {
        throw new JsonWebTokenError(`"${claim}" claim must be a number`)
    }
    return value as number | undefined
}

/**
 * Enforces time, issuer, audience, and scope requirements on an already verified payload,
 * so every verification path applies them the same way. The portable verifiers check only
 * the signature, so this is where their tokens expire.
 */
export const assertClaims = (payload: Record<string, unknown>, claims: IRequiredClaims = {}) => {
    const { requiredIssuer, requiredAudiences, requiredScopes } = claims
    const now = Math.floor(Date.now() / 1000)

    const exp = assertTimestamp(payload, "exp")
    if (exp !== undefined && exp <= now) {
        throw new TokenExpiredError(TOKEN_EXPIRED, new Date(exp * 1000))
    }

    const nbf = assertTimestamp(payload, "nbf")
    if (nbf !== undefined && nbf > now) {
        throw new JsonWebTokenError('"nbf" claim timestamp check failed')
    }

    if (requiredIssuer && payload.iss !== requiredIssuer) {
        throw new JsonWebTokenError('unexpected "iss" claim value')
    }

    if (requiredAudiences?.length) {
        const aud = payload.aud
        const audiences = Array.isArray(aud) ? aud : typeof aud === "string" ? [aud] : []
        if (!requiredAudiences.some((required) => audiences.includes(required))) {
            throw new JsonWebTokenError('unexpected "aud" claim value')
        }
    }

    assertRequiredScopes(payload, requiredScopes)
}
