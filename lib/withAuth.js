'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.default = withAuth;

var _react = require('react');

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _authType = require('./authType');

var _authType2 = _interopRequireDefault(_authType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function withAuth(WrappedComponent) {
  var _class, _temp;

  var Authenticate = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(Authenticate, _Component);

    function Authenticate() {
      (0, _classCallCheck3.default)(this, Authenticate);
      return (0, _possibleConstructorReturn3.default)(this, (Authenticate.__proto__ || Object.getPrototypeOf(Authenticate)).apply(this, arguments));
    }

    (0, _createClass3.default)(Authenticate, [{
      key: 'render',
      value: function render() {
        var props = (0, _extends3.default)({}, this.props, this.context);
        return (0, _react.createElement)(WrappedComponent, props);
      }
    }]);
    return Authenticate;
  }(_react.Component), _class.WrappedComponent = WrappedComponent, _class.contextTypes = {
    auth: _authType2.default.isRequired
  }, _temp);

  return (0, _hoistNonReactStatics2.default)(Authenticate, WrappedComponent);
}
module.exports = exports['default'];