const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    scan: {
      type: mongoose.Schema.ObjectId,
      ref: 'Scan',
      required: true,
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: 'Patient',
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true, // Typically the doctor who initiated analysis
    },
    clinic: {
      type: mongoose.Schema.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    aiFindingsRaw: {
      type: String, // Raw output from MedGemma
    },
    structuredFindings: {
      impression: String,
      findings: [
        {
          region: String,
          description: String,
          severity: {
            type: String,
            enum: ['normal', 'mild', 'moderate', 'severe', 'critical'],
          },
        },
      ],
      recommendations: [String],
      differentialDiagnosis: [String],
    },
    doctorNotes: {
      type: String, // Doctor's addendum/corrections
    },
    status: {
      type: String,
      enum: ['draft', 'reviewed', 'finalized'],
      default: 'draft',
    },
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Doctor who finalized the report
    },
    reviewedAt: {
      type: Date,
    },
    pdfPath: {
      type: String, // Path to generated PDF file
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
