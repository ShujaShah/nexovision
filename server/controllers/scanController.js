const Scan = require('../models/Scan');
const path = require('path');
const fs = require('fs');

// @desc    List all scans
// @route   GET /api/scans
// @access  Private (Doctor/Admin)
exports.getScans = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== 'admin') {
      query.clinic = req.user.clinic;
    }
    if (req.query.search) {
      // Find patients matching the search term to filter scans by patient
      const Patient = require('../models/Patient');
      const patients = await Patient.find({
        $or: [
          { firstName: { $regex: req.query.search, $options: 'i' } },
          { lastName: { $regex: req.query.search, $options: 'i' } }
        ]
      });
      const patientIds = patients.map(p => p._id);
      
      query = {
        $or: [
          { patient: { $in: patientIds } },
          { bodyPart: { $regex: req.query.search, $options: 'i' } },
          { imageType: { $regex: req.query.search, $options: 'i' } }
        ]
      };
    }

    const scans = await Scan.find(query)
      .populate('patient', 'firstName lastName')
      .populate('uploadedBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');
      
    const total = await Scan.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      count: scans.length, 
      total,
      page,
      pages: Math.ceil(total / limit),
      data: scans 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scan
// @route   DELETE /api/scans/:id
// @access  Private (Doctor/Admin)
exports.deleteScan = async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    if (req.user.role !== 'admin' && scan.clinic.toString() !== req.user.clinic.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this scan' });
    }

    // Delete associated physical image file
    if (scan.filePath) {
      const fullPath = path.join(__dirname, '..', '..', scan.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Delete associated Report and its PDF
    const Report = require('../models/Report');
    const report = await Report.findOne({ scan: scan._id });
    if (report) {
      if (report.pdfPath) {
        const pdfFullPath = path.join(__dirname, '..', '..', report.pdfPath);
        if (fs.existsSync(pdfFullPath)) {
          fs.unlinkSync(pdfFullPath);
        }
      }
      await report.deleteOne();
    }

    await scan.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new scan image
// @route   POST /api/scans/upload
// @access  Private (Doctor)
exports.uploadScan = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { patientId, imageType, bodyPart } = req.body;

    if (!patientId || !imageType || !bodyPart) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Please provide patientId, imageType, and bodyPart' });
    }

    const scan = await Scan.create({
      patient: patientId,
      uploadedBy: req.user.id,
      imageType,
      bodyPart,
      originalFilename: req.file.originalname,
      filePath: `/uploads/images/${req.file.filename}`, // Assuming express static serves this
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'pending',
      clinic: req.user.clinic,
    });

    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single scan
// @route   GET /api/scans/:id
// @access  Private (Doctor/Admin)
exports.getScan = async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth gender')
      .populate('uploadedBy', 'name');

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    if (req.user.role !== 'admin' && scan.clinic.toString() !== req.user.clinic.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this scan' });
    }

    res.status(200).json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
};

const ollamaService = require('../services/ollamaService');
const Report = require('../models/Report');

// @desc    Trigger MedGemma analysis on a scan
// @route   POST /api/scans/:id/analyze
// @access  Private (Doctor)
exports.analyzeScan = async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    if (req.user.role !== 'admin' && scan.clinic.toString() !== req.user.clinic.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to analyze this scan' });
    }

    if (scan.status === 'analyzing') {
      return res.status(400).json({ success: false, message: 'Scan is already being analyzed' });
    }

    // Update status to analyzing
    scan.status = 'analyzing';
    await scan.save();

    // In a real production app, this should be a background job (e.g. BullMQ)
    // For this prototype, we'll wait for the response (could take 30-120s)
    
    // Check Ollama health first
    const health = await ollamaService.checkHealth();
    if (health.status !== 'ok') {
      scan.status = 'failed';
      await scan.save();
      return res.status(503).json({ success: false, message: 'Ollama service is unavailable' });
    }

    // Run analysis
    const analysis = await ollamaService.analyzeMedicalImage(
      scan.filePath, 
      scan.imageType, 
      scan.bodyPart,
      req.body?.clinicalContext || ''
    );

    // Create a draft report
    const report = await Report.create({
      scan: scan._id,
      patient: scan.patient,
      generatedBy: req.user.id,
      clinic: req.user.clinic,
      aiFindingsRaw: analysis.raw,
      structuredFindings: analysis.structured,
      status: 'draft'
    });

    // Update scan status
    scan.status = 'completed';
    await scan.save();

    res.status(200).json({ 
      success: true, 
      message: 'Analysis complete',
      data: report 
    });

  } catch (error) {
    console.error(error);
    // Try to update scan status to failed
    try {
      await Scan.findByIdAndUpdate(req.params.id, { status: 'failed' });
    } catch(e) {}
    next(error);
  }
};
