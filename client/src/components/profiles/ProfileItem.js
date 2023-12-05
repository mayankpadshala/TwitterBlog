import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addFollower, UnFollow } from '../../actions/profile';

const ProfileItem = ({
  profile: {
    _id,
    avatar, name, user,
    bio,
    followers,
    location,
  }, auth, addFollower, UnFollow
}) => {
  return (
    <div className='profile bg-light'>
      <img src={avatar} alt='' className='round-img' />
      <div>
        <h2>{name}</h2>
        <p>
          {bio} 
        </p>
        <p className='my-1'>{location && <span>{location}</span>}</p>
        
         {/* {auth.isAuthenticated &&
              auth.loading === false &&
              auth.user._id !== _id && followers.length > 0 && followers.find(i => i.user === auth.user._id) && (
                <button
                    onClick={() => UnFollow(_id)} 
                    type="button"
                    className="btn btn-dark"
                  >
                    UnFollow
                  </button>
              )}
              {auth.isAuthenticated &&
              auth.loading === false &&
              auth.user._id !== _id && (!followers.length || !followers.find(i => i.user === auth.user._id)) &&  (
                <button
                    onClick={() => addFollower(_id)}
                    type="button"
                    className="btn btn-dark"
                  >
                    Follow
                  </button>
              )} */}
            </div>
            <ul><Link to={`/profile/${_id}`} className='btn btn-primary'>
                View Profile
              </Link>
            </ul>
    </div>
  );
};

ProfileItem.propTypes = {
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  addFollower: PropTypes.func.isRequired,
  UnFollow : PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});
export default React.memo(connect(mapStateToProps, { addFollower, UnFollow })(ProfileItem));
