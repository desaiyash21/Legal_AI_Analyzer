const fs = require('fs');
const path = require('path');

class ReportService {
  async generateReport(document) {
    try {
      const report = this.createReportContent(document);
      return report;
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  createReportContent(document) {
    const { originalName, uploadDate, analysis, fileSize } = document;
    
    const report = `
# Legal Document Analysis Report

## Document Information
- **File Name**: ${originalName}
- **Upload Date**: ${new Date(uploadDate).toLocaleDateString()}
- **File Size**: ${this.formatFileSize(fileSize)}
- **Document Type**: ${analysis.documentType}

## Executive Summary
${analysis.summary}

## Risk Analysis
**Overall Risk Level**: ${analysis.risks.riskLevel}
**Total Risk Items**: ${analysis.risks.totalRisks}

### Risk Keywords Found:
${analysis.risks.riskKeywords.map(keyword => `- ${keyword}`).join('\n')}

### High Priority Risks:
${this.getHighPriorityRisks(analysis.risks.riskDetails)}

## Key Entities Extracted

### Persons
${analysis.entities.persons.map(person => `- ${person}`).join('\n') || 'No persons identified'}

### Organizations
${analysis.entities.organizations.map(org => `- ${org}`).join('\n') || 'No organizations identified'}

### Dates
${analysis.entities.dates.map(date => `- ${date}`).join('\n') || 'No dates identified'}

### Financial Information
${analysis.entities.money.map(money => `- ${money}`).join('\n') || 'No financial information identified'}

### Contact Information
**Emails**: ${analysis.entities.emails.join(', ') || 'None found'}
**Phones**: ${analysis.entities.phones.join(', ') || 'None found'}

## Document Sentiment
- **Sentiment**: ${analysis.sentiment.label}
- **Score**: ${analysis.sentiment.score}
- **Magnitude**: ${analysis.sentiment.magnitude}

## Terms and Conditions
${analysis.termsAndConditions && analysis.termsAndConditions.length > 0 
  ? analysis.termsAndConditions.map(term => 
      `### ${term.type}\n"${term.sentence}"\n`
    ).join('\n')
  : 'No terms and conditions identified'
}

## Key Terms and Keywords
${analysis.keywords.slice(0, 10).map(kw => `- ${kw.word} (score: ${kw.score.toFixed(2)})`).join('\n')}

## Simplified Version
${analysis.simplified.substring(0, 500)}${analysis.simplified.length > 500 ? '...' : ''}

## Recommendations
${this.generateRecommendations(analysis)}

---
*Report generated on ${new Date().toLocaleString()}*
*AI Legal Document Analyzer*
    `;

    return report;
  }

  getHighPriorityRisks(riskDetails) {
    const highRisks = [];
    Object.entries(riskDetails).forEach(([keyword, risks]) => {
      const highSeverityRisks = risks.filter(risk => risk.severity === 'HIGH');
      if (highSeverityRisks.length > 0) {
        highRisks.push(`**${keyword}**: ${highSeverityRisks.length} high-risk instances`);
        highSeverityRisks.forEach(risk => {
          highRisks.push(`  - "${risk.sentence.substring(0, 100)}..."`);
        });
      }
    });
    return highRisks.length > 0 ? highRisks.join('\n') : 'No high-priority risks identified';
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Risk-based recommendations
    if (analysis.risks.riskLevel === 'HIGH') {
      recommendations.push('- **URGENT**: This document contains high-risk elements. Consider legal review before proceeding.');
    } else if (analysis.risks.riskLevel === 'MEDIUM') {
      recommendations.push('- **CAUTION**: This document contains moderate risks. Review key clauses carefully.');
    } else {
      recommendations.push('- **LOW RISK**: This document appears to have minimal risk factors.');
    }

    // Entity-based recommendations
    if (analysis.entities.persons.length === 0) {
      recommendations.push('- Consider identifying all parties involved in the document.');
    }

    if (analysis.entities.dates.length === 0) {
      recommendations.push('- Verify all important dates and deadlines are clearly stated.');
    }

    if (analysis.entities.money.length > 0) {
      recommendations.push('- Review all financial terms and ensure amounts are accurate.');
    }

    // Sentiment-based recommendations
    if (analysis.sentiment.label === 'negative') {
      recommendations.push('- Document has negative sentiment. Review for potential issues or conflicts.');
    }

    // General recommendations
    recommendations.push('- Keep a copy of this analysis for future reference.');
    recommendations.push('- Consider comparing with similar documents for consistency.');

    return recommendations.join('\n');
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generateComparisonReport(comparison) {
    try {
      const report = this.createComparisonReportContent(comparison);
      return report;
    } catch (error) {
      console.error('Comparison report generation error:', error);
      throw new Error(`Failed to generate comparison report: ${error.message}`);
    }
  }

  createComparisonReportContent(comparison) {
    const { documents, similarities, differences, riskComparison, summary } = comparison;

    const report = `
# Document Comparison Report

## Documents Compared
${documents.map(doc => `- ${doc.name} (${doc.type})`).join('\n')}

## Comparison Summary
- **Total Documents**: ${summary.totalDocuments}
- **Average Risk Level**: ${summary.averageRiskLevel}
- **Most Common Risks**: ${summary.mostCommonRisks.map(r => r.risk).join(', ')}

## Key Insights
${summary.keyInsights.map(insight => `- ${insight}`).join('\n')}

## Similarities Analysis
${similarities.map(sim => `
### ${sim.doc1} vs ${sim.doc2}
- **Similarity Score**: ${(sim.similarityScore * 100).toFixed(1)}%
- **Common Keywords**: ${sim.commonKeywords.slice(0, 5).join(', ')}
`).join('\n')}

## Risk Comparison
### Overall Risk Levels
${riskComparison.overallRiskLevels.map(risk => `- ${risk.name}: ${risk.riskLevel} (${risk.totalRisks} risks)`).join('\n')}

### Common Risks Across Documents
${riskComparison.commonRisks.map(risk => `- ${risk.risk} (found in ${risk.count} documents)`).join('\n')}

### Risk Distribution
${riskComparison.riskTrends.map(trend => `- ${trend.riskLevel}: ${trend.count} documents (${trend.percentage.toFixed(1)}%)`).join('\n')}

## Differences Analysis
${differences.map(diff => `
### ${diff.doc1} vs ${diff.doc2}
**Unique to ${diff.doc1}:**
- Keywords: ${diff.uniqueKeywords1.slice(0, 5).join(', ')}
- Structural: ${diff.structuralDifferences.join(', ')}

**Unique to ${diff.doc2}:**
- Keywords: ${diff.uniqueKeywords2.slice(0, 5).join(', ')}
`).join('\n')}

## Recommendations
${this.generateComparisonRecommendations(comparison)}

---
*Comparison report generated on ${new Date().toLocaleString()}*
*AI Legal Document Analyzer*
    `;

    return report;
  }

  generateComparisonRecommendations(comparison) {
    const recommendations = [];

    // Risk-based recommendations
    const highRiskDocs = comparison.riskComparison.overallRiskLevels.filter(doc => doc.riskLevel === 'HIGH');
    if (highRiskDocs.length > 0) {
      recommendations.push(`- **ATTENTION**: ${highRiskDocs.length} document(s) have high risk levels. Prioritize review of these documents.`);
    }

    // Similarity-based recommendations
    const highSimilarity = comparison.similarities.filter(sim => sim.similarityScore > 0.7);
    if (highSimilarity.length > 0) {
      recommendations.push('- Documents show high similarity. Consider standardizing templates for consistency.');
    }

    // Common risks recommendations
    if (comparison.riskComparison.commonRisks.length > 0) {
      recommendations.push('- Common risks identified across documents. Consider creating risk mitigation strategies.');
    }

    // General recommendations
    recommendations.push('- Use this comparison to identify best practices across documents.');
    recommendations.push('- Consider creating standardized clauses for common elements.');

    return recommendations.join('\n');
  }

  async exportToFormat(document, format) {
    try {
      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(document, null, 2);
        case 'txt':
          return this.createReportContent(document);
        case 'html':
          return this.createHTMLReport(document);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  createHTMLReport(document) {
    const { originalName, uploadDate, analysis, fileSize } = document;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Legal Document Analysis - ${originalName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .risk-high { color: #dc3545; font-weight: bold; }
        .risk-medium { color: #ffc107; font-weight: bold; }
        .risk-low { color: #28a745; font-weight: bold; }
        .entity-list { list-style: none; padding: 0; }
        .entity-list li { padding: 5px 0; border-bottom: 1px solid #eee; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Legal Document Analysis Report</h1>
        <p><strong>Document:</strong> ${originalName}</p>
        <p><strong>Upload Date:</strong> ${new Date(uploadDate).toLocaleDateString()}</p>
        <p><strong>File Size:</strong> ${this.formatFileSize(fileSize)}</p>
        <p><strong>Document Type:</strong> ${analysis.documentType}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p>${analysis.summary}</p>
    </div>

    <div class="section">
        <h2>Risk Analysis</h2>
        <p><strong>Overall Risk Level:</strong> <span class="risk-${analysis.risks.riskLevel.toLowerCase()}">${analysis.risks.riskLevel}</span></p>
        <p><strong>Total Risk Items:</strong> ${analysis.risks.totalRisks}</p>
        
        <h3>Risk Keywords Found:</h3>
        <ul>
            ${analysis.risks.riskKeywords.map(keyword => `<li>${keyword}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Key Entities</h2>
        <h3>Persons</h3>
        <ul class="entity-list">
            ${analysis.entities.persons.map(person => `<li>${person}</li>`).join('') || '<li>No persons identified</li>'}
        </ul>
        
        <h3>Organizations</h3>
        <ul class="entity-list">
            ${analysis.entities.organizations.map(org => `<li>${org}</li>`).join('') || '<li>No organizations identified</li>'}
        </ul>
        
        <h3>Dates</h3>
        <ul class="entity-list">
            ${analysis.entities.dates.map(date => `<li>${date}</li>`).join('') || '<li>No dates identified</li>'}
        </ul>
    </div>

    <div class="section">
        <h2>Document Sentiment</h2>
        <p><strong>Sentiment:</strong> ${analysis.sentiment.label}</p>
        <p><strong>Score:</strong> ${analysis.sentiment.score}</p>
    </div>

    <div class="recommendations">
        <h2>Recommendations</h2>
        ${this.generateRecommendations(analysis).split('\n').map(rec => `<p>${rec}</p>`).join('')}
    </div>

    <hr>
    <p><em>Report generated on ${new Date().toLocaleString()} by AI Legal Document Analyzer</em></p>
</body>
</html>
    `;
  }
}

module.exports = ReportService; 