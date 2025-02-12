const express = require('express');
const { makeOrder, handleCallback} = require('./payment.controller');
const {verifyToken} = require('../../middleWare/verifyToken')

const paymentRouter = express.Router();

// Callback endpoint
paymentRouter.post('/callback', handleCallback);
paymentRouter.post('/makeOrder', verifyToken, makeOrder);

module.exports = {paymentRouter};