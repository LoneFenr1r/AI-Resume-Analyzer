# 🏗️ Project Architecture

Learn how the AI Resume Analyzer is built!

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React App (Frontend)                               │  │
│  │  - App.jsx (Main component)                         │  │
│  │  - UploadCard.jsx (Upload UI)                       │  │
│  │  - ResultsCard.jsx (Display results)                │  │
│  │  - App.css (Modern styling)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↕ HTTP (Axios)
┌─────────────────────────────────────────────────────────────┐
│                   NODE.JS SERVER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js API (Backend)                           │  │
│  │  - server.js (Main server logic)                    │  │
│  │  - /api/analyze endpoint                            │  │
│  │  - Multer (File upload handler)                     │  │
│  │  - PDF Parser (Text extraction)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│            GOOGLE GEMINI AI                                │
│  - Returns structured JSON analysis                        │
│  - ATS score, strengths, weaknesses, etc.                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Components Structure

```
App.jsx (Main)
├── Header
├── Main Content
│   ├── UploadCard (When no results)
│   │   ├── File Input
│   │   ├── Submit Button
│   │   └── Error Display
│   └── ResultsCard (When results shown)
│       ├── Score Circle
│       ├── Strengths Section
│       ├── Weaknesses Section
│       ├── Skills Section
│       └── Suggestions Section
└── Footer
```

### Data Flow (Frontend)

```
User selects PDF
    ↓
handleFileChange() validates file
    ↓
File stored in state (setFile)
    ↓
User clicks "Analyze"
    ↓
handleSubmit() creates FormData
    ↓
axios.post() sends to backend
    ↓
setLoading(true) shows spinner
    ↓
Response received
    ↓
setResults() displays data
    ↓
UploadCard hidden, ResultsCard shown
```

### Key State Variables (App.jsx)

```javascript
const [file, setFile] = useState(null)           // Current file
const [loading, setLoading] = useState(false)    // Loading state
const [results, setResults] = useState(null)     // Analysis results
const [error, setError] = useState(null)         // Error messages
```

---

## Backend Architecture

### API Endpoints

```
GET /api/health
  - Returns: { message: "Backend is running" }
  - Purpose: Health check

POST /api/analyze
  - Body: FormData with 'file' (PDF)
  - Returns: { score, strengths, weaknesses, missingSkills, suggestions }
  - Process: Upload → Extract → Analyze → Return
```

### Middleware Stack

```
CORS Middleware
    ↓
Express JSON Parser
    ↓
Multer File Handler
    ↓
Route Handler
    ↓
Error Handler
```

### Request Processing Flow

```
POST /api/analyze
    ↓
Multer validates & saves file
    ↓
extractTextFromPDF() extracts text
    ↓
analyzeResumeWithGemini() calls API
    ↓
parseGeminiResponse() parses JSON
    ↓
File deleted from server
    ↓
JSON sent to frontend
```

### File Structure (backend/server.js)

```javascript
// Setup Section
- Load environment variables (dotenv)
- Initialize Express app
- Setup CORS & middleware
- Configure Multer

// Helper Functions
- extractTextFromPDF()      → Reads PDF and extracts text
- parseGeminiResponse()     → Converts AI response to JSON
- analyzeResumeWithGemini() → Calls Gemini API

// API Endpoints
- GET /api/health          → Health check
- POST /api/analyze        → Main endpoint

// Error Handling
- Multer error handler
- Custom error middleware

// Server Start
- app.listen()
```

---

## Data Format

### Input (PDF Resume)

```
Resume.pdf
  ↓ (pdf-parse extracts)
"John Doe
Senior Developer
Skills: JavaScript, React, Node.js
..."
```

### Gemini Prompt

```
"Analyze this resume and provide JSON:
{
  score: 0-100,
  strengths: [...],
  weaknesses: [...],
  missingSkills: [...],
  suggestions: [...]
}"
```

### Output (Analysis Result)

```json
{
  "score": 85,
  "strengths": [
    "Clear job descriptions",
    "Relevant skills mentioned"
  ],
  "weaknesses": [
    "No quantifiable achievements",
    "Missing certifications"
  ],
  "missingSkills": [
    "Docker",
    "Kubernetes"
  ],
  "suggestions": [
    "Add metrics and numbers",
    "Include certifications section"
  ]
}
```

---

## Technology Details

