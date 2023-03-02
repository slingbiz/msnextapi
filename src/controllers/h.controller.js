const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { hService } = require('../services');

const health = catchAsync(async (req, res) => {
  const {
    headers: { cookie },
  } = req;
  res.status(200).send({ msg: 'All Good', sessionData: req.session, cookie });
});

const getBrands = catchAsync(async (req, res) => {
  const brands = await hService.getBrands(req.body);
  if (!brands) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }
  res.send(brands);
});

const getModels = catchAsync(async (req, res) => {
  const models = await hService.getModels(req.body);
  if (!models) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }
  res.send(models);
});

module.exports = {
  getBrands,
  getModels,
  health,
};
