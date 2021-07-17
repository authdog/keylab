import { UnauthorizedError } from "../../errors/unauthorized";
import * as c from "../../constants";

export const extractBearerTokenFromHeaders = (headers: any) => {
    let token;
    let fieldCredentials = "";

    if (headers?.authorization) {
        fieldCredentials = "authorization";
    } else if (headers?.Authorization) {
        fieldCredentials = "Authorization";
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
