const express = require('express');
const auth = require('../../middlewares/auth');
const phpAuth = require('../../middlewares/phpAuth');
const myAccountController = require('../../controllers/myAccount.controller');

const router = express.Router();

router.route('/health').get(phpAuth, myAccountController.health);

router.route('/getMyCarListings').post(phpAuth, myAccountController.getMyCarListings);

module.exports = router;
