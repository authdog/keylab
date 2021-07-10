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
    PS384 = "PS384"
}

// https://datatracker.ietf.org/doc/html/rfc7517#section-4.2
export enum JwtPublicKeyUse {
    SIGNATURE = "sig",
    ENCRYPTION = "enc"
}

export enum JwtKeyTypes {
    RSA = "RSA", // Require a public / private key pair (of type RSA)
    EC = "EC", // elliptic curve
    OKP = "OKP", // Edwards-curve Octet Key Pair: https://datatracker.ietf.org/doc/html/rfc8032
    JWT = "JWT" // Require a private key for validation
}