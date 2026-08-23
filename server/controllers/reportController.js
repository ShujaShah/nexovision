const Report = require('../models/Report');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Doctor/Admin)
exports.getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.search) {
      const Patient = require('../models/Patient');
      const patients = await Patient.find({
        $or: [
          { firstName: { $regex: req.query.search, $options: 'i' } },
          { lastName: { $regex: req.query.search, $options: 'i' } }
        ]
      });
      const patientIds = patients.map(p => p._id);
      
      const Scan = require('../models/Scan');
      const scans = await Scan.find({ bodyPart: { $regex: req.query.search, $options: 'i' } });
      const scanIds = scans.map(s => s._id);

      query = {
        $or: [
          { patient: { $in: patientIds } },
          { scan: { $in: scanIds } }
        ]
      };
    }

    const reports = await Report.find(query)
      .populate('patient', 'firstName lastName')
      .populate('scan', 'imageType bodyPart createdAt')
      .populate('generatedBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');
      
    const total = await Report.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      count: reports.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reports 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Doctor/Admin)
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Delete associated physical PDF file
    if (report.pdfPath) {
      const fs = require('fs');
      const path = require('path');
      const pdfFullPath = path.join(__dirname, '..', '..', report.pdfPath);
      if (fs.existsSync(pdfFullPath)) {
        fs.unlinkSync(pdfFullPath);
      }
    }

    await report.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patient')
      .populate('scan')
      .populate('generatedBy', 'name specialization')
      .populate('reviewedBy', 'name specialization');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Review and add doctor notes to report
// @route   PUT /api/reports/:id/review
// @access  Private (Doctor)
exports.reviewReport = async (req, res, next) => {
  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.doctorNotes = req.body.doctorNotes;
    report.status = 'reviewed';
    
    await report.save();

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const pdfService = require('../services/pdfService');

// @desc    Finalize report
// @route   PUT /api/reports/:id/finalize
// @access  Private (Doctor)
exports.finalizeReport = async (req, res, next) => {
  try {
    let report = await Report.findById(req.params.id)
      .populate('patient')
      .populate('scan')
      .populate('generatedBy');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.status === 'finalized') {
      return res.status(400).json({ success: false, message: 'Report is already finalized' });
    }

    report.status = 'finalized';
    report.reviewedBy = req.user.id;
    report.reviewedAt = Date.now();
    
    // Explicitly populate reviewedBy for the PDF generation
    await report.populate('reviewedBy', 'name');
    
    // Generate PDF
    const pdfPath = await pdfService.generateReportPDF(report);
    report.pdfPath = pdfPath;
    
    await report.save();

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Report PDF
// @route   GET /api/reports/:id/pdf
// @access  Private
exports.downloadPdf = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report || !report.pdfPath) {
      return res.status(404).json({ success: false, message: 'PDF not found' });
    }

    // In a real app, you might serve this directly or use res.download
    // Since we're serving /uploads statically, we just return the URL
    res.status(200).json({ success: true, pdfUrl: report.pdfPath });
  } catch (error) {
    next(error);
  }
};
