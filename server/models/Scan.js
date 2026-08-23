const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: 'Patient',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    clinic: {
      type: mongoose.Schema.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    imageType: {
      type: String,
      enum: ['xray', 'ctscan', 'mri', 'ultrasound', 'other'],
      required: true,
    },
    bodyPart: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: false, // For backward compatibility
    },
    filePath: {
      type: String,
      required: false,
    },
    fileSize: {
      type: Number,
      required: false,
    },
    mimeType: {
      type: String,
      required: false,
    },
    files: [{
      originalFilename: String,
      filePath: String,
      fileSize: Number,
      mimeType: String
    }],
    status: {
      type: String,
      enum: ['pending', 'analyzing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Scan', scanSchema);
