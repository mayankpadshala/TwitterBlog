import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation, Navigate  } from 'react-router-dom';
import PropTypes from 'prop-types';
import { setAlert } from '../../actions/alert';
import { newPassword } from '../../actions/auth';

const ConfirmPassword = ({ newPassword,  isAuthenticated}) => {
    const location = useLocation();
  const email = location.state?.email;
  const [password, setpassword] = useState('');
  const [cpassword, setcpassword] = useState('');
    console.log(email);

  const onChange = (e) => setpassword(e.target.value);
  const onChange2 = (e) => setcpassword(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== cpassword) {
        setAlert('Passwords do not match', 'danger');
      } else {
        newPassword({ email, password });
      }
  };

  if (isAuthenticated) {
    return <Navigate to="/posts" />;
  }

  return (
    <section className="container2">
      <h1 className="large text-primary">Reset Password</h1>
      <p className="lead">
        <i className="fas fa-key" /> Enter new password
      </p>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmpassword"
            value={cpassword}
            onChange={onChange2}
            required
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Reset" />
      </form>
      <p className="my-1">
        Remembered your password? <Link to="/login">Sign In</Link>
      </p>
    </section>
  );
};

ConfirmPassword.propTypes = {
    newPassword: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { newPassword  })(ConfirmPassword);