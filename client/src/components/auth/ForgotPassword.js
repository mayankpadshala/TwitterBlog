import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate  } from 'react-router-dom';
import PropTypes from 'prop-types';
import { sendPasswordResetEmail } from '../../actions/auth';

const ForgotPassword = ({ sendPasswordResetEmail }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Math.floor(100000 + Math.random() * 900000));
  const [writecode, setcode] = useState('');

  console.log("otp==>"+otp);
  const onChange = (e) => setEmail(e.target.value);
  const onChange2 = (e) => setcode(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();
    sendPasswordResetEmail(email, otp);
  };
  
  const onSubmit2 = async (e) => {
    e.preventDefault();
    if(writecode == otp){
      navigate("/confirmPassword", { state : {email: email}});
    }
  };

  return (
    <section className="container2">
      <h1 className="large text-primary">Reset Password</h1>
      <p className="lead">
        <i className="fas fa-envelope" /> Enter email address to reset password
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
      <form className="form" onSubmit={onSubmit2}>
        <div className="form-group">
          <input
            type="text"
            placeholder="code"
            name="code"
            value={writecode}
            onChange={onChange2}
            required
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Confirm" />
      </form>
      <p className="my-1">
        Remembered your password? <Link to="/login">Sign In</Link>
      </p>
    </section>
  );
};

ForgotPassword.propTypes = {
  sendPasswordResetEmail: PropTypes.func.isRequired
};

export default connect(null, {sendPasswordResetEmail  })(ForgotPassword);