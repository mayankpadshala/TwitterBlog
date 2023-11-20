const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Message = require('../../models/Message');

// @route    GET api/message/:id
// @desc     Get message
// @access   Private
router.get('/:id', auth, async (req, res) => {
    try {
        const userId = req.params.id;
        const ourUserId = req.user.id;
        const messages = await Message.find({
            sender:{$in:[userId,ourUserId]},
            recipient:{$in:[userId,ourUserId]},
          }).sort({createdAt: 1});
          res.json(messages);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  module.exports = router;