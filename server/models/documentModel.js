const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database setup
const dbPath = path.join(__dirname, '../../database/legal_analyzer.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create documents table
      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          originalName TEXT NOT NULL,
          fileName TEXT NOT NULL,
          filePath TEXT NOT NULL,
          textContent TEXT,
          analysis TEXT,
          uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          fileSize INTEGER,
          documentType TEXT,
          riskLevel TEXT,
          totalRisks INTEGER DEFAULT 0
        )
      `, (err) => {
        if (err) {
          console.error('Error creating documents table:', err);
          reject(err);
        } else {
          console.log('Documents table ready');
          resolve();
        }
      });

      // Create analysis_history table for tracking re-analyses
      db.run(`
        CREATE TABLE IF NOT EXISTS analysis_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          documentId TEXT,
          analysisType TEXT,
          parameters TEXT,
          result TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (documentId) REFERENCES documents (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating analysis_history table:', err);
        } else {
          console.log('Analysis history table ready');
        }
      });
    });
  });
};

// Initialize database on module load
initDatabase().catch(console.error);

const documentModel = {
  async createDocument(documentData) {
    return new Promise((resolve, reject) => {
      const {
        id,
        originalName,
        fileName,
        filePath,
        textContent,
        analysis,
        uploadDate,
        fileSize
      } = documentData;

      const analysisJson = JSON.stringify(analysis);
      
      const query = `
        INSERT INTO documents (
          id, originalName, fileName, filePath, textContent, 
          analysis, uploadDate, fileSize, documentType, 
          riskLevel, totalRisks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id,
        originalName,
        fileName,
        filePath,
        textContent,
        analysisJson,
        uploadDate,
        fileSize,
        analysis.documentType,
        analysis.risks.riskLevel,
        analysis.risks.totalRisks
      ];

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error creating document:', err);
          reject(err);
        } else {
          resolve({
            id,
            originalName,
            fileName,
            filePath,
            textContent,
            analysis,
            uploadDate,
            fileSize,
            documentType: analysis.documentType,
            riskLevel: analysis.risks.riskLevel,
            totalRisks: analysis.risks.totalRisks
          });
        }
      });
    });
  },

  async getAllDocuments() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, originalName, fileName, filePath, textContent, 
               analysis, uploadDate, fileSize, documentType, 
               riskLevel, totalRisks
        FROM documents 
        ORDER BY uploadDate DESC
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error getting documents:', err);
          reject(err);
        } else {
          const documents = rows.map(row => ({
            ...row,
            analysis: JSON.parse(row.analysis)
          }));
          resolve(documents);
        }
      });
    });
  },

  async getDocumentById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, originalName, fileName, filePath, textContent, 
               analysis, uploadDate, fileSize, documentType, 
               riskLevel, totalRisks
        FROM documents 
        WHERE id = ?
      `;

      db.get(query, [id], (err, row) => {
        if (err) {
          console.error('Error getting document:', err);
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            ...row,
            analysis: JSON.parse(row.analysis)
          });
        }
      });
    });
  },

  async updateDocument(id, updateData) {
    return new Promise((resolve, reject) => {
      const { analysis, ...otherData } = updateData;
      const analysisJson = analysis ? JSON.stringify(analysis) : null;
      
      const query = `
        UPDATE documents 
        SET analysis = COALESCE(?, analysis),
            documentType = COALESCE(?, documentType),
            riskLevel = COALESCE(?, riskLevel),
            totalRisks = COALESCE(?, totalRisks)
        WHERE id = ?
      `;

      const params = [
        analysisJson,
        otherData.documentType,
        otherData.riskLevel,
        otherData.totalRisks,
        id
      ];

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error updating document:', err);
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve({ id, ...updateData });
          } else {
            resolve(null);
          }
        }
      });
    });
  },

  async deleteDocument(id) {
    return new Promise((resolve, reject) => {
      // First get the document to delete the file
      documentModel.getDocumentById(id).then(document => {
        if (document) {
          // Delete the physical file
          try {
            if (fs.existsSync(document.filePath)) {
              fs.unlinkSync(document.filePath);
            }
          } catch (fileError) {
            console.error('Error deleting file:', fileError);
          }

          // Delete from database
          const query = 'DELETE FROM documents WHERE id = ?';
          db.run(query, [id], function(err) {
            if (err) {
              console.error('Error deleting document:', err);
              reject(err);
            } else {
              resolve(this.changes > 0);
            }
          });
        } else {
          resolve(false);
        }
      }).catch(reject);
    });
  },

  async getDocumentStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as totalDocuments,
          COUNT(CASE WHEN riskLevel = 'HIGH' THEN 1 END) as highRiskCount,
          COUNT(CASE WHEN riskLevel = 'MEDIUM' THEN 1 END) as mediumRiskCount,
          COUNT(CASE WHEN riskLevel = 'LOW' THEN 1 END) as lowRiskCount,
          AVG(totalRisks) as averageRisks,
          SUM(fileSize) as totalSize,
          documentType,
          COUNT(*) as typeCount
        FROM documents 
        GROUP BY documentType
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error getting document stats:', err);
          reject(err);
        } else {
          const stats = {
            totalDocuments: rows.reduce((sum, row) => sum + row.totalDocuments, 0),
            riskDistribution: {
              high: rows.reduce((sum, row) => sum + row.highRiskCount, 0),
              medium: rows.reduce((sum, row) => sum + row.mediumRiskCount, 0),
              low: rows.reduce((sum, row) => sum + row.lowRiskCount, 0)
            },
            averageRisks: rows.reduce((sum, row) => sum + (row.averageRisks || 0), 0) / Math.max(rows.length, 1),
            totalSize: rows.reduce((sum, row) => sum + (row.totalSize || 0), 0),
            documentTypes: rows.map(row => ({
              type: row.documentType,
              count: row.typeCount
            }))
          };
          resolve(stats);
        }
      });
    });
  },

  async addAnalysisHistory(documentId, analysisType, parameters, result) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO analysis_history (documentId, analysisType, parameters, result)
        VALUES (?, ?, ?, ?)
      `;

      const params = [
        documentId,
        analysisType,
        JSON.stringify(parameters),
        JSON.stringify(result)
      ];

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error adding analysis history:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  },

  async getAnalysisHistory(documentId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, analysisType, parameters, result, timestamp
        FROM analysis_history 
        WHERE documentId = ?
        ORDER BY timestamp DESC
      `;

      db.all(query, [documentId], (err, rows) => {
        if (err) {
          console.error('Error getting analysis history:', err);
          reject(err);
        } else {
          const history = rows.map(row => ({
            ...row,
            parameters: JSON.parse(row.parameters),
            result: JSON.parse(row.result)
          }));
          resolve(history);
        }
      });
    });
  },

  async searchDocuments(searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, originalName, fileName, filePath, textContent, 
               analysis, uploadDate, fileSize, documentType, 
               riskLevel, totalRisks
        FROM documents 
        WHERE originalName LIKE ? OR textContent LIKE ?
        ORDER BY uploadDate DESC
      `;

      const searchPattern = `%${searchTerm}%`;
      const params = [searchPattern, searchPattern];

      db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Error searching documents:', err);
          reject(err);
        } else {
          const documents = rows.map(row => ({
            ...row,
            analysis: JSON.parse(row.analysis)
          }));
          resolve(documents);
        }
      });
    });
  },

  async getDocumentsByRiskLevel(riskLevel) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, originalName, fileName, filePath, textContent, 
               analysis, uploadDate, fileSize, documentType, 
               riskLevel, totalRisks
        FROM documents 
        WHERE riskLevel = ?
        ORDER BY uploadDate DESC
      `;

      db.all(query, [riskLevel], (err, rows) => {
        if (err) {
          console.error('Error getting documents by risk level:', err);
          reject(err);
        } else {
          const documents = rows.map(row => ({
            ...row,
            analysis: JSON.parse(row.analysis)
          }));
          resolve(documents);
        }
      });
    });
  }
};

module.exports = documentModel; 