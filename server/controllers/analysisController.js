const { getDocumentById } = require('../models/documentModel');
const NLPService = require('../services/nlpService');
const ComparisonService = require('../services/comparisonService');

const analysisController = {
  async compareDocuments(req, res) {
    try {
      const { documentIds } = req.body;
      
      if (!documentIds || !Array.isArray(documentIds) || documentIds.length < 2) {
        return res.status(400).json({ error: 'At least 2 document IDs are required for comparison' });
      }

      // Fetch all documents
      const documents = [];
      for (const id of documentIds) {
        const doc = await getDocumentById(id);
        if (doc) {
          documents.push(doc);
        }
      }

      if (documents.length < 2) {
        return res.status(400).json({ error: 'Could not find enough documents for comparison' });
      }

      // Perform comparison
      const comparisonService = new ComparisonService();
      const comparison = await comparisonService.compareDocuments(documents);

      res.json({
        message: 'Document comparison completed',
        comparison: comparison
      });

    } catch (error) {
      console.error('Compare documents error:', error);
      res.status(500).json({ 
        error: 'Failed to compare documents',
        message: error.message 
      });
    }
  },

  async reanalyzeDocument(req, res) {
    try {
      const { id } = req.params;
      const { analysisType, parameters } = req.body;

      const document = await getDocumentById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const nlpService = new NLPService();
      let newAnalysis;

      switch (analysisType) {
        case 'summary':
          newAnalysis = await nlpService.generateSummary(document.textContent, parameters);
          break;
        case 'risk':
          newAnalysis = await nlpService.analyzeRisks(document.textContent, parameters);
          break;
        case 'entities':
          newAnalysis = await nlpService.extractEntities(document.textContent, parameters);
          break;
        case 'simplified':
          newAnalysis = await nlpService.simplifyText(document.textContent, parameters);
          break;
        default:
          return res.status(400).json({ error: 'Invalid analysis type' });
      }

      res.json({
        message: 'Document re-analyzed successfully',
        analysis: newAnalysis
      });

    } catch (error) {
      console.error('Reanalyze document error:', error);
      res.status(500).json({ 
        error: 'Failed to re-analyze document',
        message: error.message 
      });
    }
  },

  async getRiskAnalysis(req, res) {
    try {
      const { id } = req.params;
      const document = await getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const nlpService = new NLPService();
      const riskAnalysis = await nlpService.analyzeRisks(document.textContent);

      res.json({
        documentId: id,
        riskAnalysis: riskAnalysis
      });

    } catch (error) {
      console.error('Risk analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to perform risk analysis',
        message: error.message 
      });
    }
  },

  async getSimplifiedVersion(req, res) {
    try {
      const { id } = req.params;
      const document = await getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const nlpService = new NLPService();
      const simplified = await nlpService.simplifyText(document.textContent);

      res.json({
        documentId: id,
        originalText: document.textContent,
        simplifiedText: simplified
      });

    } catch (error) {
      console.error('Simplification error:', error);
      res.status(500).json({ 
        error: 'Failed to simplify document',
        message: error.message 
      });
    }
  },

  async exportAnalysis(req, res) {
    try {
      const { id, format } = req.params;
      const document = await getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      let exportData;
      let contentType;
      let filename;

      switch (format.toLowerCase()) {
        case 'json':
          exportData = JSON.stringify(document, null, 2);
          contentType = 'application/json';
          filename = `analysis-${id}.json`;
          break;
        case 'txt':
          exportData = `Document Analysis Report\n\n` +
                      `Document: ${document.originalName}\n` +
                      `Upload Date: ${document.uploadDate}\n\n` +
                      `Summary: ${document.analysis.summary}\n\n` +
                      `Key Entities: ${JSON.stringify(document.analysis.entities, null, 2)}\n\n` +
                      `Risk Analysis: ${JSON.stringify(document.analysis.risks, null, 2)}`;
          contentType = 'text/plain';
          filename = `analysis-${id}.txt`;
          break;
        default:
          return res.status(400).json({ error: 'Unsupported export format' });
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ 
        error: 'Failed to export analysis',
        message: error.message 
      });
    }
  }
};

module.exports = analysisController; 