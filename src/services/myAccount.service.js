const Papa = require('papaparse');
const query = require('../utils/mysql');
const { isSubscribed } = require('./user.service');

const getMyCarListings = async (req = {}) => {
  // const users = await query(`SELECT * FROM cars_crawled`);
  // return users;
  const { phpSession } = req;
  if (!phpSession) {
    // return undefined;
  }
  const { user_id: userId, country, email, username } = phpSession;
  const myCars = await query(`SELECT * FROM cars_crawled WHERE added_by = '${userId}'`);

  return myCars;
};

const getMyLeadListings = async (req = {}) => {
  const { phpSession, body } = req;
  const { user_id: userId } = phpSession;
  const {
    filterValue = '',
    city = '',
    make = '',
    model = '',
    startRange = '',
    endRange = '',
    page = 1,
    rowsPerPage = 25,
  } = body;

  const offset = (page - 1) * rowsPerPage;

  const isSub = await isSubscribed(userId);

  const myCars = { subscribed: isSub };

  let carQuery = `
    SELECT *
    FROM leads
    WHERE 1=1
  `;

  let countQuery = `
    SELECT COUNT(*) as count
    FROM leads
    WHERE 1=1
  `;

  const params = [];

  if (city !== '') {
    carQuery += ' AND leads.city = ?';
    countQuery += ' AND leads.city = ?';
    params.push(city);
  }

  if (make !== '') {
    carQuery += ' AND leads.make = ?';
    countQuery += ' AND leads.make = ?';
    params.push(make);
  }

  if (model !== '') {
    carQuery += ' AND leads.model = ?';
    countQuery += ' AND leads.model = ?';
    params.push(model);
  }

  if (startRange !== '' && endRange !== '') {
    carQuery += `AND leads.added_on >= ? AND leads.added_on <= ? `;
    countQuery += `AND leads.added_on >= ? AND leads.added_on <= ? `;
    params.push(startRange, endRange);
  } else if (startRange !== '') {
    carQuery += `AND leads.added_on >= ? `;
    countQuery += `AND leads.added_on >= ? `;
    params.push(startRange);
  } else if (endRange !== '') {
    carQuery += `AND leads.added_on <= ? `;
    countQuery += `AND leads.added_on <= ? `;
    params.push(endRange);
  }

  if (isSub && filterValue === 'ALL') {
    const q = `${carQuery} ORDER BY leads.id LIMIT ${rowsPerPage} OFFSET ${offset}`;
    const countq = `${countQuery}`;
    myCars.leads = await query(q, params);
    const count = await query(countq, params);
    myCars.totalCount = count[0].count;
    return myCars;
  }

  if (isSub && filterValue !== 'ALL') {
    const q = `${carQuery} ORDER BY leads.id LIMIT ${rowsPerPage} OFFSET ${offset}`;
    const countq = `${countQuery}`;
    myCars.leads = await query(q, params);
    const count = await query(countq, params);
    myCars.totalCount = count[0].count;
    return myCars;
  }

  if (!isSub && filterValue === 'ALL') {
    const q = `${carQuery} ORDER BY leads.id LIMIT 10`;
    const allLeads = await query(q, params);
    const completeLeads = allLeads.slice(0, 5);
    const partialLeads = allLeads.slice(5, 10).map((lead) => {
      return { id: lead.id, name: lead.name, city: lead.city, make: lead.make, model: lead.model };
    });

    myCars.leads = [...completeLeads, ...partialLeads];

    const count = await query(countQuery, params);
    myCars.totalCount = count[0].count;

    return myCars;
  }
};

