import { convertJwkToPem, convertPemToJwk } from "./pem";

it("convert PEM to jwk", () => {
    const t = convertPemToJwk(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAukqO14W99HkYw2l9bbxx
OoLP1AcwV3D+Fr5Yk8FMNRyARJ2Gikd1/2OXaD7gDrHkIAvGQmhOvGOuODl19wi5
ccHVVxa7lYLeV4Dysjph2QvxgK2vQSMbb1Kbi6wjzDIf/lRpSMELFykLT+56kti4
FFX5YbGTSRnN6Knennsp7g5++LwvTrEK9BgTzzFgNflHbmJTaBy0pdtoXK84mgKG
Yao2rweaNQATDAIfwcbk4blMuAcKBvAl0kp5J/5IOvDQyOMiHpRDVSWOaaEQ2QsT
eafelNgLuLb7Rlo8jijsRr0QQA25othOTFEhzXhfZXnL4XDF3g5pH4j5zm83SNFh
twIDAQAB
-----END PUBLIC KEY-----`);

    expect(t?.kty).toBeTruthy();
    expect(t?.n).toBeTruthy();
    expect(t?.e).toBeTruthy();
});

it("converts jwk to PEM", () => {
    const jwk = {
        kty: "RSA",
        n: "ukqO14W99HkYw2l9bbxxOoLP1AcwV3D-Fr5Yk8FMNRyARJ2Gikd1_2OXaD7gDrHkIAvGQmhOvGOuODl19wi5ccHVVxa7lYLeV4Dysjph2QvxgK2vQSMbb1Kbi6wjzDIf_lRpSMELFykLT-56kti4FFX5YbGTSRnN6Knennsp7g5--LwvTrEK9BgTzzFgNflHbmJTaBy0pdtoXK84mgKGYao2rweaNQATDAIfwcbk4blMuAcKBvAl0kp5J_5IOvDQyOMiHpRDVSWOaaEQ2QsTeafelNgLuLb7Rlo8jijsRr0QQA25othOTFEhzXhfZXnL4XDF3g5pH4j5zm83SNFhtw",
        e: "AQAB"
    };
    const pem = convertJwkToPem(jwk);
    expect(pem.startsWith("-----BEGIN PUBLIC KEY-----"));
    expect(pem.endsWith("-----END PUBLIC KEY-----"));
});
