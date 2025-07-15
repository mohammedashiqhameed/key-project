import React from 'react';
import './Footer.css';

const Footer = () => {
  const checkpoints = [
    {
      icon: "🔒",
      title: "Secure & Encrypted",
      description: "Your passwords are encrypted with military-grade security protocols"
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Access your passwords instantly with our optimized performance"
    },
    {
      icon: "🛡️",
      title: "Privacy First",
      description: "Your data never leaves your device - complete privacy guaranteed"
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="checkpoints-grid">
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className="checkpoint-card">
              <div className="checkpoint-icon">
                {checkpoint.icon}
              </div>
              <div className="checkpoint-content">
                <h4 className="checkpoint-title">{checkpoint.title}</h4>
                <p className="checkpoint-description">{checkpoint.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 PassX. All rights reserved. Built with ❤️ for security.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
