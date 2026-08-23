const express = require('express');
const { getScans, uploadScan, getScan } = require('../controllers/scanController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('doctor', 'admin'));

router.route('/')
  .get(getScans);

router.post('/upload', authorize('doctor'), upload.single('image'), uploadScan);

router.route('/:id')
  .get(getScan)
  .delete(require('../controllers/scanController').deleteScan);

router.post('/:id/analyze', authorize('doctor'), require('../controllers/scanController').analyzeScan);

module.exports = router;
