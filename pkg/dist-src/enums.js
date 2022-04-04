// https://www.rfc-editor.org/rfc/pdfrfc/rfc7518.txt.pdf
// section 3.1
export let JwtAlgorithmsEnum; // https://datatracker.ietf.org/doc/html/rfc7517#section-4.2

(function (JwtAlgorithmsEnum) {
  JwtAlgorithmsEnum["HS256"] = "HS256";
  JwtAlgorithmsEnum["HS384"] = "HS384";
  JwtAlgorithmsEnum["HS512"] = "HS512";
  JwtAlgorithmsEnum["RS256"] = "RS256";
  JwtAlgorithmsEnum["RS384"] = "RS384";
  JwtAlgorithmsEnum["RS512"] = "RS512";
  JwtAlgorithmsEnum["ES256"] = "ES256";
  JwtAlgorithmsEnum["ES384"] = "ES384";
  JwtAlgorithmsEnum["ES512"] = "ES512";
  JwtAlgorithmsEnum["PS256"] = "PS256";
  JwtAlgorithmsEnum["PS384"] = "PS384";
  JwtAlgorithmsEnum["PS512"] = "PS512";
  JwtAlgorithmsEnum["RSAPSS"] = "RSA-PSS";
  JwtAlgorithmsEnum["EdDSA"] = "EdDSA";
  JwtAlgorithmsEnum["ES256K"] = "ES256K";
  JwtAlgorithmsEnum["Ed25519"] = "Ed25519";
  JwtAlgorithmsEnum["X25519"] = "X25519";
})(JwtAlgorithmsEnum || (JwtAlgorithmsEnum = {}));

export let JwtPublicKeyUse;

(function (JwtPublicKeyUse) {
  JwtPublicKeyUse["SIGNATURE"] = "sig";
  JwtPublicKeyUse["ENCRYPTION"] = "enc";
})(JwtPublicKeyUse || (JwtPublicKeyUse = {}));

export let JwtKeyTypes;

(function (JwtKeyTypes) {
  JwtKeyTypes["OCTET"] = "oct";
  JwtKeyTypes["RSA"] = "rsa";
  JwtKeyTypes["EC"] = "ec";
  JwtKeyTypes["OKP"] = "ed25519";
  JwtKeyTypes["JWT"] = "jwt";
})(JwtKeyTypes || (JwtKeyTypes = {}));

export let JwtParts;

(function (JwtParts) {
  JwtParts["HEADER"] = "header";
  JwtParts["PAYLOAD"] = "payload";
  JwtParts["SIGNATURE"] = "signature";
})(JwtParts || (JwtParts = {}));