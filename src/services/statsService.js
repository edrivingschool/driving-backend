const pool = require('../config/db'); // Assuming your connection is in db.js

exports.fetchDashboardStats = async () => {
  try {
    // Execute all queries in parallel using Promise.all
    const [
      totalUsers,
      enrolledUsers,
      totalCourses,
      pendingEnrollments,
      pendingDocuments,
      pendingPayments,
      verifiedUsers,
      totalTeachers
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM users'),
      pool.query("SELECT COUNT(*) AS count FROM enrollments WHERE status = 'accepted'"),
      pool.query('SELECT COUNT(*) AS count FROM courses'),
    pool.query("SELECT COUNT(*) AS count FROM enrollments WHERE status = 'pending'"),
     pool.query("SELECT COUNT(*) AS count FROM documents_verification_log WHERE status = 'pending'"),
     pool.query("SELECT COUNT(*) AS count FROM payments WHERE verified = 'false'"),
    pool.query("SELECT COUNT(*) AS count FROM documents_verification_log WHERE status = 'approved'"),
      pool.query('SELECT COUNT(*) AS count FROM teachers')
    ]);

    // Return the formatted data
    return {
      totalUsers: parseInt(totalUsers.rows[0].count, 10),
      enrolledUsers: parseInt(enrolledUsers.rows[0].count, 10),
     totalCourses: parseInt(totalCourses.rows[0].count, 10),
     pendingEnrollments: parseInt(pendingEnrollments.rows[0].count, 10),
    pendingDocuments: parseInt(pendingDocuments.rows[0].count, 10),
     pendingPayments: parseInt(pendingPayments.rows[0].count, 10),
    verifiedUsers: parseInt(verifiedUsers.rows[0].count, 10),
     totalTeachers: parseInt(totalTeachers.rows[0].count, 10)
    };
    
  } catch (error) {
    
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};
