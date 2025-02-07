const express = require('express');
const notifiRouter = express.Router();
const {
    routeForsendNotification,
    resetFcmToken,
    getUndeliveredNotificationsHandler 
} = require('./notifications.controller');
const {verifyToken} = require('../../middleWare/verifyToken')

// route to send notification 
notifiRouter.post('/send', routeForsendNotification);

// route to update fcm token 
notifiRouter.post('/update-fcm-token',verifyToken, resetFcmToken);

// route to retrieve undelivered notifications 
notifiRouter.get('/undelivered-notifications',verifyToken, getUndeliveredNotificationsHandler);

module.exports = {notifiRouter};
