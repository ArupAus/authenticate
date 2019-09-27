module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./BackEndUtils/AuthUtils.js":
/*!***********************************!*\
  !*** ./BackEndUtils/AuthUtils.js ***!
  \***********************************/
/*! exports provided: isIn, getSigningKey, getTokenHeader, decode, authflow, sign, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIn", function() { return isIn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSigningKey", function() { return getSigningKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTokenHeader", function() { return getTokenHeader; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decode", function() { return decode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "authflow", function() { return authflow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sign", function() { return sign; });
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jwks_rsa__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jwks-rsa */ "jwks-rsa");
/* harmony import */ var jwks_rsa__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jwks_rsa__WEBPACK_IMPORTED_MODULE_1__);



const AUTHO_ALG = process.env.AUTH_ALG || 'RS256'
const CLAIM_NAMESPACE = process.env.AUTHZ_NAMESPACE || 'http://authz.arup.digital/authorization'
const JWKS_URI = process.env.JWKS_URI || 'https://arupdigital.au.auth0.com/.well-known/jwks.json'

const KEY = process.env.KEY || (Math.random().toString(36)+'00000000000000000').slice(2, 10+2)
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || Math.floor(Date.now() / 1000) + (60 * 60) //or seconds

let signingKey

function isIn(a, b) {
  const aSet = new Set(a)
  const bSet = new Set(b)

  return new Set([...aSet].filter(d => bSet.has(d))).size > 0
}

function getSigningKey(kid, jwksUri = JWKS_URI) {
  return new Promise((resolve, reject) => {
    const jwk = jwks_rsa__WEBPACK_IMPORTED_MODULE_1___default()({
      cache: true,
      cacheMaxEntries: 5,
      jwksUri: jwksUri,
    })

    jwk.getSigningKey(kid, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

function getTokenHeader(headers) {
  const authorization = headers.authorization || headers.Authorization
  return authorization && authorization.split(' ')[0] === 'Bearer'
    ? authorization.split(' ')[1]
    : null
}

async function decode(token) {
  const decoded = jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default.a.decode(token, { complete: true })
  const payload = decoded.payload
  const kid = decoded.header.kid

  if (!signingKey) {
      const key = await getSigningKey(kid)
      signingKey = key.publicKey || key.rsaPublicKey
  }
  return new Promise((resolve, reject) => {
    try {
        jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default.a.verify(token, signingKey,{ algorithms: [AUTHO_ALG] })
        resolve(payload)
      } catch (err) {
        reject(err)
      }
  })
}

function authflow(token) {
  return new Promise((resolve, reject) => {
    return decode(token).then(payload => {
      resolve(payload[CLAIM_NAMESPACE])
    }).catch (err => {
      reject(err)
    })
  })
}

function sign(data) {
  return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default.a.sign({
    exp: TOKEN_EXPIRY,
    data: JSON.stringify(data)
  }, KEY)
}

const AuthUtils = {
  isIn,
  getSigningKey,
  getTokenHeader,
  decode,
  authflow,
  sign
}

/* harmony default export */ __webpack_exports__["default"] = (AuthUtils);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./BackEndUtils/index.js":
/*!*******************************!*\
  !*** ./BackEndUtils/index.js ***!
  \*******************************/
/*! exports provided: isIn, getSigningKey, getTokenHeader, decode, authflow, sign */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _AuthUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AuthUtils */ "./BackEndUtils/AuthUtils.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isIn", function() { return _AuthUtils__WEBPACK_IMPORTED_MODULE_0__["isIn"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getSigningKey", function() { return _AuthUtils__WEBPACK_IMPORTED_MODULE_0__["getSigningKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getTokenHeader", function() { return _AuthUtils__WEBPACK_IMPORTED_MODULE_0__["getTokenHeader"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "decode", function() { return _AuthUtils__WEBPACK_IMPORTED_MODULE_0__["decode"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "authflow", function() { return _AuthUtils__WEBPACK_IMPORTED_MODULE_0__["authflow"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "sign", function() { return _AuthUtils__WEBPACK_IMPORTED_MODULE_0__["sign"]; });




/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ 0:
/*!*************************************!*\
  !*** multi ./BackEndUtils/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./BackEndUtils/index.js */"./BackEndUtils/index.js");


/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "jwks-rsa":
/*!***************************!*\
  !*** external "jwks-rsa" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("jwks-rsa");

/***/ })

/******/ });
//# sourceMappingURL=AuthUtils.js.map