import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { sendPasswordResetEmail } from '../../actions/auth';

const ForgotPassword = ({ }) => {
  const [email, setEmail] = useState('');
  const code =""
  const onChange = (e) => setEmail(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();
    sendPasswordResetEmail(email);
  };

  return (
    <section className="container">
      <h1 className="large text-primary">Reset Password</h1>
      <p className="lead">
        <i className="fas fa-user" /> Enter your email address to reset your password
      </p>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Send code" />
      </form>
      <input
            type="text"
            placeholder="code"
            name="code"
            value={code}
            required
          />
      <p className="my-1">
        Remembered your password? <Link to="/login">Sign In</Link>
      </p>
    </section>
  );
};

ForgotPassword.propTypes = {
  //sendPasswordResetEmail: PropTypes.func.isRequired,
};

export default connect(null, {  })(ForgotPassword);