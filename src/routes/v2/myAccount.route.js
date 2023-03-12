const express = require('express');
const multer = require('multer');
const auth = require('../../middlewares/auth');
const phpAuth = require('../../middlewares/phpAuth');
const myAccountController = require('../../controllers/myAccount.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.route('/health').get(phpAuth, myAccountController.health);

router.route('/getMyCarListings').post(phpAuth, myAccountController.getMyCarListings);
router
  .route('/getMyLeadListings')
  .post(phpAuth, myAccountController.getMyLeadListings)
  .patch(phpAuth, myAccountController.updateStatus);

router
  .route('/getMyRFQListings')
  .post(phpAuth, myAccountController.getMyRFQListings)
  .patch(phpAuth, myAccountController.updateStatus);

router.route('/addLeads').post(phpAuth, upload.single('file'), myAccountController.addLeads);

module.exports = router;
