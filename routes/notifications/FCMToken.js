const { pool } = require('../../model/configration');

async function updateFcmToken(id, type, fcmToken) {

    try {
        let query = '';
        let values = [];

        if (type === 'd') {
            query = `UPDATE doctors SET fcm_token = $1 WHERE doctor_id = $2;`; 
            values = [fcmToken, id];
        } else if (type === 'p') {
            query = `UPDATE patients SET fcm_token = $1 WHERE patient_id = $2;`;
            values = [fcmToken, id];
        } else {
            throw new Error('Invalid user type. Must be "d" or "p".');
        }
        await pool.query(query, values);
        console.log(`FCM token updated for ${type} with ID ${id}`);
    } catch (err) {
        console.error('Error updating FCM token:', err.message);
        throw err;
    }
}

async function getFcmTokenByUserId(id, type) {
    try {
        let query = '';
        let values = [];
    
        if (type === 'd') {
            query = ` SELECT fcm_token FROM doctors WHERE doctor_id = $1;`; 
            values = [id];
        } else if (type === 'p') {
            query = `SELECT fcm_token FROM patients WHERE patient_id = $1;`;
            values = [id];
        } else {
            throw new Error('Invalid user type. Must be "d" or "p".');
        }

        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            return result.rows[0].fcm_token;
        }

        console.log(`No FCM token found for ${type} with ID ${id}`);
        return null;
    } catch (err) {
        console.error('Error fetching FCM token:', err.message);
        throw err;
    }
}

module.exports = {
    updateFcmToken,
    getFcmTokenByUserId
};
