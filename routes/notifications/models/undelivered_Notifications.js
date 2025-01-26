const {undeliveredNotifications} = require('./Maps')

function getUndeliveredNotificationsFromMap(id, type) {
    const key = `${id}-${type}`; 
    return undeliveredNotifications.get(key) || [];
}

function saveUndeliveredNotificationToMap(id, type, notification) {
    const key = `${id}-${type}`; 
    if (!undeliveredNotifications.has(key)) {
        undeliveredNotifications.set(key, [] );
    }
    undeliveredNotifications.get(key).push(notification);
    console.log(`Notification added to undelivered Notifications Map for user ${id} of type ${type}`);
}


module.exports = {
    saveUndeliveredNotificationToMap,
    getUndeliveredNotificationsFromMap,
};
