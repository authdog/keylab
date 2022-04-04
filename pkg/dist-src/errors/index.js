import { JsonWebTokenError } from "jsonwebtoken";
import { UnauthorizedError } from "./unauthorized.js";
import { EnvironmentError } from "./environment.js";
import * as c from "../constants.js";
export const throwUnauthorized = message => {
  throw new UnauthorizedError("unauthorized", {
    message: message || c.GENERIC_UNAUTHORIZED_MESSAGE
  });
};
export const throwJwtError = message => {
  throw new JsonWebTokenError(message || c.JWT_GENERIC_ERROR_MESSAGE);
};
export const throwEnvironmentError = message => {
  throw new EnvironmentError(message || c.CODE_NOT_RUNNING_IN_BROWSER);
};
export * as msg from "./messages.js";