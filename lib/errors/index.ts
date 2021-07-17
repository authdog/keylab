import { JsonWebTokenError } from "jsonwebtoken";
import { UnauthorizedError } from "./unauthorized";
import { EnvironmentError } from "./environment";
import * as c from "../constants";

export const throwUnauthorized = (message?: string) => {
    throw new UnauthorizedError("unauthorized", {
        message: message || c.GENERIC_UNAUTHORIZED_MESSAGE
    });
};

export const throwJwtError = (message?: string) => {
    throw new JsonWebTokenError(message || c.JWT_GENERIC_ERROR_MESSAGE);
};

export const throwEnvironmentError = (message?: string) => {
    throw new EnvironmentError(message || c.CODE_NOT_RUNNING_IN_BROWSER);
};
