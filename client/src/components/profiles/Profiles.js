import React, { Fragment, useEffect, useState  } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import ProfileItem from './ProfileItem';
import { getProfiles } from '../../actions/profile';

const Profiles = ({ getProfiles, profile: { profiles, loading } }) => {
  useEffect(() => {
    getProfiles();
  }, [getProfiles]);
  
  // State for search input
  const [searchTerm, setSearchTerm] = useState('');

  // Handler for search input change
  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="container">
      
      {loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <h1 className="large text-primary">People</h1>
          <p className="lead">
            <i className="fab fa-connectdevelop" /> Browse and connect with
            People 
            <input 
              type="text" className='searchbox'
              placeholder="Search..." 
              value={searchTerm} 
              onChange={onSearchChange} 
            />
          </p>
          <div className="profiles">
          {profiles.length > 0 ? (
            searchTerm ? (
              filteredProfiles.length > 0 ? (
                filteredProfiles.map(profile => (
                  <ProfileItem key={profile._id} profile={profile} />
                ))
              ) : (
                <h4>No profiles found...</h4>
              )
            ) : (
              profiles.map((profile) => (
                <ProfileItem key={profile._id} profile={profile} updateKey={0} />
              ))
            )
          ) : (
            <h4>No profiles found...</h4>
          )}
          </div>
        </Fragment>
      )}
    </section>
  );
};

Profiles.propTypes = {
  getProfiles: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  profile: state.profile
});

export default connect(mapStateToProps, { getProfiles })(Profiles);
