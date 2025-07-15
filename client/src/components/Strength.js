import React, { useState, useEffect } from 'react';
import './Strength.css';

const Strength = () => {
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState({
    score: 0,
    label: 'Very Weak',
    color: '#e74c3c',
    feedback: [],
    details: {
      length: { score: 0, max: 3, message: '' },
      uppercase: { score: 0, max: 1, message: '' },
      lowercase: { score: 0, max: 1, message: '' },
      numbers: { score: 0, max: 1, message: '' },
      symbols: { score: 0, max: 1, message: '' },
      complexity: { score: 0, max: 1, message: '' },
      uniqueness: { score: 0, max: 1, message: '' },
      patterns: { score: 0, max: 1, message: '' }
    }
  });

  useEffect(() => {
    analyzePassword();
  }, [password]);

  const analyzePassword = () => {
    if (!password) {
      setAnalysis({
        score: 0,
        label: 'Very Weak',
        color: '#e74c3c',
        feedback: ['Enter a password to analyze'],
        details: {
          length: { score: 0, max: 3, message: 'Password is empty' },
          uppercase: { score: 0, max: 1, message: 'No uppercase letters' },
          lowercase: { score: 0, max: 1, message: 'No lowercase letters' },
          numbers: { score: 0, max: 1, message: 'No numbers' },
          symbols: { score: 0, max: 1, message: 'No symbols' },
          complexity: { score: 0, max: 1, message: 'Not complex enough' },
          uniqueness: { score: 0, max: 1, message: 'No password entered' },
          patterns: { score: 0, max: 1, message: 'No password entered' }
        }
      });
      return;
    }

    const details = {
      length: analyzeLength(),
      uppercase: analyzeUppercase(),
      lowercase: analyzeLowercase(),
      numbers: analyzeNumbers(),
      symbols: analyzeSymbols(),
      complexity: analyzeComplexity(),
      uniqueness: analyzeUniqueness(),
      patterns: analyzePatterns()
    };

    const totalScore = Object.values(details).reduce((sum, detail) => sum + detail.score, 0);
    const maxScore = Object.values(details).reduce((sum, detail) => sum + detail.max, 0);
    
    const { label, color } = getStrengthLevel(totalScore, maxScore);
    const feedback = generateFeedback(details);

    setAnalysis({
      score: totalScore,
      label,
      color,
      feedback,
      details
    });
  };

  const analyzeLength = () => {
    const length = password.length;
    let score = 0;
    let message = '';

    if (length >= 8) {
      score = 1;
      message = 'Good length (8+ characters)';
    }
    if (length >= 12) {
      score = 2;
      message = 'Very good length (12+ characters)';
    }
    if (length >= 16) {
      score = 3;
      message = 'Excellent length (16+ characters)';
    }

    if (length < 8) {
      message = `Too short (${length} characters). Use at least 8 characters.`;
    }

    return { score, max: 3, message };
  };

  const analyzeUppercase = () => {
    const hasUppercase = /[A-Z]/.test(password);
    return {
      score: hasUppercase ? 1 : 0,
      max: 1,
      message: hasUppercase ? 'Contains uppercase letters' : 'Add uppercase letters (A-Z)'
    };
  };

  const analyzeLowercase = () => {
    const hasLowercase = /[a-z]/.test(password);
    return {
      score: hasLowercase ? 1 : 0,
      max: 1,
      message: hasLowercase ? 'Contains lowercase letters' : 'Add lowercase letters (a-z)'
    };
  };

  const analyzeNumbers = () => {
    const hasNumbers = /[0-9]/.test(password);
    return {
      score: hasNumbers ? 1 : 0,
      max: 1,
      message: hasNumbers ? 'Contains numbers' : 'Add numbers (0-9)'
    };
  };

  const analyzeSymbols = () => {
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    return {
      score: hasSymbols ? 1 : 0,
      max: 1,
      message: hasSymbols ? 'Contains symbols' : 'Add symbols (!@#$%^&*)'
    };
  };

  const analyzeComplexity = () => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    const length = password.length;

    const complexity = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
    
    if (length >= 8 && complexity >= 3) {
      return {
        score: 1,
        max: 1,
        message: 'Good complexity with multiple character types'
      };
    }

    return {
      score: 0,
      max: 1,
      message: 'Use a mix of uppercase, lowercase, numbers, and symbols'
    };
  };

  const analyzeUniqueness = () => {
    const uniqueChars = new Set(password).size;
    const totalChars = password.length;
    const uniquenessRatio = uniqueChars / totalChars;

    if (uniquenessRatio >= 0.8) {
      return {
        score: 1,
        max: 1,
        message: 'Good character variety'
      };
    }

    return {
      score: 0,
      max: 1,
      message: 'Use more unique characters'
    };
  };

  const analyzePatterns = () => {
    const commonPatterns = [
      '123', 'abc', 'qwe', 'asd', 'password', 'admin', 'user',
      '123456', 'password123', 'admin123', 'qwerty', 'letmein'
    ];

    const lowerPassword = password.toLowerCase();
    const hasCommonPattern = commonPatterns.some(pattern => lowerPassword.includes(pattern));

    if (!hasCommonPattern) {
      return {
        score: 1,
        max: 1,
        message: 'No common patterns detected'
      };
    }

    return {
      score: 0,
      max: 1,
      message: 'Avoid common patterns and words'
    };
  };

  const getStrengthLevel = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;

    if (percentage <= 20) {
      return { label: 'Very Weak', color: '#e74c3c' };
    } else if (percentage <= 40) {
      return { label: 'Weak', color: '#f39c12' };
    } else if (percentage <= 60) {
      return { label: 'Fair', color: '#f1c40f' };
    } else if (percentage <= 80) {
      return { label: 'Good', color: '#27ae60' };
    } else {
      return { label: 'Strong', color: '#2ecc71' };
    }
  };

  const generateFeedback = (details) => {
    const feedback = [];
    const maxScore = Object.values(details).reduce((sum, detail) => sum + detail.max, 0);
    const currentScore = Object.values(details).reduce((sum, detail) => sum + detail.score, 0);

    if (currentScore === maxScore) {
      feedback.push('Excellent! Your password is very strong.');
      return feedback;
    }

    // Add specific feedback for each failing criterion
    Object.entries(details).forEach(([key, detail]) => {
      if (detail.score < detail.max) {
        feedback.push(detail.message);
      }
    });

    return feedback.slice(0, 5); // Limit to 5 suggestions
  };

  const getProgressPercentage = () => {
    const maxScore = Object.values(analysis.details).reduce((sum, detail) => sum + detail.max, 0);
    return maxScore > 0 ? (analysis.score / maxScore) * 100 : 0;
  };

  const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return '#2ecc71';
    if (percentage >= 60) return '#27ae60';
    if (percentage >= 40) return '#f1c40f';
    if (percentage >= 20) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="strength-container">
      <div className="strength-header">
        <div className="header-content">
          <h1>🛡️ Password Strength Analyzer</h1>
          <p>Test your password security with our comprehensive analysis</p>
        </div>
        <div className="header-illustration">
          <img 
            src="https://img.freepik.com/free-vector/security-concept-illustration_114360-1532.jpg" 
            alt="Password Strength"
            className="header-image"
          />
        </div>
      </div>

      <div className="strength-main">
        <div className="password-input-section">
          <div className="input-group">
            <label htmlFor="password-input">Enter Password to Analyze:</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password here..."
              className="password-input"
            />
          </div>
        </div>

        <div className="strength-overview">
          <div className="overview-card">
            <h3>Overall Strength</h3>
            <div className="strength-meter">
              <div className="meter-bar">
                <div 
                  className="meter-fill" 
                  style={{ 
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: analysis.color
                  }}
                ></div>
              </div>
              <div className="strength-info">
                <span className="strength-label" style={{ color: analysis.color }}>
                  {analysis.label}
                </span>
                <span className="strength-score">
                  {analysis.score}/9
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="analysis-details">
          <h3>Detailed Analysis</h3>
          <div className="criteria-grid">
            {Object.entries(analysis.details).map(([key, detail]) => (
              <div key={key} className="criterion-card">
                <div className="criterion-header">
                  <span className="criterion-name">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className="criterion-score">
                    {detail.score}/{detail.max}
                  </span>
                </div>
                <div className="criterion-bar">
                  <div 
                    className="criterion-fill"
                    style={{
                      width: `${(detail.score / detail.max) * 100}%`,
                      backgroundColor: getScoreColor(detail.score, detail.max)
                    }}
                  ></div>
                </div>
                <p className="criterion-message">{detail.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="feedback-section">
          <h3>💡 Recommendations</h3>
          <div className="feedback-list">
            {analysis.feedback.map((feedback, index) => (
              <div key={index} className="feedback-item">
                <span className="feedback-icon">💡</span>
                <span className="feedback-text">{feedback}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="security-tips">
          <h3>🔒 Security Best Practices</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>Length Matters</h4>
              <p>Use at least 12 characters. Longer passwords are exponentially harder to crack.</p>
            </div>
            <div className="tip-card">
              <h4>Mix Character Types</h4>
              <p>Combine uppercase, lowercase, numbers, and symbols for maximum security.</p>
            </div>
            <div className="tip-card">
              <h4>Avoid Common Patterns</h4>
              <p>Don't use sequential numbers, common words, or personal information.</p>
            </div>
            <div className="tip-card">
              <h4>Unique Passwords</h4>
              <p>Use different passwords for each account to prevent domino breaches.</p>
            </div>
            <div className="tip-card">
              <h4>Regular Updates</h4>
              <p>Change passwords regularly, especially for critical accounts.</p>
            </div>
            <div className="tip-card">
              <h4>Password Manager</h4>
              <p>Consider using a password manager to generate and store strong passwords.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Strength;
