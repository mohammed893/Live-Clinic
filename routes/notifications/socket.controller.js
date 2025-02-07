const { clientsByIdType, clientsBySocket } = require('././models/Maps');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let io;

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
            io.to(socketId).emit('Notification', notification);
            console.log(`Notification sent via Socket.IO to user ${id}`);
            return true;
        } catch (err) {
            console.error(`Socket.IO notification failed for user ${id}:`, err.message);
        }
    }
    return false;
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
    sendSocketNotification
}