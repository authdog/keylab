import { btoa, atob } from "./ponyfills";

test("encodes and decodes properly with ponyfilled atob and btoa", () => {
  expect(btoa("hello world")).toEqual("aGVsbG8gd29ybGQ=");
  expect(atob("aGVsbG8gd29ybGQ=")).toEqual("hello world");
});