const getMyRFQListings = async (req = {}) => {
  const { phpSession, body } = req;
  const { user_id: userId } = phpSession;

  const {
    filterValue = '',
    city = '',
    make = '',
    model = '',
    startRange = '',
    endRange = '',
    country = 'in',
    page = 1,
    rowsPerPage = 25,
  } = body;

  const offset = (page - 1) * rowsPerPage;
  const params = [userId, country];

  let filterQuery = '';

  if (filterValue === 'ALL') {
    const totalCount = await query(
      `SELECT COUNT(*) as count FROM cars_crawled
      JOIN rfq ON rfq.urlSrc LIKE CONCAT('%', cars_crawled.id, '%') AND cars_crawled.added_by = ?
      WHERE cars_crawled.country = ?`,
      [userId, country]
    );

    const queryWithPagination = `
      SELECT *
      FROM cars_crawled
      JOIN rfq ON rfq.urlSrc LIKE CONCAT('%', cars_crawled.id, '%') AND cars_crawled.added_by = ?
      WHERE cars_crawled.country = ?
      ORDER BY rfq.added_on DESC
      LIMIT ?
      OFFSET ?
    `;

    params.push(rowsPerPage, offset);

    const RFQListings = await query(queryWithPagination, params);

    return { RFQListings, totalCount: totalCount[0].count };
  }

  if (filterValue !== '') {
    filterQuery += ' AND rfq.status = ?';
    params.push(filterValue);
  } else {
    if (city !== '') {
      filterQuery += ' AND cars_crawled.city = ?';
      params.push(city);
    }

    if (make !== '') {
      filterQuery += ' AND cars_crawled.make = ?';
      params.push(make);
    }

    if (model !== '') {
      filterQuery += ' AND cars_crawled.model = ?';
      params.push(model);
    }

    if (startRange !== '' && endRange !== '') {
      filterQuery += ' AND rfq.added_on >= ? AND rfq.added_on <= ?';
      params.push(startRange, endRange);
    } else if (startRange !== '') {
      filterQuery += ' AND rfq.added_on >= ?';
      params.push(startRange);
    } else if (endRange !== '') {
      filterQuery += ' AND rfq.added_on <= ?';
      params.push(endRange);
    }
  }

  const queryWithPagination = `
      SELECT *
      FROM cars_crawled
      JOIN rfq ON rfq.urlSrc LIKE CONCAT('%', cars_crawled.id, '%') AND cars_crawled.added_by = ?
      WHERE cars_crawled.country = ?
      ${filterQuery}
      ORDER BY rfq.added_on DESC
      LIMIT ?
      OFFSET ?
    `;

  const totalCount = await query(
    `SELECT COUNT(*) as count FROM cars_crawled
    JOIN rfq ON rfq.urlSrc LIKE CONCAT('%', cars_crawled.id, '%') AND cars_crawled.added_by = ?
    WHERE cars_crawled.country = ?
    ${filterQuery}`,
    params
  );

  params.push(rowsPerPage, offset);

  const RFQListings = await query(queryWithPagination, params);

  return { RFQListings, totalCount: totalCount[0].count };
};

const updateStatus = async (req = {}) => {
  const { t, id, status } = req.body;

  const newStatus = await query(`UPDATE ${t}
        SET status='${status}'
        WHERE id = ${id}`);

  return newStatus;
};

const addLeads = async (req = {}) => {
  if (req.file) {
    const csvData = req.file.buffer.toString();
    const parsedData = Papa.parse(csvData, { header: true }).data;

    const filteredData = parsedData.filter((obj) => obj.name && obj.email && obj.make && obj.model && obj.variant);

    // Prepare SQL query
    const placeholders = filteredData.map((row) => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
    const values = filteredData.flatMap((row) => [
      row.name,
      row.mobile1,
      row.mobile2,
      row.email,
      row.price,
      row.city,
      row.make,
      row.model,
      row.variant,
      row.is_dealer,
      row.is_whatsapp,
      row.is_verified,
      row.slot_no,
      row.original_id,
      row.domain,
    ]);

    const sqlQuery = `INSERT INTO leads (name, mobile1, mobile2, email, price, city, make, model, variant, is_dealer, is_whatsapp, is_verified, slot_no, original_id, domain) VALUES ${placeholders}`;

    const newLeads = await query(sqlQuery, values);

    return newLeads;
  }
};

module.exports = {
  getMyCarListings,
  getMyLeadListings,
  getMyRFQListings,
  updateStatus,
  addLeads,
};
