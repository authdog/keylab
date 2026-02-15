// https://www.rfc-editor.org/rfc/pdfrfc/rfc7518.txt.pdf
// section 3.1
export enum JwtAlgorithmsEnum {
    HS256 = "HS256",
    HS384 = "HS384",
    HS512 = "HS512",
    RS256 = "RS256",
    RS384 = "RS384",
    RS512 = "RS512",
    ES256 = "ES256",
    ES384 = "ES384",
    ES512 = "ES512",
    PS256 = "PS256",
    PS384 = "PS384",
    PS512 = "PS512",
    RSAPSS = "RSA-PSS",
    RSA_PSS = "RSA-PSS",
    EdDSA = "EdDSA",
    ES256K = "ES256K",
    Ed25519 = "Ed25519",
    X25519 = "X25519",
    Ed448 = "Ed448",
    X448 = "X448",
    // RSA-OAEP algorithms for key wrapping/encryption
    RSA_OAEP = "RSA-OAEP",
    RSA_OAEP_256 = "RSA-OAEP-256",
    RSA_OAEP_384 = "RSA-OAEP-384",
    RSA_OAEP_512 = "RSA-OAEP-512",
    // RSA1_5
    RSA1_5 = "RSA1_5",
    // ECDH key agreement algorithms
    ECDH_ES = "ECDH-ES",
    ECDH_ES_A128KW = "ECDH-ES+A128KW",
    ECDH_ES_A192KW = "ECDH-ES+A192KW",
    ECDH_ES_A256KW = "ECDH-ES+A256KW",
    // AES Key Wrap
    A128KW = "A128KW",
    A192KW = "A192KW",
    A256KW = "A256KW",
    // Direct
    DIR = "dir",
    // AES GCM Key Wrap
    A128GCMKW = "A128GCMKW",
    A192GCMKW = "A192GCMKW",
    A256GCMKW = "A256GCMKW",
    // PBES2
    PBES2_HS256_A128KW = "PBES2-HS256+A128KW",
    PBES2_HS384_A192KW = "PBES2-HS384+A192KW",
    PBES2_HS512_A256KW = "PBES2-HS512+A256KW"
}

// https://datatracker.ietf.org/doc/html/rfc7517#section-4.2
export enum JwtPublicKeyUse {
    SIGNATURE = "sig",
    ENCRYPTION = "enc"
}

export enum JwtKeyTypes {
    OCTET = "oct", // utilized by HS algorithms, use a simple binary for its key
    RSA = "rsa", // Rivest–Shamir–Adleman
    EC = "ec", // elliptic curve
    OKP = "okp", // Edwards-curve Octet Key Pair: https://datatracker.ietf.org/doc/html/rfc8032
    JWT = "jwt" // JSON Web Token key type
}

export enum JwtParts {
    HEADER = "header",
    PAYLOAD = "payload",
    SIGNATURE = "signature"
}
