'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decode = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var decode = exports.decode = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(token) {
    var decoded, payload, kid, key;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            decoded = _jsonwebtoken2.default.decode(token, { complete: true });
            payload = decoded.payload;
            kid = decoded.header.kid;

            if (signingKey) {
              _context.next = 8;
              break;
            }

            _context.next = 6;
            return getSigningKey(kid);

          case 6:
            key = _context.sent;

            signingKey = key.publicKey || key.rsaPublicKey;

          case 8:
            return _context.abrupt('return', new Promise(function (resolve, reject) {
              try {
                _jsonwebtoken2.default.verify(token, signingKey, { algorithms: [AUTHO_ALG] });
                resolve(payload);
              } catch (err) {
                reject(err);
              }
            }));

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function decode(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.isIn = isIn;
exports.queryPortal = queryPortal;
exports.getSigningKey = getSigningKey;
exports.getTokenHeader = getTokenHeader;
exports.authflow = authflow;
exports.sign = sign;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _jwksRsa = require('jwks-rsa');

var _jwksRsa2 = _interopRequireDefault(_jwksRsa);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORTAL_DOMAIN = process.env.PORTAL_DOMAIN || 'portal.arup.digital';
var AUTHO_ALG = process.env.AUTH_ALG || 'RS256';
var CLAIM_NAMESPACE = process.env.AUTHZ_NAMESPACE || 'http://authz.arup.digital/authorization';
var JWKS_URI = process.env.JWKS_URI || 'https://arupdigital.au.auth0.com/.well-known/jwks.json';

var KEY = process.env.KEY || (Math.random().toString(36) + '00000000000000000').slice(2, 10 + 2);
var TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || Math.floor(Date.now() / 1000) + 60 * 60; //or seconds

var signingKey = void 0;

function isIn(a, b) {
  var aSet = new Set(a);
  var bSet = new Set(b);

  return new Set([].concat((0, _toConsumableArray3.default)(aSet)).filter(function (d) {
    return bSet.has(d);
  })).size > 0;
}

function queryPortal(auth0Id) {
  return new Promise(function (resolve, reject) {
    var postData = JSON.stringify({
      query: 'query test($auth0Id: String){userGroups(auth0Id: $auth0Id)}',
      variables: { auth0Id: auth0Id }
    });
    var postOptions = {
      host: PORTAL_DOMAIN,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    var req = _https2.default.request(postOptions, function (res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode));
      }
      var body = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      // resolve on end
      res.on('end', function () {
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (e) {
          return reject(e);
        }
        return resolve(body);
      });
    });
    // reject on request error
    req.on('error', function (err) {
      return reject(err);
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function getSigningKey(kid) {
  return new Promise(function (resolve, reject) {
    var jwk = (0, _jwksRsa2.default)({
      cache: true,
      cacheMaxEntries: 5,
      jwksUri: JWKS_URI
    });

    jwk.getSigningKey(kid, function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function getTokenHeader(headers) {
  var authorization = headers.authorization || headers.Authorization;
  return authorization && authorization.split(' ')[0] === 'Bearer' ? authorization.split(' ')[1] : null;
}

function authflow(token) {
  return new Promise(function (resolve, reject) {
    return decode(token).then(function (payload) {
      resolve(payload[CLAIM_NAMESPACE]);
    }).catch(function (err) {
      reject(err);
    });
  });
}

function sign(data) {
  return _jsonwebtoken2.default.sign({
    exp: TOKEN_EXPIRY,
    data: JSON.stringify(data)
  }, KEY);
}