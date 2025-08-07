const express = require('express');
const documentController = require('../controllers/documentController');

const router = express.Router();

// Get all analyzed documents
router.get('/', documentController.getAllDocuments);

// Get specific document analysis
router.get('/:id', documentController.getDocumentById);

// Delete document
router.delete('/:id', documentController.deleteDocument);

// Download analysis report
router.get('/:id/download', documentController.downloadReport);

// Get document statistics
router.get('/stats/overview', documentController.getDocumentStats);

module.exports = router; 