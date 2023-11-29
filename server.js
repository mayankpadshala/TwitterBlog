const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cookieParser = require('cookie-parser');
const ws = require('ws');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
//const redis = require('redis');
const { logger, morganMiddleware } = require('./logger');

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
app.use(express.json());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cookieParser());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/messages', require('./routes/api/messages'));
app.use('/api/upload', require('./routes/api/upload'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
app.use(morganMiddleware);

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


