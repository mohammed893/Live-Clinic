const express = require('express');
const notifiRouter = express.Router();
const {
    sendNotification,
    resetFcmToken,
    getUndeliveredNotificationsHandler 
} = require('./notifications.controller');

// route to send notification 
notifiRouter.post('/send', async (req, res) => {
    const { id, type, notification } = req.body;

    if (!id || !type || !notification) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        await sendNotification( id, type, notification);
        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (err) {
        console.error('Error sending notification:', err.message);
        res.status(500).json({ message: 'Failed to send notification' });
    }
});

// route to update fcm token 
notifiRouter.post('/update-fcm-token', async (req, res) => {
    const { id, type, fcmToken } = req.body;
    
    if (!id || !type || !fcmToken) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        await resetFcmToken(req, res);
    } catch (err) {
        console.error('Error updating FCM token:', err.message);
        res.status(500).json({ message: 'Failed to update FCM token' });
    }
});

// route to retrieve undelivered notifications 
notifiRouter.get('/undelivered-notifications', async (req, res) => {
    try {
        await getUndeliveredNotificationsHandler(req, res);
    } catch (err) {
        console.error('Error retrieving undelivered notifications:', err.message);
        res.status(500).json({ message: 'Failed to retrieve undelivered notifications' });
    }
});

module.exports = {notifiRouter};
