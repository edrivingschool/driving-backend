const paymentService = require('../services/paymentService');
const uploadToS3 = require('../utils/s3Uploader');


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

// ... rest of your controller methods remain unchanged

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

      console.log('Verifying payment with ID:', paymentId);
      console.log('Admin ID:', req.user.adminId); // from token
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
