const Clinic = require('../models/Clinic');
const User = require('../models/User');

// @desc    Get current clinic profile
// @route   GET /api/clinics/me
// @access  Private (Clinic Admin/Doctor)
exports.getClinicProfile = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.user.clinic).populate('adminId', 'name email');
    
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    next(error);
  }
};

// @desc    Update clinic profile
// @route   PUT /api/clinics/me
// @access  Private (Clinic Admin)
exports.updateClinicProfile = async (req, res, next) => {
  try {
    const { name, address, contactEmail, contactPhone } = req.body;

    const clinic = await Clinic.findByIdAndUpdate(
      req.user.clinic,
      { name, address, contactEmail, contactPhone },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors in the clinic
// @route   GET /api/clinics/doctors
// @access  Private (Clinic Admin/Doctor)
exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ clinic: req.user.clinic, role: { $in: ['doctor', 'clinic_admin'] } })
      .select('-password');
      
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a doctor to the clinic
// @route   POST /api/clinics/doctors
// @access  Private (Clinic Admin)
exports.addDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, licenseNumber } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const doctor = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      specialization,
      licenseNumber,
      clinic: req.user.clinic, // Assign to current admin's clinic
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a doctor
// @route   PUT /api/clinics/doctors/:id
// @access  Private (Clinic Admin)
exports.updateDoctor = async (req, res, next) => {
  try {
    const { name, email, specialization, licenseNumber, password } = req.body;

    let doctor = await User.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (doctor.clinic.toString() !== req.user.clinic.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this doctor' });
    }
    
    // Don't allow changing role through this endpoint
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (specialization) doctor.specialization = specialization;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;
    if (password) doctor.password = password; // Will be hashed by pre-save middleware if modified

    await doctor.save();

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/clinics/doctors/:id
// @access  Private (Clinic Admin)
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (doctor.clinic.toString() !== req.user.clinic.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this doctor' });
    }

    if (doctor.role === 'clinic_admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete the clinic admin' });
    }

    await doctor.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
