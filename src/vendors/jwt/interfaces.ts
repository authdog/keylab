import { JwtAlgorithmsEnum as Algs } from "../../enums";

type AlgorithmIdentifier =
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
    | Algs.ES256K
    | Algs.Ed25519
    | Algs.X25519;

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
    keyFormat: "pem" | "jwk";
}

export interface IJwkPrivateKey {
    kty: "RSA" | "EC" | "oct";
    use: "sig" | "enc";
    kid: string;
    n: string;
    e: string;
    d?: string;
    p?: string;
    q?: string;
    dp?: string;
    dq?: string;
    qi?: string;
    k?: string;
    x?: string;
    y?: string;
    crv?: string;
    x5c?: string[];
    x5t?: string;
    x5tS256?: string;
    ext?: any;
}

export interface IJwkPublicKey {
    kty: "RSA" | "EC" | "oct";
    use: "sig" | "enc";
    kid: string;
    n: string;
    e: string;
    x?: string;
    y?: string;
    crv?: string;
    x5c?: string[];
    x5t?: string;
    x5tS256?: string;
    ext?: any;
}

export interface IKeyPair {
    publicKey: string  & IJwkPublicKey;
    privateKey: string & IJwkPrivateKey;
    kid: string;
}
