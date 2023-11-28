// queueProcessor.js

const Queue = require('bull');
const { createClient } = require('redis');
const redisClient = createClient({
    url: 'redis://localhost:6379' // Replace with your Redis server's URL
  });
  const Post = require('./models/Post');
  const User = require('./models/User');
  const Profile = require('./models/Profile');

const postQueue = new Queue('postQueue', 'redis://127.0.0.1:6379');

postQueue.process(async (job, done) => {
    logger.info("job"+job)
    const followingUserId = job.data.userId;
    const redisKey = `posts-user-${job.data.user}`;
    
    try {
        
        //const filteredPosts = posts.filter(post => followingUserIds.includes(post.user));
        const filteredPosts = await Post.find({ user: followingUserId }).sort({ date: -1 }).lean();

        await redisClient.setEx(redisKey, 300, JSON.stringify(filteredPosts));
        done();
    } catch (err) {
        console.error(err);
        done(err);
    }
});
