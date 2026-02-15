import { JwtAlgorithmsEnum as Algs } from "../../enums";

type AlgorithmIdentifier =
    | Algs.HS256
    | Algs.HS384
    | Algs.HS512
    | Algs.RS256
    | Algs.RS384
    | Algs.RS512
    | Algs.ES256
    | Algs.ES384
    | Algs.ES512
    | Algs.PS256
    | Algs.PS384
    | Algs.PS512
    | Algs.EdDSA
    | Algs.RSAPSS
    | Algs.RSA_PSS
    | Algs.ES256K
    | Algs.Ed25519
    | Algs.Ed448
    | Algs.X25519
    | Algs.X448
    | Algs.RSA_OAEP
    | Algs.RSA_OAEP_256
    | Algs.RSA_OAEP_384
    | Algs.RSA_OAEP_512
    | Algs.ECDH_ES
    | Algs.ECDH_ES_A128KW
    | Algs.ECDH_ES_A192KW
    | Algs.ECDH_ES_A256KW
    | Algs.RSA1_5
    | Algs.A128KW
    | Algs.A192KW
    | Algs.A256KW
    | Algs.DIR
    | Algs.A128GCMKW
    | Algs.A192GCMKW
    | Algs.A256GCMKW
    | Algs.PBES2_HS256_A128KW
    | Algs.PBES2_HS384_A192KW
    | Algs.PBES2_HS512_A256KW;

export interface IDecodedJwt {
    iss?: string;
    aud?: string[] | string;
    sub?: string;
    iat: number;
    exp: number;
    scp?: string[] | string; // scopes can be separated by space or comma
}

export interface IGetKeyPair {
    algorithmIdentifier: AlgorithmIdentifier;
    keySize: number;
    keyFormat?: "pem" | "jwk"; // can also be a binary certificate
}

export interface IJwkPrivateKey {
    kty: "RSA" | "EC" | "oct" | "OKP";
    use: "sig" | "enc";
    kid: string;
    n?: string; // RSA modulus
    e?: string; // RSA exponent
    d?: string; // RSA/EC private exponent
    p?: string; // RSA first prime factor
    q?: string; // RSA second prime factor
    dp?: string; // RSA first factor CRT exponent
    dq?: string; // RSA second factor CRT exponent
    qi?: string; // RSA first CRT coefficient
    k?: string; // Symmetric key value
    x?: string; // EC/OKP x coordinate
    y?: string; // EC y coordinate
    crv?: string; // Curve name
    x5c?: string[];
    x5t?: string;
    x5tS256?: string;
    ext?: any;
}

export interface IJwkPublicKey {
    kty: "RSA" | "EC" | "oct" | "OKP";
    use: "sig" | "enc";
    kid: string;
    n?: string; // RSA modulus
    e?: string; // RSA exponent
    x?: string; // EC/OKP x coordinate
    y?: string; // EC y coordinate
    crv?: string; // Curve name
    x5c?: string[];
    x5t?: string;
    x5tS256?: string;
    ext?: any;
}

export interface IKeyPair {
    publicKey: string & IJwkPublicKey;
    privateKey: string & IJwkPrivateKey;
    kid: string;
}
