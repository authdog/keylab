import { JwtAlgorithmsEnum as Algs } from "../../enums";
import { getKeyPair, signJwtWithPrivateKey } from "../jwt/jwt-sign";
import * as jws from "jws";

it("test verify token with pem", async () => {
    const keyPairES256 = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.ES256,
        keySize: 4096
    });

    expect(keyPairES256?.privateKey).toBeTruthy();
    expect(keyPairES256?.publicKey).toBeTruthy();

    expect(typeof keyPairES256?.publicKey === "string");
    expect(typeof keyPairES256?.privateKey === "string");

    const signedPayloadEs256 = await signJwtWithPrivateKey(
        {
            urn: "urn:test:test"
        },
        Algs.ES256,
        keyPairES256.privateKey,
        {
            kid: keyPairES256?.kid
        }
    );
    expect(signedPayloadEs256).toBeTruthy();

    expect(
        jws.verify(signedPayloadEs256, Algs.ES256, keyPairES256.publicKey)
    ).toBeTruthy();

    // const withCatchBlock = () => {
    //     try {
    //         jws.verify("ddddddddd", Algs.ES256, keyPairES256.publicKey)
    //     } catch(e) {
    //         throw (e)
    //     }
    // } 

    // expect(withCatchBlock()).toThrow(
    //     "TypeError: ECDSA signature must be a Base64 string or a Buffer"
    // );
});
