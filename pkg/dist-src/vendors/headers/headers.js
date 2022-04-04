import { UnauthorizedError } from "../../errors/unauthorized.js";
import * as c from "../../constants.js";
export const extractBearerTokenFromHeaders = (headers, keyAuthorization = "Authorization") => {
  let token;
  let fieldCredentials = "";

  if (headers?.[keyAuthorization.toLowerCase()]) {
    fieldCredentials = keyAuthorization.toLowerCase();
  } else if (headers?.[keyAuthorization]) {
    fieldCredentials = keyAuthorization;
  } else {
    throw new UnauthorizedError(c.HEADERS_CREDENTIALS_BAD_SCHEME, {
      message: c.HEADERS_CREDENTIALS_FORMAT
    });
  }

  const parts = headers[fieldCredentials].split(" ");

  if (parts.length == 2) {
    const [scheme, credentials] = parts;

    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    } else {
      throw new UnauthorizedError(c.HEADERS_CREDENTIALS_BAD_SCHEME, {
        message: c.HEADERS_CREDENTIALS_FORMAT
      });
    }
  } else {
    throw new UnauthorizedError(c.HEADERS_CREDENTIALS_BAD_FORMAT, {
      message: c.HEADERS_CREDENTIALS_FORMAT
    });
  }

  return token;
};