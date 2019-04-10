import React from 'react'
import Adapter from 'enzyme-adapter-react-16';
import fs from 'fs'
import path from 'path'
import { configure, mount , shallow } from 'enzyme'
import { isIn, getTokenHeader, getSigningKey, authflow } from '../src/AuthUtils'
import jwt from 'jsonwebtoken'
import request from 'request'

configure({ adapter: new Adapter() });

const rs256token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9UTXhNVEZGUVVORE56TXpRakZFTkVKRk9UbENNakUwUlVVNU1rTkVSRVJET1RFeE16TkNNQSJ9.eyJodHRwOi8vYXV0aHouYXJ1cC5kaWdpdGFsL2F1dGhvcml6YXRpb24iOnsiZ3JvdXBzIjpbIlBMUi1VdGlsaXRpZXMiLCJUZk5TVyIsIlBMUiIsIlBMUi1Qcm9wZXJ0eSIsIlBMUi1JVEEiLCJQTFItR2VuZXJhbCIsIlBMUi1TaXRlIiwiUExSLVN1cGVyLVVzZXJzIiwiUExSLVV0aWxpdGllcy1QaGFzZTIiLCJSTVMiLCJNMSIsIkJIV1AiLCJTTUMiLCJuZXdtNSIsIlJvemVsbGUiLCJQTFJDVCIsIlBMUi1UZW5kZXIiLCJtYWhncm91cCIsIlBIRVMiLCJQT1JUQUwiXSwicm9sZXMiOlsiRGVsZWdhdGVkIEFkbWluIC0gQWRtaW5pc3RyYXRvciIsImxoZmMiXSwicGVybWlzc2lvbnMiOltdfSwiaHR0cDovL3VzZXJtZXRhLmFydXAuZGlnaXRhbC91c2VyX21ldGFkYXRhIjp7Imdyb3VwcyI6WyJQTFItVGVuZGVyIl19LCJpc3MiOiJodHRwczovL2FydXBkaWdpdGFsLmF1LmF1dGgwLmNvbS8iLCJzdWIiOiJ3YWFkfHo0VTB4SkVNdDN3bzJEbjR1cGdJNmlYWFdhNUdKbG5PamRURzdEREJJczQiLCJhdWQiOiJOM0lFakhadktyNFM5bk9rN3ZqSGZpU3hmQ05JVWVkMyIsImlhdCI6MTUyNTg0NjA5NSwiZXhwIjoxNTI1ODgyMDk1LCJhdF9oYXNoIjoidXozR214OHB0NnpjZGR6dk1NRmFEdyIsIm5vbmNlIjoiYjlHSDJaMmhLTHVQZXJuQWNERVpiekZJeFFpcmozU3AifQ.kB6eCcPiLqXEnAMD9hoqss_7E5h3TceYtrWsfPQ6NpY8q898jwVJwRY-HQzmAm_tq8KQb-6s1yiOVP_HZ5stfVBX87_V5_tNzPRdH7yeb77qY8nsyrhGk6-9WHM8abxS782ckiuxQJrRD3caYfB5kG2aYRtQ_7fV05T4612-5KMEWCXVEbmWCZJ4DruRpPxUTTiW05dPLcU7ZEO3tGDVfqTQlOZstjvpY9UvI3D-XdjJ-ZleaUREXUaMoobkO3kEMmfy91hhbnvQBmMhWrOq5dVElzcvahnB94WzKR2cE9sBNVheNtfJ5WHaGwjAMeO0_Qi-7MOEATb_PlE1d7jWGQ"


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
    expect.assertions(3)

    // secrets are safe for this one as this client has no connections
    const options = { method: 'POST',
      url: 'https://arupdigital.au.auth0.com/oauth/token',
      headers: { 'content-type': 'application/json' },
      body:
       { grant_type: 'client_credentials',
         client_id: 'WND19K4hdqVo9AKZqWl3AkTWVo7jjMs0',
         client_secret: 'mkiaPZ1u3a4t3rGjqDLaq8_UF-p_BQLbAtxXaln2GCUDKkAx-i0e5RD-NamOjLEb',
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
  it('retrieves the signing key when using RS256', () => {
    expect.assertions(2)

    const decoded = jwt.decode(rs256token, { complete: true })
    const kid = decoded.header.kid
    expect(kid).toBe('OTMxMTFFQUNDNzMzQjFENEJFOTlCMjE0RUU5MkNERERDOTExMzNCMA')

    return getSigningKey(kid)
      .then( key => {
        expect(key.publicKey).toBeDefined()
      })

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
