const natural = require('natural');
const NLPService = require('./nlpService');

class ComparisonService {
  constructor() {
    this.nlpService = new NLPService();
    this.tokenizer = new natural.WordTokenizer();
  }

  async compareDocuments(documents) {
    try {
      if (documents.length < 2) {
        throw new Error('At least 2 documents are required for comparison');
      }

      const comparison = {
        documents: documents.map(doc => ({
          id: doc.id,
          name: doc.originalName,
          type: doc.analysis.documentType
        })),
        similarities: await this.findSimilarities(documents),
        differences: await this.findDifferences(documents),
        riskComparison: await this.compareRisks(documents),
        entityComparison: await this.compareEntities(documents),
        summary: await this.generateComparisonSummary(documents)
      };

      return comparison;
    } catch (error) {
      console.error('Document comparison error:', error);
      throw new Error(`Comparison failed: ${error.message}`);
    }
  }

  async findSimilarities(documents) {
    try {
      const similarities = [];
      const texts = documents.map(doc => doc.textContent);

      // Compare each pair of documents
      for (let i = 0; i < documents.length; i++) {
        for (let j = i + 1; j < documents.length; j++) {
          const similarity = await this.calculateSimilarity(texts[i], texts[j]);
          similarities.push({
            doc1: documents[i].originalName,
            doc2: documents[j].originalName,
            similarityScore: similarity.score,
            commonKeywords: similarity.commonKeywords,
            commonEntities: similarity.commonEntities
          });
        }
      }

      return similarities;
    } catch (error) {
      console.error('Similarity analysis error:', error);
      return [];
    }
  }

  async findDifferences(documents) {
    try {
      const differences = [];
      const texts = documents.map(doc => doc.textContent);

      for (let i = 0; i < documents.length; i++) {
        for (let j = i + 1; j < documents.length; j++) {
          const difference = await this.calculateDifferences(texts[i], texts[j]);
          differences.push({
            doc1: documents[i].originalName,
            doc2: documents[j].originalName,
            uniqueKeywords1: difference.uniqueKeywords1,
            uniqueKeywords2: difference.uniqueKeywords2,
            uniqueEntities1: difference.uniqueEntities1,
            uniqueEntities2: difference.uniqueEntities2,
            structuralDifferences: difference.structuralDifferences
          });
        }
      }

      return differences;
    } catch (error) {
      console.error('Difference analysis error:', error);
      return [];
    }
  }

  async compareRisks(documents) {
    try {
      const riskComparison = {
        overallRiskLevels: documents.map(doc => ({
          name: doc.originalName,
          riskLevel: doc.analysis.risks.riskLevel,
          totalRisks: doc.analysis.risks.totalRisks
        })),
        commonRisks: this.findCommonRisks(documents),
        uniqueRisks: this.findUniqueRisks(documents),
        riskTrends: this.analyzeRiskTrends(documents)
      };

      return riskComparison;
    } catch (error) {
      console.error('Risk comparison error:', error);
      return {
        overallRiskLevels: [],
        commonRisks: [],
        uniqueRisks: [],
        riskTrends: []
      };
    }
  }

  async compareEntities(documents) {
    try {
      const entityComparison = {
        commonEntities: this.findCommonEntities(documents),
        uniqueEntities: this.findUniqueEntities(documents),
        entityFrequency: this.calculateEntityFrequency(documents)
      };

      return entityComparison;
    } catch (error) {
      console.error('Entity comparison error:', error);
      return {
        commonEntities: {},
        uniqueEntities: {},
        entityFrequency: {}
      };
    }
  }

  async calculateSimilarity(text1, text2) {
    try {
      // Tokenize texts
      const tokens1 = this.tokenizer.tokenize(text1.toLowerCase());
      const tokens2 = this.tokenizer.tokenize(text2.toLowerCase());

      // Create word frequency maps
      const freq1 = this.createFrequencyMap(tokens1);
      const freq2 = this.createFrequencyMap(tokens2);

      // Calculate Jaccard similarity
      const intersection = this.getIntersection(freq1, freq2);
      const union = this.getUnion(freq1, freq2);
      const jaccardSimilarity = intersection.size / union.size;

      // Find common keywords
      const commonKeywords = Array.from(intersection).slice(0, 10);

      // Find common entities
      const entities1 = await this.nlpService.extractEntities(text1);
      const entities2 = await this.nlpService.extractEntities(text2);
      const commonEntities = this.findCommonEntities([{ analysis: { entities: entities1 } }, { analysis: { entities: entities2 } }]);

      return {
        score: jaccardSimilarity,
        commonKeywords,
        commonEntities
      };
    } catch (error) {
      console.error('Similarity calculation error:', error);
      return { score: 0, commonKeywords: [], commonEntities: {} };
    }
  }

