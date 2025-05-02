const pool = require('../config/db');

exports.createPayment = async (enrollmentId, amount, proofUrl) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO payments (enrollment_id, amount, payment_proof_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [enrollmentId, amount, proofUrl]
    );
    return result.rows[0];
  } finally {
    client.release();
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
             verified_by = $1
         WHERE id = $2 
         RETURNING *`,
        [adminId, paymentId]
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