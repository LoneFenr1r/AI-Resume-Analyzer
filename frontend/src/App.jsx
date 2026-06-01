import { useState } from 'react'
import axios from 'axios'
import UploadCard from './components/UploadCard'
import ResultsCard from './components/ResultsCard'


const API_URL = 'http://localhost:5000'

function App() {
  
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    
   
    if (!selectedFile) {
      setError('No file selected')
      return
    }

   
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only')
      return
    }

   
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setFile(selectedFile)
    setError(null)
    setResults(null)
  }

  
  const handleSubmit = async (e) => {
    e.preventDefault()

   
    if (!file) {
      setError('Please select a PDF file first')
      return
    }

    try {
      setLoading(true)
      setError(null)

     
      const formData = new FormData()
      formData.append('file', file)

      
      const response = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

    
      setResults(response.data)
      setFile(null)
    } catch (err) {
      
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Bad request: Invalid file')
      } else if (err.response?.status === 500) {
        setError('Server error: Please check your Gemini API key')
      } else if (err.code === 'ECONNREFUSED') {
        setError('Cannot connect to backend. Make sure it is running on port 5000')
      } else if (err.message === 'Network Error') {
        setError('Network error: Please check your internet connection')
      } else {
        setError(err.response?.data?.message || 'Failed to analyze resume')
      }
    } finally {
      setLoading(false)
    }
  }

 
  const handleReset = () => {
    setResults(null)
    setFile(null)
    setError(null)
  }

  return (
    <div className="app-container">
    
      <header className="app-header">
        <h1>🤖 AI Resume Analyzer</h1>
        <p>Powered by Google Gemini</p>
      </header>

      <main className="app-main">
       
        {results ? (
          <div className="results-wrapper">
            <button className="reset-btn" onClick={handleReset}>
              Analyze Another Resume
            </button>
            <ResultsCard data={results} />
            <button className="reset-btn" onClick={handleReset}>
              Analyze Another Resume
            </button>
          </div>
        ) : (
         
          <UploadCard
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            file={file}
          />
        )}
      </main>

     
      <footer className="app-footer">
        <p>By Md Anas • No data is stored</p>
      </footer>
    </div>
  )
}

export default App
