import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { 
  Upload, 
  GitCompare, 
  BarChart3,
  X,
  Brain,
  Shield
} from 'lucide-react';
import { uploadMultipleDocuments, compareDocuments, getAllDocuments } from '../services/api';
import { Document, Comparison as ComparisonType } from '../types';

const Comparison: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonType | null>(null);

  useEffect(() => {
    fetchExistingDocuments();
  }, []);

  const fetchExistingDocuments = async () => {
    try {
      const docs = await getAllDocuments();
      setExistingDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const result = await uploadMultipleDocuments(uploadedFiles);
      toast.success(`${result.results.length} documents uploaded successfully`);
      
      // Refresh existing documents
      await fetchExistingDocuments();
      setUploadedFiles([]);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompare = async () => {
    if (selectedDocuments.length < 2) {
      toast.error('Please select at least 2 documents to compare');
      return;
    }

    setIsComparing(true);

    try {
      const result = await compareDocuments(selectedDocuments);
      setComparisonResult(result);
      toast.success('Document comparison completed successfully!');
    } catch (error: any) {
      console.error('Comparison error:', error);
      toast.error(error.response?.data?.error || 'Failed to compare documents');
    } finally {
      setIsComparing(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleDocument = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
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

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Document Comparison
        </h1>
        <p className="text-gray-600">
          Compare multiple legal documents to identify similarities, differences, and insights
        </p>
      </div>

      {!comparisonResult ? (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Documents</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF or DOCX files up to 10MB (max 5 files)
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Files to Upload:</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{getFileIcon(file.name)}</div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-4 btn-primary btn-hover"
                >
                  {isUploading ? 'Uploading...' : 'Upload Documents'}
                </button>
              </div>
            )}
          </div>

          {/* Select Existing Documents */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Existing Documents</h2>
            {existingDocuments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No existing documents found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {existingDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleToggleDocument(doc.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedDocuments.includes(doc.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-xl">{getFileIcon(doc.originalName)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.originalName}</p>
                        <p className="text-sm text-gray-500">{doc.analysis.documentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(doc.analysis.risks.riskLevel)}`}>
                        {doc.analysis.risks.riskLevel} RISK
                      </span>
                      <div className="text-sm text-gray-500">
                        {doc.analysis.risks.totalRisks} risks
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compare Button */}
          {selectedDocuments.length >= 2 && (
            <div className="flex justify-center">
              <button
                onClick={handleCompare}
                disabled={isComparing}
                className="btn-primary btn-hover flex items-center space-x-2 px-8 py-3"
              >
                {isComparing ? (
                  <>
                    <div className="spinner"></div>
                    <span>Comparing...</span>
                  </>
                ) : (
                  <>
                    <GitCompare className="w-5 h-5" />
                    <span>Compare {selectedDocuments.length} Documents</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Features Preview */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What You Can Compare
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Risk Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Compare risk levels and identify common risk patterns across documents
                </p>
              </div>
              <div className="card text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Similarities</h3>
                <p className="text-gray-600 text-sm">
                  Find common clauses, terms, and entities across multiple documents
                </p>
              </div>
              <div className="card text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Differences</h3>
                <p className="text-gray-600 text-sm">
                  Identify unique elements and structural differences between documents
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Comparison Results */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Comparison Results</h2>
              <p className="text-gray-600">
                Comparing {comparisonResult.documents.length} documents
              </p>
            </div>
            <button
              onClick={() => setComparisonResult(null)}
              className="btn-secondary btn-hover"
            >
              New Comparison
            </button>
          </div>

          {/* Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{comparisonResult.summary.totalDocuments}</div>
                <div className="text-sm text-gray-600">Documents Compared</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{comparisonResult.summary.averageRiskLevel}</div>
                <div className="text-sm text-gray-600">Average Risk Level</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{comparisonResult.summary.mostCommonRisks.length}</div>
                <div className="text-sm text-gray-600">Common Risks</div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-2">
              {comparisonResult.summary.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Similarities */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Similarities Analysis</h3>
            <div className="space-y-4">
              {comparisonResult.similarities.map((similarity, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {similarity.doc1} vs {similarity.doc2}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Similarity Score</p>
                      <p className="font-semibold text-blue-600">
                        {(similarity.similarityScore * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Common Keywords</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {similarity.commonKeywords.slice(0, 5).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Comparison */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Comparison</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonResult.riskComparison.overallRiskLevels.map((risk, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{risk.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(risk.riskLevel)}`}>
                        {risk.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{risk.totalRisks} total risks</p>
                  </div>
                ))}
              </div>
              
              {comparisonResult.riskComparison.commonRisks.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Common Risks Across Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {comparisonResult.riskComparison.commonRisks.map((risk, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                        {risk.risk} ({risk.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparison; 