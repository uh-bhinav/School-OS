import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import LoginPage from './components/Login.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGuard>
      <App />
    </AuthGuard>
  </React.StrictMode>
);

function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      setIsAuthenticated(true);
      setIsChecking(false);
      return true;
    } else {
      setIsAuthenticated(false);
      setIsChecking(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    // Immediately update authentication state after login
    // The token should already be in localStorage at this point
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      setIsChecking(false);
    } else {
      // If token somehow not found, re-check
      console.warn('Login succeeded but token not found, re-checking...');
      setTimeout(() => {
        checkAuth();
      }, 50);
    }
  };

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return children;
}
