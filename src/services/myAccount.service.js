const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const query = require('../utils/mysql');

const getMyCarListings = async (filter) => {
  // const users = await query(`SELECT * FROM user WHERE user_id = ${id} limit 1`);
  // return users;
  return [{ id: 23, title: 'Some used car title', price: 23330, kms_run: 56000 }];
};

module.exports = {
  getMyCarListings,
};
