const httpStatus = require('http-status');
const query = require('../utils/mysql');

const getBrands = async (body) => {
  const { country = '' } = body;

  let sql = 'SELECT name from brands WHERE is_deleted= 0 ';
  const params = [];

  if (country !== '') {
    sql += 'AND country = ?';
    params.push(country);
  }

  const brands = await query(sql, params);
  return brands;
};

const getModels = async (body) => {
  const { brandName = '' } = body;
  if (brandName === '') {
    return [];
  }
  const sql = 'SELECT name FROM models WHERE make = ? AND is_deleted = 0';
  const params = [brandName];
  const models = await query(sql, params);
  return models;
};

const getCities = async (queryString) => {
  const { q = '' } = queryString;
  const country = 'in';
  const limit = 7;

  let sql;
  let params = [];

  if (!q) {
    sql = 'SELECT name FROM cities WHERE is_deleted = ? ORDER BY id LIMIT ?;';
    params = [0, limit];
  } else {
    sql = 'SELECT name FROM cities WHERE country = ? AND name LIKE ? ORDER BY id LIMIT ?;';
    params = [country, `%${q}%`, limit];
  }

  const cities = await query(sql, params);

  return cities;
};

module.exports = {
  getBrands,
  getModels,
  getCities,
};
