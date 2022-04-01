import { pem2jwk } from "pem-jwk";
import { default as jwkToPem } from "jwk-to-pem";

export const convertPemToJwk = (pem: string) => {
    return pem2jwk(pem);
};

export const convertJwkToPem = (jwk: any) => {
    return jwkToPem(jwk);
};
