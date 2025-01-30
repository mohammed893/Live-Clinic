const clientsByIdType = new Map();
const clientsBySocket = new Map(); 
const undeliveredNotifications = new Map();

module.exports = {
    clientsByIdType,
    clientsBySocket,
    undeliveredNotifications
}