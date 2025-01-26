const { clientsByIdType, clientsBySocket } = require('../../routes/notifications/models/Maps');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { saveUndeliveredNotificationToMap,
    getUndeliveredNotificationsFromMap } = require('../../routes/notifications/models/undelivered_Notifications');
const { updateFcmToken, getFcmTokenByUserId } = require('../../routes/notifications/models/FCMToken');
require('dotenv').config();

let io;

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require('../../serviceAccounts.json'))
});

// Validate token
function validateToken(token) {
    try {
        const secretKey = process.env.ACCESS_TOKEN_SECRET;
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (err) {
        console.error('Token validation failed:', err.message);
        return null; 
    }
}

// Handle a new connection
function handleSocketConnection(socket) {
    console.log('A user connected with socket ID:', socket.id);

    socket.on('user_id', (data) => {
        const { id, type, token } = data;

        if (!id || !type || !token) {
            console.error('Invalid data received:', data);
            socket.emit('logout', { message: 'Invalid data received' });
            socket.disconnect();
            return;
        }

        // Validate the token
        const decodedToken = validateToken(token);

        if (decodedToken) {
            console.log('Token validated successfully for user:', id);

            const key = `${id}-${type}`;
            clientsByIdType.set(key, socket.id);
            clientsBySocket.set(socket.id, { id, type });

            console.log(`User ${id} of type ${type} connected and authenticated`);
        } else {
            console.log('Token validation failed for user:', id);
            socket.emit('logout', { message: 'Authentication failed. Please log in again.' });
            socket.disconnect();
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        const clientData = clientsBySocket.get(socket.id);
        if (clientData) {
            const key = `${clientData.id}-${clientData.type}`;
            clientsByIdType.delete(key);
            clientsBySocket.delete(socket.id);
        }
    });
}

// Send notification via Socket.io
async function sendSocketNotification(id, type, notification) {
    const key = `${id}-${type}`;
    const socketId = clientsByIdType.get(key);

    if (socketId && clientsBySocket.has(socketId)) {
        try {
            io.to(socketId).emit('notification', notification);
            console.log(`Notification sent via Socket.IO to user ${id}`);
            return true;
        } catch (err) {
            console.error(`Socket.IO notification failed for user ${id}:`, err.message);
        }
    }
    return false;
}

// Send notification via FCM
async function sendFcmNotification(id, type, notification) {
    try {
        const key = `${id}-${type}`; 
        const fcmToken = await getFcmTokenByUserId(key);
        if (fcmToken) {
            const message = {
                token: fcmToken,
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: notification.data || {},
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

// API to update FCM token
async function resetFcmToken(req, res) {
    const { id, type, fcmToken } = req.body;
    // const id = req.userID;

    if (!id || !type || !fcmToken) {
        return res.status(400).json({ message: 'Invalid input data' });
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
        const {id, type} = req.body; 
        const key = `${id}-${type}`;
        const notifications = getUndeliveredNotificationsFromMap(key);
        res.status(200).json({ notifications });
    } catch (err) {
        console.error('Error retrieving undelivered notifications:', err.message);
        res.status(500).json({ message: 'Failed to retrieve undelivered notifications' });
    }
}

// Initialize Socket.io
function initializeSocket(server) {
    io = require('socket.io')(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    console.log('Socket initialized');
    io.on('connection', (socket) => {
        handleSocketConnection(socket);
    });
}

module.exports = {
    initializeSocket,
    sendNotification,
    resetFcmToken,
    getUndeliveredNotificationsHandler,
};