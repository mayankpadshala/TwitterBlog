const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { logger } = require('../../logger');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const User = require('../../models/User');
//const Profile = require('../../models/Profile');
const checkObjectId = require('../../middleware/checkObjectId');

// @route    POST api/users
// @desc     Register user
// @access   Public
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register user
 *     description: Register a new user in the application.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User registered successfully and profile created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid input or user already exists.
 */
router.post(
  '/',
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = normalize(
        gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm'
        }),
        { forceHttps: true }
      );

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      // build a profile
      const profileFields = {
        user: user.id,
        status: "Active"
      };
      // try {
      //   // Using upsert option (creates new doc if no match is found):
      //   let profile = await Profile.findOneAndUpdate(
      //     { user: user.id },
      //     { $set: profileFields },
      //     { new: true, upsert: true, setDefaultsOnInsert: true }
      //   );
      
      // } catch (err) {
      //   console.error(err.message);
      //   return res.status(500).send('Server Error');
      // }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          logger.info('post user');
          res.json({ token , user});
        }
      );
    } catch (err) {
      console.error(err.message);
      logger.error('post user-err'+err.message);
      res.status(500).send('Server error');
    }
  }
);


router.get('/user/:user_id',
  checkObjectId('user_id'),
  async ({ params: { user_id } }, res) => {
    try {
      const profile = await User.findById(user_id);

      logger.info('get profile by id');
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      logger.info('get profile by id-err'+err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

router.get('/me' , async (req, res) => {
  try {
    const profile = await User.findOne({
      user: req.user._id
    });

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    logger.info('get profile me');
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    logger.error('get profile me'+err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get all profiles
 *     description: Retrieve all user profiles.
 *     responses:
 *       200:
 *         description: List of all user profiles.
 *       500:
 *         description: Server error.
 */
router.get('/', async (req, res) => {
  try {
    const profiles = await User.find();
    logger.info('get profile');
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    logger.error('get profile-err'+err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
/**
 * @swagger
 * /profile:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     summary: Create or update user profile
 *     description: Create or update the profile of the logged-in user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               twitter:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               location:
 *                 type: string
 *    
 *     responses:
 *       200:
 *         description: Profile created or updated.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Server error.
 */
router.post('/profile',
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      website,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    // build a profile
    const profileFields = {
      user: req.user._id,
      website:
        website && website !== ''
          ? normalize(website, { forceHttps: true })
          : '',
      ...rest
    };

    // Build socialFields object
    const socialFields = { youtube, twitter, instagram, linkedin, facebook };

    // normalize social fields to ensure valid url
    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0)
        socialFields[key] = normalize(value, { forceHttps: true });
    }
    // add to profileFields
    profileFields.social = socialFields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let newprofile = await User.findByIdAndUpdate(req.user._id ,
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      const profile = await newprofile.save();
      logger.info('post profile');
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      logger.error('post profile-err'+err.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route    PUT api/profile/follow/:id
// @desc     User click follow on id's profile then user Added in id's follower and id added in user's following
// @access   Private
router.put('/follow/:id' , checkObjectId('id'), async (req, res) => {
  try {
    const followprofile = await User.findById(req.params.id);
    const userid = await User.findById(req.user._id);
    
    followprofile.followers.unshift({ user: req.user._id });
    userid.following.unshift({ user: req.params.id });

    await followprofile.save();
    await userid.save();

    logger.info('follow user');
    return res.json(followprofile);
  } catch (err) {
    console.error(err.message);
    logger.error('follow user-err'+err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/profile/unfollow/:id
// @desc     unfollow a post
// @access   Private
router.put('/unfollow/:id' , checkObjectId('id'), async (req, res) => {
  try {
    const Unfollowprofile = await User.findById(req.params.id);
    const userid = await User.findById(req.user._id);

    Unfollowprofile.followers = Unfollowprofile.followers.filter(
      ({ user }) => user.toString() !== req.user._id
    );
    // remove following
    userid.following = userid[0].following.filter(
      ({ user }) => user.toString() !== Unfollowprofile.user
    );

    await Unfollowprofile.save();
    await userid.save();
    logger.info('unfollow user');
    return res.json(Unfollowprofile);
  } catch (err) {
    console.error(err.message);
    logger.error('unfollow user-err'+err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
