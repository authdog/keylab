// import { getKeyPair } from './jwt-sign';
import { getKeyPair } from "./jwt-sign";
import { strToUint8Array, uint8ArrayToStr, isValidPemString } from "./utils";
import { JwtAlgorithmsEnum as Algs } from "../../enums";

const {
    // createPublicKey,
    createPrivateKey
} = require("crypto");

it("test strToUint8Array conversion", async () => {
    const str = "hello world";
    const buf = strToUint8Array(str);
    expect(uint8ArrayToStr(buf)).toBe(str);
});

it("test isValidPem", async () => {
    const pem = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAukqO14W99HkYw2l9bbxx
    OoLP1AcwV3D+Fr5Yk8FMNRyARJ2Gikd1/2OXaD7gDrHkIAvGQmhOvGOuODl19wi5
    ccHVVxa7lYLeV4Dysjph2QvxgK2vQSMbb1Kbi6wjzDIf/lRpSMELFykLT+56kti4
    FFX5YbGTSRnN6Knennsp7g5++LwvTrEK9BgTzzFgNflHbmJTaBy0pdtoXK84mgKG
    Yao2rweaNQATDAIfwcbk4blMuAcKBvAl0kp5J/5IOvDQyOMiHpRDVSWOaaEQ2QsT
    eafelNgLuLb7Rlo8jijsRr0QQA25othOTFEhzXhfZXnL4XDF3g5pH4j5zm83SNFh
    twIDAQAB
    -----END PUBLIC KEY-----`;
    expect(isValidPemString(pem)).toBeTruthy();

    const pem2 = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAukqO14W99HkYw2l9bbxx
    OoLP1AcwV3D+Fr5Yk8FMNRyARJ2Gikd1/2OXaD7gDrHkIAvGQmhOvGOuODl19wi5
    -----END PUBLIC KEY-----`;
    expect(isValidPemString(pem2)).toBeFalsy();

    // generate a RS256 key pair
    const { ["privateKey"]: privRs256 } = await getKeyPair({
        keyFormat: "pem",
        algorithmIdentifier: Algs.RS256,
        keySize: 2048
    });

    const privKeyObj = createPrivateKey(privRs256);

    expect(privKeyObj).toBeTruthy();

    // console.log(privRs256);

    // expect(isValidPemString(privRs256)).toBeTruthy();

    // // generate a RS384 key pair
    // const {["publicKey"]: pubRs384, ["privateKey"]: privRs384} = await getKeyPair({keyFormat: "pem", algorithmIdentifier: Algs.RS384, keySize: 2048});

    // expect(isValidPemString(pubRs384)).toBeTruthy();
    // expect(isValidPemString(privRs384)).toBeTruthy();
});

// it ("tests look like PEM", async () => {
//     const pem = `-----BEGIN PUBLIC KEY-----
//     MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAukqO14W99HkYw2l9bbxx
//     OoLP1AcwV3D+Fr5Yk8FMNRyARJ2Gikd1/2OXaD7gDrHkIAvGQmhOvGOuODl19wi5
//     ccHVVxa7lYLeV4Dysjph2QvxgK2vQSMbb1Kbi6wjzDIf/lRpSMELFykLT+56kti4
//     FFX5YbGTSRnN6Knennsp7g5++LwvTrEK9BgTzzFgNflHbmJTaBy0pdtoXK84mgKG
//     Yao2rweaNQATDAIfwcbk4blMuAcKBvAl0kp5J/5IOvDQyOMiHpRDVSWOaaEQ2QsT
//     eafelNgLuLb7Rlo8jijsRr0QQA25othOTFEhzXhfZXnL4XDF3g5pH4j5zm83SNFh
//     twIDAQAB
//     -----END PUBLIC KEY-----`;

//     expect(looksLikePem(pem)).toBeTruthy();
// })
