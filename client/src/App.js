import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import Footer from "./components/Footer";
import Vault from "./components/Vault";
import Generator from "./components/Generator";
import Strength from "./components/Strength";

const API = "http://localhost:5000/api";

// Component to redirect to login if not authenticated
function NavigateToLogin() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/');
  }, [navigate]);
  
  return null;
}

// Active link component
function NavLink({ to, children, ...props }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`nav-link ${isActive ? 'active' : ''}`}
      {...props}
    >
      {children}
    </Link>
  );
}

// Logo component with navigation
function Logo() {
  const navigate = useNavigate();
  
  return (
    <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
      <img 
        src="https://i.pinimg.com/736x/69/a6/2a/69a62a5edc08d755dd8a4ef017e14c63.jpg" 
        alt="PassX Logo" 
        className="logo-image"
      />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const headers = { Authorization: token };

  useEffect(() => {
    if (token) {
      try {
        setUser(jwtDecode(token));
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        setToken("");
      }
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isLogin) {
        const res = await axios.post(`${API}/login`, form);
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
      } else {
        await axios.post(`${API}/register`, form);
        setIsLogin(true);
        setError("Registration successful! Please login.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="navbar-left">
            <h2>PassX - Password Manager</h2>
            <div className="nav-links">
              <NavLink to="/vault">🔐 Vault</NavLink>
              <NavLink to="/generator">🔧 Generator</NavLink>
              <NavLink to="/strength">🛡️ Strength</NavLink>
            </div>
          </div>
          <div className="navbar-right">
            {user && (
              <button className="auth-button secondary" onClick={handleLogout}>
                Logout
              </button>
            )}
            <Logo />
          </div>
        </nav>
        
        <Routes>
          <Route path="/vault" element={<Vault />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/strength" element={<Strength />} />
          <Route path="/" element={
            <div className="container">
              {!user ? (
                <>
                  <div className="landing-container">
                    <div className="landing-header">
                      <div className="hero-content">
                        <h1>🔐 PassX</h1>
                        <h2>Your Ultimate Password Security Solution</h2>
                        <p>Store, generate, and analyze passwords with military-grade encryption. Keep your digital life secure with our comprehensive password management platform.</p>
                        <div className="hero-features">
                          <div className="feature-item">
                            <span className="feature-icon">🔒</span>
                            <span>End-to-End Encryption</span>
                          </div>
                          <div className="feature-item">
                            <span className="feature-icon">🛡️</span>
                            <span>Zero-Knowledge Security</span>
                          </div>
                          <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <span>Lightning Fast</span>
                          </div>
                        </div>
                      </div>
                      <div className="hero-illustration">
                        <img 
                          src="https://img.freepik.com/free-vector/password-security-concept-illustration_114360-5858.jpg" 
                          alt="Password Security"
                          className="hero-image"
                        />
                      </div>
                    </div>

                    <div className="auth-section">
                      <div className="auth-container">
                        <div className="auth-header">
                          <h3>{isLogin ? "Welcome Back!" : "Join PassX Today"}</h3>
                          <p>{isLogin ? "Sign in to access your secure password vault" : "Create your account and start securing your passwords"}</p>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit} className="auth-form">
                          <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                              id="username"
                              type="text"
                              placeholder="Enter your username"
                              value={form.username}
                              onChange={e => setForm({ ...form, username: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                              id="password"
                              type="password"
                              placeholder="Enter your password"
                              value={form.password}
                              onChange={e => setForm({ ...form, password: e.target.value })}
                              required
                            />
                          </div>
                          <button type="submit" className="auth-button">
                            {isLogin ? "Sign In" : "Create Account"}
                          </button>
                        </form>
                        <div className="form-switch">
                          {isLogin ? (
                            <p>Don't have an account? <a href="#" onClick={() => setIsLogin(false)}>Register</a></p>
                          ) : (
                            <p>Already have an account? <a href="#" onClick={() => setIsLogin(true)}>Login</a></p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="features-showcase">
                      <h2>Why Choose PassX?</h2>
                      <div className="features-grid">
                        <div className="feature-card">
                          <div className="feature-icon-large">🔐</div>
                          <h3>Secure Vault</h3>
                          <p>Store all your passwords in an encrypted vault with military-grade security. Access them anytime, anywhere.</p>
                        </div>
                        <div className="feature-card">
                          <div className="feature-icon-large">🔧</div>
                          <h3>Smart Generator</h3>
                          <p>Generate strong, unique passwords with customizable options. Never use weak passwords again.</p>
                        </div>
                        <div className="feature-card">
                          <div className="feature-icon-large">🛡️</div>
                          <h3>Strength Analyzer</h3>
                          <p>Test your password security with our advanced analyzer. Get detailed feedback and improvement suggestions.</p>
                        </div>
                        <div className="feature-card">
                          <div className="feature-icon-large">🔒</div>
                          <h3>End-to-End Encryption</h3>
                          <p>Your data is encrypted before it leaves your device. Only you can access your passwords.</p>
                        </div>
                        <div className="feature-card">
                          <div className="feature-icon-large">⚡</div>
                          <h3>Lightning Fast</h3>
                          <p>Instant access to your passwords with our optimized performance. No waiting, no delays.</p>
                        </div>
                        <div className="feature-card">
                          <div className="feature-icon-large">📱</div>
                          <h3>Cross-Platform</h3>
                          <p>Access your passwords from any device. Seamless sync across all your platforms.</p>
                        </div>
                      </div>
                    </div>

                    <div className="security-highlights">
                      <div className="security-content">
                        <h2>🔒 Military-Grade Security</h2>
                        <p>Your passwords are protected with the same encryption standards used by banks and governments worldwide.</p>
                        <div className="security-stats">
                          <div className="stat-item">
                            <span className="stat-number">256-bit</span>
                            <span className="stat-label">AES Encryption</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">99.9%</span>
                            <span className="stat-label">Uptime</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Monitoring</span>
                          </div>
                        </div>
                      </div>
                      <div className="security-illustration">
                        <img 
                          src="https://img.freepik.com/free-vector/security-concept-illustration_114360-1532.jpg" 
                          alt="Security"
                          className="security-image"
                        />
                      </div>
                    </div>
                  </div>
                  <Footer />
                </>
              ) : (
                <>
                  <div className="dashboard-container">
                    <div className="dashboard-header">
                      <div className="welcome-banner">
                        <div className="welcome-content">
                          <h1>Welcome back, {user.username}! 👋</h1>
                          <p>Your secure password management dashboard</p>
                        </div>
                        <div className="welcome-illustration">
                          <img 
                            src="https://img.freepik.com/free-vector/security-concept-illustration_114360-1532.jpg" 
                            alt="Security Illustration"
                            className="header-image"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-stats">
                      <div className="stat-card">
                        <div className="stat-icon">🔐</div>
                        <div className="stat-content">
                          <h3>Password Vault</h3>
                          <p>Secure storage for all your passwords</p>
                          <button onClick={() => window.location.href='/vault'} className="stat-button">
                            Access Vault
                          </button>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-icon">🔧</div>
                        <div className="stat-content">
                          <h3>Password Generator</h3>
                          <p>Create strong, unique passwords</p>
                          <button onClick={() => window.location.href='/generator'} className="stat-button">
                            Generate Now
                          </button>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-icon">🛡️</div>
                        <div className="stat-content">
                          <h3>Strength Analyzer</h3>
                          <p>Test your password security</p>
                          <button onClick={() => window.location.href='/strength'} className="stat-button">
                            Analyze Password
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-features">
                      <div className="feature-section">
                        <h2>🚀 Quick Actions</h2>
                        <div className="quick-actions">
                          <div className="action-item">
                            <span className="action-icon">➕</span>
                            <span>Add New Password</span>
                          </div>
                          <div className="action-item">
                            <span className="action-icon">🔍</span>
                            <span>Search Passwords</span>
                          </div>
                          <div className="action-item">
                            <span className="action-icon">📊</span>
                            <span>View Statistics</span>
                          </div>
                          <div className="action-item">
                            <span className="action-icon">⚙️</span>
                            <span>Settings</span>
                          </div>
                        </div>
                      </div>

                      <div className="feature-section">
                        <h2>📈 Security Insights</h2>
                        <div className="insights-grid">
                          <div className="insight-card">
                            <div className="insight-header">
                              <span className="insight-icon">🔒</span>
                              <h4>Security Score</h4>
                            </div>
                            <div className="insight-value">95%</div>
                            <p>Excellent password security</p>
                          </div>
                          
                          <div className="insight-card">
                            <div className="insight-header">
                              <span className="insight-icon">🔄</span>
                              <h4>Last Updated</h4>
                            </div>
                            <div className="insight-value">Today</div>
                            <p>Your passwords are up to date</p>
                          </div>
                          
                          <div className="insight-card">
                            <div className="insight-header">
                              <span className="insight-icon">🛡️</span>
                              <h4>Encryption</h4>
                            </div>
                            <div className="insight-value">AES-256</div>
                            <p>Military-grade encryption</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-footer">
                      <div className="footer-content">
                        <div className="footer-section">
                          <h3>🔐 Why Choose PassX?</h3>
                          <ul>
                            <li>End-to-end encryption</li>
                            <li>Zero-knowledge architecture</li>
                            <li>Cross-platform sync</li>
                            <li>24/7 security monitoring</li>
                          </ul>
                        </div>
                        
                        <div className="footer-section">
                          <h3>📱 Get Started</h3>
                          <p>Use the navigation icons above to access all features:</p>
                          <div className="feature-links">
                            <span>🔐 Vault</span>
                            <span>🔧 Generator</span>
                            <span>🛡️ Strength</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
