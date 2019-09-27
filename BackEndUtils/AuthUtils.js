import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const AUTHO_ALG = process.env.AUTH_ALG || 'RS256'
const CLAIM_NAMESPACE = process.env.AUTHZ_NAMESPACE || 'http://authz.arup.digital/authorization'
const JWKS_URI = process.env.JWKS_URI || 'https://arupdigital.au.auth0.com/.well-known/jwks.json'

const KEY = process.env.KEY || (Math.random().toString(36)+'00000000000000000').slice(2, 10+2)
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || Math.floor(Date.now() / 1000) + (60 * 60) //or seconds

let signingKey

export function isIn(a, b) {
  const aSet = new Set(a)
  const bSet = new Set(b)

  return new Set([...aSet].filter(d => bSet.has(d))).size > 0
}

export function getSigningKey(kid, jwksUri = JWKS_URI) {
  return new Promise((resolve, reject) => {
    const jwk = jwksClient({
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

export function getTokenHeader(headers) {
  const authorization = headers.authorization || headers.Authorization
  return authorization && authorization.split(' ')[0] === 'Bearer'
    ? authorization.split(' ')[1]
    : null
}

export async function decode(token) {
  const decoded = jwt.decode(token, { complete: true })
  const payload = decoded.payload
  const kid = decoded.header.kid

  if (!signingKey) {
      const key = await getSigningKey(kid)
      signingKey = key.publicKey || key.rsaPublicKey
  }
  return new Promise((resolve, reject) => {
    try {
        jwt.verify(token, signingKey,{ algorithms: [AUTHO_ALG] })
        resolve(payload)
      } catch (err) {
        reject(err)
      }
  })
}

export function authflow(token) {
  return new Promise((resolve, reject) => {
    return decode(token).then(payload => {
      resolve(payload[CLAIM_NAMESPACE])
    }).catch (err => {
      reject(err)
    })
  })
}

export function sign(data) {
  return jwt.sign({
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

export default AuthUtils
