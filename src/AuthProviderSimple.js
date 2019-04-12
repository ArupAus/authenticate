import { Component, Children } from 'react'
import PropTypes from 'prop-types'
import Auth0Lock from 'auth0-lock'
import authType from './authType'
import https from 'https'

const TOKEN_KEY = process.env.AUTH_TOKEN_KEY || 'portal-token'
const ACCESS_TOKEN_SUFFIX = '-access-token'
const AUTHO_ALG = process.env.AUTH_ALG || 'RS256'
const PORTAL_DOMAIN = process.env.PORTAL_DOMAIN || 'portal.arup.digital'
const AUTH_NAMESPACE = 'http://authz.arup.digital/authorization'

function AuthProviderSimple(info) {

  this.parsed = false

  this.token = ''

  this.lock = new Auth0Lock(info.clientId, info.domain, {
    auth: {
      redirect: true,
      redirectUrl: `${window.location.origin}`,
      responseType: 'token id_token',
      autoParseHash: true,
      audience: `https://${info.domain}/userinfo`,
      sso: true,
      params: {
        scope: 'openid profile email picture',
      },
    },
    allowSignUp: false,
    closable: false,
    ...info.options,
  })

  this.setToken = function(token) {
    return window.localStorage.setItem(TOKEN_KEY, token)
  }

  this.getUserInfo = function() {
    return new Promise((resolve, reject) => {
      if (this.userInfo) {
        return resolve(this.userInfo)
      } else {
        this.lock.getUserInfo(this.accessToken, (err, profile) => {
          if (err) {
            return reject(err)
          }
          const roles =
            profile[AUTH_NAMESPACE] && profile[AUTH_NAMESPACE].roles
              ? profile[AUTH_NAMESPACE].roles
              : []
          profile.roles = roles
          this.userInfo = profile
          return resolve(profile)
        })
      }
    })
  }

  this.doAuthentication = function(authResult) {
    this.setToken(authResult.idToken)
    this.token = authResult.idToken
    this.token = authResult.idToken
    this.accessToken = authResult.accessToken
    this.getUserInfo().catch(err =>
      console.error(`error loading user info ${err}`)
    )
    this.loggedIn = true
    this.lock.hide()
    // leaving this at 'parsed' to help anyone that is relying on it..
    this.parsed = true
  }

  this.authError = function(error){
    this.lock.show({
      flashMessage: {
        type: 'error',
        text: error,
      },
    })
  }

  this.login = function(error) {
    if (error) {
      this.lock.show({
        flashMessage: {
          type: 'error',
          text: error,
        },
      })
    } else {
      this.lock.show()
    }
  }

  this.lock.on('authenticated', this.doAuthentication.bind(this))
  this.lock.on('authorization_error', this.authError.bind(this))

  this.loggedIn = false
  this.lock.checkSession({
    audience: `https://${info.domain}/userinfo`,
    scope: 'openid profile email picture'
  }, (err, authResult) => {
    if (!err) {
      this.doAuthentication(authResult)
    } else {
      console.error(`checkSession error: ${JSON.stringify(err, null, 4)}`)
      this.login()
    }
  })

  return this.parsed
}

export function getAuth(authObject) {
  return authObject
}

export default AuthProviderSimple
