const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

class DocumentService {
  async extractText(filePath, originalName) {
    try {
      const fileExtension = path.extname(originalName).toLowerCase();
      
      switch (fileExtension) {
        case '.pdf':
          return await this.extractFromPDF(filePath);
        case '.docx':
          return await this.extractFromDOCX(filePath);
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text from ${originalName}: ${error.message}`);
    }
  }

  async extractFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  async extractFromDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  async getDocumentMetadata(filePath, originalName) {
    try {
      const stats = fs.statSync(filePath);
      const fileExtension = path.extname(originalName).toLowerCase();
      
      return {
        fileName: originalName,
        fileSize: stats.size,
        fileType: fileExtension,
        lastModified: stats.mtime,
        created: stats.birthtime
      };
    } catch (error) {
      console.error('Metadata extraction error:', error);
      return null;
    }
  }

  async validateDocument(filePath, originalName) {
    const fileExtension = path.extname(originalName).toLowerCase();
    const allowedExtensions = ['.pdf', '.docx'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Unsupported file type. Only PDF and DOCX files are allowed.');
    }

    const stats = fs.statSync(filePath);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (stats.size > maxSize) {
      throw new Error('File size exceeds maximum limit of 10MB.');
    }

    return true;
  }
}

module.exports = DocumentService; 