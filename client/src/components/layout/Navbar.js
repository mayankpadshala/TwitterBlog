import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';

const Navbar = ({ auth, logout }) => {
  //console.log("auth==>"+JSON.stringify(auth))
  return (
    <nav className="navbar bg-dark">
      <h1>
        <Link to="/">
          <i className="fab fa-twitter-square" /> MicroBlab 
        </Link>
      </h1>
      <Fragment>{auth.isAuthenticated ? (
        <ul>
          <li>
            <Link to="/posts">Posts</Link>
          </li>
          <li>
            <Link to="/profiles">People</Link>
          </li>
          <li>
            <Link to={`/profile/${auth.user._id}`}>
              <i className="fas fa-user" />{' '}
              <span className="hide-sm">Profile</span>
            </Link>
          </li>
          <li>
            <a onClick={logout} href="/login">
              <i className="fas fa-sign-out-alt" />{' '}
              <span className="hide-sm">Logout</span>
            </a>
          </li>
        </ul>
      ) : 
     ( <ul>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>)}
  </Fragment>
    </nav>
  );
};

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logout })(Navbar);
