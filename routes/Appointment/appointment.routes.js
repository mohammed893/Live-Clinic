const express = require('express');
const AppointmentRouter = express.Router();
const {verifyToken} = require('../../middleWare/verifyToken');
const appointmentController = require('./appointment.controller');

AppointmentRouter.post('/',verifyToken, appointmentController.bookingAppointment);
AppointmentRouter.delete('/', verifyToken, appointmentController.cancelingAppointment);
AppointmentRouter.put('/', verifyToken, appointmentController.reschedulingAppointment);
AppointmentRouter.get('/',verifyToken ,  appointmentController.fetchAppointments);
AppointmentRouter.get('/today',verifyToken, appointmentController.fetchTodaysAppointments); // This shouldn't be in the router but use the internal function in cronjobs

module.exports = {
    AppointmentRouter
};