# Authenticate

Authenticate is a simple library to add authentication to your web application

## Install

```bash
npm install git+ssh://git@github.com/ArupAus/authenticate.git --save
- or -
npm install https://github.com/ArupAus/authenticate --save
```

## Usage

Currently Authenticate supports Auth0 as the service provider. All examples use the following info:

- clientID: taken from auth0 client
- domain: take from auth0 client
- options: any options you want to pass into Auth0Lock (**languageDictionary and theme are recommended!**)

For users new to developing websites or applications with sensitive information it is recommended that you read up on [Protecting Content for Privileged Access](./PROTECTINGCONTENT.md)

### **Simple** example

Download / copy the source file from `lib/index.js`

Include it in your project:

```html
<script type="text/javascript" src="pathToFolder/index.js" ></script>
```

Call an instance of the `AuthProvider`:

```html
<script type="text/javascript">

  var auth0Options = {
    languageDictionary: {
      title: "My Viewer"
    },
    theme: {
      labeledSubmitButton: false,
      logo: "https://s3-ap-southeast-2.amazonaws.com/arupdigital-assets/logo.png",
      primaryColor: "#27AAE1"
    }
  };

  var authInfo = {
    title:"UUS Viewer",
    clientId:"XsRizzzA1C9i57X7ZupmpOrvD51MpgeL",
    domain:"arupdigital.au.auth0.com",
    options:{auth0Options}
  }

  //By creating the AuthProvider object with the 'new' keyword the page will
  //automatically show an auth0 login screen if no token is detected.
  //Once a token is detected, the auth object will contain information such as the token.
  var auth = new AuthProvider(authInfo)

  //NOTE: the AuthProvider object obtains its auth information via an asynchronous purpose.
  //This means that attempting to use the auth object immediately on page load is
  //likely to result in it being empty. You should wrap uses of the auth object properties
  //in functions that can be used once the data has been loaded.

</script>
```

### **React** example

Imports:

```js
import { AuthProviderReact, withAuth } from "authenticate";
```

Rendering:

```js
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
  <AuthProviderReact
    title="UUS Viewer"
    clientId="XsRizzzA1C9i57X7ZupmpOrvD51MpgeL"
    domain="arupdigital.au.auth0.com"
    options={auth0Options}
  >
    <ConnectedAuthWall />
  </AuthProviderReact>,
  getRoot()
);
```

## Authorization tools

This library provides a range of tools check a JWT and to build out your own form of Authorization if you so wish.

### **Authorization** example

Usually run in server-side code.

**Note**: this example is from a graphql resolver:

In this example a [JWT](https://jwt.io/) is passed from the request header into `ctx` in graphql. This token, once decoded, contains relevant user information in order to carry out authorization checks.

Imports:

```js
import { getTokenHeader, authflow } from "authenticate/AuthUtils";
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
