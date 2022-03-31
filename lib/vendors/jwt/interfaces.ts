import {JwtAlgorithmsEnum as Algs} from '../../enums'

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
    // | Algs.ES256K
// | "ecdsa-pss"
// | "ed25519"
// | "ed448"
// | "x25519"
// | "x448";

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
    keyFormat: "pem";
    // passphrase?: string;
}

export interface IKeyPair {
    publicKey: string;
    privateKey: string;
}
