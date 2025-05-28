const paymentService = require('../services/paymentService');
const uploadToS3 = require('../utils/s3Uploader');
const pool = require('../config/db');

exports.createPayment = async (req, res) => {
  const { enrollmentId, amount } = req.body;
  const paymentProofFile = req.file; // Get uploaded file from Multer

  if (!paymentProofFile) {
    return res.status(400).json({ message: 'Payment proof file is required' });
  }

  try {
    // Upload to S3 and get URL
    const paymentProofUrl = await uploadToS3.uploadToS3(paymentProofFile, 'payments');
    
    // Create payment with the obtained URL
    const payment = await paymentService.createPayment(
      enrollmentId,
      amount,
      paymentProofUrl
    );
    
    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create payment' });
  }
};

exports.initializeChapaPayment = async (req, res) => {
  const { enrollmentId, amount } = req.body;
  const userId = req.user.userId;

  if (!enrollmentId || !amount) {
    return res.status(400).json({ error: 'enrollmentId and amount are required' });
  }

  try {
    const { checkoutUrl, txRef } = await paymentService.initializeChapaPayment({
      amount: Number(amount),
      userId,
      enrollmentId
    });

    res.json({ checkoutUrl, txRef });
  } catch (error) {
    logger.error('Chapa Initialization Error:', error);
    const statusCode = error.message.includes('User not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

// In paymentController.js

exports.handleChapaWebhook = async (req, res) => {
  const signature = req.headers['x-chapa-signature'];
  const event = req.body;

  if (!signature) {
    return res.status(400).json({ error: 'Missing signature header' });
  }

  try {
    const isValid = paymentService.verifyWebhookSignature(signature, event);
    if (!isValid) {
      logger.warn('Invalid webhook signature', { event });
      return res.status(401).send('Invalid signature');
    }

    if (event.event === 'charge.success') {
      await paymentService.handleSuccessfulPayment(event);
      logger.info(`Payment succeeded: ${event.tx_ref}`);
    } else {
      logger.info(`Unhandled event type: ${event.event}`);
    }

    res.status(200).end();
  } catch (error) {
    logger.error('Webhook processing error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.verifyPaymentStatus = async (req, res) => { 
  const txRef = req.params.txRef;  // ✅ Correct way to read from the route
  console.log('Verifying payment status for tx_ref:', txRef);

  if (!txRef) {
    return res.status(400).json({ error: 'Missing transaction reference' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT status, enrollment_id FROM payments WHERE tx_ref = $1`,
      [txRef]
    );
    client.release();
    console.log('Payment verification result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    console.log('Payment status:', result.rows[0].status);


    return res.json({
      status: result.rows[0].status,
      enrollmentId: result.rows[0].enrollment_id
    });

  } catch (error) {
    console.error('Error verifying payment status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await paymentService.getPendingPayments();
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching pending payments' });
  }
};

exports.verifyPayment = async (req, res) => {
    try {
      const paymentId = req.params.id;

      const adminId = req.user.adminId; // from token
      const payment = await paymentService.verifyPayment(paymentId, adminId);
      res.json(payment);
    } catch (error) {
      console.error('Verify Payment Error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  };
  
exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await paymentService.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payment' });
  }
};
exports.getPaymentsByEnrollmentId = async (req, res) => {
  const { enrollmentId } = req.params;
  try {
    const payments = await paymentService.getPaymentsByEnrollmentId(enrollmentId);
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payments' });
  }
};
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all payments' });
  }
};

exports.rejectPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const adminId = req.user.adminId;
    const payment = await paymentService.rejectPayment(paymentId, adminId);
    res.json(payment);
  } catch (error) {
    console.error('Reject Payment Error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
};
