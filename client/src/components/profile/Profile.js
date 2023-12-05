import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import ProfileTop from './ProfileTop';
import UserPost from './UserPost';
import { getProfileById , twoFAEnable, settwoFA, addFollower, UnFollow, deleteAccount } from '../../actions/profile';


const Profile = ({ getProfileById,twoFAEnable, settwoFA, deleteAccount, profile: { profile }, auth , addFollower, UnFollow}) => {
  const { id } = useParams();
  useEffect(() => {
    getProfileById(id);
  }, [getProfileById, id]);

  const [showTwoFAForm, setShowTwoFAForm] = useState(false);
  const [code, setCode] = useState('');
  const onChange = (e) => setCode(e.target.value);
  const onSubmit = async (e) => {
    e.preventDefault();
    settwoFA({ code });
  };
  useEffect(() => {
    if (profile && profile.twoFA && profile.twoFA.qrImage) {
      setShowTwoFAForm(true);
    }else{
      setShowTwoFAForm(false);
    }
  }, [profile]);
  console.log(auth)
  return (
    <section className="container">
      {profile === null ? (
        <Spinner />
      ) : (
        <Fragment>
          {auth.isAuthenticated &&
            auth.loading === false &&
            auth.user._id === profile._id && (
              <Link to="/edit-profile" className="btn btn-dark">
                Edit Profile
              </Link>
            )}
          <div className="profile-grid my-1">
            <ProfileTop profile={profile} />
            <div className="profile-follow bg-primary">
            {auth.isAuthenticated &&
              auth.loading === false &&
              auth.user._id !== profile._id && profile.followers.length > 0 && profile.followers.find(i => i.user === auth.user._id) && (
                <button
                    onClick={() => UnFollow(profile._id)}
                    type="button"
                    className="btn btn-dark"
                  >
                    UnFollow
                    {/* <span>{likes.length > 0 && <span>{likes.length}</span>}</span> */}
                  </button>
              )}
              {auth.isAuthenticated &&
              auth.loading === false &&
              auth.user._id !== profile._id && (!profile.followers.length || !profile.followers.find(i => i.user === auth.user._id)) &&  (
                <button
                    onClick={() => addFollower(profile._id)}
                    type="button"
                    className="btn btn-dark"
                  >
                    Follow
                    {/* <span>{likes.length > 0 && <span>{likes.length}</span>}</span> */}
                  </button>
              )}
            </div>
             
          </div>
          <UserPost id={profile._id}/>

          {auth.isAuthenticated &&
            auth.loading === false &&
            auth.user._id === profile._id && (
              <div className="my-2">
                  <div className="d-flex flex-column align-items-center gap-3 twoFABox">
                    <button id="enable2FAButton" className="btn btn-success"  onClick={() => twoFAEnable()}>
                      UPDATE/ENABLE 2FA
                    </button>
                    {showTwoFAForm && (
                      <div id="twoFAFormHolder" className="d-flex flex-column align-items-center gap-3">
                        <img id="qrImage" alt="QR code" src={profile.twoFA.qrImage} height="150" width="150" />
                        <form id="twoFAUpdateForm" className="d-flex flex-column gap-2 form" onSubmit={onSubmit}>
                          <input
                            type="text"
                            name="code"
                            placeholder="2 FA Code" value={code}
                            onChange={onChange}
                            className="form-control"/>
                          <button className="btn btn-primary" type='submit'>SET</button>
                        </form>
                      </div>
                      )}
                  </div>
                  <div>
                    <button className="btn btn-danger" onClick={() => deleteAccount()}>
                      <i className="fas fa-user-minus" /> Delete My Account
                    </button>
                  </div>
              </div>
            )}
        </Fragment>
      )}
    </section>
  );
};

Profile.propTypes = {
  getProfileById: PropTypes.func.isRequired,
  twoFAEnable: PropTypes.func.isRequired,
  settwoFA : PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  addFollower: PropTypes.func.isRequired,
  UnFollow : PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth
});

export default connect(mapStateToProps, { getProfileById,twoFAEnable, settwoFA, addFollower, UnFollow, deleteAccount })(Profile);
