import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { getAllDocuments, deleteDocument, getDocumentStats, downloadReport } from '../services/api';
import { Document, DocumentStats } from '../types';

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  useEffect(() => {
  }, [documents, searchTerm, riskFilter, typeFilter]);

  const fetchDocuments = async () => {
    try {
      const docs = await getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const documentStats = await getDocumentStats();
      setStats(documentStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.analysis.documentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(doc => doc.analysis.risks.riskLevel === riskFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.analysis.documentType === typeFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, riskFilter, typeFilter]); // All direct dependencies


  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        setDocuments(docs => docs.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await downloadReport(doc.id);
      
      // Create a blob from the response
      const blob = new Blob([response], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `legal-analysis-${doc.originalName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? '📄' : '📝';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Document Library
        </h1>
        <p className="text-gray-600">
          View and manage all your analyzed legal documents
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </div>
          <div className="card text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.riskDistribution.high}</div>
            <div className="text-sm text-gray-600">High Risk</div>
          </div>
          <div className="card text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.riskDistribution.medium}</div>
            <div className="text-sm text-gray-600">Medium Risk</div>
          </div>
          <div className="card text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.riskDistribution.low}</div>
            <div className="text-sm text-gray-600">Low Risk</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Document Types</option>
            <option value="Contract/Agreement">Contract/Agreement</option>
            <option value="Policy/Terms">Policy/Terms</option>
            <option value="Notice/Letter">Notice/Letter</option>
            <option value="Legal Clause">Legal Clause</option>
            <option value="Legal Document">Legal Document</option>
          </select>
          <div className="text-sm text-gray-500 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            {filteredDocuments.length} of {documents.length} documents
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">
            {documents.length === 0 
              ? "You haven't uploaded any documents yet."
              : "No documents match your current filters."
            }
          </p>
          {documents.length === 0 && (
            <Link
              to="/analyze"
              className="btn-primary btn-hover inline-flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Your First Document</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getFileIcon(doc.originalName)}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.originalName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{doc.analysis.documentType}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.uploadDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(doc.analysis.risks.riskLevel)}`}>
                    {doc.analysis.risks.riskLevel} RISK
                  </span>
                  <div className="flex space-x-1">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{doc.analysis.risks.totalRisks}</div>
                    <div className="text-gray-500">Risks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{doc.analysis.entities.persons.length + doc.analysis.entities.organizations.length}</div>
                    <div className="text-gray-500">Entities</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900 capitalize">{doc.analysis.sentiment.label}</div>
                    <div className="text-gray-500">Sentiment</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList; 