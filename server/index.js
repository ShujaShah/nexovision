const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: '../.env' }); // Load from root during dev

// Connect to database
connectDB();

const morgan = require('morgan');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Serve static files from the uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Mount routers
const authRoutes = require('./routes/authRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const patientRoutes = require('./routes/patientRoutes');
const scanRoutes = require('./routes/scanRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Nexovision AI API is running...');
});

// Error Handler Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
