import { JwtAlgorithmsEnum as Algs, JwtKeyTypes } from "../../enums.js";
import { importPKCS8, importJWK, SignJWT } from "jose";
import { generateKeyPair, randomBytes } from "crypto";
import * as c from "../../constants.js";
import { strToUint8Array } from "./utils.js";
export const signJwtWithPrivateKey = async (payload, alg, privateKey, opts = {}) => {
  let privateKeyObj;

  if (privateKey?.kty) {
    privateKeyObj = await importJWK(privateKey, alg);
  } else {
    try {
      privateKeyObj = await importPKCS8(privateKey, alg);
    } catch (e) {
      if ([Algs.HS256, Algs.HS384, Algs.HS512].includes(alg)) {
        privateKeyObj = strToUint8Array(privateKey);
      } else {
        throw new Error(`Invalid private key for algorithm ${alg}`);
      }
    }
  }

  return await new SignJWT({ ...payload,
    ...opts
  }).setProtectedHeader({
    alg,
    type: JwtKeyTypes?.JWT
  }).sign(privateKeyObj);
};
const algorithmsDict = [{
  algType: JwtKeyTypes.RSA,
  algIds: Object.values([Algs?.RS256, Algs?.RS384, Algs?.RS512, Algs?.RSAPSS])
}, {
  algType: JwtKeyTypes.EC,
  algIds: Object.values([Algs?.ES256, Algs?.ES384, Algs?.ES512, Algs?.EdDSA, Algs?.ES256K])
}, {
  algType: JwtKeyTypes.OCTET,
  algIds: Object.values([Algs?.HS256, Algs?.HS384, Algs?.HS512])
}, {
  algType: JwtKeyTypes.OKP,
  algIds: Object.values([Algs?.EdDSA])
}, {
  algType: Algs.Ed25519,
  algIds: Object.values([Algs?.Ed25519])
}, {
  algType: Algs.X25519,
  algIds: Object.values([Algs?.X25519])
}];
export const getKeyPair = async ({
  algorithmIdentifier,
  keySize
}) => {
  return new Promise((resolve, reject) => {
    let algType;
    algorithmsDict.map(el => {
      if (el.algIds.includes(algorithmIdentifier)) {
        algType = el.algType;
      }
    });
    const useCurve = algType === JwtKeyTypes.EC;
    generateKeyPair(algType, {
      namedCurve: useCurve ? c.namedCurves?.[algorithmIdentifier.toLowerCase()] : undefined,
      modulusLength: keySize,
      publicKeyEncoding: { ...c.publicKeyEncodingPem
      },
      privateKeyEncoding: { ...c.privateKeyEncodingPem
      }
    }, (err, publicKey, privateKey) => {
      if (err) return reject(err); // TODO: define kid length in constants

      const kid = randomBytes(16).toString("hex");
      resolve({
        publicKey,
        privateKey,
        kid
      });
    });
  });
};