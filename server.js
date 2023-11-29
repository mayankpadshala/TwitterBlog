const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cookieParser = require('cookie-parser');
const ws = require('ws');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
//const redis = require('redis');
const { logger, morganMiddleware } = require('./logger');
const session = ('express-session');
const passport =require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const cors = require('cors');
const User = require('./models/User');
const app = express();

// Connect Database
connectDB();

// const redisClient = redis.createClient({
//     host: 'localhost', // or your Redis server host
//     port: 6379 // default Redis port
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));

// redisClient.connect();


// Init Middleware
// app.use(express.json());
// app.use('/uploads', express.static(__dirname + '/uploads'));
// app.use(cookieParser());

app.use(express.json());
app.use(cors({ origin: "http://localhost:5000", credentials: true }))

app.set("trust proxy", 1);

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // One Week
    }
  }))


// Define Routes
app.use('/api/users', require('./routes/api/users'));
//app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/messages', require('./routes/api/messages'));
app.use('/api/upload', require('./routes/api/upload'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
app.use(morganMiddleware);

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
  return done(null, user._id);
});

passport.deserializeUser((id, done) => {

  User.findById(id, (err, doc) => {
    // Whatever we return goes to the client and binds to the req.user property
    return done(null, doc);
  })
})


passport.use(new GoogleStrategy({
  clientID: "602322387096-ds7lr4lnm637uamuu56m8hflcmbc3gfh.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "/auth/google/callback"
},
  function (_ , __, profile, cb) {
    console.log("Passport google backend")
    User.findOne({ googleId: profile.id }, async (err, doc) => {

      if (err) {
        return cb(err, null);
      }

      if (!doc) {
        const newUser = new User({
          googleId: profile.id,
          username: profile.name.givenName
        });

        await newUser.save();
        cb(null, newUser);
      }
      cb(null, doc);
    })

  }));

passport.use(new TwitterStrategy({
  consumerKey: `${process.env.TWITTER_CLIENT_ID}`,
  consumerSecret: `${process.env.TWITTER_CLIENT_SECRET}`,
  callbackURL: "/auth/twitter/callback"
},
  function (_ , __ , profile, cb) {

    User.findOne({ twitterId: profile.id }, async (err, doc) => {

      if (err) {
        return cb(err, null);
      }

      if (!doc) {
        const newUser = new User({
          twitterId: profile.id,
          username: profile.username
        });

        await newUser.save();
        cb(null, newUser);
      }
      cb(null, doc);
    })

  }
));

passport.use(new GitHubStrategy({
  clientID: `${process.env.GITHUB_CLIENT_ID}`,
  clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
  callbackURL: "/auth/github/callback"
},
  function (_, __, profile, cb) {

    User.findOne({ githubId: profile.id }, async (err, doc) => {

      if (err) {
        return cb(err, null);
      }

      if (!doc) {
        const newUser = new User({
          githubId: profile.id,
          username: profile.username
        });

        await newUser.save();
        cb(null, newUser);
      }
      cb(null, doc);
    })

  }
));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'https://gallant-hodgkin-fb9c52.netlify.app', session: true }),
  function (req, res) {
    res.redirect('http://localhost:5000/posts');
  });


app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: 'https://gallant-hodgkin-fb9c52.netlify.app', session: true }),
  function (req, res) {
    res.redirect('https://gallant-hodgkin-fb9c52.netlify.app');
  });


app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'https://gallant-hodgkin-fb9c52.netlify.app', session: true }),
  function (req, res) {
    res.redirect('https://gallant-hodgkin-fb9c52.netlify.app');
  });



app.get("/", (req, res) => {
  res.send("Helllo WOlrd");
})

app.get("/getuser", (req, res) => {
  res.send(req.user);
})

app.get("/auth/logout", (req, res) => {
  if (req.user) {
    req.logout();
    res.send("done");
  }
})

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));


