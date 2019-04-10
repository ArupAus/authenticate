'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getAccessToken = exports.getToken = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _auth0Lock = require('auth0-lock');

var _auth0Lock2 = _interopRequireDefault(_auth0Lock);

var _authType = require('./authType');

var _authType2 = _interopRequireDefault(_authType);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TOKEN_KEY = process.env.AUTH_TOKEN_KEY || 'portal-token';
var ACCESS_TOKEN_SUFFIX = '-access-token';
var AUTHO_ALG = process.env.AUTH_ALG || 'RS256';
var PORTAL_DOMAIN = process.env.PORTAL_DOMAIN || 'portal.arup.digital';
var AUTH_NAMESPACE = 'http://authz.arup.digital/authorization';

var getToken = exports.getToken = function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
};

var queryPortal = function queryPortal(auth0Id) {
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
};

var getAccessToken = exports.getAccessToken = function getAccessToken() {
  return window.localStorage.getItem(TOKEN_KEY + ACCESS_TOKEN_SUFFIX);
};

var AuthProvider = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(AuthProvider, _Component);
  (0, _createClass3.default)(AuthProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var _this2 = this;

      return {
        auth: {
          loggedIn: this.loggedIn,
          token: this.token,
          accessToken: this.accessToken,
          login: this.login,
          logout: this.logout,
          userInfo: this.userInfo,
          getUserInfo: function getUserInfo() {
            return _this2.getUserInfo();
          },
          getPortalUserGroups: function getPortalUserGroups() {
            return _this2.getPortalUserGroups();
          },
          authError: this.authError,
          getUserInfoPromise: function getUserInfoPromise() {
            return _this2.getUserInfoPromise();
          },
          getUserRolesPromise: function getUserRolesPromise() {
            return _this2.userRolesPromise();
          }
          // TODO getUserInfoPromise, getUserRolesPromise to be phased out
        }
      };
    }
  }]);

  function AuthProvider(props, context) {
    (0, _classCallCheck3.default)(this, AuthProvider);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AuthProvider.__proto__ || Object.getPrototypeOf(AuthProvider)).call(this, props, context));

    _this.getUserInfoPromise = function () {
      //TODO deprecated
      console.warn('getUserInfoPromise is soon to be deprecated, update to use getUserInfo()');
      return new Promise(function (resolve, reject) {
        _this.lock.getUserInfo(_this.accessToken, function (err, profile) {
          if (err) {
            return reject(err);
          }
          return resolve(profile);
        });
      });
    };

    _this.getUserRolesPromise = function (token) {
      //TODO deprecated
      console.warn('getUserRolesPromise is soon to be deprecated, update to use getUserInfo()');
      _this.userRolesPromise = new Promise(function (resolve, reject) {
        _this.auth.client.userInfo(token, function (err, profile) {
          if (err) {
            return reject(err);
          }
          var roles = profile[authorizationIdx] && profile[AUTH_NAMESPACE].roles ? profile[authorizationIdx].roles : [];
          return resolve(roles);
        });
      });
    };

    _this.login = function (error) {
      if (error) {
        _this.lock.show({
          flashMessage: {
            type: 'error',
            text: error
          }
        });
      } else {
        _this.lock.show();
      }
    };

    _this.authError = function (error) {
      _this.lock.show({
        flashMessage: {
          type: 'error',
          text: error
        }
      });
    };

    _this.doAuthentication = function (authResult) {
      _this.setToken(authResult.idToken);
      _this.token = authResult.idToken;
      _this.accessToken = authResult.accessToken;
      _this.getUserInfo().catch(function (err) {
        return console.error('error loading user info ' + err);
      });
      _this.loggedIn = true;
      _this.lock.hide();
      // leaving this at 'parsed' to help anyone that is relying on it..
      _this.setState({
        parsed: true
      });
    };

    _this.logout = function (returnTo, cb) {
      //completely clear the localstorage
      try {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(TOKEN_KEY + ACCESS_TOKEN_SUFFIX);
        Object.keys(window.localStorage).forEach(function (d) {
          return d.includes('auth0') ? window.localStorage.removeItem(d) : null;
        });
      } catch (err) {
        console.log('clearing localStorage');
      }

      _this.loggedIn = false;
      if (typeof cb === 'function') {
        cb();
      }
      _this.lock.logout({ federated: true, returnTo: returnTo }); // will set the window.location
    };

    _this.state = {
      parsed: false
    };
    _this.lock = new _auth0Lock2.default(_this.props.clientId, _this.props.domain, (0, _extends3.default)({
      auth: {
        redirect: true,
        redirectUrl: '' + _this.props.window.location.origin,
        responseType: 'token id_token',
        autoParseHash: true,
        audience: 'https://' + _this.props.domain + '/userinfo',
        sso: true,
        params: {
          scope: 'openid profile email picture'
        }
      },
      allowSignUp: false,
      closable: false
    }, _this.props.options));

    _this.lock.on('authenticated', _this.doAuthentication.bind(_this));
    _this.lock.on('authorization_error', _this.authError.bind(_this));

    _this.loggedIn = false;
    _this.lock.checkSession({
      audience: 'https://' + _this.props.domain + '/userinfo',
      scope: 'openid profile email picture'
    }, function (err, authResult) {
      if (!err) {
        _this.doAuthentication(authResult);
      } else {
        console.error('checkSession error: ' + JSON.stringify(err, null, 4));
        _this.login();
      }
    });
    return _this;
  }

  (0, _createClass3.default)(AuthProvider, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // this.setState({
      //   parsed: true,
      // })
    }
  }, {
    key: 'isExpired',
    value: function isExpired(expiry) {
      // Check whether the current time is past the
      // access token's expiry time
      return new Date().getTime() > expiry * 1e3;
    }
  }, {
    key: 'getUserInfo',
    value: function getUserInfo() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (_this3.userInfo) {
          return resolve(_this3.userInfo);
        } else {
          _this3.lock.getUserInfo(_this3.accessToken, function (err, profile) {
            if (err) {
              return reject(err);
            }
            var roles = profile[AUTH_NAMESPACE] && profile[AUTH_NAMESPACE].roles ? profile[AUTH_NAMESPACE].roles : [];
            profile.roles = roles;
            _this3.userInfo = profile;
            return resolve(profile);
          });
        }
      });
    }
  }, {
    key: 'getPortalUserGroups',
    value: function getPortalUserGroups() {
      return this.getUserInfo().then(function (userInfo) {
        return queryPortal(userInfo.sub);
      });
    }
  }, {
    key: 'setToken',
    value: function setToken(token) {
      return this.props.window.localStorage.setItem(TOKEN_KEY, token);
    }
  }, {
    key: 'setAccessToken',
    value: function setAccessToken(token) {
      return this.props.window.localStorage.setItem(TOKEN_KEY + ACCESS_TOKEN_SUFFIX, token);
    }
  }, {
    key: 'isExpectedALG',
    value: function isExpectedALG(header) {
      return header.alg === AUTHO_ALG;
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.parsed) {
        return _react.Children.only(this.props.children);
      }
      return null;
    }
  }]);
  return AuthProvider;
}(_react.Component), _class.propTypes = {
  clientId: _propTypes2.default.string,
  domain: _propTypes2.default.string,
  options: _propTypes2.default.object,
  window: _propTypes2.default.shape({
    localStorage: _propTypes2.default.shape({
      setItem: _propTypes2.default.func,
      getItem: _propTypes2.default.func
    })
  })
}, _class.defaultProps = {
  window: window || {},
  clientId: process.env.AUTH0_CLIENT_ID || '',
  domain: process.env.AUTH0_DOMAIN || ''
}, _class.childContextTypes = {
  auth: _authType2.default
}, _temp);
exports.default = AuthProvider;