  async calculateDifferences(text1, text2) {
    try {
      const tokens1 = this.tokenizer.tokenize(text1.toLowerCase());
      const tokens2 = this.tokenizer.tokenize(text2.toLowerCase());

      const freq1 = this.createFrequencyMap(tokens1);
      const freq2 = this.createFrequencyMap(tokens2);

      // Find unique keywords
      const uniqueKeywords1 = Array.from(freq1.keys()).filter(word => !freq2.has(word)).slice(0, 10);
      const uniqueKeywords2 = Array.from(freq2.keys()).filter(word => !freq1.has(word)).slice(0, 10);

      // Find unique entities
      const entities1 = await this.nlpService.extractEntities(text1);
      const entities2 = await this.nlpService.extractEntities(text2);
      const uniqueEntities1 = this.findUniqueEntities([{ analysis: { entities: entities1 } }, { analysis: { entities: entities2 } }]);
      const uniqueEntities2 = this.findUniqueEntities([{ analysis: { entities: entities2 } }, { analysis: { entities: entities1 } }]);

      // Structural differences
      const structuralDifferences = this.analyzeStructuralDifferences(text1, text2);

      return {
        uniqueKeywords1,
        uniqueKeywords2,
        uniqueEntities1,
        uniqueEntities2,
        structuralDifferences
      };
    } catch (error) {
      console.error('Difference calculation error:', error);
      return {
        uniqueKeywords1: [],
        uniqueKeywords2: [],
        uniqueEntities1: {},
        uniqueEntities2: {},
        structuralDifferences: []
      };
    }
  }

