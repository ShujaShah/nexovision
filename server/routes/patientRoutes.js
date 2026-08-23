const express = require('express');
const {
  getPatients,
  createPatient,
  getPatient,
  updatePatient,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('doctor', 'admin', 'clinic_admin'));

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.route('/:id')
  .get(getPatient)
  .put(updatePatient);

module.exports = router;
