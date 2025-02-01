const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../model/configration');
// const {verifyToken} = require('../../middleware/verifyToken')

jest.mock('../../model/configration', () => ({
    pool: {
        query: jest.fn(),
    },
}));

jest.mock('../../middleWare/verifyToken.js', () => ({
    verifyToken: jest.fn((req, res, next) => {
        req.userID = 1; 
        next();
    }),
}));

describe('Appointments Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    

    describe('POST /appointments', () => {
        test('should book an appointment successfully', async () => {
            pool.query.mockResolvedValue({ rowCount: 1 });

            const response = await request(app)
                .post('/appointments')
                .send({
                    doctor_id: 1,
                    slot_id: 2,
                    appointment_date: '2024-12-15',
                    consultation_type: 'online',
                    price: 100,
                    paymentkey: 'test-key',
                    order_id: 'order123',
                })
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'success',
                    message: 'Appointment booked successfully',
                })
            );
        });

        test('should handle booking failure', async () => {
            pool.query.mockResolvedValue({ rowCount: 0 });

            const response = await request(app)
                .post('/appointments')
                .send({
                    doctor_id: 1,
                    slot_id: 2,
                    appointment_date: '2024-12-15',
                    consultation_type: 'online',
                    price: 100,
                    paymentkey: 'test-key',
                    order_id: 'order123',
                })
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /appointments', () => {
        test('should cancel an appointment successfully', async () => {
            pool.query.mockResolvedValue({ rowCount: 1 });
            const response = await request(app)
                .delete('/appointments')
                .send({
                    doctor_id: 1,
                    slot_id: 2,
                    appointment_date: '2024-12-15',
                    cancellation_reason: 'Change of plans',
                })
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(200);
        });

        test('should handle cancellation failure', async () => {
            pool.query.mockResolvedValue({ rowCount: 0 });

            const response = await request(app)
                .delete('/appointments')
                .send({
                    doctor_id: 1,
                    slot_id: 2,
                    appointment_date: '2024-12-15',
                    cancellation_reason: 'Change of plans',
                })
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /appointments', () => {
        test('should reschedule an appointment successfully', async () => {
            pool.query.mockResolvedValue({ rowCount: 1 });

            const response = await request(app)
                .put('/appointments')
                .send({
                    doctor_id: 1,
                    old_slot_id: 2,
                    new_slot_id: 3,
                    old_date: '2024-12-15',
                    new_date: '2024-12-16',
                })
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(200);
        });

        test('should handle rescheduling failure', async () => {
            pool.query.mockResolvedValue({ rowCount: 0 });

            const response = await request(app)
                .put('/appointments')
                .send({
                    doctor_id: 1,
                    old_slot_id: 2,
                    new_slot_id: 3,
                    old_date: '2024-12-15',
                    new_date: '2024-12-16',
                })
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(400);
        });
    });

    describe('GET /appointments', () => {
        test('should fetch appointments for a patient', async () => {
            pool.query.mockResolvedValue({ rows: [{ doctor_id: 2, paid: true }] });

            const response = await request(app)
                .get('/appointments')
                .send({ patient_id: 1, type: 'p' });

            expect(response.status).toBe(200);
        });
    });

    describe('GET /appointments/today', () => {
        test('should fetch today\'s appointments', async () => {
            pool.query.mockResolvedValue({ rows: [{ patient_id: 2, appointment_date: '2024-12-15', paid: true }] });

            const response = await request(app)
                .get('/appointments/today');

            expect(response.status).toBe(200);
        });

        test('should handle no appointments for today', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/appointments/today');

            expect(response.status).toBe(200);
        });
    });
});
