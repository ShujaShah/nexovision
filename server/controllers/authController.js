const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a user (doctor/patient) within an existing clinic
// @route   POST /api/auth/register
// @access  Public (In production, usually Private for Doctors)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, specialization, licenseNumber, clinicId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Require clinicId unless global admin
    if (role !== 'admin' && !clinicId) {
      res.status(400);
      throw new Error('Clinic ID is required');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      specialization: role === 'doctor' ? specialization : undefined,
      licenseNumber: role === 'doctor' ? licenseNumber : undefined,
      clinic: clinicId || undefined
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinic: user.clinic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new clinic and its admin
// @route   POST /api/auth/register-clinic
// @access  Public
exports.registerClinic = async (req, res, next) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { clinicName, address, contactEmail, contactPhone, adminName, adminEmail, adminPassword } = req.body;
    
    // Check if admin email exists
    const userExists = await User.findOne({ email: adminEmail }).session(session);
    if (userExists) {
      res.status(400);
      throw new Error('User email already exists');
    }

    const Clinic = require('../models/Clinic');
    
    // 1. Create Clinic (without adminId first)
    const [clinic] = await Clinic.create([{
      name: clinicName,
      address,
      contactEmail,
      contactPhone,
      adminId: new mongoose.Types.ObjectId() // Placeholder to pass validation
    }], { session });

    // 2. Create Admin User
    const [adminUser] = await User.create([{
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'clinic_admin',
      clinic: clinic._id
    }], { session });

    // 3. Update Clinic with actual adminId
    clinic.adminId = adminUser._id;
    await clinic.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        _id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        clinic: clinic._id,
        token: generateToken(adminUser._id),
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
