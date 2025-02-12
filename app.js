const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { authRouter } = require('./routes/auth/auth.routes')
const { notifiRouter } = require('./routes/notifications/notification.routes');
const { paymentRouter } = require('./routes/payment/payment.routes');
const { sessionsRouter } = require('./routes/Video Sessions/session.routes');
const { generateDailyChannels } = require('./routes/Video Sessions/session.cronjobs');
const {doctorRouter} = require('./routes/Doctor/doctor.routes')
const {AppointmentRouter} = require('./routes/Appointment/appointment.routes')
const {patientRouter} = require('./routes/patient/patient.routes')
const app = express();

app.use(express.json());
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(morgan('combined'));

app.use('/auth', authRouter);
app.use('/noti', notifiRouter);
app.use('/pay', paymentRouter);
app.use('/session', sessionsRouter);
app.use('/doctors', doctorRouter );
app.use('/appointments', AppointmentRouter )
app.use('/patients', patientRouter)


generateDailyChannels(); 

module.exports = app;