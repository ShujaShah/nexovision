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
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    thumbnailPath: {
      type: String,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
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
