# AI Legal Document Analyzer

An intelligent system that analyzes legal documents using Natural Language Processing (NLP) to extract key information, identify risks, and provide simplified explanations.

## Features

- **Document Upload**: Support for PDF and DOCX files
- **Text Extraction**: Automatic extraction of text content from uploaded documents
- **NLP Processing**: 
  - Document summarization
  - Key information extraction (parties, dates, clauses)
  - Risk detection and highlighting
  - Legal jargon simplification
- **Interactive UI**: Modern, responsive interface with real-time processing
- **Report Generation**: Downloadable analysis reports
- **Document Comparison**: Compare multiple legal documents

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js
- **Document Processing**: pdf-parse, mammoth
- **NLP**: Natural.js, compromise
- **Database**: SQLite
- **Styling**: Tailwind CSS

## Project Structure

```
ai-legal-document-analyzer/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── uploads/               # File upload directory
├── database/              # SQLite database
├── package.json
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-legal-document-analyzer
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Upload Document**: Drag and drop or select a PDF/DOCX file
2. **Processing**: The system will automatically extract text and perform NLP analysis
3. **Review Results**: View summary, key information, and risk analysis
4. **Download Report**: Generate and download a comprehensive analysis report
5. **Compare Documents**: Upload additional documents for comparison

## API Endpoints

- `POST /api/upload` - Upload and analyze document
- `GET /api/documents` - Get all analyzed documents
- `GET /api/documents/:id` - Get specific document analysis
- `POST /api/compare` - Compare multiple documents
- `GET /api/download/:id` - Download analysis report

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 

## Deployed on Netlify

https://lustrous-meringue-47884c.netlify.app/
