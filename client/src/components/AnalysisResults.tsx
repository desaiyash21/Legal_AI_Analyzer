import React, { useState } from 'react';
import { 
  AlertTriangle, 
  DollarSign, 
  Mail, 
  Phone, 
  User, 
  Building, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Document } from '../types';

interface AnalysisResultsProps {
  document: Document;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ document }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary', 'risks']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('summary')}
        >
          <h3 className="text-lg font-semibold text-gray-900">Document Summary</h3>
          {expandedSections.includes('summary') ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
        {expandedSections.includes('summary') && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{document.analysis.summary}</p>
          </div>
        )}
      </div>

      {/* Risk Analysis */}
      <div className="card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('risks')}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Risk Analysis</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(document.analysis.risks.riskLevel)}`}>
              {document.analysis.risks.riskLevel} RISK
            </span>
            {expandedSections.includes('risks') ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
        {expandedSections.includes('risks') && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{document.analysis.risks.totalRisks}</div>
                <div className="text-sm text-gray-600">Total Risks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{document.analysis.risks.riskKeywords.length}</div>
                <div className="text-sm text-gray-600">Risk Keywords</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{document.analysis.documentType}</div>
                <div className="text-sm text-gray-600">Document Type</div>
              </div>
            </div>
            
            {document.analysis.risks.riskKeywords.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Risk Keywords Found:</h4>
                <div className="flex flex-wrap gap-2">
                  {document.analysis.risks.riskKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entities Section */}
      <div className="card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('entities')}
        >
          <h3 className="text-lg font-semibold text-gray-900">Extracted Entities</h3>
          {expandedSections.includes('entities') ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
        {expandedSections.includes('entities') && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Persons */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-gray-900">Persons</h4>
              </div>
              {document.analysis.entities.persons.length > 0 ? (
                <div className="space-y-1">
                  {document.analysis.entities.persons.map((person, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                      {person}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No persons identified</p>
              )}
            </div>

            {/* Organizations */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Building className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-gray-900">Organizations</h4>
              </div>
              {document.analysis.entities.organizations.length > 0 ? (
                <div className="space-y-1">
                  {document.analysis.entities.organizations.map((org, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                      {org}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No organizations identified</p>
              )}
            </div>

            {/* Dates */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-gray-900">Dates</h4>
              </div>
              {document.analysis.entities.dates.length > 0 ? (
                <div className="space-y-1">
                  {document.analysis.entities.dates.map((date, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                      {date}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No dates identified</p>
              )}
            </div>

            {/* Financial Information */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-4 h-4 text-yellow-600" />
                <h4 className="font-medium text-gray-900">Financial Information</h4>
              </div>
              {document.analysis.entities.money.length > 0 ? (
                <div className="space-y-1">
                  {document.analysis.entities.money.map((money, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                      {money}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No financial information identified</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Emails</span>
                  </div>
                  {document.analysis.entities.emails.length > 0 ? (
                    <div className="space-y-1">
                      {document.analysis.entities.emails.map((email, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                          {email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No emails found</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Phone Numbers</span>
                  </div>
                  {document.analysis.entities.phones.length > 0 ? (
                    <div className="space-y-1">
                      {document.analysis.entities.phones.map((phone, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                          {phone}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No phone numbers found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sentiment Analysis */}
      <div className="card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('sentiment')}
        >
          <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
          {expandedSections.includes('sentiment') ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
        {expandedSections.includes('sentiment') && (
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              {getSentimentIcon(document.analysis.sentiment.label)}
              <div>
                <span className="font-medium text-gray-900 capitalize">
                  {document.analysis.sentiment.label}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  Score: {document.analysis.sentiment.score.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('terms')}
        >
          <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
          {expandedSections.includes('terms') ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
        {expandedSections.includes('terms') && (
          <div className="mt-4">
            {document.analysis.termsAndConditions && document.analysis.termsAndConditions.length > 0 ? (
              <div className="space-y-4">
                {document.analysis.termsAndConditions.map((term, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                        {term.type}
                      </span>
                      <span className="text-xs text-gray-500">Position: {term.position}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{term.sentence}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No terms and conditions identified</p>
            )}
          </div>
        )}
      </div>

      {/* Keywords */}
      <div className="card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('keywords')}
        >
          <h3 className="text-lg font-semibold text-gray-900">Key Terms & Keywords</h3>
          {expandedSections.includes('keywords') ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
        {expandedSections.includes('keywords') && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {document.analysis.keywords && document.analysis.keywords.length > 0 ? (
                document.analysis.keywords.slice(0, 15).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    title={`Score: ${(keyword.score || 0).toFixed(2)}`}
                  >
                    {keyword.word}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No keywords extracted</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Simplified Version */}
      <div className="card">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('simplified')}
        >
          <h3 className="text-lg font-semibold text-gray-900">Simplified Version</h3>
          {expandedSections.includes('simplified') ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
        {expandedSections.includes('simplified') && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              {document.analysis.simplified.substring(0, 500)}
              {document.analysis.simplified.length > 500 && '...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults; 