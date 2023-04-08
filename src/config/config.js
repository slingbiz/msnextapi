const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    SERVICE_PORT: Joi.number().default(3000),
    MYSQL_HOST: Joi.string().required().description('Mysql HOST url'),
    MYSQL_USERNAME: Joi.string().required().description('Mysql USERNAME'),
    MYSQL_PASSWORD: Joi.string().required().description('Mysql PASSWORD'),
    MYSQL_DATABASE: Joi.string().required().description('Mysql DATABASE'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    STRIPE_PUBLISHABLE_KEY: Joi.string().description('Stripe publishable key'),
    STRIPE_SECRET_KEY: Joi.string().description('Stripe secret key'),
    STRIPE_WEBHOOK_SECRET: Joi.string().description('Stripe webhook secret'),
    STRIPE_PRODUCT_PRO_ID: Joi.string().description('Stripe product pro id'),
    STRIPE_PRODUCT_PRO_PLUS_ID: Joi.string().description('Stripe product pro plus id'),
    STRIPE_INR_MONTHLY_SUBSCRIPTION_LINK: Joi.string().description('Stripe inr monthly subscription link'),
    STRIPE_INR_YEARLY_SUBSCRIPTION_LINK: Joi.string().description('Stripe inr yearly subscription link'),
    STRIPE_AED_MONTHLY_SUBSCRIPTION_LINK: Joi.string().description('Stripe aed monthly subscription link'),
    STRIPE_AED_YEARLY_SUBSCRIPTION_LINK: Joi.string().description('Stripe aed yearly subscription link'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.SERVICE_PORT || envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  stripe: {
    publishableKey: envVars.STRIPE_PUBLISHABLE_KEY,
    secretKey: envVars.STRIPE_SECRET_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
    productProId: envVars.STRIPE_PRODUCT_PRO_ID,
    productProPlusId: envVars.STRIPE_PRODUCT_PRO_PLUS_ID,
    inrMonthlySubscriptionLink: envVars.STRIPE_INR_MONTHLY_SUBSCRIPTION_LINK,
    inrYearlySubscriptionLink: envVars.STRIPE_INR_YEARLY_SUBSCRIPTION_LINK,
    aedMonthlySubscriptionLink: envVars.STRIPE_AED_MONTHLY_SUBSCRIPTION_LINK,
    aedYearlySubscriptionLink: envVars.STRIPE_AED_YEARLY_SUBSCRIPTION_LINK,
  },
};
