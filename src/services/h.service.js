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

module.exports = {
  getBrands,
  getModels,
};
