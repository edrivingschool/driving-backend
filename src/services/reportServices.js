const pool = require('../config/db');

class ReportService {
 
  async generateReport(reportType, filters) {
    switch(reportType) {
      case 'user-registrations':
        return this.getUserRegistrations(filters);
      case 'course-enrollments':
        return this.getCourseEnrollments(filters);
      case 'payment-status':
        return this.getPaymentReports(filters);
      case 'document-verification':
        return this.getDocumentVerificationStatus(filters);
      case 'teacher-assignments':
        return this.getTeacherAssignments(filters);
      default:
        throw new Error('Invalid report type');
    }
  }

  // User Registrations with Filters
  async getUserRegistrations({ startDate, endDate, verificationStatus }) {
    const query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.created_at,
        cr.age, cr.sex, cr.education_level,
        dvl.status as verification_status,
        COUNT(e.id) as total_enrollments
      FROM users u
      LEFT JOIN course_registrations cr ON u.id = cr.user_id
      LEFT JOIN documents_verification_log dvl ON cr.id = dvl.registration_id
      LEFT JOIN enrollments e ON u.id = e.student_id
      WHERE 1=1
        ${startDate && endDate ? `AND u.created_at BETWEEN $1 AND $2` : ''}
        ${verificationStatus ? `AND dvl.status = $${startDate ? 3 : 1}` : ''}
      GROUP BY u.id, cr.id, dvl.status
    `;

    const params = [];
    if (startDate && endDate) params.push(startDate, endDate);
    if (verificationStatus) params.push(verificationStatus);

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Course Enrollment Statistics
  async getCourseEnrollments({ courseId, status }) {
    const query = `
      SELECT
        c.title as course_title,
        COUNT(e.id) FILTER (WHERE e.status = 'accepted') as accepted,
        COUNT(e.id) FILTER (WHERE e.status = 'pending') as pending,
        COUNT(e.id) FILTER (WHERE e.status = 'rejected') as rejected,
        COUNT(p.id) FILTER (WHERE p.verified = true) as paid_enrollments
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN payments p ON e.id = p.enrollment_id
      ${courseId ? 'WHERE c.id = $1' : ''}
      GROUP BY c.id
    `;

    return (await pool.query(query, courseId ? [courseId] : [])).rows;
  }

  // Payment Reports
  async getPaymentReports({ startDate, endDate, verified }) {
    const query = `
      SELECT 
        p.*, u.first_name, u.last_name, c.title as course_title,
        e.status as enrollment_status
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE 1=1
        ${startDate && endDate ? `AND p.paid_at BETWEEN $1 AND $2` : ''}
        ${verified !== undefined ? `AND p.verified = $${startDate ? 3 : 1}` : ''}
    `;

    const params = [];
    if (startDate && endDate) params.push(startDate, endDate);
    if (verified !== undefined) params.push(verified);

    return (await pool.query(query, params)).rows;
  }

  // Document Verification Status
  async getDocumentVerificationStatus({ status }) {
    const query = `
      SELECT 
        cr.*, u.first_name, u.last_name, u.email,
        dvl.status, dvl.verified_at, dvl.remarks
      FROM course_registrations cr
      JOIN documents_verification_log dvl ON cr.id = dvl.registration_id
      JOIN users u ON cr.user_id = u.id
      ${status ? 'WHERE dvl.status = $1' : ''}
    `;

    return (await pool.query(query, status ? [status] : [])).rows;
  }

  // Teacher Assignments Report
  async getTeacherAssignments({ teacherId }) {
    const query = `
      SELECT
        t.first_name || ' ' || t.last_name as teacher_name,
        COUNT(ta.student_id) as total_students,
        COUNT(DISTINCT e.course_id) as courses_assigned,
        jsonb_agg(
          jsonb_build_object(
            'student_name', u.first_name || ' ' || u.last_name,
            'course_title', c.title,
            'enrollment_status', e.status
          )
        ) as students
      FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      JOIN users u ON ta.student_id = u.id
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN courses c ON e.course_id = c.id
      ${teacherId ? 'WHERE ta.teacher_id = $1' : ''}
      GROUP BY t.id
    `;

    return (await pool.query(query, teacherId ? [teacherId] : [])).rows;
  }
}

module.exports = new ReportService();