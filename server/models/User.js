const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['doctor', 'admin', 'patient', 'clinic_admin'],
      default: 'doctor',
    },
    clinic: {
      type: mongoose.Schema.ObjectId,
      ref: 'Clinic',
      required: function() {
        // Only global admins don't need a clinic
        return this.role !== 'admin';
      }
    },
    specialization: {
      type: String,
      required: function () {
        return this.role === 'doctor';
      },
    },
    licenseNumber: {
      type: String,
      required: function () {
        return this.role === 'doctor';
      },
    },
    avatar: {
      type: String,
      default: 'default-avatar.png',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
