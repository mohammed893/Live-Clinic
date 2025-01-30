const { Pool } = require('pg');
let database = 'liveclinicdb';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: database,
  password: 'root',
  port: 5432,
});

module.exports = {pool , database};