const express = require('express');
const { paymentRouter } = require('./routes/payment.routes');
// require('dotenv').config({path : '../../services/payment service/.env'});
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(express.json());
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}));

app.use(morgan('combined'));

app.use('/pay', paymentRouter);

module.exports = app;