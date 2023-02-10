const query = require('../utils/mysql');

const getMyCarListings = async (req = {}) => {
  // const users = await query(`SELECT * FROM cars_crawled`);
  // return users;
  const { phpSession } = req;
  if (!phpSession) {
    // return undefined;
  }
  const { user_id: userId, country, email, username } = phpSession;
  const myCars = await query(`SELECT * FROM cars_crawled WHERE added_by = ${userId}`);

  return myCars;
};

const getMyLeadListings = async (req = {}) => {
  const { phpSession } = req;
  console.log(phpSession);
  if (!phpSession) {
    // return undefined;
  }
  const { user_id: userId, country, email, username } = phpSession;
  const myCars = await query(`SELECT * FROM rfq where urlsrc like '%${userId}%'`);

  return myCars;
};

module.exports = {
  getMyCarListings,
  getMyLeadListings,
};
