-- Table 1: appointments

-- read

--all the appointments
SELECT * FROM appointments;

--all the appointments for a doctor
SELECT * FROM appointments WHERE doctor_id = $1;

--all the appointments for a patient
SELECT * FROM appointments WHERE patient_id = $1;

--today's appointments
SELECT * FROM appointments WHERE appointment_date = CURRENT_DATE;

-- create 

--add a new appointment
SELECT addnewbilling($1, $2, $3, $4, $5, $6, $7, $8);
--it takes patient id, doctor id, slot id, appointment date, consultation type('video call', 'phone call'), price(e.g. 200.99), payment key varchar, order id varchar
--it returns true if the new billing is added and the appointment is booked flase otherwise

-- update

--reschedule an appointment
SELECT reschedule_appointment($1, $2, $3, $4, $5, $6);
--it takes old slot id, new slot id, doctor id, patient id, old date, new date
--it returns a true if it succeded, false otherwise

-- delete

--cancel an appointment
SELECT cancel_appointment($1, $2, $3, $4, $5);
--it takes slot id, doctor id, patient id, appointment date, cancellation reason text
--it returns varchar, the order id of the cancelled appointment if its paid, it returns '' otherwise


-- Table 2: time_slots

-- read

--a specific time slot
SELECT * FROM time_slots WHERE slot_id = $1;

--all the slots for a doctor
SELECT * FROM time_slots WHERE doctor_id = $1;

--all the available slots for a doctor
SELECT * FROM time_slots WHERE doctor_id = $1 AND is_available = TRUE;

--selecting a slot based on time
SELECT * FROM time_slots WHERE slot_start_time = $1;

-- create/update

--Generating slots for a doctor
SELECT generateslots($1, $2, $3, $4, $5, $6);
--it takes doctor_id, working_days as JSONB, slot_duration as interval, start time as TIME WITHOUT TIME ZONE, end time as TIME WITHOUT TIME ZONE, force AS boolean
--if the doctor exists and doesnt have slots, it returns an empty table
--if the doctor exists and have slots and force is true, it returns a table of paid appointments
--if the doctor exists and hvae slots and force is false, it returns all the future appointmetns for the doctor
--if the doctor doesnt exists, it returns an empty table

--setting a slot availability
UPDATE time_slots SET is_available = $1 WHERE slot_id = $2;
--note: is_available is boolean

-- Table 3: billings

-- read

--selecting a specific billing
SELECT * FROM billings WHERE patient_id = $1 AND doctor_id = $2 AND appointment_date = $3;

--selecting a billing based on paymentKey
SELECT * FROM billings WHERE paymentKey = $1;

-- update

--paying a billing
SELECT updatebilling($1, $2, $3, $4);
--it takes, paymentkey as varchar, order id as varchar, status as varchar ('paid', 'failed'), payment method('credit card', 'cash', 'fawry') and it's default value is 'online payment'
--it returns an array if there are paid appointment deleted, or an empty array if none is deleted or there was an error

-- delete

-- deleting a billing
DELETE FROM billings WHERE patient_id = $1 AND doctor_id = $2 AND appointment_date = $3;

-- Table 4: doctors

-- read

--fetching a doctor with id
SELECT * FROM doctors WHERE doctor_id = $1;

--fetching a doctor with email
SELECT * FROM doctors
WHERE email = $1;

--authenticating a doctor
SELECT doctor_id FROM doctors 
WHERE email = $1 
AND password = crypt($2, password);

-- create

