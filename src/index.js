export { getToken, default as AuthProviderReact } from './AuthProvider'
export { default as withAuth } from './withAuth'
export { default as AuthUtils } from './AuthUtils'

import AuthProvider, { getAuth } from './AuthProviderSimple'

//whats this?
//https://mathiasbynens.be/notes/globalthis
(function() {
	if (typeof globalThis === 'object') return;
	Object.prototype.__defineGetter__('__magic__', function() {
		return this;
	});
	__magic__.globalThis = __magic__;
	delete Object.prototype.__magic__;
}());

globalThis.AuthProvider = AuthProvider
globalThis.getAuth = getAuth
