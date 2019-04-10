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

export const getToken = () => window.localStorage.getItem(TOKEN_KEY)

const queryPortal = auth0Id => {
  return new Promise((resolve, reject) => {
    let postData = JSON.stringify({
      query: 'query test($auth0Id: String){userGroups(auth0Id: $auth0Id)}',
      variables: { auth0Id: auth0Id },
    })
    let postOptions = {
      host: PORTAL_DOMAIN,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
      },
    }
    let req = https.request(postOptions, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode))
      }
      let body = []
      res.on('data', chunk => {
        body.push(chunk)
      })
      // resolve on end
      res.on('end', () => {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
        } catch (e) {
          return reject(e)
        }
        return resolve(body)
      })
    })
    // reject on request error
    req.on('error', err => {
      return reject(err)
    })
    if (postData) {
      req.write(postData)
    }
    req.end()
  })
}

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
        getPortalUserGroups: () => this.getPortalUserGroups(),
        authError: this.authError,
        getUserInfoPromise: () => this.getUserInfoPromise(),
        getUserRolesPromise: () => this.userRolesPromise(),
        // TODO getUserInfoPromise, getUserRolesPromise to be phased out
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
  componentDidMount() {
    // this.setState({
    //   parsed: true,
    // })
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

  getPortalUserGroups() {
    return this.getUserInfo().then(userInfo => {
      return queryPortal(userInfo.sub)
    })
  }

  getUserInfoPromise = () => {
    //TODO deprecated
    console.warn(
      'getUserInfoPromise is soon to be deprecated, update to use getUserInfo()'
    )
    return new Promise((resolve, reject) => {
      this.lock.getUserInfo(this.accessToken, (err, profile) => {
        if (err) {
          return reject(err)
        }
        return resolve(profile)
      })
    })
  }
  getUserRolesPromise = token => {
    //TODO deprecated
    console.warn(
      'getUserRolesPromise is soon to be deprecated, update to use getUserInfo()'
    )
    this.userRolesPromise = new Promise((resolve, reject) => {
      this.auth.client.userInfo(token, (err, profile) => {
        if (err) {
          return reject(err)
        }
        const roles =
          profile[authorizationIdx] && profile[AUTH_NAMESPACE].roles
            ? profile[authorizationIdx].roles
            : []
        return resolve(roles)
      })
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
