import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../actions/auth';

// const Login = ({ login, isAuthenticated }) => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });

//   const { email, password } = formData;

//   const onChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const onSubmit = (e) => {
//     e.preventDefault();
//     login(email, password);
//   };

//   if (isAuthenticated) {
//     return <Navigate to="/posts" />;
//   }

//   return (
//     <section className="container">
//       <h1 className="large text-primary">Sign In</h1>
//       <p className="lead">
//         <i className="fas fa-user" /> Sign Into Your Account
//       </p>
//       <form className="form" onSubmit={onSubmit}>
//         <div className="form-group">
//           <input
//             type="email"
//             placeholder="Email Address"
//             name="email"
//             value={email}
//             onChange={onChange}
//           />
//         </div>
//         <div className="form-group">
//           <input
//             type="password"
//             placeholder="Password"
//             name="password"
//             value={password}
//             onChange={onChange}
//             minLength="6"
//           />
//         </div>
//         <input type="submit" className="btn btn-primary" value="Login" />
//       </form>
//       <p className="my-1">
//         Don't have an account? <Link to="/register">Sign Up</Link>
//       </p>
//     </section>
//   );
// };

// Login.propTypes = {
//   login: PropTypes.func.isRequired,
//   isAuthenticated: PropTypes.bool
// };

// const mapStateToProps = (state) => ({
//   isAuthenticated: state.auth.isAuthenticated
// });

// export default connect(mapStateToProps, { login })(Login);


import googleImage from '../../assets/googleImage.png';
import githubImage from '../../assets/githubImage.png';
import twitterImage from '../../assets/twitterImage.png';

export default function LoginPage() {

    const googleLogin = () => {
        window.open("http://localhost:5000/auth/google", "_self");
    }

    const githubLogin = () => {
        window.open("http://localhost:5000/auth/github", "_self");
    }
    
    const twitterLogin = () => {
        window.location.href = "http://localhost:5000/auth/twitter"
    }


    return (
        <div className="loginPage">
            <div className="loginForm">
                <h1>Login</h1>
                <div className="googleContainer" onClick={googleLogin}>
                    <img src={googleImage} alt="Google Icon" />
                    <p>Login With Google</p>
                </div>

                <div className=".googleContainer .githubContainer" onClick={githubLogin}>
                    <img src={githubImage} alt="Github Icon" />
                    <p>Login With Github</p>
                </div>

                <div className=".googleContainer .twitterContainer" onClick={twitterLogin}>
                    <img src={twitterImage} alt="Twitter Icon" />
                    <p>Login With Twitter</p>
                </div>

            </div>

        </div>
    )
}