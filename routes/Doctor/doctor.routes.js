const express = require('express');
const doctorRouter = express.Router();
const doctorsController = require('./doctor.controller');
const {verifyToken} = require('../../middleWare/verifyToken');

doctorRouter.get('/', verifyToken, doctorsController.getAllDoctors);
doctorRouter.get('/doctor_id', verifyToken, doctorsController.getDoctor);
doctorRouter.delete('/', verifyToken, doctorsController.deleteDoctor);
doctorRouter.put('/', verifyToken, doctorsController.updateDoctor);
doctorRouter.post('/', verifyToken , doctorsController.generateSlots);
doctorRouter.get('/list' , verifyToken , doctorsController.getDoctorsList);

module.exports = {doctorRouter}; 