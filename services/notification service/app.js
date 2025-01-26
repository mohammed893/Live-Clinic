const express = require('express');
const { notifiRouter } = require('./routes/Notification.routes');
require('dotenv').config({path : "../../api-gateway/.env"});
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

app.use('/noti', notifiRouter);

module.exports = app;