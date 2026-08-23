const express = require('express');
const { getClinicProfile, updateClinicProfile, getDoctors, addDoctor, updateDoctor, deleteDoctor } = require('../controllers/clinicController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All clinic routes are protected
router.use(protect);

router.route('/me')
  .get(getClinicProfile)
  .put(authorize('clinic_admin'), updateClinicProfile);

router.route('/doctors')
  .get(getDoctors)
  .post(authorize('clinic_admin'), addDoctor);

router.route('/doctors/:id')
  .put(authorize('clinic_admin'), updateDoctor)
  .delete(authorize('clinic_admin'), deleteDoctor);

module.exports = router;
