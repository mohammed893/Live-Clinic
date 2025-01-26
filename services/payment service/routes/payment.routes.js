const express = require('express');
const { makeOrder, handleCallback} = require('../controllers/payment.controller');

const paymentRouter = express.Router();

// Callback endpoint
paymentRouter.post('/callback', handleCallback);
paymentRouter.post('/makeOrder' , makeOrder);

module.exports = {paymentRouter};