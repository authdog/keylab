import * as enums from "./enums";

export * from "./errors/messages";

export const JWT_SUPPORTED_ALGS = Object.values(enums.JwtAlgorithmsEnum);
export const JWT_PUBLIC_KEY_USES = Object.values(enums.JwtPublicKeyUse);

export const AUTHDOG_ID_ISSUER = "https://id.authdog.com";
export const AUTHDOG_JWKS_API_ID = "v1";

export const EMPTY_STRING = "";
