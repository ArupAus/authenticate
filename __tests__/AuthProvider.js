import React from 'react'
import Adapter from 'enzyme-adapter-react-16';
import fs from 'fs'
import path from 'path'
import { Component } from 'react'
import { configure, mount , shallow } from 'enzyme'
import { sign } from 'jsonwebtoken'
import { AuthProvider, withAuth } from '../src'

configure({ adapter: new Adapter() });

function loadData(filename) {
  return fs.readFileSync(path.join(__dirname, filename));
}

const cert = loadData("./test.priv.pem")
const hs256token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJodHRwOi8vYXV0aHouYXJ1cC5kaWdpdGFsL2F1dGhvcml6YXRpb24iOnsiZ3JvdXBzIjpbIlBMUi1VdGlsaXRpZXMiLCJUZk5TVyIsIlBMUiIsIk00IiwiTEhGQyIsIlBMUi1Qcm9wZXJ0eSIsIlBMUi1JVEEiLCJQTFItR2VuZXJhbCIsIlBMUi1TaXRlIiwiUExSLVN1cGVyLVVzZXJzIiwiUExSLVV0aWxpdGllcy1QaGFzZTIiLCJSTVMiLCJNMSIsIkJIV1AiLCJTQ08tcGFycmFtYXR0YSIsIlNDTy1tYWNwYXJrIiwiU0NPLWNiZCIsIlNDTy1jYmQtYWRtaW4iLCJTQ08tcGFycmFtYXR0YS1hZG1pbiIsIlNDTy1tYWNwYXJrLWFkbWluIiwiUExSQ1QiLCJQTFItVGVuZGVyIl0sInJvbGVzIjpbImxoZmMiLCJEZWxlZ2F0ZWQgQWRtaW4gLSBBZG1pbmlzdHJhdG9yIl0sInBlcm1pc3Npb25zIjpbXX0sImh0dHA6Ly91c2VybWV0YS5hcnVwLmRpZ2l0YWwvdXNlcl9tZXRhZGF0YSI6e30sIm5hbWUiOiJUcmVudCBUYW0iLCJuaWNrbmFtZSI6IlRyZW50LlRhbUBhcnVwLmNvbSIsImVtYWlsIjoiVHJlbnQuVGFtQGFydXAuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInVzZXJfbWV0YWRhdGEiOnt9LCJhcHBfbWV0YWRhdGEiOnsiYXV0aG9yaXphdGlvbiI6eyJncm91cHMiOlsiUExSLVV0aWxpdGllcyIsIlRmTlNXIiwiUExSIiwiTTQiLCJMSEZDIiwiUExSLVByb3BlcnR5IiwiUExSLUlUQSIsIlBMUi1HZW5lcmFsIiwiUExSLVNpdGUiLCJQTFItU3VwZXItVXNlcnMiLCJQTFItVXRpbGl0aWVzLVBoYXNlMiIsIlJNUyIsIk0xIiwiQkhXUCIsIlNDTy1wYXJyYW1hdHRhIiwiU0NPLW1hY3BhcmsiLCJTQ08tY2JkIiwiU0NPLWNiZC1hZG1pbiIsIlNDTy1wYXJyYW1hdHRhLWFkbWluIiwiU0NPLW1hY3BhcmstYWRtaW4iLCJQTFJDVCIsIlBMUi1UZW5kZXIiXSwicm9sZXMiOlsibGhmYyIsIkRlbGVnYXRlZCBBZG1pbiAtIEFkbWluaXN0cmF0b3IiXSwicGVybWlzc2lvbnMiOltdfSwicm9sZXMiOlsibGhmYyIsIkRlbGVnYXRlZCBBZG1pbiAtIEFkbWluaXN0cmF0b3IiXX0sInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9kMGNjODlmOTdjMmFjZTZiZWNkY2JjMjNiNGI0YzIwZD9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRnR0LnBuZyIsImlzcyI6Imh0dHBzOi8vYXJ1cGRpZ2l0YWwuYXUuYXV0aDAuY29tLyIsInN1YiI6IndhYWR8WC1UeTh3YTdvTThKWlNSUC1PdjBVWkNmU3RveTJZQWs2U0Mxa3hWTzRTWSIsImF1ZCI6ImVhSWNhUTU0TEp1QTMyamlSUFRGU21zeXRza0RwNHhyIiwiaWF0IjoxNTE5NTk4MjI2LCJleHAiOjE1MTk3NDIyMjZ9.GfmDXG6Z5as635_l0xA3fZq23GWHUCp-p-pgK_bXDHs"

