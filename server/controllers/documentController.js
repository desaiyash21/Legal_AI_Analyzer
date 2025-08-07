const { 
  getAllDocuments, 
  getDocumentById, 
  deleteDocument, 
  getDocumentStats
} = require('../models/documentModel');
const ReportService = require('../services/reportService');

const documentController = {
  async getAllDocuments(req, res) {
    try {
      const documents = await getAllDocuments();
      res.json({
        documents: documents,
        count: documents.length
      });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve documents',
        message: error.message 
      });
    }
  },

  async getDocumentById(req, res) {
    try {
      const { id } = req.params;
      const document = await getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({ document });
    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve document',
        message: error.message 
      });
    }
  },

  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const result = await deleteDocument(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({ 
        error: 'Failed to delete document',
        message: error.message 
      });
    }
  },

  async downloadReport(req, res) {
    try {
      const { id } = req.params;
      const document = await getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const reportService = new ReportService();
      const report = await reportService.generateReport(document);

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="legal-analysis-${document.originalName}.txt"`);
      res.send(report);

    } catch (error) {
      console.error('Download report error:', error);
      res.status(500).json({ 
        error: 'Failed to generate report',
        message: error.message 
      });
    }
  },

  async getDocumentStats(req, res) {
    try {
      const stats = await getDocumentStats();
      res.json({ stats });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve statistics',
        message: error.message 
      });
    }
  }
};

module.exports = documentController; 