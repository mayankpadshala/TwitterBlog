import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import ProfileTop from './ProfileTop';
import UserPost from './UserPost';
import { getProfileById , addFollower, UnFollow } from '../../actions/profile';

const Profile = ({ getProfileById, profile: { profile }, auth , addFollower, UnFollow}) => {
  const { id } = useParams();
  useEffect(() => {
    getProfileById(id);
  }, [getProfileById, id]);
  console.log("pro==>"+JSON.stringify(profile));
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
          <UserPost/>
        </Fragment>
      )}
    </section>
  );
};

Profile.propTypes = {
  getProfileById: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  addFollower: PropTypes.func.isRequired,
  UnFollow : PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth
});

export default connect(mapStateToProps, { getProfileById, addFollower, UnFollow })(Profile);
