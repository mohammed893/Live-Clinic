const { pool } = require('../../model/configration');

const callUpdateBilling = async (orderId, newStatus, paymentMethod = 'online payment') => {
    try {
        const {rows} =await pool.query(`SELECT * FROM updatebilling($1::VARCHAR, $2::VARCHAR, $3::VARCHAR);`,
            [String(orderId), newStatus, paymentMethod]);

        console.log('Updated Billing:', rows[0].updatebilling);
        return rows[0].updatebilling;
    }catch(error) {
        console.error('Error updating billing:', err.message);
        throw err;
    }
}

const fetchData = async(slot_id, patient_id) => {
    try {
        const patientDate = await pool.query(`SELECT full_name, email, phone_number FROM patients WHERE patient_id = $1`, [patient_id])
        const slotData = await pool.query(`SELECT doctor_id FROM time_slots WHERE time_slot_id = $1`, [slot_id])

        if (patientDate.rows.length == 0)
            throw new Error('patient not exists')
        if (slotData.rows.length == 0)
            throw new Error('Slot not exists')
        const { full_name, email, phone_number} = patientDate.rows[0];
        const { doctor_id } = slotData.rows[0];

        return { full_name, email, phone_number, doctor_id };
    }catch(err){
        console.error('Error fetching data:', err.message);
        throw err;
    }
}

module.exports = {
    callUpdateBilling,
    fetchData
}