const mysql = require('mysql'); // or use import if you use TS
const util = require('util');
const connection = mysql.createConnection({
  connectionLimit : 100, //important
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

const query = util.promisify(connection.query).bind(connection);

module.exports = query;
