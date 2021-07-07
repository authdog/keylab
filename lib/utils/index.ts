// export const checkRevoked = (decoded: any, callback: Function) => {
//     isRevokedCallback(req, dtoken.payload, function (err, revoked) {
//       if (err) {
//         callback(err);
//       }
//       else if (revoked) {
//         callback(new UnauthorizedError('revoked_token', {message: 'The token has been revoked.'}));
//       } else {
//         callback(null, decoded);
//       }
//     });
//   }