const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Patient = require('./models/Patient');

dotenv.config({ path: '../.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing
    await User.deleteMany();
    await Patient.deleteMany();

    // Create doctor
    const doctor = await User.create({
      name: 'Dr. Gregory House',
      email: 'house@hospital.com',
      password: 'password123',
      role: 'doctor',
      specialization: 'Diagnostic Medicine',
      licenseNumber: 'MD-123456'
    });

    console.log('Created Doctor:', doctor.email);

    // Create a patient
    const patient = await Patient.create({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-05-15',
      gender: 'Male',
      contactInfo: {
        phone: '555-0199',
        address: '123 Fake St, Springfield'
      },
      medicalHistory: [
        { condition: 'Hypertension', notes: 'Diagnosed in 2018, managed with medication.' }
      ],
      assignedDoctor: doctor._id
    });

    console.log('Created Patient:', `${patient.firstName} ${patient.lastName}`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
