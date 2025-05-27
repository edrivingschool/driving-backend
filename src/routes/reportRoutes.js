const express = require('express');
const { generateReport } = require('../controllers/reportController');
const { validateReportRequest } = require('../middleware/reportValidation'); // Fixed path

const router = express.Router();

router.post('/reports', 
  validateReportRequest,
  generateReport
);

module.exports = router;