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

const paymentConfig = catchAsync(async (req, res) => {
  res.send({
    publishableKey: config.stripe.publishableKey,
  });
});

const getProducts = catchAsync(async (req, res) => {
  const products = await stripe.products.list();
  const prices = await stripe.prices.list();
  if (!products) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }
  if (!prices) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No data found');
  }

  const mergedData = [];
  products.data.forEach((product) => {
    prices.data.forEach((price) => {
      if (price.product === product.id) {
        mergedData.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: price.unit_amount,
          priceId: price.id,
          currency: price.currency,
          interval: price.recurring.interval,
        });
      }
    });
  });

  mergedData.sort((a, b) => {
    if (a.interval === 'month' && b.interval === 'year') {
      return -1;
    }
    if (a.interval === 'year' && b.interval === 'month') {
      return 1;
    }
    return 0;
  });

  res.send(mergedData);
});

const createPaymentIntent = catchAsync(async (req, res) => {
  const { name, email, paymentMethod, priceId } = req.body;

  try {
    // create a stripe customer
    const customer = await stripe.customers.create({
      name,
      email,
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    });

    // create a stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: 'any',
          },
        },
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // return the client secret and subscription id
    res.send({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

module.exports = {
  createPaymentIntent,
  paymentConfig,
  getBrands,
  getModels,
  getCities,
  getProducts,
  health,
};
