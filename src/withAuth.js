import { Component, createElement } from 'react'
import hoistStatics from 'hoist-non-react-statics'
import authType from './authType'

export default function withAuth(WrappedComponent) {
  class Authenticate extends Component {
    static WrappedComponent = WrappedComponent
    static contextTypes = {
      auth: authType.isRequired
    }
    render() {
      const props = {
        ...this.props,
        ...this.context
      }
      return createElement(WrappedComponent, props)
    }
  }
  return hoistStatics(Authenticate, WrappedComponent)
}
