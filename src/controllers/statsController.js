const statsService = require('../services/statsService');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await statsService.fetchDashboardStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};
