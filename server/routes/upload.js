const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadController = require('../controllers/uploadController');
const { validateFile } = require('../middleware/fileValidation');

const router = express.Router();

//  IMPORTANT: Use __dirname and resolve path
const uploadDir = path.resolve(__dirname, '../../uploads');

//  Ensure the uploads directory exists before multer tries to use it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//  Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

//  Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

//  Upload and analyze document
router.post('/', upload.single('document'), validateFile, uploadController.uploadAndAnalyze);

//  Upload multiple documents
router.post('/multiple', upload.array('documents', 5), validateFile, uploadController.uploadMultiple);

module.exports = router;
