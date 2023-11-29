const express = require('express');
const router = express.Router();
const multer = require('multer');
const Image = require('../../models/Image'); 
const auth = require('../../middleware/auth');
const { logger } = require('../../logger');
// Configure multer for image storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'),
  auth,
  async (req, res) => {
    
    try {
      const newImage = new Image({
        data: req.file.buffer,
        contentType: req.file.mimetype,
        user: req.user.id
      });

      const image = await newImage.save();
      
      logger.info('post image');
      res.set('Content-Type', image.contentType);
      res.send(image.data);
    } catch (err) {
      console.error(err.message);
      logger.error('post image-error '+err.message);
      res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
      const image = await Image.find({"user" : req.params.id}).sort({ date: -1 });
  
      res.set('Content-Type', image[0].contentType);
      res.send(image[0].data);
    } catch (err) {
      res.status(404).send('Image not found');
    }
  });

module.exports = router;
