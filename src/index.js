export { default as AuthProvider } from './AuthProvider'
export { default as withAuth } from './withAuth'

import AuthProvider, { getAuth } from './AuthProviderSimple'
window.AuthProvider = AuthProvider
window.getAuth = getAuth
