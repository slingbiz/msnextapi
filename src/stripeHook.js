const config = require('./config/config');
const logger = require('./config/logger');
const { createSubscription, initiateSubscription } = require('./services/user.service');

const stripe = require('stripe')(config.stripe.secretKey);

const endpointSecret = config.stripe.webhookSecret;

const StripeWebhookEvent = async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event

  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      const { customer: checkoutCustomer, customer_details, subscription: subscriptionId } = checkoutSessionCompleted;

      const checkoutCompletedData = {
        customer: checkoutCustomer,
        email: customer_details.email,
        subscription_id: subscriptionId,
      };

      await initiateSubscription(checkoutCompletedData);

      logger.info('checkout completed');
      break;

    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      const { id: subscription_id, customer: customer_id, plan } = subscriptionUpdated;

      const subscriptionUpdatedData = {
        subscription_id,
        customer_id,
        amount: plan.amount,
        currency: plan.currency,
        interval: plan.interval,
        product: plan.product,
      };

      await createSubscription(subscriptionUpdatedData);

      logger.info(
        `Subscription with subscription_id=${subscription_id} and customer_id=${customer_id} updated successfully`
      );
      break;

    default:
      console.log(`stripe event: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
};

module.exports = StripeWebhookEvent;
