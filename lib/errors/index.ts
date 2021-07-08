export const UnauthorizedError = (code, error) => {
    // const name = "UnauthorizedError";
    const message = error.message;
    Error.call(this, message);
    Error.captureStackTrace(this);
    // const code = code;
    // const status = 401;
    // const inner = error;
  }
  
UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;