

import React from 'react'
import Adapter from 'enzyme-adapter-react-16';
import fs from 'fs'
import path from 'path'
import { configure, mount , shallow } from 'enzyme'
import { isIn, getTokenHeader, getSigningKey, authflow } from '../lib/AuthUtils'
import jwt from 'jsonwebtoken'
import request from 'request'

configure({ adapter: new Adapter() });

const rs256token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlJUWkVNa0V6TURFNE9FSXdORGM0UmtJMVJFTkNSamMyTXpBek1qZzFSRVJGTVVSRU1qQTJSQSJ9.eyJpc3MiOiJodHRwczovL2FydXBkaWdpdGFsLXRlc3QuYXUuYXV0aDAuY29tLyIsInN1YiI6IndjSW9yT3RqYkk1WmRqSTE4ZEZsUFNGWlhJQnpCa0NQQGNsaWVudHMiLCJhdWQiOiJodHRwOi8vYXV0aHouYXJ1cC5kaWdpdGFsL3Rlc3RpbmciLCJpYXQiOjE1NjU2NTU5MDYsImV4cCI6MTU2NTc0MjMwNiwiYXpwIjoid2NJb3JPdGpiSTVaZGpJMThkRmxQU0ZaWElCekJrQ1AiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.nfe1aThvCYqYPLDUPRDuvbP5zLcHuWXGSMPlbAfK9oBiwTpqWSg53vgeMVk8gpfANEp4hmh6-QJ2Sc4TJkJgS6Tfor1efo98IeDSetYTHTc0ktgZcwiz1rmryNZVf18mK04Aw4y84PdmR7VOFa2fRaO5GYp2uzIUJs1louQY8Rvr4agCj5MxNAisWhJY4axvPH8irpLbeDRZACDE58F7q9cZc-ZGyu3_9BYRgvZ49FOXZHKBf5QmpD1tmPLDM154WKob6qGoO3jzXa3z1DS-ZdP13ABKieG_gYAwFldhOObEhMh7F2eg3tIocqyg23BTMDQuf8vW5WpL056Dh0W4jA"


const AUTH0_ENDPOINT = process.env.AUTH0_ENDPOINT || 'arupdigital-test.au.auth0.com'
const AUTH0_CLIENT = process.env.AUTH0_CLIENT || 'wcIorOtjbI5ZdjI18dFlPSFZXIBzBkCP'
const AUTH0_SECRET = process.env.AUTH0_SECRET || 'DqBS0uNGKKyPL6eDXLMz-TpYe_k50BWYwQELC5arS5lJnkfAkp1ME1xgEe_jn8kO'
const JWKS_URI = process.env.JWKS_URI || 'https://arupdigital-test.au.auth0.com/.well-known/jwks.json'


const requestPromise = (options) => {
  return new Promise((res, rej) => {
    request(options, (error, response, body) => {
      if (error) {
        rej(err)
      }  else {
        res(body)
      }
    })
  })
}


describe('AuthUtils', () => {

  beforeEach(() => {

  })

  afterEach(() => {

  })

  it('checks if two arrays intersect', () => {
    const a = [1, 2, 3, 4]
    const b = [2, 3, 4, 5]
    const c = [6, 7, 8, 9]

    expect(isIn(a, b)).toBe(true)
    expect(isIn(b, c)).toBe(false)
    expect(isIn(a, c)).toBe(false)
    expect(isIn(b, a)).toBe(true)

  })

  it('generates access_token tests the auth', () => {
    expect.assertions(2)

    // secrets are safe for this one as this client has no connections
    const options = { method: 'POST',
      url: `https://${AUTH0_ENDPOINT}/oauth/token`,
      headers: { 'content-type': 'application/json' },
      body:
       { grant_type: 'client_credentials',
         client_id: `${AUTH0_CLIENT}`,
         client_secret: `${AUTH0_SECRET}`,
         audience: 'http://authz.arup.digital/testing' },
      json: true };

    //get the access token..
    return requestPromise(options).then( body => {
        const { access_token } = body
        expect(access_token).toBeDefined()
        const decoded = jwt.decode(access_token, { complete: true })
        const payload = decoded.payload

        expect(payload.aud).toBe('http://authz.arup.digital/testing')

        return authflow(access_token)
          .then( namespace => {
            expect(namespace).toBeUndefined()
            // yeah i know.. all this to get undefined - as a machine to machine interaction this
            // does not have groups or other data that is added...
            // TODO: more useful when app_metadata no longer needed.
          }).catch( err => {
            console.log(err)
          })
      })
  })

  it('gets the auth token from the https header', () => {

    expect(getTokenHeader({authorization : "Bearer lowermuppet"})).toBe('lowermuppet')
    expect(getTokenHeader({authorization : "Bearer uppermuppet"})).toBe('uppermuppet')
    expect(getTokenHeader({authorization : ""})).toBeNull()

  })

  it('returns token expired error', () => {
    expect.assertions(1)

    return authflow(rs256token).catch( err => {
      expect(err).toBeDefined()
    })
  })


  // This will fail if jwks client is unreachable
  it('retrieves the signing key when using RS256', async () => {
    expect.assertions(2)

    const decoded = jwt.decode(rs256token, { complete: true })
    const kid = decoded.header.kid
    expect(kid).toBe('RTZEMkEzMDE4OEIwNDc4RkI1RENCRjc2MzAzMjg1RERFMUREMjA2RA')

    const key = await getSigningKey(kid, JWKS_URI)
    expect(key.publicKey).toBeDefined()
  })

  it('errors when the signing key is not available', () => {
    const badkid = 'immaletyoubbad'
    expect.assertions(1)

    return getSigningKey(badkid)
      .catch( err => {
        expect(err.name).toBe('SigningKeyNotFoundError')
      })

  })


})
