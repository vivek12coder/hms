const express = require('express');
const router = express.Router();
// Import the singleton service instance (module exports an instance, not a named export)
const DashboardService = require('../services/DashboardService');
const { authenticateToken, requireRole } = require('../middleware/rbac');
const { AuditService } = require('../services/AuditService');

// Get dashboard statistics
router.get('/stats', authenticateToken, AuditService.createMiddleware('DASHBOARD', 'VIEW_STATS'), async (req, res) => {
  try {
    // Service expects the full user object to determine role-specific filters
  const payload = await DashboardService.getDashboardStats(req.user);
  res.json({ success: true, data: payload });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get recent activities (Admin only)
router.get('/activities', authenticateToken, requireRole('ADMIN'), AuditService.createMiddleware('DASHBOARD', 'VIEW_ACTIVITIES'), async (req, res) => {
  try {
    // Placeholder: Service doesn't implement getRecentActivities; return empty list for now
    res.json({ activities: [] });
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;