import React, { useState } from 'react';
import styles from './Login.module.css';
// Vite/ESM-compatible static asset import
import logoUrl from './school-logo.png';

export default function LoginPage() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Login failed');
      }
      if (typeof window !== 'undefined') {
        const { next = '/dashboard' } = Object.fromEntries(new URLSearchParams(window.location.search));
        window.location.href = next;
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = () => {
    if (typeof window !== 'undefined') window.location.href = '/api/auth/google';
  };

  const handleLoginWithFacebook = () => {
    if (typeof window !== 'undefined') window.location.href = '/api/auth/facebook';
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
          Don’t have an account? <a href="#" className={styles.link}>Contact admin</a>
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
