export interface IDecodedJwt {
    iss?: string;
    aud?: string[] | string;
    sub?: string;
    iat: number;
    exp: number;
    scp?: string;
}