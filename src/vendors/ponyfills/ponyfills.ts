import * as e from "../../errors"
import * as c from "../../constants"
import {
    base64ToBytes,
    binaryStringToBytes,
    bytesToBase64,
    bytesToBinaryString,
} from "../jwt/utils"

export const isServer = (): boolean => {
    return typeof document === "undefined"
}

/**
 * set to true if the code if executed on the server
 */
export const IS_NODEJS = isServer()

/**
 * native browser function following the method passed a parameter if it exists
 * @param method (e.g: atob)
 * @returns browserImplementation
 */
export const getClientWindowMethod = (method: string) => {
    if (IS_NODEJS) {
        e.throwEnvironmentError()
    }

    const browserImplementation = (globalThis as any)?.[method]
    if (browserImplementation) {
        return browserImplementation
    }

    throw new Error(c.GLOBAL_FUNCTION_NOT_IMPLEMENTED)
}

/**
 * `atob` is an helper function to decode a payload to base64
 * returns polyfill function based on the environment
 * browser: returns native window `atob` implementation
 * nodejs: returns buffer based `atob` implementation
 */
export const atob = IS_NODEJS
    ? (value: string) => bytesToBinaryString(base64ToBytes(value))
    : getClientWindowMethod("atob")

/**
 * btoa is an helper function to encode a payload to base64
 * returns polyfill function based on the environment
 * browser: returns native window btoa implementation
 * nodejs: returns buffer based btoa implementation
 */
export const btoa = IS_NODEJS
    ? (value: string) => bytesToBase64(binaryStringToBytes(value))
    : getClientWindowMethod("btoa")