  findCommonRisks(documents) {
    try {
      const allRisks = documents.map(doc => doc.analysis.risks.riskKeywords).flat();
      const riskCount = {};
      
      allRisks.forEach(risk => {
        riskCount[risk] = (riskCount[risk] || 0) + 1;
      });

      return Object.entries(riskCount)
        .filter(([_, count]) => count > 1)
        .map(([risk, count]) => ({ risk, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Common risks analysis error:', error);
      return [];
    }
  }

  findUniqueRisks(documents) {
    try {
      const uniqueRisks = {};
      
      documents.forEach(doc => {
        const docRisks = doc.analysis.risks.riskKeywords;
        const otherRisks = documents
          .filter(other => other.id !== doc.id)
          .map(other => other.analysis.risks.riskKeywords)
          .flat();
        
        uniqueRisks[doc.originalName] = docRisks.filter(risk => !otherRisks.includes(risk));
      });

      return uniqueRisks;
    } catch (error) {
      console.error('Unique risks analysis error:', error);
      return {};
    }
  }

  analyzeRiskTrends(documents) {
    try {
      const riskTrends = [];
      const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
      
      riskLevels.forEach(level => {
        const docsWithLevel = documents.filter(doc => doc.analysis.risks.riskLevel === level);
        riskTrends.push({
          riskLevel: level,
          count: docsWithLevel.length,
          percentage: (docsWithLevel.length / documents.length) * 100
        });
      });

      return riskTrends;
    } catch (error) {
      console.error('Risk trends analysis error:', error);
      return [];
    }
  }

  findCommonEntities(documents) {
    try {
      const allEntities = {};
      
      documents.forEach(doc => {
        Object.entries(doc.analysis.entities).forEach(([type, entities]) => {
          if (!allEntities[type]) allEntities[type] = {};
          entities.forEach(entity => {
            allEntities[type][entity] = (allEntities[type][entity] || 0) + 1;
          });
        });
      });

      const commonEntities = {};
      Object.entries(allEntities).forEach(([type, entities]) => {
        commonEntities[type] = Object.entries(entities)
          .filter(([_, count]) => count > 1)
          .map(([entity, count]) => ({ entity, count }))
          .sort((a, b) => b.count - a.count);
      });

      return commonEntities;
    } catch (error) {
      console.error('Common entities analysis error:', error);
      return {};
    }
  }

  findUniqueEntities(documents) {
    try {
      const uniqueEntities = {};
      
      documents.forEach(doc => {
        const docEntities = doc.analysis.entities;
        const otherEntities = documents
          .filter(other => other.id !== doc.id)
          .map(other => other.analysis.entities);
        
        uniqueEntities[doc.originalName] = {};
        Object.entries(docEntities).forEach(([type, entities]) => {
          const otherEntitiesOfType = otherEntities
            .map(other => other[type] || [])
            .flat();
          uniqueEntities[doc.originalName][type] = entities.filter(entity => !otherEntitiesOfType.includes(entity));
        });
      });

      return uniqueEntities;
    } catch (error) {
      console.error('Unique entities analysis error:', error);
      return {};
    }
  }

  calculateEntityFrequency(documents) {
    try {
      const frequency = {};
      
      documents.forEach(doc => {
        Object.entries(doc.analysis.entities).forEach(([type, entities]) => {
          if (!frequency[type]) frequency[type] = {};
          entities.forEach(entity => {
            frequency[type][entity] = (frequency[type][entity] || 0) + 1;
          });
        });
      });

      return frequency;
    } catch (error) {
      console.error('Entity frequency calculation error:', error);
      return {};
    }
  }

  async generateComparisonSummary(documents) {
    try {
      const summary = {
        totalDocuments: documents.length,
        averageRiskLevel: this.calculateAverageRiskLevel(documents),
        mostCommonRisks: this.findCommonRisks(documents).slice(0, 5),
        documentTypes: this.getDocumentTypeDistribution(documents),
        keyInsights: await this.generateKeyInsights(documents)
      };

      return summary;
    } catch (error) {
      console.error('Comparison summary error:', error);
      return {
        totalDocuments: documents.length,
        averageRiskLevel: 'MEDIUM',
        mostCommonRisks: [],
        documentTypes: {},
        keyInsights: []
      };
    }
  }

  createFrequencyMap(tokens) {
    const freq = new Map();
    tokens.forEach(token => {
      if (token.length > 3) {
        freq.set(token, (freq.get(token) || 0) + 1);
      }
    });
    return freq;
  }

  getIntersection(freq1, freq2) {
    const intersection = new Set();
    freq1.forEach((_, key) => {
      if (freq2.has(key)) {
        intersection.add(key);
      }
    });
    return intersection;
  }

  getUnion(freq1, freq2) {
    const union = new Set();
    freq1.forEach((_, key) => union.add(key));
    freq2.forEach((_, key) => union.add(key));
    return union;
  }

  analyzeStructuralDifferences(text1, text2) {
    try {
      const differences = [];
      
      // Compare sentence count
      const sentences1 = text1.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentences2 = text2.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (Math.abs(sentences1.length - sentences2.length) > 5) {
        differences.push(`Document 1 has ${sentences1.length} sentences while Document 2 has ${sentences2.length} sentences`);
      }

      // Compare average sentence length
      const avgLength1 = sentences1.reduce((sum, s) => sum + s.length, 0) / sentences1.length;
      const avgLength2 = sentences2.reduce((sum, s) => sum + s.length, 0) / sentences2.length;
      
      if (Math.abs(avgLength1 - avgLength2) > 50) {
        differences.push(`Document 1 has longer sentences (${Math.round(avgLength1)} chars) compared to Document 2 (${Math.round(avgLength2)} chars)`);
      }

      return differences;
    } catch (error) {
      console.error('Structural differences analysis error:', error);
      return [];
    }
  }

  calculateAverageRiskLevel(documents) {
    try {
      const riskScores = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      const totalScore = documents.reduce((sum, doc) => sum + riskScores[doc.analysis.risks.riskLevel], 0);
      const averageScore = totalScore / documents.length;
      
      if (averageScore <= 1.5) return 'LOW';
      if (averageScore <= 2.5) return 'MEDIUM';
      return 'HIGH';
    } catch (error) {
      return 'MEDIUM';
    }
  }

  getDocumentTypeDistribution(documents) {
    try {
      const distribution = {};
      documents.forEach(doc => {
        const type = doc.analysis.documentType;
        distribution[type] = (distribution[type] || 0) + 1;
      });
      return distribution;
    } catch (error) {
      return {};
    }
  }

  async generateKeyInsights(documents) {
    try {
      const insights = [];
      
      // Risk level insights
      const highRiskDocs = documents.filter(doc => doc.analysis.risks.riskLevel === 'HIGH');
      if (highRiskDocs.length > 0) {
        insights.push(`${highRiskDocs.length} document(s) have high risk levels and require immediate attention`);
      }

      // Common patterns
      const commonRisks = this.findCommonRisks(documents);
      if (commonRisks.length > 0) {
        insights.push(`Most common risk keywords: ${commonRisks.slice(0, 3).map(r => r.risk).join(', ')}`);
      }

      // Document type insights
      const typeDistribution = this.getDocumentTypeDistribution(documents);
      const mostCommonType = Object.entries(typeDistribution).sort((a, b) => b[1] - a[1])[0];
      if (mostCommonType) {
        insights.push(`Most common document type: ${mostCommonType[0]} (${mostCommonType[1]} documents)`);
      }

      return insights;
    } catch (error) {
      return ['Analysis completed successfully'];
    }
  }
}

module.exports = ComparisonService; 