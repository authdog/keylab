import {
    btoa,
    atob,
    getClientWindowMethod,
    IS_NODEJS,
    isServer
} from "./ponyfills";
import { EnvironmentError } from "../../errors/environment";

test("encodes and decodes properly with ponyfilled atob and btoa", () => {
    expect(btoa("hello world")).toEqual("aGVsbG8gd29ybGQ=");
    expect(atob("aGVsbG8gd29ybGQ=")).toEqual("hello world");
});

test("should throw an error if client is trying to access window based methods", () => {
    const existingBrowserFunctionName = "atob";

    if (IS_NODEJS) {
        expect(() => {
            getClientWindowMethod(existingBrowserFunctionName);
        }).toThrowError(EnvironmentError);
    } else {
        expect(() => {
            getClientWindowMethod(existingBrowserFunctionName);
        }).toBeTruthy();
    }
});

test("isServer should return true when executed on the server", () => {
    expect(isServer()).toEqual(IS_NODEJS);
});
