const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const redis = require('redis');
const session = require('express-session');
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
  legacyMode: true
});
const RedisStore = require('connect-redis')(session);

const {jwtStrategy} = require('./config/passport');
const {authLimiter} = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const {errorConverter, errorHandler} = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// Use Redis session
redisClient.on('error', function (err) {
  console.log('Could not establish a connection with redis. ' + err);
});
redisClient.connect().catch(console.error)

redisClient.on('connect', function (err) {
  console.log('Connected to redis successfully');
});

app.use(
  session({
    name: 'PHPSESSID',
    secret: 'ms',
    store: new RedisStore({ client: redisClient, prefix: 'PHPSESSID' }),
  })
);
// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({extended: true}));

// sanitize request data
app.use(xss());
// app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  console.log(req.url, 'not found req url');
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
