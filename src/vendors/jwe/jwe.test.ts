import { exportJWK, exportPKCS8, exportSPKI, generateKeyPair } from "jose"
import { expect, it } from "vitest"
import { decryptJwe, encryptJwe } from "./jwe"

it("round-trips JWE with RSA-OAEP + A256GCM using PEM keys", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RSA-OAEP", {
        extractable: true,
        modulusLength: 2048,
    })
    const pubPem = await exportSPKI(publicKey)
    const privPem = await exportPKCS8(privateKey)

    const plaintext = "Hello, JWE with RSA-OAEP!"
    const jwe = await encryptJwe(plaintext, {
        alg: "RSA-OAEP",
        enc: "A256GCM",
        key: pubPem,
    })

    expect(typeof jwe).toBe("string")
    expect(jwe.split(".")).toHaveLength(5)

    const result = await decryptJwe(jwe, {
        key: privPem,
        expectedAlg: "RSA-OAEP",
    })

    expect(result.plaintext).toBe(plaintext)
    expect(result.protectedHeader.alg).toBe("RSA-OAEP")
    expect(result.protectedHeader.enc).toBe("A256GCM")
})

it("round-trips JWE with RSA-OAEP + A256GCM using JWK keys", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RSA-OAEP", {
        extractable: true,
        modulusLength: 2048,
    })
    const pubJwk = await exportJWK(publicKey)
    const privJwk = await exportJWK(privateKey)

    const plaintext = "Hello, JWE with JWK!"
    const jwe = await encryptJwe(plaintext, {
        alg: "RSA-OAEP",
        enc: "A128CBC-HS256",
        key: pubJwk,
    })

    const result = await decryptJwe(jwe, {
        key: privJwk,
        expectedAlg: "RSA-OAEP",
    })

    expect(result.plaintext).toBe(plaintext)
})

it("round-trips JWE with ECDH-ES using JWK keys", async () => {
    const { publicKey, privateKey } = await generateKeyPair("ECDH-ES", {
        extractable: true,
    })
    const pubJwk = await exportJWK(publicKey)
    const privJwk = await exportJWK(privateKey)

    const plaintext = "Encrypted with ECDH-ES"
    const jwe = await encryptJwe(plaintext, {
        alg: "ECDH-ES",
        enc: "A256GCM",
        key: pubJwk,
    })

    const result = await decryptJwe(jwe, {
        key: privJwk,
        expectedAlg: "ECDH-ES",
    })

    expect(result.plaintext).toBe(plaintext)
})

it("round-trips JWE with symmetric key (dir + A256GCM)", async () => {
    const secret = crypto.getRandomValues(new Uint8Array(32))

    const plaintext = "Symmetric JWE test"
    const jwe = await encryptJwe(plaintext, {
        alg: "dir",
        enc: "A256GCM",
        key: secret,
    })

    const result = await decryptJwe(jwe, {
        key: secret,
        expectedAlg: "dir",
    })

    expect(result.plaintext).toBe(plaintext)
})

it("rejects decryption with wrong key", async () => {
    const { publicKey } = await generateKeyPair("RSA-OAEP", {
        extractable: true,
        modulusLength: 2048,
    })
    const pubJwk = await exportJWK(publicKey)

    const { privateKey: wrongPrivateKey } = await generateKeyPair("RSA-OAEP", {
        extractable: true,
        modulusLength: 2048,
    })
    const wrongPrivJwk = await exportJWK(wrongPrivateKey)

    const jwe = await encryptJwe("secret data", {
        alg: "RSA-OAEP",
        enc: "A256GCM",
        key: pubJwk,
    })

    await expect(
        decryptJwe(jwe, {
            key: wrongPrivJwk,
            expectedAlg: "RSA-OAEP",
        }),
    ).rejects.toThrow()
})

it("propagates kid in JWE header", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RSA-OAEP", {
        extractable: true,
        modulusLength: 2048,
    })
    const pubJwk = await exportJWK(publicKey)
    const privJwk = await exportJWK(privateKey)

    const jwe = await encryptJwe("kid test", {
        alg: "RSA-OAEP",
        enc: "A256GCM",
        key: pubJwk,
        kid: "my-key-id",
    })

    const result = await decryptJwe(jwe, {
        key: privJwk,
        expectedAlg: "RSA-OAEP",
    })

    expect(result.protectedHeader.kid).toBe("my-key-id")
})
