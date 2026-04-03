import { afterEach, expect, test, vi } from "vitest"
import { btoa, atob, getClientWindowMethod, IS_NODEJS, isServer } from "./ponyfills"

import * as c from "../../constants"

afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
})

test("encodes and decodes properly with ponyfilled atob and btoa", () => {
    expect(btoa("hello world")).toEqual("aGVsbG8gd29ybGQ=")
    expect(atob("aGVsbG8gd29ybGQ=")).toEqual("hello world")
})

test("should throw an error if client is trying to access window based methods", () => {
    const existingBrowserFunctionName = "atob"

    if (IS_NODEJS) {
        expect(() => {
            getClientWindowMethod(existingBrowserFunctionName)
        }).toThrowError(c.CODE_NOT_RUNNING_IN_BROWSER)
    } else {
        expect(() => {
            getClientWindowMethod(existingBrowserFunctionName)
        }).toBeTruthy()
    }
})

test("isServer should return true when executed on the server", () => {
    expect(isServer()).toEqual(IS_NODEJS)
})

test("returns native browser method when available", async () => {
    vi.resetModules()
    vi.stubGlobal("document", {})
    const browserAtob = vi.fn()
    vi.stubGlobal("atob", browserAtob)

    const ponyfills = await import("./ponyfills")

    expect(ponyfills.IS_NODEJS).toBe(false)
    expect(ponyfills.isServer()).toBe(false)
    expect(ponyfills.getClientWindowMethod("atob")).toBe(browserAtob)
})

test("throws when browser global method is missing", async () => {
    vi.resetModules()
    vi.stubGlobal("document", {})
    vi.stubGlobal("atob", undefined)
    await expect(import("./ponyfills")).rejects.toThrowError(c.GLOBAL_FUNCTION_NOT_IMPLEMENTED)
})
