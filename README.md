# 🧠 AI Legal Document Analyzer

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
Legal_AI_Analyzer/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── server/                  # Node backend
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── uploads/                 # Uploaded files
├── database/                # SQLite database
├── render.yaml              # Render deployment config
├── .env                     # Environment variables
├── .gitignore
└── README.md

```

🚀 Getting Started
1. Clone the Repository
   ```bash
   git clone https://github.com/desaiyash21/Legal_AI_Analyzer.git
   cd Legal_AI_Analyzer
   ```
2. Install Dependencies
   Install both frontend and backend packages:
   ```bash
   npm run install-all
   ```
   If install-all script isn't defined, manually run:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. Create Environment Variables
   Create a .env file in the server/ directory:
   ```bash
   PORT=5000
   NODE_ENV=production
   ```
4. Run the Application Locally
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

## Deployment

- **Render**:  https://lexilens-ai-document-analyzer.onrender.com
