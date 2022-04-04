import * as e from "../../errors/index.js";
import * as c from "../../constants.js";
export const isServer = () => {
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

export const getClientWindowMethod = method => {
  let browserImplementation;

  if (!IS_NODEJS) {
    // @ts-ignore
    browserImplementation = window[method];

    if (browserImplementation) {
      return browserImplementation;
    } else {
      throw new Error(c.GLOBAL_FUNCTION_NOT_IMPLEMENTED);
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

export const atob = IS_NODEJS ? a => Buffer.from(a, "base64").toString("binary") : getClientWindowMethod("atob");
/**
 * btoa is an helper function to encode a payload to base64
 * returns polyfill function based on the environment
 * browser: returns native window btoa implementation
 * nodejs: returns buffer based btoa implementation
 */

export const btoa = IS_NODEJS ? b => Buffer.from(b).toString("base64") : getClientWindowMethod("btoa");