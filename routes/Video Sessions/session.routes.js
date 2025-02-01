const express = require('express');
const sessionsRouter = express.Router();
const {generateAgoraTokenRoute} = require('./session.controller');
const {verifyToken} = require('../../middleWare/verifyToken');

sessionsRouter.post('/', verifyToken, generateAgoraTokenRoute);

module.exports = {sessionsRouter};