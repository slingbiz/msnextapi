const axios = require('axios');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Custom interim auth middleware to check session data in PHP server and set in the req.
 * To be replaced with JWT once the complete migration is done.
 * @param req
 * @param res
 * @param next
 */
const phpAuth = async function (req, res, next) {
  console.log(JSON.stringify(req.cookies.PHPSESSID));
  const response = await axios.get('https://www.motorsingh.com/user/validate', {
    // headers: { Cookie: `PHPSESSID=${req.cookies.PHPSESSID};` },
    // headers: { Cookie: `PHPSESSID=7e952iigfbbkvle1v0j61tn8c3` },
    headers: { Cookie: `PHPSESSID=0pt78bg40irspangui51l1nfc6` },
  });
  console.log(response.data);
  if (response?.data) {
    // response?.data?.user_id
    req.phpSession = response.data;
    next();
  } else {
    next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
};

//Deprecated.
const getCookieString = (cookieObj) => {
  let cookieStr = '';
  Object.keys(cookieObj).map((key, val) => {
    cookieStr += `${key}:${cookieObj[key]};`;
  });
  return cookieStr;
};

module.exports = phpAuth;
