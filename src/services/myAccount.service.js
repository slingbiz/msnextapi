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
  const { phpSession, body } = req;
  console.log(phpSession, body);
  if (!phpSession) {
    // return undefined;
  }
  const { user_id: userId, country, email, username } = phpSession;
  // const myCars = await query(`SELECT * FROM rfq where urlsrc like '%${userId}%'`);
  if (body.filter_type === 'ALL') {
    const myCars = await query(
      `select * from cars_crawled join rfq on rfq.urlSrc like CONCAT('%', cars_crawled.id, '%') and cars_crawled.added_by =${userId}`
    );
    return myCars;
  } else {
    const myCars = await query(
      `select * from cars_crawled join rfq on rfq.urlSrc like CONCAT('%', cars_crawled.id, '%') and cars_crawled.added_by =${userId} and rfq.status='${body.filter_type}'`
    );
    return myCars;
  }
};

module.exports = {
  getMyCarListings,
  getMyLeadListings,
};
