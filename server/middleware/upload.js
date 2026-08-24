const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  // Check mime type
  const isImageMime = file.mimetype.startsWith('image/');
  const isDicomMime = file.mimetype === 'application/dicom' || file.mimetype === 'application/dicom';
  
  // Check extension as fallback/additional validation
  const extname = path.extname(file.originalname).toLowerCase();
  const imageExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic', '.heif', '.tiff', '.tif', '.bmp', '.svg'];
  const dicomExtensions = ['.dicom', '.dcm'];
  
  const isImageExt = imageExtensions.includes(extname);
  const isDicomExt = dicomExtensions.includes(extname);

  // Accept if it's an image mime type OR image extension OR dicom mime/extension
  if (isImageMime || isDicomMime || isImageExt || isDicomExt) {
    return cb(null, true);
  } else {
    cb(new Error('Only image formats (jpg, png, webp, heic, etc.) and DICOM files are allowed!'));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 50000000 }, // 50MB default
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
