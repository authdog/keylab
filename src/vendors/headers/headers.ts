import { UnauthorizedError } from "../../errors/unauthorized";
import * as c from "../../constants";

export const extractBearerTokenFromHeaders = (
  headers: Record<string, string>,
  keyAuthorization: string = "Authorization"
): string => {
  const headerKey = Object.keys(headers).find(
    (key) => key.toLowerCase() === keyAuthorization.toLowerCase()
  );

  if (!headerKey) {
    throw new UnauthorizedError(c.HEADERS_CREDENTIALS_BAD_SCHEME, {
      message: c.HEADERS_CREDENTIALS_FORMAT,
    });
  }

  const parts = headers[headerKey].split(" ");
  if (parts.length !== 2) {
    throw new UnauthorizedError(c.HEADERS_CREDENTIALS_BAD_FORMAT, {
      message: c.HEADERS_CREDENTIALS_FORMAT,
    });
  }

  const [scheme, credentials] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    throw new UnauthorizedError(c.HEADERS_CREDENTIALS_BAD_SCHEME, {
      message: c.HEADERS_CREDENTIALS_FORMAT,
    });
  }

  return credentials;
};