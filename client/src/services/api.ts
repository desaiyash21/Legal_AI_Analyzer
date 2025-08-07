import axios, { AxiosResponse } from 'axios';
import { 
  Document, 
  UploadResponse, 
  Comparison, 
  DocumentStats, 
  ApiError 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add loading state or auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Document upload and analysis
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('document', file);

  const response: AxiosResponse<UploadResponse> = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const uploadMultipleDocuments = async (files: File[]): Promise<any> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('documents', file);
  });

  const response = await api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Document management
export const getAllDocuments = async (): Promise<Document[]> => {
  const response: AxiosResponse<{ documents: Document[] }> = await api.get('/documents');
  return response.data.documents;
};

export const getDocumentById = async (id: string): Promise<Document> => {
  const response: AxiosResponse<{ document: Document }> = await api.get(`/documents/${id}`);
  return response.data.document;
};

export const deleteDocument = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete document');
};

export const getDocumentStats = async (): Promise<DocumentStats> => {
  const response: AxiosResponse<{ stats: DocumentStats }> = await api.get('/documents/stats/overview');
  return response.data.stats;
};

// Analysis operations
export const compareDocuments = async (documentIds: string[]): Promise<Comparison> => {
  const response: AxiosResponse<{ comparison: Comparison }> = await api.post('/analysis/compare', {
    documentIds,
  });
  return response.data.comparison;
};

export const reanalyzeDocument = async (
  id: string, 
  analysisType: string, 
  parameters?: any
): Promise<any> => {
  const response = await api.post(`/analysis/reanalyze/${id}`, {
    analysisType,
    parameters,
  });
  return response.data;
};

export const getRiskAnalysis = async (id: string): Promise<any> => {
  const response = await api.get(`/analysis/risk/${id}`);
  return response.data;
};

export const getSimplifiedVersion = async (id: string): Promise<any> => {
  const response = await api.get(`/analysis/simplified/${id}`);
  return response.data;
};

export const exportAnalysis = async (id: string, format: string): Promise<any> => {
  const response = await api.get(`/analysis/export/${id}/${format}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Report generation
export const downloadReport = async (id: string): Promise<Blob> => {
  const response = await api.get(`/documents/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Error handling utility
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      error: error.response.data.error || 'Server error',
      message: error.response.data.message,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      error: 'Network error',
      message: 'Unable to connect to server',
    };
  } else {
    // Something else happened
    return {
      error: 'Unknown error',
      message: error.message,
    };
  }
};

// File upload with progress tracking
export const uploadWithProgress = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('document', file);

    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    })
      .then((response) => resolve(response.data))
      .catch(reject);
  });
};

export default api; 