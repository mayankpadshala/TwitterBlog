const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
//const redis = require('redis');
const { logger, morganMiddleware } = require('./logger');
const session = require('express-session');
const passport =require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const config = require('./config/default.json');
const cors = require('cors');
const User = require('./models/User');
const app = express();
const qrcode = require("qrcode");
const { authenticator } = require("otplib");
const auth = require('./middleware/auth');
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
app.use(cors({ origin: "http://localhost:3000", credentials: true, "Access-Control-Allow-Origin": "http://localhost:3000"
}));

// Define Routes

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
app.use(morganMiddleware);

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/upload', require('./routes/api/upload'));


passport.serializeUser((user, done) => {
  return done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, doc) => {
    //console.log("in deser==>"+doc)
    return done(null, doc);
  })
})


passport.use(new GoogleStrategy({
  clientID: config.GoogleClientId,
  clientSecret: config.GoogleClientSecret,
  callbackURL: "/auth/google/callback"
},
  function (request, accessToken, refreshToken, profile, done) {
    User.findOne({ googleId: profile.id }, async (err, doc) => {
      if (err) {
        return done(err, null);
      }
      if (!doc) {
        console.log(profile);
        const newUser = new User({
          googleId: profile.id,
          role:"user",
          name: profile.displayName,
          avatar: "https://www.shutterstock.com/image-vector/user-icon-trendy-flat-style-600nw-1467725033.jpg"
        });
        //console.log("p==>"+JSON.stringify(profile));
        await newUser.save();
        return done(null, newUser);
      }
      return done(null, doc);
    })

  }));

passport.use(new TwitterStrategy({
  consumerKey: config.TwitterconsumerKey,
  consumerSecret: config.TwitterconsumerSecret,
  callbackURL: "/auth/twitter/callback"
},
function (request, accessToken, refreshToken, profile, done) {
    User.findOne({ twitterId: profile.id }, async (err, doc) => {
      if (err) {
        return done(err, null);
      }
      if (!doc) {
        // image = ""
        // if(profile._json.profile_image_url){
        //   image = profile._json.profile_image_url;
        // }else{
        //   image = "https://www.shutterstock.com/image-vector/user-icon-trendy-flat-style-600nw-1467725033.jpg";
        // }
        const newUser = new User({
          twitterId: profile.id,
          role:"user",
          name: profile.displayName,
          avatar: "https://www.shutterstock.com/image-vector/user-icon-trendy-flat-style-600nw-1467725033.jpg"
        });

        await newUser.save();
        done(null, newUser);
      }
      done(null, doc);
    })

  }
));

passport.use(new GitHubStrategy({
  clientID: config.GitHubclientID,
  clientSecret: config.GitHubclientSecret,
  callbackURL: "/auth/github/callback"
},
function (request, accessToken, refreshToken, profile, done) {
    User.findOne({ githubId: profile.id }, async (err, doc) => {
      if (err) {
        return done(err, null);
      }
      if (!doc) {
        
        const newUser = new User({
          githubId: profile.id,
          role: "user",
          name: profile.displayName,
          avatar: "https://www.shutterstock.com/image-vector/user-icon-trendy-flat-style-600nw-1467725033.jpg"
        });
        await newUser.save();
        done(null, newUser);
      }
      done(null, doc);
    })

  }
));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login', session: true }),
  function (req, res) {
    res.redirect('http://localhost:3000/posts');
  });


app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: 'http://localhost:3000/login', session: true }),
  function (req, res) {
    res.redirect('http://localhost:3000/posts');
  });


app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:3000/login', session: true }),
  function (req, res) {
    res.redirect('http://localhost:3000/posts');
  });

app.get("/getuser", (req, res) => {
  //console.log("getuserData"+JSON.stringify(req.user));
  res.send(req.user);
})


app.get("/auth/logout", (req, res) => {
  if (req.user) {
    req.logout(function(err) {
      if (err) { 
        return next(err); 
      }
      req.session.destroy();
      res.redirect('http://localhost:3000/');
    });
  } else {
    // Handle the case where there is no user to log out
    res.redirect('http://localhost:3000/');
  }
})

// generater QR Image
app.get("/api/qrImage",auth, async (req, res) => {
  try {
    //console.log("reqUserIdtrace:", req.user._id);
    //const { id } = req.cookies;
    //console.log("idtrace:", id);
    const user = await User.findById(req.user._id);
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(user._id, "Micrblab", secret);
    const image = await qrcode.toDataURL(uri);
    user["twoFA"].tempSecret = secret;
    user["twoFA"].qrImage = image;
    await user.save();
    return res.json(user);
  } 
  catch(err) {
      console.log(err.message);
        return res.status(500).send({
          success: false,
        });
  }
});

// set the 2 FA
app.put("/api/set2FA", auth, async (req, res) => {
  try {
    //const { id } = req.cookies;
    //const { code } = req.query;
    const user = await User.findById(req.user._id);
    console.log("user==>"+JSON.stringify(user))
    const tempSecret= user["twoFA"].tempSecret;
    const { code } = req.body;
    const verified = authenticator.check(code, tempSecret);
    if (!verified) throw false;

    user["twoFA"] = {
      enabled: true,
      secret: tempSecret,
      qrImage: null
    };
    await user.save();
    return res.json(user);
  } catch(err) {
    console.error(err.message);
    logger.error('post user-err'+err.message);
    res.status(500).send('Server error');
  }
});

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


