import type { CompactJWEHeaderParameters, JWK, KeyLike } from "jose"
import { CompactEncrypt, compactDecrypt, importJWK, importPKCS8, importSPKI } from "jose"

export interface IEncryptJweOptions {
    /** JWE key management algorithm (e.g. "RSA-OAEP", "ECDH-ES", "A256KW", "dir") */
    alg: string
    /** Content encryption algorithm (e.g. "A256GCM", "A128CBC-HS256") */
    enc: string
    /** The public key or symmetric key to encrypt with (PEM string, JWK object, or raw secret) */
    key: string | JWK | Uint8Array
    /** Optional Key ID to include in the JWE header */
    kid?: string
}

export interface IDecryptJweOptions {
    /** The private key or symmetric key to decrypt with (PEM string, JWK object, or raw secret) */
    key: string | JWK | Uint8Array
    /** Expected algorithms — if provided, the JWE alg/enc must match */
    expectedAlg?: string
    expectedEnc?: string
}

export interface IDecryptedJwe {
    plaintext: string
    protectedHeader: CompactJWEHeaderParameters
}

const resolveKey = async (
    key: string | JWK | Uint8Array,
    alg: string,
    isPrivate: boolean,
): Promise<KeyLike | Uint8Array> => {
    if (key instanceof Uint8Array) {
        return key
    }

    if (typeof key === "object" && key !== null && "kty" in key) {
        return (await importJWK(key as JWK, alg)) as KeyLike
    }

    if (typeof key === "string") {
        if (isPrivate) {
            return await importPKCS8(key, alg)
        }
        return await importSPKI(key, alg)
    }

    throw new Error("Unsupported key format for JWE")
}

/**
 * Encrypt plaintext into a JWE compact serialization string.
 */
export const encryptJwe = async (
    plaintext: string,
    options: IEncryptJweOptions,
): Promise<string> => {
    const { alg, enc, key, kid } = options
    const resolvedKey = await resolveKey(key, alg, false)

    const header: CompactJWEHeaderParameters = { alg, enc }
    if (kid) {
        header.kid = kid
    }

    const jwe = await new CompactEncrypt(new TextEncoder().encode(plaintext))
        .setProtectedHeader(header)
        .encrypt(resolvedKey)

    return jwe
}

/**
 * Decrypt a JWE compact serialization string back to plaintext.
 */
export const decryptJwe = async (
    compact: string,
    options: IDecryptJweOptions,
): Promise<IDecryptedJwe> => {
    const { key, expectedAlg } = options
    const algForImport = expectedAlg || "RSA-OAEP"
    const resolvedKey = await resolveKey(key, algForImport, true)

    const { plaintext, protectedHeader } = await compactDecrypt(compact, resolvedKey)

    return {
        plaintext: new TextDecoder().decode(plaintext),
        protectedHeader: protectedHeader as CompactJWEHeaderParameters,
    }
}
