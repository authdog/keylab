import { extractBearerTokenFromHeaders } from "./headers";
import * as c from "../../constants";

it("extracts properly Bearer token from req", () => {
    expect(
        extractBearerTokenFromHeaders({
            authorization: "Bearer eyJ0eXAiOiJK"
        })
    ).toEqual("eyJ0eXAiOiJK");
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
