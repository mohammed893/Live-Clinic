const { Pool } = require('pg');
let database = 'liveclinicdb';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: database,
  password: '17276911',
  port: 3000,
});

module.exports = {pool , database};