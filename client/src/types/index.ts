export interface Document {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  textContent: string;
  analysis: Analysis;
  uploadDate: string;
  fileSize: number;
  documentType: string;
  riskLevel: string;
  totalRisks: number;
}

export interface Analysis {
  summary: string;
  entities: Entities;
  risks: RiskAnalysis;
  simplified: string;
  keywords: Keyword[];
  termsAndConditions: TermsAndCondition[];
  sentiment: Sentiment;
  documentType: string;
}

export interface TermsAndCondition {
  sentence: string;
  position: number;
  type: string;
}

export interface Entities {
  persons: string[];
  organizations: string[];
  dates: string[];
  money: string[];
  emails: string[];
  phones: string[];
  places: string[];
}

export interface RiskAnalysis {
  totalRisks: number;
  riskKeywords: string[];
  riskDetails: Record<string, RiskDetail[]>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RiskDetail {
  keyword: string;
  sentence: string;
  position: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Keyword {
  word: string;
  score: number;
}

export interface Sentiment {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  magnitude: number;
}

export interface Comparison {
  documents: ComparisonDocument[];
  similarities: Similarity[];
  differences: Difference[];
  riskComparison: RiskComparison;
  entityComparison: EntityComparison;
  summary: ComparisonSummary;
}

export interface ComparisonDocument {
  id: string;
  name: string;
  type: string;
}

export interface Similarity {
  doc1: string;
  doc2: string;
  similarityScore: number;
  commonKeywords: string[];
  commonEntities: Record<string, any>;
}

export interface Difference {
  doc1: string;
  doc2: string;
  uniqueKeywords1: string[];
  uniqueKeywords2: string[];
  uniqueEntities1: Record<string, any>;
  uniqueEntities2: Record<string, any>;
  structuralDifferences: string[];
}

export interface RiskComparison {
  overallRiskLevels: RiskLevelInfo[];
  commonRisks: CommonRisk[];
  uniqueRisks: Record<string, string[]>;
  riskTrends: RiskTrend[];
}

export interface RiskLevelInfo {
  name: string;
  riskLevel: string;
  totalRisks: number;
}

export interface CommonRisk {
  risk: string;
  count: number;
}

export interface RiskTrend {
  riskLevel: string;
  count: number;
  percentage: number;
}

export interface EntityComparison {
  commonEntities: Record<string, any>;
  uniqueEntities: Record<string, any>;
  entityFrequency: Record<string, any>;
}

export interface ComparisonSummary {
  totalDocuments: number;
  averageRiskLevel: string;
  mostCommonRisks: CommonRisk[];
  documentTypes: Record<string, number>;
  keyInsights: string[];
}

export interface UploadResponse {
  message: string;
  document: Document;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  averageRisks: number;
  totalSize: number;
  documentTypes: Array<{
    type: string;
    count: number;
  }>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface AnalysisHistory {
  id: number;
  analysisType: string;
  parameters: any;
  result: any;
  timestamp: string;
} 