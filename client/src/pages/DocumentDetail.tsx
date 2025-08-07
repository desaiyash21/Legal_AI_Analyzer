import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDocumentById, downloadReport } from '../services/api';
import { Document } from '../types';
import AnalysisResults from '../components/AnalysisResults';

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDocument = useCallback(async () => {
    try {
      const doc = await getDocumentById(id!);
      setDocument(doc);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id, fetchDocument]);

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      const response = await downloadReport(document.id);
      
      // Create a blob from the response
      const blob = new Blob([response], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `legal-analysis-${document.originalName}.txt`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Document not found</h3>
        <p className="text-gray-600 mb-4">The document you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/documents')}
          className="btn-secondary btn-hover"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/documents')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{document.originalName}</h1>
              <p className="text-gray-600">
                Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="btn-primary btn-hover flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-2">Document Type</h3>
          <p className="text-gray-600">{document.analysis.documentType}</p>
        </div>
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-2">Risk Level</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
            document.analysis.risks.riskLevel === 'HIGH' ? 'text-red-600 bg-red-50 border-red-200' :
            document.analysis.risks.riskLevel === 'MEDIUM' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
            'text-green-600 bg-green-50 border-green-200'
          }`}>
            {document.analysis.risks.riskLevel} RISK
          </span>
        </div>
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-2">File Size</h3>
          <p className="text-gray-600">
            {(document.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>

      {/* Analysis Results */}
      <AnalysisResults document={document} />
    </div>
  );
};

export default DocumentDetail; 