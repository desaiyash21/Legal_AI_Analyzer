const DocumentService = require('../services/documentService');
const NLPService = require('../services/nlpService');
const { createDocument } = require('../models/documentModel');

const uploadController = {
  async uploadAndAnalyze(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { originalname, filename, path: filePath } = req.file;
      
      // Extract text from document
      const documentService = new DocumentService();
      const extractedText = await documentService.extractText(filePath, originalname);
      
      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ error: 'Could not extract text from document' });
      }

      // Perform NLP analysis
      const nlpService = new NLPService();
      const analysis = await nlpService.analyzeDocument(extractedText);

      // Save to database
      const documentData = {
        id: req.file.filename.split('-')[0],
        originalName: originalname,
        fileName: filename,
        filePath: filePath,
        textContent: extractedText,
        analysis: analysis,
        uploadDate: new Date(),
        fileSize: req.file.size
      };

      const savedDocument = await createDocument(documentData);

      res.status(201).json({
        message: 'Document uploaded and analyzed successfully',
        document: savedDocument
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: 'Failed to upload and analyze document',
        message: error.message 
      });
    }
  },

  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const documentService = new DocumentService();
      const nlpService = new NLPService();
      const results = [];

      for (const file of req.files) {
        try {
          // Extract text
          const extractedText = await documentService.extractText(file.path, file.originalname);
          
          if (!extractedText || extractedText.trim().length === 0) {
            results.push({
              file: file.originalname,
              success: false,
              error: 'Could not extract text'
            });
            continue;
          }

          // Analyze
          const analysis = await nlpService.analyzeDocument(extractedText);

          // Save
          const documentData = {
            id: file.filename.split('-')[0],
            originalName: file.originalname,
            fileName: file.filename,
            filePath: file.path,
            textContent: extractedText,
            analysis: analysis,
            uploadDate: new Date(),
            fileSize: file.size
          };

          const savedDocument = await createDocument(documentData);
          
          results.push({
            file: file.originalname,
            success: true,
            document: savedDocument
          });

        } catch (error) {
          results.push({
            file: file.originalname,
            success: false,
            error: error.message
          });
        }
      }

      res.status(200).json({
        message: 'Multiple documents processed',
        results: results
      });

    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ 
        error: 'Failed to process multiple documents',
        message: error.message 
      });
    }
  }
};

module.exports = uploadController; 