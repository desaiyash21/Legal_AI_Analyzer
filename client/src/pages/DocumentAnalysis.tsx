import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Upload, 
  FileText, 
  Download,
  Eye,
  Brain,
  Shield,
  Clock,
  X
} from 'lucide-react';
import { uploadWithProgress } from '../services/api';
import { Document } from '../types';
import AnalysisResults from '../components/AnalysisResults';

const DocumentAnalysis: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<Document | null>(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setAnalysisResult(null);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadWithProgress(uploadedFile, (progress) => {
        setUploadProgress(progress);
      });

      setAnalysisResult(result.document);
      toast.success('Document uploaded and analyzed successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? '📄' : '📝';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Document Analysis
        </h1>
        <p className="text-gray-600">
          Upload your legal documents for AI-powered analysis and insights
        </p>
      </div>

      {!analysisResult ? (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="card">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : isDragReject
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop the file here...</p>
              ) : isDragReject ? (
                <div>
                  <p className="text-red-600 font-medium mb-2">Invalid file type</p>
                  <p className="text-gray-600">Please upload a PDF or DOCX file</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF or DOCX files up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File Preview */}
          {uploadedFile && (
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getFileIcon(uploadedFile.name)}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{uploadedFile.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {uploadedFile && (
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary btn-hover flex items-center space-x-2 px-8 py-3"
              >
                {isUploading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Uploading... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Analyze Document</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="card">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Processing document with AI...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{getFileIcon(analysisResult.originalName)}</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {analysisResult.originalName}
                </h2>
                <p className="text-sm text-gray-500">
                  Analyzed on {new Date(analysisResult.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/documents/${analysisResult.id}`)}
                className="btn-secondary btn-hover flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => {
                  // Handle download report
                  toast.success('Report download started');
                }}
                className="btn-primary btn-hover flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          <AnalysisResults document={analysisResult} />

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleClear}
              className="btn-secondary btn-hover"
            >
              Analyze Another Document
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="btn-primary btn-hover"
            >
              View All Documents
            </button>
          </div>
        </div>
      )}

      {/* Features Preview */}
      {!analysisResult && !uploadedFile && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What Our AI Analyzes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Summarization</h3>
              <p className="text-gray-600 text-sm">
                Extract key points and generate concise summaries of complex legal documents
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Risk Detection</h3>
              <p className="text-gray-600 text-sm">
                Identify potential legal risks, problematic clauses, and areas requiring attention
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Entity Extraction</h3>
              <p className="text-gray-600 text-sm">
                Automatically extract key entities like parties, dates, amounts, and contact information
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysis; 