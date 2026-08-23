const express = require('express');
const {
  getReports,
  getReport,
  reviewReport,
  finalizeReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('doctor', 'admin'), getReports);

router.route('/:id')
  .get(getReport)
  .delete(authorize('doctor', 'admin'), require('../controllers/reportController').deleteReport);

router.put('/:id/review', authorize('doctor'), reviewReport);
router.put('/:id/finalize', authorize('doctor'), finalizeReport);
router.get('/:id/pdf', require('../controllers/reportController').downloadPdf);

module.exports = router;