### Why These Choices?

| Technology | Why Chosen |
|-----------|-----------|
| React + Vite | Fast, modern, easy to learn |
| Express.js | Simple, lightweight backend |
| Multer | Standard file upload handler |
| pdf-parse | Simple PDF text extraction |
| Google Gemini | Free, powerful AI API |
| Axios | Easy HTTP requests |
| CORS | Handle cross-origin requests |
| dotenv | Secure API key management |

---

## Error Handling Strategy

### Frontend Error Handling

```javascript
try {
  axios.post() // API call
} catch (err) {
  // Check error type
  if (err.response?.status === 400)  // Bad request
  if (err.response?.status === 500)  // Server error
  if (err.code === 'ECONNREFUSED')   // Backend offline
  if (err.message === 'Network Error') // No internet
  
  // Display user-friendly message
  setError(userFriendlyMessage)
}
```

### Backend Error Handling

```javascript
// Validation errors
- Missing file
- Wrong file type
- File too large
- Invalid PDF content

// API errors
- Missing API key
- Invalid API key
- Network timeout
- Rate limit exceeded

// System errors
- File write error
- Memory error
- Port already in use
```

---

## Performance Considerations

### Frontend

- **Lazy loading:** Components only render when needed
- **CSS animations:** Hardware-accelerated for smoothness
- **File validation:** Check before upload to save bandwidth
- **Error boundaries:** Graceful error handling

### Backend

- **File cleanup:** Delete after analysis to save space
- **Request timeout:** Prevent hanging requests
- **Memory management:** Stream processing for large files
- **Rate limiting:** Can be added for production

---

## Security Notes

⚠️ **This is for LOCAL development only**

### Current Security:

✅ No authentication (intentional)
✅ No database
✅ No user data stored
✅ No credentials exposed

### Production Considerations:

- Add authentication
- Use database with encryption
- Add rate limiting
- Validate all inputs
- Use HTTPS only
- Secure API key rotation
- Add logging & monitoring

---

## File Sizes

Typical component sizes:

```
App.jsx               ~200 lines
UploadCard.jsx       ~100 lines
ResultsCard.jsx      ~150 lines
App.css              ~400 lines
server.js            ~250 lines
package.json         ~30 lines
```

---

## Beginner-Friendly Comments

Every important section has comments:

```javascript
// ============================
// PURPOSE: What this does
// ============================

// Feature explanation
const variable = value

// Why this matters
function doSomething() {
  // Step-by-step explanation
}
```

---

## Debugging Tips

### Frontend Debugging

```javascript
// Check file state
console.log('Selected file:', file)

// Check API response
console.log('Analysis results:', results)

// Check errors
console.log('Error message:', error)

// Use browser DevTools (F12)
- Check Network tab
- See API requests/responses
- Check Console for errors
```

### Backend Debugging

```javascript
// Check file upload
console.log('File received:', req.file.filename)

// Check text extraction
console.log('Extracted text:', resumeText)

// Check API response
console.log('Gemini response:', response.text())

// Terminal output
npm start // Shows all logs
```

---

## Testing the System

### Manual Testing Flow

1. **Test file upload**
   - Try valid PDF → Should work
   - Try invalid file → Should show error
   - Try large file (>5MB) → Should show size error

2. **Test analysis**
   - Check API response format
   - Verify JSON parsing works
   - Check score calculation

3. **Test error handling**
   - Disconnect backend → Should show connection error
   - Invalid API key → Should show API error
   - Bad PDF → Should show extraction error

---

## Code Quality Standards

This project follows:

- ✅ Functional components (React best practice)
- ✅ Hooks (useState, etc.)
- ✅ Async/await (modern async)
- ✅ Meaningful variable names
- ✅ Clean folder structure
- ✅ Comments for clarity
- ✅ Error handling throughout
- ✅ Responsive design

---

## Future Architecture Improvements

If you extend this project:

```
Current:
- Local only
- No persistence
- Single user

Future:
- Add MongoDB
- Add authentication
- Multi-user support
- Caching layer (Redis)
- Message queue (Bull, etc.)
- Microservices
- Docker containers
```

---

## Summary

**Frontend:** React app that uploads files and shows results
**Backend:** Express server that processes files and calls Gemini
**Integration:** HTTP API with JSON data exchange

Simple, clean, beginner-friendly! 🎉
