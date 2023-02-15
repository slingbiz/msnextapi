const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { myAccountService } = require('../services');
const { HttpStatusCode } = require('axios');

const health = catchAsync(async (req, res) => {
  const {
    headers: { cookie },
  } = req;
  res.status(200).send({ msg: 'All Good', sessionData: req.session, cookie });
});

const getMyCarListings = catchAsync(async (req, res) => {
  // const filter = pick(req.query, ['name', 'role']);
  // const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // if (!req.phpSession?.user_id) {
  //   next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  // }
  const result = await myAccountService.getMyCarListings(req);
  if (!result) {
    res.status(HttpStatusCode.NoContent).send({ message: 'No record found' });
  }
  res.send(result);
});

const getMyLeadListings = catchAsync(async (req, res) => {
  // const filter = pick(req.query, ['name', 'role']);
  // const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // if (!req.phpSession?.user_id) {
  //   next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  // }
  const result = await myAccountService.getMyLeadListings(req);
  if (!result) {
    res.status(HttpStatusCode.NoContent).send({ message: 'No record found' });
  }
  res.send({ data: result });
});

module.exports = {
  health,
  getMyCarListings,
  getMyLeadListings,
};
