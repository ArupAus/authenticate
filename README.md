
Wrapper library for Auth0 authentication/authorization

## Usage

#### what you should know:

- **Authentication** is the verification of the credentials of the connection attempt. This process consists of sending the credentials from the remote access client to the remote access server in an either plaintext or encrypted form by using an authentication protocol.

- **Authorization**  is the verification that the connection attempt is allowed. Authorization occurs after successful authentication. (the correct spelling is Authorisation - but we're note dealing with the Queens english)

- Expects **RS256** to be enabled on the client configuration

### How to install
```bash
npm install git+ssh://git@github.com/ArupAus/react-authenticate.git#v3.2.0 --save
- or -
npm install https://github.com/ArupAus/react-authenticate#v3.2.0 --save
```

### web *authentication* code example:

**Note**: Expected use for this code is for *authentication* only.

Imports:

```js
import { AuthProvider, withAuth } from 'react-authenticate'
```

Rendering:

```js

//customisation options
let auth0Options = {
  languageDictionary: {
    title: 'My Viewer'
  },
  theme: {
    labeledSubmitButton: false,
    logo: 'https://s3-ap-southeast-2.amazonaws.com/arupdigital-assets/logo.png',
    primaryColor: '#27AAE1'
  }
}

class AuthWall extends Component {
  componentDidMount() {
    const { auth } = this.props
    if (!auth.loggedIn) {
      auth.login()
    }
  }
  componentDidUpdate() {
    const { auth } = this.props
    if (!auth.loggedIn) {
      auth.login()
    }
  }
  render() {
    const { auth } = this.props
    if (auth.loggedIn) {
      return <Entry auth={auth} />
    }
    return null
  }
}

const ConnectedAuthWall = withAuth(AuthWall)


render(
  <AuthProvider
    title="UUS Viewer"
    clientId="XsRizzzA1C9i57X7ZupmpOrvD51MpgeL"
    domain="arupdigital.au.auth0.com"
    options={auth0Options}
  >
    <ConnectedAuthWall />
  </AuthProvider>,
  getRoot()
)

```
- clientID: taken from auth0 client
- domain: take from auth0 client
- options: any options you want to pass into Auth0Lock (__languageDictionary and theme are recommended!__)

### *authorization* code example:

Usually run in server-side code.

**Note**: this example is from a graphql resolver:

Imports:

```js
import { isIn, getTokenHeader, authflow } from 'react-authenticate/lib/AuthUtils'

```

schema updated for graphql:

```
type Authorization {
  groups: [String]
  roles: [String]
  permissions: [String]
}
```

and added to the context that gets sent to the resolver below in the `ctx`:

```
type Options {
  ...
  authz: Authorization
}

```

Resolver:

```js

options: (root, args, ctx) => {

  // expects header.Authorization = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...."
  // in this case it's part of the ctx object that's getting passed.
  const token = getTokenHeader(ctx)

  // promisified (?) - decode token, check validity then return the users
  // authorization object from their app_metadata
  // future state would be for the authorization data to live in the app itself.
  return authflow(token)
    .then(authz => {
      // authorization : {
      //  groups : [ 'group1' ],
      //  permissions : [ 'perm1']
      //  role : [ 'role1' ]  
      //  }

      const userGroups = authz.groups
      const appGroups = ctx.config.authz.groups

      if (isIn(appGroups, userGroups)) {
        //faster this way around. lol.
        console.log('OPTIONS:')
        console.log(ctx.config)
        return ctx.config
      } else {
        throw new Error('403: Not Authorized')
      }
    })
    .catch(e => {
      throw new Error(`401: Not Authenticated, ${e}`)
    })

```

### What is going in `authflow`?

- decoding the token to extract the keyid
- invoking the JWKS client to get the latest JWKS key set https://auth0.com/docs/jwks
- matching the keyid to the current keyset to get the key used to sign the request
- verifying the token matches the expected signing key
- return of the app_metadata of the user

## On `app_metadata`:

The OIDC does not allow for arbitrary claims that are not defined in the spec, thus a rule exists in the auth0 tenant configuration to add the app_metadata. This should be seen as a temporary measure while existing mechanisms catch up to store authorization information in the application configuration. The data is exists in the user['http://authz.arup.digital/'] namespace.

rule:

```js
function (user, context, callback) {
  const namespace = 'http://authz.arup.digital/';
  context.idToken[namespace + 'authorization'] = user.app_metadata.authorization;
  callback(null, user, context);
}

```

## Updating

You must run `npm run build` before pushing to master, so the lib folder is created/updated
