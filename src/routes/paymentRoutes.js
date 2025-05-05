const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage(); // ← use memory storage
const upload = multer({ storage });

// Updated route with file upload middleware
router.post(
  '/',
  authenticate,
  upload.single('paymentProof'), // 'paymentProof' is the form field name
  paymentController.createPayment
);

// Admin gets unverified payments
router.get('/pending', paymentController.getPendingPayments);

// Admin verifies a payment
router.post('/:id/verify',authenticate, paymentController.verifyPayment);
// Admin gets all payments
router.get('/', paymentController.getAllPayments);
// Admin gets a payment by ID
router.get('/:id', paymentController.getPaymentById);
// User gets payments by enrollment ID
router.get('/enrollment/:enrollmentId', paymentController.getPaymentsByEnrollmentId);
// User gets a payment by ID

module.exports = router;
