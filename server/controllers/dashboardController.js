const Patient = require('../models/Patient');
const Scan = require('../models/Scan');
const Report = require('../models/Report');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    // Base filters based on clinic (unless global admin)
    const baseFilter = req.user.role === 'admin' ? {} : { clinic: req.user.clinic };
    const patientFilter = { ...baseFilter };
    const scanFilter = { ...baseFilter };
    const reportFilter = { ...baseFilter };

    // Get total counts
    const totalPatients = await Patient.countDocuments(patientFilter);
    const totalScans = await Scan.countDocuments(scanFilter);
    const pendingReviews = await Report.countDocuments({ ...reportFilter, status: 'draft' });
    const completedReports = await Report.countDocuments({ ...reportFilter, status: 'finalized' });

    // Get recent activity (last 5 scans)
    const recentActivity = await Scan.find(scanFilter)
      .sort('-createdAt')
      .limit(5)
      .populate('patient', 'firstName lastName')
      .select('imageType bodyPart status createdAt patient files filePath');

    // Get scan type distribution for charts
    const scanTypes = await Scan.aggregate([
      { $match: scanFilter },
      { $group: { _id: '$imageType', count: { $sum: 1 } } }
    ]);

    const formattedScanTypes = scanTypes.map(t => ({
      name: t._id.toUpperCase(),
      value: t.count
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalScans,
          pendingReviews,
          completedReports
        },
        recentActivity,
        scanTypes: formattedScanTypes
      }
    });
  } catch (error) {
    next(error);
  }
};
