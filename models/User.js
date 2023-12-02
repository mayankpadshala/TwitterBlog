const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  googleId: {
    type: String,
  },
  twitterId: {
    type: String,
  },
  githubId: {
    type: String,
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  bio: {
    type: String
  },
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  },
  followers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
      }
    }
  ],
  following: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
      }
    }
  ],
});

module.exports = mongoose.model('user', UserSchema);
