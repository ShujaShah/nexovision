const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a clinic name'],
    },
    address: {
      type: String,
      required: [true, 'Please add a clinic address'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Please add a contact email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    contactPhone: {
      type: String,
      required: [true, 'Please add a contact phone'],
    },
    adminId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Clinic', clinicSchema);
