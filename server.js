const http = require('http');
const app = require('./app');
const PORT = 5000 ;
const server = http.createServer(app);
// const socketIo = require('socket.io');
const { pool , database}= require('./model/configration');
const { initializeSocket } = require('./routes/notifications/notifications.controller');

async function startServer() {
    //connecting to SQL database 
  await pool.connect().then(
    () => { console.log(`successfully Connected to ${database} database !`); }
    ).catch((err) => {
    console.error('Error connecting to PostgreSQL:', err.stack);
    process.exit(1);
  });
  // initializing the sockets 
  await initializeSocket(server);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on Port ${PORT} !`);
  });
}

startServer();