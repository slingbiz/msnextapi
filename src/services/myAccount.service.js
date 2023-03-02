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
  const { body } = req;
  // const { phpSession, body } = req;
  // const { user_id: userId } = phpSession;

  const { filterValue = '', make = '', model = '', startRange = '', endRange = '' } = body;

  if (filterValue === 'ALL') {
    const myCars = await query(`SELECT * FROM leads`);
    return myCars;
  }

  let carQuery = `
    SELECT *
    FROM leads 
    WHERE 1=1 
  `;

  const params = [];

  if (make !== '') {
    carQuery += ' AND leads.make = ?';
    params.push(make);
  }

  if (model !== '') {
    carQuery += ' AND leads.model = ?';
    params.push(model);
  }

  if (startRange !== '' && endRange !== '') {
    carQuery += `AND leads.added_on >= ? AND leads.added_on <= ? `;
    params.push(startRange, endRange);
  } else if (startRange !== '') {
    carQuery += `AND leads.added_on >= ? `;
    params.push(startRange);
  } else if (endRange !== '') {
    carQuery += `AND leads.added_on <= ? `;
    params.push(endRange);
  }

  const myCars = await query(carQuery, params);
  return myCars;
};

const getMyRFQListings = async (req = {}) => {
  const { phpSession, body } = req;
  const { user_id: userId } = phpSession;

  const { filterValue = '', city = '', make = '', model = '', startRange = '', endRange = '', country = 'in' } = body;

  if (filterValue === 'ALL') {
    const myCars = await query(
      `SELECT * FROM cars_crawled JOIN rfq ON rfq.urlSrc LIKE CONCAT('%', cars_crawled.id, '%') AND cars_crawled.added_by = ?`,
      [userId]
    );
    return myCars;
  }

  let carQuery = `
    SELECT *
    FROM cars_crawled
    JOIN rfq ON rfq.urlSrc LIKE CONCAT('%', cars_crawled.id, '%') AND cars_crawled.added_by = ?
    WHERE cars_crawled.country = ?
  `;

  const params = [userId, country];

  if (filterValue !== '') {
    carQuery += ' AND rfq.status = ?';
    params.push(filterValue);
  } else {
    if (city !== '') {
      carQuery += ' AND cars_crawled.city = ?';
      params.push(city);
    }

    if (make !== '') {
      carQuery += ' AND cars_crawled.make = ?';
      params.push(make);
    }

    if (model !== '') {
      carQuery += ' AND cars_crawled.model = ?';
      params.push(model);
    }

    if (startRange !== '' && endRange !== '') {
      carQuery += `AND rfq.added_on >= ? AND rfq.added_on <= ? `;
      params.push(startRange, endRange);
    } else if (startRange !== '') {
      carQuery += `AND rfq.added_on >= ? `;
      params.push(startRange);
    } else if (endRange !== '') {
      carQuery += `AND rfq.added_on <= ? `;
      params.push(endRange);
    }
  }

  const myCars = await query(carQuery, params);
  return myCars;
};

const updateStatus = async (req = {}) => {
  const { t, id, status } = req.body;

  const newStatus = await query(`UPDATE ${t}
        SET status='${status}'
        WHERE id = ${id}`);

  return newStatus;
};

module.exports = {
  getMyCarListings,
  getMyLeadListings,
  getMyRFQListings,
  updateStatus,
};
