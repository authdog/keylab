const isServer = () => {
    // @ts-ignore
    return !(typeof window != "undefined" && window.document);
};

const getClientWindowMethod = (method: string) => {
    if (!isServer()) {
        // @ts-ignore
        return window[method];
    } else {
        throw new Error("code is not executed in the browser");
    }
};

const IS_NODEJS = isServer();

// decode
export const atob = IS_NODEJS
    ? (a: string) => Buffer.from(a, "base64").toString("binary")
    : getClientWindowMethod("atob");
// encode
export const btoa = IS_NODEJS
    ? (b: string) => Buffer.from(b).toString("base64")
    : getClientWindowMethod("btoa");
