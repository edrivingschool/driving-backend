const { check, validationResult } = require('express-validator');

exports.validateReportRequest = [
  check('format')
    .isIn(['pdf', 'excel', 'docx'])
    .withMessage('Invalid report format'),
  check('reportType')
    .isIn([
      'user-registrations',
      'course-enrollments',
      'payment-status',
      'document-verification',
      'teacher-assignments'
    ])
    .withMessage('Invalid report type'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];