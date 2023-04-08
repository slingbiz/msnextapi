const httpStatus = require('http-status');
const config = require('../config/config');
const stripe = require('stripe')(config.stripe.secretKey);
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

const getProducts = catchAsync(async (req, res) => {
  const products = await stripe.products.list({
    ids: [config.stripe.productProId, config.stripe.productProPlusId],
  });
  const prices = await stripe.prices.list({
    type: 'recurring',
  });
  if (!products) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }
  if (!prices) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }

  const mergedData = {
    links: {
      inr_monthly_link: config.stripe.inrMonthlySubscriptionLink,
      inr_yearly_link: config.stripe.inrYearlySubscriptionLink,
      aed_monthly_link: config.stripe.aedMonthlySubscriptionLink,
      aed_yearly_link: config.stripe.aedYearlySubscriptionLink,
    },
  };

  const stripeProds = [];

  products.data.forEach((product) => {
    prices.data.forEach((price) => {
      if (price.product === product.id) {
        // Check if the price has an interval before adding it to stripeProds array
        if (price.recurring.interval) {
          stripeProds.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: price.unit_amount,
            priceId: price.id,
            currency: price.currency,
            interval: price.recurring.interval,
          });
        }
      }
    });
  });

  stripeProds.sort((a, b) => {
    if (a.interval === 'month' && b.interval === 'year') {
      return -1;
    }
    if (a.interval === 'year' && b.interval === 'month') {
      return 1;
    }
    return 0;
  });

  mergedData.products = stripeProds;

  res.send(mergedData);
});

module.exports = {
  getBrands,
  getModels,
  getCities,
  getProducts,
  health,
};
