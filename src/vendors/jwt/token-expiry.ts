import { JwtParts } from "../../enums"
import { parseJwt } from "./jwt-verify"

/**
 * Checks whether a JWT token has expired based on its `exp` claim.
 * Returns true if expired or if the token has no `exp` claim.
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = parseJwt(token, JwtParts.PAYLOAD)
    if (typeof payload?.exp !== "number") {
        return true
    }
    return Math.floor(Date.now() / 1000) >= payload.exp
}

/**
 * Returns the number of seconds until the token expires.
 * Returns 0 if already expired.
 * Returns -1 if the token has no `exp` claim.
 */
export const getTimeToExpiry = (token: string): number => {
    const payload = parseJwt(token, JwtParts.PAYLOAD)
    if (typeof payload?.exp !== "number") {
        return -1
    }
    const remaining = payload.exp - Math.floor(Date.now() / 1000)
    return remaining > 0 ? remaining : 0
}
