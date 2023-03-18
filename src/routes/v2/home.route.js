const express = require('express');
const phpAuth = require('../../middlewares/phpAuth');

const homeController = require('../../controllers/home.controller');

const router = express.Router();

router.route('/health').get(phpAuth, homeController.health);

router.route('/getBrands').post(phpAuth, homeController.getBrands);
router.route('/getModels').post(phpAuth, homeController.getModels);
router.route('/getCities').get(phpAuth, homeController.getCities);
router.route('/payment-config').get(phpAuth, homeController.paymentConfig);
router.route('/create-payment-intent').post(phpAuth, homeController.createPaymentIntent);

module.exports = router;
