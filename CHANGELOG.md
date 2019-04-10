# Changelog

## [3.2.0] - 2018-10-10

### Changed decode and verify

- extracted decode function
- modified authflow for decode

## [3.1.0] - 2018-10-03

### add scopes to checkSession

- added scopes and audience to checkSession
- bumped auth0-js and lock vesions


## [3.0.1] - 2018-07-09

### Refactored

- queryPortal now an AuthUtils function, callable from external apps.

## [3.0.0] - 2018-06-19

### Fixed

- logout now does a federated logout

## [2.1.1] - 2018-06-19

### Added

- Added `getPortalUserGroups()` - call `auth.getPortalUserGroups()` on the frontend for the current user's Portal User groups.

## [2.0.7] - 2018-03-12

### Added

- Promisified `getUserInfo` - call `auth.getUserInfoPromise()` on the frontend for user info wrapped in a Promise

## [2.0.2] - 2018-02-20

### Added

- start using a changelog

## [2.0.1] - 2018-02-20

### Fixed

- the `getUserInfo` function now correctly uses the opaque accessToken, instead
  of the idToken

### Changed

- `withAuth`'s `auth.userInfo` became `auth.getUserInfo()`
