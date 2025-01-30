const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {authRouter} = require('./routes/auth/auth.routes')
const { notifiRouter } = require('./routes/notifications/notification.routes');
const { paymentRouter } = require('./routes/payment/payment.routes');
const app = express();

app.use(express.json());
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(morgan('combined'));

app.use('/auth', authRouter);
app.use('/noti', notifiRouter);
app.use('/pay', paymentRouter);

module.exports = app;