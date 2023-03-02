const express = require('express');
const phpAuth = require('../../middlewares/phpAuth');

const hController = require('../../controllers/h.controller');

const router = express.Router();

router.route('/health').get(phpAuth, hController.health);

router.route('/getBrands').post(phpAuth, hController.getBrands);
router.route('/getModels').post(phpAuth, hController.getModels);

module.exports = router;
