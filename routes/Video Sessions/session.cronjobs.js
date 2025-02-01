const cron = require('node-cron');
const { generateAgoraToken } = require('./session.controller');
const { pool } = require('../../model/configration');

const generateDailyChannels = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date().toISOString().split('T')[0]; 
        console.log(today);
        const result = await pool.query(
            `SELECT doctor_id, patient_id, appointment_date FROM appointments WHERE appointment_date = $1 AND "channelName" IS NULL AND token IS NULL AND paid = true;`,
            [today]
        );

        if (result.rows.length === 0) {
            console.log('CronJobs : No appointments found for today.');
            return;
        }

        for (const appointment of result.rows) {
            const { doctor_id, patient_id, appointment_date } = appointment;

            try {
                const { channelName, token } = await generateAgoraToken(String(doctor_id), String(patient_id), appointment_date);
                console.log(`Channel created for appointment: Doctor ID: ${doctor_id}, Patient ID: ${patient_id}, Date: ${appointment_date}`);
                console.log(`Channel Name: ${channelName}, Token: ${token}`);
            } catch (error) {
                console.error(`Failed to generate token for Doctor ID: ${doctor_id}, Patient ID: ${patient_id}`, error);
            }
        }

        console.log('Daily channel generation completed.');
    } catch (error) {
        console.error('Error in daily channel generation:', error);
    }
}, {
    scheduled: true,
    });
};

module.exports = { generateDailyChannels };