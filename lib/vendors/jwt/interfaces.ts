type AlgorithmIdentifier =
    | "rsa256"
    | "rsa384"
    | "rsa512"
    | "es256"
    | "es384"
    | "es512"
    | "ps256"
    | "ps384"
    | "ps521"
    | "rsa-pss"
    | "eddsa"
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
