import * as e from "../../errors";

export const isServer = (): boolean => {
    // @ts-ignore
    return !(typeof window !== "undefined" && window.document);
};

/**
 * set to true if the code if executed on the server
 */
export const IS_NODEJS = isServer();

/**
 * native browser function following the method passed a parameter if it exists
 * @param method (e.g: atob)
 * @returns browserImplementation
 */
export const getClientWindowMethod = (method: string) => {
    let browserImplementation;
    if (!IS_NODEJS) {
        // @ts-ignore
        browserImplementation = window[method];
        if (browserImplementation) {
            return browserImplementation;
        } else {
            throw new Error("function not implemented");
        }
    } else {
        e.throwEnvironmentError();
    }
};

/**
 * `atob` is an helper function to decode a payload to base64
 * returns polyfill function based on the environment
 * browser: returns native window `atob` implementation
 * nodejs: returns buffer based `atob` implementation
 */
export const atob = IS_NODEJS
    ? (a: string) => Buffer.from(a, "base64").toString("binary")
    : getClientWindowMethod("atob");

/**
 * btoa is an helper function to encode a payload to base64
 * returns polyfill function based on the environment
 * browser: returns native window btoa implementation
 * nodejs: returns buffer based btoa implementation
 */
export const btoa = IS_NODEJS
    ? (b: string) => Buffer.from(b).toString("base64")
    : getClientWindowMethod("btoa");