--adding a doctor
INSERT INTO doctors (full_name, email, PASSWORD, date_of_birth, gender, phone_number, age, hospital, national_id, verification_image_url, available_days, working_hours, slot_duration, timezone, specialization, experience)
VALUES ($1, $2 ,crypt($3, gen_salt('bf')), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
-- Nullable columns(age, birth_of_date, experience, hospital, gender, verification_image_url, available_days, working_hours, slot_duration, time_zone, specializaiton)
-- jsonb columns(available days e.g. '{"start":"7:00", "end":"15:00"}', working hours e.g. '["Tuesday", "Saturday"]')
-- timezone column(e.g. Africa/Cairo)

-- update

--updating doctor's email
UPDATE doctors
SET email = $1
WHERE doctor_id = $2;

--updating doctor's password
UPDATE doctors
SET PASSWORD = crypt($1, gen_salt('bf'))
WHERE doctor_id = $2;

--updating doctor's phone number
UPDATE doctors
SET phone_number = $1
WHERE doctor_id = $2;

--updating doctor's hospital
UPDATE doctors
SET hospital = $1
WHERE doctor_id = $2;

--updating doctor's experience
UPDATE doctors
SET experience = $1
WHERE doctor_id = $2;

--updating doctor's available_days
UPDATE doctors
SET available_days = $1
WHERE doctor_id = $2;

--updating doctor's slot_duration 
UPDATE doctors
SET slot_duration = $1
WHERE doctor_id = $2;

--updating doctor's timezone
UPDATE doctors
SET timezone = $1
WHERE doctor_id = $2;

--updating doctor's working_hours
UPDATE doctors
SET working_hours = $1
WHERE doctor_id = $2;

-- delete
DELETE FROM doctors WHERE doctor_id = $1;

-- Table 5: patients

-- read

--fetching a patient with id
SELECT * FROM patients
WHERE patient_id = $1; 

--fetching a patient with email
SELECT * FROM patients
WHERE email = $1;

-- authenticating a patient
SELECT patient_id FROM patients 
WHERE email = $1 
AND PASSWORD = crypt($2, PASSWORD);

-- create

-- adding a patient
INSERT INTO patients (full_name, email, PASSWORD, date_of_birth, gender, phone_number, follow_up, insurance_id)
VALUES ($1, $2 ,crypt($3, gen_salt('bf')), $4, $5, $6, $7, $8);
-- Nullabl columns(data_of_birth, follow_up, primary_doctor_id, phone_number, insurance_id)
-- Boolean columns(follow_up)

-- update

-- updating patient's email
UPDATE patients
SET email = $1
WHERE patient_id = $2;

-- updating patient's password
UPDATE patients
SET PASSWORD = crypt($1, gen_salt('bf'))
WHERE patient_id = $2;

-- updating patient's phone_number
UPDATE patients
SET phone_number = $1
WHERE patient_id = $2;

-- updating patient's primary doctor id
UPDATE patients
SET primary_doctor_id = $1
WHERE patient_id = $2;

-- delete

--Deleting a patient
DELETE FROM patients
WHERE patient_id = $1;

--Table 6: consultation_records

-- read

--fetching a consultation with id
SELECT * FROM consultation_records WHERE consultation_id = $1;

--fetching a consultation with doctor_id, patient_id and appointment_date
SELECT * FROM consultation_records WHERE doctor_id = $1 AND patient_id = $2 AND appointment_date = $3;

-- create

--creating a consultation record
INSERT INTO  consultation_records(doctor_id, patient_id, consultation_note, prescription, follow_up_date, appointment_date)
VALUES($1, $2, $3, $4, $5, $6);
--text columns(consultation_note, prescription)
--time stamp without timezone(follow_up_date)
--date(appointment_date)

-- update 

--updating the follow_up_date
UPDATE consultation_records SET follow_up_date = $1, updated_at = NOW() WHERE consultation_id = $2;

--updating the prescription
UPDATE consultation_records SET prescription = $1, updated_at = NOW() WHERE consultation_id = $2;

--updating the consultation_note
UPDATE consultation_records SET consultation_note = $1, updated_at = NOW() WHERE consultation_id = $2;

-- delete

--deleting a conultation record
DELETE FROM consultation_records WHERE consultation_id = $1;

-- Table 7: booking history

-- read

--fetching a booking history with id
SELECT * FROM booking_history WHERE history_id = $1;

--fetching a booking history with action type(booking, cancellation, rescheduling)
SELECT * FROM booking_history WHERE action_type = $1; 

--fetching a booking history with date
SELECT * FROM booking_history WHERE appointment_date = $1;

--fetching a booking history with doctor_id
SELECT * FROM booking_history WHERE doctor_id = $1;

--fetching a booking history with patient_id
SELECT * FROM booking_history WHERE patient_id = $1;

--fetching a booking history with action date
SELECT * FROM booking_history WHERE action_date = $1;


