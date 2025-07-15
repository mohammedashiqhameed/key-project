import React, { useState, useEffect } from 'react';
import './Generator.css';

const Generator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false
  });
  const [strength, setStrength] = useState({
    score: 0,
    label: 'Very Weak',
    color: '#e74c3c'
  });

  const characters = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const similarChars = 'il1Lo0O';

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  useEffect(() => {
    analyzeStrength();
  }, [password]);

  const generatePassword = () => {
    let chars = '';
    let generatedPassword = '';

    // Build character set based on options
    if (options.uppercase) chars += characters.uppercase;
    if (options.lowercase) chars += characters.lowercase;
    if (options.numbers) chars += characters.numbers;
    if (options.symbols) chars += characters.symbols;

    if (chars === '') {
      setPassword('');
      return;
    }

    // Generate password
    for (let i = 0; i < length; i++) {
      let char = chars[Math.floor(Math.random() * chars.length)];
      
      // Exclude similar characters if option is enabled
      if (options.excludeSimilar && similarChars.includes(char)) {
        i--; // Try again
        continue;
      }
      
      generatedPassword += char;
    }

    setPassword(generatedPassword);
  };

  const analyzeStrength = () => {
    if (!password) {
      setStrength({ score: 0, label: 'Very Weak', color: '#e74c3c' });
      return;
    }

    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Complexity checks
    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
      score += 1;
    }

    // Determine strength level
    let label, color;
    if (score <= 2) {
      label = 'Very Weak';
      color = '#e74c3c';
    } else if (score <= 4) {
      label = 'Weak';
      color = '#f39c12';
    } else if (score <= 6) {
      label = 'Fair';
      color = '#f1c40f';
    } else if (score <= 8) {
      label = 'Good';
      color = '#27ae60';
    } else {
      label = 'Strong';
      color = '#2ecc71';
    }

    setStrength({ score, label, color });
  };

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      showToast('Password copied to clipboard!');
    }
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleOptionChange = (option) => {
    const newOptions = { ...options, [option]: !options[option] };
    
    // Ensure at least one option is selected
    const enabledOptions = Object.values(newOptions).filter(Boolean).length;
    if (enabledOptions === 0) {
      showToast('Please select at least one character type!');
      return;
    }
    
    setOptions(newOptions);
  };

  const getStrengthBarWidth = () => {
    return Math.min((strength.score / 9) * 100, 100);
  };

  return (
    <div className="generator-container">
      <div className="generator-header">
        <div className="header-content">
          <h1>🔧 Password Generator</h1>
          <p>Create strong, secure passwords with customizable options</p>
        </div>
        <div className="header-illustration">
          <img 
            src="https://img.freepik.com/free-vector/password-security-concept-illustration_114360-5858.jpg" 
            alt="Password Generator"
            className="header-image"
          />
        </div>
      </div>

      <div className="generator-main">
        <div className="password-display">
          <div className="password-field">
            <input
              type="text"
              value={password}
              readOnly
              placeholder="Generated password will appear here..."
              className="password-input"
            />
            <button onClick={copyToClipboard} className="copy-btn" disabled={!password}>
              📋 Copy
            </button>
          </div>
          
          <div className="strength-indicator">
            <div className="strength-bar">
              <div 
                className="strength-fill" 
                style={{ 
                  width: `${getStrengthBarWidth()}%`,
                  backgroundColor: strength.color
                }}
              ></div>
            </div>
            <span className="strength-label" style={{ color: strength.color }}>
              {strength.label} ({strength.score}/9)
            </span>
          </div>
        </div>

        <div className="generator-controls">
          <div className="control-group">
            <label className="control-label">
              Password Length: <span className="length-value">{length}</span>
            </label>
            <input
              type="range"
              min="4"
              max="50"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="length-slider"
            />
            <div className="length-markers">
              <span>4</span>
              <span>12</span>
              <span>20</span>
              <span>32</span>
              <span>50</span>
            </div>
          </div>

          <div className="options-grid">
            <div className="option-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={() => handleOptionChange('uppercase')}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="option-text">Uppercase Letters (A-Z)</span>
              </label>
            </div>

            <div className="option-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.lowercase}
                  onChange={() => handleOptionChange('lowercase')}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="option-text">Lowercase Letters (a-z)</span>
              </label>
            </div>

            <div className="option-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.numbers}
                  onChange={() => handleOptionChange('numbers')}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="option-text">Numbers (0-9)</span>
              </label>
            </div>

            <div className="option-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.symbols}
                  onChange={() => handleOptionChange('symbols')}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="option-text">Symbols (!@#$%^&*)</span>
              </label>
            </div>

            <div className="option-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.excludeSimilar}
                  onChange={() => handleOptionChange('excludeSimilar')}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="option-text">Exclude Similar Characters (il1Lo0O)</span>
              </label>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={generatePassword} className="btn-generate">
              🔄 Generate New Password
            </button>
            <button onClick={() => setPassword('')} className="btn-clear">
              🗑️ Clear
            </button>
          </div>
        </div>

        <div className="generator-info">
          <h3>💡 Password Tips</h3>
          <ul>
            <li>Use at least 12 characters for better security</li>
            <li>Include a mix of uppercase, lowercase, numbers, and symbols</li>
            <li>Avoid common patterns and personal information</li>
            <li>Use different passwords for each account</li>
            <li>Consider using a password manager for better security</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Generator;
