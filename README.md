# Authenticate

Authenticate is a simple library to add authentication to your web application

## Install

```bash
npm install git+ssh://git@github.com/ArupAus/authenticate.git --save
- or -
npm install https://github.com/ArupAus/authenticate --save
```

## Usage

### **Simple** example

TBA

### **React** example

Imports:

```js
import { AuthProvider, withAuth } from "authenticate";
```

Rendering:

```js
//customisation options
let auth0Options = {
  languageDictionary: {
    title: "My Viewer"
  },
  theme: {
    labeledSubmitButton: false,
    logo: "https://s3-ap-southeast-2.amazonaws.com/arupdigital-assets/logo.png",
    primaryColor: "#27AAE1"
  }
};

class AuthWall extends Component {
  componentDidMount() {
    const { auth } = this.props;
    if (!auth.loggedIn) {
      auth.login();
    }
  }
  componentDidUpdate() {
    const { auth } = this.props;
    if (!auth.loggedIn) {
      auth.login();
    }
  }
  render() {
    const { auth } = this.props;
    if (auth.loggedIn) {
      return <Entry auth={auth} />;
    }
    return null;
  }
}

const ConnectedAuthWall = withAuth(AuthWall);

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
);
```

- clientID: taken from auth0 client
- domain: take from auth0 client
- options: any options you want to pass into Auth0Lock (**languageDictionary and theme are recommended!**)

## Authorization tools

This library provides a range of tools check a JWT and to build out your own form of Authorization if you so wish.

### **Authorization** example

Usually run in server-side code.

**Note**: this example is from a graphql resolver:

In this example a [JWT](https://jwt.io/) is passed from the request header into `ctx` in graphql. This token, once decoded, contains relevant user information in order to carry out authorization checks.

Imports:

```js
import { getTokenHeader, authflow } from "react-authenticate/lib/AuthUtils";
```

Using a graphql query as per below:

```
type Query {
  checkAuthorization(inputs: AuthorizationInputs!) [Authorization]
}

type AuthorizationInputs {
  groupsToCheckAgainst: [String]
  rolesToCheckAgainst: [String]
  permissionsToCheckAgainst: [String]
}

type Authorization {
  authorized: Boolean
  message: String
  authorizations: [String]
}
```

And a resolver:

```js

checkAuthorization: (root, args, ctx) => {

  const {
    groupsToCheckAgainst,
    rolesToCheckAgainst,
    permissionsToCheckAgainst
  } = args.inputs

  // expects header.Authorization = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...."
  // in this case it's part of the ctx object that's getting passed.
  const token = getTokenHeader(ctx)

  return authflow(token)
    .then(decodedToken => {

      // decodedToken contains user information to check the users groups / roles / permissions
      return performSomeQueryToGetPermissionsLists(decodedToken)

    })
    .then(userInformation => {

      let permissions = []

      //check user's information against the lists of groups / roles / permissions passed in from Query
      if(checkIfUsersIsInGroups(userInformation, groupsToCheckAgainst){
        permissions.push(checkIfUsersIsInGroups(userInformation, groupsToCheckAgainst))
      }
      if(checkIfUsersHasRoles(userInformation, rolesToCheckAgainst){
        permissions.push(checkIfUsersHasRoles(userInformation, rolesToCheckAgainst))
      }
      if(checkIfUsersHasPermissions(userInformation, permissionsToCheckAgainst){
        permissions.push(checkIfUsersHasPermissions(userInformation, permissionsToCheckAgainst))
      }

      if (permissions.length > 0){

        return { authorized: true, message: 'user is authorised' permissions: permissions}

      } else {

        return { authorized: false, message: 'user is not authorised' permissions: permissions}

      }
    })
  })

```

## Contributing

Please run the `build` script before pushing to master
