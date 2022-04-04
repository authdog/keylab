export class UnauthorizedError extends Error {
  code = 401;

  constructor(id, {
    message
  }) {
    super(message);
    this.name = "UnauthorizedError";
    Error.call(this, message);
    Error.captureStackTrace(this);
  }

}