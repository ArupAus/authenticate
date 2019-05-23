import { Component, Children } from 'react'
import PropTypes from 'prop-types'
import Auth0Lock from 'auth0-lock'
import authType from './authType'
import https from 'https'

const TOKEN_KEY = process.env.AUTH_TOKEN_KEY || 'authenticate-token'
const ACCESS_TOKEN_SUFFIX = '-access-token'
const AUTHO_ALG = process.env.AUTH_ALG || 'RS256'
const AUTH_NAMESPACE = 'http://authz.arup.digital/authorization'

export const getToken = () => window.localStorage.getItem(TOKEN_KEY)

export const getAccessToken = () =>
  window.localStorage.getItem(TOKEN_KEY + ACCESS_TOKEN_SUFFIX)

export default class AuthProvider extends Component {
  static propTypes = {
    clientId: PropTypes.string,
    domain: PropTypes.string,
    options: PropTypes.object,
    window: PropTypes.shape({
      localStorage: PropTypes.shape({
        setItem: PropTypes.func,
        getItem: PropTypes.func,
      }),
    }),
  }
  static defaultProps = {
    window: window || {},
    clientId: process.env.AUTH0_CLIENT_ID || '',
    domain: process.env.AUTH0_DOMAIN || '',
  }
  static childContextTypes = {
    auth: authType,
  }
  getChildContext() {
    return {
      auth: {
        loggedIn: this.loggedIn,
        token: this.token,
        accessToken: this.accessToken,
        login: this.login,
        logout: this.logout,
        userInfo: this.userInfo,
        getUserInfo: () => this.getUserInfo(),
        authError: this.authError
      },
    }
  }
  constructor(props, context) {
    super(props, context)
    this.state = {
      parsed: false,
    }
    this.lock = new Auth0Lock(this.props.clientId, this.props.domain, {
      auth: {
        redirect: true,
        redirectUrl: `${this.props.window.location.origin}`,
        responseType: 'token id_token',
        autoParseHash: true,
        audience: `https://${this.props.domain}/userinfo`,
        sso: true,
        params: {
          scope: 'openid profile email picture',
        },
      },
      allowSignUp: false,
      closable: false,
      ...this.props.options,
    })

    this.lock.on('authenticated', this.doAuthentication.bind(this))
    this.lock.on('authorization_error', this.authError.bind(this))

    this.loggedIn = false
    this.lock.checkSession({
      audience: `https://${this.props.domain}/userinfo`,
      scope: 'openid profile email picture'
    }, (err, authResult) => {
      if (!err) {
        this.doAuthentication(authResult)
      } else {
        console.error(`checkSession error: ${JSON.stringify(err, null, 4)}`)
        this.login()
      }
    })
  }

  isExpired(expiry) {
    // Check whether the current time is past the
    // access token's expiry time
    return new Date().getTime() > expiry * 1e3
  }

  getUserInfo() {
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

  setToken(token) {
    return this.props.window.localStorage.setItem(TOKEN_KEY, token)
  }
  setAccessToken(token) {
    return this.props.window.localStorage.setItem(
      TOKEN_KEY + ACCESS_TOKEN_SUFFIX,
      token
    )
  }
  isExpectedALG(header) {
    return header.alg === AUTHO_ALG
  }
  login = error => {
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
  authError = error => {
    this.lock.show({
      flashMessage: {
        type: 'error',
        text: error,
      },
    })
  }
  doAuthentication = authResult => {
    this.setToken(authResult.idToken)
    this.token = authResult.idToken
    this.accessToken = authResult.accessToken
    this.getUserInfo().catch(err =>
      console.error(`error loading user info ${err}`)
    )
    this.loggedIn = true
    this.lock.hide()
    // leaving this at 'parsed' to help anyone that is relying on it..
    this.setState({
      parsed: true,
    })
  }
  logout = (returnTo, cb) => {
    //completely clear the localstorage
    try {
      window.localStorage.removeItem(TOKEN_KEY)
      window.localStorage.removeItem(TOKEN_KEY + ACCESS_TOKEN_SUFFIX)
      Object.keys(window.localStorage).forEach(
        d => (d.includes('auth0') ? window.localStorage.removeItem(d) : null)
      )
    } catch (err) {
      console.log('clearing localStorage')
    }

    this.loggedIn = false
    if (typeof cb === 'function') {
      cb()
    }
    this.lock.logout({ federated: true, returnTo }) // will set the window.location
  }
  render() {
    if (this.state.parsed) {
      return Children.only(this.props.children)
    }
    return null
  }
}
