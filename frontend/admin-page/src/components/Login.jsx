import React, { useState } from 'react';
import styles from './Login.module.css';
import logoUrl from '../assets/school-logo.png';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const baseUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/v1';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        let errorMsg = 'Login failed';
        try {
          const errorData = await res.json();
          errorMsg = errorData.detail || errorData.message || errorMsg;
        } catch {
          // If response is not JSON, try to get text
          try {
            const text = await res.text();
            errorMsg = text || errorMsg;
          } catch {
            errorMsg = `Login failed with status ${res.status}`;
          }
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (data?.access_token && typeof window !== 'undefined') {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.access_token);
        
        // Verify token was stored before proceeding
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken !== data.access_token) {
          throw new Error('Failed to store authentication token');
        }
        
        // Call the onLoginSuccess callback if provided (for admin-page integrated login)
        if (onLoginSuccess) {
          // Call immediately - token is already stored and verified
          onLoginSuccess();
        } else {
          // If no callback, reload the page to trigger auth check
          window.location.reload();
        }
      } else {
        throw new Error('No access token received from server');
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = () => {
    setError('Social login not configured');
  };

  const handleLoginWithFacebook = () => {
    setError('Social login not configured');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.gradientBg}>
        <div className={`${styles.blob} ${styles.blobPink}`} />
        <div className={`${styles.blob} ${styles.blobOrange}`} />
        <div className={`${styles.blob} ${styles.blobBlue}`} />
      </div>

      <div className={styles.brandTop}>
        {logoUrl ? (
          <img src={logoUrl} alt="School OS logo" className={styles.logo} />
        ) : (
          <div className={styles.logoFallback} aria-label="Logo" />
        )}
        <span className={styles.brandText}>School OS</span>
      </div>

      <main className={styles.cardWrap}>

        <h1 className={styles.title}>Login</h1>

        <p className={styles.subtext}>
          Don't have an account? <a href="#" className={styles.link}>Contact admin</a>
        </p>

        <div className={styles.socialCol}>
          <button type="button" onClick={handleLoginWithGoogle} className={styles.socialBtn}>
            <span className={`${styles.socialIcon} ${styles.google}`} />
            Login with Google
          </button>
          <button type="button" onClick={handleLoginWithFacebook} className={styles.socialBtn}>
            <span className={`${styles.socialIcon} ${styles.facebook}`} />
            Login with Facebook
          </button>
        </div>

        <div className={styles.orRow}>
          <span className={styles.hr} />
          <span className={styles.orText}>Or</span>
          <span className={styles.hr} />
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <label className={styles.label} htmlFor="password">Password</label>
          <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={styles.eyeBtn}
              onClick={() => setShowPassword((s) => !s)}
            />
          </div>

          <div className={styles.rowBetween}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className={styles.link}>Forgot Password ?</a>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className={styles.terms}>
          By continuing you agree to: <a href="#" className={styles.link}>Terms & Conditions</a>
        </p>
      </main>
    </div>
  );
}

