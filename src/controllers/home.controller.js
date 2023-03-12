const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { homeService } = require('../services');

const health = catchAsync(async (req, res) => {
  const {
    headers: { cookie },
  } = req;
  res.status(200).send({ msg: 'All Good', sessionData: req.session, cookie });
});

const getBrands = catchAsync(async (req, res) => {
  const brands = await homeService.getBrands(req.body);
  if (!brands) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }
  res.send(brands);
});

const getModels = catchAsync(async (req, res) => {
  const models = await homeService.getModels(req.body);
  if (!models) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }
  res.send(models);
});

const getCities = catchAsync(async (req, res) => {
  const cities = await homeService.getCities(req.query);
  if (!cities) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }
  res.send(cities);
});

module.exports = {
  getBrands,
  getModels,
  getCities,
  health,
};
