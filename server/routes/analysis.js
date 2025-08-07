const express = require('express');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

// Compare multiple documents
router.post('/compare', analysisController.compareDocuments);

// Re-analyze document with different parameters
router.post('/reanalyze/:id', analysisController.reanalyzeDocument);

// Get risk analysis
router.get('/risk/:id', analysisController.getRiskAnalysis);

// Get simplified version
router.get('/simplified/:id', analysisController.getSimplifiedVersion);

// Export analysis in different formats
router.get('/export/:id/:format', analysisController.exportAnalysis);

module.exports = router; 