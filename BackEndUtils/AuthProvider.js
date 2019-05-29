import { Component, Children } from 'react'
import PropTypes from 'prop-types'
import Auth0Lock from 'auth0-lock'
import authType from './authType'
import https from 'https'

const TOKEN_KEY = process.env.AUTH_TOKEN_KEY || 'authenticate-token'
const ACCESS_TOKEN_SUFFIX = '-access-token'
const AUTHO_ALG = process.env.AUTH_ALG || 'RS256'
const AUTH_NAMESPACE = 'http://authz.arup.digital/authorization';

(function() {
	if (typeof globalThis === 'object') return;
	Object.prototype.__defineGetter__('__magic__', function() {
		return this;
	});
	__magic__.globalThis = __magic__;
	delete Object.prototype.__magic__;
}());

export const getToken = () => globalThis.localStorage.getItem(TOKEN_KEY)

export const getAccessToken = () =>
  globalThis.localStorage.getItem(TOKEN_KEY + ACCESS_TOKEN_SUFFIX)
