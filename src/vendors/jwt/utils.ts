const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64Lookup: Record<string, number> = {};

for (let index = 0; index < base64Alphabet.length; index++) {
    base64Lookup[base64Alphabet[index]] = index;
}

export const strToUint8Array = (str: string) => textEncoder.encode(str);

export const uint8ArrayToStr = (buf: Uint8Array) => textDecoder.decode(buf);

export const isNodeJs = () => {
    return (
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null
    );
};

export const hasWebCrypto = () =>
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function";

export const getRuntimeCrypto = () => {
    if (!hasWebCrypto()) {
        throw new Error("Web Crypto API is not available in this runtime.");
    }
    return globalThis.crypto;
};

export const getRandomBytes = (size: number) => {
    const bytes = new Uint8Array(size);
    getRuntimeCrypto().getRandomValues(bytes);
    return bytes;
};

export const bytesToHex = (bytes: Uint8Array) =>
    Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");

export const concatBytes = (...arrays: Uint8Array[]) => {
    const size = arrays.reduce((total, chunk) => total + chunk.length, 0);
    const result = new Uint8Array(size);
    let offset = 0;

    for (const chunk of arrays) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return result;
};

export const bytesToBase64 = (bytes: Uint8Array) => {
    let output = "";

    for (let index = 0; index < bytes.length; index += 3) {
        const a = bytes[index];
        const b = bytes[index + 1];
        const c = bytes[index + 2];
        const triplet = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);

        output += base64Alphabet[(triplet >> 18) & 0x3f];
        output += base64Alphabet[(triplet >> 12) & 0x3f];
        output += typeof b === "number" ? base64Alphabet[(triplet >> 6) & 0x3f] : "=";
        output += typeof c === "number" ? base64Alphabet[triplet & 0x3f] : "=";
    }

    return output;
};

export const base64ToBytes = (value: string) => {
    const normalized = value.replace(/\s+/g, "");
    if (normalized.length % 4 !== 0) {
        throw new Error("Invalid base64 string.");
    }

    const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0;
    const bytes = new Uint8Array((normalized.length / 4) * 3 - padding);
    let byteOffset = 0;

    for (let index = 0; index < normalized.length; index += 4) {
        const c1 = base64Lookup[normalized[index]];
        const c2 = base64Lookup[normalized[index + 1]];
        const c3 = normalized[index + 2] === "=" ? 0 : base64Lookup[normalized[index + 2]];
        const c4 = normalized[index + 3] === "=" ? 0 : base64Lookup[normalized[index + 3]];

        const triplet = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
        bytes[byteOffset++] = (triplet >> 16) & 0xff;

        if (normalized[index + 2] !== "=") {
            bytes[byteOffset++] = (triplet >> 8) & 0xff;
        }

        if (normalized[index + 3] !== "=") {
            bytes[byteOffset++] = triplet & 0xff;
        }
    }

    return bytes;
};

export const bytesToBase64Url = (bytes: Uint8Array) =>
    bytesToBase64(bytes).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

export const base64UrlToBase64 = (value: string) => {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const missingPadding = padded.length % 4;
    return missingPadding === 0 ? padded : `${padded}${"=".repeat(4 - missingPadding)}`;
};

export const base64UrlToBytes = (value: string) => base64ToBytes(base64UrlToBase64(value));

export const base64UrlToUtf8 = (value: string) => uint8ArrayToStr(base64UrlToBytes(value));

export const utf8ToBase64Url = (value: string) => bytesToBase64Url(strToUint8Array(value));

export const binaryStringToBytes = (value: string) => {
    const bytes = new Uint8Array(value.length);

    for (let index = 0; index < value.length; index++) {
        bytes[index] = value.charCodeAt(index);
    }

    return bytes;
};

export const bytesToBinaryString = (value: Uint8Array) => {
    let output = "";

    for (const byte of value) {
        output += String.fromCharCode(byte);
    }

    return output;
};

export const normalizeCurveName = (curve?: string) => {
    const value = String(curve || "");
    if (/^ed25519$/i.test(value)) return "Ed25519";
    if (/^ed448$/i.test(value)) return "Ed448";
    if (/^x25519$/i.test(value)) return "X25519";
    if (/^x448$/i.test(value)) return "X448";
    if (/^secp256k1$/i.test(value)) return "secp256k1";
    if (/^p-256$/i.test(value)) return "P-256";
    if (/^p-384$/i.test(value)) return "P-384";
    if (/^p-521$/i.test(value)) return "P-521";
    return curve;
};

export const normalizeJwk = (jwk: any) => {
    if (!jwk || typeof jwk !== "object") {
        return jwk;
    }

    const { alg: _algIgnored, crv, ...rest } = jwk;
    return crv ? { ...rest, crv: normalizeCurveName(crv) } : rest;
};

export const looksLikePem = (value: unknown): value is string =>
    typeof value === "string" && value.includes("-----BEGIN");