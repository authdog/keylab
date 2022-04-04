import { extractBearerTokenFromHeaders } from "./headers.js";
import * as c from "../../constants.js";
it("extracts properly Bearer token from req", () => {
  expect(extractBearerTokenFromHeaders({
    authorization: "Bearer eyJ0eXAiOiJK"
  })).toEqual("eyJ0eXAiOiJK");
});
it("extracts properly Bearer token from req with custom header name", () => {
  expect(extractBearerTokenFromHeaders({
    "x-authorization-zzz": "Bearer eyJ0eXAiOiJK"
  }, "x-authorization-zzz")).toEqual("eyJ0eXAiOiJK");
});
it("throws an exception is credentials scheme is incorrect", () => {
  expect(() => {
    extractBearerTokenFromHeaders({
      foo: "bar"
    });
  }).toThrowError(c.HEADERS_CREDENTIALS_FORMAT);
  expect(() => {
    extractBearerTokenFromHeaders({});
  }).toThrowError(c.HEADERS_CREDENTIALS_FORMAT);
});