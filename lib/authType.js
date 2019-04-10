'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _propTypes2.default.shape({
  loggedIn: _propTypes2.default.bool.isRequired,
  token: _propTypes2.default.string,
  accessToken: _propTypes2.default.string,
  login: _propTypes2.default.func.isRequired,
  logout: _propTypes2.default.func.isRequired,
  getUserInfo: _propTypes2.default.func,
  getPortalUserGroups: _propTypes2.default.func,
  authError: _propTypes2.default.func.isRequired,
  getUserInfoPromise: _propTypes2.default.func,
  getUserRolesPromise: _propTypes2.default.func,
  userInfo: _propTypes2.default.object
});
module.exports = exports['default'];