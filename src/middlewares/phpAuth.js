const axios = require('axios');
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");


/**
 * Custom interim auth middleware to check session data in PHP server and set in the req.
 * To be replaced with JWT once the complete migration is done.
 * @param req
 * @param res
 * @param next
 */
const phpAuth = async function (req, res, next) {
  const response = await axios.get('https://www.motorsingh.com/user/validate', {
    headers: {cookie: `PHPSESSID=${req.cookies.PHPSESSID};`}
  });
  if (response?.data?.user_id) {
    req.phpSession = response.data;
    next();
  }else{
    next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
}

//Deprecated.
const getCookieString = (cookieObj) => {
  let cookieStr = '';
  Object.keys(cookieObj).map((key, val) => {
    cookieStr += `${key}:${cookieObj[key]};`;
  });
  return cookieStr;
}

module.exports = phpAuth;