const localStorageMock = (function() {
    return Object.create({
        getItem: function(key) {
          return this[key] || null;
        },
        setItem: function(key, value) {
          this[key] = value.toString();
        },
        removeItem: function(key) {
          delete this[key]
        },
        clear: function() {
            Object.keys(this).forEach(d => {
              delete this[d]
            })
        }
    });

})();

Object.defineProperty(window, 'localStorage', {
     value: localStorageMock
});

describe('auth', () => {
  const Inner = withAuth(({ auth }) => {
    if (auth.loggedIn) {
      return <div>LoggedIn</div>
    } else {
      return <div>LoggedOut</div>
    }
  })

  const wrapper = mount(
    <AuthProvider
      clientId="myclient"
      domain="mydomain"
      options={{ auth:
        { nonce: '123' }
      }}
      window={{
        location: {
          origin: 'https://testorigin'
        }
      }}
    >
      <div>Hello</div>
    </AuthProvider>
  )

  beforeEach(() => {

  })

  afterEach(() => {
    window.localStorage.clear()

  })

  it('will instantiate and not be loggedIn', () => {

    const instance = wrapper.instance();
    expect(instance.loggedIn).toBe(false)
  })

  // it('will fire', () => {
  //
  //   const spy = jest.spyOn(wrapper.instance(), 'doAuthentication')
  //   // const instance = wrapper.instance()
  //   //const spy = jest.spyOn(instance, 'login')
  //
  //   //wrapper.update()
  //       //console.log(AuthProvider)
  //       //const spy = jest.spyOn(AuthProvider.prototype, 'login')
  //   expect(spy).toHaveBeenCalled()
  //
  //
  // })

  // it('should be logged out if loaded without a token', () => {
  //   const spy = jest.spyOn(localStorageMock, 'getItem')
  //   var component = mount(
  //     <AuthProvider
  //       window={{
  //         location: {
  //           origin: 'https://testorigin'
  //         }
  //       }}
  //     >
  //       <Inner />
  //     </AuthProvider>
  //   )
  //   expect(component.text()).toEqual('LoggedOut')
  //   expect(spy).toHaveBeenCalled()
  // })
  // it('should accept current localStorage tokens', () => {
  //   const currentToken = sign(
  //     {
  //       exp: new Date().getTime() / 1e3 + 1000,
  //       data:'sssshhh'
  //     },
  //     cert,
  //     { algorithm: 'RS256'}
  //   )
  //
  //
  //   localStorage.getItem = () => currentToken
  //   var component = mount(
  //     <AuthProvider
  //       window={{
  //         location: {
  //           origin: 'https://testorigin'
  //         }
  //       }}
  //     >
  //       <Inner />
  //     </AuthProvider>
  //   )
  //   expect(component.text()).toEqual('LoggedIn')
  // })
  // it('should not accept expired localStorage tokens', () => {
  //   const oldToken = sign(
  //     {
  //       exp: new Date().getTime() / 1e3,
  //       data:'sssshhh'
  //     },
  //     cert,
  //     { algorithm: 'RS256'}
  //   )
  //
  //   localStorage.getItem = () => oldToken
  //   var component = mount(
  //     <AuthProvider
  //       window={{
  //         location: {
  //           origin: 'https://testorigin'
  //         }
  //       }}
  //     >
  //       <Inner />
  //     </AuthProvider>
  //   )
  //   expect(component.text()).toEqual('LoggedOut')
  // })

  //it('should be logged out if loaded with a valid token in the window hash')
  //it('should be logged out if loaded with a invalid token in the window hash')
  // it('should clear localStorage on logout', () => {
  //
  //   const spy = jest.spyOn(localStorageMock, 'removeItem')
  //
  //   const currentToken = sign(
  //     {
  //       exp: new Date().getTime() / 1e3 + 1000,
  //       data:'sssshhh'
  //     },
  //     cert,
  //     { algorithm: 'RS256'}
  //   )
  //
  //   const Inner = withAuth(({ auth }) => {
  //       return <button onClick={auth.logout}>LoggedIn</button>
  //   })
  //   localStorage.getItem = () => currentToken
  //
  //   var component = mount(
  //     <AuthProvider
  //       window={{
  //         location: {
  //           origin: 'testorigin'
  //         }
  //       }}
  //     >
  //       <Inner />
  //     </AuthProvider>
  //   )
  //   component.find('button').simulate('click')
  //   expect(spy).toHaveBeenCalled()
  // })
})
