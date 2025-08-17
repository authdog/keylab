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
    EdDSA = "EdDSA",
    ES256K = "ES256K",
    Ed25519 = "Ed25519",
    X25519 = "X25519",
    Ed448 = "Ed448",
    X448 = "X448",
    // web crypto
    RSA_PKCS1 = "RSASSA-PKCS1-v1_5",
    RSA_PSS = "RSA-PSS", // similar to RSAPSS
    EC_P256 = "PS256",
    EC_P384 = "PS384",
    EC_P521 = "PS512"
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
