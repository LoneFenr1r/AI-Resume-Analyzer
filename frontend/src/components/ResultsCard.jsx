
import React from 'react'

function ResultsCard({ data }) {
  const score = data?.score || 0
  const strengths = data?.strengths || []
  const weaknesses = data?.weaknesses || []
  const missingSkills = data?.missingSkills || []
  const suggestions = data?.suggestions || []


  const getScoreColor = (s) => {
    if (s >= 80) return '#4CAF50' 
    if (s >= 60) return '#FFC107' 
    return '#F44336' 
  }

  return (
    <div className="results-card">
      
      <div className="score-section">
        <h2>ATS Compatibility Score</h2>
        <div className="score-circle" style={{ borderColor: getScoreColor(score) }}>
          <span className="score-number" style={{ color: getScoreColor(score) }}>
            {score}
          </span>
          <span className="score-label">/100</span>
        </div>
        <p className="score-description">
          {score >= 80
            ? '✅ Excellent! Your resume is well-optimized'
            : score >= 60
            ? '⚠️ Good, but can be improved'
            : '❌ Needs improvement'}
        </p>
      </div>

     
      {strengths.length > 0 && (
        <div className="results-section">
          <h3>💪 Strengths</h3>
          <ul className="results-list">
            {strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

    
      {weaknesses.length > 0 && (
        <div className="results-section">
          <h3>⚠️ Weaknesses</h3>
          <ul className="results-list weakness-list">
            {weaknesses.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

  
      {missingSkills.length > 0 && (
        <div className="results-section">
          <h3>🔧 Missing Skills</h3>
          <div className="skills-container">
            {missingSkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      
      {suggestions.length > 0 && (
        <div className="results-section suggestions-section">
          <h3>💡 Suggestions for Improvement</h3>
          <ol className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ol>
        </div>
      )}

      
      <div className="info-box">
        <p>
          📌 <strong>Tip:</strong> Update your resume based on these suggestions and
          re-upload to check your improvement!
        </p>
      </div>
    </div>
  )
}

export default ResultsCard
