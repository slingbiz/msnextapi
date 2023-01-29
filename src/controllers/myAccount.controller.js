const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { myAccountService } = require('../services');

const health = catchAsync(async (req, res) => {
  const {
    headers: { cookie },
  } = req;
  res.status(200).send({ msg: 'All Good', sessionData: req.session, cookie });
});

const getMyCarListings = catchAsync(async (req, res) => {
  // const filter = pick(req.query, ['name', 'role']);
  // const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await myAccountService.getMyCarListings(req);
  res.send(result);
});

module.exports = {
  health,
  getMyCarListings,
};
