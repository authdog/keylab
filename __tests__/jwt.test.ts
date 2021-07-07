var jwt = require('jsonwebtoken');
var assert = require('assert');

var expressjwt = require('../lib');

var req = {};
var res = {};

it('should throw if options not set', function() {
    try {
      expressjwt();
    } catch(e) {
      assert.ok(e);
    //   assert.equal(e.message, 'secret should be set');
    }
  });

// it('should work with a secretCallback function that accepts header argument', function() {
//     var secret = 'shhhhhh';
//     var secretCallback = function(req, headers, payload, cb) {
//       assert.equal(headers.alg, 'HS256');
//       assert.equal(payload.foo, 'bar');
//       process.nextTick(function(){ return cb(null, secret) });
//     }
//     var token = jwt.sign({foo: 'bar'}, secret);

//     req.headers = {};
//     req.headers.authorization = 'Bearer ' + token;
//     expressjwt({secret: secretCallback, algorithms: ['HS256']})(req, res, function() {
//       assert.equal('bar', req.user.foo);
//     });
//   });
// });