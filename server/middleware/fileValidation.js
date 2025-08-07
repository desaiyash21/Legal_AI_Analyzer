const path = require('path');
const fs = require('fs');

const validateFile = (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      // Check file extension
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const allowedExtensions = ['.pdf', '.docx'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ 
          error: 'Invalid file type. Only PDF and DOCX files are allowed.',
          allowedTypes: allowedExtensions
        });
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return res.status(400).json({ 
          error: 'File size exceeds maximum limit of 10MB',
          maxSize: '10MB',
          actualSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
        });
      }

      // Check if file exists and is readable
      if (!fs.existsSync(file.path)) {
        return res.status(400).json({ error: 'Uploaded file not found' });
      }

      // Validate file content (basic check)
      const stats = fs.statSync(file.path);
      if (stats.size === 0) {
        return res.status(400).json({ error: 'File is empty' });
      }

      // Additional validation for specific file types
      if (fileExtension === '.pdf') {
        // Check if it's a valid PDF by reading first few bytes
        const buffer = fs.readFileSync(file.path, { encoding: null });
        const header = buffer.toString('ascii', 0, 4);
        if (header !== '%PDF') {
          return res.status(400).json({ error: 'Invalid PDF file format' });
        }
      }
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({ 
      error: 'File validation failed',
      message: error.message 
    });
  }
};

const validateMultipleFiles = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ 
        error: 'Too many files. Maximum 5 files allowed.',
        maxFiles: 5,
        uploadedFiles: req.files.length
      });
    }

    // Check for duplicate filenames
    const filenames = req.files.map(file => file.originalname);
    const uniqueFilenames = [...new Set(filenames)];
    
    if (filenames.length !== uniqueFilenames.length) {
      return res.status(400).json({ 
        error: 'Duplicate filenames detected. Please ensure all files have unique names.' 
      });
    }

    next();
  } catch (error) {
    console.error('Multiple file validation error:', error);
    res.status(500).json({ 
      error: 'Multiple file validation failed',
      message: error.message 
    });
  }
};

const sanitizeFilename = (filename) => {
  // Remove or replace potentially dangerous characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255); // Limit filename length
};

const getFileType = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  const typeMap = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return typeMap[extension] || 'application/octet-stream';
};

module.exports = {
  validateFile,
  validateMultipleFiles,
  sanitizeFilename,
  getFileType
}; 