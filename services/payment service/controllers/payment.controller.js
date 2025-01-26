const crypto = require('crypto');
const axios = require('axios');
const { pool } = require('../../../shared/configrations');
// const { PAYMOB_INTERGRATION_ID,
//         PAYMOB_HMAC_KEY,
//         PAYMOB_INTENTION_URL,
//         PAYMOB_TOKEN,
//         PAYMOB_PUBLIC_KEY} = process.env; 
//const PAYMOB_INTENTION_URL= 'https://accept.paymob.com/v1/intention/';
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;
const PAYMOB_INTENTION_URL = process.env.PAYMOB_INTENTION_URL;
const PAYMOB_TOKEN = process.env.PAYMOB_TOKEN;
const PAYMOB_INTERGRATION_ID = parseInt(process.env.PAYMOB_INTERGRATION_ID);
const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;
const { fetchData, callUpdateBilling } = require('../models/database_Operation')

const computedHMAC = (data, secret) => {
    return crypto.createHmac('sha512', secret).update(data).digest('hex');
};

// API 
const orderToPaymob = async (data) => {
    const payload = {
        amount: data.amount,
        currency: 'EGP',
        payment_methods: [PAYMOB_INTERGRATION_ID],
        billing_data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber,
            email: data.email,
        },
        expiration: 3600,
    };
    try {
        const {data: response} = await axios.post(PAYMOB_INTENTION_URL, payload, {
            headers: {
                Authorization : (`token ${PAYMOB_TOKEN}`),
                'Content-Type' : 'application/json'
            }
        })
        return response;
    }catch (err) {
        // console.log(process.env);
        console.log(PAYMOB_TOKEN)
        console.log(PAYMOB_INTENTION_URL);
        console.error('Error sending data to Paymob:', err.message);
        throw err;
    }
}

// handle CallBack function
const handleCallback = async(req, res) => {
    try {
        const {body : callbackData, query: {hmac : receivedHmac}} = req;
        const dataToHash = [
            callbackData.obj.amount_cents,
            callbackData.obj.created_at,
            callbackData.obj.currency,
            callbackData.obj.error_occured,
            callbackData.obj.has_parent_transaction,
            callbackData.obj.id,
            callbackData.obj.integration_id,
            callbackData.obj.is_3d_secure,
            callbackData.obj.is_auth,
            callbackData.obj.is_capture,
            callbackData.obj.is_refunded,
            callbackData.obj.is_standalone_payment,
            callbackData.obj.is_voided,
            callbackData.obj.order.id,
            callbackData.obj.owner,
            callbackData.obj.pending,
            callbackData.obj.source_data.pan,
            callbackData.obj.source_data.sub_type,
            callbackData.obj.source_data.type,
            callbackData.obj.success,
        ].join('');

        const computeHMAC = computedHMAC(dataToHash, PAYMOB_HMAC_KEY)
        if(computeHMAC !== receivedHmac){
            return res.status(403).json({message : 'Invalid HMAC signature', error: err.message});
        }
        if (callbackData.obj.success == true)
            newStatus = 'paid';
        else 
            newStatus = 'failed';

        await callUpdateBilling(callbackData.obj.order.id, newStatus);
    
        return res.status(200).json({ message: 'Callback processed successfully' });
    }
    catch(err) {
        return res.status(500).json({error : 'Error processing Paymob callback'});
    }
}

// make order function
const makeOrder = async(req, res) => {
    try {
        // const userId = req.userID;
        const { userId, slot_id, appointment_date, consultation_type, amount} = req.body;
        const {fullName, phoneNumber, email, doctorId } = await fetchData(slot_id, userId);

        const dataOfPayment = { 
            amount,
            firstName: fullName.split(' ')[0],
            lastName : fullName.split(' ')[1] || '',
            email,
            phoneNumber
        };

        const paymobResponse = await orderToPaymob(dataOfPayment);

        if (!paymobResponse.payment_keys) {
            return res.status(400).json({message : 'Failed to process payment order with Paymob'}) 
        }
        const orderId = paymobResponse.payment_keys[0].order_id;
        const clientSecret = paymobResponse.client_secret;

        const addBilling = await pool.query(`SELECT addnewbilling($1, $2, $3, $4, $5, $6, $7, $8)`, 
            [userId, doctorId, slot_id, appointment_date, consultation_type, amount, clientSecret, orderId,])

        if(!addBilling.rows[0].addnewbilling){
            return res.status(400).json({
                message : 'Failed to add billing: Slot is already reserved or overlapping appointments exist',})
        }
        return res.status(200).json({
            message : 'Payment order created successfully',
            data : {
                orderId,
                clientSecret,
                paymentStatus: 'Pending',
                paymentURL: `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`,

            }
        })
    } catch(err){
        return res.status(500).json({error : 'Error creating payment order', error: err.message});
    }
}

module.exports = {
    makeOrder,
    handleCallback
} 