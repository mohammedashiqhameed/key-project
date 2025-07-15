import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Vault.css';

const API = "http://localhost:5000/api";

const Vault = () => {
  const [passwords, setPasswords] = useState([]);
  const [newPassword, setNewPassword] = useState({
    title: '',
    username: '',
    password: '',
    website: '',
    notes: '',
    category: 'Website'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const categories = ['All', 'Website', 'Email', 'Banking', 'WiFi', 'Other'];
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = { Authorization: token };

  useEffect(() => {
    if (!token) {
      setError('Please login to access the password vault');
      setIsAuthenticated(false);
      return;
    }
    
    setIsAuthenticated(true);
    loadPasswords();
  }, [token]);

  const loadPasswords = async () => {
    if (!token) {
      setError('Please login to access the password vault');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API}/passwords`, { headers });
      setPasswords(response.data);
      setError('');
    } catch (err) {
      console.error('Load passwords error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      } else {
        setError('Failed to load passwords');
      }
    } finally {
      setLoading(false);
    }
  };

  const addPassword = async () => {
    if (!newPassword.title || !newPassword.password) {
      setError('Title and password are required!');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Sending password data:', newPassword);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.post(`${API}/passwords`, newPassword, { headers });
      console.log('Server response:', response.data);
      
      setPasswords([response.data, ...passwords]);
      setNewPassword({
        title: '',
        username: '',
        password: '',
        website: '',
        notes: '',
        category: 'Website'
      });
      showToast('Password added successfully!');
    } catch (err) {
      console.error('Add password error:', err);
      
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Server error';
        setError(`Failed to add password: ${errorMessage}`);
        console.log('Server error details:', err.response.data);
      } else if (err.request) {
        // Network error
        setError('Network error: Cannot connect to server. Please check if the server is running.');
        console.log('Network error:', err.request);
      } else {
        // Other error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword.title || !newPassword.password) {
      setError('Title and password are required!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`${API}/passwords/${editingId}`, newPassword, { headers });
      setPasswords(passwords.map(p => p.id === editingId ? response.data : p));
      setEditingId(null);
      setNewPassword({
        title: '',
        username: '',
        password: '',
        website: '',
        notes: '',
        category: 'Website'
      });
      setError('');
      showToast('Password updated successfully!');
    } catch (err) {
      console.error('Update password error:', err);
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const deletePassword = async (id) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      try {
        setLoading(true);
        await axios.delete(`${API}/passwords/${id}`, { headers });
        setPasswords(passwords.filter(p => p.id !== id));
        setError('');
        showToast('Password deleted successfully!');
      } catch (err) {
        console.error('Delete password error:', err);
        setError(err.response?.data?.message || 'Failed to delete password');
      } finally {
        setLoading(false);
      }
    }
  };

  const editPassword = (password) => {
    setEditingId(password.id);
    setNewPassword(password);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.website.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || password.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      'Website': '🌐',
      'Email': '📧',
      'Banking': '🏦',
      'WiFi': '📶',
      'Other': '🔧'
    };
    return icons[category] || '🔧';
  };

  return (
    <div className="vault-container">
      {!isAuthenticated ? (
        <div className="auth-required">
          <div className="auth-message">
            <h2>🔐 Authentication Required</h2>
            <p>You need to login to access the password vault</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="vault-header">
            <div className="header-content">
              <h1>🔐 Password Vault</h1>
              <p>Secure storage for all your passwords</p>
            </div>
            <div className="header-illustration">
              <img 
                src="https://img.freepik.com/free-vector/password-security-concept-illustration_114360-5858.jpg" 
                alt="Password Vault"
                className="header-image"
              />
            </div>
          </div>

          <div className="vault-main">
            <div className="vault-controls">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-filter"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="password-form">
              <h3>{editingId ? 'Edit Password' : 'Add New Password'}</h3>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Title"
                  value={newPassword.title}
                  onChange={(e) => setNewPassword({...newPassword, title: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Username/Email"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({...newPassword, username: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Website URL"
                  value={newPassword.website}
                  onChange={(e) => setNewPassword({...newPassword, website: e.target.value})}
                />
                <select
                  value={newPassword.category}
                  onChange={(e) => setNewPassword({...newPassword, category: e.target.value})}
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={newPassword.notes}
                  onChange={(e) => setNewPassword({...newPassword, notes: e.target.value})}
                />
              </div>
              <div className="form-actions">
                {editingId ? (
                  <>
                    <button onClick={updatePassword} className="btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button onClick={() => {
                      setEditingId(null);
                      setNewPassword({
                        title: '',
                        username: '',
                        password: '',
                        website: '',
                        notes: '',
                        category: 'Website'
                      });
                      setError('');
                    }} className="btn-secondary" disabled={loading}>Cancel</button>
                  </>
                ) : (
                  <button onClick={addPassword} className="btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Password'}
                  </button>
                )}
              </div>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>

            <div className="passwords-list">
              <h3>Saved Passwords ({filteredPasswords.length})</h3>
              {loading && passwords.length === 0 ? (
                <div className="loading-state">
                  <p>Loading passwords...</p>
                </div>
              ) : filteredPasswords.length === 0 ? (
                <div className="empty-state">
                  <p>No passwords found. Add your first password above!</p>
                </div>
              ) : (
                <div className="passwords-grid">
                  {filteredPasswords.map(password => (
                    <div key={password.id} className="password-card">
                      <div className="password-header">
                        <span className="category-icon">{getCategoryIcon(password.category)}</span>
                        <span className="category-badge">{password.category}</span>
                      </div>
                      <h4>{password.title}</h4>
                      {password.username && (
                        <div className="password-field">
                          <span className="field-label">Username:</span>
                          <div className="field-value">
                            <span>{password.username}</span>
                            <button onClick={() => copyToClipboard(password.username)} className="copy-btn">
                              📋
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="password-field">
                        <span className="field-label">Password:</span>
                        <div className="field-value">
                          <span className={showPassword[password.id] ? 'password-visible' : 'password-hidden'}>
                            {showPassword[password.id] ? password.password : '••••••••'}
                          </span>
                          <button onClick={() => togglePasswordVisibility(password.id)} className="visibility-btn">
                            {showPassword[password.id] ? '👁️' : '👁️‍🗨️'}
                          </button>
                          <button onClick={() => copyToClipboard(password.password)} className="copy-btn">
                            📋
                          </button>
                        </div>
                      </div>
                      {password.website && (
                        <div className="password-field">
                          <span className="field-label">Website:</span>
                          <div className="field-value">
                            <span>{password.website}</span>
                            <button onClick={() => copyToClipboard(password.website)} className="copy-btn">
                              📋
                            </button>
                          </div>
                        </div>
                      )}
                      {password.notes && (
                        <div className="password-field">
                          <span className="field-label">Notes:</span>
                          <span className="notes">{password.notes}</span>
                        </div>
                      )}
                      <div className="password-actions">
                        <button onClick={() => editPassword(password)} className="btn-edit">
                          ✏️ Edit
                        </button>
                        <button onClick={() => deletePassword(password.id)} className="btn-delete">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Vault;
