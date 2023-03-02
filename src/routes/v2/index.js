const express = require('express');
const authRoute = require('./auth.route');
const chatRoute = require('./chat.route');
const userRoute = require('./user.route');
const myAccount = require('./myAccount.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/chats',
    route: chatRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/myAccount',
    route: myAccount,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
