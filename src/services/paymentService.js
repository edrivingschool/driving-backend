const pool = require('../config/db');
const crypto = require('crypto');
const axios = require('axios');

exports.createPayment = async (enrollmentId, amount, paymentProofUrl) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO payments (enrollment_id, amount, payment_proof_url,paid_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [enrollmentId, amount, paymentProofUrl, new Date()]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};
exports.initializeChapaPayment = async ({ amount, userId, enrollmentId }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const txRef = `chapa-${enrollmentId}-${Date.now()}`;
    const userResult = await client.query(
      'SELECT first_name, last_name, email FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const { first_name, last_name, email } = userResult.rows[0];
    const chapaPayload = {
      amount: amount.toString(),
      currency: 'ETB',
      email,
      first_name,
      last_name,
      tx_ref: txRef,
      callback_url: `https://driving-backend-stmb.onrender.com/api/payments/webhook/chapa`,
      return_url: `https://edriving.netlify.app/payment-status?tx_ref=${txRef}`

    };

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      }
    );

    await client.query(
      `INSERT INTO payments (
        enrollment_id, 
        amount, 
        tx_ref, 
        status, 
        payment_method
      ) VALUES ($1, $2, $3, 'pending', 'chapa')`,
      [enrollmentId, amount, txRef]
    );

    await client.query('COMMIT');
    
    return {
      checkoutUrl: response.data.data.checkout_url,
      txRef
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Chapa initialization failed', error);
    throw new Error(`Payment initialization failed: ${error.message}`);
  } finally {
    client.release();
  }
};

exports.handleSuccessfulPayment = async (event) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get payment first to verify amount
    const paymentResult = await client.query(
      `SELECT * FROM payments WHERE tx_ref = $1 FOR UPDATE`,
      [event.tx_ref]
    );
    
    if (paymentResult.rows.length === 0) {
      throw new Error(`Payment with tx_ref ${event.tx_ref} not found`);
    }
    
    const payment = paymentResult.rows[0];
    
    // Validate amount matches
    if (Number(payment.amount) !== Number(event.amount)) {
      throw new Error(`Amount mismatch for payment ${payment.id}`);
    }

    // Update payment record
    const updateResult = await client.query(
      `UPDATE payments 
       SET status = 'success',
           verified = true,
           verified_at = NOW(),
           is_paid = true,
           paid_at = NOW()
       WHERE tx_ref = $1
       RETURNING *`,
      [event.tx_ref]
    );
    
    await client.query('COMMIT');
    return updateResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Payment verification failed', error);
    throw error;
  } finally {
    client.release();
  }
};

exports.verifyWebhookSignature = (signature, payload) => {
  const hmac = crypto.createHmac('sha256', process.env.CHAPA_ENCRYPTION_KEY);
  hmac.update(JSON.stringify(payload));
  const calculatedSignature = hmac.digest('hex');
  return signature === calculatedSignature;
};

exports.getPaymentByTxRef = async (txRef) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT ...`, [txRef]);
    return result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release(); // Ensure release happens always
  }
};




exports.getPendingPayments = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM payments WHERE verified = false`
    );
    return result.rows;
  } finally {
    client.release();
  }
};

exports.verifyPayment = async (paymentId, adminId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE payments 
       SET verified = true, 
           verified_at = NOW(), 
           is_paid = true,
           verified_by = $2
       WHERE id = $1 
       RETURNING *`,
      [paymentId, adminId] // ✅ FIXED: paymentId is $1, adminId is $2
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

  
exports.getPaymentById = async (paymentId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM payments WHERE id = $1`,
      [paymentId]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};
exports.getPaymentsByEnrollmentId = async (enrollmentId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM payments WHERE enrollment_id = $1`,
      [enrollmentId]
    );
    return result.rows;
  } finally {
    client.release();
  }
};
exports.getAllPayments = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM payments`
    );
    return result.rows;
  } finally {
    client.release();
  }
};

exports.rejectPayment = async (paymentId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM payments WHERE id = $1 RETURNING *`,
      [paymentId]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

