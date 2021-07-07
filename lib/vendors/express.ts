var jwt = require('jsonwebtoken');
import {UnauthorizedError }  from '../errors';
import * as unless from 'express-unless';
import async from 'async';
import set from 'lodash.set';
import { DEFAULT_REVOKED_FUNCTION, isFunction, wrapStaticSecretInCallback } from '../utils';
import * as c from '../constants'

import {CustomReqExpress, CustomResExpress} from '../../types'
import { REGEX_BEARER_HEADERS } from '../constants';

const asyncExpressJwtLib = (options) => {
  if (!options || !options.secret) throw new Error(c.SECRET_MUST_BE_SET_MSG);

  if (!options.algorithms) throw new Error(c.ALGORITHMS_MUST_BE_SET_MSG);
  if (!Array.isArray(options.algorithms)) throw new Error(c.ALGORITHMS_MUST_BE_ARR_MSG);

  let secretCallback = options.secret;

  if (!isFunction(secretCallback)){
    secretCallback = wrapStaticSecretInCallback(secretCallback);
  }

  const isRevokedCallback = options.isRevoked || DEFAULT_REVOKED_FUNCTION;

  const _requestProperty = options.userProperty || options.requestProperty || 'user';
  const _resultProperty = options.resultProperty;
  const credentialsRequired = typeof options.credentialsRequired === 'undefined' ? true : options.credentialsRequired;

  var middleware = (req: CustomReqExpress, res: CustomResExpress, next: Function) => {
    var token;

    if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
      var hasAuthInAccessControl = !!~req
                                    .headers['access-control-request-headers']
                                    .split(',')
                                      .map((header: string) => header.trim()).indexOf('authorization');

      if (hasAuthInAccessControl) {
        return next();
      }
    }

    if (options.getToken && typeof options.getToken === 'function') {
      try {
        token = options.getToken(req);
      } catch (e) {
        return next(e);
      }
    } else if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        const [scheme, credentials] = parts;

        if (REGEX_BEARER_HEADERS.test(scheme)) {
          token = credentials;
        } else {
          if (credentialsRequired) {
            return next(new UnauthorizedError('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' }));
          } else {
            return next();
          }
        }
      } else {
        return next(new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' }));
      }
    }

    if (!token) {
      if (credentialsRequired) {
        return next(new UnauthorizedError('credentials_required', { message: 'No authorization token was found' }));
      } else {
        return next();
      }
    }

    let decoded;

    try {
      decoded = jwt.decode(token, { complete: true }) || {};
    } catch (err) {
      return next(new UnauthorizedError('invalid_token', err));
    }

    const checkRevoked = (decoded: any, callback: Function) => {
      const payload = decoded?.payload;
      isRevokedCallback(req, payload, (err, revoked: boolean) => {
        if (err) {
          callback(err);
        }
        else if (revoked) {
          callback(new UnauthorizedError('revoked_token', {message: 'The token has been revoked.'}));
        } else {
          callback(null, decoded);
        }
      });
    }

    const getSecret = (callback: Function) => {
        var arity = secretCallback.length;
        if (arity == 4) {
          secretCallback(req, decoded.header, decoded.payload, callback);
        } else { // arity == 3
          secretCallback(req, decoded.payload, callback);
        }
    }

    const verifyToken = (secret, callback) => {
        jwt.verify(token, secret, options, (err, decoded) => {
          if (err) {
            callback(new UnauthorizedError('invalid_token', err));
          } else {
            callback(null, decoded);
          }
        });
      }

    async.waterfall([
        getSecret,
        verifyToken,
        checkRevoked
    ], (err, result) => {
      if (err) { return next(err); }
      if (_resultProperty) {
        set(res, _resultProperty, result);
      } else {
        set(req, _requestProperty, result);
      }
      next();
    });
  };

  // @ts-ignore
  middleware.unless = unless;
  // @ts-ignore
  middleware.UnauthorizedError = UnauthorizedError;

  return middleware;
};

module.exports.UnauthorizedError = UnauthorizedError;
export {asyncExpressJwtLib};