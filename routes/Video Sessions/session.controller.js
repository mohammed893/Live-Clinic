const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const crypto = require('crypto');
const { pool } = require('../../model/configration');
require('dotenv').config();
const appID = process.env.appID;
const appCertificate = process.env.appCertificate;

if (!appID || !appCertificate) {
  throw new Error('Agora credentials are missing in .env file');
}

// main function 
const generateAgoraToken = async (doctor_id, patient_id, appointment_date) => {
  try {
    await pool.query(
      `SELECT * FROM appointments WHERE doctor_id = $1 AND patient_id = $2 AND appointment_date = $3 AND paid = TRUE`,
      [doctor_id, patient_id, appointment_date]
    );

    const channelName = `appointment_${crypto.randomUUID()}`;
    // const uid = 0; 
    const uid = patient_id;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 86400; 
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expirationTimeInSeconds;
    const token = RtcTokenBuilder.buildTokenWithUid( appID, appCertificate, channelName, uid, role, privilegeExpireTime );

    await pool.query(
      `UPDATE appointments SET "channelName" = $1, token = $2 WHERE doctor_id = $3 AND patient_id = $4 AND appointment_date = $5 AND paid = TRUE RETURNING *;`, 
      [channelName, token, doctor_id, patient_id, appointment_date]
    );
    // if (query.rowCount === 0) {
    //   throw new Error('Appointment not found or not paid');
    // }
    return channelName, token;

  } catch (error) {
    console.error('Error while generating Agora token:', error);
  }
};

// for test 
const generateAgoraTokenRoute = async (req, res) => {
  try {
    const { doctor_id, appointment_date } = req.body;
    const patient_id = req.userID; 

    console.log('Incoming request:', { doctor_id, patient_id, appointment_date });

    if (!doctor_id || !appointment_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await generateAgoraToken(doctor_id, patient_id, appointment_date);
    
    if (!result) {
      return res.status(404).json({ error: "No valid appointment found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in generateAgoraTokenRoute:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  generateAgoraToken,
  generateAgoraTokenRoute
};
