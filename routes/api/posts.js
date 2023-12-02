const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
//const auth = require('../../middleware/auth');
const { logger } = require('../../logger');
const Post = require('../../models/Post');
const User = require('../../models/User');
//const Profile = require('../../models/Profile');
const checkObjectId = require('../../middleware/checkObjectId');
const { createClient } = require('redis');
const passport = require('passport');
const redisClient = createClient({
  url: 'redis://localhost:6379' // Replace with your Redis server's URL
});
redisClient.connect().catch(console.error);

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  '/',
  check('text', 'Text is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const redisKey = `posts-user-${req.user._id}`
    try {
      const user = await User.findById(req.user._id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user._id
      });

      const post = await newPost.save();
      redisClient.setEx(redisKey, 300, JSON.stringify(newPost)).catch(err => {
        console.error('Error caching posts in Redis:', err);
    });
      logger.info('post posts');
      res.json(post);
    } catch (err) {
      console.error(err.message);
      logger.error('post posts-error'+err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
/**
 * @swagger
 * /posts:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get posts
 *     description: Retrieve the posts of the current logged-in user's following user.
 *     responses:
 *       200:
 *         description: posts
 *       500:
 *         description: Server error.
 */

router.get('/', async (req, res) => {
  const redisKey = `posts-user-${req.user._id}`; // Unique Redis key for each user's posts

    try {
        // Try to get cached posts from Redis
        const cachedPosts = await redisClient.get(redisKey);
        if (cachedPosts) {
            // If posts are in the cache, parse and return them
            return res.json(JSON.parse(cachedPosts));
        } else {
            // If not in cache, fetch from database
            const user = await User.findById(req.user._id);
            const followingUser = user.following;
            const posts = await Post.find().sort({ date: -1 }).populate('likes')
                                                              .populate('comments');
            
            // Filter posts as before
            const followingUserIds = followingUser.map(fu => fu.user);
            const filteredPosts = posts.filter(post => followingUserIds.includes(post.user));

            // Cache the posts in Redis with a TTL (e.g., 1 hour = 3600 seconds)
            await redisClient.setEx(redisKey, 3600, JSON.stringify(posts));

            res.json(filteredPosts);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// @route    GET api/posts/:id
// @desc     Get postsbyid
// @access   Private
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get posts of user
 *     description: Retrieve a user's posts.
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: Unique ID of the user.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: posts of the user.
 *       400:
 *         description: posts not found.
 *       500:
 *         description: Server error.
 */
router.get('/user/:id', async (req, res) => {
  try {
    const posts = await Post.find({"user" : req.user._id}).sort({ date: -1 });
    logger.info('get posts');
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    logger.error('get posts By id-error'+err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Get posts by id
 *     description: Retrieve a user's posts by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the post.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: posts by id.
 *       400:
 *         description: posts not found.
 *       500:
 *         description: Server error.
 */
router.get('/:id', checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      logger.info('post not found');
      return res.status(404).json({ msg: 'Post not found' });
    }
    logger.info('get post by id');
    res.json(post);
  } catch (err) {
    console.error(err.message);
    logger.error('get posts by id-error'+err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     summary: delete post by id
 *     description: delete the post by id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the post.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: post deleted.
 *       500:
 *         description: Server error.
 */
router.delete('/:id', [ checkObjectId('id')], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user
    if (post.user.toString() !== req.user._id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();
    logger.info('delete post');
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    logger.error('delete post-err'+err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user._id });

    await post.save();
    logger.info('put like');
    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    logger.error('put like-err'+err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has not yet been liked
    if (!post.likes.some((like) => like.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // remove the like
    post.likes = post.likes.filter(
      ({ user }) => user.toString() !== req.user._id.toString()
    );

    await post.save();
    logger.info('put unlike');
    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    logger.error('put unlike-err'+err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  '/comment/:id',
  checkObjectId('id'),
  check('text', 'Text is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user._id
      };

      post.comments.unshift(newComment);

      await post.save();
      logger.info('post comment');
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      logger.error('post comment-err'+err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user._id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();
    logger.info('delete comment');
    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    logger.error('delete comment-err'+err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
