const Patient = require('../models/Patient');
const Scan = require('../models/Scan');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Doctor/Admin)
exports.getPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== 'admin') {
      query.assignedDoctor = req.user.id;
    }

    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query)
      .populate('assignedDoctor', 'name email')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');
      
    const total = await Patient.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      count: patients.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: patients 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (Doctor/Admin)
exports.createPatient = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.assignedDoctor = req.user.id;
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private (Doctor/Admin)
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('assignedDoctor', 'name email');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Include recent scans in the response
    const scans = await Scan.find({ patient: req.params.id }).sort('-createdAt').limit(5);

    res.status(200).json({ success: true, data: patient, recentScans: scans });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Doctor/Admin)
exports.updatePatient = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};
