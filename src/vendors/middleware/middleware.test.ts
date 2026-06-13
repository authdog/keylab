import { expect, it, vi } from "vitest"
import { JwtAlgorithmsEnum as Algs } from "../../enums"
import { signJwtWithPrivateKey } from "../jwt/jwt-sign"
import { createJwtHandler, createJwtMiddleware } from "./middleware"

const SECRET = "middleware-test-secret"

const createValidToken = async () => {
    return signJwtWithPrivateKey(
        {
            sub: "user-1",
            exp: Math.floor(Date.now() / 1000) + 3600,
        },
        Algs.HS256,
        SECRET,
    )
}

it("middleware sets req.auth on valid token", async () => {
    const token = await createValidToken()
    const middleware = createJwtMiddleware({ secret: SECRET })

    const req = { headers: { authorization: `Bearer ${token}` } } as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.auth).toBeTruthy()
    expect(res.status).not.toHaveBeenCalled()
})

it("middleware responds 401 on missing header", async () => {
    const middleware = createJwtMiddleware({ secret: SECRET })

    const req = { headers: {} } as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
})

it("middleware responds 401 on invalid token", async () => {
    const middleware = createJwtMiddleware({ secret: SECRET })

    const req = { headers: { authorization: "Bearer invalid.token.here" } } as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
})

it("middleware uses custom getHeaders", async () => {
    const token = await createValidToken()
    const middleware = createJwtMiddleware({
        secret: SECRET,
        getHeaders: (req) => ({ Authorization: `Bearer ${req.customToken}` }),
    })

    const req = { customToken: token } as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.auth).toBeTruthy()
})

it("middleware uses custom onError", async () => {
    const onError = vi.fn()
    const middleware = createJwtMiddleware({ secret: SECRET, onError })

    const req = { headers: {} } as any
    const res = {} as any
    const next = vi.fn()

    await middleware(req, res, next)

    expect(onError).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
})

it("handler returns success for valid token", async () => {
    const token = await createValidToken()
    const handler = createJwtHandler({ secret: SECRET })

    const request = {
        headers: new Headers({ authorization: `Bearer ${token}` }),
    }

    const result = await handler(request)
    expect(result.success).toBe(true)
    expect(result.auth).toBeTruthy()
})

it("handler supports Headers object", async () => {
    const token = await createValidToken()
    const handler = createJwtHandler({ secret: SECRET })

    const headers = new Headers()
    headers.set("Authorization", `Bearer ${token}`)

    const result = await handler({ headers })
    expect(result.success).toBe(true)
})

it("handler returns error for invalid token", async () => {
    const handler = createJwtHandler({ secret: SECRET })

    const result = await handler({
        headers: { authorization: "Bearer bad.token.value" },
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
})
