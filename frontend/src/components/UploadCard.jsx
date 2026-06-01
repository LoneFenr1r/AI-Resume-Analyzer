
import React from 'react'

function UploadCard({ onFileChange, onSubmit, loading, error, file }) {
  return (
    <div className="upload-card">
     
      <h2>Upload Your Resume</h2>
      <p className="upload-description">
        Upload a PDF resume to get AI-powered analysis and suggestions
      </p>

      
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

     
      <form onSubmit={onSubmit}>
       
        <div className="file-input-wrapper">
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="file-input"
            id="file-input"
            disabled={loading}
          />
          <label htmlFor="file-input" className="file-label">
            {file ? `✓ ${file.name}` : '📄 Choose PDF File'}
          </label>
        </div>

        
        {file && (
          <div className="file-info">
            <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        
        <button
          type="submit"
          className={`analyze-btn ${loading ? 'loading' : ''}`}
          disabled={loading || !file}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Analyzing...
            </>
          ) : (
            '🚀 Analyze Resume'
          )}
        </button>
      </form>

   
      <div className="helper-text">
        <p>💡 Supported format: PDF only (Max 5MB)</p>
      </div>
    </div>
  )
}

export default UploadCard
