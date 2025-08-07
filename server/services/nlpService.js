const natural = require('natural');
const nlp = require('compromise');

class NLPService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.riskKeywords = [
      'liability', 'damages', 'penalty', 'breach', 'termination', 'default',
      'indemnification', 'warranty', 'guarantee', 'force majeure', 'arbitration',
      'confidentiality', 'non-compete', 'liquidated damages', 'specific performance',
      'injunction', 'cease and desist', 'material breach', 'cure period'
    ];
    
    this.legalEntities = [
      'person', 'organization', 'date', 'money', 'percent', 'email', 'phone'
    ];
  }

  async analyzeDocument(text) {
    try {
      const analysis = {
        summary: await this.generateSummary(text),
        entities: await this.extractEntities(text),
        risks: await this.analyzeRisks(text),
        simplified: await this.simplifyText(text),
        keywords: await this.extractKeywords(text),
        termsAndConditions: await this.extractTermsAndConditions(text),
        sentiment: await this.analyzeSentiment(text),
        documentType: await this.classifyDocument(text)
      };

      return analysis;
    } catch (error) {
      console.error('Document analysis error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  async generateSummary(text, maxLength = 500) {
    try {
      // Split text into sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      if (sentences.length === 0) {
        return 'No content available for summarization.';
      }

      // Calculate sentence scores based on word frequency
      const wordFreq = {};
      const words = this.tokenizer.tokenize(text.toLowerCase());
      
      words.forEach(word => {
        if (word.length > 3) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });

      // Legal terms that should be prioritized
      const legalTerms = [
        'agreement', 'contract', 'party', 'parties', 'obligation', 'liability', 
        'damages', 'breach', 'termination', 'amendment', 'governing law',
        'jurisdiction', 'dispute', 'arbitration', 'confidentiality', 'indemnification',
        'warranty', 'representation', 'covenant', 'condition', 'precedent'
      ];

      const sentenceScores = sentences.map(sentence => {
        const sentenceWords = this.tokenizer.tokenize(sentence.toLowerCase());
        let score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
        
        // Boost score for sentences containing legal terms
        legalTerms.forEach(term => {
          if (sentence.toLowerCase().includes(term)) {
            score += 10;
          }
        });

        return { sentence: sentence.trim(), score };
      });

      // Sort by score and take top sentences
      sentenceScores.sort((a, b) => b.score - a.score);
      
      let summary = '';
      let sentenceCount = 0;
      const maxSentences = 8; // Limit to 8 most important sentences
      
      for (const item of sentenceScores) {
        if (sentenceCount < maxSentences && (summary + item.sentence).length <= maxLength) {
          summary += (summary ? ' ' : '') + item.sentence + '.';
          sentenceCount++;
        } else {
          break;
        }
      }

      return summary.trim() || 'Summary could not be generated.';
    } catch (error) {
      return 'Summary generation failed.';
    }
  }

  async extractEntities(text) {
    try {
      const doc = nlp(text);
      
      // Helper function to safely extract entities
      const safeExtract = (method, transform = (item) => item.text) => {
        try {
          const result = method.call(doc);
          if (result && typeof result.json === 'function') {
            return result.json().map(transform).filter(item => item && item.trim().length > 0);
          }
          return [];
        } catch (err) {
          console.warn(`Entity extraction warning for ${method.name}:`, err.message);
          return [];
        }
      };

      const entities = {
        persons: safeExtract(doc.persons),
        organizations: safeExtract(doc.organizations),
        dates: safeExtract(doc.dates),
        money: safeExtract(doc.values, (v) => v.unit ? v.text : null).filter(Boolean),
        emails: safeExtract(doc.emails),
        phones: safeExtract(doc.phoneNumbers),
        places: safeExtract(doc.places)
      };

      // Clean and deduplicate entities
      Object.keys(entities).forEach(key => {
        entities[key] = [...new Set(entities[key].filter(item => item && item.trim().length > 0))];
      });

      return entities;
    } catch (error) {
      console.error('Entity extraction error:', error);
      return {
        persons: [],
        organizations: [],
        dates: [],
        money: [],
        emails: [],
        phones: [],
        places: []
      };
    }
  }

  async analyzeRisks(text) {
    try {
      const risks = [];
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach((sentence, index) => {
        const lowerSentence = sentence.toLowerCase();
        
        this.riskKeywords.forEach(keyword => {
          if (lowerSentence.includes(keyword.toLowerCase())) {
            risks.push({
              keyword: keyword,
              sentence: sentence.trim(),
              position: index,
              severity: this.calculateRiskSeverity(keyword, sentence)
            });
          }
        });
      });

      // Group risks by keyword
      const groupedRisks = {};
      risks.forEach(risk => {
        if (!groupedRisks[risk.keyword]) {
          groupedRisks[risk.keyword] = [];
        }
        groupedRisks[risk.keyword].push(risk);
      });

      return {
        totalRisks: risks.length,
        riskKeywords: Object.keys(groupedRisks),
        riskDetails: groupedRisks,
        riskLevel: this.calculateOverallRiskLevel(risks)
      };
    } catch (error) {
      console.error('Risk analysis error:', error);
      return {
        totalRisks: 0,
        riskKeywords: [],
        riskDetails: {},
        riskLevel: 'LOW'
      };
    }
  }

  async simplifyText(text) {
    try {
      // Replace complex legal terms with simpler alternatives
      const simplifications = {
        'hereinafter': 'from now on',
        'whereas': 'while',
        'pursuant to': 'according to',
        'in accordance with': 'following',
        'notwithstanding': 'despite',
        'hereby': 'by this',
        'herein': 'in this document',
        'thereof': 'of that',
        'therein': 'in that',
        'thereby': 'by that',
        'whereby': 'by which',
        'wherein': 'in which',
        'heretofore': 'before now',
        'hereinafter': 'from now on',
        'aforesaid': 'mentioned above',
        'aforementioned': 'mentioned above'
      };

      let simplified = text;
      Object.entries(simplifications).forEach(([complex, simple]) => {
        const regex = new RegExp(`\\b${complex}\\b`, 'gi');
        simplified = simplified.replace(regex, simple);
      });

      // Break down long sentences
      const sentences = simplified.split(/[.!?]+/);
      const brokenSentences = sentences.map(sentence => {
        if (sentence.length > 100) {
          return this.breakLongSentence(sentence);
        }
        return sentence;
      });

      return brokenSentences.join('. ').trim();
    } catch (error) {
      console.error('Text simplification error:', error);
      return text;
    }
  }

  async extractKeywords(text) {
    try {
      this.tfidf.addDocument(text);
      const terms = this.tfidf.listTerms(0);
      
      return terms
        .slice(0, 20)
        .filter(term => term.term.length > 3)
        .map(term => ({
          word: term.term,
          score: typeof term.score === 'number' ? term.score : 0
        }));
    } catch (error) {
      console.error('Keyword extraction error:', error);
      return [];
    }
  }

  async extractTermsAndConditions(text) {
    try {
      const termsAndConditions = [];
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      const termsKeywords = [
        'terms and conditions', 'terms of service', 'terms of use', 'conditions',
        'obligation', 'responsibility', 'liability', 'warranty', 'guarantee',
        'shall', 'must', 'will', 'agree', 'accept', 'comply', 'violation',
        'penalty', 'fine', 'termination', 'breach', 'default'
      ];

      sentences.forEach((sentence, index) => {
        const lowerSentence = sentence.toLowerCase();
        const hasTermsKeyword = termsKeywords.some(keyword => 
          lowerSentence.includes(keyword)
        );

        if (hasTermsKeyword) {
          termsAndConditions.push({
            sentence: sentence.trim(),
            position: index,
            type: this.categorizeTerm(sentence)
          });
        }
      });

      return termsAndConditions;
    } catch (error) {
      console.error('Terms and conditions extraction error:', error);
      return [];
    }
  }

  categorizeTerm(sentence) {
    const lowerSentence = sentence.toLowerCase();
    
    if (lowerSentence.includes('liability') || lowerSentence.includes('damages')) {
      return 'Liability';
    } else if (lowerSentence.includes('termination') || lowerSentence.includes('breach')) {
      return 'Termination';
    } else if (lowerSentence.includes('warranty') || lowerSentence.includes('guarantee')) {
      return 'Warranty';
    } else if (lowerSentence.includes('obligation') || lowerSentence.includes('responsibility')) {
      return 'Obligation';
    } else if (lowerSentence.includes('penalty') || lowerSentence.includes('fine')) {
      return 'Penalty';
    } else {
      return 'General';
    }
  }

  async analyzeSentiment(text) {
    try {
      const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
      const words = this.tokenizer.tokenize(text);
      const sentiment = analyzer.getSentiment(words);
      
      return {
        score: sentiment,
        label: sentiment > 0 ? 'positive' : sentiment < 0 ? 'negative' : 'neutral',
        magnitude: Math.abs(sentiment)
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { score: 0, label: 'neutral', magnitude: 0 };
    }
  }

  async classifyDocument(text) {
    try {
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('agreement') || lowerText.includes('contract')) {
        return 'Contract/Agreement';
      } else if (lowerText.includes('policy') || lowerText.includes('terms')) {
        return 'Policy/Terms';
      } else if (lowerText.includes('notice') || lowerText.includes('letter')) {
        return 'Notice/Letter';
      } else if (lowerText.includes('clause') || lowerText.includes('section')) {
        return 'Legal Clause';
      } else {
        return 'Legal Document';
      }
    } catch (error) {
      return 'Legal Document';
    }
  }

  calculateRiskSeverity(keyword, sentence) {
    const highRiskKeywords = ['liability', 'damages', 'penalty', 'breach'];
    const mediumRiskKeywords = ['termination', 'default', 'warranty'];
    
    if (highRiskKeywords.includes(keyword.toLowerCase())) {
      return 'HIGH';
    } else if (mediumRiskKeywords.includes(keyword.toLowerCase())) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  calculateOverallRiskLevel(risks) {
    if (risks.length === 0) return 'LOW';
    
    const highRisks = risks.filter(r => r.severity === 'HIGH').length;
    const mediumRisks = risks.filter(r => r.severity === 'MEDIUM').length;
    
    if (highRisks > 3 || (highRisks > 1 && mediumRisks > 5)) {
      return 'HIGH';
    } else if (highRisks > 0 || mediumRisks > 3) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  breakLongSentence(sentence) {
    const clauses = sentence.split(/[,;]/);
    if (clauses.length > 1) {
      return clauses.join('. ');
    }
    return sentence;
  }
}

module.exports = NLPService; 