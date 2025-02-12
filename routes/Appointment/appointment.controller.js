const { pool }= require('../../model/configration');

const bookingAppointment = async (req, res) => {
    try {
        const patient_id = req.userID;
        const { doctor_id, slot_id, appointment_date, consultation_type, price, paymentkey, order_id } = req.body;

        if (!doctor_id || !slot_id || !appointment_date || !consultation_type || !price || !paymentkey || !order_id) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const result = await pool.query(
            'SELECT addnewbilling($1, $2, $3, $4, $5, $6, $7, $8)',
            [patient_id, doctor_id, slot_id, appointment_date, consultation_type, price, paymentkey, order_id]
        );

        if (result.rows[0].addnewbilling) {
            const query = await pool.query(
                `INSERT INTO appointments (patient_id, doctor_id, slot_id, appointment_date, consultation_type) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
                [patient_id, doctor_id, slot_id, appointment_date, consultation_type]
            );

            return res.status(201).json({
                status: 'success',
                message: `Appointment booked successfully for user ${patient_id}`,
                appointment: query.rows[0]
            });
        } else {
            return res.status(400).json({ status: 'error', message: 'Booking failed' });
        }
    } catch (error) {
        console.error('Error in bookingAppointment:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
    }
};

const cancelingAppointment = async (req,res) => {
    try {
        const {patient_id} = req.userID;
        const {doctor_id, slot_id, appointment_date, cancellation_reason} = req.body;
        const result = await pool.query('SELECT cancel_appointment($1, $2, $3, $4, $5)', [slot_id, doctor_id, patient_id, appointment_date, cancellation_reason]);

        if (result.rowCount > 0) {
            return res.status(200).json({ message: 'Appointment canceled successfully.', result});
        } else {
            return res.status(400).json({ message: 'Unable to cancel appointment. It may not exist.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const reschedulingAppointment = async (req,res) => {
    try {
        const {patient_id} = req.userID;
        const { doctor_id, old_slot_id, new_slot_id, old_date, new_date} = req.body;
        
        const result = await pool.query('SELECT reschedule_appointment($1, $2, $3, $4, $5, $6)', [old_slot_id, new_slot_id, doctor_id, patient_id, old_date, new_date]);
        if (result.rowCount > 0) {
            return res.status(200).json({ message: 'Appointment rescheduled successfully.', result }); 
        } else {
            return res.status(400).json({ message: 'reschedule Appointment Failed' }); 
        }
    } catch (error) {
        console.error(error); 
        return res.status(500).json({ error: 'Internal server error' }); 
    }
}

const fetchAppointments = async (req, res) => {
    try {
        const isDoctor = req.body.type === 'd';
        const userId = Number(req.userID);
        //const userId = req.userID;
        if (!userId) {
            return res.status(400).json({ status: 'error', error: 'Missing user ID' });
        }
        const result = await pool.query(
            `SELECT * FROM appointments WHERE ${isDoctor ? 'doctor_id' : 'patient_id'} = $1 AND paid = TRUE`,[userId]);
        return res.status(200).json({status: 'success', data: result.rows });
    } catch (err) {
        console.error('Error fetching appointments:', err);
        return res.status(500).json({status: 'error',error: 'Failed to retrieve appointments',
        });
    }
};

const fetchTodaysAppointments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM appointments WHERE appointment_date = CURRENT_DATE AND paid = TRUE`);
        return res.status(200).json({status: 'success',data: result.rows});
    } catch (err) {
        console.error('Error fetching today\'s appointments:', err);
        return res.status(500).json({status: 'error',error: 'Failed to retrieve today\'s appointments',
        });
    }
};


    
module.exports = {
    bookingAppointment,
    cancelingAppointment,
    reschedulingAppointment,
    fetchAppointments,
    fetchTodaysAppointments
}