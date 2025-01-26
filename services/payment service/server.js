const http = require('http');
const app = require('./app');
const PORT = 3002 ;
const server = http.createServer(app);
const { pool , database} = require('../../shared/configrations');

async function startServer() {
  await pool.connect().then(
    () => { console.log(`successfully Connected to ${database} database !`); }
    ).catch((err) => {
    console.error('Error connecting to PostgreSQL:', err.stack);
    process.exit(1);
  });
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on Port ${PORT} !`);
  });
}

startServer();