const express = require('express');
const auth = require('../../middlewares/auth');
const phpAuth = require('../../middlewares/phpAuth');
const validate = require('../../middlewares/validate');
const chatController = require('../../controllers/chat.controller');

const router = express.Router();

router.route('/').post(chatController.getChats);

module.exports = router;
