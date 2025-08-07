import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Brain, 
  Shield, 
  FileText, 
  GitCompare, 
  Download,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: Upload,
      title: 'Easy Document Upload',
      description: 'Drag and drop PDF or DOCX files for instant analysis. Support for multiple file formats.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced NLP algorithms extract key information, identify risks, and provide insights.',
    },
    {
      icon: Shield,
      title: 'Risk Detection',
      description: 'Automatically identify and highlight potential legal risks and problematic clauses.',
    },
    {
      icon: FileText,
      title: 'Smart Summarization',
      description: 'Get concise summaries of complex legal documents with key points extracted.',
    },
    {
      icon: GitCompare,
      title: 'Document Comparison',
      description: 'Compare multiple documents to identify similarities, differences, and inconsistencies.',
    },
    {
      icon: Download,
      title: 'Report Generation',
      description: 'Download comprehensive analysis reports in multiple formats for easy sharing.',
    },
  ];

  const benefits = [
    'Save hours of manual document review time',
    'Reduce human error in legal analysis',
    'Identify hidden risks and opportunities',
    'Improve consistency across document reviews',
    'Generate professional reports instantly',
    'Compare documents for compliance and consistency',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI-Powered Legal
              <span className="block text-blue-200">Document Analysis</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Transform your legal document review process with intelligent AI that extracts insights, 
              identifies risks, and provides comprehensive analysis in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/analyze"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Start Analyzing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/documents"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                <FileText className="w-5 h-5 mr-2" />
                View Documents
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Legal Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive legal document analysis 
              with advanced natural language processing capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our AI Legal Analyzer?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Streamline your legal document review process with cutting-edge AI technology 
                that delivers accurate, comprehensive analysis in minutes, not hours.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Fast Processing</h3>
                      <p className="text-sm text-gray-600">Analyze documents in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Accurate Results</h3>
                      <p className="text-sm text-gray-600">High precision AI algorithms</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Detailed Insights</h3>
                      <p className="text-sm text-gray-600">Comprehensive analysis reports</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Legal Document Review?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of legal professionals who are already using our AI-powered 
            platform to streamline their document analysis workflow.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 