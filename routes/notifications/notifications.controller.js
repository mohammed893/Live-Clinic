const admin = require('firebase-admin');
const { saveUndeliveredNotificationToMap,
        getUndeliveredNotificationsFromMap } = require('./models/undelivered_Notifications');
const { updateFcmToken, getFcmTokenByUserId } = require('./FCMToken');
const {sendSocketNotification} = require('./socket.controller')
const {pool} = require('../../model/configration')

async function isUserExist(id, type){
    try {
        let query = type === 'd' 
            ? `SELECT COUNT(*) AS count FROM doctors WHERE doctor_id = $1 `
            : `SELECT COUNT(*) AS count FROM patients WHERE patient_id = $1;`

        const { rows } = await pool.query(query, [id]);
        return rows[0].count > 0;
    } catch (err) {
        console.error('Error checking user existence:', err.message);
        return false;
    }
}
// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require('../../serviceAccount.json'))
});

// Send notification via FCM 
async function sendFcmNotification(id, type, notification) {
    try {
        const fcmToken = await getFcmTokenByUserId(id, type);
        if (fcmToken) {
            const message = {
                token: fcmToken,
                notification: {
                    title: notification.title,
                    body: notification.body
                },
                data: {
                    message: notification.message || '',
                    payload: JSON.stringify(notification.payload || {})
                }
            };
            await admin.messaging().send(message);
            console.log(`Notification sent via FCM to user ${id}`);
            return true;
        }
    } catch (err) {
        console.error(`FCM notification failed for user ${id}:`, err.message);
    }
    return false;
}

// Send notification 
async function sendNotification(id, type, notification) {
    const socketSent = await sendSocketNotification(id, type, notification);

    if (!socketSent) {
        const fcmSent = await sendFcmNotification(id, type, notification);

        if (!fcmSent) {
            saveUndeliveredNotificationToMap(id, type, notification);
        }
    }
}

const routeForsendNotification = async (req,res) => {
    const { id, type, notification } = req.body;

    if (!(await isUserExist(id, type))){
        return res.status(404).json({message: `User With ID ${id} and type ${type} Not Found`})
    }

    if (!notification) {
        return res.status(400).json({ message: 'Invalid Notification data' });
    }

    try {
        await sendNotification( id, type, notification);
        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (err) {
        console.error('Error sending notification:', err.message);
        res.status(500).json({ message: 'Failed to send notification' });
    }
}

// API to update FCM token
async function resetFcmToken(req, res) {
    const { fcmToken } = req.body;
    const id = req.userID;
    const type = req.userType;

    if (!(await isUserExist(id, type))){
        return res.status(404).json({message: `User With ID ${id} and type ${type} Not Found`})
    }
    if (!fcmToken){
        return res.status(400).json({message: 'Invalid fcm token'})
    }

    try {
        await updateFcmToken(id, type, fcmToken);
        res.status(200).json({ message: 'FCM token updated successfully' });
    } catch (err) {
        console.error('Error updating FCM token:', err.message);
        res.status(500).json({ message: 'Failed to update FCM token' });
    }
}

//to get undelivered notifications
async function getUndeliveredNotificationsHandler(req, res) {
    try {
        // const {id, type} = req.body; 
        const id = req.userID;
        const type = req.userType;
        if (!(await isUserExist(id, type))){
            return res.status(404),json({message: `User With ID ${id} and type ${type} Not Found`})
        }
        const notifications = getUndeliveredNotificationsFromMap(id, type);
        res.status(200).json({ notifications });
    } catch (err) {
        console.error('Error retrieving undelivered notifications:', err.message);
        res.status(500).json({ message: 'Failed to retrieve undelivered notifications' });
    }
}

module.exports = {
    routeForsendNotification,
    resetFcmToken,
    getUndeliveredNotificationsHandler,
};