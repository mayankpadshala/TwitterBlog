import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PostItem from '../posts/PostItem';
import { getPostsById } from '../../actions/post';

const Posts = ({ getPostsById, post: { posts } }) => {
  useEffect(() => {
    getPostsById();
  }, [getPostsById]);

  return (
    <section className="">
      <h1 className="large text-primary">Posts</h1>
      <div className="posts">
        {posts.map((post) => (
          <PostItem key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
};

Posts.propTypes = {
  getPostsById: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  post: state.post
});

export default connect(mapStateToProps, { getPostsById })(Posts);
