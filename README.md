# Contract AI - Smart Contract Analysis Platform

An AI-powered contract management application that helps businesses, freelancers, and startups **summarize contracts, extract key clauses, flag risks, and automate negotiation emails**.

## 🚀 Features

- **📄 Document Upload**: Support for PDF, DOCX, and TXT contract files
- **🤖 AI Analysis**: Automatic contract summarization with bullet-point TL;DR
- **🔍 Clause Extraction**: Structured JSON output of key contract clauses
- **⚠️ Risk Detection**: Intelligent risk scoring (0-100) with severity levels
- **📧 Email Generation**: Automated negotiation email drafts with tone options
- **❓ Q&A System**: RAG-lite contract querying with context-aware responses
- **📋 Export/Copy**: Easy copying of results in Markdown format

## 🏗️ Project Structure

```
cme-ai/
├── frontend/                 # Next.js 14 + TailwindCSS
│   ├── app/
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main contract analysis UI
│   ├── package.json
│   ├── next.config.js       # API proxy configuration
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                  # FastAPI + Python 3.11
│   ├── main.py              # FastAPI server with all endpoints
│   ├── contract_ai.py       # AI analysis functions
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── .gitignore
├── package.json             # Root package.json for monorepo
└── README.md
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- OpenAI API Key

### Installation

1. **Clone and install dependencies:**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && pip install -r requirements.txt && cd ..
```

2. **Setup Environment:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=your_openai_api_key_here
```

3. **Start Development Servers:**
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:8000
```

## 📡 API Endpoints

### Backend (http://localhost:8000)

- `GET /` - Health check
- `GET /health` - Detailed health check with OpenAI status
- `POST /upload` - Upload and analyze contract files
- `POST /analyze` - Analyze contract text directly
- `POST /generate-email` - Generate negotiation emails
- `POST /ask-question` - Ask questions about contracts
- `GET /contracts` - List uploaded contracts
- `DELETE /contracts/{filename}` - Delete specific contract

### Request/Response Examples

**Upload Contract:**
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@contract.pdf"
```

**Generate Email:**
```bash
curl -X POST "http://localhost:8000/generate-email" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_text": "Contract content...",
    "tone": "professional"
  }'
```

## 🎯 Usage Workflow

1. **Upload Contract**: Upload PDF, DOCX, or TXT files
2. **Review Analysis**: Get AI-powered summary, clauses, and risk assessment
3. **Ask Questions**: Query specific contract details
4. **Generate Emails**: Create negotiation emails with different tones
5. **Export Results**: Copy analysis results for external use

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
DEFAULT_MODEL=gpt-3.5-turbo
MAX_TOKENS=4000
TEMPERATURE=0.3

# File Upload Configuration
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_EXTENSIONS=.pdf,.docx,.txt
```

### Frontend Configuration

The frontend automatically proxies API calls to the backend via Next.js rewrites configured in `next.config.js`.

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
cd frontend
npm run build
npm start
```

## 🧪 Development

### Adding New Features

1. **Backend**: Add new endpoints in `main.py` and AI functions in `contract_ai.py`
2. **Frontend**: Update the UI in `app/page.tsx` with new components and API calls

### Testing

```bash
# Test backend health
curl http://localhost:8000/health

# Test frontend
open http://localhost:3000
```

## 📋 Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, TypeScript
- **Backend**: FastAPI, Python 3.11, OpenAI API
- **Document Processing**: PyPDF2, python-docx
- **AI/ML**: OpenAI GPT models, LangChain
- **Development**: Concurrently for parallel dev servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

1. **OpenAI API Key Error**: Ensure your API key is set in `.env`
2. **File Upload Fails**: Check file size (max 50MB) and format (PDF/DOCX/TXT)
3. **CORS Issues**: Verify frontend is running on port 3000
4. **Dependencies**: Run `npm run install:all` to install all dependencies

### Support

For issues and questions, please check the project documentation or create an issue in the repository.
