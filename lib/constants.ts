import * as enums from "./enums";

export * from "./errors/messages";

export const JWT_SUPPORTED_ALGS = Object.values(enums.JwtAlgorithmsEnum);
export const JWT_PUBLIC_KEY_USES = Object.values(enums.JwtPublicKeyUse);

export const AUTHDOG_ID_ISSUER = "https://id.authdog.com";
export const AUTHDOG_JWKS_API_ID = "v1";

export const EMPTY_STRING = "";

export const CHARS = {
    SPACE: " ",
    EMPTY_STRING: "",
    NEW_LINE: "\n",
    TAB: "\t",
    CARRIAGE_RETURN: "\r",
    COMMA: ","
    // COLON: ":",
    // SEMICOLON: ";",
    // DOT: ".",
    // DASH: "-",
    // UNDERSCORE: "_",
    // PLUS: "+",
    // EQUALS: "=",
    // ASTERISK: "*",
    // SLASH: "/",
    // BACKSLASH: "\\",
    // OPEN_BRACKET: "[",
    // CLOSE_BRACKET: "]",
    // OPEN_BRACE: "{",
    // CLOSE_BRACE: "}",
    // OPEN_PARENTHESIS: "(",
    // CLOSE_PARENTHESIS: ")",
    // OPEN_ANGLE_BRACKET: "<",
    // CLOSE_ANGLE_BRACKET: ">",
};

export const publicKeyEncodingPem = {
    type: "spki",
    format: "pem"
};

export const privateKeyEncodingPem = {
    type: "pkcs8",
    format: "jwk"
};

export const namedCurves = {
    es256: "P-256",
    es384: "P-384",
    es512: "P-521",
    eddsa: "ED25519"
};

export const PEM_CHARS = {
    start: "-----BEGIN",
    end: "-----"
};
