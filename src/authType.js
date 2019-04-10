import PropTypes from 'prop-types'

export default PropTypes.shape({
  loggedIn: PropTypes.bool.isRequired,
  token: PropTypes.string,
  accessToken: PropTypes.string,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  getUserInfo: PropTypes.func,
  getPortalUserGroups: PropTypes.func,
  authError: PropTypes.func.isRequired,
  getUserInfoPromise: PropTypes.func,
  getUserRolesPromise: PropTypes.func,
  userInfo: PropTypes.object,
})
