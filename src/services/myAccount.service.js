const query = require('../utils/mysql');

const getMyCarListings = async (req) => {
  // const users = await query(`SELECT * FROM cars_crawled`);
  // return users;
  const { phpSession } = req;
  const { user_id: userId, country, email, username } = phpSession;
  const myCars = await query(`SELECT * FROM cars_crawled WHERE added_by = ${userId}`);

  return myCars;
};

module.exports = {
  getMyCarListings,
};
