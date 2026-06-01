import express from 'express'
import multer from 'multer'
import pdf from 'pdf-parse'
import dotenv from 'dotenv'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenerativeAI } from '@google/generative-ai'


dotenv.config()


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads')
   
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
   
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf')
  },
})


const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
})


async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdf(dataBuffer)
    return data.text
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

function parseGeminiResponse(responseText) {
  try {
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error parsing Gemini response:', error)
   
    return {
      score: 50,
      strengths: ['Unable to parse response'],
      weaknesses: ['Please try again'],
      missingSkills: [],
      suggestions: ['Contact support if the issue persists'],
    }
  }
}


async function analyzeResumeWithGemini(resumeText) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'Gemini API key not found. Please set GEMINI_API_KEY in .env file'
    )
  }

  try {
   
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })

   
    const prompt = `Analyze this resume and provide a JSON response with the following structure:
{
  "score": <number 0-100>,
  "strengths": [<list of strengths>],
  "weaknesses": [<list of weaknesses>],
  "missingSkills": [<list of missing skills>],
  "suggestions": [<list of suggestions for improvement>]
}

Resume Text:
${resumeText}

Provide ONLY valid JSON response, no additional text.`


    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

   
    const analysisData = parseGeminiResponse(responseText)
    return analysisData
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    if (error.message.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your .env file')
    }
    throw new Error('Failed to analyze resume with Gemini API')
  }
}


app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' })
})


app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    console.log('File received:', req.file.filename)

   
    const resumeText = await extractTextFromPDF(req.file.path)

   
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from PDF' })
    }

    console.log('Text extracted, sending to Gemini...')

   
    const analysis = await analyzeResumeWithGemini(resumeText)

    
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err)
    })

   
    res.json(analysis)
  } catch (error) {
    console.error('Error in /api/analyze:', error)

    
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err)
      })
    }

    
    res.status(500).json({
      message: error.message || 'Failed to analyze resume',
    })
  }
})


app.use((error, req, res, next) => {
  console.error('Middleware error:', error)

 
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size must be less than 5MB' })
  }

 
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: 'Only PDF files are allowed' })
  }

  res.status(500).json({
    message: error.message || 'An error occurred',
  })
})


app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
  console.log('📌 Make sure your Gemini API key is set in .env file')
})
