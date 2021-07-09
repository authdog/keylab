import { JsonWebTokenError } from "jsonwebtoken";
import { UnauthorizedError } from "./unauthorized";
import { EnvironmentError } from "./environment";
import * as c from "../constants";

export const throwUnauthorized = (message?: string) => {
    throw new UnauthorizedError(message || "unauthorized");
};

export const throwJwtError = (message?: string) => {
    throw new JsonWebTokenError(message || "error jwt");
};

export const throwEnvironmentError = (message?: string) => {
    throw new EnvironmentError(message || c.CODE_NOT_RUNNING_IN_BROWSER);
};
