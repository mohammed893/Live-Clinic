const {pool} = require('../../model/configration');

// Get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const allDoctors = await pool.query('SELECT * FROM doctors');
        return res.status(200).json(allDoctors.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve doctors' });
    }
};

// Get a doctor
const getDoctor = async (req, res) => {
    const doctor_id = req.userID; // get id from token 
    console.log(doctor_id)
    try {
        const doctor = await pool.query('SELECT * FROM doctors WHERE doctor_id = $1', [doctor_id]);
        if (doctor.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        return res.status(200).json(doctor.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve doctor' });
    }
};

//Delete a doctor 
const deleteDoctor = async (req, res) => {
    const doctor_id = req.userID;
    try {
        const doctorDeleted = await pool.query('DELETE FROM doctors WHERE doctor_id = $1 RETURNING *', [doctor_id]);
        if (doctorDeleted.rowCount === 0) { 
            return res.status(404).json({ error: 'Doctor not found' });
        }
        return res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (err) { 
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete doctor' });
    }
};

// Update a doctor
const updateDoctor = async (req, res) => {
    const doctor_id = req.userID;
    if (!doctor_id) {
        return res.status(400).json({ error: 'Invalid doctor ID' });
    }
    const updates = req.body;

    const allowedFields = ['full_name', 'email','PhoneNumber','specialization'];
    const setClause = [];
    const values = [];

    // Filter updates to include only allowed fields
    for (const key in updates) {
        if (allowedFields.includes(key)) {
            setClause.push(`${key} = $${values.length + 1}`);
            values.push(updates[key]);
        }
    }

    if (setClause.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    // Add doctor ID to values array
    values.push(doctor_id);

    try {
        const result = await pool.query(
            `UPDATE doctors SET ${setClause.join(', ')} WHERE doctor_id = $${values.length} RETURNING *`,
            values
        );

        // Check if the doctor was found
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Return the updated doctor data
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update doctor' });
    }
};

// // Doctor Slots Modification
const generateSlots = async (req,res) => {
    const doctor_id = req.userID;
    const {working_days, slot_duration, start_time, end_time , force} = req.body;

    try {
        // Check if the doctor was found
        const doctor = await pool.query('SELECT * FROM doctors WHERE doctor_id = $1', [doctor_id]);
        // console.log(doctor)
        if (doctor.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (force == true){
            const result = await pool.query(`SELECT generateslots($1, $2, $3, $4, $5, $6)`,
                [doctor_id, working_days, slot_duration, start_time, end_time, force]);
            const insert = await pool.query(`SELECT * FROM time_slots WHERE doctor_id = $1;`,[doctor_id]);
            if (insert.rows.length === 0) {
                return res.status(200).json({ message: "No slots available or generated." });
            }
            return res.status(200).json({ slots: insert.rows });
        } else {
            return res.status(400).json({message:"Force flag is required to generate slots"})
        }
    } catch (error){
        console.log(error);
        return res.status(500).json({ error: "An error occurred while modifying slots." });
    }
}


const getDoctorsList = async (req, res) => {
    const city = req.body.city;
    try {
        const doctors = await pool.query('SELECT full_name , city , experience, rating , hospital FROM doctors WHERE city = $1', [city]);
        if (doctors.rows.length === 0) {
            return res.status(200).json({data : doctors.rows , message : "NotFound"});        }
        return res.status(200).json({data : doctors.rows , message : "Found"});  // Returning the list of doctors
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get doctors' });
    }
}

module.exports = {
    getAllDoctors,
    getDoctor,
    deleteDoctor,
    updateDoctor,
    generateSlots,
    getDoctorsList
} 
