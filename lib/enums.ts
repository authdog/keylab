// https://www.rfc-editor.org/rfc/pdfrfc/rfc7518.txt.pdf
// section 3.1
export enum JwtAlgorithmsEnum {
    HS256 = "HS256", // ok
    HS384 = "HS384", // to be tested
    HS512 = "HS512", // to be tested
    RS256 = "RS256", // ok
    RS384 = "RS384", // ok
    RS512 = "RS512", // ok
    ES256 = "ES256", // not supported yet
    ES384 = "ES384", // not supported yet
    ES512 = "ES512", // not supported yet
    PS256 = "PS256", // ok
    PS384 = "PS384", // ok
    PS512 = "PS512", // ok
    EdDSA = "EdDSA", // not supported yet
    ES256K = "ES256K" // not supported yet
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
    JWT = "JWT" // JSON Web Token key type
}
