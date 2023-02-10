const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const query = require('../utils/mysql');

const getMyCarListings = async (id = 31) => {
  const users = await query(`SELECT * FROM cars_crawled where added_by=${id}`);
  return users;
};

const getMyLeadListings = async (id = 31) => {
  const users = await query(`SELECT * FROM rfq where urlsrc like '%${id}%'`);
  return users;
};

module.exports = {
  getMyCarListings,
  getMyLeadListings,
};
