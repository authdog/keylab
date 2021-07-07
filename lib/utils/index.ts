export const DEFAULT_REVOKED_FUNCTION = (_: any, __: any, cb: Function) => cb(null, false);

export const isFunction = (object) => Object
  .prototype.toString.call(object) === '[object Function]';

export const wrapStaticSecretInCallback = (secret: Function) => {
    return (_: any, __: any, cb: Function) => cb(null, secret);
  }